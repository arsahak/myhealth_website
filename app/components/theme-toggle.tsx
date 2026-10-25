"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "../icons";

type Theme = "light" | "dark";

export const THEME_KEY = "theme";

/**
 * Runs in <head> before the first paint: the saved choice, or the system setting.
 * Keeps the page from flashing the wrong theme on load.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

function subscribe(onChange: () => void) {
  const root = document.documentElement;
  const observer = new MutationObserver(onChange);
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  // Follow a change made in another tab.
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY && (e.newValue === "light" || e.newValue === "dark")) {
      root.setAttribute("data-theme", e.newValue);
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onStorage);
  };
}

const readTheme = (): Theme =>
  document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";

/**
 * One button: shows a moon in light mode (tap for dark) and a sun in dark mode
 * (tap for light). The icon comes from CSS, so it's right even before hydration.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => null);

  const toggle = () => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // storage blocked: the choice lasts until the page is closed
    }
  };

  const label =
    theme === "dark" ? "Switch to light mode" : theme === "light" ? "Switch to dark mode" : "Switch theme";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toggle}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-emerald-600/50 bg-white text-emerald-700 transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:bg-zinc-900 dark:text-amber-300 dark:hover:bg-zinc-800"
    >
      <Icon name="moon" className="h-5 w-5 dark:hidden" />
      <Icon name="sun" className="hidden h-5 w-5 dark:block" />
    </button>
  );
}
