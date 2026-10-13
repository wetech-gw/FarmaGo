"use client";

import Link from "next/link";
import { useMemo } from "react";
import MedicationCard from "@/components/MedicationCard";
import { useI18n, useT } from "@/components/I18nProvider";
import { clearCart, removeFromCart, useCart } from "@/lib/cart";
import { whatsappHref } from "@/lib/contact";
import { formatCurrency } from "@/lib/i18n-core";
import type { MedicationListItem } from "@/types/medication";

/**
 * Página do carrinho. Os itens vivem no localStorage; os dados dos
 * medicamentos do catálogo são relidos do servidor (catálogo passado como
 * prop) para o preço e o stock estarem atualizados.
 */
export default function CartView({ catalog }: { catalog: MedicationListItem[] }) {
  const { t, locale } = useI18n();
  const { items } = useCart();

  /** Junta o carrinho guardado com os dados frescos do catálogo. */
  const rows = useMemo(
    () =>
      items.map((item) => {
        const fresh = item.medicationId
          ? catalog.find((medication) => medication.id === item.medicationId) ?? null
          : null;
        return { item, fresh };
      }),
    [items, catalog]
  );

  const total = rows.reduce((sum, row) => {
    if (!row.fresh?.minPrice) return sum;
    return sum + Number(row.fresh.minPrice) * row.item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-cart3 fs-1 text-secondary"></i>
        <h2 className="h5 fw-bold mt-3">{t("cart.emptyTitle")}</h2>
        <p className="text-secondary small">{t("cart.emptyText")}</p>
        <Link href="/scan-receita" className="btn btn-success rounded-pill px-4">
          <i className="bi bi-upc-scan me-2"></i>
          {t("cart.startScan")}
        </Link>
      </div>
    );
  }

  const shareText = [
    t("cart.shareIntro"),
    ...rows.map(
      (row) =>
        `• ${row.item.quantity}x ${row.fresh?.name ?? row.item.name}${
          (row.fresh?.dosage ?? row.item.dosage) ? ` (${row.fresh?.dosage ?? row.item.dosage})` : ""
        }`
    ),
  ].join("\n");

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <p className="small text-secondary mb-0">
          <i className="bi bi-info-circle me-1"></i>
          {t("cart.localNote")}
        </p>
        <div className="d-flex gap-2">
          <a href={whatsappHref(shareText)} target="_blank" rel="noopener noreferrer" className="btn btn-outline-success btn-sm rounded-pill">
            <i className="bi bi-whatsapp me-1"></i>
            {t("cart.share")}
          </a>
          <button type="button" onClick={clearCart} className="btn btn-outline-danger btn-sm rounded-pill">
            <i className="bi bi-trash me-1"></i>
            {t("cart.clear")}
          </button>
        </div>
      </div>

      <div className="med-grid">
        {rows.map(({ item, fresh }) => {
          const med: MedicationListItem = fresh ?? {
            id: item.medicationId ?? 0,
            name: item.name,
            dosage: item.dosage ?? "",
            image: item.image,
            pharmacyCount: 0,
            totalQuantity: 0,
            inStock: false,
            minPrice: null,
          };

          return (
            <div key={item.key} className="d-flex flex-column">
              <MedicationCard
                med={med}
                href={fresh ? `/medications/${fresh.id}` : undefined}
                showAvailability={fresh !== null}
                showCart={false}
                onRemove={() => removeFromCart(item.key)}
              />

              {fresh === null && (
                <span className="badge bg-warning text-dark align-self-start mt-2">
                  {t("scan.notInCatalog")}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {total > 0 && (
        <p className="mt-4 mb-0 fw-bold">
          {t("cart.estimateTotal")}: <span style={{ color: "#0f8a0e" }}>{formatCurrency(locale, total)}</span>
        </p>
      )}
    </>
  );
}
