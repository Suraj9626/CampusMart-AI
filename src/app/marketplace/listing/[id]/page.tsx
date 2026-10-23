"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Gavel, 
  Tag, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  Heart, 
  Share2, 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft,
  Calendar,
  User,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Listing, Profile } from "@/types/database";
import { marketplaceStore } from "@/lib/store/marketplace-store";
import { formatCurrency, formatRelativeTime, getAuctionTimeRemaining, cn } from "@/lib/utils";
import { PRODUCT_CONDITIONS, COMMON_CAMPUS_PICKUP_LOCATIONS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

function ListingDetailContent() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auction Bidding State
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [bidFeedback, setBidFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({ formatted: "", isExpired: false });

  // Buy Request State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyNotes, setBuyNotes] = useState("");
  const [buySubmitting, setBuySubmitting] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<any>("prohibited_item");
  const [reportDesc, setReportDesc] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    async function loadListing() {
      if (!listingId) return;
      setLoading(true);
      const data = await marketplaceStore.getListingById(listingId);
      if (data) {
        setListing(data);
        const bidHistory = await marketplaceStore.getBidsForListing(listingId);
        setBids(bidHistory);
        if (data.sale_mode === "auction") {
          const highest = data.current_bid || data.starting_bid || 0;
          setBidAmount(String(data.current_bid ? highest + 5 : highest));
        }
      }
      setLoading(false);
    }
    loadListing();
  }, [listingId]);

  // Update auction countdown
  useEffect(() => {
    if (!listing || listing.sale_mode !== "auction" || !listing.auction_end) return;

    const updateTimer = () => {
      setTimeRemaining(getAuctionTimeRemaining(listing.auction_end));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [listing]);

  // Check favorite status
  useEffect(() => {
    if (user && listingId) {
      marketplaceStore.isFavorited(user.id, listingId).then(setIsFavorited);
    }
  }, [user, listingId]);

  const handleFavoriteClick = async () => {
    if (!user || !listing) return;
    const next = !isFavorited;
    setIsFavorited(next);
    await marketplaceStore.toggleFavorite(user.id, listing.id);
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidFeedback({ success: false, message: "Please enter a valid bid amount." });
      return;
    }

    setBidSubmitting(true);
    setBidFeedback(null);

    const result = await marketplaceStore.placeBid(listing.id, amount, user);
    setBidSubmitting(false);
    setBidFeedback(result);

    if (result.success) {
      // Reload listing & bids
      const updated = await marketplaceStore.getListingById(listing.id);
      if (updated) setListing(updated);
      const updatedBids = await marketplaceStore.getBidsForListing(listing.id);
      setBids(updatedBids);
      if (result.current_bid) {
        setBidAmount(String(result.current_bid + 5));
      }
    }
  };

  const handleBuyRequest = async () => {
    if (!user || !listing) return;
    setBuySubmitting(true);
    const result = await marketplaceStore.requestPurchase(
      listing.id,
      user,
      listing.price || 0,
      buyNotes
    );
    setBuySubmitting(false);
    if (result.success) {
      setBuySuccess(true);
      setTimeout(() => {
        setShowBuyModal(false);
        setBuySuccess(false);
      }, 2500);
    }
  };

  const handleStartChat = async () => {
    if (!user || !listing) {
      router.push('/auth/login');
      return;
    }
    if (user.id === listing.seller_id) {
      alert("This is your own listing.");
      return;
    }

    const conv = await marketplaceStore.startConversation(
      listing.id,
      user,
      `Hi ${listing.seller?.display_name?.split(' ')[0] || 'there'}, I'm interested in your listing: "${listing.title}".`
    );
    router.push(`/messages/${conv.id}`);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;

    await marketplaceStore.submitReport({
      reporter_id: user.id,
      reporter: user,
      reported_listing_id: listing.id,
      reported_listing: listing,
      reason: reportReason,
      description: reportDesc || "Report submitted by student."
    });

    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      setReportDesc("");
    }, 2000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-500 text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Listing Not Found</h2>
        <p className="text-zinc-500 text-sm mt-2 mb-6">
          This listing may have been removed, sold, or expired.
        </p>
        <Link
          href="/marketplace"
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const conditionConfig = PRODUCT_CONDITIONS[listing.condition] || PRODUCT_CONDITIONS.good;
  const isOwner = user?.id === listing.seller_id;
  const currentHighest = listing.current_bid || listing.starting_bid || 0;
  const minRequiredBid = listing.current_bid ? currentHighest + 1 : currentHighest;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 truncate">
          <Link href="/marketplace" className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Marketplace
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href={`/marketplace?category=${listing.category?.slug}`} className="hover:text-indigo-600 truncate">
            {listing.category?.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">{listing.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? "Link Copied!" : "Share"}</span>
          </button>
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 transition ${
              isFavorited ? "text-rose-500 bg-rose-50 dark:bg-rose-950/30" : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500"
            }`}
          >
            <Heart className={cn("w-4 h-4", isFavorited && "fill-rose-500")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] w-full rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 relative shadow-md">
            <img
              src={listing.images[selectedImageIndex]?.url || listing.images[0]?.url}
              alt={listing.title}
              className="w-full h-full object-cover object-center"
            />
            {listing.sale_mode === "auction" && (
              <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5" />
                Live Campus Auction
              </div>
            )}
            {listing.status === "sold" && (
              <div className="absolute top-4 left-4 bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                ITEM SOLD
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {listing.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImageIndex === idx
                      ? "border-indigo-600 scale-102"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Detailed Description */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Product Description</h2>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
              {listing.description}
            </div>

            {/* Pickup Location Info */}
            <div className="flex items-start gap-3 p-4 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 text-xs">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-indigo-900 dark:text-indigo-200">Recommended Campus Pickup Area</p>
                <p className="text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">{listing.pickup_location}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Exchange on campus in public, daylight areas. Inspect before finalizing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bidding / Purchasing & Seller (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Action Box */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {listing.category?.name}
                </span>
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", conditionConfig.badgeColor)}>
                  {conditionConfig.label}
                </span>
              </div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                {listing.title}
              </h1>
            </div>

            {/* AUCTION MODE */}
            {listing.sale_mode === "auction" ? (
              <div className="space-y-5 pt-2">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Time Remaining</span>
                    <p className="text-lg font-black text-amber-700 dark:text-amber-300 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-4 h-4" />
                      {timeRemaining.formatted}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Current Highest Bid</span>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white">
                      {formatCurrency(listing.current_bid || listing.starting_bid)}
                    </p>
                  </div>
                </div>

                {/* Anti-sniping policy note */}
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                  ⚡ <strong>Anti-sniping protection:</strong> Any bid within the final 2 minutes will automatically extend the auction by 3 minutes.
                </p>

                {/* Bidding Form */}
                {listing.status === "active" && !timeRemaining.isExpired ? (
                  isOwner ? (
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 text-center font-medium">
                      You are the seller of this auction. Bidding on your own item is prohibited.
                    </div>
                  ) : (
                    <form onSubmit={handleBidSubmit} className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1 font-medium">
                          <label className="text-zinc-700 dark:text-zinc-300">Your Bid Amount (₹)</label>
                          <span className="text-zinc-400">Min bid: {formatCurrency(minRequiredBid)}</span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-zinc-400 font-bold">₹</span>
                          <input
                            type="number"
                            step="1"
                            min={minRequiredBid}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder={minRequiredBid.toString()}
                            className="w-full text-base font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-2.5 pl-8 pr-4 text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                            disabled={bidSubmitting}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={bidSubmitting}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Gavel className="w-4 h-4" />
                        {bidSubmitting ? "Placing Bid..." : `Place Bid of ${formatCurrency(Number(bidAmount) || minRequiredBid)}`}
                      </button>

                      {bidFeedback && (
                        <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                          bidFeedback.success 
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                            : "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900"
                        }`}>
                          {bidFeedback.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          <span>{bidFeedback.message}</span>
                        </div>
                      )}
                    </form>
                  )
                ) : (
                  <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                    This auction has ended. Winner determination is recorded.
                  </div>
                )}

                {/* Bid History */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Bid History ({bids.length})
                  </h3>
                  {bids.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-2">No bids placed yet. Be the first!</p>
                  ) : (
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {bids.map((b, idx) => (
                        <div
                          key={b.id || idx}
                          className="flex items-center justify-between text-xs p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{b.bidder_name}</span>
                            {b.status === "active" && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded">
                                Highest
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(b.amount)}</span>
                            <span className="text-[10px] text-zinc-400 block">{formatRelativeTime(b.time)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* FIXED PRICE MODE */
              <div className="space-y-6 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 font-medium">Fixed Asking Price</span>
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {formatCurrency(listing.price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Available for Campus Pickup
                  </span>
                </div>

                {listing.status === "active" ? (
                  isOwner ? (
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 text-center font-medium">
                      You are the seller of this listing.
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowBuyModal(true)}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Tag className="w-4 h-4" />
                      Request to Buy / Reserve Item
                    </button>
                  )
                ) : (
                  <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                    This item has been {listing.status}.
                  </div>
                )}
              </div>
            )}

            {/* Direct Message Seller Button */}
            {!isOwner && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={handleStartChat}
                  className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  Message Seller Privately
                </button>
              </div>
            )}

          </div>

          {/* Seller Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Verified Student Seller
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-indigo-500 text-white font-bold flex items-center justify-center text-lg">
                {listing.seller?.avatar_url ? (
                  <img src={listing.seller.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  listing.seller?.display_name ? listing.seller.display_name[0] : "S"
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    {listing.seller?.display_name || "Verified Student"}
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {listing.seller?.department} • {listing.seller?.academic_year}
                </p>
              </div>
            </div>

            {listing.seller?.bio && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                "{listing.seller.bio}"
              </p>
            )}

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>Member since {new Date(listing.created_at).toLocaleDateString()}</span>
              <button
                onClick={() => setShowReportModal(true)}
                className="text-zinc-400 hover:text-rose-600 transition flex items-center gap-1"
              >
                <Flag className="w-3.5 h-3.5" /> Report
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Buy Reservation Intent Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              Reserve Item on Campus
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              CampusMart AI coordinates verified student handoffs. No payment is taken online; you will meet the seller in person to inspect and purchase.
            </p>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-xs space-y-1">
              <div className="flex justify-between font-semibold">
                <span>{listing.title}</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(listing.price)}</span>
              </div>
              <p className="text-zinc-400">Location: {listing.pickup_location}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Add a note for the seller (availability / pickup time):
              </label>
              <textarea
                value={buyNotes}
                onChange={(e) => setBuyNotes(e.target.value)}
                placeholder="e.g., I'm free this afternoon around 4 PM near the Library lobby..."
                rows={3}
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-indigo-500"
              />
            </div>

            {buySuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Purchase request dispatched! Check your dashboard.</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowBuyModal(false)}
                className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBuyRequest}
                disabled={buySubmitting || buySuccess}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {buySubmitting ? "Sending..." : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-500" /> Report Listing
            </h3>
            <p className="text-xs text-zinc-500">
              Help keep our student marketplace safe. Our moderators review every report.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 outline-none"
                >
                  <option value="scam">Potential Scam or Suspicious Price</option>
                  <option value="prohibited_item">Prohibited Campus Item</option>
                  <option value="harassment">Offensive or Inappropriate Content</option>
                  <option value="spam">Spam or Duplicate Post</option>
                  <option value="other">Other Violation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Details</label>
                <textarea
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Explain why this listing violates campus standards..."
                  rows={3}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none"
                  required
                />
              </div>

              {reportSubmitted && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Report submitted for administrative review.</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitted}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ListingDetailPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-16 text-center text-zinc-400">Loading product details...</div>}>
      <ListingDetailContent />
    </Suspense>
  );
}
