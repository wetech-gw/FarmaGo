import { prisma } from "@/lib/prisma";
import { requireInspector } from "@/lib/auth";
import { setGuardDuty } from "../actions";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function InspecaoPlantoesPage() {
  const t = await getT();
  await requireInspector();

  const pharmacies = await prisma.pharmacy.findMany({
    where: { status: "approved", isActive: true },
    include: { owner: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <h1 className="h4 fw-bold mb-1">{t("insp.guardsTitle")}</h1>
      <p className="text-secondary small mb-4">
        {t("insp.guardsSubtitle")}
      </p>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="border-bottom">
              <tr className="text-secondary small">
                <th className="fw-medium ps-4 py-3">{t("common.pharmacy")}</th>
                <th className="fw-medium py-3">{t("common.owner")}</th>
                <th className="fw-medium py-3 text-center">{t("common.status")}</th>
                <th className="fw-medium py-3 text-end pe-4">{t("guard")}</th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.map((p) => (
                <tr key={p.id}>
                  <td className="ps-4 py-3 fw-semibold">{p.name}</td>
                  <td className="py-3 small">{p.owner.name}</td>
                  <td className="py-3 text-center">
                    {p.isGuard ? (
                      <span className="badge rounded-pill text-bg-info">{t("insp.onDutyBadge")}</span>
                    ) : (
                      <span className="badge rounded-pill bg-light text-secondary border">{t("insp.normalBadge")}</span>
                    )}
                  </td>
                  <td className="py-3 text-end pe-4">
                    <form action={setGuardDuty}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="isGuard" value={p.isGuard ? "0" : "1"} />
                      <button
                        type="submit"
                        className={`btn btn-sm rounded-3 ${p.isGuard ? "btn-outline-secondary" : "btn-info text-white"}`}
                      >
                        {p.isGuard ? t("insp.removeFromDuty") : t("insp.escalateToDuty")}
                      </button>
                    </form>
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