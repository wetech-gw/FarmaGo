import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import PharmacyCard from "@/components/PharmacyCard";
import Link from "next/link";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [pharmacies, guards] = await Promise.all([
    prisma.pharmacy.findMany({ where: { isGuard: false }, orderBy: { id: "asc" } }),
    prisma.pharmacy.findMany({ where: { isGuard: true },  orderBy: { id: "asc" } }),
  ]);

  return (
    <>
      <Navbar />
      <AboutSection />
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
      <Footer />
    </>
  );
}
