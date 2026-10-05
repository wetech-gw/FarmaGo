import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { dateInDays, exactDaysUntil, now } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  // Dados reais da BD
  const [
    totalPharmacies,
    totalGuards,
    totalMedications,
    totalUsers,
    totalStock,
    expiringStock,
    recentExpenses,
    pharmaciesWithOwners,
  ] = await Promise.all([
    prisma.pharmacy.count({ where: { isGuard: false } }),
    prisma.pharmacy.count({ where: { isGuard: true  } }),
    prisma.medication.count(),
    prisma.user.count({ where: { role: "owner" } }),
    prisma.pharmacyStock.aggregate({ _sum: { quantity: true } }),
    // Stock a caducar nos próximos 90 dias
    prisma.pharmacyStock.findMany({
      where: { expiryDate: { lte: dateInDays(90) } },
      include: { pharmacy: true, medication: true },
      orderBy: { expiryDate: "asc" },
      take: 5,
    }),
    // Últimas despesas
    prisma.expense.findMany({
      include: { pharmacy: true },
      orderBy: { expenseDate: "desc" },
      take: 5,
    }),
    // Farmácias com proprietários e contagem de stock
    prisma.pharmacy.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { stocks: true } },
      },
      orderBy: { id: "asc" },
      take: 8,
    }),
  ]);

  const totalQuantidade = totalStock._sum.quantity ?? 0;

  // Farmácias registadas pelo público que ainda esperam visita presencial
  const pendingCount = await prisma.pharmacy.count({ where: { status: "pending" } });

  // Despesas totais do mês actual
  const currentDate = now();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthlyExpenses = await prisma.expense.aggregate({
    where: { expenseDate: { gte: startOfMonth } },
    _sum: { amount: true },
  });
  const totalMonthlyExpenses = Number(monthlyExpenses._sum.amount ?? 0);

  return (
    <>
      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <h1 className="fw-bold m-0 fs-2">Dashboard</h1>
          <i className="bi bi-speedometer2 text-dark fs-3"></i>
        </div>
        <div className="d-flex gap-2">
          {pendingCount > 0 && (
            <Link
              href="/admin/validations?tab=pending"
              className="btn rounded-3 px-3 py-2 fw-medium d-flex align-items-center gap-2 small text-white"
              style={{ backgroundColor: "#ea580c", borderColor: "#ea580c" }}
            >
              <i className="bi bi-patch-check small"></i>
              Validar {pendingCount} {pendingCount === 1 ? "farmácia" : "farmácias"}
            </Link>
          )}
          <Link
            href="/admin/pharmacies"
            className="btn rounded-3 px-3 py-2 fw-medium d-flex align-items-center gap-2 small text-white"
            style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5" }}
          >
            <i className="bi bi-plus-lg small"></i> Nova Farmácia
          </Link>
          <Link
            href="/admin/medications"
            className="btn rounded-3 px-3 py-2 fw-medium d-flex align-items-center gap-2 small text-white"
            style={{ backgroundColor: "#ea580c", borderColor: "#ea580c" }}
          >
            <i className="bi bi-capsule small"></i> Novo Medicamento
          </Link>
        </div>
      </div>

      {/* 4 Cards de Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: "Farmácias",         value: totalPharmacies,  sub: "Ver todas →",               href: "/admin/pharmacies",           icon: "bi-building-add",    iconBg: "#fdf2f8", iconColor: "#db2777" },
          { label: "Medicamentos",      value: totalMedications, sub: `${totalQuantidade.toLocaleString()} unid. em stock`, href: "/admin/medications", icon: "bi-capsule",         iconBg: "#e0e7ff", iconColor: "#4f46e5" },
          { label: "Plantão",           value: totalGuards,      sub: "Ver plantões →",             href: "/admin/pharmacies?type=guard", icon: "bi-clock",           iconBg: "#e0f2fe", iconColor: "#0891b2" },
          { label: "Despesas (mês)",    value: totalMonthlyExpenses.toLocaleString("pt-PT", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }), sub: "Ver despesas →", href: "/admin/expenses", icon: "bi-receipt-cutoff", iconBg: "#ffedd5", iconColor: "#ea580c" },
        ].map((card) => (
          <div key={card.label} className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 rounded-4 px-3 py-3 shadow-sm bg-white h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-secondary mb-1 fw-medium" style={{ fontSize: "0.78rem" }}>{card.label}</p>
                  <h4 className="fw-bold text-dark m-0 fs-3">{card.value}</h4>
                </div>
                <span className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "38px", height: "38px", backgroundColor: card.iconBg }}>
                  <i className={`bi ${card.icon}`} style={{ color: card.iconColor, fontSize: "1rem" }}></i>
                </span>
              </div>
              <div className="mt-2">
                <Link href={card.href} className="text-muted text-decoration-none" style={{ fontSize: "0.78rem" }}>
                  {card.sub}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de Farmácias + Stock a Caducar */}
      <div className="row g-4 mb-4">

        {/* Tabela: Farmácias com proprietário */}
        <div className="col-12 col-xl-7">
          <div className="card border-0 rounded-4 shadow-sm bg-white">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold m-0">Farmácias Registadas</h6>
              <Link href="/admin/pharmacies" className="text-primary small text-decoration-none">Ver todas</Link>
            </div>
            <div className="card-body px-0 pb-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
                  <thead className="border-bottom">
                    <tr className="text-secondary">
                      <th className="fw-medium ps-4 py-3">Farmácia</th>
                      <th className="fw-medium py-3">Proprietário</th>
                      <th className="fw-medium py-3 text-center">Stock</th>
                      <th className="fw-medium py-3 text-center">Plantão</th>
                      <th className="fw-medium py-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pharmaciesWithOwners.map((p) => (
                      <tr key={p.id}>
                        <td className="ps-4 py-3">
                          <div className="fw-semibold text-dark" style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.name}
                          </div>
                          <div className="text-muted small">{p.phone}</div>
                        </td>
                        <td className="py-3">
                          <div className="fw-medium">{p.owner.name}</div>
                          <div className="text-muted small">{p.owner.email}</div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="badge bg-light text-dark border">{p._count.stocks} itens</span>
                        </td>
                        <td className="py-3 text-center">
                          {p.isGuard
                            ? <span className="badge rounded-pill" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>Sim</span>
                            : <span className="badge rounded-pill bg-light text-secondary">Não</span>
                          }
                        </td>
                        <td className="py-3 text-center">
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
        </div>

        {/* Stock a Caducar */}
        <div className="col-12 col-xl-5">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold m-0">
                <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                Stock a Caducar (90 dias)
              </h6>
              <Link href="/admin/stock" className="text-primary small text-decoration-none">Ver tudo</Link>
            </div>
            <div className="card-body">
              {expiringStock.length === 0 ? (
                <p className="text-muted small text-center mt-4">Nenhum stock a caducar em breve.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {expiringStock.map((s) => {
                    const daysLeft = Math.ceil(
                      exactDaysUntil(s.expiryDate)
                    );
                    const isUrgent = daysLeft <= 30;
                    return (
                      <div key={s.id} className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ backgroundColor: isUrgent ? "#fff7ed" : "#f8fafc" }}>
                        <div>
                          <div className="fw-semibold text-dark small">{s.medication.name} <span className="text-muted fw-normal">{s.medication.dosage}</span></div>
                          <div className="text-muted" style={{ fontSize: "0.8rem" }}>{s.pharmacy.name}</div>
                        </div>
                        <div className="text-end">
                          <div className={`fw-bold small ${isUrgent ? "text-danger" : "text-warning"}`}>
                            {daysLeft} dias
                          </div>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {new Date(s.expiryDate).toLocaleDateString("pt-PT")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Últimas Despesas */}
      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold m-0">Últimas Despesas</h6>
          <Link href="/admin/expenses" className="text-primary small text-decoration-none">Ver todas</Link>
        </div>
        <div className="card-body px-0 pb-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
              <thead className="border-bottom">
                <tr className="text-secondary">
                  <th className="fw-medium ps-4 py-3">Título</th>
                  <th className="fw-medium py-3">Farmácia</th>
                  <th className="fw-medium py-3">Categoria</th>
                  <th className="fw-medium py-3">Data</th>
                  <th className="fw-medium py-3 text-end pe-4">Valor</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((e) => (
                  <tr key={e.id}>
                    <td className="ps-4 py-3 fw-medium">{e.title}</td>
                    <td className="py-3 text-muted">{e.pharmacy.name}</td>
                    <td className="py-3">
                      <span className="badge rounded-pill bg-light text-secondary border text-capitalize">{e.category}</span>
                    </td>
                    <td className="py-3 text-muted">{new Date(e.expenseDate).toLocaleDateString("pt-PT")}</td>
                    <td className="py-3 text-end pe-4 fw-semibold">
                      {Number(e.amount).toLocaleString("pt-PT", { style: "currency", currency: "XOF", maximumFractionDigits: 0 })}
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
