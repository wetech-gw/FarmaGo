import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SaleInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  if (!sale) notFound();

  return (
    <div className="card border-0 rounded-4 shadow-sm bg-white">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 className="h4 fw-bold mb-1">Factura #{sale.id}</h1>
            <p className="text-secondary small mb-0">
              {sale.createdAt.toLocaleString("pt-PT")}
            </p>
          </div>
          <div className="text-end">
            <div className="fw-bold">{sale.pharmacy.name}</div>
            <div className="small text-secondary">{sale.pharmacy.phone}</div>
            <div className="small text-secondary">{sale.pharmacy.address}</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="small text-secondary text-uppercase fw-semibold">Cliente</div>
          <div className="fw-semibold">{sale.client.name}</div>
          {sale.client.phone && <div className="small text-secondary">{sale.client.phone}</div>}
          {sale.client.email && <div className="small text-secondary">{sale.client.email}</div>}
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr className="small text-secondary">
                <th>Medicamento</th>
                <th>Qtd</th>
                <th>Preço un.</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.medication.name}{" "}
                    <span className="small text-secondary">— {item.medication.dosage}</span>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{Number(item.unitPrice).toFixed(2)}</td>
                  <td className="text-end">{Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-end fw-bold">Total</td>
                <td className="text-end fw-bold">{Number(sale.total).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="d-flex gap-2 mt-3">
          <Link href="/dashboard/sales" className="btn btn-outline-secondary rounded-3">
            <i className="bi bi-arrow-left me-1"></i>Voltar
          </Link>
          <Link href={`/dashboard/clients/${sale.clientId}`} className="btn btn-outline-success rounded-3">
            <i className="bi bi-person me-1"></i>Histórico do cliente
          </Link>
        </div>
      </div>
    </div>
  );
}
