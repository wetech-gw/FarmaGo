import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardWithoutPharmacyPage() {
  const t = await getT();
  const user = await requireUser();

  return (
    <div className="px-auth-page">
      <div className="px-auth-card text-center">
        <div className="px-auth-icon mx-auto mb-4">
          <i className="bi bi-shop"></i>
        </div>

        <h1 className="h5 fw-bold mb-2">{t("dash.noPharmacyTitle")}</h1>

        <p className="text-secondary small mb-4">
          {t("dash.noPharmacyText", { email: user.email })}
        </p>

        <div className="d-grid gap-2">
          <Link href="/pharmacies" className="btn btn-success rounded-3 py-2">
            <i className="bi bi-geo-alt me-2"></i>
            {t("dash.viewPharmacies")}
          </Link>
          <Link href="/dashboard" className="btn btn-outline-secondary rounded-3 py-2">
            {t("dash.backToDashboard")}
          </Link>
        </div>
      </div>
    </div>
  );
}