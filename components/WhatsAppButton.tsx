"use client";

import { usePathname } from "next/navigation";
import { useT } from "@/components/I18nProvider";
import { useInstall } from "@/components/pwa/InstallProvider";
import { whatsappHref } from "@/lib/contact";

const hiddenPrefixes = ["/dashboard", "/login", "/admin", "/inspecao"];

/**
 * Botão flutuante do WhatsApp.
 *
 * Aparece em todas as páginas públicas, excepto no login, nas áreas restritas
 * (dashboard, admin e inspeção) — onde a app já tem navegação própria — e
 * dentro da app instalada, onde a janela do browser já não está presente.
 *
 * O `installed` vem do `useInstall` em vez de um media query em CSS porque o
 * Safari em iOS não expõe `(display-mode: standalone)`: em CSS o botão ficaria
 * visível em metade dos PWA's. `wa.me` abre directamente a conversa na app do
 * WhatsApp (Android/iOS/Desktop) e, se não estiver instalada, no WhatsApp Web
 * — daí o `target="_blank"` e o `rel` explícito.
 */
export default function WhatsAppButton() {
  const pathname = usePathname();
  const { installed } = useInstall();
  const t = useT();

  if (installed || hiddenPrefixes.some((prefix) => pathname?.startsWith(prefix))) {
    return null;
  }

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