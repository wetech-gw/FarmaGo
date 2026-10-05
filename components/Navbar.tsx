import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import NavbarCollapse from "@/components/NavbarCollapse";

export default async function Navbar() {
  const user = await getCurrentUser();
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
              FarmaGo
            </Link>

            <NavbarCollapse>
              <div className="navbar-nav ms-auto align-items-lg-center gap-3 gap-lg-4">
                {/* 3. Espaçador Direito */}
                <div className="flex-grow-1"></div>
                <Link href="/" className="nav-link text-secondary fw-medium small hover-success px-0">
                  Início
                </Link>

                <Link href="/about" className="nav-link text-secondary fw-medium small hover-success px-0">
                  Quem somos nós?
                </Link>

                <Link href="/contact" className="nav-link text-secondary fw-medium small hover-success px-0">
                  Contate-nos
                </Link>

                {/* Conta: dashboard se houver sessão, login/registo caso contrário */}
                {user ? (
                  <Link
                    href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                    className="nav-link text-dark hover-success px-0 mt-1 mt-lg-0 d-flex align-items-center"
                  >
                    <i className="bi bi-person-circle fs-4"></i>
                    <span className="d-none d-lg-inline small fw-medium ms-2">
                      {user.name.split(" ")[0]}
                    </span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="nav-link text-secondary fw-medium small hover-success px-0"
                    >
                      Entrar
                    </Link>

                    <Link
                      href="/register"
                      className="btn btn-success rounded-pill px-3 py-1 fw-medium small"
                    >
                      Registar farmácia
                    </Link>
                  </>
                )}

                {/* <Link href="/cart" className="nav-link text-dark hover-success px-0 mt-1 mt-lg-0 position-relative">
                  <i className="bi bi-cart3 fs-4 d-none d-lg-inline"></i>
                  <span className="d-lg-none fw-medium small text-secondary">Carrinho</span>
                  <span className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-pill">
                    3
                  </span>
                </Link> */}
              </div>
            </NavbarCollapse>
          </div>
        </nav>

        {/* Categorias Inferiores (apenas desktop, no mobile fica no dock) */}
        <div className="border-top border-bottom bg-light d-none d-lg-block">
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

              {/*<li className="nav-item">
                <Link href="/guards" className="nav-link text-danger fw-bold small text-uppercase tracking-wider p-0">
                  ● Farmácias de Plantão
                </Link>
              </li>*/}

              {/*<li className="nav-item">
                <Link href="/pharmacies" className="nav-link text-dark fw-semibold small text-uppercase tracking-wider p-0">
                  ● Parafarmácias
                </Link>
              </li>*/}
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}
