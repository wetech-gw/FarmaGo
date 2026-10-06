"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { BISSAU_CENTER, DEFAULT_ZOOM, escapeHtml } from "@/lib/geo";
import { loadLeaflet } from "@/lib/leaflet";
import { useT } from "@/components/I18nProvider";
import type { PharmacySpot } from "@/types/pharmacy";

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface Props {
  spots: PharmacySpot[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onNavigate?: (spot: PharmacySpot) => void;
  userLocation?: UserLocation | null;
  className?: string;
  zoom?: number;
}

function buildIcon(L: typeof Leaflet, spot: PharmacySpot, isSelected: boolean) {
  const state = spot.isOpen ? "open" : "closed";
  const className = `px-pin px-pin--${state}${isSelected ? " is-active" : ""}`;

  return L.divIcon({
    className: "px-pin-wrap",
    html: `<span class="${className}"><i class="bi bi-capsule-pill"></i></span>`,
    iconSize: [38, 46],
    iconAnchor: [19, 44],
    tooltipAnchor: [0, -40],
  });
}

export default function PharmacyMap({
  spots,
  selectedId,
  onSelect,
  onNavigate,
  userLocation = null,
  className = "",
  zoom = DEFAULT_ZOOM,
}: Props) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const layerRef = useRef<Leaflet.FeatureGroup | null>(null);
  const markersRef = useRef<Map<number, Leaflet.Marker>>(new Map());
  const userMarkerRef = useRef<Leaflet.CircleMarker | null>(null);
  const userCircleRef = useRef<Leaflet.Circle | null>(null);
  const fitSignatureRef = useRef<string>("");

  const onSelectRef = useRef(onSelect);
  const zoomRef = useRef(zoom);
  const spotsRef = useRef<PharmacySpot[]>(spots);
  const selectedIdRef = useRef<number | null>(selectedId);
  const initialCenterRef = useRef<[number, number]>(
    userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : BISSAU_CENTER,
  );

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markerCount, setMarkerCount] = useState(0);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    spotsRef.current = spots;
  }, [spots]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const fitToMarkers = useCallback(() => {
    const map = mapRef.current;
    const group = layerRef.current;
    if (!map || !group || group.getLayers().length === 0) return;

    // `invalidateSize` primeiro: sem isto o Leaflet calcula o zoom com o
    // contentor ainda por dimensionar e os marcadores ficam fora do ecrã.
    map.invalidateSize();
    map.fitBounds(group.getBounds().pad(0.3), { maxZoom: 16, animate: false });
  }, []);

  const syncMarkers = useCallback(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const group = layerRef.current;
    if (!L || !map || !group) return;

    const current = spotsRef.current;
    const activeId = selectedIdRef.current;

    group.clearLayers();
    markersRef.current.clear();

    let plotted = 0;

    current.forEach((spot) => {
      if (spot.latitude === null || spot.longitude === null) return;

      const marker = L.marker([spot.latitude, spot.longitude], {
        icon: buildIcon(L, spot, spot.id === activeId),
        title: spot.name,
        alt: spot.name,
        riseOnHover: true,
        zIndexOffset: spot.id === activeId ? 1000 : 0,
      });

      marker.bindTooltip(
        `<strong>${escapeHtml(spot.name)}</strong><br>${escapeHtml(spot.hours)}`,
        { direction: "top", opacity: 0.95 },
      );
      marker.on("click", () => {
        if (onNavigate) {
          onNavigate(spot);
        } else {
          onSelectRef.current(spot.id);
        }
      });

      marker.addTo(group);
      markersRef.current.set(spot.id, marker);
      plotted += 1;
    });

    setMarkerCount(plotted);

    const signature = current.map((spot) => spot.id).join(",");
    if (signature !== fitSignatureRef.current) {
      fitSignatureRef.current = signature;
      fitToMarkers();
    }

    if (activeId !== null) {
      const marker = markersRef.current.get(activeId);
      if (marker) {
        map.setView(marker.getLatLng(), Math.max(map.getZoom(), 14), { animate: false });
        marker.openTooltip();
      }
    }
  }, [fitToMarkers]);

  // Inicializa o mapa apenas no browser (o Leaflet depende de `window`)
  useEffect(() => {
    let cancelled = false;
    let teardown: (() => void) | undefined;

    (async () => {
      try {
        const L = await loadLeaflet();
        if (cancelled || !containerRef.current) return;
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          layerRef.current = null;
        }

        const map = L.map(containerRef.current, {
          center: initialCenterRef.current,
          zoom: zoomRef.current,
          scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        leafletRef.current = L;
        mapRef.current = map;
        layerRef.current = L.featureGroup().addTo(map);

        // O contentor pode ainda não ter a altura final (Bootstrap, flex,
        // painéis), por isso medimos antes de desenhar e de enquadrar.
        map.invalidateSize();

        // Marcadores immediately: não dependem do estado `ready`.
        syncMarkers();
        fitToMarkers();

        const invalidate = () => map.invalidateSize();
        window.addEventListener("resize", invalidate);
        const timer = window.setTimeout(() => {
          map.invalidateSize();
          fitToMarkers();
        }, 300);

        teardown = () => {
          window.removeEventListener("resize", invalidate);
          window.clearTimeout(timer);
        };

        setError(null);
        setReady(true);
      } catch (err) {
        console.error("[PharmacyMap] falha ao carregar o mapa", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido ao carregar o mapa.");
        setReady(false);
      }
    })();

    return () => {
      cancelled = true;
      teardown?.();
      const map = mapRef.current;
      if (map) {
        map.stop();
        map.eachLayer((layer) => {
          if (layer instanceof (leafletRef.current as typeof Leaflet).Marker) {
            (layer as Leaflet.Marker).closeTooltip();
          }
        });
        map.remove();
      }
      const markers = markersRef.current;
      layerRef.current = null;
      markers.clear();
      userMarkerRef.current = null;
      userCircleRef.current = null;
      fitSignatureRef.current = "";
      leafletRef.current = null;
      mapRef.current = null;
      setReady(false);
      setMarkerCount(0);
    };
  }, [syncMarkers, fitToMarkers]);

  // Mantém os marcadores sincronizados com a lista / selecção
  useEffect(() => {
    if (!ready) return;
    syncMarkers();
  }, [spots, selectedId, ready, syncMarkers]);

  // Marcador da localização do utilizador
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;

    userMarkerRef.current?.remove();
    userCircleRef.current?.remove();
    userMarkerRef.current = null;
    userCircleRef.current = null;

    if (!userLocation) return;

    userMarkerRef.current = L.circleMarker(
      [userLocation.latitude, userLocation.longitude],
      {
        radius: 8,
        color: "#ffffff",
        weight: 3,
        fillColor: "#2563eb",
        fillOpacity: 1,
      },
    )
      .addTo(map)
      .bindTooltip(t("explorer.yourLocation"), { direction: "top" });

    if (userLocation.accuracy) {
      userCircleRef.current = L.circle(
        [userLocation.latitude, userLocation.longitude],
        {
          radius: userLocation.accuracy,
          color: "#2563eb",
          weight: 1,
          fillColor: "#2563eb",
          fillOpacity: 0.08,
        },
      ).addTo(map);
    }

    map.setView(
      [userLocation.latitude, userLocation.longitude],
      Math.max(map.getZoom(), 14),
    );
  }, [userLocation, ready, t]);

  return (
    <div className="px-map-wrap">
      <div
        ref={containerRef}
        className={`px-map ${className}`}
        role="application"
        aria-label={t("explorer.mapLabel")}
      />

      {ready && (
        <span className="px-map-count" aria-live="polite">
          {t("explorer.markerCount", { count: markerCount })}
        </span>
      )}

      {error && (
        <div className="px-map-error" role="alert">
          <i className="bi bi-exclamation-triangle"></i>
          <strong>{t("explorer.mapLoadError")}</strong>
          <span>{error}</span>
          <span className="px-map-error__hint">
            {t("explorer.mapLoadErrorHint")}
          </span>
        </div>
      )}
    </div>
  );
}