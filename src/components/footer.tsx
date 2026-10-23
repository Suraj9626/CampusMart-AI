"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, ShieldCheck, Heart, Lock, School } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/60 dark:border-white/10 bg-white/50 dark:bg-[#07090e]/80 backdrop-blur-xl mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="space-y-3.5 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-heading font-black text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
                {APP_NAME}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
              The verified peer-to-peer student marketplace & real-time auction hub. Sustainable, safe, and zero-fee campus commerce.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>.EDU Domain Verification Required</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xs font-black uppercase tracking-widest text-zinc-400 mb-3.5">Marketplace</h4>
            <ul className="space-y-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/marketplace" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Browse All Products
                </Link>
              </li>
              <li>
                <Link href="/marketplace?sale_mode=auction" className="hover:text-amber-600 dark:hover:text-amber-400 transition">
                  Live Campus Auctions
                </Link>
              </li>
              <li>
                <Link href="/listings/create" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  List Item for Sale
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Guidelines */}
          <div>
            <h4 className="font-heading text-xs font-black uppercase tracking-widest text-zinc-400 mb-3.5">Safety & Trust</h4>
            <ul className="space-y-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/safety" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Safe Exchange Zones
                </Link>
              </li>
              <li>
                <Link href="/safety#prohibited" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Prohibited Items Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Student Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Safe Pickup Advisory */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-zinc-900/80 dark:to-zinc-900/40 p-5 rounded-3xl border border-indigo-100/80 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs mb-1.5">
              <School className="w-4 h-4 text-indigo-500" />
              <span>Campus Safety Notice</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              Always inspect items in person before completing exchanges. Use designated daytime campus hubs (Main Library, Student Union, Campus Police Substation).
            </p>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-zinc-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© 2026 {APP_NAME}. Exclusively for verified university students.</p>
          <div className="flex items-center gap-5 font-medium">
            <Link href="/help" className="hover:text-zinc-600 dark:hover:text-zinc-300">Help Center</Link>
            <Link href="/terms" className="hover:text-zinc-600 dark:hover:text-zinc-300">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-300">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
