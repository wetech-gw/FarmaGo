"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";
import { useInstall } from "./InstallProvider";

/**
 * Botão flutuante de instalação — o único ponto de acesso à instalação.
 *
 * Aparece em todas as páginas enquanto a app não estiver instalada e o
 * utilizador não a tiver dispensado. Não é escondido quando o
 * `beforeinstallprompt` não chega: esse evento só dispara em contexto seguro
 * (https:// ou localhost), por isso abrir a app por http:// — o modo habitual
 * de testar no telemóvel — tornaria o botão invisível justo onde é preciso.
 *
 * Sem prompt nativo, o botão abre um painel com os passos correctos para o
 * browser em que a app está a ser vista.
 */
export default function InstallFloatingButton() {
  const t = useT();
  const { canPrompt, installed, needsManualSteps, secureContext, dismissed, install, dismiss } =
    useInstall();
  const [open, setOpen] = useState(false);

  if (installed || dismissed) return null;

  const hint = needsManualSteps
    ? t("pwa.installIosHint")
    : !secureContext
      ? t("pwa.installHttpHint")
      : t("pwa.installDesktopHint");

  return (
    <div className="pwa-install-fab-wrap">
      {open && !canPrompt && (
        <div className="pwa-install-fab__popover" role="note">
          <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
            <strong>{t("pwa.installTitle")}</strong>
            <button
              type="button"
              className="pwa-install-fab__close"
              onClick={dismiss}
              aria-label={t("pwa.installDismiss")}
            >
              <i className="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>
          <p className="mb-0">{hint}</p>
        </div>
      )}

      <button
        type="button"
        className="pwa-install-fab"
        onClick={() => {
          if (canPrompt) void install();
          else setOpen((value) => !value);
        }}
        aria-expanded={canPrompt ? undefined : open}
      >
        <i className="bi bi-download" aria-hidden="true"></i>
        <span>{t("pwa.installButton")}</span>
      </button>
    </div>
  );
}