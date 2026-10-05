import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Termos e Condições | FarmaGo",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="container py-5" style={{ maxWidth: "820px" }}>
        <h1 className="fw-bold mb-4">Termos e Condições</h1>
        <p className="text-muted">Última atualização: outubro de 2026.</p>

        <h2 className="h5 fw-bold mt-4">1. Aceitação</h2>
        <p>
          Ao utilizar o FarmaGo, aceita estes termos. Se não concordar, não utilize
          a plataforma.
        </p>

        <h2 className="h5 fw-bold mt-4">2. Serviço</h2>
        <p>
          O FarmaGo agrega informação sobre farmácias, horários de plantão e stock
          de medicamentos. A disponibilidade e os preços podem variar em cada
          farmácia.
        </p>

        <h2 className="h5 fw-bold mt-4">3. Contas</h2>
        <p>
          É responsável pela confidencialidade das suas credenciais e por toda a
          atividade na sua conta.
        </p>

        <h2 className="h5 fw-bold mt-4">4. Uso proibido</h2>
        <p>
          Não é permitido usar a plataforma para fins ilegais, tentativas de acesso
          não autorizado ou publicação de informação falsa.
        </p>

        <h2 className="h5 fw-bold mt-4">5. Limitação de responsabilidade</h2>
        <p>
          O FarmaGo não substitui o aconselhamento médico ou farmacêutico
          profissional.
        </p>
      </main>
      <Footer />
    </>
  );
}
