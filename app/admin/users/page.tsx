'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { User, Shield, Mail, Lock } from 'lucide-react';

const roleConfig: Record<string, { label: string; color: string }> = {
  admin: { label: 'Administrador', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  customer: { label: 'Cliente', color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' },
};

export default function AdminUsersPage() {
  const sb = useSupabase();
  const { toast } = useToast();
  const [users, setUsers] = useState<Array<{
    id: string;
    email: string | null;
    name: string | null;
    avatar_url: string | null;
    role: string;
    created_at: string | null;
  }>>([]);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error) setUsers(data as any ?? []);
    }
    fetchUsers();
  }, [sb]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await sb.from('profiles').update({ role: newRole }).eq('id', userId);
      toast({ title: 'Éxito', description: `Rol actualizado a ${newRole}` });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido' });
    }
  };

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Gestión de Usuarios
        </h1>

        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
            Usuarios registrados ({users.length})
          </h2>
          {users.length === 0 ? (
            <p className="text-slate-500">No hay usuarios registrados.</p>
          ) : (
            <div className="space-y-4">
              {users.map(user => {
                const config = roleConfig[user.role] ?? roleConfig.customer;
                return (
                  <div key={user.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {user.name ?? 'Sin nombre'}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                          <p className="text-xs text-slate-400">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('es-CL') : 'Fecha desconocida'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.color}`}>
                          <Shield className="mr-1 h-3 w-3 inline" />
                          {config.label}
                        </span>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                        >
                          {['customer', 'admin'].map(r => (
                            <option key={r} value={r}>{roleConfig[r].label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
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