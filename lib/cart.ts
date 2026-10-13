import { useEffect, useState } from "react";

/**
 * Carrinho de compras local (sem conta, sem login).
 *
 * Vive no `localStorage` do browser do paciente: os medicamentos que ele
 * adiciona a partir do scanner de receitas ficam disponíveis para consultar
 * mais tarde, no mesmo dispositivo. Nada é enviado para o servidor — o
 * carrinho é só uma conveniência local, e medicamentos/preços são sempre
 * relidos do catálogo quando a página do carrinho abre.
 */

const CART_KEY = "farmago_cart";
const CART_EVENT = "farmago:cart-change";

export type CartItem = {
  /** Chave estável do item: "m:<id>" para medicamentos do catálogo, "r:<nome>" para palavras lidas na receita sem match. */
  key: string;
  /** id do medicamento do catálogo, ou null quando o nome não bateu com nada. */
  medicationId: number | null;
  name: string;
  dosage: string | null;
  image: string | null;
  quantity: number;
};

type StoredItem = {
  key: string;
  medicationId: number | null;
  name: string;
  dosage: string | null;
  image: string | null;
  quantity: number;
};

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function read(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CART_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as StoredItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is StoredItem =>
          typeof item === "object" &&
          item !== null &&
          typeof item.key === "string" &&
          typeof item.name === "string"
      )
      .map((item) => ({
        key: item.key,
        medicationId: typeof item.medicationId === "number" ? item.medicationId : null,
        name: item.name.slice(0, 150),
        dosage: typeof item.dosage === "string" ? item.dosage.slice(0, 50) : null,
        image: typeof item.image === "string" ? item.image : null,
        quantity: Math.min(Math.max(Math.round(Number(item.quantity)) || 1, 1), 99),
      }));
  } catch {
    return [];
  }
}

function write(items: CartItem[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // localStorage cheio ou bloqueado: o carrinho fica só em memória.
  }
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

/** Adiciona (ou soma quantidade) um medicamento do catálogo ao carrinho. */
export function addMedicationToCart(
  item: { id: number; name: string; dosage: string; image: string | null },
  quantity = 1
): void {
  const items = read();
  const key = `m:${item.id}`;
  const existing = items.find((entry) => entry.key === key);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, 99);
  } else {
    items.push({
      key,
      medicationId: item.id,
      name: item.name,
      dosage: item.dosage,
      image: item.image,
      quantity: Math.min(Math.max(Math.round(quantity) || 1, 1), 99),
    });
  }

  write(items);
}

/** Adiciona um nome lido na receita que não bateu com nenhum medicamento. */
export function addRawToCart(name: string, dosage: string | null = null, quantity = 1): void {
  const items = read();
  const key = `r:${slug(name)}`;
  const existing = items.find((entry) => entry.key === key);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, 99);
  } else {
    items.push({ key, medicationId: null, name, dosage, image: null, quantity: Math.min(Math.max(Math.round(quantity) || 1, 1), 99) });
  }

  write(items);
}

export function setCartQuantity(key: string, quantity: number): void {
  const items = read();
  const item = items.find((entry) => entry.key === key);
  if (!item) return;

  const safe = Math.round(quantity);
  if (safe < 1) {
    write(items.filter((entry) => entry.key !== key));
    return;
  }

  item.quantity = Math.min(safe, 99);
  write(items);
}

export function removeFromCart(key: string): void {
  write(read().filter((entry) => entry.key !== key));
}

export function clearCart(): void {
  write([]);
}

/** Estado do carrinho partilhado pelos componentes da página. */
export function useCart(): { items: CartItem[]; count: number } {
  const [items, setItems] = useState<CartItem[]>(read);

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const count = items.reduce((total, item) => total + item.quantity, 0);
  return { items, count };
}
