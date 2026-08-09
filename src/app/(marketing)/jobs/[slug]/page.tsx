import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Briefcase, Clock, MapPin, Wallet } from "lucide-react";
import { getJobBySlug } from "@/lib/data/jobs";
import { getSavedJobIds } from "@/lib/data/savedJobs";
import { daysLeft, formatSalary, timeAgo } from "@/lib/format";
import { getAuthUser } from "@/lib/supabase/auth";
import { CompanyBadge } from "@/components/CompanyBadge";
import { SaveJobButton } from "@/components/SaveJobButton";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { ApplyForm } from "./ApplyForm";

const JOB_TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  internship: "Internship",
  contract: "Contract",
  remote: "Remote",
};

const EMPLOYMENT_TYPE_SCHEMA: Record<string, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  internship: "INTERN",
  contract: "CONTRACTOR",
  remote: "FULL_TIME",
};

function isJobLive(job: { status: string; deadline: string | null }) {
  if (job.status !== "published") return false;
  if (job.deadline && new Date(job.deadline) < new Date()) return false;
  return true;
}

export async function generateMetadata({
  params,
}: PageProps<"/jobs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return { title: "Job not found", robots: { index: false, follow: false } };
  }

  const companyName = job.company?.name ?? "Confidential Company";
  const title = `${job.title} at ${companyName}`;
  const description = `${job.title} at ${companyName} in ${job.location}. ${formatSalary(job)}. ${JOB_TYPE_LABEL[job.job_type] ?? job.job_type} role — apply now on ${SITE_NAME}.`;
  const live = isJobLive(job);

  return {
    title,
    description,
    alternates: { canonical: `/jobs/${job.slug}` },
    robots: live
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function JobDetailPage({
  params,
}: PageProps<"/jobs/[slug]">) {
  const { slug } = await params;
  const [job, user] = await Promise.all([getJobBySlug(slug), getAuthUser()]);

  if (!job) notFound();

  const savedJobIds = user ? await getSavedJobIds(user.id) : new Set<string>();

  const remaining = job.deadline ? daysLeft(job.deadline) : null;
  const requirementLines =
    job.requirements?.split("\n").map((l) => l.trim()).filter(Boolean) ?? [];

  const companyName = job.company?.name ?? "Confidential Company";
  const isRemote = job.job_type === "remote" || job.location === "Remote";

  const jobPostingJsonLd = isJobLive(job)
    ? {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description: job.description,
        identifier: {
          "@type": "PropertyValue",
          name: SITE_NAME,
          value: job.id,
        },
        datePosted: job.created_at,
        ...(job.deadline ? { validThrough: job.deadline } : {}),
        employmentType: EMPLOYMENT_TYPE_SCHEMA[job.job_type] ?? "OTHER",
        hiringOrganization: {
          "@type": "Organization",
          name: companyName,
          ...(job.company?.website ? { sameAs: job.company.website } : {}),
          ...(job.company?.logo_url ? { logo: job.company.logo_url } : {}),
        },
        ...(isRemote
          ? {
              jobLocationType: "TELECOMMUTE",
              applicantLocationRequirements: {
                "@type": "Country",
                name: "Nepal",
              },
            }
          : {
              jobLocation: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: job.location,
                  addressCountry: "NP",
                },
              },
            }),
        ...(job.salary_min || job.salary_max
          ? {
              baseSalary: {
                "@type": "MonetaryAmount",
                currency: "NPR",
                value: {
                  "@type": "QuantitativeValue",
                  ...(job.salary_min ? { minValue: job.salary_min } : {}),
                  ...(job.salary_max ? { maxValue: job.salary_max } : {}),
                  unitText: job.salary_period === "yearly" ? "YEAR" : "MONTH",
                },
              },
            }
          : {}),
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Jobs", item: `${SITE_URL}/jobs` },
      {
        "@type": "ListItem",
        position: 3,
        name: job.title,
        item: `${SITE_URL}/jobs/${job.slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {jobPostingJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Link href="/jobs" className="text-sm text-primary-700 hover:underline">
        ← Back to all jobs
      </Link>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <CompanyBadge name={job.company?.name ?? job.title} size="md" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{job.title}</h1>
              <p className="mt-1 text-sm font-medium text-primary-700">
                {companyName}
              </p>
            </div>
          </div>
          <SaveJobButton
            jobId={job.id}
            initialSaved={savedJobIds.has(job.id)}
            isLoggedIn={!!user}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-neutral-200 p-3">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-400">
              <Wallet className="h-3.5 w-3.5" /> Salary
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">{formatSalary(job)}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-400">
              <Briefcase className="h-3.5 w-3.5" /> Job Type
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {JOB_TYPE_LABEL[job.job_type] ?? job.job_type}
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-400">
              <MapPin className="h-3.5 w-3.5" /> Location
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">{job.location}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-400">
              <Clock className="h-3.5 w-3.5" /> Deadline
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                remaining !== null && remaining <= 3 ? "text-accent-600" : "text-neutral-900"
              }`}
            >
              {remaining === null
                ? "Open"
                : remaining > 0
                  ? `${remaining} Days Left`
                  : "Closed"}
            </p>
          </div>
        </div>

        {job.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-neutral-400">Posted {timeAgo(job.created_at)}</p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-neutral-700">
          <div>
            <h2 className="font-semibold text-neutral-900">Job Description</h2>
            <p className="mt-2 whitespace-pre-line">{job.description}</p>
          </div>
          {requirementLines.length > 0 && (
            <div>
              <h2 className="font-semibold text-neutral-900">Requirements</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {requirementLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-neutral-200 pt-6">
          {user ? (
            <ApplyForm jobId={job.id} jobSlug={job.slug} />
          ) : (
            <p className="text-sm text-neutral-600">
              <Link href="/login" className="font-semibold text-primary-700">
                Log in
              </Link>{" "}
              or{" "}
              <Link href="/signup" className="font-semibold text-primary-700">
                create an account
              </Link>{" "}
              to apply for this job.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
