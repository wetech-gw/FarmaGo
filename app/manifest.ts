import type { MetadataRoute } from "next";
import { getI18n } from "@/lib/i18n";

/**
 * Manifesto da PWA (ver `scripts/generate-pwa-icons.mjs` para os ícones).
 *
 * O manifesto é gerado por-request para traduzir o nome e a descrição: o
 * utilizador vê "FarmaGo — Pharmacies" no ecrã inicial em vez de português.
 * Em troca deixa de ser cacheado, o que é irrelevante para um ficheiro de
 * poucos bytes.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { locale, t } = await getI18n();

  return {
    id: "/",
    name: t("pwa.appName"),
    short_name: t("pwa.appShortName"),
    description: t("pwa.appDescription"),
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0f8a0e",
    lang: locale,
    dir: "ltr",
    categories: ["health", "medical", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: t("guardPharmacies"), short_name: t("guard"), url: "/guards" },
      { name: t("pharmacies"), short_name: t("pharmacies"), url: "/pharmacies" },
      { name: t("medications"), short_name: t("medications"), url: "/medications" },
    ],
  };
}