/**
 * Lifecycle Service
 * Authoritative evaluation of time-dependent competition lifecycle status
 */

const calculateCountdown = (targetDate, now = new Date()) => {
  const diffMs = new Date(targetDate).getTime() - new Date(now).getTime();
  if (diffMs <= 0) {
    return {
      totalSecondsRemaining: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isClosed: true,
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
    isClosed: false,
    formatted,
  };
};

const evaluateCompetitionLifecycle = (competition, now = new Date()) => {
  const currentDate = new Date(now);
  const { importantDates, bookedSpots, maxParticipants } = competition;

  const regStart = new Date(importantDates.registrationStartsAt);
  const regClose = new Date(importantDates.registrationClosesAt);
  const subStart = new Date(importantDates.submissionStartsAt);
  const subEnd = new Date(importantDates.submissionEndsAt);
  const resDate = new Date(importantDates.resultDate);

  const spotsLeft = Math.max(0, maxParticipants - bookedSpots);
  const isFull = bookedSpots >= maxParticipants;

  let lifecycleStatus = 'ACTIVE';

  if (currentDate < regStart) {
    lifecycleStatus = 'UPCOMING';
  } else if (currentDate >= resDate) {
    lifecycleStatus = 'COMPLETED';
  } else if (currentDate >= subEnd && currentDate < resDate) {
    lifecycleStatus = 'JUDGING';
  } else if (currentDate >= regClose || isFull) {
    lifecycleStatus = 'REGISTRATION_CLOSED';
  } else {
    lifecycleStatus = 'REGISTRATION_OPEN';
  }

  // Registration window check
  const isRegistrationWindowOpen =
    currentDate >= regStart && currentDate < regClose && !isFull && competition.status !== 'CANCELLED';

  // Submission window check
  const isSubmissionWindowOpen =
    currentDate >= subStart && currentDate < subEnd && competition.status !== 'CANCELLED';

  const registrationCountdown = calculateCountdown(regClose, currentDate);
  const submissionCountdown = calculateCountdown(subEnd, currentDate);

  return {
    lifecycleStatus,
    isRegistrationOpen: isRegistrationWindowOpen,
    isSubmissionOpen: isSubmissionWindowOpen,
    isFull,
    spotsLeft,
    totalSpots: maxParticipants,
    bookedSpots,
    registrationCountdown,
    submissionCountdown,
  };
};

module.exports = {
  evaluateCompetitionLifecycle,
  calculateCountdown,
};
