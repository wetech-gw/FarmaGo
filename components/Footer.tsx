import Link from "next/link";
import { getT } from "@/lib/i18n";
import { CONTACT, telHref } from "@/lib/contact";

export default async function Footer() {
  const t = await getT();

  return (
    <footer className="bg-dark text-white pt-5 pb-3 font-sans" style={{ backgroundColor: "#0f1115 !important" }}>
      <div className="container">

        {/* Bloco Superior: Logo, Descrição e Links */}
        <div className="row gy-4 border-bottom border-secondary pb-4 mb-4" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>

          {/* Coluna 1: Logo e Descrição */}
          <div className="col-12 col-lg-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img src="/images/Logo.png" alt="FarmaGo" style={{ height: "50px", width: "auto" }} />
            </div>
            <p className="text-secondary lh-base m-0" style={{ maxWidth: "450px", fontSize: "0.95rem" }}>
              {t("footer.aboutText")}
            </p>
          </div>

          {/* Coluna 2: Os nossos serviços */}
          <div className="col-6 col-lg-3">
            <h6 className="fw-bold mb-3 text-white">{t("footer.services")}</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.9rem" }}>
              <li><Link href="/medications" className="text-secondary text-decoration-none hover-success">{t("medications")}</Link></li>
              <li><Link href="/pharmacies" className="text-secondary text-decoration-none hover-success">{t("pharmacies")}</Link></li>
              <li><Link href="/guards" className="text-secondary text-decoration-none hover-success">{t("footer.dutyPharmacies")}</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Sobre */}
          <div className="col-6 col-lg-3">
            <h6 className="fw-bold mb-3 text-white">{t("footer.about")}</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.9rem" }}>
              <li><Link href="/about" className="text-secondary text-decoration-none hover-success">{t("about")}</Link></li>
              <li><Link href="/contact" className="text-secondary text-decoration-none hover-success">{t("contact")}</Link></li>
              <li><Link href="/privacy" className="text-secondary text-decoration-none hover-success">{t("footer.privacy")}</Link></li>
              <li><Link href="/terms" className="text-secondary text-decoration-none hover-success">{t("footer.terms")}</Link></li>
            </ul>
          </div>

        </div>

        {/* Bloco Inferior: Telefone, Redes Sociais e Copyright */}
        <div className="row align-items-center gy-3">

          {/* Suporte por Telefone */}
          <div className="col-12 col-md-4 text-center text-md-start">
            <p className="text-secondary small mb-1">{t("footer.helpText")}</p>
            <a href={telHref} className="fw-bold m-0 text-white text-decoration-none" style={{ fontSize: "1.1rem" }}>
              {CONTACT.phone}
            </a>
          </div>

          {/* Redes Sociais com Fundo Quadrado Verde Vibrante */}
          <div className="col-12 col-md-8 d-flex justify-content-center justify-content-md-end gap-2">
            {/*
              Os ícones de Facebook, Twitter/X, Instagram e LinkedIn ficam
              comentados enquanto não houverem URLs reais. O WhatsApp não é
              repetido aqui de propósito: o botão flutuante e a página de
              contactos já dão acesso à conversa.
            */}
            {/*<a href="#" className="btn btn-success d-flex align-items-center justify-content-center rounded-1" style={{ width: "36px", height: "36px", backgroundColor: "#24d100", borderColor: "#24d100" }}>
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
            </a>*/}
          </div>

          {/* Linha de Copyright Centralizada */}
          <div className="col-12 text-center mt-4">
            <p className="text-secondary small m-0" style={{ opacity: 0.7 }}>
              {t("footer.copyright")}
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}