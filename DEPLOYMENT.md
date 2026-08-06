# Deploying Job Lagyo on Hostinger

Job Lagyo is a Next.js app with Server Actions and cookie-based auth, so it
needs a running Node.js process — it cannot be hosted as static files. This
guide covers Hostinger's **Node.js App** feature (available on Cloud/Business
hosting plans in hPanel).

Menu names shift between Hostinger plans/regions — if a label below doesn't
match what you see, look for the nearest equivalent (e.g. "Node.js" may be
under **Advanced** or **Website → Node.js**).

## 1. Get the code onto the server

In hPanel, open your website's dashboard and look for **Git** under
**Advanced**. Point it at:

- Repository: `https://github.com/sagaritnepal/job-lagyo`
- Branch: `master`

If your plan doesn't have Git deployment, use the **File Manager** or an
SFTP client to upload the project instead (exclude `node_modules` and
`.next` — you'll generate those on the server).

## 2. Create the Node.js application

In hPanel, go to **Advanced → Node.js** (sometimes listed as **Website →
Node.js App**) and create a new application:

| Setting | Value |
| --- | --- |
| Node.js version | **20.x or newer** (this app requires Node ≥ 20.9) |
| Application root | the folder you deployed the code into |
| Application URL | your domain (e.g. `jobslagyo.com`) |
| Application startup file | `server.js` |

`server.js` is a small custom entry point included in this repo (see
`server.js` at the project root) — it wraps Next.js's production server and
listens on whatever `PORT` Hostinger assigns, since Hostinger's Node runner
expects a plain script rather than a spawned `npm start`.

## 3. Set environment variables

In the same Node.js app screen, add environment variables (from your
Supabase project's **Settings → API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

## 4. Install dependencies and build

Use the **Run NPM Install** button in the Node.js app panel. Then build the
app — either via the panel's **Run Script** option (if available) or via
the SSH terminal included with your plan:

```bash
cd ~/domains/your-domain.com/job-lagyo   # your application root
npm install
npm run build
```

`npm run build` must be re-run after every code update, since the compiled
output lives in `.next/`, which isn't committed to Git.

## 5. Start / restart the app

Back in the Node.js app panel, click **Restart**. Hostinger keeps the
process alive and proxies your domain to it over HTTPS (Hostinger issues a
free SSL certificate automatically once the domain is pointed at your
hosting).

## 6. Set up the database

If you haven't already: create a Supabase project, run
[`supabase/schema.sql`](supabase/schema.sql) in its SQL editor, and add its
URL/anon key as the environment variables above.

## Redeploying after changes

1. Pull the latest code (via hPanel's Git deploy button, or `git pull` over
   SSH).
2. `npm install` (only needed if dependencies changed).
3. `npm run build`.
4. Restart the app in the Node.js panel.

## If your plan doesn't support Node.js

Basic shared hosting plans are PHP/static-only and can't run this app as
built. Options: upgrade to a Cloud/Business plan with Node.js support, or
move to a host built for Node (Vercel, Railway, Render) — Vercel in
particular needs no `server.js`/custom setup at all, since it runs
`next build` natively.
