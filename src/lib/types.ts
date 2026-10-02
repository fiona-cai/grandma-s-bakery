export type Unit = "g" | "ml" | "each";

/** Where an ingredient sits in the glass; drives how it's drawn. */
export type Layer = "base" | "cream" | "fruit" | "crunch" | "drizzle" | "garnish";

export interface PantryItem {
  id: string;
  name: string;
  unit: Unit;
  /** How much comes in one pack, in `unit`. */
  packSize: number;
  /** Price of one pack. */
  packPrice: number;
  supplier: string;
  /** Already in the kitchen, in `unit`. */
  onHand: number;
  color: string;
  layer?: Layer;
}

export interface RecipeLine {
  itemId: string;
  /** Amount of the pantry item in one parfait, in the item's unit. */
  qtyPerServing: number;
}

export type ParfaitStatus = "idea" | "testing" | "winner" | "retired";

export interface Parfait {
  id: string;
  name: string;
  notes: string;
  sellPrice: number;
  status: ParfaitStatus;
  /** Listed bottom layer first. */
  ingredients: RecipeLine[];
}

export interface Feedback {
  id: string;
  rating: number;
  wouldBuyAgain: boolean;
  comment: string;
}

export interface TrialEntry {
  parfaitId: string;
  planned: number;
  made: number;
  sold: number;
  hoursToSell: number;
  feedback: Feedback[];
}

export type TrialStatus = "planning" | "running" | "done";

export interface Trial {
  id: string;
  name: string;
  startDate: string;
  batchFraction: number;
  wastePct: number;
  status: TrialStatus;
  /** Snapshot of the order once Grandma marks it bought. */
  purchase: PurchaseLine[] | null;
  entries: TrialEntry[];
}

export interface PurchaseLine {
  itemId: string;
  name: string;
  unit: Unit;
  packSize: number;
  packs: number;
  cost: number;
  needed: number;
}

export interface Settings {
  usualBatch: number;
}

export interface ShopData {
  pantry: PantryItem[];
  parfaits: Parfait[];
  trials: Trial[];
  settings: Settings;
}
