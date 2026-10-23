import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold text-zinc-500 hover:text-indigo-600 flex items-center gap-1.5 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Terms of Service — {APP_NAME}
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Effective Date: October 2026</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">1. Student Eligibility & Verification</h2>
          <p>
            {APP_NAME} is exclusively intended for currently enrolled students, university faculty, and campus affiliates. Every registrant must verify an approved college email address ending in an authorized institutional domain (.edu). Impersonation of students is strictly prohibited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">2. Peer-to-Peer Campus Marketplace</h2>
          <p>
            {APP_NAME} functions as a direct venue connecting collegiate buyers and sellers. Users are responsible for accurately describing product conditions, setting honest prices, and arranging safe, lawful exchanges on campus.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">3. Auction Integrity & Bidding Rules</h2>
          <p>
            Bids placed on active auctions are binding commitments to purchase if you are the winning bidder. Bidders cannot retract bids once submitted. Sellers cannot bid on their own listings. If a bid arrives in the final 2 minutes of an auction, anti-sniping protection automatically extends the closing time by 3 minutes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">4. Prohibited Merchandise & Code of Conduct</h2>
          <p>
            Users agree not to list counterfeit goods, academic cheating or exam compromise materials, hazardous substances, stolen campus property, or illegal contraband. Violations will result in listing removal and account debarment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">5. Limitation of Liability</h2>
          <p>
            {APP_NAME} is an intermediary communications and discovery service. Students conduct personal physical transactions at their own discretion and should adhere to campus safety guidelines.
          </p>
        </section>
      </div>
    </div>
  );
}
