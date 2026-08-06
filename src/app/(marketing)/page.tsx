import Link from "next/link";
import { ArrowRight, MapPin, Search, UserPlus, MousePointerClick, PartyPopper } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { JobListItem } from "@/components/JobListItem";
import { CompanyBadge } from "@/components/CompanyBadge";
import { KathmanduSkyline } from "@/components/KathmanduSkyline";
import { getCategoryCounts, getFeaturedJobs, getHomeStats, getTopCompanies } from "@/lib/data/jobs";
import { JOB_CATEGORIES } from "@/lib/constants";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Build a friendly digital resume highlighting your skills, education, and past work experiences.",
    icon: UserPlus,
  },
  {
    step: "02",
    title: "One-Click Apply",
    description: "Search and discover thousands of jobs. Submit your tailored application in a single click.",
    icon: MousePointerClick,
  },
  {
    step: "03",
    title: "Get Interviewed & Hired",
    description: "Connect directly with hiring managers and kickstart your career with Job Lagyo.",
    icon: PartyPopper,
  },
];

export default async function HomePage() {
  const [jobs, stats, companies, categoryCounts] = await Promise.all([
    getFeaturedJobs(6),
    getHomeStats(),
    getTopCompanies(5),
    getCategoryCounts(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-900 to-primary-950 px-4 pb-32 pt-16 sm:px-6 sm:pb-40 sm:pt-20">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            #1 Job Portal in Nepal
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Find Your Dream Career in Nepal
          </h1>
          <p className="mt-2 text-sm text-primary-200">रोजगारको लागि तपाईंको भरपर्दो साथी</p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-300 sm:text-base">
            Explore thousands of verified job opportunities from Nepal&apos;s top
            employers. Fast, friendly, and easy.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-300">
            <span>Popular Searches:</span>
            {["React Developer", "Digital Marketing", "Sales Manager", "Teacher"].map((term) => (
              <Link
                key={term}
                href={`/jobs?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-white/20 px-3 py-1 hover:bg-white/10"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
        <KathmanduSkyline />
      </section>

      {/* Stats */}
      <section className="border-b border-neutral-100 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 text-center sm:grid-cols-4">
          {[
            { label: "Active Job Openings", value: stats.activeJobs },
            { label: "Verified Employers", value: stats.verifiedEmployers },
            { label: "Successful Hires", value: stats.successfulHires },
            { label: "Daily Applications", value: stats.dailyApplications },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-extrabold text-primary-700 sm:text-3xl">
                {stat.value.toLocaleString()}+
              </p>
              <p className="mt-1 text-xs text-neutral-500 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900">
            Explore Featured Categories
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Discover opportunities across high-demand sectors in Nepal&apos;s job market.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {JOB_CATEGORIES.map(({ name, icon: Icon }) => (
            <Link
              key={name}
              href={`/jobs?category=${encodeURIComponent(name)}`}
              className="rounded-xl border border-neutral-200 bg-white p-5 text-center transition hover:border-primary-300 hover:shadow-sm"
            >
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-neutral-800">{name}</p>
              <p className="text-xs text-neutral-400">
                {(categoryCounts[name] ?? 0).toLocaleString()} Active Jobs
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Top companies */}
      {companies.length > 0 && (
        <section className="border-y border-neutral-100 bg-neutral-50 px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-2xl font-bold text-neutral-900">Top Companies Hiring Now</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Learn more about Nepal&apos;s most loved workplaces.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
              {companies.map((company) => (
                <div key={company.id} className="flex flex-col items-center gap-2">
                  <CompanyBadge name={company.name} />
                  <span className="text-sm font-medium text-neutral-700">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest jobs */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Latest Job Openings</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Hand-picked verified opportunities updated just minutes ago.
            </p>
          </div>
          <Link
            href="/jobs"
            className="hidden shrink-0 items-center gap-1 rounded-lg border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 sm:flex"
          >
            View All Jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <p className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-sm text-neutral-500">
            <Search className="h-6 w-6 text-neutral-400" />
            No jobs posted yet.{" "}
            <Link href="/post-job" className="font-semibold text-primary-700">
              Be the first employer to post one →
            </Link>
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {jobs.map((job) => (
              <JobListItem key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="border-y border-neutral-100 bg-neutral-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-bold text-neutral-900">How Job Lagyo Works</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Your simple 3-step guide to landing your dream job in Nepal.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, description, icon: Icon }) => (
              <div key={step} className="relative">
                <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-6xl font-extrabold text-neutral-200">
                  {step}
                </span>
                <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="relative mt-4 font-semibold text-neutral-900">{title}</h3>
                <p className="relative mt-2 text-sm text-neutral-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-700">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 py-14 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to find your next opportunity?
          </h2>
          <p className="max-w-xl text-sm text-primary-100">
            Join thousands of job seekers and employers connecting across Nepal every day.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/jobs"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-50"
            >
              Browse Jobs
            </Link>
            <Link
              href="/post-job"
              className="rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-white hover:bg-accent-700"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* Success stories */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-neutral-900">Success Stories</h2>
        <p className="mt-1 text-center text-sm text-neutral-500">
          Hear from happy job seekers who found their path through Job Lagyo.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              quote: "Job Lagyo made my job hunt so simple! I applied to 3 places and got an interview callback within a week.",
              name: "Anish Shrestha",
              role: "React Developer",
            },
            {
              quote: "The interface is beautiful and so easy to use compared to older sites. I love the salary transparency.",
              name: "Pooja Karki",
              role: "HR Executive",
            },
            {
              quote: "Being from Pokhara, I was looking for remote software gigs. Job Lagyo helped me land a remote role with ease.",
              name: "Roshan Adhikari",
              role: "Flutter Developer",
            },
          ].map((story) => (
            <div key={story.name} className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="text-sm text-neutral-600">&ldquo;{story.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <CompanyBadge name={story.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{story.name}</p>
                  <p className="text-xs text-neutral-500">{story.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="flex items-center justify-center gap-1 text-xs text-neutral-400">
          <MapPin className="h-3.5 w-3.5" /> Proudly built in Kathmandu, Nepal
        </div>
      </section>
    </div>
  );
}
