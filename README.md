# Feedants Competition Details System — Full-Stack Technical Assignment

> Production-quality, dynamic full-stack implementation of the **Feedants Competition Details** screen built with **React Native (Expo)**, **Node.js + Express.js**, and **MongoDB**. Designed for real-world high concurrency, resilient time-dependent lifecycle state machines, and pixel-accurate visual fidelity.

---

## 📱 Live Feature Highlights

- **Visual Fidelity**: Pixel-accurate recreation of the Feedants Competition Details screen (Header, Judge Card, Countdown, Important Dates 2x2 Grid, Previous Winners Carousel, Tabbed Guidelines, Tiered Rewards, Trust & Policies, Referral System, Reviews, Floating Action CTA, and Navigation Bar).
- **100% Dynamic Backend Data**: Zero hardcoded competition data in the frontend. All details, judges, countdowns, timestamps, spots, and previous winners are served dynamically from MongoDB.
- **Authoritative Competition Lifecycle**: Backend-enforced time-dependent state machine (`UPCOMING` ➔ `REGISTRATION_OPEN` ➔ `REGISTRATION_CLOSED` ➔ `SUBMISSION_OPEN` ➔ `JUDGING` ➔ `COMPLETED`).
- **Concurrent Registration & Capacity Protection**: Prevents race conditions and overbooking using atomic conditional updates (`$inc` guarded with `{ bookedSpots: { $lt: maxParticipants } }`) and compound database-level unique indexes (`{ competitionId: 1, userId: 1 }`).
- **Multi-State Testing & Demo User Switcher**: Easily switch between registered users (`Aakash Sharma` ➔ `[✓ Registered]` & `Upload Submission`) and unregistered users (`Priya Patel` ➔ `Register Now - ₹99` & `Only 19 spots left`) directly within the UI header.
- **Idempotency & Replay Protection**: API supports `Idempotency-Key` headers to protect mobile users against duplicate payments or double-taps on poor network connectivity.
- **Automated Concurrency Stress Testing**: Built-in automated simulation script testing simultaneous bursts of requests on limited spots with zero race conditions.

---

## 🛠️ Tech Stack

| Layer | Technologies | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React Native (Expo SDK 57), React 19, `@expo/vector-icons`, React Native Web | Cross-platform native mobile performance (iOS, Android) plus instant web preview capability without environment lock-in. |
| **Backend** | Node.js (v22), Express.js (v4), Mongoose (v8) | Lightweight, asynchronous, high-throughput I/O suited for event-driven concurrency and rapid schema validation. |
| **Database** | MongoDB (v7+) | Flexible document data model with native atomic conditional operators and compound unique index constraints. |
| **Testing** | Jest, Supertest | Comprehensive automated integration tests for business logic, capacity guards, and API boundaries. |

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
│   │   │   ├── competitionService.js  # Read queries, submission logic
│   │   │   ├── lifecycleService.js    # Chronological lifecycle & countdown math
│   │   │   └── registrationService.js # Atomic capacity reservation & rollback
│   │   ├── scripts/
│   │   │   ├── seed.js                # Database seeder matching reference design
│   │   │   └── testConcurrency.js     # Stress test script (10 concurrent users -> 2 spots)
│   │   └── utils/
│   │       └── errors.js              # Standard operational AppError class
│   └── tests/
│       └── competition.test.js        # Automated Jest + Supertest test suite
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
        │   ├── SummaryCard.js         # Title, tags, prize pool, entry fee, capacity bar
        │   ├── JudgeCard.js           # Judge avatar, title, experience, intro video CTA
        │   ├── CountdownBanner.js     # Real-time ticking countdown bar
        │   ├── ImportantDatesGrid.js  # 2x2 dates matrix with icons
        │   ├── PreviousWinnersCarousel.js # Horizontal video thumbnail reel
        │   ├── CompetitionTabsSection.js # About, Judging Criteria, Rules tabs
        │   ├── RewardsSection.js      # Tiered reward cards (1st to 6th position)
        │   ├── DisclaimerBanner.js    # Paid participant disclaimer
        │   ├── TrustPolicySection.js  # Prize disbursement & Razorpay trust cards
        │   ├── ReferralBanner.js      # Referral link copy & earning banner
        │   ├── UserReviewsCard.js     # Participant reviews modal trigger
        │   ├── AdBanner.js            # Ad slot placeholder
        │   ├── BottomCTA.js           # Dynamic floating action button
        │   ├── BottomNav.js           # 5-tab bottom navigation bar
        │   └── Modals.js              # Registration, submission, and video modals
        ├── hooks/
        │   └── useCountdown.js        # Real-time countdown hook
        ├── styles/
        │   └── colors.js              # Exact Feedants UI color palette
        └── utils/
            └── formatters.js          # INR currency, date, and time formatters
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
# Start the production backend server
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

## 🧪 Testing & Concurrency Verification

### 1. Run Automated Unit & Integration Tests

```bash
cd backend
npm test
```
**Test Coverage Includes:**
- Dynamic lifecycle status & countdown calculation.
- Header-based user participation resolution.
- Valid registration & capacity decrement.
- Duplicate registration rejection (HTTP 409 `ALREADY_REGISTERED`).
- Overcapacity rejection when competition is full (HTTP 409 `COMPETITION_FULL`).
- Rejection of registrations after deadline (HTTP 400 `REGISTRATION_CLOSED`).
- Video submission verification (eligible registered participants vs unregistered rejections).

### 2. Run High-Concurrency Stress Test

```bash
cd backend
npm run test:concurrency
```
**What this test does:**
1. Spawns an isolated competition with 5 max capacity where 3 spots are already taken (**only 2 spots remaining**).
2. Creates 10 distinct users who fire simultaneous `registerUser` calls concurrently using `Promise.allSettled`.
3. Verifies that:
   - **Exactly 2 requests succeed** (HTTP 201).
   - **Exactly 8 requests fail** gracefully with HTTP 409 `COMPETITION_FULL`.
   - `bookedSpots` in MongoDB never exceeds 5.
   - Total registrations recorded in MongoDB equals exactly 2.

---

## 🔒 Concurrency & Capacity Protection Strategy

### The Race Condition Problem
In flash registrations (e.g. 1 spot left with 50 simultaneous taps):
```
Naïve Approach:
1. User A reads bookedSpots = 19
2. User B reads bookedSpots = 19
3. User A checks 19 < 20 (true), increments to 20, inserts Registration
4. User B checks 19 < 20 (true), increments to 21, inserts Registration
=> Result: 21 participants booked for a 20-person competition (Overbooking Bug)
```

### Production Two-Tier Protection

1. **Atomic Conditional Counter Update (`$inc` with filter predicate)**:
   ```javascript
   const updatedComp = await Competition.findOneAndUpdate(
     {
       _id: competitionId,
       bookedSpots: { $lt: competition.maxParticipants }
     },
     { $inc: { bookedSpots: 1 } },
     { new: true }
   );
   if (!updatedComp) {
     throw new AppError('Competition is full', 409, 'COMPETITION_FULL');
   }
   ```
   Because MongoDB executes single-document operations atomically at the storage engine level, only requests that match `{ bookedSpots: { $lt: maxParticipants } }` succeed. Any request that executes after capacity is reached returns `null` and is immediately rejected with HTTP 409.

2. **Compound Unique Index on Registrations**:
   ```javascript
   registrationSchema.index({ competitionId: 1, userId: 1 }, { unique: true });
   ```
   If a user double-taps the register button simultaneously or retries a request, MongoDB enforces physical uniqueness. If an insert fails due to duplicate key error `E11000`, the spot increment is safely rolled back using `$inc: { bookedSpots: -1 }`.

3. **Client Idempotency Header**:
   Clients can supply an `Idempotency-Key` header (e.g. UUID). If the client disconnects before receiving the response and retries, the backend returns the existing confirmed registration without re-charging or re-incrementing capacity.

---

## 🌐 REST API Contract

### Base URL: `/api/v1`

#### `GET /competitions`
- **Description**: Returns all competitions with computed lifecycle status and remaining capacity.
- **Status Codes**: `200 OK`.

#### `GET /competitions/:id`
- **Description**: Returns complete details of a competition, computed countdowns, and optional user participation status.
- **Headers**:
  - `x-user-id` *(optional)*: Current authenticated demo user ID.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "competition": {
        "_id": "6aba3a9647dc6d57dd82a6b2",
        "title": "Feedants Classical Dance",
        "prizePool": 1500,
        "entryFee": 99,
        "maxParticipants": 20,
        "bookedSpots": 1,
        "judge": {
          "name": "Manju Dubey",
          "title": "Professional Kathak Dancer",
          "experience": "12+ Years of Experience"
        },
        "importantDates": { ... },
        "rewards": [ ... ]
      },
      "computed": {
        "lifecycleStatus": "REGISTRATION_OPEN",
        "isRegistrationOpen": true,
        "isSubmissionOpen": true,
        "isFull": false,
        "spotsLeft": 19,
        "registrationCountdown": {
          "totalSecondsRemaining": 109712,
          "days": 1,
          "hours": 6,
          "minutes": 28,
          "seconds": 32,
          "formatted": "01d : 06h : 28m : 32s"
        }
      },
      "userParticipation": {
        "isRegistered": true,
        "registrationId": "6aba3a9647dc6d57dd82a6b4",
        "hasSubmitted": false
      }
    }
  }
  ```

#### `POST /competitions/:id/register`
- **Description**: Atomically registers the user for the competition.
- **Headers**:
  - `x-user-id` *(required)*: User ID.
  - `Idempotency-Key` *(optional)*: Replay protection key.
- **Body**: `{ "paymentMethod": "demo_razorpay" }`
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Registration successful!",
    "data": {
      "registration": { ... },
      "competition": { ... },
      "computed": { ... }
    }
  }
  ```
- **Error Codes**:
  - `400 REGISTRATION_CLOSED`: Deadline passed.
  - `400 REGISTRATION_NOT_STARTED`: Competition upcoming.
  - `409 ALREADY_REGISTERED`: User has already registered.
  - `409 COMPETITION_FULL`: All spots taken.

#### `POST /competitions/:id/submissions`
- **Description**: Submits an entry for evaluation.
- **Headers**:
  - `x-user-id` *(required)*: Must belong to a registered user.
- **Body**:
  ```json
  {
    "title": "Kathak Tarana in Teentaal",
    "videoUrl": "https://video.feedants.com/entry.mp4",
    "description": "Solo classical performance"
  }
  ```
- **Response `201 Created`**.
- **Error Codes**:
  - `403 REGISTRATION_REQUIRED`: User is not registered.
  - `400 SUBMISSION_CLOSED`: Submission deadline passed.
  - `409 ALREADY_SUBMITTED`: Only 1 submission allowed per user.

#### `GET /users` & `GET /users/me`
- **Description**: Lists available demo users and checks active user profile.

---

## 💡 Important Assumptions, Technical Decisions & Trade-Offs

### 1. Assumptions Made
- **Overlapping Phases**: As reflected in the reference design, submission starts (6 Aug) before registration ends (10 Aug). The system supports overlapping phases where a user who registers early can submit immediately while registrations remain open for others.
- **Lightweight Authentication**: A realistic `x-user-id` header approach was chosen for demo evaluation rather than a full JWT OAuth server, allowing the evaluator to switch users instantaneously in the header without logging in/out.
- **Mock Payment Gateway**: A Razorpay integration simulation is provided in the mobile client and backend. Upon confirmation, the backend assigns a realistic Razorpay payment ID (`pay_razorpay_...`) and transitions the registration status to `CONFIRMED`.

### 2. Major Technical Decisions
- **Layered Clean Architecture**: Strict separation of concerns (Route -> Controller -> Service -> Model) ensures that business rules and validation are never tangled in route handlers or UI components.
- **Authoritative Server Validation**: All countdowns, capacity checks, and eligibility checks are validated server-side. The client's clock is never trusted.
- **Compound Unique Constraints**: Uniqueness is enforced at the database storage engine level, rendering race conditions impossible.

### 3. Trade-offs Considered
- **In-Memory Locking vs Atomic Database Operators**: In-memory mutexes (such as `async-mutex`) only protect a single Node.js instance. In a scaled environment with multiple Node.js instances behind a load balancer, in-memory locks fail. MongoDB's atomic `$inc` with query filter works across multiple backend instances reliably without introducing Redis.
- **Denormalized Judge & Dates in Competition**: Embedded the judge and date objects inside the `Competition` document to optimize read performance and avoid expensive multi-collection joins for the competition details view.

### 4. What Would Be Improved for Production
1. **Redis Caching with Read-Through**: Cache high-traffic competition metadata with sub-second TTL or cache-invalidation on registration events to support 50,000+ RPS.
2. **Actual Razorpay Webhook Signatures**: Verify HMAC SHA256 webhook signatures from Razorpay for asynchronous payment confirmation.
3. **Cloud Object Storage Video Upload**: Direct-to-S3 presigned URLs for video submissions with transcoding pipelines (e.g., AWS Elemental MediaConvert / Cloudflare Stream).
4. **WebSocket / Server-Sent Events (SSE)**: Real-time spot counter decrement updates pushed to all open client screens as spots are booked.
