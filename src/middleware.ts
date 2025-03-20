import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.delete({ name, ...options });
        },
      },
    }
  );

  // Refresh the session if it exists
  const { data: { session }, error } = await supabase.auth.getSession();

  // Handle authentication for protected routes
  const publicRoutes = ['/login', '/auth/callback'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // If not a public route and no session, redirect to login
  if (!isPublicRoute && !isApiRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and trying to access login, redirect to home
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

// Apply the middleware to all routes except static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 