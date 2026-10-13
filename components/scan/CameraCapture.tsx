"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/components/I18nProvider";

/** Maior lado da foto, em píxeis: suficiente para ler a receita e leve de enviar. */
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.85;

interface Props {
  /** Foto JPEG pronta a seguir o mesmo caminho de uma imagem da galeria. */
  onCapture: (file: File) => void;
  onClose: () => void;
}

/**
 * Câmara dentro da própria página: abre o stream da câmara traseira num ecrã
 * inteiro e devolve a foto capturada como ficheiro JPEG.
 *
 * O `<input type="file" capture>` não serve aqui: em muitos browsers abre um
 * selector de ficheiros em vez da câmara, e alguns ignoram o `capture`.
 */
export default function CameraCapture({ onCapture, onClose }: Props) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [starting, setStarting] = useState(true);
  const [failed, setFailed] = useState(false);
  const [canFlip, setCanFlip] = useState(false);

  /** Ref evita re-registar o listener do Escape a cada render do pai. */
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  /** Fecha sempre o stream: a luz da câmara não pode ficar acesa. */
  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeRef.current();
    }

    // A página de trás não deve rolar enquanto a câmara está aberta.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function openCamera() {
      setStarting(true);
      setFailed(false);
      stop();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const cameras = await navigator.mediaDevices.enumerateDevices();
        if (active) {
          setCanFlip(cameras.filter((device) => device.kind === "videoinput").length > 1);
        }
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setStarting(false);
      }
    }

    void openCamera();

    return () => {
      active = false;
      stop();
    };
  }, [facing, stop]);

  function handleCapture() {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;

    // A foto do sensor vem muito maior do que a API aceita: encolhe antes de enviar.
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      stop();
      onCapture(new File([blob], "receita.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", JPEG_QUALITY);
  }

  const ready = !starting && !failed;

  return (
    <div className="camera-overlay" role="dialog" aria-modal="true" aria-label={t("scan.cameraTitle")}>
      <div className="camera-overlay-top">
        <button
          type="button"
          className="camera-btn camera-btn--icon"
          onClick={onClose}
          aria-label={t("common.cancel")}
          title={t("common.cancel")}
        >
          <i className="bi bi-x-lg" aria-hidden="true"></i>
        </button>

        <span className="camera-overlay-title">{t("scan.cameraTitle")}</span>

        {canFlip && (
          <button
            type="button"
            className="camera-btn camera-btn--icon"
            onClick={() => setFacing((current) => (current === "environment" ? "user" : "environment"))}
            aria-label={t("scan.cameraFlip")}
            title={t("scan.cameraFlip")}
          >
            <i className="bi bi-arrow-repeat" aria-hidden="true"></i>
          </button>
        )}
      </div>

      <div className="camera-overlay-stage">
        <video ref={videoRef} className="camera-video" playsInline muted autoPlay />

        {starting && (
          <p className="camera-status">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            {t("scan.cameraStarting")}
          </p>
        )}

        {failed && (
          <p className="camera-status camera-status--error">
            <i className="bi bi-camera-video-off me-2" aria-hidden="true"></i>
            {t("scan.cameraError")}
          </p>
        )}
      </div>

      <div className="camera-overlay-bottom">
        <p className="camera-hint">{t("scan.cameraHint")}</p>

        <div className="camera-actions">
          <button type="button" className="camera-btn camera-btn--ghost" onClick={onClose}>
            {t("common.cancel")}
          </button>

          <button
            type="button"
            className="camera-shutter"
            onClick={handleCapture}
            disabled={!ready}
            aria-label={t("scan.cameraCapture")}
            title={t("scan.cameraCapture")}
          ></button>
        </div>
      </div>
    </div>
  );
}
