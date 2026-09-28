# Feedants Competition Details System — Full-Stack Technical Assignment

> Production-quality, dynamic full-stack implementation of the **Feedants Competition Details** screen built with **React Native (Expo SDK 57)**, **Node.js + Express.js**, and **MongoDB**. Designed for real-world high concurrency, resilient time-dependent lifecycle state machines, and pixel-accurate visual fidelity.

---

## 📱 Live Feature Highlights

- **Visual Fidelity**: Pixel-accurate recreation of the Feedants Competition Details screen (Header, Judge Card, Contextual Countdown, Important Dates 2x2 Grid, Previous Winners Carousel, Tabbed Guidelines, Tiered Rewards, Trust & Policies, Referral System, Reviews, Floating Action CTA, and Navigation Bar).
- **100% Dynamic Backend Data**: Zero hardcoded competition data in the frontend. All details, judges, countdowns, timestamps, spots, rules, perks, and previous winners are served dynamically from MongoDB.
- **Authoritative Competition Lifecycle**: Backend-enforced state machine separating macro phases (`UPCOMING`, `REGISTRATION_OPEN`, `REGISTRATION_AND_SUBMISSION_OPEN`, `SUBMISSION_OPEN`, `JUDGING`, `COMPLETED`) from granular user action permissions (`canRegister`, `canSubmit`).
- **Contextual Countdown Presentation**: Never falsely claims "Registration closes in" when a competition is upcoming, completed, judging, or full.
- **Concurrent Registration & Capacity Protection**:
  - **Primary Production Path**: Multi-document ACID MongoDB Transactions using `session.withTransaction()` with automatic retries on transient write conflicts.
  - **Development Fallback**: Explicit limited non-transactional atomic conditional counter update with compensating rollback, used solely when running against single-node standalone MongoDB.
- **Scoped Idempotency & Replay Protection**: API scopes idempotency strictly to `(competitionId + userId + idempotencyKey)` and returns the identical logical operation payload on retries without re-incrementing capacity. The mobile client preserves a stable session key across retries.
- **Active vs Cancelled Participation**: Only `CONFIRMED` registrations count as active participation. Cancelled registrations do not block re-registration and cannot submit entries.
- **Duplicate Submission Concurrency Guard**: Rejects simultaneous duplicate submission attempts with HTTP 409 `ALREADY_SUBMITTED`.
- **Real Media Playback**: Judge introduction and previous winner reels stream genuine video and audio using native HTML5 `<video>` for web and `expo-av` for native iOS/Android.
- **Functional Interactive Actions**:
  - **Go back**: Working action displaying competition selector.
  - **Copy Link**: Actually copies the referral URL to system clipboard with visual feedback.
  - **Refer Now**: Triggers the genuine OS native sharing sheet via React Native's `Share.share` API.
  - **Lightweight Localization**: Instant language toggle between English and Hindi (`ENG` / `हिंदी`) for key UI labels.
  - **Demo User Switcher**: Easily switch between registered users (`Aakash Sharma` ➔ `[✓ Registered]` & `Upload Submission`) and unregistered users (`Priya Patel` ➔ `Register Now - ₹99` & `Only 19 spots left`) directly within the UI header.

---

## 🛠️ Tech Stack

| Layer | Technologies | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React Native (Expo SDK 57), React 19, `@expo/vector-icons`, `expo-av`, React Native Web | Cross-platform native mobile performance (iOS, Android) plus instant web preview capability with real media streaming. |
| **Backend** | Node.js (v22), Express.js (v4), Mongoose (v8) | Lightweight, asynchronous, high-throughput I/O suited for event-driven concurrency and rapid schema validation. |
| **Database** | MongoDB (v8+) | Document database supporting multi-document ACID transactions, atomic conditional operators, and compound unique constraints. |
| **Testing** | Jest, Supertest, `mongodb-memory-server` | Integration test suite executing multi-document transactions against an in-memory replica set. |

---

## 📂 Project Structure

```
Blaccskull assignment/
├── DESIGN.md                          # Architectural specification & state matrix
├── README.md                          # Complete setup, API contracts & documentation
│
├── backend/                           # Node.js + Express.js API
│   ├── .env                           # Environment variables
│   ├── .env.example                   # Template environment config
│   ├── package.json
│   ├── src/
│   │   ├── app.js                     # Express app, middleware, global error handler
│   │   ├── server.js                  # HTTP server & MongoDB connection
│   │   ├── config/
│   │   │   └── db.js                  # Mongoose connection setup
│   │   ├── controllers/
│   │   │   ├── competitionController.js
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   ├── Competition.js         # Competition schema & virtuals
│   │   │   ├── Registration.js        # Compound unique index { competitionId, userId }
│   │   │   ├── Submission.js          # Submission schema & unique index
│   │   │   └── User.js                # Demo users schema
│   │   ├── routes/
│   │   │   ├── competitionRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── services/
│   │   │   ├── competitionService.js  # Confirmed registration check & submission races
│   │   │   ├── lifecycleService.js    # Decoupled phase & action permissions
│   │   │   └── registrationService.js # Primary transaction path + dev fallback
│   │   ├── scripts/
│   │   │   ├── seed.js                # Database seeder matching reference design
│   │   │   └── testConcurrency.js     # Standalone concurrency stress test script
│   │   └── utils/
│   │       └── errors.js              # Standard operational AppError class
│   └── tests/
│       └── competition.test.js        # Automated Jest suite with in-memory replica set
│
└── mobile/                            # React Native Application (Expo)
    ├── App.js                         # Root application entry
    ├── package.json
    └── src/
        ├── api/
        │   ├── config.js              # Platform-aware API host resolver
        │   └── competitionApi.js      # REST API client
        ├── components/
        │   ├── HeaderBar.js           # Back button, Language toggle, Demo User Switcher
        │   ├── SummaryCard.js         # Title, tags, dynamic perks, prize pool, capacity bar
        │   ├── JudgeCard.js           # Judge avatar, title, experience, real video trigger
        │   ├── CountdownBanner.js     # Context-aware countdown banner
        │   ├── ImportantDatesGrid.js  # 2x2 dates matrix with icons
        │   ├── PreviousWinnersCarousel.js # Horizontal video thumbnail reel
        │   ├── CompetitionTabsSection.js # Dynamic About, Judging Criteria, Rules tabs
        │   ├── RewardsSection.js      # Tiered reward cards (1st to 6th position)
        │   ├── DisclaimerBanner.js    # Paid participant disclaimer
        │   ├── TrustPolicySection.js  # Prize disbursement & Razorpay trust cards
        │   ├── ReferralBanner.js      # Real clipboard copy & native share sheet
        │   ├── UserReviewsCard.js     # Participant reviews modal trigger
        │   ├── AdBanner.js            # Ad slot placeholder
        │   ├── BottomCTA.js           # Dynamic floating action button
        │   ├── BottomNav.js           # 5-tab bottom navigation bar
        │   └── Modals.js              # Registration, submission, and genuine video player
        ├── hooks/
        │   └── useCountdown.js        # Real-time countdown hook
        ├── styles/
        │   └── colors.js              # Exact Feedants UI color palette
        └── utils/
            ├── formatters.js          # INR currency, date, and time formatters
            └── i18n.js                # Lightweight English/Hindi dictionary
```

---

## 🚀 Setup & Execution Guide

### 1. Prerequisites
- **Node.js**: v18+ or v22+
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017` (or remote MongoDB Atlas URI)

### 2. Backend Setup & Seeding

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file (already preconfigured for local MongoDB)
cp .env.example .env

# 4. Seed the database with the Feedants reference data
npm run seed
```

The seed script initializes:
- **Featured Competition**: `"Feedants Classical Dance"` (20 max spots, 1 booked, 19 spots left, exact prize pool of ₹1,500, tiered rewards summing to ₹1,500, Kathak judge Manju Dubey, and 4 previous winners).
- **Demo Users**:
  - `Aakash Sharma` (Pre-registered, triggers `[✓ Registered]` and `Upload Submission`).
  - `Priya Patel` (Unregistered, triggers `Register Now - ₹99` and `Only 19 spots left`).
  - `Rohan Verma` & `Ananya Iyer` (Additional participants for concurrency testing).
- **Alternate State Competitions**:
  - `Feedants Hip-Hop Showdown` (`REGISTRATION_CLOSED` / Sold Out).
  - `Feedants Folk Dance Fiesta` (`UPCOMING`).

### 3. Start the Backend API

```bash
# Start the backend server
npm start

# Or run with auto-reload in development
npm run dev
```
The backend starts at: `http://localhost:5000`  
Healthcheck endpoint: `http://localhost:5000/health`

### 4. Start the React Native Mobile App

Open a new terminal window:

```bash
# 1. Navigate to mobile directory
cd mobile

# 2. Start the Expo app
npm start

# Run on Web (Browser):
npm run web
# (or press 'w' in the Expo terminal)

# Run on Android Emulator:
npm run android

# Run on iOS Simulator (macOS):
npm run ios
```
For web preview, open `http://localhost:8081` in Chrome/Edge.

---

## 🧪 Testing & Verification

### 1. Automated Integration Test Suite (with Replica Set & Transactions)

```bash
cd backend
npm test
```
The test suite spins up an in-memory replica set via `mongodb-memory-server` to execute **genuine MongoDB Multi-Document ACID Transactions**.

**12 Automated Tests Covering:**
1. Decoupled permission flags (`canRegister`, `canSubmit`) and contextual countdown types.
2. User participation resolution for confirmed registrations.
3. Concurrent capacity race: 6 users racing for 2 spots (exactly 2 succeed, 4 receive `COMPETITION_FULL`, 0 overbooking).
4. Concurrent duplicate registration: same user firing 4 simultaneous requests (1 succeeds, 3 receive `ALREADY_REGISTERED`).
5. Scoped idempotency retry: identical logical result returned without double-decrementing capacity.
6. Cancelled registration handling: users with `status: 'CANCELLED'` cannot submit entries (HTTP 403 `REGISTRATION_REQUIRED`).
7. Registration reactivation: users with cancelled records can re-register and reactivate their spot.
8. Duplicate submission race: simultaneous submission calls return HTTP 409 `ALREADY_SUBMITTED`.
9. Overlapping window verification: simultaneous registration and submission allowances.
10. Full competition rejection (HTTP 409 `COMPETITION_FULL`).
11. Expired deadline rejection (HTTP 400 `REGISTRATION_CLOSED`).
12. Upcoming competition rejection (HTTP 400 `REGISTRATION_NOT_STARTED`).

### 2. Standalone Concurrency Stress Test (Development Fallback Verification)

```bash
cd backend
npm run test:concurrency
```
Tests 10 simultaneous registration attempts targeting 2 remaining spots against the local standalone MongoDB instance using the limited non-transactional development fallback.

---

## 🔒 Concurrency & Registration Consistency Strategy

### 1. Primary Production Path (ACID Multi-Document Transactions)
When connected to a MongoDB Replica Set or MongoDB Atlas, `RegistrationService` executes all state mutations inside a transaction:
```javascript
await session.withTransaction(async () => {
  // 1. Atomic capacity guard & reservation
  const updatedComp = await Competition.findOneAndUpdate(
    { _id: competitionId, bookedSpots: { $lt: competition.maxParticipants } },
    { $inc: { bookedSpots: 1 } },
    { session, new: true }
  );
  if (!updatedComp) throw new AppError('Competition is full', 409, 'COMPETITION_FULL');

  // 2. Active participation check
  const activeReg = await Registration.findOne({ competitionId, userId, status: 'CONFIRMED' }).session(session);
  if (activeReg) throw new AppError('Already registered', 409, 'ALREADY_REGISTERED');

  // 3. Insert or reactivate registration inside transaction
  ...
});
```
- `session.withTransaction()` automatically catches and retries `TransientTransactionError` (such as `WriteConflict` code 112) under high concurrent load.

### 2. Limited Non-Transactional Development Fallback
When running against a single-node standalone MongoDB instance (where replica sets are unsupported), the service uses an atomic conditional counter update (`$inc` guarded with `{ bookedSpots: { $lt: maxParticipants } }`) and rolls back the counter (`$inc: -1`) if record insertion fails.
*Documentation Notice: This fallback is retained exclusively for local development on single-node MongoDB and is not equivalent to an ACID transaction.*

---

## 🌐 REST API Contract

### Base URL: `/api/v1`

#### `GET /competitions/:id`
- Returns competition details, permissions (`canRegister`, `canSubmit`), contextual countdown config, and user participation status.

#### `POST /competitions/:id/register`
- Headers: `x-user-id` (required), `Idempotency-Key` (optional).
- Body: `{ "paymentMethod": "demo_razorpay" }`
- Responses: `201 Created`, `400 Bad Request`, `409 Conflict`.

#### `POST /competitions/:id/submissions`
- Headers: `x-user-id` (required).
- Body: `{ "title": "Kathak Tarana", "videoUrl": "https://...", "description": "Notes" }`
- Responses: `201 Created`, `403 Forbidden` (`REGISTRATION_REQUIRED`), `409 Conflict` (`ALREADY_SUBMITTED`).

---

## 💡 Important Assumptions & Known Limitations

### 1. Assumptions Made
- **Overlapping Lifecycle Windows**: Submissions can open before registration closes. The system supports overlapping phases where registered users can submit entries while new users can still register.
- **Authentication**: A lightweight `x-user-id` header approach was chosen to allow evaluators to switch users effortlessly directly within the UI header without having to log in/out.
- **Payment Gateway**: Simulated Razorpay checkout flow assigns realistic payment IDs (`pay_razorpay_...`) and transitions registration to `CONFIRMED`.

### 2. Remaining Limitations for Future Production
1. **Webhook Processing**: In a real production setup, payment confirmation would be processed asynchronously via cryptographically verified Razorpay webhooks (`razorpay_signature`).
2. **Distributed Caching (Redis)**: Under 50,000+ RPS read traffic, caching competition metadata in Redis with cache-invalidation on registration events would minimize database read load.
3. **Presigned Cloud Uploads**: Real user video uploads would generate presigned S3/GCS upload URLs rather than submitting raw video URLs.
