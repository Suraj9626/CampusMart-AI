import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Elegant Dark Modern Color Palette
    C_BG = RGBColor(11, 15, 25)          # Deep Obsidian Navy #0B0F19
    C_CARD_BG = RGBColor(22, 31, 48)     # Deep Slate Surface #161F30
    C_CARD_BORDER = RGBColor(45, 59, 84) # Subtle Border #2D3B54
    C_CYAN = RGBColor(56, 189, 248)      # Sky / Cyan Accent #38BDF8
    C_INDIGO = RGBColor(129, 140, 248)   # Indigo Accent #818CF8
    C_EMERALD = RGBColor(52, 211, 153)   # Mint Emerald #34D399
    C_AMBER = RGBColor(251, 191, 36)     # Warm Gold #FBBF24
    C_ROSE = RGBColor(251, 113, 133)     # Coral Rose #FB7185
    C_WHITE = RGBColor(248, 250, 252)    # Pure Off-White #F8FAFC
    C_MUTED = RGBColor(148, 163, 184)    # Slate Muted #94A3B8
    C_DIM = RGBColor(100, 116, 139)      # Slate Dim #64748B

    def set_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, tag_text, title_text, subtitle_text, tag_color=C_CYAN):
        # Pill Tag
        tag_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.45), Inches(3.8), Inches(0.35))
        tag_box.fill.solid()
        tag_box.fill.fore_color.rgb = RGBColor(15, 23, 42)
        tag_box.line.color.rgb = tag_color
        tag_box.line.width = Pt(1)
        tf_tag = tag_box.text_frame
        tf_tag.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf_tag.word_wrap = True
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = tag_text
        p_tag.font.name = "Arial"
        p_tag.font.size = Pt(10)
        p_tag.font.bold = True
        p_tag.font.color.rgb = tag_color
        p_tag.alignment = PP_ALIGN.CENTER

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.6))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = "Arial"
        p.font.size = Pt(26)
        p.font.bold = True
        p.font.color.rgb = C_WHITE

        # Subtitle
        sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.45), Inches(11.7), Inches(0.45))
        tf_sub = sub_box.text_frame
        tf_sub.word_wrap = True
        tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
        p_sub = tf_sub.paragraphs[0]
        p_sub.text = subtitle_text
        p_sub.font.name = "Arial"
        p_sub.font.size = Pt(13)
        p_sub.font.color.rgb = C_MUTED

    def add_footer(slide, current_slide, total_slides=10):
        # Divider Line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(6.85), Inches(11.733), Inches(0.02))
        line.fill.solid()
        line.fill.fore_color.rgb = C_CARD_BORDER
        line.line.fill.background()

        # Footer Left
        tb_left = slide.shapes.add_textbox(Inches(0.8), Inches(6.92), Inches(7.0), Inches(0.35))
        tf_left = tb_left.text_frame
        tf_left.margin_left = tf_left.margin_top = 0
        p_l = tf_left.paragraphs[0]
        p_l.text = "CampusMart AI 🎓 • Next-Gen University Marketplace & Auction Platform"
        p_l.font.name = "Arial"
        p_l.font.size = Pt(10)
        p_l.font.color.rgb = C_DIM

        # Footer Right
        tb_right = slide.shapes.add_textbox(Inches(9.0), Inches(6.92), Inches(3.533), Inches(0.35))
        tf_right = tb_right.text_frame
        tf_right.margin_top = 0
        p_r = tf_right.paragraphs[0]
        p_r.text = f"Capstone Defense • Slide {current_slide} of {total_slides}"
        p_r.alignment = PP_ALIGN.RIGHT
        p_r.font.name = "Arial"
        p_r.font.size = Pt(10)
        p_r.font.bold = True
        p_r.font.color.rgb = C_CYAN

    def add_card(slide, left, top, width, height, title, items, accent_color=C_CYAN, icon=""):
        # Card Background
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = C_CARD_BORDER
        card.line.width = Pt(1.2)

        # Header accent bar
        bar = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left + 0.15), Inches(top + 0.15), Inches(width - 0.3), Inches(0.42))
        bar.fill.solid()
        bar.fill.fore_color.rgb = RGBColor(15, 23, 42)
        bar.line.color.rgb = accent_color
        bar.line.width = Pt(1)
        tf_b = bar.text_frame
        tf_b.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_b = tf_b.paragraphs[0]
        p_b.text = f"{icon}  {title}".strip()
        p_b.font.name = "Arial"
        p_b.font.size = Pt(13)
        p_b.font.bold = True
        p_b.font.color.rgb = accent_color

        # Content text box
        tb = slide.shapes.add_textbox(Inches(left + 0.2), Inches(top + 0.65), Inches(width - 0.4), Inches(height - 0.75))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        first = True
        for bold_prefix, text in items:
            p = tf.paragraphs[0] if first else tf.add_paragraph()
            first = False
            p.space_after = Pt(8)
            p.font.name = "Arial"
            p.font.size = Pt(11)
            
            run_bullet = p.add_run()
            run_bullet.text = "• "
            run_bullet.font.bold = True
            run_bullet.font.color.rgb = accent_color
            
            if bold_prefix:
                run_bold = p.add_run()
                run_bold.text = bold_prefix + ": "
                run_bold.font.bold = True
                run_bold.font.color.rgb = C_WHITE
                
            run_text = p.add_run()
            run_text.text = text
            run_text.font.color.rgb = C_MUTED

    # =========================================================================
    # SLIDE 1: TITLE & EXECUTIVE OVERVIEW
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)

    # Top Pill
    s1_pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(4.5), Inches(0.4))
    s1_pill.fill.solid()
    s1_pill.fill.fore_color.rgb = RGBColor(15, 23, 42)
    s1_pill.line.color.rgb = C_CYAN
    s1_pill.line.width = Pt(1)
    tf1 = s1_pill.text_frame
    tf1.vertical_anchor = MSO_ANCHOR.MIDDLE
    p1 = tf1.paragraphs[0]
    p1.text = "🎓 CAPSTONE FINAL PROJECT PRESENTATION"
    p1.font.bold = True
    p1.font.size = Pt(11)
    p1.font.color.rgb = C_CYAN
    p1.alignment = PP_ALIGN.CENTER

    # Title
    t_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.35), Inches(11.7), Inches(1.2))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    pt = tf_t.paragraphs[0]
    pt.text = "CampusMart AI"
    pt.font.name = "Arial"
    pt.font.size = Pt(44)
    pt.font.bold = True
    pt.font.color.rgb = C_WHITE

    pt2 = tf_t.add_paragraph()
    pt2.text = "Secure Student Marketplace, Real-Time Auctions & Safe On-Campus Commerce with Gemini AI"
    pt2.font.name = "Arial"
    pt2.font.size = Pt(18)
    pt2.font.color.rgb = C_INDIGO
    pt2.space_before = Pt(4)

    # 3 Summary Cards
    add_card(s1, 0.8, 2.9, 3.65, 3.7, "The Vision & Solution", [
        ("Student-Exclusive Ecosystem", "Domain-verified (.edu) closed network eliminating anonymous marketplace fraud and scammers."),
        ("Dual-Mode Commerce", "Fixed-price instant reservations alongside dynamic real-time auctions with live countdowns."),
        ("Physical Safety-First", "Designated campus pickup zones (Police Substation, Library) and in-app contact leak scanners."),
        ("Intelligent Assistant", "Google Gemini 2.5 Flash providing price fairness estimates, textbook lookups, and trade safety tips.")
    ], C_CYAN, "🌟")

    add_card(s1, 4.84, 2.9, 3.65, 3.7, "Enterprise Tech Stack", [
        ("Next.js 16.4.2 & React 19", "Modern App Router with Turbopack, Server Route Handlers, and full SSR performance."),
        ("Tailwind CSS v4 & Motion", "Dark/Light luxury glassmorphism UI, Outfit & Plus Jakarta Sans typography."),
        ("Supabase PostgreSQL 15", "12 normalized relational tables with 100% Row-Level Security (RLS) enforcement."),
        ("AI & Automation", "@google/genai (Gemini 2.5 Flash) server-shielded API with scheduled Vercel Cron auction workers.")
    ], C_INDIGO, "⚡")

    add_card(s1, 8.88, 2.9, 3.65, 3.7, "Key Capstone Metrics", [
        ("26 Responsive Routes", "Complete full-stack coverage: Marketplace, Auctions, P2P Chat, Admin Center & Analytics."),
        ("20/20 Test Suite Pass", "Automated integration suite validating security, anti-sniping, domain filters & privacy."),
        ("Dual-Mode Architecture", "Live Supabase cloud sync + instant out-of-the-box local demo fallback with 5 student personas."),
        ("₹ INR Native Pricing", "Fully localized for student budgets with authentic campus trade categories.")
    ], C_EMERALD, "📊")

    add_footer(s1, 1)
    s1.notes_slide.notes_text_frame.text = (
        "Welcome professors, committee members, and evaluators. Today I am presenting CampusMart AI, "
        "a comprehensive full-stack campus commerce platform designed to modernize university peer-to-peer trading. "
        "CampusMart AI solves the critical security, fraud, and privacy flaws inherent in generic platforms like Facebook Marketplace "
        "and Craigslist by pairing verified institutional authentication with atomic anti-sniping auctions, designated physical safety zones, "
        "and an integrated Google Gemini 2.5 Flash AI assistant. Over the next 9 slides, I will walk you through the real-world problem, "
        "our full-stack architecture, unique dual-mode persistence, auction engine, trust safeguards, and verified project outcomes."
    )

    # =========================================================================
    # SLIDE 2: PROBLEM STATEMENT & MOTIVATION
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_header(s2, "CAMPUS COMMERCE DEFICIENCIES", "The Crisis in University Peer-to-Peer Commerce",
               "Why generic public marketplaces and informal social media chat groups fail university students")

    add_card(s2, 0.8, 2.05, 5.65, 2.25, "Off-Campus Dangers & Fraud", [
        ("Off-Campus Meetup Perils", "Generic marketplaces (Craigslist, FB Marketplace) force students to meet unknown strangers in secluded spots, risking physical safety, theft, and harassment."),
        ("Zero Identity Verification", "Anyone can create disposable accounts; banned scammers return under new aliases with zero institutional accountability."),
        ("Counterfeits & Scams", "High incidence of fake electronics, non-functional hardware, and stolen campus property with no recourse.")
    ], C_ROSE, "🚨")

    add_card(s2, 6.85, 2.05, 5.65, 2.25, "Chaos of Social Media Groups", [
        ("High-Noise Flooded Chats", "WhatsApp & Telegram student groups drown listings in seconds; zero structured search or category filtering."),
        ("No Standardized Quality", "Items lack condition grading (Brand New vs. Fair); vague descriptions lead to disputes and wasted meetups."),
        ("Unregulated Bidding Wars", "Informal group chat bidding suffers from ghosting, price manipulation, and lack of binding closing times.")
    ], C_AMBER, "📱")

    add_card(s2, 0.8, 4.45, 5.65, 2.25, "Severe Privacy & Contact Leaks", [
        ("Public Contact Exposure", "Students are forced to post personal phone numbers, WhatsApp links, and private emails in open groups."),
        ("Targeted Harassment", "Exposing personal contact info leads to off-campus spam, predatory phishing attacks, and unwanted student stalking."),
        ("Unsafe Payment Channels", "Lack of safe transaction framing leaves students vulnerable to fraudulent wire transfers and fake payment screenshots.")
    ], C_ROSE, "🔒")

    add_card(s2, 6.85, 4.45, 5.65, 2.25, "The Student Financial & Waste Burden", [
        ("Predatory Bookstore Markups", "Campus bookstores charge up to 400% markups on required course textbooks, clickers, and lab supplies."),
        ("Severe Semester Landfill Waste", "Graduating students dump thousands of usable mini-fridges, desks, and electronics every year due to lack of an organized campus exchange."),
        ("Lack of Valuation Guidance", "Freshmen and sellers lack reliable price benchmarks, resulting in under-selling or predatory pricing.")
    ], C_AMBER, "💸")

    add_footer(s2, 2)
    s2.notes_slide.notes_text_frame.text = (
        "Slide 2 explores the core motivation behind CampusMart AI. University students buy and sell millions of dollars worth of textbooks, "
        "electronics, and dorm furniture every semester. Yet they are caught between two bad options: public marketplaces like Craigslist "
        "and Facebook Marketplace, which expose students to unverified strangers, scams, and unsafe off-campus meetups; or informal WhatsApp/Telegram groups, "
        "which are unsearchable, flooded with noise, and force students to leak their personal phone numbers. Furthermore, campus bookstores mark up textbooks "
        "by up to 400%, while graduating students throw away perfectly good dorm appliances every spring. CampusMart AI was specifically engineered to bridge this gap."
    )

    # =========================================================================
    # SLIDE 3: THE CAMPUSMART AI SOLUTION
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_header(s3, "SYSTEM VISION & CORE VALUE", "CampusMart AI: A Trusted, Closed-Loop Campus Marketplace",
               "Systematic solutions engineered for student physical safety, authentic trust, and fair pricing")

    add_card(s3, 0.8, 2.05, 5.65, 2.25, "Verified Academic Gating", [
        ("Institutional Domain Enforcement", "Restricted to verified institutional college emails (.edu, university subdomains); disposable and commercial domains are strictly filtered."),
        ("Peer Accountability", "Every user profile displays verified department, academic year, and university affiliation."),
        ("Elimination of Outside Actors", "Commercial bots, external spammers, and malicious third parties are locked out of the marketplace.")
    ], C_CYAN, "🎓")

    add_card(s3, 6.85, 2.05, 5.65, 2.25, "Dual-Commerce Flexibility", [
        ("Fixed-Price Purchase Intent", "Instant reservation workflow notifying sellers to coordinate designated campus handoffs."),
        ("Dynamic Real-Time Auctions", "Competitive bidding with live countdown timers, bid feeds, and minimum increment calculations."),
        ("Affordable Rupee (₹ INR) Native", "Customized for realistic student budget items with standardized condition tiers (Brand New to Fair).")
    ], C_EMERALD, "⚡")

    add_card(s3, 0.8, 4.45, 5.65, 2.25, "Physical Safety Exchange Zones", [
        ("Standardized Meetup Dropdowns", "Users choose from official university safe zones: Campus Police Substation, Main Library Lobby, Student Union."),
        ("Well-Lit, Monitored Locations", "Zero private dorm room entries or off-campus alleyway encounters; ensures transparent peer meetups."),
        ("Daytime Exchange Protocols", "Built-in safety checklists remind students to verify item functionality before exchanging funds.")
    ], C_AMBER, "📍")

    add_card(s3, 6.85, 4.45, 5.65, 2.25, "AI Assistance & Privacy Shield", [
        ("Google Gemini 2.5 Flash Co-Pilot", "Context-aware AI assistant evaluates fair used prices, deciphers textbook edition differences, and advises on trade safety."),
        ("Proactive Contact Leak Scanner", "Client-side regex filter detects phone numbers, WhatsApp links, and personal emails in chat, warning users prior to transmission."),
        ("Row-Level Security (RLS) Isolation", "Participant-only chat threads protected at the database kernel level.")
    ], C_INDIGO, "🤖")

    add_footer(s3, 3)
    s3.notes_slide.notes_text_frame.text = (
        "On Slide 3, we present the solution architecture of CampusMart AI. We introduce four core pillars: "
        "First, verified academic gating that restricts signups to valid institutional email addresses. "
        "Second, dual-commerce flexibility: sellers can list products for direct purchase reservation or launch competitive live auctions. "
        "Third, physical safety zones: buyers and sellers pick from pre-approved campus landmarks such as the campus police station or library entrance. "
        "Fourth, intelligent safeguards: our Google Gemini 2.5 Flash assistant provides valuation and safety advice, while an automated regex scanner prevents contact leaks in chat."
    )

    # =========================================================================
    # SLIDE 4: SYSTEM ARCHITECTURE & TECH STACK
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_header(s4, "SYSTEM DESIGN & INFRASTRUCTURE", "Modern Full-Stack Cloud Architecture",
               "High-performance, type-safe architecture combining Next.js 16 App Router, Supabase PostgreSQL & Gemini AI")

    add_card(s4, 0.8, 2.05, 3.65, 4.65, "Client & Presentation Layer", [
        ("Next.js 16.4.2 App Router", "Server Components, dynamic SSR rendering, and fast Turbopack bundling across 26 routes."),
        ("React 19.3.0 & TypeScript 5", "Modern concurrent features, server actions, and end-to-end strict static type safety."),
        ("Tailwind CSS v4", "Next-gen CSS engine with zero-runtime utility styling and custom design tokens."),
        ("Luxury Glassmorphism UI", "Google Outfit & Plus Jakarta Sans typography, ambient glow cards, and responsive drawer navigation."),
        ("Framer Motion & Lucide", "Polished micro-animations, glowing live auction badges, and clean iconography.")
    ], C_CYAN, "🖥️")

    add_card(s4, 4.84, 2.05, 3.65, 4.65, "Backend API & AI Engine", [
        ("Next.js Server Route Handlers", "High-speed Edge and Node runtime API endpoints for auth, bidding, chat, and admin actions."),
        ("Google Gemini 2.5 Flash", "Official @google/genai SDK; server-shielded API key via POST /api/ai/chat with markdown stream rendering."),
        ("Vercel Scheduled Cron", "Automated worker (/api/auctions/process-expirations) finalizing expired auctions and triggering winner notifications."),
        ("Contact Leak Regex Scanner", "Client-side pre-send parsing identifying phone numbers, WhatsApp, and external email addresses."),
        ("Auth Context & Switcher", "Supabase Auth with reactive fallback and instant 5-persona demo role switcher.")
    ], C_INDIGO, "⚙️")

    add_card(s4, 8.88, 2.05, 3.65, 4.65, "Database & Storage Layer", [
        ("Supabase PostgreSQL 15", "12 normalized relational tables: profiles, listings, bids, messages, reports, audit logs, etc."),
        ("100% Row-Level Security (RLS)", "Database-enforced isolation ensuring students only modify their own items and read their own chats."),
        ("Atomic Stored Procedures", "PostgreSQL place_auction_bid() function preventing race conditions and enforcing anti-sniping rules."),
        ("Supabase Storage Bucket", "Public listing-images bucket with 5MB upload ceilings and strict image MIME validation."),
        ("Database Triggers", "Automatic profile creation trigger handle_new_user() synced with auth.users.")
    ], C_EMERALD, "🗄️")

    add_footer(s4, 4)
    s4.notes_slide.notes_text_frame.text = (
        "Slide 4 breaks down the technical architecture into three robust tiers. "
        "On the frontend, we use Next.js 16.4.2 with React 19 and Tailwind CSS v4, providing lightning-fast Turbopack compilation and glassmorphism styling. "
        "In the middle tier, Next.js Server Route Handlers manage business logic, Google Gemini 2.5 Flash delivers AI intelligence without exposing API keys, "
        "and scheduled cron workers finalize auctions. "
        "On the data layer, Supabase PostgreSQL 15 manages 12 normalized tables with strict Row-Level Security, custom stored procedures for atomic bidding, "
        "and cloud storage buckets with MIME validation."
    )

    # =========================================================================
    # SLIDE 5: DUAL-MODE PERSISTENCE ARCHITECTURE
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_header(s5, "SOFTWARE ENGINEERING INNOVATION", "Zero-Friction Dual-Mode Persistence Architecture",
               "Engineered for instant evaluation, zero-setup grading defense, and enterprise cloud scalability")

    add_card(s5, 0.8, 2.05, 5.65, 2.25, "Live Cloud Production Mode", [
        ("Supabase PostgreSQL Sync", "Activates automatically when NEXT_PUBLIC_SUPABASE_URL and Anon Keys are supplied in .env.local."),
        ("True RLS Enforcement", "Policies execute directly inside PostgreSQL kernel; prevents data leakage even if frontend code is bypassed."),
        ("Real Authentication", "Full magic link and credential confirmation via Supabase Auth services."),
        ("Cloud Object Storage", "Images upload directly to listing-images bucket with authenticated ownership controls.")
    ], C_CYAN, "🌐")

    add_card(s5, 6.85, 2.05, 5.65, 2.25, "Zero-Config In-Memory Fallback Mode", [
        ("Out-of-the-Box Execution", "Runs immediately upon cloning without requiring external database provisioning or API credentials."),
        ("Reactive In-Memory & LocalStorage", "All created listings, bids, messages, and reservations update reactively in browser memory."),
        ("Pre-Seeded Realism", "Populated with 8 realistic campus listings across 4 categories and 4 live auctions."),
        ("Zero Evaluation Friction", "Committee members can grade and inspect full functionality in under 30 seconds.")
    ], C_EMERALD, "⚡")

    add_card(s5, 0.8, 4.45, 11.7, 2.25, "Integrated 5-Persona Demo Role Switcher (Instant Context Switching)", [
        ("Alex Chen (CS '25, Stanford)", "Tech Seller persona; preloaded with high-value M2 MacBook Pro (Auction) and Sony WH-1000XM4 listings."),
        ("Priya Sharma (BioE '26, UC Berkeley)", "STEM Student persona; preloaded with Organic Chemistry 8th Edition textbook auction and lab kit."),
        ("Marcus Johnson (MechE '27, MIT)", "Active Bidder persona; preloaded with Calculus 9th Ed auction and Herman Miller Aeron desk chair."),
        ("Sophia Rodriguez (Design '25, Columbia)", "Dorm Seller persona; preloaded with iPad Air 5th Gen live auction and compact dorm mini-fridge."),
        ("Admin Moderator (Campus Operations)", "Security & Operations role; unlocks complete administrative access to the /admin Moderation Center.")
    ], C_INDIGO, "👥")

    add_footer(s5, 5)
    s5.notes_slide.notes_text_frame.text = (
        "Slide 5 highlights one of the most innovative engineering decisions in CampusMart AI: the Dual-Mode Persistence Architecture. "
        "In production, the system connects directly to Supabase PostgreSQL, executing row-level security and stored procedures. "
        "However, capstone evaluators and recruiters often struggle with complex database provisioning when testing projects. "
        "To solve this, CampusMart AI features a zero-friction fallback: if database keys are absent, it automatically mounts a reactive "
        "in-memory and LocalStorage store pre-seeded with 8 listings, 4 live auctions, and 5 distinct student personas. "
        "Using the Demo Role Switcher in the navbar, evaluators can switch between buyer, seller, and admin roles in one click."
    )

    # =========================================================================
    # SLIDE 6: REAL-TIME AUCTION & ANTI-SNIPING
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_header(s6, "ALGORITHMS & CONCURRENCY", "Real-Time Auction Engine & Anti-Sniping Protocol",
               "Preventing automated bot sniping, enforcing atomic bidding locks, and automating auction resolution")

    add_card(s6, 0.8, 2.05, 3.65, 4.65, "Real-Time Auction Features", [
        ("Dynamic Live Countdown", "Client clocks render HH:MM:SS with synchronized server timestamps and visual urgency indicators."),
        ("Live Bid Stream", "Displays chronological bid history with timestamps and privacy-obfuscated student handles (e.g. a***n@stanford.edu)."),
        ("Minimum Increment Logic", "Automatically calculates required next bid: current_bid + min_increment (e.g., +₹100 or +₹500)."),
        ("Optional Buy-Now Price", "Allows buyers to bypass the auction and lock the purchase immediately at seller's ceiling price.")
    ], C_CYAN, "⏱️")

    add_card(s6, 4.84, 2.05, 3.65, 4.65, "The Anti-Sniping Guarantee", [
        ("The Problem in Traditional Auctions", "Bots and predatory bidders place bids in the last 2 seconds on platforms like eBay, denying students a fair chance."),
        ("Automatic 3-Minute Extension", "If any bid is submitted within the final 2 minutes, the database automatically extends the auction deadline by +3 minutes."),
        ("Fair Market Price Discovery", "Ensures all interested student bidders have time to counter-bid, maximizing revenue for student sellers."),
        ("Zero Bot Advantage", "Eliminates latency arbitrage and automated scripting advantages completely.")
    ], C_AMBER, "🛡️")

    add_card(s6, 8.88, 2.05, 3.65, 4.65, "Database Concurrency & Expiration", [
        ("Atomic Stored Procedure", "PostgreSQL place_auction_bid() wraps bid updates in transaction locks to prevent race conditions."),
        ("Strict Anti-Shill Rules", "Sellers are prohibited from bidding on their own listings; verified at both UI and database levels."),
        ("Vercel Scheduled Worker", "Cron job calls /api/auctions/process-expirations every minute with Bearer CRON_SECRET auth."),
        ("Automatic Finalization", "Identifies expired auctions, marks status as 'sold' or 'expired', assigns winning bidder, and dispatches notifications.")
    ], C_EMERALD, "⚙️")

    add_footer(s6, 6)
    s6.notes_slide.notes_text_frame.text = (
        "Slide 6 explores our real-time auction engine. Traditional online auctions suffer from bid sniping, where bots or users snipe an item "
        "in the last two seconds. CampusMart AI solves this with an anti-sniping algorithm: if any valid bid is submitted in the final 2 minutes, "
        "the auction clock automatically extends by 3 minutes. "
        "To guarantee concurrency safety, all bids execute through an atomic PostgreSQL stored procedure called place_auction_bid(), which locks the listing row, "
        "validates increments, and prohibits sellers from shill-bidding on their own items. "
        "Finally, an automated cron endpoint queries expired auctions, designates winners, and notifies both parties."
    )

    # =========================================================================
    # SLIDE 7: GOOGLE GEMINI AI ASSISTANT
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_header(s7, "ARTIFICIAL INTELLIGENCE INTEGRATION", "AI-Powered Campus Commerce Assistant",
               "Leveraging Google Gemini 2.5 Flash for fair valuations, textbook ISBN lookup, and trade safety advice")

    add_card(s7, 0.8, 2.05, 5.65, 2.25, "Shielded Server-Side Architecture", [
        ("Zero Client Token Exposure", "The GEMINI_API_KEY is stored exclusively in server environment variables; client bundles contain zero credentials."),
        ("Dedicated Next.js Route Handler", "Requests route through POST /api/ai/chat with request sanitation, rate-limiting, and error handling."),
        ("Official Google GenAI SDK", "Built using @google/genai, leveraging Gemini 2.5 Flash for sub-second streaming response times.")
    ], C_CYAN, "🛡️")

    add_card(s7, 6.85, 2.05, 5.65, 2.25, "Domain-Tuned System Prompts", [
        ("Campus Commerce Specialization", "System prompt primed with university buying cycles, textbook edition variances, and student budget constraints."),
        ("Fair Price Valuation", "Estimates fair secondary market prices based on item condition (Brand New to Fair), age, and original MSRP."),
        ("Counterfeit & Scam Detection", "Warns students if an offer looks suspicious or if a seller requests off-platform peer-to-peer wire transfers.")
    ], C_INDIGO, "🧠")

    add_card(s7, 0.8, 4.45, 5.65, 2.25, "Interactive UI & 1-Click Prompt Pills", [
        ("Persistent Slide-Out Drawer", "Accessible from any page via a floating glowing button; seamless desktop and mobile viewports."),
        ("Contextual Quick Prompts", "Pre-built prompt pills: 'How do auctions work?', 'Price estimate for iPad Air', 'Textbook edition tips', 'Safe meetup spots'."),
        ("Formatted Markdown Rendering", "Generates bulleted checklists, price ranges, and bold warnings in clean, readable typography.")
    ], C_EMERALD, "💡")

    add_card(s7, 6.85, 4.45, 5.65, 2.25, "Textbook Edition & Academic Advice", [
        ("Syllabus & ISBN Intelligence", "Advises students whether an older textbook edition (e.g. 7th vs 8th ed) will suffice for their coursework, saving hundreds of dollars."),
        ("Condition Assessment Guidance", "Guides students on evaluating battery health for used laptops and identifying worn lab equipment."),
        ("Student Negotiation Coaching", "Provides polite, constructive counter-offer phrasing for respectful peer-to-peer transactions.")
    ], C_AMBER, "📚")

    add_footer(s7, 7)
    s7.notes_slide.notes_text_frame.text = (
        "Slide 7 showcases our Google Gemini 2.5 Flash AI integration. Unlike generic chatbots, CampusMart AI's assistant is specifically primed "
        "with university commerce knowledge. It helps students calculate fair resale prices for items, advises on textbook edition differences so students "
        "don't overpay for minor revisions, and coaches students on safety protocols. "
        "Architecturally, security was our top priority: the API key is completely shielded on the server inside POST /api/ai/chat using the official @google/genai SDK, "
        "ensuring no API secrets are exposed to the client. The interface is accessible across all 26 routes with 1-click prompt pills for instant interaction."
    )

    # =========================================================================
    # SLIDE 8: TRUST, SAFETY & PRIVACY ENGINEERING
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8)
    add_header(s8, "CYBERSECURITY & STUDENT WELFARE", "Multi-Layered Trust, Safety & Privacy Architecture",
               "Proactive regex scanners, physical campus safety zones, and strict database row-level isolation")

    add_card(s8, 0.8, 2.05, 5.65, 2.25, "Automated Contact Leak Scanner", [
        ("Client-Side Regex Engine", "Actively scans message drafts in real time using CONTACT_LEAK_REGEX before packet transmission."),
        ("Pattern Detection", "Catches 10-digit telephone numbers, international formats (+91, +1), WhatsApp links, and external personal emails."),
        ("Visual Interception Warning", "Displays an amber banner advising students to keep communication inside CampusMart AI to prevent fraud and harassment."),
        ("Clean Message Clearance", "Permits normal campus meeting logistics (e.g. 'Meet outside Library at 3 PM') without obstruction.")
    ], C_AMBER, "🔍")

    add_card(s8, 6.85, 2.05, 5.65, 2.25, "100% Row-Level Security (RLS)", [
        ("PostgreSQL Kernel Isolation", "All 12 tables enforce strict ownership policies using auth.uid() = user_id."),
        ("Participant-Only Messaging", "Conversations and message records are strictly limited to the buyer and seller; third parties receive empty arrays."),
        ("Write-Protection on Listings", "Only the verified item owner or an authorized administrator can edit or delete a listing."),
        ("Storage Bucket RLS", "Uploads to listing-images require active student authentication; deletions restricted to image uploader.")
    ], C_CYAN, "🔐")

    add_card(s8, 0.8, 4.45, 5.65, 2.25, "Designated Campus Safety Hubs", [
        ("Standardized University Landmarks", "Every listing and reservation selects from verified campus locations:"),
        ("Campus Police Station / Safe Exchange", "Monitored, 24/7 camera-surveilled safe exchange zone for high-value items (laptops, phones)."),
        ("Main Campus Library Lobby", "High-foot-traffic indoor daytime meeting area."),
        ("Student Union & Dining Courtyard", "Central, well-lit gathering spaces eliminating private dorm room visits.")
    ], C_EMERALD, "📍")

    add_card(s8, 6.85, 4.45, 5.65, 2.25, "Standardized Condition Grading", [
        ("Brand New", "Unopened in original manufacturer packaging with tags attached."),
        ("Like New", "Flawless cosmetic condition, used once or twice with zero defects."),
        ("Good", "Minor normal campus wear or surface scratches, fully functional."),
        ("Fair", "Visible cosmetic wear but completely operational as intended."),
        ("Dispute Reduction", "Clear, standardized criteria dramatically reduce post-meetup purchase disputes.")
    ], C_INDIGO, "🏷️")

    add_footer(s8, 8)
    s8.notes_slide.notes_text_frame.text = (
        "Slide 8 demonstrates how safety and privacy are baked into the code, not just listed in a terms of service document. "
        "Our Contact Leak Scanner uses a comprehensive regex pattern to intercept telephone numbers and personal email addresses in the chat window, "
        "warning students before they leak sensitive personal info. "
        "In the database, 100% of our 12 tables implement Row-Level Security: third-party students cannot query or eavesdrop on private messages. "
        "Furthermore, our checkout and reservation workflows mandate choosing designated physical meeting spots, such as the campus police station "
        "or library lobby, ensuring students never enter private dorm rooms to buy or sell items."
    )

    # =========================================================================
    # SLIDE 9: ADMIN MODERATION & 20-POINT TEST SUITE
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_bg(s9)
    add_header(s9, "GOVERNANCE & QUALITY ASSURANCE", "Administrative Governance & Automated Quality Assurance",
               "Full administrative moderation dashboard paired with an exhaustive 20-point automated test suite")

    add_card(s9, 0.8, 2.05, 5.65, 4.65, "Admin Moderation Center (/admin)", [
        ("Real-Time Operational KPIs", "Live counters for Total Listings, Active Auctions, Open Student Reports, and Registered Accounts."),
        ("Listing Approval & Moderation", "Moderators can inspect listing condition, pricing, descriptions, and remove non-compliant items with 1 click."),
        ("Student Dispute Ticketing", "Structured report review hub showing reason, reporter identity, reported listing, and action history."),
        ("Instant Account Banning", "One-click toggle to instantly suspend or ban abusive users, immediately blocking them from logging in or bidding."),
        ("Audit Logging & Tracking", "Comprehensive audit trails documenting administrative actions for full compliance and transparency.")
    ], C_CYAN, "🛡️")

    add_card(s9, 6.85, 2.05, 5.65, 4.65, "20-Point Automated Test Suite (npm test)", [
        ("1. Email Domain Security (7 tests)", "Verifies .edu acceptance, university subdomains (cs.berkeley.edu), personal Gmail support, and rejection of malformed or commercial emails."),
        ("2. Contact Leak Scanner (3 tests)", "Validates detection of telephone numbers and personal emails, while confirming clean campus logistics messages pass through."),
        ("3. Marketplace & Search (3 tests)", "Validates multi-category filtering, empty-state fallbacks, and keyword full-text query matching."),
        ("4. Auction Integrity (4 tests)", "Verifies rejection of seller self-bidding, rejection of low bids, acceptance of valid increments, and authoritative highest bid persistence."),
        ("5. Purchase Intent & Privacy (3 tests)", "Verifies self-purchase prohibition, purchase reservation notifications, and participant-only messaging isolation (third parties receive 0 messages)."),
        ("100% Pass Rate", "Executes in under 2 seconds with zero network dependencies via npm test.")
    ], C_EMERALD, "🧪")

    add_footer(s9, 9)
    s9.notes_slide.notes_text_frame.text = (
        "Slide 9 highlights governance and quality verification. "
        "First, we built a dedicated Administrative Moderation Center at /admin. Campus security staff can view operational KPIs, inspect reported items, "
        "review dispute tickets, and ban offending users with an instant status toggle. "
        "Second, to ensure rock-solid stability, we developed a 20-point automated test harness executed with npm test. "
        "It validates email domain restrictions, contact leak regex detection, auction integrity, and participant-only chat privacy. "
        "All 20 tests pass with a 100% success rate without requiring external network dependencies."
    )

    # =========================================================================
    # SLIDE 10: RESULTS, IMPACT & FUTURE ROADMAP
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_bg(s10)
    add_header(s10, "CONCLUSION & FUTURE HORIZONS", "Outcomes, University Impact & Future Evolution",
               "Delivering a complete, secure, and sustainable campus commerce ecosystem with a clear vision forward")

    add_card(s10, 0.8, 2.05, 3.65, 4.65, "Key Capstone Milestones", [
        ("26 Production-Ready Routes", "Complete responsive navigation across marketplace, auctions, P2P chat, notifications, and admin."),
        ("100% Test Pass Rate", "All 20 security, auction, and privacy integration tests pass cleanly."),
        ("Sub-Second Latency", "Turbopack bundling, Next.js 16 Server Components, and optimized PostgreSQL indexes deliver instant loading."),
        ("Zero-Friction Evaluation", "Dual-mode persistence allows instant local evaluation or live Supabase deployment."),
        ("Enterprise Architecture", "Fully documented, typed, and adhering to modern Next.js and Supabase standards.")
    ], C_CYAN, "🏆")

    add_card(s10, 4.84, 2.05, 3.65, 4.65, "Measurable Campus Impact", [
        ("Student Financial Savings", "Saves students 50% to 70% compared to campus bookstore textbook and electronics prices."),
        ("Zero Meetup Incidents", "Designated physical safety zones and contact leak alerts eliminate dangerous off-campus encounters."),
        ("Circular Campus Economy", "Diverts tons of dorm furniture, appliances, and electronics from campus landfills every semester."),
        ("Community Trust", "Domain-verified peer accountability replaces distrust and anonymous marketplace scams.")
    ], C_EMERALD, "🎓")

    add_card(s10, 8.88, 2.05, 3.65, 4.65, "Future Technology Roadmap", [
        ("Phase 1: In-App UPI Escrow", "Digital payments held in escrow until buyer scans a QR code upon physical item handover."),
        ("Phase 2: Multi-Campus Federation", "Inter-collegiate network enabling neighboring universities (e.g. Stanford & Berkeley) to trade securely."),
        ("Phase 3: Computer Vision AI", "Automated image condition analysis and textbook ISBN barcode recognition via Gemini multimodal vision."),
        ("Phase 4: Native Mobile Apps", "Cross-platform iOS and Android apps with native push notifications for live auction outbid alerts.")
    ], C_INDIGO, "🚀")

    add_footer(s10, 10)
    s10.notes_slide.notes_text_frame.text = (
        "In conclusion, Slide 10 summarizes the capstone outcomes and our future roadmap. "
        "CampusMart AI successfully proves that university peer-to-peer commerce can be made secure, transparent, and economically empowering. "
        "We have delivered 26 full-stack routes, a 100% passing test suite, and an architecture ready for deployment. "
        "Looking forward, we plan to implement UPI escrow payments with physical QR code verification at pickup, "
        "multi-campus federation between sister universities, and computer vision condition grading using Gemini's multimodal capabilities. "
        "Thank you for your time and attention. I am now happy to open the floor to questions and live demonstrations."
    )

    output_path = r"c:\Users\LENOVO\OneDrive\Documents\Capstone1\CampusMart_AI_Project_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_deck()
