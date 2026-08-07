"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction, type SignupState } from "./actions";

const initialState: SignupState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState,
  );

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
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">
        Create your Job Lagyo account
      </h1>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-700">
            I am a
          </label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
              <input
                type="radio"
                name="role"
                value="candidate"
                defaultChecked
                className="accent-primary-600"
              />
              Job Seeker
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
              <input
                type="radio"
                name="role"
                value="employer"
                className="accent-primary-600"
              />
              Job Provider
            </label>
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
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
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
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
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
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
          />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {pending ? "Creating account..." : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
