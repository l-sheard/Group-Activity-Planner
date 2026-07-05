// Shared Tailwind class strings for form/button primitives, so every component
// doesn't repeat the same long utility strings.
export const btnBase =
  "font-sans font-semibold border border-border-strong bg-surface text-text px-4 py-2 rounded-full cursor-pointer transition-colors active:translate-y-px hover:bg-accent-soft disabled:opacity-50 disabled:cursor-not-allowed";
export const btnPrimary =
  "font-sans font-semibold border border-accent bg-accent text-white px-4 py-2 rounded-full cursor-pointer transition-colors active:translate-y-px shadow-[0_4px_14px_rgba(44,37,64,.2)] hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed";
export const btnDanger =
  "font-sans font-semibold border border-[#f8c9c9] bg-[#fff5f5] text-danger px-4 py-2 rounded-full cursor-pointer transition-colors active:translate-y-px hover:bg-accent-soft disabled:opacity-50 disabled:cursor-not-allowed";
export const btnGhost =
  "font-sans font-semibold border border-transparent bg-transparent text-text px-4 py-2 rounded-full cursor-pointer transition-colors active:translate-y-px hover:bg-accent-soft disabled:opacity-50 disabled:cursor-not-allowed";

export const labelClass = "block text-xs text-muted mb-1 font-semibold";
export const inputClass =
  "w-full font-sans text-text bg-surface border border-border-strong rounded-[10px] px-3 py-2.5 outline-none transition-shadow focus:border-pastel-lavender-fg focus:shadow-[0_0_0_3px_#ece4ff]";
export const fieldClass = "mb-3";
