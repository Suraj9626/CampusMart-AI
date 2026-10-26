import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Database not configured." }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query");
    const condition = searchParams.get("condition");
    const sale_mode = searchParams.get("sale_mode");
    const seller_id = searchParams.get("seller_id");
    const status = searchParams.get("status") || "active";

    let dbQuery = admin
      .from("listings")
      .select("*, seller:profiles!listings_seller_id_fkey(*), category:categories(*), images:listing_images(*)")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      dbQuery = dbQuery.eq("status", status);
    } else {
      dbQuery = dbQuery.neq("status", "moderated");
    }

    if (seller_id) {
      dbQuery = dbQuery.eq("seller_id", seller_id);
    }

    if (sale_mode && sale_mode !== "all") {
      dbQuery = dbQuery.eq("sale_mode", sale_mode);
    }

    if (condition && condition !== "all") {
      dbQuery = dbQuery.eq("condition", condition);
    }

    if (category && category !== "all") {
      // Check if it's a category UUID or a slug
      if (category.startsWith("c111") || category.includes("-")) {
        // Look up by category_id or slug via join
        const { data: catData } = await admin.from("categories").select("id").eq("slug", category).maybeSingle();
        if (catData?.id) {
          dbQuery = dbQuery.eq("category_id", catData.id);
        } else {
          dbQuery = dbQuery.eq("category_id", category);
        }
      } else {
        const { data: catData } = await admin.from("categories").select("id").eq("slug", category).maybeSingle();
        if (catData?.id) {
          dbQuery = dbQuery.eq("category_id", catData.id);
        }
      }
    }

    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data: listings, error } = await dbQuery;

    if (error) {
      console.error("Listings fetch error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Sort images by display_order for each listing
    const formatted = (listings || []).map((l: any) => ({
      ...l,
      images: (l.images || []).sort((a: any, b: any) => a.display_order - b.display_order),
    }));

    return NextResponse.json({ success: true, listings: formatted });
  } catch (err: any) {
    console.error("GET /api/listings error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Database not configured." }, { status: 500 });
    }

    const body = await req.json();
    const {
      title,
      description,
      category_id,
      condition,
      sale_mode,
      price,
      starting_bid,
      buy_now_price,
      reserve_price,
      auction_start,
      auction_end,
      pickup_location,
      seller,
      seller_id,
      images,
    } = body;

    if (!title || !description || !sale_mode) {
      return NextResponse.json({ success: false, error: "Missing required listing fields." }, { status: 400 });
    }

    // 1. Resolve seller profile: ensure a valid record exists in public.profiles
    let finalSellerId = seller_id || seller?.id;

    if (seller && finalSellerId) {
      // Check if profile exists; if not, create it
      const { data: existingProfile } = await admin.from("profiles").select("id").eq("id", finalSellerId).maybeSingle();
      if (!existingProfile) {
        // If finalSellerId is not a valid UUID (e.g. mock 'u-alex-chen'), assign a deterministic UUID or look for an existing user
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalSellerId);
        if (!isValidUuid) {
          // Check if there is an auth user or pick first profile
          const { data: firstProf } = await admin.from("profiles").select("id").limit(1).single();
          if (firstProf) {
            finalSellerId = firstProf.id;
          }
        } else {
          await admin.from("profiles").upsert({
            id: finalSellerId,
            display_name: seller.display_name || "Student Seller",
            college_email: seller.college_email || `student_${Date.now()}@college.edu`,
            department: seller.department || "General Studies",
            academic_year: seller.academic_year || "Freshman",
            role: "student",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    }

    // 2. Resolve category ID: must be a valid UUID in public.categories
    let finalCategoryId = category_id;
    const isValidCategoryUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalCategoryId || "");

    if (!isValidCategoryUuid) {
      // Try resolving by slug
      const slugCandidate = (category_id || "electronics").replace(/^cat-/, "");
      const { data: catBySlug } = await admin.from("categories").select("id").eq("slug", slugCandidate).maybeSingle();
      if (catBySlug) {
        finalCategoryId = catBySlug.id;
      } else {
        const { data: defaultCat } = await admin.from("categories").select("id").limit(1).single();
        finalCategoryId = defaultCat?.id;
      }
    }

    // 3. Insert into public.listings
    const listingInsert = {
      seller_id: finalSellerId,
      category_id: finalCategoryId,
      title: title.trim(),
      description: description.trim(),
      condition: condition || "like_new",
      sale_mode: sale_mode,
      price: price ? Number(price) : null,
      starting_bid: starting_bid ? Number(starting_bid) : null,
      current_bid: sale_mode === "auction" ? (starting_bid ? Number(starting_bid) : null) : null,
      buy_now_price: buy_now_price ? Number(buy_now_price) : null,
      reserve_price: reserve_price ? Number(reserve_price) : null,
      auction_start: auction_start || (sale_mode === "auction" ? new Date().toISOString() : null),
      auction_end: auction_end || null,
      pickup_location: pickup_location || "On Campus",
      status: "active",
      views_count: 0,
      bid_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: insertedListing, error: insertError } = await admin
      .from("listings")
      .insert(listingInsert)
      .select()
      .single();

    if (insertError) {
      console.error("Listing insert error:", insertError);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    // 4. Insert images into public.listing_images
    if (images && Array.isArray(images) && images.length > 0) {
      const imageRecords = images.map((img: any, idx: number) => ({
        listing_id: insertedListing.id,
        storage_path: img.storage_path || `listings/${insertedListing.id}/${idx}.jpg`,
        url: typeof img === "string" ? img : img.url,
        display_order: idx,
        is_primary: idx === 0,
        created_at: new Date().toISOString(),
      }));

      const { error: imgError } = await admin.from("listing_images").insert(imageRecords);
      if (imgError) {
        console.warn("Listing images insert warning:", imgError);
      }
    }

    // 5. Fetch full listing with relations
    const { data: fullListing, error: fetchErr } = await admin
      .from("listings")
      .select("*, seller:profiles!listings_seller_id_fkey(*), category:categories(*), images:listing_images(*)")
      .eq("id", insertedListing.id)
      .single();

    if (fetchErr) {
      return NextResponse.json({ success: true, listing: insertedListing });
    }

    return NextResponse.json({
      success: true,
      message: "Listing published to campus marketplace successfully!",
      listing: fullListing,
    });
  } catch (err: any) {
    console.error("POST /api/listings error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
