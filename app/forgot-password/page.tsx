import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("forgot.metaTitle"), description: t("forgot.metaDescription") };
}

export default async function ForgotPasswordPage() {
  const t = await getT();

  return (
    <div className="px-auth-page">
      <div className="px-auth-card">
        <div className="text-center mb-3">
          <img src="/images/Logo.png" alt="FarmaGo" style={{ height: "50px" }} />
        </div>

        <h1 className="h4 fw-bold mb-1 mt-3">{t("forgot.title")}</h1>
        <p className="text-secondary small mb-4">
          {t("forgot.subtitle")}
        </p>

        <ForgotPasswordForm />

        <p className="text-center small text-secondary mt-4 mb-0">
          <Link href="/login" className="fw-semibold text-decoration-none">
            {t("forgot.backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}