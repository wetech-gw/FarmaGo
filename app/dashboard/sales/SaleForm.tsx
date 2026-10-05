"use client";

import { useState } from "react";
import Link from "next/link";
import { createSale } from "./actions";

type StockOption = {
  stockId: number;
  label: string;
  price: number;
  available: number;
};

type ClientOption = { id: number; name: string };

export default function SaleForm({
  stocks,
  clients,
}: {
  stocks: StockOption[];
  clients: ClientOption[];
}) {
  const [clientChoice, setClientChoice] = useState<string>("");
  const [items, setItems] = useState<{ stockId: string; quantity: string }[]>([
    { stockId: "", quantity: "1" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const total = items.reduce((sum, item) => {
    const stock = stocks.find((s) => String(s.stockId) === item.stockId);
    return sum + (stock ? stock.price * (Number(item.quantity) || 0) : 0);
  }, 0);

  function updateItem(index: number, field: "stockId" | "quantity", value: string) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addRow() {
    setItems((prev) => [...prev, { stockId: "", quantity: "1" }]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const isNew = clientChoice === "__new__";
    const payload = {
      clientId: clientChoice && !isNew ? Number(clientChoice) : null,
      newClientName: isNew ? String(new FormData(form).get("newClientName") ?? "") : undefined,
      newClientPhone: isNew ? String(new FormData(form).get("newClientPhone") ?? "") : undefined,
      newClientEmail: isNew ? String(new FormData(form).get("newClientEmail") ?? "") : undefined,
      items: items
        .filter((it) => it.stockId)
        .map((it) => ({ stockId: Number(it.stockId), quantity: Number(it.quantity) || 0 })),
    };

    setPending(true);
    try {
      await createSale(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registar a venda.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card border-0 rounded-4 shadow-sm bg-white">
      <div className="card-body">
        <h2 className="h6 fw-bold mb-3">
          <i className="bi bi-person me-2" style={{ color: "#2563eb" }}></i>
          Cliente
        </h2>

        <select
          className="form-select rounded-3 mb-3"
          value={clientChoice}
          onChange={(e) => setClientChoice(e.target.value)}
          required
        >
          <option value="" disabled>Escolher cliente…</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
          <option value="__new__">+ Novo cliente</option>
        </select>

        {clientChoice === "__new__" && (
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <input name="newClientName" className="form-control rounded-3" placeholder="Nome *" required />
            </div>
            <div className="col-12 col-md-4">
              <input name="newClientPhone" className="form-control rounded-3" placeholder="Telefone" />
            </div>
            <div className="col-12 col-md-4">
              <input name="newClientEmail" type="email" className="form-control rounded-3" placeholder="Email" />
            </div>
          </div>
        )}

        <hr />

        <h2 className="h6 fw-bold mb-3">
          <i className="bi bi-cart3 me-2" style={{ color: "#0f8a0e" }}></i>
          Artigos
        </h2>

        {items.map((item, index) => (
          <div className="row g-2 align-items-end mb-2" key={index}>
            <div className="col-8 col-md-7">
              <select
                className="form-select rounded-3"
                value={item.stockId}
                onChange={(e) => updateItem(index, "stockId", e.target.value)}
                required
              >
                <option value="" disabled>Medicamento…</option>
                {stocks.map((s) => (
                  <option key={s.stockId} value={s.stockId}>
                    {s.label} — {s.price.toFixed(2)} (disp.: {s.available})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-3 col-md-3">
              <input
                type="number"
                min={1}
                className="form-control rounded-3"
                placeholder="Qtd"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                required
              />
            </div>
            <div className="col-1">
              {items.length > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-danger rounded-3 w-100"
                  onClick={() => removeRow(index)}
                  aria-label="Remover linha"
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          </div>
        ))}

        <button type="button" onClick={addRow} className="btn btn-outline-secondary btn-sm rounded-3 mb-3">
          <i className="bi bi-plus-lg me-1"></i>Adicionar linha
        </button>

        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-bold fs-5">Total: {total.toFixed(2)}</div>
          <div className="d-flex gap-2">
            <Link href="/dashboard/sales" className="btn btn-outline-secondary rounded-3">
              Cancelar
            </Link>
            <button type="submit" className="btn btn-success rounded-3" disabled={pending}>
              <i className="bi bi-check-lg me-1"></i>
              {pending ? "A registar…" : "Registar venda"}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger rounded-3 mt-3 mb-0">{error}</div>}
      </div>
    </form>
  );
}
