import { Icon, type IconName } from "../icons";

export const card =
  "rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900";

export const chip =
  "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";

export const pagerBtn =
  "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:hover:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800";

// App logo: white lightning bolt (energy / confidence) on a green gradient tile.
export function Logo() {
  return (
    <span
      role="img"
      aria-label="MyHealth"
      className="block h-10 w-10 rounded-[14px] shadow-lg shadow-emerald-500/30 ring-1 ring-white/20 transition-transform duration-300 hover:scale-105 hover:-rotate-3"
    >
      <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="logo-shine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="14" fill="url(#logo-bg)" />
        <rect width="40" height="20" rx="14" fill="url(#logo-shine)" />
        <path
          transform="translate(8 8)"
          d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
          fill="#fff"
          stroke="#fff"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// Rounded green box with an icon, used before card titles.
export function IconBadge({ name }: { name: IconName }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
      <Icon name={name} className="h-5 w-5" />
    </span>
  );
}

export function DayBadge({ date, today }: { date: string; today: string }) {
  if (date === today)
    return (
      <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white">
        Today
      </span>
    );
  return (
    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {date > today ? "Upcoming" : "Past day"}
    </span>
  );
}

export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: IconName;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <Icon name={icon} className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>}
    </div>
  );
}

/** Small red notice for a failed save. The optimistic change has already rolled back. */
export function ErrorBanner({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      role="alert"
      className="mt-4 flex items-start justify-between gap-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-200"
    >
      <p>Couldn&apos;t save: {message}</p>
      <button onClick={onClose} className="shrink-0 font-medium underline-offset-4 hover:underline">
        Dismiss
      </button>
    </div>
  );
}
