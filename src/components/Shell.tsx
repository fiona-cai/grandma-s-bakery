"use client";

import { useShop } from "@/lib/store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const LINKS = [
  { href: "/", label: "The shop" },
  { href: "/flavor", label: "Flavor studio" },
  { href: "/supplies", label: "Morning list" },
  { href: "/loyalty", label: "Regulars & till" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { fotm } = useShop();

  return (
    <div className="min-h-full">
      <header className="border-b border-[var(--line)] bg-[color:var(--paper)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="font-display text-2xl tracking-tight text-[var(--ink)]">
              Grandma&apos;s Bakeria
            </span>
            <span className="hidden text-xs uppercase tracking-[0.22em] text-[var(--muted)] sm:inline">
              Back office
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-[var(--ink)] text-[var(--paper)]"
                      : "text-[var(--ink-soft)] hover:bg-[var(--cream)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {fotm ? (
          <div className="border-t border-[var(--line)] bg-[var(--maple)]/15">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2 text-sm">
              <p>
                <span className="font-medium">Flavor of the month · </span>
                {fotm.name}
              </p>
              <Link href="/flavor" className="text-[var(--maple)] underline-offset-2 hover:underline">
                Open studio
              </Link>
            </div>
          </div>
        ) : null}
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
