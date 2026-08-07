import {
  Code2,
  DollarSign,
  MessageSquare,
  Users,
  Presentation,
  Image as ImageIcon,
  PenTool,
  Heart,
  type LucideIcon,
} from "lucide-react";

export const JOB_CATEGORIES: { name: string; icon: LucideIcon }[] = [
  { name: "Information Technology", icon: Code2 },
  { name: "Banking & Finance", icon: DollarSign },
  { name: "Sales & Marketing", icon: MessageSquare },
  { name: "Customer Service", icon: Users },
  { name: "Education & Teaching", icon: Presentation },
  { name: "Hospitality & Tourism", icon: ImageIcon },
  { name: "Creative & Design", icon: PenTool },
  { name: "Healthcare & Medicine", icon: Heart },
];

export const JOB_CATEGORY_NAMES = JOB_CATEGORIES.map((c) => c.name);

export const NEPAL_LOCATIONS = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Biratnagar",
  "Chitwan",
  "Butwal",
  "Remote",
] as const;

export const JOB_TYPES: { value: string; label: string }[] = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
];

export const APPLICATION_STATUSES: {
  value: string;
  label: string;
  className: string;
}[] = [
  { value: "submitted", label: "Reviewing", className: "bg-amber-50 text-amber-700" },
  { value: "reviewed", label: "Reviewing", className: "bg-amber-50 text-amber-700" },
  { value: "shortlisted", label: "Shortlisted", className: "bg-green-50 text-green-700" },
  { value: "interviewing", label: "Interviewing", className: "bg-primary-50 text-primary-700" },
  { value: "rejected", label: "Rejected", className: "bg-red-50 text-red-700" },
  { value: "hired", label: "Hired", className: "bg-accent-50 text-accent-700" },
];

export function statusMeta(status: string) {
  return (
    APPLICATION_STATUSES.find((s) => s.value === status) ?? {
      value: status,
      label: status,
      className: "bg-neutral-100 text-neutral-600",
    }
  );
}

export const JOB_STATUSES: {
  value: string;
  label: string;
  className: string;
}[] = [
  { value: "pending", label: "Pending review", className: "bg-amber-50 text-amber-700" },
  { value: "published", label: "Published", className: "bg-green-50 text-green-700" },
  { value: "rejected", label: "Rejected", className: "bg-red-50 text-red-700" },
  { value: "flagged", label: "Flagged (fraud)", className: "bg-red-100 text-red-800" },
  { value: "closed", label: "Closed", className: "bg-neutral-100 text-neutral-600" },
  { value: "draft", label: "Draft", className: "bg-neutral-100 text-neutral-600" },
];

export function jobStatusMeta(status: string) {
  return (
    JOB_STATUSES.find((s) => s.value === status) ?? {
      value: status,
      label: status,
      className: "bg-neutral-100 text-neutral-600",
    }
  );
}
