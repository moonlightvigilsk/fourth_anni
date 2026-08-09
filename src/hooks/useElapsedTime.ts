import { useEffect, useState } from "react";
import { getElapsedTime } from "../lib/time";

export function useElapsedTime(targetDateStr?: string) {
  const getElapsed = () => {
    const elapsed = getElapsedTime(targetDateStr);
    return {
      days: elapsed.days,
      hours: elapsed.hours,
      minutes: elapsed.minutes,
      seconds: elapsed.seconds,
    };
  };

  const [timeData, setTimeData] = useState(getElapsed);

  useEffect(() => {
    const updateElapsed = () => {
      setTimeData(getElapsed());
    };

    updateElapsed();
    const interval = window.setInterval(updateElapsed, 1000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateElapsed();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [targetDateStr]);

  return timeData;
}
