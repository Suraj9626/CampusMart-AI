"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, ShieldCheck, ArrowRight, Clock, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/store/marketplace-store";
import { Conversation } from "@/types/database";
import { formatRelativeTime } from "@/lib/utils";

export default function MessagesInboxPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      const data = await marketplaceStore.getConversations(user.id);
      setConversations(data);
      setLoading(false);
    }
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold">Please Log In</h2>
        <p className="text-zinc-500 text-xs mt-1 mb-4">You must be logged in to view your messages.</p>
        <Link href="/auth/login" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Private Messages
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Direct, participant-only communications for campus item handoffs & questions
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Encrypted On-Platform</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-400">Loading inbox...</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">No Conversations Yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            When you contact a seller or a student messages you about one of your items, the conversation will appear here.
          </p>
          <Link
            href="/marketplace"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-sm">
          {conversations.map(conv => {
            const isSeller = conv.seller_id === user.id;
            const otherUser = isSeller ? conv.buyer : conv.seller;

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="p-5 flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Listing Thumbnail */}
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                    <img
                      src={conv.listing?.images[0]?.url || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=250&q=80"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Conversation Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                        {otherUser?.display_name || "Student"}
                      </h3>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        • {isSeller ? "Buyer" : "Seller"}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                      {conv.listing?.title}
                    </p>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">
                      {conv.last_message_preview || "Conversation started"}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-zinc-400 block mb-1">
                    {formatRelativeTime(conv.last_activity_at)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Chat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
