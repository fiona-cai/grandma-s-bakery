"use client";

import { ParfaitGlass } from "@/components/ParfaitGlass";
import { PERSONA_MAP, PERSONAS } from "@/lib/personas";
import { BAKERY_AUTUMN, generateBatch, recipeIngredients } from "@/lib/recipes";
import { mulberry32 } from "@/lib/rng";
import { useShop } from "@/lib/store";
import { evaluateBatch, evaluateRecipe } from "@/lib/tasting";
import type { Allergen, Brief, Budget, TastingResult, Vibe } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

const VIBES: { id: Vibe; label: string; hint: string }[] = [
  { id: "classic", label: "Hometown classic", hint: "Friday table, apple, brown butter" },
  { id: "date", label: "Conversation starter", hint: "Pretty, shareable, a little unexpected" },
  { id: "critic", label: "Critic bait", hint: "A point of view The Bakery cannot copy" },
  { id: "bright", label: "Light & bright", hint: "Fruit first, study-safe, after yoga" },
];

const BUDGETS: { id: Budget; label: string }[] = [
  { id: "tight", label: "Tight week" },
  { id: "comfortable", label: "Comfortable" },
  { id: "splurge", label: "Worth a splurge" },
];

const ALLERGENS: { id: Allergen; label: string }[] = [
  { id: "nuts", label: "No nuts" },
  { id: "dairy", label: "No dairy" },
  { id: "gluten", label: "No gluten" },
];

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
  const [crownedId, setCrownedId] = useState<string | null>(fotm?.id ?? null);

  const results = useMemo(() => makeBatch(brief, nonce), [brief, nonce]);
  const bakery = useMemo(() => evaluateRecipe(BAKERY_AUTUMN), []);
  const selected =
    results.find((result) => result.recipe.id === selectedId) ?? results[0];

  function toggleAvoid(allergen: Allergen) {
    setBrief((current) => ({
      ...current,
      avoid: current.avoid.includes(allergen)
        ? current.avoid.filter((item) => item !== allergen)
        : [...current.avoid, allergen],
    }));
    setSelectedId(null);
  }

  function crown(result: TastingResult) {
    adoptFotm(result.recipe, [result, ...results.filter((row) => row.recipe.id !== result.recipe.id)]);
    setCrownedId(result.recipe.id);
  }

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          Flavor studio
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight">
          Invent a Fall Parfait, then let the neighborhood argue.
        </h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          Each glass is built from Grandma&apos;s pantry. The six tasters have
          opinions, budgets, and a long memory of The Bakery&apos;s pumpkin cup.
          Crown the one that wins the room — not the one that copies next door.
        </p>
      </header>

      <section className="card p-5">
        <div className="grid gap-6 lg:grid-cols-3">
          <fieldset>
            <legend className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              What should October taste like?
            </legend>
            <div className="mt-3 flex flex-col gap-2">
              {VIBES.map((vibe) => (
                <button
                  key={vibe.id}
                  type="button"
                  onClick={() => {
                    setBrief((current) => ({ ...current, vibe: vibe.id }));
                    setSelectedId(null);
                  }}
                  className={`rounded-2xl px-3 py-2 text-left ${
                    brief.vibe === vibe.id
                      ? "bg-[var(--ink)] text-[var(--paper)]"
                      : "bg-[var(--cream)]"
                  }`}
                >
                  <span className="block text-sm font-medium">{vibe.label}</span>
                  <span className="block text-xs opacity-80">{vibe.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Ingredient budget
            </legend>
            <div className="mt-3 flex flex-col gap-2">
              {BUDGETS.map((budget) => (
                <button
                  key={budget.id}
                  type="button"
                  onClick={() => {
                    setBrief((current) => ({ ...current, budget: budget.id }));
                    setSelectedId(null);
                  }}
                  className={`rounded-full px-4 py-2 text-sm ${
                    brief.budget === budget.id
                      ? "bg-[var(--ink)] text-[var(--paper)]"
                      : "bg-[var(--cream)]"
                  }`}
                >
                  {budget.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Leave these out
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {ALLERGENS.map((allergen) => (
                <button
                  key={allergen.id}
                  type="button"
                  onClick={() => toggleAvoid(allergen.id)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    brief.avoid.includes(allergen.id)
                      ? "bg-[var(--ink)] text-[var(--paper)]"
                      : "bg-[var(--cream)]"
                  }`}
                >
                  {allergen.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setNonce((value) => value + 11)}
              className="mt-6 rounded-full border border-[var(--line)] px-4 py-2 text-sm"
            >
              Bake another batch
            </button>
          </fieldset>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {results.map((result, index) => (
          <button
            key={result.recipe.id}
            type="button"
            onClick={() => setSelectedId(result.recipe.id)}
            className={`card p-4 text-left transition ${
              selected?.recipe.id === result.recipe.id
                ? "ring-2 ring-[var(--ink)]"
                : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                {index === 0 ? "Jury favorite" : `Candidate ${index + 1}`}
              </p>
              <VerdictChip verdict={result.verdict} />
            </div>
            <div className="mt-3">
              <ParfaitGlass recipe={result.recipe} />
            </div>
            <h2 className="mt-3 font-display text-xl leading-snug">
              {result.recipe.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{result.recipe.tagline}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <Stat label="Appeal" value={result.appeal.toFixed(1)} />
              <Stat label="Would order" value={`${Math.round(result.wouldOrderShare * 100)}%`} />
              <Stat label="Cost" value={`$${result.cost.toFixed(2)}`} />
            </dl>
          </button>
        ))}
      </section>

      {selected ? (
        <TastingRoom
          result={selected}
          bakery={bakery}
          crowned={crownedId === selected.recipe.id}
          onCrown={() => crown(selected)}
        />
      ) : null}
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

  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="card p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          The glass
        </p>
        <h2 className="mt-1 font-display text-3xl">{result.recipe.name}</h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">{result.recipe.tagline}</p>
        <div className="mt-5 flex justify-center">
          <ParfaitGlass recipe={result.recipe} size="lg" />
        </div>
        <ol className="mt-5 space-y-2">
          {layers.map((ingredient) => (
            <li key={ingredient.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: ingredient.color }}
                />
                {ingredient.name}
              </span>
              <span className="text-[var(--muted)]">${ingredient.cost.toFixed(2)}</span>
            </li>
          ))}
        </ol>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-[var(--cream)] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              vs The Bakery
            </p>
            <p className="mt-1 font-display text-2xl">
              {beatBakery >= 0 ? "+" : ""}
              {beatBakery.toFixed(1)}
            </p>
            <p className="text-xs text-[var(--ink-soft)]">
              {beatBakery >= 0.4
                ? "The jury prefers Grandma's glass."
                : "Too close to next door. Bake another batch."}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--cream)] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Copycat risk
            </p>
            <p className="mt-1 font-display text-2xl">
              {Math.round(result.bakeryCloneRisk * 100)}%
            </p>
            <p className="text-xs text-[var(--ink-soft)]">
              Share of layers that already live in their Autumn Parfait.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCrown}
          className="mt-5 w-full rounded-full bg-[var(--maple)] px-4 py-3 text-sm text-[var(--paper)]"
        >
          {crowned ? "Crowned flavor of the month" : "Crown this flavor of the month"}
        </button>
        {crowned ? (
          <p className="mt-3 text-sm text-[var(--ink-soft)]">
            The morning list and the regulars board now follow this recipe.{" "}
            <Link href="/supplies" className="underline underline-offset-2">
              See what to buy
            </Link>
            {" · "}
            <Link href="/loyalty" className="underline underline-offset-2">
              Who will come back
            </Link>
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Taste jury
            </p>
            <h3 className="font-display text-2xl">Would they order it?</h3>
          </div>
          <VerdictChip verdict={result.verdict} />
        </div>
        {result.notes.map((note) => {
          const persona = PERSONA_MAP[note.personaId];
          const bakeryNote = bakery.notes.find((row) => row.personaId === note.personaId);
          return (
            <article key={note.personaId} className="card p-4">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl"
                  style={{ background: persona.blush }}
                >
                  {persona.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{persona.name}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                        {persona.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl leading-none">{note.score.toFixed(1)}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {note.wouldOrder ? "Would order" : "Would walk by"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    “{note.quote}”
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-[var(--cream)] px-2 py-1">
                      Loves {note.favorite}
                    </span>
                    {note.concern ? (
                      <span className="rounded-full bg-[var(--cream)] px-2 py-1">
                        Side-eyes {note.concern}
                      </span>
                    ) : null}
                    {bakeryNote ? (
                      <span className="rounded-full bg-[var(--cream)] px-2 py-1">
                        The Bakery: {bakeryNote.score.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--cream)] px-1 py-2">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[var(--ink)]">{value}</dd>
    </div>
  );
}

function VerdictChip({ verdict }: { verdict: TastingResult["verdict"] }) {
  const label = {
    "crowd-pleaser": "Crowd-pleaser",
    polarizing: "Polarizing",
    niche: "Niche love",
    pass: "Not this one",
  }[verdict];
  return (
    <span className="rounded-full bg-[var(--cream)] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
      {label}
    </span>
  );
}
