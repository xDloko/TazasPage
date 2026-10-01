"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSupabase } from "./supabase-provider";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

// Helper to get the Supabase client type
type SupabaseClient = ReturnType<typeof createBrowserClient>;

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

// Construye un AuthUser a partir de un usuario verificado por getUser().
// getUser() contacta al servidor de Supabase Auth → autenticidad garantizada.
async function userFromVerifiedUser(
  user: { id: string; email?: string | null; user_metadata?: unknown },
  sb: SupabaseClient
): Promise<AuthUser> {
  const meta = (user.user_metadata ?? {}) as UserMetadata;

  // Fetch role from profiles table
  let role = "customer"; // default role
  const { data: profile, error } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!error && profile?.role) {
    role = profile.role;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    name: meta.full_name ?? null,
    avatar_url: meta.avatar_url ?? null,
    role,
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
        // getUser() verifica la autenticidad del JWT contactando al servidor de Supabase Auth.
        // No uses getSession() aquí: los datos de la cookie pueden ser manipulados.
        const {
          data: { user },
          error: userError,
        } = await sb.auth.getUser();
        if (userError) {
          throw new Error(userError.message || "No se pudo verificar la sesión");
        }

        if (mounted) {
          setUser(user ? await userFromVerifiedUser(user, sb) : null);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
          setError(err instanceof Error ? err.message : "Error desconocido al inicializar sesión");
        }
      }
    }

    init();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(async (_event, _session) => {
      // No confiar en _session del evento: viene del almacenamiento local.
      // Verificar con getUser() contacta al servidor de Supabase Auth.
      const {
        data: { user },
      } = await sb.auth.getUser();
      setUser(user ? await userFromVerifiedUser(user, sb) : null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [sb]);

  const clearError = useCallback(() => setError(null), []);

  const signIn = useCallback(
    async (_email: string, _password: string) => {
      setError(null);
      const { error: signInError } = await sb.auth.signInWithPassword({
        email: _email,
        password: _password,
      });
      if (signInError) {
        // General error message to prevent account enumeration via error messages
        const message = "Credenciales incorrectas. Por favor verifica tu email y contraseña.";
        setError(message);
        throw new Error(message);
      }
      // Refresh the router so server-side auth state (cookies) is synced
      // before the caller navigates away. Without this the redirect lands on
      // a page that still sees the user as unauthenticated.
      await router.refresh();
    },
    [sb, router]
  );

  const signUp = useCallback(
    async (_email: string, _password: string, name: string) => {
      setError(null);
      const { error: signUpError } = await sb.auth.signUp({
        email: _email,
        password: _password,
        options: { data: { full_name: name, avatar_url: null } },
      });
      if (signUpError) {
        // Generic error message to prevent account enumeration
        // Supabase may return "User already registered" which reveals email existence
        const message = "No se pudo crear la cuenta. Inténtalo de nuevo más tarde.";
        setError(message);
        throw new Error(message);
      }
    },
    [sb]
  );

  const signOut = useCallback(async () => {
    setError(null);
    const { error: signOutError } = await sb.auth.signOut();
    if (signOutError) {
      const message = signOutError.message || "Error al cerrar sesión";
      setError(message);
      throw new Error(message);
    }
    await router.refresh();
    router.push("/");
  }, [sb, router]);

  const updateProfile = useCallback(
    async (data: { name: string; avatar_url?: string }) => {
      setError(null);
      const { error: updateError } = await sb.auth.updateUser({
        data: {
          full_name: data.name,
          avatar_url: data.avatar_url ?? null,
        },
      });
      if (updateError) {
        const message = updateError.message || "Error al actualizar perfil";
        setError(message);
        throw new Error(message);
      }
      setUser((prev) =>
        prev ? { ...prev, name: data.name, avatar_url: data.avatar_url ?? null } : prev
      );
    },
    [sb]
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, clearError, signIn, signUp, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
