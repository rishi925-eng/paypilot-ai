"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Store,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../lib/auth";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    quickLogin,
    isLoading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "MERCHANT">("CUSTOMER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape & lock body scroll
  React.useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsAuthModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isAuthModalOpen, setIsAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (authModalMode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsAuthModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Glow Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-brand-500 to-emerald-400" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Bar with Title and Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-brand-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                {authModalMode === "login" ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  {authModalMode === "login" ? "Sign In to PayPilot" : "Create an Account"}
                </h3>
                <p className="text-xs text-slate-400">
                  {authModalMode === "login"
                    ? "Access your saved cart, orders & merchant tools"
                    : "Join the next-generation autonomous commerce platform"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthModalMode("login")}
              className={`py-2 rounded-xl transition-all ${
                authModalMode === "login"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthModalMode("register")}
              className={`py-2 rounded-xl transition-all ${
                authModalMode === "register"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* 1-Click Demo Profiles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-0.5">
              <span className="flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1" />
                Quick 1-Click Demo Logins:
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">No password needed</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickLogin("customer")}
                className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-300 group-hover:text-cyan-400 font-bold mb-1">
                  <span className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" /> Alex Customer
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded">Shopper</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1">Cart, Wishlist & Orders</p>
              </button>

              <button
                type="button"
                onClick={() => quickLogin("merchant")}
                className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-300 group-hover:text-amber-400 font-bold mb-1">
                  <span className="flex items-center">
                    <Store className="w-3.5 h-3.5 mr-1" /> Rishi Merchant
                  </span>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1 py-0.5 rounded">Admin</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1">AG Grid Operations Hub</p>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Or with your credentials
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {authModalMode === "register" && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Customer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {authModalMode === "register" && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("CUSTOMER")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      role === "CUSTOMER"
                        ? "bg-cyan-950/60 border-cyan-500 text-cyan-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("MERCHANT")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      role === "MERCHANT"
                        ? "bg-amber-950/60 border-amber-500 text-amber-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Merchant</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 via-cyan-600 to-brand-500 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{authModalMode === "login" ? "Sign In" : "Complete Registration"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-400">
            Want the full page view?{" "}
            <Link
              href={authModalMode === "login" ? "/login" : "/signup"}
              onClick={() => setIsAuthModalOpen(false)}
              className="text-cyan-400 font-bold hover:underline"
            >
              Open dedicated {authModalMode === "login" ? "Login" : "Sign Up"} landing page →
            </Link>
          </div>

          {/* Footer security note */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Session Tokens • Role-Based Access Control</span>
          </div>
        </div>
      </div>
    </div>
  );
}
