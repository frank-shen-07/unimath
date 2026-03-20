"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

  const formCardVariants = {
    enter: (isLoginMode: boolean) => ({
      x: isLoginMode ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (isLoginMode: boolean) => ({
      x: isLoginMode ? -100 : 100,
      opacity: 0,
    }),
  };

  const ctaVariants = {
    enter: (isLoginMode: boolean) => ({
      x: isLoginMode ? -100 : 100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (isLoginMode: boolean) => ({
      x: isLoginMode ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(124,92,255,0.18),transparent_32%),linear-gradient(180deg,#0c0d15_0%,#090a11_100%)] px-4 py-8">
      <Link
        href="/"
        className="fixed left-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition-colors hover:text-white"
      >
        <Home className="w-5 h-5" />
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_32px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-[1.1fr,0.9fr]">
          <div className="relative overflow-hidden border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-12">
            <div className="absolute inset-0 editorial-grid opacity-[0.05]" />
            <div className="relative max-w-xl space-y-8">
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.34em] text-white/38">AI Math Tutor</p>
                <h1 className="font-serif text-6xl leading-none tracking-[-0.05em] text-white sm:text-7xl">
                  Study maths in a darker, calmer workspace.
                </h1>
                <p className="max-w-lg text-sm leading-7 text-white/58 sm:text-base">
                  UniMath combines tutoring chat, photo solve, practice, formula sheets, topic maps, and flashcards in one editorial study environment.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Tutor", "Step-by-step help"],
                  ["Maps", "Visualize topic practice"],
                  ["Flashcards", "Generate and review decks"],
                ].map(([label, detail]) => (
                  <div key={label} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                    <p className="font-serif text-2xl leading-none text-white">{label}</p>
                    <p className="mt-2 text-sm text-white/45">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                  {isLogin ? "New here?" : "Already have an account?"}
                </p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-serif text-3xl leading-none tracking-[-0.04em] text-white">
                      {isLogin ? "Create your workspace" : "Jump back in"}
                    </p>
                    <p className="mt-2 text-sm text-white/48">
                      {isLogin
                        ? "Sign up with email or Google and your study history syncs to Supabase."
                        : "Use your email/password login or continue with Google."}
                    </p>
                  </div>
                  <button
                    onClick={switchMode}
                    className="rounded-full border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                  >
                    {isLogin ? "Register" : "Login"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
        <AnimatePresence mode="wait" custom={isLogin}>
          {isLogin ? (
            <motion.div
              key="login-layout"
              className="flex h-full"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                className="flex-1 rounded-[1.75rem] border border-white/10 bg-[#11131d] p-6 sm:p-8"
                custom={isLogin}
                variants={ctaVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="mb-8">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/38">Welcome back</p>
                  <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-white">
                    Login
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-white/52">
                    Continue your tutoring chats, formula sheets, and saved decks.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div
                    className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <Mail className="w-5 h-5 text-white/35 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-xs text-white/35">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        required
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <Lock className="w-5 h-5 text-white/35 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-xs text-white/35">Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/35 hover:text-white/70 flex-shrink-0"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-white/45">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/15 bg-transparent accent-white"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      className="font-medium text-white/55 hover:text-white"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  )}

                  {successMessage && (
                    <p className="text-green-400 text-sm text-center">{successMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-white py-3 text-base font-semibold text-black transition-all duration-200 hover:bg-white/90 disabled:opacity-60"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-sm text-white/28">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                  onClick={handleGoogleAuth}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.08]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="register-layout"
              className="flex h-full"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                className="flex-1 rounded-[1.75rem] border border-white/10 bg-[#11131d] p-6 sm:p-8"
                custom={isLogin}
                variants={formCardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="mb-6">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/38">Create account</p>
                  <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-white">
                    Register
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-white/52">
                    Save your conversations, notes, knowledge map progress, and flashcard decks.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div
                    className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <Mail className="w-5 h-5 text-white/35 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-xs text-white/35">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        required
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <User className="w-5 h-5 text-white/35 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-xs text-white/35">Display name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your Name"
                        required
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <Lock className="w-5 h-5 text-white/35 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-xs text-white/35">Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <Lock className="w-5 h-5 text-white/35 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-xs text-white/35">Confirm password</label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-white/35 hover:text-white/70 flex-shrink-0"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <label className="flex cursor-pointer items-start gap-2 text-sm text-white/45">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 rounded border-white/15 bg-transparent accent-white"
                    />
                    <span>
                      I have read and agree to the{" "}
                      <span className="underline text-white">
                        Disclaimer
                      </span>
                      .
                    </span>
                  </label>

                  {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  )}

                  {successMessage && (
                    <p className="text-green-400 text-sm text-center">{successMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-white py-3 text-base font-semibold text-black transition-all duration-200 hover:bg-white/90 disabled:opacity-60"
                  >
                    {loading ? "Creating account..." : "Register"}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-sm text-white/28">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                  onClick={handleGoogleAuth}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.08]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Join with Google
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
