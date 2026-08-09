import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function ProfileCompletionBanner() {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>
        Your profile is incomplete — add your field of expertise and education before you can
        apply to jobs.{" "}
        <Link href="/profile" className="font-semibold underline">
          Complete your profile →
        </Link>
      </span>
    </div>
  );
}
