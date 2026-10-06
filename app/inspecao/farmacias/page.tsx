import { prisma } from "@/lib/prisma";
import { requireInspector } from "@/lib/auth";
import { getT } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n-core";

export const dynamic = "force-dynamic";

const STATUS_BADGES = {
  approved: { className: "bg-success", labelKey: "insp.approvedBadge" },
  pending:  { className: "bg-warning text-dark", labelKey: "insp.pendingBadge" },
  rejected: { className: "bg-danger", labelKey: "insp.rejectedBadge" },
} as const satisfies Record<string, { className: string; labelKey: TKey }>;

export default async function InspecaoFarmaciasPage() {
  const t = await getT();
  await requireInspector();

  const pharmacies = await prisma.pharmacy.findMany({
    include: { owner: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <h1 className="h4 fw-bold mb-1">{t("insp.pharmaciesTitle")}</h1>
      <p className="text-secondary small mb-4">{t("insp.pharmaciesSubtitle")}</p>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="border-bottom">
              <tr className="text-secondary small">
                <th className="fw-medium ps-4 py-3">{t("common.pharmacy")}</th>
                <th className="fw-medium py-3">{t("common.owner")}</th>
                <th className="fw-medium py-3 text-center">{t("common.status")}</th>
                <th className="fw-medium py-3 text-center">{t("insp.thActive")}</th>
                <th className="fw-medium py-3 text-center">{t("guard")}</th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.map((p) => {
                const badge = STATUS_BADGES[p.status];
                return (
                  <tr key={p.id}>
                    <td className="ps-4 py-3 fw-semibold">{p.name}</td>
                    <td className="py-3">
                      <div className="fw-medium">{p.owner.name}</div>
                      <div className="text-muted small">{p.owner.email}</div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`badge ${badge.className}`}>{t(badge.labelKey)}</span>
                    </td>
                    <td className="py-3 text-center">
                      {p.isActive ? (
                        <span className="badge bg-success">{t("common.yes")}</span>
                      ) : (
                        <span className="badge bg-secondary">{t("common.no")}</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {p.isGuard ? (
                        <span className="badge bg-info text-white">{t("insp.onDutyBadge")}</span>
                      ) : (
                        <span className="badge bg-light text-secondary border">{t("insp.normalBadge")}</span>
                      )}
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