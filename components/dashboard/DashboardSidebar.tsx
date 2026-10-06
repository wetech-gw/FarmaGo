"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/auth";
import { useT } from "@/components/I18nProvider";
import type { TKey } from "@/lib/i18n-core";

type PharmacySummary = {
  id: number;
  name: string;
  status: "pending" | "approved" | "rejected";
  isOpen: boolean;
  rejectionReason: string | null;
} | null;

const navLinks: { href: string; icon: string; labelKey: TKey }[] = [
  { href: "/dashboard",             icon: "bi-speedometer2", labelKey: "summary" },
  { href: "/dashboard/pharmacy",    icon: "bi-shop",         labelKey: "pharmacyData" },
  { href: "/dashboard/stock",       icon: "bi-box-seam",     labelKey: "stock" },
  { href: "/dashboard/medications", icon: "bi-capsule",      labelKey: "medications" },
  { href: "/dashboard/sales",       icon: "bi-cart-check",   labelKey: "sales" },
  { href: "/dashboard/clients",     icon: "bi-people",       labelKey: "clients" },
  { href: "/dashboard/notifications", icon: "bi-bell",       labelKey: "notifications" },
];

const STATUS_STYLES = {
  approved: "text-bg-success",
  pending: "text-bg-warning",
  rejected: "text-bg-danger",
} as const;

const STATUS_KEYS = {
  approved: "status.validated",
  pending: "status.pending",
  rejected: "status.rejected",
} as const satisfies Record<keyof typeof STATUS_STYLES, TKey>;

export default function DashboardSidebar({
  user,
  pharmacy,
  logoutAction,
  unreadNotifications = 0,
}: {
  user: SessionUser;
  pharmacy: PharmacySummary;
  logoutAction: () => Promise<void>;
  unreadNotifications?: number;
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
            {link.href === "/dashboard/notifications" && unreadNotifications > 0 && (
              <span className="badge bg-danger rounded-pill ms-1">{unreadNotifications}</span>
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
      style={{ width: "270px", height: "100vh", flexShrink: 0 }}
    >
      <div className="d-flex align-items-center gap-2 mb-4 px-2 pt-2">
        <Link href="/" className="text-decoration-none d-flex align-items-center gap-2">
          <img src="/images/Logo.png" alt="FarmaGo" style={{ height: "50px", width: "auto" }} />
        </Link>
      </div>

      {/* Farmácia do farmacêutico */}
      <div className="px-2 mb-4">
        <div className="small text-secondary text-uppercase fw-semibold mb-1"
          style={{ letterSpacing: "0.04em", fontSize: "0.7rem" }}>
          {t("myPharmacy")}
        </div>

        {pharmacy ? (
          <>
            <div className="fw-semibold text-dark text-truncate">{pharmacy.name}</div>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className={`badge ${STATUS_STYLES[pharmacy.status]}`}>
                {t(STATUS_KEYS[pharmacy.status])}
              </span>
              <span
                className={`badge ${pharmacy.isOpen ? "text-bg-success" : "text-bg-secondary"}`}
              >
                {pharmacy.isOpen ? t("common.openBadge") : t("common.closedBadge")}
              </span>
            </div>
          </>
        ) : (
          <div className="text-secondary small">{t("dash.noPharmacyTitle")}</div>
        )}
      </div>

      <nav className="nav flex-column gap-0 flex-grow-1">
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
              {link.href === "/dashboard/notifications" && unreadNotifications > 0 && (
                <span className="badge bg-danger rounded-pill ms-1">{unreadNotifications}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="nav flex-column gap-0 border-top pt-3">
        <div className="px-3 pb-2">
          <div className="fw-semibold text-dark text-truncate">{user.name}</div>
          <div className="small text-secondary text-truncate">{user.email}</div>
        </div>

        <Link
          href="/"
          className="nav-link py-1 px-3 rounded-3 d-flex align-items-center gap-3 text-secondary"
        >
          <i className="bi bi-house-door fs-5"></i> {t("viewSite")}
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="nav-link text-danger py-1 px-3 rounded-3 d-flex align-items-center gap-3 w-100 border-0 bg-transparent"
          >
            <i className="bi bi-box-arrow-left fs-5"></i> {t("logout")}
          </button>
        </form>
      </div>
    </aside>
    </>
  );
}