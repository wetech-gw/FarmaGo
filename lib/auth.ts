import { cookies } from "next/headers";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "farmago_session";
const SESSION_DAYS = 30;
const SCRYPT_KEYLEN = 64;

// scrypt tem API de callback; promisify dá a variante awaitable.
const scryptAsync = promisify(scrypt);

// ---------------------------------------------------------------------------
// Password (scrypt, módulo nativo do Node — sem dependências extra)
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;

  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
  const expected = Buffer.from(hash, "hex");

  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

// ---------------------------------------------------------------------------
// Sessões (tabela `sessions` + cookie httpOnly)
// ---------------------------------------------------------------------------

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({ data: { token, userId, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

// ---------------------------------------------------------------------------
// Leitura do utilizador actual
// ---------------------------------------------------------------------------

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "owner";
  pharmacyId: number | null;
  pharmacyStatus: "pending" | "approved" | "rejected" | null;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { include: { pharmacies: { select: { id: true, status: true } } } } },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.deleteMany({ where: { token } });
    return null;
  }

  const pharmacy = session.user.pharmacies[0] ?? null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    pharmacyId: pharmacy?.id ?? null,
    pharmacyStatus: pharmacy?.status ?? null,
  };
}

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

/**
 * Devolve a farmácia da conta do farmacêutico.
 * Redirecciona admins para o painel admin e contas sem farmácia para a
 * página de espera. Só o dono com uma farmácia pode alterar os dados.
 */
export async function requirePharmacy(): Promise<{ user: SessionUser; pharmacyId: number }> {
  const user = await requireUser();

  if (user.role === "admin") redirect("/admin/dashboard");
  if (!user.pharmacyId) redirect("/dashboard/sem-farmacia");

  return { user, pharmacyId: user.pharmacyId };
}
