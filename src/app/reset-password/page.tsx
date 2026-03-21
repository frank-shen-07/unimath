"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess("Password updated. Redirecting to your dashboard...");
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <div className="unimath-shell min-h-screen px-4 py-8">
      <Link
        href="/"
        className="unimath-pill fixed left-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="h-5 w-5" />
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center">
        <div className="unimath-panel mx-auto w-full max-w-xl rounded-xl p-8">
          <p className="font-label text-[11px] text-muted-foreground">
            Password reset
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-foreground">
            Create a new password
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Choose a new password for your UniMathMate account.
          </p>

          {searchParams.get("error") ? (
            <p className="mt-5 text-sm text-red-400">
              The reset link is invalid or has expired. Request a new one from
              the login page.
            </p>
          ) : null}

          <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                className="unimath-input h-12 w-full rounded-md px-4 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                className="unimath-input h-12 w-full rounded-md px-4 text-foreground"
              />
            </div>

            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : null}
            {success ? (
              <p className="text-sm text-green-400">{success}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-primary py-3 text-base font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Updating password..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
