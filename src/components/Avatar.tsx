export function Avatar({ emoji, blush, size = "md" }: { emoji: string; blush: string; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-10 w-10 text-lg" : "h-14 w-14 text-2xl";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border-2 border-white shadow-[0_3px_0_var(--line)] ${dims}`}
      style={{ background: blush }}
      aria-hidden
    >
      {emoji}
    </span>
  );
}
