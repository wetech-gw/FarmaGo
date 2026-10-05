"use client";

import Link from "next/link";
import { formatDistance, googleMapsUrl } from "@/lib/geo";
import { medicationPlaceholder, pharmacyPlaceholder } from "@/lib/placeholders";
import type { PharmacySpot } from "@/types/pharmacy";

interface Props {
  spot: PharmacySpot;
  distanceKm: number | null;
  medQuery: string;
  onMedQueryChange: (value: string) => void;
  onClose: () => void;
}

export default function PharmacyDetail({
  spot,
  distanceKm,
  medQuery,
  onMedQueryChange,
  onClose,
}: Props) {
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
          aria-label="Fechar detalhes"
        >
          <i className="bi bi-x-lg" aria-hidden="true"></i>
        </button>

        <span className={`px-detail-status px-detail-status--${spot.isOpen ? "on" : "off"}`}>
          <span className="px-open-dot" aria-hidden="true"></span>
          {spot.isOpen ? "Aberta agora" : "Fechada"}
        </span>
      </div>

      <div className="px-detail-body">
        <div className="px-detail-head">
          <h2 className="px-detail-name">{spot.name}</h2>
          <div className="px-detail-sub">
            {spot.isGuard && (
              <span className="px-spot-tag px-spot-tag--guard">Farmácia de plantão</span>
            )}
            {distanceKm !== null && (
              <span className="px-detail-distance">
                <i className="bi bi-signpost-split" aria-hidden="true"></i>
                a {formatDistance(distanceKm)} de si
              </span>
            )}
          </div>
        </div>

        <div className="px-detail-actions">
          <a href={`tel:${spot.phone}`} className="px-detail-btn px-detail-btn--primary">
            <i className="bi bi-telephone-fill" aria-hidden="true"></i>
            Ligar agora
          </a>
          <a
            href={googleMapsUrl(spot.latitude, spot.longitude, spot.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-detail-btn px-detail-btn--ghost"
          >
            <i className="bi bi-sign-turn-right-fill" aria-hidden="true"></i>
            Direções
          </a>
        </div>

        <div className="px-detail-scroll">
        <dl className="px-detail-info">
          <div className="px-detail-row">
            <dt>
              <i className="bi bi-geo-alt-fill" aria-hidden="true"></i>
              Morada
            </dt>
            <dd>{spot.address}</dd>
          </div>

          <div className="px-detail-row">
            <dt>
              <i className="bi bi-clock-fill" aria-hidden="true"></i>
              Horário
            </dt>
            <dd>
              {spot.schedule} · <strong>{spot.hours}</strong>
            </dd>
          </div>

          <div className="px-detail-row">
            <dt>
              <i className="bi bi-telephone-fill" aria-hidden="true"></i>
              Telefone
            </dt>
            <dd>
              <a href={`tel:${spot.phone}`}>{spot.phone}</a>
            </dd>
          </div>

          {spot.latitude !== null && (
            <div className="px-detail-row">
              <dt>
                <i className="bi bi-pin-map-fill" aria-hidden="true"></i>
                Coordenadas
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
              Medicamentos disponíveis
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
                placeholder="Filtrar medicamentos desta farmácia..."
                aria-label="Filtrar medicamentos desta farmácia"
              />
              {medQuery && (
                <button
                  type="button"
                  onClick={() => onMedQueryChange("")}
                  aria-label="Limpar filtro de medicamentos"
                >
                  <i className="bi bi-x-lg" aria-hidden="true"></i>
                </button>
              )}
            </div>
          )}

          {spot.medications.length === 0 ? (
            <p className="px-detail-empty">
              <i className="bi bi-inbox" aria-hidden="true"></i>
              Esta farmácia ainda não tem medicamentos registados em stock.
            </p>
          ) : meds.length === 0 ? (
            <p className="px-detail-empty">
              <i className="bi bi-search" aria-hidden="true"></i>
              Nenhum medicamento corresponde a “{medQuery}”.
            </p>
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
                    {med.price.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-detail-foot">
          <Link href={`/pharmacies/${spot.id}`} className="px-detail-link">
            Ver página completa da farmácia
            <i className="bi bi-arrow-right" aria-hidden="true"></i>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
