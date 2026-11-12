"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Store,
  CheckCircle2,
  Bot,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../lib/toast";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { user, register, quickLogin, isLoading } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "MERCHANT">("CUSTOMER");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === "MERCHANT" && redirectUrl === "/") {
        router.push("/dashboard");
      } else {
        router.push(redirectUrl);
      }
    }
  }, [user, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setError(null);
    setSubmitting(true);
    try {
      const ok = await register(name, email, password, role);
      if (ok) {
        if (role === "MERCHANT" && redirectUrl === "/") {
          router.push("/dashboard");
        } else {
          router.push(redirectUrl);
        }
      } else {
        setError("Could not complete registration. Please check the details or try another email.");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoRole: "customer" | "merchant") => {
    setError(null);
    setSubmitting(true);
    try {
      await quickLogin(demoRole);
      if (demoRole === "merchant" && redirectUrl === "/") {
        router.push("/dashboard");
      } else {
        router.push(redirectUrl);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* ── Left Hero Brand Showcase ──────────────────────────────────── */}
        <div className="lg:col-span-6 space-y-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Storefront</span>
          </Link>

          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Join 100% Free • Instant Sandbox Setup</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Create Your <br />
              <span className="bg-gradient-to-r from-cyan-400 via-brand-400 to-indigo-400 bg-clip-text text-transparent">
                PayPilot Account
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Experience autonomous shopping with AI negotiation, Honey automated coupon matching, and PayPal developer platform tools.
            </p>
          </div>

          {/* Value Props List */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Shoppers &amp; Consumers</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Personalized AI deals, Venmo 50/50 split requests, and live PayPal Pay in 4 installment calculations.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Merchants &amp; Developers</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  High-density AG Grid inventory controls, real-time revenue telemetry, and PayPal webhook simulators.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Cryptographic Security</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  SHA-256 hashed credentials, bearer session tokenization, and strict role-based access control.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-500 pt-2">
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> No Credit Card Required
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Instant Activation
            </span>
          </div>
        </div>

        {/* ── Right Registration Form Card ──────────────────────────────── */}
        <div className="lg:col-span-6">
          <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-500 to-brand-500 rounded-t-3xl" />

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Create Free Account
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose your role and register in under 30 seconds.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* Quick Demo Pre-fills */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 mr-1" />
                  Testing for Hackathon Judging?
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">1-Click Login</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo("customer")}
                  disabled={submitting || isLoading}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-left font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <span className="text-cyan-400 mr-1">👤</span> Alex Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo("merchant")}
                  disabled={submitting || isLoading}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <span className="text-amber-400 mr-1">🏪</span> Rishi Merchant
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* Account Role Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("CUSTOMER")}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      role === "CUSTOMER"
                        ? "bg-cyan-950/70 border-cyan-500 text-white shadow-lg shadow-cyan-500/15"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold mb-0.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Customer</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Shopping &amp; Payments</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("MERCHANT")}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      role === "MERCHANT"
                        ? "bg-amber-950/70 border-amber-500 text-white shadow-lg shadow-amber-500/15"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold mb-0.5">
                      <Store className="w-3.5 h-3.5 text-amber-400" />
                      <span>Merchant</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Operations Hub Access</p>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Tech"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 6 characters)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 via-cyan-600 to-brand-600 hover:from-emerald-400 hover:to-brand-500 shadow-xl shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer disabled:opacity-50 text-xs"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Switch to Sign In */}
            <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                Sign In to Account →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
