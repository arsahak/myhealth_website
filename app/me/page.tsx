import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { MeSkeleton } from "../components/skeletons";
import { getProfile } from "../lib/api";
import { todayKey } from "../lib/dates";
import { MeView } from "./me-view";

export const metadata: Metadata = { title: "Me" };

export default function MePage() {
  return (
    <Suspense fallback={<MeSkeleton />}>
      <MeSection />
    </Suspense>
  );
}

async function MeSection() {
  await connection();
  const profile = await getProfile();
  return <MeView profile={profile} today={todayKey()} />;
}
