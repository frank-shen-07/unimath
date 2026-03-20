"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Home } from "lucide-react";
import Link from "next/link";

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
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
    } else {
      setSuccessMessage("Check your email to confirm your account.");
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="unimath-shell min-h-screen px-4 py-8">
      <Link
        href="/"
        className="unimath-pill fixed left-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="w-5 h-5" />
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center">
        <div className="unimath-panel grid w-full overflow-hidden rounded-xl lg:grid-cols-[1.08fr,0.92fr]">
          <div className="relative overflow-hidden border-b border-border/70 p-8 lg:border-b-0 lg:border-r lg:p-12">
            <div className="editorial-grid absolute inset-0 opacity-[0.06]" />
            <div className="relative max-w-xl space-y-8">
              <div className="space-y-3">
                <p className="font-label text-[11px] text-muted-foreground">AI Math Tutor</p>
                <h1 className="font-serif text-6xl leading-none tracking-[-0.05em] text-foreground sm:text-7xl">
                  Study maths in a darker, calmer workspace.
                </h1>
                <p className="max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
                  UniMath combines tutoring chat with image uploads, practice, formula sheets, topic maps, and flashcards in one editorial study environment.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Tutor", "Step-by-step help"],
                  ["Maps", "Visualize topic practice"],
                  ["Flashcards", "Generate and review decks"],
                ].map(([label, detail]) => (
                  <div key={label} className="unimath-panel-muted rounded-md p-4">
                    <p className="font-serif text-2xl leading-none text-foreground">{label}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="unimath-panel-muted rounded-lg p-5">
                <p className="font-label text-[11px] text-muted-foreground">
                  {isLogin ? "New here?" : "Already have an account?"}
                </p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-serif text-3xl leading-none tracking-[-0.04em] text-foreground">
                      {isLogin ? "Create your workspace" : "Jump back in"}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {isLogin
                        ? "Sign up with email or Google and your study history syncs to Supabase."
                        : "Use your email/password login or continue with Google."}
                    </p>
                  </div>
                  <button
                    onClick={switchMode}
                    className="rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    {isLogin ? "Register" : "Login"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden p-6 sm:p-8 lg:p-10">
            <motion.div
              className="flex w-[200%]"
              animate={{ x: isLogin ? "0%" : "-50%" }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="w-1/2 pr-3">
                <div className="unimath-panel-muted h-full rounded-lg p-6 sm:p-8">
                  <div className="mb-8">
                    <p className="font-label text-[11px] text-muted-foreground">Welcome back</p>
                    <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-foreground">
                      Login
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Continue your tutoring chats, formula sheets, and saved decks.
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="unimath-input flex items-center gap-3 rounded-md px-4 py-3">
                      <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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
                      <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground flex-shrink-0"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded-none border-white/15 bg-transparent accent-white"
                        />
                        Remember me
                      </label>
                      <button type="button" className="font-medium text-foreground/60 hover:text-foreground">
                        Forgot password?
                      </button>
                    </div>

                    {isLogin && error ? (
                      <p className="text-red-400 text-sm text-center">{error}</p>
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
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <button
                    onClick={handleGoogleAuth}
                    className="unimath-pill flex w-full items-center justify-center gap-2 rounded-sm py-3 text-sm font-medium text-foreground transition-all duration-200 hover:bg-accent/70"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </div>

              <div className="w-1/2 pl-3">
                <div className="unimath-panel-muted h-full rounded-lg p-6 sm:p-8">
                  <div className="mb-6">
                    <p className="font-label text-[11px] text-muted-foreground">Create account</p>
                    <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-foreground">
                      Register
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Save your conversations, notes, knowledge map progress, and flashcard decks.
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-3.5">
                    <div className="unimath-input flex items-center gap-3 rounded-md px-4 py-3">
                      <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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
                      <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <label className="block text-xs text-muted-foreground">Display name</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your Name"
                          required
                          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>

                    <div className="unimath-input flex items-center gap-3 rounded-md px-4 py-3">
                      <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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
                      <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-muted-foreground hover:text-foreground flex-shrink-0"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 rounded-none border-white/15 bg-transparent accent-white"
                      />
                      <span>
                        I have read and agree to the{" "}
                        <span className="underline text-foreground">
                          Disclaimer
                        </span>
                        .
                      </span>
                    </label>

                    {!isLogin && error ? (
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    ) : null}

                    {successMessage && !isLogin ? (
                      <p className="text-green-400 text-sm text-center">{successMessage}</p>
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
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <button
                    onClick={handleGoogleAuth}
                    className="unimath-pill flex w-full items-center justify-center gap-2 rounded-sm py-3 text-sm font-medium text-foreground transition-all duration-200 hover:bg-accent/70"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Join with Google
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
