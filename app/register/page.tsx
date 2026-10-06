import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser, homePathForRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("register.metaTitle"), description: t("register.metaDescription") };
}

export default async function RegisterPage() {
  const t = await getT();
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role));

  return (
    <>
      <Navbar />

      <main className="bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div className="card border-0 rounded-4 shadow-sm bg-white p-4 p-lg-5">
                <h1 className="h4 fw-bold mb-1">
                  <i className="bi bi-shop-window me-2" style={{ color: "#0f8a0e" }}></i>
                  {t("register.title")}
                </h1>
                <p className="text-secondary small mb-4">
                  {t("register.subtitle")}
                </p>

                <RegisterForm />

                <p className="text-center small text-secondary mt-4 mb-0">
                  {t("register.hasAccount")} {" "}
                  <Link href="/login" className="fw-semibold text-decoration-none">
                    {t("login")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}