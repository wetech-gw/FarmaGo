import { prisma } from "./prisma";
import type { MedicationListItem } from "@/types/medication";

export async function getMedicationsWithAvailability(): Promise<MedicationListItem[]> {
  const medications = await prisma.medication.findMany({
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
    };
  });
}
