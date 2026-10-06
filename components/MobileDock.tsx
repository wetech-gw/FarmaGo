"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/I18nProvider";
import type { TKey } from "@/lib/i18n-core";

const dockItems: { href: string; icon: string; labelKey: TKey }[] = [
  { href: "/", icon: "bi-house", labelKey: "home" },
  { href: "/medications", icon: "bi-capsule", labelKey: "medications" },
  { href: "/pharmacies", icon: "bi-geo-alt", labelKey: "pharmacies" },
  { href: "/guards", icon: "bi-shield-plus", labelKey: "guard" },
  { href: "/dashboard", icon: "bi-person", labelKey: "summary" },
];

export default function MobileDock() {
  const pathname = usePathname();
  const t = useT();

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
            >
              <i className={`bi ${item.icon}`} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}