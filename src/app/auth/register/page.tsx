"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Lock, Mail, User, GraduationCap, Building, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { COLLEGE_DEPARTMENTS, ACADEMIC_YEARS, APP_NAME, parseSjcemStudentEmail } from "@/lib/constants";
import { Profile } from "@/types/database";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState<string>(COLLEGE_DEPARTMENTS[0]);
  const [academicYear, setAcademicYear] = useState<Profile['academic_year']>("Freshman");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const sjcem = parseSjcemStudentEmail(cleanEmail);
    if (!sjcem.isValid || !sjcem.expectedPin) {
      setErrorMessage("Registration is restricted to college emails in the format 125[name][4-digit]@sjcem.edu.in (e.g. 125suraj6041@sjcem.edu.in).");
      return;
    }

    if (cleanPassword !== sjcem.expectedPin) {
      setErrorMessage(`Password must be the exact 4-digit number from your college email (${sjcem.expectedPin}).`);
      return;
    }

    if (cleanPassword !== confirmPassword.trim()) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("You must accept the platform terms and privacy policy.");
      return;
    }

    setLoading(true);
    const res = await register({
      displayName: displayName.trim(),
      email: cleanEmail,
      password: cleanPassword,
      department,
      academicYear,
    });
    setLoading(false);

    if (res.success) {
      // Direct student to login page with pre-filled email and database saved banner
      router.push(`/auth/login?registered=true&email=${encodeURIComponent(cleanEmail)}`);
    } else {
      setErrorMessage(res.error || "Registration failed. Please check your information.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 shadow-2xl border border-zinc-200/80 dark:border-white/10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/25">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="font-heading text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs text-zinc-500">
            Exclusive registration for 125...[4-digit]@sjcem.edu.in college students
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Full Name or Display Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              College Email (@sjcem.edu.in) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="125suraj6041@sjcem.edu.in"
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-indigo-500"
                required
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Must be formatted like 125[name][4-digit]@sjcem.edu.in</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 outline-none cursor-pointer"
              >
                {COLLEGE_DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value as any)}
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 outline-none cursor-pointer"
              >
                {ACADEMIC_YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                4-Digit PIN Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  maxLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. 6041"
                  className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Confirm 4-Digit PIN *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="e.g. 6041"
                  className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            Note: Your password must be the exact 4-digit number at the end of your college email (e.g. 6041).
          </p>

          <label className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              I agree to the <Link href="/terms" className="text-indigo-600 underline">Terms of Use</Link> and <Link href="/privacy" className="text-indigo-600 underline">Privacy Policy</Link>, and certify I am a current college student or affiliate.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-102 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Saving to Database..." : "Register Student Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-500">
          Already registered?{" "}
          <Link href="/auth/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
