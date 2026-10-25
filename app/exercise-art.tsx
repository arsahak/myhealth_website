"use client";

// Cartoon exercise pictures. The how-to steps come from the backend.
//
// Each pose is written as joint angles (like a real skeleton), not loose points.
// Angles are in degrees: 0 = pointing right, 90 = down, -90 = up, 180 = left.
// Bones keep the same length, so in-between frames stay clean, and a "pin"
// keeps a hand or foot fixed on the floor while the rest of the body moves.

import { useSyncExternalStore, type ReactNode } from "react";
import type { MoveId } from "./lib/types";

type Pt = [number, number];

type Spec = {
  torso: number; // hip -> neck
  head?: number; // neck -> head (defaults to torso)
  aB: [number, number]; // back arm: upper, forearm
  aF: [number, number]; // front arm
  lB: [number, number]; // back leg: thigh, shin
  lF: [number, number]; // front leg
  x?: number; // hip x when not pinned (default 60)
  lift?: number; // raise the body (e.g. up on toes)
  toesB?: number; // fixed shoe angle (default: follows the shin)
  toesF?: number;
};

type Joint = "neck" | "hip" | "hB" | "hF" | "fB" | "fF";
type Prop = "mat" | "dumbbell" | "dumbbells" | "chair" | "box" | "scale";

type Move = {
  view: "side" | "front";
  dur: number; // seconds per rep
  a: Spec; // start pose
  b: Spec; // end pose
  pin?: { joint: Joint; at: Pt }; // this joint never moves
  props?: Prop[];
  still?: 0 | 1; // which pose the small picture shows (default: end pose)
};

const FOOT_Y = 86.5; // shoe centre when standing on the floor
const GROUND_Y = 89.5;

const L = {
  torso: 25,
  head: 10,
  upper: 12,
  fore: 11,
  thigh: 16,
  shin: 15,
  shoulderDrop: 3,
  shoulderW: 5,
  hipW: 3.5,
};

const stand = (extra: Partial<Spec> = {}): Spec => ({
  torso: -90,
  aB: [92, 90],
  aF: [88, 90],
  lB: [91, 90],
  lF: [89, 90],
  ...extra,
});

// ---------- the moves ----------

const moves: Record<MoveId, Move> = {
  walk: {
    view: "side",
    dur: 1.1,
    still: 0,
    // front leg forward + back leg pushing off; arms swing opposite to legs
    a: { torso: -88, head: -86, aB: [70, 50], aF: [110, 95], lB: [110, 130], lF: [70, 80] },
    b: { torso: -88, head: -86, aB: [110, 95], aF: [70, 50], lB: [70, 80], lF: [110, 130] },
  },
  run: {
    view: "side",
    dur: 0.7,
    still: 0,
    a: {
      torso: -78,
      head: -80,
      x: 58,
      aB: [50, -40],
      aF: [125, 35],
      lB: [115, 150],
      lF: [40, 100],
    },
    b: {
      torso: -78,
      head: -80,
      x: 58,
      aB: [125, 35],
      aF: [50, -40],
      lB: [40, 100],
      lF: [115, 150],
    },
  },
  squat: {
    view: "side",
    dur: 2.4,
    pin: { joint: "fF", at: [64, FOOT_Y] },
    a: stand({ aB: [0, 0], aF: [0, 0], lB: [90, 90], lF: [90, 90] }),
    b: { torso: -50, head: -60, aB: [-10, -10], aF: [-10, -10], lB: [15, 100], lF: [15, 100] },
  },
  pushup: {
    view: "side",
    dur: 2.2,
    still: 0,
    props: ["mat"],
    pin: { joint: "fF", at: [32, FOOT_Y] },
    a: { torso: -26, aB: [90, 90], aF: [90, 90], lB: [154, 154], lF: [154, 154] },
    b: {
      torso: -8.5,
      head: -8,
      aB: [183, 48],
      aF: [183, 48],
      lB: [171.5, 171.5],
      lF: [171.5, 171.5],
    },
  },
  plank: {
    view: "side",
    dur: 3,
    still: 0,
    props: ["mat"],
    pin: { joint: "fF", at: [28, FOOT_Y] },
    a: { torso: -15, head: -12, aB: [90, 0], aF: [90, 0], lB: [165, 165], lF: [165, 165] },
    b: { torso: -17, head: -14, aB: [90, 0], aF: [90, 0], lB: [163, 163], lF: [163, 163] },
  },
  climber: {
    view: "side",
    dur: 0.8,
    still: 0,
    props: ["mat"],
    pin: { joint: "hF", at: [82, FOOT_Y] },
    a: { torso: -26, head: -24, aB: [90, 90], aF: [90, 90], lB: [154, 154], lF: [30, 160] },
    b: { torso: -26, head: -24, aB: [90, 90], aF: [90, 90], lB: [30, 160], lF: [154, 154] },
  },
  row: {
    view: "side",
    dur: 2.2,
    props: ["dumbbell"],
    a: { torso: -40, head: -30, x: 54, aB: [90, 90], aF: [90, 90], lB: [75, 100], lF: [75, 100] },
    b: { torso: -40, head: -30, x: 54, aB: [195, 90], aF: [195, 90], lB: [75, 100], lF: [75, 100] },
  },
  bridge: {
    view: "side",
    dur: 2.4,
    props: ["mat"],
    pin: { joint: "neck", at: [28, 84] },
    a: {
      torso: 180,
      head: 190,
      aB: [3, 0],
      aF: [3, 0],
      lB: [-50, 70],
      lF: [-50, 70],
      toesB: 0,
      toesF: 0,
    },
    b: {
      torso: 146,
      head: 190,
      aB: [8, 5],
      aF: [8, 5],
      lB: [5, 75],
      lF: [5, 75],
      toesB: 0,
      toesF: 0,
    },
  },
  crunch: {
    view: "side",
    dur: 2,
    props: ["mat"],
    pin: { joint: "hip", at: [53, 84] },
    a: {
      torso: 180,
      head: 190,
      aB: [230, 150],
      aF: [230, 150],
      lB: [-50, 70],
      lF: [-50, 70],
      toesB: 0,
      toesF: 0,
    },
    b: {
      torso: 205,
      head: 215,
      aB: [255, 175],
      aF: [255, 175],
      lB: [-50, 70],
      lF: [-50, 70],
      toesB: 0,
      toesF: 0,
    },
  },
  legraise: {
    view: "side",
    dur: 2.6,
    props: ["mat"],
    pin: { joint: "hip", at: [55, 84] },
    a: { torso: 180, head: 190, aB: [3, 0], aF: [3, 0], lB: [0, 0], lF: [0, 0] },
    b: { torso: 180, head: 190, aB: [3, 0], aF: [3, 0], lB: [-72, -72], lF: [-72, -72] },
  },
  sideplank: {
    view: "front",
    dur: 3,
    props: ["mat"],
    pin: { joint: "fF", at: [24, FOOT_Y] },
    // front (lower) arm on the floor, back (upper) arm reaching up
    a: { torso: -15, aB: [-90, -90], aF: [90, 0], lB: [165, 165], lF: [165, 165] },
    b: { torso: -17, aB: [-90, -90], aF: [90, 0], lB: [163, 163], lF: [163, 163] },
  },
  jumpingjacks: {
    view: "front",
    dur: 1,
    a: stand({ aB: [100, 95], aF: [80, 85], lB: [93, 91], lF: [87, 89] }),
    b: stand({ aB: [-135, -115], aF: [-45, -65], lB: [112, 108], lF: [68, 72] }),
  },
  armcircles: {
    view: "front",
    dur: 1.2,
    still: 0,
    a: stand({ aB: [180, 180], aF: [0, 0], lB: [100, 96], lF: [80, 84] }),
    b: stand({ aB: [-150, -150], aF: [-30, -30], lB: [100, 96], lF: [80, 84] }),
  },
  press: {
    view: "front",
    dur: 2.2,
    props: ["dumbbells"],
    a: stand({ aB: [180, -90], aF: [0, -90], lB: [96, 92], lF: [84, 88] }),
    b: stand({ aB: [-100, -95], aF: [-80, -85], lB: [96, 92], lF: [84, 88] }),
  },
  stretch: {
    view: "front",
    dur: 3.2,
    a: stand({ aB: [-100, -95], aF: [-80, -85], lB: [105, 100], lF: [75, 80] }),
    b: stand({
      torso: -68,
      head: -60,
      aB: [-60, -40],
      aF: [-40, -20],
      lB: [105, 100],
      lF: [75, 80],
    }),
  },
  yoga: {
    view: "front",
    dur: 4,
    still: 0,
    props: ["mat"],
    // tree pose: hands at chest, then reach up
    a: stand({ aB: [117, -31], aF: [63, -149], lB: [90, 90], lF: [35, 160] }),
    b: stand({ aB: [-105, -60], aF: [-75, -120], lB: [90, 90], lF: [35, 160] }),
  },
  curl: {
    view: "side",
    dur: 2,
    props: ["dumbbell"],
    a: stand({ head: -88, lB: [90, 90], lF: [90, 90] }),
    b: stand({ head: -88, aB: [94, -70], aF: [92, -68], lB: [90, 90], lF: [90, 90] }),
  },
  dips: {
    view: "side",
    dur: 2.2,
    props: ["chair"],
    pin: { joint: "hF", at: [47, 61] },
    a: { torso: -90, head: -88, aB: [90, 90], aF: [90, 90], lB: [40, 80], lF: [40, 80] },
    b: { torso: -90, head: -88, aB: [157, 35], aF: [157, 35], lB: [-6, 101], lF: [-6, 101] },
  },
  lunge: {
    view: "side",
    dur: 2.4,
    pin: { joint: "fB", at: [40, FOOT_Y] },
    // hands on hips, step forward and drop the back knee
    a: stand({ aB: [120, 50], aF: [120, 50], lB: [92, 90], lF: [88, 90] }),
    b: stand({ aB: [120, 50], aF: [120, 50], lB: [120, 170], lF: [10, 92] }),
  },
  stepup: {
    view: "side",
    dur: 2.4,
    still: 0,
    props: ["box"],
    pin: { joint: "fF", at: [72, 76.5] },
    a: { torso: -88, head: -88, aB: [80, 85], aF: [100, 95], lB: [90, 90], lF: [24, 77] },
    b: stand({ aB: [95, 92], aF: [88, 90], lB: [92, 90], lF: [90, 90] }),
  },
  calf: {
    view: "side",
    dur: 1.6,
    a: stand({ lB: [90, 90], lF: [90, 90] }),
    b: stand({ lB: [90, 90], lF: [90, 90], lift: 4, toesB: 50, toesF: 50 }),
  },
  weigh: {
    view: "front",
    dur: 2,
    still: 0,
    props: ["scale"],
    a: stand({ aB: [96, 92], aF: [84, 88], lB: [93, 90], lF: [87, 90], lift: 3.5 }),
    b: stand({ head: -84, aB: [96, 92], aF: [84, 88], lB: [93, 90], lF: [87, 90], lift: 3.5 }),
  },
};

// ---------- skeleton maths ----------

type Frame = {
  head: Pt;
  neck: Pt;
  hip: Pt;
  shB: Pt;
  shF: Pt;
  eB: Pt;
  hB: Pt;
  eF: Pt;
  hF: Pt;
  hpB: Pt;
  hpF: Pt;
  kB: Pt;
  fB: Pt;
  kF: Pt;
  fF: Pt;
  toeB: number;
  toeF: number;
  headRot: number;
};
type PtKey = Exclude<keyof Frame, "toeB" | "toeF" | "headRot">;

const rad = (d: number) => (d * Math.PI) / 180;
const dirOf = (deg: number): Pt => [Math.cos(rad(deg)), Math.sin(rad(deg))];
const step = (p: Pt, d: Pt, len: number): Pt => [p[0] + d[0] * len, p[1] + d[1] * len];
const lerp = (a: number, b: number, s: number) => a + (b - a) * s;
// Turn the short way round between two angles.
const lerpAngle = (a: number, b: number, s: number) =>
  a + (((((b - a) % 360) + 540) % 360) - 180) * s;

function solve(m: Move, s: number): Frame {
  const { a, b } = m;
  const ang = (f: (p: Spec) => number) => lerpAngle(f(a), f(b), s);

  const torso = ang((p) => p.torso);
  const headA = ang((p) => p.head ?? p.torso);
  const aB = [ang((p) => p.aB[0]), ang((p) => p.aB[1])];
  const aF = [ang((p) => p.aF[0]), ang((p) => p.aF[1])];
  const lB = [ang((p) => p.lB[0]), ang((p) => p.lB[1])];
  const lF = [ang((p) => p.lF[0]), ang((p) => p.lF[1])];

  // Skeleton with the hip at (0, 0)
  const td = dirOf(torso);
  const perp: Pt = [-td[1], td[0]]; // right-hand side of the body
  const front = m.view === "front";
  const hip: Pt = [0, 0];
  const neck = step(hip, td, L.torso);
  const head = step(neck, dirOf(headA), L.head);
  const sh = step(neck, td, -L.shoulderDrop);
  const shB = step(sh, perp, front ? -L.shoulderW : 0);
  const shF = step(sh, perp, front ? L.shoulderW : 0);
  const hpB = step(hip, perp, front ? -L.hipW : 0);
  const hpF = step(hip, perp, front ? L.hipW : 0);
  const eB = step(shB, dirOf(aB[0]), L.upper);
  const hB = step(eB, dirOf(aB[1]), L.fore);
  const eF = step(shF, dirOf(aF[0]), L.upper);
  const hF = step(eF, dirOf(aF[1]), L.fore);
  const kB = step(hpB, dirOf(lB[0]), L.thigh);
  const fB = step(kB, dirOf(lB[1]), L.shin);
  const kF = step(hpF, dirOf(lF[0]), L.thigh);
  const fF = step(kF, dirOf(lF[1]), L.shin);

  // Shoes point forward from the shin unless the pose fixes them
  const toe = (key: "toesB" | "toesF", shin: number, shinA: number, shinB: number) =>
    a[key] === undefined && b[key] === undefined
      ? shin - 90
      : lerp(a[key] ?? shinA - 90, b[key] ?? shinB - 90, s);
  const toeB = toe("toesB", lB[1], a.lB[1], b.lB[1]);
  const toeF = toe("toesF", lF[1], a.lF[1], b.lF[1]);

  const pts = { head, neck, hip, shB, shF, eB, hB, eF, hF, hpB, hpF, kB, fB, kF, fF };

  // Place the body: keep the pinned joint still, or stand the lowest foot on the floor
  let off: Pt;
  if (m.pin) {
    const j = pts[m.pin.joint];
    off = [m.pin.at[0] - j[0], m.pin.at[1] - j[1]];
  } else {
    const lift = lerp(a.lift ?? 0, b.lift ?? 0, s);
    off = [lerp(a.x ?? 60, b.x ?? 60, s), FOOT_Y - Math.max(fB[1], fF[1]) - lift];
  }

  const placed = {} as Record<PtKey, Pt>;
  for (const k of Object.keys(pts) as PtKey[]) placed[k] = [pts[k][0] + off[0], pts[k][1] + off[1]];
  return { ...placed, toeB, toeF, headRot: headA + 90 };
}

const FRAMES = 24;
const frameCache = new Map<MoveId, Frame[]>();

// One full rep: start -> end -> start, eased so it slows at each end.
function framesFor(id: MoveId): Frame[] {
  let f = frameCache.get(id);
  if (!f) {
    f = Array.from({ length: FRAMES + 1 }, (_, k) =>
      solve(moves[id], (1 - Math.cos((2 * Math.PI * k) / FRAMES)) / 2),
    );
    frameCache.set(id, f);
  }
  return f;
}

// ---------- drawing ----------

const C = {
  bg: "#ecfdf5",
  ground: "#a7f3d0",
  mat: "#6ee7b7",
  skin: "#f2c29b",
  skinBack: "#d99f78",
  hair: "#1f2937",
  shirt: "#10b981",
  shirtBack: "#047857",
  pants: "#475569",
  pantsBack: "#1e293b",
  shoe: "#0f172a",
  metal: "#334155",
  wood: "#b45309",
};

type Ctx = { base: Frame; frames: Frame[] | null; dur: number };

const fmt = (n: number) => n.toFixed(1);

function Anim({ ctx, attr, get }: { ctx: Ctx; attr: string; get: (f: Frame) => number }) {
  if (!ctx.frames) return null;
  const vals = ctx.frames.map(get);
  if (vals.every((v) => Math.abs(v - vals[0]) < 0.05)) return null;
  return (
    <animate
      attributeName={attr}
      values={vals.map(fmt).join(";")}
      dur={`${ctx.dur}s`}
      repeatCount="indefinite"
    />
  );
}

function Bone({
  ctx,
  from,
  to,
  color,
  width,
}: {
  ctx: Ctx;
  from: PtKey;
  to: PtKey;
  color: string;
  width: number;
}) {
  const { base } = ctx;
  return (
    <line
      x1={fmt(base[from][0])}
      y1={fmt(base[from][1])}
      x2={fmt(base[to][0])}
      y2={fmt(base[to][1])}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
    >
      <Anim ctx={ctx} attr="x1" get={(f) => f[from][0]} />
      <Anim ctx={ctx} attr="y1" get={(f) => f[from][1]} />
      <Anim ctx={ctx} attr="x2" get={(f) => f[to][0]} />
      <Anim ctx={ctx} attr="y2" get={(f) => f[to][1]} />
    </line>
  );
}

// A group that follows one joint, and can turn with it (head, hands, shoes, held props).
function Follow({
  ctx,
  at,
  turn,
  children,
}: {
  ctx: Ctx;
  at: PtKey;
  turn?: (f: Frame) => number;
  children: ReactNode;
}) {
  const { base, frames, dur } = ctx;
  const moves = frames?.some(
    (f) => Math.abs(f[at][0] - base[at][0]) + Math.abs(f[at][1] - base[at][1]) > 0.05,
  );
  const turns = turn && frames?.some((f) => Math.abs(turn(f) - turn(base)) > 0.5);
  return (
    <g transform={`translate(${fmt(base[at][0])} ${fmt(base[at][1])})`}>
      {moves && frames && (
        <animateTransform
          attributeName="transform"
          type="translate"
          values={frames.map((f) => `${fmt(f[at][0])} ${fmt(f[at][1])}`).join(";")}
          dur={`${dur}s`}
          repeatCount="indefinite"
        />
      )}
      <g transform={turn ? `rotate(${fmt(turn(base))})` : undefined}>
        {turns && frames && turn && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={frames.map((f) => fmt(turn(f))).join(";")}
            dur={`${dur}s`}
            repeatCount="indefinite"
          />
        )}
        {children}
      </g>
    </g>
  );
}

function Head({ front }: { front: boolean }) {
  return (
    <>
      <circle r={7} fill={C.skin} />
      {front ? (
        <>
          <path d="M-7 -1 A7 7 0 0 1 7 -1 Q0 -4.5 -7 -1Z" fill={C.hair} />
          <circle cx={-2.5} cy={0} r={0.9} fill={C.hair} />
          <circle cx={2.5} cy={0} r={0.9} fill={C.hair} />
          <path
            d="M-2.3 2.8 Q0 4.6 2.3 2.8"
            stroke={C.hair}
            strokeWidth={0.9}
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path d="M-7 0.5 A7 7 0 0 1 6.2 -3 Q1 -3.6 -3.2 1.8 Z" fill={C.hair} />
          <circle cx={-1.6} cy={0.6} r={1.6} fill={C.skinBack} />
          <circle cx={3.2} cy={-0.4} r={0.9} fill={C.hair} />
          <path
            d="M2.6 2.9 Q4.2 4 5.6 2.6"
            stroke={C.hair}
            strokeWidth={0.9}
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </>
  );
}

function Shoe({ front, back }: { front: boolean; back?: boolean }) {
  return front ? (
    <ellipse rx={3.8} ry={2.5} fill={C.shoe} opacity={back ? 0.85 : 1} />
  ) : (
    <ellipse cx={2} rx={4.4} ry={2.5} fill={C.shoe} opacity={back ? 0.85 : 1} />
  );
}

function Dumbbell({ flat }: { flat: boolean }) {
  return flat ? (
    <g>
      <line x1={-6} y1={0} x2={6} y2={0} stroke={C.metal} strokeWidth={1.6} strokeLinecap="round" />
      <rect x={-8} y={-3} width={3} height={6} rx={1} fill={C.metal} />
      <rect x={5} y={-3} width={3} height={6} rx={1} fill={C.metal} />
    </g>
  ) : (
    <g>
      <circle r={4} fill={C.metal} />
      <circle r={1.6} fill="#64748b" />
    </g>
  );
}

function Scenery({ props }: { props: Prop[] }) {
  return (
    <>
      {props.includes("mat") && (
        <rect x={8} y={88.5} width={104} height={2.5} rx={1.25} fill={C.mat} />
      )}
      {props.includes("chair") && (
        <g fill="none" stroke={C.wood} strokeWidth={2.5} strokeLinecap="round">
          <line x1={24} y1={36} x2={24} y2={89} />
          <line x1={24} y1={63} x2={48} y2={63} />
          <line x1={46} y1={63} x2={46} y2={89} />
        </g>
      )}
      {props.includes("box") && (
        <rect x={62} y={79} width={42} height={10.5} rx={2} fill={C.wood} />
      )}
      {props.includes("scale") && (
        <g>
          <rect x={44} y={85.5} width={32} height={4} rx={2} fill="#94a3b8" />
          <rect x={56} y={86.4} width={8} height={2.2} rx={0.8} fill="#0f172a" />
          <rect x={57} y={86.9} width={6} height={1.2} rx={0.5} fill="#34d399">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
          </rect>
        </g>
      )}
    </>
  );
}

const reducedQuery = "(prefers-reduced-motion: reduce)";
function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(reducedQuery);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );
}

/**
 * Cartoon picture of a move. `animate` loops one smooth rep;
 * without it you get a still of the key position.
 */
export function MoveArt({
  move,
  animate = false,
  at,
  className = "",
  label,
}: {
  move: MoveId;
  animate?: boolean;
  /** Show a still at this point of the rep (0 = start pose, 1 = end pose). */
  at?: number;
  className?: string;
  label?: string;
}) {
  const reduced = useReducedMotion();
  const m = moves[move];
  const live = animate && !reduced && at === undefined;
  const frames = live ? framesFor(move) : null;
  const base = frames ? frames[0] : solve(m, at ?? m.still ?? 1);
  const ctx: Ctx = { base, frames, dur: m.dur };
  const props = m.props ?? [];
  const front = m.view === "front";
  const floor = props.includes("mat");

  return (
    <svg viewBox="0 0 120 100" className={className} role="img" aria-label={label ?? move}>
      <rect width={120} height={100} fill={C.bg} />
      <line
        x1={4}
        y1={GROUND_Y}
        x2={116}
        y2={GROUND_Y}
        stroke={C.ground}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {!floor && (
        <ellipse
          cx={fmt(base.hip[0])}
          cy={GROUND_Y}
          rx={16}
          ry={1.8}
          fill="#064e3b"
          opacity={0.1}
        />
      )}
      <Scenery props={props} />

      {/* back leg + back arm (darker, behind the body) */}
      <Bone ctx={ctx} from="hpB" to="kB" color={C.pantsBack} width={7} />
      <Bone ctx={ctx} from="kB" to="fB" color={C.pantsBack} width={6.4} />
      <Follow ctx={ctx} at="fB" turn={front ? undefined : (f) => f.toeB}>
        <Shoe front={front} back />
      </Follow>
      <Bone ctx={ctx} from="shB" to="eB" color={C.shirtBack} width={6} />
      <Bone ctx={ctx} from="eB" to="hB" color={C.skinBack} width={4.6} />
      <Follow ctx={ctx} at="hB">
        <circle r={2.7} fill={C.skinBack} />
        {props.includes("dumbbells") && <Dumbbell flat />}
      </Follow>

      {/* neck, body, hips */}
      <Bone ctx={ctx} from="neck" to="head" color={C.skin} width={4} />
      <Bone ctx={ctx} from="neck" to="hip" color={C.shirt} width={front ? 14 : 11.5} />
      {front ? (
        <Bone ctx={ctx} from="hpB" to="hpF" color={C.pants} width={9} />
      ) : (
        <Follow ctx={ctx} at="hip">
          <circle r={5.6} fill={C.pants} />
        </Follow>
      )}

      {/* front leg + front arm */}
      <Bone ctx={ctx} from="hpF" to="kF" color={C.pants} width={7} />
      <Bone ctx={ctx} from="kF" to="fF" color={C.pants} width={6.4} />
      <Follow ctx={ctx} at="fF" turn={front ? undefined : (f) => f.toeF}>
        <Shoe front={front} />
      </Follow>
      <Bone ctx={ctx} from="shF" to="eF" color={C.shirt} width={6} />
      <Bone ctx={ctx} from="eF" to="hF" color={C.skin} width={4.6} />

      <Follow ctx={ctx} at="head" turn={(f) => f.headRot}>
        <Head front={front} />
      </Follow>

      <Follow ctx={ctx} at="hF">
        {props.includes("dumbbell") && <Dumbbell flat={false} />}
        {props.includes("dumbbells") && <Dumbbell flat />}
        <circle r={2.7} fill={C.skin} />
      </Follow>
    </svg>
  );
}
