import { Role } from "@prisma/client";

export type Permission =
  | "admin:access"
  | "analytics:read"
  | "leads:read"
  | "leads:write"
  | "customers:read"
  | "customers:write"
  | "quotes:read"
  | "quotes:write"
  | "quotes:approve"
  | "bookings:read"
  | "bookings:write"
  | "projects:read"
  | "projects:write"
  | "payments:read"
  | "payments:refund"
  | "invoices:read"
  | "invoices:issue"
  | "invoices:rectify"
  | "services:read"
  | "services:write"
  | "services:approve"
  | "cms:read"
  | "cms:write"
  | "blog:read"
  | "blog:write"
  | "newsletter:read"
  | "newsletter:write"
  | "campaigns:read"
  | "campaigns:write"
  | "campaigns:send"
  | "settings:read"
  | "settings:write"
  | "audit:read"
  | "users:manage";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPERADMIN: [
    "admin:access",
    "analytics:read",
    "leads:read",
    "leads:write",
    "customers:read",
    "customers:write",
    "quotes:read",
    "quotes:write",
    "quotes:approve",
    "bookings:read",
    "bookings:write",
    "projects:read",
    "projects:write",
    "payments:read",
    "payments:refund",
    "invoices:read",
    "invoices:issue",
    "invoices:rectify",
    "services:read",
    "services:write",
    "services:approve",
    "cms:read",
    "cms:write",
    "blog:read",
    "blog:write",
    "newsletter:read",
    "newsletter:write",
    "campaigns:read",
    "campaigns:write",
    "campaigns:send",
    "settings:read",
    "settings:write",
    "audit:read",
    "users:manage",
  ],
  OPERATIONS: [
    "admin:access",
    "leads:read",
    "leads:write",
    "customers:read",
    "quotes:read",
    "quotes:write",
    "bookings:read",
    "bookings:write",
    "projects:read",
    "projects:write",
    "services:read",
  ],
  CONTENT_EDITOR: [
    "admin:access",
    "services:read",
    "services:write",
    "cms:read",
    "cms:write",
    "blog:read",
    "blog:write",
  ],
  MARKETING: [
    "admin:access",
    "analytics:read",
    "leads:read",
    "newsletter:read",
    "newsletter:write",
    "campaigns:read",
    "campaigns:write",
    "campaigns:send",
  ],
  ACCOUNTANT: [
    "admin:access",
    "quotes:read",
    "payments:read",
    "payments:refund",
    "invoices:read",
    "invoices:issue",
    "invoices:rectify",
  ],
  CUSTOMER: [],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

export function isAdminRole(role: Role): boolean {
  return role !== "CUSTOMER";
}
