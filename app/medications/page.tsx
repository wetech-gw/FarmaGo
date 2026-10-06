import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MedicationsShowcase from "@/components/MedicationsShowcase";
import { getMedicationsWithAvailability } from "@/lib/medications";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("medsPage.metaTitle"), description: t("medsPage.metaDescription") };
}

export default async function MedicationsPage() {
  const t = await getT();
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
            <nav aria-label={t("common.breadcrumb")}>
              <ol className="breadcrumb mb-2">
                <li className="breadcrumb-item">
                  <Link href="/" className="text-white-50">
                    {t("home")}
                  </Link>
                </li>
                <li className="breadcrumb-item active text-white" aria-current="page">
                  {t("medsPage.breadcrumb")}
                </li>
              </ol>
            </nav>

            <h1 className="fw-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
              {t("medsPage.title")}
            </h1>
            <p className="mb-0 text-white-50" style={{ maxWidth: "62ch" }}>
              {t("medsPage.description")}
            </p>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <Link
                href="/pharmacies"
                className="btn rounded-pill px-3 py-2 fw-semibold bg-white d-inline-flex align-items-center gap-2"
                style={{ color: "#0d8b0c" }}
              >
                <i className="bi bi-geo-alt-fill"></i>
                {t("medsPage.findPharmacies")}
              </Link>
              <Link
                href="/guards"
                className="btn rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 border border-2"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,.55)" }}
              >
                <i className="bi bi-clock-history"></i>
                {t("guardPharmacies")}
              </Link>
            </div>
          </div>
        </section>

        <MedicationsShowcase medications={medications} />
      </main>

      <Footer />
    </>
  );
}