import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkoutSkeleton } from "../components/skeletons";
import { getFoodLog, getMealOptions, getMealPlans, getWorkoutLog, getWorkoutPlans } from "../lib/api";
import { dayOfWeek } from "../lib/dates";
import { resolveDay } from "../lib/day";
import { foodActivity, optionMap, planFor } from "../lib/tracker";
import { WorkoutView } from "./workout-view";

export const metadata: Metadata = { title: "Workout" };

export default function WorkoutPage({ searchParams }: PageProps<"/workout">) {
  return (
    <Suspense fallback={<WorkoutSkeleton />}>
      <WorkoutDay searchParams={searchParams} />
    </Suspense>
  );
}

// A new key per day, so picking another day shows the skeleton while it loads.
async function WorkoutDay({ searchParams }: Pick<PageProps<"/workout">, "searchParams">) {
  const { date, today } = await resolveDay(searchParams);
  return (
    <Suspense key={date} fallback={<WorkoutSkeleton />}>
      <WorkoutSection date={date} today={today} />
    </Suspense>
  );
}

async function WorkoutSection({ date, today }: { date: string; today: string }) {
  const dow = dayOfWeek(date);
  const [plans, log, mealPlans, options, foodLog] = await Promise.all([
    getWorkoutPlans(),
    getWorkoutLog(date),
    getMealPlans(),
    getMealOptions(),
    getFoodLog(date),
  ]);
  const foodEvents = foodActivity(planFor(mealPlans, dow), foodLog, optionMap(options));

  return (
    <WorkoutView
      key={date}
      date={date}
      today={today}
      plan={planFor(plans, dow)}
      log={log}
      foodEvents={foodEvents}
    />
  );
}
