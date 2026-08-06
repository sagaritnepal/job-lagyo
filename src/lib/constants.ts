export const JOB_CATEGORIES = [
  "IT & Software",
  "Banking & Finance",
  "Hospitality & Tourism",
  "Sales & Marketing",
  "Education",
  "Healthcare",
  "NGO / INGO",
  "Engineering & Construction",
  "Accounting",
  "Customer Service",
  "Administration",
  "Media & Communication",
] as const;

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
