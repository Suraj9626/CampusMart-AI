"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Shield, Bell, Trash2, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user, resetPassword, logout } = useAuth();
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold">Please log in to view settings.</h2>
        <Link href="/auth/login" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  const handlePasswordReset = async () => {
    const res = await resetPassword(user.college_email);
    setResetSuccess(res.message);
    setTimeout(() => setResetSuccess(null), 4000);
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your student account? This will deactivate your listings.")) {
      logout();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/dashboard" className="text-xs font-semibold text-zinc-500 hover:text-indigo-600 flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <span className="text-xs text-zinc-400">Security & Account</span>
      </div>

      <div className="space-y-6">
        
        {/* Password & Security Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-500" />
            Password & Authentication
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Your login credentials are protected using secure hashed authentication.
          </p>

          {resetSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{resetSuccess}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handlePasswordReset}
              className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition"
            >
              Send Password Reset Link to {user.college_email}
            </button>
          </div>
        </div>

        {/* Verification Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 space-y-3 shadow-sm">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            Student Academic Verification
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Your account is verified under domain: <strong>{user.college_email.split('@')[1]}</strong>.
          </p>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Eligible for marketplace transactions, live bidding, and private messaging.</span>
          </div>
        </div>

        {/* Danger Zone Card */}
        <div className="bg-rose-50/40 dark:bg-rose-950/20 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-6 space-y-4">
          <h2 className="text-base font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Danger Zone
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Permanently close your student account or log out of all active sessions.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={logout}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold hover:bg-zinc-300"
            >
              Log Out
            </button>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 shadow-sm"
            >
              Deactivate Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
