"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MedicationCard from "./MedicationCard";
import type {
  AvailabilityFilter,
  MedicationListItem,
  MedicationSort,
} from "@/types/medication";

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

const AVAILABILITY_FILTERS: { value: AvailabilityFilter; label: string; icon: string }[] = [
  { value: "all", label: "Todos", icon: "bi-grid-3x3-gap" },
  { value: "available", label: "Disponíveis", icon: "bi-check2-circle" },
  { value: "unavailable", label: "Indisponíveis", icon: "bi-dash-circle" },
];

const SORTS: { value: MedicationSort; label: string }[] = [
  { value: "name", label: "Nome (A–Z)" },
  { value: "name-desc", label: "Nome (Z–A)" },
  { value: "availability", label: "Mais disponíveis" },
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
  eyebrow = "Catálogo Pharmax",
  title = "Medicamentos",
  accent = "disponíveis agora",
  description = "Consulte o catálogo completo, veja em que farmácias cada medicamento está disponível e encontre o mais próximo de si.",
}: Props) {
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [sort, setSort] = useState<MedicationSort>("name");

  const availableCount = medications.filter((med) => med.inStock).length;

  const countFor = (value: AvailabilityFilter) => {
    if (value === "available") return availableCount;
    if (value === "unavailable") return medications.length - availableCount;
    return medications.length;
  };

  const results = useMemo(() => {
    const term = normalize(query.trim());

    const filtered = medications.filter((med) => {
      const matchesAvailability =
        availability === "all" ||
        (availability === "available" && med.inStock) ||
        (availability === "unavailable" && !med.inStock);

      if (!matchesAvailability) return false;
      if (!term) return true;

      return (
        normalize(med.name).includes(term) ||
        normalize(med.dosage).includes(term)
      );
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === "availability") {
        return b.pharmacyCount - a.pharmacyCount || a.name.localeCompare(b.name, "pt");
      }
      const direction = sort === "name-desc" ? -1 : 1;
      return a.name.localeCompare(b.name, "pt") * direction;
    });

    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  }, [medications, query, availability, sort, limit]);

  const hasFilters = query.trim().length > 0 || availability !== "all";

  return (
    <section className="med-showcase">
      <div className="container position-relative">
        <header className="med-showcase-head">
          <span className="med-eyebrow">
            <i className="bi bi-capsule-pill" aria-hidden="true"></i>
            {eyebrow}
          </span>

          <h2 className="med-showcase-title">
            {title} <span className="med-showcase-accent">{accent}</span>
          </h2>

          <p className="med-showcase-desc">{description}</p>

          <div className="med-stats">
            <span className="med-stat">
              <i className="bi bi-journal-medical" aria-hidden="true"></i>
              <strong>{medications.length}</strong> no catálogo
            </span>
            <span className="med-stat med-stat--ok">
              <i className="bi bi-check2-circle" aria-hidden="true"></i>
              <strong>{availableCount}</strong> disponíveis
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
                placeholder="Pesquisar medicamento ou dosagem..."
                aria-label="Pesquisar medicamento ou dosagem"
              />
              {query && (
                <button
                  type="button"
                  className="med-search-clear"
                  onClick={() => setQuery("")}
                  aria-label="Limpar pesquisa"
                >
                  <i className="bi bi-x-lg" aria-hidden="true"></i>
                </button>
              )}
            </div>

            <div className="med-chips" role="group" aria-label="Filtrar por disponibilidade">
              {AVAILABILITY_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={`med-chip ${availability === filter.value ? "is-active" : ""}`}
                  onClick={() => setAvailability(filter.value)}
                  aria-pressed={availability === filter.value}
                >
                  <i className={`bi ${filter.icon}`} aria-hidden="true"></i>
                  {filter.label}
                  <span className="med-chip-count">{countFor(filter.value)}</span>
                </button>
              ))}
            </div>

            <div className="med-sort">
              <label className="visually-hidden" htmlFor="med-sort">
                Ordenar medicamentos
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
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="med-results-bar">
          <span aria-live="polite">
            {results.length === medications.length
              ? `${results.length} medicamento${results.length === 1 ? "" : "s"}`
              : `${results.length} de ${medications.length} medicamentos`}
          </span>
          {hasFilters && (
            <button
              type="button"
              className="med-reset"
              onClick={() => {
                setQuery("");
                setAvailability("all");
              }}
            >
              <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
              Limpar filtros
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="med-empty">
            <i className="bi bi-search-heart" aria-hidden="true"></i>
            <h3>Nenhum medicamento encontrado</h3>
            <p>
              Tente pesquisar outro nome ou dosagem, ou volte a mostrar todos os
              medicamentos do catálogo.
            </p>
            <button
              type="button"
              className="med-cta med-cta--inline"
              onClick={() => {
                setQuery("");
                setAvailability("all");
              }}
            >
              Ver todo o catálogo
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
              Ver catálogo completo
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link href="/pharmacies" className="med-foot-link">
              <i className="bi bi-geo-alt" aria-hidden="true"></i>
              Encontrar farmácia perto de si
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
