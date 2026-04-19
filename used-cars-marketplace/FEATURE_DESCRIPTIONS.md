# Feature Descriptions for Upcoming Implementation

This document defines the product behavior for the current highlighted marketplace features:
- AI Trust Score
- Smart Chatbot
- Live Bidding
- EMI Calculator
- Side-by-Side Compare

The goal is to convert homepage promises into implementation-ready requirements.

## Project Context

- Existing backend schema includes tables for users, cars, orders, payments, inquiries, wishlists, and seller verification.
- Existing frontend has pages for chatbot, compare, EMI, payment, and orders.

## Shared Non-Functional Requirements

- Performance: key feature actions should respond within 2 seconds in normal load.
- Security: all mutating endpoints must require JWT auth and role checks.
- Reliability: failures must return clear, user-friendly error states.
- Auditability: high-risk actions (bids and trust-score updates) must be logged.
- Mobile support: all feature UIs must work on screens from 360px width and above.

---

## 1) AI Trust Score

### Objective
Provide a transparent trust rating for each car so buyers can quickly judge listing credibility.

### User Stories
- As a buyer, I want to see a trust score on every listing so I can avoid risky cars.
- As a buyer, I want to know why the score is high or low.
- As a seller, I want to improve my score by completing verification and accurate listing data.

### Functional Requirements
- Show trust score on card and detail pages as a number from 0 to 100.
- Show trust band labels: Low (0-39), Medium (40-69), High (70-100).
- Provide factor breakdown in car detail page (example: seller verified, service history, ownership count, price fairness, image completeness).
- Automatically compute score when a car row is inserted.
- Automatically recompute score when relevant listing fields change or seller verification changes.
- If data is insufficient, show "Score pending" state.

### Data and Backend Notes
- Add fields to `cars` (or related table): `trust_score`, `trust_band`, `trust_updated_at`.
- Add trust factors table for explainability (optional but recommended).
- Add `trust_score_jobs` queue table for async scoring jobs.
- Add DB triggers:
	- `AFTER INSERT` on `cars`: enqueue trust-score generation job.
	- `AFTER UPDATE` on relevant `cars` columns: enqueue trust-score regeneration job.
- Add backend worker/cron consumer that reads queue jobs and calls Gemini (`GEMINI_API_KEY`) to generate factors + score.
- Gemini usage is mandatory for AI scoring; no alternate AI provider in v1.

### API Requirements
- GET /cars should include trust score summary.
- GET /cars/:id should include trust score factors.
- POST /admin/trust-score/recompute/:carId remains optional admin override.

### Out of Scope for v1
- External vehicle-history provider integration.

### Acceptance Criteria
- Every ACTIVE listing returns a trust score or pending state.
- Buyer can view at least 4 score factors on detail page.
- New car insert enqueues score generation automatically via DB trigger.
- Trust score updates are reflected after listing update within 1 minute.

---

## 2) Smart Chatbot

### Objective
Allow buyers to describe needs in plain language and get matching car recommendations.

### User Stories
- As a buyer, I want to type natural language queries like "SUV under 8 lakh in Delhi".
- As a buyer, I want useful follow-up questions if my query is incomplete.
- As a buyer, I want recommended cars with direct links to details.

### Functional Requirements
- Chat input accepts free-text user intent.
- Intent parser extracts filters (budget, city, fuel type, transmission, body type, year range).
- Bot asks clarifying question when required filters are missing.
- Return top matched cars with confidence/explanation text.
- Save recent conversation context per user session.

### Data and Backend Notes
- Reuse cars table filtering indexes for quick response.
- Add optional `chat_sessions` and `chat_messages` tables for persistence.
- Fallback mode: if NLP fails, convert message to keyword search.
- Gemini is required for intent extraction and follow-up generation (`GEMINI_API_KEY`).

### API Requirements
- POST /chatbot/query with message and optional session id.
- Response includes parsed filters, follow-up question (optional), and recommended cars.
- GET /chatbot/sessions/:id for previous messages (optional in v1).

### Out of Scope for v1
- Voice chat.
- Multi-language generation beyond English.

### Acceptance Criteria
- Query like "automatic hatchback under 6 lakh" returns relevant cars.
- Bot asks follow-up if key fields like budget and location are missing.
- User can open recommended car from chatbot results.

---

## 3) Live Bidding

### Objective
Enable real-time bidding on selected listings to improve price discovery and engagement.

### User Stories
- As a buyer, I want to place a bid and know immediately if I am highest bidder.
- As a seller, I want to accept or reject bids quickly.
- As a bidder, I want notifications for outbid, accepted, or rejected events.

### Functional Requirements
- Sellers can enable bidding for eligible listings.
- Buyers can place bid above current highest bid and minimum increment.
- Show current highest bid, total bids, and bidding end time.
- Sellers can accept one bid, which transitions listing toward order/payment flow.
- Real-time updates via WebSocket or polling fallback.

### Data and Backend Notes
- Add `car_bids` table: car_id, bidder_id, bid_amount, status, created_at.
- Add `bidding_config` per car: is_enabled, min_increment, end_time.
- On accepted bid, lock listing from further bids and create order draft.

### API Requirements
- POST /cars/:id/bids place bid.
- GET /cars/:id/bids fetch bid history (role-based visibility).
- POST /cars/:id/bids/:bidId/accept seller accepts.
- POST /cars/:id/bids/:bidId/reject seller rejects.

### Out of Scope for v1
- Auto-bid agents.
- Cross-listing portfolio bids.

### Acceptance Criteria
- Lower-than-minimum-increment bids are rejected with clear message.
- Outbid user sees status update without page reload.
- Accepting a bid stops further bidding for that car.

---

## 4) EMI Calculator

### Objective
Help buyers estimate financing affordability directly from listing context.

### User Stories
- As a buyer, I want instant EMI estimates based on car price and tenure.
- As a buyer, I want to adjust down payment and interest rate.
- As a buyer, I want a repayment breakdown before making a decision.

### Functional Requirements
- System auto-generates default EMI values as soon as a car is added to DB.
- Inputs for auto generation defaults: car price, default down payment %, default annual rate, default tenure months.
- Outputs: monthly EMI, total interest, total payable amount.
- Optional amortization schedule table for monthly principal and interest split.
- EMI page pre-fills from stored auto-generated values and still allows user-side simulation changes.

### Formula
Use the standard EMI formula:

\[
EMI = P \times r \times \frac{(1+r)^n}{(1+r)^n - 1}
\]

Where:
- P = principal after down payment
- r = monthly interest rate (annual_rate / 12 / 100)
- n = tenure in months

### Data and Backend Notes
- Add `car_emi_quotes` table linked by `car_id` storing:
	- principal
	- annual_interest_rate
	- tenure_months
	- monthly_emi
	- total_interest
	- total_payable
	- calculated_at
- Add DB triggers:
	- `AFTER INSERT` on `cars`: generate EMI row using platform defaults.
	- `AFTER UPDATE` on `cars.price`: recalculate EMI row.
- Default assumptions for v1 (editable in config):
	- down payment: 20%
	- annual interest: 9.5%
	- tenure: 60 months

### API Requirements
- GET /cars/:id/emi returns stored auto-generated EMI quote.
- Optional GET /finance/rates for suggested bank rates.

### Out of Scope for v1
- Direct loan application workflow.
- Credit score based dynamic interest pricing.

### Acceptance Criteria
- Car insert creates EMI quote automatically via DB trigger.
- Price update recomputes EMI quote automatically.
- Input validation blocks invalid values (negative amount, zero tenure).
- Results are readable and responsive on mobile.

---

## 5) Side-by-Side Compare

### Objective
Allow buyers to compare up to three cars on key specs, pricing, and value indicators.

### User Stories
- As a buyer, I want to compare shortlisted cars in one table.
- As a buyer, I want highlighted best values for each metric.
- As a buyer, I want a simple recommendation summary.

### Functional Requirements
- Allow adding/removing cars to compare list (max 3).
- Show comparison dimensions: price, year, kilometers, fuel, transmission, ownership, trust score, seller verification.
- Highlight best metric per row (for example lower km, newer year, better trust score).
- Generate short verdict text using rules (best budget, best reliability, best overall).

### Data and Backend Notes
- Reuse existing car detail payload.
- Optional compare endpoint to normalize and score cars server-side.

### API Requirements
- v1 can use existing GET /cars/:id calls from frontend.
- Optional POST /compare with car ids for centralized verdict logic.

### Out of Scope for v1
- More than 3 cars.
- Export comparison as PDF.

### Acceptance Criteria
- User can compare exactly 2 or 3 cars.
- Compare table includes trust score and seller verification status.
- Verdict text changes when compared cars change.

---

## Suggested Implementation Order

1. AI Trust Score with trigger + queue + Gemini worker.
2. EMI Calculator auto-generation with DB trigger.
3. Side-by-Side Compare (quick user value, moderate complexity).
4. Smart Chatbot with Gemini parsing.
5. Live Bidding (real-time + state complexity, better after core flows stabilize).

## Definition of Done for Each Feature

- Backend APIs implemented with validation and auth.
- Frontend UI integrated in existing page/routes.
- Role checks and error handling covered.
- Basic test coverage for critical paths.
- Documentation updated in README and API notes.
