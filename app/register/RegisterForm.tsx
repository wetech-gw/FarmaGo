"use client";

import { useActionState } from "react";
import LocationPicker from "@/components/LocationPicker";
import { registerAction, type RegisterState } from "@/app/register/actions";

const initialState: RegisterState = { error: "" };

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} encType="multipart/form-data" className="row g-3">
      <div className="col-12">
        <h5 className="fw-bold small text-uppercase text-secondary mb-0">
          <i className="bi bi-person-badge me-2"></i>
          1. Dados da conta
        </h5>
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-medium text-secondary" htmlFor="name">
          Nome do farmacêutico *
        </label>
        <input id="name" name="name" type="text" className="form-control rounded-3" required />
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-medium text-secondary" htmlFor="remail">
          Email *
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
          Palavra-passe *
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
        <div className="form-text">Mínimo 6 caracteres.</div>
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-medium text-secondary" htmlFor="reconfirm">
          Confirmar palavra-passe *
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
          2. Dados da farmácia
        </h5>
        <p className="form-text">
          A farmácia fica <strong>em validação</strong>. A nossa equipa confirma os dados
          depois de uma visita presencial e só depois passa a aparecer no site.
        </p>
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-medium text-secondary" htmlFor="pharmacyName">
          Nome da farmácia *
        </label>
        <input
          id="pharmacyName"
          name="pharmacyName"
          type="text"
          className="form-control rounded-3"
          placeholder="Ex: Farmácia Esperança"
          required
        />
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-medium text-secondary" htmlFor="rephone">
          Telefone *
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
          Morada *
        </label>
        <input
          id="readdress"
          name="address"
          type="text"
          className="form-control rounded-3"
          placeholder="Rua, bairro, cidade"
          required
        />
      </div>

      <div className="col-md-5">
        <label className="form-label small fw-medium text-secondary" htmlFor="reschedule">
          Dias de funcionamento
        </label>
        <input
          id="reschedule"
          name="schedule"
          type="text"
          className="form-control rounded-3"
          placeholder="Segunda - Sábado"
          defaultValue="Segunda - Sexta"
        />
      </div>

      <div className="col-md-4">
        <label className="form-label small fw-medium text-secondary" htmlFor="rehours">
          Horário
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
          Farmácia de plantão
        </label>
        <select id="reguard" name="isGuard" className="form-select rounded-3" defaultValue="0">
          <option value="0">Não</option>
          <option value="1">Sim</option>
        </select>
      </div>

      <div className="col-md-4">
        <label className="form-label small fw-medium text-secondary" htmlFor="reimage">
          Imagem da farmácia
        </label>
        <input id="reimage" name="imageFile" type="file" accept="image/*" className="form-control rounded-3" />
        <div className="form-text">JPG, PNG, WEBP ou AVIF. Máximo 3 MB.</div>
      </div>

      <div className="col-md-8">
        <label className="form-label small fw-medium text-secondary">
          Localização no mapa
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
              A criar conta…
            </>
          ) : (
            <>
              <i className="bi bi-check2-circle me-1"></i>
              Criar conta e registar farmácia
            </>
          )}
        </button>
      </div>
    </form>
  );
}