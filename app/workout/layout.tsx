import { Suspense } from "react";
import { DayStripSection } from "../components/day-strip-section";
import { DayStripSkeleton } from "../components/skeletons";

export default function WorkoutLayout({ children }: LayoutProps<"/workout">) {
  return (
    <>
      <Suspense fallback={<DayStripSkeleton />}>
        <DayStripSection mode="workout" />
      </Suspense>
      {children}
    </>
  );
}
