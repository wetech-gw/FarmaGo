import Link from "next/link";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardWithoutPharmacyPage() {
  const user = await requireUser();

  return (
    <div className="px-auth-page">
      <div className="px-auth-card text-center">
        <div className="px-auth-icon mx-auto mb-4">
          <i className="bi bi-shop"></i>
        </div>

        <h1 className="h5 fw-bold mb-2">Ainda não tem farmácia associada</h1>

        <p className="text-secondary small mb-4">
          A sua conta <strong>{user.email}</strong> está activa, mas ainda não
          existe uma farmácia registada. O nosso administrador valida cada
          farmácia presencialmente antes de ela aparecer no site.
        </p>

        <div className="d-grid gap-2">
          <Link href="/pharmacies" className="btn btn-success rounded-3 py-2">
            <i className="bi bi-geo-alt me-2"></i>Ver farmácias
          </Link>
          <Link href="/dashboard" className="btn btn-outline-secondary rounded-3 py-2">
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}