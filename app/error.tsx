"use client";

import { useEffect } from "react";
import { card } from "./components/ui";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message = error instanceof Error && error.message ? error.message : null;

  return (
    <div className={`${card} mx-auto max-w-md text-center`}>
      <p className="text-lg font-semibold">Couldn&apos;t load your plan</p>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {message ?? "The server didn't answer."} Check that the backend is running, then try again.
      </p>
      <button
        onClick={() => retry()}
        className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Try again
      </button>
    </div>
  );
}
