import type { Job } from "@/lib/types";

export function formatSalary(job: Pick<Job, "salary_min" | "salary_max" | "salary_period">) {
  const { salary_min, salary_max, salary_period } = job;
  if (!salary_min && !salary_max) return "Salary negotiable";

  const period = salary_period === "yearly" ? "/year" : "/month";
  const fmt = (n: number) => `Rs ${n.toLocaleString("en-IN")}`;

  if (salary_min && salary_max) {
    return `${fmt(salary_min)} – ${fmt(salary_max)} ${period}`;
  }
  return `${fmt((salary_min ?? salary_max)!)} ${period}`;
}

export function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function daysLeft(deadline: string): number {
  const diffMs = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
