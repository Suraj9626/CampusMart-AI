export type UserRole = 'student' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned';

export interface Profile {
  id: string;
  display_name: string;
  college_email: string;
  avatar_url?: string | null;
  department: string;
  academic_year: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate' | 'Alumni';
  bio?: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair';
export type SaleMode = 'fixed_price' | 'auction';
export type ListingStatus = 'active' | 'reserved' | 'sold' | 'ended' | 'cancelled' | 'moderated';

export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  seller?: Profile;
  category_id: string;
  category?: Category;
  title: string;
  description: string;
  condition: ProductCondition;
  sale_mode: SaleMode;
  price?: number | null;
  starting_bid?: number | null;
  current_bid?: number | null;
  bid_count: number;
  buy_now_price?: number | null;
  reserve_price?: number | null;
  auction_start?: string | null;
  auction_end?: string | null;
  pickup_location: string;
  status: ListingStatus;
  winning_bidder_id?: string | null;
  winning_bidder?: Profile | null;
  views_count: number;
  images: ListingImage[];
  is_favorited?: boolean;
  created_at: string;
  updated_at: string;
}

export type BidStatus = 'active' | 'outbid' | 'won' | 'rejected';

export interface Bid {
  id: string;
  listing_id: string;
  bidder_id: string;
  bidder?: Profile;
  amount: number;
  status: BidStatus;
  created_at: string;
}

export type PurchaseRequestStatus = 'requested' | 'reserved' | 'completed' | 'cancelled';

export interface PurchaseRequest {
  id: string;
  listing_id: string;
  listing?: Listing;
  buyer_id: string;
  buyer?: Profile;
  seller_id: string;
  seller?: Profile;
  offered_price: number;
  notes?: string | null;
  status: PurchaseRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  listing?: Listing;
  buyer_id: string;
  buyer?: Profile;
  seller_id: string;
  seller?: Profile;
  last_message_preview?: string | null;
  last_activity_at: string;
  unread_count?: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: Profile;
  content: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface Favorite {
  user_id: string;
  listing_id: string;
  created_at: string;
}

export type NotificationType = 
  | 'new_message'
  | 'new_bid'
  | 'outbid'
  | 'auction_won'
  | 'auction_ended'
  | 'item_reserved'
  | 'item_sold'
  | 'moderation_alert';

export interface Notification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

export type ReportReason = 'scam' | 'prohibited_item' | 'harassment' | 'inappropriate_content' | 'spam' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'action_taken';

export interface Report {
  id: string;
  reporter_id: string;
  reporter?: Profile;
  reported_user_id?: string | null;
  reported_user?: Profile | null;
  reported_listing_id?: string | null;
  reported_listing?: Listing | null;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  moderator_notes?: string | null;
  action_taken?: string | null;
  created_at: string;
  resolved_at?: string | null;
}
