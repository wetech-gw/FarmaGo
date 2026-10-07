import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSelectableMedications } from "@/lib/medications";
import { AdminImageThumb } from "@/components/AdminImageThumb";
import { saveStock, deleteStock } from "../actions";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import FormModal from "@/components/FormModal";
import { daysUntil } from "@/lib/dates";
import { formatDate, getI18n } from "@/lib/i18n";

type StockEditing = {
  id: number;
  medicationId: number;
  quantity: number;
  expiryDate: Date;
  unitPrice: unknown;
  batchNumber: string | null;
};

type MedicationOption = { id: number; name: string; dosage: string; isPrivate: boolean };

function StockForm({
  editing,
  medications,
  available,
  toDateInput,
  labels,
}: {
  editing: StockEditing | null;
  medications: MedicationOption[];
  available: Set<number>;
  toDateInput: (date: Date) => string;
  labels: {
    medication: string;
    chooseMedication: string;
    catalogGroup: string;
    myMedsGroup: string;
    cancel: string;
    quantity: string;
    expiry: string;
    unitPrice: string;
    batch: string;
    alreadyInStock: string;
  };
}) {
  const catalog = medications.filter((medication) => !medication.isPrivate);
  const own = medications.filter((medication) => medication.isPrivate);

  const renderOption = (medication: MedicationOption) => (
    <option key={medication.id} value={medication.id}>
      {medication.name} — {medication.dosage}
      {available.has(medication.id) && editing?.medicationId !== medication.id
        ? labels.alreadyInStock
        : ""}
    </option>
  );

  return (
    <form action={saveStock} className="row g-3 align-items-end">
      {editing && <input type="hidden" name="id" value={editing.id} />}

      <div className="col-12 col-md-4">
        <label className="form-label small fw-medium text-secondary" htmlFor="st-med">
          {labels.medication}
        </label>
        <select
          id="st-med"
          name="medicationId"
          className="form-select rounded-3"
          defaultValue={editing?.medicationId ?? ""}
          required
        >
          <option value="" disabled>{labels.chooseMedication}</option>
          {catalog.length > 0 && (
            <optgroup label={labels.catalogGroup}>{catalog.map(renderOption)}</optgroup>
          )}
          {own.length > 0 && (
            <optgroup label={labels.myMedsGroup}>{own.map(renderOption)}</optgroup>
          )}
        </select>
      </div>

      <div className="col-6 col-md-2">
        <label className="form-label small fw-medium text-secondary" htmlFor="st-qty">
          {labels.quantity}
        </label>
        <input
          id="st-qty"
          name="quantity"
          type="number"
          min={0}
          className="form-control rounded-3"
          defaultValue={editing?.quantity ?? 0}
          required
        />
      </div>

      <div className="col-6 col-md-3">
        <label className="form-label small fw-medium text-secondary" htmlFor="st-expiry">
          {labels.expiry}
        </label>
        <input
          id="st-expiry"
          name="expiryDate"
          type="date"
          className="form-control rounded-3"
          defaultValue={editing ? toDateInput(editing.expiryDate) : ""}
          required
        />
      </div>

      <div className="col-6 col-md-2">
        <label className="form-label small fw-medium text-secondary" htmlFor="st-price">
          {labels.unitPrice}
        </label>
        <input
          id="st-price"
          name="unitPrice"
          type="number"
          min={0}
          step="0.01"
          className="form-control rounded-3"
          defaultValue={editing ? Number(editing.unitPrice).toFixed(2) : "0.00"}
          required
        />
      </div>

      <div className="col-12 col-md-1">
        <label className="form-label small fw-medium text-secondary" htmlFor="st-batch">
          {labels.batch}
        </label>
        <input
          id="st-batch"
          name="batchNumber"
          type="text"
          className="form-control rounded-3"
          defaultValue={editing?.batchNumber ?? ""}
        />
      </div>

      <div className="col-12 col-md-1 d-flex gap-2">
        <button type="submit" className="btn btn-success rounded-3 px-3 py-2 w-100">
          <i className="bi bi-check-lg"></i>
        </button>
        {editing && (
          <Link
            href="/dashboard/stock"
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

const EXPIRY_WARNING_DAYS = 90;

export default async function DashboardStockPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const { locale, t } = await getI18n();
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const pharmacyId = user.pharmacyId;
  if (!pharmacyId) redirect("/dashboard/sem-farmacia");

  const [stocks, medications] = await Promise.all([
    prisma.pharmacyStock.findMany({
      where: { pharmacyId },
      include: { medication: true },
      orderBy: [{ quantity: "asc" }, { expiryDate: "asc" }],
    }),
    getSelectableMedications(pharmacyId),
  ]);

  const editingId = edit ? Number(edit) : null;
  const editing = editingId ? stocks.find((stock) => stock.id === editingId) : null;

  const available = new Set(stocks.map((stock) => stock.medicationId));
  const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

  const formLabels = {
    medication: t("common.medication"),
    chooseMedication: t("dash.chooseMedication"),
    catalogGroup: t("dash.catalogGroup"),
    myMedsGroup: t("dash.myMedsGroup"),
    cancel: t("common.cancel"),
    quantity: t("common.quantity"),
    expiry: t("common.expiry"),
    unitPrice: t("common.unitPrice"),
    batch: t("common.batch"),
    alreadyInStock: t("dash.alreadyInStock"),
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">{t("dash.stockTitle")}</h1>
          <p className="text-secondary small mb-0">
            {t("dash.stockSubtitle")}
          </p>
        </div>
      </div>

      <div className="mb-4">
        {editing ? (
          <div className="card border-0 rounded-4 shadow-sm bg-white">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">
                <i className="bi bi-pencil-square me-2" style={{ color: "#ea580c" }}></i>
                {t("dash.editPrefix", { name: editing.medication.name })}
              </h2>
              <StockForm
                editing={editing}
                medications={medications}
                available={available}
                toDateInput={toDateInput}
                labels={formLabels}
              />
            </div>
          </div>
        ) : (
          <FormModal
            title={t("dash.addToStock")}
            buttonLabel={t("dash.addToStockButton")}
            buttonIcon="bi-plus-lg"
          >
            <StockForm
              editing={null}
              medications={medications}
              available={available}
              toDateInput={toDateInput}
              labels={formLabels}
            />
          </FormModal>
        )}
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">
            <i className="bi bi-list-ul me-2" style={{ color: "#2563eb" }}></i>
            {t("common.itemsCount", { count: stocks.length })}
          </h2>

          {stocks.length === 0 ? (
            <p className="text-secondary small mb-0">
              {t("dash.stockEmpty")}
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-secondary">
                    <th>{t("common.medication")}</th>
                    <th>{t("common.batch")}</th>
                    <th>{t("common.expiry")}</th>
                    <th>{t("common.quantity")}</th>
                    <th>{t("common.price")}</th>
                    <th>{t("common.status")}</th>
                    <th style={{ width: 120 }} />
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => {
                    const daysLeft = daysUntil(stock.expiryDate);
                    const expired = daysLeft <= 0;
                    const expiring = !expired && daysLeft <= EXPIRY_WARNING_DAYS;
                    const availableStock = stock.quantity > 0 && !expired;

                    return (
                      <tr key={stock.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <AdminImageThumb
                              src={stock.medication.image}
                              alt={stock.medication.name}
                              size={32}
                            />
                            <div>
                              <div className="fw-semibold">{stock.medication.name}</div>
                              <div className="small text-secondary">
                                {stock.medication.dosage}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="small">{stock.batchNumber || t("common.notAvailableYet")}</td>
                        <td className="small">
                          {formatDate(locale, stock.expiryDate)}
                        </td>
                        <td>
                          <span className={`badge ${
                            stock.quantity > 0 ? "text-bg-success" : "text-bg-secondary"
                          }`}>
                            {stock.quantity}
                          </span>
                        </td>
                        <td className="small">{Number(stock.unitPrice).toFixed(2)}</td>
                        <td>
                          {expired ? (
                            <span className="badge text-bg-danger">{t("dash.expired")}</span>
                          ) : expiring ? (
                            <span className="badge text-bg-warning">{t("common.daysCount", { count: daysLeft })}</span>
                          ) : availableStock ? (
                            <span className="badge text-bg-success">{t("common.available")}</span>
                          ) : (
                            <span className="badge text-bg-secondary">{t("common.unavailable")}</span>
                          )}
                        </td>
                        <td className="text-end">
                          <Link
                            href={`/dashboard/stock?edit=${stock.id}`}
                            className="btn btn-sm btn-outline-success rounded-3 me-1"
                            aria-label={t("common.edit")}
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <form action={deleteStock} className="d-inline">
                            <input type="hidden" name="id" value={stock.id} />
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
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}