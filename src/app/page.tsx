"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Search, 
  Gavel, 
  Sparkles, 
  ShieldCheck, 
  Laptop, 
  BookOpen, 
  Wrench, 
  Home, 
  Bike, 
  Armchair, 
  Trophy, 
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  Flame,
  Zap,
  Bot
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Listing } from "@/types/database";
import { marketplaceStore } from "@/lib/store/marketplace-store";
import { MOCK_CATEGORIES } from "@/lib/store/mock-data";
import { APP_NAME } from "@/lib/constants";
import { formatCurrency, getAuctionTimeRemaining } from "@/lib/utils";

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "auction" | "fixed_price">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      const data = await marketplaceStore.getListings();
      setAllListings(data);
      setLoading(false);
    }
    if (user) {
      loadData();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Redirecting to Student Login...
          </p>
        </div>
      </div>
    );
  }

  // Filter listings based on tab and category
  const filteredListings = allListings.filter(item => {
    if (activeTab === "auction" && item.sale_mode !== "auction") return false;
    if (activeTab === "fixed_price" && item.sale_mode !== "fixed_price") return false;
    if (selectedCategory !== "all" && item.category?.slug !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = item.title.toLowerCase().includes(q) || 
                    item.description.toLowerCase().includes(q) || 
                    item.category?.name.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Ending-soon auctions (sorted by end time)
  const endingSoonAuctions = allListings
    .filter(l => l.sale_mode === "auction" && l.status === "active")
    .sort((a, b) => {
      const ta = a.auction_end ? new Date(a.auction_end).getTime() : 0;
      const tb = b.auction_end ? new Date(b.auction_end).getTime() : 0;
      return ta - tb;
    })
    .slice(0, 4);

  const heroAuction = endingSoonAuctions[0];
  const heroAuctionCountdown = heroAuction?.auction_end 
    ? getAuctionTimeRemaining(heroAuction.auction_end).formatted 
    : "18h left";

  return (
    <div className="min-h-screen bg-[#fbfbfe] dark:bg-[#07090e] transition-colors">
      
      {/* Hero Banner Section with Ambient Glow */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-zinc-200/60 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headline, Search, & Trust Signals */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 dark:border-indigo-400/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-sm backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Exclusively for Verified College Students (.edu)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">0% Fees</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.08]">
                Buy, sell & bid with <span className="text-gradient-primary">verified students</span> on campus.
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed font-normal">
                Skip shipping delays and marketplace fraud. Discover pre-loved tech, textbooks, lab equipment, and campus carry essentials with real-time anti-sniping auctions and safe in-person campus handoffs.
              </p>

              {/* Main Search Bar with Glass Panel */}
              <div className="pt-2 max-w-xl">
                <div className="relative flex items-center bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-xl shadow-indigo-500/5 border border-zinc-200/90 dark:border-white/10 p-2 backdrop-blur-xl">
                  <Search className="w-5 h-5 text-zinc-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search MacBook, engineering tools, textbooks, campus bag..."
                    className="w-full text-xs sm:text-sm bg-transparent px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2 shrink-0 font-medium"
                    >
                      Clear
                    </button>
                  )}
                  <Link
                    href={`/marketplace${searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : ''}`}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-102 active:scale-98 whitespace-nowrap shrink-0"
                  >
                    Search
                  </Link>
                </div>

                {/* Popular Search Tags */}
                <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500 dark:text-zinc-400 overflow-x-auto scrollbar-none pb-1">
                  <span className="font-semibold text-zinc-400 dark:text-zinc-500 shrink-0">Trending:</span>
                  {["MacBook Air", "Algorithms Textbook", "Sony Headphones", "Campus Backpack", "TI-84 Calculator", "Laptop Stand"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 whitespace-nowrap text-[11px] font-medium transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center gap-5 sm:gap-7 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Zero Commission</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Anti-Sniping Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Contact Leak Shield</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Live Auction Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl p-1 bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 shadow-2xl shadow-indigo-500/15">
                <div className="bg-white dark:bg-[#0c0f18] rounded-[22px] p-6 space-y-4 backdrop-blur-xl">
                  
                  {/* Card Header with Pulsing Live Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                      </span>
                      <span className="font-heading font-black text-sm tracking-tight text-zinc-900 dark:text-white uppercase">
                        Featured Live Auction
                      </span>
                    </div>
                    <span className="text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {heroAuctionCountdown}
                    </span>
                  </div>

                  {heroAuction && (
                    <div className="space-y-4">
                      {/* Product Image */}
                      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative group">
                        <img
                          src={heroAuction.images[0]?.url}
                          alt={heroAuction.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                          {heroAuction.bid_count} Bids Placed
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                          {heroAuction.category?.name}
                        </div>
                      </div>

                      {/* Product Details & Bid Bar */}
                      <div>
                        <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white line-clamp-1">
                          {heroAuction.title}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                          {heroAuction.pickup_location}
                        </p>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-white/10">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              Current Highest Bid
                            </p>
                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                              {formatCurrency(heroAuction.current_bid || heroAuction.starting_bid)}
                            </p>
                          </div>
                          
                          <Link
                            href={`/marketplace/listing/${heroAuction.id}`}
                            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-102 active:scale-98 flex items-center gap-1.5"
                          >
                            <Gavel className="w-3.5 h-3.5" />
                            Place Bid Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Category Navigation Pills */}
      <section className="py-5 border-b border-zinc-200/60 dark:border-white/10 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-zinc-100 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              All Categories
            </button>
            {MOCK_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.slug
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-zinc-100 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Ending Soon Auctions Section */}
      {endingSoonAuctions.length > 0 && selectedCategory === "all" && !searchQuery && (
        <section className="py-12 border-b border-zinc-200/60 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Ending Soon Auctions
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                    Protected by 3-minute anti-sniping extension • Fair bidding guarantees
                  </p>
                </div>
              </div>

              <Link
                href="/marketplace?sale_mode=auction"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 transition"
              >
                <span>View all auctions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {endingSoonAuctions.map(item => (
                <ProductCard key={item.id} listing={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why CampusMart AI Bento Grid */}
      {selectedCategory === "all" && !searchQuery && (
        <section className="py-16 border-b border-zinc-200/60 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Engineered For Campus Safety
              </span>
              <h2 className="font-heading text-3xl font-black tracking-tight text-zinc-900 dark:text-white mt-1">
                The smart way to trade on campus
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0f18] border border-zinc-200/80 dark:border-white/10 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Gavel className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">Anti-Sniping Protection</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Bids placed in the final 2 minutes extend the clock by 3 minutes, giving real students a fair chance.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0f18] border border-zinc-200/80 dark:border-white/10 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">Contact Leak Shield</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Automated regex filters alert students if phone numbers or off-campus emails are accidentally typed.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0f18] border border-zinc-200/80 dark:border-white/10 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">Designated Safe Zones</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Every trade suggests well-lit campus spots like the Student Union, Green Library, or Campus Police.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0f18] border border-zinc-200/80 dark:border-white/10 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">Gemini AI Assistant</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Powered by Google Gemini 2.5 Flash to estimate fair second-hand prices and check textbook syllabus editions.
                </p>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Marketplace Catalog Section */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Explore Campus Marketplace
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                Showing {filteredListings.length} verified listings ready for on-campus handoff
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-zinc-200/70 dark:bg-zinc-900 rounded-2xl text-xs font-bold w-fit border border-zinc-200/60 dark:border-white/10">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === "all"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setActiveTab("fixed_price")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === "fixed_price"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Fixed Price
              </button>
              <button
                onClick={() => setActiveTab("auction")}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === "auction"
                    ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Gavel className="w-3.5 h-3.5 text-amber-500" />
                Live Auctions
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 rounded-3xl h-84 border border-zinc-200 dark:border-white/10" />
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-white/10 p-8 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-zinc-100">No listings found</h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1 mb-6">
                Try adjusting your search query, selecting another category, or list the first item in this department!
              </p>
              <Link
                href="/listings/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-102 active:scale-98"
              >
                <Plus className="w-4 h-4" />
                Create a Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredListings.map(item => (
                <ProductCard key={item.id} listing={item} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-14 bg-gradient-to-tr from-indigo-950 via-indigo-900 to-violet-950 text-white border-t border-indigo-800/40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                End-of-Semester Cleanout
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-black tracking-tight">
                Turn your unused campus gear into cash.
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl">
                Post textbooks, study tools, gadgets, or campus gear in less than 2 minutes. Always 100% free for verified university students.
              </p>
            </div>
            <Link
              href="/listings/create"
              className="px-7 py-3.5 bg-white text-indigo-950 hover:bg-indigo-50 rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-black/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              List an Item in 2 Minutes
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
