"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  User,
  Store,
  CheckCircle2,
  Zap,
  Globe,
  Bot,
  Layers,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../lib/toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { user, login, quickLogin, isLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (!email) return;

    setError(null);
    setSubmitting(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        if (email.includes("merchant") && redirectUrl === "/") {
          router.push("/dashboard");
        } else {
          router.push(redirectUrl);
        }
      } else {
        setError("Invalid email or password. You can also use the 1-Click Demo buttons below.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: "customer" | "merchant") => {
    setError(null);
    setSubmitting(true);
    try {
      await quickLogin(role);
      if (role === "merchant" && redirectUrl === "/") {
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
        
        {/* ── Left Hero Brand Showcase (Desktop) ────────────────────────── */}
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
              <span>Autonomous Commerce & PayPal Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Sign In to <br />
              <span className="bg-gradient-to-r from-cyan-400 via-brand-400 to-indigo-400 bg-clip-text text-transparent">
                PayPilot AI Hub
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Access your personal shopping cart, track real-time PayPal sandbox captures, and command merchant operations with enterprise AG Grid telemetry.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Autonomous Agentic Shopping Copilot</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Natural language budget evaluation, auto Honey coupon savings, and cross-border Xoom quotes.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Zero-Trust Fraud &amp; Simility AI Risk Guard</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Server-authoritative price verification, bot mitigation, and Braintree 3DS2 liability shift.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">High-Speed AG Grid Merchant Operations Hub</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Interactive catalogue telemetry, Zettle POS sync, live webhook simulator, and financial ledger.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-500 pt-2">
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> 256-bit TLS Encryption
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> PayPal Sandbox Verified
            </span>
          </div>
        </div>

        {/* ── Right Login Form Card ────────────────────────────────────── */}
        <div className="lg:col-span-6">
          <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-brand-500 to-indigo-500 rounded-t-3xl" />

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials or choose a quick 1-click test role below.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* 1-Click Interactive Demo Logins */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-0.5">
                <span className="flex items-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 mr-1" />
                  Instant 1-Click Demo Profiles:
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">No typing needed</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo("customer")}
                  disabled={submitting || isLoading}
                  className="p-3 bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl text-left transition-all group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between text-slate-300 group-hover:text-cyan-400 font-bold mb-1">
                    <span className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1" /> Alex Customer
                    </span>
                    <span className="text-[9px] text-emerald-400 bg-emerald-950/80 px-1 py-0.5 rounded font-mono">Shopper</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Cart, Wishlist &amp; Order Receipts</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo("merchant")}
                  disabled={submitting || isLoading}
                  className="p-3 bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-left transition-all group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between text-slate-300 group-hover:text-amber-400 font-bold mb-1">
                    <span className="flex items-center">
                      <Store className="w-3.5 h-3.5 mr-1" /> Rishi Merchant
                    </span>
                    <span className="text-[9px] text-amber-400 bg-amber-950/80 px-1 py-0.5 rounded font-mono">Admin</span>
                  </div>
                  <p className="text-[10px] text-slate-500">AG Grid Operations Hub</p>
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Or Sign In with Email
              </span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-semibold">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-500">(Optional for demo users)</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer disabled:opacity-50 text-xs"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Switch to Sign Up */}
            <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/signup"
                className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                Create an Account →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
