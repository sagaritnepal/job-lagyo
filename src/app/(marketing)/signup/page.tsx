"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2, Search, Building2 } from "lucide-react";
import { signupAction, type SignupState } from "./actions";

const initialState: SignupState = {};

const ROLES = [
  {
    value: "candidate",
    label: "Job Seeker",
    description: "I'm looking for work",
    icon: Search,
  },
  {
    value: "employer",
    label: "Job Provider",
    description: "I'm hiring talent",
    icon: Building2,
  },
] as const;

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState,
  );
  const [role, setRole] = useState<"candidate" | "employer">("candidate");

  if (state.success) {
    return (
      <div className="mx-auto flex max-w-md flex-col px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Check your email
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          We&apos;ve sent a confirmation link to your inbox. Click it to
          activate your Job Lagyo account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Create your Job Lagyo account
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Free to join — find work or hire talent across Nepal.
        </p>

        <form action={formAction} className="mt-6 space-y-5">
          <div>
            <span className="text-sm font-medium text-neutral-700">
              I want to
            </span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {ROLES.map(({ value, label, description, icon: Icon }) => {
                const selected = role === value;
                return (
                  <label
                    key={value}
                    className={`relative flex cursor-pointer flex-col items-start gap-2 rounded-xl border-2 p-3.5 transition ${
                      selected
                        ? "border-primary-600 bg-primary-50"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={selected}
                      onChange={() => setRole(value)}
                      className="sr-only"
                    />
                    {selected && (
                      <CheckCircle2 className="absolute right-2.5 top-2.5 h-4.5 w-4.5 text-primary-600" />
                    )}
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        selected ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-neutral-900">
                        {label}
                      </span>
                      <span className="block text-xs text-neutral-500">{description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">
              Full name
            </label>
            <input
              type="text"
              name="full_name"
              required
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500"
            />
          </div>

          {state.error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {pending ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
