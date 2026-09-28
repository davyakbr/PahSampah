import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "./lib/auth";

const JWT_SECRET = process.env.JWT_SECRET || "pahsampah-default-secret-key-12345";
const COOKIE_NAME = "pahsampah_session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Verify JWT if token exists
  let session = null;
  if (token) {
    session = await verifyJwt(token, JWT_SECRET);
  }

  // 1. If trying to access dashboard but not logged in -> redirect to /login
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Block Admin from creating waste (Users only)
    if (pathname === "/dashboard/waste/new" && session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/waste", request.url));
    }

    // 3. Block User from admin management pages
    if (pathname.startsWith("/dashboard/admin") && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // 4. Edit pages are admin-only
    const isEditPage = /\/dashboard\/waste\/[^/]+\/edit/.test(pathname);
    if (isEditPage && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // 3. If logged in but trying to access auth pages (login/register) -> redirect to /dashboard
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (session) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
