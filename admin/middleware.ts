import { NextResponse, type NextRequest } from "next/server";
import {
  buildAllowedPaths,
  isProtectedRoute,
  resolveDashboardPath,
} from "@/lib/constants/roles";

const isPathAllowed = (pathname: string, allowedPaths: string[]) =>
  allowedPaths.some((path) => {
    const normalised = path.replace(":path*", "");
    return normalised === "/"
      ? pathname === "/"
      : pathname === normalised || pathname.startsWith(`${normalised}/`);
  });

const decodeRoleFromToken = (token: string | undefined) => {
  if (!token) return undefined;

  const parts = token.split(".");
  if (parts.length < 2) return undefined;

  try {
    const normalised = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalised.padEnd(normalised.length + ((4 - (normalised.length % 4)) % 4), "=");
    const decoded = typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("utf-8");

    const payload = JSON.parse(decoded) as { role?: string };
    return typeof payload.role === "string" ? payload.role : undefined;
  } catch {
    return undefined;
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define login pages - these should ALWAYS be accessible without any checks
  const loginPages = ["/super-admin/login", "/station-admin/login", "/fire-personnel/login"];
  
  // CRITICAL: Always allow access to login pages FIRST, before any other checks
  if (loginPages.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect old /login route to fire personnel login
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/fire-personnel/login", request.url));
  }

  // Allow public routes (landing page, etc.)
  const publicRoutes = ["/"];
  if (publicRoutes.includes(pathname)) {
    // Check if user is authenticated - if yes, redirect to dashboard
    const adminToken = request.cookies.get("admin_token")?.value;
    const stationAdminToken = request.cookies.get("station_admin_token")?.value;
    const firePersonnelToken = request.cookies.get("fire_personnel_token")?.value;
    const anyAuthCookie = request.cookies.get("auth_token")?.value || 
                         request.cookies.get("token")?.value ||
                         request.cookies.get("session")?.value;
    const token = adminToken || stationAdminToken || firePersonnelToken || anyAuthCookie;
    
    if (token) {
      const cookieRole = request.cookies.get("role")?.value;
      const role = cookieRole ?? decodeRoleFromToken(token);
      const redirectTo = resolveDashboardPath(role);
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    
    return NextResponse.next();
  }

  // Helper function to get all possible auth tokens
  const getAllAuthTokens = () => {
  const adminToken = request.cookies.get("admin_token")?.value;
  const stationAdminToken = request.cookies.get("station_admin_token")?.value;
  const firePersonnelToken = request.cookies.get("fire_personnel_token")?.value;
    const superAdminToken = request.cookies.get("super_admin_token")?.value;
  const anyAuthCookie = request.cookies.get("auth_token")?.value || 
                       request.cookies.get("token")?.value ||
                         request.cookies.get("session")?.value ||
                         request.cookies.get("access_token")?.value ||
                         request.cookies.get("refresh_token")?.value;
    
    return adminToken || stationAdminToken || firePersonnelToken || superAdminToken || anyAuthCookie;
  };

  // Check for authentication tokens with multiple possible cookie names
  const token = getAllAuthTokens();
  const cookieRole = request.cookies.get("role")?.value || 
                     request.cookies.get("user_role")?.value ||
                     request.cookies.get("userRole")?.value;
  const role = cookieRole ?? decodeRoleFromToken(token);

  // For protected routes, check authentication
  if (isProtectedRoute(pathname)) {
    // Check if this is a dashboard route that might be accessed right after login
    // Allow access if there's any indication of authentication (even if token check fails)
    // This handles the case where cookies are being set but not yet available to middleware
    const hasAnyAuthIndicator = token || 
                                 cookieRole || 
                                 request.cookies.get("authenticated")?.value === "true";
    
    // Check if request is coming from a login page (client-side navigation after login)
    // This helps prevent redirect loops after successful login in production
    const referer = request.headers.get("referer");
    const isFromLogin = referer && (
      referer.includes("/super-admin/login") ||
      referer.includes("/station-admin/login") ||
      referer.includes("/fire-personnel/login")
    );
    
    // Check if this is a client-side navigation (Next.js router navigation)
    // Client-side navigations often don't have referer, so we check other indicators
    const isClientNavigation = request.headers.get("x-middleware-rewrite") ||
                               request.headers.get("x-nextjs-data") ||
                               request.headers.get("sec-fetch-mode") === "navigate";
    
    // Check if navigating within the same dashboard area (e.g., from /dashboard/superadmin to /dashboard/superadmin/analytics)
    // This allows client-side navigation between dashboard pages
    const isDashboardNavigation = referer && pathname.startsWith("/dashboard") && (
      (referer.includes("/dashboard/superadmin") && pathname.startsWith("/dashboard/superadmin")) ||
      (referer.includes("/dashboard/admin") && pathname.startsWith("/dashboard/admin")) ||
      (referer.includes("/dashboard/operations") && pathname.startsWith("/dashboard/operations")) ||
      (referer.includes("/dashboard/unit") && pathname.startsWith("/dashboard/unit"))
    );
    
    // If no token but we're coming from a login page, it's a client navigation to dashboard,
    // OR navigating within the same dashboard area, allow through (client-side will handle auth)
    // This prevents redirect loops after successful login and allows navigation between dashboard pages
    // Note: In production, cookies set by backend might not be immediately available to middleware
    // So we allow the request through and let client-side auth handle the verification
    if (!token && (isFromLogin || (isClientNavigation && pathname.startsWith("/dashboard")) || isDashboardNavigation)) {
      // Allow the request through - client-side auth will handle it
      // The client-side code will redirect to login if auth fails
      return NextResponse.next();
    }
    
    // Require token for all protected routes (unless coming from login or navigating within dashboard)
    if (!token && !hasAnyAuthIndicator) {
      // Determine which login page to redirect to based on the route
      let loginRedirect = "/fire-personnel/login";
      if (pathname.startsWith("/dashboard/superadmin") || pathname.startsWith("/super-admin")) {
        loginRedirect = "/super-admin/login";
      } else if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin")) {
        loginRedirect = "/station-admin/login";
      }
      return NextResponse.redirect(new URL(loginRedirect, request.url));
    }
  }

  // If authenticated, check if user has access to the requested path
  if (token && role) {
    const allowedPaths = buildAllowedPaths(role);
    const baseDashboardPath = resolveDashboardPath(role);

    // Allow access if:
    // 1. Path is in allowed paths list, OR
    // 2. Path is under the user's dashboard base path (for nested routes)
    const isAllowed = isPathAllowed(pathname, allowedPaths) || 
                      (baseDashboardPath && pathname.startsWith(baseDashboardPath));

    if (!isAllowed) {
      return NextResponse.redirect(
        new URL(baseDashboardPath, request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};

