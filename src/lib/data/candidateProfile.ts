import { createClient } from "@/lib/supabase/server";
import type {
  CandidateProfile,
  CandidateEducation,
  CandidateExperience,
  CandidateDocument,
} from "@/lib/types";

export async function getCandidateProfile(id: string): Promise<CandidateProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getCandidateProfile error:", error.message);
    return null;
  }
  return data as CandidateProfile | null;
}

export async function getCandidateEducation(candidateId: string): Promise<CandidateEducation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_education")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("start_year", { ascending: false });

  if (error) {
    console.error("getCandidateEducation error:", error.message);
    return [];
  }
  return (data as CandidateEducation[]) ?? [];
}

export async function getCandidateExperience(candidateId: string): Promise<CandidateExperience[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_experience")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("getCandidateExperience error:", error.message);
    return [];
  }
  return (data as CandidateExperience[]) ?? [];
}

export async function getCandidateDocuments(candidateId: string): Promise<CandidateDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_documents")
    .select("*")
    .eq("candidate_id", candidateId);

  if (error) {
    console.error("getCandidateDocuments error:", error.message);
    return [];
  }
  return (data as CandidateDocument[]) ?? [];
}

export interface CandidateProfileBundle {
  profile: CandidateProfile | null;
  education: CandidateEducation[];
  experience: CandidateExperience[];
  documents: CandidateDocument[];
}

export async function getCandidateProfileBundle(candidateId: string): Promise<CandidateProfileBundle> {
  const [profile, education, experience, documents] = await Promise.all([
    getCandidateProfile(candidateId),
    getCandidateEducation(candidateId),
    getCandidateExperience(candidateId),
    getCandidateDocuments(candidateId),
  ]);
  return { profile, education, experience, documents };
}

// Business rule for what counts as a "complete enough to apply" profile:
// at least one declared field of expertise and one education entry.
// Work experience and the 3 mandatory documents are encouraged (surfaced
// in the completion checklist) but not required, since first-time job
// seekers often have neither yet. Tighten here if that policy changes.
export async function isCandidateProfileComplete(candidateId: string): Promise<boolean> {
  const [profile, education] = await Promise.all([
    getCandidateProfile(candidateId),
    getCandidateEducation(candidateId),
  ]);
  return (profile?.categories.length ?? 0) > 0 && education.length > 0;
}
