"use client";

import { useState } from "react";
import PharmacyDetail from "./PharmacyDetail";
import type { PharmacySpot } from "@/types/pharmacy";

export default function PharmacyDetailPageView({ spot }: { spot: PharmacySpot }) {
  const [medQuery, setMedQuery] = useState("");

  return (
    <PharmacyDetail
      spot={spot}
      distanceKm={null}
      medQuery={medQuery}
      onMedQueryChange={setMedQuery}
      onClose={() => window.history.back()}
    />
  );
}
