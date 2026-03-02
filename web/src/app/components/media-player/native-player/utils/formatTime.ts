// src/app/utils/time-utils.ts

/**
 * Helper method to format time in mm:ss
 */
export function formatTime(seconds: number): string {
  // Guard against invalid input – we keep the same “00:00” fallback.
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }

  // Round to the nearest whole second
  const totalSeconds = Math.round(seconds);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  // Pad each part with leading zeros
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  const s = String(secs).padStart(2, '0');

  // If there are no hours, drop the leading "00:" part
  return hours > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}
