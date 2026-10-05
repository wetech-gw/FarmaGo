import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminImageThumb } from "@/components/AdminImageThumb";
import { googleMapsUrl } from "@/lib/geo";
import { approvePharmacy, rejectPharmacy, sendBackToValidation } from "./actions";

export const dynamic = "force-dynamic";

const TABS = {
  pending:  { label: "Por validar",  icon: "bi-hourglass-split", color: "#ea580c" },
  approved: { label: "Validadas",   icon: "bi-check2-circle",  color: "#0f8a0e" },
  rejected: { label: "Rejeitadas",  icon: "bi-x-octagon",       color: "#dc2626" },
} as const;

type TabKey = keyof typeof TABS;

export default async function AdminValidationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; focus?: string }>;
}) {
  await requireAdmin();

  const { tab, focus } = await searchParams;
  const activeTab = (tab && tab in TABS ? tab : "pending") as TabKey;

  const [pharmacies, counts] = await Promise.all([
    prisma.pharmacy.findMany({
      where: { status: activeTab },
      include: {
        owner: { select: { id: true, name: true, email: true, createdAt: true } },
        validatedBy: { select: { name: true } },
        _count: { select: { stocks: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.pharmacy.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countBy = counts.reduce<Record<string, number>>(
    (acc, row) => ({ ...acc, [row.status]: row._count._all }),
    {},
  );

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Validação de farmácias</h1>
          <p className="text-secondary small mb-0">
            Só depois de uma visita presencial e da aprovação aqui feita é que a
            farmácia aparece no site público.
          </p>
        </div>
      </div>

      <ul className="nav nav-pills gap-2 mb-4">
        {(Object.keys(TABS) as TabKey[]).map((key) => {
          const meta = TABS[key];
          const isActive = key === activeTab;

          return (
            <li className="nav-item" key={key}>
              <Link
                href={`/admin/validations?tab=${key}`}
                className={`nav-link rounded-3 d-flex align-items-center gap-2 ${
                  isActive ? "active" : "text-secondary"
                }`}
              >
                <i className={`bi ${meta.icon}`}></i>
                {meta.label}
                <span className="badge text-bg-light ms-1">{countBy[key] ?? 0}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {pharmacies.length === 0 ? (
        <div className="card border-0 rounded-4 shadow-sm bg-white">
          <div className="card-body text-center py-5">
            <i className="bi bi-inbox fs-1 text-secondary"></i>
            <p className="text-secondary mt-3 mb-0">
              Nada aqui: {TABS[activeTab].label.toLowerCase()}.
            </p>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {pharmacies.map((pharmacy) => {
            const hasCoords = pharmacy.latitude !== null && pharmacy.longitude !== null;

            return (
              <div
                key={pharmacy.id}
                className={`card border-0 rounded-4 shadow-sm bg-white ${
                  focus === String(pharmacy.id) ? "border-start border-4 border-warning" : ""
                }`}
              >
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12 col-lg-7">
                      <div className="d-flex align-items-start gap-3 mb-3">
                        <AdminImageThumb
                          src={pharmacy.image}
                          alt={pharmacy.name}
                          kind="pharmacy"
                          size={56}
                          radius="0.85rem"
                          background="var(--px-green-soft)"
                        />
                        <div>
                          <div className="fw-bold">{pharmacy.name}</div>
                          <div className="small text-secondary">
                            {pharmacy.owner.name} · {pharmacy.owner.email}
                          </div>
                          <div className="small text-secondary">
                            Registada em{" "}
                            {pharmacy.createdAt.toLocaleDateString("pt-PT")}
                          </div>
                        </div>
                      </div>

                      <dl className="row mb-0 small">
                        <dt className="col-4 text-secondary fw-medium">Morada</dt>
                        <dd className="col-8">{pharmacy.address}</dd>

                        <dt className="col-4 text-secondary fw-medium">Telefone</dt>
                        <dd className="col-8">{pharmacy.phone}</dd>

                        <dt className="col-4 text-secondary fw-medium">Horário</dt>
                        <dd className="col-8">
                          {pharmacy.schedule} · {pharmacy.hours}
                        </dd>

                        <dt className="col-4 text-secondary fw-medium">Plantão</dt>
                        <dd className="col-8">{pharmacy.isGuard ? "Sim" : "Não"}</dd>

                        <dt className="col-4 text-secondary fw-medium">Medicamentos</dt>
                        <dd className="col-8">{pharmacy._count.stocks}</dd>

                        <dt className="col-4 text-secondary fw-medium">Coordenadas</dt>
                        <dd className="col-8">
                          {hasCoords ? (
                            <a
                              href={googleMapsUrl(pharmacy.latitude!, pharmacy.longitude!, pharmacy.address)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                            >
                              {pharmacy.latitude!.toFixed(4)}, {pharmacy.longitude!.toFixed(4)}
                              <i className="bi bi-box-arrow-up-right ms-1"></i>
                            </a>
                          ) : (
                            <span className="badge text-bg-warning">Por definir</span>
                          )}
                        </dd>
                      </dl>

                      {pharmacy.status === "rejected" && pharmacy.rejectionReason && (
                        <div className="alert alert-danger rounded-3 small py-2 px-3 mt-3 mb-0">
                          <strong>Motivo:</strong> {pharmacy.rejectionReason}
                        </div>
                      )}

                      {pharmacy.validatedAt && (
                        <div className="small text-secondary mt-2">
                          Validada em {pharmacy.validatedAt.toLocaleDateString("pt-PT")}
                          {pharmacy.validatedBy ? ` por ${pharmacy.validatedBy.name}` : ""}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-lg-5 d-flex flex-column justify-content-center">
                      {pharmacy.status === "pending" && (
                        <>
                          <div className="alert alert-warning rounded-3 small py-2 px-3">
                            <i className="bi bi-geo-alt me-1"></i>
                            <strong>Visita:</strong> confirme no local o nome, a morada, o
                            telefone e as coordenadas. Se algo estiver errado, peça ao
                            farmacêutico para corrigir no dashboard.
                          </div>

                          <div className="d-flex gap-2">
                            <form action={approvePharmacy} className="flex-fill">
                              <input type="hidden" name="id" value={pharmacy.id} />
                              <button
                                type="submit"
                                className="btn btn-success rounded-3 w-100 py-2 fw-semibold"
                              >
                                <i className="bi bi-check2-circle me-1"></i>
                                Validar farmácia
                              </button>
                            </form>

                            <Link
                              href={`/admin/pharmacies?edit=${pharmacy.id}`}
                              className="btn btn-outline-secondary rounded-3 py-2"
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                          </div>

                          <form action={rejectPharmacy} className="mt-2 d-flex gap-2">
                            <input type="hidden" name="id" value={pharmacy.id} />
                            <input
                              type="text"
                              name="reason"
                              className="form-control form-control-sm rounded-3"
                              placeholder="Motivo da rejeição"
                              required
                            />
                            <button
                              type="submit"
                              className="btn btn-outline-danger rounded-3 px-3"
                            >
                              Rejeitar
                            </button>
                          </form>
                        </>
                      )}

                      {pharmacy.status === "approved" && (
                        <form action={sendBackToValidation}>
                          <input type="hidden" name="id" value={pharmacy.id} />
                          <button type="submit" className="btn btn-outline-warning rounded-3 w-100">
                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                            Voltar a &ldquo;por validar&rdquo;
                          </button>
                        </form>
                      )}

                      {pharmacy.status === "rejected" && (
                        <form action={sendBackToValidation}>
                          <input type="hidden" name="id" value={pharmacy.id} />
                          <button type="submit" className="btn btn-outline-primary rounded-3 w-100">
                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                            Voltar a &ldquo;por validar&rdquo;
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}