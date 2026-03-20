"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Home, Lock, Mail, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function GoogleButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      onClick={onClick}
      className="unimath-pill flex w-full items-center justify-center gap-2 rounded-sm py-3 text-sm font-medium text-foreground transition-all duration-200 hover:bg-accent/70"
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
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const supabase = createClient();
  const router = useRouter();

  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the terms");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
          name: displayName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccessMessage("Check your email to confirm your account.");
    setLoading(false);
  };

  const switchMode = () => {
    setIsLogin((value) => !value);
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="unimath-shell min-h-screen px-4 py-8">
      <Link
        href="/"
        className="unimath-pill fixed left-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="h-5 w-5" />
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center">
        <div className="unimath-panel mx-auto w-full overflow-hidden rounded-xl">
          <motion.div
            className="flex w-[200%]"
            animate={{ x: isLogin ? "0%" : "-50%" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-1/2 shrink-0 px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
              <div className="grid gap-8 lg:grid-cols-[0.85fr,1.15fr] lg:items-center">
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="max-w-sm text-center lg:text-left">
                    <p className="font-serif text-4xl leading-tight tracking-[-0.05em] text-foreground sm:text-5xl">
                      Don&apos;t have an account?
                    </p>
                    <button
                      type="button"
                      onClick={switchMode}
                      className="mt-6 inline-flex min-w-[220px] items-center justify-center rounded-sm bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      Register
                    </button>
                  </div>
                </div>

                <div className="unimath-panel-muted mx-auto w-full max-w-[560px] rounded-lg p-6 sm:p-8">
                  <div className="mb-8">
                    <p className="font-label text-[11px] text-muted-foreground">Welcome back</p>
                    <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-foreground">
                      Login
                    </h1>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="unimath-input flex items-center gap-3 rounded-md px-4 py-3">
                      <Mail className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <label className="block text-xs text-muted-foreground">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@email.com"
                          required
                          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>

                    <div className="unimath-input flex items-center gap-3 rounded-md px-4 py-3">
                      <Lock className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <label className="block text-xs text-muted-foreground">Password</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded-none border-border bg-transparent accent-white"
                        />
                        Remember me
                      </label>
                      <button type="button" className="font-medium text-foreground/60 hover:text-foreground">
                        Forgot password?
                      </button>
                    </div>

                    {isLogin && error ? (
                      <p className="text-center text-sm text-red-400">{error}</p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-sm bg-primary py-3 text-base font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                    >
                      {loading ? "Logging in..." : "Login"}
                    </button>
                  </form>

                  <div className="my-5 flex items-center gap-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-sm text-muted-foreground">or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <GoogleButton label="Continue with Google" onClick={handleGoogleAuth} />
                </div>
              </div>
            </div>

            <div className="w-1/2 shrink-0 px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
              <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
                <div className="unimath-panel-muted mx-auto w-full max-w-[560px] rounded-lg p-6 sm:p-8">
                  <div className="mb-6">
                    <p className="font-label text-[11px] text-muted-foreground">Create account</p>
                    <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-foreground">
                      Register
                    </h1>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-3.5">
                    <div className="unimath-input flex items-center gap-3 rounded-md px-4 py-3">
                      <Mail className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <label className="block text-xs text-muted-foreground">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@email.com"
                          required
                          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>

                    <div className="unimath-input flex items-center gap-3 rounded-md px-4 py-3">
                      <User className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <label className="block text-xs text-muted-foreground">Display name</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your name"
                          required
                          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>

                    <div className="unimath-input flex items-center gap-3 rounded-md px-4 py-3">
                      <Lock className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <label className="block text-xs text-muted-foreground">Password</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>

                    <div className="unimath-input flex items-center gap-3 rounded-md px-4 py-3">
                      <Lock className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <label className="block text-xs text-muted-foreground">Confirm password</label>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 rounded-none border-border bg-transparent accent-white"
                      />
                      <span>
                        I have read and agree to the{" "}
                        <span className="underline text-foreground">Disclaimer</span>.
                      </span>
                    </label>

                    {!isLogin && error ? (
                      <p className="text-center text-sm text-red-400">{error}</p>
                    ) : null}

                    {!isLogin && successMessage ? (
                      <p className="text-center text-sm text-green-400">{successMessage}</p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-sm bg-primary py-3 text-base font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                    >
                      {loading ? "Creating account..." : "Register"}
                    </button>
                  </form>

                  <div className="my-4 flex items-center gap-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-sm text-muted-foreground">or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <GoogleButton label="Join with Google" onClick={handleGoogleAuth} />
                </div>

                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="max-w-sm text-center lg:text-left">
                    <p className="font-serif text-4xl leading-tight tracking-[-0.05em] text-foreground sm:text-5xl">
                      Already have an account?
                    </p>
                    <button
                      type="button"
                      onClick={switchMode}
                      className="mt-6 inline-flex min-w-[220px] items-center justify-center rounded-sm bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
