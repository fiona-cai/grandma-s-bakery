"use client";

import { ShopProvider } from "@/lib/store";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <ShopProvider>{children}</ShopProvider>;
}
