'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Package, User, ChevronRight } from 'lucide-react';

type Order = {
  id: string;
  created_at: string;
  total: number;
  status: string;
  shipping_address: string | null;
  order_items: { name: string; qty: number; unit_price: number }[];
};

export default function CuentaPage() {
  const sb = useSupabase();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/signin');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    (async () => {
      const { data: o } = await sb.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false });
      setOrders(o as Order[] ?? []);
    })();
  }, [sb, user]);

  const handleUpdate = async () => {
    setProfileLoading(true);
    try {
      await (await import('@/components/providers/auth-provider')).useAuth().updateProfile({ name });
      setEditing(false);
    } catch { /* ignore */ }
    setProfileLoading(false);
  };

  if (authLoading || !user) return null;

  const statusBadge: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Mi cuenta</h1>
          <button onClick={signOut} className="flex items-center gap-2 text-sm text-slate-500 hover:text-terracotta">
            <LogOut className="h-4 w-4" /> Cerrar sesion
          </button>
        </div>

        {/* Profile section */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/10 text-2xl text-terracotta">
              <User className="h-7 w-7" />
            </div>
            <div>
              {editing ? (
                <div className="flex gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
                  <Button size="sm" onClick={handleUpdate} disabled={profileLoading}>
                    Guardar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{user.name ?? 'Sin nombre'}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              )}
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="ml-auto text-sm text-terracotta hover:underline">
                Editar
              </button>
            )}
          </div>
        </div>

        {/* Orders */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            <Package className="h-5 w-5" /> Ordenes
          </h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-slate-500">No tienes ordenes aun.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map(order => (
                <div key={order.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        Orden #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.created_at ?? '').toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[order.status] ?? 'bg-slate-100'}`}>
                        {order.status}
                      </span>
                      <span className="font-bold text-terracotta">
                        ${order.total.toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>
                  {order.order_items?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {order.order_items.map((item, i) => (
                        <p key={i} className="text-sm text-slate-500 dark:text-slate-400">
                          {item.name} x{item.qty} — ${(item.unit_price * item.qty).toLocaleString('es-CL')}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}