"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Eye, 
  Gavel, 
  Users, 
  Tag, 
  ArrowLeft,
  FileText
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/store/marketplace-store";
import { Report, Listing } from "@/types/database";
import { DEFAULT_APPROVED_DOMAINS } from "@/lib/constants";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    const repData = await marketplaceStore.getReports();
    const listData = await marketplaceStore.getListings({ status: undefined });
    setReports([...repData]);
    setListings([...listData]);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "moderator") {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Privileges Required</h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Access to moderation queues, abuse reports, and platform administration is restricted to authorized campus staff.
        </p>
        <Link href="/" className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const handleResolve = async (reportId: string, status: 'reviewed' | 'dismissed' | 'action_taken', action: string) => {
    const notes = actionNotes[reportId] || "Moderation action taken by campus administrator.";
    const ok = await marketplaceStore.resolveReport(reportId, status, notes, action);
    if (ok) {
      setActionStatus(`Report resolved: ${action}`);
      setTimeout(() => setActionStatus(null), 3000);
      loadAdminData();
    }
  };

  const pendingReports = reports.filter(r => r.status === "pending");
  const activeAuctions = listings.filter(l => l.sale_mode === "auction" && l.status === "active");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-purple-600" />
            Administrative Moderation Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Platform moderation, incident review, prohibited item enforcement, and college domain management
          </p>
        </div>

        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-xs rounded-full border border-purple-200 dark:border-purple-800 self-start sm:self-center">
          Moderator Role: {user.display_name}
        </span>
      </div>

      {actionStatus && (
        <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Listings</span>
            <Tag className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-zinc-900 dark:text-white">{listings.length}</p>
          <span className="text-[11px] text-zinc-400">Across campus categories</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Auctions</span>
            <Gavel className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{activeAuctions.length}</p>
          <span className="text-[11px] text-zinc-400">Protected by anti-sniping</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Reports</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400">{pendingReports.length}</p>
          <span className="text-[11px] text-zinc-400">Awaiting moderator action</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved Domains</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{DEFAULT_APPROVED_DOMAINS.length}</p>
          <span className="text-[11px] text-zinc-400">Verified academic institutions</span>
        </div>
      </div>

      {/* Reports Queue */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Safety & Abuse Reports Queue ({reports.length})
            </h2>
            <p className="text-xs text-zinc-500">Student-submitted reports regarding listings or conduct</p>
          </div>
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-zinc-400 py-6 text-center">No reports recorded.</p>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {reports.map(rep => (
              <div key={rep.id} className="py-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase bg-rose-100 text-rose-700">
                      Reason: {rep.reason.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      rep.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {rep.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Reported on {new Date(rep.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                  <p><strong>Description:</strong> {rep.description}</p>
                  {rep.reported_listing_id && (
                    <p className="text-indigo-600 dark:text-indigo-400">
                      <strong>Target Listing ID:</strong> {rep.reported_listing_id}
                    </p>
                  )}
                  {rep.moderator_notes && (
                    <p className="text-zinc-400 italic">
                      Moderator note: "{rep.moderator_notes}" ({rep.action_taken})
                    </p>
                  )}
                </div>

                {rep.status === "pending" && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Optional moderator notes..."
                      value={actionNotes[rep.id] || ""}
                      onChange={(e) => setActionNotes({ ...actionNotes, [rep.id]: e.target.value })}
                      className="text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 flex-1 min-w-[200px]"
                    />
                    <button
                      onClick={() => handleResolve(rep.id, "action_taken", "remove_listing")}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-sm"
                    >
                      Remove Listing
                    </button>
                    <button
                      onClick={() => handleResolve(rep.id, "action_taken", "warn_user")}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Issue Warning
                    </button>
                    <button
                      onClick={() => handleResolve(rep.id, "dismissed", "dismiss_report")}
                      className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-200"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved College Domains Configuration */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          Configured Approved College Email Domains
        </h2>
        <p className="text-xs text-zinc-500">
          Only students registering with addresses from these configured domains are permitted into CampusMart AI.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {DEFAULT_APPROVED_DOMAINS.map(dom => (
            <span
              key={dom}
              className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-xl font-medium"
            >
              @{dom}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
