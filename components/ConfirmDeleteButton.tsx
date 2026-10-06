"use client";

import type { ReactNode } from "react";

export default function ConfirmDeleteButton({
  message,
  className,
  ariaLabel,
  children,
}: {
  message: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      aria-label={ariaLabel}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
