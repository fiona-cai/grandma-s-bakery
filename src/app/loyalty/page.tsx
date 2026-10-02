"use client";

import { Avatar } from "@/components/Avatar";
import { STAMPS_FOR_FREE, stampsTowardFree } from "@/lib/customers";
import { closeBooks, menuPrice } from "@/lib/desk";
import { PERSONA_MAP, PERSONAS } from "@/lib/personas";
import { useShop } from "@/lib/store";
import { evaluateRecipe } from "@/lib/tasting";
import type { Customer } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function LoyaltyPage() {
  const {
    fotm,
    customers,
    stamp,
    lastTasting,
    stampsToday,
    campusYes,
    booksClosed,
    closeBooks: lockBooks,
  } = useShop();
  const [filter, setFilter] = useState<string>("all");
  const tasting = useMemo(
    () =>
      fotm
        ? (lastTasting?.find((row) => row.recipe.id === fotm.id) ?? evaluateRecipe(fotm))
        : null,
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
    filter === "all" ? customers : customers.filter((customer) => customer.personaId === filter);
  const comingBack = tasting
    ? customers.filter(
        (customer) =>
          tasting.notes.find((row) => row.personaId === customer.personaId)?.wouldOrder,
      )
    : [];

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <p className="kicker">Regulars &amp; the till</p>
        <h1 className="font-display mt-2 text-4xl font-semibold leading-tight sm:text-5xl">
          A stamp is a person, and a line on tonight&apos;s close.
        </h1>
        <p className="mt-3 text-lg text-[var(--cocoa-soft)]">
          Faces stay matched to the jury. Each stamp also writes the Verifone tape, the
          cash drawer, and the pile Grandma used to sort at tax time.
        </p>
      </header>

      <CloseStrip
        menu={fotm ? menuPrice(fotm) : 6.5}
        stampsToday={stampsToday}
        campusYes={campusYes}
        closed={booksClosed}
        onClose={lockBooks}
      />

      {/* ---------- who holds the shop up ---------- */}
      <section className="card p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">Who holds this shop up</p>
            <h2 className="font-display mt-1 text-2xl font-semibold">Visits by palate</h2>
          </div>
          {fotm ? (
            <p className="font-hand text-2xl text-[var(--teal-deep)]">
              {comingBack.length} of {customers.length} regulars will come for {fotm.name}
            </p>
          ) : (
            <Link href="/flavor" className="btn btn-teal btn-sm">
              👑 Crown a flavor to see who it brings back
            </Link>
          )}
        </div>

        <div className="mt-5 flex h-6 overflow-hidden rounded-full border-2 border-white shadow-[0_0_0_2px_var(--line)]">
          {segments.map((segment) => (
            <div
              key={segment.persona.id}
              title={`${segment.persona.role}: ${segment.visits} visits`}
              className="transition-all"
              style={{
                width: `${(segment.visits / totalVisits) * 100}%`,
                background: segment.persona.blush,
                opacity: filter === "all" || filter === segment.persona.id ? 1 : 0.35,
              }}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {segments.map((segment) => {
            const active = filter === segment.persona.id;
            return (
              <button
                key={segment.persona.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter((current) => (current === segment.persona.id ? "all" : segment.persona.id))}
                className="pick flex items-center gap-3"
              >
                <Avatar emoji={segment.persona.emoji} blush={segment.persona.blush} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="font-display block font-semibold leading-tight">
                    {segment.persona.role}
                  </span>
                  <span className="block text-sm text-[var(--cocoa-soft)]">
                    {segment.members.length} regulars · {segment.visits} visits
                  </span>
                </span>
                {segment.score !== null ? (
                  <span
                    className={`tag shrink-0 ${
                      segment.wouldOrder ? "tag-teal" : "!bg-[#f6e3e3] !text-[#8a2b3a]"
                    }`}
                    title={`Scored this month's glass ${segment.score.toFixed(1)}`}
                  >
                    {segment.wouldOrder ? "✓ coming" : "skipping"}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------- punch cards ---------- */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-3xl font-semibold">
            {filter === "all" ? "Every regular" : PERSONA_MAP[filter]?.role}
          </h2>
          {filter !== "all" ? (
            <button type="button" onClick={() => setFilter("all")} className="btn btn-ghost btn-sm">
              Show everyone
            </button>
          ) : (
            <p className="font-hand text-xl text-[var(--latte)]">
              {STAMPS_FOR_FREE} stamps = a free parfait
            </p>
          )}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {visible
            .slice()
            .sort((a, b) => b.visits - a.visits)
            .map((customer) => {
              const note = tasting?.notes.find((row) => row.personaId === customer.personaId);
              return (
                <PunchCard
                  key={customer.id}
                  customer={customer}
                  onStamp={() => stamp(customer.id)}
                  score={note?.score ?? null}
                  coming={note?.wouldOrder ?? null}
                />
              );
            })}
        </div>
      </section>
    </div>
  );
}

function CloseStrip({
  menu,
  stampsToday,
  campusYes,
  closed,
  onClose,
}: {
  menu: number;
  stampsToday: number;
  campusYes: boolean;
  closed: boolean;
  onClose: () => void;
}) {
  const books = closeBooks({ stampsToday, menu, campus: campusYes });
  return (
    <section className="card-teal p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">Tonight&apos;s close</p>
          <h2 className="font-display mt-1 text-2xl font-semibold text-[var(--teal-ink)]">
            🧾 Card ${books.cardTape.toFixed(2)} · 💵 Cash ${books.cashDrawer.toFixed(2)}
          </h2>
          <p className="font-hand mt-1 text-xl text-[var(--cocoa-soft)]">
            {stampsToday > 0
              ? `${stampsToday} stamp${stampsToday === 1 ? "" : "s"} today, already on the tape`
              : "stamp a regular below and it lands here"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={closed}
          className={`btn ${closed ? "btn-ghost cursor-default !shadow-none" : "btn-cocoa"}`}
        >
          {closed ? "🌙 Closed for the night" : "🔒 Close the books"}
        </button>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Ledger label="Parfaits" value={`$${books.parfait.toFixed(2)}`} note={`${books.parfaitCount} glasses @ $${menu.toFixed(2)}`} />
        <Ledger label="Coffee" value={`$${books.coffee.toFixed(2)}`} note="the urn, as always" />
        <Ledger label="Sales tax" value={`$${books.salesTax.toFixed(2)}`} note="set aside, not spent" />
        <Ledger
          label="Drawer vs counter"
          value={`${books.gap >= 0 ? "+" : "−"}$${Math.abs(books.gap).toFixed(2)}`}
          note={books.gap >= 0 ? "over: count again" : "short: check the tape"}
        />
      </dl>
      {campusYes ? (
        <p className="mt-4 text-sm text-[var(--teal-ink)]">
          🎓 Student Union ${books.campus.toFixed(2)} on account, not in the Verifone.
        </p>
      ) : null}
    </section>
  );
}

function Ledger({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-3xl bg-[var(--paper)] p-3.5">
      <dt className="kicker !text-[0.62rem]">{label}</dt>
      <dd className="font-display mt-0.5 text-2xl font-semibold">{value}</dd>
      <dd className="text-xs text-[var(--latte)]">{note}</dd>
    </div>
  );
}

function PunchCard({
  customer,
  onStamp,
  score,
  coming,
}: {
  customer: Customer;
  onStamp: () => void;
  score: number | null;
  coming: boolean | null;
}) {
  const persona = PERSONA_MAP[customer.personaId]!;
  const filled = stampsTowardFree(customer.visits);
  const freeReady = filled === 0 && customer.visits > 0;

  return (
    <article className="punchcard p-5 sm:px-7">
      <div className="flex items-start gap-3">
        <Avatar emoji={persona.emoji} blush={persona.blush} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <h3 className="font-display text-2xl font-semibold leading-tight">{customer.name}</h3>
            <p className="font-display text-sm font-semibold text-[var(--teal)]">
              {customer.points} pts
            </p>
          </div>
          <p className="text-sm text-[var(--latte)]">
            tastes like {persona.name.split(" ")[0]} · {customer.lastVisit}
          </p>
        </div>
      </div>

      <p className="font-hand mt-3 text-xl leading-snug text-[var(--cocoa-soft)]">
        “{customer.note}”
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {Array.from({ length: STAMPS_FOR_FREE }).map((_, index) => {
          const on = index < filled || freeReady;
          return (
            <span key={`${index}-${on}`} className={`stamp ${on ? "filled" : ""}`} aria-hidden>
              {on ? <MiniParfait /> : null}
            </span>
          );
        })}
        <span className="sr-only">
          {freeReady ? "Free parfait ready" : `${filled} of ${STAMPS_FOR_FREE} stamps`}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-[var(--line)] pt-4">
        <div className="flex flex-wrap gap-1.5">
          {freeReady ? <span className="tag !bg-[var(--butter)]">🎁 Free parfait waiting</span> : null}
          <span className="tag">since {customer.since}</span>
          {score !== null ? (
            <span className={`tag ${coming ? "tag-teal" : ""}`}>
              this month: {score.toFixed(1)}/10
            </span>
          ) : null}
        </div>
        <button type="button" onClick={onStamp} className="btn btn-teal btn-sm">
          🖋️ Stamp a visit
        </button>
      </div>
    </article>
  );
}

function MiniParfait() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden>
      <circle cx="10" cy="3" r="2" fill="#d9546a" />
      <path d="M4 7 L16 7 L14 15 Q10 18 6 15 Z" fill="#2b8a84" />
      <path d="M4.6 10 L15.4 10" stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}
