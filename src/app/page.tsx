"use client";

import { Avatar } from "@/components/Avatar";
import { ParfaitGlass } from "@/components/ParfaitGlass";
import { PERSONAS } from "@/lib/personas";
import { BAKERY_AUTUMN, recipeIngredients } from "@/lib/recipes";
import { useShop } from "@/lib/store";
import Link from "next/link";

const HOUSE_SPECIAL = {
  id: "house-special",
  name: "Grandma's Friday Glass",
  tagline: "Brown butter, honeycrisp, a cinnamon stick for stirring.",
  layers: {
    base: "brown-butter-cake",
    cream: "maple-mascarpone",
    fruit: "honeycrisp",
    crunch: "candied-pecan",
    drizzle: "dark-caramel",
    garnish: "cinnamon-stick",
  },
  vibe: "classic",
} as const;

export default function HomePage() {
  const { fotm, customers } = useShop();
  const regulars = customers.filter((customer) => customer.visits >= 8).length;
  const hero = fotm ?? { ...HOUSE_SPECIAL, layers: { ...HOUSE_SPECIAL.layers } };
  const heroLayers = recipeIngredients(hero);

  return (
    <div className="space-y-16">
      {/* ---------- hero ---------- */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="pop-in">
          <span className="tag tag-teal">🍂 October menu planning</span>
          <h1 className="font-display mt-4 text-[2.6rem] font-semibold leading-[1.05] text-[var(--cocoa)] sm:text-6xl">
            Layer by layer,
            <br />
            win back <span className="text-[var(--teal)]">fall.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--cocoa-soft)]">
            A chain called <strong>The Bakery</strong> opened next door with a pumpkin
            parfait sold in 400 towns. Grandma&apos;s answer: invent a better glass,
            let six neighbors taste it, then buy only what it needs.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/flavor" className="btn btn-teal">
              🥄 Build a parfait
            </Link>
            <Link href="/loyalty" className="btn btn-ghost">
              💌 Open the till
            </Link>
          </div>
          <p className="font-hand mt-6 text-2xl text-[var(--latte)]">
            ↳ {regulars} regulars are already waiting on this one.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-6 rounded-full bg-[var(--teal-mist)]" aria-hidden />
          <div
            className="absolute inset-12 rounded-full border-2 border-dashed border-[var(--teal)] opacity-40"
            aria-hidden
          />
          <div className="float relative py-6">
            <ParfaitGlass recipe={hero} size="lg" spoon />
          </div>
          <div className="card absolute -left-2 top-8 rotate-[-6deg] px-3 py-2 sm:-left-8">
            <p className="kicker !text-[0.62rem]">{fotm ? "Crowned" : "House special"}</p>
            <p className="font-display text-sm font-semibold leading-tight">{hero.name}</p>
          </div>
          <ul className="card absolute -right-2 bottom-6 rotate-[4deg] space-y-1 px-3 py-2.5 text-xs sm:-right-6">
            {heroLayers
              .slice()
              .reverse()
              .map((ingredient) => (
                <li key={ingredient.id} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                    style={{ background: ingredient.color }}
                  />
                  {ingredient.name}
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* ---------- three jobs ---------- */}
      <section>
        <SectionTitle kicker="Three little jobs" title="What the back office does" />
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <JobCard
            href="/flavor"
            step="1"
            icon="🥄"
            title="Flavor studio"
            body="Stack the Fall Parfait, let the booths argue, then put the winner on one window card: languages, allergens, swaps, a traveler cup, and replies to the reviews."
            cta="Start tasting"
            solves={["Flavor of the month", "Window & reviews", "Allergens", "3 languages", "Traveler cup"]}
          />
          <JobCard
            href="/supplies"
            step="2"
            icon="📝"
            title="Morning list"
            body="The crowned glass writes tomorrow's call. Local growers stay when cream jumps, and the Union's forty-by-four sits on the same page."
            cta="Check the list"
            solves={["Purchasing", "Local growers", "Cream hike", "Shelf & spoilage", "Campus rush"]}
          />
          <JobCard
            href="/loyalty"
            step="3"
            icon="💌"
            title="Regulars & till"
            body="Punch cards with names. Each stamp lands on tonight's close: card tape, cash, campus, and the tax pile she used to sort in March."
            cta="Open the till"
            solves={["Loyalty", "Who likes this glass", "Daily close & tax"]}
          />
        </div>
      </section>

      {/* ---------- versus ---------- */}
      <section className="card-teal grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr_auto]">
        <div className="text-center">
          <ParfaitGlass recipe={BAKERY_AUTUMN} size="sm" animate={false} />
          <p className="font-display mt-2 text-sm font-semibold text-[var(--latte)]">
            Next door
          </p>
        </div>
        <div className="text-center md:text-left">
          <p className="kicker">The rivalry</p>
          <h2 className="font-display mt-1 text-3xl font-semibold text-[var(--teal-ink)]">
            Pumpkin, pumpkin, pumpkin, granola.
          </h2>
          <p className="mt-2 text-[var(--cocoa-soft)]">
            The Bakery&apos;s Autumn Parfait is the one people point at. Every glass in the
            studio gets scored against it, and flagged when it starts to look like a copy.
          </p>
        </div>
        <div className="text-center">
          <ParfaitGlass recipe={hero} size="sm" animate={false} />
          <p className="font-display mt-2 text-sm font-semibold text-[var(--teal-deep)]">
            Grandma&apos;s
          </p>
        </div>
      </section>

      {/* ---------- jury ---------- */}
      <section>
        <SectionTitle
          kicker="The taste jury"
          title="Six neighbors, six opinions"
          aside={`${regulars} regulars map onto these palates`}
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((persona, index) => (
            <article
              key={persona.id}
              className="card card-hover p-5"
              style={{ rotate: `${index % 2 ? 0.6 : -0.6}deg` }}
            >
              <div className="flex items-center gap-3">
                <Avatar emoji={persona.emoji} blush={persona.blush} />
                <div>
                  <h3 className="font-display text-lg font-semibold leading-tight">
                    {persona.name}
                  </h3>
                  <p className="text-sm font-bold text-[var(--teal)]">{persona.role}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--cocoa-soft)]">
                {persona.bio}
              </p>
              <p className="font-hand mt-3 text-xl leading-tight text-[var(--latte)]">
                comes for: {persona.comesFor.toLowerCase()}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ kicker, title, aside }: { kicker: string; title: string; aside?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="kicker">{kicker}</p>
        <h2 className="font-display mt-1 text-3xl font-semibold sm:text-4xl">{title}</h2>
      </div>
      {aside ? <p className="font-hand text-2xl text-[var(--latte)]">{aside}</p> : null}
    </div>
  );
}

function JobCard({
  href,
  step,
  icon,
  title,
  body,
  cta,
  solves,
}: {
  href: string;
  step: string;
  icon: string;
  title: string;
  body: string;
  cta: string;
  solves: string[];
}) {
  return (
    <Link href={href} className="card card-hover group relative block p-6">
      <span className="font-display absolute -top-4 right-6 grid h-9 w-9 place-items-center rounded-full bg-[var(--cocoa)] text-sm font-semibold text-[var(--cream)] shadow-[0_3px_0_#2c190f]">
        {step}
      </span>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--teal-mist)] text-2xl">
        {icon}
      </span>
      <h3 className="font-display mt-4 text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--cocoa-soft)]">{body}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {solves.map((item) => (
          <li key={item} className="tag tag-teal !text-[0.7rem]">
            {item}
          </li>
        ))}
      </ul>
      <p className="font-display mt-4 font-semibold text-[var(--teal)] transition group-hover:translate-x-1">
        {cta} →
      </p>
    </Link>
  );
}
