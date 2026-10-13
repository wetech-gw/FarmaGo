"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/I18nProvider";
import { useCart } from "@/lib/cart";
import type { TKey } from "@/lib/i18n-core";

const dockItems: { href: string; icon: string; labelKey: TKey }[] = [
  { href: "/", icon: "bi-house", labelKey: "home" },
  { href: "/medications", icon: "bi-capsule", labelKey: "medications" },
  { href: "/scan-receita", icon: "bi-upc-scan", labelKey: "scanReceita" },
  { href: "/pharmacies", icon: "bi-geo-alt", labelKey: "pharmacies" },
  { href: "/guards", icon: "bi-shield-plus", labelKey: "guard" },
  { href: "/carrinho", icon: "bi-cart3", labelKey: "cart.title" },
];

export default function MobileDock() {
  const pathname = usePathname();
  const t = useT();
  const { count } = useCart();

  return (
    <nav className="mobile-dock" aria-label={t("common.mainNavigation")}>
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
              aria-label={t(item.labelKey)}
            >
              <i className={`bi ${item.icon}`} aria-hidden="true"></i>
              {item.href === "/carrinho" && count > 0 && (
                <span className="mobile-dock-badge">{count > 99 ? "99+" : count}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}