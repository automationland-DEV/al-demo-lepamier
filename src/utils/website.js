/**
 * Tiện ích dùng chung cho hai trang analytics website:
 *   /website        — Tổng quan Website
 *   /website/users  — Quản lý người dùng
 *
 * Gom ở đây để hai trang luôn cùng một khoảng thời gian, cùng cách tính tăng
 * trưởng và cùng cách định dạng số — nếu mỗi trang tự tính, hai tab sẽ ra hai
 * con số khác nhau cho cùng một chỉ số.
 */

import { websiteDaily, websiteToday } from "../data/mockData";

/* ───────────── Khoảng thời gian ───────────── */

export const RANGES = [
  { key: "7d",  label: "7 ngày qua",   days: 7 },
  { key: "30d", label: "30 ngày qua",  days: 30 },
  { key: "90d", label: "90 ngày qua",  days: 90 },
  { key: "jul", label: "Tháng 7/2026", days: 31 },
];

export const parseISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const isoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const ddmm = (s) => {
  const d = parseISO(s);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const ddmmyyyy = (s) => `${ddmm(s)}/${parseISO(s).getFullYear()}`;

/** Khoảng ngày của một preset → { from, to } dạng chuỗi ISO */
export function resolveRange(key) {
  if (key === "jul") return { from: "2026-07-01", to: "2026-07-31" };
  const days = RANGES.find((r) => r.key === key)?.days || 30;
  const to = parseISO(websiteToday);
  const from = new Date(to);
  from.setDate(from.getDate() - days + 1);
  return { from: isoDate(from), to: isoDate(to) };
}

/** Khoảng liền kề ngay trước đó, cùng độ dài — dùng để tính tăng trưởng */
export function previousRange({ from, to }) {
  const len = daysBetween(from, to);
  const prevTo = parseISO(from);
  prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - len + 1);
  return { from: isoDate(prevFrom), to: isoDate(prevTo) };
}

export const daysBetween = (from, to) =>
  Math.round((parseISO(to) - parseISO(from)) / 86_400_000) + 1;

/** Vị trí của một ngày tính từ ngày đầu tiên có dữ liệu — dùng cho hàm mùa vụ */
export const dayIndex = (date) => daysBetween(websiteDaily[0].date, date) - 1;

/* ───────────── Cộng dồn chỉ số ───────────── */

export const METRIC_KEYS = [
  "visits", "users", "mobile", "desktop", "tablet",
  "downloads", "shares", "bookings", "chats", "calls", "leads",
];

export const emptyTotals = () => Object.fromEntries(METRIC_KEYS.map((k) => [k, 0]));

/** Cộng dồn các ngày trong khoảng, chỉ tính những chi nhánh được truyền vào */
export function sumRange({ from, to }, branchIds) {
  const out = emptyTotals();
  for (const row of websiteDaily) {
    if (row.date < from || row.date > to) continue;
    for (const id of branchIds) {
      const m = row.byBranch[id];
      if (!m) continue;
      for (const k of METRIC_KEYS) out[k] += m[k];
    }
  }
  return out;
}

/** Tăng trưởng % giữa hai kỳ — null khi kỳ trước không có gì để so */
export const growth = (now, before) => (before > 0 ? ((now - before) / before) * 100 : null);

/* ───────────── Định dạng ───────────── */

export const num = (n) => Math.round(n || 0).toLocaleString("vi-VN");

/** Phần trăm 1 chữ số thập phân, dấu phẩy kiểu Việt (§11) */
export const pct1 = (v) => (Math.round(v * 10) / 10).toFixed(1).replace(".", ",");

/** Phần trăm làm tròn — dùng cho tỉ lệ, không phải tăng trưởng (§11) */
export const pct0 = (v) => `${Math.round(v || 0)}%`;

/* ───────────── Biểu đồ ───────────── */

export const chartTip = {
  background: "#0f1218", border: "none", borderRadius: 12,
  fontSize: 12, color: "#fff", padding: "10px 14px",
  boxShadow: "0 12px 30px -8px rgba(0,0,0,.45)",
};
