import { useEffect, useState } from "react";
import { Icons } from "./Icons";

/* Recharts nhận màu qua prop nên không đọc được CSS var — hook này đọc giá trị
   đã tính và tự cập nhật khi data-theme / data-accent trên <html> đổi. */
const PALETTE_KEYS = [
  "accent", "accent-strong", "highlight", "success", "warning", "danger", "info",
  "border", "border-soft", "fg", "fg-muted", "surface", "surface-2",
];

function readPalette() {
  if (typeof window === "undefined") return {};
  const cs = getComputedStyle(document.documentElement);
  return Object.fromEntries(PALETTE_KEYS.map((k) => [k, cs.getPropertyValue(`--${k}`).trim()]));
}

export function useChartPalette() {
  const [palette, setPalette] = useState(readPalette);
  useEffect(() => {
    const update = () => setPalette(readPalette());
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-accent"],
    });
    return () => mo.disconnect();
  }, []);
  return palette;
}

const {
  Settings, ChevronRight, Filter, Download, RefreshCw, Maximize2, Bell, X, Check,
} = Icons;

/**
 * Modal — hộp thoại dùng chung cho các thao tác trên Dashboard.
 * Đóng bằng Esc, bấm nền, hoặc nút X. Khoá cuộn nền khi mở.
 */
export function Modal({ open, onClose, title, subtitle, icon: Icon, children, footer, width = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink-900/60 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`animate-slideUp w-full ${width} rounded-t-2xl sm:rounded-xl border shadow-pop flex flex-col max-h-[88vh] sm:max-h-[85vh]`}
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-start gap-3 px-4 sm:px-5 py-3.5 border-b shrink-0" style={{ borderColor: "var(--border-soft)" }}>
          {Icon && (
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)" }}
            >
              <Icon className="w-[18px] h-[18px]" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold text-ink-900 truncate">{title}</div>
            {subtitle && <div className="text-[11.5px] text-ink-500 mt-0.5 truncate">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-2 -mr-1 -mt-1 rounded-md hover:bg-ink-100 text-ink-500 transition shrink-0 min-h-[40px] min-w-[40px] inline-flex items-center justify-center"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="px-4 sm:px-5 py-4 overflow-y-auto flex-1 min-h-0">{children}</div>

        {footer && (
          <div
            className="px-4 sm:px-5 py-3 border-t flex items-center justify-end gap-2 shrink-0 flex-wrap"
            style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-2)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Dòng dữ liệu trong modal — dùng lại cho mọi danh sách */
export function ModalRow({ lead, title, sub, right, rightSub, onAction, actionLabel, tone = "accent" }) {
  const toneVar = tone === "accent" ? "var(--accent)" : `var(--${tone})`;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-ink-100 last:border-0">
      {lead && (
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center text-[12px] font-bold shrink-0"
          style={{ backgroundColor: "var(--surface-3)", color: toneVar }}
        >
          {lead}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-semibold text-ink-900 truncate">{title}</div>
        {sub && <div className="text-[11px] text-ink-500 truncate mt-0.5">{sub}</div>}
      </div>
      <div className="text-right shrink-0">
        {right && <div className="text-[12.5px] font-bold tabular-nums text-ink-900">{right}</div>}
        {rightSub && <div className="text-[10.5px] text-ink-500 mt-0.5">{rightSub}</div>}
      </div>
      {actionLabel && (
        onAction ? (
          <button
            onClick={onAction}
            className="shrink-0 px-2.5 py-1.5 rounded-md text-[11.5px] font-bold transition active:scale-95"
            style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
          >
            {actionLabel}
          </button>
        ) : (
          /* Đã xử lý — giữ chỗ để hàng không nhảy layout và có xác nhận rõ ràng */
          <span
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11.5px] font-bold"
            style={{
              backgroundColor: "var(--success-soft)",
              color: "var(--success-fg)",
              border: "1px solid var(--success-border)",
            }}
          >
            <Check className="w-3 h-3" /> {actionLabel}
          </span>
        )
      )}
    </div>
  );
}

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
    <div
      className="relative overflow-hidden rounded-md text-white shadow-sm"
      style={{
        /* Pha accent với nền gần đen: giữ nền đủ tối cho chữ trắng ở CẢ hai theme,
           đồng thời đổi tông theo accent người dùng chọn. */
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--accent) 55%, #070d1a) 0%, color-mix(in oklab, var(--accent) 30%, #070d1a) 55%, color-mix(in oklab, var(--accent-strong) 24%, #070d1a) 100%)",
      }}
    >
      <div className="absolute inset-0 opacity-[0.07] bg-soft-grid" />
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--accent)", opacity: 0.22 }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--highlight)", opacity: 0.16 }}
      />

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
export function SectionHeader({ icon: Icon, label, sub, right, count, id }) {
  return (
    <div
      id={id}
      /* scroll-mt: chừa chỗ cho topbar 60px + thanh mục lục dính khi nhảy neo */
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mt-6 sm:mt-9 mb-3 scroll-mt-[132px]"
    >
      <div className="flex items-stretch gap-2.5 sm:gap-3 min-w-0 flex-1">
        <div className="w-1 rounded-sm shrink-0" style={{ backgroundColor: "var(--accent)" }} />
        <div className="min-w-0 flex-1">
          {/* Dùng --accent thay cho blue-800 cứng: blue-800 trên nền dark chỉ đạt
              tương phản 2.2:1, và không đổi theo accent người dùng chọn. */}
          <div
            className="flex items-center gap-2 font-display font-bold text-[12px] sm:text-[14px] tracking-wide uppercase flex-wrap"
            style={{ color: "var(--accent)" }}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span className="truncate">{label}</span>
            {typeof count === "number" && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded tabular-nums"
                style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)" }}
              >
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

/** Ánh xạ tên tone "màu" cũ của Dashboard sang tone semantic của design system.
 *  Giữ tên cũ để không phải sửa hàng chục chỗ gọi. */
export const TONE_ALIAS = {
  blue: "accent",
  emerald: "success",
  amber: "warning",
  rose: "danger",
  violet: "highlight",
  cyan: "info",
  ink: "neutral",
};

/** Badge tone đồng bộ — bám CSS var nên đổi theo theme + accent */
export function Badge({ tone = "blue", children, className = "" }) {
  const t = TONE_ALIAS[tone] || tone;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${className}`}
      style={{
        backgroundColor: `var(--${t}-soft)`,
        color: `var(--${t}-fg)`,
        borderColor: t === "accent" ? "var(--accent)" : `var(--${t}-border)`,
      }}
    >
      {children}
    </span>
  );
}

/** Card đồng bộ */
export function Card({ children, className = "", title, subtitle, right, icon: Icon, accent = "blue" }) {
  const t = TONE_ALIAS[accent] || accent;
  const iconColor = t === "accent" ? "var(--accent)" : `var(--${t})`;
  return (
    <div className={`bg-white border border-ink-200 rounded-md min-w-0 ${className}`}>
      {(title || right) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-5 py-3 sm:py-3.5 border-b border-ink-100">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: iconColor }} />}
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
export function HeroActions({ onRefresh, onExport, onExpand, refreshing = false }) {
  const cls =
    "w-9 h-9 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm flex items-center justify-center transition active:scale-95 disabled:opacity-60";
  return (
    <>
      {onRefresh && (
        <button onClick={onRefresh} disabled={refreshing} title="Làm mới số liệu" aria-label="Làm mới số liệu" className={cls}>
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      )}
      {onExport && (
        <button onClick={onExport} title="Xuất báo cáo" aria-label="Xuất báo cáo" className={cls}>
          <Download className="w-4 h-4" />
        </button>
      )}
      {onExpand && (
        <button onClick={onExpand} title="Mở trang báo cáo" aria-label="Mở trang báo cáo" className={cls}>
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
