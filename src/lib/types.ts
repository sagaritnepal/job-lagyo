export type UserRole = "candidate" | "employer";

export type JobType =
  | "full-time"
  | "part-time"
  | "internship"
  | "contract"
  | "remote";

export type JobStatus = "draft" | "published" | "closed";

export type ApplicationStatus =
  | "submitted"
  | "reviewed"
  | "shortlisted"
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
  deadline: string | null;
  status: JobStatus;
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
}
