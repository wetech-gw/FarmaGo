"use client";

import Link from "next/link";
import { useT } from "@/components/I18nProvider";
import { medicationPlaceholder } from "@/lib/placeholders";

interface Medication {
  id: number;
  name: string;
  dosage: string;
  image?: string | null;
  pharmacyCount?: number;
  totalQuantity?: number;
  inStock?: boolean;
  minPrice?: number | null;
  needsPrescription?: boolean;
}

interface Props {
  med: Medication;
  href?: string;
  showAvailability?: boolean;
}

export default function MedicationCard({ med, href, showAvailability = true }: Props) {
  const t = useT();

  const src = med.image ?? medicationPlaceholder(med.name);
  const hasAvailability = showAvailability && typeof med.inStock === "boolean";
  const detailHref = href ?? `/medications/${med.id}`;

  return (
    <article className="med-card">
      <div className="med-card-media">
        <img
          src={src}
          alt={`${med.name} ${med.dosage}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = medicationPlaceholder(med.name);
          }}
        />

        {hasAvailability && (
          <span
            className={`med-badge ${med.inStock ? "med-badge--ok" : "med-badge--off"}`}
          >
            <span className="med-dot" aria-hidden="true"></span>
            {med.inStock ? t("common.available") : t("common.unavailable")}
          </span>
        )}

        {med.totalQuantity !== undefined && med.totalQuantity > 0 && (
          <span className="med-stock" title={t("meds.unitsInStock", { count: med.totalQuantity })}>
            <i className="bi bi-box-seam" aria-hidden="true"></i>
            {med.totalQuantity}
          </span>
        )}
      </div>

      <div className="med-card-body">
        <span className="med-dose">{med.dosage}</span>

        <h3 className="med-name">{med.name}</h3>

        {med.minPrice != null && (
          <div className="med-price fw-bold" style={{ color: "#0f8a0e" }}>
            {med.minPrice.toFixed(0)} FCFA
          </div>
        )}

        <div className="med-meta">
          {med.needsPrescription && (
            <span className="d-inline-flex align-items-center gap-1 text-warning fw-semibold">
              <i className="bi bi-file-earmark-medical" aria-hidden="true"></i>
              {t("meds.prescriptionRequired")}
            </span>
          )}
          {med.needsPrescription && (
            <span className="med-meta-sep" aria-hidden="true"></span>
          )}
          <span className="d-inline-flex align-items-center gap-1">
            <i className="bi bi-capsule" aria-hidden="true"></i>
            {med.dosage}
          </span>
        </div>

        <Link href={detailHref} className="med-cta">
          {t("meds.seeDetails")}
          <i className="bi bi-arrow-right" aria-hidden="true"></i>
        </Link>
      </div>
    </article>
  );
}