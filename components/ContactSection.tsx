import ContactForm from "@/app/contact/ContactForm";
import { getT } from "@/lib/i18n";
import { CONTACT, telHref, whatsappHref } from "@/lib/contact";

export default async function ContactSection() {
  const t = await getT();

  return (
    <section className="py-5 bg-light position-relative overflow-hidden" style={{ minHeight: "85vh" }}>
      {/* Círculo decorativo abstrato verde gigante no fundo à esquerda (simula a imagem) */}
      <div 
        className="position-absolute rounded-circle border border-success opacity-25 d-none d-lg-block"
        style={{ 
          width: "500px", 
          height: "500px", 
          borderWidth: "60px !important", 
          borderColor: "#24d100 !important",
          left: "-250px", 
          top: "10%" 
        }}
      ></div>

      <div className="container position-relative py-4" style={{ zIndex: 2 }}>
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            
            {/* Bloco Principal com Sombra */}
            <div className="row g-0 bg-white rounded-4 shadow overflow-hidden">
              
              {/* LADO ESQUERDO: Informações (Fundo Branco) */}
              <div className="col-12 col-md-5 p-4 p-lg-5 d-flex flex-column justify-content-between bg-white">
                <div>
                  <h3 className="fw-bold text-success mb-3" style={{ color: "#24d100 !important" }}>
                    {t("contact.title")}
                  </h3>
                  <p className="text-secondary lh-base small mb-4">
                    {t("contact.intro")}
                  </p>

                  {/* Informações de contacto */}
                  <div className="d-flex flex-column gap-3 mb-4">
                    <a
                      href={whatsappHref(t("whatsapp.defaultMessage"))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex align-items-center gap-3 text-secondary small text-decoration-none"
                    >
                      <i className="bi bi-whatsapp fs-5" style={{ color: "#25d366" }}></i>
                      <span>{t("whatsapp.cta")}</span>
                    </a>
                    <div className="d-flex align-items-center gap-3 text-secondary small">
                      <i className="bi bi-envelope text-success fs-5"></i>
                      <span>{CONTACT.email}</span>
                    </div>
                    <a
                      href={telHref}
                      className="d-flex align-items-center gap-3 text-secondary small text-decoration-none"
                    >
                      <i className="bi bi-telephone text-success fs-5"></i>
                      <span>{CONTACT.phone}</span>
                    </a>
                  </div>
                </div>

                {/* Redes Sociais */}
                <div className="mt-4">
                  <p className="text-dark small fw-medium mb-2">{t("contact.social")}</p>
                  <div className="d-flex gap-2">
                    <a href="#" className="btn btn-success d-flex align-items-center justify-content-center rounded-1" style={{ width: "32px", height: "32px", backgroundColor: "#24d100", borderColor: "#24d100" }}>
                      <i className="bi bi-facebook text-white small"></i>
                    </a>
                    <a href="#" className="btn btn-success d-flex align-items-center justify-content-center rounded-1" style={{ width: "32px", height: "32px", backgroundColor: "#24d100", borderColor: "#24d100" }}>
                      <i className="bi bi-twitter-x text-white small"></i>
                    </a>
                    <a href="#" className="btn btn-success d-flex align-items-center justify-content-center rounded-1" style={{ width: "32px", height: "32px", backgroundColor: "#24d100", borderColor: "#24d100" }}>
                      <i className="bi bi-instagram text-white small"></i>
                    </a>
                    <a href="#" className="btn btn-success d-flex align-items-center justify-content-center rounded-1" style={{ width: "32px", height: "32px", backgroundColor: "#24d100", borderColor: "#24d100" }}>
                      <i className="bi bi-linkedin text-white small"></i>
                    </a>
                    <a
                      href={whatsappHref(t("whatsapp.defaultMessage"))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn d-flex align-items-center justify-content-center rounded-1"
                      style={{ width: "32px", height: "32px", backgroundColor: "#25d366", borderColor: "#25d366" }}
                      aria-label={t("whatsapp.openTooltip")}
                    >
                      <i className="bi bi-whatsapp text-white small"></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* LADO DIREITO: Formulário (Fundo Verde Escuro) */}
              <div className="col-12 col-md-7 p-4 p-lg-5" style={{ backgroundColor: "#008f1f" }}>
                <h3 className="fw-bold text-white mb-4">
                  {t("contact")}
                </h3>

                <ContactForm />
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}