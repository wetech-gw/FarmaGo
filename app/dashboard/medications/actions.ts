"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePharmacy } from "@/lib/auth";
import { resolveMedicationImage } from "@/lib/medication-image";
import { getT } from "@/lib/i18n";

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

  const data = { name, dosage, description: description || null, needsPrescription };

  if (id) {
    const found = await prisma.medication.findFirst({ where: { id, pharmacyId } });
    if (!found) throw new Error(t("error.medicationNotYours"));

    await prisma.medication.update({
      where: { id },
      data: { ...data, image: await resolveMedicationImage(formData, found.image) },
    });
  } else {
    await prisma.medication.create({
      data: {
        ...data,
        image: await resolveMedicationImage(formData),
        pharmacy: { connect: { id: pharmacyId } },
      },
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
