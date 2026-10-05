import { prisma } from "@/lib/prisma";
import { AdminImageThumb } from "@/components/AdminImageThumb";
import AdminPharmacyMap from "@/components/admin/AdminPharmacyMap";
import { requireAdmin } from "@/lib/auth";
import { deletePharmacy } from "./actions";
import type { PharmacySpot } from "@/types/pharmacy";

export const dynamic = "force-dynamic";

export default async function AdminPharmaciesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requireAdmin();

  const { type } = await searchParams;
  const isGuardFilter = type === "guard" ? true : type === "normal" ? false : undefined;

  const pharmacies = await prisma.pharmacy.findMany({
    where: isGuardFilter !== undefined ? { isGuard: isGuardFilter } : {},
    include: {
      owner:  { select: { name: true, email: true } },
      _count: { select: { stocks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const spots: PharmacySpot[] = pharmacies.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    address: String(p.address),
    phone: p.phone,
    schedule: p.schedule,
    hours: p.hours,
    latitude: p.latitude,
    longitude: p.longitude,
    isOpen: p.isOpen,
    isGuard: p.isGuard,
    medications: [],
  }));

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 fs-2">Farmácias</h1>
          <p className="text-muted small m-0">{pharmacies.length} farmácias registadas</p>
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white mb-4">
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold m-0">
            <i className="bi bi-geo-alt me-2" style={{ color: "#dc2626" }}></i>
            Localização das Farmácias
          </h6>
        </div>
        <div className="card-body" style={{ height: "400px" }}>
          <AdminPharmacyMap spots={spots} />
        </div>
      </div>

      <div className="d-flex gap-2 mb-3">
        {[
          { label: "Todas",   href: "/admin/pharmacies"              },
          { label: "Normais", href: "/admin/pharmacies?type=normal"  },
          { label: "Plantão", href: "/admin/pharmacies?type=guard"   },
        ].map((f) => (
          <a key={f.href} href={f.href}
            className={`btn btn-sm rounded-pill px-3 ${
              (f.label === "Todas"   && !type) ||
              (f.label === "Normais" && type === "normal") ||
              (f.label === "Plantão" && type === "guard")
                ? "btn-dark" : "btn-outline-secondary"
            }`}>
            {f.label}
          </a>
        ))}
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
            <thead className="border-bottom">
              <tr className="text-secondary">
                <th className="fw-medium ps-4 py-3">Farmácia</th>
                <th className="fw-medium py-3">Proprietário</th>
                <th className="fw-medium py-3">Telefone</th>
                <th className="fw-medium py-3 text-center">Stock</th>
                <th className="fw-medium py-3 text-center">Plantão</th>
                <th className="fw-medium py-3 text-center">Estado</th>
                <th className="fw-medium py-3 text-center pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-5 text-muted">Nenhuma farmácia encontrada.</td></tr>
              ) : pharmacies.map((p) => (
                <tr key={p.id}>
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center gap-2">
                      <AdminImageThumb
                        src={p.image}
                        alt={p.name}
                        kind="pharmacy"
                        size={36}
                        radius="8px"
                      />
                      <div>
                        <div className="fw-semibold text-dark">{p.name}</div>
                        <div className="text-muted small"
                          style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {String(p.address)}
                        </div>
                        {p.latitude === null && (
                          <span className="badge rounded-pill mt-1"
                            style={{ backgroundColor: "#fff4e5", color: "#b54708", fontSize: "0.68rem" }}>
                            <i className="bi bi-geo-alt me-1"></i>Sem coordenadas
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="fw-medium">{p.owner.name}</div>
                    <div className="text-muted small">{p.owner.email}</div>
                  </td>
                  <td className="py-3 text-muted">{p.phone}</td>
                  <td className="py-3 text-center">
                    <span className="badge bg-light text-dark border">{p._count.stocks}</span>
                  </td>
                  <td className="py-3 text-center">
                    {p.isGuard
                      ? <span className="badge rounded-pill" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>Sim</span>
                      : <span className="badge rounded-pill bg-light text-secondary">Não</span>}
                  </td>
                  <td className="py-3 text-center">
                    {p.isOpen
                      ? <span className="badge rounded-pill" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>Aberta</span>
                      : <span className="badge rounded-pill" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>Fechada</span>}
                  </td>
                  <td className="py-3 text-center pe-4">
                    <div className="d-flex gap-1 justify-content-center">
                      <a href={`/admin/stock?pharmacy=${p.id}`}
                        className="btn btn-sm btn-outline-primary rounded-2" title="Ver Stock">
                        <i className="bi bi-box-seam"></i>
                      </a>
                      <form action={deletePharmacy} className="d-inline">
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit"
                          className="btn btn-sm btn-outline-danger rounded-2"
                          title={p._count.stocks > 0 ? "Tem stock associado" : "Eliminar"}
                          disabled={p._count.stocks > 0}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
