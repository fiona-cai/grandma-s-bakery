import { getIngredient, INGREDIENTS, LAYERS } from "./ingredients";
import { pick, shuffle } from "./rng";
import type {
  Brief,
  FlavorTag,
  Ingredient,
  LayerKind,
  Recipe,
  Vibe,
} from "./types";

const LAYER_ORDER: LayerKind[] = [
  "base",
  "cream",
  "fruit",
  "crunch",
  "drizzle",
  "garnish",
];

const VIBE_TAGS: Record<Vibe, FlavorTag[]> = {
  classic: ["nostalgic", "seasonal", "creamy", "nutty"],
  date: ["photogenic", "floral", "fruit", "novel"],
  critic: ["novel", "bitter", "floral", "coffee"],
  bright: ["healthy", "tart", "light", "fruit"],
};

const FRUIT_NICK: Record<string, string> = {
  honeycrisp: "Honeycrisp",
  "roasted-pear": "Pear",
  cranberry: "Cranberry",
  "spiced-plum": "Plum",
  "roasted-fig": "Fig",
  persimmon: "Persimmon",
  "pumpkin-puree": "Pumpkin",
};

const CREAM_NICK: Record<string, string> = {
  "maple-mascarpone": "Maple Mascarpone",
  "brown-butter-custard": "Brown-Butter Custard",
  "cinnamon-yogurt": "Cinnamon Yogurt",
  "chai-cream": "Chai Cream",
  "honey-ricotta": "Honey Ricotta",
  "vanilla-whip": "Vanilla Cream",
  "pumpkin-mousse": "Pumpkin Mousse",
  "coconut-cloud": "Coconut Cloud",
  "apple-butter": "Apple Butter",
};

const GARNISH_NICK: Record<string, string> = {
  "orange-peel": "Orange Peel",
  sage: "Sage",
  marigold: "Marigold",
  "cinnamon-stick": "Cinnamon",
  "cream-dollop": "Cream",
};

const NAME_SHAPES = [
  (fruit: string, cream: string) => `${fruit} & ${cream}`,
  (fruit: string, cream: string) => `${cream} ${fruit}`,
  (fruit: string) => `October ${fruit}`,
  (fruit: string, cream: string) => `${fruit} under ${cream}`,
];

const TAGLINES: Record<Vibe, string[]> = {
  classic: [
    "Tastes like this shop has always made it.",
    "The Friday table will go quiet, then ask for another.",
    "Fall, without the costume.",
  ],
  date: [
    "Pretty enough to stall an internship story.",
    "Built to be split, slowly, by the window.",
    "A reason to sit down instead of walking next door.",
  ],
  critic: [
    "Has a point of view. Next door does not.",
    "For people who are tired of pumpkin-shaped everything.",
    "A parfait that argues back.",
  ],
  bright: [
    "Dessert that still feels like morning.",
    "Fruit first, sugar second.",
    "Light enough for the walk over after class.",
  ],
};

function poolFor(layer: LayerKind, brief: Brief): Ingredient[] {
  return INGREDIENTS.filter((ingredient) => {
    if (ingredient.layer !== layer) return false;
    if (ingredient.allergen && brief.avoid.includes(ingredient.allergen)) {
      return false;
    }
    if (brief.budget === "tight" && ingredient.cost > 0.75) return false;
    if (brief.vibe === "classic" && ingredient.tags.includes("novel") && ingredient.cost > 0.9) {
      return false;
    }
    return true;
  });
}

function scoreCandidate(ingredient: Ingredient, brief: Brief): number {
  const wanted = VIBE_TAGS[brief.vibe];
  let score = ingredient.quality + (ingredient.local ? 0.6 : 0);
  for (const tag of ingredient.tags) {
    if (wanted.includes(tag)) score += 1.4;
    if (tag === "bakeryClone") score -= brief.vibe === "classic" ? 0.4 : 2.2;
  }
  if (brief.budget === "tight") score -= ingredient.cost;
  if (brief.budget === "splurge" && ingredient.quality >= 5) score += 0.5;
  return score;
}

function weightedPick(
  ingredients: Ingredient[],
  brief: Brief,
  random: () => number,
  used: Set<string>,
): Ingredient {
  const available = ingredients.filter((ingredient) => !used.has(ingredient.id));
  const source = available.length > 0 ? available : ingredients;
  const weighted = source.map((ingredient) => ({
    ingredient,
    weight: Math.max(0.15, scoreCandidate(ingredient, brief)),
  }));
  const total = weighted.reduce((sum, row) => sum + row.weight, 0);
  let ticket = random() * total;
  for (const row of weighted) {
    ticket -= row.weight;
    if (ticket <= 0) return row.ingredient;
  }
  return source[0]!;
}

function nameRecipe(
  layers: Record<LayerKind, string>,
  vibe: Vibe,
  random: () => number,
): { name: string; tagline: string } {
  const fruit = FRUIT_NICK[layers.fruit] ?? getIngredient(layers.fruit).name;
  const cream = CREAM_NICK[layers.cream] ?? getIngredient(layers.cream).name;
  const garnish = GARNISH_NICK[layers.garnish];
  const shape = pick(NAME_SHAPES, random);
  let name = shape(fruit, cream);
  if (garnish && random() > 0.6) {
    name = `${name} with ${garnish}`;
  }
  return {
    name,
    tagline: pick(TAGLINES[vibe], random),
  };
}

export function recipeIngredients(recipe: Recipe): Ingredient[] {
  return LAYER_ORDER.map((layer) => getIngredient(recipe.layers[layer]));
}

export function recipeCost(recipe: Recipe): number {
  return recipeIngredients(recipe).reduce((sum, ingredient) => sum + ingredient.cost, 0);
}

export function recipeSignature(layers: Record<LayerKind, string>): string {
  return LAYER_ORDER.map((layer) => layers[layer]).join("|");
}

export function generateBatch(
  brief: Brief,
  random: () => number,
  count = 4,
): Recipe[] {
  const recipes: Recipe[] = [];
  const seen = new Set<string>();
  let safety = 0;

  while (recipes.length < count && safety < 40) {
    safety += 1;
    const used = new Set<string>();
    const layers = {} as Record<LayerKind, string>;

    for (const layer of LAYERS) {
      const pool = poolFor(layer, brief);
      if (pool.length === 0) continue;
      const chosen = weightedPick(shuffle(pool, random), brief, random, used);
      layers[layer] = chosen.id;
      used.add(chosen.id);
    }

    if (LAYERS.some((layer) => !layers[layer])) continue;

    const signature = recipeSignature(layers);
    if (seen.has(signature)) continue;
    seen.add(signature);

    const named = nameRecipe(layers, brief.vibe, random);
    recipes.push({
      id: `recipe-${recipes.length}-${signature.slice(0, 18)}`,
      name: named.name,
      tagline: named.tagline,
      layers,
      vibe: brief.vibe,
    });
  }

  return recipes;
}

export const BAKERY_AUTUMN: Recipe = {
  id: "the-bakery-autumn",
  name: "The Bakery's Autumn Parfait",
  tagline: "Pumpkin, cream, granola, caramel. Available in 400 towns.",
  layers: {
    base: "pumpkin-bread",
    cream: "pumpkin-mousse",
    fruit: "pumpkin-puree",
    crunch: "store-granola",
    drizzle: "cheap-caramel",
    garnish: "cinnamon-stick",
  },
  vibe: "classic",
};
