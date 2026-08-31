'use client';
import { use, useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Product, ProductVariant, DesignLayer, Json } from '@/lib/types';
import { useCart } from '@/components/providers/cart-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, ChevronLeft, RotateCcw, Plus, ShoppingBag } from 'lucide-react';

export default function PersonalizarPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const sb = createClient();
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<(Product & { variants: ProductVariant[] }) | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [layers, setLayers] = useState<DesignLayer[]>([]);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'text' | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [newText, setNewText] = useState('');
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [textSize, setTextSize] = useState(28);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const price = product ? product.base_price + (selectedVariant?.price_adj ?? 0) : 0;

  useEffect(() => {
    async function fetch() {
      const { data } = await sb.from('products')
        .select('*, product_variants(*)')
        .eq('id', productId)
        .eq('active', true)
        .single();
      if (!data) return;
      const row = data as Product & { product_variants: ProductVariant[] };
      setProduct({ ...row, variants: row.product_variants });
      const firstActive = row.product_variants.find((v: ProductVariant) => v.active) ?? row.product_variants[0];
      setSelectedVariant(firstActive);
      setLoading(false);
    }
    fetch();
  }, [sb, productId]);

  const autoSave = useCallback(async (config: { layers: DesignLayer[]; variant_id: string | null }) => {
    if (!user || !product) return;
    setSaving(true);
    const { data: existing } = await sb
      .from('designs')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .eq('variant_id', config.variant_id ?? '')
      .maybeSingle();

    const designData = {
      user_id: user.id,
      product_id: product.id!,
      variant_id: config.variant_id,
      layers: config.layers as unknown as Json,
      engraving: false,
    };

    let result;
    if (existing) {
      result = await sb.from('designs').update(designData).eq('id', existing.id).select('id').single();
    } else {
      result = await sb.from('designs').insert(designData).select('id').single();
    }
    if (result.data) setSavedDesignId(result.data.id);
    setSaving(false);
  }, [sb, user, product]);

  // Auto-save with debounce
  useEffect(() => {
    if (layers.length === 0 || !selectedVariant) return;
    const t = setTimeout(() => autoSave({ layers, variant_id: selectedVariant.id }), 800);
    return () => clearTimeout(t);
  }, [layers, selectedVariant, autoSave]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !previewRef.current) return;
    const url = URL.createObjectURL(file);
    const rect = previewRef.current.getBoundingClientRect();
    setLayers(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'image',
      source: 'upload',
      url,
      x: rect.width / 2,
      y: rect.height / 2,
      scale: 0.4,
      rotation: 0,
    }]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddText = () => {
    if (!newText.trim() || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    setLayers(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'text',
      content: newText.trim(),
      fontSize: textSize,
      color: textColor,
      x: rect.width / 2,
      y: rect.height / 2,
      scale: 1,
      rotation: 0,
    }]);
    setNewText('');
    setActiveTool(null);
  };

  const updateLayer = useCallback((id: string, updates: Partial<DesignLayer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  // Preview drag handlers
  const handlePreviewMouseDown = (e: React.MouseEvent, layer: DesignLayer) => {
    if (!previewRef.current) return;
    e.preventDefault();
    setActiveLayerId(layer.id);
    const rect = previewRef.current.getBoundingClientRect();
    setDragging({
      id: layer.id,
      offsetX: e.clientX - rect.left - layer.x,
      offsetY: e.clientY - rect.top - layer.y,
    });
  };

  // Drag: only moves, no scroll prevention needed
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      updateLayer(dragging.id, {
        x: e.clientX - rect.left - dragging.offsetX,
        y: e.clientY - rect.top - dragging.offsetY,
      });
    };

    const handleMouseUp = () => setDragging(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, updateLayer]);

  // Zoom: separate effect, no passive false needed (preview has overflow-hidden, page scroll coexists)
  useEffect(() => {
    if (!activeLayerId || !previewRef.current) return;

    const el = previewRef.current;
    const handleWheel = (e: WheelEvent) => {
      const layer = layers.find(l => l.id === activeLayerId);
      if (!layer) return;
      const delta = -e.deltaY * 0.001;
      const newScale = Math.max(0.1, Math.min(3, layer.scale + delta));
      updateLayer(activeLayerId, { scale: newScale });
    };

    el.addEventListener('wheel', handleWheel);
    return () => el.removeEventListener('wheel', handleWheel);
  }, [activeLayerId, layers, updateLayer]);

  const handleBuy = () => {
    if (!product || !selectedVariant) return;
    addItem({
      product_id: product.id,
      variant_id: selectedVariant.id,
      qty: 1,
      unit_price: price,
      name: `${product.name} (personalizada)`,
      image_url: selectedVariant.image_url ?? product.cover_image,
    });
    router.push('/carrito');
  };

  const handleRotate = (layer: DesignLayer) => {
    if (!previewRef.current) return;
    updateLayer(layer.id!, { rotation: (layer.rotation || 0) + 30 });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-terracotta border-t-transparent" />
      </div>
    );
  }

  if (!product) { router.replace('/tienda'); return null; }

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Link href="/tienda" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-terracotta dark:text-slate-400">
          <ChevronLeft className="h-4 w-4" /> Volver a la tienda
        </Link>
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Personalizar: {product.name}
          </h1>
          <p className="text-sm text-slate-500">
            {saving ? 'Guardando...' : savedDesignId ? 'Diseno guardado ✓' : 'Los cambios se guardan automaticamente'}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left panel - Preview */}
          <div className="lg:col-span-8">
            <div
              ref={previewRef}
              className="relative aspect-square w-full overflow-hidden rounded-3xl"
              style={{ backgroundColor: selectedVariant?.color_hex ?? '#f5f1eb' }}
            >
              {/* Printable zone indicator */}
              <div className="absolute inset-0 border-2 border-dashed border-white/30 m-4 rounded-xl" />

              {/* Layers */}
              {layers.map(layer => (
                <div
                  key={layer.id}
                  onMouseDown={(e) => handlePreviewMouseDown(e, layer)}
                  onTouchStart={(e) => {
                    if (!previewRef.current || !('touches' in e)) return;
                    const touch = e.touches[0];
                    const rect = previewRef.current.getBoundingClientRect();
                    setActiveLayerId(layer.id);
                    setDragging({
                      id: layer.id,
                      offsetX: touch.clientX - rect.left - (layer.x ?? 0),
                      offsetY: touch.clientY - rect.top - (layer.y ?? 0),
                    });
                  }}
                  className={`absolute cursor-move select-none ${activeLayerId === layer.id ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''}`}
                  style={{
                    left: `${(layer.x ?? 0)}px`,
                    top: `${(layer.y ?? 0)}px`,
                    transform: `translate(-50%, -50%) scale(${layer.flipped ? -1 : 1} ${layer.scale ?? 1}) rotate(${layer.rotation ?? 0}deg)`,
                    zIndex: layers.indexOf(layer) + 10,
                  }}
                >
                  {layer.type === 'image' && layer.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={layer.url}
                      alt=""
                      className="max-h-32 max-w-32 rounded shadow-lg"
                      draggable={false}
                    />
                  )}
                  {layer.type === 'text' && (
                    <span
                      className="whitespace-nowrap px-2 py-1"
                      style={{
                        fontSize: `${layer.fontSize ?? 24}px`,
                        color: layer.color ?? '#000',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      {layer.content}
                    </span>
                  )}
                </div>
              ))}

              {layers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-white/60">
                  Agrega disenos arriba
                </div>
              )}
            </div>

            {/* Action bar for active layer */}
            {activeLayerId && (() => {
              const layer = layers.find(l => l.id === activeLayerId);
              if (!layer) return null;
              return (
                <div className="mt-3 flex flex-wrap gap-2 rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-800">
                  <span className="mr-2 self-center text-sm text-slate-600 dark:text-slate-400">
                    {layer.type === 'image' ? 'Imagen' : 'Texto'}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => handleRotate(layer)}>
                    Rotar 30
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setLayers(prev => prev.filter(l => l.id !== activeLayerId));
                    setActiveLayerId(null);
                  }}>
                    Eliminar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    updateLayer(activeLayerId, { flipped: !layer.flipped });
                  }}>
                    {layer.flipped ? 'Desvoltear' : 'Voltear'}
                  </Button>
                </div>
              );
            })()}
          </div>

          {/* Right panel - Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* Variant selector */}
            <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-800">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Acabado</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(product?.variants ?? []).map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-terracotta bg-terracotta/10'
                        : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: v.color_hex }} />
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mug color preview */}
            <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-800">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Color de la taza</h3>
              <div
                className="mt-3 h-16 rounded-xl"
                style={{ backgroundColor: selectedVariant?.color_hex ?? '#f5f1eb' }}
              />
            </div>

            {/* Design tools */}
            <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Diseno</h3>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir imagen
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              <div className="flex gap-2">
                <Button
                  variant={activeTool === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
                  className="flex-1"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Texto
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setLayers([]); setActiveLayerId(null); }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {activeTool === 'text' && (
                <div className="space-y-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-700/50">
                  <div>
                    <Label htmlFor="text-content">Texto</Label>
                    <Input
                      id="text-content"
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Ej: Tia Yami"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="text-color">Color</Label>
                      <input
                        id="text-color"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="mt-1 h-9 w-full rounded-lg border-2 border-slate-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="text-size">Tamano</Label>
                      <Input
                        id="text-size"
                        type="number"
                        min="8"
                        max={80}
                        value={textSize}
                        onChange={(e) => setTextSize(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <Button size="sm" onClick={handleAddText} disabled={!newText.trim()} className="w-full">
                    Agregar texto
                  </Button>
                </div>
              )}

              </div>

            {/* Price and actions */}
            <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-800">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-500">Precio total</span>
                <span className="text-3xl font-bold text-terracotta">${price.toLocaleString('es-CL')}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Base ${product.base_price.toLocaleString('es-CL')}
                {selectedVariant && selectedVariant.price_adj !== 0 && <> + ajuste ${selectedVariant.price_adj}</>}
              </p>
              <div className="mt-4 flex gap-3">
                <Button variant="outline" onClick={handleBuy} className="flex-1">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Comprar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}