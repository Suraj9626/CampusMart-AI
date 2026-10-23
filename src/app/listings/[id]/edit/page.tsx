"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/store/marketplace-store";
import { MOCK_CATEGORIES } from "@/lib/store/mock-data";
import { PRODUCT_CONDITIONS, COMMON_CAMPUS_PICKUP_LOCATIONS } from "@/lib/constants";
import { Listing, ProductCondition } from "@/types/database";

function EditListingContent() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState<ProductCondition>("good");
  const [price, setPrice] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!listingId) return;
      setLoading(true);
      const data = await marketplaceStore.getListingById(listingId);
      if (data) {
        setListing(data);
        setTitle(data.title);
        setDescription(data.description);
        setCategoryId(data.category_id);
        setCondition(data.condition);
        setPrice(data.price ? String(data.price) : "");
        setPickupLocation(data.pickup_location);
      }
      setLoading(false);
    }
    load();
  }, [listingId]);

  if (loading) {
    return <div className="p-16 text-center text-sm text-zinc-400">Loading listing details...</div>;
  }

  if (!listing) {
    return <div className="p-16 text-center text-sm text-zinc-400">Listing not found.</div>;
  }

  if (user?.id !== listing.seller_id && user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto p-12 text-center">
        <h2 className="text-xl font-bold">Unauthorized</h2>
        <p className="text-zinc-500 text-xs mt-2">You can only edit your own listings.</p>
      </div>
    );
  }

  const hasBids = listing.sale_mode === "auction" && listing.bid_count > 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const updates: Partial<Listing> = {
      title,
      description,
      category_id: categoryId,
      condition,
      pickup_location: pickupLocation,
    };

    if (listing.sale_mode === "fixed_price") {
      const p = parseFloat(price);
      if (!isNaN(p) && p > 0) updates.price = p;
    }

    const res = await marketplaceStore.updateListing(listing.id, updates, user.id);
    setSaving(false);

    if (res.success) {
      setSuccessMsg("Listing updated successfully!");
      setTimeout(() => router.push(`/marketplace/listing/${listing.id}`), 1200);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this listing?")) {
      const res = await marketplaceStore.deleteListing(listing.id, user.id);
      if (res.success) {
        router.push("/dashboard");
      } else {
        alert(res.message);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href={`/marketplace/listing/${listing.id}`} className="text-xs font-semibold text-zinc-500 hover:text-indigo-600 flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Listing
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Edit Listing</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Update details for your campus listing</p>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-600 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> <span>{successMsg}</span>
          </div>
        )}

        {hasBids && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs rounded-xl">
            ⚠️ <strong>Auction has active bids:</strong> Auction starting price and duration are locked to preserve auction integrity.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none"
              >
                {MOCK_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none"
              >
                {Object.entries(PRODUCT_CONDITIONS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          {listing.sale_mode === "fixed_price" && (
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Asking Price (₹ INR)</label>
              <input
                type="number"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-indigo-500"
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Pickup Location</label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href={`/marketplace/listing/${listing.id}`}
              className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditListingPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-zinc-400">Loading edit page...</div>}>
      <EditListingContent />
    </Suspense>
  );
}
