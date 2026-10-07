import Link from "next/link";
import { AdminImageThumb } from "@/components/AdminImageThumb";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { formatDate, getI18n } from "@/lib/i18n";
import type { MedicationRow } from "@/types/medication";

/**
 * Tabela de medicamentos partilhada pelo admin e pela farmácia.
 *
 * As linhas do catálogo global aparecem para a farmácia, mas sem botões: ela
 * não pode editar nem apagar o que é do admin. Os botões de cada linha apontam
 * para `editHref`, por isso o admin e a farmácia usam editHref diferente.
 */
export default async function MedicationTable({
  rows,
  editHref,
  deleteAction,
  emptyLabel,
  showPharmacyCount = false,
}: {
  rows: MedicationRow[];
  editHref: string;
  deleteAction: (formData: FormData) => Promise<void>;
  emptyLabel: string;
  showPharmacyCount?: boolean;
}) {
  const { locale, t } = await getI18n();

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr className="small text-secondary">
            <th style={{ width: 48 }} />
            <th>{t("dash.medName")}</th>
            <th>{t("dash.medDosage")}</th>
            <th>{t("dash.medDescription")}</th>
            <th className="text-center">{t("dash.medPrescriptionOnly")}</th>
            {showPharmacyCount && <th className="text-center">{t("pharmacies")}</th>}
            <th>{t("dash.createdAt")}</th>
            <th style={{ width: 120 }} />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={showPharmacyCount ? 8 : 7} className="text-center py-4 text-secondary small">
                {emptyLabel}
              </td>
            </tr>
          ) : rows.map((medication) => (
            <tr key={medication.id}>
              <td>
                <AdminImageThumb src={medication.image} alt={medication.name} size={32} />
              </td>
              <td>
                <div className="fw-semibold d-flex align-items-center gap-2">
                  {medication.name}
                  {!medication.canEdit && (
                    <span className="badge rounded-pill bg-primary-subtle text-primary">
                      <i className="bi bi-shield-check me-1"></i>
                      {t("dash.catalogGroup")}
                    </span>
                  )}
                </div>
              </td>
              <td className="small">
                <span className="badge rounded-pill bg-light text-secondary border">
                  {medication.dosage}
                </span>
              </td>
              <td className="small text-secondary" style={{ maxWidth: 220 }}>
                <div className="text-truncate" title={medication.description ?? undefined}>
                  {medication.description || t("common.notAvailableYet")}
                </div>
              </td>
              <td className="text-center">
                {medication.needsPrescription ? (
                  <span className="badge rounded-pill text-bg-warning">
                    <i className="bi bi-file-earmark-medical me-1"></i>
                    {t("common.yes")}
                  </span>
                ) : (
                  <span className="badge rounded-pill text-bg-light text-secondary border">
                    {t("common.no")}
                  </span>
                )}
              </td>
              {showPharmacyCount && (
                <td className="text-center">
                  <span className="badge bg-primary-subtle text-primary rounded-pill">
                    {t("admin.pharmaciesWithMed", { count: medication.pharmacyCount })}
                  </span>
                </td>
              )}
              <td className="small text-secondary">{formatDate(locale, medication.createdAt)}</td>
              <td className="text-end">
                {medication.canEdit ? (
                  <>
                    <Link
                      href={`${editHref}?edit=${medication.id}`}
                      className="btn btn-sm btn-outline-success rounded-3 me-1"
                      aria-label={t("common.edit")}
                    >
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <form action={deleteAction} className="d-inline">
                      <input type="hidden" name="id" value={medication.id} />
                      <ConfirmDeleteButton
                        message={t("dash.deleteMedConfirm", { name: medication.name })}
                        className="btn btn-sm btn-outline-danger rounded-3"
                        ariaLabel={t("common.remove")}
                      >
                        <i className="bi bi-trash"></i>
                      </ConfirmDeleteButton>
                    </form>
                  </>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
