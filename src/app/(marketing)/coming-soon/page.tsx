import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Coming Soon",
  robots: { index: false, follow: true },
};

export default function ComingSoonPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Coming soon</h1>
      <p className="mt-3 text-sm text-neutral-500">
        We&apos;re still building this section of Job Lagyo. In the meantime,
        check out live job listings.
      </p>
      <Link
        href="/jobs"
        className="mt-6 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
      >
        Browse Jobs
      </Link>
    </div>
  );
}
