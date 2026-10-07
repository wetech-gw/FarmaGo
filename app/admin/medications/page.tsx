import { requireAdmin } from "@/lib/auth";
import { getMedicationRows } from "@/lib/medications";
import MedicationForm from "@/components/medications/MedicationForm";
import MedicationTable from "@/components/medications/MedicationTable";
import FormModal from "@/components/FormModal";
import { getI18n } from "@/lib/i18n";
import { createMedication, updateMedication, deleteMedication } from "./actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMedicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const { t } = await getI18n();
  await requireAdmin();

  const [rows, privateCount] = await Promise.all([
    getMedicationRows(),
    prisma.medication.count({ where: { pharmacyId: { not: null } } }),
  ]);

  const editingId = edit ? Number(edit) : null;
  // No admin todas as linhas são do catálogo, logo todas são editáveis.
  const editing = editingId ? rows.find((row) => row.id === editingId) : null;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 fs-2">{t("medications")}</h1>
          <p className="text-muted small m-0">
            {t("admin.medsSubtitle", { count: rows.length })}
          </p>
        </div>
      </div>

      {privateCount > 0 && (
        <div className="alert alert-light border rounded-4 small mb-4">
          <i className="bi bi-info-circle me-1"></i>
          {t("admin.medsPrivateNote", { count: privateCount })}
        </div>
      )}

      <div className="card border-0 rounded-4 shadow-sm bg-white mb-4">
        <div className="card-body">
          {editing ? (
            <>
              <h2 className="h6 fw-bold mb-3">
                <i className="bi bi-pencil-square me-2" style={{ color: "#ea580c" }}></i>
                {t("dash.editPrefix", { name: editing.name })}
              </h2>
              <MedicationForm
                action={updateMedication}
                editing={editing}
                cancelHref="/admin/medications"
              />
            </>
          ) : (
            <FormModal
              title={t("dash.addMedication")}
              buttonLabel={t("dash.addMedication")}
              buttonIcon="bi-plus-lg"
            >
              <MedicationForm action={createMedication} />
            </FormModal>
          )}
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">
            <i className="bi bi-capsule me-2" style={{ color: "#0f8a0e" }}></i>
            {t("common.itemsCount", { count: rows.length })}
          </h2>
          <MedicationTable
            rows={rows}
            editHref="/admin/medications"
            deleteAction={deleteMedication}
            emptyLabel={t("admin.noMedicationsInCatalog")}
            showPharmacyCount
          />
        </div>
      </div>
    </>
  );
}
