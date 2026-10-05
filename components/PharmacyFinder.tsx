import Link from "next/link";
import Navbar from "@/components/Navbar";
import PharmacyExplorer from "@/components/PharmacyExplorer";
import PharmacyCard from "@/components/PharmacyCard";
import Footer from "@/components/Footer";
import { getPharmacySpots } from "@/lib/pharmacies";
import { prisma } from "@/lib/prisma";

type PharmacyFinderProps = {
  showBreadcrumb?: boolean;
  showExplorer?: boolean;
  showLists?: boolean;
};

export default async function PharmacyFinder({
  showBreadcrumb = false,
  showExplorer = true,
  showLists = true,
}: PharmacyFinderProps) {
  const spots = await getPharmacySpots();
  const openCount = spots.filter((spot) => spot.isOpen).length;
  const guardCount = spots.filter((spot) => spot.isGuard).length;
  const [pharmacies, guards] = await Promise.all([
    prisma.pharmacy.findMany({
      where: { status: "approved", isGuard: false },
      orderBy: { id: "asc" },
    }),
    prisma.pharmacy.findMany({
      where: { status: "approved", isGuard: true },
      orderBy: { id: "asc" },
    }),
  ]);

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

        {showExplorer && <PharmacyExplorer spots={spots} />}
      </main>

      {showLists && (
      <>
      <section className="container py-5">
        <div className="mb-4">
          <h2 className="fw-bold text-dark m-0 pb-2 text-uppercase" style={{ fontSize: "1.75rem" }}>
            FARMÁCIAS
          </h2>
          <div style={{ height: "4px", width: "160px", backgroundColor: "#198754" }}></div>
        </div>
        <div className="row g-4 row-cols-2 row-cols-md-4">
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="col">
              <PharmacyCard pharmacy={pharmacy} />
            </div>
          ))}
        </div>
      </section>

      <section className="container py-5" style={{ backgroundColor: "#a3cfa4" }}>
        <div className="mb-4">
          <h2 className="fw-bold text-dark m-0 pb-2 text-uppercase" style={{ fontSize: "1.75rem" }}>
            FARMÁCIAS DE PLANTÃO
          </h2>
          <div style={{ height: "4px", width: "340px", backgroundColor: "#198754" }}></div>
        </div>
        <div className="row g-4 row-cols-2 row-cols-md-4">
          {guards.map((pharmacy) => (
            <div key={pharmacy.id} className="col">
              <div className="card border-0 rounded-3 shadow-sm h-100 bg-white">
                <div style={{ height: "150px" }}>
                  <img
                    src={pharmacy.image ?? "/images/default-pharmacy.svg"}
                    className="w-100 h-100 rounded-top-3"
                    style={{ objectFit: "cover" }}
                    alt={pharmacy.name}
                  />
                </div>
                <div className="card-body d-flex flex-column p-3">
                  <h5 className="card-title text-success fw-semibold mb-2">{pharmacy.name}</h5>
                  <p className="card-text text-muted small mb-4">{pharmacy.hours}</p>
                  <Link
                    href={`/guards/${pharmacy.id}`}
                    className="btn btn-success w-100 rounded-pill fw-semibold mt-auto text-decoration-none d-flex align-items-center justify-content-center"
                  >
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    Mais detalhes
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </>
      )}

      <Footer />
    </>
  );
}
