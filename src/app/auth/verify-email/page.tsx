"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, pendingVerificationEmail, resendVerification } = useAuth();
  const [resent, setResent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const emailToDisplay = pendingVerificationEmail || user?.college_email || "your college address";

  const handleResend = async () => {
    await resendVerification(emailToDisplay);
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  const handleSimulateConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      router.push("/marketplace");
    }, 1200);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 shadow-xl text-center space-y-6">
        
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto shadow-inner">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
            Verify Your College Email
          </h1>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
            We dispatched a confirmation link to <strong className="text-indigo-600 dark:text-indigo-400">{emailToDisplay}</strong>.
          </p>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 text-left space-y-2">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Why do we verify?
          </p>
          <p className="text-[11px] leading-relaxed">
            CampusMart AI is an exclusive network. Email verification prevents external scammers and ensures all participants are verified college peers.
          </p>
        </div>

        {resent && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verification email re-dispatched!</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handleSimulateConfirm}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
          >
            {confirmed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified! Redirecting to Marketplace...</span>
              </>
            ) : (
              <>
                <span>I've Verified My Email (Continue)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            onClick={handleResend}
            className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resend Verification Link
          </button>
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
          <Link href="/auth/login" className="hover:text-zinc-600">
            Sign In with different account
          </Link>
        </div>

      </div>
    </div>
  );
}
