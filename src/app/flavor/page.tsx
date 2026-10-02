"use client";

import { Avatar } from "@/components/Avatar";
import { GuestCard } from "@/components/GuestCard";
import { ParfaitGlass } from "@/components/ParfaitGlass";
import { PERSONA_MAP } from "@/lib/personas";
import { BAKERY_AUTUMN, generateBatch, recipeIngredients } from "@/lib/recipes";
import { mulberry32 } from "@/lib/rng";
import { useShop } from "@/lib/store";
import { evaluateBatch, evaluateRecipe } from "@/lib/tasting";
import type { Allergen, Brief, Budget, TastingResult, Vibe } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

const VIBES: { id: Vibe; label: string; hint: string; icon: string }[] = [
  { id: "classic", label: "Hometown classic", hint: "Friday table, apple, brown butter", icon: "🍎" },
  { id: "date", label: "Conversation starter", hint: "Pretty, shareable, a little unexpected", icon: "🌷" },
  { id: "critic", label: "Critic bait", hint: "A point of view next door can't copy", icon: "🧐" },
  { id: "bright", label: "Light & bright", hint: "Fruit first, after-yoga friendly", icon: "🍋" },
];

const BUDGETS: { id: Budget; label: string; icon: string }[] = [
  { id: "tight", label: "Tight week", icon: "🪙" },
  { id: "comfortable", label: "Comfortable", icon: "👛" },
  { id: "splurge", label: "Splurge", icon: "💎" },
];

const ALLERGENS: { id: Allergen; label: string }[] = [
  { id: "nuts", label: "No nuts" },
  { id: "dairy", label: "No dairy" },
  { id: "gluten", label: "No gluten" },
];

const VERDICTS: Record<TastingResult["verdict"], { label: string; icon: string; tone: string }> = {
  "crowd-pleaser": { label: "Crowd-pleaser", icon: "🎉", tone: "bg-[var(--teal)] text-white" },
  polarizing: { label: "Polarizing", icon: "⚡", tone: "bg-[var(--butter)] text-[var(--cocoa)]" },
  niche: { label: "Niche love", icon: "💛", tone: "bg-[var(--oat)] text-[var(--cocoa-soft)]" },
  pass: { label: "Not this one", icon: "🙅", tone: "bg-[#f6d6d6] text-[#8a2b3a]" },
};

function makeBatch(brief: Brief, nonce: number) {
  const random = mulberry32(nonce + brief.vibe.length * 17 + brief.budget.length * 31);
  return evaluateBatch(generateBatch(brief, random));
}

export default function FlavorPage() {
  const { fotm, adoptFotm } = useShop();
  const [brief, setBrief] = useState<Brief>({
    vibe: "classic",
    budget: "comfortable",
    avoid: [],
  });
  const [nonce, setNonce] = useState(202610);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(() => makeBatch(brief, nonce), [brief, nonce]);
  const bakery = useMemo(() => evaluateRecipe(BAKERY_AUTUMN), []);
  const selected = results.find((result) => result.recipe.id === selectedId) ?? results[0];

  function updateBrief(patch: Partial<Brief>) {
    setBrief((current) => ({ ...current, ...patch }));
    setSelectedId(null);
  }

  function toggleAvoid(allergen: Allergen) {
    updateBrief({
      avoid: brief.avoid.includes(allergen)
        ? brief.avoid.filter((item) => item !== allergen)
        : [...brief.avoid, allergen],
    });
  }

  function crown(result: TastingResult) {
    adoptFotm(result.recipe, [
      result,
      ...results.filter((row) => row.recipe.id !== result.recipe.id),
    ]);
  }

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <p className="kicker">Flavor studio</p>
        <h1 className="font-display mt-2 text-4xl font-semibold leading-tight sm:text-5xl">
          Stack a glass, then let the neighborhood argue.
        </h1>
        <p className="mt-3 text-lg text-[var(--cocoa-soft)]">
          Tell Grandma the mood. She&apos;ll pull four glasses from the pantry, the jury
          argues, and the winner writes the window card: languages, allergens, and a
          traveler cup, so the line never stops for Translate or Yelp.
        </p>
      </header>

      {/* ---------- order ticket ---------- */}
      <section className="card relative p-5 sm:p-7">
        <span className="font-hand absolute -top-5 left-6 rotate-[-3deg] rounded-full bg-[var(--cocoa)] px-4 py-1 text-xl text-[var(--cream)]">
          today&apos;s order ticket
        </span>
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <fieldset>
            <legend className="font-display text-lg font-semibold">
              What should October taste like?
            </legend>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {VIBES.map((vibe) => (
                <button
                  key={vibe.id}
                  type="button"
                  aria-pressed={brief.vibe === vibe.id}
                  onClick={() => updateBrief({ vibe: vibe.id })}
                  className="pick flex items-start gap-3"
                >
                  <span className="text-2xl" aria-hidden>
                    {vibe.icon}
                  </span>
                  <span>
                    <span className="font-display block font-semibold">{vibe.label}</span>
                    <span className="block text-sm text-[var(--cocoa-soft)]">{vibe.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-6">
            <fieldset>
              <legend className="font-display text-lg font-semibold">Ingredient budget</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {BUDGETS.map((budget) => (
                  <button
                    key={budget.id}
                    type="button"
                    aria-pressed={brief.budget === budget.id}
                    onClick={() => updateBrief({ budget: budget.id })}
                    className="chip"
                  >
                    <span aria-hidden>{budget.icon}</span>
                    {budget.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-display text-lg font-semibold">Leave these out</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {ALLERGENS.map((allergen) => (
                  <button
                    key={allergen.id}
                    type="button"
                    aria-pressed={brief.avoid.includes(allergen.id)}
                    onClick={() => toggleAvoid(allergen.id)}
                    className="chip"
                  >
                    {brief.avoid.includes(allergen.id) ? "✕ " : ""}
                    {allergen.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <button
              type="button"
              onClick={() => {
                setNonce((value) => value + 11);
                setSelectedId(null);
              }}
              className="btn btn-cocoa w-full sm:w-auto"
            >
              🔄 Bake another batch
            </button>
          </div>
        </div>
      </section>

      {/* ---------- display shelf ---------- */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold">Fresh out of the kitchen</h2>
          <p className="font-hand text-xl text-[var(--latte)]">tap a glass to taste it ↓</p>
        </div>
        <div className="shelf mt-4">
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4">
            {results.map((result, index) => {
              const active = selected?.recipe.id === result.recipe.id;
              return (
                <button
                  key={result.recipe.id}
                  type="button"
                  onClick={() => setSelectedId(result.recipe.id)}
                  aria-pressed={active}
                  className={`group relative flex flex-col items-center rounded-t-[28px] px-2 pt-4 transition ${
                    active ? "bg-[var(--teal-foam)]" : "hover:bg-[var(--oat)]/60"
                  }`}
                >
                  {index === 0 ? (
                    <span className="tag tag-teal absolute left-2 top-2 !text-[0.68rem]">
                      ⭐ Jury pick
                    </span>
                  ) : null}
                  {fotm?.id === result.recipe.id ? (
                    <span className="absolute right-2 top-2 text-xl" title="Crowned">
                      👑
                    </span>
                  ) : null}
                  <div
                    className={`transition duration-300 ${
                      active ? "-translate-y-2" : "group-hover:-translate-y-1"
                    }`}
                  >
                    <ParfaitGlass recipe={result.recipe} size="md" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {results.map((result) => {
            const active = selected?.recipe.id === result.recipe.id;
            return (
              <button
                key={result.recipe.id}
                type="button"
                onClick={() => setSelectedId(result.recipe.id)}
                className={`rounded-3xl border-2 p-3 text-left transition ${
                  active
                    ? "border-[var(--teal)] bg-[var(--teal-foam)]"
                    : "border-transparent hover:border-[var(--line)]"
                }`}
              >
                <h3 className="font-display font-semibold leading-snug">{result.recipe.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="tag">⭐ {result.appeal.toFixed(1)}</span>
                  <span className="tag">🙋 {Math.round(result.wouldOrderShare * 100)}%</span>
                  <span className="tag">${result.cost.toFixed(2)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selected ? (
        <TastingRoom
          key={selected.recipe.id}
          result={selected}
          bakery={bakery}
          crowned={fotm?.id === selected.recipe.id}
          onCrown={() => crown(selected)}
        />
      ) : null}

      {selected ? <GuestCard recipe={selected.recipe} /> : null}
    </div>
  );
}

function TastingRoom({
  result,
  bakery,
  crowned,
  onCrown,
}: {
  result: TastingResult;
  bakery: TastingResult;
  crowned: boolean;
  onCrown: () => void;
}) {
  const layers = recipeIngredients(result.recipe);
  const beatBakery = result.appeal - bakery.appeal;
  const verdict = VERDICTS[result.verdict];

  return (
    <section className="pop-in grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      {/* recipe card */}
      <div className="card h-fit p-6 lg:sticky lg:top-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="kicker">Recipe card</p>
            <h2 className="font-display mt-1 text-3xl font-semibold leading-tight">
              {result.recipe.name}
            </h2>
            <p className="font-hand mt-1 text-xl text-[var(--latte)]">{result.recipe.tagline}</p>
          </div>
          <span className={`tag shrink-0 ${verdict.tone}`}>
            {verdict.icon} {verdict.label}
          </span>
        </div>

        <div className="mt-5 grid items-center gap-5 sm:grid-cols-[auto_1fr]">
          <ParfaitGlass recipe={result.recipe} size="lg" spoon />
          <ol className="space-y-2">
            {layers
              .slice()
              .reverse()
              .map((ingredient) => (
                <li
                  key={ingredient.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--cream)] px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 shrink-0 rounded-full ring-2 ring-white"
                      style={{ background: ingredient.color }}
                    />
                    <span>
                      <span className="block font-bold leading-tight">{ingredient.name}</span>
                      <span className="block text-xs capitalize text-[var(--latte)]">
                        {ingredient.layer}
                        {ingredient.local ? " · local" : ""}
                      </span>
                    </span>
                  </span>
                  <span className="font-display text-[var(--cocoa-soft)]">
                    ${ingredient.cost.toFixed(2)}
                  </span>
                </li>
              ))}
          </ol>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-[var(--teal-foam)] p-4">
            <p className="kicker !text-[0.65rem]">vs. The Bakery</p>
            <p
              className={`font-display mt-1 text-3xl font-semibold ${
                beatBakery >= 0 ? "text-[var(--teal-deep)]" : "text-[var(--cherry)]"
              }`}
            >
              {beatBakery >= 0 ? "+" : ""}
              {beatBakery.toFixed(1)}
            </p>
            <p className="text-xs text-[var(--cocoa-soft)]">
              {beatBakery >= 0.4
                ? "The jury prefers Grandma's glass."
                : "Too close to next door. Bake another batch."}
            </p>
          </div>
          <div className="rounded-3xl bg-[var(--oat)] p-4">
            <p className="kicker !text-[0.65rem] !text-[var(--crust)]">Copycat risk</p>
            <p className="font-display mt-1 text-3xl font-semibold">
              {Math.round(result.bakeryCloneRisk * 100)}%
            </p>
            <p className="text-xs text-[var(--cocoa-soft)]">
              Layers that already live in their Autumn Parfait.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCrown}
          disabled={crowned}
          className={`btn mt-5 w-full !py-3.5 !text-base ${
            crowned ? "btn-ghost cursor-default !shadow-none" : "btn-teal"
          }`}
        >
          {crowned ? "👑 Crowned flavor of the month" : "👑 Crown this flavor of the month"}
        </button>
        {crowned ? (
          <p className="font-hand mt-3 text-center text-xl text-[var(--latte)]">
            the window card below is what guests read ↓
          </p>
        ) : null}
        {crowned ? (
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-sm">
            <Link href="/supplies" className="btn btn-ghost btn-sm">
              📝 See what to buy
            </Link>
            <Link href="/loyalty" className="btn btn-ghost btn-sm">
              💌 Open the till
            </Link>
          </div>
        ) : null}
      </div>

      {/* jury */}
      <div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="kicker">Taste jury</p>
            <h3 className="font-display text-2xl font-semibold">Would they order it?</h3>
          </div>
          <p className="font-hand text-2xl text-[var(--latte)]">
            {result.notes.filter((note) => note.wouldOrder).length} of {result.notes.length} say yes
          </p>
        </div>
        <ul className="mt-4 space-y-4">
          {result.notes.map((note, index) => {
            const persona = PERSONA_MAP[note.personaId]!;
            const bakeryNote = bakery.notes.find((row) => row.personaId === note.personaId);
            return (
              <li
                key={note.personaId}
                className="pop-in flex items-start gap-3"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex w-16 shrink-0 flex-col items-center text-center">
                  <Avatar emoji={persona.emoji} blush={persona.blush} />
                  <p className="font-display mt-1 text-xs font-semibold leading-tight">
                    {persona.name.split(" ")[0]}
                  </p>
                </div>
                <div className="bubble min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--teal)]">
                      {persona.role}
                    </p>
                    <span
                      className={`tag ${
                        note.wouldOrder ? "tag-teal" : "!bg-[#f6e3e3] !text-[#8a2b3a]"
                      }`}
                    >
                      {note.wouldOrder ? "✓ Would order" : "Walks by"}
                    </span>
                  </div>
                  <p className="mt-2 leading-relaxed">“{note.quote}”</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="meter flex-1">
                      <span
                        style={{
                          width: `${Math.max(4, note.score * 10)}%`,
                          background: note.wouldOrder ? "var(--teal)" : "var(--caramel)",
                        }}
                      />
                    </div>
                    <span className="font-display w-10 text-right font-semibold">
                      {note.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="tag">💚 {note.favorite}</span>
                    {note.concern ? <span className="tag">🤨 {note.concern}</span> : null}
                    {bakeryNote ? (
                      <span className="tag">next door: {bakeryNote.score.toFixed(1)}</span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
