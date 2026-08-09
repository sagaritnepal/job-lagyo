import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Globe, MapPin } from "lucide-react";
import { getCompanyBySlug, getCompanyJobs } from "@/lib/data/jobs";
import { getSavedJobIds } from "@/lib/data/savedJobs";
import { getAuthUser } from "@/lib/supabase/auth";
import { JobListItem } from "@/components/JobListItem";
import { CompanyBadge } from "@/components/CompanyBadge";

export async function generateMetadata({
  params,
}: PageProps<"/companies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    return { title: "Company not found", robots: { index: false, follow: false } };
  }

  const description = company.description
    ? company.description.slice(0, 155)
    : `See open job vacancies from ${company.name} in ${company.location} on Job Lagyo.`;

  return {
    title: company.name,
    description,
    alternates: { canonical: `/companies/${company.slug}` },
    openGraph: { type: "website", title: company.name, description },
    twitter: { card: "summary_large_image", title: company.name, description },
  };
}

export default async function CompanyDetailPage({
  params,
}: PageProps<"/companies/[slug]">) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const [jobs, user] = await Promise.all([
    getCompanyJobs(company.id),
    getAuthUser(),
  ]);
  const savedJobIds = user ? await getSavedJobIds(user.id) : new Set<string>();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/companies" className="text-sm text-primary-700 hover:underline">
        ← Back to all companies
      </Link>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <CompanyBadge name={company.name} size="md" />
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{company.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
              <MapPin className="h-3.5 w-3.5" /> {company.location}
            </p>
          </div>
        </div>

        {company.description && (
          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
            {company.description}
          </p>
        )}

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
          >
            <Globe className="h-3.5 w-3.5" /> Visit website
          </a>
        )}
      </div>

      <h2 className="mt-8 text-lg font-bold text-neutral-900">
        Open Roles {jobs.length > 0 && `(${jobs.length})`}
      </h2>

      {jobs.length === 0 ? (
        <p className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-sm text-neutral-500">
          <Building2 className="h-6 w-6 text-neutral-400" />
          No open roles from {company.name} right now.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {jobs.map((job) => (
            <JobListItem
              key={job.id}
              job={job}
              isSaved={savedJobIds.has(job.id)}
              isLoggedIn={!!user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
