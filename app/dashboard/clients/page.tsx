import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardClientsPage() {
  const { t } = await getI18n();
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const pharmacyId = user.pharmacyId;
  if (!pharmacyId) redirect("/dashboard/sem-farmacia");

  const clients = await prisma.client.findMany({
    where: { pharmacyId },
    include: { sales: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="mb-4">
        <h1 className="h4 fw-bold mb-1">{t("dash.clientsTitle")}</h1>
        <p className="text-secondary small mb-0">{t("dash.clientsSubtitle")}</p>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          {clients.length === 0 ? (
            <p className="text-secondary small mb-0">{t("dash.noClients")}</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-secondary">
                    <th>{t("common.name")}</th>
                    <th>{t("common.phone")}</th>
                    <th>{t("dash.thInvoices")}</th>
                    <th>{t("dash.thTotalSpent")}</th>
                    <th style={{ width: 120 }} />
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const total = client.sales.reduce((s, sale) => s + Number(sale.total), 0);
                    return (
                      <tr key={client.id}>
                        <td className="fw-semibold">{client.name}</td>
                        <td className="small">{client.phone || t("common.notAvailableYet")}</td>
                        <td className="small">{client.sales.length}</td>
                        <td className="fw-bold">{total.toFixed(2)}</td>
                        <td className="text-end">
                          <Link
                            href={`/dashboard/clients/${client.id}`}
                            className="btn btn-sm btn-outline-success rounded-3"
                          >
                            <i className="bi bi-clock-history me-1"></i>
                            {t("dash.history")}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}