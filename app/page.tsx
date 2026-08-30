'use client';
import Link from 'next/link';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Product, ProductVariant } from '@/lib/types';
import { ArrowRight, Sparkles, Truck, Palette, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

/* Decorator-only classes applied to <Link> when it replaces a Button */
const buttonLikeClasses: Record<string, string> = {
  'lg-default':
    'inline-flex items-center justify-center rounded-2xl px-8 text-lg font-semibold bg-terracotta text-white shadow-sm active:scale-[0.97]',
  'lg-outline':
    'inline-flex items-center justify-center rounded-2xl px-8 text-lg font-semibold border-2 border-terracotta text-terracotta hover:bg-terracotta/10 active:scale-[0.97]',
  'lg-secondary':
    'inline-flex items-center justify-center rounded-2xl px-8 text-lg font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 active:scale-[0.97]',
  'md-outline':
    'inline-flex items-center justify-center rounded-2xl px-5 text-base font-semibold border-2 border-terracotta text-terracotta hover:bg-terracotta/10 active:scale-[0.97]',
  'md-default':
    'inline-flex items-center justify-center rounded-2xl px-5 text-base font-semibold bg-terracotta text-white shadow-sm active:scale-[0.97]',
  'sm-outline':
    'inline-flex items-center justify-center rounded-2xl px-3 text-sm font-semibold border-2 border-terracotta text-terracotta hover:bg-terracotta/10 active:scale-[0.97]',
};

export default function Home() {
  const sb = useSupabase();
  const [featured, setFeatured] = useState<(Product & { variants: ProductVariant[] })[]>([]);

  useEffect(() => {
    sb.from('products').select('*, product_variants(*)').eq('active', true).limit(3).then(({ data }) => {
      setFeatured((data as any) ?? []);
    });
  }, [sb]);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-bone px-4 dark:bg-slate-900">
        <div className="absolute inset-0 opacity-80 dark:opacity-30">
          <div className="absolute -left-40 top-1/2 h-[60rem] w-[60rem] -translate-y-1/2 rounded-full bg-gradient-to-br from-terracotta/20 to-transparent blur-3xl" />
          <div className="absolute -right-40 top-20 h-[40rem] w-[40rem] rounded-full bg-gradient-to-tl from-amber-200/40 to-transparent blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="py-20 lg:py-32">
              <span className="inline-block rounded-full bg-terracotta/10 px-4 py-1.5 text-sm font-semibold text-terracotta">
                Ceramica artesanal
              </span>
              <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 lg:text-6xl">
                Tu taza,
                <br />
                <span className="text-terracotta">tu estilo</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-slate-600 dark:text-slate-400">
                Disena y personaliza tu taza de ceramica unica. Elige color, agrega imagenes o texto, y crea algo que sea verdaderamente tuyo.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/tienda" className={buttonLikeClasses['lg-default']}>
                  Explorar tazas <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/personalizar/demo" className={buttonLikeClasses['lg-outline']}>
                  <Sparkles className="mr-2 h-5 w-5" /> Probar customizador
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative mx-auto aspect-square w-full max-w-lg">
                <div className="absolute inset-0 rotate-6 rounded-[3rem] bg-gradient-to-br from-terracotta/30 to-amber-200/40" />
                <div className="absolute inset-0 -rotate-3 rounded-[3rem] bg-gradient-to-tl from-slate-200/60 to-transparent" />
                <div className="relative flex h-full items-center justify-center rounded-[2.5rem] bg-white shadow-xl dark:bg-slate-800">
                  <span className="text-8xl">☕</span>
                </div>
                <div className="absolute -right-4 top-1/4 rounded-2xl bg-white p-3 shadow-lg dark:bg-slate-700">
                  <Palette className="h-8 w-8 text-terracotta" />
                </div>
                <div className="absolute -left-4 bottom-1/4 rounded-2xl bg-white p-3 shadow-lg dark:bg-slate-700">
                  <Heart className="h-8 w-8 text-terracotta" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-white px-4 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Tazas destacadas
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Nuestra seleccion favorita para personalizar
          </p>
          {featured.length === 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-3xl bg-slate-100 p-4 dark:bg-slate-800">
                  <div className="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-4 h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map(p => (
                <Link
                  key={p.id}
                  href={`/productos/${p.slug}`}
                  className="group rounded-3xl bg-slate-50 p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-800"
                >
                  <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl">☕</div>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{p.name}</h3>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{p.description}</p>
                  <p className="mt-3 text-lg font-bold text-terracotta">
                    ${p.base_price.toLocaleString('es-CL')}
                  </p>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link href="/tienda" className={buttonLikeClasses['lg-outline']}>
              Ver todo el catalogo
            </Link>
          </div>
        </div>
      </section>

      {/* Brand strip - dark feature band */}
      <section className="bg-slate-900 px-4 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { icon: Palette, title: 'Personaliza', desc: 'Elige color, sube tu imagen o usa IA para generar un diseno unico.' },
              { icon: Sparkles, title: 'Calidad', desc: 'Ceramica de alta calidad con acabados duraderos y colores vibrantes.' },
              { icon: Truck, title: 'Envio rapido', desc: 'Recibe tu taza personalizada en 3-5 dias habiles a todo Chile.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-3xl bg-slate-800/50 p-8 text-center backdrop-blur">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/20">
                  <Icon className="h-6 w-6 text-terracotta" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-100">{title}</h3>
                <p className="mt-2 text-sm text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Listo para crear tu taza?
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Empieza ahora y personaliza cada detalle. Desde el color hasta el diseno, tu taza sera unica.
          </p>
          <Link href="/tienda" className={`${buttonLikeClasses['lg-default']} mt-8`}>
              Empezar ahora <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
        </div>
      </section>
    </main>
  );
}