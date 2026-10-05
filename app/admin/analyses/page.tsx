import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { dateInDays, daysUntil } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function AdminAnalysesPage() {
  await requireAdmin();

  // Despesas agrupadas por mês e categoria (equivale ao SELECT no teu SQL)
  const expenses = await prisma.expense.findMany({
    include: { pharmacy: { select: { name: true } } },
    orderBy: { expenseDate: "desc" },
  });

  // Agrupar por mês
  const byMonth: Record<string, { total: number; byCategory: Record<string, number> }> = {};
  for (const e of expenses) {
    const mes = new Date(e.expenseDate).toLocaleDateString("pt-PT", { year: "numeric", month: "long" });
    if (!byMonth[mes]) byMonth[mes] = { total: 0, byCategory: {} };
    byMonth[mes].total += Number(e.amount);
    byMonth[mes].byCategory[e.category] = (byMonth[mes].byCategory[e.category] ?? 0) + Number(e.amount);
  }

  // Stock a caducar (equivale ao segundo SELECT do teu SQL)
  const ninetyDays = dateInDays(90);
  const expiringStock = await prisma.pharmacyStock.findMany({
    where: { expiryDate: { lte: ninetyDays } },
    include: {
      pharmacy:   { select: { name: true } },
      medication: { select: { name: true, dosage: true } },
    },
    orderBy: { expiryDate: "asc" },
  });

  // Top farmácias por stock (equivale ao quarto SELECT do teu SQL)
  const pharmacyStats = await prisma.pharmacy.findMany({
    include: {
      owner:  { select: { name: true, email: true } },
      _count: { select: { stocks: true } },
    },
    orderBy: { id: "asc" },
  });

  // Totais gerais
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalStock    = await prisma.pharmacyStock.aggregate({ _sum: { quantity: true } });
  const totalQty      = totalStock._sum.quantity ?? 0;

  const categoryColors: Record<string, string> = {
    infraestrutura: "#3730a3",
    pessoal:        "#9d174d",
    stock:          "#15803d",
    outros:         "#374151",
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="fw-bold m-0 fs-2">Analyses</h1>
        <p className="text-muted small m-0">Resumo financeiro e operacional</p>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-xl-3">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white text-center">
            <p className="text-secondary small fw-medium mb-1">Total Despesas</p>
            <h4 className="fw-bold text-dark m-0">
              {totalExpenses.toLocaleString("pt-PT", { style: "currency", currency: "XOF", maximumFractionDigits: 0 })}
            </h4>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white text-center">
            <p className="text-secondary small fw-medium mb-1">Unidades em Stock</p>
            <h4 className="fw-bold text-dark m-0">{totalQty.toLocaleString()}</h4>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white text-center">
            <p className="text-secondary small fw-medium mb-1">A Caducar (90d)</p>
            <h4 className="fw-bold m-0" style={{ color: "#ea580c" }}>{expiringStock.length}</h4>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white text-center">
            <p className="text-secondary small fw-medium mb-1">Farmácias Ativas</p>
            <h4 className="fw-bold text-dark m-0">{pharmacyStats.filter((p) => p.isOpen).length}</h4>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Despesas por mês */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h6 className="fw-bold m-0">Despesas por Mês</h6>
            </div>
            <div className="card-body">
              {Object.entries(byMonth).length === 0 ? (
                <p className="text-muted small text-center mt-4">Sem despesas registadas.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {Object.entries(byMonth).map(([mes, data]) => (
                    <div key={mes}>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-semibold text-dark small text-capitalize">{mes}</span>
                        <span className="fw-bold small">
                          {data.total.toLocaleString("pt-PT", { style: "currency", currency: "XOF", maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      {/* Barras por categoria */}
                      <div className="d-flex gap-1" style={{ height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                        {Object.entries(data.byCategory).map(([cat, val]) => (
                          <div
                            key={cat}
                            title={`${cat}: ${val.toLocaleString()} XOF`}
                            style={{
                              width: `${(val / data.total) * 100}%`,
                              backgroundColor: categoryColors[cat] ?? "#94a3b8",
                              borderRadius: "2px",
                            }}
                          />
                        ))}
                      </div>
                      {/* Legenda */}
                      <div className="d-flex gap-3 mt-2 flex-wrap">
                        {Object.entries(data.byCategory).map(([cat, val]) => (
                          <span key={cat} className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "0.75rem" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: categoryColors[cat] ?? "#94a3b8", display: "inline-block" }}></span>
                            <span className="text-capitalize">{cat}</span>
                            <span className="fw-semibold text-dark">{val.toLocaleString("pt-PT", { style: "currency", currency: "XOF", maximumFractionDigits: 0 })}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock a caducar */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h6 className="fw-bold m-0">
                <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                Stock a Caducar (próximos 90 dias)
              </h6>
            </div>
            <div className="card-body">
              {expiringStock.length === 0 ? (
                <p className="text-muted small text-center mt-4">Nenhum stock a caducar em breve. ✅</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm mb-0" style={{ fontSize: "0.85rem" }}>
                    <thead className="border-bottom">
                      <tr className="text-secondary">
                        <th className="fw-medium py-2">Farmácia</th>
                        <th className="fw-medium py-2">Medicamento</th>
                        <th className="fw-medium py-2 text-center">Dias</th>
                        <th className="fw-medium py-2">Validade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiringStock.map((s) => {
                        const daysLeft = daysUntil(s.expiryDate);
                        const isUrgent = daysLeft <= 30;
                        return (
                          <tr key={s.id}>
                            <td className="py-2 text-dark fw-medium"
                              style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {s.pharmacy.name}
                            </td>
                            <td className="py-2">{s.medication.name} <span className="text-muted">{s.medication.dosage}</span></td>
                            <td className="py-2 text-center">
                              <span className="fw-bold small" style={{ color: isUrgent ? "#dc2626" : "#a16207" }}>
                                {daysLeft}
                              </span>
                            </td>
                            <td className="py-2 text-muted">{new Date(s.expiryDate).toLocaleDateString("pt-PT")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ranking de farmácias por stock */}
      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-header bg-white border-0 pt-4 px-4">
          <h6 className="fw-bold m-0">Farmácias — Stock & Proprietário</h6>
        </div>
        <div className="card-body px-0 pb-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
              <thead className="border-bottom">
                <tr className="text-secondary">
                  <th className="fw-medium ps-4 py-3">Farmácia</th>
                  <th className="fw-medium py-3">Proprietário</th>
                  <th className="fw-medium py-3">Email</th>
                  <th className="fw-medium py-3 text-center">Produtos em Stock</th>
                  <th className="fw-medium py-3 text-center pe-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pharmacyStats.map((p) => (
                  <tr key={p.id}>
                    <td className="ps-4 py-3 fw-semibold text-dark">{p.name}</td>
                    <td className="py-3">{p.owner.name}</td>
                    <td className="py-3 text-muted">{p.owner.email}</td>
                    <td className="py-3 text-center">
                      <span className="badge bg-light text-dark border">{p._count.stocks}</span>
                    </td>
                    <td className="py-3 text-center pe-4">
                      {p.isOpen
                        ? <span className="badge rounded-pill" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>Aberta</span>
                        : <span className="badge rounded-pill" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>Fechada</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
