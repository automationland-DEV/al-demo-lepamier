/**
 * Component dùng chung cho hai trang analytics website.
 *
 * Design.md §15 mục 4 yêu cầu: tới trang thứ ba dùng cùng công thức thì phải
 * TÁCH ra thay vì copy lần nữa. `KpiCard` / `Panel` / `TopTable` đã copy ở
 * Staff.jsx và Marketing.jsx rồi, nên hai trang website dùng chung file này.
 */

import { NavLink, Link } from "react-router-dom";
import { Icons } from "./Icons";
import { usePalette, TONE } from "../theme/palette";
import { RANGES, resolveRange, ddmm, ddmmyyyy, num, pct1 } from "../utils/website";

const {
  TrendingUp, TrendingDown, Calendar, ChevronDown, ChevronRight, Check, SearchX,
} = Icons;

/* ═══ Hàng tab giữa hai trang website ═══ */

const WEBSITE_TABS = [
  { to: "/website",       label: "Tổng quan Website", icon: Icons.Globe },
  { to: "/website/users", label: "Quản lý người dùng", icon: Icons.Users },
];

export function WebsiteTabs() {
  const { brand } = usePalette();
  return (
    <div className="noscroll flex items-center gap-1 h-12 p-1 rounded-full w-fit max-w-full overflow-x-auto mb-5"
         style={{ backgroundColor: "var(--surface-2)" }}>
      {WEBSITE_TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === "/website"}
          className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-bold transition-all duration-200"
          style={({ isActive }) =>
            isActive
              ? { background: `linear-gradient(135deg,${brand.from},${brand.to})`, color: "#fff",
                  boxShadow: `0 6px 14px -6px ${brand.from}b3` }
              : { color: "var(--fg-muted)" }
          }
        >
          <t.icon className="w-4 h-4" /> {t.label}
        </NavLink>
      ))}
    </div>
  );
}

/* ═══ Bộ chọn khoảng thời gian ═══ */

export function RangePicker({ value, onChange, open, onToggle, innerRef }) {
  const { brand } = usePalette();
  const range = resolveRange(value);

  return (
    <div className="relative" ref={innerRef}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="inline-flex items-center gap-2 h-11 px-4 rounded-full text-[13px] font-bold border transition active:scale-95"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}
      >
        <Calendar className="w-4 h-4" style={{ color: "var(--fg-subtle)" }} />
        <span className="tabular-nums">{ddmmyyyy(range.from)} – {ddmmyyyy(range.to)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
                     style={{ color: "var(--fg-subtle)" }} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border shadow-pop z-30 overflow-hidden p-1"
             style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          {RANGES.map((r) => {
            const on = r.key === value;
            const rr = resolveRange(r.key);
            return (
              <button
                key={r.key}
                onClick={() => onChange(r.key)}
                className="w-full flex items-center gap-2 px-3 h-10 rounded-full text-left text-[12.5px] font-semibold transition hover:bg-ink-50"
                style={on ? { color: brand.from } : { color: "var(--fg-muted)" }}
              >
                {on ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                <span className="flex-1">{r.label}</span>
                <span className="text-[10.5px] tabular-nums" style={{ color: "var(--fg-subtle)" }}>
                  {ddmm(rr.from)}–{ddmm(rr.to)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══ Thẻ KPI (§5.2) ═══ */

export function KpiCard({ icon: Icon, label, value, foot, from, to, trend, live, compareLabel, raw }) {
  const up = (trend ?? 0) >= 0;
  const T = up ? TrendingUp : TrendingDown;
  const tone = up ? TONE.success : TONE.danger;

  return (
    <div
      className="lift relative rounded-[var(--r)] border p-5 overflow-hidden"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", "--glow": `${from}55` }}
    >
      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl opacity-20"
           style={{ background: `linear-gradient(135deg,${from},${to})` }} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider truncate" style={{ color: "var(--fg-muted)" }}>
              {label}
            </div>
            {live && (
              <span className="relative flex w-1.5 h-1.5 shrink-0">
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </span>
            )}
          </div>
          <div className="font-display font-extrabold leading-none tracking-tight tabular-nums mt-2.5 text-[30px] sm:text-[34px]"
               style={{ color: "var(--fg)" }}>
            {raw ? value : num(value)}
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
             style={{ background: `linear-gradient(135deg,${from},${to})`, boxShadow: `0 8px 18px -8px ${from}` }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="relative flex items-center gap-2 mt-3 text-[12px]" style={{ color: "var(--fg-muted)" }}>
        {trend != null && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold shrink-0"
                style={{ backgroundColor: tone.bg, color: tone.ink }}>
            <T className="w-3 h-3" />{up ? "+" : "−"}{pct1(Math.abs(trend))}%
          </span>
        )}
        {/* Không có kỳ trước để so thì hiện "—", không hiện 0% (§11: 0 khác "chưa có dữ liệu") */}
        <span className="truncate">{trend != null ? (foot ?? compareLabel) : (foot ?? "—")}</span>
      </div>
    </div>
  );
}

/* ═══ Panel (§5.11) ═══ */

export function Panel({ children, title, sub, right, pad, className = "" }) {
  return (
    <div className={`rounded-[var(--r)] border overflow-hidden h-full flex flex-col ${className}`}
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      {title && (
        <div className="px-5 py-4 border-b flex items-start justify-between gap-3"
             style={{ borderColor: "var(--border-soft)" }}>
          <div className="min-w-0">
            <div className="font-bold text-[14px]" style={{ color: "var(--fg)" }}>{title}</div>
            {sub && <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--fg-muted)" }}>{sub}</div>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}
      <div className={`flex-1 min-w-0 ${pad ? "p-5" : ""}`}>{children}</div>
    </div>
  );
}

/* ═══ Avatar nhỏ có viền gradient (§5.8) ═══ */

export function MiniAvatar({ name, from, to, size = 24 }) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const ini = ((parts[0]?.[0] || "") + (parts.at(-1)?.[0] || "")).toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-extrabold text-white shrink-0"
      style={{
        width: size, height: size,
        fontSize: Math.round(size * 0.4),
        background: `linear-gradient(135deg,${from},${to})`,
      }}
      aria-hidden="true"
    >
      {ini}
    </span>
  );
}

/* ═══ Bảng TOP ═══ */

export function TopTable({ icon: Icon, c, rank, title, sub, nameHead, valueHead, rows, to, wide, avatar }) {
  const has = rows.some((r) => r.value > 0);

  return (
    <div className="rounded-[var(--r)] border overflow-hidden flex flex-col h-full"
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="px-4 py-4 flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ background: `linear-gradient(135deg,${c.from},${c.to})`, boxShadow: `0 6px 14px -7px ${c.from}` }}>
          <Icon className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <div className="font-bold text-[13.5px] leading-tight" style={{ color: "var(--fg)" }}>{title}</div>
          {sub && <div className="text-[11px] truncate mt-0.5" style={{ color: "var(--fg-subtle)" }}>{sub}</div>}
        </div>
      </div>

      {has ? (
        <div className="flex-1 overflow-x-auto">
          <table className={`w-full ${wide ? "min-w-[420px]" : "min-w-[260px]"}`}>
            <thead>
              <tr style={{ backgroundColor: "var(--surface-2)" }}>
                <th className="text-left px-4 py-2 text-[10.5px] font-extrabold uppercase tracking-wider w-10"
                    style={{ color: "var(--fg-subtle)" }}>#</th>
                <th className="text-left px-1 py-2 text-[10.5px] font-extrabold uppercase tracking-wider"
                    style={{ color: "var(--fg-subtle)" }}>{nameHead}</th>
                <th className="text-right px-4 py-2 text-[10.5px] font-extrabold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--fg-subtle)" }}>{valueHead}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="border-t hover:bg-ink-50 transition"
                    style={{ borderColor: "var(--border-soft)" }}>
                  <td className="px-4 py-2.5">
                    {i < 3 ? (
                      <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[10.5px] font-extrabold text-white tabular-nums"
                            style={{ background: `linear-gradient(135deg,${rank[i].from},${rank[i].to})` }}>
                        {i + 1}
                      </span>
                    ) : (
                      <span className="text-[12px] font-bold tabular-nums pl-1.5" style={{ color: "var(--fg-subtle)" }}>
                        {i + 1}
                      </span>
                    )}
                  </td>
                  <td className="px-1 py-2.5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      {avatar && <MiniAvatar name={r.name} from={c.from} to={c.to} />}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[12.5px] font-bold truncate" style={{ color: "var(--fg)" }}>{r.name}</span>
                          {r.marked && (
                            <span className="shrink-0 text-[9.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: c.soft, color: c.ink }}>
                              Đang xem
                            </span>
                          )}
                        </div>
                        {r.sub && <div className="text-[11px] truncate" style={{ color: "var(--fg-subtle)" }}>{r.sub}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-[12.5px] font-extrabold tabular-nums whitespace-nowrap"
                      style={{ color: "var(--fg)" }}>
                    {num(r.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
          <SearchX className="w-7 h-7 mb-2" style={{ color: "var(--fg-subtle)" }} />
          <div className="text-[12.5px] font-bold" style={{ color: "var(--fg)" }}>Chưa có dữ liệu</div>
          <div className="text-[11px] mt-0.5" style={{ color: "var(--fg-muted)" }}>
            Thử chọn khoảng thời gian dài hơn
          </div>
        </div>
      )}

      <Link
        to={to}
        className="flex items-center justify-center gap-1 px-4 py-3 border-t text-[12px] font-bold transition hover:bg-ink-50"
        style={{ borderColor: "var(--border-soft)", color: c.ink }}
      >
        Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

/* ═══ Trạng thái rỗng (§5.13) ═══ */

export function EmptyState({ title, desc, actionLabel, onReset }) {
  const { brand } = usePalette();
  return (
    <div className="rounded-[var(--r)] border flex flex-col items-center text-center px-6 py-14"
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="floaty w-16 h-16 rounded-[20px] flex items-center justify-center text-white mb-4"
           style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})`,
                    boxShadow: `0 12px 26px -12px ${brand.from}` }}>
        <SearchX className="w-7 h-7" />
      </div>
      <div className="text-[16px] font-bold" style={{ color: "var(--fg)" }}>{title}</div>
      <div className="text-[13px] mt-1 max-w-[420px]" style={{ color: "var(--fg-muted)" }}>{desc}</div>
      <button
        onClick={onReset}
        className="glowbtn mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-bold text-white"
        style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})`,
                 boxShadow: `0 8px 20px -8px ${brand.from}99` }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

/* ═══ Toast ═══ */

export function Toast({ children }) {
  const { brand } = usePalette();
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 h-11 inline-flex items-center gap-2 rounded-full text-[13px] font-bold text-white shadow-pop animate-fadeIn"
         style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
      <Check className="w-4 h-4" /> {children}
    </div>
  );
}
