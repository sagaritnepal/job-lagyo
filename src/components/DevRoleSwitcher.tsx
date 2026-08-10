import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
import { DEV_ACCOUNTS, isDevRoleSwitcherEnabled, type DevRole } from "@/lib/devAccounts";
import { devSwitchRoleAction } from "@/lib/actions/devAuth";

const ROLE_ORDER: DevRole[] = ["candidate", "employer", "admin"];

export async function DevRoleSwitcher() {
  if (!isDevRoleSwitcherEnabled) return null;

  const user = await getAuthUser();
  let currentRole: DevRole | null = null;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    currentRole = (data?.role as DevRole | undefined) ?? null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50/95 p-1 shadow-lg backdrop-blur">
      <span className="pl-2 pr-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
        Dev
      </span>
      {ROLE_ORDER.map((role) => {
        const account = DEV_ACCOUNTS[role];
        const isActive = currentRole === role;
        return (
          <form key={role} action={devSwitchRoleAction.bind(null, role)}>
            <button
              type="submit"
              disabled={isActive}
              title={account.email}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-amber-600 text-white"
                  : "bg-white text-amber-800 hover:bg-amber-100"
              }`}
            >
              {account.label}
            </button>
          </form>
        );
      })}
    </div>
  );
}
