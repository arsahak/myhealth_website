import "server-only";

import { connection } from "next/server";
import { addDays, pickDay, todayKey } from "./dates";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Today's date key, decided per request (it depends on the clock). */
export async function requestToday() {
  await connection();
  return todayKey();
}

/** Picked day from `?date=YYYY-MM-DD`, or today. */
export async function resolveDay(searchParams: SearchParams) {
  const raw = (await searchParams).date;
  const today = await requestToday();
  return { date: pickDay(raw, today), today };
}

/** The days the strip shows: the whole plan, plus two weeks either side of today. */
export function stripRange(startDate: string, goalDate: string, today: string) {
  const from = [startDate, addDays(today, -14)].reduce((a, b) => (a < b ? a : b));
  const to = [goalDate, addDays(today, 14)].reduce((a, b) => (a > b ? a : b));
  return { from, to };
}
