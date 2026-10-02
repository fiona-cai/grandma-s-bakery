import { mulberry32, seedFrom } from "@/lib/rng";
import type { Layer, Parfait, PantryItem } from "@/lib/types";
import { useId } from "react";

interface Ingredient {
  id: string;
  name: string;
  color: string;
  layer?: Layer;
}

const SIZES = { xs: 52, sm: 76, md: 112, lg: 184 } as const;

// Layer thickness inside the bowl, bottom to top. Garnish sits above the rim.
const HEIGHTS: Record<Exclude<Layer, "garnish">, number> = {
  base: 28,
  cream: 23,
  fruit: 20,
  crunch: 14,
  drizzle: 9,
};

const BOWL =
  "M12 50 C12 50 13 118 30 140 C38 151 48 156 60 156 C72 156 82 151 90 140 C107 118 108 50 108 50 Z";
const BOTTOM = 158;
// Room between the bowl floor and just under the rim.
const FILL_ROOM = 100;

export function ParfaitGlass({
  parfait,
  pantry,
  size = "md",
  animate = true,
  spoon = false,
}: {
  parfait: Parfait;
  pantry: PantryItem[];
  size?: keyof typeof SIZES;
  animate?: boolean;
  spoon?: boolean;
}) {
  const rawId = useId();
  const clipId = `bowl-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const ingredients = parfait.ingredients
    .map((line) => pantry.find((item) => item.id === line.itemId))
    .filter((item): item is PantryItem => Boolean(item));
  const filling = ingredients.filter((ingredient) => ingredient.layer !== "garnish");
  const garnish = ingredients.find((ingredient) => ingredient.layer === "garnish");
  const cream = ingredients.find((ingredient) => ingredient.layer === "cream");

  // squeeze layers when a recipe has more than the bowl can show
  const natural = filling.reduce(
    (sum, ingredient) => sum + (HEIGHTS[ingredient.layer as keyof typeof HEIGHTS] ?? 16),
    0,
  );
  const squeeze = natural > FILL_ROOM ? FILL_ROOM / natural : 1;

  // compute each layer's top edge, stacking upward from the bottom of the bowl
  const placed = filling.reduce<{ ingredient: Ingredient; top: number; height: number }[]>(
    (stack, ingredient) => {
      const height = (HEIGHTS[ingredient.layer as keyof typeof HEIGHTS] ?? 16) * squeeze;
      const below = stack.at(-1)?.top ?? 156;
      return [...stack, { ingredient, top: below - height, height }];
    },
    [],
  );
  const fillTop = placed.at(-1)?.top ?? 156;
  const width = SIZES[size];

  return (
    <svg
      viewBox="0 0 120 200"
      width={width}
      height={(width * 200) / 120}
      role="img"
      aria-label={`${parfait.name}: ${ingredients.map((i) => i.name).join(", ") || "empty glass"}`}
      className="mx-auto block shrink-0 overflow-visible"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={BOWL} />
        </clipPath>
      </defs>

      {/* soft floor shadow */}
      <ellipse cx="60" cy="194" rx="38" ry="5" fill="rgba(74,44,29,0.12)" />

      {spoon ? (
        <g className={animate ? "layer-drop" : undefined} style={{ animationDelay: "900ms" }}>
          <g transform="rotate(14 83 60)">
            <rect x="80.5" y="4" width="5" height="86" rx="2.5" fill="#2b8a84" />
            <ellipse cx="83" cy="4" rx="5.5" ry="8" fill="#2b8a84" />
            <ellipse cx="81.5" cy="1.5" rx="1.6" ry="3" fill="#fff" opacity="0.45" />
          </g>
        </g>
      ) : null}

      {/* stem + foot */}
      <path d="M54 154 C55 168 53 180 50 187 L70 187 C67 180 65 168 66 154 Z" fill="#e7f4f1" stroke="rgba(74,44,29,0.28)" strokeWidth="1.6" />
      <ellipse cx="60" cy="189" rx="30" ry="6.5" fill="#e7f4f1" stroke="rgba(74,44,29,0.28)" strokeWidth="1.6" />

      {/* glass back */}
      <path d={BOWL} fill="rgba(216,239,234,0.55)" />

      <g clipPath={`url(#${clipId})`}>
        {/* draw from top layer down so each lower wavy edge overlaps the one above */}
        {[...placed].reverse().map(({ ingredient, top, height }, reverseIndex) => {
          const index = placed.length - 1 - reverseIndex;
          return (
            <g
              key={`${ingredient.id}-${index}`}
              className={animate ? "layer-drop" : undefined}
              style={{ animationDelay: `${index * 110}ms` }}
            >
              <path d={wavyBlock(top, ingredient.id)} fill={ingredient.color} />
              <Texture ingredient={ingredient} top={top} height={height} />
            </g>
          );
        })}
      </g>

      {/* whipped topper + garnish */}
      <g
        className={animate ? "layer-drop" : undefined}
        style={{ animationDelay: `${placed.length * 110}ms` }}
      >
        <Topper top={fillTop} creamColor={cream?.color ?? "#fffaf3"} garnish={garnish} />
      </g>

      {/* glass front: outline + shine */}
      <path d={BOWL} fill="none" stroke="rgba(74,44,29,0.32)" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="60" cy="50" rx="48" ry="4.5" fill="none" stroke="rgba(74,44,29,0.3)" strokeWidth="1.8" />
      <path d="M22 62 C22 92 26 116 34 132" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="4" strokeLinecap="round" />
      <path d="M96 66 C96 80 95 92 93 100" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function wavyBlock(top: number, seedKey: string) {
  const random = mulberry32(seedFrom(seedKey));
  const amp = 2 + random() * 1.5;
  const period = 20;
  const phase = random() * period;
  let d = `M0 ${BOTTOM} L0 ${top}`;
  for (let x = -phase; x < 120; x += period) {
    d += ` Q${x + period / 4} ${top - amp} ${x + period / 2} ${top} T${x + period} ${top}`;
  }
  d += ` L120 ${top} L120 ${BOTTOM} Z`;
  return d;
}

function Texture({
  ingredient,
  top,
  height,
}: {
  ingredient: Ingredient;
  top: number;
  height: number;
}) {
  const random = mulberry32(seedFrom(`${ingredient.id}-texture`));
  const dark = shade(ingredient.color, -0.22);
  const light = shade(ingredient.color, 0.35);
  const inY = (pad = 3) => top + pad + random() * Math.max(1, height - pad * 2);
  const inX = () => 14 + random() * 92;

  switch (ingredient.layer) {
    case "base":
      return (
        <g>
          {Array.from({ length: 22 }).map((_, i) => (
            <circle key={i} cx={inX()} cy={inY(4)} r={0.8 + random() * 1.4} fill={dark} opacity={0.55} />
          ))}
        </g>
      );
    case "cream":
      return (
        <g fill="none" stroke={light} strokeWidth="2" strokeLinecap="round" opacity={0.85}>
          {Array.from({ length: 4 }).map((_, i) => {
            const x = 18 + i * 22 + random() * 6;
            const y = inY(6);
            return <path key={i} d={`M${x} ${y} q6 -4 12 0`} />;
          })}
        </g>
      );
    case "fruit":
      return (
        <g>
          {Array.from({ length: 8 }).map((_, i) => {
            const x = 16 + i * 11.5 + random() * 4;
            const y = inY(5);
            const r = 3 + random() * 2.4;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={r} fill={dark} />
                <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill={light} opacity={0.7} />
              </g>
            );
          })}
        </g>
      );
    case "crunch":
      return (
        <g>
          {Array.from({ length: 26 }).map((_, i) => {
            const x = inX();
            const y = inY(2);
            const w = 2 + random() * 3;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={w}
                height={w * 0.7}
                rx={0.8}
                fill={random() > 0.5 ? dark : light}
                transform={`rotate(${random() * 90} ${x} ${y})`}
              />
            );
          })}
        </g>
      );
    case "drizzle":
      return (
        <g fill={ingredient.color}>
          {Array.from({ length: 6 }).map((_, i) => {
            const x = 18 + i * 16 + random() * 6;
            const len = 6 + random() * 10;
            return <rect key={i} x={x} y={top + height - 2} width="4" height={len} rx="2" />;
          })}
          <path d={`M10 ${top + 3} Q60 ${top + 6} 110 ${top + 2}`} stroke={light} strokeWidth="1.4" fill="none" opacity={0.6} />
        </g>
      );
    default:
      return null;
  }
}

function Topper({
  top,
  creamColor,
  garnish,
}: {
  top: number;
  creamColor: string;
  garnish?: Ingredient;
}) {
  // whipped dome, always light — tinted very slightly by the cream layer
  const whip = mix(creamColor, "#fffdf8", 0.75);
  const whipShade = shade(whip, -0.08);
  const peak = garnish?.id === "cream-dollop" ? 10 : 0;
  const y = Math.min(top, 62) - 5;

  return (
    <g>
      <ellipse cx="60" cy={y - 2} rx="40" ry="9" fill={whipShade} />
      <ellipse cx="60" cy={y - 6} rx="34" ry="10" fill={whip} />
      <ellipse cx="60" cy={y - 15} rx="24" ry="9" fill={whip} />
      <path
        d={`M46 ${y - 18} Q60 ${y - 38 - peak} 74 ${y - 18} Z`}
        fill={whip}
      />
      <path d={`M44 ${y - 8} q8 4 16 0 q8 -4 16 0`} fill="none" stroke={whipShade} strokeWidth="1.5" strokeLinecap="round" />
      {garnish ? <Garnish ingredient={garnish} y={y - 30 - peak} /> : null}
    </g>
  );
}

function Garnish({ ingredient, y }: { ingredient: Ingredient; y: number }) {
  const color = ingredient.color;
  switch (ingredient.id) {
    case "orange-peel":
      return (
        <path
          className="wobble"
          d={`M52 ${y + 4} c4 -10 14 -10 14 -2 c0 6 -8 6 -8 0 c0 -6 10 -8 14 -2`}
          fill="none"
          stroke={color}
          strokeWidth="3.4"
          strokeLinecap="round"
        />
      );
    case "sage":
      return (
        <g className="wobble">
          <ellipse cx="54" cy={y - 2} rx="5" ry="11" fill={color} transform={`rotate(-28 54 ${y + 6})`} />
          <ellipse cx="66" cy={y - 2} rx="5" ry="11" fill={shade(color, 0.12)} transform={`rotate(28 66 ${y + 6})`} />
          <path d={`M60 ${y + 8} L60 ${y - 2}`} stroke={shade(color, -0.3)} strokeWidth="1.5" />
        </g>
      );
    case "marigold":
      return (
        <g className="wobble">
          {Array.from({ length: 9 }).map((_, i) => {
            const angle = (i / 9) * Math.PI * 2;
            return (
              <circle
                key={i}
                cx={60 + Math.cos(angle) * 6}
                cy={y - 2 + Math.sin(angle) * 6}
                r="4.2"
                fill={i % 2 ? color : shade(color, 0.15)}
              />
            );
          })}
          <circle cx="60" cy={y - 2} r="3.6" fill={shade(color, -0.35)} />
        </g>
      );
    case "cinnamon-stick":
    case "cinnamon":
      return (
        <g className="wobble">
          <rect x="52" y={y - 16} width="6" height="26" rx="3" fill={color} transform={`rotate(-14 55 ${y})`} />
          <rect x="61" y={y - 18} width="6" height="28" rx="3" fill={shade(color, 0.12)} transform={`rotate(12 64 ${y})`} />
        </g>
      );
    case "cream-dollop":
      return (
        <g className="wobble">
          <path d={`M60 ${y + 6} q4 -10 10 -14`} stroke="#5a7a3a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="60" cy={y + 6} r="6" fill="#d9546a" />
          <circle cx="58" cy={y + 4} r="1.8" fill="#fff" opacity="0.7" />
        </g>
      );
    default:
      return <circle className="wobble" cx="60" cy={y} r="6" fill={color} />;
  }
}

/* ---- tiny color helpers (hex only) ---- */

function toRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b]
    .map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function shade(hex: string, amount: number) {
  const target = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  return toHex(toRgb(hex).map((c) => c + (target - c) * t) as [number, number, number]);
}

function mix(a: string, b: string, t: number) {
  const ra = toRgb(a);
  const rb = toRgb(b);
  return toHex(ra.map((c, i) => c + (rb[i]! - c) * t) as [number, number, number]);
}
