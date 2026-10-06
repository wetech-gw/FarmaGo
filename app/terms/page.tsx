import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("terms.metaTitle") };
}

export default async function TermsPage() {
  const t = await getT();

  const sections = [
    { heading: t("terms.h2_1"), body: t("terms.p1") },
    { heading: t("terms.h2_2"), body: t("terms.p2") },
    { heading: t("terms.h2_3"), body: t("terms.p3") },
    { heading: t("terms.h2_4"), body: t("terms.p4") },
    { heading: t("terms.h2_5"), body: t("terms.p5") },
  ];

  return (
    <>
      <Navbar />
      <main className="container py-5" style={{ maxWidth: "820px" }}>
        <h1 className="fw-bold mb-4">{t("terms.title")}</h1>
        <p className="text-muted">{t("terms.updated")}</p>

        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="h5 fw-bold mt-4">{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}