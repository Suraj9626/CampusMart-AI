import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Database not configured." }, { status: 500 });
    }

    const { data: listing, error } = await admin
      .from("listings")
      .select("*, seller:profiles!listings_seller_id_fkey(*), category:categories(*), images:listing_images(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!listing) {
      return NextResponse.json({ success: false, error: "Listing not found." }, { status: 404 });
    }

    // Increment view count
    await admin
      .from("listings")
      .update({ views_count: (listing.views_count || 0) + 1 })
      .eq("id", id);

    // Fetch bids if auction
    let bids: any[] = [];
    if (listing.sale_mode === "auction") {
      const { data: bidData } = await admin
        .from("bids")
        .select("*, bidder:profiles(*)")
        .eq("listing_id", id)
        .order("created_at", { ascending: false });
      bids = bidData || [];
    }

    return NextResponse.json({
      success: true,
      listing: {
        ...listing,
        images: (listing.images || []).sort((a: any, b: any) => a.display_order - b.display_order),
      },
      bids,
    });
  } catch (err: any) {
    console.error("GET /api/listings/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Database not configured." }, { status: 500 });
    }

    const body = await req.json();
    const { title, description, price, starting_bid, status, condition, pickup_location } = body;

    const updates: any = { updated_at: new Date().toISOString() };
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (price !== undefined) updates.price = price ? Number(price) : null;
    if (starting_bid !== undefined) updates.starting_bid = starting_bid ? Number(starting_bid) : null;
    if (status) updates.status = status;
    if (condition) updates.condition = condition;
    if (pickup_location) updates.pickup_location = pickup_location;

    const { data: updated, error } = await admin
      .from("listings")
      .update(updates)
      .eq("id", id)
      .select("*, seller:profiles!listings_seller_id_fkey(*), category:categories(*), images:listing_images(*)")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, listing: updated });
  } catch (err: any) {
    console.error("PUT /api/listings/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Database not configured." }, { status: 500 });
    }

    const { error } = await admin.from("listings").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Listing deleted successfully." });
  } catch (err: any) {
    console.error("DELETE /api/listings/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
