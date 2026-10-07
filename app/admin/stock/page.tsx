import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { daysUntil } from "@/lib/dates";
import { formatDate, formatNumber, getI18n } from "@/lib/i18n";
import { addStock, updateStock, deleteStock } from "./actions";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import FormModal from "@/components/FormModal";

type EditingStock = {
  id: number;
  quantity: number;
  unitPrice: unknown;
  expiryDate: Date;
  batchNumber: string | null;
  pharmacy: { name: string };
  medication: { name: string; dosage: string };
};

type FormLabels = {
  pharmacy: string;
  choosePharmacy: string;
  medication: string;
  chooseMedication: string;
  quantity: string;
  expiry: string;
  unitPrice: string;
  batch: string;
  cancel: string;
};

function StockForm({
  editing,
  pharmacies,
  catalog,
  toDateInput,
  labels,
}: {
  editing: EditingStock | null;
  pharmacies: { id: number; name: string }[];
  catalog: { id: number; name: string; dosage: string }[];
  toDateInput: (date: Date) => string;
  labels: FormLabels;
}) {
  return (
    <form action={editing ? updateStock : addStock} className="row g-3 align-items-end">
      {editing && <input type="hidden" name="id" value={editing.id} />}

      {!editing && (
        <>
          <div className="col-12 col-md-4">
            <label className="form-label small fw-medium text-secondary" htmlFor="as-pharmacy">
              {labels.pharmacy}
            </label>
            <select
              id="as-pharmacy"
              name="pharmacyId"
              className="form-select rounded-3"
              defaultValue=""
              required
            >
              <option value="" disabled>{labels.choosePharmacy}</option>
              {pharmacies.map((pharmacy) => (
                <option key={pharmacy.id} value={pharmacy.id}>{pharmacy.name}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label small fw-medium text-secondary" htmlFor="as-medication">
              {labels.medication}
            </label>
            <select
              id="as-medication"
              name="medicationId"
              className="form-select rounded-3"
              defaultValue=""
              required
            >
              <option value="" disabled>{labels.chooseMedication}</option>
              {catalog.map((medication) => (
                <option key={medication.id} value={medication.id}>
                  {medication.name} — {medication.dosage}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="col-6 col-md-2">
        <label className="form-label small fw-medium text-secondary" htmlFor="as-qty">
          {labels.quantity}
        </label>
        <input
          id="as-qty"
          name="quantity"
          type="number"
          min={0}
          className="form-control rounded-3"
          defaultValue={editing?.quantity ?? 0}
          required
        />
      </div>

      <div className="col-6 col-md-3">
        <label className="form-label small fw-medium text-secondary" htmlFor="as-expiry">
          {labels.expiry}
        </label>
        <input
          id="as-expiry"
          name="expiryDate"
          type="date"
          className="form-control rounded-3"
          defaultValue={editing ? toDateInput(editing.expiryDate) : ""}
          required
        />
      </div>

      <div className="col-6 col-md-2">
        <label className="form-label small fw-medium text-secondary" htmlFor="as-price">
          {labels.unitPrice}
        </label>
        <input
          id="as-price"
          name="unitPrice"
          type="number"
          min={0}
          step="0.01"
          className="form-control rounded-3"
          defaultValue={editing ? Number(editing.unitPrice).toFixed(2) : "0.00"}
          required
        />
      </div>

      <div className="col-6 col-md-2">
        <label className="form-label small fw-medium text-secondary" htmlFor="as-batch">
          {labels.batch}
        </label>
        <input
          id="as-batch"
          name="batchNumber"
          type="text"
          className="form-control rounded-3"
          defaultValue={editing?.batchNumber ?? ""}
        />
      </div>

      <div className="col-12 d-flex gap-2">
        <button type="submit" className="btn btn-success rounded-3 px-4 py-2">
          <i className="bi bi-check-lg me-1"></i>
        </button>
        {editing && (
          <Link
            href="/admin/stock"
            className="btn btn-outline-secondary rounded-3 px-3 py-2"
            aria-label={labels.cancel}
          >
            <i className="bi bi-x-lg"></i>
          </Link>
        )}
      </div>
    </form>
  );
}

export const dynamic = "force-dynamic";

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ pharmacy?: string; edit?: string }>;
}) {
  const { locale, t } = await getI18n();
  await requireAdmin();

  const { pharmacy, edit } = await searchParams;
  const pharmacyId = pharmacy ? parseInt(pharmacy) : undefined;

  const [stocks, pharmacies, catalog] = await Promise.all([
    prisma.pharmacyStock.findMany({
      where: pharmacyId ? { pharmacyId } : {},
      include: {
        pharmacy:   { select: { name: true } },
        medication: { select: { name: true, dosage: true } },
      },
      orderBy: { expiryDate: "asc" },
    }),
    prisma.pharmacy.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    // O admin abastece as farmácias a partir do catálogo global; os meds
    // privados de cada farmácia não entram aqui.
    prisma.medication.findMany({
      where: { pharmacyId: null },
      select: { id: true, name: true, dosage: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const editingId = edit ? Number(edit) : null;
  const editing = editingId ? stocks.find((s) => s.id === editingId) : null;

  const hasUrgent = stocks.some((s) => {
    const days = daysUntil(s.expiryDate);
    return days >= 0 && days <= 30;
  });

  const totalUnits = stocks.reduce((sum, s) => sum + s.quantity, 0);

  const totalByPharmacy = pharmacies.map((p) => {
    const items = stocks.filter((s) => s.pharmacyId === p.id);
    return {
      id:    p.id,
      name:  p.name,
      total: items.reduce((sum, s) => sum + s.quantity, 0),
      count: items.length,
    };
  }).filter((p) => p.count > 0);

  const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

  const formLabels: FormLabels = {
    pharmacy: t("common.pharmacy"),
    choosePharmacy: t("admin.choosePharmacy"),
    medication: t("common.medication"),
    chooseMedication: t("dash.chooseMedication"),
    quantity: t("common.quantity"),
    expiry: t("common.expiry"),
    unitPrice: t("common.unitPrice"),
    batch: t("common.batch"),
    cancel: t("common.cancel"),
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 fs-2">{t("admin.stockTitle")}</h1>
          <p className="text-muted small m-0">
            {t("admin.stockSubtitle", {
              entries: formatNumber(locale, stocks.length),
              units: formatNumber(locale, totalUnits),
            })}
          </p>
        </div>
      </div>

      {hasUrgent && (
        <div className="alert border-0 rounded-3 mb-4 d-flex align-items-center gap-3"
          style={{ backgroundColor: "#fff7ed", color: "#9a3412" }}>
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <span className="fw-medium small">{t("admin.stockUrgentWarning")}</span>
        </div>
      )}

      <div className="card border-0 rounded-4 shadow-sm bg-white mb-4">
        <div className="card-body">
          {editing ? (
            <>
              <h2 className="h6 fw-bold mb-1">
                <i className="bi bi-pencil-square me-2" style={{ color: "#ea580c" }}></i>
                {t("dash.editPrefix", {
                  name: `${editing.medication.name} — ${editing.pharmacy.name}`,
                })}
              </h2>
              <StockForm
                editing={editing}
                pharmacies={pharmacies}
                catalog={catalog}
                toDateInput={toDateInput}
                labels={formLabels}
              />
            </>
          ) : catalog.length === 0 || pharmacies.length === 0 ? (
            <p className="text-secondary small mb-0">
              {catalog.length === 0 ? t("admin.noMedicationsInCatalog") : t("admin.noPharmaciesFound")}
            </p>
          ) : (
            <>
              <p className="text-secondary small mb-3">
                <i className="bi bi-info-circle me-1"></i>
                {t("admin.stockAddHint")}
              </p>
              <FormModal
                title={t("dash.addToStock")}
                buttonLabel={t("dash.addToStockButton")}
                buttonIcon="bi-plus-lg"
              >
                <StockForm
                  editing={null}
                  pharmacies={pharmacies}
                  catalog={catalog}
                  toDateInput={toDateInput}
                  labels={formLabels}
                />
              </FormModal>
            </>
          )}
        </div>
      </div>

      {totalByPharmacy.length > 0 && (
        <div className="d-flex gap-3 mb-4 flex-wrap">
          {totalByPharmacy.map((p) => (
            <a key={p.id} href={`/admin/stock?pharmacy=${p.id}`}
              className={`card border-0 rounded-3 p-3 text-decoration-none shadow-sm ${pharmacyId === p.id ? "border border-dark" : ""}`}
              style={{ minWidth: "160px", backgroundColor: pharmacyId === p.id ? "#f0fdf4" : "#fff" }}>
              <div className="fw-semibold text-dark small"
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
                {p.name}
              </div>
              <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                {t("admin.stockPerPharmacy", {
                  count: formatNumber(locale, p.count),
                  units: formatNumber(locale, p.total),
                })}
              </div>
            </a>
          ))}
          {pharmacyId && (
            <a href="/admin/stock"
              className="btn btn-sm btn-outline-secondary rounded-3 align-self-center px-3">
              {t("admin.seeEverything")}
            </a>
          )}
        </div>
      )}

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold m-0">
            {pharmacyId
              ? t("admin.stockFor", { name: pharmacies.find((p) => p.id === pharmacyId)?.name ?? "" })
              : t("admin.allStockEntries")}
          </h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
            <thead className="border-bottom">
              <tr className="text-secondary">
                <th className="fw-medium ps-4 py-3">{t("common.pharmacy")}</th>
                <th className="fw-medium py-3">{t("common.medication")}</th>
                <th className="fw-medium py-3 text-center">{t("common.quantity")}</th>
                <th className="fw-medium py-3 text-center">{t("common.price")}</th>
                <th className="fw-medium py-3">{t("common.batch")}</th>
                <th className="fw-medium py-3">{t("common.expiry")}</th>
                <th className="fw-medium py-3 text-center">{t("common.status")}</th>
                <th style={{ width: 110 }} />
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-5 text-muted">{t("admin.noStockFound")}</td></tr>
              ) : stocks.map((s) => {
                const daysLeft  = daysUntil(s.expiryDate);
                const isExpired = daysLeft < 0;
                const isUrgent  = !isExpired && daysLeft <= 30;
                const isWarning = !isExpired && daysLeft <= 90 && daysLeft > 30;

                return (
                  <tr key={s.id}>
                    <td className="ps-4 py-3 fw-medium text-dark"
                      style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.pharmacy.name}
                    </td>
                    <td className="py-3 fw-semibold">
                      {s.medication.name}
                      <span className="text-muted fw-normal ms-1 small">{s.medication.dosage}</span>
                    </td>
                    <td className="py-3 text-center fw-bold">{formatNumber(locale, s.quantity)}</td>
                    <td className="py-3 text-center text-muted">
                      {formatNumber(locale, Number(s.unitPrice))}
                    </td>
                    <td className="py-3 text-muted">{s.batchNumber ?? t("common.notAvailableYet")}</td>
                    <td className="py-3 text-muted">{formatDate(locale, s.expiryDate)}</td>
                    <td className="py-3 text-center">
                      {isExpired
                        ? <span className="badge rounded-pill" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>{t("admin.expired")}</span>
                        : isUrgent
                        ? <span className="badge rounded-pill" style={{ backgroundColor: "#ffedd5", color: "#ea580c" }}>{t("admin.daysLeft", { count: daysLeft })}</span>
                        : isWarning
                        ? <span className="badge rounded-pill" style={{ backgroundColor: "#fef9c3", color: "#a16207" }}>{t("admin.daysLeft", { count: daysLeft })}</span>
                        : <span className="badge rounded-pill" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>{t("admin.ok")}</span>}
                    </td>
                    <td className="py-3 text-end pe-4">
                      <Link
                        href={`/admin/stock?edit=${s.id}`}
                        className="btn btn-sm btn-outline-success rounded-3 me-1"
                        aria-label={t("common.edit")}
                      >
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <form action={deleteStock} className="d-inline">
                        <input type="hidden" name="id" value={s.id} />
                        <ConfirmDeleteButton
                          message={t("dash.deleteStockConfirm")}
                          className="btn btn-sm btn-outline-danger rounded-3"
                          ariaLabel={t("common.remove")}
                        >
                          <i className="bi bi-trash"></i>
                        </ConfirmDeleteButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {stocks.length > 0 && (
              <tfoot className="border-top">
                <tr>
                  <td colSpan={2} className="ps-4 py-3 text-muted small fw-medium">{t("common.total")}</td>
                  <td className="py-3 text-center fw-bold">{formatNumber(locale, totalUnits)}</td>
                  <td colSpan={5}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}
