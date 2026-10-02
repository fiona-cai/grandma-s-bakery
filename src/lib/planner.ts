import type { Parfait, PantryItem, Trial, TrialEntry, Unit } from "./types";

export function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export function formatQty(qty: number, unit: Unit) {
  const round = (n: number) => Math.round(n * 100) / 100;
  if (unit === "g" && qty >= 1000) return `${round(qty / 1000)} kg`;
  if (unit === "ml" && qty >= 1000) return `${round(qty / 1000)} L`;
  return `${round(qty)} ${unit}`;
}

export function pantryMap(pantry: PantryItem[]) {
  return new Map(pantry.map((item) => [item.id, item]));
}

export function unitPrice(item: PantryItem) {
  return item.packSize > 0 ? item.packPrice / item.packSize : 0;
}

export function costPerServing(parfait: Parfait, pantry: PantryItem[]) {
  const items = pantryMap(pantry);
  return parfait.ingredients.reduce((sum, line) => {
    const item = items.get(line.itemId);
    return item ? sum + unitPrice(item) * line.qtyPerServing : sum;
  }, 0);
}

export interface ShoppingLine {
  item: PantryItem;
  needed: number;
  toBuy: number;
  packs: number;
  cost: number;
  leftover: number;
  usedBy: { parfaitId: string; qty: number }[];
}

/** Ingredient need for one batch of entries, with waste buffer. */
function needs(
  entries: Pick<TrialEntry, "parfaitId" | "planned">[],
  parfaits: Parfait[],
  wastePct: number,
) {
  const byId = new Map(parfaits.map((p) => [p.id, p]));
  const totals = new Map<string, { needed: number; usedBy: ShoppingLine["usedBy"] }>();
  for (const entry of entries) {
    const parfait = byId.get(entry.parfaitId);
    if (!parfait || entry.planned <= 0) continue;
    for (const line of parfait.ingredients) {
      const qty = line.qtyPerServing * entry.planned * (1 + wastePct / 100);
      const current = totals.get(line.itemId) ?? { needed: 0, usedBy: [] };
      current.needed += qty;
      current.usedBy.push({ parfaitId: parfait.id, qty });
      totals.set(line.itemId, current);
    }
  }
  return totals;
}

function packsFor(toBuy: number, item: PantryItem) {
  // Small epsilon so 1000.0000001 g doesn't round up to an extra tub.
  return toBuy <= 0 || item.packSize <= 0 ? 0 : Math.ceil(toBuy / item.packSize - 1e-9);
}

/** One combined list for every parfait in the trial. */
export function shoppingList(
  trial: Trial,
  parfaits: Parfait[],
  pantry: PantryItem[],
): ShoppingLine[] {
  const items = pantryMap(pantry);
  const lines: ShoppingLine[] = [];
  for (const [itemId, { needed, usedBy }] of needs(trial.entries, parfaits, trial.wastePct)) {
    const item = items.get(itemId);
    if (!item) continue;
    const toBuy = Math.max(0, needed - item.onHand);
    const packs = packsFor(toBuy, item);
    lines.push({
      item,
      needed,
      toBuy,
      packs,
      cost: packs * item.packPrice,
      leftover: item.onHand + packs * item.packSize - needed,
      usedBy,
    });
  }
  return lines.sort((a, b) => b.cost - a.cost);
}

/** What it would cost if each parfait's ingredients were bought on their own. */
export function separateCost(trial: Trial, parfaits: Parfait[], pantry: PantryItem[]) {
  const items = pantryMap(pantry);
  let total = 0;
  for (const entry of trial.entries) {
    for (const [itemId, { needed }] of needs([entry], parfaits, trial.wastePct)) {
      const item = items.get(itemId);
      if (!item) continue;
      total += packsFor(needed, item) * item.packPrice;
    }
  }
  return total;
}

export function entryStats(entry: TrialEntry, parfait: Parfait | undefined, pantry: PantryItem[]) {
  const ratings = entry.feedback.map((f) => f.rating);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  const buyAgain = entry.feedback.length
    ? entry.feedback.filter((f) => f.wouldBuyAgain).length / entry.feedback.length
    : null;
  const unitCost = parfait ? costPerServing(parfait, pantry) : 0;
  const revenue = entry.sold * (parfait?.sellPrice ?? 0);
  return {
    sellThrough: entry.made > 0 ? entry.sold / entry.made : null,
    perHour: entry.hoursToSell > 0 ? entry.sold / entry.hoursToSell : null,
    avgRating,
    buyAgain,
    revenue,
    profit: revenue - entry.made * unitCost,
  };
}

export interface LeaderRow {
  parfait: Parfait;
  trials: number;
  made: number;
  sold: number;
  hours: number;
  ratings: number[];
  buyAgain: number;
  feedbackCount: number;
  profit: number;
  score: number;
}

/**
 * Ranks parfaits across every trial that has results.
 * Score (0–100): 40% sell-through, 40% avg rating, 20% sales speed vs. the fastest.
 */
export function leaderboard(trials: Trial[], parfaits: Parfait[], pantry: PantryItem[]): LeaderRow[] {
  const rows = new Map<string, LeaderRow>();
  for (const trial of trials) {
    for (const entry of trial.entries) {
      const parfait = parfaits.find((p) => p.id === entry.parfaitId);
      if (!parfait || entry.made <= 0) continue;
      const row = rows.get(parfait.id) ?? {
        parfait, trials: 0, made: 0, sold: 0, hours: 0, ratings: [], buyAgain: 0, feedbackCount: 0, profit: 0, score: 0,
      };
      row.trials += 1;
      row.made += entry.made;
      row.sold += entry.sold;
      row.hours += entry.hoursToSell;
      row.ratings.push(...entry.feedback.map((f) => f.rating));
      row.buyAgain += entry.feedback.filter((f) => f.wouldBuyAgain).length;
      row.feedbackCount += entry.feedback.length;
      row.profit += entryStats(entry, parfait, pantry).profit;
      rows.set(parfait.id, row);
    }
  }
  const list = [...rows.values()];
  const speed = (r: LeaderRow) => (r.hours > 0 ? r.sold / r.hours : 0);
  const fastest = Math.max(0, ...list.map(speed));
  for (const r of list) {
    const sellThrough = r.made ? r.sold / r.made : 0;
    const rating = r.ratings.length ? r.ratings.reduce((a, b) => a + b, 0) / r.ratings.length / 5 : 0;
    r.score = Math.round(100 * (0.4 * sellThrough + 0.4 * rating + 0.2 * (fastest ? speed(r) / fastest : 0)));
  }
  return list.sort((a, b) => b.score - a.score);
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
