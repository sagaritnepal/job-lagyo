"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "./actions";

const initialState: AuthState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">
        Log in to Job Lagyo
      </h1>
      <form action={formAction} className="mt-6 space-y-4">
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
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
          />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {pending ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-primary-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}
