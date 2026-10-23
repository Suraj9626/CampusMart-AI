import { NextRequest, NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/store/marketplace-store";

export async function GET(req: NextRequest) {
  // Validate authorization
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET || "campusmart-secure-cron-secret-2026";

  if (authHeader !== `Bearer ${expectedSecret}`) {
    // If running in development local test, allow with query param ?key=
    const keyParam = req.nextUrl.searchParams.get("key");
    if (keyParam !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }
  }

  try {
    marketplaceStore.processExpiredAuctions();
    return NextResponse.json({
      success: true,
      message: "Expired auctions processed successfully.",
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}export async function POST(req: NextRequest) {
  return GET(req);
}
