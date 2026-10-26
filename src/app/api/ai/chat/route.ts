import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, userMessage } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured on the server." },
        { status: 500 }
      );
    }

    // 1. Fetch live database state (listings, categories, sellers)
    let dbCatalogContext = "";
    let categoriesContext = "";
    let activeItemsCount = 0;

    try {
      const admin = createAdminClient();
      if (admin) {
        // Fetch active listings
        const { data: listings, error: listErr } = await admin
          .from("listings")
          .select("id, title, description, condition, sale_mode, price, starting_bid, current_bid, bid_count, buy_now_price, pickup_location, status, created_at, seller:profiles!listings_seller_id_fkey(display_name, department), category:categories(name)")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(50);

        if (!listErr && Array.isArray(listings)) {
          activeItemsCount = listings.length;
          if (listings.length > 0) {
            dbCatalogContext = `LIVE DATABASE CATALOG (${listings.length} active item(s) listed on CampusMart AI right now):\n` +
              listings.map((item: any, idx: number) => {
                const priceStr = item.sale_mode === "auction"
                  ? `Auction (Starting Bid: ₹${item.starting_bid || 0}, Current Bid: ₹${item.current_bid || item.starting_bid || 0}, ${item.bid_count || 0} bids placed)`
                  : `Fixed Price: ₹${item.price}`;
                const seller = item.seller?.display_name
                  ? `${item.seller.display_name} (${item.seller.department || "Student"})`
                  : "College Student";
                const cat = item.category?.name || "General";
                return `${idx + 1}. "${item.title}"\n   - Price: ${priceStr}\n   - Category: ${cat}\n   - Condition: ${item.condition}\n   - Seller: ${seller}\n   - Pickup Location: ${item.pickup_location}\n   - Description: ${item.description.slice(0, 200)}`;
              }).join("\n\n");
          } else {
            dbCatalogContext = "LIVE DATABASE CATALOG: There are currently 0 items listed for sale on the marketplace (the catalog is empty). If the user asks about available items or searches for something, inform them truthfully that no items have been posted yet, and invite them or their classmates to post the very first item by clicking 'Sell Item' in the navigation bar!";
          }
        }

        // Fetch categories
        const { data: categories } = await admin
          .from("categories")
          .select("name, slug")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (categories && categories.length > 0) {
          categoriesContext = `Available Marketplace Categories: ${categories.map((c: any) => c.name).join(", ")}.`;
        }
      }
    } catch (dbErr) {
      console.warn("Could not query live DB for chatbot grounding:", dbErr);
      dbCatalogContext = "LIVE DATABASE CATALOG: Database connection is momentarily syncing. Answer using general website and collegiate knowledge.";
    }

    const systemPrompt = `You are the CampusMart AI Assistant, an intelligent, helpful, and trustworthy campus marketplace chatbot embedded directly into "CampusMart AI" — an exclusive, verified marketplace and auction platform for college students (specifically St. John College of Engineering and Management / SJCEM).

AUTHORITATIVE REAL-TIME DATABASE ACCESS:
You have direct, real-time access to the live platform database. Use the live data below to answer queries about what items are currently available, their exact prices, conditions, sellers, and categories.

${dbCatalogContext}
${categoriesContext ? `\n${categoriesContext}\n` : ""}

YOUR CAPABILITIES & RULES:
1. MARKETPLACE & ITEM QUERIES:
   - When asked "what items are available?", "what can I buy?", "is there a laptop/calculator/book?", search the LIVE DATABASE CATALOG above.
   - If matching items exist, list them clearly with their exact title, price in Indian Rupees (₹), condition, seller department, and pickup location.
   - If the catalog is empty (0 items) or an item is not found, clearly tell the user that no matching item is currently listed in the database, and encourage them to click "Sell Item" to list it themselves!
   - You can also explain how to buy: for fixed-price items, click "Reserve & Buy Now" to place an instant hold; for auctions, enter a bid higher than the current bid.

2. WEBSITE FEATURES & POLICIES:
   - Registration Rules: Only verified student emails formatted like 125[name][4-digit]@sjcem.edu.in (e.g. 125suraj6041@sjcem.edu.in) can register. The student's password during registration is strictly the 4-digit number at the end of their email username (e.g. 6041).
   - Anti-Sniping Protection in Auctions: If any student places a bid during the final 2 minutes of an auction, the timer is automatically extended by 3 minutes. This completely eliminates snipe bots and gives all students a fair chance.
   - Safety & Meetups: Transactions are strictly on-campus handoffs. Recommend safe daylight campus zones: College Central Library, Student Canteen, Main Academic Lobby, or Campus Security Office.
   - Privacy: Contact information (phone numbers, personal emails) is protected by our automated privacy leak scanner. All student coordination happens through end-to-end platform messaging.

3. GENERAL QUESTIONS & ACADEMIC ASSISTANCE:
   - You can answer ANY general question the student asks!
   - Topics include: computer science, programming (C, C++, Java, Python, JavaScript, TypeScript, React, SQL, etc.), algorithms, engineering formulas, mathematics, exam study tips, project ideas, academic writing, and general trivia.
   - Provide complete, well-structured, educational explanations with clear Markdown formatting, bullet points, and syntax-highlighted code blocks where applicable.

Be polite, friendly, collegiate, concise, and accurate. When mentioning prices, always use Indian Rupees (₹ INR).`;

    // Build message thread
    let conversationText = `${systemPrompt}\n\n`;
    if (Array.isArray(messages) && messages.length > 0) {
      messages.slice(-8).forEach((m: { role: string; content: string }) => {
        conversationText += `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}\n`;
      });
    }
    conversationText += `Student: ${userMessage}\nAssistant:`;

    const client = new GoogleGenAI({ apiKey });

    let responseText = "";
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: conversationText,
      });
      responseText = response.text || "";
    } catch (e: any) {
      console.warn("Falling back to gemini-2.0-flash due to:", e?.message);
      const fallback = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: conversationText,
      });
      responseText = fallback.text || "";
    }

    if (!responseText) {
      return NextResponse.json(
        { error: "No response was generated by the AI model." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      reply: responseText,
      activeItemsCount,
    });
  } catch (error: any) {
    console.error("AI Chat Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process AI assistant request. Please try again." },
      { status: 500 }
    );
  }
}
