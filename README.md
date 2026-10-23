# CampusMart AI 🎓🛒
> **Secure Student Marketplace, Real-Time Auctions, Safe On-Campus Messaging & AI Assistant**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-orange?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_&_Storage-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-20_Passed-brightgreen?style=flat-square)]()

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Dual-Mode Persistence Architecture](#-dual-mode-persistence-architecture)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Database & Storage Setup (Production)](#-database--storage-setup-production)
- [Environment Variables](#-environment-variables)
- [AI Assistant Configuration](#-ai-assistant-configuration)
- [Auction Cron Worker Setup](#-auction-cron-worker-setup)
- [Running the Test Suite](#-running-the-test-suite)
- [Demo Test Accounts](#-demo-test-accounts)
- [Security & Compliance Highlights](#-security--compliance-highlights)
- [Production Deployment](#-production-deployment)

---

## 🌟 Project Overview

**CampusMart AI** is an exclusive, full-stack campus marketplace engineered specifically for verified university students (`.edu` email domains). It eliminates off-platform scams, unsafe meetups, and marketplace fraud by providing:
1. **Verified Student Identities**: Domain-restricted student authentication.
2. **Dual-Mode Listings**: Fixed-price instant buy intent + competitive real-time auctions.
3. **Atomic Anti-Sniping Auctions**: Database-level concurrency control with automatic auction extensions when last-minute bids occur.
4. **Safe On-Campus Messaging**: Private buyer-seller threads equipped with an automated **Contact Leak Scanner** warning students before sharing personal phone numbers or external emails.
5. **AI Campus Assistant**: Powered by Google's **Gemini 2.5 Flash**, offering marketplace advice, fair price estimations, textbook search, and campus safety tips.
6. **Campus Moderation Hub**: Complete administrative moderation panel to review listings, resolve student reports, and ban offending users.

---

## ⚡ Key Features

### 🛒 Listings & Commerce
- **Indian Rupee (₹ INR) Native Pricing**: All listings, bids, price filters, and notifications use formatted Indian Rupees (`en-IN` format, e.g. `₹3,400`, `₹750`, `₹350`) with realistic, affordable student-budget pricing for portable campus-carry items.
- **Luxury & Glassmorphism UI**: High-end styling powered by Google's `Outfit` & `Plus Jakarta Sans` typography, ambient glow lighting, frosted crystal panels, glowing live auction badges, and smooth micro-interactions.
- **Fixed-Price Listings**: Reserve items with buyer intent, notify sellers, and organize designated campus meetup spots.
- **Dynamic Real-Time Auctions**:
  - Live countdown timers formatted in hours, minutes, and seconds.
  - Real-time bid history feed showing timestamps and obfuscated student handles.
  - Automatic minimum bid calculation (`current_price + min_increment`).
  - **Anti-Sniping Guarantee**: Bids submitted within the last 2 minutes automatically extend the auction by 3 minutes.
  - Concurrency safety: atomic database functions prevent race conditions or duplicate winning bids.
  - Seller bid prohibition: sellers cannot bid on their own items.
- **Condition Grading**: Clear standardized grades (Brand New, Like New, Good, Fair, Poor).
- **Designated Campus Pickup Points**: Student Union, Main Library, Campus Police Substation, Dining Hall, Tech Center, Quad.

### 💬 Safe Messaging & Privacy
- **Private P2P Conversations**: Strictly restricted to conversation participants.
- **Contact Leak Prevention**: Client-side regex scanner warns students if a message contains a telephone number, WhatsApp link, or off-campus email before transmission.
- **Direct Listing Context**: Every chat thread links directly to the item being discussed with price and status badge.

### 🤖 Gemini-Powered AI Assistant
- Floating slide-out widget accessible from any page.
- Contextual assistance for pricing, campus safety guidelines, book search, and trade negotiations.
- Server-side API key protection with markdown rendering and pre-built suggestion prompts.

### 🛡️ Admin Moderation Center
- System health KPIs (Total listings, Active auctions, Open reports, Total students).
- Item moderation: approve or delete flagged listings.
- User management: ban abusive accounts with instant status toggle.
- Dispute management: inspect report tickets with reason, reporter info, and resolution actions.

---

## 🏗 Architecture & Tech Stack

```
campusmart-ai/
├── src/
│   ├── app/                    # Next.js 16 App Router (26 routes)
│   │   ├── (auth)              # Login, Register, Verify, Forgot Password
│   │   ├── admin/              # Moderation Center
│   │   ├── api/ai/chat/        # Server route for Gemini 2.5 Flash
│   │   ├── api/auctions/       # Auction expiration cron handler
│   │   ├── dashboard/          # Student management center
│   │   ├── favorites/          # Wishlist
│   │   ├── help/               # Help center & FAQ
│   │   ├── listings/           # Create & Edit listing wizards
│   │   ├── marketplace/        # Search, filter, listing details & bidding
│   │   ├── messages/           # P2P inbox and thread chat
│   │   ├── notifications/      # Real-time alert center
│   │   ├── privacy/ & terms/   # Legal policies
│   │   ├── profile/            # Student public profile & bio edit
│   │   └── safety/             # Campus exchange safety guidelines
│   ├── components/             # Reusable UI (Navbar, ProductCard, AIChatbot, etc.)
│   ├── lib/
│   │   ├── auth-context.tsx    # Supabase Auth + Demo Role Switcher
│   │   ├── constants.ts        # Approved domains, locations, regex filters
│   │   ├── notifications-context.tsx
│   │   ├── store/              # Unified store (Mock fallback & Supabase sync)
│   │   ├── supabase/           # SSR client and server utilities
│   │   ├── theme-provider.tsx  # Dark / Light theme provider
│   │   └── utils.ts            # Formatting, currency, anti-sniping helpers
│   └── test/
│       └── run-tests.ts        # 20-point automated test suite
├── supabase/
│   ├── migrations/             # 12 PostgreSQL tables + RLS + Triggers
│   ├── seed.sql                # Official campus category taxonomy
│   └── storage_setup.sql       # listing-images bucket & storage RLS
└── public/                     # Static assets
```

- **Frontend**: Next.js 16.4.2 (Turbopack, App Router), React 19.3.0, TypeScript 5, Tailwind CSS v4.
- **Icons & Animation**: Lucide React, Framer Motion.
- **Backend & APIs**: Next.js Server Route Handlers, Edge API routes.
- **Database**: PostgreSQL (Supabase) with Row-Level Security (RLS) on all 12 tables.
- **AI Intelligence**: `@google/genai` (Google Gemini 2.5 Flash).
- **Testing**: `tsx` test harness executing 20 unit and integration tests.

---

## 🔄 Dual-Mode Persistence Architecture

CampusMart AI was engineered with an innovative **Zero-Friction Dual-Mode Architecture**:

1. **Production Mode (Supabase Connected)**:
   - When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured with a live Supabase instance, all authentication, listing creation, bidding, and messaging sync to PostgreSQL with full RLS enforcement.
2. **Demo / Offline Fallback Mode (Out-of-the-Box)**:
   - When run locally without database setup, the application automatically mounts a reactive **In-Memory & LocalStorage Store** populated with 8 realistic campus listings, 4 active auctions, live bid streams, and 5 distinct student personas.
   - Any bid, listing, message, or purchase reservation made in the browser updates reactively in real time.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v20.x or v22.x LTS installed.
- **npm**: v10.x or higher.

### 2. Clone and Install
```bash
git clone https://github.com/your-username/campusmart-ai.git
cd campusmart-ai
npm install
```

### 3. Environment Setup
Copy the sample environment file to `.env.local`:
```bash
cp .env.example .env.local
```
*(On Windows PowerShell: `Copy-Item .env.example .env.local`)*

Populate your keys in `.env.local` (see [Environment Variables](#-environment-variables)).

### 4. Run the Test Suite
Ensure the codebase passes all 20 security and domain validation tests:
```bash
npm test
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. The application is immediately interactive!

---

## 🗄 Database & Storage Setup (Production)

To connect a live Supabase PostgreSQL database:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Run the following files in order:
   - **`supabase/migrations/20261023_init.sql`**:
     - Creates 12 normalized tables: `profiles`, `categories`, `listings`, `listing_images`, `bids`, `purchase_requests`, `conversations`, `messages`, `favorites`, `notifications`, `reports`, `audit_logs`.
     - Enables RLS on every table with strict ownership policies.
     - Deploys the atomic `place_auction_bid()` PostgreSQL function with 2-minute anti-sniping extension (+3 minutes) and concurrency locks.
     - Creates the `handle_new_user()` auto-profile trigger on `auth.users`.
   - **`supabase/seed.sql`**:
     - Seeds the 9 campus categories: Textbooks & Course Materials, Electronics & Tech, Dorm & Furniture, Apparel & Spirit Wear, Bicycles & Campus Transit, School Supplies, Musical Instruments, Tickets & Campus Events, Free & Donation.
   - **`supabase/storage_setup.sql`**:
     - Creates the public `listing-images` storage bucket (5MB file limit, JPG/PNG/WebP/GIF MIME restriction).
     - Configures storage RLS policies for authenticated upload and owner deletion.
4. In **Supabase Authentication > URL Configuration**, add `http://localhost:3000/auth/callback` to the Redirect URLs.
5. In **Supabase Authentication > Email Templates**, customize the confirmation email for student verification.

---

## 🔑 Environment Variables

The application reads from `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-for-admin-scripts

# Google Gemini API (Shielded Server-Side)
GEMINI_API_KEY=your-gemini-api-key

# Cron Secret for Scheduled Auction Processing
CRON_SECRET=campusmart-cron-secret-change-in-production

# App URL Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Approved College Email Domains (Comma-Separated)
NEXT_PUBLIC_APPROVED_COLLEGE_DOMAINS=stanford.edu,berkeley.edu,mit.edu,harvard.edu,columbia.edu,ucla.edu,nyu.edu,utexas.edu,gatech.edu,illinois.edu,umich.edu,cornell.edu,washington.edu,cmu.edu,purdue.edu,usc.edu,unc.edu,ufl.edu,wisc.edu,osu.edu,psu.edu
```

---

## 🤖 AI Assistant Configuration

CampusMart AI integrates Google's **Gemini 2.5 Flash** model via the official `@google/genai` SDK:
- **Server-Side Shielding**: The API key is stored exclusively in `GEMINI_API_KEY` on the server and is never exposed in client bundles.
- **Route Handler**: Requests pass through `POST /api/ai/chat`.
- **System Instructions**: The model is primed with campus commerce safety, pricing fairness logic, textbook edition tips, and scam warnings.
- **Suggested Prompts**: Users can click pre-built prompt pills such as *"How do auctions work?"*, *"Price estimate for iPad"*, or *"Safe meetup places on campus"*.

---

## ⏱ Auction Cron Worker Setup

CampusMart AI features an automated auction closing endpoint at `/api/auctions/process-expirations`:
1. It queries all active auctions where `auction_end_time <= NOW()`.
2. Marks the listing as `sold` if bids exist, or `expired` if no bids were received.
3. Notifies the winning bidder and the seller with the final winning price.
4. Requires Bearer authentication via `Authorization: Bearer <CRON_SECRET>`.

### Configuring Vercel Cron
Add the following to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/auctions/process-expirations",
      "schedule": "* * * * *"
    }
  ]
}
```

---

## 🧪 Running the Test Suite

The test suite validates the core security and functional requirements without requiring external network dependencies:

```bash
npm test
```

### Test Coverage Highlights:
- **Email Domain Security**: Verifies `.edu` domain whitelisting, subdomain support (e.g. `eecs.berkeley.edu`), and commercial/disposable domain rejection.
- **Contact Leak Scanner**: Validates detection of phone numbers, external emails, and allows clean messages.
- **Marketplace Logic**: Tests category filtering and full-text keyword search.
- **Auction Integrity**: Verifies seller self-bidding rejection, bid increment enforcement, and highest bid persistence.
- **Purchase Intent**: Validates buyer reservation workflow and self-purchase prohibition.
- **Participant-Only Chat Privacy**: Ensures third parties cannot view private conversations.

---

## 👥 Demo Test Accounts

The top navigation bar features a **Demo Role Switcher** dropdown allowing instant role-switching between 5 pre-configured student accounts:

| Student Persona | University / Major | Role / Context | Preloaded Items |
| :--- | :--- | :--- | :--- |
| **Alex Chen** | Stanford University (CS '25) | Tech Seller | M2 MacBook Pro (Auction), Sony WH-1000XM4 |
| **Priya Sharma** | UC Berkeley (BioE '26) | STEM Student | Organic Chemistry 8th Ed (Auction), Lab Kit |
| **Marcus Johnson** | MIT (MechE '27) | Active Bidder | Herman Miller Chair, Calculus 9th Ed (Auction) |
| **Sophia Rodriguez** | Columbia (Design '25) | Dorm Seller | iPad Air 5th Gen (Auction), Dorm Mini Fridge |
| **Admin Moderator** | Campus Operations | Security Staff | Full access to `/admin` moderation center |

*Note: In the authentication screens, test login strictly enforces the security rule: invalid credentials trigger the exact message `Invalid email ID or password.`*

---

## 🔒 Security & Compliance Highlights

- **Row-Level Security (RLS)**: Enforced across all 12 database tables so students can only modify their own listings and read their own messages.
- **Server-Side AI Shielding**: Gemini API key is never bundled in frontend code.
- **Anti-Sniping Clock Protection**: PostgreSQL trigger prevents last-second automated sniping by extending auction deadlines.
- **Contact Leak Scanner**: Regex filters alert users before transmitting telephone numbers or personal emails in chat.
- **Domain Verification**: Enforces valid `.edu` domain registration before account activation.
- **Content Security**: File upload size and MIME type restrictions on images.

---

## 🚢 Production Deployment

### Deploying to Vercel
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `CRON_SECRET`).
4. Vercel automatically runs `npm run build` using the App Router.
5. Deploy and enjoy your production campus marketplace!

---

## 📄 License
This project is developed for educational and university campus commerce use under the MIT License.
