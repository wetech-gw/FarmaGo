import PharmacyFinder from "@/components/PharmacyFinder";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Farmácias Abertas | FarmaGo",
  description:
    "Mapa interativo com todas as farmácias abertas, informações de contacto e medicamentos disponíveis em cada uma.",
};

export default function PharmaciesPage() {
  return <PharmacyFinder showBreadcrumb showExplorer={false} />;
}
