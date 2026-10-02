import { getIngredient } from "./ingredients";
import { recipeCost, recipeIngredients } from "./recipes";
import { SUPPLIER_MAP } from "./suppliers";
import type { Allergen, Ingredient, PurchaseLine, Recipe } from "./types";

export type MenuLang = "en" | "es" | "zh";

export const LANGS: { id: MenuLang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "zh", label: "中文" },
];

export const ALLERGEN_WORD: Record<MenuLang, Record<Allergen, string>> = {
  en: { dairy: "dairy", nuts: "nuts", gluten: "gluten", egg: "egg" },
  es: { dairy: "lácteos", nuts: "nueces", gluten: "gluten", egg: "huevo" },
  zh: { dairy: "乳制品", nuts: "坚果", gluten: "麸质", egg: "蛋" },
};

const ING_NAME: Record<string, Record<MenuLang, string>> = {
  "brown-butter-cake": { en: "brown-butter pound cake", es: "bizcocho de mantequilla tostada", zh: "褐黄油磅蛋糕" },
  gingerbread: { en: "gingerbread crumbs", es: "migas de pan de jengibre", zh: "姜饼碎" },
  brioche: { en: "toasted brioche", es: "brioche tostado", zh: "烤布里欧修" },
  "maple-oat": { en: "maple oat crumble", es: "crumble de avena y maple", zh: "枫糖燕麦酥" },
  "pumpkin-bread": { en: "pumpkin spice bread", es: "pan de calabaza", zh: "南瓜面包" },
  "roasted-squash": { en: "roasted squash", es: "calabaza asada", zh: "烤南瓜丁" },
  "maple-mascarpone": { en: "maple mascarpone", es: "mascarpone con maple", zh: "枫糖马斯卡彭" },
  "brown-butter-custard": { en: "brown-butter custard", es: "natilla de mantequilla tostada", zh: "褐黄油 custard" },
  "cinnamon-yogurt": { en: "cinnamon yogurt", es: "yogur de canela", zh: "肉桂酸奶" },
  "chai-cream": { en: "chai cream", es: "crema de chai", zh: "印度香料奶油" },
  "honey-ricotta": { en: "honey ricotta", es: "ricotta con miel", zh: "蜂蜜瑞可塔" },
  "vanilla-whip": { en: "vanilla cream", es: "crema de vainilla", zh: "香草奶油" },
  "pumpkin-mousse": { en: "pumpkin mousse", es: "mousse de calabaza", zh: "南瓜慕斯" },
  "coconut-cloud": { en: "coconut cloud", es: "nube de coco", zh: "椰奶云" },
  "apple-butter": { en: "apple butter", es: "mantequilla de manzana", zh: "苹果酱" },
  honeycrisp: { en: "Honeycrisp compote", es: "compota de Honeycrisp", zh: "蜜脆苹果酱" },
  "roasted-pear": { en: "roasted pear", es: "pera asada", zh: "烤梨" },
  cranberry: { en: "cranberry-orange relish", es: "relish de arándano", zh: "蔓越莓橙酱" },
  "spiced-plum": { en: "spiced plum", es: "ciruela especiada", zh: "香料李子" },
  "roasted-fig": { en: "roasted fig", es: "higo asado", zh: "烤无花果" },
  persimmon: { en: "persimmon", es: "caqui", zh: "柿子" },
  "pumpkin-puree": { en: "pumpkin puree", es: "puré de calabaza", zh: "南瓜泥" },
  "candied-pecan": { en: "candied pecans", es: "pacanas confitadas", zh: "糖渍 Pecans" },
  hazelnut: { en: "toasted hazelnuts", es: "avellanas tostadas", zh: "烤榛子" },
  pepita: { en: "maple pepitas", es: "pepitas con maple", zh: "枫糖南瓜籽" },
  gingersnap: { en: "gingersnap shards", es: "trocitos de galleta de jengibre", zh: "姜饼脆片" },
  streusel: { en: "brown-butter streusel", es: "streusel de mantequilla tostada", zh: "褐黄油酥粒" },
  "cacao-nib": { en: "cacao nibs", es: "nibs de cacao", zh: "可可碎" },
  "store-granola": { en: "bagged granola", es: "granola de bolsa", zh: "袋装格兰诺拉" },
  "dark-caramel": { en: "dark caramel", es: "caramelo oscuro", zh: "深色焦糖" },
  sorghum: { en: "sorghum", es: "sorgo", zh: "高粱糖浆" },
  "bourbon-maple": { en: "bourbon maple", es: "maple al bourbon", zh: "波本枫糖" },
  "cider-reduction": { en: "cider reduction", es: "reducción de sidra", zh: "浓缩苹果酒" },
  "espresso-ganache": { en: "espresso ganache", es: "ganache de espresso", zh: "浓缩咖啡甘纳许" },
  "cheap-caramel": { en: "squeeze caramel", es: "caramelo de botella", zh: "瓶装焦糖" },
  "orange-peel": { en: "candied orange peel", es: "cáscara de naranja", zh: "糖渍橙皮" },
  sage: { en: "fried sage", es: "salvia frita", zh: "炸鼠尾草" },
  marigold: { en: "marigold", es: "caléndula", zh: "金盏花" },
  "cinnamon-stick": { en: "cinnamon", es: "canela", zh: "肉桂" },
  "cream-dollop": { en: "extra cream", es: "crema extra", zh: "额外奶油" },
};

const SWAP: Record<Allergen, { id: string; label: Record<MenuLang, string> }> = {
  dairy: {
    id: "coconut-cloud",
    label: {
      en: "Coconut cloud instead of the cream",
      es: "Nube de coco en vez de la crema",
      zh: "用椰奶云替换奶制品层",
    },
  },
  nuts: {
    id: "pepita",
    label: {
      en: "Maple pepitas instead of the nuts",
      es: "Pepitas con maple en vez de las nueces",
      zh: "用枫糖南瓜籽替换坚果",
    },
  },
  gluten: {
    id: "roasted-squash",
    label: {
      en: "Roasted squash instead of the cake",
      es: "Calabaza asada en vez del bizcocho",
      zh: "用烤南瓜丁替换蛋糕底",
    },
  },
  egg: {
    id: "cinnamon-yogurt",
    label: {
      en: "Yogurt instead of the custard",
      es: "Yogur en vez de la natilla",
      zh: "用酸奶替换蛋奶冻",
    },
  },
};

export function ingredientLabel(id: string, lang: MenuLang) {
  return ING_NAME[id]?.[lang] ?? getIngredient(id).name;
}

export function recipeAllergens(recipe: Recipe): Allergen[] {
  return [
    ...new Set(
      recipeIngredients(recipe)
        .map((ingredient) => ingredient.allergen)
        .filter((allergen): allergen is Allergen => Boolean(allergen)),
    ),
  ];
}

export function substitutions(recipe: Recipe, lang: MenuLang) {
  return recipeAllergens(recipe).map((allergen) => SWAP[allergen].label[lang]);
}

export function travelPack(recipe: Recipe) {
  const layers = recipeIngredients(recipe);
  const crunch = layers.find((ingredient) => ingredient.layer === "crunch");
  const drizzle = layers.find((ingredient) => ingredient.layer === "drizzle");
  return {
    cost: 0.18,
    name: "Two-cup traveler",
    how: `Crunch (${crunch?.name ?? "topping"}) and ${drizzle?.name ?? "drizzle"} ride in the lid cup. Fruit and cream stay put. Snap together at the desk. Cheap PET, 18¢.`,
  };
}

export function menuPrice(recipe: Recipe, creamHike = 0) {
  const hiked = recipeCost(recipe) + creamCostBump(recipe, creamHike) + 0.18;
  return Math.ceil(hiked * 2.35 * 4) / 4;
}

function creamCostBump(recipe: Recipe, hike: number) {
  if (hike <= 0) return 0;
  return recipeIngredients(recipe)
    .filter((ingredient) => ingredient.allergen === "dairy")
    .reduce((sum, ingredient) => sum + ingredient.cost * (hike / 100), 0);
}

export function windowCopy(recipe: Recipe) {
  return {
    sign: `${recipe.name} — not next door's.`,
    caption: `${recipe.name}. ${recipe.tagline} Written in the window so nobody has to ask, and nobody has to open Translate on the sidewalk.`,
  };
}

export const REVIEWS = [
  {
    id: "yelp-1",
    via: "Yelp",
    stars: 2,
    author: "K.",
    body: "Cute shop but I couldn't tell what was in the parfait and the line stopped while they explained. Went next door.",
    reply:
      "The card on the glass lists every layer, allergens, and a swap — in English, Español, and 中文. Wave us over if you want the traveler cup so it survives class.",
  },
  {
    id: "maps-1",
    via: "Google",
    stars: 3,
    author: "Priya S.",
    body: "The Bakery's Autumn Parfait is faster. Is this just pumpkin with better lighting?",
    reply:
      "It isn't. Ours is built here, scored by the people who actually sit in the booths, and the window says so. If it tastes like next door, tell us — we'll pull it.",
  },
];

export interface Bin {
  onHand: number;
  spoilsIn: number;
  lastPaid: string;
  bill?: string;
}

export const BINS: Record<string, Bin> = {
  "maple-mascarpone": { onHand: 2, spoilsIn: 3, lastPaid: "Tue", bill: "Meadowdale cream, weekly" },
  "brown-butter-custard": { onHand: 1, spoilsIn: 2, lastPaid: "Mon" },
  "cinnamon-yogurt": { onHand: 5, spoilsIn: 6, lastPaid: "Tue", bill: "Meadowdale cream, weekly" },
  "chai-cream": { onHand: 0, spoilsIn: 0, lastPaid: "—" },
  "honey-ricotta": { onHand: 2, spoilsIn: 4, lastPaid: "Sun" },
  "coconut-cloud": { onHand: 3, spoilsIn: 8, lastPaid: "Fri" },
  "apple-butter": { onHand: 4, spoilsIn: 21, lastPaid: "Thu" },
  honeycrisp: { onHand: 6, spoilsIn: 5, lastPaid: "Wed" },
  "roasted-pear": { onHand: 1, spoilsIn: 2, lastPaid: "Mon" },
  cranberry: { onHand: 3, spoilsIn: 7, lastPaid: "Sat" },
  persimmon: { onHand: 0, spoilsIn: 0, lastPaid: "—" },
  "candied-pecan": { onHand: 4, spoilsIn: 14, lastPaid: "Thu" },
  pepita: { onHand: 5, spoilsIn: 20, lastPaid: "Thu" },
  gingersnap: { onHand: 8, spoilsIn: 10, lastPaid: "in-house" },
  "brown-butter-cake": { onHand: 7, spoilsIn: 3, lastPaid: "in-house" },
  "dark-caramel": { onHand: 6, spoilsIn: 18, lastPaid: "in-house" },
  "cider-reduction": { onHand: 0, spoilsIn: 0, lastPaid: "—" },
  "orange-peel": { onHand: 2, spoilsIn: 12, lastPaid: "Thu" },
  sage: { onHand: 1, spoilsIn: 3, lastPaid: "Thu" },
};

export function binFor(ingredientId: string): Bin {
  return BINS[ingredientId] ?? { onHand: 2, spoilsIn: 5, lastPaid: "last week" };
}

export const CAMPUS = {
  who: "Student Union",
  event: "Thursday mixer",
  qty: 40,
  by: "4:00 today",
};

export function campusCheck(recipe: Recipe | null, lines: PurchaseLine[]) {
  if (!recipe) {
    return {
      yes: false,
      note: "Crown a parfait first. Then we can say yes without guessing the shopping list.",
      missing: [] as Ingredient[],
      eta: null as number | null,
    };
  }
  const missing = recipeIngredients(recipe).filter(
    (ingredient) => binFor(ingredient.id).onHand < 3,
  );
  const eta = missing.reduce((fastest, ingredient) => {
    const line = lines.find((row) => row.ingredientId === ingredient.id);
    const minutes = line?.chosenOffer
      ? SUPPLIER_MAP[line.chosenOffer.supplierId]?.minutesAway
      : 35;
    return Math.min(fastest, minutes ?? 35);
  }, 99);
  if (missing.length === 0) {
    return {
      yes: true,
      note: `Pantry covers ${CAMPUS.qty} if we start the line now. No need to turn the Union down.`,
      missing,
      eta: 0,
    };
  }
  return {
    yes: false,
    note: `Short ${missing.map((ingredient) => ingredient.name).join(", ")}. Fastest local drop is ${eta} minutes — take the order if they can wait.`,
    missing,
    eta,
  };
}

export function localShare(lines: PurchaseLine[]) {
  const needed = lines.filter((line) => line.needed && line.chosenOffer);
  if (needed.length === 0) return 0;
  const local = needed.filter((line) => {
    const kind = SUPPLIER_MAP[line.chosenOffer!.supplierId]?.kind;
    return kind === "local" || line.chosenOffer!.unit === "in-house";
  }).length;
  return Math.round((local / needed.length) * 100);
}

export function closeBooks(args: {
  stampsToday: number;
  menu: number;
  campus: boolean;
}) {
  const walkIns = 14;
  const parfaitCount = walkIns + args.stampsToday;
  const parfait = parfaitCount * args.menu;
  const coffee = 38;
  const campus = args.campus ? CAMPUS.qty * (args.menu - 1) : 0;
  const cardTape = 148.5;
  const cashDrawer = 71;
  const counter = parfait + coffee;
  const drawer = cardTape + cashDrawer;
  return {
    walkIns,
    parfaitCount,
    parfait: Number(parfait.toFixed(2)),
    coffee,
    campus: Number(campus.toFixed(2)),
    income: Number((counter + campus).toFixed(2)),
    cardTape,
    cashDrawer,
    drawer: Number(drawer.toFixed(2)),
    gap: Number((drawer - counter).toFixed(2)),
    salesTax: Number((parfait * 0.06).toFixed(2)),
  };
}

export const COPY: Record<
  MenuLang,
  { contains: string; swap: string; road: string; layers: string }
> = {
  en: {
    contains: "Contains",
    swap: "Ask for",
    road: "For class or a picnic",
    layers: "In the glass",
  },
  es: {
    contains: "Contiene",
    swap: "Pida",
    road: "Para clase o picnic",
    layers: "En el vaso",
  },
  zh: {
    contains: "含有",
    swap: "可替换",
    road: "带走不易撒",
    layers: "杯中分层",
  },
};
