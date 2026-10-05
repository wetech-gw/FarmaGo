import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import AboutImage from "@/components/AboutImage";
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
      <section className="container py-5 howto">
        <div className="text-center mb-5">
          <span className="howto-eyebrow">Como funciona</span>
          <h2 className="fw-bold mt-2">FarmaGo na palma da mão</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: "56ch" }}>
            Encontre a farmácia mais próxima, consulte medicamentos e detalhes em
            poucos toques.
          </p>
        </div>

        <div className="row g-4">
          {[
            {
              img: "/images/mapa.png",
              icon: "bi-geo-alt-fill",
              title: "Farmácias perto de si",
              text: "Veja no mapa as farmácias mais próximas abertas neste momento.",
            },
            {
              img: "/images/detalhes.png",
              icon: "bi-capsule-pill",
              title: "Detalhes do medicamento",
              text: "Consulte preço, stock e farmácias que vendem cada medicamento.",
            },
            {
              img: "/images/plantao.jpg",
              icon: "bi-clock-history",
              title: "Farmácias de plantão",
              text: "Saiba sempre que farmácia está de plantão ao seu lado.",
            },
          ].map((item) => (
            <div key={item.title} className="col-md-4">
              <div className="howto-card">
                <AboutImage src={item.img} alt={item.title} icon={item.icon} />
                <h3 className="h6 fw-bold mt-3 mb-1">{item.title}</h3>
                <p className="text-muted small mb-0">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
