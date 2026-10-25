import { Suspense } from "react";
import { DayStripSection } from "../components/day-strip-section";
import { DayStripSkeleton } from "../components/skeletons";

export default function FoodLayout({ children }: LayoutProps<"/food">) {
  return (
    <>
      <Suspense fallback={<DayStripSkeleton />}>
        <DayStripSection mode="food" />
      </Suspense>
      {children}
    </>
  );
}
