"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MedicationCard from "./MedicationCard";
import { useI18n } from "@/components/I18nProvider";
import type { MedicationListItem, MedicationSort } from "@/types/medication";

interface Props {
  medications: MedicationListItem[];
  limit?: number;
  showFilters?: boolean;
  showAllLink?: boolean;
  allHref?: string;
  eyebrow?: string;
  title?: string;
  accent?: string;
  description?: string;
}

const SORTS: { value: MedicationSort }[] = [
  { value: "name" },
  { value: "name-desc" },
  { value: "availability" },
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function MedicationsShowcase({
  medications,
  limit,
  showFilters = true,
  showAllLink = false,
  allHref = "/medications",
  eyebrow,
  title,
  accent,
  description,
}: Props) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<MedicationSort>("name");

  const results = useMemo(() => {
    const term = normalize(query.trim());

    const filtered = medications.filter((med) => {
      if (!term) return true;

      return (
        normalize(med.name).includes(term) ||
        normalize(med.dosage).includes(term)
      );
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === "availability") {
        return b.pharmacyCount - a.pharmacyCount || a.name.localeCompare(b.name, locale);
      }
      const direction = sort === "name-desc" ? -1 : 1;
      return a.name.localeCompare(b.name, locale) * direction;
    });

    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  }, [medications, query, sort, limit, locale]);

  const hasFilters = query.trim().length > 0;

  const resetFilters = () => {
    setQuery("");
  };

  return (
    <section className="med-showcase">
      <div className="container position-relative">
        <header className="med-showcase-head">
          <span className="med-eyebrow">
            <i className="bi bi-capsule-pill" aria-hidden="true"></i>
            {eyebrow ?? t("medsPage.eyebrow")}
          </span>

          <h2 className="med-showcase-title">
            {title ?? t("medsPage.showcaseTitle")} <span className="med-showcase-accent">{accent ?? t("medsPage.showcaseAccent")}</span>
          </h2>

          <p className="med-showcase-desc">{description ?? t("medsPage.showcaseDescription")}</p>

          <div className="med-stats">
            <span className="med-stat med-stat--ok">
              <i className="bi bi-check2-circle" aria-hidden="true"></i>
              <strong>{medications.length}</strong> {t("meds.availableCount")}
            </span>
          </div>
        </header>

        {showFilters && (
          <div className="med-toolbar">
            <div className="med-search">
              <i className="bi bi-search" aria-hidden="true"></i>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("meds.searchPlaceholder")}
                aria-label={t("meds.searchLabel")}
              />
              {query && (
                <button
                  type="button"
                  className="med-search-clear"
                  onClick={() => setQuery("")}
                  aria-label={t("meds.clearSearch")}
                >
                  <i className="bi bi-x-lg" aria-hidden="true"></i>
                </button>
              )}
            </div>

            <div className="med-sort">
              <label className="visually-hidden" htmlFor="med-sort">
                {t("meds.sortLabel")}
              </label>
              <i className="bi bi-arrow-down-up" aria-hidden="true"></i>
              <select
                id="med-sort"
                className="form-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as MedicationSort)}
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.value === "name" ? "meds.sortNameAsc" : option.value === "name-desc" ? "meds.sortNameDesc" : "meds.sortAvailability")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="med-results-bar">
          <span aria-live="polite">
            {results.length === medications.length
              ? t("meds.resultsCount", { count: results.length })
              : t("meds.resultsFiltered", { count: results.length, total: medications.length })}
          </span>
          {hasFilters && (
            <button type="button" className="med-reset" onClick={resetFilters}>
              <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
              {t("meds.clearFilters")}
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="med-empty">
            <i className="bi bi-search-heart" aria-hidden="true"></i>
            <h3>{t("meds.emptyTitle")}</h3>
            <p>{t("meds.emptyText")}</p>
            <button
              type="button"
              className="med-cta med-cta--inline"
              onClick={resetFilters}
            >
              {t("meds.seeAllCatalog")}
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        ) : (
          <div className="med-grid">
            {results.map((med) => (
              <MedicationCard key={med.id} med={med} />
            ))}
          </div>
        )}

        {showAllLink && (
          <div className="med-showcase-foot">
            <Link href={allHref} className="med-cta med-cta--lg">
              {t("meds.seeFullCatalog")}
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link href="/pharmacies" className="med-foot-link">
              <i className="bi bi-geo-alt" aria-hidden="true"></i>
              {t("meds.findPharmacyNear")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}