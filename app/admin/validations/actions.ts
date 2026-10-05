"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function approvePharmacy(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));

  const pharmacy = await prisma.pharmacy.findUnique({
    where: { id },
    select: { id: true, latitude: true, longitude: true, name: true },
  });
  if (!pharmacy) throw new Error("Farmácia não encontrada.");

  await prisma.pharmacy.update({
    where: { id },
    data: {
      status: "approved",
      validatedAt: new Date(),
      validatedById: admin.id,
      rejectionReason: null,
    },
  });

  revalidatePath("/admin/validations");
  revalidatePath("/admin/pharmacies");
  revalidatePath("/pharmacies");
  revalidatePath("/");
  redirect("/admin/validations");
}

export async function rejectPharmacy(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const reason = String(formData.get("reason") ?? "").trim();

  if (!reason) throw new Error("Indique o motivo da rejeição.");

  await prisma.pharmacy.update({
    where: { id },
    data: {
      status: "rejected",
      validatedAt: new Date(),
      validatedById: admin.id,
      rejectionReason: reason,
    },
  });

  revalidatePath("/admin/validations");
  revalidatePath("/admin/pharmacies");
  revalidatePath("/pharmacies");
  revalidatePath("/");
  redirect("/admin/validations");
}

export async function sendBackToValidation(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));

  await prisma.pharmacy.update({
    where: { id },
    data: { status: "pending", validatedAt: null, validatedById: null, rejectionReason: null },
  });

  revalidatePath("/admin/validations");
  revalidatePath("/admin/pharmacies");
  redirect("/admin/validations");
}