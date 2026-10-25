"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useOptimistic, useRef, useTransition } from "react";
import { Icon } from "../icons";
import {
  dateRange,
  daysBetween,
  fmtLong,
  fmtMonthShort,
  fmtMonthYear,
  fmtWeekday,
  fromKey,
  pickDay,
} from "../lib/dates";
import type { DayStatus } from "../lib/types";

// Scrollable big day tabs. Picking a day changes the URL (?date=...) so the
// server renders that day; the tab highlights right away.
export function DayStrip({
  basePath,
  from,
  to,
  today,
  startDate,
  goalDate,
  statuses,
}: {
  basePath: "/workout" | "/food";
  from: string;
  to: string;
  today: string;
  startDate: string;
  goalDate: string;
  statuses: Record<string, DayStatus>;
}) {
  const router = useRouter();
  const selected = pickDay(useSearchParams().get("date"), today);
  const [, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(selected);
  const scroller = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);
  const days = dateRange(from, to);

  const centreOn = (key: string, smooth: boolean) => {
    const box = scroller.current;
    const el = box?.querySelector<HTMLElement>(`[data-day="${key}"]`);
    if (!box || !el) return;
    box.scrollTo({
      left: el.offsetLeft - (box.clientWidth - el.clientWidth) / 2,
      behavior: smooth ? "smooth" : "instant",
    });
  };

  // Keep the picked day centred (jump on first load, glide after).
  useEffect(() => {
    centreOn(shown, !firstScroll.current);
    firstScroll.current = false;
  }, [shown]);

  const pick = (key: string) => {
    if (key === shown) return;
    startTransition(() => {
      setShown(key);
      router.push(key === today ? basePath : `${basePath}?date=${key}`, { scroll: false });
    });
  };

  const goToday = () => {
    pick(today);
    centreOn(today, true);
  };

  const scrollByWeek = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * 7 * 72, behavior: "smooth" });

  const planDay = daysBetween(startDate, shown) + 1;
  const planLength = daysBetween(startDate, goalDate) + 1;

  const navBtn =
    "grid h-8 w-8 place-items-center rounded-lg border border-black/10 text-zinc-500 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-white/10 dark:hover:text-emerald-400";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-semibold">{fmtMonthYear(shown)}</p>
          {planDay >= 1 && planDay <= planLength && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Day {planDay} of {planLength}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => scrollByWeek(-1)} className={navBtn} aria-label="Earlier days">
            <Icon name="chevronLeft" className="h-4 w-4" />
          </button>
          <button
            onClick={goToday}
            className="h-8 rounded-lg border border-emerald-600/50 px-3 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
          >
            Today
          </button>
          <button onClick={() => scrollByWeek(1)} className={navBtn} aria-label="Later days">
            <Icon name="chevronRight" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="relative flex snap-x gap-2 overflow-x-auto px-1 pt-2 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent)",
        }}
      >
        {days.map((key) => {
          const isSel = key === shown;
          const isToday = key === today;
          const future = key > today;
          const st = statuses[key];
          const d = fromKey(key);
          return (
            <button
              key={key}
              data-day={key}
              onClick={() => pick(key)}
              aria-label={fmtLong(key)}
              aria-pressed={isSel}
              className={`relative flex w-16 shrink-0 snap-center flex-col items-center rounded-xl border py-2.5 transition-all duration-300 ${
                d.getDate() === 1 ? "ml-3" : ""
              } ${
                isSel
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                  : isToday
                    ? "border-emerald-500 bg-white text-emerald-700 dark:bg-zinc-900 dark:text-emerald-400"
                    : future
                      ? "border-black/10 bg-white text-zinc-400 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800"
                      : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wide opacity-75">
                {fmtWeekday(key)}
              </span>
              <span className="text-xl font-semibold leading-tight tabular-nums">{d.getDate()}</span>
              <span className="text-[11px] opacity-75">{isToday ? "Today" : fmtMonthShort(key)}</span>
              {st === "full" && (
                <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-zinc-50 dark:ring-black">
                  <Icon name="check" className="h-3 w-3" />
                </span>
              )}
              {st === "partial" && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-zinc-50 dark:ring-black" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-emerald-500 text-white">
            <Icon name="check" className="h-2.5 w-2.5" />
          </span>
          Complete
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Partly done
        </span>
      </div>
    </div>
  );
}
