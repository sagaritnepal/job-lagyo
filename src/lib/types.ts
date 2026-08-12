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

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

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
  vat_number: string | null;
  pan_number: string | null;
  verification_status: VerificationStatus;
  verification_submitted_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  verification_rejection_reason: string | null;
  created_at: string;
}

export interface CompanyVerificationDocument {
  id: string;
  company_id: string;
  document_type: "vat_certificate" | "pan_certificate" | "registration_certificate" | "other";
  file_path: string;
  uploaded_at: string;
}

export interface CandidateProfile {
  id: string;
  categories: string[];
  bio: string | null;
  updated_at: string;
}

export interface CandidateEducation {
  id: string;
  candidate_id: string;
  institution: string;
  degree: string;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
  created_at: string;
}

export interface CandidateExperience {
  id: string;
  candidate_id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  created_at: string;
}

export type CandidateDocumentType = "education" | "work" | "national_id";

export interface CandidateDocument {
  candidate_id: string;
  doc_type: CandidateDocumentType;
  document_path: string;
  uploaded_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
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
