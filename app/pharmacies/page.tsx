import type { Metadata } from "next";
import PharmacyFinder from "@/components/PharmacyFinder";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("heroTitle"), description: t("heroText") };
}

export default function PharmaciesPage() {
  return <PharmacyFinder showBreadcrumb showExplorer={false} />;
}