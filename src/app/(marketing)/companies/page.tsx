import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Globe, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CompanyBadge } from "@/components/CompanyBadge";

export const metadata: Metadata = {
  title: "Companies Hiring in Nepal",
  description:
    "Browse verified employers actively hiring in Kathmandu and across Nepal. Discover top companies and their open job vacancies on Job Lagyo.",
  alternates: { canonical: "/companies" },
};

export default async function CompaniesPage() {
  const supabase = await createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .eq("is_blacklisted", false)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">
        Companies Hiring in Nepal
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Verified employers currently posting jobs on Job Lagyo.
      </p>

      {!companies || companies.length === 0 ? (
        <p className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-sm text-neutral-500">
          <Building2 className="h-6 w-6 text-neutral-400" />
          No companies have joined yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="rounded-xl border border-neutral-200 bg-white p-5"
            >
              <Link href={`/companies/${company.slug}`} className="flex items-center gap-3 group">
                <CompanyBadge name={company.name} />
                <div>
                  <h2 className="font-semibold text-neutral-900 group-hover:text-primary-700">
                    {company.name}
                  </h2>
                  <p className="flex items-center gap-1 text-xs text-neutral-500">
                    <MapPin className="h-3 w-3" /> {company.location}
                  </p>
                </div>
              </Link>
              {company.description && (
                <p className="mt-3 line-clamp-3 text-sm text-neutral-600">
                  {company.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                <Link
                  href={`/companies/${company.slug}`}
                  className="text-sm font-medium text-primary-700 hover:underline"
                >
                  View open roles →
                </Link>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> Visit website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
