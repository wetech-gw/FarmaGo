import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const client = await prisma.client.findFirst({
    where: { id: Number(id), pharmacyId: user.pharmacyId ?? -1 },
    include: {
      sales: {
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) notFound();

  const total = client.sales.reduce((s, sale) => s + Number(sale.total), 0);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">{client.name}</h1>
          <p className="text-secondary small mb-0">
            {client.phone || "Sem telefone"}
            {client.email ? ` · ${client.email}` : ""}
          </p>
        </div>
        <Link href="/dashboard/clients" className="btn btn-outline-secondary rounded-3">
          <i className="bi bi-arrow-left me-1"></i>Voltar
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
            <div className="card-body">
              <div className="small text-secondary">Facturas</div>
              <div className="fs-3 fw-bold">{client.sales.length}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
            <div className="card-body">
              <div className="small text-secondary">Total gasto</div>
              <div className="fs-3 fw-bold">{total.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">
            <i className="bi bi-receipt me-2" style={{ color: "#7c3aed" }}></i>
            Histórico de facturas
          </h2>

          {client.sales.length === 0 ? (
            <p className="text-secondary small mb-0">Sem compras registadas.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-secondary">
                    <th>Factura</th>
                    <th>Data</th>
                    <th>Artigos</th>
                    <th>Total</th>
                    <th style={{ width: 80 }} />
                  </tr>
                </thead>
                <tbody>
                  {client.sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="small">#{sale.id}</td>
                      <td className="small">{sale.createdAt.toLocaleString("pt-PT")}</td>
                      <td className="small">{sale.items.length}</td>
                      <td className="fw-bold">{Number(sale.total).toFixed(2)}</td>
                      <td className="text-end">
                        <Link
                          href={`/dashboard/sales/${sale.id}`}
                          className="btn btn-sm btn-outline-success rounded-3"
                        >
                          <i className="bi bi-receipt"></i>
                        </Link>
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
