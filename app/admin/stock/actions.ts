"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function readQuantity(formData: FormData, t: Awaited<ReturnType<typeof getT>>): number {
  const quantity = Number.parseInt(text(formData, "quantity"), 10);
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new Error(t("error.invalidQuantity"));
  }
  return quantity;
}

function readExpiryDate(formData: FormData, t: Awaited<ReturnType<typeof getT>>): Date {
  const value = text(formData, "expiryDate");
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw new Error(t("error.invalidExpiryDate"));
  }
  return date;
}

function refresh(paths: string[]) {
  revalidatePath("/admin/stock");
  for (const path of paths) revalidatePath(path);
}

export async function addStock(formData: FormData): Promise<void> {
  const t = await getT();
  await requireAdmin();

  const pharmacyId = Number(text(formData, "pharmacyId"));
  const medicationId = Number(text(formData, "medicationId"));
  if (!pharmacyId || !medicationId) throw new Error(t("error.choosePharmacyAndMedication"));

  await prisma.pharmacyStock.create({
    data: {
      pharmacyId,
      medicationId,
      quantity: readQuantity(formData, t),
      expiryDate: readExpiryDate(formData, t),
      batchNumber: text(formData, "batchNumber") || null,
    },
  });

  refresh(["/admin/pharmacies", "/pharmacies", "/medications", "/"]);
  redirect("/admin/stock");
}

export async function updateStock(formData: FormData): Promise<void> {
  const t = await getT();
  await requireAdmin();

  const id = Number(text(formData, "id"));
  if (!id) throw new Error(t("error.invalidStockEntry"));

  await prisma.pharmacyStock.update({
    where: { id },
    data: {
      quantity:    readQuantity(formData, t),
      expiryDate:  readExpiryDate(formData, t),
      batchNumber: text(formData, "batchNumber") || null,
    },
  });

  refresh(["/admin/pharmacies", "/pharmacies", "/medications", "/"]);
  redirect("/admin/stock");
}

export async function deleteStock(formData: FormData): Promise<void> {
  await requireAdmin();

  await prisma.pharmacyStock.delete({ where: { id: Number(text(formData, "id")) } });

  refresh(["/admin/pharmacies", "/pharmacies", "/medications", "/"]);
  redirect("/admin/stock");
}