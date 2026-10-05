"use client";

export default function AboutSection() {
  return (
    <section className="py-5 bg-white">
      <div className="container py-lg-4">
        <div className="row align-items-center gy-4">

          {/* Coluna da Esquerda: Textos */}
          <div className="col-12 col-lg-6">

            {/* Título com linha inferior cinzenta/verde discreta */}
            <div className="mb-4 position-relative">
              {/* <h2 className="fw-bold text-dark m-0 pb-2" style={{ fontSize: "2.2rem" }}>
               Quem somos nós?
              </h2> */}

              <div className="mb-4">
                <h2 className="fw-bold text-dark m-0 pb-2 text-uppercase" style={{ fontSize: "1.75rem" }}>
                  Quem somos nós ?
                </h2>
                  <div style={{ height: "4px", width: "270px", backgroundColor: "#198754" }}></div>
              </div>
            </div>

            {/* Texto Descritivo */}
            <p
              className="text-dark lh-lg m-0"
              style={{
                fontSize: "1.05rem",
                textAlign: "justify",
                color: "#212529"
              }}
            >
            A nossa aplicação oferece dois serviços essenciais: uma pesquisa detalhada por
            medicamentos, incluindo nomes genéricos e de marca, dosagens recomendadas,
            e a rápida localização de farmácias próximas que tenham estes
            medicamentos em stock, com informação completa sobre cada farmácia.
            Desta forma, simplifica o acesso a informações médicas fidedignas e
            fornecimento de medicamentos, melhorando assim a qualidade de vida dos seus
            utilizadores.
            </p>
          </div>

          {/* Coluna da Direita: Imagem Ovalizada */}
          <div className="col-12 col-lg-6 d-flex justify-content-center justify-content-lg-end">
            <div
              className="overflow-hidden shadow-sm"
              style={{
                width: "100%",
                maxWidth: "480px",
                height: "320px",
                borderRadius: "160px" // Cria o efeito perfeitamente oval/elítico da imagem
              }}
            >
              <img
                src="/images/img1.jpg"
                alt="Interior da farmácia"
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
