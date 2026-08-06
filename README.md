# Job Lagyo

Nepal's job portal — connecting job seekers in Kathmandu and across Nepal with employers who are hiring. Built with Next.js (App Router), Tailwind CSS, and Supabase.

Design reference: [Figma — Job Lagyo](https://figma.com/design/MYGBhkDW3yxffqTKveVQWD)

## Stack

- **Frontend:** Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript
- **Styling:** Tailwind CSS v4 — primary color indigo `#4F46E5`, accent orange `#EA580C`
- **Backend / DB / Auth:** Supabase (Postgres, Auth, Row Level Security)

## Features

- Browse and search job listings, filterable by category, location, and job type
- Job detail pages with an apply flow (candidates)
- Employer signup, job posting, and a dashboard showing posted jobs with applicant counts
- Row Level Security so employers only manage their own company's jobs/applications

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then in the SQL Editor run, in order:
   - [`supabase/schema.sql`](supabase/schema.sql) — creates tables, RLS policies, and the profile-creation trigger
   - [`supabase/seed.sql`](supabase/seed.sql) — optional sample Nepal job data (edit the `owner_id` placeholders first)

3. **Configure environment variables** — copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key (Project Settings > API):

   ```bash
   cp .env.example .env.local
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/                 App Router routes (home, /jobs, /jobs/[slug], /login, /signup, /post-job, /dashboard)
  components/          Shared UI (Navbar, Footer, JobCard, SearchBar)
  lib/
    supabase/          Browser, server, and proxy Supabase clients
    data/               Server-side data-fetching helpers
    types.ts            Shared TypeScript types matching the DB schema
    constants.ts         Job categories, Nepal locations, job types
supabase/
  schema.sql           Database schema + Row Level Security policies
  seed.sql             Sample data for local development
```

## Data model

- `profiles` — one row per auth user, `role` is `candidate` or `employer`
- `companies` — owned by an employer profile
- `jobs` — belongs to a company
- `applications` — links a candidate profile to a job

## Deploying

- **Vercel:** deploy on [Vercel](https://vercel.com/new) and set the same environment variables from `.env.example` in your project settings. No extra configuration needed.
- **Hostinger:** see [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions using Hostinger's Node.js App feature.
