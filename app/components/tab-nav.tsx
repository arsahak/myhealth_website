"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useOptimistic } from "react";
import { Icon, type IconName } from "../icons";

const tabs: { href: "/workout" | "/food" | "/me"; label: string; icon: IconName }[] = [
  { href: "/workout", label: "Workout", icon: "dumbbell" },
  { href: "/food", label: "Food", icon: "utensils" },
  { href: "/me", label: "Me", icon: "user" },
];

/** Tabs that keep the picked day when switching between Workout and Food. */
export function TabNav() {
  const date = useSearchParams().get("date");
  return <TabNavBase date={date} />;
}

export function TabNavBase({ date = null }: { date?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const current = Math.max(0, tabs.findIndex((t) => pathname.startsWith(t.href)));
  // Slide the pill the moment a tab is clicked, before the page arrives.
  const [active, setActive] = useOptimistic(current);

  return (
    <nav className="relative grid w-full grid-cols-3 rounded-full border border-emerald-600/50 p-1 sm:w-auto">
      {/* Sliding green fill behind the active tab */}
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-emerald-600 shadow-md shadow-emerald-500/30 transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${active * 100}%)` }}
      />
      {tabs.map((t, i) => {
        const href = date && t.href !== "/me" ? `${t.href}?date=${date}` : t.href;
        return (
          <Link
            key={t.href}
            href={href}
            aria-current={i === current ? "page" : undefined}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              startTransition(() => {
                setActive(i);
                router.push(href);
              });
            }}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300 sm:px-4 ${
              i === active
                ? "text-white"
                : "text-zinc-600 hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-400"
            }`}
          >
            <Icon name={t.icon} className="h-4 w-4" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
