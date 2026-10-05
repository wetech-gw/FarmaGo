"use client";

import { useState } from "react";
import { medicationPlaceholder, pharmacyPlaceholder } from "@/lib/placeholders";

type AdminImageThumbProps = {
  src?: string | null;
  alt: string;
  kind?: "medication" | "pharmacy";
  size?: number;
  radius?: string;
  background?: string;
  padded?: boolean;
  className?: string;
};

export function AdminImageThumb({
  src,
  alt,
  kind = "medication",
  size = 36,
  radius = "6px",
  background = "#f8f9fa",
  padded = false,
  className,
}: AdminImageThumbProps) {
  const fallback = kind === "pharmacy" ? pharmacyPlaceholder(alt) : medicationPlaceholder(alt);
  const [current, setCurrent] = useState(src || fallback);

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: padded ? "contain" : "cover",
        borderRadius: radius,
        background,
        padding: padded ? 4 : undefined,
      }}
      onError={() => setCurrent(fallback)}
    />
  );
}