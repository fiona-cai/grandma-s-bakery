"use client";

import { NumberField } from "@/components/NumberField";
import { ParfaitGlass } from "@/components/ParfaitGlass";
import {
  costPerServing,
  entryStats,
  formatQty,
  money,
  separateCost,
  shoppingList,
  uid,
} from "@/lib/planner";
import { useShop } from "@/lib/store";
import type { Parfait, Trial, TrialEntry, TrialStatus } from "@/lib/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

const TABS = [
  { id: "plan", label: "📝 Plan" },
  { id: "shop", label: "🛒 Shopping list" },
  { id: "results", label: "⭐ Results" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function TrialPage() {
  const { id } = useParams<{ id: string }>();
  const { trials, parfaits, ready, updateTrial, deleteTrial } = useShop();
  const router = useRouter();
  const trial = trials.find((t) => t.id === id);
  const [tab, setTab] = useState<Tab | null>(null);

  if (!trial) {
    return ready ? (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <p className="font-display text-2xl font-semibold">That round isn&apos;t on the books.</p>
        <Link href="/trials" className="btn btn-teal btn-sm mt-4">
          Back to trial rounds
        </Link>
      </div>
    ) : null;
  }

  const activeTab: Tab = tab ?? (trial.status === "planning" ? "plan" : "results");
  const byId = new Map(parfaits.map((p) => [p.id, p]));

  return (
    <div className="space-y-8">
      <header className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <Link
            href="/trials"
            className="font-display text-sm font-semibold text-[var(--teal-deep)] hover:underline print:hidden"
          >
            ← All trial rounds
          </Link>
          <p className="kicker mt-3">
            Trial round · started {trial.startDate} · {trial.entries.length} parfaits
          </p>
          <input
            aria-label="Round name"
            className="font-display mt-1 block w-full rounded-2xl bg-transparent text-4xl font-semibold leading-tight outline-none focus:bg-[var(--paper)] sm:text-5xl"
            value={trial.name}
            onChange={(e) => updateTrial(trial.id, { name: e.target.value })}
          />
        </div>
        <StatusPicker trial={trial} onChange={(status) => updateTrial(trial.id, { status })} />
      </header>

      <nav aria-label="Round sections" className="flex flex-wrap gap-2 print:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="chip"
            aria-pressed={activeTab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {activeTab === "plan" ? <PlanTab trial={trial} byId={byId} onNext={() => setTab("shop")} /> : null}
      {activeTab === "shop" ? <ShoppingTab trial={trial} /> : null}
      {activeTab === "results" ? <ResultsTab trial={trial} byId={byId} /> : null}

      <div className="border-t-2 border-dashed border-[var(--line)] pt-4 text-right print:hidden">
        <button
          type="button"
          className="text-sm font-bold text-[var(--cherry)] hover:underline"
          onClick={() => {
            if (confirm(`Delete "${trial.name}" and all its results?`)) {
              deleteTrial(trial.id);
              router.push("/trials");
            }
          }}
        >
          Delete trial round
        </button>
      </div>
    </div>
  );
}

function StatusPicker({ trial, onChange }: { trial: Trial; onChange: (s: TrialStatus) => void }) {
  const steps: { value: TrialStatus; label: string }[] = [
    { value: "planning", label: "📝 Planning" },
    { value: "running", label: "🥄 Selling" },
    { value: "done", label: "✓ Done" },
  ];
  return (
    <div
      role="group"
      aria-label="Round status"
      className="flex gap-1 rounded-full border-2 border-[var(--line)] bg-[var(--paper)] p-1 shadow-[0_4px_0_var(--line)] print:hidden"
    >
      {steps.map((s) => {
        const active = trial.status === s.value;
        return (
          <button
            key={s.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(s.value)}
            className={`font-display shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition ${
              active
                ? "bg-[var(--teal)] text-white shadow-[0_3px_0_var(--teal-deep)]"
                : "text-[var(--cocoa-soft)] hover:bg-[var(--teal-foam)] hover:text-[var(--teal-deep)]"
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- plan ---------------- */

function PlanTab({
  trial,
  byId,
  onNext,
}: {
  trial: Trial;
  byId: Map<string, Parfait>;
  onNext: () => void;
}) {
  const { pantry, updateEntry, updateTrial } = useShop();
  const locked = trial.purchase !== null;

  return (
    <section className="space-y-6">
      {locked ? (
        <p className="rounded-full border-2 border-dashed border-[var(--teal)] bg-[var(--teal-foam)] px-5 py-2 text-sm text-[var(--teal-ink)]">
          <span className="font-display font-semibold">✓ Already bought.</span> Undo the purchase on
          the shopping list to change amounts.
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {trial.entries.map((entry) => {
          const parfait = byId.get(entry.parfaitId);
          if (!parfait) return null;
          return (
            <article key={entry.parfaitId} className="card flex flex-col p-5">
              <ParfaitGlass parfait={parfait} pantry={pantry} size="sm" />
              <h3 className="font-display mt-3 text-center text-xl font-semibold leading-tight">
                {parfait.name}
              </h3>
              <p className="text-center text-sm text-[var(--latte)]">
                {money(costPerServing(parfait, pantry))} each to make
              </p>
              <label className="mt-4 block rounded-2xl bg-[var(--oat)] p-3">
                <span className="kicker">How many</span>
                <div className="mt-1">
                  {locked ? (
                    <p className="font-display text-3xl font-semibold">{entry.planned}</p>
                  ) : (
                    <NumberField
                      value={entry.planned}
                      onChange={(planned) => updateEntry(trial.id, entry.parfaitId, { planned })}
                    />
                  )}
                </div>
              </label>
              <ul className="mt-3 space-y-1 text-xs">
                {parfait.ingredients.map((line) => {
                  const item = pantry.find((i) => i.id === line.itemId);
                  return item ? (
                    <li key={line.itemId} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ background: item.color }} />
                        {item.name}
                      </span>
                      <span className="font-bold">{formatQty(line.qtyPerServing * entry.planned, item.unit)}</span>
                    </li>
                  ) : null;
                })}
              </ul>
            </article>
          );
        })}
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <label className="w-56">
          <span className="kicker">Extra for spills &amp; tasting</span>
          <div className="mt-1 flex items-center gap-2">
            {locked ? (
              <p className="font-display text-xl font-semibold">{trial.wastePct}%</p>
            ) : (
              <>
                <NumberField value={trial.wastePct} onChange={(wastePct) => updateTrial(trial.id, { wastePct })} />
                <span className="font-bold text-[var(--latte)]">%</span>
              </>
            )}
          </div>
        </label>
        <button type="button" className="btn btn-teal" onClick={onNext}>
          🛒 See the combined list →
        </button>
      </div>
    </section>
  );
}

/* ---------------- shopping ---------------- */

function ShoppingTab({ trial }: { trial: Trial }) {
  const { parfaits, pantry, markBought, undoBought } = useShop();
  const lines = shoppingList(trial, parfaits, pantry);
  const total = lines.reduce((s, l) => s + l.cost, 0);
  const separate = separateCost(trial, parfaits, pantry);
  const savings = Math.max(0, separate - total);
  const nameOf = (id: string) => parfaits.find((p) => p.id === id)?.name ?? "?";

  if (trial.purchase) {
    const bought = trial.purchase.filter((l) => l.packs > 0);
    const spent = trial.purchase.reduce((s, l) => s + l.cost, 0);
    return (
      <section className="space-y-6">
        <div className="card-teal relative overflow-hidden p-5 sm:p-6">
          <p className="kicker">Bought</p>
          <p className="font-display mt-1 text-4xl font-semibold text-[var(--teal-deep)]">{money(spent)}</p>
          <p className="mt-2 text-sm text-[var(--cocoa-soft)]">
            Leftovers after this round were added to the pantry&apos;s &ldquo;on hand&rdquo;.
          </p>
          <span className="absolute -right-3 -top-3 text-6xl opacity-20" aria-hidden>
            🧾
          </span>
        </div>
        <Notepad title="Picked up — all checked off">
          {bought.map((l) => (
            <NoteRow key={l.itemId} mark="✓" markClass="text-[var(--teal)]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-xl font-semibold">{l.name}</h3>
                <span className="font-display font-semibold">{money(l.cost)}</span>
              </div>
              <p className="font-hand text-xl text-[var(--cocoa-soft)]">
                {l.packs} × {formatQty(l.packSize, l.unit)}
              </p>
            </NoteRow>
          ))}
        </Notepad>
        <button
          type="button"
          className="btn btn-ghost btn-sm print:hidden"
          onClick={() => {
            if (confirm("Undo this purchase? Pantry on-hand amounts will be put back.")) undoBought(trial.id);
          }}
        >
          ↺ Undo purchase
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Total label="Bought together" value={total} icon="🛒" />
        <Total label="Recipe by recipe" value={separate} icon="🧾" strike />
        <div className="card-teal relative overflow-hidden p-5">
          <p className="kicker">Saved by buying together</p>
          <p className="font-display mt-1 text-4xl font-semibold text-[var(--teal-deep)]">{money(savings)}</p>
          <p className="mt-2 text-sm text-[var(--cocoa-soft)]">
            shared tubs and bags cover more than one glass
          </p>
          <span className="absolute -right-3 -top-3 text-6xl opacity-20" aria-hidden>
            🪙
          </span>
        </div>
      </div>

      <Notepad title={`${trial.name} — the shopping list`}>
        {lines.map((l) => (
          <NoteRow
            key={l.item.id}
            mark={l.packs > 0 ? "☐" : "✓"}
            markClass={l.packs > 0 ? "text-[var(--cocoa)]" : "text-[var(--teal)]"}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white" style={{ background: l.item.color }} />
              <h3 className="font-display text-xl font-semibold">{l.item.name}</h3>
              {l.item.supplier ? <span className="tag !text-[0.68rem]">{l.item.supplier}</span> : null}
            </div>
            <p className="font-hand mt-0.5 text-xl leading-snug text-[var(--cocoa-soft)]">
              for {l.usedBy.map((u) => nameOf(u.parfaitId)).join(", ")}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-2xl bg-[var(--oat)] px-3 py-1.5">
                need <span className="font-bold">{formatQty(l.needed, l.item.unit)}</span>
                {l.item.onHand ? ` · ${formatQty(l.item.onHand, l.item.unit)} on hand` : ""}
              </span>
              <span className="text-[var(--latte)]">→</span>
              {l.packs > 0 ? (
                <span className="rounded-2xl bg-[var(--teal-mist)] px-3 py-1.5 text-[var(--teal-ink)]">
                  buy <span className="font-bold">{l.packs} × {formatQty(l.item.packSize, l.item.unit)}</span> ·{" "}
                  {money(l.cost)}
                </span>
              ) : (
                <span className="rounded-2xl bg-[var(--teal-mist)] px-3 py-1.5 text-[var(--teal-ink)]">
                  use what&apos;s on the shelf
                </span>
              )}
              <span className="text-xs text-[var(--latte)]">
                {formatQty(l.leftover, l.item.unit)} left over
              </span>
            </div>
          </NoteRow>
        ))}
        {lines.length === 0 ? (
          <p className="font-hand pl-14 pt-4 text-2xl text-[var(--latte)]">
            nothing to buy — set how many to make on the plan
          </p>
        ) : null}
      </Notepad>

      <div className="flex flex-wrap gap-3 print:hidden">
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
          🖨️ Print list
        </button>
        <button
          type="button"
          className="btn btn-teal"
          disabled={lines.length === 0}
          onClick={() =>
            markBought(
              trial.id,
              lines.map((l) => ({
                itemId: l.item.id,
                name: l.item.name,
                unit: l.item.unit,
                packSize: l.item.packSize,
                packs: l.packs,
                cost: l.cost,
                needed: l.needed,
              })),
            )
          }
        >
          ✓ Mark everything as bought
        </button>
      </div>
    </section>
  );
}

function Total({ label, value, icon, strike = false }: { label: string; value: number; icon: string; strike?: boolean }) {
  return (
    <div className="card relative overflow-hidden p-5">
      <p className="kicker">{label}</p>
      <p
        className={`font-display mt-1 text-4xl font-semibold ${
          strike ? "text-[var(--latte)] line-through decoration-[var(--cherry)] decoration-2" : ""
        }`}
      >
        {money(value)}
      </p>
      <span className="absolute -right-2 -top-2 text-6xl opacity-15" aria-hidden>
        {icon}
      </span>
    </div>
  );
}

function Notepad({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="notepad-top" aria-hidden />
      <div className="notepad px-4 pb-6 pt-8 sm:px-6">
        <p className="font-hand pl-14 text-3xl text-[var(--cocoa)]">{title}</p>
        <ul className="mt-4">{children}</ul>
      </div>
    </div>
  );
}

function NoteRow({ mark, markClass, children }: { mark: string; markClass: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[56px_1fr] border-b-2 border-dashed border-[var(--teal-mist)] py-4 last:border-0">
      <span className={`font-hand pt-0.5 text-center text-3xl leading-none ${markClass}`} aria-hidden>
        {mark}
      </span>
      <div className="min-w-0 pl-3">{children}</div>
    </li>
  );
}

/* ---------------- results ---------------- */

function ResultsTab({ trial, byId }: { trial: Trial; byId: Map<string, Parfait> }) {
  const { pantry, updateEntry } = useShop();
  const stats = trial.entries.map((e) => ({
    entry: e,
    parfait: byId.get(e.parfaitId),
    ...entryStats(e, byId.get(e.parfaitId), pantry),
  }));
  const fastest = Math.max(0, ...stats.map((s) => s.perHour ?? 0));

  return (
    <section className="space-y-10">
      <div className="grid gap-5 lg:grid-cols-2">
        {trial.entries.map((entry) => {
          const parfait = byId.get(entry.parfaitId);
          return parfait ? (
            <EntryCard
              key={entry.parfaitId}
              entry={entry}
              parfait={parfait}
              onChange={(patch) => updateEntry(trial.id, entry.parfaitId, patch)}
            />
          ) : null;
        })}
      </div>

      <div className="card-teal space-y-6 p-6 sm:p-8">
        <div>
          <p className="kicker">The verdict</p>
          <h2 className="font-display mt-1 text-3xl font-semibold text-[var(--teal-ink)]">Side by side</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Compare
            title="Sold out of made"
            rows={stats.map((s) => ({
              name: s.parfait?.name ?? "?",
              value: s.sellThrough,
              label: s.sellThrough === null ? "—" : `${s.entry.sold}/${s.entry.made}`,
            }))}
          />
          <Compare
            title="Sales per hour"
            rows={stats.map((s) => ({
              name: s.parfait?.name ?? "?",
              value: s.perHour === null || !fastest ? null : s.perHour / fastest,
              label: s.perHour === null ? "—" : `${s.perHour.toFixed(1)}/hr`,
            }))}
          />
          <Compare
            title="Average stars"
            rows={stats.map((s) => ({
              name: s.parfait?.name ?? "?",
              value: s.avgRating === null ? null : s.avgRating / 5,
              label: s.avgRating === null ? "—" : `${s.avgRating.toFixed(1)} ★`,
            }))}
          />
          <Compare
            title="Would buy again"
            rows={stats.map((s) => ({
              name: s.parfait?.name ?? "?",
              value: s.buyAgain,
              label: s.buyAgain === null ? "—" : `${Math.round(s.buyAgain * 100)}%`,
            }))}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <span
              key={s.entry.parfaitId}
              className={`tag ${s.profit < 0 ? "!bg-[#f6e3e3] !text-[#8a2b3a]" : "bg-[var(--paper)]"}`}
            >
              {s.parfait?.name}: {money(s.profit)} profit
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function EntryCard({
  entry,
  parfait,
  onChange,
}: {
  entry: TrialEntry;
  parfait: Parfait;
  onChange: (patch: Partial<TrialEntry>) => void;
}) {
  const { pantry } = useShop();
  const [rating, setRating] = useState(5);
  const [again, setAgain] = useState(true);
  const [comment, setComment] = useState("");

  const addFeedback = () => {
    onChange({ feedback: [...entry.feedback, { id: uid("f"), rating, wouldBuyAgain: again, comment: comment.trim() }] });
    setComment("");
    setRating(5);
    setAgain(true);
  };

  return (
    <article className="card space-y-5 p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <ParfaitGlass parfait={parfait} pantry={pantry} size="xs" animate={false} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-2xl font-semibold leading-tight">{parfait.name}</h3>
          <p className="font-hand text-xl text-[var(--latte)]">planned {entry.planned}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <label className="rounded-2xl bg-[var(--oat)] p-3">
          <span className="kicker">Made</span>
          <div className="mt-1">
            <NumberField value={entry.made} onChange={(made) => onChange({ made, sold: Math.min(entry.sold, made) })} />
          </div>
        </label>
        <label className="rounded-2xl bg-[var(--oat)] p-3">
          <span className="kicker">Sold</span>
          <div className="mt-1">
            <NumberField value={entry.sold} onChange={(sold) => onChange({ sold: Math.min(sold, entry.made || sold) })} />
          </div>
        </label>
        <label className="rounded-2xl bg-[var(--oat)] p-3">
          <span className="kicker">Hours</span>
          <div className="mt-1">
            <NumberField value={entry.hoursToSell} step={0.5} onChange={(hoursToSell) => onChange({ hoursToSell })} />
          </div>
        </label>
      </div>

      <div>
        <p className="kicker">💬 What customers said</p>
        <ul className="mt-3 space-y-3 pl-3">
          {entry.feedback.map((f) => (
            <li key={f.id} className="bubble flex items-start justify-between gap-2 text-sm">
              <span>
                <span className="text-[var(--caramel)]">
                  {"★".repeat(f.rating)}
                  <span className="text-[var(--oat-deep)]">{"★".repeat(5 - f.rating)}</span>
                </span>{" "}
                <span className={`tag !text-[0.68rem] ${f.wouldBuyAgain ? "tag-teal" : ""}`}>
                  {f.wouldBuyAgain ? "would buy again" : "wouldn't buy again"}
                </span>
                {f.comment ? (
                  <span className="font-hand mt-1 block text-xl leading-snug text-[var(--cocoa-soft)]">
                    &ldquo;{f.comment}&rdquo;
                  </span>
                ) : null}
              </span>
              <button
                type="button"
                aria-label="Remove feedback"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs text-[var(--latte)] hover:bg-[#f6e3e3] hover:text-[var(--cherry)]"
                onClick={() => onChange({ feedback: entry.feedback.filter((x) => x.id !== f.id) })}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-3 rounded-[22px] border-2 border-dashed border-[var(--line)] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} stars`}
                  onClick={() => setRating(n)}
                  className={`px-0.5 text-2xl transition hover:scale-110 ${
                    n <= rating ? "text-[var(--caramel)]" : "text-[var(--oat-deep)]"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <button type="button" className="chip !py-1" aria-pressed={again} onClick={() => setAgain(!again)}>
              {again ? "✓ would buy again" : "wouldn't buy again"}
            </button>
          </div>
          <div className="flex gap-2">
            <input
              className="field"
              placeholder="What did they say? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFeedback()}
            />
            <button type="button" className="btn btn-teal btn-sm shrink-0" onClick={addFeedback}>
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Compare({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; value: number | null; label: string }[];
}) {
  const best = Math.max(...rows.map((r) => r.value ?? -1));
  return (
    <div>
      <p className="font-display font-semibold text-[var(--teal-ink)]">{title}</p>
      <div className="mt-2 space-y-2">
        {rows.map((r) => {
          const top = r.value !== null && r.value === best && best > 0;
          return (
            <div key={r.name} className="grid grid-cols-[minmax(0,8rem)_1fr_4.5rem] items-center gap-3 text-sm">
              <span className={`truncate ${top ? "font-bold" : ""}`}>
                {top ? "👑 " : ""}
                {r.name}
              </span>
              <div className="meter !bg-[var(--paper)]">
                <span
                  style={{
                    width: `${Math.round((r.value ?? 0) * 100)}%`,
                    background: top ? "var(--teal)" : "var(--crust)",
                  }}
                />
              </div>
              <span className="text-right font-bold text-[var(--cocoa-soft)]">{r.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
