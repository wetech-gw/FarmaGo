import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDate, getI18n } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n-core";

export const dynamic = "force-dynamic";

const ROLE_KEYS = {
  admin: "admin.roleAdmin",
  inspecao: "admin.roleInspecao",
  owner: "admin.roleOwner",
} as const satisfies Record<string, TKey>;

const ROLE_STYLES = {
  admin: { bg: "#e0e7ff", color: "#3730a3" },
  inspecao: { bg: "#e0f2fe", color: "#0369a1" },
  owner: { bg: "#dcfce7", color: "#15803d" },
} as const;

export default async function AdminUsersPage() {
  const { locale, t } = await getI18n();
  await requireAdmin();

  const users = await prisma.user.findMany({
    include: { pharmacies: { select: { id: true, name: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 fs-2">{t("users")}</h1>
          <p className="text-muted small m-0">
            {t("admin.usersSubtitle", { count: users.length })}
          </p>
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
            <thead className="border-bottom">
              <tr className="text-secondary">
                <th className="fw-medium ps-4 py-3">#</th>
                <th className="fw-medium py-3">{t("common.name")}</th>
                <th className="fw-medium py-3">{t("common.email")}</th>
                <th className="fw-medium py-3 text-center">{t("admin.thProfile")}</th>
                <th className="fw-medium py-3 text-center">{t("admin.thPharmacies")}</th>
                <th className="fw-medium py-3">{t("admin.thRegisteredAt")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const style = ROLE_STYLES[u.role];
                return (
                  <tr key={u.id}>
                    <td className="ps-4 py-3 text-muted">{u.id}</td>
                    <td className="py-3 fw-semibold text-dark">{u.name}</td>
                    <td className="py-3 text-muted">{u.email}</td>
                    <td className="py-3 text-center">
                      <span className="badge rounded-pill" style={{ backgroundColor: style.bg, color: style.color }}>
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
                    <td className="py-3 text-muted">
                      {formatDate(locale, u.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}