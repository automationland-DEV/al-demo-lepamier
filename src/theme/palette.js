import { useMemo } from "react";
import { useTheme, ACCENTS } from "../context/ThemeContext";

/**
 * Tầng bảng màu trung tâm.
 *
 * Mọi màu PHÂN LOẠI (vai trò, danh mục, chuỗi KPI) phải lấy từ đây thay vì
 * hardcode hex trong trang. Nhờ vậy công tắc "Đơn sắc / Đa sắc" trong
 * Cài đặt → Giao diện tác động được tới toàn hệ thống.
 *
 * Ba loại màu, xử lý khác nhau:
 *
 *  1. PHÂN LOẠI  — đổi theo chế độ. Đa sắc: 7 gradient rực rỡ khác nhau.
 *                  Đơn sắc: dải cùng tông với accent, khác nhau ở độ sáng.
 *  2. NGỮ NGHĨA  — KHÔNG đổi. "Lỗi" luôn đỏ, "Thành công" luôn xanh lục.
 *                  Đổi màu ở đây là phá mất ý nghĩa.
 *  3. THƯƠNG HIỆU NGOÀI — KHÔNG đổi. Facebook luôn xanh, YouTube luôn đỏ.
 *                  Đó là nhận diện của họ, không phải trang trí của mình.
 */

/* ───────────── Chuyển đổi màu ───────────── */

function hexToHsl(hex) {
  let h = String(hex).replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0, hue = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    hue = max === r ? (g - b) / d + (g < b ? 6 : 0)
        : max === g ? (b - r) / d + 2
        : (r - g) / d + 4;
    hue *= 60;
  }
  return [hue, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  const S = Math.max(0, Math.min(100, s)) / 100;
  const L = Math.max(0, Math.min(100, l)) / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = S * Math.min(L, 1 - L);
  const f = (n) => {
    const v = L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * v).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/* ───────────── Bảng đa sắc (mặc định) ───────────── */

export const MULTI_BRAND = { from: "#6366f1", to: "#a855f7" };


export const MULTI_SERIES = [
  { from: "#696bf2", to: "#9b9cf1", soft: "#e2e2fe", ink: "#0d11e3" }, // indigo
  { from: "#0ea774", to: "#1dd89b", soft: "#e2fef4", ink: "#045037" }, // emerald
  { from: "#ca840d", to: "#edb659", soft: "#fef3e2", ink: "#603f05" }, // amber
  { from: "#0e9cdb", to: "#75caf0", soft: "#e2f5fe", ink: "#064a6a" }, // sky
  { from: "#f3415f", to: "#f396a6", soft: "#fee2e6", ink: "#8e071e" }, // rose
  { from: "#d946ef", to: "#e69cf1", soft: "#fae2fe", ink: "#790789" }, // fuchsia
  { from: "#69a312", to: "#8cd222", soft: "#f3fde2", ink: "#314e06" }, // lime
];

/* ───────────── Dải đơn sắc dẫn xuất từ accent ───────────── */

/** Độ sáng cảm nhận (WCAG relative luminance) của một mã hex */
function relLum(hex) {
  const h = hex.replace("#", "");
  const c = [0, 1, 2]
    .map((i) => parseInt(h.slice(i * 2, i * 2 + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** Tìm độ sáng HSL sao cho màu đạt đúng độ sáng cảm nhận mong muốn */
function lightnessFor(h, s, targetLum) {
  let lo = 4, hi = 96;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (relLum(hslToHex(h, s, mid)) < targetLum) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Sinh n bộ màu cùng tông với accent.
 *
 * Điểm mấu chốt: **mọi bộ có cùng độ sáng cảm nhận**, chỉ khác độ bão hòa.
 * Nếu để độ sáng HSL chạy tự do thì ô icon đầu sẽ rất đậm còn ô cuối nhạt
 * hẳn — nhìn như lỗi chứ không như hệ thống. Cân bằng theo relative luminance
 * chứ không theo L của HSL, vì L không phản ánh đúng cảm nhận của mắt.
 */
const LUM_ICON = 0.15;   // nền ô icon: đủ tối để icon trắng đạt tương phản
const LUM_TO   = 0.30;   // điểm cuối gradient: sáng hơn một bậc
const LUM_INK  = 0.055;  // chữ trên nền pastel

export function monoSeries(hex, n, dark = false) {
  const [h, s0] = hexToHsl(hex);
  const count = Math.max(n, 1);
  const satHi = Math.max(46, Math.min(s0, 82));
  const satLo = Math.max(24, satHi - 44);

  return Array.from({ length: count }, (_, i) => {
    const t = count <= 1 ? 0 : i / (count - 1);
    const sat = satHi - t * (satHi - satLo);     // đậm màu → nhạt màu
    return {
      from: hslToHex(h, sat, lightnessFor(h, sat, LUM_ICON)),
      to:   hslToHex(h, sat, lightnessFor(h, sat, LUM_TO)),
      soft: dark ? hslToHex(h, 32, 20) : hslToHex(h, Math.min(sat + 20, 88), 94),
      ink:  dark ? hslToHex(h, 58, 76) : hslToHex(h, Math.min(sat + 14, 88), lightnessFor(h, Math.min(sat + 14, 88), LUM_INK)),
    };
  });
}

/* ───────────── Hook dùng trong trang ───────────── */

export function usePalette() {
  const { accent, theme } = useTheme();

  return useMemo(() => {
    const isMulti = accent === "multi";
    const dark = theme === "dark";
    const def = ACCENTS.find((a) => a.id === accent) || ACCENTS[0];
    const accentHex = def.multi ? MULTI_BRAND.from : (dark ? def.dark : def.light);
    const [h, s, l] = hexToHsl(accentHex);

    const brand = isMulti
      ? MULTI_BRAND
      : { from: accentHex, to: hslToHex(h, Math.max(30, s - 8), Math.min(l + 12, 74)) };

    /** Trả về mảng n bộ màu phân loại */
    const series = (n) =>
      isMulti
        ? Array.from({ length: n }, (_, i) => MULTI_SERIES[i % MULTI_SERIES.length])
        : monoSeries(accentHex, n, dark);

    /** Gán màu cho danh sách khoá cố định → { key: {from,to,soft,ink} } */
    const seriesMap = (keys) => {
      const arr = series(keys.length);
      return Object.fromEntries(keys.map((k, i) => [k, arr[i]]));
    };

    return { isMulti, accentHex, brand, series, seriesMap };
  }, [accent, theme]);
}

/* ───────────── Màu ngữ nghĩa — KHÔNG đổi theo chế độ ───────────── */


export const TONE = {
  success: { bg: "#d9f9e7", ink: "#15803d", dot: "#10b981", from: "#0ea774", to: "#1dd89b" },
  warning: { bg: "#fef1d8", ink: "#b45309", dot: "#f59e0b", from: "#ca840f", to: "#ebb65e" },
  danger:  { bg: "#ffe6ea", ink: "#be123c", dot: "#f43f5e", from: "#f14361", to: "#f297a6" },
  info:    { bg: "#e4f3fe", ink: "#0369a1", dot: "#0ea5e9", from: "#109cdb", to: "#78c9ee" },
  neutral: { bg: "#eef1f6", ink: "#475569", dot: "#94a3b8", from: "#6f7b8d", to: "#a3adbd" },
};

/** Ngưỡng điểm SEO / chất lượng — luôn dùng màu ngữ nghĩa */
export const scoreTone = (v) =>
  v >= 85 ? TONE.success : v >= 70 ? TONE.warning : TONE.danger;
