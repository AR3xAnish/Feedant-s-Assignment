# Feedants Competition Details System — Architecture & Design Document (DESIGN.md)

## 1. Executive Summary & Objective

This document outlines the architectural blueprint, data model, lifecycle state machine, concurrency management, REST API contract, and component hierarchy for the **Feedants Competition Details Feature**.

Rather than treating this as a superficial mobile clone, this design implements a resilient, enterprise-grade full-stack architecture built on:
- **Frontend**: React Native (Expo SDK 57 supporting Mobile iOS/Android & Web preview)
- **Backend**: Node.js + Express.js (Layered Architecture: Route -> Controller -> Service -> Model)
- **Database**: MongoDB (with Mongoose ODM, Multi-Document ACID Transactions, atomic conditional operators, and compound unique constraints)

---

## 2. Visual Reference Analysis (Page 3 of Specification)

### 2.1 UI Component & Data Classification

| UI Section | Visual Elements | Classification | Data Source |
| :--- | :--- | :--- | :--- |
| **Top Bar** | Back button ("Go back" with functional navigation), Language toggle `[ENG \| हिंदी]` with functional translations | Interactive UI + Local State | Client UI State & Lightweight i18n Dictionary |
| **Competition Header** | Title, Category tags, Dynamic Perks (`competition.perks`) | Backend Dynamic Data | `Competition.title`, `Competition.category`, `Competition.tags`, `Competition.perks` |
| **Registration Badge** | `[✓ Registered]` / `[Open]` / `[Closed]` / `[Full]` | User-specific & Computed | Computed from confirmed registration record & lifecycle |
| **Financial Summary** | Prize Pool (`₹ 1,500`), Entry Fee (`₹ 99`) | Backend Dynamic Data | `Competition.prizePool`, `Competition.entryFee` |
| **Capacity Tracker** | "Only 19 spots left", Progress Bar, "1 / 20 Booked" | Dynamic & Computed | `Competition.maxParticipants`, `Competition.bookedSpots`, `spotsLeft = max - booked` |
| **Judge Section** | Avatar, Name, Title, Experience, Video Intro Button | Backend Dynamic Data | `Competition.judge` (nested object) |
| **Countdown Bar** | Hourglass icon, Dynamic Label, Countdown, Hurry up / Status badge | Time-Dependent & Contextual | Contextual state machine (Never claims "Registration closes in" when upcoming/full/completed) |
| **Important Dates Grid** | 2x2 Grid: Register Before, Submission Starts, Submission Ends, Result Date | Backend Dynamic Data | `Competition.importantDates` (ISO timestamps) |
| **Previous Winners** | Horizontal card carousel with real media playback modal, names, ranks | Backend Dynamic Data | `Competition.previousWinners` array |
| **Tabbed Content** | Tabs: "About Competition", "Judging Parameters", "Rules & Eligibility" + "View more" toggle | Backend Data + Local UI State | `Competition.about`, `Competition.judgingCriteria`, `Competition.rulesAndEligibility` |
| **Rewards Breakdown** | Tiered table: 1st Winner (₹550), 2nd (₹300), 3rd (₹240), 4th (₹200), 5th (₹130), 6th (₹80) | Backend Dynamic Data | `Competition.rewards` array (sum = prizePool) |
| **Disclaimer Banner** | "Disclaimer: Only contributions from paid participants will be considered for judging." | Backend Data | `Competition.disclaimer` |
| **Trust & Payment** | "How will you receive prize money?", "Refund policy", "Razorpay secure payments" | Interactive Media & Policies | System policy modals & real video streamer |
| **Refer & Earn** | Link input box (`https://feedants.com/r/...`), "Copy Link" (real clipboard write), "Refer Now" (native OS share) | Dynamic & User-specific | User referral code generator |
| **Social Proof / Reviews**| "Hear From Our Users", participant testimonials | Backend Dynamic Data | `Competition.reviews` array |
| **Ad Banner** | "Ad Here" placeholder | Dynamic / Static | Ad slot component |
| **Bottom Floating CTA** | Action button: "Upload Submission" (if confirmed & canSubmit) / "Register Now - ₹99" / "Housefull" / "Registration Closed" | Dynamic & State-aware | Backend authoritative permissions (`canRegister`, `canSubmit`, `isRegistered`) |
| **Bottom Navigation** | Tabs: Home, Explore, Create (+), Competitions (Active), Profile | Navigation Shell | Client Navigation state |

---

## 3. Competition Lifecycle State Machine

A competition transitions through strictly defined chronological phases. The **backend is the sole authoritative source of truth**.

```
[ UPCOMING ]
     │ (now >= registrationStartsAt)
     ▼
[ REGISTRATION_OPEN ]
     │ (now >= submissionStartsAt)
     ▼
[ REGISTRATION_AND_SUBMISSION_OPEN (Overlapping Window) ]
     │ (now >= registrationClosesAt OR bookedSpots >= maxParticipants)
     ▼
[ SUBMISSION_OPEN / REGISTRATION_CLOSED ]
     │ (now >= submissionEndsAt)
     ▼
[ JUDGING ]
     │ (now >= resultDate AND winnersDeclared == true)
     ▼
[ COMPLETED ]
```

### 3.1 Separation of Overall Phase from Action Availability
The system separates the macro **competition phase** from granular **user permissions**:
- `canRegister`: `status === 'ACTIVE' && now >= regStart && now < regClose && bookedSpots < maxParticipants`
- `canSubmit`: `status === 'ACTIVE' && now >= subStart && now < subEnd`

This supports **overlapping windows** where participants can submit early entries while registrations remain open for others, without state confusion.

---

## 4. Domain & MongoDB Data Model

### 4.1 Schema Definitions

#### `users` Collection
- `_id`: ObjectId
- `name`: string
- `email`: string (unique)
- `phone`: string
- `avatarUrl`: string
- `referralCode`: string (unique)

#### `competitions` Collection
- `_id`: ObjectId
- `title`: string
- `slug`: string (unique)
- `category`: string
- `tags`: string[]
- `perks`: string[]
- `prizePool`: number
- `entryFee`: number
- `maxParticipants`: number
- `bookedSpots`: number (atomic counter)
- `status`: `'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'JUDGING' | 'COMPLETED' | 'CANCELLED'`
- `judge`: `{ name, title, experience, avatarUrl, introVideoUrl }`
- `importantDates`: `{ registrationStartsAt, registrationClosesAt, submissionStartsAt, submissionEndsAt, resultDate }`
- `previousWinners`: Array of `{ name, rank, videoThumbnail, videoUrl }`
- `about`: string
- `judgingCriteria`: string[]
- `rulesAndEligibility`: string[]
- `rewards`: Array of `{ position, amount, iconType }`
- `disclaimer`: string

#### `registrations` Collection
- `_id`: ObjectId
- `competitionId`: ObjectId (ref: Competition)
- `userId`: ObjectId (ref: User)
- `status`: `'CONFIRMED' | 'CANCELLED'`
- `amountPaid`: number
- `paymentId`: string
- `idempotencyKey`: string (sparse)
- `registeredAt`: Date

**Uniqueness & Participation Rules**:
- Compound index on `(competitionId, userId)`.
- Only records with `status === 'CONFIRMED'` count as active participation.
- Cancelled registrations (`status === 'CANCELLED'`) do not block re-registration and cannot submit entries.

#### `submissions` Collection
- `_id`: ObjectId
- `competitionId`: ObjectId
- `userId`: ObjectId
- `registrationId`: ObjectId
- `title`: string
- `videoUrl`: string
- `description`: string
- `status`: `'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED'`

**Uniqueness**:
- Compound unique index on `(competitionId, userId)`.
- Concurrent duplicate submissions are caught and return HTTP 409 `ALREADY_SUBMITTED`.

---

## 5. Concurrency & Capacity Protection Strategy

### 5.1 Primary Production Path: Multi-Document ACID Transactions
In production environments (e.g. MongoDB Atlas, Replica Sets, or Sharded Clusters), all registrations execute within a **MongoDB Transaction**:
```javascript
await session.withTransaction(async () => {
  // 1. Atomic capacity guard & reservation
  const updatedComp = await Competition.findOneAndUpdate(
    { _id: competitionId, bookedSpots: { $lt: competition.maxParticipants } },
    { $inc: { bookedSpots: 1 } },
    { session, new: true }
  );
  if (!updatedComp) {
    throw new AppError('Competition is full', 409, 'COMPETITION_FULL');
  }

  // 2. Active participation check
  const activeReg = await Registration.findOne({ competitionId, userId, status: 'CONFIRMED' }).session(session);
  if (activeReg) {
    throw new AppError('Already registered', 409, 'ALREADY_REGISTERED');
  }

  // 3. Insert or reactivate registration inside transaction
  ...
});
```
`session.withTransaction()` automatically handles retries on `TransientTransactionErrors` (such as `WriteConflict` code 112) under high write contention.

### 5.2 Limited Non-Transactional Development Fallback
When running against a standalone single-node MongoDB where replica sets are unavailable, the system executes an atomic conditional update (`findOneAndUpdate` with `$inc: 1` guarded by `bookedSpots < maxParticipants`) with a compensating rollback (`$inc: -1`) if insertion fails.
*Note: This fallback is explicitly documented as a limited non-transactional fallback for standalone development and is not equivalent to an ACID multi-document transaction.*

### 5.3 Scoped Idempotency Contract
Idempotency keys are scoped strictly to:
$$\text{Scope} = (\text{competitionId} + \text{userId} + \text{idempotencyKey})$$
- Retries return the **same logical operation result** (`registration`, `competition`, `computed`).
- The client UI preserves a stable session key across retries instead of generating fresh keys on every click.

---

## 6. REST API Contract

### Base URL: `/api/v1`

#### `GET /competitions/:id`
- Returns dynamic competition details, permissions (`canRegister`, `canSubmit`), contextual countdown config, and user participation state.

#### `POST /competitions/:id/register`
- Atomically reserves capacity and confirms participation.
- Headers: `x-user-id` (required), `Idempotency-Key` (optional).
- Returns `201 Created` or `409 Conflict` (`COMPETITION_FULL`, `ALREADY_REGISTERED`).

#### `POST /competitions/:id/submissions`
- Submits performance video entry.
- Requires `CONFIRMED` registration. Rejects cancelled registrations (403 `REGISTRATION_REQUIRED`) and duplicate submissions (409 `ALREADY_SUBMITTED`).
