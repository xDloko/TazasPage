import Link from 'next/link';
import { PaletteIcon, Instagram, Facebook, Mail } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">☕</span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Tia Yami
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Ceramica artesanal personalizada. Disena tu taza unica con nosotros.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Tienda</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/tienda" className="hover:text-terracotta">Todas las tazas</Link></li>
              <li><Link href="/tienda" className="hover:text-terracotta">Nuevos disenos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Ayuda</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/" className="hover:text-terracotta">Contacto</Link></li>
              <li><Link href="/" className="hover:text-terracotta">Envios</Link></li>
              <li><Link href="/" className="hover:text-terracotta">Devoluciones</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Contacto</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hola@tiayami.cl</li>
              <li className="flex items-center gap-2"><Instagram className="h-4 w-4" /> @tiayami</li>
              <li className="flex items-center gap-2"><Facebook className="h-4 w-4" /> Tia Yami Ceramica</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400 dark:border-slate-700">
          Tia Yami {new Date().getFullYear()} — Hecho con amor y ceramica
        </div>
      </div>
    </footer>
  );
}