import { useMemo } from "react";
import { useTheme, COLLECTIONS } from "../context/ThemeContext";

/**
 * Tầng bảng màu trung tâm — Design System v4 "Palmier Riviera".
 * Đặc tả: Design.md §2.2 – §2.5
 *
 * Ba loại màu, xử lý khác nhau:
 *
 *  1. MÀU NHÀ    — đổi theo bộ sưu tập người dùng chọn (ô-liu / bordeaux /
 *                  hải quân / noir). Dùng cho nút chính, tab đang chọn, liên kết.
 *  2. PHÂN LOẠI  — bảy sắc đất, GIỮ NGUYÊN ở mọi bộ sưu tập. Đổi bộ màu mà
 *                  "màu của bộ phận Lễ tân" cũng đổi thì người dùng mất mốc.
 *  3. NGỮ NGHĨA  — thông / hoàng thổ / đất nung / đá phiến. Không đổi.
 *
 * KHÔNG có gradient. Mỗi màu chỉ có `base` (đặc), `soft` (nền), `fg` (chữ
 * trên nền soft). Các khóa `from`/`to`/`ink` tồn tại để trang chưa migrate
 * không vỡ — chúng cố ý gần như trùng nhau nên gradient 135° cũ render ra
 * gần như màu phẳng. Xem Design.md §15.
 */

/* ═══════════ 1. BẢNG ĐẤT — màu phân loại ═══════════
 *
 * Bảy sắc nằm cùng một dải độ sáng (L* 38–50) nên đứng cạnh nhau không cái
 * nào át cái nào — đọc như một bộ mẫu sơn, không như hộp bút màu.
 * Thứ tự cố định: thêm nhóm phân loại mới thì lấy tiếp theo thứ tự này. */

export const EARTH_LIGHT = [
  { key: "olive",      label: "Ô-liu",     base: "#3e5c49", soft: "#e5eae6", fg: "#2f4737" },
  { key: "brass",      label: "Đồng thau", base: "#a8834b", soft: "#f3eadb", fg: "#7a5d2e" },
  { key: "terracotta", label: "Đất nung",  base: "#9b5b45", soft: "#f3e6e1", fg: "#78432f" },
  { key: "slate",      label: "Đá phiến",  base: "#465a6b", soft: "#e5eaee", fg: "#35454f" },
  { key: "plum",       label: "Mận",       base: "#6b4557", soft: "#eee5e9", fg: "#533444" },
  { key: "sage",       label: "Xô thơm",   base: "#7e8f6e", soft: "#eaede4", fg: "#556247" },
  { key: "clay",       label: "Đất sét",   base: "#8c6f5c", soft: "#efe8e2", fg: "#6a5344" },
];

export const EARTH_DARK = [
  { key: "olive",      label: "Ô-liu",     base: "#8aa894", soft: "#22302a", fg: "#a3bfac" },
  { key: "brass",      label: "Đồng thau", base: "#c9a469", soft: "#332a1b", fg: "#dcbd8b" },
  { key: "terracotta", label: "Đất nung",  base: "#c08a72", soft: "#33241e", fg: "#d6a995" },
  { key: "slate",      label: "Đá phiến",  base: "#8aa0b2", soft: "#222b33", fg: "#a9bece" },
  { key: "plum",       label: "Mận",       base: "#b08ba0", soft: "#2e232a", fg: "#c8a8b8" },
  { key: "sage",       label: "Xô thơm",   base: "#a3b393", soft: "#282e22", fg: "#bbc9ac" },
  { key: "clay",       label: "Đất sét",   base: "#b89882", soft: "#2e261f", fg: "#cfb49f" },
];

/* ═══════════ 2. MÀU NHÀ — dẫn xuất từ bộ sưu tập ═══════════ */

const HOUSE = {
  olive: {
    light: { base: "#2f4a3c", strong: "#23372c", soft: "#e4eae3", fg: "#2a4437", hover: "#3a5b4a", on: "#fbfaf7" },
    dark:  { base: "#8fb39b", strong: "#a9c7b4", soft: "#22322a", fg: "#a9c7b4", hover: "#7fa78c", on: "#131410" },
  },
  bordeaux: {
    light: { base: "#5b2434", strong: "#451a27", soft: "#f0e3e6", fg: "#5b2434", hover: "#74303f", on: "#fcfaf8" },
    dark:  { base: "#c89099", strong: "#d9a9b0", soft: "#35222a", fg: "#d9a9b0", hover: "#b87f89", on: "#14110f" },
  },
  marine: {
    light: { base: "#1f3a5f", strong: "#152b47", soft: "#e2e8f0", fg: "#1f3a5f", hover: "#2a4c7a", on: "#fbfaf7" },
    dark:  { base: "#8faecc", strong: "#a9c4dc", soft: "#1e2a38", fg: "#a9c4dc", hover: "#7c9ec0", on: "#101216" },
  },
  noir: {
    light: { base: "#252420", strong: "#131210", soft: "#e8e5df", fg: "#2e2c27", hover: "#3a3833", on: "#fcfbf9" },
    dark:  { base: "#cfc9bc", strong: "#e3ded3", soft: "#2a2925", fg: "#e3ded3", hover: "#bdb6a7", on: "#121210" },
  },
};

const METAL = {
  olive:    { light: { base: "#a8834b", soft: "#f2e9da", fg: "#7a5d2e" }, dark: { base: "#c9a469", soft: "#33281a", fg: "#d9bb8b" } },
  bordeaux: { light: { base: "#a8834b", soft: "#f2e9da", fg: "#7a5d2e" }, dark: { base: "#c9a469", soft: "#33281a", fg: "#d9bb8b" } },
  marine:   { light: { base: "#b08d57", soft: "#f4ebdc", fg: "#7f6234" }, dark: { base: "#cfac76", soft: "#332a1d", fg: "#e0c296" } },
  noir:     { light: { base: "#b99a5b", soft: "#f5eddd", fg: "#856a34" }, dark: { base: "#d4b77e", soft: "#332e22", fg: "#e2cb9e" } },
};

/* ═══════════ 3. MÀU NGỮ NGHĨA — sắc tố tự nhiên ═══════════
 *
 * Không đổi theo bộ sưu tập: "lỗi" luôn là đất nung, "thành công" luôn là
 * xanh thông. Đổi màu ở đây là phá mất ý nghĩa. */

export const TONE_LIGHT = {
  success: { base: "#2e6b4f", soft: "#e2ece5", fg: "#245540", border: "#c4d7cb" },
  warning: { base: "#9a6b18", soft: "#f5ebd8", fg: "#7c5512", border: "#e4d2ae" },
  danger:  { base: "#9b3b36", soft: "#f4e4e1", fg: "#82302c", border: "#e3c4bf" },
  info:    { base: "#35566e", soft: "#e3eaef", fg: "#2b4658", border: "#c6d3dd" },
  neutral: { base: "#6e7368", soft: "#ece8df", fg: "#4e534a", border: "#ded8cb" },
};

export const TONE_DARK = {
  success: { base: "#7fb79a", soft: "#1c2e25", fg: "#9ccbb2", border: "#2e4a3b" },
  warning: { base: "#d3a85c", soft: "#33281a", fg: "#e0be83", border: "#4c3c22" },
  danger:  { base: "#d08b84", soft: "#33211f", fg: "#e0a9a2", border: "#4c3330" },
  info:    { base: "#8faec6", soft: "#1d2831", fg: "#adc4d6", border: "#2f3f4c" },
  neutral: { base: "#85877d", soft: "#2c2f27", fg: "#a8a99f", border: "#33362d" },
};

/* Alias v3 — `bg`/`ink`/`dot`/`from`/`to`. Trang chưa migrate import trực
 * tiếp hằng này (không qua hook) nên nó phải tĩnh; giá trị lấy theo chế độ
 * sáng, còn chế độ tối do lớp ánh xạ pastel trong index.css lo. */
export const TONE = Object.fromEntries(
  Object.entries(TONE_LIGHT).map(([k, v]) => [
    k,
    { bg: v.soft, ink: v.fg, dot: v.base, from: v.base, to: v.base, ...v },
  ])
);

/** Ngưỡng điểm SEO / chất lượng — luôn dùng màu ngữ nghĩa */
export const scoreTone = (v) =>
  v >= 85 ? TONE.success : v >= 70 ? TONE.warning : TONE.danger;

/* ═══════════ 4. Hook dùng trong trang ═══════════ */

/**
 * Chuẩn hóa một bộ màu trước khi giao cho trang.
 *
 * CHỈ trả về các khóa MÀU. `key` và `label` của bảng đất cố ý bị loại bỏ:
 * nhiều trang viết `{...ROLE[k], ...def}` hoặc `<KpiCard k={{...KPI[i], label}}>`,
 * nên để lọt `label: "Ô-liu"` vào là nhãn KPI thật bị ghi đè bằng tên màu.
 *
 * `from`/`to`/`ink` là khóa của v3, giữ lại để trang chưa migrate không vỡ —
 * `from` và `to` trùng nhau nên gradient 135° cũ render ra màu phẳng.
 */
const withLegacyKeys = ({ base, soft, fg }) => ({
  base, soft, fg,
  from: base, to: base, ink: fg,
});

export function usePalette() {
  const { collection, theme } = useTheme();

  return useMemo(() => {
    const dark = theme === "dark";
    const id = HOUSE[collection] ? collection : "olive";
    const mode = dark ? "dark" : "light";

    const house = HOUSE[id][mode];
    const metal = METAL[id][mode];
    const earth = (dark ? EARTH_DARK : EARTH_LIGHT).map(withLegacyKeys);
    const tone = dark ? TONE_DARK : TONE_LIGHT;

    /** n bộ màu phân loại, theo thứ tự bảng đất */
    const series = (n) =>
      Array.from({ length: n }, (_, i) => earth[i % earth.length]);

    /** Gán màu cho danh sách khoá cố định → { key: {base,soft,fg,…} } */
    const seriesMap = (keys) => {
      const arr = series(keys.length);
      return Object.fromEntries(keys.map((k, i) => [k, arr[i]]));
    };

    /** Màu cho chuỗi biểu đồ — chuỗi đầu là màu nhà, chuỗi nhấn là kim loại */
    const chart = (n) => {
      const out = [house.base, metal.base];
      for (let i = 0; out.length < n; i++) out.push(earth[i % earth.length].base);
      return out.slice(0, n);
    };

    return {
      collection: id,
      isDark: dark,
      house,
      metal,
      earth,
      tone,
      series,
      seriesMap,
      chart,
      /* ── Tương thích ngược v3 — Design.md §15 ── */
      brand: withLegacyKeys(house),
      accentHex: house.base,
      isMulti: false,
    };
  }, [collection, theme]);
}

/* ═══════════ 5. Tương thích ngược ═══════════
 * v3 export MULTI_BRAND / MULTI_SERIES / monoSeries. Giữ tên để import cũ
 * không lỗi, nhưng trả về bảng màu v4. */

export const MULTI_BRAND = { from: HOUSE.olive.light.base, to: HOUSE.olive.light.base };
export const MULTI_SERIES = EARTH_LIGHT.map(withLegacyKeys);
export const monoSeries = (_hex, n, dark = false) => {
  const src = (dark ? EARTH_DARK : EARTH_LIGHT).map(withLegacyKeys);
  return Array.from({ length: Math.max(n, 1) }, (_, i) => src[i % src.length]);
};

/** Danh sách bộ sưu tập — re-export cho tiện, xem ThemeContext */
export { COLLECTIONS };
