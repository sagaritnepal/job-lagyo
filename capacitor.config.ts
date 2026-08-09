import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.joblagyo.app",
  appName: "Job Lagyo",
  webDir: "www",
  server: {
    // Job Lagyo is a dynamic Next.js app (Server Actions, cookie-based
    // Supabase auth) — it can't be statically exported into the native
    // bundle. The shell loads the live deployment instead, same pattern
    // as a Trusted Web Activity.
    url: "https://job-lagyo.vercel.app",
    cleartext: false,
  },
};

export default config;
