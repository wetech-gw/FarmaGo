"use client";

import { useT } from "@/components/I18nProvider";
import { pharmacyPlaceholder } from "@/lib/placeholders";
import { formatDistance } from "@/lib/geo";
import type { PharmacySpot } from "@/types/pharmacy";

interface Props {
  spot: PharmacySpot;
  isSelected: boolean;
  distanceKm: number | null;
  onSelect: (id: number) => void;
}

export default function PharmacySpotCard({ spot, isSelected, distanceKm, onSelect }: Props) {
  const t = useT();

  return (
    <button
      type="button"
      onClick={() => onSelect(spot.id)}
      className={`px-spot${isSelected ? " is-active" : ""}`}
      aria-pressed={isSelected}
    >
      <span className="px-spot-media">
        <img
          src={spot.image ?? pharmacyPlaceholder(spot.name)}
          alt={spot.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = pharmacyPlaceholder(spot.name);
          }}
        />
      </span>

      <span className="px-spot-body">
        <span className="px-spot-head">
          <span className="px-spot-name">{spot.name}</span>
          {spot.isGuard && (
            <span className="px-spot-tag px-spot-tag--guard">{t("pharmacy.guardTag")}</span>
          )}
        </span>

        <span className="px-spot-address">
          <i className="bi bi-geo-alt" aria-hidden="true"></i>
          {spot.address}
        </span>

        <span className="px-spot-foot">
          <span
            className={`px-open px-open--${spot.isOpen ? "on" : "off"}`}
          >
            <span className="px-open-dot" aria-hidden="true"></span>
            {spot.isOpen ? t("common.openBadge") : t("common.closedBadge")}
          </span>

          <span className="px-spot-hours">{spot.hours}</span>

          {distanceKm !== null && (
            <span className="px-spot-distance">
              <i className="bi bi-signpost-split" aria-hidden="true"></i>
              {formatDistance(distanceKm)}
            </span>
          )}

          <span className="px-spot-stock">
            <i className="bi bi-capsule" aria-hidden="true"></i>
            {t("explorer.medicationsCount", { count: spot.medications.length })}
          </span>
        </span>

        {spot.latitude === null && (
          <span className="px-spot-warning">
            <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
            {t("pharmacy.noCoordinates")}
          </span>
        )}
      </span>

      <span className="px-spot-chevron" aria-hidden="true">
        <i className="bi bi-chevron-right"></i>
      </span>
    </button>
  );
}