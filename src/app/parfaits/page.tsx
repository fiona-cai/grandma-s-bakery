"use client";

import { NumberField } from "@/components/NumberField";
import { ParfaitGlass } from "@/components/ParfaitGlass";
import { costPerServing, money, uid } from "@/lib/planner";
import { useShop } from "@/lib/store";
import type { Parfait, ParfaitStatus } from "@/lib/types";
import { useState } from "react";

const STATUSES: { value: ParfaitStatus; label: string }[] = [
  { value: "idea", label: "💡 Idea" },
  { value: "testing", label: "🥄 Testing" },
  { value: "winner", label: "👑 Winner" },
  { value: "retired", label: "📦 Retired" },
];

export default function ParfaitsPage() {
  const { parfaits, pantry, saveParfait, deleteParfait } = useShop();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = parfaits.find((p) => p.id === selectedId) ?? parfaits[0] ?? null;

  const add = () => {
    const parfait: Parfait = {
      id: uid("p"),
      name: "New parfait",
      notes: "",
      sellPrice: 8,
      status: "idea",
      ingredients: [],
    };
    saveParfait(parfait);
    setSelectedId(parfait.id);
  };

  return (
    <div className="space-y-10">
      <header className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">
          <p className="kicker">Parfaits</p>
          <h1 className="font-display mt-2 text-4xl font-semibold leading-tight sm:text-5xl">
            Every glass Grandma has tried, written for one serving.
          </h1>
          <p className="mt-3 text-lg text-[var(--cocoa-soft)]">
            Enter how much of each ingredient goes into one parfait. The trial
            planner does the multiplying, and cost and margin update as you type.
          </p>
        </div>
        <button type="button" className="btn btn-teal" onClick={add}>
          + New parfait
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <ul className="space-y-3">
          {parfaits.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={selected?.id === p.id}
                onClick={() => setSelectedId(p.id)}
                className="pick flex w-full items-center gap-3"
              >
                <ParfaitGlass parfait={p} pantry={pantry} size="xs" animate={false} />
                <div className="min-w-0 flex-1">
                  <p className="font-display truncate text-lg font-semibold leading-tight">{p.name}</p>
                  <p className="mt-1 flex flex-wrap gap-1">
                    <span className="tag !text-[0.68rem]">{p.status}</span>
                    <span className="tag tag-teal !text-[0.68rem]">
                      {money(costPerServing(p, pantry))} → {money(p.sellPrice)}
                    </span>
                  </p>
                </div>
              </button>
            </li>
          ))}
          {parfaits.length === 0 ? (
            <li className="font-hand text-2xl text-[var(--latte)]">no parfaits yet — add one!</li>
          ) : null}
        </ul>

        {selected ? (
          <Editor
            key={selected.id}
            parfait={selected}
            onChange={saveParfait}
            onDelete={() => {
              if (confirm(`Delete ${selected.name}? It will also be removed from trial rounds.`)) {
                deleteParfait(selected.id);
                setSelectedId(null);
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function Editor({
  parfait,
  onChange,
  onDelete,
}: {
  parfait: Parfait;
  onChange: (p: Parfait) => void;
  onDelete: () => void;
}) {
  const { pantry } = useShop();
  const set = (patch: Partial<Parfait>) => onChange({ ...parfait, ...patch });
  const cost = costPerServing(parfait, pantry);
  const margin = parfait.sellPrice > 0 ? (parfait.sellPrice - cost) / parfait.sellPrice : 0;
  const unused = pantry.filter((i) => !parfait.ingredients.some((l) => l.itemId === i.id));

  const setLine = (index: number, patch: Partial<Parfait["ingredients"][number]>) =>
    set({
      ingredients: parfait.ingredients.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    });

  const move = (index: number, dir: -1 | 1) => {
    const next = [...parfait.ingredients];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set({ ingredients: next });
  };

  return (
    <section className="card pop-in space-y-6 p-5 sm:p-6">
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <div className="relative mx-auto w-48">
          <div
            className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--teal-mist)]"
            aria-hidden
          />
          <div className="relative py-2">
            <ParfaitGlass parfait={parfait} pantry={pantry} size="md" spoon />
          </div>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="kicker">Name</span>
            <input
              className="field font-display mt-1 !text-xl"
              value={parfait.name}
              onChange={(e) => set({ name: e.target.value })}
            />
          </label>
          <div>
            <span className="kicker">Status</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className="chip !py-1.5"
                  aria-pressed={parfait.status === s.value}
                  onClick={() => set({ status: s.value })}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="kicker">Notes</span>
            <textarea
              className="field mt-1"
              rows={2}
              value={parfait.notes}
              onChange={(e) => set({ notes: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <label className="rounded-2xl bg-[var(--oat)] p-3">
          <span className="kicker">Sell price</span>
          <div className="mt-1">
            <NumberField value={parfait.sellPrice} step={0.25} onChange={(sellPrice) => set({ sellPrice })} />
          </div>
        </label>
        <Stat label="Ingredients" value={money(cost)} />
        <Stat label="Profit each" value={money(parfait.sellPrice - cost)} />
        <Stat label="Margin" value={`${Math.round(margin * 100)}%`} teal={margin >= 0.6} />
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="kicker">In one glass</p>
          <p className="font-hand text-xl text-[var(--latte)]">bottom layer first ↓</p>
        </div>
        <ul className="mt-2">
          {parfait.ingredients.map((line, index) => {
            const item = pantry.find((i) => i.id === line.itemId);
            return (
              <li
                key={`${line.itemId}-${index}`}
                className="flex items-center gap-2 border-b-2 border-dashed border-[var(--teal-mist)] py-2.5 last:border-0"
              >
                <div className="flex flex-col">
                  <button
                    type="button"
                    className="px-1 text-xs leading-none text-[var(--latte)] hover:text-[var(--teal)]"
                    onClick={() => move(index, -1)}
                    aria-label="Move up the list"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="px-1 text-xs leading-none text-[var(--latte)] hover:text-[var(--teal)]"
                    onClick={() => move(index, 1)}
                    aria-label="Move down the list"
                  >
                    ▼
                  </button>
                </div>
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white"
                  style={{ background: item?.color ?? "#ccc" }}
                />
                <select
                  className="field flex-1"
                  aria-label="Ingredient"
                  value={line.itemId}
                  onChange={(e) => setLine(index, { itemId: e.target.value })}
                >
                  {item ? <option value={item.id}>{item.name}</option> : null}
                  {unused.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
                <div className="w-24">
                  <NumberField
                    value={line.qtyPerServing}
                    step={item?.unit === "each" ? 0.25 : 1}
                    onChange={(qtyPerServing) => setLine(index, { qtyPerServing })}
                  />
                </div>
                <span className="w-10 text-sm font-bold text-[var(--latte)]">{item?.unit}</span>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full text-[var(--latte)] transition hover:bg-[#f6e3e3] hover:text-[var(--cherry)]"
                  aria-label="Remove ingredient"
                  onClick={() => set({ ingredients: parfait.ingredients.filter((_, i) => i !== index) })}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="btn btn-ghost btn-sm mt-3"
          disabled={unused.length === 0}
          onClick={() =>
            set({ ingredients: [...parfait.ingredients, { itemId: unused[0].id, qtyPerServing: 0 }] })
          }
        >
          + Add a layer
        </button>
        {unused.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--latte)]">Add more ingredients on the Pantry page.</p>
        ) : null}
      </div>

      <div className="border-t-2 border-dashed border-[var(--line)] pt-4 text-right">
        <button
          type="button"
          className="text-sm font-bold text-[var(--cherry)] hover:underline"
          onClick={onDelete}
        >
          Delete parfait
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value, teal = false }: { label: string; value: string; teal?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 ${teal ? "bg-[var(--teal-mist)]" : "bg-[var(--oat)]"}`}>
      <p className="kicker">{label}</p>
      <p className={`font-display mt-1 text-2xl font-semibold ${teal ? "text-[var(--teal-deep)]" : ""}`}>
        {value}
      </p>
    </div>
  );
}
