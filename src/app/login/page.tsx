"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white border rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <form action={action} className="space-y-3">
          <label className="block text-sm">
            Username
            <input name="username" required autoComplete="username" className="block w-full mt-1 border rounded px-2 py-1" />
          </label>
          <label className="block text-sm">
            Password
            <input name="password" type="password" required autoComplete="current-password" className="block w-full mt-1 border rounded px-2 py-1" />
          </label>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button disabled={pending} className="w-full px-3 py-2 rounded bg-black text-white text-sm disabled:opacity-60">
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-sm text-gray-600">
          No account? <Link href="/signup" className="underline">Create one</Link>.
        </p>
      </div>
    </div>
  );
}
