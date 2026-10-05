"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const dockItems = [
  { href: "/", icon: "bi-house", label: "Início" },
  { href: "/medications", icon: "bi-capsule", label: "Medicamentos" },
  { href: "/pharmacies", icon: "bi-geo-alt", label: "Farmácias" },
  { href: "/guards", icon: "bi-shield-plus", label: "Plantão" },
  { href: "/dashboard", icon: "bi-person", label: "Conta" },
];

export default function MobileDock() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setVisible(current < 80 || current < lastScroll);
      setLastScroll(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScroll]);

  return (
    <nav
      className={`mobile-dock ${visible ? "" : "mobile-dock--hidden"}`}
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
