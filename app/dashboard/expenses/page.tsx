import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveExpense, deleteExpense } from "../actions";

export const dynamic = "force-dynamic";

const categories = [
  { value: "infraestrutura", label: "Infraestrutura" },
  { value: "pessoal",         label: "Pessoal" },
  { value: "stock",           label: "Stock" },
  { value: "outros",          label: "Outros" },
];

export default async function DashboardExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const pharmacyId = user.pharmacyId;
  if (!pharmacyId) redirect("/dashboard/sem-farmacia");

  const expenses = await prisma.expense.findMany({
    where: { pharmacyId },
    orderBy: { expenseDate: "desc" },
  });

  const editingId = edit ? Number(edit) : null;
  const editing = editingId ? expenses.find((expense) => expense.id === editingId) : null;
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <>
      <div className="mb-4">
        <h1 className="h4 fw-bold mb-1">Despesas</h1>
        <p className="text-secondary small mb-0">
          Custos da farmácia. Total registado: <strong>{total.toFixed(2)}</strong>
        </p>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white mb-4">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">
            <i className={`bi ${editing ? "bi-pencil-square" : "bi-plus-circle"} me-2`}
              style={{ color: editing ? "#ea580c" : "#10b981" }}></i>
            {editing ? `Editar — ${editing.title}` : "Nova despesa"}
          </h2>

          <form action={saveExpense} className="row g-3 align-items-end">
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <div className="col-12 col-md-4">
              <label className="form-label small fw-medium text-secondary" htmlFor="ex-title">
                Descrição
              </label>
              <input
                id="ex-title"
                name="title"
                type="text"
                className="form-control rounded-3"
                defaultValue={editing?.title ?? ""}
                required
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-medium text-secondary" htmlFor="ex-cat">
                Categoria
              </label>
              <select
                id="ex-cat"
                name="category"
                className="form-select rounded-3"
                defaultValue={editing?.category ?? "outros"}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-medium text-secondary" htmlFor="ex-amount">
                Valor
              </label>
              <input
                id="ex-amount"
                name="amount"
                type="text"
                inputMode="decimal"
                className="form-control rounded-3"
                defaultValue={editing ? Number(editing.amount).toFixed(2) : ""}
                required
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-medium text-secondary" htmlFor="ex-date">
                Data
              </label>
              <input
                id="ex-date"
                name="expenseDate"
                type="date"
                className="form-control rounded-3"
                defaultValue={
                  editing ? editing.expenseDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
                }
                required
              />
            </div>

            <div className="col-6 col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-success rounded-3 px-3 py-2 w-100">
                <i className="bi bi-check-lg"></i>
              </button>
              {editing && (
                <Link
                  href="/dashboard/expenses"
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
          {expenses.length === 0 ? (
            <p className="text-secondary small mb-0">Sem despesas registadas.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-secondary">
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Data</th>
                    <th className="text-end">Valor</th>
                    <th style={{ width: 120 }} />
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="fw-semibold">{expense.title}</td>
                      <td className="small text-secondary">{expense.category}</td>
                      <td className="small">
                        {expense.expenseDate.toLocaleDateString("pt-PT")}
                      </td>
                      <td className="text-end fw-bold">
                        {Number(expense.amount).toFixed(2)}
                      </td>
                      <td className="text-end">
                        <Link
                          href={`/dashboard/expenses?edit=${expense.id}`}
                          className="btn btn-sm btn-outline-success rounded-3 me-1"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <form action={deleteExpense} className="d-inline">
                          <input type="hidden" name="id" value={expense.id} />
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