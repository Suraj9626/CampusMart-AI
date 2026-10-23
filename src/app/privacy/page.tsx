import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold text-zinc-500 hover:text-indigo-600 flex items-center gap-1.5 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Student Privacy Policy — {APP_NAME}
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Effective Date: October 2026</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">1. Protection of Personal Contact Information</h2>
          <p>
            Your privacy and safety are paramount. {APP_NAME} does not display personal telephone numbers, personal emails, or private residential addresses on public product cards or profiles. Communication is mediated through on-platform private messaging.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">2. Information We Collect</h2>
          <p>
            We collect the student information provided during onboarding: preferred display name, verified college email address (.edu), academic department, and academic year. When you create listings, we store the title, description, uploaded images, and suggested campus pickup zone.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">3. Participant-Only Message Access</h2>
          <p>
            Direct conversations regarding listings are strictly restricted to the participating buyer and seller through Row-Level Security (RLS) policies. Messages are not publicly viewable or shared with third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">4. Artificial Intelligence & Third-Party Services</h2>
          <p>
            Our conversational assistant utilizes the Google Gemini API. When you interact with the assistant, only your specific query context is transmitted to generate a response. Private student messages and user credentials are never shared with AI models.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">5. Account Deletion & Data Retention</h2>
          <p>
            Students may request deactivation or deletion of their account at any time via the Settings page. Upon deletion, active listings and public profile visibility are removed from the marketplace.
          </p>
        </section>
      </div>
    </div>
  );
}
