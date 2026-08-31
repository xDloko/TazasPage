'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/providers/cart-provider';
import { Menu, X, ShoppingBag, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function SiteHeader() {
  const pathname = usePathname();
  const { count } = useCart();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = [
    { href: '/', label: 'Inicio' },
    { href: '/tienda', label: 'Tienda' },
    { href: '/cuenta', label: 'Cuenta' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Tia Yami
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map(n => (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm font-semibold transition-colors ${
                  pathname === n.href
                    ? 'text-terracotta'
                    : 'text-slate-600 hover:text-terracotta dark:text-slate-300'
                }`}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/carrito"
              className="relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-terracotta dark:text-slate-300"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Carrito</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </nav>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex md:hidden items-center justify-center rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="flex flex-col gap-1 border-t border-slate-200 py-4 md:hidden dark:border-slate-700">
            {nav.map(n => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  pathname === n.href
                    ? 'bg-terracotta/10 text-terracotta'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/carrito"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300"
            >
              <ShoppingBag className="h-4 w-4" />
              Carrito {count > 0 && `(${count})`}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

function ThemeToggle({
  theme,
  setTheme,
}: {
  theme: string | undefined;
  setTheme: (_t: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <div className="flex rounded-xl border border-slate-200 dark:border-slate-700">
      {[
        { value: 'light', Icon: Sun },
        { value: 'dark', Icon: Moon },
        { value: 'system', Icon: Laptop },
      ].map(({ value, Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            theme === value ? 'bg-terracotta text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={`Tema: ${value}`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}