"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePharmacy } from "@/lib/auth";
import { getT } from "@/lib/i18n";

export type SaleItemInput = { stockId: number; quantity: number };

export type CreateSaleInput = {
  clientId: number | null;
  newClientName?: string;
  newClientPhone?: string;
  newClientEmail?: string;
  items: SaleItemInput[];
};

export async function createSale(input: CreateSaleInput): Promise<void> {
  const t = await getT();
  const { pharmacyId } = await requirePharmacy();

  const items = (input.items ?? []).filter((i) => i.stockId && i.quantity > 0);
  if (items.length === 0) throw new Error(t("error.addAtLeastOneMedication"));

  let clientId = input.clientId ? Number(input.clientId) : null;
  if (clientId) {
    const client = await prisma.client.findFirst({ where: { id: clientId, pharmacyId } });
    if (!client) throw new Error(t("error.invalidClient"));
  } else {
    const name = (input.newClientName ?? "").trim();
    if (!name) throw new Error(t("error.clientNameRequired"));
    const created = await prisma.client.create({
      data: {
        pharmacyId,
        name,
        phone: (input.newClientPhone ?? "").trim() || null,
        email: (input.newClientEmail ?? "").trim() || null,
      },
    });
    clientId = created.id;
  }

  const saleItems = [];
  let total = 0;

  for (const item of items) {
    const stock = await prisma.pharmacyStock.findFirst({
      where: { id: item.stockId, pharmacyId },
      include: { medication: true },
    });
    if (!stock) throw new Error(t("error.invalidStockLine"));
    if (stock.quantity < item.quantity) {
      throw new Error(t("error.insufficientStock", { name: stock.medication.name }));
    }

    const unitPrice = Number(stock.unitPrice);
    const subtotal = unitPrice * item.quantity;
    total += subtotal;

    saleItems.push({
      medicationId: stock.medicationId,
      quantity: item.quantity,
      unitPrice,
      subtotal,
    });

    await prisma.pharmacyStock.update({
      where: { id: stock.id },
      data: { quantity: { decrement: item.quantity } },
    });
  }

  const sale = await prisma.sale.create({
    data: {
      pharmacyId,
      clientId,
      total,
      items: { create: saleItems },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/stock");
  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/sales/${sale.id}`);
}

export async function deleteSale(formData: FormData): Promise<void> {
  const t = await getT();
  const { pharmacyId } = await requirePharmacy();
  const id = Number(formData.get("id"));

  const found = await prisma.sale.findFirst({ where: { id, pharmacyId } });
  if (!found) throw new Error(t("error.saleNotYours"));

  await prisma.sale.delete({ where: { id } });

  revalidatePath("/dashboard/sales");
  redirect("/dashboard/sales");
}