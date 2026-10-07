"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { resolveMedicationImage } from "@/lib/medication-image";
import { getT } from "@/lib/i18n";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function readMedicationFields(formData: FormData) {
  const name = text(formData, "name");
  const dosage = text(formData, "dosage");
  const description = text(formData, "description");
  const needsPrescription = formData.get("needsPrescription") === "on";

  return { name, dosage, description: description || null, needsPrescription };
}

function refresh() {
  revalidatePath("/admin/medications");
  revalidatePath("/medications");
}

export async function createMedication(formData: FormData): Promise<void> {
  const t = await getT();
  await requireAdmin();

  const { name, dosage, description, needsPrescription } = readMedicationFields(formData);
  if (!name || !dosage) throw new Error(t("error.nameAndDosageRequiredAdmin"));

  await prisma.medication.create({
    data: {
      name,
      dosage,
      description,
      needsPrescription,
      image: await resolveMedicationImage(formData),
    },
  });

  refresh();
  redirect("/admin/medications");
}

export async function updateMedication(formData: FormData): Promise<void> {
  const t = await getT();
  await requireAdmin();

  const id = Number(text(formData, "id"));
  if (!id) throw new Error(t("error.invalidMedication"));

  const { name, dosage, description, needsPrescription } = readMedicationFields(formData);
  if (!name || !dosage) throw new Error(t("error.nameAndDosageRequiredAdmin"));

  const existing = await prisma.medication.findUnique({ where: { id } });

  await prisma.medication.update({
    where: { id },
    data: {
      name,
      dosage,
      description,
      needsPrescription,
      image: await resolveMedicationImage(formData, existing?.image),
    },
  });

  refresh();
  redirect("/admin/medications");
}

export async function deleteMedication(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.medication.delete({ where: { id: Number(text(formData, "id")) } });

  refresh();
  redirect("/admin/medications");
}
