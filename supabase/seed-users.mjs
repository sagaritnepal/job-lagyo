// Creates three demo login profiles — admin, job seeker, job provider — in
// your Supabase project's auth system and profiles table. Safe to re-run
// (looks up existing users by email and reuses them).
//
// Requires migration 0004_admin_moderation.sql to already be applied (it
// adds the 'admin' role to profiles).
//
// Usage:
//   node --env-file=.env.local supabase/seed-users.mjs
//
// Needs SUPABASE_SERVICE_ROLE_KEY in .env.local (Project Settings > API >
// service_role key). This key bypasses Row Level Security — keep it out of
// git and never prefix it with NEXT_PUBLIC_ (that would ship it to the
// browser).

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Project Settings > API > service_role key), then run:\n" +
      "  node --env-file=.env.local supabase/seed-users.mjs",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function uniqueSlug(text) {
  return `${slugify(text)}-${crypto.randomUUID().slice(0, 6)}`;
}

const PROFILES = [
  {
    key: "Admin",
    email: "admin@joblagyo.dev",
    password: "Admin@Lagyo2026",
    full_name: "Job Lagyo Admin",
    role: "admin",
  },
  {
    key: "Job seeker",
    email: "seeker@joblagyo.dev",
    password: "Seeker@Lagyo2026",
    full_name: "Sita Sharma",
    role: "candidate",
  },
  {
    key: "Job provider",
    email: "employer@joblagyo.dev",
    password: "Employer@Lagyo2026",
    full_name: "Ramesh Adhikari",
    role: "employer",
    company: { name: "Himalayan Tech Pvt. Ltd.", location: "Kathmandu" },
  },
];

async function findUserByEmail(email) {
  // The admin API has no direct lookup-by-email, so page through users.
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email === email);
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function ensureUser(profile) {
  let user = await findUserByEmail(profile.email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: profile.email,
      password: profile.password,
      email_confirm: true,
      user_metadata: { full_name: profile.full_name, role: profile.role },
    });
    if (error) throw error;
    user = data.user;
    console.log(`Created ${profile.key}: ${profile.email}`);
  } else {
    console.log(`Already exists, reusing: ${profile.email}`);
  }

  // The profile-creation trigger only fires on first signup, so make sure
  // the role/name are correct even if this user pre-existed.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: profile.role, full_name: profile.full_name })
    .eq("id", user.id);
  if (profileError) throw profileError;

  if (profile.company) {
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!existingCompany) {
      const { error: companyError } = await supabase.from("companies").insert({
        owner_id: user.id,
        name: profile.company.name,
        slug: uniqueSlug(profile.company.name),
        location: profile.company.location,
      });
      if (companyError) throw companyError;
      console.log(`  + created company "${profile.company.name}"`);
    }
  }

  return user;
}

const results = [];
for (const profile of PROFILES) {
  const user = await ensureUser(profile);
  results.push({ ...profile, id: user.id });
}

console.log("\nDone. Login credentials:\n");
console.table(results.map((r) => ({ role: r.key, email: r.email, password: r.password })));
console.log(
  "These are demo credentials for local/staging use only — rotate or delete these accounts before production.",
);
