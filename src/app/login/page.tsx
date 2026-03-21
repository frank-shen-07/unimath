"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppSession } from "@/lib/auth/use-app-session";

function GoogleButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="unimath-pill flex w-full items-center justify-center gap-2 rounded-sm py-3 text-sm font-medium text-foreground transition-all duration-200 hover:bg-accent/70 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      {label}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading: sessionLoading } = useAppSession();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");

    if (errorParam === "OAuthCallback") {
      setError("Google sign-in failed. Please try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user?.id) {
      router.replace("/dashboard");
    }
  }, [router, session]);

  const getCallbackUrl = (nextPath: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const resolveIdentifierToEmail = async (value: string) => {
    if (value.includes("@")) {
      return value.trim().toLowerCase();
    }

    const response = await fetch("/api/auth/resolve-identifier", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: value,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Could not resolve account.");
    }

    return (payload.email as string | null) ?? null;
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch {
      setError("Could not start Google sign-in.");
      setLoading(false);
    }
  };

  const handleLocalLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const resolvedEmail = await resolveIdentifierToEmail(identifier.trim());

      if (!resolvedEmail) {
        throw new Error("Invalid email, username, or password.");
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Could not sign you in."
      );
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!email.trim()) {
        throw new Error("Email is required.");
      }

      if (!username.trim()) {
        throw new Error("Username is required.");
      }

      if (username.includes("@")) {
        throw new Error("Username cannot contain '@'.");
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const usernameLookup = await resolveIdentifierToEmail(username.trim());
      if (usernameLookup) {
        throw new Error("That username is already taken.");
      }

      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: getCallbackUrl("/dashboard"),
          data: {
            full_name: username.trim(),
            name: username.trim(),
            username: username.trim(),
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      setSuccess(
        "Check your inbox to verify your email. Once verified, you'll be redirected back into the app."
      );
      setMode("login");
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Could not create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const resolvedEmail = await resolveIdentifierToEmail(identifier.trim());

      if (resolvedEmail) {
        const supabase = createClient();
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          resolvedEmail,
          {
            redirectTo: getCallbackUrl("/reset-password"),
          }
        );

        if (resetError) {
          throw resetError;
        }
      }

      setSuccess(
        "If that account exists, a password reset link has been sent."
      );
    } catch (forgotError) {
      setError(
        forgotError instanceof Error
          ? forgotError.message
          : "Could not start password reset."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unimath-shell min-h-screen px-4 pb-8 pt-0">
      <Link
        href="/"
        className="unimath-pill fixed left-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="h-5 w-5" />
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center">
        <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl">
          <motion.div
            className="px-6 py-8 sm:px-8 lg:px-10 lg:py-12"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="unimath-panel-muted mx-auto w-full rounded-lg p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-foreground">
                  {mode === "register"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Reset password"
                      : "Welcome back"}
                </h2>
              </div>

              <div className="mb-4 flex gap-2">
                {[
                  ["login", "Login"],
                  ["register", "Register"],
                  ["forgot", "Forgot Password?"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setMode(value as "login" | "register" | "forgot");
                      setError("");
                      setSuccess("");
                    }}
                    className={`rounded-sm px-3 py-1 text-sm transition ${
                      mode === value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {mode === "login" ? (
                <form onSubmit={handleLocalLogin} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      Email or username
                    </label>
                    <input
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      required
                      className="unimath-input h-10.5 w-full rounded-md px-4 text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        className="unimath-input h-10.5 w-full rounded-md px-4 pr-11 text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || sessionLoading}
                    className="w-full rounded-sm bg-primary py-2.25 text-base font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </form>
              ) : null}

              {mode === "register" ? (
                <form onSubmit={handleRegister} className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      Username
                    </label>
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                      className="unimath-input h-10 w-full rounded-md px-4 text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="unimath-input h-10 w-full rounded-md px-4 text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        minLength={8}
                        className="unimath-input h-10 w-full rounded-md px-4 pr-11 text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                        minLength={8}
                        className="unimath-input h-10 w-full rounded-md px-4 pr-11 text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-sm bg-primary py-2.25 text-base font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "Creating account..." : "Create account"}
                  </button>
                </form>
              ) : null}

              {mode === "forgot" ? (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      Email or username
                    </label>
                    <input
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      required
                      className="unimath-input h-10.5 w-full rounded-md px-4 text-foreground"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-sm bg-primary py-2.25 text-base font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "Sending reset link..." : "Send reset link"}
                  </button>
                </form>
              ) : null}

              {error ? (
                <p className="mt-4 text-center text-sm text-red-400">{error}</p>
              ) : null}
              {success ? (
                <p className="mt-4 text-center text-sm text-green-400">
                  {success}
                </p>
              ) : null}

              <div className="my-4 flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <GoogleButton
                label={loading ? "Redirecting to Google..." : "Continue with Google"}
                onClick={handleGoogleAuth}
                disabled={loading || sessionLoading}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
