"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CUSTOMERS } from "./customers";
import type { Recipe, TastingResult } from "./types";

const STORAGE_KEY = "bakeria-shop";

export interface ShopState {
  fotm: Recipe | null;
  lastTasting: TastingResult[] | null;
  extraVisits: Record<string, number>;
}

const defaultState: ShopState = {
  fotm: null,
  lastTasting: null,
  extraVisits: {},
};

interface ShopContextValue extends ShopState {
  adoptFotm: (recipe: Recipe, tasting: TastingResult[]) => void;
  clearFotm: () => void;
  stamp: (customerId: string) => void;
  customers: typeof CUSTOMERS;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
    } catch {
      setState(defaultState);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

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

    return {
      ...state,
      customers,
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
        })),
    };
  }, [state]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop must be used inside ShopProvider");
  return value;
}
