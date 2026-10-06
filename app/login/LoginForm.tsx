"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useT } from "@/components/I18nProvider";
import { loginAction, type AuthState } from "@/app/login/actions";

const initialState: AuthState = { error: "" };

export default function LoginForm({ next }: { next: string }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="next" value={next} />

      <div className="mb-3">
        <label className="form-label small fw-medium text-secondary" htmlFor="email">
          {t("common.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-control rounded-3"
          placeholder="voce@farmacia.gw"
          autoComplete="email"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label small fw-medium text-secondary" htmlFor="password">
          {t("login.password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="form-control rounded-3"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

        <div className="text-end mb-3">
          <Link href="/forgot-password" className="small text-decoration-none">
            {t("login.forgotPassword")}
          </Link>
        </div>

        {state.error && (
        <div className="alert alert-danger rounded-3 small py-2 px-3">
          <i className="bi bi-exclamation-triangle me-1"></i>
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn w-100 text-white rounded-3 py-2 fw-medium"
        style={{ backgroundColor: "#0f8a0e" }}
      >
        {pending ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            {t("login.signingIn")}
          </>
        ) : (
          <>
            <i className="bi bi-box-arrow-in-right me-1"></i>
            {t("login")}
          </>
        )}
      </button>
    </form>
  );
}