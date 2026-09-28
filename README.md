# Feedants Competition Details System — Full-Stack Technical Assignment

> Production-oriented, dynamic full-stack implementation of the **Feedants Competition Details** feature built with **React Native (Expo SDK 57)**, **Node.js + Express.js**, and **MongoDB**. Designed for concurrent user actions, time-dependent lifecycle state machines, and visual fidelity closely following the reference design.

---

## 📱 Live Feature Highlights

- **Visual Alignment**: Close implementation of the Feedants Competition Details screen (Header, Judge Card, Contextual Countdown, Important Dates 2x2 Grid, Previous Winners Carousel, Tabbed Guidelines, Tiered Rewards, Trust & Policies, Referral System, Reviews, Floating Action CTA, and Navigation Bar).
- **100% Dynamic Backend Data**: Zero hardcoded competition business values in the frontend. All details, judges, countdowns, timestamps, spots, rules, perks, and previous winners are served dynamically from MongoDB.
- **Authoritative Competition Lifecycle**: Backend-enforced state machine separating macro phases (`DRAFT`, `UPCOMING`, `REGISTRATION_OPEN`, `REGISTRATION_AND_SUBMISSION_OPEN`, `SUBMISSION_OPEN`, `JUDGING`, `COMPLETED`, `CANCELLED`) from granular user action permissions (`canRegister`, `canSubmit`).
- **Contextual Countdown Presentation**: Context-aware countdown banner that displays appropriate messaging depending on state (e.g. countdown to start for upcoming competitions, countdown to close for active registrations, status notices for full, judging, completed, or cancelled competitions).
- **Concurrent Registration & Capacity Consistency**:
  - **Primary Production Path**: Multi-document ACID MongoDB Transactions using `session.withTransaction()` with automatic retries on transient write conflicts. A MongoDB replica set (or MongoDB Atlas) is the recommended environment for production and test execution.
  - **Development Fallback**: Explicit limited non-transactional atomic conditional counter update (`$inc` with `{ bookedSpots: { $lt: maxParticipants } }`) with compensating rollback (`$inc: -1`), used solely when running against single-node standalone MongoDB where transactions are unsupported.
- **Scoped Idempotency & Operation Replay**: API scopes idempotency strictly to `(competitionId + userId + idempotencyKey)` and returns the logical operation result (`idempotentReplay: true`) without re-incrementing capacity. The mobile client preserves a stable session key across retries.
- **Active vs Cancelled Participation**: Only `CONFIRMED` registrations count as active participation. Cancelled registrations do not block re-registration and cannot submit entries. Atomic reactivation prevents race conditions on re-registration.
- **Duplicate Submission Concurrency Guard**: Rejects simultaneous duplicate submission attempts with HTTP 409 `ALREADY_SUBMITTED`.
- **Real Media Playback**: Judge introduction and previous winner reels stream genuine video and audio using native HTML5 `<video>` for web and `expo-av` for native iOS/Android.
- **Functional Interactive Actions**:
  - **Go back**: Working action displaying competition selector.
  - **Copy Link**: Copies the referral URL to system clipboard with visual confirmation.
  - **Refer Now**: Triggers the genuine OS native sharing sheet via React Native's `Share.share` API.
  - **Lightweight Localization**: Instant language toggle between English and Hindi (`ENG` / `हिंदी`) for visible UI labels.
  - **Demo User Switcher**: Switch between registered users (`Aakash Sharma` ➔ `[✓ Registered]` & `Upload Submission`) and unregistered users (`Priya Patel` ➔ `Register Now - ₹99` & `Only 19 spots left`) directly within the UI header.

---

## 🛠️ Tech Stack

| Layer | Technologies | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React Native (Expo SDK 57), React 19, `@expo/vector-icons`, `expo-av`, React Native Web | Cross-platform native mobile performance (iOS, Android) plus web preview capability with real media streaming. |
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

## 🚀 Setup, Configuration & Running Guide

### 1. Required Environment Variables & Configuration Details

#### Backend Environment Configuration (`backend/.env`)
Create a `.env` file in the `backend/` root directory (template provided in `backend/.env.example`):

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port number on which the Express REST API server listens. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/feedants_competition` | MongoDB connection URI. Supports local MongoDB or MongoDB Atlas / Replica Set URIs. |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, or `test`). |

#### Mobile Client API Configuration (`mobile/src/api/config.js`)
The mobile app automatically detects the host platform to route network requests correctly:

| Target Platform | Resolved Base URL | Rationale |
| :--- | :--- | :--- |
| **Web Browser / iOS Simulator** | `http://localhost:5000/api/v1` | Accesses host machine localhost directly. |
| **Android Emulator** | `http://10.0.2.2:5000/api/v1` | Routes to host machine localhost through Android loopback alias. |
| **Physical Device (Expo Go)** | `http://<YOUR_LOCAL_IP>:5000/api/v1` | Connects over local Wi-Fi network. |

---

### 2. Instructions for Running the Backend Server

```bash
# 1. Open terminal and navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env configuration file
cp .env.example .env

# 4. Seed database with reference competition & demo users
npm run seed

# 5. Start the Express API server
npm start

# (Optional) Run with hot-reloading for development:
npm run dev
```

- Backend REST API: `http://localhost:5000/api/v1`
- Healthcheck endpoint: `http://localhost:5000/health`

---

### 3. Instructions for Running the React Native Mobile Application

Open a new terminal window:

```bash
# 1. Navigate to the mobile directory
cd mobile

# 2. Install dependencies
npm install

# 3. Start Expo development server
npm start
```

#### Choose your target platform:

- **Web Preview (Browser)**: Press `w` in the Expo terminal or run:
  ```bash
  npm run web
  ```
  App loads at `http://localhost:8081`.

- **Android Emulator**: Ensure Android Studio emulator is running, then press `a` or run:
  ```bash
  npm run android
  ```

- **iOS Simulator** (macOS only): Press `i` or run:
  ```bash
  npm run ios
  ```

---

## 🧪 Testing & Verification

### 1. Complete Integration Test Suite (Multi-Document Transactions)

```bash
cd backend
npm test
```
*Spins up an in-memory MongoDB replica set (`mongodb-memory-server`) to execute 15 automated integration tests validating multi-document ACID transactions, concurrency capacity races, idempotency replays, cancelled participation, duplicate submission races, and lifecycle state rejections.*

### 2. Standalone Concurrency Stress Test

```bash
cd backend
npm run test:concurrency
```
*Fires 10 simultaneous registration requests targeting 2 available spots to verify atomic capacity protection on local MongoDB.*

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

  // 3. Atomically reactivate cancelled registration or create new record
  ...
});
```
- `session.withTransaction()` automatically catches and retries `TransientTransactionError` (such as `WriteConflict` code 112) under high concurrent load.

### 2. Limited Non-Transactional Development Fallback
When running against a single-node standalone MongoDB instance (where replica sets are unsupported), the service uses an atomic conditional counter update (`$inc` guarded with `{ bookedSpots: { $lt: maxParticipants } }`) and rolls back the counter (`$inc: -1`) if record insertion fails.
*Notice: This fallback is retained exclusively for local development on single-node standalone MongoDB and is not equivalent to an ACID transaction. A replica set environment is recommended.*

---

## 🌐 REST API Contract

### Base URL: `/api/v1`

#### `GET /competitions/:id`
- Returns competition details, permissions (`canRegister`, `canSubmit`), contextual countdown config, and user participation status.

#### `POST /competitions/:id/register`
- Headers: `x-user-id` (required), `Idempotency-Key` (optional).
- Body: `{ "paymentMethod": "demo_razorpay" }`
- Responses: `201 Created`, `400 Bad Request` (`COMPETITION_DRAFT`, `COMPETITION_CANCELLED`, `COMPETITION_COMPLETED`, `REGISTRATION_CLOSED`, `REGISTRATION_NOT_STARTED`), `409 Conflict` (`COMPETITION_FULL`, `ALREADY_REGISTERED`).

#### `POST /competitions/:id/submissions`
- Headers: `x-user-id` (required).
- Body: `{ "title": "Kathak Tarana", "videoUrl": "https://...", "description": "Notes" }`
- Responses: `201 Created`, `400 Bad Request` (`COMPETITION_DRAFT`, `COMPETITION_CANCELLED`, `COMPETITION_COMPLETED`, `SUBMISSION_CLOSED`), `403 Forbidden` (`REGISTRATION_REQUIRED`), `409 Conflict` (`ALREADY_SUBMITTED`).

---

## 💡 Architectural Decisions, Assumptions & Production Roadmap

### 1. Important Assumptions Made
- **Overlapping Lifecycle Windows**: In accordance with real competition schedules (e.g. registration closes Aug 10, submissions open Aug 6), submission begins before registration ends. The system explicitly supports overlapping phases where registered users can submit entries while registrations remain open for newcomers.
- **Evaluation-Friendly User Persona Switching**: A lightweight `x-user-id` header approach was chosen over full OAuth/JWT login to allow evaluators to seamlessly toggle between pre-registered (`Aakash Sharma`) and unregistered (`Priya Patel`) users directly within the mobile app header bar.
- **Simulated Payment Gateway**: The Razorpay payment step generates realistic payment identifiers (`pay_razorpay_...`) and immediate confirmation to enable seamless interactive evaluation without requiring real payment credentials or test cards.
- **Single Active Participation**: A user may have only one active (`CONFIRMED`) registration per competition. If a user's registration was previously `CANCELLED`, re-registration reactivates the record rather than throwing a duplicate key error.

### 2. Major Technical Decisions
- **MongoDB Multi-Document ACID Transactions as Primary Path**: Implemented `session.withTransaction()` as the primary registration strategy to guarantee strict consistency across `competitions` and `registrations` collections under high write contention.
- **Decoupled Lifecycle Engine**: Created `lifecycleService.js` to decouple the overall macro competition state (`DRAFT`, `UPCOMING`, `REGISTRATION_OPEN`, `REGISTRATION_AND_SUBMISSION_OPEN`, `SUBMISSION_OPEN`, `JUDGING`, `COMPLETED`, `CANCELLED`) from granular user permissions (`canRegister`, `canSubmit`).
- **Scoped Idempotency Guarantee**: Scoped idempotency strictly to `(competitionId + userId + idempotencyKey)`, returning an operation replay (`idempotentReplay: true`) across retries without re-incrementing participant counts.
- **Cross-Platform Real Video Player**: Integrated HTML5 native `<video>` elements for React Native Web and `expo-av` for native iOS/Android to ensure judge introduction reels and previous winner videos stream real media.

### 3. Trade-offs Considered
- **MongoDB Transactions vs. Atomic Counters with Rollback**: Transactions require a MongoDB Replica Set or MongoDB Atlas. Rather than forcing a replica set dependency on local single-node development environments, we implemented transactions as the primary path and retained an atomic conditional update fallback for standalone local dev nodes.
- **Header-Based User Switcher vs. Full JWT/OAuth Authentication**: Implementing full JWT auth with login screens adds friction for assignment evaluation. Trade-off: Used an `x-user-id` HTTP header with an in-app toggle so evaluators can inspect different user states with a single click.
- **Server-Authoritative State vs. Client-Side Time Calculations**: Client-calculated countdowns and permissions can drift or be tampered with. Trade-off: The backend serves authoritative `computed` permission flags (`canRegister`, `canSubmit`, `countdownConfig`), while the mobile client only runs a timer hook for real-time second updates.

### 4. Production Enhancements & Future Roadmap
If this application were being prepared for a large-scale commercial rollout, the following enhancements would be prioritized:
1. **Asynchronous Payment Webhooks**: Replace synchronous client payment confirmation with cryptographically signed Razorpay webhooks (`razorpay_signature`) processed via background queues.
2. **Distributed Redis Caching**: Under 50,000+ RPS read traffic, cache competition metadata in Redis with Pub/Sub cache invalidation triggered by registration events.
3. **Presigned Cloud Uploads**: Implement AWS S3 / Google Cloud Storage presigned upload URLs for direct client-to-bucket multipart video uploads instead of submitting raw URLs.
4. **Asynchronous Worker Queues**: Process entry judging, video transcoding, score aggregation, winner notifications, and payout disbursements asynchronously using BullMQ or Celery queues.

