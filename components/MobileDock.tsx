"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const dockItems = [
  { href: "/", icon: "bi-house", label: "Início" },
  { href: "/medications", icon: "bi-capsule", label: "Medicamentos" },
  { href: "/pharmacies", icon: "bi-geo-alt", label: "Farmácias" },
  { href: "/guards", icon: "bi-shield-plus", label: "Plantão" },
  { href: "/dashboard", icon: "bi-person", label: "Conta" },
];

export default function MobileDock() {
  const pathname = usePathname();

  return (
    <nav
      className="mobile-dock"
      aria-label="Navegação principal"
    >
      <div className="mobile-dock-inner">
        {dockItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-dock-item ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
