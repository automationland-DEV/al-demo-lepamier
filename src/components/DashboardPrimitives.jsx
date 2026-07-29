import { Icons } from "./Icons";

const {
  Settings, ChevronRight, Filter, Download, RefreshCw, Maximize2, Bell,
} = Icons;

/**
 * PageHero — gradient banner với title + breadcrumb + meta chips + actions.
 * Dùng nhất quán ở đầu Dashboard.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  meta = [],          // [{label, value}]
  actions,            // node
  live = false,
}) {
  return (
    <div className="relative overflow-hidden rounded-md bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white shadow-sm">
      <div className="absolute inset-0 opacity-[0.07] bg-soft-grid" />
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="relative px-4 py-5 sm:px-6 flex items-start justify-between gap-3 sm:gap-6 flex-wrap sm:flex-nowrap">
        <div className="min-w-0 flex-1 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/70 font-semibold flex-wrap">
            {eyebrow}
            {live && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                <span className="relative flex w-2 h-2 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-emerald-300 opacity-70 animate-ping" style={{ animationDuration: "1.8s" }} />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_4px_1px_rgba(110,231,183,0.7)]" />
                </span>
                LIVE
              </span>
            )}
          </div>
          <h1 className="font-display font-bold text-[20px] sm:text-[28px] leading-tight mt-1 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] text-white/80 mt-1 max-w-2xl">{subtitle}</p>
          )}
          {meta.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {meta.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded px-2 py-1"
                >
                  <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">{m.label}</span>
                  <span className="text-[12px] font-semibold tabular-nums">{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Header primitives đồng bộ ─────────────── */

/** SectionHeader: chuẩn hóa 100% cho mọi section */
export function SectionHeader({ icon: Icon, label, sub, right, count }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mt-6 sm:mt-9 mb-3">
      <div className="flex items-stretch gap-2.5 sm:gap-3 min-w-0 flex-1">
        <div className="w-1 rounded-sm bg-blue-700 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-display font-bold text-[12px] sm:text-[14px] tracking-wide uppercase text-blue-800 flex-wrap">
            {Icon && <Icon className="w-4 h-4 text-blue-700 shrink-0" />}
            <span className="truncate">{label}</span>
            {typeof count === "number" && (
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded tabular-nums">
                {count}
              </span>
            )}
          </div>
          {sub && <div className="text-[11px] sm:text-[12px] text-ink-500 mt-0.5 truncate">{sub}</div>}
        </div>
      </div>
      {right && <div className="shrink-0 flex items-center gap-1.5 flex-wrap">{right}</div>}
    </div>
  );
}

/** Badge tone đồng bộ */
export function Badge({ tone = "blue", children, className = "" }) {
  const map = {
    blue:    "bg-blue-50 text-blue-700 border-blue-100",
    amber:   "bg-amber-50 text-amber-700 border-amber-100",
    rose:    "bg-rose-50 text-rose-700 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    violet:  "bg-violet-50 text-violet-700 border-violet-100",
    ink:     "bg-ink-100 text-ink-700 border-ink-200",
    cyan:    "bg-cyan-50 text-cyan-700 border-cyan-100",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${map[tone] || map.blue} ${className}`}>
      {children}
    </span>
  );
}

/** Card đồng bộ */
export function Card({ children, className = "", title, subtitle, right, icon: Icon, accent = "blue" }) {
  const accentMap = {
    blue: "text-blue-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
    violet: "text-violet-700",
    ink: "text-ink-700",
    cyan: "text-cyan-700",
  };
  return (
    <div className={`bg-white border border-ink-200 rounded-md min-w-0 ${className}`}>
      {(title || right) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-5 py-3 sm:py-3.5 border-b border-ink-100">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className={`w-4 h-4 shrink-0 ${accentMap[accent] || accentMap.blue}`} />}
            <div className="min-w-0">
              {title && <div className="font-semibold text-[13px] sm:text-sm text-ink-900 truncate">{title}</div>}
              {subtitle && <div className="text-[11px] text-ink-500 mt-0.5 truncate">{subtitle}</div>}
            </div>
          </div>
          {right && <div className="shrink-0 flex items-center gap-1.5 flex-wrap">{right}</div>}
        </div>
      )}
      <div className="p-3 sm:p-5">{children}</div>
    </div>
  );
}

/** Pill button filter dùng cho header section */
export function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11.5px] font-semibold border transition ${
        active
          ? "bg-blue-700 text-white border-blue-700 shadow-sm"
          : "bg-white text-ink-700 border-ink-200 hover:border-blue-300 hover:text-blue-700"
      }`}
    >
      {children}
    </button>
  );
}

/** 3 action button dùng chung cho hero */
export function HeroActions({ onRefresh, onExport, onExpand }) {
  return (
    <>
      {onRefresh && (
        <button onClick={onRefresh} title="Làm mới" className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
      {onExport && (
        <button onClick={onExport} title="Xuất báo cáo" className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition">
          <Download className="w-4 h-4" />
        </button>
      )}
      {onExpand && (
        <button onClick={onExpand} title="Mở rộng" className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition">
          <Maximize2 className="w-4 h-4" />
        </button>
      )}
    </>
  );
}

/** Crumb dùng trong hero nếu cần */
export function Crumb({ items }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-white/60">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3 opacity-60" />}
          <span className={i === items.length - 1 ? "text-white" : ""}>{it}</span>
        </span>
      ))}
    </div>
  );
}

/** Notification dot cho hero */
export function NotifDot({ count = 3 }) {
  return (
    <button className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition">
      <Bell className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}

/** Re-export Filter cho gọn nếu component khác cần */
export { Filter };
