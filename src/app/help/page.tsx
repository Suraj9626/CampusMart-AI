"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, Mail, MessageSquare, Bot, CheckCircle, ArrowLeft, ChevronDown } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const FAQS = [
  {
    q: "How does college email verification work?",
    a: "CampusMart AI restricts access to verified university students. During registration, you must provide an institutional address ending in an approved domain (e.g., .edu). You will receive a verification link before you can list items or place bids."
  },
  {
    q: "How does the auction system and anti-sniping work?",
    a: "Sellers choose a starting bid and optional reserve price. Bidding is competitive and atomic. To prevent bot sniping in the final seconds, any valid bid submitted within the last 2 minutes automatically extends the auction clock by an additional 3 minutes."
  },
  {
    q: "What happens if an auction's reserve price isn't met?",
    a: "A reserve price is a seller's secret minimum threshold. If the auction clock expires and the highest bid is below the reserve price, the auction closes as 'ended' without an awarded buyer, and no transaction is required."
  },
  {
    q: "How do fixed-price purchases work?",
    a: "When you click 'Request to Buy / Reserve Item', a formal reservation request is sent to the seller with your proposed pickup schedule. Once the seller confirms, you meet in person on campus to inspect the item and finalize the handoff."
  },
  {
    q: "Where should I meet students to exchange items?",
    a: "Always meet in designated public, daylight areas such as the Main Library Lobby, Student Union / Activity Center, Dining Hall Courtyard, or Campus Police Safe Exchange Zones."
  }
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setContactName("");
      setContactEmail("");
      setContactMsg("");
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      
      {/* Header */}
      <div>
        <Link href="/" className="text-xs font-semibold text-zinc-500 hover:text-indigo-600 flex items-center gap-1.5 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-indigo-600" />
          Help & Student Support Center
        </h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-xl">
          Everything you need to know about buying, selling, live auctions, and campus safety on {APP_NAME}.
        </p>
      </div>

      {/* AI Assistant Help Callout */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-200" />
            <h3 className="font-bold text-lg">Instant AI Answers Available 24/7</h3>
          </div>
          <p className="text-xs text-indigo-100 max-w-md leading-relaxed">
            Have questions right now? Click the floating "Ask CampusMart AI" button at the bottom-right of your screen for real-time guidance powered by Gemini.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Frequently Asked Questions
        </h2>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-sm">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="p-5">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-semibold text-sm text-zinc-900 dark:text-white gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${openFaq === idx ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>
              {openFaq === idx && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2.5 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Moderator Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Contact Campus Support / Moderators
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Need help resolving an issue or reporting an urgent campus safety concern?
          </p>
        </div>

        {sentSuccess && (
          <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Support inquiry received. A campus moderator will review your message.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Your Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Student Name"
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">College Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Message / Question</label>
            <textarea
              value={contactMsg}
              onChange={(e) => setContactMsg(e.target.value)}
              placeholder="Describe your question or issue in detail..."
              rows={4}
              className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Submit Support Inquiry
          </button>
        </form>
      </div>

    </div>
  );
}
