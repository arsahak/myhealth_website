import { card } from "./ui";

// Grey placeholders shaped like the real content, shown while data streams in.

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
}

function Pulse({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div role="status" aria-label={label} className="animate-pulse">
      {children}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function DayStripSkeleton() {
  return (
    <Pulse label="Loading days">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <Bone className="h-6 w-36" />
          <Bone className="h-3 w-20" />
        </div>
        <div className="flex gap-1.5">
          <Bone className="h-8 w-8 rounded-lg" />
          <Bone className="h-8 w-14 rounded-lg" />
          <Bone className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-2 overflow-hidden px-1 pt-2 pb-3">
        {Array.from({ length: 14 }, (_, i) => (
          <Bone key={i} className="h-19.5 w-16 shrink-0 rounded-xl" />
        ))}
      </div>
      <div className="flex gap-4">
        <Bone className="h-3 w-20" />
        <Bone className="h-3 w-20" />
      </div>
    </Pulse>
  );
}

function ListCard({ rows, withChips = false }: { rows: number; withChips?: boolean }) {
  return (
    <div className={card}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Bone className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Bone className="h-3.5 w-40" />
            <Bone className="h-5 w-32" />
          </div>
        </div>
        <Bone className="h-5 w-14 rounded-full" />
      </div>
      <div className="mt-5 flex justify-between">
        <Bone className="h-4 w-16" />
        <Bone className="h-4 w-24" />
      </div>
      <Bone className="mt-2 h-2 w-full rounded-full" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-black/5 p-3 dark:border-white/5">
            <Bone className="h-14 w-16.75 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-1/2" />
              <Bone className="h-3.5 w-2/3" />
              {withChips && (
                <div className="flex gap-1.5 pt-1">
                  <Bone className="h-8 w-14 rounded-lg" />
                  <Bone className="h-8 w-14 rounded-lg" />
                  <Bone className="h-8 w-14 rounded-lg" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuideCard() {
  return (
    <div className={`${card} hidden md:block`}>
      <Bone className="h-3 w-24" />
      <div className="mt-2 flex gap-1.5">
        <Bone className="h-6 w-20 rounded-full" />
        <Bone className="h-6 w-16 rounded-full" />
        <Bone className="h-6 w-16 rounded-full" />
      </div>
      <Bone className="mt-4 h-5 w-40" />
      <Bone className="mt-2 h-3.5 w-28" />
      <Bone className="mt-3 aspect-6/5 w-full rounded-xl" />
      <div className="mt-4 space-y-2">
        <Bone className="h-3.5 w-full" />
        <Bone className="h-3.5 w-5/6" />
        <Bone className="h-3.5 w-4/6" />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className={card}>
      <div className="flex justify-between">
        <Bone className="h-4 w-20" />
        <Bone className="h-3 w-16" />
      </div>
      <Bone className="mt-4 h-3.5 w-full" />
      <Bone className="mt-2 h-3.5 w-3/4" />
    </div>
  );
}

function DayLayout({ rows, withChips }: { rows: number; withChips?: boolean }) {
  return (
    <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_340px] md:items-start">
      <ListCard rows={rows} withChips={withChips} />
      <div className="space-y-4">
        <GuideCard />
        <ActivitySkeleton />
      </div>
    </div>
  );
}

export function WorkoutSkeleton() {
  return (
    <Pulse label="Loading workout">
      <DayLayout rows={4} withChips />
    </Pulse>
  );
}

export function FoodSkeleton() {
  return (
    <Pulse label="Loading meals">
      <DayLayout rows={5} />
    </Pulse>
  );
}

export function MeSkeleton() {
  return (
    <Pulse label="Loading profile">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
            <Bone className="h-3 w-20" />
            <Bone className="mt-2 h-6 w-16" />
            <Bone className="mt-1.5 h-3 w-14" />
          </div>
        ))}
      </div>
      <div className={`mt-4 ${card}`}>
        <div className="flex items-center gap-3">
          <Bone className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Bone className="h-3 w-10" />
            <Bone className="h-5 w-32" />
          </div>
        </div>
        <Bone className="mt-3 h-3 w-full rounded-full" />
        <Bone className="mt-2 h-3.5 w-40" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Bone className="h-9 w-full rounded-lg" />
          <Bone className="h-9 w-full rounded-lg" />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 md:items-start">
        <div className={card}>
          <Bone className="h-4 w-28" />
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="mt-4 flex justify-between">
              <Bone className="h-4 w-28" />
              <Bone className="h-4 w-14" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
              <Bone className="h-3 w-20" />
              <Bone className="mt-2 h-6 w-14" />
              <Bone className="mt-1.5 h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </Pulse>
  );
}

export function FooterSkeleton() {
  return (
    <div role="status" aria-label="Loading profile" className="flex animate-pulse flex-col items-center gap-1.5">
      <Bone className="h-4 w-24" />
      <Bone className="h-3 w-36" />
    </div>
  );
}
