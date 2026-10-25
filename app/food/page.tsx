import type { Metadata } from "next";
import { Suspense } from "react";
import { FoodSkeleton } from "../components/skeletons";
import { getFoodLog, getMealOptions, getMealPlans, getWorkoutLog, getWorkoutPlans } from "../lib/api";
import { dayOfWeek } from "../lib/dates";
import { resolveDay } from "../lib/day";
import { planFor, workoutActivity } from "../lib/tracker";
import { FoodView } from "./food-view";

export const metadata: Metadata = { title: "Food" };

export default function FoodPage({ searchParams }: PageProps<"/food">) {
  return (
    <Suspense fallback={<FoodSkeleton />}>
      <FoodDay searchParams={searchParams} />
    </Suspense>
  );
}

// A new key per day, so picking another day shows the skeleton while it loads.
async function FoodDay({ searchParams }: Pick<PageProps<"/food">, "searchParams">) {
  const { date, today } = await resolveDay(searchParams);
  return (
    <Suspense key={date} fallback={<FoodSkeleton />}>
      <FoodSection date={date} today={today} />
    </Suspense>
  );
}

async function FoodSection({ date, today }: { date: string; today: string }) {
  const dow = dayOfWeek(date);
  const [plans, log, options, workoutPlans, workoutLog] = await Promise.all([
    getMealPlans(),
    getFoodLog(date),
    getMealOptions(),
    getWorkoutPlans(),
    getWorkoutLog(date),
  ]);

  return (
    <FoodView
      key={date}
      date={date}
      today={today}
      plan={planFor(plans, dow)}
      log={log}
      options={options}
      workoutEvents={workoutActivity(planFor(workoutPlans, dow), workoutLog)}
    />
  );
}
