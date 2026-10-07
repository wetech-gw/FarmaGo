import Link from "next/link";
import { getI18n } from "@/lib/i18n";

export type MedicationFormEditing = {
  id: number;
  name: string;
  dosage: string;
  image: string | null;
  description: string | null;
  needsPrescription: boolean;
};

/**
 * Formulário de cadastro de medicamentos partilhado pelo admin e pela farmácia.
 * Os rótulos vêm do i18n aqui dentro, para que os dois lados não possam divergir.
 */
export default async function MedicationForm({
  action,
  editing = null,
  cancelHref,
}: {
  action: (formData: FormData) => Promise<void>;
  editing?: MedicationFormEditing | null;
  cancelHref?: string;
}) {
  const { t } = await getI18n();

  return (
    <form action={action} className="row g-3 align-items-end" encType="multipart/form-data">
      {editing && <input type="hidden" name="id" value={editing.id} />}

      <div className="col-12 col-md-4">
        <label className="form-label small fw-medium text-secondary" htmlFor="md-name">
          {t("dash.medName")}
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
          {t("dash.medDosage")}
        </label>
        <input
          id="md-dosage"
          name="dosage"
          type="text"
          placeholder={t("dash.medDosagePlaceholder")}
          className="form-control rounded-3"
          defaultValue={editing?.dosage ?? ""}
          required
        />
      </div>

      <div className="col-12 col-md-3">
        <label className="form-label small fw-medium text-secondary" htmlFor="md-image">
          {t("dash.medImage")}
        </label>
        <input
          id="md-image"
          name="imageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="form-control rounded-3"
        />
      </div>

      <div className="col-12 col-md-2">
        <label className="form-label small fw-medium text-secondary" htmlFor="md-imageUrl">
          {t("admin.imageUrl")}
        </label>
        <input
          id="md-imageUrl"
          name="imageUrl"
          type="text"
          placeholder="/images/medications/…"
          className="form-control rounded-3"
          defaultValue={editing?.image ?? ""}
        />
      </div>

      <div className="col-12">
        <label className="form-label small fw-medium text-secondary" htmlFor="md-desc">
          {t("dash.medDescription")}
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
        <div className="form-check mt-2">
          <input
            id="md-needsPres"
            name="needsPrescription"
            type="checkbox"
            className="form-check-input"
            defaultChecked={editing?.needsPrescription ?? false}
          />
          <label className="form-check-label small text-secondary" htmlFor="md-needsPres">
            {t("dash.medPrescriptionOnly")}
          </label>
        </div>
      </div>

      <div className="col-12 d-flex gap-2">
        <button type="submit" className="btn btn-success rounded-3 px-4 py-2">
          <i className="bi bi-check-lg me-1"></i>
          {editing ? t("dash.saveChanges") : t("dash.addMedication")}
        </button>
        {editing && cancelHref && (
          <Link href={cancelHref} className="btn btn-outline-secondary rounded-3 px-3 py-2">
            {t("common.cancel")}
          </Link>
        )}
      </div>
    </form>
  );
}
