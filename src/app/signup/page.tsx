"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type SignupState } from "./actions";

const initial: SignupState = {};

export default function SignupPage() {
  const [state, action, pending] = useActionState(signupAction, initial);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white border rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <form action={action} className="space-y-3">
          <label className="block text-sm">
            Shop name
            <input name="shopName" required autoComplete="organization" className="block w-full mt-1 border rounded px-2 py-1" />
            <span className="text-xs text-gray-500">What the business is called.</span>
          </label>
          <label className="block text-sm">
            Username
            <input name="username" required autoComplete="username" className="block w-full mt-1 border rounded px-2 py-1" />
            <span className="text-xs text-gray-500">3–32 chars, lowercase letters, digits, dots or underscores.</span>
          </label>
          <label className="block text-sm">
            Email
            <input name="email" type="email" required autoComplete="email" className="block w-full mt-1 border rounded px-2 py-1" />
          </label>
          <label className="block text-sm">
            Password
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className="block w-full mt-1 border rounded px-2 py-1" />
            <span className="text-xs text-gray-500">At least 8 characters.</span>
          </label>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button disabled={pending} className="w-full px-3 py-2 rounded bg-black text-white text-sm disabled:opacity-60">
            {pending ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="text-sm text-gray-600">
          Have an account? <Link href="/login" className="underline">Sign in</Link>.
        </p>
      </div>
    </div>
  );
}
