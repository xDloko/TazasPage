'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { useCart } from '@/components/providers/cart-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const sb = useSupabase();
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) router.push('/auth/signin');
  }, [user, router]);

  if (!user) return null;

  if (done) {
    return (
      <div className="min-h-screen bg-bone dark:bg-slate-950">
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Orden confirmada
          </h1>
          <p className="mt-2 text-slate-500">
            Gracias por tu compra! Tu pedido esta siendo procesado.
          </p>
          <Button size="lg" className="mt-6" onClick={() => router.push('/cuenta')}>
              Ver mis ordenes
            </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !done) {
    router.push('/carrito');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const orderData = {
        user_id: user.id,
        total,
        shipping_address: address,
        status: 'pending',
      };
      const { data: order, error: orderErr } = await sb
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();
      if (orderErr) throw orderErr;
      if (!order) throw new Error('No se pudo crear la orden');

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        qty: item.qty,
        unit_price: item.unit_price,
        name: item.name,
      }));
      const { error: itemsErr } = await sb.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      clear();
      setDone(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar la orden';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link href="/carrito" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-terracotta dark:text-slate-400">
          <ArrowLeft className="h-4 w-4" /> Volver al carrito
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">Checkout</h1>

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Datos de envio</h2>
            <div>
              <Label htmlFor="address">Direccion de envio</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, numero, ciudad, codigo postal..."
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Correo electronico</Label>
              <Input
                id="email"
                type="email"
                value={user.email ?? ''}
                disabled
                className="bg-slate-50 dark:bg-slate-700"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Resumen</h2>
              <div className="mt-4 space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      {item.name} x{item.qty}
                    </span>
                    <span className="font-semibold">${(item.unit_price * item.qty).toLocaleString('es-CL')}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-slate-100">
                  <span>Total</span>
                  <span className="text-terracotta">${total.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || !address.trim()}
            >
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando...</> : 'Confirmar orden'}
            </Button>
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}