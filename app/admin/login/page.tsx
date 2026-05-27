"use client";

/**
 * Admin login. Single shared credential — no signup, no password reset.
 * Submits to /api/admin-auth/login which sets the session cookie on success;
 * the user is then redirected to the path they were originally trying to
 * reach (preserved as ?from=…) or /admin by default.
 *
 * Wrapped in Suspense because useSearchParams forces a client-render bail
 * during static prerender (Next 15 requirement).
 */

import { Suspense, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const params = useSearchParams();
  const from = params.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        // Hard navigate so the new cookie is on the request that loads /admin.
        // router.replace would re-render the SPA without a fresh round-trip,
        // which the middleware would then bounce because the cookie isn't on
        // the in-flight request yet.
        window.location.href = from;
        return;
      }
      setError("Invalid credentials");
    } catch {
      setError("Network error — please retry");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm bg-white border border-neutral-200 rounded-2xl shadow-sm p-6"
    >
      <h1 className="text-xl font-semibold text-neutral-900 mb-1">Admin sign in</h1>
      <p className="text-sm text-neutral-500 mb-6">
        BlackAt Events — restricted area.
      </p>

      <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
      />

      <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
      />

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-neutral-900 text-white text-sm font-medium py-2.5 hover:bg-neutral-800 disabled:opacity-60 transition-colors"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
