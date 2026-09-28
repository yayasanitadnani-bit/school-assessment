import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const path = request.nextUrl.pathname;

  // Izinkan halaman asisten AI diakses publik tanpa login
  if (path === "/teacher/ai-assistant") {
    return supabaseResponse;
  }

  // Periksa sesi pengguna yang sedang aktif untuk halaman terlarang lainnya
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jika mencoba membuka halaman /teacher (selain AI) atau /admin tetapi belum login, arahkan ke /guru
  if ((path.startsWith("/teacher") || path.startsWith("/admin")) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/guru";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Tentukan halaman mana saja yang dipantau oleh middleware ini
export const config = {
  matcher: ["/teacher/:path*", "/admin/:path*"],
};
