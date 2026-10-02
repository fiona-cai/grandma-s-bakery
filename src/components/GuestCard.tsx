"use client";

import {
  ALLERGEN_WORD,
  COPY,
  ingredientLabel,
  LANGS,
  menuPrice,
  recipeAllergens,
  REVIEWS,
  substitutions,
  travelPack,
  windowCopy,
  type MenuLang,
} from "@/lib/desk";
import { recipeIngredients } from "@/lib/recipes";
import { useShop } from "@/lib/store";
import type { Recipe } from "@/lib/types";
import { useState } from "react";
import { ParfaitGlass } from "./ParfaitGlass";

const NO_ALLERGENS: Record<MenuLang, string> = {
  en: "no common allergens",
  es: "sin alérgenos comunes",
  zh: "无常见过敏原",
};

const ROAD_COPY: Partial<Record<MenuLang, string>> = {
  es: "El crujiente y el sirope van en la tapa. La fruta y la crema se quedan. 18¢.",
  zh: "脆料和糖浆在盖杯里，果层和奶层不动。18¢。",
};

export function GuestCard({ recipe }: { recipe: Recipe }) {
  const { replyTo, replied } = useShop();
  const [lang, setLang] = useState<MenuLang>("en");
  const layers = recipeIngredients(recipe);
  const allergens = recipeAllergens(recipe);
  const pack = travelPack(recipe);
  const sign = windowCopy(recipe);
  const words = COPY[lang];
  const price = menuPrice(recipe);

  return (
    <section className="pop-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">The card in the window</p>
          <h3 className="font-display text-2xl font-semibold">One card. The line doesn&apos;t stop.</h3>
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Menu language">
          {LANGS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={lang === item.id}
              onClick={() => setLang(item.id)}
              className="chip"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        {/* the menu card itself */}
        <div className="relative overflow-hidden rounded-[28px] border-[6px] border-[#a06b3e] bg-[var(--teal-ink)] p-6 text-[var(--cream)] shadow-[0_6px_0_#87552d]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display text-3xl font-semibold leading-tight">{recipe.name}</p>
              <p className="font-hand mt-1 text-xl text-[var(--teal-mist)]">{recipe.tagline}</p>
            </div>
            <span className="font-display shrink-0 rounded-full bg-[var(--butter)] px-4 py-2 text-xl font-semibold text-[var(--cocoa)] rotate-[6deg]">
              ${price.toFixed(2)}
            </span>
          </div>

          <div className="mt-5 grid items-end gap-5 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="kicker !text-[var(--teal-mist)]">{words.layers}</p>
              <ul className="mt-2 space-y-1">
                {layers
                  .slice()
                  .reverse()
                  .map((ingredient) => (
                    <li key={ingredient.id} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/40"
                        style={{ background: ingredient.color }}
                      />
                      {ingredientLabel(ingredient.id, lang)}
                    </li>
                  ))}
              </ul>
            </div>
            <div className="hidden sm:block">
              <ParfaitGlass recipe={recipe} size="sm" animate={false} />
            </div>
          </div>

          <div className="mt-5 space-y-2 border-t-2 border-dashed border-white/25 pt-4 text-sm">
            <p>
              <span className="font-bold">⚠️ {words.contains}: </span>
              {allergens.length
                ? allergens.map((allergen) => ALLERGEN_WORD[lang][allergen]).join(" · ")
                : NO_ALLERGENS[lang]}
            </p>
            {substitutions(recipe, lang).map((swap) => (
              <p key={swap} className="text-[var(--teal-mist)]">
                🔄 {words.swap}: {swap}
              </p>
            ))}
            <p>
              <span className="font-bold">🥤 {words.road}. </span>
              {ROAD_COPY[lang] ?? pack.how}
            </p>
          </div>
        </div>

        {/* window sign + reviews */}
        <div className="space-y-4">
          <div className="card p-5">
            <p className="kicker">Window + the phone</p>
            <p className="font-display mt-2 text-xl font-semibold leading-snug">{sign.sign}</p>
            <p className="mt-2 text-sm text-[var(--cocoa-soft)]">{sign.caption}</p>
          </div>
          {REVIEWS.map((review) => {
            const done = replied.includes(review.id);
            return (
              <article key={review.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display font-semibold">
                    {review.author} <span className="text-[var(--latte)]">on {review.via}</span>
                  </p>
                  <span className="text-[var(--caramel)]" aria-label={`${review.stars} stars`}>
                    {"★".repeat(review.stars)}
                    <span className="text-[var(--line)]">{"★".repeat(5 - review.stars)}</span>
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">“{review.body}”</p>
                <div className="mt-3 rounded-2xl bg-[var(--teal-foam)] p-3 text-sm text-[var(--teal-ink)]">
                  <span className="font-bold">Grandma&apos;s reply: </span>
                  {review.reply}
                </div>
                <button
                  type="button"
                  onClick={() => replyTo(review.id)}
                  disabled={done}
                  className={`btn btn-sm mt-3 ${done ? "btn-ghost cursor-default !shadow-none" : "btn-teal"}`}
                >
                  {done ? "✓ Posted" : "💬 Post this reply"}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
