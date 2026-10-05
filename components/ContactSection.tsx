export default function ContactSection() {
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
                    Vamos entrar em contacto.
                  </h3>
                  <p className="text-secondary lh-base small mb-4">
                    Bem-vindo(a) à nossa aplicação web!
                    Aguardamos o seu contacto para responder às suas questões, receber o seu feedback e discutir o seu projeto.
                  </p>

                  {/* Informações de contacto */}
                  <div className="d-flex flex-column gap-3 mb-4">
                    <div className="d-flex align-items-center gap-3 text-secondary small">
                      <i className="bi bi-envelope text-success fs-5"></i>
                      <span>info@wetechgroup.com</span>
                    </div>
                    <div className="d-flex align-items-center gap-3 text-secondary small">
                      <i className="bi bi-telephone text-success fs-5"></i>
                      <span>+245 95 000 00 00</span>
                    </div>
                  </div>
                </div>

                {/* Redes Sociais */}
                <div className="mt-4">
                  <p className="text-dark small fw-medium mb-2">As nossas redes sociais :</p>
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
                  </div>
                </div>
              </div>

              {/* LADO DIREITO: Formulário (Fundo Verde Escuro) */}
              <div className="col-12 col-md-7 p-4 p-lg-5" style={{ backgroundColor: "#008f1f" }}>
                <h3 className="fw-bold text-white mb-4">
                  Contate-nos
                </h3>

                <form className="d-flex flex-column gap-3">
                  
                  {/* Nome de utilizador */}
                  <div className="position-relative">
                    <label className="text-white small mb-1 opacity-75">Nom d&apos;utilisateur</label>
                    <input 
                      type="text" 
                      className="form-control bg-transparent text-white border-white rounded-pill px-3 shadow-none custom-placeholder"
                      style={{ borderColor: "rgba(255,255,255,0.5) !important" }}
                    />
                  </div>

                  {/* Email */}
                  <div className="position-relative">
                    <label className="text-white small mb-1 opacity-75">Email</label>
                    <input 
                      type="email" 
                      className="form-control bg-transparent text-white border-white rounded-pill px-3 shadow-none"
                      style={{ borderColor: "rgba(255,255,255,0.5) !important" }}
                    />
                  </div>

                  {/* Número de Telefone */}
                  <div className="position-relative">
                    <label className="text-white small mb-1 opacity-75">Numero de telephone</label>
                    <input 
                      type="tel" 
                      className="form-control bg-transparent text-white border-white rounded-pill px-3 shadow-none"
                      style={{ borderColor: "rgba(255,255,255,0.5) !important" }}
                    />
                  </div>

                  {/* Mensagem */}
                  <div className="position-relative">
                    <label className="text-white small mb-1 opacity-75">Message</label>
                    <textarea 
                      rows={4}
                      className="form-control bg-transparent text-white border-white rounded-4 px-3 shadow-none"
                      style={{ borderColor: "rgba(255,255,255,0.5) !important", resize: "none" }}
                    ></textarea>
                  </div>

                  {/* Botão de Envio Oval Branco */}
                  <div className="mt-3">
                    <button 
                      type="submit" 
                      className="btn btn-white bg-white text-success fw-bold rounded-pill px-4 py-2 hover-opacity"
                      style={{ color: "#008f1f !important" }}
                    >
                      Enviar
                    </button>
                  </div>

                </form>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
