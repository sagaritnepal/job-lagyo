"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uniqueSlug } from "@/lib/slug";

export type PostJobState = { error?: string };

export async function postJobAction(
  _prevState: PostJobState,
  formData: FormData,
): Promise<PostJobState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in as an employer to post a job." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "employer") {
    return {
      error: "Only employer accounts can post jobs. Please sign up as an employer.",
    };
  }

  let { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) {
    const companyName = formData.get("company_name")?.toString().trim();
    if (!companyName) {
      return { error: "Company name is required." };
    }
    const companyLocation =
      formData.get("company_location")?.toString() || "Kathmandu";

    const { data: newCompany, error: companyError } = await supabase
      .from("companies")
      .insert({
        owner_id: user.id,
        name: companyName,
        slug: uniqueSlug(companyName),
        location: companyLocation,
        website: formData.get("company_website")?.toString() || null,
      })
      .select("id")
      .single();

    if (companyError || !newCompany) {
      return {
        error: "Could not create your company profile. Please try again.",
      };
    }
    company = newCompany;
  }

  const title = formData.get("title")?.toString().trim();
  const category = formData.get("category")?.toString();
  const jobType = formData.get("job_type")?.toString();
  const location = formData.get("location")?.toString();
  const description = formData.get("description")?.toString().trim();
  const requirements =
    formData.get("requirements")?.toString().trim() || null;
  const salaryMin = formData.get("salary_min")?.toString();
  const salaryMax = formData.get("salary_max")?.toString();
  const deadline = formData.get("deadline")?.toString() || null;
  const tags =
    formData
      .get("tags")
      ?.toString()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean) ?? [];
  const featured = formData.get("featured") === "true";

  if (!title || !category || !jobType || !location || !description) {
    return { error: "Please fill in all required fields." };
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      company_id: company.id,
      title,
      slug: uniqueSlug(title),
      category,
      job_type: jobType,
      location,
      salary_min: salaryMin ? Number(salaryMin) : null,
      salary_max: salaryMax ? Number(salaryMax) : null,
      description,
      requirements,
      tags,
      featured,
      deadline,
      status: "published",
    })
    .select("slug")
    .single();

  if (jobError || !job) {
    return { error: "Could not post job. Please try again." };
  }

  redirect(`/jobs/${job.slug}`);
}
