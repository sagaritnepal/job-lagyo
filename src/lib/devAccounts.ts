// Demo credentials for the three roles seeded by supabase/seed-users.mjs.
// Keep this list in sync with that script if you ever change the demo
// accounts. Server-only: never import this from a "use client" file.

export type DevRole = "candidate" | "employer" | "admin";

export const DEV_ACCOUNTS: Record<
  DevRole,
  { label: string; email: string; password: string }
> = {
  candidate: { label: "Seeker", email: "seeker@joblagyo.dev", password: "Seeker@Lagyo2026" },
  employer: { label: "Provider", email: "employer@joblagyo.dev", password: "Employer@Lagyo2026" },
  admin: { label: "Admin", email: "admin@joblagyo.dev", password: "Admin@Lagyo2026" },
};

// Guards both the panel's visibility and the server action itself.
//
// TEMPORARY, PRE-LAUNCH TESTING PHASE ONLY: forced to `true` so the switcher
// is reachable from the phone app, which only ever loads the production
// deployment. Revert to the commented-out line below once testing is done
// and before real users are on the site.
export const isDevRoleSwitcherEnabled = true;
// export const isDevRoleSwitcherEnabled = process.env.NODE_ENV !== "production";
