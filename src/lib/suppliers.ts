import { getIngredient, INGREDIENTS } from "./ingredients";
import { recipeIngredients } from "./recipes";
import type { Offer, PurchaseLine, Recipe, Supplier } from "./types";

export const SUPPLIERS: Supplier[] = [
  { id: "meadowdale", name: "Meadowdale Dairy", kind: "trusted", minutesAway: 12 },
  { id: "hartwell", name: "Hartwell Mill & Orchard", kind: "local", minutesAway: 18 },
  { id: "willow", name: "Willow Brook", kind: "local", minutesAway: 9 },
  { id: "sysco", name: "Metro Wholesale", kind: "wholesale", minutesAway: 35 },
  { id: "lane", name: "Lane's Farm Stand", kind: "local", minutesAway: 7 },
];

export const SUPPLIER_MAP = Object.fromEntries(
  SUPPLIERS.map((supplier) => [supplier.id, supplier]),
) as Record<string, Supplier>;

export const OFFERS: Offer[] = [
  { id: "o1", ingredientId: "maple-mascarpone", supplierId: "meadowdale", unitPrice: 6.4, unit: "tub", quality: 5, habitual: true, flags: [] },
  { id: "o2", ingredientId: "brown-butter-custard", supplierId: "meadowdale", unitPrice: 5.1, unit: "quart", quality: 5, habitual: false, flags: [] },
  { id: "o3", ingredientId: "cinnamon-yogurt", supplierId: "meadowdale", unitPrice: 3.8, unit: "quart", quality: 4, habitual: true, flags: ["duplicate"] },
  { id: "o4", ingredientId: "cinnamon-yogurt", supplierId: "sysco", unitPrice: 3.2, unit: "quart", quality: 3, habitual: true, flags: ["duplicate"] },
  { id: "o5", ingredientId: "honey-ricotta", supplierId: "willow", unitPrice: 4.6, unit: "tub", quality: 5, habitual: false, flags: [] },
  { id: "o6", ingredientId: "chai-cream", supplierId: "meadowdale", unitPrice: 4.9, unit: "quart", quality: 4, habitual: false, flags: [] },
  { id: "o7", ingredientId: "vanilla-whip", supplierId: "sysco", unitPrice: 2.1, unit: "can", quality: 3, habitual: true, flags: ["unnecessary"] },
  { id: "o8", ingredientId: "pumpkin-mousse", supplierId: "sysco", unitPrice: 3.4, unit: "tub", quality: 3, habitual: true, flags: ["unnecessary"] },
  {
    id: "o9",
    ingredientId: "maple-mascarpone",
    supplierId: "sysco",
    unitPrice: 7.8,
    unit: "tub",
    quality: 3,
    habitual: true,
    flags: ["duplicate", "price-hike"],
  },
  { id: "o10", ingredientId: "honeycrisp", supplierId: "hartwell", unitPrice: 2.8, unit: "quart", quality: 5, habitual: true, flags: [] },
  { id: "o11", ingredientId: "roasted-pear", supplierId: "hartwell", unitPrice: 3.1, unit: "tray", quality: 5, habitual: false, flags: [] },
  { id: "o12", ingredientId: "cranberry", supplierId: "lane", unitPrice: 2.4, unit: "pint", quality: 4, habitual: false, flags: [] },
  { id: "o13", ingredientId: "spiced-plum", supplierId: "sysco", unitPrice: 4.2, unit: "jar", quality: 4, habitual: false, flags: [] },
  { id: "o14", ingredientId: "roasted-fig", supplierId: "sysco", unitPrice: 6.5, unit: "tray", quality: 5, habitual: false, flags: [] },
  { id: "o15", ingredientId: "persimmon", supplierId: "lane", unitPrice: 4.8, unit: "basket", quality: 4, habitual: false, flags: [] },
  { id: "o16", ingredientId: "pumpkin-puree", supplierId: "sysco", unitPrice: 1.6, unit: "can", quality: 3, habitual: true, flags: ["unnecessary"] },
  { id: "o17", ingredientId: "brown-butter-cake", supplierId: "willow", unitPrice: 0, unit: "in-house", quality: 5, habitual: true, flags: [] },
  { id: "o18", ingredientId: "gingerbread", supplierId: "willow", unitPrice: 0, unit: "in-house", quality: 4, habitual: false, flags: [] },
  { id: "o19", ingredientId: "brioche", supplierId: "willow", unitPrice: 0, unit: "in-house", quality: 4, habitual: true, flags: [] },
  { id: "o20", ingredientId: "maple-oat", supplierId: "hartwell", unitPrice: 1.9, unit: "bag", quality: 4, habitual: false, flags: [] },
  { id: "o21", ingredientId: "pumpkin-bread", supplierId: "sysco", unitPrice: 2.2, unit: "loaf", quality: 3, habitual: true, flags: ["unnecessary"] },
  { id: "o22", ingredientId: "candied-pecan", supplierId: "lane", unitPrice: 3.6, unit: "pint", quality: 5, habitual: true, flags: [] },
  { id: "o23", ingredientId: "hazelnut", supplierId: "sysco", unitPrice: 4.9, unit: "bag", quality: 5, habitual: false, flags: [] },
  { id: "o24", ingredientId: "pepita", supplierId: "hartwell", unitPrice: 2.5, unit: "bag", quality: 4, habitual: false, flags: [] },
  { id: "o25", ingredientId: "gingersnap", supplierId: "willow", unitPrice: 0, unit: "in-house", quality: 4, habitual: true, flags: [] },
  { id: "o26", ingredientId: "streusel", supplierId: "willow", unitPrice: 0, unit: "in-house", quality: 5, habitual: false, flags: [] },
  { id: "o27", ingredientId: "cacao-nib", supplierId: "sysco", unitPrice: 3.9, unit: "bag", quality: 4, habitual: false, flags: [] },
  { id: "o28", ingredientId: "store-granola", supplierId: "sysco", unitPrice: 1.4, unit: "sack", quality: 2, habitual: true, flags: ["poor-quality", "unnecessary"] },
  { id: "o29", ingredientId: "dark-caramel", supplierId: "willow", unitPrice: 0, unit: "in-house", quality: 5, habitual: true, flags: [] },
  { id: "o30", ingredientId: "sorghum", supplierId: "lane", unitPrice: 3.2, unit: "jar", quality: 5, habitual: false, flags: [] },
  { id: "o31", ingredientId: "bourbon-maple", supplierId: "lane", unitPrice: 5.4, unit: "pint", quality: 5, habitual: false, flags: [] },
  { id: "o32", ingredientId: "cider-reduction", supplierId: "hartwell", unitPrice: 2.6, unit: "pint", quality: 5, habitual: false, flags: [] },
  { id: "o33", ingredientId: "espresso-ganache", supplierId: "willow", unitPrice: 0, unit: "in-house", quality: 5, habitual: false, flags: [] },
  { id: "o34", ingredientId: "cheap-caramel", supplierId: "sysco", unitPrice: 1.1, unit: "bottle", quality: 1, habitual: true, flags: ["poor-quality", "unnecessary"] },
  { id: "o35", ingredientId: "orange-peel", supplierId: "lane", unitPrice: 1.8, unit: "jar", quality: 5, habitual: false, flags: [] },
  { id: "o36", ingredientId: "sage", supplierId: "lane", unitPrice: 1.2, unit: "bunch", quality: 5, habitual: false, flags: [] },
  { id: "o37", ingredientId: "marigold", supplierId: "lane", unitPrice: 2.0, unit: "punnet", quality: 4, habitual: false, flags: [] },
  { id: "o38", ingredientId: "cinnamon-stick", supplierId: "sysco", unitPrice: 0.9, unit: "bag", quality: 3, habitual: true, flags: ["unnecessary"] },
  { id: "o39", ingredientId: "cream-dollop", supplierId: "meadowdale", unitPrice: 8.9, unit: "quart cream", quality: 3, habitual: true, flags: ["price-hike", "duplicate"] },
  { id: "o40", ingredientId: "honey-ricotta", supplierId: "meadowdale", unitPrice: 5.5, unit: "tub", quality: 4, habitual: false, flags: [] },
  { id: "o41", ingredientId: "roasted-squash", supplierId: "lane", unitPrice: 2.1, unit: "tray", quality: 4, habitual: false, flags: [] },
  { id: "o42", ingredientId: "coconut-cloud", supplierId: "sysco", unitPrice: 3.7, unit: "can", quality: 4, habitual: false, flags: [] },
  { id: "o43", ingredientId: "apple-butter", supplierId: "lane", unitPrice: 3.4, unit: "jar", quality: 5, habitual: false, flags: [] },
];

const STAPLES = new Set([
  "brown-butter-cake",
  "cinnamon-yogurt",
  "honeycrisp",
  "gingersnap",
  "dark-caramel",
]);

function offersFor(ingredientId: string) {
  return OFFERS.filter((offer) => offer.ingredientId === ingredientId);
}

function chooseOffer(ingredientId: string, needed: boolean): Offer | null {
  const offers = offersFor(ingredientId);
  if (offers.length === 0) return null;
  if (!needed) return null;

  return [...offers].sort((a, b) => {
    const score = (offer: Offer) => {
      const supplier = SUPPLIER_MAP[offer.supplierId];
      let value = offer.quality * 2 - offer.unitPrice * 0.15;
      if (offer.flags.includes("poor-quality")) value -= 4;
      if (offer.flags.includes("price-hike")) value -= 3;
      if (offer.flags.includes("duplicate")) value -= 1;
      if (supplier?.kind === "local") value += 1.2;
      if (supplier?.kind === "trusted" && !offer.flags.includes("price-hike")) value += 0.6;
      if (offer.unit === "in-house") value += 2;
      return value;
    };
    return score(b) - score(a);
  })[0]!;
}

export function optimizePurchasing(fotm: Recipe | null): PurchaseLine[] {
  const neededIds = new Set<string>(STAPLES);
  if (fotm) {
    for (const ingredient of recipeIngredients(fotm)) {
      neededIds.add(ingredient.id);
    }
  }

  const ingredientIds = new Set<string>([
    ...INGREDIENTS.map((ingredient) => ingredient.id),
  ]);

  const lines: PurchaseLine[] = [];

  for (const ingredientId of ingredientIds) {
    const offers = offersFor(ingredientId);
    if (offers.length === 0) continue;

    const habitualOffers = offers.filter((offer) => offer.habitual);
    const habitualOffer = habitualOffers.sort((a, b) => b.unitPrice - a.unitPrice)[0];
    const needed = neededIds.has(ingredientId);
    const chosenOffer = chooseOffer(ingredientId, needed);

    let action: PurchaseLine["action"] = "keep";
    let reason = "Already on the morning list.";

    if (!needed && habitualOffer) {
      action = "drop";
      const flags = habitualOffer.flags;
      if (flags.includes("poor-quality")) {
        reason = "Poor quality, and this month's parfait does not need it.";
      } else if (flags.includes("unnecessary")) {
        reason = "A leftover from chasing The Bakery. Not on the new recipe.";
      } else if (flags.includes("duplicate")) {
        reason = "Duplicate of something she already buys better elsewhere.";
      } else {
        reason = "Not on the crowned recipe. Stop buying it every morning.";
      }
    } else if (needed && !habitualOffer) {
      action = "add";
      reason = "Required for the Flavor of the Month. Add it to the list.";
    } else if (needed && habitualOffer && chosenOffer && chosenOffer.id !== habitualOffer.id) {
      action = "switch";
      if (habitualOffer.flags.includes("price-hike")) {
        reason = "Trusted supplier raised the price. Better quality per dollar exists.";
      } else if (habitualOffer.flags.includes("duplicate")) {
        reason = "She is buying this twice. Keep the better source only.";
      } else if (habitualOffer.flags.includes("poor-quality")) {
        reason = "Upgrade from the sack. Guests can taste the difference.";
      } else {
        reason = "A closer or better-quality source fits this recipe.";
      }
    } else if (needed && habitualOffer && chosenOffer) {
      action = "keep";
      reason = habitualOffer.flags.includes("price-hike")
        ? "Keep, but watch the cream hike — we already preferred the better tub."
        : "Trusted source, needed this week, no reason to change.";
    } else {
      continue;
    }

    if (!needed && !habitualOffer) continue;

    lines.push({
      ingredientId,
      needed,
      habitualOffer,
      chosenOffer: needed ? chosenOffer : null,
      action,
      reason,
      weeklyQty: needed ? 6 : 0,
    });
  }

  const rank = { drop: 0, switch: 1, add: 2, keep: 3 };
  return lines.sort((a, b) => rank[a.action] - rank[b.action] || a.ingredientId.localeCompare(b.ingredientId));
}

export function purchasingTotals(lines: PurchaseLine[]) {
  const habitual = lines.reduce((sum, line) => {
    if (!line.habitualOffer) return sum;
    return sum + line.habitualOffer.unitPrice * (line.needed ? line.weeklyQty : 4);
  }, 0);
  const optimized = lines.reduce((sum, line) => {
    if (!line.chosenOffer) return sum;
    return sum + line.chosenOffer.unitPrice * line.weeklyQty;
  }, 0);
  return {
    habitual: Number(habitual.toFixed(2)),
    optimized: Number(optimized.toFixed(2)),
    saved: Number((habitual - optimized).toFixed(2)),
    dropped: lines.filter((line) => line.action === "drop").length,
    switched: lines.filter((line) => line.action === "switch").length,
    added: lines.filter((line) => line.action === "add").length,
  };
}

export function offerLabel(offer: Offer) {
  const supplier = SUPPLIER_MAP[offer.supplierId];
  const ingredient = getIngredient(offer.ingredientId);
  return `${ingredient.name} · ${supplier.name}`;
}
