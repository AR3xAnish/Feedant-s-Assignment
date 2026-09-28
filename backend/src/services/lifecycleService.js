/**
 * Lifecycle Service
 * Authoritative evaluation of time-dependent competition lifecycle status,
 * decoupled phase status, explicit user action permissions, and contextual countdowns.
 */

const calculateCountdown = (targetDate, now = new Date()) => {
  if (!targetDate) {
    return {
      totalSecondsRemaining: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: '00d : 00h : 00m : 00s',
    };
  }

  const diffMs = new Date(targetDate).getTime() - new Date(now).getTime();
  if (diffMs <= 0) {
    return {
      totalSecondsRemaining: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: '00d : 00h : 00m : 00s',
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');
  const formatted = `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;

  return {
    totalSecondsRemaining: totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    formatted,
  };
};

const evaluateCompetitionLifecycle = (competition, now = new Date()) => {
  const currentDate = new Date(now);
  const { importantDates, bookedSpots, maxParticipants, status } = competition;

  const regStart = new Date(importantDates.registrationStartsAt);
  const regClose = new Date(importantDates.registrationClosesAt);
  const subStart = new Date(importantDates.submissionStartsAt);
  const subEnd = new Date(importantDates.submissionEndsAt);
  const resDate = new Date(importantDates.resultDate);

  const spotsLeft = Math.max(0, maxParticipants - bookedSpots);
  const isFull = bookedSpots >= maxParticipants;
  const isExpiredByResult = currentDate >= resDate;

  // 1. Explicit Action Permissions (authoritative booleans)
  // Strict requirement: Only ACTIVE competitions within active chronological windows accept actions
  const canRegister =
    status === 'ACTIVE' &&
    !isExpiredByResult &&
    currentDate >= regStart &&
    currentDate < regClose &&
    !isFull;

  const canSubmit =
    status === 'ACTIVE' &&
    !isExpiredByResult &&
    currentDate >= subStart &&
    currentDate < subEnd;

  // 2. Overall Phase Separation
  let competitionPhase = 'ACTIVE';

  if (status === 'DRAFT') {
    competitionPhase = 'DRAFT';
  } else if (status === 'CANCELLED') {
    competitionPhase = 'CANCELLED';
  } else if (status === 'COMPLETED' || isExpiredByResult) {
    competitionPhase = 'COMPLETED';
  } else if (currentDate < regStart) {
    competitionPhase = 'UPCOMING';
  } else if (currentDate >= subEnd && currentDate < resDate) {
    competitionPhase = 'JUDGING';
  } else if (canRegister && canSubmit) {
    competitionPhase = 'REGISTRATION_AND_SUBMISSION_OPEN';
  } else if (canRegister) {
    competitionPhase = 'REGISTRATION_OPEN';
  } else if (canSubmit) {
    competitionPhase = 'SUBMISSION_OPEN';
  } else if (isFull) {
    competitionPhase = 'FULL';
  } else {
    competitionPhase = 'REGISTRATION_CLOSED';
  }

  // 3. Contextual Countdown State (Never claims "Registration closes in" when not applicable)
  let countdownConfig = {
    type: 'REGISTRATION_CLOSES',
    title: 'Registration closes in',
    badge: 'Hurry up!',
    targetDate: regClose,
    isActive: false,
    countdown: calculateCountdown(regClose, currentDate),
  };

  if (competitionPhase === 'DRAFT') {
    countdownConfig = {
      type: 'DRAFT',
      title: 'Competition in Draft Mode',
      badge: 'Draft',
      targetDate: null,
      isActive: false,
      countdown: calculateCountdown(null, currentDate),
    };
  } else if (competitionPhase === 'CANCELLED') {
    countdownConfig = {
      type: 'CANCELLED',
      title: 'Competition has been cancelled',
      badge: 'Cancelled',
      targetDate: null,
      isActive: false,
      countdown: calculateCountdown(null, currentDate),
    };
  } else if (competitionPhase === 'COMPLETED') {
    countdownConfig = {
      type: 'COMPLETED',
      title: 'Competition completed - Winners announced',
      badge: 'Completed',
      targetDate: null,
      isActive: false,
      countdown: calculateCountdown(null, currentDate),
    };
  } else if (competitionPhase === 'UPCOMING') {
    countdownConfig = {
      type: 'REGISTRATION_OPENS',
      title: 'Registration opens in',
      badge: 'Upcoming',
      targetDate: regStart,
      isActive: true,
      countdown: calculateCountdown(regStart, currentDate),
    };
  } else if (canRegister) {
    countdownConfig = {
      type: 'REGISTRATION_CLOSES',
      title: 'Registration closes in',
      badge: 'Hurry up!',
      targetDate: regClose,
      isActive: true,
      countdown: calculateCountdown(regClose, currentDate),
    };
  } else if (canSubmit) {
    countdownConfig = {
      type: 'SUBMISSION_CLOSES',
      title: 'Submissions close in',
      badge: 'Submit entry',
      targetDate: subEnd,
      isActive: true,
      countdown: calculateCountdown(subEnd, currentDate),
    };
  } else if (competitionPhase === 'JUDGING') {
    countdownConfig = {
      type: 'RESULTS_ANNOUNCED',
      title: 'Judging in progress - Results on',
      badge: 'Judging',
      targetDate: resDate,
      isActive: false,
      countdown: calculateCountdown(resDate, currentDate),
    };
  } else if (isFull) {
    countdownConfig = {
      type: 'FULL',
      title: 'All spots booked - Registration full',
      badge: 'Sold out',
      targetDate: null,
      isActive: false,
      countdown: calculateCountdown(null, currentDate),
    };
  } else {
    countdownConfig = {
      type: 'CLOSED',
      title: 'Registration has closed',
      badge: 'Closed',
      targetDate: null,
      isActive: false,
      countdown: calculateCountdown(null, currentDate),
    };
  }

  return {
    lifecycleStatus: competitionPhase,
    competitionPhase,
    canRegister,
    canSubmit,
    isRegistrationOpen: canRegister,
    isSubmissionOpen: canSubmit,
    isFull,
    spotsLeft,
    totalSpots: maxParticipants,
    bookedSpots,
    countdownConfig,
    registrationCountdown: calculateCountdown(regClose, currentDate),
    submissionCountdown: calculateCountdown(subEnd, currentDate),
  };
};

module.exports = {
  evaluateCompetitionLifecycle,
  calculateCountdown,
};
