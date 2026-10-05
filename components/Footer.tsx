import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 font-sans" style={{ backgroundColor: "#0f1115 !important" }}>
      <div className="container">
        
        {/* Bloco Superior: Logo, Descrição e Links */}
        <div className="row gy-4 border-bottom border-secondary pb-4 mb-4" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
          
          {/* Coluna 1: Logo e Descrição */}
          <div className="col-12 col-lg-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="text-success fw-bold fs-3">FarmaGo</span>
              {/* Ícone de pílula duplo simulado em verde */}
              <i className="bi bi-capsule-capsule text-success fs-3"></i>
            </div>
            <p className="text-secondary lh-base m-0" style={{ maxWidth: "450px", fontSize: "0.95rem" }}>
              Otimize o seu acesso a medicamentos com a nossa aplicação web.
              Encontre e localize farmácias próximas rapidamente.
              Cuidados de saúde fáceis e eficientes ao seu alcance!
            </p>
          </div>

          {/* Coluna 2: Nos Services */}
          <div className="col-6 col-lg-3">
            <h6 className="fw-bold mb-3 text-white">Os nossos serviços</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.9rem" }}>
              <li><Link href="/medications" className="text-secondary text-decoration-none hover-success">Medicamentos</Link></li>
              <li><Link href="/pharmacies" className="text-secondary text-decoration-none hover-success">Farmácias</Link></li>
              <li><Link href="/guards" className="text-secondary text-decoration-none hover-success">Farmácias de serviço</Link></li>
              <li><Link href="/parapharmacy" className="text-secondary text-decoration-none hover-success">Parafarmácias</Link></li>
            </ul>
          </div>

          {/* Coluna 3: A propos */}
          <div className="col-6 col-lg-3">
            <h6 className="fw-bold mb-3 text-white">Sobre</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.9rem" }}>
              <li><Link href="/about" className="text-secondary text-decoration-none hover-success">Quem somos nós?</Link></li>
              <li><Link href="/contact" className="text-secondary text-decoration-none hover-success">Contate-nos</Link></li>
              <li><Link href="/privacy" className="text-secondary text-decoration-none hover-success">política de Privacidade</Link></li>
              <li><Link href="/terms" className="text-secondary text-decoration-none hover-success">Termos e Condições</Link></li>
            </ul>
          </div>

        </div>

        {/* Bloco Inferior: Telefone, Redes Sociais e Copyright */}
        <div className="row align-items-center gy-3">
          
          {/* Suporte por Telefone */}
          <div className="col-12 col-md-4 text-center text-md-start">
            <p className="text-secondary small mb-1">Tem alguma dúvida? Ligue-nos 24/7.</p>
            <p className="fw-bold m-0 text-white" style={{ fontSize: "1.1rem" }}>+245 95 000 00 00</p>
          </div>

          {/* Redes Sociais com Fundo Quadrado Verde Vibrante */}
          <div className="col-12 col-md-8 d-flex justify-content-center justify-content-md-end gap-2">
            <a href="#" className="btn btn-success d-flex align-items-center justify-content-center rounded-1" style={{ width: "36px", height: "36px", backgroundColor: "#24d100", borderColor: "#24d100" }}>
              <i className="bi bi-facebook text-white"></i>
            </a>
            <a href="#" className="btn btn-success d-flex align-items-center justify-content-center rounded-1" style={{ width: "36px", height: "36px", backgroundColor: "#24d100", borderColor: "#24d100" }}>
              <i className="bi bi-twitter-x text-white"></i>
            </a>
            <a href="#" className="btn btn-success d-flex align-items-center justify-content-center rounded-1" style={{ width: "36px", height: "36px", backgroundColor: "#24d100", borderColor: "#24d100" }}>
              <i className="bi bi-instagram text-white"></i>
            </a>
            <a href="#" className="btn btn-success d-flex align-items-center justify-content-center rounded-1" style={{ width: "36px", height: "36px", backgroundColor: "#24d100", borderColor: "#24d100" }}>
              <i className="bi bi-linkedin text-white"></i>
            </a>
          </div>

          {/* Linha de Copyright Centralizada */}
          <div className="col-12 text-center mt-4">
            <p className="text-secondary small m-0" style={{ opacity: 0.7 }}>
              copyright ©FarmaGo 2026. todos os direitos reservados
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}
