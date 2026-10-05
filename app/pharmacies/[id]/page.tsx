import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PharmacyDetailPageView from "@/components/PharmacyDetailPageView";
import { getPharmacySpot } from "@/lib/pharmacies";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PharmacyDetailPage({ params }: Props) {
  const { id } = await params;
  const pharmacy = await getPharmacySpot(parseInt(id, 10), false);

  if (!pharmacy) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">
          <h3 className="text-danger">Farmácia não encontrada</h3>
          <Link href="/" className="btn btn-success mt-3">Voltar ao início</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-light min-vh-100 py-5">
        <div className="container" style={{ maxWidth: "720px" }}>
          <div className="bg-white border rounded-4 shadow-sm overflow-hidden">
            <PharmacyDetailPageView spot={pharmacy} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
