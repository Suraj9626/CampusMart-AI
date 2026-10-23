-- =====================================================================
-- CAMPUSMART AI - INITIAL DATABASE SCHEMA & ROW-LEVEL SECURITY POLICIES
-- =====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with student-specific academic information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    college_email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    department TEXT NOT NULL DEFAULT 'Undeclared',
    academic_year TEXT NOT NULL DEFAULT 'Freshman', -- Freshman, Sophomore, Junior, Senior, Graduate, Alumni
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'moderator', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for searching profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 3. LISTINGS TABLE
-- Supports both fixed-price products and auctions
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
    sale_mode TEXT NOT NULL CHECK (sale_mode IN ('fixed_price', 'auction')),
    
    -- Pricing
    price NUMERIC(10, 2), -- required for fixed_price
    starting_bid NUMERIC(10, 2), -- required for auction
    current_bid NUMERIC(10, 2), -- highest current bid
    bid_count INT NOT NULL DEFAULT 0,
    buy_now_price NUMERIC(10, 2), -- optional instant-purchase price for auctions
    reserve_price NUMERIC(10, 2), -- secret minimum threshold for seller
    
    -- Auction Timestamps
    auction_start TIMESTAMPTZ,
    auction_end TIMESTAMPTZ,
    
    -- Location & Delivery
    pickup_location TEXT NOT NULL DEFAULT 'On Campus (Student Union / Library)',
    
    -- Listing Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'sold', 'ended', 'cancelled', 'moderated')),
    winning_bidder_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    views_count INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_seller ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_sale_mode ON public.listings(sale_mode);
CREATE INDEX IF NOT EXISTS idx_listings_auction_end ON public.listings(auction_end);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- 4. LISTING IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON public.listing_images(listing_id);

-- 5. BIDS TABLE (Strict Auction Integrity)
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'outbid', 'won', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bids_listing ON public.bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON public.bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON public.bids(listing_id, amount DESC);

-- 6. PURCHASE REQUESTS TABLE (Fixed-Price Purchase Intent)
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    offered_price NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'reserved', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_buyer ON public.purchase_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_seller ON public.purchase_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_listing ON public.purchase_requests(listing_id);

-- 7. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message_preview TEXT,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_buyer_seller_listing UNIQUE(listing_id, buyer_id, seller_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON public.conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_activity ON public.conversations(last_activity_at DESC);

-- 8. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- 9. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_message', 'new_bid', 'outbid', 'auction_won', 'auction_ended', 'item_reserved', 'item_sold', 'moderation_alert')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(recipient_id, is_read);

-- 11. REPORTS TABLE (Moderation & Safety)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reported_listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    reason TEXT NOT NULL CHECK (reason IN ('scam', 'prohibited_item', 'harassment', 'inappropriate_content', 'spam', 'other')),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    moderator_notes TEXT,
    action_taken TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper check function for admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role IN ('admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (status = 'active' OR auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())); -- Prevent self-escalation

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone"
    ON public.categories FOR SELECT
    USING (is_active = TRUE OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can modify categories"
    ON public.categories FOR ALL
    USING (public.is_admin(auth.uid()));

-- Listings Policies
CREATE POLICY "Active listings are viewable by everyone"
    ON public.listings FOR SELECT
    USING (status != 'moderated' OR auth.uid() = seller_id OR public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can create listings"
    ON public.listings FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings"
    ON public.listings FOR UPDATE
    USING (auth.uid() = seller_id OR public.is_admin(auth.uid()));

CREATE POLICY "Sellers can delete their own listings if no bids"
    ON public.listings FOR DELETE
    USING (auth.uid() = seller_id AND bid_count = 0);

-- Listing Images Policies
CREATE POLICY "Listing images are viewable by everyone"
    ON public.listing_images FOR SELECT
    USING (TRUE);

CREATE POLICY "Sellers can insert listing images"
    ON public.listing_images FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE id = listing_id AND seller_id = auth.uid()
        )
    );

CREATE POLICY "Sellers can delete listing images"
    ON public.listing_images FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE id = listing_id AND seller_id = auth.uid()
        )
    );

-- Bids Policies
CREATE POLICY "Bids are viewable by authenticated users"
    ON public.bids FOR SELECT
    USING (auth.role() = 'authenticated');

-- Atomic bidding function (preferred over raw insert)
CREATE POLICY "Authenticated users can insert bids"
    ON public.bids FOR INSERT
    WITH CHECK (auth.uid() = bidder_id);

-- Purchase Requests Policies
CREATE POLICY "Buyers and sellers can view their purchase requests"
    ON public.purchase_requests FOR SELECT
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.is_admin(auth.uid()));

CREATE POLICY "Buyers can create purchase requests"
    ON public.purchase_requests FOR INSERT
    WITH CHECK (auth.uid() = buyer_id AND buyer_id != seller_id);

CREATE POLICY "Buyers and sellers can update their purchase requests"
    ON public.purchase_requests FOR UPDATE
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Conversations Policies (Strict Privacy)
CREATE POLICY "Participants can view their conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can start conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() = buyer_id AND buyer_id != seller_id);

-- Messages Policies (Strict Participant Privacy)
CREATE POLICY "Participants can view conversation messages"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

CREATE POLICY "Participants can insert messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

CREATE POLICY "Participants can mark messages as read"
    ON public.messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

-- Favorites Policies
CREATE POLICY "Users can manage their own favorites"
    ON public.favorites FOR ALL
    USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view and manage their own notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = recipient_id);

-- Reports Policies
CREATE POLICY "Users can create reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view and manage reports"
    ON public.reports FOR ALL
    USING (public.is_admin(auth.uid()));

-- Audit Logs Policies
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin(auth.uid()));

-- =====================================================================
-- STORED FUNCTIONS & PROCEDURES (ATOMIC AUCTION LOGIC & INTEGRITY)
-- =====================================================================

-- 1. Atomic Bid Placement with Anti-Sniping Protection
CREATE OR REPLACE FUNCTION public.place_auction_bid(
    p_listing_id UUID,
    p_bid_amount NUMERIC(10, 2),
    p_bidder_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_listing RECORD;
    v_min_bid NUMERIC(10, 2);
    v_new_end_time TIMESTAMPTZ;
    v_sniping_window INTERVAL := INTERVAL '2 minutes';
    v_extension_interval INTERVAL := INTERVAL '3 minutes';
    v_outbid_bidder_id UUID;
BEGIN
    -- Acquire exclusive row lock on listing to prevent race conditions
    SELECT * INTO v_listing
    FROM public.listings
    WHERE id = p_listing_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Listing not found.');
    END IF;

    IF v_listing.sale_mode != 'auction' THEN
        RETURN jsonb_build_object('success', false, 'message', 'This item is not for auction.');
    END IF;

    IF v_listing.status != 'active' THEN
        RETURN jsonb_build_object('success', false, 'message', 'This auction is no longer active.');
    END IF;

    IF NOW() >= v_listing.auction_end THEN
        RETURN jsonb_build_object('success', false, 'message', 'Auction has already ended.');
    END IF;

    IF v_listing.seller_id = p_bidder_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Sellers cannot bid on their own items.');
    END IF;

    -- Calculate minimum required bid (current bid + increment, or starting bid)
    IF v_listing.current_bid IS NULL OR v_listing.current_bid = 0 THEN
        v_min_bid := v_listing.starting_bid;
    ELSE
        -- Minimum increment of $1 or 5% whichever is appropriate
        v_min_bid := v_listing.current_bid + 1.00;
    END IF;

    IF p_bid_amount < v_min_bid THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', format('Bid must be at least $%s.', v_min_bid)
        );
    END IF;

    -- Remember previous highest bidder for outbid notification
    v_outbid_bidder_id := v_listing.winning_bidder_id;

    -- Mark previous active bids for this listing as outbid
    UPDATE public.bids
    SET status = 'outbid'
    WHERE listing_id = p_listing_id AND status = 'active';

    -- Insert new bid
    INSERT INTO public.bids (listing_id, bidder_id, amount, status)
    VALUES (p_listing_id, p_bidder_id, p_bid_amount, 'active');

    -- Anti-sniping: Check if within last 2 minutes
    v_new_end_time := v_listing.auction_end;
    IF (v_listing.auction_end - NOW()) < v_sniping_window THEN
        v_new_end_time := NOW() + v_extension_interval;
    END IF;

    -- Update listing with new highest bid and winner candidate
    UPDATE public.listings
    SET current_bid = p_bid_amount,
        winning_bidder_id = p_bidder_id,
        bid_count = bid_count + 1,
        auction_end = v_new_end_time,
        updated_at = NOW()
    WHERE id = p_listing_id;

    -- Dispatch notification to seller
    INSERT INTO public.notifications (recipient_id, type, title, message, link)
    VALUES (
        v_listing.seller_id,
        'new_bid',
        'New Bid Placed',
        format('A new bid of $%s was placed on "%s".', p_bid_amount, v_listing.title),
        format('/marketplace/listing/%s', p_listing_id)
    );

    -- Dispatch notification to outbid student if applicable
    IF v_outbid_bidder_id IS NOT NULL AND v_outbid_bidder_id != p_bidder_id THEN
        INSERT INTO public.notifications (recipient_id, type, title, message, link)
        VALUES (
            v_outbid_bidder_id,
            'outbid',
            'You have been outbid!',
            format('Someone placed a higher bid of $%s on "%s".', p_bid_amount, v_listing.title),
            format('/marketplace/listing/%s', p_listing_id)
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Bid placed successfully!',
        'current_bid', p_bid_amount,
        'auction_end', v_new_end_time
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Safe Trigger to Auto-Create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, college_email, avatar_url, department, academic_year, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        COALESCE(NEW.raw_user_meta_data->>'department', 'General Studies'),
        COALESCE(NEW.raw_user_meta_data->>'academic_year', 'Freshman'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users if available
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
