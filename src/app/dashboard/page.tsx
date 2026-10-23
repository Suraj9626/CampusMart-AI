"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Layers, 
  Tag, 
  Gavel, 
  Heart, 
  Plus, 
  ShoppingBag, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/store/marketplace-store";
import { Listing, PurchaseRequest } from "@/types/database";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"listings" | "bids" | "purchases" | "favorites">("listings");
  
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myPurchases, setMyPurchases] = useState<PurchaseRequest[]>([]);
  const [myFavorites, setMyFavorites] = useState<Listing[]>([]);
  const [allListingsWithBids, setAllListingsWithBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch user's listings
    const userListings = await marketplaceStore.getListings({ seller_id: user.id });
    setMyListings(userListings);

    // Fetch purchases
    const purchases = await marketplaceStore.getPurchaseRequests(user.id);
    setMyPurchases(purchases);

    // Fetch favorites
    const favs = await marketplaceStore.getFavorites(user.id);
    setMyFavorites(favs);

    // Fetch auctions where user placed bids
    const allAuctions = await marketplaceStore.getListings({ sale_mode: "auction" });
    const userBidAuctions: any[] = [];
    for (const a of allAuctions) {
      const bids = await marketplaceStore.getBidsForListing(a.id);
      const userBid = bids.find(b => b.bidder_id === user.id);
      if (userBid) {
        userBidAuctions.push({
          listing: a,
          userBid,
          isHighest: a.winning_bidder_id === user.id
        });
      }
    }
    setAllListingsWithBids(userBidAuctions);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleMarkSold = async (listingId: string) => {
    if (!user) return;
    const res = await marketplaceStore.updateListing(listingId, { status: "sold" }, user.id);
    if (res.success) {
      loadData();
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!user) return;
    if (confirm("Are you sure you want to remove this listing?")) {
      const res = await marketplaceStore.deleteListing(listingId, user.id);
      if (res.success) {
        loadData();
      } else {
        alert(res.message);
      }
    }
  };

  const handleUpdatePurchaseStatus = async (purchaseId: string, status: 'reserved' | 'completed' | 'cancelled') => {
    if (!user) return;
    await marketplaceStore.updatePurchaseStatus(purchaseId, status, user.id);
    loadData();
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold">Please log in to view your dashboard.</h2>
        <Link href="/auth/login" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your campus listings, active bids, purchase requests, and saved items.
          </p>
        </div>

        <Link
          href="/listings/create"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition w-fit"
        >
          <Plus className="w-4 h-4" />
          List New Item
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        <button
          onClick={() => setActiveTab("listings")}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === "listings"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>My Listings ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("bids")}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === "bids"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>My Bids & Auctions ({allListingsWithBids.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("purchases")}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === "purchases"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Purchase Requests ({myPurchases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("favorites")}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === "favorites"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved / Favorites ({myFavorites.length})</span>
        </button>
      </div>

      {/* Tab 1: MY LISTINGS */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          {myListings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
              <Tag className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">You have no active listings</h3>
              <p className="text-xs text-zinc-500 mt-1 mb-4">Post textbooks, electronics, or dorm gear in minutes.</p>
              <Link href="/listings/create" className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl inline-block">
                Create Listing
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-sm">
              {myListings.map(item => (
                <div key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                      <img src={item.images[0]?.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.sale_mode === "auction" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                        }`}>
                          {item.sale_mode === "auction" ? "Auction" : "Fixed Price"}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.status === "active" ? "bg-emerald-100 text-emerald-700" :
                          item.status === "sold" ? "bg-zinc-800 text-white" : "bg-blue-100 text-blue-700"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate mt-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {item.sale_mode === "auction"
                          ? `Current bid: ${formatCurrency(item.current_bid || item.starting_bid)} (${item.bid_count} bids)`
                          : `Price: ${formatCurrency(item.price)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={`/marketplace/listing/${item.id}`}
                      className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition"
                    >
                      View
                    </Link>

                    {item.status === "active" && (
                      <>
                        <Link
                          href={`/listings/${item.id}/edit`}
                          className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition"
                        >
                          Edit
                        </Link>
                        {item.sale_mode === "fixed_price" && (
                          <button
                            onClick={() => handleMarkSold(item.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
                          >
                            Mark Sold
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteListing(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: MY BIDS & AUCTIONS */}
      {activeTab === "bids" && (
        <div className="space-y-4">
          {allListingsWithBids.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
              <Gavel className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">No Active Bids</h3>
              <p className="text-xs text-zinc-500 mt-1 mb-4">Explore live campus auctions to place bids.</p>
              <Link href="/marketplace?sale_mode=auction" className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl inline-block">
                Browse Auctions
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-sm">
              {allListingsWithBids.map(({ listing, userBid, isHighest }) => (
                <div key={listing.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                      <img src={listing.images[0]?.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {isHighest ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                            Highest Bidder 🎉
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                            Outbid
                          </span>
                        )}
                        <span className="text-xs text-zinc-400">Status: {listing.status}</span>
                      </div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate mt-1">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Your bid: <strong>${userBid.amount}</strong> • Current highest: <strong>${listing.current_bid}</strong>
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/marketplace/listing/${listing.id}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition self-end sm:self-center"
                  >
                    View Auction
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: PURCHASE REQUESTS */}
      {activeTab === "purchases" && (
        <div className="space-y-4">
          {myPurchases.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
              <ShoppingBag className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">No Purchase Requests</h3>
              <p className="text-xs text-zinc-500 mt-1">When students request to reserve your items, they appear here.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-sm">
              {myPurchases.map(pr => {
                const isSeller = pr.seller_id === user.id;

                return (
                  <div key={pr.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
                          {isSeller ? "Incoming Request" : "Your Reservation Request"}
                        </span>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Status: {pr.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                        {pr.listing?.title}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        Offered: <strong>${pr.offered_price}</strong> • {isSeller ? `Buyer: ${pr.buyer?.display_name}` : `Seller: ${pr.seller?.display_name}`}
                      </p>
                      {pr.notes && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                          "{pr.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isSeller && pr.status === "requested" && (
                        <>
                          <button
                            onClick={() => handleUpdatePurchaseStatus(pr.id, "reserved")}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                          >
                            Accept & Reserve
                          </button>
                          <button
                            onClick={() => handleUpdatePurchaseStatus(pr.id, "cancelled")}
                            className="px-3 py-1.5 bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {isSeller && pr.status === "reserved" && (
                        <button
                          onClick={() => handleUpdatePurchaseStatus(pr.id, "completed")}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                        >
                          Mark Completed
                        </button>
                      )}

                      <Link
                        href={`/marketplace/listing/${pr.listing_id}`}
                        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold"
                      >
                        Item
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: FAVORITES */}
      {activeTab === "favorites" && (
        <div className="space-y-4">
          {myFavorites.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
              <Heart className="w-10 h-10 text-rose-400 mx-auto mb-2" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">No Saved Items</h3>
              <p className="text-xs text-zinc-500 mt-1 mb-4">Click the heart icon on any listing to save it.</p>
              <Link href="/marketplace" className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl inline-block">
                Explore Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myFavorites.map(item => (
                <div key={item.id} className="relative">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <div className="aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <img src={item.images[0]?.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm truncate">{item.title}</h4>
                      <p className="text-xs text-zinc-500">{formatCurrency(item.price || item.current_bid)}</p>
                    </div>
                    <Link
                      href={`/marketplace/listing/${item.id}`}
                      className="block text-center py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
