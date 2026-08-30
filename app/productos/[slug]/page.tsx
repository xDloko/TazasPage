'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useCart } from '@/components/providers/cart-provider';
import { Product, ProductVariant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag, Check } from 'lucide-react';

export default function ProductoPage({ params }: { params: { slug: string } }) {
  const sb = useSupabase();
  const { addItem } = useCart();
  const router = useRouter();
  const [product, setProduct] = useState<(Product & { variants: ProductVariant[] }) | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetch() {
      const { data } = await sb
        .from('products')
        .select('*, product_variants(*)')
        .eq('slug', params.slug)
        .eq('active', true)
        .single();
      if (!data) { notFound(); return; }
      const row = data as Product & { product_variants: ProductVariant[] };
      const p = { ...row, variants: row.product_variants };
      setProduct(p);
      const firstActive = row.product_variants.find(v => v.active) ?? row.product_variants[0] ?? null;
      setSelectedVariant(firstActive);
      setLoading(false);
    }
    fetch();
  }, [sb, params.slug]);

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

  const handleAdd = () => {
    if (!selectedVariant) return;
    addItem({
      product_id: product.id,
      variant_id: selectedVariant.id,
      qty: 1,
      unit_price: price,
      name: product.name,
      image_url: selectedVariant.image_url ?? product.cover_image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/tienda" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-terracotta dark:text-slate-400">
          <ArrowLeft className="h-4 w-4" /> Volver a la tienda
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-3xl bg-slate-100">
            {selectedVariant?.image_url ?? product.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedVariant?.image_url ?? product.cover_image ?? ''}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">☕</div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-bold text-terracotta">
              ${price.toLocaleString('es-CL')}
            </p>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {product.description ?? 'Taza de ceramica personalizable de alta calidad.'}
            </p>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Acabado
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.variants.filter(v => v.active).map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-2 text-sm font-semibold transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-terracotta bg-terracotta/10'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-slate-300"
                      style={{ backgroundColor: v.color_hex }}
                    />
                    {v.name}
                    {v.price_adj !== 0 && (
                      <span className="text-xs text-slate-500">
                        {v.price_adj > 0 ? '+' : ''}${v.price_adj}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto flex gap-4 pt-8">
              <Button size="lg" variant="outline" onClick={handleAdd} className="flex-1">
                {added ? <><Check className="mr-2 h-5 w-5" /> Agregado</> : <><ShoppingBag className="mr-2 h-5 w-5" /> Agregar al carrito</>}
              </Button>
              <Button size="lg" className="flex-1" onClick={() => router.push(`/personalizar/${product.id}`)}>
                Personalizar ahora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}