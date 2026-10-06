"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PharmacyMap from "./PharmacyMap";
import PharmacySpotCard from "./PharmacySpotCard";
import PharmacyDetail from "./PharmacyDetail";
import { distanceInKm } from "@/lib/geo";
import { useI18n } from "@/components/I18nProvider";
import type { PharmacySpot } from "@/types/pharmacy";

type SpotFilter = "open" | "all" | "closed" | "guard";

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface Props {
  spots: PharmacySpot[];
  initialFilter?: SpotFilter;
}
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function PharmacyExplorer({ spots, initialFilter = "open" }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SpotFilter>(initialFilter);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [medQuery, setMedQuery] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const { locale, t } = useI18n();
  const FILTERS: { value: SpotFilter; label: string; icon: string }[] = [
    { value: "open", label: t("open"), icon: "bi-check2-circle" },
    { value: "all", label: t("all"), icon: "bi-grid" },
    { value: "closed", label: t("closed"), icon: "bi-dash-circle" },
    { value: "guard", label: t("guard"), icon: "bi-clock-history" },
  ];

  const router = useRouter();
  const selectSpot = useCallback((id: number) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  // Na lista, clicar numa farmácia abre a sua página (sem painel lateral)
  const openDetail = useCallback((spot: PharmacySpot) => {
    router.push(spot.isGuard ? `/guards/${spot.id}` : `/pharmacies/${spot.id}`);
  }, [router]);

  const closeDetail = useCallback(() => {
    setSelectedId(null);
    setMedQuery("");
  }, []);

  // Fecha o painel com a tecla Escape
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetail();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDetail]);

  // Mantém a farmácia seleccionada visível na lista quando vem do mapa
  useEffect(() => {
    if (selectedId === null || !listRef.current) return;
    const item = listRef.current.querySelector<HTMLElement>(`[data-spot-id="${selectedId}"]`);
    item?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  const countFor = useCallback(
    (value: SpotFilter) => {
      if (value === "open") return spots.filter((spot) => spot.isOpen).length;
      if (value === "closed") return spots.filter((spot) => !spot.isOpen).length;
      if (value === "guard") return spots.filter((spot) => spot.isGuard).length;
      return spots.length;
    },
    [spots],
  );

  const results = useMemo(() => {
    const term = normalize(query.trim());

    const filtered = spots.filter((spot) => {
      if (filter === "open" && !spot.isOpen) return false;
      if (filter === "closed" && spot.isOpen) return false;
      if (filter === "guard" && !spot.isGuard) return false;
      if (!term) return true;

      return (
        normalize(spot.name).includes(term) ||
        normalize(spot.address).includes(term) ||
        spot.medications.some((med) => normalize(med.name).includes(term))
      );
    });

    const withDistance = filtered.map((spot) => ({
      spot,
      distanceKm:
        userLocation &&
        spot.latitude !== null &&
        spot.longitude !== null
          ? distanceInKm(
              userLocation.latitude,
              userLocation.longitude,
              spot.latitude,
              spot.longitude,
            )
          : null,
    }));

    withDistance.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      if (a.spot.isOpen !== b.spot.isOpen) return a.spot.isOpen ? -1 : 1;
      return a.spot.name.localeCompare(b.spot.name, locale);
    });

    return withDistance;
  }, [spots, query, filter, userLocation, locale]);

  // Identidade estável: evita redesenhar todos os marcadores a cada render.
  const mapSpots = useMemo(() => results.map(({ spot }) => spot), [results]);

  const selected = spots.find((spot) => spot.id === selectedId) ?? null;
  const selectedDistance =
    selected && userLocation && selected.latitude !== null && selected.longitude !== null
      ? distanceInKm(
          userLocation.latitude,
          userLocation.longitude,
          selected.latitude,
          selected.longitude,
        )
      : null;

  const mappedCount = results.filter(({ spot }) => spot.latitude !== null).length;

  const requestLocation = () => {
    setGeoError(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError(t("explorer.geoUnsupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      () => setGeoError(t("explorer.geoDenied")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  // Pede a localização automaticamente ao entrar (sem mostrar erro se falhar)
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) =>
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  return (
    <section className="px-explorer">
      <div className="container">
        <div className="px-explorer-bar">
          <div className="px-search">
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label={t("explorer.clearSearch")}>
                <i className="bi bi-x-lg" aria-hidden="true"></i>
              </button>
            )}
          </div>

          <div className="px-chips" role="group" aria-label={t("explorer.filterGroup")}>
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`px-chip${filter === item.value ? " is-active" : ""}`}
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
              >
                <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                {item.label}
                <span className="px-chip-count">{countFor(item.value)}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`px-locate${userLocation ? " is-active" : ""}`}
            onClick={requestLocation}
          >
            <i className="bi bi-crosshair" aria-hidden="true"></i>
            {userLocation ? t("locationActive") : t("useMyLocation")}
          </button>
        </div>

        {geoError && (
          <div className="alert alert-warning rounded-4 px-3 py-2 small mt-3 mb-0" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {geoError}
          </div>
        )}

        <div className={`px-explorer-grid${selected ? " has-selection" : ""}`}>
          <aside className="px-explorer-list">
            <div className="px-list-head">
              <span aria-live="polite">
                <strong>{t("explorer.resultsCount", { count: results.length })}</strong>
                {mappedCount < results.length && (
                  <span className="px-list-note">
                    {" "}
                    · {results.length - mappedCount} {t("explorer.noCoordinates")}
                  </span>
                )}
              </span>
              {userLocation && (
                <span className="px-list-note">
                  <i className="bi bi-sort-down" aria-hidden="true"></i> {t("explorer.sortByDistance")}
                </span>
              )}
            </div>

            <div className="px-spot-list" ref={listRef}>
              {results.length === 0 ? (
                <div className="px-list-empty">
                  <i className="bi bi-geo-alt" aria-hidden="true"></i>
                  <p className="mb-0">{t("noResults")}</p>
                  <button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>
                    {t("seeAll")}
                  </button>
                </div>
              ) : (
                results.map(({ spot, distanceKm }) => (
                  <div key={spot.id} data-spot-id={spot.id}>
                    <PharmacySpotCard
                      spot={spot}
                      distanceKm={distanceKm}
                      isSelected={spot.id === selectedId}
                      onSelect={() => openDetail(spot)}
                    />
                  </div>
                ))
              )}
            </div>
          </aside>

          <div className="px-explorer-map">
            <PharmacyMap
              spots={mapSpots}
              selectedId={selectedId}
              onSelect={selectSpot}
              onNavigate={openDetail}
              userLocation={userLocation}
            />

            <div className="px-map-legend">
              <span>
                <span className="px-pin-dot px-pin-dot--open" aria-hidden="true"></span>
                {t("explorer.legendOpen")}
              </span>
              <span>
                <span className="px-pin-dot px-pin-dot--closed" aria-hidden="true"></span>
                {t("explorer.legendClosed")}
              </span>
              {userLocation && (
                <span>
                  <span className="px-pin-dot px-pin-dot--user" aria-hidden="true"></span>
                  {t("explorer.legendYou")}
                </span>
              )}
            </div>

          </div>

          {selected && (
            <aside className="px-explorer-panel">
              <PharmacyDetail
                spot={selected}
                distanceKm={selectedDistance}
                medQuery={medQuery}
                onMedQueryChange={setMedQuery}
                onClose={closeDetail}
              />
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}