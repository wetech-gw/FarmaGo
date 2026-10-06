"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, homePathForRole, verifyPassword } from "@/lib/auth";
import { getT } from "@/lib/i18n";

export type AuthState = { error: string };

/** Só aceita caminhos internos para evitar open redirect. */
function safeNext(value: FormDataEntryValue | null): string | null {
  const path = String(value ?? "");
  return path.startsWith("/") && !path.startsWith("//") ? path : null;
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const t = await getT();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: t("error.loginRequired") };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: t("error.invalidCredentials") };
  }

  await createSession(user.id);

  redirect(next ?? homePathForRole(user.role));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}