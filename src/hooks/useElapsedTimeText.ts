import { useEffect, useState } from "react";
import { getElapsedTime } from "../lib/time";

export function useElapsedTimeText(targetDateStr?: string) {
  const getFormattedElapsed = () => getElapsedTime(targetDateStr).formatted;
  const [timeText, setTimeText] = useState(getFormattedElapsed);

  useEffect(() => {
    const updateElapsed = () => {
      setTimeText(getFormattedElapsed());
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

  return timeText;
}
