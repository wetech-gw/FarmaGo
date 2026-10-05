import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { togglePharmacyOpen, updateStockQuantity } from "./actions";
import { AdminImageThumb } from "@/components/AdminImageThumb";
import { nowMs } from "@/lib/dates";

export const dynamic = "force-dynamic";

const EXPIRY_WARNING_DAYS = 90;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const pharmacyId = user.pharmacyId;
  if (!pharmacyId) redirect("/dashboard/sem-farmacia");

  const pharmacy = await prisma.pharmacy.findUnique({
    where: { id: pharmacyId },
    include: {
      stocks: {
        include: { medication: true },
        orderBy: { createdAt: "desc" },
      },
      expenses: { orderBy: { expenseDate: "desc" }, take: 5 },
    },
  });

  if (!pharmacy) redirect("/dashboard/sem-farmacia");

  const now = nowMs();
  const warningMs = EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000;

  const inStock = pharmacy.stocks.filter((stock) => stock.quantity > 0);
  const outOfStock = pharmacy.stocks.filter((stock) => stock.quantity <= 0);
  const expiringSoon = inStock.filter(
    (stock) => stock.expiryDate.getTime() - now <= warningMs,
  );
  const totalUnits = inStock.reduce((sum, stock) => sum + stock.quantity, 0);
  const distinctMedications = new Set(pharmacy.stocks.map((stock) => stock.medicationId)).size;
  const expensesTotal = pharmacy.expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  const statusBanner = pharmacy.status === "approved" ? null : (
    <div
      className={`alert rounded-4 d-flex flex-column flex-md-row align-items-md-center gap-3 ${
        pharmacy.status === "pending" ? "alert-warning" : "alert-danger"
      }`}
    >
      <i
        className={`bi ${
          pharmacy.status === "pending" ? "bi-hourglass-split" : "bi-x-octagon"
        } fs-3`}
      ></i>
      <div className="flex-grow-1">
        <div className="fw-bold">
          {pharmacy.status === "pending"
            ? "Farmácia em validação"
            : "Farmácia rejeitada"}
        </div>
        <div className="small">
          {pharmacy.status === "pending"
            ? "A nossa equipa vai visitar a farmácia para confirmar os dados. Só depois disso a farmácia aparece no site público."
            : pharmacy.rejectionReason ||
              "A equipa não conseguiu validar os dados. Contacte-nos para mais informação."}
        </div>
      </div>
    </div>
  );

  const kpis = [
    { label: "Medicamentos", value: distinctMedications, icon: "bi-capsule",      color: "#0f8a0e" },
    { label: "Unidades em stock", value: totalUnits,  icon: "bi-box-seam",      color: "#2563eb" },
    { label: "A caducar (90 dias)", value: expiringSoon.length, icon: "bi-hourglass-bottom", color: "#ea580c" },
    { label: "Despesas registadas", value: expensesTotal.toFixed(0), icon: "bi-receipt", color: "#7c3aed" },
  ];

  return (
    <>
      {registered === "1" && (
        <div className="alert alert-success rounded-4 d-flex align-items-center gap-3">
          <i className="bi bi-check2-circle fs-4"></i>
          <div>
            <div className="fw-bold">Conta criada com sucesso</div>
            <div className="small">
              A sua farmácia foi registada e está <strong>em validação</strong>. Avisamos
              assim que a visita for concluída.
            </div>
          </div>
        </div>
      )}

      {statusBanner}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Olá, {user.name.split(" ")[0]}</h1>
          <p className="text-secondary small mb-0">
            {registered === "1" ? "Comece por confirmar os dados da farmácia." : "Aqui tem o resumo da sua farmácia."}
          </p>
        </div>

        {/* Estado ABERTO / FECHADA */}
        <form action={togglePharmacyOpen} className="d-flex align-items-center gap-3">
          <input type="hidden" name="id" value={pharmacy.id} />
          <input type="hidden" name="isOpen" value={pharmacy.isOpen ? "0" : "1"} />

          <div className="text-end">
            <div className="small text-secondary">Estado da farmácia</div>
            <div className="fw-bold fs-5">
              {pharmacy.isOpen ? (
                <span className="text-success">
                  <i className="bi bi-unlock me-1"></i>ABERTA
                </span>
              ) : (
                <span className="text-secondary">
                  <i className="bi bi-lock me-1"></i>FECHADA
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={`btn rounded-3 px-4 py-2 fw-semibold text-white ${
              pharmacy.isOpen ? "btn-secondary" : "btn-success"
            }`}
          >
            <i className={`bi ${pharmacy.isOpen ? "bi-toggle-off" : "bi-toggle-on"} me-2`}></i>
            {pharmacy.isOpen ? "Marcar como fechada" : "Marcar como aberta"}
          </button>
        </form>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-4">
        {kpis.map((kpi) => (
          <div className="col-6 col-xl-3" key={kpi.label}>
            <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small text-secondary">{kpi.label}</span>
                  <i className={`bi ${kpi.icon} fs-5`} style={{ color: kpi.color }}></i>
                </div>
                <div className="fs-3 fw-bold">{kpi.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Stock */}
        <div className="col-12 col-xl-7">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h6 fw-bold mb-0">
                  <i className="bi bi-box-seam me-2" style={{ color: "#2563eb" }}></i>
                  Disponibilidade de stock
                </h2>
                <Link
                  href="/dashboard/stock"
                  className="btn btn-sm btn-outline-success rounded-3"
                >
                  Gerir stock
                </Link>
              </div>

              {inStock.length === 0 ? (
                <p className="text-secondary small mb-0">
                  Sem stock registado.{" "}
                  <Link href="/dashboard/stock" className="text-decoration-none">
                    Adicionar medicamentos
                  </Link>
                  .
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr className="small text-secondary">
                        <th>Medicamento</th>
                        <th>Validade</th>
                        <th style={{ width: 190 }}>Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inStock.slice(0, 8).map((stock) => {
                        const daysLeft = Math.ceil(
                          (stock.expiryDate.getTime() - now) / (24 * 60 * 60 * 1000),
                        );
                        const expiring = daysLeft <= EXPIRY_WARNING_DAYS;

                        return (
                          <tr key={stock.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <AdminImageThumb
                                  src={stock.medication.image}
                                  alt={stock.medication.name}
                                  size={32}
                                />
                                <div>
                                  <div className="fw-semibold">{stock.medication.name}</div>
                                  <div className="small text-secondary">
                                    {stock.medication.dosage}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${expiring ? "text-bg-warning" : "text-bg-light"}`}>
                                {daysLeft <= 0
                                  ? "Expirado"
                                  : `${daysLeft} dias`}
                              </span>
                              <div className="small text-secondary">
                                {stock.expiryDate.toLocaleDateString("pt-PT")}
                              </div>
                            </td>
                            <td>
                              <form action={updateStockQuantity} className="d-flex gap-2">
                                <input type="hidden" name="id" value={stock.id} />
                                <input
                                  type="number"
                                  name="quantity"
                                  defaultValue={stock.quantity}
                                  min={0}
                                  className="form-control form-control-sm rounded-3"
                                  style={{ width: 80 }}
                                  aria-label={`Quantidade de ${stock.medication.name}`}
                                />
                                <button
                                  type="submit"
                                  className="btn btn-sm btn-outline-success rounded-3"
                                >
                                  <i className="bi bi-check-lg"></i>
                                </button>
                              </form>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {outOfStock.length > 0 && (
                <p className="small text-secondary mb-0 mt-3">
                  <i className="bi bi-exclamation-circle me-1 text-danger"></i>
                  {outOfStock.length} medicamento(s) com quantidade zero — não aparecem no
                  site público.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dados + despesas */}
        <div className="col-12 col-xl-5">
          <div className="card border-0 rounded-4 shadow-sm bg-white mb-3">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">
                <i className="bi bi-shop me-2" style={{ color: "#0f8a0e" }}></i>
                Dados da farmácia
              </h2>

              <dl className="row mb-0 small">
                <dt className="col-5 text-secondary fw-medium">Nome</dt>
                <dd className="col-7">{pharmacy.name}</dd>

                <dt className="col-5 text-secondary fw-medium">Telefone</dt>
                <dd className="col-7">{pharmacy.phone}</dd>

                <dt className="col-5 text-secondary fw-medium">Horário</dt>
                <dd className="col-7">
                  {pharmacy.schedule}
                  <span className="text-secondary"> · {pharmacy.hours}</span>
                </dd>

                <dt className="col-5 text-secondary fw-medium">Morada</dt>
                <dd className="col-7">{pharmacy.address}</dd>

                <dt className="col-5 text-secondary fw-medium">Coordenadas</dt>
                <dd className="col-7">
                  {pharmacy.latitude !== null && pharmacy.longitude !== null
                    ? `${pharmacy.latitude.toFixed(4)}, ${pharmacy.longitude.toFixed(4)}`
                    : <span className="text-danger small">Por definir</span>}
                </dd>
              </dl>

              <Link
                href="/dashboard/pharmacy"
                className="btn btn-sm btn-outline-success rounded-3 mt-3"
              >
                <i className="bi bi-pencil me-1"></i>
                Editar dados
              </Link>
            </div>
          </div>

          <div className="card border-0 rounded-4 shadow-sm bg-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h6 fw-bold mb-0">
                  <i className="bi bi-receipt me-2" style={{ color: "#7c3aed" }}></i>
                  Últimas despesas
                </h2>
                <Link
                  href="/dashboard/expenses"
                  className="btn btn-sm btn-outline-success rounded-3"
                >
                  Ver todas
                </Link>
              </div>

              {pharmacy.expenses.length === 0 ? (
                <p className="text-secondary small mb-0">Sem despesas registadas.</p>
              ) : (
                <ul className="list-unstyled mb-0 small">
                  {pharmacy.expenses.map((expense) => (
                    <li
                      key={expense.id}
                      className="d-flex justify-content-between align-items-center py-2 border-bottom"
                    >
                      <div>
                        <div className="fw-semibold">{expense.title}</div>
                        <div className="text-secondary">
                          {expense.category} ·{" "}
                          {expense.expenseDate.toLocaleDateString("pt-PT")}
                        </div>
                      </div>
                      <span className="fw-bold">
                        {Number(expense.amount).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}