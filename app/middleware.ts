import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Protect ALL admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // ✅ Login page always allowed
    if (req.nextUrl.pathname === "/admin/login") {
      return res;
    }

    // ✅ Block if NOT logged in
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // ✅ Check if user is an ADMIN (SQL check)
    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!admin) {
      return NextResponse.redirect(new URL("/", req.url)); // ❌ Not an admin → Kick out
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
