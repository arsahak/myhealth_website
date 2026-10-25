"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { chooseMealAction, toggleMealAction } from "../actions";
import { ActivityCard } from "../components/activity-card";
import { card, chip, DayBadge, ErrorBanner, IconBadge, pagerBtn, ProgressBar } from "../components/ui";
import { FoodArt } from "../food-art";
import { Icon, type IconName } from "../icons";
import { fmtLong, fmtTime } from "../lib/dates";
import {
  chooseInLog,
  chosenOption,
  dayNutrition,
  eatenAt,
  foodActivity,
  mealProgress,
  optionMap,
  optionsFor,
  sortEvents,
  toggleMealInLog,
} from "../lib/tracker";
import type { ActivityEvent, FoodLog, MealOption, MealPlan, PlannedMeal } from "../lib/types";

const mealIcons: Record<string, IconName> = {
  Breakfast: "sunrise",
  Snack: "apple",
  Lunch: "sun",
  Dinner: "moon",
};

type Change =
  | { type: "toggle"; meal: number; at: string }
  | { type: "choose"; meal: number; option: string; planned: string };

// Food tab body: meal list + guide for the picked meal + activity.
export function FoodView({
  date,
  today,
  plan,
  log,
  options,
  workoutEvents,
}: {
  date: string;
  today: string;
  plan: MealPlan;
  log: FoodLog;
  options: MealOption[];
  workoutEvents: ActivityEvent[];
}) {
  const byId = useMemo(() => optionMap(options), [options]);
  const [shownLog, applyChange] = useOptimistic(log, (current: FoodLog, change: Change) =>
    change.type === "toggle"
      ? toggleMealInLog(current, change.meal, change.at)
      : chooseInLog(current, change.meal, change.option, change.planned),
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Start on the first meal not eaten yet.
  const [active, setActive] = useState(() => {
    const i = plan.meals.findIndex((_, idx) => !eatenAt(log, idx));
    return i === -1 ? 0 : i;
  });

  const save = (change: Change, request: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      applyChange(change);
      const result = await request();
      setError(result.ok ? null : (result.error ?? "Please try again."));
    });

  const toggle = (meal: number) =>
    save({ type: "toggle", meal, at: new Date().toISOString() }, () => toggleMealAction(date, meal));

  const choose = (meal: number, option: string) =>
    save({ type: "choose", meal, option, planned: plan.meals[meal].option }, () =>
      chooseMealAction(date, meal, option),
    );

  const events = sortEvents([...foodActivity(plan, shownLog, byId), ...workoutEvents]);

  return (
    <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_340px] md:items-start">
      <FoodCard
        date={date}
        today={today}
        plan={plan}
        log={shownLog}
        options={options}
        byId={byId}
        active={active}
        onSelect={setActive}
        onToggle={toggle}
        onChoose={choose}
        error={error}
        onDismissError={() => setError(null)}
      />
      <div className="space-y-4">
        <MealGuide
          plan={plan}
          log={shownLog}
          options={options}
          byId={byId}
          active={active}
          onSelect={setActive}
          onChoose={(slug) => choose(active, slug)}
        />
        <ActivityCard date={date} events={events} />
      </div>
    </div>
  );
}

function MealGuide({
  plan,
  log,
  options,
  byId,
  active,
  onSelect,
  onChoose,
}: {
  plan: MealPlan;
  log: FoodLog;
  options: MealOption[];
  byId: Map<string, MealOption>;
  active: number;
  onSelect: (i: number) => void;
  onChoose: (slug: string) => void;
}) {
  const meal = plan.meals[active];
  const option = chosenOption(meal, log, active, byId);
  const { kcal, protein } = dayNutrition(plan, log, byId);
  const count = plan.meals.length;
  const at = eatenAt(log, active);

  return (
    <div className={`${card} hidden md:block`}>
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        Today&apos;s food
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={chip}>{count} meals</span>
        <span className={chip}>~{kcal.toLocaleString("en-US")} kcal</span>
        <span className={chip}>{protein} g protein</span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <Icon
              name={mealIcons[meal.label] ?? "utensils"}
              className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
            />
            {meal.label} · {meal.time}
          </p>
          <p className="text-lg leading-tight font-semibold">{option.name}</p>
        </div>
        {at && (
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <Icon name="check" className="h-3.5 w-3.5" />
            {fmtTime(at)}
          </span>
        )}
      </div>

      <MealGuideBody meal={meal} option={option} options={options} onChoose={onChoose} />

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

// Plate picture, what to eat (with grams), options to swap, and a cooking tip.
// Used in the side guide and inline on phones.
function MealGuideBody({
  meal,
  option,
  options,
  onChoose,
}: {
  meal: PlannedMeal;
  option: MealOption;
  options: MealOption[];
  onChoose: (slug: string) => void;
}) {
  const choices = optionsFor(meal.option, options);
  return (
    <>
      <FoodArt option={option} animate className="mt-3 aspect-6/5 w-full rounded-xl ring-1 ring-black/5" />

      <p className="mt-4 text-sm font-semibold">What to eat</p>
      <ul className="mt-1.5 divide-y divide-black/5 dark:divide-white/10">
        {option.items.map((it) => (
          <li key={it.name} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">{it.name}</span>
            <span className="shrink-0 font-medium text-emerald-700 tabular-nums dark:text-emerald-400">
              {it.amount}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <Icon name="flame" className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />~
          {option.kcal} kcal
        </span>
        <span className="flex items-center gap-1">
          <Icon name="egg" className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          {option.protein} g protein
        </span>
      </div>

      {choices.length > 1 && (
        <>
          <p className="mt-4 text-sm font-semibold">Pick an option</p>
          <div className="mt-2 space-y-1.5">
            {choices.map((o) => {
              const on = o.slug === option.slug;
              return (
                <button
                  key={o.slug}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!on) onChoose(o.slug);
                  }}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-2.5 rounded-xl border p-1.5 pr-3 text-left text-sm transition-colors duration-200 ${
                    on
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                      : "border-black/10 hover:border-emerald-400 dark:border-white/10"
                  }`}
                >
                  <FoodArt option={o} compact className="h-9 w-11 shrink-0 rounded-lg" />
                  <span className="min-w-0 flex-1 leading-tight">
                    {o.name}
                    {o.slug === meal.option && (
                      <span className="ml-1.5 text-[10px] font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                        Plan
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
                    {o.kcal} kcal
                  </span>
                  <span
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                      on ? "border-emerald-600 bg-emerald-600" : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {on && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {option.tip && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          <Icon name="lightbulb" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <span className="font-semibold">Cooking tip: </span>
            {option.tip}
          </p>
        </div>
      )}
    </>
  );
}

function FoodCard({
  date,
  today,
  plan,
  log,
  options,
  byId,
  active,
  onSelect,
  onToggle,
  onChoose,
  error,
  onDismissError,
}: {
  date: string;
  today: string;
  plan: MealPlan;
  log: FoodLog;
  options: MealOption[];
  byId: Map<string, MealOption>;
  active: number;
  onSelect: (i: number) => void;
  onToggle: (meal: number) => void;
  onChoose: (meal: number, slug: string) => void;
  error: string | null;
  onDismissError: () => void;
}) {
  const { done, total } = mealProgress(plan, log);
  const { kcal, eatenKcal } = dayNutrition(plan, log, byId);
  const future = date > today;

  return (
    <div className={card}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <IconBadge name="utensils" />
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{fmtLong(date)}</p>
            <h3 className="text-lg font-semibold">Meals for the day</h3>
          </div>
        </div>
        <DayBadge date={date} today={today} />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium">
            {done}/{total} meals
          </span>
          <span className="text-zinc-500 tabular-nums dark:text-zinc-400">
            {eatenKcal.toLocaleString("en-US")} of ~{kcal.toLocaleString("en-US")} kcal
          </span>
        </div>
        <ProgressBar done={done} total={total} />
      </div>

      {error && <ErrorBanner message={error} onClose={onDismissError} />}

      <ol className="mt-4 space-y-2.5">
        {plan.meals.map((m, i) => {
          const at = eatenAt(log, i);
          const option = chosenOption(m, log, i, byId);
          const isActive = i === active;
          return (
            <li
              key={m.label + m.time}
              onClick={() => onSelect(i)}
              className={`cursor-pointer rounded-xl border p-3 transition-all duration-300 ${
                at
                  ? "border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30"
                  : "border-black/10 hover:border-emerald-500/40 dark:border-white/10"
              } ${isActive ? "ring-2 ring-emerald-500/50" : ""}`}
            >
              <div className="flex items-center gap-3">
                <FoodArt
                  option={option}
                  compact
                  className="h-14 w-16.75 shrink-0 rounded-lg ring-1 ring-black/5"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Icon
                      name={mealIcons[m.label] ?? "utensils"}
                      className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                    />
                    {m.label}
                    <span className="text-xs font-normal text-zinc-400 tabular-nums">{m.time}</span>
                  </p>
                  <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">{option.name}</p>
                  <p className="text-xs text-zinc-400 tabular-nums">
                    ~{option.kcal} kcal · {option.protein} g protein
                  </p>
                </div>
                <button
                  disabled={future}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(i);
                    onToggle(i);
                  }}
                  title={at ? "Tap to undo" : "Tap when eaten"}
                  className={`flex h-8 shrink-0 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                    at
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-black/15 text-zinc-600 hover:border-emerald-500 hover:text-emerald-700 dark:border-white/15 dark:text-zinc-300 dark:hover:text-emerald-400"
                  }`}
                >
                  {at ? (
                    <>
                      <Icon name="check" className="h-3.5 w-3.5" />
                      {fmtTime(at)}
                    </>
                  ) : (
                    "Eaten"
                  )}
                </button>
              </div>

              {/* On phones the guide opens right under the picked meal */}
              {isActive && (
                <div className="mt-3 border-t border-black/5 pt-1 md:hidden dark:border-white/10">
                  <MealGuideBody
                    meal={m}
                    option={option}
                    options={options}
                    onChoose={(slug) => onChoose(i, slug)}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
        <Icon name="lightbulb" className="mt-0.5 h-4 w-4 shrink-0" />
        Rice max 1 cup per meal, cook with less oil, no sugar in tea.
      </p>
    </div>
  );
}
