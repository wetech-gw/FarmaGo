"use client";

import { useT } from "@/components/I18nProvider";

export default function Hero() {
  const t = useT();

  return (
    <section
      className="hero position-relative d-flex align-items-center text-center text-white"
      style={{
        backgroundImage: "url('/images/img1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "75vh", // Ocupa 75% da altura do ecrã
      }}
    >
      {/* Overlay Escuro para dar contraste e leitura ao texto */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100" 
        style={{ backgroundColor: "rgba(0, 0, 0, 0.55)", zIndex: 1 }}
      ></div>

      {/* Conteúdo Principal */}
      <div className="container position-relative py-5" style={{ zIndex: 2 }}>
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            
            {/* Título Principal */}
            <h5 className="display-4 fw-bold mb-4 tracking-tight">
              {t("hero.title")}
            </h5>

            {/* Barra de Pesquisa Hero */}
            <div className="p-2 bg-white rounded-pill shadow-lg mx-auto mt-4" style={{ maxWidth: "550px" }}>
              <div className="d-flex align-items-center">
                
                {/* Ícone de Lupa interno */}
                <span className="ps-3 pe-2 text-muted">
                  <i className="bi bi-search fs-5"></i>
                </span>

                {/* Campo de Texto */}
                <input
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none fs-5 py-2 ps-1"
                  placeholder={t("hero.searchPlaceholder")}
                  aria-label={t("hero.searchPlaceholder")}
                  style={{ color: "#333" }}
                />

                {/* Botão de Ação */}
                <button className="btn btn-success rounded-pill px-4 py-2 fw-semibold fs-5 text-uppercase ms-2">
                  {t("hero.validate")}
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}