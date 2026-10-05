"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export type ForgotState = {
  status: "idle" | "invalid" | "found";
  email?: string;
  error?: string;
};

export async function checkEmailAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { status: "idle", error: "Introduza o seu email." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { status: "invalid", error: "Este email não está registado no sistema." };
  }

  return { status: "found", email };
}

export async function resetPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6) {
    return { status: "found", email, error: "A palavra-passe deve ter pelo menos 6 caracteres." };
  }

  if (password !== confirm) {
    return { status: "found", email, error: "As palavras-passe não coincidem." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { status: "invalid", error: "Conta não encontrada." };
  }

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await hashPassword(password) },
  });

  redirect("/login");
}
