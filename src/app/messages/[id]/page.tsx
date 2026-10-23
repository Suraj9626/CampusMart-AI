"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Send, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink,
  Lock,
  User
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/store/marketplace-store";
import { Conversation, Message } from "@/types/database";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";
import { CONTACT_LEAK_REGEX } from "@/lib/constants";

function ConversationDetailContent() {
  const params = useParams();
  const router = useRouter();
  const convId = params?.id as string;
  const { user } = useAuth();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [contactWarning, setContactWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadConv() {
      if (!user || !convId) return;
      setLoading(true);
      const conv = await marketplaceStore.getConversationById(convId, user.id);
      if (conv) {
        setConversation(conv);
        const msgs = await marketplaceStore.getMessages(convId, user.id);
        setMessages(msgs);
      }
      setLoading(false);
    }
    loadConv();
  }, [convId, user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check text for contact leakage warning
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    CONTACT_LEAK_REGEX.lastIndex = 0;
    if (CONTACT_LEAK_REGEX.test(val)) {
      setContactWarning(true);
    } else {
      setContactWarning(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inputText.trim() || !conversation) return;

    const content = inputText.trim();
    setInputText("");
    setContactWarning(false);

    const sent = await marketplaceStore.sendMessage(conversation.id, user.id, content);
    if (sent) {
      setMessages(prev => [...prev, sent]);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold">Please log in to view conversation.</h2>
      </div>
    );
  }

  if (loading) {
    return <div className="p-16 text-center text-xs text-zinc-400">Loading conversation...</div>;
  }

  if (!conversation) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-3">
        <Lock className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Private Conversation Restricted</h2>
        <p className="text-xs text-zinc-500">
          This message thread is only accessible by the buyer and seller of this listing.
        </p>
        <Link href="/messages" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Return to Inbox
        </Link>
      </div>
    );
  }

  const isSeller = conversation.seller_id === user.id;
  const otherUser = isSeller ? conversation.buyer : conversation.seller;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/messages"
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Product Thumbnail */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
            <img
              src={conversation.listing?.images[0]?.url || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=250&q=80"}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                {otherUser?.display_name || "Student"}
              </h2>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.2 rounded-full border border-indigo-200/80 dark:border-indigo-800">
                {isSeller ? "Buyer" : "Seller"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {conversation.listing?.title} • {formatCurrency(conversation.listing?.price || conversation.listing?.current_bid)}
            </p>
          </div>
        </div>

        {conversation.listing && (
          <Link
            href={`/marketplace/listing/${conversation.listing_id}`}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition"
          >
            <span>View Item</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900/60 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-inner">
        <div className="text-center py-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Verified Campus Chat • Messages strictly private between you and {otherUser?.display_name?.split(' ')[0]}
          </span>
        </div>

        {messages.map(msg => {
          const isMe = msg.sender_id === user.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 px-1">
                {formatRelativeTime(msg.created_at)}
              </span>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Contact info warning banner */}
      {contactWarning && (
        <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Safety Tip:</strong> You entered an email or phone number. CampusMart recommends keeping communication on-platform for student buyer/seller protection.
          </span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={`Message ${otherUser?.display_name?.split(' ')[0] || 'student'} about pickup or inspection...`}
          className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm px-4 py-3 rounded-2xl outline-none focus:border-indigo-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl shadow-md transition active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}

export default function ConversationDetailPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-zinc-400">Loading conversation...</div>}>
      <ConversationDetailContent />
    </Suspense>
  );
}
