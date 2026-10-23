"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Gavel, Tag, Heart, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import { Listing } from "@/types/database";
import { formatCurrency, getAuctionTimeRemaining, cn } from "@/lib/utils";
import { PRODUCT_CONDITIONS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/store/marketplace-store";

interface ProductCardProps {
  listing: Listing;
  onFavoriteToggle?: (listingId: string, isFavorited: boolean) => void;
}

export function ProductCard({ listing, onFavoriteToggle }: ProductCardProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    formatted: "Calculating..."
  });

  useEffect(() => {
    if (user) {
      marketplaceStore.isFavorited(user.id, listing.id).then(setIsFavorited);
    }
  }, [user, listing.id]);

  // Update auction countdown every second on client
  useEffect(() => {
    if (listing.sale_mode !== "auction" || !listing.auction_end) return;

    setTimeRemaining(getAuctionTimeRemaining(listing.auction_end));
    const timer = setInterval(() => {
      setTimeRemaining(getAuctionTimeRemaining(listing.auction_end));
    }, 1000);

    return () => clearInterval(timer);
  }, [listing.sale_mode, listing.auction_end]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    const nextState = !isFavorited;
    setIsFavorited(nextState);
    await marketplaceStore.toggleFavorite(user.id, listing.id);
    onFavoriteToggle?.(listing.id, nextState);
  };

  const conditionConfig = PRODUCT_CONDITIONS[listing.condition] || PRODUCT_CONDITIONS.good;
  const primaryImage = listing.images.find(img => img.is_primary)?.url || listing.images[0]?.url || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80";

  return (
    <Link
      href={`/marketplace/listing/${listing.id}`}
      className="glass-card group flex flex-col rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-400/40 transition-all duration-300"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800/80">
        <img
          src={primaryImage}
          alt={listing.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Ambient Dark Gradient at Top & Bottom of Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

        {/* Sale Mode Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {listing.sale_mode === "auction" ? (
            <span className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg shadow-amber-500/25 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <Gavel className="w-3 h-3" />
              Live Auction
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg shadow-indigo-500/25 backdrop-blur-md">
              <Tag className="w-3 h-3" />
              Fixed Price
            </span>
          )}

          {listing.status === "sold" && (
            <span className="bg-zinc-900/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/20">
              SOLD
            </span>
          )}
          {listing.status === "reserved" && (
            <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/20">
              RESERVED
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/70 dark:bg-zinc-900/70 hover:bg-white dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:text-rose-500 shadow-md backdrop-blur-md transition-all active:scale-90 z-10 border border-white/40 dark:border-white/10"
        >
          <Heart
            className={cn("w-4 h-4 transition-colors", isFavorited && "fill-rose-500 text-rose-500")}
          />
        </button>

        {/* Auction Countdown Bar */}
        {listing.sale_mode === "auction" && (
          <div className="absolute bottom-0 inset-x-0 p-3 flex items-center justify-between text-[11px] text-white font-medium z-10">
            <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {timeRemaining.formatted}
            </span>
            <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold">
              {listing.bid_count} {listing.bid_count === 1 ? "bid" : "bids"}
            </span>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {/* Category & Condition Tags */}
          <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold truncate tracking-tight uppercase text-[10px]">
              {listing.category?.name || "General"}
            </span>
            <span className={cn("px-2.5 py-0.5 rounded-full font-bold border text-[10px] tracking-wide", conditionConfig.badgeColor)}>
              {conditionConfig.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {listing.title}
          </h3>
        </div>

        {/* Price & Seller Info */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
              {listing.sale_mode === "auction" ? "Current Bid" : "Price"}
            </p>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-tight tracking-tight">
              {listing.sale_mode === "auction"
                ? formatCurrency(listing.current_bid || listing.starting_bid)
                : formatCurrency(listing.price)}
            </p>
          </div>

          {/* Seller Department / Badge */}
          <div className="text-right text-[11px] text-zinc-500 dark:text-zinc-400 max-w-[130px] truncate">
            <p className="truncate font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-end gap-1">
              <span>{listing.seller?.display_name ? listing.seller.display_name.split(' ')[0] : "Student"}</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            </p>
            <p className="truncate text-[10px] text-zinc-400">
              {listing.seller?.academic_year || "Verified"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
