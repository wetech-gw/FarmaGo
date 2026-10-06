"use client";

import { useT } from "@/components/I18nProvider";

export default function PrintButton() {
  const t = useT();

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-success rounded-3 ms-auto"
    >
      <i className="bi bi-printer me-1"></i>
      {t("common.print")}
    </button>
  );
}