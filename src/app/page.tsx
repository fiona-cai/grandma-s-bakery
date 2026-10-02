"use client";

import { ParfaitGlass } from "@/components/ParfaitGlass";
import { leaderboard, money } from "@/lib/planner";
import { SEED } from "@/lib/seed";
import { useShop } from "@/lib/store";
import type { ShopData } from "@/lib/types";
import Link from "next/link";
import { useRef } from "react";

export default function HomePage() {
  const shop = useShop();
  const { trials, parfaits, pantry, saveParfait } = shop;
  const board = leaderboard(trials, parfaits, pantry);
  const current = trials.find((t) => t.status !== "done");
  const winner = parfaits.find((p) => p.status === "winner");
  const hero = winner ?? board[0]?.parfait ?? parfaits[0];
  const heroLayers = hero
    ? hero.ingredients
        .map((line) => pantry.find((item) => item.id === line.itemId))
        .filter((item) => item !== undefined)
    : [];
  const spent = trials.reduce((s, t) => s + (t.purchase?.reduce((a, l) => a + l.cost, 0) ?? 0), 0);
  const feedbackCount = trials.reduce((s, t) => s + t.entries.reduce((a, e) => a + e.feedback.length, 0), 0);

  return (
    <div className="space-y-16">
      {/* ---------- hero ---------- */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="pop-in">
          <span className="tag tag-teal">🍂 October menu planning</span>
          <h1 className="font-display mt-4 text-[2.6rem] font-semibold leading-[1.05] text-[var(--cocoa)] sm:text-6xl">
            Test small,
            <br />
            win back <span className="text-[var(--teal)]">fall.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--cocoa-soft)]">
            A chain called <strong>The Bakery</strong> opened next door with a
            suspiciously familiar parfait. Grandma&apos;s answer: four quarter
            batches, one combined grocery order, and the town votes with its
            wallet.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/trials" className="btn btn-teal">
              🥄 Start a trial round
            </Link>
            <Link href="/parfaits" className="btn btn-ghost">
              🍨 Write a recipe
            </Link>
          </div>
          <p className="font-hand mt-6 text-2xl text-[var(--latte)]">
            ↳ {trials.length} round{trials.length === 1 ? "" : "s"} so far, {feedbackCount} customer
            reviews, {money(spent)} spent.
          </p>
        </div>

        {hero ? (
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-6 rounded-full bg-[var(--teal-mist)]" aria-hidden />
            <div
              className="absolute inset-12 rounded-full border-2 border-dashed border-[var(--teal)] opacity-40"
              aria-hidden
            />
            <div className="float relative py-6">
              <ParfaitGlass parfait={hero} pantry={pantry} size="lg" spoon />
            </div>
            <div className="card absolute -left-2 top-8 rotate-[-6deg] px-3 py-2 sm:-left-8">
              <p className="kicker !text-[0.62rem]">
                {winner ? "Crowned" : board.length ? "Leading" : "On the bench"}
              </p>
              <p className="font-display text-sm font-semibold leading-tight">{hero.name}</p>
            </div>
            <ul className="card absolute -right-2 bottom-6 rotate-[4deg] space-y-1 px-3 py-2.5 text-xs sm:-right-6">
              {heroLayers
                .slice()
                .reverse()
                .map((item) => (
                  <li key={item.id} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                      style={{ background: item.color }}
                    />
                    {item.name}
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* ---------- three jobs ---------- */}
      <section>
        <SectionTitle kicker="Three little jobs" title="How a round works" />
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <JobCard
            href="/parfaits"
            step="1"
            icon="🍨"
            title="Write the glasses"
            body="Every recipe written for one parfait. Cost, price and margin update as Grandma types, and the glass stacks itself."
            cta="Open recipes"
            solves={["Recipe per glass", "Cost per parfait", "Margin"]}
          />
          <JobCard
            href="/trials"
            step="2"
            icon="🥄"
            title="Run a trial round"
            body="Pick up to four, make a quarter batch of each, and get one combined shopping list rounded to whole tubs and bags."
            cta="Plan a round"
            solves={["Quarter batches", "Bulk shopping list", "Sold vs. made", "Feedback"]}
          />
          <JobCard
            href="/pantry"
            step="3"
            icon="🧺"
            title="Mind the pantry"
            body="Pack sizes, prices and what's already on the shelf. Leftovers from one round count toward the next, so nothing gets bought twice."
            cta="Check the shelf"
            solves={["Pack sizes", "Suppliers", "Leftovers"]}
          />
        </div>
      </section>

      {/* ---------- current round ---------- */}
      {current ? (
        <section className="card-teal grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="kicker">Right now</p>
            <h2 className="font-display mt-1 text-3xl font-semibold text-[var(--teal-ink)]">
              {current.name}
            </h2>
            <p className="mt-2 text-[var(--cocoa-soft)]">
              {current.status === "running"
                ? "Selling. Log what goes out of the case and what people say at the counter."
                : current.purchase
                  ? "Ingredients are bought. Time to bake."
                  : "Planning. The shopping list hasn't been bought yet."}
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              {current.entries.map((entry) => {
                const parfait = parfaits.find((p) => p.id === entry.parfaitId);
                return parfait ? (
                  <ParfaitGlass key={entry.parfaitId} parfait={parfait} pantry={pantry} size="xs" animate={false} />
                ) : null;
              })}
            </div>
          </div>
          <Link href={`/trials/${current.id}`} className="btn btn-teal">
            Open the round →
          </Link>
        </section>
      ) : null}

      {/* ---------- leaderboard ---------- */}
      <section>
        <SectionTitle
          kicker="The leaderboard"
          title="What the town actually picked"
          aside="40% sold out · 40% stars · 20% speed"
        />
        {board.length === 0 ? (
          <p className="mt-6 text-[var(--cocoa-soft)]">Log results in a trial round to see rankings.</p>
        ) : (
          <ol className="mt-6 grid gap-5 sm:grid-cols-2">
            {board.map((row, index) => {
              const avg = row.ratings.length
                ? row.ratings.reduce((a, b) => a + b, 0) / row.ratings.length
                : null;
              return (
                <li
                  key={row.parfait.id}
                  className={`${index === 0 ? "card-teal" : "card"} card-hover flex gap-4 p-5`}
                  style={{ rotate: `${index % 2 ? 0.6 : -0.6}deg` }}
                >
                  <ParfaitGlass parfait={row.parfait} pantry={pantry} size="sm" animate={false} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="kicker">
                          #{index + 1}
                          {row.parfait.status === "winner" ? " · 👑 crowned" : ""}
                        </p>
                        <h3 className="font-display text-xl font-semibold leading-tight">
                          {row.parfait.name}
                        </h3>
                      </div>
                      <span className="font-display rounded-2xl bg-[var(--oat)] px-3 py-1 text-2xl font-semibold">
                        {row.score}
                      </span>
                    </div>
                    <div className="meter mt-3">
                      <span style={{ width: `${row.score}%` }} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="tag">
                        {row.sold}/{row.made} sold
                      </span>
                      <span className="tag">{avg ? `${avg.toFixed(1)} ★` : "no stars yet"}</span>
                      {row.feedbackCount ? (
                        <span className="tag">
                          {Math.round((row.buyAgain / row.feedbackCount) * 100)}% again
                        </span>
                      ) : null}
                      <span className="tag tag-teal">{money(row.profit)} profit</span>
                    </div>
                    {index === 0 && row.parfait.status !== "winner" ? (
                      <button
                        type="button"
                        onClick={() => saveParfait({ ...row.parfait, status: "winner" })}
                        className="btn btn-cocoa btn-sm mt-4"
                      >
                        👑 Crown the new Fall Parfait
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <Backup data={{ pantry, parfaits, trials, settings: shop.settings }} onLoad={shop.replaceAll} />
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

function Backup({ data, onLoad }: { data: ShopData; onLoad: (d: ShopData) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bakeria-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const upload = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as ShopData;
      if (!Array.isArray(parsed.pantry) || !Array.isArray(parsed.parfaits) || !Array.isArray(parsed.trials)) {
        throw new Error("bad file");
      }
      onLoad(parsed);
    } catch {
      alert("That file doesn't look like a Bakeria backup.");
    }
  };

  return (
    <section className="card flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <p className="kicker">📒 The notebook</p>
        <h2 className="font-display mt-1 text-2xl font-semibold">Keep a copy</h2>
        <p className="mt-1 text-sm text-[var(--cocoa-soft)]">
          Everything lives in this browser only. Download a backup now and then.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={download}>
          Download backup
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
          Restore backup
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => confirm("Replace everything with the example data?") && onLoad(SEED)}
        >
          Reset to example data
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </div>
    </section>
  );
}
