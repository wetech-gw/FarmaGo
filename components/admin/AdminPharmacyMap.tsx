"use client";

import PharmacyMap from "@/components/PharmacyMap";
import type { PharmacySpot } from "@/types/pharmacy";

export default function AdminPharmacyMap({ spots }: { spots: PharmacySpot[] }) {
  return <PharmacyMap spots={spots} selectedId={null} onSelect={() => {}} />;
}
