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
        get: (name) => req.cookies.get(name)?.value,

        set: (name, value, options) => {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },

        remove: (name, options) => {
          res.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  // ✅ Protect ALL admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // ✅ Allow admin login always
    if (req.nextUrl.pathname === "/admin/login") {
      return res;
    }

    // ❌ NOT LOGGED IN → BLOCK
    if (!user || error) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // ✅ HARD ADMIN CHECK (admins table)
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .single();

    // ❌ NOT ADMIN → BLOCK
    if (!admin || adminError) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
