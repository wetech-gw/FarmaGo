"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePharmacy } from "@/lib/auth";
import { getT } from "@/lib/i18n";

/** Confirma que o registo pertence à farmácia da sessão. */

export async function togglePharmacyOpen(formData: FormData): Promise<void> {
  const t = await getT();
  const { pharmacyId } = await requirePharmacy();
  const id = Number(formData.get("id"));
  const isOpen = String(formData.get("isOpen")) === "1";

  // Só a própria farmácia pode mudar o seu estado.
  if (id !== pharmacyId) throw new Error(t("error.invalidPharmacy"));

  await prisma.pharmacy.update({ where: { id: pharmacyId }, data: { isOpen } });

  revalidatePath("/dashboard");
  revalidatePath("/pharmacies");
  revalidatePath("/");
}

export async function togglePharmacyGuard(formData: FormData): Promise<void> {
  const t = await getT();
  const { pharmacyId } = await requirePharmacy();
  const id = Number(formData.get("id"));
  const isGuard = String(formData.get("isGuard")) === "1";

  // Só a própria farmácia pode mudar o seu estado de plantão.
  if (id !== pharmacyId) throw new Error(t("error.invalidPharmacy"));

  await prisma.pharmacy.update({ where: { id: pharmacyId }, data: { isGuard } });

  revalidatePath("/dashboard");
  revalidatePath("/pharmacies");
  revalidatePath("/guards");
  revalidatePath("/");
}

export async function updateStockQuantity(formData: FormData): Promise<void> {
  const t = await getT();
  const { pharmacyId } = await requirePharmacy();
  const id = Number(formData.get("id"));
  const quantity = Math.max(0, Number(formData.get("quantity")) || 0);

  const found = await prisma.pharmacyStock.findFirst({ where: { id, pharmacyId } });
  if (!found) throw new Error(t("error.notYourPharmacy"));

  await prisma.pharmacyStock.update({ where: { id }, data: { quantity } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/stock");
  revalidatePath("/pharmacies");
}

export async function saveStock(formData: FormData): Promise<void> {
  const t = await getT();
  const { pharmacyId } = await requirePharmacy();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const medicationId = Number(formData.get("medicationId"));
  const quantity = Math.max(0, Number(formData.get("quantity")) || 0);
  const batchNumber = String(formData.get("batchNumber") ?? "").trim() || null;
  const expiry = String(formData.get("expiryDate") ?? "");
  const unitPrice = String(formData.get("unitPrice") ?? "0").replace(",", ".");

  if (!medicationId || !expiry) {
    throw new Error(t("error.chooseMedicationAndExpiry"));
  }

  const data = {
    quantity,
    batchNumber,
    unitPrice,
    expiryDate: new Date(`${expiry}T00:00:00`),
  };

  if (id) {
    const found = await prisma.pharmacyStock.findFirst({ where: { id, pharmacyId } });
    if (!found) throw new Error(t("error.notYourPharmacy"));
    await prisma.pharmacyStock.update({ where: { id }, data });
  } else {
    await prisma.pharmacyStock.create({
      data: { ...data, pharmacyId, medicationId },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/stock");
  revalidatePath("/pharmacies");
  redirect("/dashboard/stock");
}

export async function deleteStock(formData: FormData): Promise<void> {
  const t = await getT();
  const { pharmacyId } = await requirePharmacy();
  const id = Number(formData.get("id"));

  const found = await prisma.pharmacyStock.findFirst({ where: { id, pharmacyId } });
  if (!found) throw new Error(t("error.notYourPharmacy"));

  await prisma.pharmacyStock.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/stock");
  revalidatePath("/pharmacies");
}

export async function saveExpense(formData: FormData): Promise<void> {
  const t = await getT();
  const { pharmacyId } = await requirePharmacy();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "outros") as
    "infraestrutura" | "pessoal" | "stock" | "outros";
  const amount = String(formData.get("amount") ?? "").replace(",", ".");
  const expenseDate = String(formData.get("expenseDate") ?? "");

  if (!title || !amount || !expenseDate) {
    throw new Error(t("error.fillDescriptionAmountDate"));
  }

  const data = {
    title,
    category,
    amount,
    expenseDate: new Date(`${expenseDate}T00:00:00`),
  };

  if (id) {
    const found = await prisma.expense.findFirst({ where: { id, pharmacyId } });
    if (!found) throw new Error(t("error.expenseNotYours"));
    await prisma.expense.update({ where: { id }, data });
  } else {
    await prisma.expense.create({ data: { ...data, pharmacyId } });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  redirect("/dashboard/expenses");
}

export async function deleteExpense(formData: FormData): Promise<void> {
  const t = await getT();
  const { pharmacyId } = await requirePharmacy();
  const id = Number(formData.get("id"));

  const found = await prisma.expense.findFirst({ where: { id, pharmacyId } });
  if (!found) throw new Error(t("error.expenseNotYours"));

  await prisma.expense.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
}