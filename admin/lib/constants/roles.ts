const DEFAULT_DASHBOARD = "/dashboard";

export const ROLE_DASHBOARDS: Record<string, string> = {
  super_admin: "/dashboard/superadmin",
  superadmin: "/dashboard/superadmin",
  admin: "/dashboard/admin",
  operations: "/dashboard/operations",
  officer: "/dashboard/officer",
  safety: DEFAULT_DASHBOARD,
  pr: DEFAULT_DASHBOARD,
  user: DEFAULT_DASHBOARD,
  fire_personnel: "/dashboard/unit",
  firepersonnel: "/dashboard/unit",
};

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/super-admin",
  "/admin",
  "/officer",
  "/user",
];

const normalizeRole = (role?: string | null) => {
  if (!role) return "";
  if (typeof role !== "string") return "";
  return role.toLowerCase().replace(/\s+/g, "_");
};

export const resolveDashboardPath = (role?: string | null) =>
  ROLE_DASHBOARDS[normalizeRole(role)] ?? DEFAULT_DASHBOARD;

export const isProtectedRoute = (pathname: string) =>
  PROTECTED_PREFIXES.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(`${prefix}/`),
  );

export const buildAllowedPaths = (role?: string | null) => {
  const basePath = resolveDashboardPath(role);

  return [
    basePath,
    `${basePath}/:path*`,
    DEFAULT_DASHBOARD,
    `${DEFAULT_DASHBOARD}/:path*`,
    "/api",
    "/api/:path*",
  ];
};

