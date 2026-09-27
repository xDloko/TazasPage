'use client';

import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin/products', label: 'Productos' },
  { href: '/admin/orders', label: 'Pedidos' },
  { href: '/admin/users', label: 'Usuarios' },
];

const activeClasses = 'rounded-xl bg-terracotta/10 px-4 py-2 text-terracotta hover:bg-terracotta/20';
const inactiveClasses = 'rounded-xl bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200';

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-3 text-sm font-semibold">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className={pathname === l.href ? activeClasses : inactiveClasses}
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}
