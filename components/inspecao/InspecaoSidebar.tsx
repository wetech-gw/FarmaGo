"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/auth";
import { useT } from "@/components/I18nProvider";
import type { TKey } from "@/lib/i18n-core";

const navLinks: { href: string; icon: string; labelKey: TKey }[] = [
  { href: "/inspecao", icon: "bi-speedometer2", labelKey: "dashboard" },
  { href: "/inspecao/farmacias", icon: "bi-building-add", labelKey: "pharmaciesManagement" },
  { href: "/inspecao/plantoes", icon: "bi-clock-history", labelKey: "guardsManagement" },
  { href: "/inspecao/notificacoes", icon: "bi-bell", labelKey: "notificationsManagement" },
];

export default function InspecaoSidebar({
  user,
  logoutAction,
  unreviewedNotifications = 0,
}: {
  user: SessionUser;
  logoutAction: () => Promise<void>;
  unreviewedNotifications?: number;
}) {
  const pathname = usePathname();
  const t = useT();

  return (
    <>
      <div className="d-lg-none bg-white border-bottom px-3 py-2 position-sticky top-0" style={{ zIndex: 1020 }}>
        <div className="d-flex align-items-center gap-2 overflow-auto">
          <Link href="/" className="flex-shrink-0">
            <img src="/images/Logo.png" alt="FarmaGo" style={{ height: "32px", width: "auto" }} />
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link text-nowrap px-3 py-1 rounded-3 small fw-medium ${
                pathname === link.href ? "text-dark bg-light" : "text-secondary"
              }`}
            >
              <i className={`bi ${link.icon} me-1`}></i>
              {t(link.labelKey)}
              {link.href === "/inspecao/notificacoes" && unreviewedNotifications > 0 && (
                <span className="badge bg-danger rounded-pill ms-1">{unreviewedNotifications}</span>
              )}
            </Link>
          ))}
          <form action={logoutAction} className="flex-shrink-0 ms-auto">
            <button type="submit" className="btn btn-sm btn-outline-danger rounded-3" aria-label={t("logout")}>
              <i className="bi bi-box-arrow-left"></i>
            </button>
          </form>
        </div>
      </div>

      <aside
        className="bg-white border-end d-none d-lg-flex flex-column p-3 position-sticky top-0"
        style={{ width: "260px", height: "100vh", flexShrink: 0 }}
      >
        <div className="d-flex align-items-center gap-2 mb-5 px-2 pt-2">
          <Link href="/" className="text-decoration-none d-flex align-items-center gap-2">
            <img src="/images/Logo.png" alt="FarmaGo" style={{ height: "50px", width: "auto" }} />
          </Link>
        </div>

        <nav className="nav flex-column gap-1 flex-grow-1 overflow-x-hidden">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link py-1 px-3 rounded-3 d-flex align-items-center gap-3 fw-medium w-100 ${
                  isActive ? "text-dark bg-light" : "text-secondary"
                }`}
              >
                <i className={`bi ${link.icon} fs-5`}></i>
                {t(link.labelKey)}
                {link.href === "/inspecao/notificacoes" && unreviewedNotifications > 0 && (
                  <span className="badge bg-danger rounded-pill ms-1">{unreviewedNotifications}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="nav flex-column gap-1 border-top pt-3">
          <div className="px-3 pb-2">
            <div className="fw-semibold text-dark text-truncate">{user.name}</div>
            <div className="small text-secondary text-truncate">{user.email}</div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="nav-link text-danger py-2 px-3 rounded-3 d-flex align-items-center gap-3 w-100 border-0 bg-transparent"
            >
               <i className="bi bi-box-arrow-left fs-5"></i> {t("logout")}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}