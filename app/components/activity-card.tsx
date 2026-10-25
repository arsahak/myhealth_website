import { Icon } from "../icons";
import { fmtShort, fmtTime } from "../lib/dates";
import type { ActivityEvent } from "../lib/types";
import { card } from "./ui";

export function ActivityCard({ date, events }: { date: string; events: ActivityEvent[] }) {
  return (
    <div className={card}>
      <div className="flex items-center gap-2">
        <Icon name="history" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <p className="font-semibold">Activity</p>
        <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">{fmtShort(date)}</span>
      </div>

      {events.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Nothing logged yet. Tick a set or a meal and it shows up here with the time.
        </p>
      ) : (
        <ol className="mt-4 space-y-3 border-l border-black/10 pl-4 dark:border-white/10">
          {events.map((e, i) => (
            <li key={e.at + i} className="relative">
              <span
                className={`absolute top-1.5 left-[-1.3rem] h-2 w-2 rounded-full ring-2 ring-white dark:ring-zinc-900 ${
                  e.kind === "workout" ? "bg-emerald-500" : "bg-amber-400"
                }`}
              />
              <p className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{fmtTime(e.at)}</p>
              <p className="text-sm">{e.text}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
