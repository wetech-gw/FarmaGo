"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";
import { LOCALES, persistLocale, type Locale } from "@/lib/i18n-core";

export default function LocaleSwitcher({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { locale, t } = useI18n();

  return (
    <div
      className={`px-locale${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={t("common.language")}
    >
      {LOCALES.map((item) => {
        const active = item.value === locale;

        return (
          <button
            key={item.value}
            type="button"
            className={`px-locale-btn${active ? " is-active" : ""}`}
            aria-pressed={active}
            lang={item.intl}
            title={item.label}
            onClick={() => {
              if (active) return;
              persistLocale(item.value as Locale);
              router.refresh();
            }}
          >
            {item.short}
          </button>
        );
      })}
    </div>
  );
}
