"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

type PharmacySummary = {
  id: number;
  name: string;
  status: "pending" | "approved" | "rejected";
  isOpen: boolean;
  rejectionReason: string | null;
} | null;

const navLinks = [
  { href: "/dashboard",          icon: "bi-speedometer2",   label: "Resumo"        },
  { href: "/dashboard/pharmacy", icon: "bi-shop",           label: "Dados da loja" },
  { href: "/dashboard/stock",    icon: "bi-box-seam",       label: "Stock"         },
  { href: "/dashboard/medications", icon: "bi-capsule",     label: "Medicamentos"  },
  { href: "/dashboard/sales",    icon: "bi-cart-check",     label: "Vendas"        },
  { href: "/dashboard/clients",  icon: "bi-people",         label: "Clientes"      },
  { href: "/dashboard/expenses", icon: "bi-receipt-cutoff", label: "Despesas"      },
];

const statusMeta = {
  approved: { label: "Validada", className: "text-bg-success" },
  pending:  { label: "Em validação", className: "text-bg-warning" },
  rejected: { label: "Rejeitada", className: "text-bg-danger" },
} as const;

export default function DashboardSidebar({
  user,
  pharmacy,
  logoutAction,
}: {
  user: SessionUser;
  pharmacy: PharmacySummary;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside
      className="bg-white border-end d-flex flex-column p-3 position-sticky top-0"
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
          A minha farmácia
        </div>

        {pharmacy ? (
          <>
            <div className="fw-semibold text-dark text-truncate">{pharmacy.name}</div>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className={`badge ${statusMeta[pharmacy.status].className}`}>
                {statusMeta[pharmacy.status].label}
              </span>
              <span
                className={`badge ${pharmacy.isOpen ? "text-bg-success" : "text-bg-secondary"}`}
              >
                {pharmacy.isOpen ? "Aberta" : "Fechada"}
              </span>
            </div>
          </>
        ) : (
          <div className="text-secondary small">Sem farmácia associada.</div>
        )}
      </div>

      <nav className="nav flex-column gap-1 flex-grow-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link py-2 px-3 rounded-3 d-flex align-items-center gap-3 fw-medium ${
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
          href="/"
          className="nav-link py-2 px-3 rounded-3 d-flex align-items-center gap-3 text-secondary"
        >
          <i className="bi bi-house-door fs-5"></i> Ver o site
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
