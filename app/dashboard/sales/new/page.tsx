import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SaleForm from "../SaleForm";
import { getI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function NewSalePage() {
  const { t } = await getI18n();
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const pharmacyId = user.pharmacyId;
  if (!pharmacyId) redirect("/dashboard/sem-farmacia");

  const [stocks, clients] = await Promise.all([
    prisma.pharmacyStock.findMany({
      where: { pharmacyId, quantity: { gt: 0 } },
      include: { medication: true },
      orderBy: { expiryDate: "asc" },
    }),
    prisma.client.findMany({
      where: { pharmacyId },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <div className="mb-4">
        <h1 className="h4 fw-bold mb-1">{t("dash.newSale")}</h1>
        <p className="text-secondary small mb-0">{t("dash.saleStockUpdated")}</p>
      </div>

      <SaleForm
        stocks={stocks.map((s) => ({
          stockId: s.id,
          label: `${s.medication.name} — ${s.medication.dosage}`,
          price: Number(s.unitPrice),
          available: s.quantity,
        }))}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}