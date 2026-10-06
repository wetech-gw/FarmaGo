"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { BISSAU_CENTER } from "@/lib/geo";
import { loadLeaflet } from "@/lib/leaflet";
import { useT } from "@/components/I18nProvider";

interface Props {
  latitude?: number | null;
  longitude?: number | null;
}

const MAX_LAT = 90;
const MAX_LNG = 180;

function normalize(input: string): string {
  const trimmed = input.trim().replace(",", ".");
  if (!/^-?\d*\.?\d*$/.test(trimmed)) return "";
  return trimmed;
}

export default function LocationPicker({ latitude, longitude }: Props) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerRef = useRef<Leaflet.Marker | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);

  const [lat, setLat] = useState(latitude != null ? latitude.toFixed(6) : "");
  const [lng, setLng] = useState(longitude != null ? longitude.toFixed(6) : "");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<{
    key: "picker.eventClick" | "picker.eventLeafletClick" | "picker.eventManual" | "picker.eventGeolocation";
    lat: string;
    lng: string;
  } | null>(null);

  const applyPosition = (nextLat: number, nextLng: number) => {
    setLat(nextLat.toFixed(6));
    setLng(nextLng.toFixed(6));

    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    const latLng: [number, number] = [nextLat, nextLng];

    if (!markerRef.current) {
      const marker = L.marker(latLng, {
        icon: L.divIcon({
          className: "px-pin-wrap",
          html: '<span class="px-pin px-pin--open"><i class="bi bi-geo-alt-fill"></i></span>',
          iconSize: [38, 46],
          iconAnchor: [19, 44],
        }),
        draggable: true,
        autoPan: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const point = marker.getLatLng();
        applyPosition(point.lat, point.lng);
      });

      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng(latLng);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let teardown: (() => void) | undefined;

    (async () => {
      try {
        const L = await loadLeaflet();
        if (cancelled || !containerRef.current || mapRef.current) return;

        const hasCoords = latitude != null && longitude != null;
        const center: [number, number] = hasCoords
          ? [latitude as number, longitude as number]
          : BISSAU_CENTER;

        const map = L.map(containerRef.current, { center, zoom: hasCoords ? 16 : 13 });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        leafletRef.current = L;

        // Clique no mapa -> coordenadas. Usamos o evento nativo do contentor
        // (fase de captura) para não depender dos cliques internos do Leaflet.
        const onPointer = (event: MouseEvent) => {
          const container = containerRef.current;
          if (!container || !leafletRef.current) return;

          const rect = container.getBoundingClientRect();
          const point = leafletRef.current.point(
            event.clientX - rect.left,
            event.clientY - rect.top,
          );
          const { lat: nextLat, lng: nextLng } = map.containerPointToLatLng(point);

          applyPosition(nextLat, nextLng);
          setLastEvent({ key: "picker.eventClick", lat: nextLat.toFixed(5), lng: nextLng.toFixed(5) });
        };

        map.on("click", (event: Leaflet.LeafletMouseEvent) => {
          applyPosition(event.latlng.lat, event.latlng.lng);
          setLastEvent({
            key: "picker.eventLeafletClick",
            lat: event.latlng.lat.toFixed(5),
            lng: event.latlng.lng.toFixed(5),
          });
        });

        containerRef.current.addEventListener("click", onPointer, true);

        mapRef.current = map;
        if (hasCoords) applyPosition(latitude as number, longitude as number);

        const invalidate = () => map.invalidateSize();
        window.addEventListener("resize", invalidate);
        const timer = window.setTimeout(invalidate, 200);

        teardown = () => {
          containerRef.current?.removeEventListener("click", onPointer, true);
          window.removeEventListener("resize", invalidate);
          window.clearTimeout(timer);
        };

        setError(null);
        setReady(true);
      } catch (err) {
        console.error("[LocationPicker] falha ao carregar o mapa", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido ao carregar o mapa.");
        setReady(false);
      }
    })();

    return () => {
      cancelled = true;
      teardown?.();
      markerRef.current = null;
      leafletRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commitManual = (nextLat: string, nextLng: string) => {
    const latValue = Number.parseFloat(normalize(nextLat));
    const lngValue = Number.parseFloat(normalize(nextLng));

    if (!Number.isFinite(latValue) || Math.abs(latValue) > MAX_LAT) return;
    if (!Number.isFinite(lngValue) || Math.abs(lngValue) > MAX_LNG) return;

    applyPosition(latValue, lngValue);
    setLastEvent({
      key: "picker.eventManual",
      lat: latValue.toFixed(5),
      lng: lngValue.toFixed(5),
    });
  };

  const useMyLocation = () => {
    const map = mapRef.current;
    if (!map || typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude: nextLat, longitude: nextLng } = position.coords;
      applyPosition(nextLat, nextLng);
      map.setView([nextLat, nextLng], 16);
      setLastEvent({
        key: "picker.eventGeolocation",
        lat: nextLat.toFixed(5),
        lng: nextLng.toFixed(5),
      });
    });
  };

  const clear = () => {
    setLat("");
    setLng("");
    setLastEvent(null);
    markerRef.current?.remove();
    markerRef.current = null;
  };

  const canSave = lat.trim() !== "" && lng.trim() !== "";

  return (
    <div className="px-picker">
      <input type="hidden" name="latitude" value={lat} />
      <input type="hidden" name="longitude" value={lng} />

      <div ref={containerRef} className="px-picker-map" aria-label={t("picker.mapLabel")} />

      <div className="px-picker-controls">
        <div className="row g-2">
          <div className="col-6 col-md-3">
            <label className="form-label small fw-medium text-secondary mb-1" htmlFor="pharmacyLatitude">
              Latitude
            </label>
            <input
              id="pharmacyLatitude"
              type="text"
              inputMode="decimal"
              className="form-control rounded-3"
              value={lat}
              placeholder="11.861500"
              onChange={(event) => {
                const value = normalize(event.target.value);
                setLat(value);
                commitManual(value, lng);
              }}
              onBlur={(event) => commitManual(event.target.value, lng)}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small fw-medium text-secondary mb-1" htmlFor="pharmacyLongitude">
              Longitude
            </label>
            <input
              id="pharmacyLongitude"
              type="text"
              inputMode="decimal"
              className="form-control rounded-3"
              value={lng}
              placeholder="-15.583600"
              onChange={(event) => {
                const value = normalize(event.target.value);
                setLng(value);
                commitManual(lat, value);
              }}
              onBlur={(event) => commitManual(lat, event.target.value)}
            />
          </div>
          <div className="col-12 col-md-6 d-flex align-items-end gap-2">
            <button type="button" onClick={useMyLocation} className="btn btn-outline-success rounded-3">
              <i className="bi bi-crosshair me-1"></i>
              {t("picker.myLocation")}
            </button>
            <button type="button" onClick={clear} className="btn btn-outline-secondary rounded-3">
              <i className="bi bi-x-lg me-1"></i>
              {t("picker.clear")}
            </button>
          </div>
        </div>

        <p className="form-text mb-0 mt-2">
          {error ? "" : ready ? t("picker.hint") : t("picker.loading")}
        </p>

        {lastEvent && (
          <p className="form-text mb-0 mt-1 px-picker-debug">
            <i className="bi bi-record-circle me-1"></i>
            {t("picker.lastPosition", { event: t(lastEvent.key, { lat: lastEvent.lat, lng: lastEvent.lng }) })}
          </p>
        )}

        {!canSave && (
          <p className="form-text text-warning-emphasis mb-0 mt-1">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {t("picker.noCoordinatesWarning")}
          </p>
        )}

        {error && (
          <div className="alert alert-warning rounded-3 small mt-2 mb-0 py-2 px-3">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {t("picker.loadError", { error })}
            <br />
            <span className="text-muted">{t("picker.loadErrorHint")}</span>
          </div>
        )}
      </div>
    </div>
  );
}