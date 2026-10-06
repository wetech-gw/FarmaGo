import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardSalesPage() {
  const { t } = await getI18n();
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const pharmacyId = user.pharmacyId;
  if (!pharmacyId) redirect("/dashboard/sem-farmacia");

  const sales = await prisma.sale.findMany({
    where: { pharmacyId },
    include: { client: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">{t("dash.salesTitle")}</h1>
          <p className="text-secondary small mb-0">{t("dash.salesSubtitle")}</p>
        </div>
        <Link href="/dashboard/sales/new" className="btn btn-success rounded-3">
          <i className="bi bi-plus-lg me-1"></i>
          {t("dash.newSale")}
        </Link>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          {sales.length === 0 ? (
            <p className="text-secondary small mb-0">{t("dash.noSalesRegistered")}</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-secondary">
                    <th>#</th>
                    <th>{t("dash.thClient")}</th>
                    <th>{t("common.date")}</th>
                    <th>{t("dash.thItems")}</th>
                    <th>{t("common.total")}</th>
                    <th style={{ width: 140 }} />
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="small">#{sale.id}</td>
                      <td className="fw-semibold">{sale.client.name}</td>
                      <td className="small">{new Date(sale.createdAt).toLocaleString()}</td>
                      <td className="small">{sale.items.length}</td>
                      <td className="fw-bold">{Number(sale.total).toFixed(2)}</td>
                      <td className="text-end">
                        <Link
                          href={`/dashboard/sales/${sale.id}`}
                          className="btn btn-sm btn-outline-success rounded-3 me-1"
                          aria-label={t("dash.viewReceipt")}
                        >
                          <i className="bi bi-receipt"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}