import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.joblagyo.app",
  appName: "Job Lagyo",
  webDir: "www",
  server: {
    // Job Lagyo is a dynamic Next.js app (Server Actions, cookie-based
    // Supabase auth) — it can't be statically exported into the native
    // bundle. The shell loads a live deployment instead, same pattern
    // as a Trusted Web Activity.
    //
    // This points at job-lagyo-app.vercel.app, a URL dedicated to the
    // app build and deployed independently of job-lagyo.vercel.app (the
    // browser website) — run `npm run deploy:app` to update this one,
    // `npm run deploy:website` for the other.
    url: "https://job-lagyo-app.vercel.app",
    cleartext: false,
  },
};

export default config;
