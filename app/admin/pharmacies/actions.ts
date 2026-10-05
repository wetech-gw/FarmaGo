"use server";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const pharmacyImageDir = path.join(process.cwd(), "public", "images", "pharmacies");
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const DEFAULT_IMAGE = "/images/default-pharmacy.svg";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parseCoordinate(value: FormDataEntryValue | null): number | null {
  const parsed = Number.parseFloat(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

async function saveUploadedImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return null;
  if (file.size > MAX_IMAGE_BYTES) return null;

  await fs.mkdir(pharmacyImageDir, { recursive: true });

  const extension = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;

  await fs.writeFile(path.join(pharmacyImageDir, filename), Buffer.from(await file.arrayBuffer()));

  return `/images/pharmacies/${filename}`;
}

async function resolvePharmacyImage(formData: FormData, currentImage?: string): Promise<string> {
  const uploaded = await saveUploadedImage(formData.get("imageFile") as File | null);
  if (uploaded) return uploaded;

  const imageUrl = text(formData, "imageUrl");
  if (imageUrl) return imageUrl;

  return currentImage ?? DEFAULT_IMAGE;
}

export async function createPharmacy(formData: FormData): Promise<void> {
  await requireAdmin();

  const ownerId = Number(text(formData, "ownerId"));
  const name = text(formData, "name");
  const address = text(formData, "address");
  const phone = text(formData, "phone");

  if (!ownerId || !name || !address || !phone) {
    throw new Error("Preencha proprietário, nome, morada e telefone.");
  }

  const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { id: true, role: true } });
  if (!owner || owner.role !== "owner") {
    throw new Error("O proprietário tem de ser uma conta de farmacêutico.");
  }

  // Regra do sistema: uma farmácia por conta de farmacêutico.
  const owned = await prisma.pharmacy.count({ where: { ownerId } });
  if (owned > 0) {
    throw new Error("Essa conta já tem uma farmácia registada (1 conta = 1 farmácia).");
  }

  const image = await resolvePharmacyImage(formData);

  // Farmácias criadas pelo admin entram validadas; as criadas pelo dono
  // passam por visita presencial.
  await prisma.pharmacy.create({
    data: {
      ownerId,
      name,
      address,
      phone,
      schedule: text(formData, "schedule") || "Segunda - Sexta",
      hours:    text(formData, "hours")    || "09:00 - 23:00",
      image,
      latitude:  parseCoordinate(formData.get("latitude")),
      longitude: parseCoordinate(formData.get("longitude")),
      isGuard:   formData.get("isGuard") === "1",
      isOpen:    formData.get("isOpen")  === "1",
      status:        "approved",
      validatedAt:   new Date(),
    },
  });

  revalidatePath("/admin/pharmacies");
  revalidatePath("/admin/validations");
  redirect("/admin/pharmacies");
}

export async function updatePharmacy(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = Number(text(formData, "id"));
  if (!id) throw new Error("Farmácia inválida.");

  const existing = await prisma.pharmacy.findUnique({ where: { id } });
  if (!existing) throw new Error("Farmácia não encontrada.");

  const image = await resolvePharmacyImage(formData, existing.image ?? DEFAULT_IMAGE);

  await prisma.pharmacy.update({
    where: { id },
    data: {
      name:     text(formData, "name"),
      address:  text(formData, "address"),
      phone:    text(formData, "phone"),
      schedule: text(formData, "schedule"),
      hours:    text(formData, "hours"),
      image,
      latitude:  parseCoordinate(formData.get("latitude")),
      longitude: parseCoordinate(formData.get("longitude")),
      isGuard:   formData.get("isGuard") === "1",
      isOpen:    formData.get("isOpen")  === "1",
      // Editar dados durante a visita revalida a aprovação.
      status:        "approved",
      validatedAt:   new Date(),
      validatedById: admin.id,
      rejectionReason: null,
    },
  });

  revalidatePath("/admin/pharmacies");
  revalidatePath("/admin/validations");
  revalidatePath("/pharmacies");
  revalidatePath("/");
  redirect("/admin/pharmacies");
}

export async function deletePharmacy(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.pharmacy.delete({ where: { id: Number(text(formData, "id")) } });

  revalidatePath("/admin/pharmacies");
  revalidatePath("/admin/validations");
  revalidatePath("/pharmacies");
  revalidatePath("/");
  redirect("/admin/pharmacies");
}
