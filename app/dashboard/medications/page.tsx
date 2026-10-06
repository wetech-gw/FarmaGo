import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveMedication, deleteMedication } from "./actions";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import FormModal from "@/components/FormModal";
import { AdminImageThumb } from "@/components/AdminImageThumb";
import { formatDate, getI18n } from "@/lib/i18n";

type EditingMedication = {
  id: number;
  name: string;
  dosage: string;
  description: string | null;
  needsPrescription: boolean;
};

function MedicationForm({
  editing,
  labels,
}: {
  editing: EditingMedication | null;
  labels: Record<string, string>;
}) {
  return (
    <form action={saveMedication} className="row g-3 align-items-end" encType="multipart/form-data">
      {editing && <input type="hidden" name="id" value={editing.id} />}

      <div className="col-12 col-md-4">
        <label className="form-label small fw-medium text-secondary" htmlFor="md-name">
          {labels.name}
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
          {labels.dosage}
        </label>
        <input
          id="md-dosage"
          name="dosage"
          type="text"
          placeholder={labels.dosagePlaceholder}
          className="form-control rounded-3"
          defaultValue={editing?.dosage ?? ""}
          required
        />
      </div>

      <div className="col-12 col-md-3">
        <label className="form-label small fw-medium text-secondary" htmlFor="md-image">
          {labels.image}
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
          {labels.description}
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
            {labels.prescription}
          </label>
        </div>
      </div>
      <div className="col-12">
        <button type="submit" className="btn btn-success rounded-3 px-4 py-2">
          <i className="bi bi-check-lg me-1"></i>
          {labels.save}
        </button>
      </div>
    </form>
  );
}

export const dynamic = "force-dynamic";

export default async function DashboardMedicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const { locale, t } = await getI18n();
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

  const labels: Record<string, string> = {
    name: t("dash.medName"),
    dosage: t("dash.medDosage"),
    dosagePlaceholder: t("dash.medDosagePlaceholder"),
    image: t("dash.medImage"),
    description: t("dash.medDescription"),
    prescription: t("dash.medPrescriptionOnly"),
    save: editing ? t("dash.saveChanges") : t("dash.addMedication"),
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">{t("dash.medsTitle")}</h1>
          <p className="text-secondary small mb-0">
            {t("dash.medsSubtitle")}
          </p>
        </div>
      </div>

      <div className="mb-4">
        {editing ? (
          <div className="card border-0 rounded-4 shadow-sm bg-white">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">
                <i className="bi bi-pencil-square me-2" style={{ color: "#ea580c" }}></i>
                {t("dash.editPrefix", { name: editing.name })}
              </h2>
              <MedicationForm editing={editing} labels={labels} />
            </div>
          </div>
        ) : (
          <FormModal
            title={t("dash.addMedication")}
            buttonLabel={t("dash.addMedication")}
            buttonIcon="bi-plus-lg"
          >
            <MedicationForm editing={null} labels={labels} />
          </FormModal>
        )}
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">
            <i className="bi bi-capsule me-2" style={{ color: "#0f8a0e" }}></i>
            {t("meds.resultsCount", { count: medications.length })}
          </h2>

          {medications.length === 0 ? (
            <p className="text-secondary small mb-0">
              {t("dash.medEmpty")}
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-secondary">
                    <th></th>
                    <th>{t("dash.medName")}</th>
                    <th>{t("dash.medDosage")}</th>
                    <th>{t("dash.createdAt")}</th>
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
                      <td className="small">{formatDate(locale, m.createdAt)}</td>
                      <td className="text-end">
                        <Link
                          href={`/dashboard/medications?edit=${m.id}`}
                          className="btn btn-sm btn-outline-success rounded-3 me-1"
                          aria-label={t("common.edit")}
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <form action={deleteMedication} className="d-inline">
                          <input type="hidden" name="id" value={m.id} />
                          <ConfirmDeleteButton
                            message={t("dash.deleteMedConfirm", { name: m.name })}
                            className="btn btn-sm btn-outline-danger rounded-3"
                            ariaLabel={t("common.remove")}
                          >
                            <i className="bi bi-trash"></i>
                          </ConfirmDeleteButton>
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