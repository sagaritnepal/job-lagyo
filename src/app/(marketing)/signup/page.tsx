import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a free Job Lagyo account to apply for jobs or start hiring across Nepal.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return <SignupForm />;
}
