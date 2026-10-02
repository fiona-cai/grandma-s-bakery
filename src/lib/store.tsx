"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { CUSTOMERS } from "./customers";
import type { Recipe, TastingResult } from "./types";

const STORAGE_KEY = "bakeria-shop";

export interface ShopState {
  fotm: Recipe | null;
  lastTasting: TastingResult[] | null;
  extraVisits: Record<string, number>;
  replied: string[];
  campusYes: boolean;
  booksClosed: boolean;
}

const defaultState: ShopState = {
  fotm: null,
  lastTasting: null,
  extraVisits: {},
  replied: [],
  campusYes: false,
  booksClosed: false,
};

interface ShopContextValue extends ShopState {
  adoptFotm: (recipe: Recipe, tasting: TastingResult[]) => void;
  clearFotm: () => void;
  stamp: (customerId: string) => void;
  replyTo: (reviewId: string) => void;
  takeCampus: (yes: boolean) => void;
  closeBooks: () => void;
  customers: typeof CUSTOMERS;
  stampsToday: number;
}

const ShopContext = createContext<ShopContextValue | null>(null);

let snapshot: ShopState | null = null;
const listeners = new Set<() => void>();

function readSnapshot(): ShopState {
  if (snapshot) return snapshot;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    snapshot = raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    snapshot = defaultState;
  }
  return snapshot!;
}

function setState(update: (current: ShopState) => ShopState) {
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

export function ShopProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, readSnapshot, () => defaultState);

  const value = useMemo<ShopContextValue>(() => {
    const customers = CUSTOMERS.map((customer) => {
      const extra = state.extraVisits[customer.id] ?? 0;
      return {
        ...customer,
        visits: customer.visits + extra,
        points: customer.points + extra * 2,
        lastVisit: extra > 0 ? "Just now" : customer.lastVisit,
      };
    });

    const stampsToday = Object.values(state.extraVisits).reduce(
      (sum, count) => sum + count,
      0,
    );

    return {
      ...state,
      customers,
      stampsToday,
      adoptFotm: (recipe, tasting) =>
        setState((current) => ({ ...current, fotm: recipe, lastTasting: tasting })),
      clearFotm: () =>
        setState((current) => ({ ...current, fotm: null })),
      stamp: (customerId) =>
        setState((current) => ({
          ...current,
          extraVisits: {
            ...current.extraVisits,
            [customerId]: (current.extraVisits[customerId] ?? 0) + 1,
          },
          booksClosed: false,
        })),
      replyTo: (reviewId) =>
        setState((current) => ({
          ...current,
          replied: current.replied.includes(reviewId)
            ? current.replied
            : [...current.replied, reviewId],
        })),
      takeCampus: (yes) => setState((current) => ({ ...current, campusYes: yes })),
      closeBooks: () => setState((current) => ({ ...current, booksClosed: true })),
    };
  }, [state]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop must be used inside ShopProvider");
  return value;
}
