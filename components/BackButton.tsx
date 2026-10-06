"use client";

import { useT } from "@/components/I18nProvider";

export default function BackButton() {
  const t = useT();

  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="btn btn-link text-decoration-none text-success fw-semibold p-0 d-inline-flex align-items-center gap-1"
      aria-label={t("common.back")}
    >
      <i className="bi bi-chevron-left" aria-hidden="true"></i>
      {t("common.back")}
    </button>
  );
}