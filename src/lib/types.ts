export type FlavorTag =
  | "sweet"
  | "tart"
  | "creamy"
  | "crunchy"
  | "bitter"
  | "spicy"
  | "floral"
  | "nutty"
  | "chocolate"
  | "coffee"
  | "fruit"
  | "photogenic"
  | "nostalgic"
  | "novel"
  | "healthy"
  | "seasonal"
  | "rich"
  | "light"
  | "bakeryClone";

export type LayerKind =
  | "base"
  | "cream"
  | "fruit"
  | "crunch"
  | "drizzle"
  | "garnish";

export type Allergen = "dairy" | "nuts" | "gluten" | "egg";

export type Vibe = "classic" | "date" | "critic" | "bright";
export type Budget = "tight" | "comfortable" | "splurge";

export interface Ingredient {
  id: string;
  name: string;
  layer: LayerKind;
  tags: FlavorTag[];
  cost: number;
  quality: number;
  allergen?: Allergen;
  local: boolean;
  color: string;
  note: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  comesFor: string;
  bio: string;
  emoji: string;
  blush: string;
  weights: Partial<Record<FlavorTag, number>>;
  vetoAllergens: Allergen[];
  priceSensitivity: number;
  noveltyHunger: number;
  bakerySkepticism: number;
  quotes: {
    rave: string[];
    like: string[];
    meh: string[];
    pass: string[];
    veto: string[];
  };
}

export interface Recipe {
  id: string;
  name: string;
  tagline: string;
  layers: Record<LayerKind, string>;
  vibe: Vibe;
}

export interface TastingNote {
  personaId: string;
  score: number;
  wouldOrder: boolean;
  quote: string;
  favorite: string;
  concern: string | null;
  vetoed: boolean;
}

export interface TastingResult {
  recipe: Recipe;
  notes: TastingNote[];
  appeal: number;
  wouldOrderShare: number;
  cost: number;
  novelty: number;
  bakeryCloneRisk: number;
  verdict: "crowd-pleaser" | "polarizing" | "niche" | "pass";
}

export interface Brief {
  vibe: Vibe;
  budget: Budget;
  avoid: Allergen[];
}

export interface Supplier {
  id: string;
  name: string;
  kind: "trusted" | "local" | "wholesale";
  minutesAway: number;
}

export interface Offer {
  id: string;
  ingredientId: string;
  supplierId: string;
  unitPrice: number;
  unit: string;
  quality: number;
  habitual: boolean;
  flags: Array<"duplicate" | "price-hike" | "poor-quality" | "unnecessary">;
}

export type PurchaseAction = "keep" | "switch" | "drop" | "add";

export interface PurchaseLine {
  ingredientId: string;
  needed: boolean;
  habitualOffer?: Offer;
  chosenOffer: Offer | null;
  action: PurchaseAction;
  reason: string;
  weeklyQty: number;
}

export interface Customer {
  id: string;
  name: string;
  personaId: string;
  visits: number;
  points: number;
  lastVisit: string;
  note: string;
  since: string;
}
