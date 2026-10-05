import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function updateUser(formData: FormData) {
  "use server";
  const current = await requireAdmin();
  const id   = parseInt(formData.get("id") as string);
  const name  = (formData.get("name")  as string).trim();
  const email = (formData.get("email") as string).trim().toLowerCase();

  // Só o próprio administrador pode editar a sua conta.
  if (id !== current.id) throw new Error("Só pode editar a sua própria conta.");

  if (!name || !email) throw new Error("Nome e email são obrigatórios.");

  await prisma.user.update({ where: { id }, data: { name, email } });
  revalidatePath("/admin/account");
  redirect("/admin/account");
}

async function createUser(formData: FormData) {
  "use server";
  await requireAdmin();

  const name     = (formData.get("name")     as string).trim();
  const email    = (formData.get("email")    as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const role     = formData.get("role")     as "admin" | "owner";

  if (!name || !email) throw new Error("Nome e email são obrigatórios.");
  if (password.length < 6) throw new Error("A palavra-passe deve ter pelo menos 6 caracteres.");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Já existe uma conta com este email.");

  // Password guardada como hash scrypt (nunca em texto claro).
  const passwordHash = await hashPassword(password);

  await prisma.user.create({ data: { name, email, passwordHash, role } });
  revalidatePath("/admin/account");
  redirect("/admin/account");
}

async function deleteUser(formData: FormData) {
  "use server";
  const current = await requireAdmin();
  const id = parseInt(formData.get("id") as string);

  if (id === current.id) throw new Error("Não pode eliminar a sua própria conta.");

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/account");
  redirect("/admin/account");
}

export default async function AdminAccountPage() {
  const currentUser = await requireAdmin();

  const users = await prisma.user.findMany({
    include: { pharmacies: { select: { id: true, name: true, status: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <div className="mb-4">
        <h1 className="fw-bold m-0 fs-2">Compte</h1>
        <p className="text-muted small m-0">Gerir perfil e utilizadores</p>
      </div>

      <div className="row g-4">

        {/* Editar perfil atual */}
        <div className="col-12 col-xl-5">
          <div className="card border-0 rounded-4 shadow-sm bg-white p-4 h-100">
            <h6 className="fw-bold mb-4">
              <i className="bi bi-person-circle me-2 text-success"></i>
              Meu Perfil
            </h6>

            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white fs-4"
                style={{ width: 60, height: 60, backgroundColor: "#10b981", flexShrink: 0 }}>
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="fw-bold text-dark">{currentUser?.name}</div>
                <div className="text-muted small">{currentUser?.email}</div>
                <span className="badge rounded-pill mt-1"
                  style={{ backgroundColor: currentUser?.role === "admin" ? "#e0e7ff" : "#dcfce7", color: currentUser?.role === "admin" ? "#3730a3" : "#15803d" }}>
                  {currentUser?.role}
                </span>
              </div>
            </div>

            {currentUser && (
              <form action={updateUser} className="d-flex flex-column gap-3">
                <input type="hidden" name="id" value={currentUser.id} />

                <div>
                  <label className="form-label small fw-medium text-secondary">Nome</label>
                  <input
                    type="text" name="name" defaultValue={currentUser.name}
                    className="form-control rounded-3" required
                  />
                </div>

                <div>
                  <label className="form-label small fw-medium text-secondary">Email</label>
                  <input
                    type="email" name="email" defaultValue={currentUser.email}
                    className="form-control rounded-3" required
                  />
                </div>

                <button type="submit"
                  className="btn text-white rounded-3 py-2 fw-medium mt-2"
                  style={{ backgroundColor: "#10b981" }}>
                  <i className="bi bi-check-lg me-2"></i>Guardar Alterações
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Criar novo utilizador */}
        <div className="col-12 col-xl-7">
          <div className="card border-0 rounded-4 shadow-sm bg-white p-4">
            <h6 className="fw-bold mb-4">
              <i className="bi bi-person-plus me-2" style={{ color: "#4f46e5" }}></i>
              Criar Novo Utilizador
            </h6>

            <form action={createUser}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-secondary">Nome completo *</label>
                  <input
                    type="text" name="name"
                    className="form-control rounded-3" placeholder="Ex: João Silva" required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-secondary">Email *</label>
                  <input
                    type="email" name="email"
                    className="form-control rounded-3" placeholder="joao@FarmaGo.gw" required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-secondary">Palavra-passe *</label>
                  <input
                    type="password" name="password" minLength={8}
                    className="form-control rounded-3" placeholder="Mínimo 8 caracteres" required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-secondary">Perfil *</label>
                  <select name="role" className="form-select rounded-3" required>
                    <option value="owner">Proprietário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <button type="submit"
                  className="btn text-white rounded-3 px-4 py-2 fw-medium d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: "#4f46e5" }}>
                  <i className="bi bi-plus-lg"></i> Criar Utilizador
                </button>
              </div>
            </form>
          </div>

          {/* Lista de utilizadores */}
          <div className="card border-0 rounded-4 shadow-sm bg-white mt-4">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h6 className="fw-bold m-0">Todos os Utilizadores ({users.length})</h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
                <thead className="border-bottom">
                  <tr className="text-secondary">
                    <th className="fw-medium ps-4 py-3">Nome</th>
                    <th className="fw-medium py-3">Email</th>
                    <th className="fw-medium py-3 text-center">Perfil</th>
                    <th className="fw-medium py-3 text-center">Farmácias</th>
                    <th className="fw-medium py-3 text-center pe-4">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="ps-4 py-3 fw-semibold text-dark">{u.name}</td>
                      <td className="py-3 text-muted">{u.email}</td>
                      <td className="py-3 text-center">
                        <span className="badge rounded-pill"
                          style={{ backgroundColor: u.role === "admin" ? "#e0e7ff" : "#dcfce7", color: u.role === "admin" ? "#3730a3" : "#15803d" }}>
                          {u.role}
                        </span>
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
                      <td className="py-3 text-center pe-4">
                        <form action={deleteUser} className="d-inline">
                          <input type="hidden" name="id" value={u.id} />
                          <button type="submit"
                            className="btn btn-sm btn-outline-danger rounded-2"
                            disabled={u.pharmacies.length > 0 || u.id === currentUser.id}
                            title={
                              u.id === currentUser.id
                                ? "Não pode eliminar a sua conta"
                                : u.pharmacies.length > 0
                                  ? "Tem farmácias associadas"
                                  : "Eliminar"
                            }>
                            <i className="bi bi-trash"></i>
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
