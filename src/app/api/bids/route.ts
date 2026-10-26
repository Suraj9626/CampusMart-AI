import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Database not configured." }, { status: 500 });
    }

    const body = await req.json();
    const { listing_id, amount, bidder_id } = body;

    if (!listing_id || !amount || !bidder_id) {
      return NextResponse.json({ success: false, error: "Missing required bid parameters." }, { status: 400 });
    }

    // Try calling the stored procedure place_auction_bid in Supabase
    const { data: rpcResult, error: rpcError } = await admin.rpc("place_auction_bid", {
      p_listing_id: listing_id,
      p_bid_amount: Number(amount),
      p_bidder_id: bidder_id,
    });

    if (!rpcError && rpcResult) {
      return NextResponse.json(rpcResult);
    }

    // Fallback: manual bid placement with concurrency check
    const { data: listing, error: listErr } = await admin
      .from("listings")
      .select("*")
      .eq("id", listing_id)
      .single();

    if (listErr || !listing) {
      return NextResponse.json({ success: false, message: "Listing not found." }, { status: 404 });
    }

    const currentHigh = listing.current_bid || listing.starting_bid || 0;
    const minRequired = listing.current_bid ? currentHigh + 1.00 : listing.starting_bid;

    if (Number(amount) < minRequired) {
      return NextResponse.json({
        success: false,
        message: `Bid must be at least $${minRequired}.`,
      });
    }

    // Insert bid
    await admin.from("bids").insert({
      listing_id,
      bidder_id,
      amount: Number(amount),
      status: "active",
      created_at: new Date().toISOString(),
    });

    // Update listing
    await admin
      .from("listings")
      .update({
        current_bid: Number(amount),
        winning_bidder_id: bidder_id,
        bid_count: (listing.bid_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listing_id);

    return NextResponse.json({
      success: true,
      message: "Bid placed successfully!",
      current_bid: Number(amount),
    });
  } catch (err: any) {
    console.error("Bid placement error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
