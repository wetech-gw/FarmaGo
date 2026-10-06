"use client";

import { useT } from "@/components/I18nProvider";
import { whatsappHref } from "@/lib/contact";

/**
 * Botão flutuante do WhatsApp.
 *
 * Aparece em todas as páginas. `wa.me` abre directamente a conversa na app
 * do WhatsApp (Android/iOS/Desktop) e, se não estiver instalada, no WhatsApp
 * Web — daí o `target="_blank"` e o `rel` explícito.
 */
export default function WhatsAppButton() {
  const t = useT();

  return (
    <a
      href={whatsappHref(t("whatsapp.defaultMessage"))}
      target="_blank"
      rel="noopener noreferrer"
      className="pwa-whatsapp-fab"
      aria-label={t("whatsapp.openTooltip")}
      title={t("whatsapp.openTooltip")}
    >
      <i className="bi bi-whatsapp" aria-hidden="true"></i>
      <span className="visually-hidden">{t("whatsapp.cta")}</span>
    </a>
  );
}