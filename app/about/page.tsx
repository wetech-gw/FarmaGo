import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import AboutImage from "@/components/AboutImage";
import Footer from "@/components/Footer";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const t = await getT();

  const steps = [
    {
      img: "/images/mapa.png",
      icon: "bi-geo-alt-fill",
      title: t("aboutPage.card1Title"),
      text: t("aboutPage.card1Text"),
    },
    {
      img: "/images/detalhes.png",
      icon: "bi-capsule-pill",
      title: t("aboutPage.card2Title"),
      text: t("aboutPage.card2Text"),
    },
    {
      img: "/images/plantao.jpg",
      icon: "bi-clock-history",
      title: t("aboutPage.card3Title"),
      text: t("aboutPage.card3Text"),
    },
  ];

  return (
    <>
      <Navbar />
      <AboutSection />
      <section className="container py-5 howto">
        <div className="text-center mb-5">
          <span className="howto-eyebrow">{t("aboutPage.eyebrow")}</span>
          <h2 className="fw-bold mt-2">{t("aboutPage.title")}</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: "56ch" }}>
            {t("aboutPage.subtitle")}
          </p>
        </div>

        <div className="row g-4">
          {steps.map((item) => (
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