"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

const navLinks = [
  { href: "/admin/dashboard",    icon: "bi-speedometer2",   label: "Dashboard"        },
  { href: "/admin/validations",  icon: "bi-patch-check",    label: "Validações"       },
  { href: "/admin/pharmacies",   icon: "bi-building-add",   label: "Farmácias"        },
  { href: "/admin/medications",  icon: "bi-capsule",        label: "Medicamentos"     },
  { href: "/admin/stock",        icon: "bi-box-seam",       label: "Stock & Validade" },
  { href: "/admin/expenses",     icon: "bi-receipt-cutoff", label: "Despesas"         },
  { href: "/admin/users",        icon: "bi-people",         label: "Utilizadores"     },
  { href: "/admin/analyses",     icon: "bi-bar-chart-line", label: "Análises"         },
];

export default function AdminSidebar({
  user,
  logoutAction,
}: {
  user: SessionUser;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside
      className="bg-white border-end d-flex flex-column p-3 position-sticky top-0"
      style={{ width: "260px", height: "100vh", flexShrink: 0 }}
    >
      <style>{`
        .px-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        .px-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .px-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .px-sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 999px;
        }
        .px-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>

      <div className="d-flex align-items-center gap-2 mb-5 px-2 pt-2">
        <Link href="/" className="text-decoration-none d-flex align-items-center gap-2">
          <span className="fw-bold fs-3" style={{ color: "#10b981" }}>FarmaGo</span>
          <i className="bi bi-capsule-capsule fs-3" style={{ color: "#10b981" }}></i>
        </Link>
      </div>

      <nav className="nav flex-column gap-1 flex-grow-1 overflow-x-hidden px-sidebar-scroll">
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
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="nav flex-column gap-1 border-top pt-3">
        <div className="px-3 pb-2">
          <div className="fw-semibold text-dark text-truncate">{user.name}</div>
          <div className="small text-secondary text-truncate">{user.email}</div>
        </div>

        <Link
          href="/admin/account"
          className={`nav-link py-2 px-3 rounded-3 d-flex align-items-center gap-3 ${
            pathname === "/admin/account" ? "text-dark bg-light fw-semibold" : "text-secondary"
          }`}
        >
          <i className="bi bi-person-gear fs-5"></i> Conta
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="nav-link text-danger py-2 px-3 rounded-3 d-flex align-items-center gap-3 w-100 border-0 bg-transparent"
          >
            <i className="bi bi-box-arrow-left fs-5"></i> Terminar sessão
          </button>
        </form>
      </div>
    </aside>
  );
}
