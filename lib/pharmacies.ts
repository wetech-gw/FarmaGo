import { prisma } from "./prisma";
import type { PharmacySpot } from "@/types/pharmacy";

export async function getPharmacySpot(id: number, isGuard: boolean): Promise<PharmacySpot | null> {
  const pharmacy = await prisma.pharmacy.findFirst({
    where: { id, status: "approved", isGuard, isActive: true },
    include: { stocks: { include: { medication: true } } },
  });

  if (!pharmacy) return null;

  return {
    id:        pharmacy.id,
    name:      pharmacy.name,
    image:     pharmacy.image,
    address:   pharmacy.address.toString(),
    phone:     pharmacy.phone,
    schedule:  pharmacy.schedule,
    hours:     pharmacy.hours,
    latitude:  pharmacy.latitude,
    longitude: pharmacy.longitude,
    isOpen:    pharmacy.isOpen,
    isGuard:   pharmacy.isGuard,
    medications: pharmacy.stocks
      .filter((stock) => stock.quantity > 0)
      .map((stock) => ({
        id:         stock.medication.id,
        name:       stock.medication.name,
        dosage:     stock.medication.dosage,
        image:      stock.medication.image,
        quantity:   stock.quantity,
        expiryDate: stock.expiryDate.toISOString(),
        price:      Number(stock.unitPrice),
        needsPrescription: stock.medication.needsPrescription,
      })),
  };
}

export async function getPharmacySpots(): Promise<PharmacySpot[]> {
  const pharmacies = await prisma.pharmacy.findMany({
    // Só as farmácias validadas presencialmente aparecem no site público.
    where: { status: "approved", isActive: true },
    include: { stocks: { include: { medication: true } } },
    orderBy: [{ isOpen: "desc" }, { name: "asc" }],
  });

  return pharmacies.map((pharmacy) => ({
    id:        pharmacy.id,
    name:      pharmacy.name,
    image:     pharmacy.image,
    address:   pharmacy.address.toString(),
    phone:     pharmacy.phone,
    schedule:  pharmacy.schedule,
    hours:     pharmacy.hours,
    latitude:  pharmacy.latitude,
    longitude: pharmacy.longitude,
    isOpen:    pharmacy.isOpen,
    isGuard:   pharmacy.isGuard,
    medications: pharmacy.stocks
      .filter((stock) => stock.quantity > 0)
      .map((stock) => ({
        id:         stock.medication.id,
        name:       stock.medication.name,
        dosage:     stock.medication.dosage,
        image:      stock.medication.image,
        quantity:   stock.quantity,
        expiryDate: stock.expiryDate.toISOString(),
        price:      Number(stock.unitPrice),
        needsPrescription: stock.medication.needsPrescription,
      })),
  }));
}
