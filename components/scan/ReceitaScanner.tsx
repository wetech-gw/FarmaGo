"use client";

import { useMemo, useRef, useState } from "react";
import { useT } from "@/components/I18nProvider";
import MedicationsShowcase from "@/components/MedicationsShowcase";
import CameraCapture from "./CameraCapture";
import { matchMedicines, type ScanMatch } from "@/lib/scan";
import { addRawToCart } from "@/lib/cart";
import type { ExtractedMedicine } from "@/lib/ai-vision";
import type { MedicationListItem } from "@/types/medication";
import type { TKey } from "@/lib/i18n-core";

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Códigos de erro da API -> chaves de tradução. */
const ERROR_KEYS: Record<string, TKey> = {
  "image-required": "scan.errorNoImage",
  "unsupported-type": "error.unsupportedImageFormat",
  "image-too-large": "error.imageTooLarge",
  "invalid-json": "scan.errorGeneric",
  "rate-limited": "scan.errorRateLimited",
  "not-configured": "scan.errorNotConfigured",
  "request-failed": "scan.errorRequestFailed",
  "invalid-response": "scan.errorUnreadable",
};

function errorKeyForCode(code: unknown): TKey {
  return typeof code === "string" && code in ERROR_KEYS ? ERROR_KEYS[code] : "scan.errorGeneric";
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.slice(result.indexOf(",") + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function ReceitaScanner({ medications }: { medications: MedicationListItem[] }) {
  const t = useT();
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<ScanMatch[] | null>(null);

  /** Medicamentos do catálogo encontrados na receita, sem repetidos. */
  const found = useMemo(() => {
    if (!matches) return [];
    const seen = new Set<number>();
    return matches
      .map((item) => item.match)
      .filter((medication): medication is MedicationListItem => medication !== null)
      .filter((medication) => {
        if (seen.has(medication.id)) return false;
        seen.add(medication.id);
        return true;
      });
  }, [matches]);

  /** Nomes lidos na receita que não bateram com nenhum medicamento do catálogo. */
  const notFound = useMemo(
    () => (matches ?? []).filter((item) => item.match === null).map((item) => item.extracted.name),
    [matches]
  );

  async function handleAnalyze(file: File) {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t("error.unsupportedImageFormat"));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(t("error.imageTooLarge"));
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setAnalyzing(true);
    setMatches(null);

    try {
      const image = await readFileAsBase64(file);
      const response = await fetch("/api/scan-receita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mimeType: file.type }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(t(errorKeyForCode(data.error)));
        return;
      }

      const extracted = (Array.isArray(data.medicines) ? data.medicines : []) as ExtractedMedicine[];
      setMatches(matchMedicines(extracted, medications));
    } catch {
      setError(t("scan.errorGeneric"));
    } finally {
      setAnalyzing(false);
    }
  }

  function resetScan() {
    setPreviewUrl(null);
    setMatches(null);
    setError(null);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  /**
   * Abre a câmara dentro da página. Sem acesso a câmara (browser antigo ou
   * contexto não seguro), segue para a galeria — que nesses browsers ainda
   * mostra a opção de tirar foto.
   */
  function openCamera() {
    setError(null);
    if (typeof navigator.mediaDevices?.getUserMedia === "function") {
      setCameraOpen(true);
      return;
    }
    galleryInputRef.current?.click();
  }

  return (
    <>
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <h2 className="h5 fw-bold mb-3">
            <i className="bi bi-upc-scan me-2 text-success"></i>
            {t("scan.captureTitle")}
          </h2>

          {previewUrl ? (
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={t("scan.previewAlt")}
                className="img-fluid rounded-4 border"
                style={{ maxHeight: "340px", objectFit: "contain", width: "100%" }}
              />
            </div>
          ) : (
            <div className="border rounded-4 text-center p-5 mb-3 bg-light" style={{ borderStyle: "dashed" }}>
              <i className="bi bi-camera fs-1 text-success"></i>
              <p className="small text-secondary mt-2 mb-0">{t("scan.captureHint")}</p>
            </div>
          )}

          {/* A galeria fica sempre disponível como alternativa à câmara. */}
          <input
            ref={galleryInputRef}
            id="receita-gallery"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="d-none"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleAnalyze(file);
            }}
          />

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-success rounded-pill px-4 fw-semibold"
              style={{ backgroundColor: "#0f8a0e", borderColor: "#0f8a0e" }}
              onClick={openCamera}
            >
              <i className="bi bi-camera-fill me-2"></i>
              {previewUrl ? t("scan.changePhoto") : t("scan.takePhoto")}
            </button>

            <label
              htmlFor="receita-gallery"
              className="btn btn-outline-success rounded-pill px-4 fw-semibold mb-0"
            >
              <i className="bi bi-images me-2"></i>
              {t("scan.choosePhoto")}
            </label>

            {previewUrl && (
              <button type="button" onClick={resetScan} className="btn btn-outline-secondary rounded-pill px-3">
                {t("scan.retake")}
              </button>
            )}
          </div>

          {analyzing && (
            <p className="text-secondary small mt-3 mb-0">
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              {t("scan.analyzing")}
            </p>
          )}

          {error && (
            <div className="alert alert-danger rounded-3 small py-2 px-3 mt-3 mb-0" role="alert">
              <i className="bi bi-exclamation-triangle me-1"></i>
              {error}
            </div>
          )}

          <p className="small text-secondary mt-3 mb-0">
            <i className="bi bi-shield-lock me-1"></i>
            {t("scan.privacyNote")}
          </p>
        </div>
      </div>

      {matches === null && (
        <div className="text-center py-4">
          <i className="bi bi-inbox fs-1 text-secondary"></i>
          <p className="text-secondary small mt-2 mb-0">{t("scan.resultsEmpty")}</p>
        </div>
      )}

      {matches !== null && matches.length === 0 && (
        <div className="alert alert-warning rounded-4 small">
          <i className="bi bi-exclamation-circle me-1"></i>
          {t("scan.noMedicines")}
        </div>
      )}

      {found.length > 0 && (
        <MedicationsShowcase
          medications={found}
          showFilters={false}
          showAllLink={false}
          eyebrow={t("scan.resultsEyebrow")}
          title={t("scan.resultsTitle")}
          accent={t("scan.resultsAccent")}
          description={t("scan.resultsDescription")}
        />
      )}

      {notFound.length > 0 && (
        <div className="alert alert-warning rounded-4 small mt-4">
          <i className="bi bi-exclamation-circle me-1"></i>
          <strong>{t("scan.notFoundTitle")}</strong>
          <ul className="list-unstyled mb-0 mt-1 d-flex flex-column gap-1">
            {notFound.map((name) => (
              <li key={name} className="d-flex justify-content-between align-items-center gap-2">
                <span>{name}</span>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill text-nowrap"
                  onClick={() => addRawToCart(name)}
                >
                  <i className="bi bi-cart-plus me-1"></i>
                  {t("cart.add")}
                </button>
              </li>
            ))}
          </ul>
          <span className="d-block mt-1">{t("scan.notFoundHint")}</span>
        </div>
      )}

      {cameraOpen && (
        <CameraCapture
          onClose={() => setCameraOpen(false)}
          onCapture={(file) => {
            setCameraOpen(false);
            void handleAnalyze(file);
          }}
        />
      )}
    </>
  );
}
