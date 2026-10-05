import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPharmacySpots } from "@/lib/pharmacies";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Farmácias de Plantão | FarmaGo",
  description:
    "Todas as farmácias de plantão, com horário, contactos e medicamentos disponíveis.",
};

export default async function GuardsPage() {
  const spots = await getPharmacySpots();
  const guardCount = spots.filter((spot) => spot.isGuard).length;

  return (
    <>
      <Navbar />

      <main className="bg-white">
        <section
          className="position-relative py-5 text-white"
          style={{
            background:
              "linear-gradient(120deg, #8a0f0e 0%, #b31212 55%, #6b0d0c 100%)",
          }}
        >
          <div className="container position-relative">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-2">
                <li className="breadcrumb-item">
                  <Link href="/" className="text-white-50">
                    Início
                  </Link>
                </li>
                <li className="breadcrumb-item active text-white" aria-current="page">
                  Farmácias de Plantão
                </li>
              </ol>
            </nav>

            <h1 className="fw-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
              Farmácias de Plantão
            </h1>
            <p className="mb-4 text-white-50" style={{ maxWidth: "62ch" }}>
              Veja todas as farmácias de plantão disponíveis, com horário,
              contactos e os medicamentos em stock.
            </p>

            <div className="d-flex flex-wrap gap-2">
              <span className="px-hero-pill">
                <i className="bi bi-clock-history"></i>
                {guardCount} de plantão agora
              </span>
            </div>
          </div>
        </section>

        <section className="container py-5">
          <div className="row g-4 row-cols-2 row-cols-md-4">
            {spots
              .filter((spot) => spot.isGuard)
              .map((pharmacy) => (
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
      </main>

      <Footer />
    </>
  );
}
