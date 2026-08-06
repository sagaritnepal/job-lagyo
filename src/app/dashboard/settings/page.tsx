import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata = {
  title: "Settings — Job Lagyo",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: company }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, role").eq("id", user.id).maybeSingle(),
    supabase.from("companies").select("name, location, website").eq("owner_id", user.id).maybeSingle(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>

      <div className="mt-6 max-w-lg space-y-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold text-neutral-900">Account</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Name</dt>
              <dd className="text-neutral-900">{profile?.full_name ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Email</dt>
              <dd className="text-neutral-900">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Phone</dt>
              <dd className="text-neutral-900">{profile?.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Account type</dt>
              <dd className="capitalize text-neutral-900">{profile?.role ?? "—"}</dd>
            </div>
          </dl>
        </div>

        {company && (
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-semibold text-neutral-900">Company</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Name</dt>
                <dd className="text-neutral-900">{company.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Location</dt>
                <dd className="text-neutral-900">{company.location}</dd>
              </div>
              {company.website && (
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Website</dt>
                  <dd className="text-neutral-900">{company.website}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold text-neutral-900">Session</h2>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
