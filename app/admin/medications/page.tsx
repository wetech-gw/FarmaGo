import { prisma } from "@/lib/prisma";
import { AdminImageThumb } from "@/components/AdminImageThumb";
import { requireAdmin } from "@/lib/auth";
import { createMedication } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMedicationsPage() {
  await requireAdmin();

  const medications = await prisma.medication.findMany({
    include: { _count: { select: { stocks: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 fs-2">Medicamentos</h1>
          <p className="text-muted small m-0">{medications.length} medicamentos no catálogo</p>
        </div>
      </div>

      <form action={createMedication} className="card border-0 rounded-4 shadow-sm bg-white p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Nome</label>
            <input name="name" type="text" className="form-control" required />
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-semibold">Dosagem</label>
            <input name="dosage" type="text" className="form-control" required />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Imagem (upload)</label>
            <input name="imageFile" type="file" className="form-control" accept="image/*" />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-semibold">URL da imagem</label>
            <input name="imageUrl" type="text" className="form-control" placeholder="/images/medications/..." />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold">Descrição</label>
            <textarea name="description" className="form-control" rows={3} />
          </div>
          <div className="col-auto d-flex align-items-center">
            <div className="form-check">
              <input name="needsPrescription" type="checkbox" className="form-check-input" id="needsPrescription" />
              <label className="form-check-label small" htmlFor="needsPrescription">Vendido apenas com receita médica</label>
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-success mt-3">Adicionar medicamento</button>
      </form>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
            <thead className="border-bottom">
              <tr className="text-secondary">
                <th className="fw-medium ps-4 py-3">#</th>
                <th className="fw-medium py-3">Imagem</th>
                <th className="fw-medium py-3">Nome</th>
                <th className="fw-medium py-3">Dosagem</th>
                <th className="fw-medium py-3 text-center">Em Farmácias</th>
                <th className="fw-medium py-3">Registado em</th>
              </tr>
            </thead>
            <tbody>
              {medications.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5 text-muted">Nenhum medicamento no catálogo.</td></tr>
              ) : medications.map((m) => (
                <tr key={m.id}>
                  <td className="ps-4 py-3 text-muted">{m.id}</td>
                  <td className="py-3">
                    <AdminImageThumb src={m.image} alt={m.name} size={36} />
                  </td>
                  <td className="py-3 fw-semibold text-dark">{m.name}</td>
                  <td className="py-3">
                    <span className="badge rounded-pill bg-light text-secondary border">{m.dosage}</span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="badge bg-primary-subtle text-primary rounded-pill">
                      {m._count.stocks} farmácia{m._count.stocks !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="py-3 text-muted">
                    {new Date(m.createdAt).toLocaleDateString("pt-PT")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
