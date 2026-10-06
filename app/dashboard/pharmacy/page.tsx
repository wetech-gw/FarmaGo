import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LocationPicker from "@/components/LocationPicker";
import { AdminImageThumb } from "@/components/AdminImageThumb";
import { savePharmacyProfile, requestRevalidation } from "./actions";
import { formatDate, getI18n } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n-core";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  approved: "text-bg-success",
  pending: "text-bg-warning",
  rejected: "text-bg-danger",
} as const;

const STATUS_KEYS = {
  approved: "status.validated",
  pending: "status.pending",
  rejected: "status.rejected",
} as const satisfies Record<keyof typeof STATUS_STYLES, TKey>;

export default async function DashboardPharmacyPage() {
  const { locale, t } = await getI18n();
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const pharmacyId = user.pharmacyId;
  if (!pharmacyId) redirect("/dashboard/sem-farmacia");

  const pharmacy = await prisma.pharmacy.findUnique({
    where: { id: pharmacyId },
    select: {
      id: true, name: true, image: true, address: true, phone: true,
      schedule: true, hours: true, latitude: true, longitude: true,
      isGuard: true, isOpen: true, status: true, validatedAt: true,
    },
  });

  if (!pharmacy) redirect("/dashboard/sem-farmacia");

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">{t("dash.profileTitle")}</h1>
          <p className="text-secondary small mb-0">
            {t("dash.profileSubtitle")}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className={`badge ${STATUS_STYLES[pharmacy.status]}`}>
            {t(STATUS_KEYS[pharmacy.status])}
          </span>
          {pharmacy.validatedAt && (
            <span className="small text-secondary">
              {t("admin.validatedOn", { date: formatDate(locale, pharmacy.validatedAt) })}
            </span>
          )}
        </div>
      </div>

      <form
        action={savePharmacyProfile}
        encType="multipart/form-data"
        className="row g-4"
      >
        <input type="hidden" name="id" value={pharmacy.id} />

        <div className="col-12 col-xl-7">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">
                <i className="bi bi-info-circle me-2" style={{ color: "#0f8a0e" }}></i>
                {t("dash.publicInfo")}
              </h2>

              <div className="row g-3">
                <div className="col-md-7">
                  <label className="form-label small fw-medium text-secondary" htmlFor="ph-name">
                    {t("register.pharmacyName").replace(" *", "")}
                  </label>
                  <input
                    id="ph-name"
                    name="name"
                    type="text"
                    className="form-control rounded-3"
                    defaultValue={pharmacy.name}
                    required
                  />
                </div>

                <div className="col-md-5">
                  <label className="form-label small fw-medium text-secondary" htmlFor="ph-phone">
                    {t("common.phone")}
                  </label>
                  <input
                    id="ph-phone"
                    name="phone"
                    type="tel"
                    className="form-control rounded-3"
                    defaultValue={pharmacy.phone}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-medium text-secondary" htmlFor="ph-address">
                    {t("common.address")}
                  </label>
                  <input
                    id="ph-address"
                    name="address"
                    type="text"
                    className="form-control rounded-3"
                    defaultValue={pharmacy.address}
                    required
                  />
                </div>

                <div className="col-md-5">
                  <label className="form-label small fw-medium text-secondary" htmlFor="ph-schedule">
                    {t("common.openDays")}
                  </label>
                  <input
                    id="ph-schedule"
                    name="schedule"
                    type="text"
                    className="form-control rounded-3"
                    placeholder={t("register.schedulePlaceholder")}
                    defaultValue={pharmacy.schedule}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-medium text-secondary" htmlFor="ph-hours">
                    {t("common.hours")}
                  </label>
                  <input
                    id="ph-hours"
                    name="hours"
                    type="text"
                    className="form-control rounded-3"
                    placeholder="08:00 - 20:00"
                    defaultValue={pharmacy.hours}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-medium text-secondary" htmlFor="ph-guard">
                    {t("guard")}
                  </label>
                  <select
                    id="ph-guard"
                    name="isGuard"
                    className="form-select rounded-3"
                    defaultValue={pharmacy.isGuard ? "1" : "0"}
                  >
                    <option value="0">{t("common.no")}</option>
                    <option value="1">{t("common.yes")}</option>
                  </select>
                </div>

                <div className="col-md-5">
                  <label className="form-label small fw-medium text-secondary" htmlFor="ph-image">
                    {t("register.image")}
                  </label>
                  <input
                    id="ph-image"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    className="form-control rounded-3"
                  />
                  <div className="form-text">{t("dash.imageKeep")}</div>
                </div>

                <div className="col-md-2 d-flex align-items-end">
                  <AdminImageThumb
                    src={pharmacy.image}
                    alt={pharmacy.name}
                    kind="pharmacy"
                    size={56}
                    radius="0.85rem"
                    background="var(--px-green-soft)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">
                <i className="bi bi-geo-alt me-2" style={{ color: "#ea580c" }}></i>
                {t("dash.location")}
              </h2>
              <p className="form-text">{t("dash.locationHint")}</p>

              <LocationPicker
                latitude={pharmacy.latitude}
                longitude={pharmacy.longitude}
              />

              <button type="submit" className="btn btn-success rounded-3 px-4 py-2 fw-semibold">
                <i className="bi bi-check-lg me-1"></i>
                {t("dash.saveChanges")}
              </button>
            </div>
          </div>
        </div>
      </form>

      {pharmacy.status !== "approved" && (
        <form action={requestRevalidation} className="card border-0 rounded-4 shadow-sm bg-white mt-4">
          <div className="card-body d-flex flex-wrap align-items-center gap-3">
            <i className="bi bi-megaphone fs-3 text-warning"></i>
            <div className="flex-grow-1">
              <div className="fw-bold">{t("dash.changedDataTitle")}</div>
              <div className="small text-secondary">
                {t("dash.changedDataText")}
              </div>
            </div>
            <button type="submit" className="btn btn-outline-warning rounded-3 px-4 py-2">
              <i className="bi bi-arrow-clockwise me-1"></i>
              {t("dash.requestRevalidation")}
            </button>
          </div>
        </form>
      )}
    </>
  );
}