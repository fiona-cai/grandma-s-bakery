"use client";

import {
  binFor,
  campusCheck,
  CAMPUS,
  localShare,
  menuPrice,
} from "@/lib/desk";
import { getIngredient } from "@/lib/ingredients";
import { recipeCost } from "@/lib/recipes";
import { useShop } from "@/lib/store";
import {
  hikedPrice,
  optimizePurchasing,
  purchasingTotals,
  SUPPLIER_MAP,
} from "@/lib/suppliers";
import type { PurchaseLine } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

const ACTION_COPY: Record<PurchaseLine["action"], string> = {
  drop: "Stop buying",
  switch: "Switch source",
  add: "Add to list",
  keep: "Keep",
};

export default function SuppliesPage() {
  const { fotm, campusYes, takeCampus } = useShop();
  const [hike, setHike] = useState(25);
  const lines = useMemo(() => optimizePurchasing(fotm, hike), [fotm, hike]);
  const totals = purchasingTotals(lines, hike);
  const visible = lines.filter((line) => line.action !== "keep" || line.needed);
  const campus = campusCheck(fotm, lines);
  const local = localShare(lines);
  const baseCost = fotm ? recipeCost(fotm) : 0;
  const todayPrice = fotm ? menuPrice(fotm, hike) : 0;
  const yesterdayPrice = fotm ? menuPrice(fotm, 0) : 0;

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          Morning list
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight">
          One list: what to buy, who still has it, and whether campus can have forty by four.
        </h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          Habit, local growers, the cream hike, the jars that spoil Thursday, and
          the Union&apos;s last-minute tray all read from the crowned parfait.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Habitual week
          </p>
          <p className="mt-1 font-display text-3xl">${totals.habitual.toFixed(2)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            This list
          </p>
          <p className="mt-1 font-display text-3xl">${totals.optimized.toFixed(2)}</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {local}% local or in-house · ${totals.saved.toFixed(2)} left in the till
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Cream hike
          </p>
          <p className="mt-1 font-display text-3xl">{hike}%</p>
          <input
            type="range"
            min={0}
            max={80}
            value={hike}
            onChange={(event) => setHike(Number(event.target.value))}
            className="mt-3 w-full accent-[var(--maple)]"
            aria-label="Cream price hike"
          />
          {fotm ? (
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Glass costs ${baseCost.toFixed(2)}. Charge ${todayPrice.toFixed(2)}
              {todayPrice > yesterdayPrice
                ? ` — up from $${yesterdayPrice.toFixed(2)} so the hike does not eat October.`
                : " — no need to touch the board yet."}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Move the slider to see who still sells cream when Meadowdale raises it.
            </p>
          )}
        </div>
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {CAMPUS.who} · {CAMPUS.event}
            </p>
            <h2 className="mt-1 font-display text-2xl">
              {CAMPUS.qty} parfaits by {CAMPUS.by}
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{campus.note}</p>
          </div>
          <button
            type="button"
            onClick={() => takeCampus(!campusYes)}
            className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--paper)]"
          >
            {campusYes ? "On the slate" : campus.yes ? "Say yes" : "Say yes, call the grower"}
          </button>
        </div>
      </section>

      <section className="card p-5">
        {fotm ? (
          <p className="text-sm text-[var(--ink-soft)]">
            Shopping for <span className="font-medium text-[var(--ink)]">{fotm.name}</span>.
            Local names stay on the list when wholesale cream jumps.
          </p>
        ) : (
          <p className="text-sm text-[var(--ink-soft)]">
            No flavor yet — this is still a cleanup of duplicates and pumpkin she
            bought to look like next door.{" "}
            <Link href="/flavor" className="underline underline-offset-2">
              Crown a parfait
            </Link>
            .
          </p>
        )}
      </section>

      <section className="space-y-3">
        {visible.map((line) => {
          const ingredient = getIngredient(line.ingredientId);
          const chosen = line.chosenOffer
            ? SUPPLIER_MAP[line.chosenOffer.supplierId]
            : null;
          const old = line.habitualOffer
            ? SUPPLIER_MAP[line.habitualOffer.supplierId]
            : null;
          const bin = binFor(line.ingredientId);
          const chosenPrice = line.chosenOffer
            ? hikedPrice(line.chosenOffer, hike)
            : null;
          const oldPrice = line.habitualOffer
            ? hikedPrice(line.habitualOffer, hike)
            : null;
          return (
            <article key={line.ingredientId} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    {ACTION_COPY[line.action]}
                    {chosen ? ` · ${chosen.kind === "wholesale" ? "wholesale" : chosen.kind}, ${chosen.minutesAway} min` : ""}
                  </p>
                  <h2 className="mt-1 font-display text-2xl">{ingredient.name}</h2>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{line.reason}</p>
                </div>
                <FlagRow line={line} />
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl bg-[var(--cream)] p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    Habit
                  </p>
                  {old && oldPrice !== null ? (
                    <p className="mt-1">
                      {old.name} · ${oldPrice.toFixed(2)} / {line.habitualOffer?.unit}
                    </p>
                  ) : (
                    <p className="mt-1">Not on the morning call.</p>
                  )}
                </div>
                <div className="rounded-2xl bg-[var(--cream)] p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    Tomorrow
                  </p>
                  {chosen && chosenPrice !== null ? (
                    <p className="mt-1">
                      {chosen.name} · ${chosenPrice.toFixed(2)} / {line.chosenOffer?.unit}
                    </p>
                  ) : (
                    <p className="mt-1">Leave it off the list.</p>
                  )}
                </div>
                <div className="rounded-2xl bg-[var(--cream)] p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    On the shelf
                  </p>
                  <p className="mt-1">
                    {bin.onHand} on hand · spoils in {bin.spoilsIn || "—"} days · last paid{" "}
                    {bin.lastPaid}
                    {bin.bill ? ` · ${bin.bill}` : ""}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function FlagRow({ line }: { line: PurchaseLine }) {
  const flags = [...(line.habitualOffer?.flags ?? [])];
  const unique = [...new Set(flags)];
  if (unique.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {unique.map((flag) => (
        <span
          key={flag}
          className="rounded-full bg-[var(--cream)] px-2 py-1 text-[10px] uppercase tracking-[0.14em]"
        >
          {flag.replace("-", " ")}
        </span>
      ))}
    </div>
  );
}
