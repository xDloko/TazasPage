'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    setClient(createClient());
  }, []);

  if (!client) return null;

  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useSupabase must be used inside SupabaseProvider');
  return ctx;
};