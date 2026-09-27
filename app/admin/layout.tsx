import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { AdminNav } from '@/components/admin-nav';

export const metadata = {
  title: 'Panel de Administración — Tia Yami',
  description: 'Gestión de productos, pedidos y usuarios',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  // getUser() verifica la autenticidad del JWT con el servidor de Supabase Auth.
  // No uses getSession() aquí: los datos de la cookie pueden ser manipulados.
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return redirect('/auth/signin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return redirect('/');

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Panel de Administración
          </h1>
          <a href="/" className="text-sm font-semibold text-terracotta hover:underline">
            Volver al sitio
          </a>
        </header>
        <AdminNav />
        {children}
      </div>
    </div>
  );
}
