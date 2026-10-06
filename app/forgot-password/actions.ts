"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getT } from "@/lib/i18n";

export type ForgotState = {
  status: "idle" | "invalid" | "found";
  email?: string;
  error?: string;
};

export async function checkEmailAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const t = await getT();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { status: "idle", error: t("error.emailRequired") };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { status: "invalid", error: t("error.emailNotRegistered") };
  }

  return { status: "found", email };
}

export async function resetPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const t = await getT();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6) {
    return { status: "found", email, error: t("error.passwordTooShort") };
  }

  if (password !== confirm) {
    return { status: "found", email, error: t("error.passwordsMismatch") };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { status: "invalid", error: t("error.accountNotFound") };
  }

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await hashPassword(password) },
  });

  redirect("/login");
}