"use client";

import { useEffect, useState } from "react";

export default function NavbarCollapse({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 991.98px)");
    document.body.style.overflow = open && mq.matches ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        className="navbar-toggler border-0"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-controls="navbarContent"
        aria-expanded={open}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div
        className={`navbar-collapse mt-3 mt-lg-0 ${open ? "d-block" : "collapse"}`}
        id="navbarContent"
        style={open ? { maxHeight: "70vh", overflowY: "auto" } : undefined}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        {children}
      </div>
    </>
  );
}
