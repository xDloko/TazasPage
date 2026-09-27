import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rutas protegidas que requieren autenticación
  const PROTECTED = ['/checkout', '/cuenta', '/admin'];

  if (!PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Reservamos un objeto response para escribir las cookies
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() verifica la autenticidad del JWT con el servidor de Supabase Auth.
  // No uses getSession() aquí: los datos de la cookie pueden ser manipulados.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Solo usuarios con rol admin pueden acceder al panel de administración
  if (pathname.startsWith('/admin')) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/checkout/:path*', '/cuenta/:path*', '/admin/:path*'],
};
