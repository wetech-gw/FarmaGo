import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardClientsPage() {
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
        <h1 className="h4 fw-bold mb-1">Clientes</h1>
        <p className="text-secondary small mb-0">Histórico de compras e facturas por cliente.</p>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          {clients.length === 0 ? (
            <p className="text-secondary small mb-0">Ainda não tem clientes registados.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-secondary">
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Facturas</th>
                    <th>Total gasto</th>
                    <th style={{ width: 120 }} />
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const total = client.sales.reduce((s, sale) => s + Number(sale.total), 0);
                    return (
                      <tr key={client.id}>
                        <td className="fw-semibold">{client.name}</td>
                        <td className="small">{client.phone || "—"}</td>
                        <td className="small">{client.sales.length}</td>
                        <td className="fw-bold">{total.toFixed(2)}</td>
                        <td className="text-end">
                          <Link
                            href={`/dashboard/clients/${client.id}`}
                            className="btn btn-sm btn-outline-success rounded-3"
                          >
                            <i className="bi bi-clock-history me-1"></i>Histórico
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
