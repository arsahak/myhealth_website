"use client";

import { useOptimistic, useState, useTransition } from "react";
import { resetWorkoutAction, toggleSetAction } from "../actions";
import { ActivityCard } from "../components/activity-card";
import { card, chip, DayBadge, ErrorBanner, IconBadge, pagerBtn, ProgressBar } from "../components/ui";
import { MoveArt } from "../exercise-art";
import { Icon } from "../icons";
import { fmtLong, fmtTime } from "../lib/dates";
import {
  doneSets,
  emptyWorkoutLog,
  setTimes,
  sortEvents,
  toggleSetInLog,
  workoutActivity,
  workoutProgress,
} from "../lib/tracker";
import type { ActivityEvent, Exercise, WorkoutLog, WorkoutPlan } from "../lib/types";

type Change = { type: "toggle"; exercise: number; set: number; at: string } | { type: "reset" };

// Workout tab body: exercise list + guide for the picked exercise + activity.
export function WorkoutView({
  date,
  today,
  plan,
  log,
  foodEvents,
}: {
  date: string;
  today: string;
  plan: WorkoutPlan;
  log: WorkoutLog;
  foodEvents: ActivityEvent[];
}) {
  // Ticks show at once; the server's answer replaces them when it arrives.
  const [shownLog, applyChange] = useOptimistic(log, (current: WorkoutLog, change: Change) =>
    change.type === "reset"
      ? emptyWorkoutLog(current.date)
      : toggleSetInLog(current, change.exercise, change.set, change.at),
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Start on the first exercise that isn't finished yet.
  const [active, setActive] = useState(() => {
    const i = plan.exercises.findIndex((ex, idx) => doneSets(log, idx, ex.sets) < ex.sets);
    return i === -1 ? 0 : i;
  });

  const save = (change: Change, request: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      applyChange(change);
      const result = await request();
      setError(result.ok ? null : (result.error ?? "Please try again."));
    });

  const toggle = (exercise: number, set: number) =>
    save({ type: "toggle", exercise, set, at: new Date().toISOString() }, () =>
      toggleSetAction(date, exercise, set),
    );

  const reset = () => save({ type: "reset" }, () => resetWorkoutAction(date));

  const events = sortEvents([...workoutActivity(plan, shownLog), ...foodEvents]);

  return (
    <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_340px] md:items-start">
      <WorkoutCard
        date={date}
        today={today}
        plan={plan}
        log={shownLog}
        active={active}
        onSelect={setActive}
        onToggle={toggle}
        onReset={reset}
        error={error}
        onDismissError={() => setError(null)}
      />
      <div className="space-y-4">
        <ExerciseGuide plan={plan} log={shownLog} active={active} onSelect={setActive} />
        <ActivityCard date={date} events={events} />
      </div>
    </div>
  );
}

function ExerciseGuide({
  plan,
  log,
  active,
  onSelect,
}: {
  plan: WorkoutPlan;
  log: WorkoutLog;
  active: number;
  onSelect: (i: number) => void;
}) {
  const ex = plan.exercises[active];
  const totalSets = plan.exercises.reduce((n, e) => n + e.sets, 0);
  const count = plan.exercises.length;

  return (
    <div className={`${card} hidden md:block`}>
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        Today&apos;s items
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={chip}>{count} exercises</span>
        <span className={chip}>{totalSets} sets</span>
        <span className={chip}>~{plan.minutes} min</span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold leading-tight">{ex.name}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {ex.sets > 1 ? `${ex.sets} sets × ${ex.reps}` : ex.reps}
          </p>
        </div>
        <span className="shrink-0 text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
          {doneSets(log, active, ex.sets)}/{ex.sets} done
        </span>
      </div>

      <GuideBody exercise={ex} />

      <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/10">
        <button className={pagerBtn} disabled={active === 0} onClick={() => onSelect(active - 1)}>
          <Icon name="chevronLeft" className="h-3.5 w-3.5" /> Prev
        </button>
        <span className="text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
          {active + 1} of {count}
        </span>
        <button className={pagerBtn} disabled={active === count - 1} onClick={() => onSelect(active + 1)}>
          Next <Icon name="chevronRight" className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// Big moving cartoon + steps + tip. Used in the side guide and inline on phones.
function GuideBody({ exercise }: { exercise: Exercise }) {
  return (
    <>
      <MoveArt
        move={exercise.move}
        animate
        label={`How to do ${exercise.name}`}
        className="mt-3 aspect-6/5 w-full rounded-xl ring-1 ring-black/5"
      />
      {exercise.steps.length > 0 && (
        <>
          <p className="mt-4 text-sm font-semibold">How to do it</p>
          <ol className="mt-2 space-y-2">
            {exercise.steps.map((s, i) => (
              <li key={s} className="flex gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </>
      )}
      {exercise.tip && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          <Icon name="lightbulb" className="mt-0.5 h-4 w-4 shrink-0" />
          {exercise.tip}
        </p>
      )}
    </>
  );
}

function WorkoutCard({
  date,
  today,
  plan,
  log,
  active,
  onSelect,
  onToggle,
  onReset,
  error,
  onDismissError,
}: {
  date: string;
  today: string;
  plan: WorkoutPlan;
  log: WorkoutLog;
  active: number;
  onSelect: (i: number) => void;
  onToggle: (exercise: number, set: number) => void;
  onReset: () => void;
  error: string | null;
  onDismissError: () => void;
}) {
  const { done, total } = workoutProgress(plan, log);
  const future = date > today;
  const last = workoutActivity(plan, log)
    .sort((a, b) => a.at.localeCompare(b.at))
    .at(-1);

  return (
    <div className={card}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <IconBadge name="dumbbell" />
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{fmtLong(date)}</p>
            <h3 className="text-lg font-semibold">{plan.focus}</h3>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <DayBadge date={date} today={today} />
          <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <Icon name="clock" className="h-3.5 w-3.5" />~{plan.minutes} min
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium">
            {done}/{total} sets
          </span>
          <span className="text-zinc-500 dark:text-zinc-400">
            {last ? `Last: ${fmtTime(last.at)}` : future ? "Not started" : "No sets yet"}
          </span>
        </div>
        <ProgressBar done={done} total={total} />
      </div>

      {error && <ErrorBanner message={error} onClose={onDismissError} />}

      {future && (
        <p className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
          This day hasn&apos;t come yet — you can see the plan, tracking opens on the day.
        </p>
      )}

      <ul className="mt-4 space-y-2.5">
        {plan.exercises.map((ex, i) => {
          const sets = setTimes(log, i, ex.sets);
          const doneCount = sets.filter(Boolean).length;
          const finishedAt =
            doneCount === ex.sets ? (sets as string[]).reduce((a, b) => (a > b ? a : b)) : null;
          const isActive = i === active;
          return (
            <li
              key={ex.name + i}
              onClick={() => onSelect(i)}
              className={`cursor-pointer rounded-xl border p-3 transition-all duration-300 ${
                finishedAt
                  ? "border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30"
                  : "border-black/10 hover:border-emerald-500/40 dark:border-white/10"
              } ${isActive ? "ring-2 ring-emerald-500/50" : ""}`}
            >
              <div className="flex gap-3">
                <MoveArt
                  move={ex.move}
                  label={ex.name}
                  className="h-14 w-16.75 shrink-0 rounded-lg ring-1 ring-black/5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{ex.name}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {ex.sets > 1 ? `${ex.sets} sets × ${ex.reps}` : ex.reps}
                      </p>
                    </div>
                    {finishedAt ? (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <Icon name="check" className="h-3.5 w-3.5" />
                        {fmtTime(finishedAt)}
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs text-zinc-400 tabular-nums">
                        {doneCount}/{ex.sets}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {sets.map((at, j) => (
                      <button
                        key={j}
                        disabled={future}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(i);
                          onToggle(i, j);
                        }}
                        title={at ? `Done at ${fmtTime(at)}` : "Tap when done"}
                        className={`flex h-8 min-w-10 items-center justify-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                          at
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-black/15 text-zinc-600 hover:border-emerald-500 hover:text-emerald-700 dark:border-white/15 dark:text-zinc-300 dark:hover:text-emerald-400"
                        }`}
                      >
                        {at && <Icon name="check" className="h-3.5 w-3.5" />}
                        {ex.sets > 1 ? `Set ${j + 1}` : at ? "Done" : "Mark done"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* On phones the guide opens right under the picked exercise */}
              {isActive && (
                <div className="mt-3 border-t border-black/5 pt-1 md:hidden dark:border-white/10">
                  <GuideBody exercise={ex} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {!future && done > 0 && (
        <div className="mt-4 text-right">
          <button
            onClick={onReset}
            className="text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            Reset this day
          </button>
        </div>
      )}
    </div>
  );
}
