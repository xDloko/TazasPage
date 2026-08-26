'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bone px-4 dark:bg-slate-950">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-extrabold text-terracotta">Oops</h1>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Algo salió mal
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Ocurrió un error inesperado. Por favor intenta nuevamente.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-slate-400">
            Ref: {error.digest}
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={reset}>Reintentar</Button>
        </div>
      </div>
    </div>
  );
}