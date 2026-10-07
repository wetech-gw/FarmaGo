import { prisma } from "./prisma";
import type { MedicationListItem, MedicationRow } from "@/types/medication";

/**
 * Filtro dos medicamentos que uma farmácia pode escolher para o seu stock:
 * o catálogo global do admin (pharmacyId = null) mais os medicamentos privados
 * da própria farmácia. Serve tanto para listar no formulário como para validar
 * o medicationId recebido no server.
 */
export function selectableMedicationWhere(pharmacyId: number) {
  return { OR: [{ pharmacyId: null }, { pharmacyId }] };
}

export type SelectableMedication = {
  id: number;
  name: string;
  dosage: string;
  image: string | null;
  isPrivate: boolean;
};

/** Catálogo do admin primeiro, depois os privados da farmácia. */
export async function getSelectableMedications(
  pharmacyId: number
): Promise<SelectableMedication[]> {
  const medications = await prisma.medication.findMany({
    where: selectableMedicationWhere(pharmacyId),
    select: { id: true, name: true, dosage: true, image: true, pharmacyId: true },
    orderBy: [{ name: "asc" }, { dosage: "asc" }],
  });

  return medications.map((medication) => ({
    id: medication.id,
    name: medication.name,
    dosage: medication.dosage,
    image: medication.image,
    isPrivate: medication.pharmacyId !== null,
  }));
}

/**
 * Linhas da tabela de medicamentos.
 *
 * Sem `pharmacyId` (admin): só o catálogo global, tudo editável.
 * Com `pharmacyId` (farmácia): o catálogo global do admin mais os medicamentos
 * privados da própria farmácia. As linhas do catálogo aparecem para consulta —
 * a farmácia usa-as no stock, mas não as pode editar nem apagar.
 */
export async function getMedicationRows(
  pharmacyId?: number
): Promise<MedicationRow[]> {
  const medications = await prisma.medication.findMany({
    where: pharmacyId === undefined ? { pharmacyId: null } : selectableMedicationWhere(pharmacyId),
    select: {
      id: true,
      name: true,
      dosage: true,
      image: true,
      description: true,
      needsPrescription: true,
      createdAt: true,
      pharmacyId: true,
      stocks: { where: { quantity: { gt: 0 } }, select: { pharmacyId: true } },
    },
    orderBy: [{ name: "asc" }, { dosage: "asc" }],
  });

  return medications.map((medication) => {
    const isPrivate = medication.pharmacyId !== null;
    return {
      id: medication.id,
      name: medication.name,
      dosage: medication.dosage,
      image: medication.image,
      description: medication.description,
      needsPrescription: medication.needsPrescription,
      createdAt: medication.createdAt,
      isPrivate,
      canEdit: pharmacyId === undefined || isPrivate,
      pharmacyCount: new Set(medication.stocks.map((stock) => stock.pharmacyId)).size,
    };
  });
}

/**
 * Condição de visibilidade pública de um medicamento: só existe para os
 * clientes se alguma farmácia validada tem stock com quantidade > 0.
 * Um medicamento que o admin cadastrou no catálogo, mas que ninguém pôs em
 * stock, é uma ficha interna — não aparece em lado nenhum do site.
 */
export const publiclyVisibleMedicationWhere = {
  stocks: { some: { quantity: { gt: 0 }, pharmacy: { status: "approved" } } },
} as const;

export async function getMedicationsWithAvailability(): Promise<MedicationListItem[]> {
  const medications = await prisma.medication.findMany({
    where: publiclyVisibleMedicationWhere,
    include: {
      stocks: {
        // Só conta farmácias validadas e com quantidade disponível.
        where: { quantity: { gt: 0 }, pharmacy: { status: "approved" } },
        select: { pharmacyId: true, quantity: true, unitPrice: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return medications.map((medication) => {
    const availableStocks = medication.stocks;
    const pharmacyCount = new Set(availableStocks.map((stock) => stock.pharmacyId)).size;
    const totalQuantity = availableStocks.reduce((total, stock) => total + stock.quantity, 0);

    const prices = availableStocks.map((stock) => Number(stock.unitPrice));

    return {
      id:       medication.id,
      name:     medication.name,
      dosage:   medication.dosage,
      image:    medication.image,
      pharmacyCount,
      totalQuantity,
      inStock:  totalQuantity > 0,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      needsPrescription: medication.needsPrescription,
    };
  });
}
