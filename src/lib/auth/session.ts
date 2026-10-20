import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyToken, SessionPayload } from "./jwt";
import db from "../db";

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getServerSession() {
  const session = await getCurrentSession();
  if (!session) return null;
  return {
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  };
}


export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      customerProfile: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled,
    isEmailVerified: user.isEmailVerified,
    customerProfile: user.customerProfile,
  };
}

export async function requireAuth(): Promise<NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>> {
  const user = await requireAuth();
  if (user.role === "CUSTOMER") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
