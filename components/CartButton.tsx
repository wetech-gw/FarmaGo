"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/I18nProvider";
import { useCart } from "@/lib/cart";

/** Ícone do carrinho com contador; fica escondido na própria página do carrinho. */
export default function CartButton() {
  const t = useT();
  const pathname = usePathname();
  const { count } = useCart();

  if (pathname?.startsWith("/carrinho")) return null;

  return (
    <Link
      href="/carrinho"
      // Escondido no menu toggle do telemóvel (d-none ... d-lg-inline-flex):
      // no móvel o carrinho vive no dock, com o contador vermelho.
      className="nav-link px-menu-item text-dark hover-success px-0 mt-1 mt-lg-0 position-relative d-none d-lg-inline-flex"
      aria-label={t("cart.title")}
    >
      <i className="bi bi-cart3 fs-4"></i>
      {count > 0 && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style={{ fontSize: "0.65rem" }}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
