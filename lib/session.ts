import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, createHash } from "crypto";
import { compare, hash } from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { LoginInput, RegisterInput } from "@/lib/validations";

export const sessionCookieName = "residentflow_session";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createUserSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const requestHeaders = await headers();

  await prisma.session.create({
    data: {
      token: tokenHash,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      ipAddress: requestHeaders.get("x-forwarded-for"),
      userAgent: requestHeaders.get("user-agent"),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: { id: true, passwordHash: true },
  });

  if (!user?.passwordHash || !(await compare(input.password, user.passwordHash))) {
    throw new Error("Invalid email or password.");
  }

  await createUserSession(user.id);
}

export async function registerResident(input: RegisterInput) {
  const passwordHash = await hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: "RESIDENT",
      flatNumber: input.flatNumber,
      phone: input.phone || null,
    },
    select: { id: true },
  });

  await createUserSession(user.id);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token: hashToken(token) },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          flatNumber: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function requireUser(roles?: Role[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (roles && !roles.includes(user.role)) {
    redirect(user.role === "ADMIN" ? "/admin" : "/resident");
  }

  return user;
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token: hashToken(token) } });
  }

  cookieStore.delete(sessionCookieName);
}
