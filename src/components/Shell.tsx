"use client";

import { useShop } from "@/lib/store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const LINKS = [
  { href: "/", label: "The shop", icon: "🏠" },
  { href: "/flavor", label: "Flavor studio", icon: "🥄" },
  { href: "/supplies", label: "Morning list", icon: "📝" },
  { href: "/loyalty", label: "Regulars & till", icon: "💌" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { fotm } = useShop();

  return (
    <div className="flex min-h-full flex-col">
      <div className="awning" aria-hidden />

      <header className="mx-auto mt-9 w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <LogoMark />
            <span className="leading-none">
              <span className="font-display block text-[1.9rem] font-semibold text-[var(--cocoa)]">
                Grandma&apos;s <span className="text-[var(--teal)]">Bakeria</span>
              </span>
              <span className="font-hand -mt-0.5 block text-lg text-[var(--latte)]">
                parfaits &amp; back office · est. 1987
              </span>
            </span>
          </Link>

          <nav
            aria-label="Main"
            className="flex gap-1 overflow-x-auto rounded-full border-2 border-[var(--line)] bg-[var(--paper)] p-1 shadow-[0_4px_0_var(--line)]"
          >
            {LINKS.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`font-display flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--teal)] text-white shadow-[0_3px_0_var(--teal-deep)]"
                      : "text-[var(--cocoa-soft)] hover:bg-[var(--teal-foam)] hover:text-[var(--teal-deep)]"
                  }`}
                >
                  <span aria-hidden>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {fotm ? (
          <div className="pop-in mt-5 flex flex-wrap items-center justify-between gap-2 rounded-full border-2 border-dashed border-[var(--teal)] bg-[var(--teal-foam)] px-5 py-2 text-sm">
            <p className="text-[var(--teal-ink)]">
              <span className="font-display font-semibold">✨ In the window this month:</span>{" "}
              {fotm.name}
            </p>
            <Link
              href="/flavor"
              className="font-display font-semibold text-[var(--teal-deep)] hover:underline"
            >
              Back to the studio →
            </Link>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="mt-10 border-t-2 border-dashed border-[var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-[var(--latte)] sm:flex-row sm:px-6">
          <p className="font-hand text-xl">made with brown butter &amp; stubbornness</p>
          <p>Corner of Maple &amp; 3rd · open 7am, gone by 4pm</p>
        </div>
      </footer>
    </div>
  );
}

function LogoMark() {
  return (
    <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-[var(--line)] bg-[var(--teal-foam)] shadow-[0_4px_0_var(--line)] transition group-hover:-rotate-6">
      <svg viewBox="0 0 40 48" width="30" height="36" aria-hidden>
        <circle cx="20" cy="5" r="3.6" fill="#d9546a" />
        <path d="M10 14 Q20 2 30 14 Z" fill="#fffaf3" stroke="#4a2c1d" strokeWidth="1.6" />
        <path d="M6 14 L34 14 L30 32 Q20 38 10 32 Z" fill="#fff" stroke="#4a2c1d" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8 20 L32 20 L31 25 L9 25 Z" fill="#2b8a84" />
        <path d="M9 25 L31 25 L30 31 Q20 36 10 31 Z" fill="#b07a4f" />
        <path d="M18 35 L17 42 L23 42 L22 35" fill="none" stroke="#4a2c1d" strokeWidth="1.6" />
        <path d="M12 44 L28 44" stroke="#4a2c1d" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}
