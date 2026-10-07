import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getMedicationRows } from "@/lib/medications";
import MedicationForm from "@/components/medications/MedicationForm";
import MedicationTable from "@/components/medications/MedicationTable";
import FormModal from "@/components/FormModal";
import { getI18n } from "@/lib/i18n";
import { saveMedication, deleteMedication } from "./actions";

export const dynamic = "force-dynamic";

export default async function DashboardMedicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const { t } = await getI18n();
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const pharmacyId = user.pharmacyId;
  if (!pharmacyId) redirect("/dashboard/sem-farmacia");

  // Catálogo do admin + os medicamentos privados desta farmácia.
  const rows = await getMedicationRows(pharmacyId);

  const editingId = edit ? Number(edit) : null;
  // Só se abre o formulário de edição para o que é da farmácia; o catálogo
  // do admin aparece na tabela só para consulta.
  const editing = editingId ? rows.find((row) => row.id === editingId && row.canEdit) : null;

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

      <div className="card border-0 rounded-4 shadow-sm bg-white mb-4">
        <div className="card-body">
          {editing ? (
            <>
              <h2 className="h6 fw-bold mb-3">
                <i className="bi bi-pencil-square me-2" style={{ color: "#ea580c" }}></i>
                {t("dash.editPrefix", { name: editing.name })}
              </h2>
              <MedicationForm
                action={saveMedication}
                editing={editing}
                cancelHref="/dashboard/medications"
              />
            </>
          ) : (
            <FormModal
              title={t("dash.addMedication")}
              buttonLabel={t("dash.addMedication")}
              buttonIcon="bi-plus-lg"
            >
              <MedicationForm action={saveMedication} />
            </FormModal>
          )}
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">
            <i className="bi bi-list-ul me-2" style={{ color: "#2563eb" }}></i>
            {t("common.itemsCount", { count: rows.length })}
          </h2>
          <MedicationTable
            rows={rows}
            editHref="/dashboard/medications"
            deleteAction={deleteMedication}
            emptyLabel={t("dash.medEmpty")}
          />
        </div>
      </div>
    </>
  );
}
