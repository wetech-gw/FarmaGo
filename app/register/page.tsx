import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Registar Farmácia | FarmaGo",
  description:
    "Crie a conta da sua farmácia no FarmaGo. A validação é feita presencialmente pela nossa equipa.",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin/dashboard" : "/dashboard");

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
                  Registar a minha farmácia
                </h1>
                <p className="text-secondary small mb-4">
                  Crie a conta e registe a farmácia num só passo. Depois da nossa visita
                  presencial, a farmácia passa a aparecer no mapa e no catálogo de medicamentos.
                </p>

                <RegisterForm />

                <p className="text-center small text-secondary mt-4 mb-0">
                  Já tem conta?{" "}
                  <Link href="/login" className="fw-semibold text-decoration-none">
                    Entrar
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
