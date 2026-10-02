import { recipeIngredients } from "@/lib/recipes";
import type { Recipe } from "@/lib/types";

export function ParfaitGlass({
  recipe,
  size = "md",
}: {
  recipe: Recipe;
  size?: "sm" | "md" | "lg";
}) {
  const ingredients = recipeIngredients(recipe);
  const width = size === "sm" ? "w-16" : size === "lg" ? "w-28" : "w-20";
  const height = size === "sm" ? "h-28" : size === "lg" ? "h-48" : "h-36";

  return (
    <div className={`relative mx-auto ${width} ${height}`}>
      <div className="absolute inset-x-[8%] top-[6%] bottom-[10%] overflow-hidden rounded-b-[1.4rem] rounded-t-[0.35rem] border border-white/60 bg-white/20 shadow-[inset_0_0_0_1px_rgba(80,50,20,0.12)]">
        <div className="absolute right-[12%] top-0 z-10 h-full w-[18%] bg-gradient-to-l from-white/50 to-transparent" />
        <div className="flex h-full flex-col-reverse">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="relative min-h-0 flex-1"
              style={{ background: ingredient.color }}
              title={ingredient.name}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/25" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 h-[10%] w-[72%] -translate-x-1/2 rounded-b-full bg-[var(--glass-foot)]" />
    </div>
  );
}
