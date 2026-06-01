import Link from "next/link";

export default function Navbar() {
  return (
    <>
      {/* Wrapper para evitar que o conteúdo da página fique escondido debaixo do menu fixo */}
      <div style={{ paddingTop: "115px" }}></div>

      <header className="fixed-top shadow-sm">
        {/* Menu Principal */}
        <nav className="navbar navbar-expand-lg bg-white py-3">
          <div className="container">

            {/* Logo */}
            <Link href="/" className="navbar-brand text-success fw-bold fs-3 m-0">
              Pharmax_GW
            </Link>

            {/* Botão Hambúrguer (Visível apenas em Mobile) */}
            <button
              className="navbar-toggler border-0"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarContent"
              aria-controls="navbarContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Conteúdo Retrátil (Hambúrguer) */}
            <div className="collapse navbar-collapse mt-3 mt-lg-0" id="navbarContent">
              
              {/* 1. Espaçador Esquerdo (Empurra a busca para o centro no desktop) */}
              <div className="flex-grow-1 d-none d-lg-block"></div>

              {/* 2. Barra de Pesquisa Centralizada */}
              <div className="my-3 my-lg-0" style={{ maxWidth: "200px", width: "100%" }}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-success border-end-0">
                    <i className="bi bi-search text-success"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-white border-success border-start-0 ps-0 shadow-none"
                    placeholder="Pesquisar..."
                  />
                </div>
              </div>

              {/* 3. Espaçador Direito (Garante a centralização perfeita entre o logo e os links) */}
              <div className="flex-grow-1 d-none d-lg-block"></div>

              {/* 4. Links de Apoio e Ícones (Alinhados totalmente à direita) */}
              <div className="navbar-nav ms-auto align-items-lg-center gap-3 gap-lg-4">
                <Link href="/" className="nav-link text-secondary fw-medium small hover-success px-0">
                  Início
                </Link>

                <Link href="/about" className="nav-link text-secondary fw-medium small hover-success px-0">
                  Quem somos nós?
                </Link>

                <Link href="/contact" className="nav-link text-secondary fw-medium small hover-success px-0">
                  Contate-nos
                </Link>

                {/* Perfil */}
                {/* <Link href="/profile" className="nav-link text-dark hover-success px-0 mt-1 mt-lg-0">
                  <i className="bi bi-person-circle fs-4 d-none d-lg-inline"></i>
                  <span className="d-lg-none fw-medium small text-secondary">Minha Conta</span>
                </Link> */}
              </div>
            </div>

          </div>
        </nav>

        {/* Categorias Inferiores (Scroll horizontal no Mobile para não ocupar muito espaço) */}
        <div className="border-top border-bottom bg-light">
          <div className="container">
            <ul className="nav justify-content-lg-center flex-nowrap overflow-x-auto py-2 text-nowrap gap-3 gap-lg-4">
              <li className="nav-item">
                <Link href="/medications" className="nav-link text-dark fw-semibold small text-uppercase tracking-wider p-0">
                  ● Medicamentos
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/pharmacies" className="nav-link text-dark fw-semibold small text-uppercase tracking-wider p-0">
                  ● Farmácias
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/guards" className="nav-link text-danger fw-bold small text-uppercase tracking-wider p-0">
                  ● Farmácias de Plantão
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/parapharmacy" className="nav-link text-dark fw-semibold small text-uppercase tracking-wider p-0">
                  ● Parafarmácias
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}
