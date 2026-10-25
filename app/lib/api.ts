import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import type { FoodLog, MealOption, MealPlan, Profile, WorkoutLog, WorkoutPlan } from "./types";

// Talks to the HealthApp backend. Runs on the server only.

const BASE_URL = (process.env.BACKEND_API_URL || "http://localhost:8001").replace(/\/$/, "");

export class BackendError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function backend<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api/v1${path}`, {
      ...init,
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new BackendError(`Can't reach the backend at ${BASE_URL}. Is it running?`, 503);
  }
  const body = (await res.json().catch(() => null)) as
    | { success: boolean; message?: string; errors?: string[]; data: T }
    | null;
  if (!res.ok || !body?.success) {
    const detail = body?.errors?.length ? body.errors.join(", ") : body?.message;
    throw new BackendError(detail || `Backend request failed (${res.status})`, res.status);
  }
  return body.data;
}

// Reads happen at request time and are shared within one render.
const read = <T>(path: string) =>
  connection().then(() => backend<T>(path));

export const getProfile = cache(() => read<Profile>("/users/profile"));
export const getWorkoutPlans = cache(() => read<WorkoutPlan[]>("/workouts/plans"));
export const getMealPlans = cache(() => read<MealPlan[]>("/foods/plans"));
export const getMealOptions = cache(() => read<MealOption[]>("/foods/options"));

export const getWorkoutLogs = cache((from: string, to: string) =>
  read<WorkoutLog[]>(`/workouts/logs?from=${from}&to=${to}`),
);
export const getFoodLogs = cache((from: string, to: string) =>
  read<FoodLog[]>(`/foods/logs?from=${from}&to=${to}`),
);
export const getWorkoutLog = cache((date: string) => read<WorkoutLog>(`/workouts/logs/${date}`));
export const getFoodLog = cache((date: string) => read<FoodLog>(`/foods/logs/${date}`));
