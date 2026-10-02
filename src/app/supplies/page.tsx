"use client";

import { ParfaitGlass } from "@/components/ParfaitGlass";
import { binFor, CAMPUS, campusCheck, localShare, menuPrice } from "@/lib/desk";
import { getIngredient } from "@/lib/ingredients";
import { recipeCost } from "@/lib/recipes";
import { useShop } from "@/lib/store";
import {
  hikedPrice,
  optimizePurchasing,
  purchasingTotals,
  SUPPLIER_MAP,
} from "@/lib/suppliers";
import type { PurchaseAction, PurchaseLine } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

const GROUPS: { action: PurchaseAction; title: string; mark: string; markClass: string }[] = [
  { action: "drop", title: "Cross these off", mark: "✕", markClass: "text-[var(--cherry)]" },
  { action: "switch", title: "Call someone else", mark: "⇄", markClass: "text-[var(--caramel)]" },
  { action: "add", title: "Add to the list", mark: "+", markClass: "text-[var(--teal)]" },
  { action: "keep", title: "Same as always", mark: "✓", markClass: "text-[var(--teal-deep)]" },
];

const SUPPLIER_KIND: Record<string, string> = {
  trusted: "🤝 trusted",
  local: "🌾 local",
  wholesale: "🚚 wholesale",
};

export default function SuppliesPage() {
  const { fotm, campusYes, takeCampus } = useShop();
  const [hike, setHike] = useState(25);
  const lines = useMemo(() => optimizePurchasing(fotm, hike), [fotm, hike]);
  const totals = purchasingTotals(lines, hike);
  const visible = lines.filter((line) => line.action !== "keep" || line.needed);
  const campus = campusCheck(fotm, lines);
  const local = localShare(lines);
  const baseCost = fotm ? recipeCost(fotm) : 0;
  const todayPrice = fotm ? menuPrice(fotm, hike) : 0;
  const yesterdayPrice = fotm ? menuPrice(fotm, 0) : 0;

  return (
    <div className="space-y-10">
      <header className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">
          <p className="kicker">Morning list</p>
          <h1 className="font-display mt-2 text-4xl font-semibold leading-tight sm:text-5xl">
            One list: what to buy, who still has it, and can campus have forty by four?
          </h1>
          <p className="mt-3 text-lg text-[var(--cocoa-soft)]">
            Habit, local growers, the cream hike, the jars that spoil Thursday, and the
            Union&apos;s last-minute tray all read from the crowned parfait.
          </p>
        </div>
        {fotm ? (
          <div className="card flex items-center gap-3 p-3 pr-5">
            <ParfaitGlass recipe={fotm} size="xs" animate={false} />
            <div>
              <p className="kicker !text-[0.65rem]">Shopping for</p>
              <p className="font-display font-semibold leading-tight">{fotm.name}</p>
            </div>
          </div>
        ) : null}
      </header>

      {/* ---------- totals ---------- */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Total label="The usual week" value={totals.habitual} icon="🧾" />
        <Total
          label="Tomorrow's list"
          value={totals.optimized}
          icon="🛒"
          note={`${local}% local or in-house`}
        />
        <div className="card-teal relative overflow-hidden p-5">
          <p className="kicker">Left in the till</p>
          <p className="font-display mt-1 text-4xl font-semibold text-[var(--teal-deep)]">
            ${totals.saved.toFixed(2)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="tag">✕ {totals.dropped} dropped</span>
            <span className="tag">⇄ {totals.switched} switched</span>
            <span className="tag">+ {totals.added} added</span>
          </div>
          <span className="absolute -right-3 -top-3 text-6xl opacity-20" aria-hidden>
            🪙
          </span>
        </div>
      </section>

      {/* ---------- cream hike + campus ---------- */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="kicker">🥛 Cream hike</p>
              <h2 className="font-display mt-1 text-2xl font-semibold">
                Meadowdale is up {hike}%
              </h2>
            </div>
            <span className="font-display rounded-2xl bg-[var(--oat)] px-3 py-1 text-3xl font-semibold">
              {hike}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={80}
            value={hike}
            onChange={(event) => setHike(Number(event.target.value))}
            className="mt-4 w-full accent-[var(--teal)]"
            aria-label="Cream price hike"
          />
          <div className="flex justify-between text-xs text-[var(--latte)]">
            <span>no hike</span>
            <span>+80%</span>
          </div>
          <p className="mt-3 text-sm text-[var(--cocoa-soft)]">
            {fotm ? (
              <>
                The glass costs <strong>${baseCost.toFixed(2)}</strong>. Charge{" "}
                <strong className="text-[var(--teal-deep)]">${todayPrice.toFixed(2)}</strong>
                {todayPrice > yesterdayPrice
                  ? `, up from $${yesterdayPrice.toFixed(2)}, so the hike doesn't eat October.`
                  : ". No need to touch the board yet."}
              </>
            ) : (
              "Slide it to see who still sells cream when Meadowdale raises prices. Local growers hold steady."
            )}
          </p>
        </div>

        <div className={`p-5 sm:p-6 ${campusYes ? "card-teal" : "card"}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="kicker">
                🎓 {CAMPUS.who} · {CAMPUS.event}
              </p>
              <h2 className="font-display mt-1 text-2xl font-semibold">
                {CAMPUS.qty} parfaits by {CAMPUS.by}
              </h2>
            </div>
            <span
              className={`tag shrink-0 ${campus.yes ? "tag-teal" : "!bg-[var(--butter)] !text-[var(--cocoa)]"}`}
            >
              {campus.yes ? "pantry covers it" : fotm ? "short a few" : "crown first"}
            </span>
          </div>
          <p className="mt-3 text-sm text-[var(--cocoa-soft)]">{campus.note}</p>
          {campus.missing.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {campus.missing.map((ingredient) => (
                <span key={ingredient.id} className="tag">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: ingredient.color }}
                  />
                  {ingredient.name}
                </span>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => takeCampus(!campusYes)}
            disabled={!fotm}
            className={`btn btn-sm mt-4 ${campusYes ? "btn-ghost" : "btn-teal"} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {campusYes
              ? "✓ On the slate (tap to undo)"
              : campus.yes
                ? "Say yes"
                : "Say yes, call the grower"}
          </button>
        </div>
      </section>

      {!fotm ? (
        <section className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[var(--cocoa-soft)]">
            <span className="font-display font-semibold text-[var(--cocoa)]">
              No flavor crowned yet.
            </span>{" "}
            This is a cleanup of the habitual order: cream bought twice, a trade-war
            price hike, and the pumpkin she stocked to look like next door.
          </p>
          <Link href="/flavor" className="btn btn-teal btn-sm shrink-0">
            👑 Crown a parfait
          </Link>
        </section>
      ) : null}

      {/* ---------- the notepad ---------- */}
      <section className="mx-auto max-w-4xl">
        <div className="notepad-top" aria-hidden />
        <div className="notepad px-4 pb-6 pt-8 sm:px-6">
          <p className="font-hand pl-14 text-3xl text-[var(--cocoa)]">
            Tomorrow, 5:30am — the calls
          </p>
          {GROUPS.map((group) => {
            const rows = visible.filter((line) => line.action === group.action);
            if (rows.length === 0) return null;
            return (
              <div key={group.action} className="mt-6">
                <h2 className="font-display flex items-center gap-2 pl-14 text-sm font-semibold uppercase tracking-wider text-[var(--latte)]">
                  {group.title}
                  <span className="tag">{rows.length}</span>
                </h2>
                <ul className="mt-2">
                  {rows.map((line) => (
                    <ListRow
                      key={line.ingredientId}
                      line={line}
                      hike={hike}
                      mark={group.mark}
                      markClass={group.markClass}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Total({
  label,
  value,
  icon,
  note,
}: {
  label: string;
  value: number;
  icon: string;
  note?: string;
}) {
  return (
    <div className="card relative overflow-hidden p-5">
      <p className="kicker">{label}</p>
      <p className="font-display mt-1 text-4xl font-semibold">${value.toFixed(2)}</p>
      {note ? <p className="mt-2 text-sm text-[var(--cocoa-soft)]">{note}</p> : null}
      <span className="absolute -right-2 -top-2 text-6xl opacity-15" aria-hidden>
        {icon}
      </span>
    </div>
  );
}

function ListRow({
  line,
  hike,
  mark,
  markClass,
}: {
  line: PurchaseLine;
  hike: number;
  mark: string;
  markClass: string;
}) {
  const ingredient = getIngredient(line.ingredientId);
  const chosen = line.chosenOffer ? SUPPLIER_MAP[line.chosenOffer.supplierId] : null;
  const old = line.habitualOffer ? SUPPLIER_MAP[line.habitualOffer.supplierId] : null;
  const dropped = line.action === "drop";
  const flags = [...new Set(line.habitualOffer?.flags ?? [])];
  const bin = binFor(line.ingredientId);
  const oldPrice = line.habitualOffer ? hikedPrice(line.habitualOffer, hike) : null;
  const chosenPrice = line.chosenOffer ? hikedPrice(line.chosenOffer, hike) : null;

  return (
    <li className="grid grid-cols-[56px_1fr] border-b-2 border-dashed border-[var(--teal-mist)] py-4 last:border-0">
      <span className={`font-hand pt-0.5 text-center text-3xl leading-none ${markClass}`} aria-hidden>
        {mark}
      </span>
      <div className="min-w-0 pl-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className="h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white"
            style={{ background: ingredient.color }}
          />
          <h3
            className={`font-display text-xl font-semibold ${
              dropped ? "text-[var(--latte)] line-through decoration-[var(--cherry)] decoration-2" : ""
            }`}
          >
            {ingredient.name}
          </h3>
          {flags.map((flag) => (
            <span key={flag} className="tag !bg-[#fbe7d6] !text-[#9a4b1a] !text-[0.68rem]">
              {flag.replace("-", " ")}
            </span>
          ))}
        </div>
        <p className="font-hand mt-0.5 text-xl leading-snug text-[var(--cocoa-soft)]">
          {line.reason}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          {old && line.habitualOffer && oldPrice !== null ? (
            <span
              className={`rounded-2xl bg-[var(--oat)] px-3 py-1.5 ${
                line.action === "switch" || dropped ? "opacity-70" : ""
              }`}
            >
              <span className="font-bold">{old.name}</span> · ${oldPrice.toFixed(2)}/
              {line.habitualOffer.unit}
            </span>
          ) : (
            <span className="rounded-2xl bg-[var(--oat)] px-3 py-1.5 text-[var(--latte)]">
              not on the usual call
            </span>
          )}
          {line.action !== "keep" ? <span className="text-[var(--latte)]">→</span> : null}
          {line.action !== "keep" ? (
            chosen && line.chosenOffer && chosenPrice !== null ? (
              <span className="rounded-2xl bg-[var(--teal-mist)] px-3 py-1.5 text-[var(--teal-ink)]">
                <span className="font-bold">{chosen.name}</span> · ${chosenPrice.toFixed(2)}/
                {line.chosenOffer.unit} · {line.weeklyQty} this week
                <span className="ml-1.5 text-xs opacity-75">
                  {SUPPLIER_KIND[chosen.kind]}, {chosen.minutesAway} min
                </span>
              </span>
            ) : (
              <span className="rounded-2xl bg-[#f6e3e3] px-3 py-1.5 text-[#8a2b3a]">leave it off</span>
            )
          ) : (
            <span className="text-xs text-[var(--latte)]">
              {line.weeklyQty} this week · {chosen ? SUPPLIER_KIND[chosen.kind] : ""}
            </span>
          )}
        </div>
        {line.needed ? (
          <p className="mt-2 text-xs text-[var(--latte)]">
            🫙 {bin.onHand} on the shelf
            {bin.spoilsIn ? ` · spoils in ${bin.spoilsIn} days` : ""} · last paid {bin.lastPaid}
            {bin.bill ? ` · ${bin.bill}` : ""}
          </p>
        ) : null}
      </div>
    </li>
  );
}
