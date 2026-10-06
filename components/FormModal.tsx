"use client";

import { useState, type ReactNode } from "react";
import { useT } from "@/components/I18nProvider";

export default function FormModal({
  title,
  buttonLabel,
  buttonClassName = "btn btn-success rounded-3",
  buttonIcon,
  children,
}: {
  title: string;
  buttonLabel: string;
  buttonClassName?: string;
  buttonIcon?: string;
  children: ReactNode;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={buttonClassName} onClick={() => setOpen(true)}>
        {buttonIcon && <i className={`bi ${buttonIcon} me-1`}></i>}
        {buttonLabel}
      </button>

      {open && (
        <>
          <div
            className="modal d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setOpen(false)}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">{title}</h5>
                  <button type="button" className="btn-close" aria-label={t("common.close")} onClick={() => setOpen(false)}></button>
                </div>
                <div className="modal-body">{children}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}