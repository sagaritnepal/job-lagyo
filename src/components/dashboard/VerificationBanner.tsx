import Link from "next/link";
import { AlertCircle } from "lucide-react";
import type { Company } from "@/lib/types";

const MESSAGES: Record<string, string> = {
  unverified: "Submit your VAT and PAN registration documents to unlock job posting.",
  pending: "Your VAT/PAN documents are under review. You can post jobs once verified.",
  rejected: "Your verification was rejected. Review the reason and resubmit your documents.",
};

export function VerificationBanner({ company }: { company: Company | null }) {
  if (!company) {
    return (
      <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 sm:px-6">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>
          Set up your company profile to start posting jobs.{" "}
          <Link href="/dashboard/company" className="font-semibold underline">
            Set up company →
          </Link>
        </span>
      </div>
    );
  }

  if (company.verification_status === "verified") return null;

  return (
    <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 sm:px-6">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>
        {MESSAGES[company.verification_status] ?? MESSAGES.unverified}{" "}
        <Link href="/dashboard/company" className="font-semibold underline">
          Go to company verification →
        </Link>
      </span>
    </div>
  );
}
