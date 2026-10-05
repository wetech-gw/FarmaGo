import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveMedication, deleteMedication } from "./actions";
import { AdminImageThumb } from "@/components/AdminImageThumb";

export const dynamic = "force-dynamic";

export default async function DashboardMedicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const pharmacyId = user.pharmacyId;
  if (!pharmacyId) redirect("/dashboard/sem-farmacia");

  const medications = await prisma.medication.findMany({
    where: { pharmacyId },
    orderBy: { name: "asc" },
  });

  const editingId = edit ? Number(edit) : null;
  const editing = editingId ? medications.find((m) => m.id === editingId) : null;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Os meus medicamentos</h1>
          <p className="text-secondary small mb-0">
            Cadastre os medicamentos da sua farmácia para os usar no stock e nas vendas.
          </p>
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white mb-4">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">
            <i className={`bi ${editing ? "bi-pencil-square" : "bi-plus-circle"} me-2`}
              style={{ color: editing ? "#ea580c" : "#10b981" }}></i>
            {editing ? `Editar — ${editing.name}` : "Adicionar medicamento"}
          </h2>

          <form action={saveMedication} className="row g-3 align-items-end" encType="multipart/form-data">
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <div className="col-12 col-md-4">
              <label className="form-label small fw-medium text-secondary" htmlFor="md-name">
                Nome
              </label>
              <input
                id="md-name"
                name="name"
                type="text"
                className="form-control rounded-3"
                defaultValue={editing?.name ?? ""}
                required
              />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label small fw-medium text-secondary" htmlFor="md-dosage">
                Dosagem
              </label>
              <input
                id="md-dosage"
                name="dosage"
                type="text"
                placeholder="ex: 500mg, frasco 120ml"
                className="form-control rounded-3"
                defaultValue={editing?.dosage ?? ""}
                required
              />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label small fw-medium text-secondary" htmlFor="md-image">
                Imagem
              </label>
              <input
                id="md-image"
                name="imageFile"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="form-control rounded-3"
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-medium text-secondary" htmlFor="md-desc">
                Descrição
              </label>
              <textarea
                id="md-desc"
                name="description"
                className="form-control rounded-3"
                rows={3}
                defaultValue={editing?.description ?? ""}
              />
            </div>

            <div className="col-12 col-md-6">
              <div className="form-check mt-4">
                <input
                  id="md-needsPres"
                  name="needsPrescription"
                  type="checkbox"
                  className="form-check-input"
                  defaultChecked={editing?.needsPrescription ?? false}
                />
                <label className="form-check-label small text-secondary" htmlFor="md-needsPres">
                  Vendido apenas com receita médica
                </label>
              </div>
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-success rounded-3 px-4 py-2">
                <i className="bi bi-check-lg me-1"></i>
                {editing ? "Guardar alterações" : "Adicionar medicamento"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">
            <i className="bi bi-capsule me-2" style={{ color: "#0f8a0e" }}></i>
            {medications.length} medicamento(s)
          </h2>

          {medications.length === 0 ? (
            <p className="text-secondary small mb-0">
              Ainda não registou medicamentos. Use o formulário acima.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-secondary">
                    <th></th>
                    <th>Nome</th>
                    <th>Dosagem</th>
                    <th>Criado em</th>
                    <th style={{ width: 120 }} />
                  </tr>
                </thead>
                <tbody>
                  {medications.map((m) => (
                    <tr key={m.id}>
                      <td style={{ width: 48 }}>
                        <AdminImageThumb src={m.image} alt={m.name} size={32} />
                      </td>
                      <td className="fw-semibold">{m.name}</td>
                      <td className="small">{m.dosage}</td>
                      <td className="small">{m.createdAt.toLocaleDateString("pt-PT")}</td>
                      <td className="text-end">
                        <Link
                          href={`/dashboard/medications?edit=${m.id}`}
                          className="btn btn-sm btn-outline-success rounded-3 me-1"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <form action={deleteMedication} className="d-inline">
                          <input type="hidden" name="id" value={m.id} />
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
