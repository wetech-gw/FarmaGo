import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PrintButton from "@/components/PrintButton";
import { formatDateTime, getI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function SaleInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale, t } = await getI18n();
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const sale = await prisma.sale.findFirst({
    where: { id: Number(id), pharmacyId: user.pharmacyId ?? -1 },
    include: {
      client: true,
      pharmacy: true,
      items: { include: { medication: true } },
    },
  });

  if (!sale) redirect("/dashboard/sales");

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-xl-9">
        <div className="card border-0 rounded-4 shadow bg-white overflow-hidden">
          <div
            className="px-4 px-md-5 py-4 text-white d-flex flex-wrap justify-content-between align-items-center gap-3"
            style={{ background: "linear-gradient(120deg, #0f8a0e 0%, #15b312 55%, #0d6b0c 100%)" }}
          >
            <div className="d-flex align-items-center gap-3">
              <img src="/images/Logo.png" alt="FarmaGo" style={{ height: "44px", width: "auto", filter: "brightness(0) invert(1)" }} />
              <div>
                <h1 className="h5 fw-bold mb-0">{t("invoice.title", { id: sale.id })}</h1>
                <div className="small" style={{ color: "rgba(255,255,255,0.8)" }}>
                  {formatDateTime(locale, sale.createdAt)}
                </div>
              </div>
            </div>
            <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <i className="bi bi-check2-circle me-1"></i>
              {t("invoice.paid")}
            </span>
          </div>

          <div className="card-body p-4 p-md-5">
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="small text-uppercase fw-semibold text-secondary mb-2" style={{ letterSpacing: "0.06em", fontSize: "0.7rem" }}>
                  {t("invoice.pharmacy")}
                </div>
                <div className="fw-bold text-dark">{sale.pharmacy.name}</div>
                <div className="small text-secondary">{sale.pharmacy.phone}</div>
                <div className="small text-secondary">{sale.pharmacy.address}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-uppercase fw-semibold text-secondary mb-2" style={{ letterSpacing: "0.06em", fontSize: "0.7rem" }}>
                  {t("invoice.client")}
                </div>
                <div className="fw-bold text-dark">{sale.client.name}</div>
                {sale.client.phone && <div className="small text-secondary">{sale.client.phone}</div>}
                {sale.client.email && <div className="small text-secondary">{sale.client.email}</div>}
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-secondary" style={{ fontSize: "0.8rem" }}>
                    <th className="border-0 pb-3">{t("common.medication")}</th>
                    <th className="border-0 pb-3 text-center">{t("invoice.thQty")}</th>
                    <th className="border-0 pb-3 text-end">{t("invoice.thUnitPrice")}</th>
                    <th className="border-0 pb-3 text-end">{t("invoice.thSubtotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <div className="fw-semibold">{item.medication.name}</div>
                        <div className="small text-secondary">{item.medication.dosage}</div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="badge bg-light text-dark border">{item.quantity}</span>
                      </td>
                      <td className="py-3 text-end">{Number(item.unitPrice).toFixed(2)}</td>
                      <td className="py-3 text-end fw-semibold">{Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end mt-3">
              <div
                className="rounded-4 px-4 py-3 d-flex align-items-center gap-4"
                style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
              >
                <span className="text-secondary fw-medium">{t("common.total")}</span>
                <span className="fs-3 fw-bold" style={{ color: "#15803d" }}>
                  {Number(sale.total).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
              <Link href="/dashboard/sales" className="btn btn-outline-secondary rounded-3">
                <i className="bi bi-arrow-left me-1"></i>
                {t("common.back")}
              </Link>
              <Link href={`/dashboard/clients/${sale.clientId}`} className="btn btn-outline-success rounded-3">
                <i className="bi bi-person me-1"></i>
                {t("invoice.clientHistory")}
              </Link>
              <PrintButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}