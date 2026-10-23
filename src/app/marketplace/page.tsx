"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Filter, 
  Search, 
  Gavel, 
  Tag, 
  X, 
  ArrowUpDown, 
  SlidersHorizontal,
  Plus
} from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Listing } from "@/types/database";
import { marketplaceStore } from "@/lib/store/marketplace-store";
import { MOCK_CATEGORIES } from "@/lib/store/mock-data";
import { PRODUCT_CONDITIONS } from "@/lib/constants";

function MarketplaceContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("query") || "";
  const initialMode = searchParams.get("sale_mode") || "all";

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login?redirect=/marketplace");
    }
  }, [user, authLoading, router]);

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

  // Filter States
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      const data = await marketplaceStore.getListings({
        category: selectedCategory,
        query: query,
        sale_mode: selectedMode,
        condition: selectedCondition,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        sort: sortOption,
      });
      setListings(data);
      setLoading(false);
    }
    fetchFiltered();
  }, [selectedCategory, query, selectedMode, selectedCondition, minPrice, maxPrice, sortOption]);

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedMode("all");
    setSelectedCondition("all");
    setMinPrice("");
    setMaxPrice("");
    setSortOption("newest");
  };

  const hasActiveFilters = query || selectedCategory !== "all" || selectedMode !== "all" || selectedCondition !== "all" || minPrice || maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Campus Marketplace
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Browse verified listings, active student auctions, and campus essentials
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="ending_soon">Ending Soon (Auctions)</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Active</option>
            </select>
          </div>

          <Link
            href="/listings/create"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Sell Item
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        
        {/* Sidebar Filters */}
        <aside className={`md:block space-y-6 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 shadow-sm">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-500" /> Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                Search Query
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Keywords..."
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 pl-8 outline-none focus:border-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Sale Mode */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                Sale Format
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: "all", label: "All Formats" },
                  { id: "fixed_price", label: "Fixed Price Direct Sale" },
                  { id: "auction", label: "Live Auctions" }
                ].map(opt => (
                  <label key={opt.id} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-white">
                    <input
                      type="radio"
                      name="sale_mode"
                      checked={selectedMode === opt.id}
                      onChange={() => setSelectedMode(opt.id)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {MOCK_CATEGORIES.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                Condition
              </label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">Any Condition</option>
                {Object.entries(PRODUCT_CONDITIONS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                Price Range (₹ INR)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-[10px] text-zinc-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-6 pr-2 outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
                <span className="text-zinc-400 text-xs font-medium">to</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-[10px] text-zinc-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-6 pr-2 outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* Main Product Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 rounded-2xl h-80 border border-zinc-200 dark:border-zinc-800" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">No matching products</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
                Try widening your price range or clearing applied filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-zinc-400 mb-4 font-medium">
                Showing {listings.length} items
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map(item => (
                  <ProductCard key={item.id} listing={item} />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-zinc-400">Loading Marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
