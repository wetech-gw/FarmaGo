"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireInspector } from "@/lib/auth";
import { storeMessage } from "@/lib/i18n";

export async function setGuardDuty(formData: FormData): Promise<void> {
  await requireInspector();
  const id = Number(formData.get("id"));
  const isGuard = String(formData.get("isGuard")) === "1";

  await prisma.pharmacy.update({ where: { id }, data: { isGuard } });

  // O texto é guardado como chave para poder ser traduzido no idioma de quem lê.
  const message = storeMessage(isGuard ? "insp.dutyOnMessage" : "insp.dutyOffMessage");

  await prisma.notification.upsert({
    where: { pharmacyId: id },
    update: {
      message,
      isRead: false,
      createdAt: new Date(),
    },
    create: {
      pharmacyId: id,
      message,
    },
  });

  revalidatePath("/inspecao");
  revalidatePath("/inspecao/plantoes");
  revalidatePath("/inspecao/notificacoes");
  revalidatePath("/dashboard");
  revalidatePath("/pharmacies");
  revalidatePath("/guards");
  revalidatePath("/");
  redirect("/inspecao/plantoes");
}