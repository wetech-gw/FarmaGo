import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("privacy.metaTitle") };
}

export default async function PrivacyPage() {
  const t = await getT();

  const sections = [
    { heading: t("privacy.h2_1"), body: t("privacy.p1") },
    { heading: t("privacy.h2_2"), body: t("privacy.p2") },
    { heading: t("privacy.h2_3"), body: t("privacy.p3") },
    { heading: t("privacy.h2_4"), body: t("privacy.p4") },
    { heading: t("privacy.h2_5"), body: t("privacy.p5") },
  ];

  return (
    <>
      <Navbar />
      <main className="container py-5" style={{ maxWidth: "820px" }}>
        <h1 className="fw-bold mb-4">{t("privacy.title")}</h1>
        <p className="text-muted">{t("privacy.updated")}</p>

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