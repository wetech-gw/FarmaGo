"use client";

export default function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="btn btn-link text-decoration-none text-success fw-semibold p-0 d-inline-flex align-items-center gap-1"
      aria-label="Voltar"
    >
      <i className="bi bi-chevron-left" aria-hidden="true"></i>
      Voltar
    </button>
  );
}
