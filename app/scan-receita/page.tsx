import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReceitaScanner from "@/components/scan/ReceitaScanner";
import { getMedicationsWithAvailability } from "@/lib/medications";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("scanPage.metaTitle"), description: t("scanPage.metaDescription") };
}

export default async function ScanReceitaPage() {
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
                  {t("scanPage.breadcrumb")}
                </li>
              </ol>
            </nav>

            <h1 className="fw-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
              <i className="bi bi-upc-scan me-2"></i>
              {t("scanPage.title")}
            </h1>
            <p className="mb-0 text-white-50" style={{ maxWidth: "62ch" }}>
              {t("scanPage.description")}
            </p>
          </div>
        </section>

        <div className="py-5">
          <div className="container">
            <div className="row g-3 mb-4">
              {(["scan.step1", "scan.step2", "scan.step3"] as const).map((key, index) => (
                <div className="col-12 col-md-4" key={key}>
                  <div className="d-flex align-items-start gap-3">
                    <span
                      className="badge rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: "34px", height: "34px", backgroundColor: "#0f8a0e" }}
                    >
                      {index + 1}
                    </span>
                    <p className="small text-secondary mb-0">{t(key)}</p>
                  </div>
                </div>
              ))}
            </div>

            <ReceitaScanner medications={medications} />

            <p className="small text-secondary mt-4 mb-0">
              <i className="bi bi-info-circle me-1"></i>
              {t("scan.disclaimer")}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
