"use client";

import React from "react";
import Link from "next/link";
import { Bell, CheckCheck, ShieldCheck, ArrowRight, Clock } from "lucide-react";
import { useNotifications } from "@/lib/notifications-context";
import { useAuth } from "@/lib/auth-context";
import { formatRelativeTime } from "@/lib/utils";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold">Please log in to view notifications.</h2>
        <Link href="/auth/login" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-600" />
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time updates on your bids, auction results, messages, and listings
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition"
          >
            <CheckCheck className="w-4 h-4 text-indigo-600" />
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-3">
          <Bell className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">No notifications</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You're all caught up! When you place bids or receive messages, you'll be alerted here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-sm">
          {notifications.map(n => (
            <Link
              key={n.id}
              href={n.link || "/dashboard"}
              onClick={() => markAsRead(n.id)}
              className={`p-5 flex items-start justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-950/60 transition ${
                !n.is_read ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  !n.is_read ? "bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950" : "bg-transparent"
                }`} />
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                    {n.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(n.created_at)}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
