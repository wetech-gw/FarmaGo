"use client";

import Link from "next/link";
import { formatDistance, googleMapsUrl } from "@/lib/geo";
import MedicationCard from "./MedicationCard";
import { useT } from "@/components/I18nProvider";
import { medicationPlaceholder, pharmacyPlaceholder } from "@/lib/placeholders";
import type { PharmacySpot } from "@/types/pharmacy";

interface Props {
  spot: PharmacySpot;
  distanceKm: number | null;
  medQuery: string;
  onMedQueryChange: (value: string) => void;
  onClose: () => void;
  medsLayout?: "list" | "grid";
  showFullPageLink?: boolean;
}

export default function PharmacyDetail({
  spot,
  distanceKm,
  medQuery,
  onMedQueryChange,
  onClose,
  medsLayout = "list",
  showFullPageLink = true,
}: Props) {
  const t = useT();

  const term = medQuery.trim().toLowerCase();
  const meds = spot.medications.filter(
    (med) =>
      !term ||
      med.name.toLowerCase().includes(term) ||
      med.dosage.toLowerCase().includes(term),
  );

  return (
    <div className="px-detail">
      <div className="px-detail-cover">
        <img
          src={spot.image ?? pharmacyPlaceholder(spot.name)}
          alt={spot.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = pharmacyPlaceholder(spot.name);
          }}
        />
        <div className="px-detail-cover-shade" />

        <button
          type="button"
          className="px-detail-close"
          onClick={onClose}
          aria-label={t("detail.close")}
        >
          <i className="bi bi-x-lg" aria-hidden="true"></i>
        </button>

        <span className={`px-detail-status px-detail-status--${spot.isOpen ? "on" : "off"}`}>
          <span className="px-open-dot" aria-hidden="true"></span>
          {spot.isOpen ? t("detail.openNow") : t("common.closedBadge")}
        </span>
      </div>

      <div className="px-detail-body">
        <div className="px-detail-head">
          <h2 className="px-detail-name">{spot.name}</h2>
          <div className="px-detail-sub">
            {spot.isGuard && (
              <span className="px-spot-tag px-spot-tag--guard">{t("detail.guardTag")}</span>
            )}
            {distanceKm !== null && (
              <span className="px-detail-distance">
                <i className="bi bi-signpost-split" aria-hidden="true"></i>
                {t("detail.distanceAway", { distance: formatDistance(distanceKm) })}
              </span>
            )}
          </div>
        </div>

        <div className="px-detail-actions">
          <a href={`tel:${spot.phone}`} className="px-detail-btn px-detail-btn--primary">
            <i className="bi bi-telephone-fill" aria-hidden="true"></i>
            {t("detail.callNow")}
          </a>
          <a
            href={googleMapsUrl(spot.latitude, spot.longitude, spot.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-detail-btn px-detail-btn--ghost"
          >
            <i className="bi bi-sign-turn-right-fill" aria-hidden="true"></i>
            {t("detail.directions")}
          </a>
        </div>

        <div className="px-detail-scroll">
        <dl className="px-detail-info">
          <div className="px-detail-row">
            <dt>
              <i className="bi bi-geo-alt-fill" aria-hidden="true"></i>
              {t("common.address")}
            </dt>
            <dd>{spot.address}</dd>
          </div>

          <div className="px-detail-row">
            <dt>
              <i className="bi bi-clock-fill" aria-hidden="true"></i>
              {t("common.hours")}
            </dt>
            <dd>
              {spot.schedule} · <strong>{spot.hours}</strong>
            </dd>
          </div>

          <div className="px-detail-row">
            <dt>
              <i className="bi bi-telephone-fill" aria-hidden="true"></i>
              {t("common.phone")}
            </dt>
            <dd>
              <a href={`tel:${spot.phone}`}>{spot.phone}</a>
            </dd>
          </div>

          {spot.latitude !== null && (
            <div className="px-detail-row">
              <dt>
                <i className="bi bi-pin-map-fill" aria-hidden="true"></i>
                {t("detail.coordinates")}
              </dt>
              <dd>
                {spot.latitude.toFixed(5)}, {spot.longitude?.toFixed(5)}
              </dd>
            </div>
          )}
        </dl>

        <div className="px-detail-meds">
          <div className="px-detail-meds-head">
            <h3>
              <i className="bi bi-capsule-pill" aria-hidden="true"></i>
              {t("detail.availableMedications")}
            </h3>
            <span className="px-detail-meds-count">{spot.medications.length}</span>
          </div>

          {spot.medications.length > 0 && (
            <div className="px-detail-med-search">
              <i className="bi bi-search" aria-hidden="true"></i>
              <input
                type="search"
                value={medQuery}
                onChange={(e) => onMedQueryChange(e.target.value)}
                placeholder={t("detail.filterPlaceholder")}
                aria-label={t("detail.filterLabel")}
              />
              {medQuery && (
                <button
                  type="button"
                  onClick={() => onMedQueryChange("")}
                  aria-label={t("detail.clearMedFilter")}
                >
                  <i className="bi bi-x-lg" aria-hidden="true"></i>
                </button>
              )}
            </div>
          )}

          {spot.medications.length === 0 ? (
            <p className="px-detail-empty">
              <i className="bi bi-inbox" aria-hidden="true"></i>
              {t("detail.noMedications")}
            </p>
          ) : meds.length === 0 ? (
            <p className="px-detail-empty">
              <i className="bi bi-search" aria-hidden="true"></i>
              {t("detail.noMatch", { query: medQuery })}
            </p>
          ) : (
            medsLayout === "grid" ? (
              <div className="med-grid px-med-grid--small">
                {meds.map((med) => (
                  <MedicationCard
                    key={med.id}
                    showAvailability={false}
                    med={{
                      id: med.id,
                      name: med.name,
                      dosage: med.dosage,
                      image: med.image,
                      totalQuantity: med.quantity,
                      inStock: med.quantity > 0,
                      minPrice: med.price,
                      needsPrescription: med.needsPrescription,
                    }}
                  />
                ))}
              </div>
            ) : (
            <ul className="px-med-list">
              {meds.map((med) => (
                <li key={med.id} className="px-med-item">
                  <span className="px-med-media">
                    <img
                      src={med.image ?? medicationPlaceholder(med.name)}
                      alt={med.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = medicationPlaceholder(med.name);
                      }}
                    />
                  </span>
                  <span className="px-med-info">
                    <span className="px-med-name">{med.name}</span>
                    <span className="px-med-dose">{med.dosage}</span>
                  </span>
                  <span className="px-med-qty">
                    <i className="bi bi-box-seam" aria-hidden="true"></i>
                    {med.quantity}
                  </span>
                  <span className="px-med-price fw-bold" style={{ color: "#0f8a0e" }}>
                    {med.price.toFixed(0)} FCFA
                  </span>
                </li>
              ))}
            </ul>
            )
            )}
        </div>

        {showFullPageLink && (
        <div className="px-detail-foot">
          <Link href={`/pharmacies/${spot.id}`} className="px-detail-link">
            {t("detail.fullPageLink")}
            <i className="bi bi-arrow-right" aria-hidden="true"></i>
          </Link>
        </div>
        )}
        </div>
      </div>
    </div>
  );
}