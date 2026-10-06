"use server";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { getT } from "@/lib/i18n";

export type RegisterState = { error: string };

const pharmacyImageDir = path.join(process.cwd(), "public", "images", "pharmacies");
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function coordinate(formData: FormData, key: string): number | null {
  const value = Number.parseFloat(text(formData, key));
  return Number.isFinite(value) ? value : null;
}

async function saveImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return null;
  if (file.size > MAX_IMAGE_BYTES) return null;

  await fs.mkdir(pharmacyImageDir, { recursive: true });

  const extension = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;

  await fs.writeFile(path.join(pharmacyImageDir, filename), Buffer.from(await file.arrayBuffer()));

  return `/images/pharmacies/${filename}`;
}

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const t = await getT();
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const pharmacyName = text(formData, "pharmacyName");
  const address = text(formData, "address");
  const phone = text(formData, "phone");
  const schedule = text(formData, "schedule");
  const hours = text(formData, "hours");
  const isGuard = text(formData, "isGuard") === "1";

  if (!name || !email || !password || !pharmacyName || !address || !phone) {
    return { error: t("error.required") };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: t("error.invalidEmail") };
  }

  if (password.length < 6) {
    return { error: t("error.passwordTooShort") };
  }

  if (password !== confirm) {
    return { error: t("error.passwordsMismatch") };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: t("error.emailInUse") };
  }

  const image = await saveImage(formData.get("imageFile") as File | null);

  const passwordHash = await hashPassword(password);

  const userId = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash, role: "owner" },
    });

    await tx.pharmacy.create({
      data: {
        ownerId: user.id,
        name: pharmacyName,
        address,
        phone,
        schedule,
        hours,
        latitude: coordinate(formData, "latitude"),
        longitude: coordinate(formData, "longitude"),
        isGuard,
        isOpen: false,
        image: image ?? "/images/default-pharmacy.svg",
        status: "pending",
      },
    });

    return user.id;
  });

  await createSession(userId);

  redirect("/dashboard?registered=1");
}
