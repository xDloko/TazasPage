import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Package, ShoppingCart, Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

async function getStats() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { count: productCount } = await supabase.from('products').select('id', { count: 'exact' });
  const { count: orderCount } = await supabase.from('orders').select('id', { count: 'exact' });
  const { count: userCount } = await supabase.from('profiles').select('id', { count: 'exact' });

  return { productCount: productCount ?? 0, orderCount: orderCount ?? 0, userCount: userCount ?? 0 };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Panel de Administración
        </h1>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Productos</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.productCount}</p>
              </div>
              <div className="rounded-xl bg-terracotta/10 p-3">
                <Package className="h-6 w-6 text-terracotta" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pedidos</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.orderCount}</p>
              </div>
              <div className="rounded-xl bg-blue-100 p-3">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Usuarios</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.userCount}</p>
              </div>
              <div className="rounded-xl bg-green-100 p-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Acciones rápidas</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/products">
              <Button>
                <Package className="mr-2 h-4 w-4" />
                Gestionar Productos
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="secondary">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ver Pedidos
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="secondary">
                <Users className="mr-2 h-4 w-4" />
                Gestionar Usuarios
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}