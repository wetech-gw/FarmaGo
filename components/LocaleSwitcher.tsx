"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";
import { LOCALES, persistLocale, type Locale } from "@/lib/i18n-core";

export default function LocaleSwitcher() {
  const router = useRouter();
  const { locale } = useI18n();

  return (
    <select
      className="form-select form-select-sm rounded-3"
      style={{ width: "auto" }}
      value={locale}
      aria-label={LOCALES.map((item) => item.label).join(" / ")}
      onChange={(event) => {
        persistLocale(event.target.value as Locale);
        router.refresh();
      }}
    >
      {LOCALES.map((item) => (
        <option key={item.value} value={item.value}>
          {item.short}
        </option>
      ))}
    </select>
  );
}