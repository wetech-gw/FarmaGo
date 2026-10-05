import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteSale } from "./actions";

export const dynamic = "force-dynamic";

export default async function DashboardSalesPage() {
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
          <h1 className="h4 fw-bold mb-1">Vendas</h1>
          <p className="text-secondary small mb-0">Todas as vendas registadas na sua farmácia.</p>
        </div>
        <Link href="/dashboard/sales/new" className="btn btn-success rounded-3">
          <i className="bi bi-plus-lg me-1"></i>Nova venda
        </Link>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          {sales.length === 0 ? (
            <p className="text-secondary small mb-0">Ainda não registou vendas.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-secondary">
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Artigos</th>
                    <th>Total</th>
                    <th style={{ width: 140 }} />
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="small">#{sale.id}</td>
                      <td className="fw-semibold">{sale.client.name}</td>
                      <td className="small">{sale.createdAt.toLocaleString("pt-PT")}</td>
                      <td className="small">{sale.items.length}</td>
                      <td className="fw-bold">{Number(sale.total).toFixed(2)}</td>
                      <td className="text-end">
                        <Link
                          href={`/dashboard/sales/${sale.id}`}
                          className="btn btn-sm btn-outline-success rounded-3 me-1"
                        >
                          <i className="bi bi-receipt"></i>
                        </Link>
                        <form action={deleteSale} className="d-inline">
                          <input type="hidden" name="id" value={sale.id} />
                          <button type="submit" className="btn btn-sm btn-outline-danger rounded-3" aria-label="Remover">
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
