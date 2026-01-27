import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const path = requestUrl.pathname;

  // Create supabase client
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set(name, value);
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.delete(name);
          response.cookies.delete({ name, ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  const isProtectedRoute = path.startsWith("/dashboard") ||
                           path.startsWith("/projects") ||
                           path.startsWith("/expenses") ||
                           path.startsWith("/workers");

  // Auth route
  const isAuthRoute = path === "/login";

  // Redirect to login if not authenticated
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to dashboard if authenticated and trying to access login
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
