"use client";

import { getIngredient } from "@/lib/ingredients";
import { useShop } from "@/lib/store";
import {
  optimizePurchasing,
  purchasingTotals,
  SUPPLIER_MAP,
} from "@/lib/suppliers";
import type { PurchaseLine } from "@/lib/types";
import Link from "next/link";
import { useMemo } from "react";

const ACTION_COPY: Record<PurchaseLine["action"], string> = {
  drop: "Stop buying",
  switch: "Switch source",
  add: "Add to list",
  keep: "Keep",
};

export default function SuppliesPage() {
  const { fotm } = useShop();
  const lines = useMemo(() => optimizePurchasing(fotm), [fotm]);
  const totals = purchasingTotals(lines);
  const visible = lines.filter((line) => line.action !== "keep" || line.needed);

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          Morning list
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight">
          Buy what the parfait needs. Not what the habit remembers.
        </h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          Grandma still calls the same trusted people at dawn. The list below
          keeps those relationships and cuts the duplicates, the price-hiked
          cream, the sack granola, and anything that only existed to chase The
          Bakery.
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
            Optimized week
          </p>
          <p className="mt-1 font-display text-3xl">${totals.optimized.toFixed(2)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Left in the till
          </p>
          <p className="mt-1 font-display text-3xl">${totals.saved.toFixed(2)}</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {totals.dropped} dropped · {totals.switched} switched · {totals.added} added
          </p>
        </div>
      </section>

      <section className="card p-5">
        {fotm ? (
          <p className="text-sm text-[var(--ink-soft)]">
            Shopping for <span className="font-medium text-[var(--ink)]">{fotm.name}</span> plus
            the staples the shop cannot open without.
          </p>
        ) : (
          <p className="text-sm text-[var(--ink-soft)]">
            No flavor of the month yet, so this is a cleanup of the habitual
            order — cream bought twice, a trade-war price hike, and the pumpkin
            she stocked to look like next door.{" "}
            <Link href="/flavor" className="underline underline-offset-2">
              Crown a parfait
            </Link>{" "}
            to lock the real list.
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
          return (
            <article key={line.ingredientId} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    {ACTION_COPY[line.action]}
                  </p>
                  <h2 className="mt-1 font-display text-2xl">{ingredient.name}</h2>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{line.reason}</p>
                </div>
                <FlagRow line={line} />
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl bg-[var(--cream)] p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    Habit
                  </p>
                  {old && line.habitualOffer ? (
                    <p className="mt-1">
                      {old.name} · ${line.habitualOffer.unitPrice.toFixed(2)} /{" "}
                      {line.habitualOffer.unit}
                    </p>
                  ) : (
                    <p className="mt-1">Not on the morning call.</p>
                  )}
                </div>
                <div className="rounded-2xl bg-[var(--cream)] p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    Tomorrow
                  </p>
                  {chosen && line.chosenOffer ? (
                    <p className="mt-1">
                      {chosen.name} · ${line.chosenOffer.unitPrice.toFixed(2)} /{" "}
                      {line.chosenOffer.unit} · {line.weeklyQty} for the week
                    </p>
                  ) : (
                    <p className="mt-1">Leave it off the list.</p>
                  )}
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
  const flags = [
    ...(line.habitualOffer?.flags ?? []),
    ...(line.needed ? [] : (["unnecessary"] as const)),
  ];
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
