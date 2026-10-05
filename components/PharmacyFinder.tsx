import Link from "next/link";
import Navbar from "@/components/Navbar";
import PharmacyExplorer from "@/components/PharmacyExplorer";
import Footer from "@/components/Footer";
import { getPharmacySpots } from "@/lib/pharmacies";

type PharmacyFinderProps = {
  showBreadcrumb?: boolean;
};

export default async function PharmacyFinder({
  showBreadcrumb = false,
}: PharmacyFinderProps) {
  const spots = await getPharmacySpots();
  const openCount = spots.filter((spot) => spot.isOpen).length;
  const guardCount = spots.filter((spot) => spot.isGuard).length;

  return (
    <>
      <Navbar />

      <main className="bg-white">
        <section
          className="position-relative py-5 text-white"
          style={{
            background:
              "linear-gradient(120deg, #0f8a0e 0%, #15b312 55%, #0d6b0c 100%)",
          }}
        >
          <div className="container position-relative">
            {showBreadcrumb && (
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-2">
                  <li className="breadcrumb-item">
                    <Link href="/" className="text-white-50">
                      Início
                    </Link>
                  </li>
                  <li className="breadcrumb-item active text-white" aria-current="page">
                    Farmácias
                  </li>
                </ol>
              </nav>
            )}

            <h1 className="fw-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
              Farmácias Abertas Perto de Si
            </h1>
            <p className="mb-4 text-white-50" style={{ maxWidth: "62ch" }}>
              Explore o mapa, veja o que está aberto neste momento e clique numa
              farmácia para consultar o horário, os contactos e todos os
              medicamentos disponíveis em stock.
            </p>

            <div className="d-flex flex-wrap gap-2">
              <span className="px-hero-pill">
                <i className="bi bi-check2-circle"></i>
                {openCount} abertas agora
              </span>
              <span className="px-hero-pill">
                <i className="bi bi-geo-alt"></i>
                {spots.length} farmácias no mapa
              </span>
              <span className="px-hero-pill">
                <i className="bi bi-clock-history"></i>
                {guardCount} de plantão
              </span>
            </div>
          </div>
        </section>

        <PharmacyExplorer spots={spots} />
      </main>

      <Footer />
    </>
  );
}
