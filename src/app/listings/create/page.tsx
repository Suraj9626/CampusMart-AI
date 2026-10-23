"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  Upload, 
  X, 
  Gavel, 
  Tag, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/store/marketplace-store";
import { MOCK_CATEGORIES } from "@/lib/store/mock-data";
import { PRODUCT_CONDITIONS, COMMON_CAMPUS_PICKUP_LOCATIONS } from "@/lib/constants";
import { ProductCondition, SaleMode } from "@/types/database";

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(MOCK_CATEGORIES[0].id);
  const [condition, setCondition] = useState<ProductCondition>("like_new");
  const [saleMode, setSaleMode] = useState<SaleMode>("fixed_price");
  
  // Pricing
  const [price, setPrice] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [auctionDurationDays, setAuctionDurationDays] = useState("3");
  
  const [pickupLocation, setPickupLocation] = useState(COMMON_CAMPUS_PICKUP_LOCATIONS[0]);
  const [customPickup, setCustomPickup] = useState("");
  
  // Images
  const [imageUrls, setImageUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80"
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddSampleImage = (presetUrl: string) => {
    if (imageUrls.length < 5) {
      setImageUrls(prev => [...prev, presetUrl]);
    }
  };

  const handleAddCustomImageUrl = () => {
    if (!newImageUrl.trim()) return;
    if (imageUrls.length >= 5) {
      alert("Maximum 5 images allowed per listing.");
      return;
    }
    setImageUrls(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Only image files (JPEG, PNG, WebP) are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 5MB limit.");
      return;
    }

    // Convert to object URL for immediate high-res preview
    const localUrl = URL.createObjectURL(file);
    if (imageUrls.length < 5) {
      setImageUrls(prev => [...prev, localUrl]);
    }
    e.target.value = "";
  };

  const handleRemoveImage = (idx: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setErrorMsg(null);

    if (!title.trim() || title.length < 5) {
      setErrorMsg("Please provide a descriptive title (at least 5 characters).");
      return;
    }

    if (!description.trim() || description.length < 15) {
      setErrorMsg("Please provide a detailed description (at least 15 characters).");
      return;
    }

    if (imageUrls.length === 0) {
      setErrorMsg("Please upload or add at least one product photo.");
      return;
    }

    let finalPrice = undefined;
    let finalStartingBid = undefined;
    let finalReserve = undefined;
    let finalAuctionStart = undefined;
    let finalAuctionEnd = undefined;

    if (saleMode === "fixed_price") {
      const p = parseFloat(price);
      if (isNaN(p) || p <= 0) {
        setErrorMsg("Please enter a valid fixed price.");
        return;
      }
      finalPrice = p;
    } else {
      const sb = parseFloat(startingBid);
      if (isNaN(sb) || sb <= 0) {
        setErrorMsg("Please enter a valid starting bid.");
        return;
      }
      finalStartingBid = sb;
      if (reservePrice) {
        const rp = parseFloat(reservePrice);
        if (!isNaN(rp) && rp > sb) {
          finalReserve = rp;
        }
      }
      const now = new Date();
      finalAuctionStart = now.toISOString();
      const durationHours = parseInt(auctionDurationDays, 10) * 24;
      finalAuctionEnd = new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString();
    }

    setSubmitting(true);

    try {
      const formattedImages = imageUrls.map((url, i) => ({
        id: `img-${Date.now()}-${i}`,
        listing_id: "",
        storage_path: `listings/${user.id}/${Date.now()}-${i}.jpg`,
        url,
        display_order: i,
        is_primary: i === 0,
        created_at: new Date().toISOString()
      }));

      const finalLocation = customPickup.trim() ? customPickup.trim() : pickupLocation;

      const created = await marketplaceStore.createListing(
        {
          seller_id: user.id,
          category_id: categoryId,
          title: title.trim(),
          description: description.trim(),
          condition,
          sale_mode: saleMode,
          price: finalPrice,
          starting_bid: finalStartingBid,
          reserve_price: finalReserve,
          auction_start: finalAuctionStart,
          auction_end: finalAuctionEnd,
          pickup_location: finalLocation,
          status: "active",
          images: formattedImages
        },
        user
      );

      router.push(`/marketplace/listing/${created.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create listing. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link href="/marketplace" className="text-xs font-semibold text-zinc-500 hover:text-indigo-600 flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 shadow-xl space-y-8">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Create a New Campus Listing
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            List your textbooks, electronics, dorm essentials, or equipment for sale or auction.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              1. Product Information
            </h3>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Listing Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. TI-84 Plus CE Graphing Calculator (Rose Gold) or MacBook Pro 14 M2"
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {MOCK_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ProductCondition)}
                  className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {Object.entries(PRODUCT_CONDITIONS).map(([key, val]) => (
                    <option key={key} value={key}>{val.label} — {val.description}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Detailed Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe features, accessories included (chargers, original box), battery condition, wear, or course relevance..."
                rows={4}
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 outline-none focus:border-indigo-500 leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Section 2: Photos */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                2. Product Photos ({imageUrls.length}/5)
              </h3>
              <span className="text-xs text-zinc-400">Max 5MB each (JPEG, PNG, WebP)</span>
            </div>

            {/* Photo Previews Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition opacity-90 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {imageUrls.length < 5 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 flex flex-col items-center justify-center cursor-pointer bg-zinc-50 dark:bg-zinc-950 transition text-zinc-500 hover:text-indigo-600">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Quick Presets for Demo */}
            <div className="text-xs text-zinc-500 space-y-1.5">
              <span className="block font-medium">Or paste an image URL:</span>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomImageUrl}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold"
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Sale Mode & Pricing */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              3. Sale Format & Pricing
            </h3>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSaleMode("fixed_price")}
                className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                  saleMode === "fixed_price"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <Tag className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Fixed Price</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Set a direct asking price. Buyer requests reservation for campus handoff.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSaleMode("auction")}
                className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                  saleMode === "auction"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <Gavel className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Live Campus Auction</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Start competitive bidding with automatic anti-sniping protection.
                  </p>
                </div>
              </button>
            </div>

            {/* Fixed Price Input */}
            {saleMode === "fixed_price" ? (
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Asking Price (₹ INR) *
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3.5 top-3 text-zinc-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1200"
                    className="w-full text-base font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-8 pr-4 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            ) : (
              /* Auction Inputs */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Starting Bid (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-zinc-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={startingBid}
                      onChange={(e) => setStartingBid(e.target.value)}
                      placeholder="500"
                      className="w-full text-sm font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-8 pr-4 outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Secret Reserve Price (₹ optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-zinc-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="1"
                      value={reservePrice}
                      onChange={(e) => setReservePrice(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full text-sm font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-8 pr-4 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Auction Duration
                  </label>
                  <select
                    value={auctionDurationDays}
                    onChange={(e) => setAuctionDurationDays(e.target.value)}
                    className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="1">1 Day (Fast Sale)</option>
                    <option value="3">3 Days (Recommended)</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Safe Campus Pickup Location */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              4. Safe Campus Pickup Location
            </h3>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Campus Location (Select or Custom)
              </label>
              <select
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 cursor-pointer mb-2"
              >
                {COMMON_CAMPUS_PICKUP_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>

              <input
                type="text"
                value={customPickup}
                onChange={(e) => setCustomPickup(e.target.value)}
                placeholder="Or specify another campus spot (e.g., Gates Hall 2nd Floor Lounge)..."
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 outline-none"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Never list your private dorm room number or personal address for safety.
              </p>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <Link
              href="/marketplace"
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition active:scale-98 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {submitting ? "Publishing Listing..." : "Publish Listing"}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
