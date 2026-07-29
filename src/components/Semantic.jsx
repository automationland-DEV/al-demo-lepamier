import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
 * Semantic UI components — đổi màu theo theme/accent
 * Tất cả các tone (success/warning/danger/info/highlight/neutral)
 * được controlled bởi CSS variable ở index.css → chỉ cần đổi
 * theme trong Settings, mọi nơi sẽ tự đổi theo.
 * ═══════════════════════════════════════════════════════════ */

export const TONE = {
  success:   { bg: "var(--success-soft)",   fg: "var(--success-fg)",   border: "var(--success-border)",   solid: "var(--success)"   },
  warning:   { bg: "var(--warning-soft)",   fg: "var(--warning-fg)",   border: "var(--warning-border)",   solid: "var(--warning)"   },
  danger:    { bg: "var(--danger-soft)",    fg: "var(--danger-fg)",    border: "var(--danger-border)",    solid: "var(--danger)"    },
  info:      { bg: "var(--info-soft)",      fg: "var(--info-fg)",      border: "var(--info-border)",      solid: "var(--info)"      },
  highlight: { bg: "var(--highlight-soft)", fg: "var(--highlight-fg)", border: "var(--highlight-border)", solid: "var(--highlight)" },
  accent:    { bg: "var(--accent-soft)",    fg: "var(--accent-fg)",    border: "var(--accent)",            solid: "var(--accent)"    },
  neutral:   { bg: "var(--surface-3)",      fg: "var(--fg-muted)",     border: "var(--border)",            solid: "var(--fg-subtle)" },
};

export function StatusPill({ tone = "neutral", children, icon: Icon, className = "", solid = false }) {
  const t = TONE[tone] || TONE.neutral;
  const style = solid
    ? { backgroundColor: t.solid, color: "var(--on-accent)", borderColor: t.solid }
    : { backgroundColor: t.bg, color: t.fg, borderColor: t.border };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border whitespace-nowrap ${className}`}
      style={style}
    >
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {children}
    </span>
  );
}

export function Trend({ value, suffix = "%", label, className = "", size = "sm" }) {
  const up = value >= 0;
  const tone = up ? "success" : "danger";
  const t = TONE[tone];
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const sizeCls = size === "lg" ? "text-[12px] px-2 py-0.5" : "text-[10px] px-1.5 py-0.5";
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-bold rounded border tabular-nums ${sizeCls} ${className}`}
      style={{ backgroundColor: t.bg, color: t.fg, borderColor: t.border }}
    >
      <Icon className={size === "lg" ? "w-3 h-3" : "w-2.5 h-2.5"} />
      {up ? "+" : ""}{value}{suffix}
      {label && <span className="ml-1 font-semibold opacity-80 normal-case">{label}</span>}
    </span>
  );
}

export function AccentPill({ children, icon: Icon, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border whitespace-nowrap ${className}`}
      style={{
        backgroundColor: "var(--accent-soft)",
        color: "var(--accent-fg)",
        borderColor: "var(--accent)",
      }}
    >
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {children}
    </span>
  );
}

export function ToneBox({ tone = "neutral", children, className = "", icon: Icon }) {
  const t = TONE[tone] || TONE.neutral;
  return (
    <div
      className={`rounded-md border p-3 ${className}`}
      style={{ backgroundColor: t.bg, borderColor: t.border, color: t.fg }}
    >
      {Icon && (
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-3.5 h-3.5" />
          <div className="font-semibold text-[12px]">{typeof children === "string" ? children : null}</div>
        </div>
      )}
      {typeof children !== "string" ? children : Icon ? null : children}
    </div>
  );
}

export function ToneDot({ tone = "neutral", className = "w-2 h-2" }) {
  const t = TONE[tone] || TONE.neutral;
  return <span className={`inline-block rounded-full shrink-0 ${className}`} style={{ backgroundColor: t.solid }} />;
}

export function ToneAlert({ tone = "info", icon: Icon, title, desc, metric, className = "" }) {
  const t = TONE[tone] || TONE.info;
  return (
    <div
      className={`border-l-4 rounded-r-md p-2.5 ${className}`}
      style={{
        borderLeftColor: t.solid,
        backgroundColor: t.bg,
        color: t.fg,
      }}
    >
      <div className="flex items-start gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: t.solid }} />}
        <div className="min-w-0 flex-1">
          {title && <div className="font-semibold text-[12px]" style={{ color: "var(--fg)" }}>{title}</div>}
          {desc && <div className="text-[11px] leading-relaxed mt-0.5" style={{ color: "var(--fg-muted)" }}>{desc}</div>}
          {metric && (
            <div
              className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: t.border,
                color: t.fg,
                borderWidth: 1,
              }}
            >
              {metric}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InlineLabel({ tone = "neutral", children, icon: Icon }) {
  const t = TONE[tone] || TONE.neutral;
  return (
    <span
      className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {children}
    </span>
  );
}
