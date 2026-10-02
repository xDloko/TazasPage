"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/ui/use-toast";
import { Product, ProductVariant, ProductCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Check, Coffee, Shirt, Package } from "lucide-react";
import { CustomizeModal } from "@/components/productos/CustomizeModal";

const CATEGORY_ICONS: Record<ProductCategory, React.ComponentType<{ className?: string }>> = {
  mug: Coffee,
  clothing: Shirt,
  accessory: Package,
};

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  mug: "Tazas",
  clothing: "Ropa",
  accessory: "Accesorios",
};

export default function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const sb = useSupabase();
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [product, setProduct] = useState<(Product & { variants: ProductVariant[] }) | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      if (cancelled) return;
      try {
        const { data } = await sb
          .from("products")
          .select("*, product_variants(*)")
          .eq("slug", slug)
          .eq("active", true)
          .single();
        if (cancelled || !data) {
          if (!data) notFound();
          return;
        }
        const row = data as Product & { product_variants: ProductVariant[] };
        const p = { ...row, variants: row.product_variants };
        setProduct(p);
        const firstActive =
          row.product_variants.find((v) => v.active) ?? row.product_variants[0] ?? null;
        setSelectedVariant(firstActive);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("[producto] Error cargando producto:", err);
          setLoading(false);
          toast({
            variant: "destructive",
            title: "Error al cargar el producto",
            description: err instanceof Error ? err.message : "No se pudo cargar el producto.",
          });
        }
      }
    }
    fetch();
    return () => {
      cancelled = true;
    };
  }, [sb, slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 w-32 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="aspect-square rounded-3xl bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-4">
              <div className="h-10 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-32 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return notFound();

  const price = product.base_price + (selectedVariant?.price_adj ?? 0);
  const CategoryIcon = CATEGORY_ICONS[product.category];
  const categoryLabel = CATEGORY_LABELS[product.category];

  const handleAdd = async () => {
    if (!selectedVariant) return;
    try {
      await addItem({
        product_id: product.id,
        variant_id: selectedVariant.id,
        qty: 1,
        unit_price: price, // precio visual; se sobreescribe con el real del servidor
        name: product.name,
        image_url: selectedVariant.image_url ?? product.cover_image,
        note: null, // sin personalización
        category: product.category,
        variant_attributes: selectedVariant.attributes,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
      toast({
        title: "Agregado al carrito",
        description: `${product.name} ahora está en tu carrito.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error al agregar al carrito",
        description: err instanceof Error ? err.message : "No se pudo validar el precio.",
      });
      console.error("[producto] No se pudo agregar al carrito:", err);
    }
  };

  const handleCustomizeAndAdd = () => {
    setIsCustomizing(true);
  };

  return (
    <>
      <div className="min-h-screen bg-bone dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-terracotta dark:text-slate-400"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a la tienda
          </Link>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="aspect-square overflow-hidden rounded-3xl bg-slate-100">
              {(selectedVariant?.image_url ?? product.cover_image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedVariant?.image_url ?? product.cover_image ?? ""}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">
                  <CategoryIcon className="h-12 w-12 text-terracotta" />
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <CategoryIcon className="h-3 w-3" />
                <span>{categoryLabel}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-terracotta">
                ${price.toLocaleString("es-CL")}
              </p>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                {product.description ?? "Producto personalizable de alta calidad."}
              </p>

              {/* Variant selector - dynamic based on category */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {product.category === "mug" ? "Acabado" : "Talla y Color"}
                </h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.variants
                    .filter((v) => v.active)
                    .map((variant) => {
                      // Build display text based on variant attributes
                      const attrs = variant.attributes || {};
                      const size = attrs.size;
                      const colorName = attrs.color || variant.name;
                      // colorHex can be string | number from attributes or string | null from DB; ensure it's a valid CSS color string
                      const colorHex = (attrs.color_hex ??
                        variant.color_hex ??
                        "#000000") as string;

                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-2 text-sm font-semibold transition-all ${
                            selectedVariant?.id === variant.id
                              ? "border-terracotta bg-terracotta/10"
                              : "border-slate-200 hover:border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {size && (
                              <>
                                <span className="text-xs font-medium text-slate-700">{size}</span>
                                <span className="ml-1">•</span>
                              </>
                            )}
                            <span
                              className="h-4 w-4 rounded-full border border-slate-300"
                              style={{ backgroundColor: colorHex }}
                            />
                            <span className="hidden ml-2">{colorName}</span>
                          </div>
                          {variant.price_adj !== 0 && (
                            <span className="text-xs text-slate-500 ml-2">
                              {variant.price_adj > 0 ? "+" : ""}${variant.price_adj}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="mt-auto flex gap-4 pt-8">
                <Button size="lg" variant="outline" onClick={handleAdd} className="flex-1">
                  {added ? (
                    <>
                      <Check className="mr-2 h-5 w-5" /> Agregado
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-5 w-5" /> Agregar al carrito
                    </>
                  )}
                </Button>
                <Button size="lg" className="flex-1" onClick={handleCustomizeAndAdd}>
                  Personaliza
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isCustomizing && (
        <CustomizeModal
          open={isCustomizing}
          onClose={() => setIsCustomizing(false)}
          product={{ id: product.id, name: product.name, base_price: product.base_price }}
          variant={selectedVariant}
          category={product.category}
        />
      )}
    </>
  );
}
