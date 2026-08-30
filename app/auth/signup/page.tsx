'use client';
import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signUp(email, password, name);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-terracotta/5 to-slate-50 dark:from-terracotta/10 dark:to-slate-900">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <UserPlus className="h-12 w-12 text-terracotta" />
          <h2 className="text-2xl font-bold text-terracotta dark:text-terracotta/400">
            Crear cuenta
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Unete para personalizar tus tazas
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electronico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contrasena</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Minimo 6 caracteres
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
        </form>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Ya tienes cuenta?{' '}
          <a href="/auth/signin" className="text-terracotta hover:underline">
            Inicia sesion
          </a>
        </div>
      </div>
    </div>
  );
}