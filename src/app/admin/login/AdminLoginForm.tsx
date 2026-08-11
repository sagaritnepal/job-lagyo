"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { adminLoginAction, type AdminAuthState } from "./actions";

const initialState: AdminAuthState = {};

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-900 px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
            <ShieldCheck className="h-6 w-6 text-white" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-white">Job Lagyo Admin</h1>
          <p className="mt-1 text-xs font-semibold tracking-wide text-primary-500">
            ADMIN CONSOLE
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-4 rounded-xl border border-neutral-800 bg-neutral-800/50 p-5">
          <div>
            <label className="text-sm font-medium text-neutral-300">Email</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-300">Password</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
            />
          </div>
          {state.error && <p className="text-sm text-red-400">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500">
          This portal is restricted to authorized Job Lagyo administrators.
        </p>
      </div>
    </div>
  );
}
