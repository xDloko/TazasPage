'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: 'Pendiente', icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  processing: { label: 'Procesando', icon: Package, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  shipped: { label: 'Enviado', icon: Truck, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  delivered: { label: 'Entregado', icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

export default function AdminOrdersPage() {
  const sb = useSupabase();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Array<{
    id: string;
    created_at: string;
    total: number;
    status: string;
    shipping_address: string | null;
    user_id: string;
    order_items: Array<{ name: string; qty: number; unit_price: number }>;
  }>>([]);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await sb.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      if (!error) setOrders(data as any ?? []);
    }
    fetchOrders();
  }, [sb]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await sb.from('orders').update({ status: newStatus }).eq('id', orderId);
      toast({ title: 'Éxito', description: `Estado actualizado a ${newStatus}` });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido' });
    }
  };

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Gestión de Pedidos
        </h1>

        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
            Todos los pedidos ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <p className="text-slate-500">No hay pedidos registrados.</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const config = statusConfig[order.status] ?? statusConfig.pending;
                const Icon = config.icon;
                return (
                  <div key={order.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          Pedido #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(order.created_at ?? '').toLocaleDateString('es-CL')}
                        </p>
                        <p className="text-sm text-slate-500">{order.user_id}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.color}`}>
                          <Icon className="mr-1 h-3 w-3 inline" />
                          {config.label}
                        </span>
                        <span className="font-bold text-terracotta">
                          ${order.total.toLocaleString('es-CL')}
                        </span>
                      </div>
                    </div>

                    {/* Status change */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Cambiar estado:</span>
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(order.id, status)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                            order.status === status
                              ? 'bg-terracotta text-white'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {statusConfig[status]?.label ?? status}
                        </button>
                      ))}
                    </div>

                    {/* Order items */}
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
