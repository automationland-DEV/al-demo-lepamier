import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Design System v4 "Palmier Riviera" — Design.md §2.2
 *
 * v3 cho người dùng chọn 6 accent rực rỡ + một chế độ "Đa sắc" tô 7 màu cầu
 * vồng cho các nhóm phân loại. Tổ hợp nào cũng chọn được, kể cả tổ hợp xấu.
 *
 * v4 thay bằng BỘ SƯU TẬP: mỗi bộ là một cặp *màu nhà* + *kim loại* + *loại
 * giấy* đã phối sẵn. Người dùng vẫn đổi được diện mạo nhưng không bao giờ
 * chọn ra thứ lệch tông.
 *
 * Màu ngữ nghĩa (thành công/cảnh báo/lỗi) và màu phân loại KHÔNG đổi theo bộ
 * sưu tập — xem src/theme/palette.js.
 */
export const COLLECTIONS = [
  {
    id: "olive",
    label: "Ô-liu & Đồng thau",
    desc: "Vườn Provence · mặc định",
    house: { light: "#2f4a3c", dark: "#8fb39b" },
    metal: "#a8834b",
    paper: { light: "#eeeae1", dark: "#131410" },
  },
  {
    id: "bordeaux",
    label: "Bordeaux & Xương",
    desc: "Hầm rượu, phòng ăn tối",
    house: { light: "#5b2434", dark: "#c89099" },
    metal: "#a8834b",
    paper: { light: "#efeae6", dark: "#14110f" },
  },
  {
    id: "marine",
    label: "Hải quân & Cát",
    desc: "Bờ biển Côte d'Azur",
    house: { light: "#1f3a5f", dark: "#8faecc" },
    metal: "#b08d57",
    paper: { light: "#edebe4", dark: "#101216" },
  },
  {
    id: "noir",
    label: "Noir & Champagne",
    desc: "Sảnh khách sạn về đêm",
    house: { light: "#252420", dark: "#cfc9bc" },
    metal: "#b99a5b",
    paper: { light: "#eeece7", dark: "#121210" },
  },
];

export const DENSITIES = [
  { id: "compact", label: "Thu gọn" },
  { id: "comfortable", label: "Thoải mái" },
  { id: "spacious", label: "Rộng rãi" },
];

export const FONT_SIZES = [
  { id: "sm", label: "Nhỏ", value: 0.92 },
  { id: "md", label: "Vừa", value: 1 },
  { id: "lg", label: "Lớn", value: 1.1 },
];

/* Người dùng đang chạy v3 có localStorage lưu accent cũ. Không ánh xạ thì
 * <html> nhận data-collection="navy" — không khớp selector nào trong
 * index.css, và chế độ tối sẽ rơi về lưới an toàn thay vì bộ màu thật. */
const LEGACY_ACCENT_MAP = {
  navy: "marine",
  green: "olive",
  purple: "bordeaux",
  orange: "olive",
  red: "bordeaux",
  amber: "olive",
  multi: "olive",
};

const STORAGE_KEY = "condohub.theme";

const DEFAULTS = {
  theme: "light",
  collection: "olive",
  density: "comfortable",
  fontSize: "md",
};

const isValidCollection = (id) => COLLECTIONS.some((c) => c.id === id);

function normalize(raw) {
  const next = { ...DEFAULTS, ...raw };
  // v3 lưu khóa `accent`; chuyển sang `collection` rồi bỏ khóa cũ đi.
  if (!isValidCollection(next.collection)) {
    next.collection = LEGACY_ACCENT_MAP[raw?.accent] || DEFAULTS.collection;
  }
  delete next.accent;
  if (next.theme !== "dark") next.theme = "light";
  if (!DENSITIES.some((d) => d.id === next.density)) next.density = DEFAULTS.density;
  if (!FONT_SIZES.some((f) => f.id === next.fontSize)) next.fontSize = DEFAULTS.fontSize;
  return next;
}

function readStored() {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return normalize(JSON.parse(raw));
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
    root.setAttribute("data-collection", state.collection);
    root.setAttribute("data-density", state.density);
    // v3 đọc data-accent — giữ lại cho tới khi trang cuối cùng migrate.
    root.setAttribute("data-accent", state.collection);
    const font = FONT_SIZES.find((f) => f.id === state.fontSize);
    root.style.setProperty("--font-scale", String(font?.value ?? 1));
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* chế độ riêng tư chặn localStorage — bỏ qua, chỉ mất ghi nhớ */
    }
  }, [state]);

  const value = useMemo(() => {
    const setTheme = (theme) => setState((s) => ({ ...s, theme }));
    const setCollection = (collection) =>
      setState((s) => (isValidCollection(collection) ? { ...s, collection } : s));
    return {
      ...state,
      /* Alias tương thích ngược — Design.md §15 */
      accent: state.collection,
      setTheme,
      toggleTheme: () => setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
      setCollection,
      setAccent: setCollection,
      setDensity: (density) => setState((s) => ({ ...s, density })),
      setFontSize: (fontSize) => setState((s) => ({ ...s, fontSize })),
      reset: () => setState(DEFAULTS),
    };
  }, [state]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

/* ───────────── Tương thích ngược — Design.md §15 ─────────────
 * `ACCENTS` là API của v3. AppearanceModal.jsx (hiện không được import ở
 * đâu) vẫn tham chiếu nó. Giữ export để không vỡ, hình dạng khớp đủ để
 * render danh sách. Code mới dùng COLLECTIONS. */
export const ACCENTS = COLLECTIONS.map((c) => ({
  id: c.id,
  label: c.label,
  light: c.house.light,
  dark: c.house.dark,
  desc: c.desc,
}));

export const CSS_VAR_KEYS = [
  "bg-app", "surface", "surface-2", "surface-3", "border", "border-soft",
  "fg", "fg-muted", "fg-subtle", "on-accent",
  "accent", "accent-strong", "accent-soft", "accent-fg", "accent-hover",
  "metal", "metal-soft", "metal-fg",
  "success", "success-soft", "success-fg", "success-border",
  "warning", "warning-soft", "warning-fg", "warning-border",
  "danger", "danger-soft", "danger-fg", "danger-border",
  "info", "info-soft", "info-fg", "info-border",
  "highlight", "highlight-soft", "highlight-fg", "highlight-border",
  "neutral", "neutral-soft", "neutral-fg", "neutral-border",
];

/** Đọc giá trị thật của CSS variable — cần cho Recharts, vốn không nhận var(). */
export function useThemeVars() {
  if (typeof window === "undefined") {
    return Object.fromEntries(CSS_VAR_KEYS.map((k) => [k, `var(--${k})`]));
  }
  const cs = window.getComputedStyle(document.documentElement);
  return Object.fromEntries(
    CSS_VAR_KEYS.map((k) => [k, cs.getPropertyValue(`--${k}`).trim()])
  );
}
