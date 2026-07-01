/** Streak = consecutive active days ending today (or yesterday, so an
 *  unfinished today doesn't read as a broken streak). Pure. */

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function currentStreak(activeDays: ReadonlySet<string>, today: Date): number {
  const cursor = new Date(today);
  if (!activeDays.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1); // today not (yet) active — count from yesterday
  }
  let streak = 0;
  while (activeDays.has(localDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
