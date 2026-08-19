/**
 * Resolves a (month, day) intent into concrete future dates.
 * The calendar never accepts past dates, so e.g. "August 23-26" resolves to the
 * next August that is still bookable — keeping the suite runnable year-round.
 */
export function nextUpcoming(month1Based: number, day: number, offsetDays = 0): Date {
  const now = new Date();
  let year = now.getFullYear();
  if (new Date(year, month1Based - 1, day).getTime() <= now.getTime()) {
    year += 1;
  }
  return new Date(year, month1Based - 1, day + offsetDays);
}

/** Whole nights between two dates (check-out minus check-in). */
export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((checkOut.getTime() - checkIn.getTime()) / dayMs);
}

