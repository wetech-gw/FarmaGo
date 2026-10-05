"use server";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePharmacy } from "@/lib/auth";

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

export async function savePharmacyProfile(formData: FormData): Promise<void> {
  const { pharmacyId } = await requirePharmacy();
  const id = Number(formData.get("id"));

  if (id !== pharmacyId) throw new Error("Farmácia inválida.");

  const name = text(formData, "name");
  const address = text(formData, "address");
  const phone = text(formData, "phone");

  if (!name || !address || !phone) {
    throw new Error("Nome, morada e telefone são obrigatórios.");
  }

  const uploaded = await saveImage(formData.get("imageFile") as File | null);
  const imageUrl = text(formData, "imageUrl");

  const existing = await prisma.pharmacy.findUnique({
    where: { id: pharmacyId },
    select: { image: true },
  });

  const image = uploaded ?? (imageUrl || (existing?.image ?? "/images/default-pharmacy.svg"));

  await prisma.pharmacy.update({
    where: { id: pharmacyId },
    data: {
      name,
      address,
      phone,
      image,
      schedule: text(formData, "schedule") || "Segunda - Sexta",
      hours: text(formData, "hours") || "08:00 - 20:00",
      isGuard: text(formData, "isGuard") === "1",
      latitude: coordinate(formData, "latitude"),
      longitude: coordinate(formData, "longitude"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pharmacy");
  revalidatePath("/pharmacies");
}

export async function requestRevalidation(): Promise<void> {
  const { pharmacyId } = await requirePharmacy();

  await prisma.pharmacy.update({
    where: { id: pharmacyId },
    data: { status: "pending", validatedAt: null, validatedById: null, rejectionReason: null },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pharmacy");
}
