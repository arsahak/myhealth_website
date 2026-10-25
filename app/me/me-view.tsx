"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";
import { addWeightAction, deleteWeightAction, saveHeightAction, type FormState } from "../actions";
import { card, ErrorBanner, IconBadge, Stat } from "../components/ui";
import { Icon, type IconName } from "../icons";
import { fmtShort, fmtTime } from "../lib/dates";
import type { Profile, WeightEntry } from "../lib/types";

const ruleIcons: Record<string, IconName> = {
  Water: "droplet",
  Sleep: "moon",
  Steps: "footprints",
  Avoid: "ban",
};

type WeightChange = { type: "add"; entry: WeightEntry } | { type: "remove"; id: string };

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function MeView({ profile, today }: { profile: Profile; today: string }) {
  const [weights, changeWeights] = useOptimistic(profile.weights, (current: WeightEntry[], change: WeightChange) =>
    change.type === "add" ? [...current, change.entry] : current.filter((w) => w._id !== change.id),
  );
  const [height, showHeight] = useOptimistic(profile.height ?? null);
  const [, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [weightState, submitWeight, savingWeight] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const kg = Number.parseFloat(String(formData.get("kg") ?? ""));
      if (kg >= 30 && kg <= 250) {
        changeWeights({
          type: "add",
          entry: { _id: `pending-${Date.now()}`, date: today, kg: Math.round(kg * 10) / 10, at: new Date().toISOString() },
        });
      }
      return addWeightAction(prev, formData);
    },
    {},
  );

  const [heightState, submitHeight, savingHeight] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const ft = Number.parseInt(String(formData.get("ft") ?? ""), 10);
      const inch = Number.parseInt(String(formData.get("inch") || "0"), 10);
      if (ft >= 3 && ft <= 7 && inch >= 0 && inch <= 11) showHeight({ ft, inch });
      return saveHeightAction(prev, formData);
    },
    {},
  );

  const removeWeight = (id: string) =>
    startTransition(async () => {
      changeWeights({ type: "remove", id });
      const result = await deleteWeightAction(id);
      setDeleteError(result.ok ? null : result.error);
    });

  const weight = weights.length ? weights[weights.length - 1].kg : profile.startWeightKg;
  const totalToLose = profile.startWeightKg - profile.goalWeightKg;
  const lost = profile.startWeightKg - weight;
  const progress = totalToLose > 0 ? Math.min(100, Math.max(0, (lost / totalToLose) * 100)) : 0;
  const left = Math.max(0, weight - profile.goalWeightKg);

  // BMI + calories (Mifflin-St Jeor, light activity, ~450 kcal deficit)
  const cm = height ? (height.ft * 12 + height.inch) * 2.54 : null;
  const bmi = cm ? weight / (cm / 100) ** 2 : null;
  const sexOffset = profile.gender === "Female" ? -161 : 5;
  const bmr = 10 * weight + 6.25 * (cm ?? 170) - 5 * profile.age + sexOffset;
  const calories = Math.round((bmr * 1.375 - 450) / 50) * 50;
  const protein = Math.round(profile.goalWeightKg * 1.6);

  const months =
    (new Date(profile.goalDate).getTime() - new Date(profile.startDate).getTime()) /
    (1000 * 60 * 60 * 24 * 30.44);
  const perMonth = months > 0 ? totalToLose / months : 0;

  const history = [...weights].reverse();

  const input =
    "w-0 flex-1 rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-white/15";

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon="calendar" label="Age" value={`${profile.age}`} sub={profile.gender} />
        <Stat
          icon="weight"
          label="Current weight"
          value={`${weight} kg`}
          sub={`Start: ${profile.startWeightKg} kg`}
        />
        <Stat
          icon="ruler"
          label="Height"
          value={height ? `${height.ft}′ ${height.inch}″` : "—"}
          sub={cm ? `${Math.round(cm)} cm` : "Add below"}
        />
        <Stat icon="activity" label="BMI" value={bmi ? bmi.toFixed(1) : "—"} sub={bmi ? bmiLabel(bmi) : "Needs height"} />
      </div>

      {/* Goal progress */}
      <div className={`mt-4 ${card}`}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex items-center gap-3">
            <IconBadge name="target" />
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Goal</p>
              <p className="text-lg font-semibold">
                {profile.startWeightKg} kg → {profile.goalWeightKg} kg
              </p>
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {left > 0 ? `${left.toFixed(1)} kg left` : "Goal reached 🎉"} · about {perMonth.toFixed(1)} kg / month
          </p>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {lost > 0 ? `${lost.toFixed(1)} kg lost so far` : "Let's start!"} · {Math.round(progress)}% done
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <form action={submitWeight}>
            <div className="flex gap-2">
              <input
                name="kg"
                inputMode="decimal"
                placeholder="Today's weight (kg)"
                aria-label="Today's weight in kg"
                required
                className={input}
              />
              <button
                disabled={savingWeight}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {savingWeight ? "Saving…" : "Update"}
              </button>
            </div>
            {weightState.error && !savingWeight && (
              <p role="alert" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                {weightState.error}
              </p>
            )}
          </form>
          <form action={submitHeight}>
            <div className="flex gap-2">
              <input
                name="ft"
                inputMode="numeric"
                placeholder="Height ft"
                aria-label="Height feet"
                required
                defaultValue={profile.height?.ft}
                className={input}
              />
              <input
                name="inch"
                inputMode="numeric"
                placeholder="inch"
                aria-label="Height inches"
                defaultValue={profile.height?.inch}
                className={input}
              />
              <button
                disabled={savingHeight}
                className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 dark:text-emerald-400 dark:hover:bg-emerald-950"
              >
                {savingHeight ? "Saving…" : "Save"}
              </button>
            </div>
            {heightState.error && !savingHeight && (
              <p role="alert" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                {heightState.error}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 md:items-start">
        {/* Weight history */}
        <div className={card}>
          <div className="flex items-center gap-2">
            <Icon name="history" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <p className="font-semibold">Weight history</p>
            <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
              {history.length} {history.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          {deleteError && <ErrorBanner message={deleteError} onClose={() => setDeleteError(null)} />}
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              No entries yet. Add today&apos;s weight above — the date and time are saved.
            </p>
          ) : (
            <ul className="mt-3 max-h-72 divide-y divide-black/5 overflow-y-auto dark:divide-white/10">
              {history.map((w, i) => {
                const prev = history[i + 1]?.kg ?? profile.startWeightKg;
                const diff = Math.round((w.kg - prev) * 10) / 10;
                const pending = w._id.startsWith("pending-");
                return (
                  <li
                    key={w._id}
                    className={`group flex items-center justify-between py-2.5 text-sm transition-opacity ${pending ? "opacity-50" : ""}`}
                  >
                    <span>
                      <span className="font-medium">{fmtShort(w.date)}</span>
                      <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">{fmtTime(w.at)}</span>
                    </span>
                    <span className="flex items-center gap-3 tabular-nums">
                      <span
                        className={`text-xs ${
                          diff < 0 ? "text-emerald-600 dark:text-emerald-400" : diff > 0 ? "text-rose-500" : "text-zinc-400"
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                      <span className="font-semibold">{w.kg} kg</span>
                      {!pending && (
                        <button
                          onClick={() => removeWeight(w._id)}
                          aria-label={`Remove ${w.kg} kg on ${fmtShort(w.date)}`}
                          className="text-xs text-zinc-400 hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                        >
                          Remove
                        </button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Daily targets */}
        <div className="grid grid-cols-2 gap-3">
          <Stat icon="flame" label="Calories / day" value={`~${calories}`} sub="kcal" />
          <Stat icon="egg" label="Protein / day" value={`${protein} g`} sub="Egg, fish, chicken, dal" />
          {profile.dailyRules.map((r) => (
            <Stat key={r.title} icon={ruleIcons[r.title] ?? "activity"} label={r.title} value={r.value} sub={r.note} />
          ))}
        </div>
      </div>
    </>
  );
}
