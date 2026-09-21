'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSupabase } from './supabase-provider';
import { useRouter } from 'next/navigation';

// Tipo del user_metadata que Supabase expone en el JWT
interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
}

interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  role: string;
}

/* eslint-disable no-unused-vars */
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name: string; avatar_url?: string }) => Promise<void>;
}
/* eslint-enable no-unused-vars */

const AuthContext = createContext<AuthContextType | null>(null);

// Extrae un AuthUser desde la sesión de Supabase de forma tipada
function userFromSession(session: { user: { id: string; email?: string | null; user_metadata?: unknown } }): AuthUser {
  const meta = (session.user.user_metadata ?? {}) as UserMetadata;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: meta.full_name ?? null,
    avatar_url: meta.avatar_url ?? null,
    role: 'customer',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const sb = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data, error: sessionError } = await sb.auth.getSession();
        if (sessionError) {
          throw new Error(sessionError.message || 'No se pudo obtener la sesión');
        }

        if (mounted) {
          setUser(data.session ? userFromSession(data.session) : null);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
          setError(err instanceof Error ? err.message : 'Error desconocido al inicializar sesión');
        }
      }
    }

    init();

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session ? userFromSession(session) : null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [sb]);

  const clearError = useCallback(() => setError(null), []);

  const signIn = useCallback(async (_email: string, _password: string) => {
    setError(null);
    const { error: signInError } = await sb.auth.signInWithPassword({ email: _email, password: _password });
    if (signInError) {
      // General error message to prevent account enumeration via error messages
      const message = 'Credenciales incorrectas. Por favor verifica tu email y contraseña.';
      setError(message);
      throw new Error(message);
    }
  }, [sb]);

  const signUp = useCallback(async (_email: string, _password: string, name: string) => {
    setError(null);
    const { error: signUpError } = await sb.auth.signUp({
      email: _email,
      password: _password,
      options: { data: { full_name: name, avatar_url: null } },
    });
    if (signUpError) {
      // Generic error message to prevent account enumeration
      // Supabase may return "User already registered" which reveals email existence
      const message = 'No se pudo crear la cuenta. Inténtalo de nuevo más tarde.';
      setError(message);
      throw new Error(message);
    }
  }, [sb]);

  const signOut = useCallback(async () => {
    setError(null);
    const { error: signOutError } = await sb.auth.signOut();
    if (signOutError) {
      const message = signOutError.message || 'Error al cerrar sesión';
      setError(message);
      throw new Error(message);
    }
    router.refresh();
    router.push('/');
  }, [sb, router]);

  const updateProfile = useCallback(async (data: { name: string; avatar_url?: string }) => {
    setError(null);
    const { error: updateError } = await sb.auth.updateUser({
      data: {
        full_name: data.name,
        avatar_url: data.avatar_url ?? null,
      },
    });
    if (updateError) {
      const message = updateError.message || 'Error al actualizar perfil';
      setError(message);
      throw new Error(message);
    }
    setUser(prev => prev ? { ...prev, name: data.name, avatar_url: data.avatar_url ?? null } : prev);
  }, [sb]);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, clearError, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}