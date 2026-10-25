import { getProfile } from "../lib/api";

export async function ProfileFooter() {
  const profile = await getProfile().catch(() => null);
  if (!profile) return null;
  return (
    <>
      <p className="text-sm font-semibold tracking-tight">{profile.name}</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {profile.age} · {profile.gender} · Goal {profile.goalWeightKg} kg
      </p>
    </>
  );
}
