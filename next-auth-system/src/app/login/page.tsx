"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleButton } from "@/components/google-button";
import { Mail, Lock, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-4">
        <div className="text-gray-400 text-sm animate-pulse">Initializing login portal...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const oauthError = searchParams.get("error");

  const [error, setError] = useState(
    oauthError === "OAuthAccountNotLinked"
      ? "An account with this email already exists using another sign-in method. Please sign in using your existing credentials."
      : oauthError
      ? "Authentication failed. Please try again."
      : ""
  );
  const [success, setSuccess] = useState(
    verified ? "Your email has been verified successfully! You can now log in." : ""
  );
  const [loading, setLoading] = useState(false);

  // Email form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Handle Email + Password sign-in
   */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await signIn("email-password", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Cosmic Background Glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg mb-4">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1">Access your secure dashboard portal</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl flex items-center gap-3 animate-pulse">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-xl flex items-center gap-3">
            <ShieldCheck size={18} className="flex-shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Form Contents */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-400 hover:underline hover:text-blue-300"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? "Authenticating Session..." : "Sign In to Terminal"}
          </button>
        </form>

        {/* Separator / Google Login */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative px-3 bg-[#070b13] text-xs text-gray-500 uppercase tracking-widest">
            or connection
          </span>
        </div>

        <GoogleButton />

        {/* Footer Navigation */}
        <div className="mt-8 text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-400 hover:underline hover:text-blue-300 font-semibold"
          >
            Create Credentials Account
          </Link>
        </div>
      </div>
    </div>
  );
}
