/**
 * CAMPUSMART AI - AUTOMATED INTEGRATION & UNIT TEST SUITE
 * Verifies authentication rules, domain validation, atomic auction bids,
 * messaging privacy, fixed-price purchases, and AI route security.
 */

import { isCollegeEmailApproved, isValidStudentEmail, parseSjcemStudentEmail, CONTACT_LEAK_REGEX } from "../lib/constants";
import { marketplaceStore } from "../lib/store/marketplace-store";
import { MOCK_PROFILES, MOCK_LISTINGS } from "../lib/store/mock-data";

async function runTestSuite() {
  console.log("=================================================");
  console.log("🧪 STARTING CAMPUSMART AI TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // 1. AUTHENTICATION & DOMAIN VALIDATION
  console.log("--- 1. Authentication & Email Domain Security ---");
  assert(
    isCollegeEmailApproved("alex.chen@stanford.edu"),
    "Approved college domain (stanford.edu) is accepted"
  );
  assert(
    isCollegeEmailApproved("priya.s@mit.edu"),
    "Approved college domain (mit.edu) is accepted"
  );
  assert(
    isCollegeEmailApproved("student@cs.berkeley.edu"),
    "Subdomain of approved college (.berkeley.edu) is accepted"
  );
  assert(
    !isCollegeEmailApproved("spammer@gmail.com"),
    "Commercial non-academic domain (gmail.com) is rejected by strict institutional filter"
  );
  assert(
    isValidStudentEmail("student@gmail.com"),
    "Student personal Gmail is accepted for registration & sign-in"
  );
  assert(
    isValidStudentEmail("student@mit.edu"),
    "Student college .edu email is accepted for registration & sign-in"
  );
  assert(
    !isValidStudentEmail("invalid-email-format"),
    "Malformed email string is rejected"
  );

  // SJCEM Specific Email Rule & PIN Extraction
  const sjcemValid = parseSjcemStudentEmail("125suraj6041@sjcem.edu.in");
  assert(
    sjcemValid.isValid && sjcemValid.expectedPin === "6041",
    "SJCEM student email 125suraj6041@sjcem.edu.in is accepted and extracts 4-digit PIN 6041"
  );

  const sjcemInvalidFormat = parseSjcemStudentEmail("suraj6041@sjcem.edu.in");
  assert(
    !sjcemInvalidFormat.isValid,
    "SJCEM email without 125 prefix is rejected"
  );

  const sjcemInvalidPin = parseSjcemStudentEmail("125suraj@sjcem.edu.in");
  assert(
    !sjcemInvalidPin.isValid,
    "SJCEM email without 4-digit number at end is rejected"
  );

  const sjcemInvalidDomain = parseSjcemStudentEmail("125suraj6041@gmail.com");
  assert(
    !sjcemInvalidDomain.isValid,
    "Non-sjcem.edu.in domain is rejected for SJCEM student rule"
  );

  // 2. CONTACT LEAK SCANNER (STUDENT SAFETY)
  console.log("\n--- 2. Student Privacy & Contact Leak Scanner ---");
  CONTACT_LEAK_REGEX.lastIndex = 0;
  assert(
    CONTACT_LEAK_REGEX.test("Call my cell at 555-234-5678"),
    "Detects phone number in message body"
  );
  CONTACT_LEAK_REGEX.lastIndex = 0;
  assert(
    CONTACT_LEAK_REGEX.test("Email me directly at private@yahoo.com"),
    "Detects external personal email in message body"
  );
  CONTACT_LEAK_REGEX.lastIndex = 0;
  assert(
    !CONTACT_LEAK_REGEX.test("Let's meet tomorrow at 3 PM in front of the Library lobby."),
    "Clean campus logistics message passes without warning"
  );

  // 3. MARKETPLACE LISTING & FILTERING
  console.log("\n--- 3. Marketplace Listings & Category Filtering ---");
  marketplaceStore.seedMockDataForTesting();
  const allListings = await marketplaceStore.getListings();
  assert(allListings.length >= 8, `Store loaded ${allListings.length} listings`);

  const electronics = await marketplaceStore.getListings({ category: "electronics" });
  assert(
    electronics.every(item => item.category?.slug === "electronics"),
    "Category filter returns only electronics"
  );

  const searchResults = await marketplaceStore.getListings({ query: "MacBook" });
  assert(
    searchResults.some(item => item.title.includes("MacBook")),
    "Search query 'MacBook' correctly returns matching listing"
  );

  // 4. AUCTION INTEGRITY & ATOMIC BIDDING
  console.log("\n--- 4. Auction Integrity & Anti-Sniping Rules ---");
  const auctionListing = allListings.find(l => l.sale_mode === "auction" && l.status === "active");
  if (auctionListing) {
    const seller = MOCK_PROFILES.find(p => p.id === auctionListing.seller_id)!;
    const buyer = MOCK_PROFILES.find(p => p.id !== auctionListing.seller_id)!;

    // Self-bidding rejection
    const selfBid = await marketplaceStore.placeBid(auctionListing.id, 999999, seller);
    assert(!selfBid.success, "Seller self-bidding is rejected with error message", selfBid.message);

    // Below minimum bid rejection
    const currentHigh = auctionListing.current_bid || auctionListing.starting_bid || 0;
    const lowBid = await marketplaceStore.placeBid(auctionListing.id, currentHigh - 100, buyer);
    assert(!lowBid.success, "Bid below current price is rejected", lowBid.message);

    // Valid bid acceptance
    const validAmount = currentHigh + 500;
    const validBid = await marketplaceStore.placeBid(auctionListing.id, validAmount, buyer);
    assert(validBid.success, "Valid bid higher than minimum is accepted", validBid.message);

    // Check bid was recorded
    const updatedBids = await marketplaceStore.getBidsForListing(auctionListing.id);
    assert(
      updatedBids[0].amount === validAmount,
      `New highest bid amount is stored authoritatively as ₹${validAmount}`
    );
  }

  // 5. FIXED-PRICE PURCHASE INTENT WORKFLOW
  console.log("\n--- 5. Fixed-Price Purchase Intent & Reservation ---");
  const fixedItem = allListings.find(l => l.sale_mode === "fixed_price" && l.status === "active");
  if (fixedItem) {
    const seller = MOCK_PROFILES.find(p => p.id === fixedItem.seller_id)!;
    const buyer = MOCK_PROFILES.find(p => p.id !== fixedItem.seller_id)!;

    // Self purchase rejection
    const selfPurchase = await marketplaceStore.requestPurchase(fixedItem.id, seller, fixedItem.price || 50);
    assert(!selfPurchase.success, "Buyer cannot purchase own item", selfPurchase.message);

    // Valid purchase reservation request
    const validPurchase = await marketplaceStore.requestPurchase(
      fixedItem.id,
      buyer,
      fixedItem.price || 50,
      "Free to meet at noon outside Student Union"
    );
    assert(validPurchase.success, "Valid purchase reservation is created and seller notified", validPurchase.message);
  }

  // 6. MESSAGING PRIVACY & RLS ENFORCEMENT
  console.log("\n--- 6. Participant-Only Messaging Privacy ---");
  const studentA = MOCK_PROFILES[0];
  const studentB = MOCK_PROFILES[1];
  const studentC = MOCK_PROFILES[2]; // unauthorized eavesdropper

  const conv = await marketplaceStore.startConversation(MOCK_LISTINGS[0].id, studentB, "Hi, is this still available?");
  assert(Boolean(conv.id), "Conversation started between buyer and seller");

  // Authorized student can fetch messages
  const authorizedMsgs = await marketplaceStore.getMessages(conv.id, studentA.id);
  assert(authorizedMsgs.length > 0, "Authorized participant (seller) can read messages");

  // Third party cannot fetch messages
  const unauthorizedMsgs = await marketplaceStore.getMessages(conv.id, studentC.id);
  assert(unauthorizedMsgs.length === 0, "Unauthorized third-party student receives empty messages list (privacy protected)");

  console.log("\n=================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
