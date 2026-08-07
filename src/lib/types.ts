export type UserRole = "candidate" | "employer" | "admin";

export type JobType =
  | "full-time"
  | "part-time"
  | "internship"
  | "contract"
  | "remote";

export type JobStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "flagged"
  | "closed";

export type ApplicationStatus =
  | "submitted"
  | "reviewed"
  | "shortlisted"
  | "interviewing"
  | "rejected"
  | "hired";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  location: string;
  is_blacklisted: boolean;
  blacklist_reason: string | null;
  blacklisted_at: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  slug: string;
  category: string;
  job_type: JobType;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: "monthly" | "yearly";
  description: string;
  requirements: string | null;
  tags: string[];
  featured: boolean;
  deadline: string | null;
  status: JobStatus;
  rejection_reason: string | null;
  flag_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  company?: Company;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  job?: Job;
  applicant?: Profile;
}
