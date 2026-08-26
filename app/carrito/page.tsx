'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/providers/cart-provider';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CarritoPage() {
  const { items, removeItem, updateQty, total, clear } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bone dark:bg-slate-950">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-slate-300" />
          <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Tu carrito esta vacio
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Explora nuestra tienda y encuentra la taza perfecta
          </p>
          <Link href="/tienda">
            <Button size="lg" className="mt-6">
              Ir a la tienda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Carrito</h1>
          <button
            onClick={clear}
            className="text-sm text-slate-400 hover:text-terracotta"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map(item => (
              <div
                key={item.id}
                className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-800"
              >
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">☕</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</h3>
                    <p className="text-sm text-slate-500">Precio unitario: ${item.unit_price.toLocaleString('es-CL')}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="font-bold text-terracotta">
                      ${(item.unit_price * item.qty).toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="flex-shrink-0 self-start text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Resumen</h2>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span>${total.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Envio</span>
                  <span className="text-green-600">Calculado en checkout</span>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-slate-100">
                  <span>Total</span>
                  <span className="text-terracotta">${total.toLocaleString('es-CL')}</span>
                </div>
              </div>
              <Button size="lg" className="mt-6 w-full" onClick={() => router.push('/checkout')}>
                Ir a checkout
              </Button>
              <Link href="/tienda">
                <Button variant="ghost" className="mt-2 w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Seguir comprando
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}