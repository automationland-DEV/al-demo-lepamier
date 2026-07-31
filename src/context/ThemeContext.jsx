import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const ACCENTS = [
  { id: "navy",   label: "Xanh navy",   light: "#2563eb", dark: "#60a5fa" },
  { id: "green",  label: "Xanh lục",    light: "#10b981", dark: "#34d399" },
  { id: "purple", label: "Tím",         light: "#8b5cf6", dark: "#a78bfa" },
  { id: "orange", label: "Cam",         light: "#f97316", dark: "#fb923c" },
  { id: "red",    label: "Đỏ",          light: "#ef4444", dark: "#f87171" },
  { id: "amber",  label: "Vàng",        light: "#f59e0b", dark: "#fbbf24" },
  /* Đa sắc — mỗi nhóm phân loại một màu riêng thay vì cùng một tông.
   * Xem src/theme/palette.js để biết màu nào đổi và màu nào giữ nguyên. */
  {
    id: "multi", label: "Đa sắc", multi: true,
    light: "#6366f1", dark: "#818cf8",
    swatch: "linear-gradient(135deg,#6366f1 0%,#a855f7 34%,#ec4899 67%,#f59e0b 100%)",
    desc: "Mỗi nhóm một màu riêng",
  },
];

export const DENSITIES = [
  { id: "compact",    label: "Thu gọn" },
  { id: "comfortable", label: "Thoải mái" },
  { id: "spacious",   label: "Rộng rãi" },
];

export const FONT_SIZES = [
  { id: "sm", label: "Nhỏ",   value: 0.92 },
  { id: "md", label: "Vừa",   value: 1 },
  { id: "lg", label: "Lớn",   value: 1.1 },
];

const STORAGE_KEY = "lepalmier.theme";

const DEFAULTS = {
  theme: "light",
  accent: "navy",
  density: "comfortable",
  fontSize: "md",
};

function readStored() {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [state, setState] = useState(readStored);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", state.theme);
    root.setAttribute("data-accent", state.accent);
    root.setAttribute("data-density", state.density);
    const font = FONT_SIZES.find((f) => f.id === state.fontSize);
    root.style.setProperty("--font-scale", String(font?.value ?? 1));
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const setTheme = (theme) => setState((s) => ({ ...s, theme }));
  const setAccent = (accent) => setState((s) => ({ ...s, accent }));
  const setDensity = (density) => setState((s) => ({ ...s, density }));
  const setFontSize = (fontSize) => setState((s) => ({ ...s, fontSize }));
  const reset = () => setState(DEFAULTS);

  const value = useMemo(
    () => ({ ...state, setTheme, setAccent, setDensity, setFontSize, reset }),
    [state]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

/* Helper: trả về object màu chuẩn theo theme/accent hiện tại.
 * Dùng trong các component thay vì hardcode tailwind class.
 */
export const CSS_VAR_KEYS = [
  "bg", "bg-app", "surface", "surface-2", "surface-3", "border", "border-soft",
  "fg", "fg-muted", "fg-subtle", "on-accent",
  "accent", "accent-strong", "accent-soft", "accent-fg", "accent-hover",
  "success", "success-soft", "success-fg", "success-border",
  "warning", "warning-soft", "warning-fg", "warning-border",
  "danger",  "danger-soft",  "danger-fg",  "danger-border",
  "info",    "info-soft",    "info-fg",    "info-border",
  "highlight", "highlight-soft", "highlight-fg", "highlight-border",
];

export function useThemeVars() {
  if (typeof window === "undefined") {
    return Object.fromEntries(CSS_VAR_KEYS.map((k) => [
      k === "bg" ? "bg" : k,
      `var(--${k})`,
    ]));
  }
  const cs = window.getComputedStyle(document.documentElement);
  const out = {};
  for (const k of CSS_VAR_KEYS) {
    out[k] = cs.getPropertyValue(`--${k}`).trim();
  }
  return out;
}