'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSupabase } from './supabase-provider';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name: string; avatar_url?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const sb = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data, error } = await sb.auth.getSession();
        if (error) throw error;

        if (mounted) {
          if (data.session?.user) {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email ?? null,
              name: ((data.session.user.user_metadata as any)?.full_name) || null,
              avatar_url: ((data.session.user.user_metadata as any)?.avatar_url) || null,
              role: 'customer',
            });
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    }

    init();

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? null,
          name: ((session.user.user_metadata as any)?.full_name) || null,
          avatar_url: ((session.user.user_metadata as any)?.avatar_url) || null,
          role: 'customer',
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [sb]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message || 'Error al iniciar sesión');
  }, [sb]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, avatar_url: null } },
    });
    if (error) throw new Error(error.message || 'Error al crear la cuenta');
  }, [sb]);

  const signOut = useCallback(async () => {
    const { error } = await sb.auth.signOut();
    if (error) throw new Error(error.message || 'Error al cerrar sesión');
    router.refresh();
    router.push('/');
  }, [sb, router]);

  const updateProfile = useCallback(async (data: { name: string; avatar_url?: string }) => {
    const { error } = await sb.auth.updateUser({
      data: {
        full_name: data.name,
        avatar_url: data.avatar_url ?? null,
      },
    });
    if (error) throw new Error(error.message || 'Error al actualizar perfil');
    setUser(prev => prev ? { ...prev, name: data.name, avatar_url: data.avatar_url ?? null } : prev);
  }, [sb]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}