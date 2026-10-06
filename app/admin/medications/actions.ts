"use server";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n";

const medicationImageDir = path.join(process.cwd(), "public", "images", "medications");

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

async function saveUploadedImage(file: File | null, t: Awaited<ReturnType<typeof getT>>): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(t("error.unsupportedImageFormat"));
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(t("error.imageTooLarge"));
  }

  await fs.mkdir(medicationImageDir, { recursive: true });

  const extension = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;

  await fs.writeFile(path.join(medicationImageDir, filename), Buffer.from(await file.arrayBuffer()));

  return `/images/medications/${filename}`;
}

async function resolveMedicationImage(formData: FormData, t: Awaited<ReturnType<typeof getT>>, currentImage?: string | null) {
  const uploaded = await saveUploadedImage(formData.get("imageFile") as File | null, t);
  if (uploaded) return uploaded;

  const imageUrl = text(formData, "imageUrl");
  if (imageUrl) return imageUrl;

  return currentImage ?? null;
}

export async function createMedication(formData: FormData): Promise<void> {
  const t = await getT();
  await requireAdmin();

  const name = text(formData, "name");
  const dosage = text(formData, "dosage");
  if (!name || !dosage) throw new Error(t("error.nameAndDosageRequiredAdmin"));

  const description = text(formData, "description");
  const needsPrescription = formData.get("needsPrescription") === "on";

  const image = await resolveMedicationImage(formData, t);

  await prisma.medication.create({ data: { name, dosage, image, description: description || null, needsPrescription } });

  revalidatePath("/admin/medications");
  revalidatePath("/medications");
  redirect("/admin/medications");
}

export async function updateMedication(formData: FormData): Promise<void> {
  const t = await getT();
  await requireAdmin();

  const id = Number(text(formData, "id"));
  if (!id) throw new Error(t("error.invalidMedication"));

  const name = text(formData, "name");
  const dosage = text(formData, "dosage");
  if (!name || !dosage) throw new Error(t("error.nameAndDosageRequiredAdmin"));

  const description = text(formData, "description");
  const needsPrescription = formData.get("needsPrescription") === "on";

  const existing = await prisma.medication.findUnique({ where: { id } });
  const image = await resolveMedicationImage(formData, t, existing?.image);

  await prisma.medication.update({ where: { id }, data: { name, dosage, image, description: description || null, needsPrescription } });

  revalidatePath("/admin/medications");
  revalidatePath("/medications");
  redirect("/admin/medications");
}

export async function deleteMedication(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.medication.delete({ where: { id: Number(text(formData, "id")) } });

  revalidatePath("/admin/medications");
  revalidatePath("/medications");
  redirect("/admin/medications");
}