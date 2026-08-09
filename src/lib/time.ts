/**
 * Calculates the exact elapsed time from a starting date (default is debut date: August 20, 2022 UTC+7)
 * to the current moment.
 */
export const DEBUT_ANCHOR_ISO = "2022-08-20T20:00:00+07:00";

export function getElapsedTime(targetDateStr = DEBUT_ANCHOR_ISO): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const diffMs = Date.now() - new Date(targetDateStr).getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    formatted: `${days} ngày, ${hours} giờ, ${minutes} phút, ${seconds} giây`,
  };
}
