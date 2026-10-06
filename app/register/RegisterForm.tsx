"use client";

import { useActionState } from "react";
import LocationPicker from "@/components/LocationPicker";
import { useT } from "@/components/I18nProvider";
import { registerAction, type RegisterState } from "@/app/register/actions";

const initialState: RegisterState = { error: "" };

export default function RegisterForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} encType="multipart/form-data" className="row g-3">
      <div className="col-12">
        <h5 className="fw-bold small text-uppercase text-secondary mb-0">
          <i className="bi bi-person-badge me-2"></i>
          {t("register.stepAccount")}
        </h5>
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-medium text-secondary" htmlFor="name">
          {t("register.pharmacistName")}
        </label>
        <input id="name" name="name" type="text" className="form-control rounded-3" required />
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-medium text-secondary" htmlFor="remail">
          {t("common.email")} *
        </label>
        <input
          id="remail"
          name="email"
          type="email"
          className="form-control rounded-3"
          autoComplete="email"
          required
        />
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-medium text-secondary" htmlFor="repass">
          {t("register.password")}
        </label>
        <input
          id="repass"
          name="password"
          type="password"
          className="form-control rounded-3"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <div className="form-text">{t("register.passwordHint")}</div>
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-medium text-secondary" htmlFor="reconfirm">
          {t("register.confirmPassword")}
        </label>
        <input
          id="reconfirm"
          name="confirm"
          type="password"
          className="form-control rounded-3"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>

      <div className="col-12">
        <hr className="my-1" />
        <h5 className="fw-bold small text-uppercase text-secondary mb-0">
          <i className="bi bi-shop me-2"></i>
          {t("register.stepPharmacy")}
        </h5>
        <p className="form-text">{t("register.pendingNote")}</p>
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-medium text-secondary" htmlFor="pharmacyName">
          {t("register.pharmacyName")}
        </label>
        <input
          id="pharmacyName"
          name="pharmacyName"
          type="text"
          className="form-control rounded-3"
          placeholder={t("register.pharmacyNamePlaceholder")}
          required
        />
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-medium text-secondary" htmlFor="rephone">
          {t("register.phone")}
        </label>
        <input
          id="rephone"
          name="phone"
          type="tel"
          className="form-control rounded-3"
          placeholder="+245 955 000 000"
          required
        />
      </div>

      <div className="col-12">
        <label className="form-label small fw-medium text-secondary" htmlFor="readdress">
          {t("register.address")}
        </label>
        <input
          id="readdress"
          name="address"
          type="text"
          className="form-control rounded-3"
          placeholder={t("register.addressPlaceholder")}
          required
        />
      </div>

      <div className="col-md-5">
        <label className="form-label small fw-medium text-secondary" htmlFor="reschedule">
          {t("register.openDays")}
        </label>
        <input
          id="reschedule"
          name="schedule"
          type="text"
          className="form-control rounded-3"
          placeholder={t("register.schedulePlaceholder")}
          defaultValue="Segunda - Sexta"
        />
      </div>

      <div className="col-md-4">
        <label className="form-label small fw-medium text-secondary" htmlFor="rehours">
          {t("register.hours")}
        </label>
        <input
          id="rehours"
          name="hours"
          type="text"
          className="form-control rounded-3"
          placeholder="08:00 - 20:00"
          defaultValue="08:00 - 20:00"
        />
      </div>

      <div className="col-md-3">
        <label className="form-label small fw-medium text-secondary" htmlFor="reguard">
          {t("register.guard")}
        </label>
        <select id="reguard" name="isGuard" className="form-select rounded-3" defaultValue="0">
          <option value="0">{t("common.no")}</option>
          <option value="1">{t("common.yes")}</option>
        </select>
      </div>

      <div className="col-md-4">
        <label className="form-label small fw-medium text-secondary" htmlFor="reimage">
          {t("register.image")}
        </label>
        <input id="reimage" name="imageFile" type="file" accept="image/*" className="form-control rounded-3" />
        <div className="form-text">{t("register.imageHint")}</div>
      </div>

      <div className="col-md-8">
        <label className="form-label small fw-medium text-secondary">
          {t("register.mapLocation")}
        </label>
        <LocationPicker />
      </div>

      {state.error && (
        <div className="col-12">
          <div className="alert alert-danger rounded-3 small py-2 px-3 mb-0">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {state.error}
          </div>
        </div>
      )}

      <div className="col-12">
        <button
          type="submit"
          disabled={pending}
          className="btn text-white rounded-3 px-4 py-2 fw-medium"
          style={{ backgroundColor: "#0f8a0e" }}
        >
          {pending ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              {t("register.creating")}
            </>
          ) : (
            <>
              <i className="bi bi-check2-circle me-1"></i>
              {t("register.submit")}
            </>
          )}
        </button>
      </div>
    </form>
  );
}