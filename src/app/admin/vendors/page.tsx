import { MapPin } from "lucide-react";
import { getVendors } from "@/lib/data/admin";
import { CompanyBadge } from "@/components/CompanyBadge";
import { BlacklistButton } from "./BlacklistButton";

export const metadata = {
  title: "Vendors — Job Lagyo Admin",
};

export default async function AdminVendorsPage() {
  const vendors = await getVendors();

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">
        Vendors {vendors.length > 0 && `(${vendors.length})`}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Blacklist employers who post fraudulent offers or ignore applicants after they said
        they&apos;d respond.
      </p>

      {vendors.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
          No vendors yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className={`rounded-xl border bg-white p-4 sm:p-5 ${
                vendor.is_blacklisted ? "border-red-200" : "border-neutral-200"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CompanyBadge name={vendor.name} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-neutral-900">{vendor.name}</p>
                      {vendor.is_blacklisted && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                          Blacklisted
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-xs text-neutral-500">
                      <MapPin className="h-3 w-3" /> {vendor.location}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {vendor.job_count} job{vendor.job_count === 1 ? "" : "s"} posted &middot;{" "}
                      {vendor.total_application_count} application
                      {vendor.total_application_count === 1 ? "" : "s"} received
                    </p>
                    {vendor.is_blacklisted && vendor.blacklist_reason && (
                      <p className="mt-2 max-w-xl text-sm text-red-700">
                        {vendor.blacklist_reason}
                      </p>
                    )}
                  </div>
                </div>
                <BlacklistButton companyId={vendor.id} isBlacklisted={vendor.is_blacklisted} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
