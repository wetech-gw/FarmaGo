"use client";

import Link from "next/link";
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
}

interface Props {
  med: Medication;
  href?: string;
  showAvailability?: boolean;
}

function placeholderImage(name: string): string {
  return medicationPlaceholder(name);
}

export default function MedicationCard({ med, href, showAvailability = true }: Props) {
  const src = med.image ?? placeholderImage(med.name);
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
            e.currentTarget.src = placeholderImage(med.name);
          }}
        />

        {hasAvailability && (
          <span
            className={`med-badge ${med.inStock ? "med-badge--ok" : "med-badge--off"}`}
          >
            <span className="med-dot" aria-hidden="true"></span>
            {med.inStock ? "Disponível" : "Indisponível"}
          </span>
        )}

        {med.totalQuantity !== undefined && med.totalQuantity > 0 && (
          <span className="med-stock" title={`${med.totalQuantity} unidades em stock`}>
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
            {med.minPrice.toFixed(2)}
          </div>
        )}

        <div className="med-meta">
          <span className="d-inline-flex align-items-center gap-1">
            <i className="bi bi-shop-window" aria-hidden="true"></i>
            {med.pharmacyCount ?? 0} farm{(med.pharmacyCount ?? 0) === 1 ? "ácia" : "ácias"}
          </span>
          <span className="med-meta-sep" aria-hidden="true"></span>
          <span className="d-inline-flex align-items-center gap-1">
            <i className="bi bi-capsule" aria-hidden="true"></i>
            {med.dosage}
          </span>
        </div>

        <Link href={detailHref} className="med-cta">
          Ver detalhes
          <i className="bi bi-arrow-right" aria-hidden="true"></i>
        </Link>
      </div>
    </article>
  );
}
