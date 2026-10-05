import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { daysUntil } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ pharmacy?: string }>;
}) {
  await requireAdmin();

  const { pharmacy } = await searchParams;
  const pharmacyId = pharmacy ? parseInt(pharmacy) : undefined;

  const [stocks, pharmacies] = await Promise.all([
    prisma.pharmacyStock.findMany({
      where: pharmacyId ? { pharmacyId } : {},
      include: {
        pharmacy:   { select: { name: true } },
        medication: { select: { name: true, dosage: true } },
      },
      orderBy: { expiryDate: "asc" },
    }),
    prisma.pharmacy.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const hasUrgent = stocks.some((s) => {
    const days = daysUntil(s.expiryDate);
    return days >= 0 && days <= 30;
  });

  const totalByPharmacy = pharmacies.map((p) => {
    const items = stocks.filter((s) => s.pharmacyId === p.id);
    return {
      id:    p.id,
      name:  p.name,
      total: items.reduce((sum, s) => sum + s.quantity, 0),
      count: items.length,
    };
  }).filter((p) => p.count > 0);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 fs-2">Inventário / pharmacy_stocks</h1>
          <p className="text-muted small m-0">{stocks.length} entradas · {stocks.reduce((s, e) => s + e.quantity, 0).toLocaleString()} unidades total</p>
        </div>
      </div>

      {hasUrgent && (
        <div className="alert border-0 rounded-3 mb-4 d-flex align-items-center gap-3"
          style={{ backgroundColor: "#fff7ed", color: "#9a3412" }}>
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <span className="fw-medium small">Atenção: existem medicamentos a caducar em menos de 30 dias.</span>
        </div>
      )}

      {totalByPharmacy.length > 0 && (
        <div className="d-flex gap-3 mb-4 flex-wrap">
          {totalByPharmacy.map((p) => (
            <a key={p.id} href={`/admin/stock?pharmacy=${p.id}`}
              className={`card border-0 rounded-3 p-3 text-decoration-none shadow-sm ${pharmacyId === p.id ? "border border-dark" : ""}`}
              style={{ minWidth: "160px", backgroundColor: pharmacyId === p.id ? "#f0fdf4" : "#fff" }}>
              <div className="fw-semibold text-dark small"
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
                {p.name}
              </div>
              <div className="text-muted" style={{ fontSize: "0.78rem" }}>{p.count} itens · {p.total} unidades</div>
            </a>
          ))}
          {pharmacyId && (
            <a href="/admin/stock"
              className="btn btn-sm btn-outline-secondary rounded-3 align-self-center px-3">
              Ver tudo
            </a>
          )}
        </div>
      )}

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold m-0">
            {pharmacyId
              ? `Stock — ${pharmacies.find((p) => p.id === pharmacyId)?.name}`
              : "Todas as Entradas de Stock"}
          </h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
            <thead className="border-bottom">
              <tr className="text-secondary">
                <th className="fw-medium ps-4 py-3">Farmácia</th>
                <th className="fw-medium py-3">Medicamento</th>
                <th className="fw-medium py-3 text-center">Qtd.</th>
                <th className="fw-medium py-3">Lote</th>
                <th className="fw-medium py-3">Validade</th>
                <th className="fw-medium py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5 text-muted">Nenhum stock encontrado.</td></tr>
              ) : stocks.map((s) => {
                const daysLeft  = daysUntil(s.expiryDate);
                const isExpired = daysLeft < 0;
                const isUrgent  = !isExpired && daysLeft <= 30;
                const isWarning = !isExpired && daysLeft <= 90 && daysLeft > 30;

                return (
                  <tr key={s.id}>
                    <td className="ps-4 py-3 fw-medium text-dark"
                      style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.pharmacy.name}
                    </td>
                    <td className="py-3 fw-semibold">
                      {s.medication.name}
                      <span className="text-muted fw-normal ms-1 small">{s.medication.dosage}</span>
                    </td>
                    <td className="py-3 text-center fw-bold">{s.quantity}</td>
                    <td className="py-3 text-muted">{s.batchNumber ?? "—"}</td>
                    <td className="py-3 text-muted">{new Date(s.expiryDate).toLocaleDateString("pt-PT")}</td>
                    <td className="py-3 text-center">
                      {isExpired
                        ? <span className="badge rounded-pill" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>Caducado</span>
                        : isUrgent
                        ? <span className="badge rounded-pill" style={{ backgroundColor: "#ffedd5", color: "#ea580c" }}>{daysLeft}d</span>
                        : isWarning
                        ? <span className="badge rounded-pill" style={{ backgroundColor: "#fef9c3", color: "#a16207" }}>{daysLeft}d</span>
                        : <span className="badge rounded-pill" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {stocks.length > 0 && (
              <tfoot className="border-top">
                <tr>
                  <td colSpan={2} className="ps-4 py-3 text-muted small fw-medium">Total</td>
                  <td className="py-3 text-center fw-bold">
                    {stocks.reduce((sum, s) => sum + s.quantity, 0).toLocaleString()}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}
