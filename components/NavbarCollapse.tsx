"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/I18nProvider";

export default function NavbarCollapse({ children }: { children: React.ReactNode }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  // Trava o scroll de fundo só no mobile; no desktop o menu nunca abre.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 991.98px)");
    document.body.style.overflow = open && mq.matches ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className={`px-burger navbar-toggler d-lg-none ${open ? "is-open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-controls="navbarContent"
        aria-expanded={open}
        aria-label={open ? t("common.close") : t("common.toggleNavigation")}
      >
        <span className="px-burger-box" aria-hidden="true">
          <span className="px-burger-line" />
          <span className="px-burger-line" />
          <span className="px-burger-line" />
        </span>
      </button>

      {open && (
        <div className="px-menu-backdrop d-lg-none" onClick={close} aria-hidden="true" />
      )}

      <div
        className={`navbar-collapse px-menu ${open ? "is-open" : ""}`}
        id="navbarContent"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) close();
        }}
      >
        {children}
      </div>
    </>
  );
}
