import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Entrar | FarmaGo",
  description: "Aceda à sua conta de farmacêutico ou de administrador.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    redirect(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
  }

  return (
    <>
    <div className="px-auth-page">
      <div className="px-auth-card">
        <div className="text-center mb-3">
          <img src="/images/Logo.png" alt="FarmaGo" style={{ height: "50px" }} />
        </div>

        {/*<span className="px-auth-badge">
          <i className="bi bi-box-arrow-in-right"></i>
        </span>*/}

        <h1 className="h4 fw-bold mb-1 mt-3">Entrar na conta</h1>
        <p className="text-secondary small mb-4">
          Credenciais de farmacêutico (dashboard da farmácia) ou de administrador.
        </p>

        {error && (
          <div className="alert alert-danger rounded-3 small py-2 px-3">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {error}
          </div>
        )}

        <LoginForm next={next ?? ""} />

        <p className="text-center small text-secondary mt-4 mb-0">
          Ainda não tem conta?{" "}
          <Link href="/register" className="fw-semibold text-decoration-none">
            Registar a minha farmácia
          </Link>
        </p>
      </div>
    </div>
      <Footer />
    </>
  );
}
