// Category -> { label, Tailwind bg/fg utility classes, raw hex (for FullCalendar inline styles) }
export const CATEGORIES = {
  social: { label: "Social", bg: "#ece4ff", fg: "#6b4ce6", bgClass: "bg-pastel-lavender-bg", fgClass: "text-pastel-lavender-fg" },
  trip: { label: "Day trip", bg: "#dbf5e3", fg: "#1f8a4f", bgClass: "bg-pastel-mint-bg", fgClass: "text-pastel-mint-fg" },
  food: { label: "Food", bg: "#ffe1cf", fg: "#c25a14", bgClass: "bg-pastel-peach-bg", fgClass: "text-pastel-peach-fg" },
  night: { label: "Night out", bg: "#ffd9e6", fg: "#c2185b", bgClass: "bg-pastel-pink-bg", fgClass: "text-pastel-pink-fg" },
  chill: { label: "Chill", bg: "#d8ecf7", fg: "#1a7195", bgClass: "bg-pastel-sky-bg", fgClass: "text-pastel-sky-fg" },
  other: { label: "Other", bg: "#efe7da", fg: "#7a6a55", bgClass: "bg-pastel-sand-bg", fgClass: "text-pastel-sand-fg" },
};

export function categoryOf(key) {
  return CATEGORIES[key] || CATEGORIES.other;
}
