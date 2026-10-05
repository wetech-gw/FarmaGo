export interface MedicationListItem {
  id: number;
  name: string;
  dosage: string;
  image: string | null;
  pharmacyCount: number;
  totalQuantity: number;
  inStock: boolean;
  minPrice: number | null;
}

export type AvailabilityFilter = "all" | "available" | "unavailable";

export type MedicationSort = "name" | "availability" | "name-desc";
