import { PERSONAS } from "./personas";
import { recipeCost, recipeIngredients } from "./recipes";
import type { Persona, Recipe, TastingNote, TastingResult } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function fill(template: string, favorite: string, concern: string | null) {
  return template
    .replaceAll("{favorite}", favorite)
    .replaceAll("{concern}", concern ?? "this combination");
}

function band(score: number, vetoed: boolean, persona: Persona): string[] {
  if (vetoed) return persona.quotes.veto;
  if (score >= 8.2) return persona.quotes.rave;
  if (score >= 6.6) return persona.quotes.like;
  if (score >= 5.1) return persona.quotes.meh;
  return persona.quotes.pass;
}

export function tasteRecipe(recipe: Recipe, persona: Persona): TastingNote {
  const ingredients = recipeIngredients(recipe);
  const vetoed = ingredients.find(
    (ingredient) =>
      ingredient.allergen && persona.vetoAllergens.includes(ingredient.allergen),
  );

  let affinity = 0;
  for (const ingredient of ingredients) {
    for (const tag of ingredient.tags) {
      affinity += persona.weights[tag] ?? 0;
    }
  }
  affinity /= ingredients.length;

  const cost = recipeCost(recipe);
  const novelty = ingredients.filter((ingredient) =>
    ingredient.tags.some((tag) => ["novel", "floral", "bitter", "coffee"].includes(tag)),
  ).length;
  const cloneRisk = ingredients.filter((ingredient) =>
    ingredient.tags.includes("bakeryClone"),
  ).length;
  const hasCream = ingredients.some((ingredient) => ingredient.tags.includes("creamy"));
  const hasCrunch = ingredients.some((ingredient) => ingredient.tags.includes("crunchy"));
  const hasFruit = ingredients.some((ingredient) => ingredient.tags.includes("fruit"));

  let score = 5.8 + affinity * 1.15;
  score -= Math.max(0, cost - 2.35) * persona.priceSensitivity * 1.35;
  score += (novelty - 1.2) * persona.noveltyHunger * 0.55;
  score -= cloneRisk * (0.7 + persona.bakerySkepticism * 0.7);
  if (hasCream && hasCrunch && hasFruit) score += 0.45;
  if (ingredients.filter((ingredient) => ingredient.local).length >= 4) score += 0.25;

  const ranked = [...ingredients].sort((a, b) => {
    const scoreA = a.tags.reduce((sum, tag) => sum + (persona.weights[tag] ?? 0), 0);
    const scoreB = b.tags.reduce((sum, tag) => sum + (persona.weights[tag] ?? 0), 0);
    return scoreB - scoreA;
  });

  const favorite = ranked[0]?.name ?? "the fruit";
  const least = ranked[ranked.length - 1];
  const concern = vetoed
    ? `${vetoed.name} (${vetoed.allergen})`
    : least && (persona.weights[least.tags[0] ?? "sweet"] ?? 0) < 0
      ? least.name
      : cloneRisk >= 2
        ? "how close it sits to The Bakery"
        : null;

  if (vetoed) score = 1.4;
  score = clamp(Number(score.toFixed(1)), 1.2, 9.8);

  const quotes = band(score, Boolean(vetoed), persona);
  const quote = quotes[Math.abs(recipe.name.length + persona.name.length) % quotes.length]!;

  return {
    personaId: persona.id,
    score,
    wouldOrder: !vetoed && score >= 6.5,
    quote: fill(quote, favorite.toLowerCase(), concern?.toLowerCase() ?? null),
    favorite,
    concern,
    vetoed: Boolean(vetoed),
  };
}

export function evaluateRecipe(recipe: Recipe): TastingResult {
  const notes = PERSONAS.map((persona) => tasteRecipe(recipe, persona));
  const appeal =
    notes.reduce((sum, note) => sum + note.score, 0) / notes.length;
  const wouldOrderShare =
    notes.filter((note) => note.wouldOrder).length / notes.length;
  const ingredients = recipeIngredients(recipe);
  const novelty =
    ingredients.filter((ingredient) => ingredient.tags.includes("novel")).length /
    ingredients.length;
  const bakeryCloneRisk =
    ingredients.filter((ingredient) => ingredient.tags.includes("bakeryClone")).length /
    ingredients.length;

  let verdict: TastingResult["verdict"] = "pass";
  if (appeal >= 7.3 && wouldOrderShare >= 0.66) verdict = "crowd-pleaser";
  else if (appeal >= 6.4 && wouldOrderShare >= 0.33 && wouldOrderShare < 0.83) {
    verdict = notes.some((note) => note.score >= 8.4) && notes.some((note) => note.score <= 5)
      ? "polarizing"
      : "crowd-pleaser";
  } else if (wouldOrderShare > 0 && notes.some((note) => note.score >= 7.8)) {
    verdict = "niche";
  } else if (appeal >= 6) {
    verdict = "niche";
  }

  return {
    recipe,
    notes,
    appeal: Number(appeal.toFixed(2)),
    wouldOrderShare,
    cost: Number(recipeCost(recipe).toFixed(2)),
    novelty: Number(novelty.toFixed(2)),
    bakeryCloneRisk: Number(bakeryCloneRisk.toFixed(2)),
    verdict,
  };
}

export function evaluateBatch(recipes: Recipe[]): TastingResult[] {
  return recipes
    .map(evaluateRecipe)
    .sort((a, b) => b.appeal - a.appeal || a.cost - b.cost);
}

