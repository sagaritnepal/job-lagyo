// Deploys the current code to job-lagyo-app.vercel.app — the URL the
// Capacitor/Android app build points at (see capacitor.config.ts) —
// without touching job-lagyo.vercel.app (the browser website).
//
// A plain `vercel deploy` (no --prod) creates a new Preview deployment
// with its own throwaway URL; this script then re-points the stable
// job-lagyo-app.vercel.app alias at it. Requires `vercel login` once
// per machine (npx vercel handles that automatically if needed).
//
// Usage: node scripts/deploy-app.mjs

import { execSync } from "child_process";

const APP_ALIAS = "job-lagyo-app.vercel.app";

console.log(`Deploying to Preview, then aliasing to ${APP_ALIAS} ...\n`);

const output = execSync("npx vercel deploy", { encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] });
process.stdout.write(output);

const match = output.match(/https:\/\/[a-zA-Z0-9.-]+\.vercel\.app/g);
const deploymentUrl = match?.at(-1);
if (!deploymentUrl) {
  console.error("\nCould not find the deployment URL in `vercel deploy` output — aborting alias step.");
  process.exit(1);
}

console.log(`\nAliasing ${deploymentUrl} -> ${APP_ALIAS} ...`);
execSync(`npx vercel alias set ${deploymentUrl} ${APP_ALIAS}`, { stdio: "inherit" });

console.log(`\nDone. https://${APP_ALIAS} now serves this deployment.`);
