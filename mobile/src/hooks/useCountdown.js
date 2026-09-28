import { useState, useEffect } from 'react';
import { formatCountdownValues } from '../utils/formatters';

export const useCountdown = (targetDateString) => {
  const calculateRemainingSeconds = () => {
    if (!targetDateString) return 0;
    const targetMs = new Date(targetDateString).getTime();
    const nowMs = Date.now();
    const diff = Math.floor((targetMs - nowMs) / 1000);
    return Math.max(0, diff);
  };

  const [secondsRemaining, setSecondsRemaining] = useState(calculateRemainingSeconds);

  useEffect(() => {
    setSecondsRemaining(calculateRemainingSeconds());

    if (!targetDateString) return;

    const intervalId = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDateString]);

  return {
    secondsRemaining,
    ...formatCountdownValues(secondsRemaining),
  };
};
