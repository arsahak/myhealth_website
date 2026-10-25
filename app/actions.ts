"use server";

import { refresh } from "next/cache";
import { backend, BackendError } from "./lib/api";
import { isDateKey } from "./lib/dates";
import type { ActionResult } from "./lib/types";

// Every action calls the backend, then refreshes the page so the server
// re-renders with fresh data. Errors come back as a message, not a crash.

async function run(work: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await work();
  } catch (err) {
    const message = err instanceof BackendError ? err.message : "Something went wrong. Please try again.";
    return { ok: false, error: message };
  }
  refresh();
  return { ok: true };
}

const index = (n: unknown) => Number.isInteger(n) && (n as number) >= 0;
const bad = (error: string): ActionResult => ({ ok: false, error });

// ---------- workout ----------

export async function toggleSetAction(date: string, exercise: number, set: number) {
  if (!isDateKey(date) || !index(exercise) || !index(set)) return bad("That set couldn't be found.");
  return run(() =>
    backend(`/workouts/logs/${date}/sets/toggle`, {
      method: "POST",
      body: JSON.stringify({ exercise, set }),
    }),
  );
}

export async function resetWorkoutAction(date: string) {
  if (!isDateKey(date)) return bad("That day couldn't be found.");
  return run(() => backend(`/workouts/logs/${date}`, { method: "DELETE" }));
}

// ---------- food ----------

export async function toggleMealAction(date: string, meal: number) {
  if (!isDateKey(date) || !index(meal)) return bad("That meal couldn't be found.");
  return run(() =>
    backend(`/foods/logs/${date}/meals/toggle`, { method: "POST", body: JSON.stringify({ meal }) }),
  );
}

export async function chooseMealAction(date: string, meal: number, option: string) {
  if (!isDateKey(date) || !index(meal) || typeof option !== "string") {
    return bad("That option couldn't be saved.");
  }
  return run(() =>
    backend(`/foods/logs/${date}/choices`, { method: "PUT", body: JSON.stringify({ meal, option }) }),
  );
}

// ---------- me ----------

export type FormState = { error?: string; saved?: number };

const toForm = (result: ActionResult): FormState =>
  result.ok ? { saved: Date.now() } : { error: result.error };

export async function addWeightAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const kg = Number.parseFloat(String(formData.get("kg") ?? ""));
  if (!(kg >= 30 && kg <= 250)) return { error: "Enter a weight between 30 and 250 kg." };
  return toForm(
    await run(() =>
      backend("/users/profile/weights", {
        method: "POST",
        body: JSON.stringify({ kg: Math.round(kg * 10) / 10 }),
      }),
    ),
  );
}

export async function saveHeightAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ft = Number.parseInt(String(formData.get("ft") ?? ""), 10);
  const inch = Number.parseInt(String(formData.get("inch") || "0"), 10);
  if (!(ft >= 3 && ft <= 7) || !(inch >= 0 && inch <= 11)) {
    return { error: "Enter feet from 3 to 7 and inches from 0 to 11." };
  }
  return toForm(
    await run(() =>
      backend("/users/profile", { method: "PATCH", body: JSON.stringify({ height: { ft, inch } }) }),
    ),
  );
}

export async function deleteWeightAction(entryId: string) {
  if (!/^[a-f0-9]{24}$/.test(entryId)) return bad("That entry couldn't be found.");
  return run(() => backend(`/users/profile/weights/${entryId}`, { method: "DELETE" }));
}
