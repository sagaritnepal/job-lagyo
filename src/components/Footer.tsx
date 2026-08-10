import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="web-chrome mt-auto border-t border-neutral-200 bg-neutral-50 pb-16 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div>
            <Logo className="text-2xl" />
            <p className="mt-2 max-w-xs text-sm text-neutral-500">
              Nepal&apos;s job portal — connecting job seekers in Kathmandu
              and beyond with employers who are hiring now.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <h3 className="text-sm font-semibold text-neutral-800">
                For Job Seekers
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-neutral-500">
                <li>
                  <Link href="/jobs" className="hover:text-primary-700">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-primary-700">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-800">
                For Employers
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-neutral-500">
                <li>
                  <Link href="/post-job" className="hover:text-primary-700">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary-700">
                    Employer Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs text-neutral-400">
          © {new Date().getFullYear()} Job Lagyo. Made in Kathmandu, Nepal.
        </p>
      </div>
    </footer>
  );
}
