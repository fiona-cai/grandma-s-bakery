"use client";

import { STAMPS_FOR_FREE, stampsTowardFree } from "@/lib/customers";
import { PERSONA_MAP, PERSONAS } from "@/lib/personas";
import { useShop } from "@/lib/store";
import { evaluateRecipe } from "@/lib/tasting";
import type { Customer } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function LoyaltyPage() {
  const { fotm, customers, stamp, lastTasting } = useShop();
  const [filter, setFilter] = useState<string>("all");
  const tasting = useMemo(
    () => (fotm ? lastTasting?.find((row) => row.recipe.id === fotm.id) ?? evaluateRecipe(fotm) : null),
    [fotm, lastTasting],
  );

  const segments = PERSONAS.map((persona) => {
    const members = customers.filter((customer) => customer.personaId === persona.id);
    const note = tasting?.notes.find((row) => row.personaId === persona.id);
    return {
      persona,
      members,
      visits: members.reduce((sum, customer) => sum + customer.visits, 0),
      score: note?.score ?? null,
      wouldOrder: note?.wouldOrder ?? false,
    };
  }).sort((a, b) => b.visits - a.visits);

  const totalVisits = segments.reduce((sum, segment) => sum + segment.visits, 0);
  const visible =
    filter === "all"
      ? customers
      : customers.filter((customer) => customer.personaId === filter);
  const comingBack = tasting
    ? customers.filter((customer) => {
        const note = tasting.notes.find((row) => row.personaId === customer.personaId);
        return note?.wouldOrder;
      })
    : [];

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          Regulars
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight">
          The same six palates, but with names and stamp cards.
        </h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          Grandma used to keep this in her head. Each regular is matched to the
          taster they taste like, so a crowned parfait can show who it will pull
          back through the door.
        </p>
      </header>

      <section className="card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Who holds this shop up
            </p>
            <h2 className="mt-1 font-display text-2xl">Visits by palate</h2>
          </div>
          {fotm ? (
            <p className="text-sm text-[var(--ink-soft)]">
              {comingBack.length} of {customers.length} regulars line up with{" "}
              <span className="font-medium text-[var(--ink)]">{fotm.name}</span>
            </p>
          ) : (
            <Link href="/flavor" className="text-sm underline underline-offset-2">
              Crown a flavor to see who it belongs to
            </Link>
          )}
        </div>
        <div className="mt-5 overflow-hidden rounded-full bg-[var(--cream)]">
          <div className="flex h-4">
            {segments.map((segment) => (
              <div
                key={segment.persona.id}
                title={`${segment.persona.name}: ${segment.visits} visits`}
                style={{
                  width: `${(segment.visits / totalVisits) * 100}%`,
                  background: segment.persona.blush,
                }}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {segments.map((segment) => (
            <button
              key={segment.persona.id}
              type="button"
              onClick={() =>
                setFilter((current) =>
                  current === segment.persona.id ? "all" : segment.persona.id,
                )
              }
              className={`rounded-2xl p-4 text-left ${
                filter === segment.persona.id
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "bg-[var(--cream)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">
                  {segment.persona.emoji} {segment.persona.role}
                </span>
                <span className="text-sm opacity-80">{segment.visits} visits</span>
              </div>
              <p className="mt-2 text-sm opacity-80">
                {segment.members.length} regulars
                {segment.score
                  ? ` · ${segment.wouldOrder ? "will come for" : "will skip"} this month (${segment.score.toFixed(1)})`
                  : ""}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl">
            {filter === "all" ? "Every regular" : PERSONA_MAP[filter]?.role}
          </h2>
          {filter !== "all" ? (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="text-sm underline underline-offset-2"
            >
              Show all
            </button>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {visible
            .slice()
            .sort((a, b) => b.visits - a.visits)
            .map((customer) => (
              <RegularCard
                key={customer.id}
                customer={customer}
                onStamp={() => stamp(customer.id)}
                score={
                  tasting?.notes.find((note) => note.personaId === customer.personaId)
                    ?.score ?? null
                }
              />
            ))}
        </div>
      </section>
    </div>
  );
}

function RegularCard({
  customer,
  onStamp,
  score,
}: {
  customer: Customer;
  onStamp: () => void;
  score: number | null;
}) {
  const persona = PERSONA_MAP[customer.personaId];
  const filled = stampsTowardFree(customer.visits);
  const freeReady = filled === 0 && customer.visits > 0;

  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl">{customer.name}</h3>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Tastes like {persona.name} · {persona.role}
          </p>
        </div>
        <div className="text-right text-sm">
          <p>{customer.points} pts</p>
          <p className="text-[var(--muted)]">{customer.lastVisit}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-[var(--ink-soft)]">{customer.note}</p>
      <div className="mt-4 flex items-center gap-1.5">
        {Array.from({ length: STAMPS_FOR_FREE }).map((_, index) => (
          <span
            key={index}
            className={`stamp ${index < filled || freeReady ? "filled" : ""}`}
          />
        ))}
        <span className="ml-2 text-xs text-[var(--muted)]">
          {freeReady ? "Free parfait waiting" : `${filled}/${STAMPS_FOR_FREE}`}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--muted)]">
          Coming since {customer.since}
          {score ? ` · this parfait ${score.toFixed(1)}/10` : ""}
        </p>
        <button
          type="button"
          onClick={onStamp}
          className="rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs text-[var(--paper)]"
        >
          Stamp a visit
        </button>
      </div>
    </article>
  );
}
