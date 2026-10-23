"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Listing } from "@/types/database";
import { marketplaceStore } from "@/lib/store/marketplace-store";
import { useAuth } from "@/lib/auth-context";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavs() {
      if (!user) return;
      setLoading(true);
      const data = await marketplaceStore.getFavorites(user.id);
      setFavorites(data);
      setLoading(false);
    }
    loadFavs();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold">Please log in to view saved items.</h2>
        <Link href="/auth/login" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            Saved / Favorites
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Keep track of active auctions and items you are considering
          </p>
        </div>

        <Link
          href="/marketplace"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Browsing
        </Link>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-zinc-400">Loading saved items...</div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-4">
          <Heart className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Your wishlist is empty</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Click the heart icon on any listing card or details page to bookmark it here.
          </p>
          <Link
            href="/marketplace"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map(listing => (
            <ProductCard
              key={listing.id}
              listing={listing}
              onFavoriteToggle={(id, isFav) => {
                if (!isFav) {
                  setFavorites(prev => prev.filter(item => item.id !== id));
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
