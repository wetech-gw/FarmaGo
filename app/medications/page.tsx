import Link from "next/link";
import Navbar from "@/components/Navbar";
import MedicationsShowcase from "@/components/MedicationsShowcase";
import Footer from "@/components/Footer";
import { getMedicationsWithAvailability } from "@/lib/medications";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Medicamentos | FarmaxGo",
  description:
    "Catálogo completo de medicamentos disponíveis FarmaxGo, com pesquisa por nome e dosagem.",
};

export default async function MedicationsPage() {
  const medications = await getMedicationsWithAvailability();

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
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-2">
                <li className="breadcrumb-item">
                  <Link href="/" className="text-white-50">
                    Início
                  </Link>
                </li>
                <li className="breadcrumb-item active text-white" aria-current="page">
                  Medicamentos
                </li>
              </ol>
            </nav>

            <h1 className="fw-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
              Catálogo de Medicamentos
            </h1>
            <p className="mb-0 text-white-50" style={{ maxWidth: "62ch" }}>
              Pesquise por nome ou dosagem, filtre por disponibilidade e descubra em
              quantas farmácias cada medicamento pode ser encontrado.
            </p>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <Link
                href="/pharmacies"
                className="btn rounded-pill px-3 py-2 fw-semibold bg-white d-inline-flex align-items-center gap-2"
                style={{ color: "#0d8b0c" }}
              >
                <i className="bi bi-geo-alt-fill"></i>
                Encontrar farmácias
              </Link>
              <Link
                href="/guards"
                className="btn rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 border border-2"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,.55)" }}
              >
                <i className="bi bi-clock-history"></i>
                Farmácias de plantão
              </Link>
            </div>
          </div>
        </section>

        <MedicationsShowcase
          medications={medications}
          eyebrow="Farmácias parceiras"
          title="Explore o"
          accent="catálogo completo"
          description="Cada medicamento mostra o estado de stock em tempo real nas farmácias parceiras do FarmaxGo."
        />
      </main>

      <Footer />
    </>
  );
}
