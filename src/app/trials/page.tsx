"use client";

import { ParfaitGlass } from "@/components/ParfaitGlass";
import { useShop } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MAX_PARFAITS = 4;
const FRACTIONS = [
  { value: 0.25, label: "¼ batch" },
  { value: 1 / 3, label: "⅓ batch" },
  { value: 0.5, label: "½ batch" },
  { value: 1, label: "Full batch" },
];
const STATUS_TAG = {
  planning: { label: "📝 planning", className: "tag !bg-[var(--butter)] !text-[var(--cocoa)]" },
  running: { label: "🥄 selling", className: "tag tag-teal" },
  done: { label: "✓ done", className: "tag" },
} as const;

export default function TrialsPage() {
  const { trials, parfaits, pantry, settings, createTrial, setUsualBatch } = useShop();
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>([]);
  const [fraction, setFraction] = useState(0.25);
  const [name, setName] = useState("");

  const toggle = (id: string) =>
    setPicked((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : current.length < MAX_PARFAITS
          ? [...current, id]
          : current,
    );

  const start = () => {
    const id = createTrial(name.trim() || `Trial round ${trials.length + 1}`, picked, fraction);
    router.push(`/trials/${id}`);
  };

  const candidates = parfaits.filter((p) => p.status !== "retired");
  const perParfait = Math.max(1, Math.round(settings.usualBatch * fraction));

  return (
    <div className="space-y-12">
      <header className="max-w-3xl">
        <p className="kicker">Trial rounds</p>
        <h1 className="font-display mt-2 text-4xl font-semibold leading-tight sm:text-5xl">
          Four small batches, one shopping trip, and the town decides.
        </h1>
        <p className="mt-3 text-lg text-[var(--cocoa-soft)]">
          Make up to four parfaits at a fraction of a usual batch, buy everything
          in one combined order, then log what sold and what people said.
        </p>
      </header>

      <section className="card space-y-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="kicker">🥄 New round</p>
            <h2 className="font-display mt-1 text-2xl font-semibold">Pick the glasses for the case</h2>
          </div>
          <span className="font-display rounded-2xl bg-[var(--oat)] px-3 py-1 text-xl font-semibold">
            {picked.length}/{MAX_PARFAITS}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <label>
            <span className="kicker">Name</span>
            <input
              className="field mt-1"
              placeholder={`Trial round ${trials.length + 1}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="sm:w-40">
            <span className="kicker">Usual batch</span>
            <input
              type="number"
              min={1}
              className="field mt-1"
              value={settings.usualBatch}
              onChange={(e) => setUsualBatch(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>
          <div>
            <span className="kicker">Trial size</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {FRACTIONS.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  className="chip"
                  aria-pressed={fraction === f.value}
                  onClick={() => setFraction(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="font-hand text-2xl text-[var(--latte)]">
            ↳ {perParfait} of each glass · tap up to {MAX_PARFAITS}
          </p>
          <div className="shelf mt-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {candidates.map((p) => {
                const on = picked.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    disabled={!on && picked.length >= MAX_PARFAITS}
                    onClick={() => toggle(p.id)}
                    className="pick flex flex-col items-center gap-2 pb-4 text-center"
                  >
                    <ParfaitGlass parfait={p} pantry={pantry} size="sm" animate={false} />
                    <span className="font-display font-semibold leading-tight">{p.name}</span>
                    {on ? <span className="tag tag-teal !text-[0.68rem]">✓ in the case</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
          {candidates.length === 0 ? (
            <p className="mt-3 text-[var(--cocoa-soft)]">
              <Link href="/parfaits" className="font-bold text-[var(--teal-deep)] underline">
                Add some parfaits
              </Link>{" "}
              first.
            </p>
          ) : null}
        </div>

        <button type="button" className="btn btn-teal" disabled={picked.length === 0} onClick={start}>
          Plan this round →
        </button>
      </section>

      <section>
        <p className="kicker">The record</p>
        <h2 className="font-display mt-1 text-3xl font-semibold sm:text-4xl">Past and current rounds</h2>
        {trials.length === 0 ? (
          <p className="font-hand mt-4 text-2xl text-[var(--latte)]">none yet — start one above</p>
        ) : null}
        <div className="mt-6 space-y-4">
          {trials.map((t) => {
            const made = t.entries.reduce((s, e) => s + e.made, 0);
            const sold = t.entries.reduce((s, e) => s + e.sold, 0);
            const status = STATUS_TAG[t.status];
            return (
              <Link
                key={t.id}
                href={`/trials/${t.id}`}
                className="card card-hover flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={status.className}>{status.label}</span>
                    <span className="text-sm text-[var(--latte)]">
                      {t.startDate} · {t.entries.length} parfaits
                    </span>
                  </div>
                  <p className="font-display mt-1 text-2xl font-semibold">{t.name}</p>
                </div>
                <div className="flex items-end gap-3">
                  {t.entries.map((e) => {
                    const p = parfaits.find((x) => x.id === e.parfaitId);
                    return p ? (
                      <ParfaitGlass key={e.parfaitId} parfait={p} pantry={pantry} size="xs" animate={false} />
                    ) : null;
                  })}
                  <p className="font-display w-28 text-right font-semibold text-[var(--teal-deep)]">
                    {made > 0 ? `${sold}/${made} sold` : "no results yet"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
