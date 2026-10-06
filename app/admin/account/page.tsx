import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { getT } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n-core";

export const dynamic = "force-dynamic";

const ROLE_KEYS = {
  admin: "admin.roleAdmin",
  owner: "admin.roleOwner",
  inspecao: "admin.roleInspecao",
} as const satisfies Record<string, TKey>;

async function updateUser(formData: FormData) {
  "use server";
  const t = await getT();
  const current = await requireAdmin();
  const id   = parseInt(formData.get("id") as string);
  const name  = (formData.get("name")  as string).trim();
  const email = (formData.get("email") as string).trim().toLowerCase();

  // Só o próprio administrador pode editar a sua conta.
  if (id !== current.id) throw new Error(t("error.ownAccountOnly"));

  if (!name || !email) throw new Error(t("error.nameAndEmailRequired"));

  await prisma.user.update({ where: { id }, data: { name, email } });
  revalidatePath("/admin/account");
  redirect("/admin/account");
}

async function createUser(formData: FormData) {
  "use server";
  const t = await getT();
  await requireAdmin();

  const name     = (formData.get("name")     as string).trim();
  const email    = (formData.get("email")    as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const role     = formData.get("role")     as "admin" | "owner" | "inspecao";

  if (!name || !email) throw new Error(t("error.nameAndEmailRequired"));
  if (password.length < 6) throw new Error(t("error.passwordTooShort"));

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error(t("error.emailInUse"));

  // Password guardada como hash scrypt (nunca em texto claro).
  const passwordHash = await hashPassword(password);

  await prisma.user.create({ data: { name, email, passwordHash, role } });
  revalidatePath("/admin/account");
  redirect("/admin/account");
}

async function deleteUser(formData: FormData) {
  "use server";
  const t = await getT();
  const current = await requireAdmin();
  const id = parseInt(formData.get("id") as string);

  if (id === current.id) throw new Error(t("error.cannotDeleteOwnAccount"));

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/account");
  redirect("/admin/account");
}

export default async function AdminAccountPage() {
  const t = await getT();
  const currentUser = await requireAdmin();

  const users = await prisma.user.findMany({
    include: { pharmacies: { select: { id: true, name: true, status: true } } },
    orderBy: { createdAt: "asc" },
  });

  const currentStyle =
    currentUser?.role === "admin"
      ? { bg: "#e0e7ff", color: "#3730a3" }
      : { bg: "#dcfce7", color: "#15803d" };

  return (
    <>
      <div className="mb-4">
        <h1 className="fw-bold m-0 fs-2">{t("admin.accountTitle")}</h1>
        <p className="text-muted small m-0">{t("admin.accountSubtitle")}</p>
      </div>

      <div className="row g-4">

        {/* Editar perfil atual */}
        <div className="col-12 col-xl-5">
          <div className="card border-0 rounded-4 shadow-sm bg-white p-4 h-100">
            <h6 className="fw-bold mb-4">
              <i className="bi bi-person-circle me-2 text-success"></i>
              {t("admin.myProfile")}
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
                  style={{ backgroundColor: currentStyle.bg, color: currentStyle.color }}>
                  {currentUser ? t(ROLE_KEYS[currentUser.role]) : ""}
                </span>
              </div>
            </div>

            {currentUser && (
              <form action={updateUser} className="d-flex flex-column gap-3">
                <input type="hidden" name="id" value={currentUser.id} />

                <div>
                  <label className="form-label small fw-medium text-secondary">{t("common.name")}</label>
                  <input
                    type="text" name="name" defaultValue={currentUser.name}
                    className="form-control rounded-3" required
                  />
                </div>

                <div>
                  <label className="form-label small fw-medium text-secondary">{t("common.email")}</label>
                  <input
                    type="email" name="email" defaultValue={currentUser.email}
                    className="form-control rounded-3" required
                  />
                </div>

                <button type="submit"
                  className="btn text-white rounded-3 py-2 fw-medium mt-2"
                  style={{ backgroundColor: "#10b981" }}>
                  <i className="bi bi-check-lg me-2"></i>
                  {t("dash.saveChanges")}
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
              {t("admin.createUserTitle")}
            </h6>

            <form action={createUser}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-secondary">{t("admin.fullName")}</label>
                  <input
                    type="text" name="name"
                    className="form-control rounded-3" placeholder="João Silva" required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-secondary">{t("common.email")} *</label>
                  <input
                    type="email" name="email"
                    className="form-control rounded-3" placeholder="joao@FarmaGo.gw" required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-secondary">{t("admin.password")}</label>
                  <input
                    type="password" name="password" minLength={8}
                    className="form-control rounded-3" placeholder={t("admin.passwordHint")} required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-secondary">{t("admin.roleLabel")}</label>
                  <select name="role" className="form-select rounded-3" defaultValue="owner" required>
                    <option value="owner">{t("admin.roleOwner")}</option>
                    <option value="admin">{t("admin.roleAdmin")}</option>
                    <option value="inspecao">{t("admin.roleInspecao")}</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <button type="submit"
                  className="btn text-white rounded-3 px-4 py-2 fw-medium d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: "#4f46e5" }}>
                  <i className="bi bi-plus-lg"></i>
                  {t("admin.createUser")}
                </button>
              </div>
            </form>
          </div>

          {/* Lista de utilizadores */}
          <div className="card border-0 rounded-4 shadow-sm bg-white mt-4">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h6 className="fw-bold m-0">{t("admin.allUsers", { count: users.length })}</h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
                <thead className="border-bottom">
                  <tr className="text-secondary">
                    <th className="fw-medium ps-4 py-3">{t("common.name")}</th>
                    <th className="fw-medium py-3">{t("common.email")}</th>
                    <th className="fw-medium py-3 text-center">{t("admin.thProfile")}</th>
                    <th className="fw-medium py-3 text-center">{t("admin.thPharmacies")}</th>
                    <th className="fw-medium py-3 text-center pe-4">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const style =
                      u.role === "admin"
                        ? { bg: "#e0e7ff", color: "#3730a3" }
                        : { bg: "#dcfce7", color: "#15803d" };
                    return (
                      <tr key={u.id}>
                        <td className="ps-4 py-3 fw-semibold text-dark">{u.name}</td>
                        <td className="py-3 text-muted">{u.email}</td>
                        <td className="py-3 text-center">
                          <span className="badge rounded-pill"
                            style={{ backgroundColor: style.bg, color: style.color }}>
                            {t(ROLE_KEYS[u.role])}
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
                              aria-label={t("common.remove")}
                              title={
                                u.id === currentUser.id
                                  ? t("admin.cannotDeleteOwn")
                                  : u.pharmacies.length > 0
                                    ? t("admin.hasPharmacies")
                                    : t("common.remove")
                              }>
                              <i className="bi bi-trash"></i>
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}