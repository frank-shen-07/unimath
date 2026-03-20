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
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "#161625" }}
    >
      {/* Home button */}
      <Link
        href="/"
        className="fixed top-6 left-6 w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors z-50"
        style={{ background: "#1e1e30" }}
      >
        <Home className="w-5 h-5" />
      </Link>

      {/* Main container */}
      <div
        className="w-full max-w-[900px] min-h-[520px] rounded-2xl overflow-hidden flex relative"
        style={{
          background: "#1e1e30",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
      >
        <AnimatePresence mode="wait" custom={isLogin}>
          {isLogin ? (
            <motion.div
              key="login-layout"
              className="flex w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Left CTA panel */}
              <motion.div
                className="flex-1 flex flex-col items-center justify-center p-10"
                custom={isLogin}
                variants={ctaVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <h2 className="text-2xl font-semibold text-white mb-6">
                  Don&apos;t have an account?
                </h2>
                <button
                  onClick={switchMode}
                  className="w-full max-w-[280px] py-3 rounded-lg text-white font-semibold text-base transition-all duration-200 hover:opacity-90"
                  style={{ background: "#6c5ce7" }}
                >
                  Register
                </button>
              </motion.div>

              {/* Right Login form */}
              <motion.div
                className="flex-1 p-10 flex flex-col justify-center"
                style={{ background: "#252540", borderRadius: "0 16px 16px 0" }}
                custom={isLogin}
                variants={formCardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="text-center mb-8">
                  <p className="text-gray-300 text-lg mb-1">Welcome to</p>
                  <h1 className="text-3xl font-bold" style={{ color: "#6c5ce7" }}>
                    UniMath
                  </h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-lg"
                    style={{ background: "#2f2f4a" }}
                  >
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 block">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        required
                        className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-lg"
                    style={{ background: "#2f2f4a" }}
                  >
                    <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 block">Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-300 flex-shrink-0"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Remember me + Forgot password */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-gray-500 bg-transparent accent-[#6c5ce7]"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      className="font-medium hover:underline"
                      style={{ color: "#6c5ce7" }}
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

                  {/* Login button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg text-white font-semibold text-base transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                    style={{ background: "#6c5ce7" }}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px" style={{ background: "#3a3a55" }} />
                  <span className="text-gray-500 text-sm">or</span>
                  <div className="flex-1 h-px" style={{ background: "#3a3a55" }} />
                </div>

                {/* Google button */}
                <button
                  onClick={handleGoogleAuth}
                  className="w-full py-3 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
                  style={{ background: "#2f2f4a", border: "1px solid #3a3a55" }}
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
              className="flex w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Left Register form */}
              <motion.div
                className="flex-1 p-10 flex flex-col justify-center"
                style={{ background: "#252540", borderRadius: "16px 0 0 16px" }}
                custom={isLogin}
                variants={formCardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="text-center mb-6">
                  <p className="text-gray-300 text-lg mb-1">Welcome to</p>
                  <h1 className="text-3xl font-bold" style={{ color: "#6c5ce7" }}>
                    UniMath
                  </h1>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">
                  {/* Email */}
                  <div
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
                    style={{ background: "#2f2f4a" }}
                  >
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 block">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        required
                        className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Display name */}
                  <div
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
                    style={{ background: "#2f2f4a" }}
                  >
                    <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 block">Display name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your Name"
                        required
                        className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
                    style={{ background: "#2f2f4a" }}
                  >
                    <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 block">Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
                    style={{ background: "#2f2f4a" }}
                  >
                    <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 block">Confirm password</label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-300 flex-shrink-0"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-2 text-sm text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 rounded border-gray-500 bg-transparent accent-[#6c5ce7]"
                    />
                    <span>
                      I have read and agree to the{" "}
                      <span className="underline" style={{ color: "#6c5ce7" }}>
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

                  {/* Register button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg text-white font-semibold text-base transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                    style={{ background: "#6c5ce7" }}
                  >
                    {loading ? "Creating account..." : "Register"}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px" style={{ background: "#3a3a55" }} />
                  <span className="text-gray-500 text-sm">or</span>
                  <div className="flex-1 h-px" style={{ background: "#3a3a55" }} />
                </div>

                {/* Google button */}
                <button
                  onClick={handleGoogleAuth}
                  className="w-full py-3 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
                  style={{ background: "#2f2f4a", border: "1px solid #3a3a55" }}
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

              {/* Right CTA panel */}
              <motion.div
                className="flex-1 flex flex-col items-center justify-center p-10"
                custom={isLogin}
                variants={ctaVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <h2 className="text-2xl font-semibold text-white mb-6">
                  Already have an account?
                </h2>
                <button
                  onClick={switchMode}
                  className="w-full max-w-[280px] py-3 rounded-lg text-white font-semibold text-base transition-all duration-200 hover:opacity-90"
                  style={{ background: "#6c5ce7" }}
                >
                  Login
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
