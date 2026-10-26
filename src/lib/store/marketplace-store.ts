import { 
  Listing, 
  Profile, 
  Category, 
  Bid, 
  PurchaseRequest, 
  Conversation, 
  Message, 
  Notification, 
  Report,
  ReportStatus
} from "@/types/database";
import { 
  MOCK_LISTINGS, 
  MOCK_PROFILES, 
  MOCK_CATEGORIES, 
  MOCK_BIDS, 
  MOCK_CONVERSATIONS, 
  MOCK_MESSAGES, 
  MOCK_NOTIFICATIONS, 
  MOCK_REPORTS 
} from "./mock-data";
import { formatCurrency } from "@/lib/utils";

// Helper to interact with persistent browser storage where available,
// falling back safely to in-memory store in SSR or server routes.
class MarketplaceStore {
  private listings: Listing[] = [];
  private bids: Record<string, { id: string; bidder_id: string; bidder_name: string; amount: number; time: string; status: 'active' | 'outbid' }[]> = {};
  private conversations: Conversation[] = [];
  private messages: Record<string, Message[]> = {};
  private favorites: Record<string, string[]> = {}; // userId -> listingId[]
  private notifications: Notification[] = [];
  private reports: Report[] = [];
  private purchaseRequests: PurchaseRequest[] = [];
  private initialized = false;

  constructor() {
    this.initStore();
  }

  private initStore() {
    if (typeof window !== 'undefined') {
      try {
        const storedListings = localStorage.getItem("cm_listings");
        const storedBids = localStorage.getItem("cm_bids");
        const storedConvs = localStorage.getItem("cm_conversations");
        const storedMsgs = localStorage.getItem("cm_messages");
        const storedFavs = localStorage.getItem("cm_favorites");
        const storedNotifs = localStorage.getItem("cm_notifications");
        const storedReports = localStorage.getItem("cm_reports");
        const storedPurchases = localStorage.getItem("cm_purchases");

        this.listings = storedListings ? JSON.parse(storedListings) : [...MOCK_LISTINGS];
        this.bids = storedBids ? JSON.parse(storedBids) : { ...MOCK_BIDS };
        this.conversations = storedConvs ? JSON.parse(storedConvs) : [...MOCK_CONVERSATIONS];
        this.messages = storedMsgs ? JSON.parse(storedMsgs) : { ...MOCK_MESSAGES };
        this.favorites = storedFavs ? JSON.parse(storedFavs) : { "u-alex-chen": ["lst-ti-84-ce"] };
        this.notifications = storedNotifs ? JSON.parse(storedNotifs) : [...MOCK_NOTIFICATIONS];
        this.reports = storedReports ? JSON.parse(storedReports) : [...MOCK_REPORTS];
        this.purchaseRequests = storedPurchases ? JSON.parse(storedPurchases) : [];
        this.initialized = true;
        return;
      } catch (e) {
        console.warn("Could not read from localStorage, using memory store:", e);
      }
    }

    // Server-side fallback
    this.listings = [...MOCK_LISTINGS];
    this.bids = { ...MOCK_BIDS };
    this.conversations = [...MOCK_CONVERSATIONS];
    this.messages = { ...MOCK_MESSAGES };
    this.favorites = { "u-alex-chen": ["lst-ti-84-ce"] };
    this.notifications = [...MOCK_NOTIFICATIONS];
    this.reports = [...MOCK_REPORTS];
    this.purchaseRequests = [];
    this.initialized = true;
  }

  private save() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("cm_listings", JSON.stringify(this.listings));
        localStorage.setItem("cm_bids", JSON.stringify(this.bids));
        localStorage.setItem("cm_conversations", JSON.stringify(this.conversations));
        localStorage.setItem("cm_messages", JSON.stringify(this.messages));
        localStorage.setItem("cm_favorites", JSON.stringify(this.favorites));
        localStorage.setItem("cm_notifications", JSON.stringify(this.notifications));
        localStorage.setItem("cm_reports", JSON.stringify(this.reports));
        localStorage.setItem("cm_purchases", JSON.stringify(this.purchaseRequests));
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }
    }
  }

  // --- LISTINGS ---
  async getListings(params?: {
    category?: string;
    query?: string;
    condition?: string;
    sale_mode?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    seller_id?: string;
    status?: string;
  }): Promise<Listing[]> {
    if (typeof window !== 'undefined') {
      this.processExpiredAuctions();
      try {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.set("category", params.category);
        if (params?.query) queryParams.set("query", params.query);
        if (params?.condition) queryParams.set("condition", params.condition);
        if (params?.sale_mode) queryParams.set("sale_mode", params.sale_mode);
        if (params?.seller_id) queryParams.set("seller_id", params.seller_id);
        if (params?.status) queryParams.set("status", params.status);

        const res = await fetch(`/api/listings?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.listings) && data.listings.length > 0) {
            // Keep any locally created listings that might not yet be indexed
            const dbIds = new Set(data.listings.map((l: any) => l.id));
            const localOnly = this.listings.filter(l => !dbIds.has(l.id) && l.id.startsWith("lst-"));
            this.listings = [...localOnly, ...data.listings];
            this.save();
            return this.applyLocalFilters(this.listings, params);
          }
        }
      } catch (err) {
        console.warn("Could not fetch listings from cloud API, using local cache:", err);
      }
    }

    return this.applyLocalFilters(this.listings, params);
  }

  private applyLocalFilters(list: Listing[], params?: any): Listing[] {
    let result = [...list];

    if (params?.status) {
      result = result.filter(item => item.status === params.status);
    } else {
      // Default: exclude moderated
      result = result.filter(item => item.status !== 'moderated');
    }

    if (params?.seller_id) {
      result = result.filter(item => item.seller_id === params.seller_id);
    }

    if (params?.category && params.category !== 'all') {
      result = result.filter(item => item.category?.slug === params.category || item.category_id === params.category);
    }

    if (params?.condition && params.condition !== 'all') {
      result = result.filter(item => item.condition === params.condition);
    }

    if (params?.sale_mode && params.sale_mode !== 'all') {
      result = result.filter(item => item.sale_mode === params.sale_mode);
    }

    if (params?.minPrice !== undefined && params.minPrice > 0) {
      result = result.filter(item => {
        const p = item.sale_mode === 'auction' ? (item.current_bid || item.starting_bid || 0) : (item.price || 0);
        return p >= (params.minPrice || 0);
      });
    }

    if (params?.maxPrice !== undefined && params.maxPrice > 0) {
      result = result.filter(item => {
        const p = item.sale_mode === 'auction' ? (item.current_bid || item.starting_bid || 0) : (item.price || 0);
        return p <= (params.maxPrice || 0);
      });
    }

    if (params?.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.pickup_location.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (params?.sort === 'price_low') {
      result.sort((a, b) => {
        const pa = a.sale_mode === 'auction' ? (a.current_bid || a.starting_bid || 0) : (a.price || 0);
        const pb = b.sale_mode === 'auction' ? (b.current_bid || b.starting_bid || 0) : (b.price || 0);
        return pa - pb;
      });
    } else if (params?.sort === 'price_high') {
      result.sort((a, b) => {
        const pa = a.sale_mode === 'auction' ? (a.current_bid || a.starting_bid || 0) : (a.price || 0);
        const pb = b.sale_mode === 'auction' ? (b.current_bid || b.starting_bid || 0) : (b.price || 0);
        return pb - pa;
      });
    } else if (params?.sort === 'ending_soon') {
      result.sort((a, b) => {
        if (!a.auction_end) return 1;
        if (!b.auction_end) return -1;
        return new Date(a.auction_end).getTime() - new Date(b.auction_end).getTime();
      });
    } else if (params?.sort === 'popular') {
      result.sort((a, b) => (b.views_count + b.bid_count * 5) - (a.views_count + a.bid_count * 5));
    } else {
      // Default: newest first
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }

  async getListingById(id: string): Promise<Listing | null> {
    if (typeof window !== 'undefined') {
      this.processExpiredAuctions();
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.listing) {
            const idx = this.listings.findIndex(l => l.id === id);
            if (idx >= 0) {
              this.listings[idx] = data.listing;
            } else {
              this.listings.unshift(data.listing);
            }
            this.save();
            return data.listing;
          }
        }
      } catch (err) {
        console.warn("Could not fetch listing from cloud API:", err);
      }
    }
    const item = this.listings.find(l => l.id === id);
    if (!item) return null;
    return { ...item };
  }

  async createListing(
    data: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'bid_count'>,
    seller: Profile
  ): Promise<Listing> {
    const category = MOCK_CATEGORIES.find(c => c.id === data.category_id || c.slug === data.category_id) || MOCK_CATEGORIES[0];
    const newId = `lst-${Date.now().toString(36)}`;
    
    let createdListing: Listing = {
      ...data,
      id: newId,
      seller_id: seller.id,
      seller,
      category_id: category.id,
      category,
      views_count: 0,
      bid_count: 0,
      current_bid: data.sale_mode === 'auction' ? data.starting_bid : null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save directly to the cloud Supabase database so all devices and friends can view it immediately
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            seller,
            seller_id: seller.id,
          }),
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.listing) {
            createdListing = resData.listing;
          }
        }
      } catch (err) {
        console.error("Cloud listing creation error, saved locally:", err);
      }
    }

    this.listings.unshift(createdListing);
    this.save();
    return createdListing;
  }

  async updateListing(id: string, updates: Partial<Listing>, editorId: string): Promise<{ success: boolean; message: string; listing?: Listing }> {
    const index = this.listings.findIndex(l => l.id === id);
    if (index === -1) return { success: false, message: "Listing not found." };
    
    const listing = this.listings[index];
    if (listing.seller_id !== editorId) {
      return { success: false, message: "Unauthorized: You can only edit your own listings." };
    }

    // Integrity: If bids exist on auction, prevent changing key auction terms
    if (listing.sale_mode === 'auction' && listing.bid_count > 0) {
      if (updates.starting_bid && updates.starting_bid !== listing.starting_bid) {
        return { success: false, message: "Starting bid cannot be changed once bidding has begun." };
      }
      if (updates.auction_end && new Date(updates.auction_end).getTime() < new Date().getTime()) {
        return { success: false, message: "Auction end time cannot be set to the past." };
      }
    }

    const updated = {
      ...listing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        fetch(`/api/listings/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }).catch(e => console.warn("Cloud listing update warning:", e));
      } catch {}
    }

    this.listings[index] = updated;
    this.save();
    return { success: true, message: "Listing updated successfully.", listing: updated };
  }

  async deleteListing(id: string, userId: string): Promise<{ success: boolean; message: string }> {
    const index = this.listings.findIndex(l => l.id === id);
    if (index === -1) return { success: false, message: "Listing not found." };

    const listing = this.listings[index];
    if (listing.seller_id !== userId) {
      return { success: false, message: "Unauthorized: You can only delete your own listings." };
    }

    if (listing.sale_mode === 'auction' && listing.bid_count > 0) {
      return { success: false, message: "Cannot delete an auction with active bids to preserve auction integrity." };
    }

    if (typeof window !== 'undefined') {
      try {
        fetch(`/api/listings/${id}`, {
          method: 'DELETE',
        }).catch(e => console.warn("Cloud listing delete warning:", e));
      } catch {}
    }

    this.listings.splice(index, 1);
    this.save();
    return { success: true, message: "Listing deleted successfully." };
  }

  // --- ATOMIC BIDDING ---
  async placeBid(listingId: string, amount: number, bidder: Profile): Promise<{ success: boolean; message: string; current_bid?: number; auction_end?: string }> {
    const listing = this.listings.find(l => l.id === listingId);
    if (!listing) return { success: false, message: "Listing not found." };

    if (listing.sale_mode !== 'auction') {
      return { success: false, message: "This listing is not an auction." };
    }

    if (listing.status !== 'active') {
      return { success: false, message: "This auction is no longer active." };
    }

    if (listing.auction_end && new Date(listing.auction_end).getTime() <= new Date().getTime()) {
      listing.status = 'ended';
      this.save();
      return { success: false, message: "This auction has already ended." };
    }

    if (listing.seller_id === bidder.id) {
      return { success: false, message: "Sellers cannot bid on their own items." };
    }

    const currentHighest = listing.current_bid || listing.starting_bid || 0;
    const minRequired = listing.current_bid ? currentHighest + 1 : currentHighest;

    if (amount < minRequired) {
      return { success: false, message: `Bid must be at least ${formatCurrency(minRequired)}.` };
    }

    // Previous highest bidder
    const previousWinningBidderId = listing.winning_bidder_id;

    // Check anti-sniping: if bid placed in last 2 minutes, extend by 3 minutes
    let newEnd = listing.auction_end;
    if (listing.auction_end) {
      const msLeft = new Date(listing.auction_end).getTime() - new Date().getTime();
      if (msLeft > 0 && msLeft < 2 * 60 * 1000) {
        newEnd = new Date(new Date().getTime() + 3 * 60 * 1000).toISOString();
      }
    }

    // Record bid in bids history
    if (!this.bids[listingId]) {
      this.bids[listingId] = [];
    }

    // Outbid previous bids
    this.bids[listingId].forEach(b => {
      b.status = 'outbid';
    });

    const newBid = {
      id: `bid-${Date.now()}`,
      bidder_id: bidder.id,
      bidder_name: bidder.display_name,
      amount,
      time: new Date().toISOString(),
      status: 'active' as const
    };
    this.bids[listingId].unshift(newBid);

    // Update listing
    listing.current_bid = amount;
    listing.bid_count = (listing.bid_count || 0) + 1;
    listing.winning_bidder_id = bidder.id;
    listing.winning_bidder = bidder;
    listing.auction_end = newEnd;
    listing.updated_at = new Date().toISOString();

    // Sync to Supabase cloud database
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/bids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listing_id: listingId,
            amount,
            bidder_id: bidder.id,
          }),
        }).catch(e => console.warn("Supabase bid sync warning:", e));
      } catch {}
    }

    // Notify seller
    this.notifications.unshift({
      id: `notif-${Date.now()}-seller`,
      recipient_id: listing.seller_id,
      type: "new_bid",
      title: "New Bid Placed!",
      message: `${bidder.display_name} placed a bid of ${formatCurrency(amount)} on "${listing.title}".`,
      link: `/marketplace/listing/${listing.id}`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    // Notify outbid user
    if (previousWinningBidderId && previousWinningBidderId !== bidder.id) {
      this.notifications.unshift({
        id: `notif-${Date.now()}-outbid`,
        recipient_id: previousWinningBidderId,
        type: "outbid",
        title: "You've been outbid!",
        message: `Someone placed a higher bid of ${formatCurrency(amount)} on "${listing.title}".`,
        link: `/marketplace/listing/${listing.id}`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    this.save();
    return {
      success: true,
      message: "Bid placed successfully!",
      current_bid: amount,
      auction_end: newEnd || undefined
    };
  }

  async getBidsForListing(listingId: string) {
    return this.bids[listingId] || [];
  }

  // --- FIXED PRICE PURCHASE INTENT ---
  async requestPurchase(listingId: string, buyer: Profile, offeredPrice: number, notes?: string): Promise<{ success: boolean; message: string; purchase?: PurchaseRequest }> {
    const listing = this.listings.find(l => l.id === listingId);
    if (!listing) return { success: false, message: "Listing not found." };

    if (listing.status !== 'active') {
      return { success: false, message: `This item is already ${listing.status}.` };
    }

    if (listing.seller_id === buyer.id) {
      return { success: false, message: "You cannot purchase your own item." };
    }

    const purchase: PurchaseRequest = {
      id: `pr-${Date.now()}`,
      listing_id: listingId,
      listing,
      buyer_id: buyer.id,
      buyer,
      seller_id: listing.seller_id,
      seller: listing.seller,
      offered_price: offeredPrice,
      notes: notes || "Interested in campus pickup.",
      status: "requested",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.purchaseRequests.unshift(purchase);

    // Notify seller
    this.notifications.unshift({
      id: `notif-${Date.now()}-purchase`,
      recipient_id: listing.seller_id,
      type: "item_reserved",
      title: "Purchase Request Received!",
      message: `${buyer.display_name} requested to buy "${listing.title}" for ${formatCurrency(offeredPrice)}.`,
      link: `/dashboard`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    this.save();
    return { success: true, message: "Purchase request sent to seller! Check your dashboard and messages to coordinate handoff.", purchase };
  }

  async updatePurchaseStatus(purchaseId: string, status: 'reserved' | 'completed' | 'cancelled', actorId: string): Promise<{ success: boolean; message: string }> {
    const purchase = this.purchaseRequests.find(p => p.id === purchaseId);
    if (!purchase) return { success: false, message: "Purchase request not found." };

    if (purchase.seller_id !== actorId && purchase.buyer_id !== actorId) {
      return { success: false, message: "Unauthorized action." };
    }

    purchase.status = status;
    purchase.updated_at = new Date().toISOString();

    const listing = this.listings.find(l => l.id === purchase.listing_id);
    if (listing) {
      if (status === 'completed') {
        listing.status = 'sold';
      } else if (status === 'reserved') {
        listing.status = 'reserved';
      } else if (status === 'cancelled') {
        listing.status = 'active';
      }
    }

    this.save();
    return { success: true, message: `Status updated to ${status}.` };
  }

  async getPurchaseRequests(userId: string) {
    return this.purchaseRequests.filter(p => p.buyer_id === userId || p.seller_id === userId);
  }

  // --- MESSAGING ---
  async getConversations(userId: string): Promise<Conversation[]> {
    return this.conversations.filter(c => c.buyer_id === userId || c.seller_id === userId);
  }

  async getConversationById(convId: string, userId: string): Promise<Conversation | null> {
    const conv = this.conversations.find(c => c.id === convId);
    if (!conv) return null;
    if (conv.buyer_id !== userId && conv.seller_id !== userId) {
      return null; // Strict privacy
    }
    return conv;
  }

  async getMessages(convId: string, userId: string): Promise<Message[]> {
    const conv = this.conversations.find(c => c.id === convId);
    if (!conv) return [];
    if (conv.buyer_id !== userId && conv.seller_id !== userId) {
      return []; // Strict privacy
    }
    return this.messages[convId] || [];
  }

  async sendMessage(convId: string, senderId: string, content: string): Promise<Message | null> {
    const conv = this.conversations.find(c => c.id === convId);
    if (!conv) return null;
    if (conv.buyer_id !== senderId && conv.seller_id !== senderId) {
      return null;
    }

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: convId,
      sender_id: senderId,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    };

    if (!this.messages[convId]) {
      this.messages[convId] = [];
    }
    this.messages[convId].push(newMsg);

    // Update conversation preview
    conv.last_message_preview = content;
    conv.last_activity_at = new Date().toISOString();

    // Recipient
    const recipientId = conv.buyer_id === senderId ? conv.seller_id : conv.buyer_id;
    this.notifications.unshift({
      id: `notif-${Date.now()}-msg`,
      recipient_id: recipientId,
      type: "new_message",
      title: "New Message",
      message: content.length > 60 ? content.slice(0, 57) + "..." : content,
      link: `/messages/${convId}`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    this.save();
    return newMsg;
  }

  async startConversation(listingId: string, buyer: Profile, initialMessage: string): Promise<Conversation> {
    const listing = this.listings.find(l => l.id === listingId);
    if (!listing) throw new Error("Listing not found");

    // Existing check
    const existing = this.conversations.find(c => c.listing_id === listingId && c.buyer_id === buyer.id);
    if (existing) {
      if (initialMessage.trim()) {
        await this.sendMessage(existing.id, buyer.id, initialMessage);
      }
      return existing;
    }

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      listing_id: listingId,
      listing,
      buyer_id: buyer.id,
      buyer,
      seller_id: listing.seller_id,
      seller: listing.seller,
      last_message_preview: initialMessage,
      last_activity_at: new Date().toISOString(),
      unread_count: 0,
      created_at: new Date().toISOString()
    };

    this.conversations.unshift(newConv);
    this.messages[newConv.id] = [];

    if (initialMessage.trim()) {
      await this.sendMessage(newConv.id, buyer.id, initialMessage);
    }

    this.save();
    return newConv;
  }

  // --- FAVORITES ---
  async toggleFavorite(userId: string, listingId: string): Promise<boolean> {
    if (!this.favorites[userId]) {
      this.favorites[userId] = [];
    }

    const index = this.favorites[userId].indexOf(listingId);
    let favorited = false;
    if (index >= 0) {
      this.favorites[userId].splice(index, 1);
      favorited = false;
    } else {
      this.favorites[userId].push(listingId);
      favorited = true;
    }

    this.save();
    return favorited;
  }

  async isFavorited(userId: string, listingId: string): Promise<boolean> {
    if (!this.favorites[userId]) return false;
    return this.favorites[userId].includes(listingId);
  }

  async getFavorites(userId: string): Promise<Listing[]> {
    const favIds = this.favorites[userId] || [];
    return this.listings.filter(l => favIds.includes(l.id));
  }

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notifications.filter(n => n.recipient_id === userId);
  }

  async markNotificationAsRead(notifId: string): Promise<void> {
    const notif = this.notifications.find(n => n.id === notifId);
    if (notif) {
      notif.is_read = true;
      this.save();
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    this.notifications.forEach(n => {
      if (n.recipient_id === userId) {
        n.is_read = true;
      }
    });
    this.save();
  }

  // --- SAFETY & MODERATION ---
  async submitReport(report: Omit<Report, 'id' | 'status' | 'created_at'>): Promise<Report> {
    const newReport: Report = {
      ...report,
      id: `rep-${Date.now()}`,
      status: "pending",
      created_at: new Date().toISOString()
    };
    this.reports.unshift(newReport);
    this.save();
    return newReport;
  }

  async getReports(): Promise<Report[]> {
    return this.reports;
  }

  async resolveReport(reportId: string, status: ReportStatus, moderatorNotes: string, actionTaken: string): Promise<boolean> {
    const rep = this.reports.find(r => r.id === reportId);
    if (!rep) return false;

    rep.status = status;
    rep.moderator_notes = moderatorNotes;
    rep.action_taken = actionTaken;
    rep.resolved_at = new Date().toISOString();

    if (actionTaken === 'remove_listing' && rep.reported_listing_id) {
      const listing = this.listings.find(l => l.id === rep.reported_listing_id);
      if (listing) {
        listing.status = 'moderated';
      }
    }

    this.save();
    return true;
  }

  // --- AUCTION EXPIRY CRON / WORKER ---
  processExpiredAuctions() {
    const nowTime = new Date().getTime();
    this.listings.forEach(listing => {
      if (listing.sale_mode === 'auction' && listing.status === 'active' && listing.auction_end) {
        if (new Date(listing.auction_end).getTime() <= nowTime) {
          // Auction expired!
          if (listing.current_bid && listing.winning_bidder_id) {
            // Check reserve price
            if (listing.reserve_price && listing.current_bid < listing.reserve_price) {
              listing.status = 'ended'; // Reserve not met
              this.notifications.unshift({
                id: `notif-reserve-not-met-${listing.id}`,
                recipient_id: listing.seller_id,
                type: "auction_ended",
                title: "Auction Ended - Reserve Not Met",
                message: `Your auction for "${listing.title}" ended at ${formatCurrency(listing.current_bid)}, which did not meet your secret reserve price of ${formatCurrency(listing.reserve_price)}.`,
                link: `/marketplace/listing/${listing.id}`,
                is_read: false,
                created_at: new Date().toISOString()
              });
            } else {
              // Valid Winner!
              listing.status = 'sold';
              // Notify seller
              this.notifications.unshift({
                id: `notif-sold-${listing.id}`,
                recipient_id: listing.seller_id,
                type: "item_sold",
                title: "Auction Won!",
                message: `Congratulations! "${listing.title}" was won by ${listing.winning_bidder?.display_name || 'winning bidder'} for ${formatCurrency(listing.current_bid)}.`,
                link: `/marketplace/listing/${listing.id}`,
                is_read: false,
                created_at: new Date().toISOString()
              });
              // Notify winner
              this.notifications.unshift({
                id: `notif-won-${listing.id}`,
                recipient_id: listing.winning_bidder_id,
                type: "auction_won",
                title: "You Won the Auction!",
                message: `You won "${listing.title}" with a final bid of ${formatCurrency(listing.current_bid)}! Arrange campus pickup with the seller now.`,
                link: `/marketplace/listing/${listing.id}`,
                is_read: false,
                created_at: new Date().toISOString()
              });
            }
          } else {
            listing.status = 'ended';
          }
        }
      }
    });
  }
}

// Export singleton instance
export const marketplaceStore = new MarketplaceStore();
