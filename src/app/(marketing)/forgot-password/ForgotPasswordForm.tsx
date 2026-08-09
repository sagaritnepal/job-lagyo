"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Reset your password</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {state.status === "success" ? (
        <p className="mt-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
          {state.message}
        </p>
      ) : (
        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>
          {state.status === "error" && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {pending ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-neutral-500">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-primary-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
