"use client";

import { ParfaitGlass } from "@/components/ParfaitGlass";
import { PERSONAS } from "@/lib/personas";
import { BAKERY_AUTUMN } from "@/lib/recipes";
import { useShop } from "@/lib/store";
import Link from "next/link";

export default function HomePage() {
  const { fotm, customers } = useShop();
  const regulars = customers.filter((customer) => customer.visits >= 8).length;

  return (
    <div className="space-y-10">
      <section className="grid items-end gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            A shop next door opened. The booths did not forget us.
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
            Take the Fall Parfait back before The Bakery makes October generic.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--ink-soft)]">
            Six neighbors with six palates will tell Grandma if a new parfait
            will sell. The winning recipe writes the morning list and lights up
            the regulars who will come back for it.
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
              See who still comes
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

      <section className="grid gap-4 md:grid-cols-3">
        <ProblemCard
          href="/flavor"
          kicker="Marketing"
          title="Flavor of the month"
          body="Ingredients cost money and tastes are a guess. Run every candidate through students, first dates, Friday reunions, and the one person who will notice if it tastes like next door."
        />
        <ProblemCard
          href="/supplies"
          kicker="Operations"
          title="The morning list"
          body="Grandma orders from the same trusted people every dawn. Once the parfait is chosen, stop the duplicate cream, the sack granola, and the pumpkin she only bought to compete."
        />
        <ProblemCard
          href="/loyalty"
          kicker="Regulars"
          title="People, not a pile of names"
          body="Repeat faces drive the shop. Match each regular to a taster profile and see who the new parfait will actually bring back."
        />
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

function ProblemCard({
  href,
  kicker,
  title,
  body,
}: {
  href: string;
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="card block p-5 transition hover:-translate-y-0.5">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{kicker}</p>
      <h2 className="mt-2 font-display text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{body}</p>
    </Link>
  );
}
