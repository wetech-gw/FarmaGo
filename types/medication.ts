export interface MedicationListItem {
  id: number;
  name: string;
  dosage: string;
  image: string | null;
  pharmacyCount: number;
  totalQuantity: number;
  inStock: boolean;
  minPrice: number | null;
  needsPrescription?: boolean;
}

export type MedicationSort = "name" | "availability" | "name-desc";

/**
 * Linha da tabela de medicamentos, partilhada entre o admin e a farmácia.
 * O admin vê o catálogo global; a farmácia vê o catálogo global mais os seus
 * medicamentos privados, e por isso só pode editar/apagar os seus.
 */
export interface MedicationRow {
  id: number;
  name: string;
  dosage: string;
  image: string | null;
  description: string | null;
  needsPrescription: boolean;
  createdAt: Date;
  /** false = medicamento do catálogo global, só o admin mexe nele. */
  canEdit: boolean;
  /** true = criado pela própria farmácia. */
  isPrivate: boolean;
  /** Farmácias distintas que têm este medicamento em stock. */
  pharmacyCount: number;
}
