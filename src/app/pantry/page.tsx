"use client";

import { NumberField } from "@/components/NumberField";
import { money, uid, unitPrice } from "@/lib/planner";
import { useShop } from "@/lib/store";
import type { Layer, PantryItem, Unit } from "@/lib/types";

const UNITS: Unit[] = ["g", "ml", "each"];
const LAYERS: { value: Layer; label: string }[] = [
  { value: "base", label: "Base" },
  { value: "cream", label: "Cream" },
  { value: "fruit", label: "Fruit" },
  { value: "crunch", label: "Crunch" },
  { value: "drizzle", label: "Drizzle" },
  { value: "garnish", label: "Garnish" },
];

export default function PantryPage() {
  const { pantry, parfaits, savePantryItem, deletePantryItem } = useShop();

  const update = (item: PantryItem, patch: Partial<PantryItem>) =>
    savePantryItem({ ...item, ...patch });

  const add = () =>
    savePantryItem({
      id: uid("i"),
      name: "New ingredient",
      unit: "g",
      packSize: 1000,
      packPrice: 0,
      supplier: "",
      onHand: 0,
      color: "#d8c3a5",
      layer: "cream",
    });

  const usedIn = (id: string) =>
    parfaits.filter((p) => p.ingredients.some((l) => l.itemId === id)).length;

  const shelfValue = pantry.reduce((sum, item) => sum + unitPrice(item) * item.onHand, 0);

  return (
    <div className="space-y-10">
      <header className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">
          <p className="kicker">Pantry</p>
          <h1 className="font-display mt-2 text-4xl font-semibold leading-tight sm:text-5xl">
            What comes in a tub, a bag, or a crate.
          </h1>
          <p className="mt-3 text-lg text-[var(--cocoa-soft)]">
            The shopping list rounds up to whole packs, so set the pack size and
            price Grandma actually pays. Whatever&apos;s on the shelf gets used
            before anything new is bought.
          </p>
        </div>
        <div className="card flex items-center gap-4 p-4 pr-5">
          <span className="text-4xl" aria-hidden>
            🧺
          </span>
          <div>
            <p className="kicker !text-[0.65rem]">On the shelf now</p>
            <p className="font-display text-2xl font-semibold">{money(shelfValue)}</p>
          </div>
        </div>
      </header>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[var(--line)] px-5 py-4">
          <p className="font-hand text-2xl text-[var(--latte)]">
            {pantry.length} things on the shelf list
          </p>
          <button type="button" className="btn btn-teal btn-sm" onClick={add}>
            + Add ingredient
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="text-left">
                {["Ingredient", "Layer", "Unit", "Pack size", "Pack price", "Supplier", "On hand", "Per unit", ""].map(
                  (heading) => (
                    <th key={heading} className="kicker px-2 pb-2 pt-4 first:pl-5">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {pantry.map((item) => (
                <tr key={item.id} className="border-t-2 border-dashed border-[var(--teal-mist)]">
                  <td className="py-2.5 pl-5 pr-2">
                    <div className="flex items-center gap-2">
                      <label
                        className="relative h-8 w-8 shrink-0 cursor-pointer rounded-full shadow-[0_2px_0_var(--line)] ring-2 ring-white"
                        style={{ background: item.color }}
                        title="Layer color"
                      >
                        <input
                          type="color"
                          aria-label={`${item.name} color`}
                          value={item.color}
                          onChange={(e) => update(item, { color: e.target.value })}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                      </label>
                      <input
                        className="field"
                        aria-label="Ingredient name"
                        value={item.name}
                        onChange={(e) => update(item, { name: e.target.value })}
                      />
                    </div>
                  </td>
                  <td className="p-2">
                    <select
                      className="field"
                      aria-label="Layer"
                      value={item.layer ?? "cream"}
                      onChange={(e) => update(item, { layer: e.target.value as Layer })}
                    >
                      {LAYERS.map((layer) => (
                        <option key={layer.value} value={layer.value}>
                          {layer.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      className="field"
                      aria-label="Unit"
                      value={item.unit}
                      onChange={(e) => update(item, { unit: e.target.value as Unit })}
                    >
                      {UNITS.map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <NumberField value={item.packSize} onChange={(packSize) => update(item, { packSize })} />
                  </td>
                  <td className="p-2">
                    <NumberField value={item.packPrice} step={0.01} onChange={(packPrice) => update(item, { packPrice })} />
                  </td>
                  <td className="p-2">
                    <input
                      className="field"
                      aria-label="Supplier"
                      value={item.supplier}
                      onChange={(e) => update(item, { supplier: e.target.value })}
                    />
                  </td>
                  <td className="p-2">
                    <NumberField value={item.onHand} onChange={(onHand) => update(item, { onHand })} />
                  </td>
                  <td className="whitespace-nowrap p-2">
                    <span className="tag">
                      {money(unitPrice(item) * (item.unit === "each" ? 1 : 100))}
                      {item.unit === "each" ? " each" : ` / 100 ${item.unit}`}
                    </span>
                  </td>
                  <td className="p-2 pr-5 text-right">
                    <button
                      type="button"
                      aria-label={`Delete ${item.name}`}
                      className="grid h-8 w-8 place-items-center rounded-full text-[var(--latte)] transition hover:bg-[#f6e3e3] hover:text-[var(--cherry)]"
                      onClick={() => {
                        const n = usedIn(item.id);
                        if (n === 0 || confirm(`Used in ${n} parfait(s). Remove it from them too?`)) {
                          deletePantryItem(item.id);
                        }
                      }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="font-hand text-center text-2xl text-[var(--latte)]">
        tip: fruit is easiest counted as &ldquo;each&rdquo; — half an apple is 0.5
      </p>
    </div>
  );
}
