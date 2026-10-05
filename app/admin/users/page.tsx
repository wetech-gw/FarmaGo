import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    include: { pharmacies: { select: { id: true, name: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 fs-2">Utilizadores</h1>
          <p className="text-muted small m-0">{users.length} utilizadores registados</p>
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
            <thead className="border-bottom">
              <tr className="text-secondary">
                <th className="fw-medium ps-4 py-3">#</th>
                <th className="fw-medium py-3">Nome</th>
                <th className="fw-medium py-3">Email</th>
                <th className="fw-medium py-3 text-center">Perfil</th>
                <th className="fw-medium py-3 text-center">Farmácias</th>
                <th className="fw-medium py-3">Registado em</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="ps-4 py-3 text-muted">{u.id}</td>
                  <td className="py-3 fw-semibold text-dark">{u.name}</td>
                  <td className="py-3 text-muted">{u.email}</td>
                  <td className="py-3 text-center">
                    {u.role === "admin"
                      ? <span className="badge rounded-pill" style={{ backgroundColor: "#e0e7ff", color: "#3730a3" }}>Admin</span>
                      : <span className="badge rounded-pill" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>Proprietário</span>
                    }
                  </td>
                  <td className="py-3 text-center">
                    {u.pharmacies.length === 0 ? (
                      <span className="badge bg-light text-dark border">0</span>
                    ) : (
                      u.pharmacies.map((pharmacy) => (
                        <span
                          key={pharmacy.id}
                          className={`badge d-block mb-1 ${
                            pharmacy.status === "approved"
                              ? "bg-success"
                              : pharmacy.status === "rejected"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                          }`}
                        >
                          {pharmacy.name}
                        </span>
                      ))
                    )}
                  </td>
                  <td className="py-3 text-muted">
                    {u.createdAt.toLocaleDateString("pt-PT")}
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
