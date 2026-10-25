import { getFoodLogs, getMealPlans, getProfile, getWorkoutLogs, getWorkoutPlans } from "../lib/api";
import { dayOfWeek } from "../lib/dates";
import { requestToday, stripRange } from "../lib/day";
import { mealProgress, planFor, workoutProgress } from "../lib/tracker";
import type { DayStatus } from "../lib/types";
import { DayStrip } from "./day-strip";

const statusOf = ({ done, total }: { done: number; total: number }): DayStatus | null =>
  !done ? null : done >= total ? "full" : "partial";

// Rendered by the Workout and Food layouts. Layouts don't re-render when only
// `?date=` changes, so picking a day never waits for this data.
export async function DayStripSection({ mode }: { mode: "workout" | "food" }) {
  const today = await requestToday();
  const profile = await getProfile();
  const { from, to } = stripRange(profile.startDate, profile.goalDate, today);

  const statuses: Record<string, DayStatus> = {};
  if (mode === "workout") {
    const [plans, logs] = await Promise.all([getWorkoutPlans(), getWorkoutLogs(from, to)]);
    for (const log of logs) {
      const st = statusOf(workoutProgress(planFor(plans, dayOfWeek(log.date)), log));
      if (st) statuses[log.date] = st;
    }
  } else {
    const [plans, logs] = await Promise.all([getMealPlans(), getFoodLogs(from, to)]);
    for (const log of logs) {
      const st = statusOf(mealProgress(planFor(plans, dayOfWeek(log.date)), log));
      if (st) statuses[log.date] = st;
    }
  }

  return (
    <DayStrip
      basePath={mode === "workout" ? "/workout" : "/food"}
      from={from}
      to={to}
      today={today}
      startDate={profile.startDate}
      goalDate={profile.goalDate}
      statuses={statuses}
    />
  );
}
