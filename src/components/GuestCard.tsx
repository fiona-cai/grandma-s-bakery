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

export function GuestCard({ recipe }: { recipe: Recipe }) {
  const { replyTo, replied } = useShop();
  const [lang, setLang] = useState<MenuLang>("en");
  const layers = recipeIngredients(recipe);
  const allergens = recipeAllergens(recipe);
  const pack = travelPack(recipe);
  const window = windowCopy(recipe);
  const words = COPY[lang];
  const price = menuPrice(recipe);

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            The card in the window
          </p>
          <h3 className="font-display text-2xl">One card. Line does not stop.</h3>
        </div>
        <div className="flex gap-1">
          {LANGS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLang(item.id)}
              className={`rounded-full px-3 py-1 text-sm ${
                lang === item.id
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "bg-[var(--cream)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl bg-[var(--cream)] p-4">
          <p className="font-display text-3xl leading-tight">{recipe.name}</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{recipe.tagline}</p>
          <p className="mt-3 font-display text-2xl">${price.toFixed(2)}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {words.layers}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {layers.map((ingredient) => (
              <li key={ingredient.id}>{ingredientLabel(ingredient.id, lang)}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <span className="font-medium">{words.contains}: </span>
            {allergens.length
              ? allergens.map((allergen) => ALLERGEN_WORD[lang][allergen]).join(" · ")
              : lang === "es"
                ? "sin alérgenos comunes"
                : lang === "zh"
                  ? "无常见过敏原"
                  : "no common allergens"}
          </p>
          {substitutions(recipe, lang).map((swap) => (
            <p key={swap} className="mt-1 text-sm text-[var(--ink-soft)]">
              {words.swap}: {swap}
            </p>
          ))}
          <p className="mt-4 text-sm">
            <span className="font-medium">{words.road}. </span>
            {lang === "en"
              ? pack.how
              : lang === "es"
                ? "El crujiente y el sirope van en la tapa. La fruta y la crema se quedan. 18¢."
                : "脆料和糖浆在盖杯里，果层和奶层不动。18¢。"}
          </p>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-[var(--cream)] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Window + the phone
            </p>
            <p className="mt-2 font-display text-xl leading-snug">{window.sign}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{window.caption}</p>
          </div>
          {REVIEWS.map((review) => {
            const done = replied.includes(review.id);
            return (
              <article key={review.id} className="rounded-2xl bg-[var(--cream)] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  {review.via} · {review.stars}★ · {review.author}
                </p>
                <p className="mt-2 text-sm">“{review.body}”</p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Reply: {review.reply}
                </p>
                <button
                  type="button"
                  onClick={() => replyTo(review.id)}
                  className="mt-3 rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs text-[var(--paper)]"
                >
                  {done ? "Posted" : "Post this reply"}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
