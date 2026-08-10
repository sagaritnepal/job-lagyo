import { getAuthUser } from "@/lib/supabase/auth";
import { getEmployerApplications } from "@/lib/data/dashboard";
import { CompanyBadge } from "@/components/CompanyBadge";
import { statusMeta } from "@/lib/constants";

export const metadata = {
  title: "Candidates — Job Lagyo",
};

export default async function CandidatesPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const applications = await getEmployerApplications(user.id);

  const candidates = new Map<
    string,
    { name: string; applications: typeof applications }
  >();
  for (const app of applications) {
    const key = app.applicant_id;
    const name = app.applicant?.full_name ?? "Candidate";
    if (!candidates.has(key)) candidates.set(key, { name, applications: [] });
    candidates.get(key)!.applications.push(app);
  }

  const rows = Array.from(candidates.values());

  // Soft-prioritize candidates who applied to the employer's most-common
  // job categories — a default ordering, not a filter (everyone still
  // shows up).
  const categoryCounts = new Map<string, number>();
  for (const app of applications) {
    const category = app.job?.category;
    if (category) categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }
  const topCategories = new Set(
    Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category),
  );
  rows.sort((a, b) => {
    const aTop = a.applications.some((app) => app.job?.category && topCategories.has(app.job.category));
    const bTop = b.applications.some((app) => app.job?.category && topCategories.has(app.job.category));
    return aTop === bTop ? 0 : aTop ? -1 : 1;
  });

  return (
    <div>
      <h1 className="text-lg font-bold text-neutral-900 sm:text-xl">Candidates</h1>
      <p className="mt-0.5 text-xs text-neutral-500">
        Everyone who has applied to your job posts.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
          No candidates yet.
        </p>
      ) : (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {rows.map((candidate) => (
            <div
              key={candidate.name + candidate.applications[0].id}
              className="rounded-lg border border-neutral-200 bg-white p-3.5"
            >
              <div className="flex items-center gap-3">
                <CompanyBadge name={candidate.name} />
                <div>
                  <p className="font-semibold text-neutral-900">{candidate.name}</p>
                  <p className="text-xs text-neutral-500">
                    Applied to {candidate.applications.length} role
                    {candidate.applications.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {candidate.applications.map((app) => {
                  const meta = statusMeta(app.status);
                  return (
                    <div key={app.id} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">{app.job?.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
