"use client";

import { ParfaitGlass } from "@/components/ParfaitGlass";
import { PERSONAS } from "@/lib/personas";
import { BAKERY_AUTUMN } from "@/lib/recipes";
import { useShop } from "@/lib/store";
import Link from "next/link";

const ROOMS = [
  {
    href: "/flavor",
    kicker: "The glass",
    title: "Flavor studio",
    body: "Invent the Fall Parfait, let the booths argue, then put the winner on one window card: languages, allergens, swaps, a traveler cup, and the two reviews that used to sit unanswered.",
    solves: [
      "Flavor of the month",
      "Window & reviews",
      "Allergens on the line",
      "Menu in three languages",
      "A cup that travels",
    ],
  },
  {
    href: "/supplies",
    kicker: "The list",
    title: "Morning list",
    body: "The crowned recipe writes tomorrow's call. Local growers stay when cream jumps. Jars and spoilage sit on the same line as the Union's forty-by-four.",
    solves: [
      "Purchasing",
      "Local growers",
      "Cream hike",
      "Inventory ledger",
      "Campus rush",
    ],
  },
  {
    href: "/loyalty",
    kicker: "The till",
    title: "Regulars",
    body: "Each face is a palate. Each stamp is tonight's close — card tape, cash, campus, and the tax pile she used to sort in March.",
    solves: ["Loyalty", "Who likes this parfait", "Daily close & tax"],
  },
];

export default function HomePage() {
  const { fotm, customers } = useShop();
  const regulars = customers.filter((customer) => customer.visits >= 8).length;

  return (
    <div className="space-y-10">
      <section className="grid items-end gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            Three rooms. The whole wishlist.
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
            Take the Fall Parfait back without opening a fourth notebook.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--ink-soft)]">
            One glass feeds the window, the dawn call, and the till. Grandma
            keeps making parfait. The shop keeps the rest.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/flavor"
              className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm text-[var(--paper)]"
            >
              Convene the taste jury
            </Link>
            <Link
              href="/loyalty"
              className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm"
            >
              Open the till
            </Link>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            In the window this month
          </p>
          {fotm ? (
            <div className="mt-3 flex items-center gap-4">
              <ParfaitGlass recipe={fotm} size="sm" />
              <div>
                <h2 className="font-display text-2xl">{fotm.name}</h2>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">{fotm.tagline}</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-4">
              <ParfaitGlass recipe={BAKERY_AUTUMN} size="sm" />
              <div>
                <h2 className="font-display text-2xl">Not crowned yet</h2>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  Until then, The Bakery&apos;s Autumn Parfait is the one people
                  point at.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {ROOMS.map((room) => (
          <Link
            key={room.href}
            href={room.href}
            className="card block p-5 transition hover:-translate-y-0.5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {room.kicker}
            </p>
            <h2 className="mt-2 font-display text-2xl">{room.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{room.body}</p>
            <ul className="mt-4 flex flex-wrap gap-1">
              {room.solves.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-[var(--cream)] px-2 py-1 text-[11px]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </section>

      <section className="card p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              The jury
            </p>
            <h2 className="mt-1 font-display text-3xl">Six palates, one town</h2>
          </div>
          <p className="text-sm text-[var(--ink-soft)]">
            {regulars} regulars already map onto these people.
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((persona) => (
            <div key={persona.id} className="rounded-2xl bg-[var(--cream)]/70 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full text-xl"
                  style={{ background: persona.blush }}
                >
                  {persona.emoji}
                </div>
                <div>
                  <p className="font-medium">{persona.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    {persona.role}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-[var(--ink-soft)]">{persona.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
