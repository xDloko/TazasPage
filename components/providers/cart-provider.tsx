'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useSupabase } from '@/components/providers/supabase-provider';

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  qty: number;
  unit_price: number;
  name: string;
  image_url?: string | null;
  /** Nota del cliente para una solicitud de personalización. */
  note?: string | null;
}

/* eslint-disable no-unused-vars */
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  updateNote: (id: string, note: string) => void;
  clear: () => void;
  total: number;
  count: number;
  validateAllPrices: () => Promise<{ valid: boolean; errors: string[] }>;
  isValidating: boolean;
}
/* eslint-enable no-unused-vars */

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'tazas_cart';
const SYNC_DEBOUNCE_MS = 800;

/** Cache de precios validados por el servidor: clave → precio real */
type PriceCache = Record<string, number>;

/** Llave única para un producto+variante */
function priceKey(productId: string, variantId: string) {
  return `${productId}::${variantId}`;
}

interface ValidatedItem {
  product_id: string;
  variant_id: string;
  qty: number;
  unit_price: number;
  valid: boolean;
  error?: string;
}

/**
 * Llama a la Edge Function `validate-cart-prices` para obtener los precios reales
 * de todos los items en UNA SOLA llamada HTTP (batch optimizado).
 */
async function fetchValidatedPrices(
  items: { product_id: string; variant_id: string; qty: number }[]
): Promise<ValidatedItem[]> {
  if (items.length === 0) return [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/validate-cart-prices`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      }
    );
    if (!res.ok) {
      return items.map(item => ({
        ...item,
        unit_price: 0,
        valid: false,
        error: `Error del servidor al validar precios (HTTP ${res.status})`,
      }));
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      return items.map(item => ({
        ...item,
        unit_price: 0,
        valid: false,
        error: 'Respuesta inválida del servidor',
      }));
    }
    return data as ValidatedItem[];
  } catch (err) {
    console.error('[cart] Error contacting price validation Edge Function:', err);
    return items.map(item => ({
      ...item,
      unit_price: 0,
      valid: false,
      error: err instanceof Error ? err.message : String(err),
    }));
  }
}

/**
 * Llama a la Edge Function `get-product-price` para obtener el precio real
 * de un solo producto/variante. Solo se usa cuando no hay cache disponible.
 */
async function fetchSinglePrice(
  productId: string,
  variantId: string
): Promise<number | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-product-price`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, variant_id: variantId }),
      }
    );
    if (!res.ok) {
      console.error(`[cart] Edge Function devolvió ${res.status} para ${productId}`);
      return null;
    }
    const data = await res.json();
    return typeof data.price === 'number' ? data.price : null;
  } catch (err) {
    console.error('[cart] Error contacting price validation Edge Function:', err);
    return null;
  }
}

/**
 * Escribe el carrito en localStorage. Siempre disponible para el usuario.
 */
function persistToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore storage errors */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const sb = useSupabase();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  /** Cache de precios ya validados por el servidor */
  const priceCache = useRef<PriceCache>({});
  /** Evita sincronizar al servidor durante la carga inicial desde Supabase */
  const loadingFromServerRef = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar carrito: localStorage para visitantes, Supabase para usuarios registrados.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Mientras se resuelve la sesión, quedarse en localStorage evita un flash de carrito vacío.
      if (authLoading) return;

      loadingFromServerRef.current = true;
      try {
        if (user) {
          // getUser() verifica la autenticidad y devuelve access_token.
          // No uses getSession() aquí: datos del almacenamiento pueden ser manipulados.
          const { data: { user: verifiedUser } } = await sb.auth.getUser();
          const accessToken = verifiedUser?.access_token;
          const { data, error } = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-cart`,
            {
              headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
              },
            }
          ).then(async (res) => {
            if (!res.ok) return { data: null, error: new Error(`HTTP ${res.status}`) };
            return res.json().then((json) => ({ data: json as { items: CartItem[] } | null, error: null as unknown as Error })).catch(() => ({ data: null, error: new Error('Respuesta inválida') }));
          }).catch((err) => ({ data: null, error: err }));

          if (!cancelled && !error && data?.items && Array.isArray(data.items)) {
            setItems(data.items);
            setHydrated(true);
            return;
          }
        } else {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (!cancelled && raw) {
            try {
              setItems(JSON.parse(raw));
              setHydrated(true);
              return;
            } catch {
              /* ignore malformed data */
            }
          }
        }
      } catch (err) {
        console.error('[cart] Error loading cart:', err);
      } finally {
        if (!cancelled) {
          loadingFromServerRef.current = false;
          setHydrated(true);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user, authLoading, sb]);

  // Persistencia: localStorage siempre; Supabase cuando está autenticado.
  useEffect(() => {
    if (!hydrated) return;
    persistToStorage(items);

    if (user && !loadingFromServerRef.current) {
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(async () => {
        try {
          // getUser() verifica la autenticidad y devuelve access_token.
          const { data: { user: verifiedUser } } = await sb.auth.getUser();
          const accessToken = verifiedUser?.access_token;
          await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-cart`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify({ items }),
            }
          );
        } catch (err) {
          console.error('[cart] Error syncing cart to server:', err);
        }
      }, SYNC_DEBOUNCE_MS);
      return () => {
        if (syncTimer.current) clearTimeout(syncTimer.current);
      };
    }
  }, [items, hydrated, user]);

  /**
   * Obtiene el precio validado de un producto/variante.
   * Usa cache en memoria para evitar llamadas repetidas.
   * Si no está en cache, hace una llamada individual (uso excepcional).
   */
  const getValidatedPrice = useCallback(
    async (productId: string, variantId: string): Promise<number | null> => {
      const key = priceKey(productId, variantId);
      if (key in priceCache.current) return priceCache.current[key];

      const price = await fetchSinglePrice(productId, variantId);
      if (price !== null) priceCache.current[key] = price;
      return price;
    },
    []
  );

  /**
   * Agrega un item al carrito.
   * 1. Valida el precio con el servidor (vía Edge Function).
   * 2. Si el precio es inválido o no se puede validar, rechaza con error.
   * 3. Si el item ya existe (mismo producto+variante+nota), incrementa la cantidad.
   * 4. Si la nota difiere, se agrega como un ítem separado para respetar la personalización.
   *
   * El precio manipulado por DevTools en localStorage es IGNORADO —
   * el precio real viene del servidor.
   */
  const addItem = useCallback(
    async (rawItem: Omit<CartItem, 'id'>): Promise<void> => {
      const realPrice = await getValidatedPrice(rawItem.product_id, rawItem.variant_id);
      if (realPrice === null) {
        throw new Error(
          `No se pudo validar el precio del producto. Verifica tu conexión o que el producto esté disponible.`
        );
      }

      const itemWithRealPrice: CartItem = {
        ...rawItem,
        unit_price: realPrice,
        id: '',
      };

      setItems(current => {
        const existing = current.find(
          i =>
            i.product_id === itemWithRealPrice.product_id &&
            i.variant_id === itemWithRealPrice.variant_id &&
            (i.note ?? null) === (itemWithRealPrice.note ?? null)
        );
        if (existing) {
          return current.map(i =>
            i.id === existing.id
              ? { ...i, qty: i.qty + itemWithRealPrice.qty, unit_price: realPrice }
              : i
          );
        }
        return [...current, { ...itemWithRealPrice, id: crypto.randomUUID() }];
      });
    },
    [getValidatedPrice]
  );

  const removeItem = useCallback((id: string) => {
    setItems(current => current.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems(current => current.filter(i => i.id !== id));
    } else {
      setItems(current => current.map(i => (i.id === id ? { ...i, qty } : i)));
    }
  }, []);

  /** Actualiza la nota de personalización de un ítem del carrito. */
  const updateNote = useCallback((id: string, note: string) => {
    setItems(current => current.map(i => (i.id === id ? { ...i, note: note || null } : i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.unit_price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  /**
   * Revalida todos los precios del carrito contra el servidor en UNA SOLA llamada batch.
   * Llamar antes de checkout para confirmar que los precios no cambiaron.
   */
  const validateAllPrices = useCallback(async (): Promise<{ valid: boolean; errors: string[] }> => {
    setIsValidating(true);
    const errors: string[] = [];

    try {
      if (items.length === 0) return { valid: true, errors: [] };

      // Llamada batch optimizada: 1 sola HTTP request
      const validatedItems = await fetchValidatedPrices(items);

      for (const validated of validatedItems) {
        const matchingItem = items.find(
          i => i.product_id === validated.product_id && i.variant_id === validated.variant_id
        );
        if (!matchingItem) continue;

        if (!validated.valid) {
          errors.push(
            `${matchingItem.name}: ${validated.error ?? 'precio no disponible'}`
          );
        } else if (validated.unit_price !== matchingItem.unit_price) {
          // El precio del servidor cambió — actualiza en el state
          setItems(current =>
            current.map(i =>
              i.id === matchingItem.id ? { ...i, unit_price: validated.unit_price } : i
            )
          );
          priceCache.current[priceKey(validated.product_id, validated.variant_id)] =
            validated.unit_price;
          errors.push(
            `${matchingItem.name}: precio actualizado de $${matchingItem.unit_price.toLocaleString('es-CL')} a $${validated.unit_price.toLocaleString('es-CL')}`
          );
        } else {
          // Precio válido y coincide — refrescar cache
          priceCache.current[priceKey(validated.product_id, validated.variant_id)] =
            validated.unit_price;
        }
      }

      return { valid: errors.length === 0, errors };
    } finally {
      setIsValidating(false);
    }
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        updateNote,
        clear,
        total,
        count,
        validateAllPrices,
        isValidating,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
