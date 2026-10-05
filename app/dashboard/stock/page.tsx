import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminImageThumb } from "@/components/AdminImageThumb";
import { saveStock, deleteStock } from "../actions";
import { daysUntil } from "@/lib/dates";

export const dynamic = "force-dynamic";

const EXPIRY_WARNING_DAYS = 90;

export default async function DashboardStockPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const pharmacyId = user.pharmacyId;
  if (!pharmacyId) redirect("/dashboard/sem-farmacia");

  const [stocks, medications] = await Promise.all([
    prisma.pharmacyStock.findMany({
      where: { pharmacyId },
      include: { medication: true },
      orderBy: [{ quantity: "asc" }, { expiryDate: "asc" }],
    }),
    prisma.medication.findMany({
      where: { pharmacyId },
      orderBy: { name: "asc" },
    }),
  ]);

  const editingId = edit ? Number(edit) : null;
  const editing = editingId ? stocks.find((stock) => stock.id === editingId) : null;

  const available = new Set(stocks.map((stock) => stock.medicationId));
  const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Stock e disponibilidade</h1>
          <p className="text-secondary small mb-0">
            O que está com quantidade maior que zero aparece no site como disponível.
          </p>
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white mb-4">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">
            <i className={`bi ${editing ? "bi-pencil-square" : "bi-plus-circle"} me-2`}
              style={{ color: editing ? "#ea580c" : "#10b981" }}></i>
            {editing ? `Editar — ${editing.medication.name}` : "Adicionar medicamento ao stock"}
          </h2>

          <form action={saveStock} className="row g-3 align-items-end">
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <div className="col-12 col-md-4">
              <label className="form-label small fw-medium text-secondary" htmlFor="st-med">
                Medicamento
              </label>
              <select
                id="st-med"
                name="medicationId"
                className="form-select rounded-3"
                defaultValue={editing?.medicationId ?? ""}
                required
              >
                <option value="" disabled>Escolher medicamento…</option>
                {medications.map((medication) => (
                  <option key={medication.id} value={medication.id}>
                    {medication.name} — {medication.dosage}
                    {available.has(medication.id) && editing?.medicationId !== medication.id
                      ? " (já em stock)"
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-medium text-secondary" htmlFor="st-qty">
                Quantidade
              </label>
              <input
                id="st-qty"
                name="quantity"
                type="number"
                min={0}
                className="form-control rounded-3"
                defaultValue={editing?.quantity ?? 0}
                required
              />
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label small fw-medium text-secondary" htmlFor="st-expiry">
                Validade
              </label>
              <input
                id="st-expiry"
                name="expiryDate"
                type="date"
                className="form-control rounded-3"
                defaultValue={editing ? toDateInput(editing.expiryDate) : ""}
                required
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-medium text-secondary" htmlFor="st-price">
                Preço unit.
              </label>
              <input
                id="st-price"
                name="unitPrice"
                type="number"
                min={0}
                step="0.01"
                className="form-control rounded-3"
                defaultValue={editing ? Number(editing.unitPrice).toFixed(2) : "0.00"}
                required
              />
            </div>

            <div className="col-12 col-md-1">
              <label className="form-label small fw-medium text-secondary" htmlFor="st-batch">
                Lote
              </label>
              <input
                id="st-batch"
                name="batchNumber"
                type="text"
                className="form-control rounded-3"
                defaultValue={editing?.batchNumber ?? ""}
              />
            </div>

            <div className="col-12 col-md-1 d-flex gap-2">
              <button type="submit" className="btn btn-success rounded-3 px-3 py-2 w-100">
                <i className="bi bi-check-lg"></i>
              </button>
              {editing && (
                <Link
                  href="/dashboard/stock"
                  className="btn btn-outline-secondary rounded-3 px-3 py-2"
                >
                  <i className="bi bi-x-lg"></i>
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">
            <i className="bi bi-list-ul me-2" style={{ color: "#2563eb" }}></i>
            {stocks.length} registo(s)
          </h2>

          {stocks.length === 0 ? (
            <p className="text-secondary small mb-0">
              Ainda não registou stock. Use o formulário acima.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-secondary">
                    <th>Medicamento</th>
                    <th>Lote</th>
                    <th>Validade</th>
                    <th>Quantidade</th>
                    <th>Preço</th>
                    <th>Estado</th>
                    <th style={{ width: 120 }} />
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => {
                    const daysLeft = daysUntil(stock.expiryDate);
                    const expired = daysLeft <= 0;
                    const expiring = !expired && daysLeft <= EXPIRY_WARNING_DAYS;
                    const availableStock = stock.quantity > 0 && !expired;

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
                        <td className="small">{stock.batchNumber || "—"}</td>
                        <td className="small">
                          {stock.expiryDate.toLocaleDateString("pt-PT")}
                        </td>
                        <td>
                          <span className={`badge ${
                            stock.quantity > 0 ? "text-bg-success" : "text-bg-secondary"
                          }`}>
                            {stock.quantity}
                          </span>
                        </td>
                        <td className="small">{Number(stock.unitPrice).toFixed(2)}</td>
                        <td>
                          {expired ? (
                            <span className="badge text-bg-danger">Expirado</span>
                          ) : expiring ? (
                            <span className="badge text-bg-warning">{daysLeft} dias</span>
                          ) : availableStock ? (
                            <span className="badge text-bg-success">Disponível</span>
                          ) : (
                            <span className="badge text-bg-secondary">Indisponível</span>
                          )}
                        </td>
                        <td className="text-end">
                          <Link
                            href={`/dashboard/stock?edit=${stock.id}`}
                            className="btn btn-sm btn-outline-success rounded-3 me-1"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <form action={deleteStock} className="d-inline">
                            <input type="hidden" name="id" value={stock.id} />
                            <button
                              type="submit"
                              className="btn btn-sm btn-outline-danger rounded-3"
                              aria-label="Remover"
                            >
                              <i className="bi bi-trash"></i>
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
        </div>
      </div>
    </>
  );
}