# SellBuy Used Cars - Frontend UI Extraction (for Next.js rebuild)

This document captures the complete current frontend UI so you can rebuild it in Next.js with the same structure, visuals, and interactions.

## 1. Tech and UI foundations

- Framework: React + Vite (JSX pages/components)
- Routing: `react-router-dom` with public/protected role-based routes
- Styling style: mostly inline styles + per-component CSS-in-JS `<style>` blocks
- Global CSS: `src/App.css` contains only `@import "tailwindcss"`
- Fonts used heavily across screens:
  - Bebas Neue (headings)
  - DM Sans (body/UI)
- Icon style:
  - Emojis in many places
  - `lucide-react` icons in `Carcard.jsx`
- API layer: `src/api.js` (axios instance + token interceptor)
- Auth state: `src/context/AuthContext.jsx`

## 2. Route map (current app)

From `src/App.jsx`:

- Public routes:
  - `/` -> `Homepage`
  - `/login` -> `LoginPage`
  - `/browse` -> `Browsepage`
  - `/car/:id` -> `Cardetailpage`
  - `/compare` -> `Comparepage`
  - `/emi` -> `EMIpage`
- Protected (any user):
  - `/chatbot` -> `Chatbotpage`
- Buyer only:
  - `/buyer` -> `BuyerDashboard`
  - `/payment/:carId` -> `PaymentPage`
- Seller only:
  - `/seller` -> `SellerDashboard`
  - `/add-listing` -> `Addlistingpage`
- Admin only:
  - `/admin` -> `Admindashboard`
- Fallback:
  - `*` -> redirect to `/`

Note: Some internal navigation paths in components differ from actual routes (details in section 11).

## 3. Global layout behavior

- Many pages assume a fixed top navbar height of `70px` and use top padding accordingly.
- Dashboard pages (`BuyerDashboard`, `SellerDashboard`, `Admindashboard`) render `Sidebar` and shift content using dynamic left margin (`260` expanded, `72` collapsed).
- Visual direction across most pages:
  - Dark charcoal background (`#080808` to `#111`)
  - Amber accent (`#f59e0b`) as primary CTA/highlight
  - Thin translucent borders and glassy surfaces
  - Subtle motion (fade-up, hover lift, pulse, scanning lines)

## 4. Shared components extraction

### 4.1 `Navbar.jsx`

- Fixed top nav, dark glass look, height `70px`
- Hidden on paths: `/`, `/login`, `/register`
- Link group rendered from constant:
  - Home, Browse, Compare, EMI Calc, Chatbot
- Locked behavior:
  - Non-public links show lock state when no user
  - Clicking locked link redirects to `/login`
- Auth-aware right controls:
  - Logged out: Sign In button
  - Logged in: notifications, wishlist, avatar, sign out
  - Seller/admin: "Post Listing" button

### 4.2 `Sidebar.jsx`

- Role-based menu sections (buyer/seller/admin)
- Fixed panel under navbar (`top: 70px`), collapsible width `260 -> 72`
- Has:
  - brand/logo area
  - user card
  - grouped nav links with optional badges
  - bottom actions (post listing + sign out)
- Uses in-component CSS with rich hover/tooltip behavior

### 4.3 `Carcard.jsx`

- Card with image, trust/discount badges, wishlist toggle
- Price and metadata row (city, owners, km, fuel, transmission, mileage)
- Trust progress meter (`car.trustScore`)
- CTA variants:
  - `View Details`
  - `Place Bid` when `showBid=true`

### 4.4 `ProtectedRoute.jsx`

- Shows full-screen loading state while auth context is loading
- Redirects unauthenticated users to `/login` (preserving `from` state)
- Redirects wrong-role users to role dashboard:
  - admin -> `/admin`
  - seller -> `/seller`
  - buyer -> `/buyer`

## 5. Page-by-page UI extraction

### 5.1 Homepage (`Homepage.jsx`)

Theme: cinematic dark hero + amber highlights + animated sections.

Sections:
- Hero (full viewport):
  - Parallax background car image
  - headline: "FIND YOUR PERFECT DRIVE"
  - search bar + quick tags
  - scroll hint indicator
- Stats strip (4 metrics)
- Featured cars grid (from `mockCars.slice(0, 6)`)
- Feature cards (6 platform capabilities)
- Testimonials (3 cards)
- CTA band
- Footer with quick links

Key interactions:
- Search input and quick tags navigate to `/browse?q=...`
- Cards navigate to `/car/:id`
- Animated hover/scale effects and fade-ups

### 5.2 Login/Register (`LoginPage.jsx`)

Split-screen layout:
- Left: branded visual storytelling panel with background image/orbs/grid
- Right: auth form panel

Modes:
- `login`
- `signup`

Signup includes:
- role selector (buyer/seller)
- name, phone, email, password

Behavior:
- On login success, redirect by server-returned role
  - admin -> `/admin`
  - seller -> `/seller`
  - buyer -> `/buyer`
- On signup success: switches to login and shows browser alert

### 5.3 Browse (`Browsepage.jsx`)

Layout:
- Sticky top bar with brand back button, search, sort, grid/list toggle
- Left filter sidebar (collapsible)
- Main results area

Filters:
- Brand
- Max price slider
- Fuel
- Transmission
- City

Data flow:
- Calls `getAllCars(params)` from API
- Server-side filtering via query params
- Client-side sorting by price/year

Cards:
- Grid card and list card variants
- Wishlist toggle
- Compare selection (up to 3)

Compare bar:
- Fixed bottom compare tray appears when selections exist
- CTA to `/compare`

### 5.4 Car detail (`Cardetailpage.jsx`)

Layout: 2 columns
- Left:
  - gallery with thumbnail strip
  - title/price/meta
  - tabbed content: overview/specs/history/emi
- Right (sticky):
  - price and buy controls
  - bid form
  - offer form
  - seller card

Bottom:
- Similar cars grid (3 cards)

Tabs include:
- Overview: highlight stat cards + description
- Specs: key-value spec rows
- History: timeline-like verified events
- EMI: sample plan cards

### 5.5 Compare (`Comparepage.jsx`)

Purpose: compare up to 3 cars side-by-side.

Structure:
- Hero header
- selected car chips and car picker
- overall winner banner (by custom `score`)
- tabbed compare body:
  - Specs table
  - Features table
  - Pros/Cons cards

Data source:
- Hardcoded `ALL_CARS` in page file

Winner logic:
- Per-row winner detection for metrics (price/mileage/power/torque/etc.)
- Overall winner from highest `score`

### 5.6 EMI calculator (`EMIpage.jsx`)

Layout:
- Hero intro
- 2-column calculator/results grid

Inputs:
- Loan amount slider
- Interest slider
- Tenure slider + quick tenure buttons

Outputs:
- Monthly EMI
- Principal / interest / total payment
- principal-vs-interest percentage breakdown bar

Formula used:
- Standard EMI formula based on monthly reducing balance

### 5.7 Chatbot (`Chatbotpage.jsx`)

Layout:
- Sticky top header
- Desktop: left sidebar + right chat area
- Mobile: sidebar hidden

Sidebar modules:
- Quick suggestions
- Type filters (Sedan/SUV/etc.)
- Session stats

Chat area:
- message bubbles (bot/user)
- typing indicator
- textarea input with Enter to send (Shift+Enter newline)

Data:
- Sends message via `sendChatMessage(message)` API
- Appends bot reply from `res.data.reply`

### 5.8 Buyer dashboard (`BuyerDashboard.jsx`)

Layout:
- Sidebar + content
- Greeting header with CTA
- 4 stats cards
- 2x2 content grid:
  - Active Bids
  - Wishlist
  - My Offers + recommended
  - Quick Actions + AI insight + trust score ring

Data source:
- `mockCars`, `mockBids`, `mockWishlist`, `mockOffers`

### 5.9 Seller dashboard (`SellerDashboard.jsx`)

Layout:
- Sidebar + content
- Header with "New Listing" CTA
- 4 stats cards
- My Listings panel
- Revenue chart + performance bars
- Incoming bids panel with accept/counter/reject actions

Data source:
- `mockSellerListings`, `mockRevenueData`, local bid mock array

### 5.10 Add listing (`Addlistingpage.jsx`)

Wizard (4 steps):
- Step 1: Basic info
- Step 2: Vehicle details
- Step 3: Photos and pricing
- Step 4: Review

Validation:
- Step-scoped validation before moving forward
- Required fields and minimum checks (year, km, price, description length)

Final action:
- mock submit delay
- success confirmation screen with actions to dashboard or add another

### 5.11 Admin dashboard (`Admindashboard.jsx`)

Layout:
- Sidebar + content
- Header and live indicator
- 6 compact stats cards
- Revenue overview chart
- Fraud alerts list
- Pending approvals queue
- User activity metrics + quick action tiles

Interactions:
- approve/reject pending listing (local state remove)
- dismiss fraud alert (local state remove)

### 5.12 Payment page (`PaymentPage.jsx`)

Visual direction differs from dark theme:
- Light background (`#f8fafc`) and white cards

Structure:
- Left: payment form
  - method tabs: card / upi / netbanking
  - method-specific inputs
  - security note
- Right: order summary + total + pay button

Flow:
- `step 1` form -> `step 2` success card
- mock processing delay (`setTimeout`)

## 6. Auth and role UX behaviors

- Token persisted in `localStorage` key: `token`
- `AuthContext` fetches current user on app boot if token exists
- Dashboards and protected pages rely on user role (`buyer`/`seller`/`admin`)
- Login redirect is role-driven after auth success

## 7. Data model assumptions used by UI

Common car fields expected in UI:
- `id`, `title`, `brand`, `model`, `year`
- `price`, `originalPrice`
- `km` or `km_driven` (both appear in different pages)
- `fuel`, `transmission`, `city`
- `image` or `image_url`
- `trustScore`, `verified`
- `sellerName` or `seller_name`

Because mixed naming exists, normalize these in Next.js data adapter layer.

## 8. Next.js recreation map (recommended)

Use App Router.

Suggested route mapping:

- `app/page.jsx` -> Homepage
- `app/login/page.jsx` -> LoginPage
- `app/browse/page.jsx` -> BrowsePage
- `app/car/[id]/page.jsx` -> CarDetailPage
- `app/compare/page.jsx` -> ComparePage
- `app/emi/page.jsx` -> EMIPage
- `app/chatbot/page.jsx` -> ChatbotPage (protected)
- `app/buyer/page.jsx` -> BuyerDashboard (buyer protected)
- `app/seller/page.jsx` -> SellerDashboard (seller protected)
- `app/admin/page.jsx` -> AdminDashboard (admin protected)
- `app/add-listing/page.jsx` -> AddListingPage (seller protected)
- `app/payment/[carId]/page.jsx` -> PaymentPage (buyer protected)

Shared components to create:
- `components/layout/Navbar.jsx`
- `components/layout/Sidebar.jsx`
- `components/cards/CarCard.jsx`
- `components/auth/ProtectedRoute.jsx` (or middleware + server redirects)

Global styles:
- `app/globals.css` for base reset + color variables + font imports

## 9. Style token extraction (from existing UI)

Core colors:
- Background main: `#080808`
- Card dark: `#111111`
- Text primary: `#ffffff` / `#e5e7eb`
- Text muted: `#6b7280`, `rgba(255,255,255,0.35)`
- Primary accent: `#f59e0b`
- Accent hover: `#fbbf24`, `#d97706`
- Success: `#22c55e` / `#10b981`
- Danger: `#ef4444` / `#f87171`
- Info: `#60a5fa`

Shape and spacing style:
- Border radius commonly `8px`, `10px`, `12px`, `16px`, `20px`
- Card borders: translucent 1px lines (`rgba(255,255,255,0.06~0.1)`)
- Heavy use of subtle shadows/glows around amber accents

Typography pattern:
- Hero/display/headings: Bebas Neue, uppercase feel, wide letter spacing
- Body/form/UI text: DM Sans

## 10. Motion/interaction patterns

- Common keyframes:
  - fade-up reveal
  - pulse indicators
  - slow zoom / parallax on hero imagery
  - hover raise and glow for cards/buttons
- Buttons often use:
  - `transform: translateY(-1px|-2px)` on hover
  - stronger shadow on hover

## 11. Important route mismatches to fix during rebuild

To recreate behavior cleanly in Next.js, normalize these inconsistencies:

- `Navbar` links use paths not present in router:
  - `/home`, `/dashboard/buyer`, `/post-listing`, `/dashboard/{role}`
- `Sidebar` also references non-existent routes in this repo:
  - `/dashboard/buyer`, `/dashboard/seller`, `/my-listings`, `/messages`, `/bids`, etc.
- `Cardetailpage` buy CTA navigates to `/payment` while route is `/payment/:carId`
- Success page in add listing navigates to `/dashboard/seller` while current app route is `/seller`

Recommendation:
- In Next.js, standardize canonical routes once and align all buttons/links.

## 12. Build order for fast Next.js recreation

1. Create shell: fonts, color tokens, global dark theme, navbar spacing.
2. Implement auth context + role guards.
3. Build shared components (`Navbar`, `Sidebar`, `CarCard`).
4. Rebuild pages in this order:
   - Homepage, Login, Browse, Car Detail
   - Compare, EMI, Chatbot
   - Buyer/Seller/Admin dashboards
   - Add Listing wizard, Payment
5. Add route normalization and data field normalization adapters.
6. Add responsive tuning (especially Browse, Chatbot, dashboards).

---

If you want, I can generate the initial Next.js folder/file scaffold for this exact UI next.