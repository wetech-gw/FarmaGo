import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { prisma } from "@/lib/prisma";
import { medicationPlaceholder } from "@/lib/placeholders";
import { publiclyVisibleMedicationWhere } from "@/lib/medications";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = await getT();

  const medication = await prisma.medication.findFirst({
    where: { id: parseInt(id, 10), ...publiclyVisibleMedicationWhere },
    select: { name: true, dosage: true },
  });

  if (!medication) return { title: t("medDetail.notFound") };

  return { title: `${medication.name} ${medication.dosage} | FarmaGo` };
}

export default async function MedicationDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getT();
  const medication = await prisma.medication.findFirst({
    where: { id: parseInt(id, 10), ...publiclyVisibleMedicationWhere },
    include: {
      stocks: {
        where: { quantity: { gt: 0 }, pharmacy: { status: "approved" } },
        include: { pharmacy: true },
        orderBy: { unitPrice: "asc" },
      },
    },
  });

  // Só o stock é público: um medicamento sem stock disponível em nenhuma
  // farmácia validada não tem página no site, tal como não aparece no catálogo.
  if (!medication) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">
          <h3 className="text-danger">{t("medDetail.notFound")}</h3>
          <Link href="/medications" className="btn btn-success mt-3">
            {t("medDetail.backToCatalog")}
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const totalQuantity = medication.stocks.reduce(
    (total, stock) => total + stock.quantity,
    0,
  );
  const minPrice = Math.min(...medication.stocks.map((s) => Number(s.unitPrice)));

  return (
    <>
      <Navbar />
      <main className="bg-light min-vh-100 py-5">
        <div className="container" style={{ maxWidth: "820px" }}>
          <nav aria-label={t("common.breadcrumb")}>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <BackButton />
              </li>
              <li className="breadcrumb-item active fw-semibold text-dark" aria-current="page">
                {medication.name}
              </li>
            </ol>
          </nav>

          <div className="bg-white border rounded-4 shadow-sm overflow-hidden">
            <div className="row g-0">
              <div className="col-md-5">
                <img
                  src={medication.image ?? medicationPlaceholder(medication.name)}
                  alt={`${medication.name} ${medication.dosage}`}
                  className="w-100 h-100"
                  style={{ objectFit: "cover", minHeight: "260px" }}
                />
              </div>
              <div className="col-md-7 p-4">
                <span className="badge bg-success-subtle text-success-emphasis rounded-pill px-3 py-2">
                  {medication.dosage}
                </span>
                <h1 className="fw-bold mt-2 mb-3">{medication.name}</h1>

                {medication.description && (
                  <p className="text-muted mb-4">{medication.description}</p>
                )}

                {medication.needsPrescription && (
                  <p className="text-warning fw-semibold">
                    <i className="bi bi-file-earmark-medical me-1"></i>
                    {t("medDetail.prescriptionNotice")}
                  </p>
                )}

                <div className="d-flex flex-wrap gap-4 mb-4">
                  <div>
                    <small className="text-muted d-block">{t("common.status")}</small>
                    <strong className="text-success">{t("common.available")}</strong>
                  </div>
                  <div>
                    <small className="text-muted d-block">{t("medDetail.priceFrom")}</small>
                    <strong className="text-success">
                      {`${minPrice.toFixed(0)} FCFA`}
                    </strong>
                  </div>
                  <div>
                    <small className="text-muted d-block">{t("medDetail.unitsInStock")}</small>
                    <strong>{totalQuantity}</strong>
                  </div>
                </div>

                <h2 className="fs-6 fw-bold text-uppercase text-muted">
                  {t("medDetail.availableIn", { count: medication.stocks.length })}
                </h2>
                <ul className="list-group list-group-flush">
                  {medication.stocks.map((stock) => (
                    <li
                      key={stock.id}
                      className="list-group-item d-flex justify-content-between align-items-center px-0"
                    >
                      <Link
                        href={stock.pharmacy.isGuard ? `/guards/${stock.pharmacy.id}` : `/pharmacies/${stock.pharmacy.id}`}
                        className="text-decoration-none fw-semibold text-success"
                      >
                        {stock.pharmacy.name}
                      </Link>
                      <span className="text-success fw-bold">
                        {Number(stock.unitPrice).toFixed(0)} FCFA
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}