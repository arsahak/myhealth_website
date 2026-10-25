"use client";

// Cartoon plate for a meal option: each food is a small drawing placed on a plate.
// Drinks (tea, milk) sit beside the plate.

import { useSyncExternalStore, type ReactNode } from "react";
import type { FoodKind, MealOption } from "./lib/types";

const P = {
  bg: "#fff7ed",
  table: "#fed7aa",
  plate: "#ffffff",
  rim: "#e7e5e4",
  bowl: "#f1f5f9",
  bowlRim: "#cbd5e1",
  gravy: "#fdba74",
};

function Bowl({ fill, children }: { fill: string; children?: ReactNode }) {
  return (
    <g>
      <ellipse rx={13} ry={9} fill={P.bowl} stroke={P.bowlRim} strokeWidth={1} />
      <ellipse rx={10.5} ry={6.6} cy={-0.6} fill={fill} />
      {children}
    </g>
  );
}

const sprites: Record<FoodKind, ReactNode> = {
  rice: (
    <g>
      <ellipse rx={13} ry={8.5} fill="#ffffff" stroke="#e5e7eb" />
      {[
        [-6, -2],
        [-1, -4],
        [4, -1],
        [8, 2],
        [-3, 3],
        [2, 4],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={1.7} ry={0.8} fill="#e5e7eb" />
      ))}
    </g>
  ),
  polao: (
    <g>
      <ellipse rx={13} ry={8.5} fill="#fde68a" stroke="#fcd34d" />
      {[
        [-6, -2, "#f97316"],
        [-1, -4, "#16a34a"],
        [4, -1, "#f97316"],
        [8, 2, "#16a34a"],
        [-3, 3, "#b45309"],
        [3, 4, "#16a34a"],
      ].map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r={1.2} fill={c as string} />
      ))}
    </g>
  ),
  ruti: (
    <g>
      <circle cx={4} cy={-3} r={11} fill="#d6a96b" />
      <circle r={11} fill="#ebc791" stroke="#d6a96b" />
      {[
        [-4, -3],
        [3, 2],
        [-2, 5],
        [5, -5],
        [0, -1],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.3} fill="#b7793a" opacity={0.55} />
      ))}
    </g>
  ),
  egg: (
    <g>
      <ellipse cx={-6} rx={6.5} ry={5} fill="#ffffff" stroke="#e5e7eb" />
      <circle cx={-6} r={2.8} fill="#f59e0b" />
      <ellipse cx={6} cy={1} rx={6.5} ry={5} fill="#ffffff" stroke="#e5e7eb" />
      <circle cx={6} cy={1} r={2.8} fill="#f59e0b" />
    </g>
  ),
  sabji: (
    <g>
      {[
        [-9, -5, "#16a34a"],
        [-2, -7, "#f97316"],
        [5, -3, "#84cc16"],
        [-6, 2, "#eab308"],
        [1, 2, "#16a34a"],
        [7, 4, "#f97316"],
      ].map(([x, y, c], i) => (
        <rect
          key={i}
          x={x as number}
          y={y as number}
          width={6.5}
          height={6.5}
          rx={1.8}
          fill={c as string}
        />
      ))}
    </g>
  ),
  dal: (
    <Bowl fill="#facc15">
      <circle cx={-3} cy={-1} r={0.9} fill="#b45309" />
      <circle cx={3} cy={0} r={0.9} fill="#16a34a" />
      <circle cx={0} cy={-3} r={0.9} fill="#b45309" />
    </Bowl>
  ),
  fish: (
    <g>
      <ellipse rx={14} ry={9} fill={P.gravy} opacity={0.75} />
      <path
        d="M-9 0 Q-4 -6 5 -4 L9 -7 L9 7 L5 4 Q-4 6 -9 0Z"
        fill="#fb923c"
        stroke="#c2410c"
        strokeWidth={0.8}
      />
      <circle cx={-5} cy={-1} r={1} fill="#7c2d12" />
    </g>
  ),
  chicken: (
    <g>
      <ellipse rx={14} ry={9} fill={P.gravy} opacity={0.75} />
      <g transform="rotate(-20)">
        <line x1={2} y1={0} x2={11} y2={0} stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={11.5} cy={-1.3} r={1.5} fill="#fff" />
        <circle cx={11.5} cy={1.3} r={1.5} fill="#fff" />
        <ellipse cx={-2} rx={7} ry={5} fill="#c2410c" />
      </g>
      <ellipse cx={-6} cy={4} rx={4} ry={3} fill="#9a3412" />
    </g>
  ),
  beef: (
    <g>
      <ellipse rx={14} ry={9} fill="#d97706" opacity={0.45} />
      {[
        [-8, -4],
        [-1, -5],
        [5, -1],
        [-5, 2],
        [2, 3],
      ].map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={6}
          height={5}
          rx={2}
          fill={i % 2 ? "#92400e" : "#7c2d12"}
        />
      ))}
    </g>
  ),
  salad: (
    <g>
      <ellipse cx={-5} cy={-2} rx={7} ry={4} fill="#22c55e" transform="rotate(-25 -5 -2)" />
      <ellipse cx={5} cy={-3} rx={6} ry={3.5} fill="#16a34a" transform="rotate(20 5 -3)" />
      <circle cx={-3} cy={4} r={3.6} fill="#ef4444" />
      <circle cx={-4} cy={3} r={1} fill="#fecaca" />
      <circle cx={5} cy={4} r={3.6} fill="#bbf7d0" stroke="#15803d" strokeWidth={1} />
      <circle cx={1} cy={-6} r={3} fill="none" stroke="#c084fc" strokeWidth={1} />
    </g>
  ),
  cucumber: (
    <g>
      {[
        [-6, 0],
        [0, -4],
        [6, 1],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={5} fill="#bbf7d0" stroke="#15803d" strokeWidth={1.4} />
          <circle cx={x} cy={y} r={1.6} fill="#86efac" />
        </g>
      ))}
    </g>
  ),
  carrot: (
    <g stroke="#f97316" strokeWidth={3.2} strokeLinecap="round">
      <line x1={-9} y1={-4} x2={7} y2={-7} />
      <line x1={-8} y1={1} x2={9} y2={-1} />
      <line x1={-7} y1={6} x2={8} y2={5} />
    </g>
  ),
  oats: (
    <Bowl fill="#e7d3a8">
      <circle cx={-4} cy={-1} r={2.6} fill="#fef08a" stroke="#eab308" strokeWidth={0.8} />
      <circle cx={2} cy={-2} r={2.6} fill="#fef08a" stroke="#eab308" strokeWidth={0.8} />
      <circle cx={5} cy={1.5} r={2.6} fill="#fef08a" stroke="#eab308" strokeWidth={0.8} />
    </Bowl>
  ),
  milk: (
    <g>
      <path d="M-6 -11 L6 -11 L4.5 11 L-4.5 11 Z" fill="#ffffff" stroke="#cbd5e1" />
      <path d="M-5.4 -6 L5.4 -6 L4.5 11 L-4.5 11 Z" fill="#f8fafc" />
    </g>
  ),
  banana: (
    <g>
      <path
        d="M-11 -3 Q0 12 12 -4 Q10 -1 8 0 Q0 6 -8 -2 Z"
        fill="#facc15"
        stroke="#ca8a04"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <circle cx={-10.5} cy={-3} r={1} fill="#713f12" />
    </g>
  ),
  apple: (
    <g>
      <circle r={9} fill="#ef4444" />
      <ellipse cx={-3} cy={-3} rx={2.2} ry={3} fill="#fecaca" opacity={0.7} />
      <line
        x1={0}
        y1={-9}
        x2={1}
        y2={-12}
        stroke="#78350f"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <ellipse cx={4} cy={-11} rx={3} ry={1.6} fill="#16a34a" transform="rotate(-20 4 -11)" />
    </g>
  ),
  papaya: (
    <g>
      <path d="M-12 4 Q0 -14 12 4 Z" fill="#fb923c" stroke="#ea580c" strokeWidth={1} />
      <path d="M-12 4 Q0 -14 12 4" fill="none" stroke="#84cc16" strokeWidth={2} />
      {[-4, -1, 2, 5].map((x, i) => (
        <circle key={i} cx={x} cy={-1 + (i % 2)} r={1} fill="#1f2937" />
      ))}
    </g>
  ),
  doi: (
    <Bowl fill="#ffffff">
      <circle cx={-3} cy={-1} r={0.7} fill="#a16207" />
      <circle cx={2} cy={-2} r={0.7} fill="#a16207" />
    </Bowl>
  ),
  chira: (
    <Bowl fill="#ffffff">
      {[
        [-5, -2],
        [0, -3],
        [4, -1],
        [-2, 1],
        [3, 2],
      ].map(([x, y], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx={2.2}
          ry={1.2}
          fill="#fef3c7"
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      ))}
    </Bowl>
  ),
  tea: (
    <g>
      <path d="M9 -3 Q15 -3 14 3 Q13 7 8 5" fill="none" stroke="#cbd5e1" strokeWidth={2} />
      <path d="M-9 -7 L9 -7 L7 8 Q0 11 -7 8 Z" fill="#ffffff" stroke="#cbd5e1" />
      <ellipse cy={-7} rx={9} ry={2.4} fill="#bef264" stroke="#cbd5e1" />
    </g>
  ),
  nuts: (
    <g>
      {[
        [-6, -3, -20],
        [0, -5, 15],
        [6, -2, -10],
        [-3, 3, 30],
        [4, 4, 0],
      ].map(([x, y, r], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx={3.4}
          ry={2.2}
          fill="#b45309"
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
    </g>
  ),
  chola: (
    <Bowl fill="#fde68a">
      {[
        [-5, -2],
        [-1, -3],
        [3, -2],
        [6, 0],
        [-3, 1],
        [1, 1],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2} fill="#a16207" />
      ))}
    </Bowl>
  ),
  muri: (
    <g>
      {[
        [-8, -2],
        [-4, -5],
        [0, -2],
        [4, -5],
        [8, -1],
        [-5, 2],
        [2, 3],
        [6, 4],
        [-1, 6],
      ].map(([x, y], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx={2.3}
          ry={1.4}
          fill="#fffbeb"
          stroke="#e7d3a8"
          strokeWidth={0.6}
        />
      ))}
      <line
        x1={-6}
        y1={6}
        x2={-1}
        y2={2}
        stroke="#16a34a"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <circle cx={5} cy={-1} r={1.3} fill="#ef4444" />
    </g>
  ),
  soup: (
    <Bowl fill="#fbbf24">
      <circle cx={-4} cy={-1} r={1.4} fill="#16a34a" />
      <circle cx={1} cy={-2} r={1.4} fill="#f97316" />
      <rect x={3} y={0} width={3.4} height={2.6} rx={0.8} fill="#fef3c7" />
    </Bowl>
  ),
};

const DRINKS: FoodKind[] = ["tea", "milk"];
const HOT: FoodKind[] = ["rice", "polao", "dal", "fish", "chicken", "beef", "soup", "oats", "tea"];

// Where foods sit on the plate, by how many there are.
const LAYOUT: [number, number, number][][] = [
  [],
  [[60, 52, 1.6]],
  [
    [46, 52, 1.15],
    [75, 52, 1.15],
  ],
  [
    [45, 42, 1.05],
    [76, 42, 1.05],
    [61, 67, 1.05],
  ],
  [
    [45, 39, 0.95],
    [76, 39, 0.95],
    [45, 66, 0.95],
    [76, 66, 0.95],
  ],
];

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

function Steam() {
  return (
    <g fill="none" stroke="#a8a29e" strokeWidth={1.4} strokeLinecap="round">
      {[-6, 0, 6].map((x, i) => (
        <path key={x} d={`M${x} 0 q-2.5 -4 0 -8 q2.5 -4 0 -8`} opacity={0}>
          <animate
            attributeName="opacity"
            values="0;0.7;0"
            dur="2.4s"
            begin={`${i * 0.8}s`}
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 2;0 -4"
            dur="2.4s"
            begin={`${i * 0.8}s`}
            repeatCount="indefinite"
          />
        </path>
      ))}
    </g>
  );
}

/** Cartoon plate for a meal option. `animate` adds rising steam on hot food. */
export function FoodArt({
  option,
  animate = false,
  compact = false,
  className = "",
}: {
  option: MealOption;
  animate?: boolean;
  /** Zoom in on the plate (for small thumbnails). */
  compact?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const kinds = [...new Set(option.items.map((i) => i.kind))];
  const drinks = kinds.filter((k) => DRINKS.includes(k));
  const foods = kinds.filter((k) => !DRINKS.includes(k)).slice(0, 4);
  const spots = LAYOUT[foods.length] ?? [];
  const hot = foods.some((k) => HOT.includes(k)) || drinks.includes("tea");

  return (
    <svg
      viewBox={compact ? "16 6 100 90" : "0 0 120 100"}
      className={className}
      role="img"
      aria-label={option.name}
    >
      <rect width={120} height={100} fill={P.bg} />
      <ellipse cx={60} cy={56} rx={44} ry={40} fill={P.table} opacity={0.35} />
      {/* plate */}
      <circle cx={60} cy={52} r={40} fill={P.plate} stroke={P.rim} strokeWidth={1.5} />
      <circle cx={60} cy={52} r={33} fill="none" stroke={P.rim} strokeWidth={0.8} />

      {foods.map((k, i) => {
        const [x, y, s] = spots[i];
        return (
          <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
            {sprites[k]}
          </g>
        );
      })}

      {drinks.map((k, i) => (
        <g key={k} transform={`translate(${104} ${24 + i * 30}) scale(0.85)`}>
          {sprites[k]}
        </g>
      ))}

      {animate && !reduced && hot && (
        <g transform="translate(60 14)">
          <Steam />
        </g>
      )}
    </svg>
  );
}
