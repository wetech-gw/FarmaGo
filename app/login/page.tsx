import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, homePathForRole } from "@/lib/auth";
import LoginForm from "./LoginForm";
import Footer from "@/components/Footer";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("login.metaTitle"), description: t("login.metaDescription") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const t = await getT();
  const user = await getCurrentUser();

  if (user) {
    redirect(homePathForRole(user.role));
  }

  return (
    <>
    <div className="px-auth-page">
      <div className="px-auth-card">
        <div className="text-center mb-3">
          <img src="/images/Logo.png" alt="FarmaGo" style={{ height: "50px" }} />
        </div>

        <h1 className="h4 fw-bold mb-1 mt-3">{t("login.title")}</h1>
        <p className="text-secondary small mb-4">
          {t("login.subtitle")}
        </p>

        {error && (
          <div className="alert alert-danger rounded-3 small py-2 px-3">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {error}
          </div>
        )}

        <LoginForm next={next ?? ""} />

        <p className="text-center small text-secondary mt-4 mb-0">
          {t("login.noAccount")} {" "}
          <Link href="/register" className="fw-semibold text-decoration-none">
            {t("login.registerPharmacy")}
          </Link>
        </p>
      </div>
    </div>
      <Footer />
    </>
  );
}