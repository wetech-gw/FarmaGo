import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = {
  title: "Recuperar palavra-passe | FarmaGo",
  description: "Recupere o acesso à sua conta FarmaGo.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="px-auth-page">
      <div className="px-auth-card">
        <div className="text-center mb-3">
          <img src="/images/Logo.png" alt="FarmaGo" style={{ height: "50px" }} />
        </div>

        <h1 className="h4 fw-bold mb-1 mt-3">Recuperar palavra-passe</h1>
        <p className="text-secondary small mb-4">
          Introduza o email da sua conta para validar e definir uma nova palavra-passe.
        </p>

        <ForgotPasswordForm />

        <p className="text-center small text-secondary mt-4 mb-0">
          <Link href="/login" className="fw-semibold text-decoration-none">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
