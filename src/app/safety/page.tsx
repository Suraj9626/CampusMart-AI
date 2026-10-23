import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, AlertTriangle, Eye, Lock, ArrowLeft, School } from "lucide-react";
import { COMMON_CAMPUS_PICKUP_LOCATIONS, APP_NAME } from "@/lib/constants";

export default function SafetyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" /> Campus Trust & Safety Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Safe Campus Exchanges & Marketplace Guidelines
        </h1>
        <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
          {APP_NAME} connects verified students on your university campus. Follow these fundamental safety best practices to protect your physical safety and transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Rule 1 */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
            Meet in Daylight at Designated Safe Zones
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Always schedule handoffs in high-traffic, well-lit campus buildings during operating hours. Never invite strangers to private dorm rooms or off-campus apartments.
          </p>
        </div>

        {/* Core Rule 2 */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
            Inspect Before Finalizing
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            For electronics (laptops, calculators), power them on and verify functionality. Check textbooks for correct edition and lab kits for complete components before completing the exchange.
          </p>
        </div>

        {/* Core Rule 3 */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
            Keep Messages On-Platform
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Do not share personal telephone numbers, personal emails, or financial cards. Use CampusMart's private encrypted messaging to arrange logistics.
          </p>
        </div>

        {/* Core Rule 4 */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            4
          </div>
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
            No Upfront Remote Wire Transfers
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Never send money in advance via gift cards, crypto, or untraceable wire transfers to someone claiming they will "ship" the item to your dorm.
          </p>
        </div>

      </div>

      {/* Recommended Campus Exchange Zones */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          Recommended Safe Campus Exchange Zones
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {COMMON_CAMPUS_PICKUP_LOCATIONS.map((loc, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <School className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{loc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prohibited Items Section */}
      <div id="prohibited" className="bg-rose-50/50 dark:bg-rose-950/20 p-8 rounded-3xl border border-rose-200 dark:border-rose-900/60 space-y-4">
        <h2 className="text-lg font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Strictly Prohibited Marketplace Items
        </h2>
        <p className="text-xs text-zinc-700 dark:text-zinc-300">
          The following items are forbidden and result in immediate account suspension:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-rose-900 dark:text-rose-200 list-disc list-inside">
          <li>Academic dishonesty materials (cheating devices, graded exam papers)</li>
          <li>Weapons, explosives, or hazardous chemicals</li>
          <li>Alcohol, tobacco, vape, or prescription pharmaceuticals</li>
          <li>Stolen campus equipment or forged college IDs</li>
          <li>Counterfeit goods or pirated digital assets</li>
          <li>Living animals or pets</li>
        </ul>
      </div>

    </div>
  );
}
