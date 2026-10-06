"use client";

import { useActionState } from "react";
import { useT } from "@/components/I18nProvider";
import { contactAction, type ContactState } from "@/app/contact/actions";

const initialState: ContactState = { ok: false };

export default function ContactForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState(contactAction, initialState);

  if (state.ok) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-check-circle text-white fs-1 d-block mb-3" aria-hidden="true"></i>
        <p className="text-white fw-semibold mb-1">{t("contact.sentTitle")}</p>
        <p className="text-white-50 small mb-0">{t("contact.sentText")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="d-flex flex-column gap-3">
      {/*
        Campo-armadilha: escondido a humanos, preenchido por bots.
        Preenchido, o servidor responde "sucesso" mas não grava nada.
      */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="position-relative">
        <label className="text-white small mb-1 opacity-75" htmlFor="contact-name">
          {t("contact.fieldName")} *
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          maxLength={150}
          required
          className="form-control bg-transparent text-white border-white rounded-pill px-3 shadow-none"
          style={{ borderColor: "rgba(255,255,255,0.5) !important" }}
        />
      </div>

      <div className="position-relative">
        <label className="text-white small mb-1 opacity-75" htmlFor="contact-email">
          {t("contact.fieldEmail")}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          maxLength={150}
          className="form-control bg-transparent text-white border-white rounded-pill px-3 shadow-none"
          style={{ borderColor: "rgba(255,255,255,0.5) !important" }}
        />
      </div>

      <div className="position-relative">
        <label className="text-white small mb-1 opacity-75" htmlFor="contact-phone">
          {t("contact.fieldPhone")}
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          maxLength={30}
          className="form-control bg-transparent text-white border-white rounded-pill px-3 shadow-none"
          style={{ borderColor: "rgba(255,255,255,0.5) !important" }}
        />
      </div>

      <div className="position-relative">
        <label className="text-white small mb-1 opacity-75" htmlFor="contact-message">
          {t("contact.fieldMessage")} *
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          maxLength={4000}
          required
          className="form-control bg-transparent text-white border-white rounded-4 px-3 shadow-none"
          style={{ borderColor: "rgba(255,255,255,0.5) !important", resize: "none" }}
        />
      </div>

      {state.error && (
        <div className="alert alert-danger rounded-3 small py-2 px-3 mb-0" role="alert">
          <i className="bi bi-exclamation-triangle me-1"></i>
          {state.error}
        </div>
      )}

      <div className="mt-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-white bg-white text-success fw-bold rounded-pill px-4 py-2 hover-opacity"
          style={{ color: "#008f1f !important" }}
        >
          {pending ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              {t("contact.sending")}
            </>
          ) : (
            t("contact.send")
          )}
        </button>
      </div>
    </form>
  );
}