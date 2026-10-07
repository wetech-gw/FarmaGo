import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n";
import NavbarCollapse from "@/components/NavbarCollapse";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default async function Navbar() {
  const user = await getCurrentUser();
  const t = await getT();
  return (
    <>
      {/* Wrapper para evitar que o conteúdo da página fique escondido debaixo do menu fixo */}
      <div style={{ paddingTop: "115px" }}></div>

      <header className="fixed-top shadow-sm">
        {/* Menu Principal */}
        <nav className="navbar navbar-expand-lg bg-white py-3">
          <div className="container">

            {/* Logo */}
            <Link href="/" className="navbar-brand m-0">
              <img
                src="/images/Logo.png"
                alt="FarmaGo"
                style={{ height: "50px", width: "auto" }}
              />
            </Link>

            <NavbarCollapse>
              <div className="navbar-nav ms-auto align-items-lg-center gap-3 gap-lg-4">
                {/* 3. Espaçador Direito */}
                <div className="flex-grow-1"></div>
                <Link href="/" className="nav-link px-menu-item text-secondary fw-medium small hover-success px-0">
                  <i className="bi bi-house d-lg-none me-2"></i>
                  {t("home")}
                </Link>

                <Link href="/about" className="nav-link px-menu-item text-secondary fw-medium small hover-success px-0">
                  <i className="bi bi-info-circle d-lg-none me-2"></i>
                  {t("about")}
                </Link>

                <Link href="/contact" className="nav-link px-menu-item text-secondary fw-medium small hover-success px-0">
                  <i className="bi bi-chat-left-text d-lg-none me-2"></i>
                  {t("contact")}
                </Link>

                <LocaleSwitcher />

                {/* Conta: dashboard se houver sessão, login/registo caso contrário */}
                {user ? (
                  <Link
                    href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                    className="nav-link px-menu-item text-dark hover-success px-0 mt-1 mt-lg-0 d-flex align-items-center"
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
                      className="nav-link px-menu-item text-secondary fw-medium small hover-success px-0"
                      >
                      <i className="bi bi-box-arrow-in-right d-lg-none me-2"></i>
                      {t("login")}
                    </Link>

                    <Link
                      href="/register"
                      className="btn btn-success rounded-pill px-3 py-1 fw-medium small"
                      >
                      {t("registerPharmacy")}
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
                  ● {t("medications")}
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/pharmacies" className="nav-link text-dark fw-semibold small text-uppercase tracking-wider p-0">
                  ● {t("pharmacies")}
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/guards" className="nav-link text-danger fw-bold small text-uppercase tracking-wider p-0">
                  ● {t("guardPharmacies")}
                </Link>
              </li>

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
