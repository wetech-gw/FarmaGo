"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/I18nProvider";
import { useCart } from "@/lib/cart";
import type { TKey } from "@/lib/i18n-core";

type DockItem = {
  href: string;
  icon: string;
  activeIcon: string;
  labelKey: TKey;
};

const dockItems: DockItem[] = [
  { href: "/", icon: "bi-house", activeIcon: "bi-house-fill", labelKey: "home" },
  {
    href: "/medications",
    icon: "bi-capsule",
    activeIcon: "bi-capsule-pill",
    labelKey: "dock.medications",
  },
  {
    href: "/scan-receita",
    icon: "bi-upc-scan",
    activeIcon: "bi-upc-scan",
    labelKey: "dock.scan",
  },
  {
    href: "/pharmacies",
    icon: "bi-geo-alt",
    activeIcon: "bi-geo-alt-fill",
    labelKey: "pharmacies",
  },
  {
    href: "/guards",
    icon: "bi-shield-plus",
    activeIcon: "bi-shield-fill-plus",
    labelKey: "guard",
  },
  {
    href: "/carrinho",
    icon: "bi-cart3",
    activeIcon: "bi-cart-fill",
    labelKey: "dock.cart",
  },
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
              <span className="mobile-dock-icon">
                <i
                  className={`bi ${isActive ? item.activeIcon : item.icon}`}
                  aria-hidden="true"
                ></i>
                {item.href === "/carrinho" && count > 0 && (
                  <span className="mobile-dock-badge" aria-hidden="true">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </span>
              <span className="mobile-dock-label">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
