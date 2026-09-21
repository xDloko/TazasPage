import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { CartProvider } from '@/components/providers/cart-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Toaster } from '@/components/ui/use-toast';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'TazasPage',
  description: 'Personaliza tu taza de cerámica ideal y hazla única.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={plusJakartaSans.variable}>
      <body className="font-sans bg-bone text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <SupabaseProvider>
            <AuthProvider>
              <CartProvider>
                <Toaster>
                  <div className="flex min-h-screen flex-col">
                    <SiteHeader />
                    <main className="flex-1">{children}</main>
                    <SiteFooter />
                  </div>
                </Toaster>
              </CartProvider>
            </AuthProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}