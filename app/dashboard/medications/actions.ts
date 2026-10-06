"use server";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePharmacy } from "@/lib/auth";
import { getT } from "@/lib/i18n";

const medicationImageDir = path.join(process.cwd(), "public", "images", "medications");
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

async function saveImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return null;
  if (file.size > MAX_IMAGE_BYTES) return null;

  await fs.mkdir(medicationImageDir, { recursive: true });

  const extension = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;

  await fs.writeFile(path.join(medicationImageDir, filename), Buffer.from(await file.arrayBuffer()));

  return `/images/medications/${filename}`;
}

export async function saveMedication(formData: FormData): Promise<void> {
  const t = await getT();
  const { pharmacyId } = await requirePharmacy();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  const dosage = String(formData.get("dosage") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const needsPrescription = formData.get("needsPrescription") === "on";

  if (!name || !dosage) {
    throw new Error(t("error.nameAndDosageRequired"));
  }

  if (id) {
    const found = await prisma.medication.findFirst({ where: { id, pharmacyId } });
    if (!found) throw new Error(t("error.medicationNotYours"));

    const uploaded = await saveImage(formData.get("imageFile") as File | null);
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();
    const image = uploaded ?? (imageUrl || found.image);

    await prisma.medication.update({
      where: { id },
      data: { name, dosage, image, description: description || null, needsPrescription },
    });
  } else {
    const uploaded = await saveImage(formData.get("imageFile") as File | null);
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();

    await prisma.medication.create({
      data: { name, dosage, image: uploaded ?? (imageUrl || null), description: description || null, needsPrescription, pharmacy: { connect: { id: pharmacyId } } },
    });
  }

  revalidatePath("/dashboard/medications");
  revalidatePath("/dashboard/stock");
}

export async function deleteMedication(formData: FormData): Promise<void> {
  const t = await getT();
  const { pharmacyId } = await requirePharmacy();
  const id = Number(formData.get("id"));

  const found = await prisma.medication.findFirst({ where: { id, pharmacyId } });
  if (!found) throw new Error(t("error.medicationNotYours"));

  await prisma.medication.delete({ where: { id } });

  revalidatePath("/dashboard/medications");
  revalidatePath("/dashboard/stock");
}