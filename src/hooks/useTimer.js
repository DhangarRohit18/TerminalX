import { useState, useEffect, useRef, useCallback } from 'react';

const TIME_LIMITS = { Easy: 60, Medium: 90, Hard: 120 };

export const useTimer = (difficulty = 'Medium') => {
  const [timeLeft, setTimeLeft] = useState(TIME_LIMITS[difficulty] || 90);
  const [isRunning, setIsRunning] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [penaltyApplied, setPenaltyApplied] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const totalTime = TIME_LIMITS[difficulty] || 90;

  const start = useCallback(() => {
    setTimeLeft(totalTime);
    setTimeTaken(0);
    setPenaltyApplied(false);
    startTimeRef.current = Date.now();
    setIsRunning(true);
  }, [totalTime]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (startTimeRef.current) {
      setTimeTaken(Math.round((Date.now() - startTimeRef.current) / 1000));
    }
    clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(totalTime);
    setTimeTaken(0);
    setPenaltyApplied(false);
    clearInterval(intervalRef.current);
  }, [totalTime]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (!penaltyApplied) setPenaltyApplied(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, penaltyApplied]);

  const percentage = (timeLeft / totalTime) * 100;
  const isWarning = timeLeft <= totalTime * 0.3 && timeLeft > 0;
  const isDanger = timeLeft <= 15 && timeLeft > 0;
  const isExpired = timeLeft === 0;

  const getTimePenalty = () => {
    if (!penaltyApplied) return 0;
    const overage = timeTaken - totalTime;
    return Math.min(10, Math.floor(overage / 10));
  };

  return { timeLeft, isRunning, timeTaken, percentage, isWarning, isDanger, isExpired, penaltyApplied, totalTime, start, stop, reset, getTimePenalty };
};
