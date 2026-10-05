import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Política de Privacidade | FarmaGo",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="container py-5" style={{ maxWidth: "820px" }}>
        <h1 className="fw-bold mb-4">Política de Privacidade</h1>
        <p className="text-muted">Última atualização: outubro de 2026.</p>

        <h2 className="h5 fw-bold mt-4">1. Dados que recolhemos</h2>
        <p>
          Recolhemos os dados necessários ao funcionamento da plataforma, como nome,
          email, dados de contacto e localização aproximada quando o utilizador a
          partilha para encontrar farmácias próximas.
        </p>

        <h2 className="h5 fw-bold mt-4">2. Como usamos os dados</h2>
        <p>
          Os dados são usados para gerir contas, apresentar farmácias e medicamentos,
          melhorar o serviço e comunicar informação relevante sobre a conta.
        </p>

        <h2 className="h5 fw-bold mt-4">3. Partilha de dados</h2>
        <p>
          Não vendemos dados pessoais. Apenas partilhamos informação com parceiros
          estritamente necessários à prestação do serviço.
        </p>

        <h2 className="h5 fw-bold mt-4">4. Segurança</h2>
        <p>
          Aplicamos medidas técnicas e organizativas para proteger os dados contra
          acessos não autorizados.
        </p>

        <h2 className="h5 fw-bold mt-4">5. Os seus direitos</h2>
        <p>
          Pode solicitar acesso, correção ou eliminação dos seus dados contactando-nos
          através da página de contactos.
        </p>
      </main>
      <Footer />
    </>
  );
}
