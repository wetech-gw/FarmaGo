import type { ExtractedMedicine } from "./ai-vision";
import type { MedicationListItem } from "@/types/medication";

/**
 * Ligação entre os medicamentos lidos na receita e o catálogo FarmaGo.
 *
 * Corre no browser (o catálogo vem do Server Component como prop), por isso
 * não pode importar nada do lado do servidor. A comparação é propositadamente
 * tolerante: receitas escrevem "Paracetamol 500mg", "PARACETAMOL", ou o nome
 * da marca, e o catálogo pode ter só o genérico.
 */

export type ScanMatch = {
  /** Medicamento como foi lido na receita. */
  extracted: ExtractedMedicine;
  /** Medicamento do catálogo correspondente, ou null se não houver match. */
  match: MedicationListItem | null;
  /** Confiança do match, de 0 a 1 (0 quando não há match). */
  score: number;
};

/** Pontuação mínima para considerar que um nome da receita bate com o catálogo. */
const MATCH_THRESHOLD = 0.62;

/** Palavras que não ajudam a distinguir medicamentos. */
const STOP_WORDS = new Set([
  "de",
  "do",
  "da",
  "dos",
  "das",
  "com",
  "sem",
  "para",
  "mg",
  "ml",
  "g",
  "kg",
  "mcg",
  "ui",
  "cp",
  "comp",
  "comprimido",
  "comprimidos",
  "capsula",
  "capsulas",
  "xarope",
  "soluçao",
  "solucao",
  "injetavel",
  "pomada",
  "creme",
  "gotas",
  "supositorio",
  "supositorios",
  "saquetas",
  "sache",
  "ampola",
  "ampolas",
  "frascos",
  "frasco",
  "caixa",
  "caixas",
  "cx",
  "un",
  "unid",
  "unidades",
]);

export function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function significantTokens(value: string): string[] {
  return normalizeName(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;

  // Um nome contido no outro cobre "Paracetamol 500mg" vs "Paracetamol".
  if (a.includes(b) || b.includes(a)) {
    const shorter = Math.min(a.length, b.length);
    const longer = Math.max(a.length, b.length);
    return 0.7 + 0.3 * (shorter / longer);
  }

  const tokensA = significantTokens(a);
  const tokensB = significantTokens(b);
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setB = new Set(tokensB);
  const shared = tokensA.filter((token) => setB.has(token)).length;
  if (shared === 0) return 0;

  return shared / Math.max(tokensA.length, tokensB.length);
}

/** Escolhe, entre os candidatos, o medicamento do catálogo mais plausível. */
function bestMatch(name: string, catalog: MedicationListItem[]): { item: MedicationListItem; score: number } | null {
  let best: { item: MedicationListItem; score: number } | null = null;

  for (const item of catalog) {
    const nameScore = similarity(name, item.name);
    const dosageScore = similarity(name, `${item.name} ${item.dosage}`);
    const score = Math.max(nameScore, dosageScore * 0.95);

    if (score < MATCH_THRESHOLD) continue;

    if (
      best === null ||
      score > best.score ||
      // Empate: prefere quem tem stock, depois quem tem mais farmácias.
      (score === best.score &&
        (Number(item.inStock) - Number(best.item.inStock) ||
          item.pharmacyCount - best.item.pharmacyCount) > 0)
    ) {
      best = { item, score };
    }
  }

  return best;
}

/**
 * Liga cada medicamento extraído da receita ao catálogo. O nome do match é o
 * do catálogo (corrige abreviações e maiúsculas); quando não há match, o
 * utilizador vê o nome original lido na receita.
 */
export function matchMedicines(
  extracted: ExtractedMedicine[],
  catalog: MedicationListItem[]
): ScanMatch[] {
  return extracted.map((medicine) => {
    const best = bestMatch(medicine.name, catalog);
    return {
      extracted: medicine,
      match: best?.item ?? null,
      score: best ? Number(best.score.toFixed(2)) : 0,
    };
  });
}
