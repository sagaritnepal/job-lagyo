"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEV_ACCOUNTS, isDevRoleSwitcherEnabled, type DevRole } from "@/lib/devAccounts";

const ROLE_HOME: Record<DevRole, string> = {
  candidate: "/",
  employer: "/dashboard",
  admin: "/admin",
};

export async function devSwitchRoleAction(role: DevRole) {
  if (!isDevRoleSwitcherEnabled) {
    throw new Error("Dev role switcher is disabled in production.");
  }

  const account = DEV_ACCOUNTS[role];
  const supabase = await createClient();
  await supabase.auth.signOut();

  const { error } = await supabase.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  if (error) {
    throw new Error(`Dev login as ${role} failed: ${error.message}`);
  }

  redirect(ROLE_HOME[role]);
}
