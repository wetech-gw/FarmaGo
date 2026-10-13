import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartView from "@/components/scan/CartView";
import { getMedicationsWithAvailability } from "@/lib/medications";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("cart.metaTitle"), description: t("cart.metaDescription") };
}

export default async function CarrinhoPage() {
  const t = await getT();
  const catalog = await getMedicationsWithAvailability();

  return (
    <>
      <Navbar />

      <main className="bg-white">
        <section
          className="position-relative py-5 text-white"
          style={{
            background: "linear-gradient(120deg, #0f8a0e 0%, #15b312 55%, #0d6b0c 100%)",
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
                  {t("cart.breadcrumb")}
                </li>
              </ol>
            </nav>

            <div className="d-flex flex-wrap justify-content-between align-items-end gap-3">
              <div>
                <h1 className="fw-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
                  <i className="bi bi-cart3 me-2"></i>
                  {t("cart.title")}
                </h1>
                <p className="mb-0 text-white-50" style={{ maxWidth: "62ch" }}>
                  {t("cart.pageDescription")}
                </p>
              </div>
              <Link
                href="/scan-receita"
                className="btn rounded-pill px-3 py-2 fw-semibold bg-white d-inline-flex align-items-center gap-2"
                style={{ color: "#0d8b0c" }}
              >
                <i className="bi bi-upc-scan"></i>
                {t("cart.startScan")}
              </Link>
            </div>
          </div>
        </section>

        <section className="py-5">
          <div className="container">
            <CartView catalog={catalog} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
