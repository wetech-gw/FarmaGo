"use client";

import { useActionState } from "react";
import {
  checkEmailAction,
  resetPasswordAction,
  type ForgotState,
} from "./actions";

const initialState: ForgotState = { status: "idle" };

export default function ForgotPasswordForm() {
  const [checkState, checkAction, checking] = useActionState(
    checkEmailAction,
    initialState,
  );
  const [resetState, resetAction, resetting] = useActionState(
    resetPasswordAction,
    initialState,
  );

  const email = resetState.email ?? checkState.email ?? "";
  const found = checkState.status === "found" || resetState.status === "found";
  const error = resetState.error ?? checkState.error;

  return (
    <>
      {error && (
        <div className="alert alert-danger rounded-3 small py-2 px-3">
          <i className="bi bi-exclamation-triangle me-1"></i>
          {error}
        </div>
      )}

      {!found ? (
        <form action={checkAction}>
          <div className="mb-3">
            <label className="form-label small fw-medium text-secondary" htmlFor="email">
              Email da conta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control rounded-3"
              placeholder="voce@farmacia.gw"
              required
            />
          </div>
          <button
            type="submit"
            disabled={checking}
            className="btn w-100 text-white rounded-3 py-2 fw-medium"
            style={{ backgroundColor: "#0f8a0e" }}
          >
            {checking ? "A verificar..." : "Verificar email"}
          </button>
        </form>
      ) : (
        <form action={resetAction}>
          <input type="hidden" name="email" value={email} />
          <p className="small text-success fw-semibold">
            <i className="bi bi-check-circle me-1"></i>
            Email válido. Defina a nova palavra-passe.
          </p>
          <div className="mb-3">
            <label className="form-label small fw-medium text-secondary" htmlFor="password">
              Nova palavra-passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control rounded-3"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium text-secondary" htmlFor="confirm">
              Confirmar palavra-passe
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              className="form-control rounded-3"
              required
            />
          </div>
          <button
            type="submit"
            disabled={resetting}
            className="btn w-100 text-white rounded-3 py-2 fw-medium"
            style={{ backgroundColor: "#0f8a0e" }}
          >
            {resetting ? "A guardar..." : "Recuperar palavra-passe"}
          </button>
        </form>
      )}
    </>
  );
}
