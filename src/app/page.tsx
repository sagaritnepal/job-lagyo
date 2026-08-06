import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { JobCard } from "@/components/JobCard";
import { getFeaturedJobs } from "@/lib/data/jobs";
import { JOB_CATEGORIES } from "@/lib/constants";

export default async function HomePage() {
  const jobs = await getFeaturedJobs(6);

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Find your next job in{" "}
            <span className="text-accent-400">Kathmandu</span> &amp; Nepal
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-primary-100 sm:text-lg">
            Job Lagyo connects job seekers across Nepal with employers who
            are hiring right now — from Thamel startups to established
            companies across the valley.
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold text-neutral-900">
          Browse by category
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {JOB_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/jobs?category=${encodeURIComponent(category)}`}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:border-primary-300 hover:text-primary-700"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">
            Latest job openings
          </h2>
          <Link
            href="/jobs"
            className="text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            View all jobs →
          </Link>
        </div>

        {jobs.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
            No jobs posted yet.{" "}
            <Link href="/post-job" className="font-semibold text-primary-700">
              Be the first employer to post one →
            </Link>
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-accent-600">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white">
            Hiring in Nepal? Reach thousands of job seekers.
          </h2>
          <Link
            href="/post-job"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-accent-700 hover:bg-accent-50"
          >
            Post a Job — It&apos;s Free
          </Link>
        </div>
      </section>
    </div>
  );
}
