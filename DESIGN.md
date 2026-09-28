# Feedants Competition Details System — Architecture & Design Document (DESIGN.md)

## 1. Executive Summary & Objective

This document outlines the architectural blueprint, data model, lifecycle state machine, concurrency management, REST API contract, and component hierarchy for the **Feedants Competition Details Feature**.

Rather than treating this as a superficial mobile clone, this design implements a resilient, enterprise-grade full-stack architecture built on:
- **Frontend**: React Native (Expo supporting Mobile iOS/Android & Web preview)
- **Backend**: Node.js + Express.js (Layered Architecture: Route -> Controller -> Service -> Model)
- **Database**: MongoDB (with Mongoose ODM, atomic conditional operators, and compound unique constraints)

---

## 2. Visual Reference Analysis (Page 3 of Specification)

### 2.1 UI Component & Data Classification

| UI Section | Visual Elements | Classification | Data Source |
| :--- | :--- | :--- | :--- |
| **Top Bar** | Back button ("Go back"), Language toggle `[ENG \| हिंदी]` | Static UI + Local State | Client UI State |
| **Competition Header** | Title ("Feedants Classical Dance"), Category badges (`Dance`, `Multi-Win`), Perks ("Winners get certificate") | Backend Dynamic Data | `Competition.title`, `Competition.category`, `Competition.tags`, `Competition.perks` |
| **Registration Badge** | `[✓ Registered]` / `[Open]` / `[Closed]` / `[Full]` | User-specific & Computed | Computed from user registration record & competition state |
| **Financial Summary** | Prize Pool (`₹ 1,500`), Entry Fee (`₹ 99`) | Backend Dynamic Data | `Competition.prizePool`, `Competition.entryFee` |
| **Capacity Tracker** | "Only 19 spots left", Progress Bar, "1 / 20 Booked" | Dynamic & Computed | `Competition.maxParticipants`, `Competition.bookedSpots`, `spotsLeft = max - booked` |
| **Judge Section** | Avatar, Name ("Manju Dubey"), Title ("Professional Kathak Dancer"), Experience ("12+ Years"), Video Intro Button | Backend Dynamic Data | `Competition.judge` (nested/referenced object) |
| **Countdown Bar** | Hourglass icon, "Registration closes in", `01d : 06h : 28m : 32s`, "Hurry up!" badge | Time-Dependent & Computed | Calculated in real-time from `Competition.importantDates.registrationClosesAt - Date.now()` |
| **Important Dates Grid** | 2x2 Grid: Register Before, Submission Starts, Submission Ends, Result Date | Backend Dynamic Data | `Competition.importantDates` (ISO timestamps) |
| **Previous Winners** | Horizontal card carousel with thumbnails, video triggers, names ("Riya Shah"), ranks ("1st Winner") | Backend Dynamic Data | `Competition.previousWinners` array |
| **Tabbed Content** | Tabs: "About Competition", "Judging Parameters", "Rules & Eligibility" + "View more" toggle | Backend Data + Local UI State | `Competition.description`, `Competition.judgingCriteria`, `Competition.rules` |
| **Rewards Breakdown** | Tiered table: 1st Winner (₹550), 2nd (₹300), 3rd (₹240), 4th (₹200), 5th (₹130), 6th (₹80) | Backend Dynamic Data | `Competition.rewards` array (sum = prizePool) |
| **Disclaimer Banner** | "Disclaimer: Only contributions from paid participants will be considered for judging." | Static / Configurable | Backend `Competition.disclaimer` or static policy |
| **Trust & Payment** | "How will you receive prize money?", "Refund policy", "Razorpay secure payments" | Static / Dynamic Links | System configuration & video link |
| **Refer & Earn** | Link input box (`https://feedants.com/r/...`), "Copy Link", "Refer Now" button, "You earn ₹10" | Dynamic & User-specific | User referral code generator |
| **Social Proof / Reviews**| "Hear From Our Users", participant testimonials | Backend Dynamic Data | `Competition.reviews` or global review system |
| **Ad Banner** | "Ad Here" placeholder | Dynamic / Static | Ad slot component |
| **Bottom Floating CTA** | Action button: "Upload Submission" (if registered & submission open) / "Register Now - ₹99" / "Registration Closed" | Dynamic & User-specific | State-dependent logic combining user registration & lifecycle |
| **Bottom Navigation** | Tabs: Home, Explore, Create (+), Competitions (Active), Profile | Navigation Shell | Client Navigation state |

---

## 3. Competition Lifecycle State Machine

A competition transitions through strictly defined chronological phases. The **backend is the sole authoritative source of truth**.

```
[ UPCOMING ]
     │ (now >= registrationStartsAt)
     ▼
[ REGISTRATION_OPEN ]
     │ (now >= registrationClosesAt OR bookedSpots >= maxParticipants)
     ▼
[ REGISTRATION_CLOSED ]
     │ (now >= submissionStartsAt)
     ▼
[ SUBMISSION_OPEN ]
     │ (now >= submissionEndsAt)
     ▼
[ SUBMISSION_CLOSED / JUDGING ]
     │ (now >= resultDate AND winnersDeclared == true)
     ▼
[ COMPLETED ]
```

### State Resolution Rules
1. **UPCOMING**: `now < registrationStartsAt`
2. **REGISTRATION_OPEN**: `now >= registrationStartsAt && now < registrationClosesAt && bookedSpots < maxParticipants`
3. **REGISTRATION_CLOSED / FULL**: `now >= registrationClosesAt || bookedSpots >= maxParticipants`
4. **SUBMISSION_OPEN**: `now >= submissionStartsAt && now < submissionEndsAt`
5. **JUDGING**: `now >= submissionEndsAt && now < resultDate`
6. **COMPLETED**: `now >= resultDate && status == 'COMPLETED'`

*Note: In Feedants' workflow, `submissionStartsAt` may overlap with `REGISTRATION_OPEN` or begin before `registrationClosesAt` (as seen in the reference where Registration closes 10 Aug, but Submission starts 6 Aug). Our lifecycle handles overlapping phases seamlessly.*

---

## 4. Domain & MongoDB Data Model

### 4.1 Collections & Schema Design

#### `users` Collection
```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  referralCode: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `competitions` Collection
```typescript
interface ICompetition {
  _id: ObjectId;
  title: string;                 // "Feedants Classical Dance"
  slug: string;                  // "feedants-classical-dance"
  category: string;              // "Dance"
  subCategory?: string;          // "Classical / Kathak"
  tags: string[];                // ["Dance", "Multi-Win"]
  perks: string[];               // ["Winners get certificate"]
  prizePool: number;             // 1500
  entryFee: number;              // 99
  currency: string;              // "INR"
  maxParticipants: number;       // 20
  bookedSpots: number;           // 1 (atomic counter)
  status: 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'JUDGING' | 'COMPLETED' | 'CANCELLED';
  
  // Judge details (embedded document for fast read)
  judge: {
    name: string;                // "Manju Dubey"
    title: string;               // "Professional Kathak Dancer"
    experience: string;          // "12+ Years of Experience"
    avatarUrl: string;
    introVideoUrl?: string;
  };

  // Important Dates
  importantDates: {
    registrationStartsAt: Date;
    registrationClosesAt: Date;  // 10 Aug 26, 11:50 PM
    submissionStartsAt: Date;    // 6 Aug 26, 04:00 AM
    submissionEndsAt: Date;      // 30 Aug 26, 11:55 PM
    resultDate: Date;            // 1 Sept 26, 11:50 PM
  };

  // Previous Winners (embedded)
  previousWinners: Array<{
    name: string;
    rank: string;                // "1st Winner", "2nd Winner"
    videoThumbnail: string;
    videoUrl?: string;
  }>;

  // Tabs info
  about: string;                 // Markdown or formatted text
  judgingCriteria: string[];     // ["Rhythm & Footwork", "Expression (Abhinaya)", ...]
  rulesAndEligibility: string[]; // ["Open to all age groups", "Single take video", ...]
  
  // Rewards breakdown
  rewards: Array<{
    position: string;            // "1st Winner"
    amount: number;              // 550
    iconType: string;            // "gold", "silver", "bronze", "star"
  }>;

  disclaimer: string;
  paymentGateway: string;        // "Razorpay"
  createdAt: Date;
  updatedAt: Date;
}
```

#### `registrations` Collection
```typescript
interface IRegistration {
  _id: ObjectId;
  competitionId: ObjectId;
  userId: ObjectId;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  amountPaid: number;
  paymentId?: string;
  idempotencyKey?: string;
  registeredAt: Date;
}
// Compound unique index: { competitionId: 1, userId: 1 } -> prevents duplicate registrations
// Index on idempotencyKey: { idempotencyKey: 1 } (sparse)
```

#### `submissions` Collection
```typescript
interface ISubmission {
  _id: ObjectId;
  competitionId: ObjectId;
  userId: ObjectId;
  registrationId: ObjectId;
  videoUrl: string;
  title: string;
  submittedAt: Date;
  status: 'SUBMITTED' | 'REVIEWED' | 'REJECTED';
}
// Compound unique index: { competitionId: 1, userId: 1 }
```

---

## 5. Concurrency & Capacity Protection Strategy

### The Race Condition Risk
Consider:
- `maxParticipants = 20`, `bookedSpots = 19`.
- User A and User B tap "Register" simultaneously.
- A naïve implementation (Read `bookedSpots`, check `< 20`, increment, insert) will allow both users to register, resulting in 21 participants (overbooking).

### Production Atomic Resolution Strategy
We combine **two levels of database guarantees**:

1. **Atomic Conditional Counter Update (`$inc` with query guard)**:
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
     throw new AppError("Competition is already full", 409, "COMPETITION_FULL");
   }
   ```
2. **Compound Unique Index on `registrations`**:
   `registrationSchema.index({ competitionId: 1, userId: 1 }, { unique: true });`
   If the user double-clicks or triggers parallel requests, the second insertion fails with MongoDB error code `11000` (E11000 duplicate key error). If the registration record creation fails, we roll back the spot atomically using `$inc: { bookedSpots: -1 }` (or use a Multi-Document MongoDB ACID Transaction when replica sets are configured).
3. **Idempotency Header Support**:
   Clients submit an `Idempotency-Key` header with registration attempts. If a request is retried due to mobile network drop, the backend returns the existing registration.

---

## 6. REST API Contract

### Base URL: `/api/v1`

#### 1. `GET /competitions/:id`
- **Purpose**: Fetch complete competition details + calculated dynamic lifecycle status + user participation state (if `x-user-id` header provided).
- **Headers**: `x-user-id` (optional for demo auth)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "competition": { ... },
      "computed": {
        "lifecycleStatus": "REGISTRATION_OPEN",
        "spotsLeft": 19,
        "isFull": false,
        "registrationCountdown": {
          "totalSecondsRemaining": 113312,
          "isClosed": false
        }
      },
      "userParticipation": {
        "isRegistered": true,
        "registrationId": "65b...",
        "hasSubmitted": false
      }
    }
  }
  ```

#### 2. `POST /competitions/:id/register`
- **Purpose**: Atomically register the authenticated user.
- **Headers**: `x-user-id` (required), `Idempotency-Key` (optional)
- **Body**: `{ "paymentMethod": "demo_razorpay" }`
- **Responses**:
  - `201 Created`: Registration confirmed.
  - `400 Bad Request`: Lifecycle window closed or upcoming.
  - `409 Conflict`: User already registered (`ALREADY_REGISTERED`) or spots filled (`COMPETITION_FULL`).

#### 3. `POST /competitions/:id/submissions`
- **Purpose**: Submit video entry (only eligible if user is registered and submission window is open).
- **Headers**: `x-user-id` (required)
- **Body**: `{ "title": "Kathak Performance", "videoUrl": "https://..." }`

#### 4. `GET /users/me` & `GET /users`
- **Purpose**: Demo user switching (allows the evaluator to switch between "Registered User", "Unregistered User", and test concurrency).

---

## 7. Frontend Architecture (React Native)

### 7.1 Folder Hierarchy
```
mobile/
├── App.js
├── src/
│   ├── api/
│   │   ├── client.js
│   │   └── competitionApi.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Avatar.js
│   │   │   ├── Badge.js
│   │   │   ├── Button.js
│   │   │   └── Card.js
│   │   ├── competition/
│   │   │   ├── HeaderSection.js
│   │   │   ├── SummaryCard.js
│   │   │   ├── JudgeCard.js
│   │   │   ├── CountdownBanner.js
│   │   │   ├── ImportantDatesGrid.js
│   │   │   ├── PreviousWinnersCarousel.js
│   │   │   ├── CompetitionTabsSection.js
│   │   │   ├── RewardsSection.js
│   │   │   ├── TrustPolicySection.js
│   │   │   ├── ReferralCard.js
│   │   │   ├── UserReviewsCard.js
│   │   │   └── AdPlaceholder.js
│   │   └── navigation/
│   │       └── BottomNavBar.js
│   ├── hooks/
│   │   ├── useCompetition.js
│   │   ├── useCountdown.js
│   │   └── useUser.js
│   ├── screens/
│   │   └── CompetitionDetailsScreen.js
│   ├── styles/
│   │   ├── colors.js
│   │   └── typography.js
│   └── utils/
│       └── formatters.js
```

### 7.2 Frontend State Matrix

| State Scenario | Header Badge | Countdown Bar | Floating CTA | Action Handlers |
| :--- | :--- | :--- | :--- | :--- |
| **Unregistered & Spots Open** | None / `Open` | Active Countdown | `Register Now - ₹99` | Tapping opens confirmation modal -> registers user |
| **Registered & Submission Open** | `✓ Registered` | Active / Normal | `Upload Submission` | Tapping opens video upload modal |
| **Registered & Submission Closed** | `✓ Registered` | Closed text | `Submission Closed` (disabled) | - |
| **Unregistered & Full** | `Full` | "Registrations Full" | `Housefull` (disabled) | - |
| **Registration Expired** | `Closed` | "Registration Closed" | `Registration Ended` (disabled)| - |
| **Loading** | Shimmer / Skeleton | Shimmer | Shimmer | Disabled |
| **Error / Network Failure** | Error message + Retry | Retry button | Retry button | Refetches API |

---

## 8. Concurrency Test & Demo Verification Plan

To prove high-concurrency resilience:
1. We will provide an automated concurrency verification test script (`npm run test:concurrency`) running 10-50 simultaneous registration requests targeting 1 remaining spot.
2. The verification will assert:
   - Exactly 1 request succeeds with HTTP 201.
   - The remaining requests receive HTTP 409 `COMPETITION_FULL`.
   - `bookedSpots` in MongoDB never exceeds `maxParticipants`.
   - No duplicate participation rows exist.
