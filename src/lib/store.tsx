"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { uid } from "./planner";
import { SEED } from "./seed";
import type { Parfait, PantryItem, PurchaseLine, ShopData, Trial, TrialEntry } from "./types";

const STORAGE_KEY = "bakeria-v2";

interface ShopContextValue extends ShopData {
  ready: boolean;
  savePantryItem: (item: PantryItem) => void;
  deletePantryItem: (id: string) => void;
  saveParfait: (parfait: Parfait) => void;
  deleteParfait: (id: string) => void;
  createTrial: (name: string, parfaitIds: string[], batchFraction: number) => string;
  updateTrial: (id: string, patch: Partial<Trial>) => void;
  updateEntry: (trialId: string, parfaitId: string, patch: Partial<TrialEntry>) => void;
  deleteTrial: (id: string) => void;
  markBought: (trialId: string, lines: PurchaseLine[]) => void;
  undoBought: (trialId: string) => void;
  setUsualBatch: (n: number) => void;
  replaceAll: (data: ShopData) => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

let snapshot: ShopData | null = null;
const listeners = new Set<() => void>();

function readSnapshot(): ShopData {
  if (snapshot) return snapshot;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    snapshot = raw ? withDefaults(JSON.parse(raw)) : SEED;
  } catch {
    snapshot = SEED;
  }
  return snapshot!;
}

// Older saves predate pantry layers; borrow them from the seed by id.
function withDefaults(saved: Partial<ShopData>): ShopData {
  const data = { ...SEED, ...saved };
  return {
    ...data,
    pantry: data.pantry.map((item) =>
      item.layer ? item : { ...item, layer: SEED.pantry.find((s) => s.id === item.id)?.layer },
    ),
  };
}

function setData(update: (current: ShopData) => ShopData) {
  snapshot = update(readSnapshot());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // storage unavailable (private mode); keep the in-memory state
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // keep other open tabs in sync
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// Never changes after mount; lets `ready` be false only during SSR/hydration.
const subscribeNever = () => () => {};

export function ShopProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(subscribe, readSnapshot, () => SEED);
  const ready = useSyncExternalStore(subscribeNever, () => true, () => false);

  const value = useMemo<ShopContextValue>(() => {
    const upsert = <T extends { id: string }>(list: T[], next: T) =>
      list.some((x) => x.id === next.id)
        ? list.map((x) => (x.id === next.id ? next : x))
        : [...list, next];

    return {
      ...data,
      ready,
      savePantryItem: (item) =>
        setData((d) => ({ ...d, pantry: upsert(d.pantry, item) })),
      deletePantryItem: (id) =>
        setData((d) => ({
          ...d,
          pantry: d.pantry.filter((x) => x.id !== id),
          parfaits: d.parfaits.map((p) => ({
            ...p,
            ingredients: p.ingredients.filter((l) => l.itemId !== id),
          })),
        })),
      saveParfait: (parfait) =>
        setData((d) => ({ ...d, parfaits: upsert(d.parfaits, parfait) })),
      deleteParfait: (id) =>
        setData((d) => ({
          ...d,
          parfaits: d.parfaits.filter((x) => x.id !== id),
          trials: d.trials.map((t) => ({
            ...t,
            entries: t.entries.filter((e) => e.parfaitId !== id),
          })),
        })),
      createTrial: (name, parfaitIds, batchFraction) => {
        const id = uid("t");
        setData((d) => {
          const planned = Math.max(1, Math.round(d.settings.usualBatch * batchFraction));
          const trial: Trial = {
            id,
            name,
            startDate: new Date().toISOString().slice(0, 10),
            batchFraction,
            wastePct: 5,
            status: "planning",
            purchase: null,
            entries: parfaitIds.map((parfaitId) => ({
              parfaitId,
              planned,
              made: 0,
              sold: 0,
              hoursToSell: 0,
              feedback: [],
            })),
          };
          return { ...d, trials: [trial, ...d.trials] };
        });
        return id;
      },
      updateTrial: (id, patch) =>
        setData((d) => ({
          ...d,
          trials: d.trials.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      updateEntry: (trialId, parfaitId, patch) =>
        setData((d) => ({
          ...d,
          trials: d.trials.map((t) =>
            t.id !== trialId
              ? t
              : {
                  ...t,
                  entries: t.entries.map((e) =>
                    e.parfaitId === parfaitId ? { ...e, ...patch } : e,
                  ),
                },
          ),
        })),
      deleteTrial: (id) =>
        setData((d) => ({ ...d, trials: d.trials.filter((t) => t.id !== id) })),
      // Adds bought packs to the pantry, then takes out what the trial will use,
      // so on-hand reflects the leftovers after the parfaits are made.
      markBought: (trialId, lines) =>
        setData((d) => ({
          ...d,
          pantry: adjustOnHand(d.pantry, lines, 1),
          trials: d.trials.map((t) =>
            t.id === trialId
              ? { ...t, purchase: lines, status: t.status === "planning" ? "running" : t.status }
              : t,
          ),
        })),
      undoBought: (trialId) =>
        setData((d) => {
          const trial = d.trials.find((t) => t.id === trialId);
          if (!trial?.purchase) return d;
          return {
            ...d,
            pantry: adjustOnHand(d.pantry, trial.purchase, -1),
            trials: d.trials.map((t) => (t.id === trialId ? { ...t, purchase: null } : t)),
          };
        }),
      setUsualBatch: (n) =>
        setData((d) => ({ ...d, settings: { ...d.settings, usualBatch: n } })),
      replaceAll: (next) => setData(() => withDefaults(next)),
    };
  }, [data, ready]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

function adjustOnHand(pantry: PantryItem[], lines: PurchaseLine[], sign: 1 | -1) {
  return pantry.map((item) => {
    const line = lines.find((l) => l.itemId === item.id);
    if (!line) return item;
    const delta = line.packs * line.packSize - line.needed;
    const onHand = Math.max(0, Math.round((item.onHand + sign * delta) * 100) / 100);
    return { ...item, onHand };
  });
}

export function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop must be used inside ShopProvider");
  return value;
}
