import { Icons } from "./Icons";
import { Card, Badge } from "./DashboardPrimitives";

const { TrendingUp, TrendingDown } = Icons;

const ACCENTS = {
  violet:  { bar: "border-l-violet-500",  text: "text-violet-700",  soft: "bg-violet-50",   icon: "bg-violet-100 text-violet-700",  barBg: "bg-violet-100" },
  amber:   { bar: "border-l-amber-500",   text: "text-amber-700",   soft: "bg-amber-50",    icon: "bg-amber-100 text-amber-700",    barBg: "bg-amber-100" },
  rose:    { bar: "border-l-rose-500",    text: "text-rose-700",    soft: "bg-rose-50",     icon: "bg-rose-100 text-rose-700",      barBg: "bg-rose-100" },
  emerald: { bar: "border-l-emerald-500", text: "text-emerald-700", soft: "bg-emerald-50",  icon: "bg-emerald-100 text-emerald-700",barBg: "bg-emerald-100" },
  blue:    { bar: "border-l-blue-500",    text: "text-blue-700",    soft: "bg-blue-50",     icon: "bg-blue-100 text-blue-700",      barBg: "bg-blue-100" },
  ink:     { bar: "border-l-ink-700",     text: "text-ink-700",     soft: "bg-ink-100",     icon: "bg-ink-200 text-ink-700",        barBg: "bg-ink-100" },
  cyan:    { bar: "border-l-cyan-500",    text: "text-cyan-700",    soft: "bg-cyan-50",     icon: "bg-cyan-100 text-cyan-700",      barBg: "bg-cyan-100" },
};

/** KPI lớn — đồng bộ khắp các section */
export function KPIBig({ label, value, sub, dotColor = "bg-blue-600", icon: Icon, accent = "blue", trend }) {
  const a = ACCENTS[accent] || ACCENTS.blue;
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold truncate">
              {label}
            </span>
          </div>
          <div className="text-[20px] sm:text-[24px] md:text-[32px] leading-[1.05] font-display font-bold text-ink-900 tabular-nums mt-2 sm:mt-2.5 break-all">
            {value}
          </div>
          {sub && <div className="text-[11px] sm:text-[12px] text-ink-500 mt-2 sm:mt-2.5 leading-relaxed">{sub}</div>}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-md ${a.icon} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && <DeltaIndicator {...trend} />}
    </Card>
  );
}

/** KPI accent (border-left) — dùng cho grid nhỏ */
export function KPIAccent({ label, value, sub, accent = "violet", icon: Icon }) {
  const a = ACCENTS[accent] || ACCENTS.violet;
  return (
    <div className={`bg-white border border-ink-200 border-l-4 ${a.bar} rounded-md px-3 sm:px-4 py-2.5 sm:py-3 relative overflow-hidden min-w-0`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] uppercase tracking-wider font-semibold ${a.text} truncate`}>
          {label}
        </span>
        {Icon && <Icon className={`w-4 h-4 ${a.text} opacity-80 shrink-0`} strokeWidth={2.2} />}
      </div>
      <div className="text-[16px] sm:text-[18px] md:text-[22px] font-display font-bold text-ink-900 mt-1 sm:mt-1.5 tabular-nums leading-none break-all">
        {value}
      </div>
      {sub && <div className="text-[10.5px] sm:text-[11px] text-ink-500 mt-1 sm:mt-1.5 truncate">{sub}</div>}
    </div>
  );
}

/** Strip metric — 5 cột ngang hàng */
export function StripMetric({ value, label, dotColor, last, icon: Icon }) {
  return (
    <div className={`flex-1 px-2 sm:px-4 text-center min-w-0 ${last ? "" : "border-r border-ink-100"}`}>
      {Icon && <Icon className="w-4 h-4 text-ink-400 mx-auto mb-1.5" />}
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
        <span className="text-[14px] sm:text-[16px] md:text-[22px] font-display font-bold text-ink-900 tabular-nums leading-none break-all">
          {value}
        </span>
      </div>
      <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold truncate">
        {label}
      </div>
    </div>
  );
}

/** Status cell — icon + count + label */
export function StatusCell({ count, label, dotColor, pct, icon: Icon }) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-white border border-ink-200 rounded-md hover:border-blue-300 transition min-w-0">
      {Icon ? (
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md ${dotColor.replace("bg-", "bg-").replace("-500", "-50")} ${dotColor.replace("bg-", "text-").replace("-500", "-700")} flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      ) : (
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[16px] sm:text-[19px] font-display font-bold text-ink-900 leading-none tabular-nums">
            {count}
          </span>
          {typeof pct === "number" && (
            <span className="text-[10px] text-ink-500 tabular-nums">{pct}%</span>
          )}
        </div>
        <div className="text-[10.5px] sm:text-[11px] text-ink-500 mt-1 truncate">{label}</div>
      </div>
    </div>
  );
}

/** Delta indicator +X% / -X% */
function DeltaIndicator({ value, suffix = "%", label }) {
  const up = value >= 0;
  const tone = up ? "emerald" : "rose";
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-ink-100 flex items-center justify-between gap-2 flex-wrap">
      <span className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold truncate">
        {label || "so với kỳ trước"}
      </span>
      <Badge tone={tone}>
        <Icon className="w-3 h-3" />
        {up ? "+" : ""}{value}{suffix}
      </Badge>
    </div>
  );
}

/** Mini progress bar inline */
export function MiniBar({ value, max = 100, color = "bg-blue-600", height = "h-1.5" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`${height} bg-ink-100 rounded-full overflow-hidden`}>
      <div className={`${height} ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Occupancy gauge đồng bộ đẹp */
export function OccupancyGauge({ value, total, occupied, label = "Công suất" }) {
  const pct = Math.round((occupied / total) * 100);
  const radius = 70;
  const stroke = 12;
  const c = 2 * Math.PI * radius;
  const dash = (pct / 100) * c;
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#f43f5e";
  return (
      <div className="flex items-center gap-5">
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 shrink-0">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r={radius} stroke="#eef1f6" strokeWidth={stroke} fill="none" />
          <circle
            cx="80" cy="80" r={radius}
            stroke={color} strokeWidth={stroke} fill="none"
            strokeDasharray={`${dash} ${c}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-ink-500 font-semibold">{label}</div>
          <div className="text-[28px] sm:text-[36px] font-display font-bold text-ink-900 tabular-nums leading-none mt-1">{pct}%</div>
          <div className="text-[10px] sm:text-[11px] text-ink-500 mt-1 tabular-nums">{occupied}/{total} phòng</div>
        </div>
      </div>
      <div className="flex-1 space-y-2.5 min-w-0">
        {[
          { label: "Có khách", value: occupied, color: "bg-violet-500" },
          { label: "Trống", value: total - occupied, color: "bg-emerald-500" },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${r.color} shrink-0`} />
            <span className="text-[12px] text-ink-700 truncate flex-1">{r.label}</span>
            <span className="text-[12px] font-bold tabular-nums">{r.value}</span>
            <span className="text-[10px] text-ink-500 tabular-nums w-10 text-right">
              {Math.round((r.value / total) * 100)}%
            </span>
          </div>
        ))}
        <div className="pt-2 border-t border-ink-100">
          <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold mb-1">Mục tiêu</div>
          <div className="flex items-center gap-2">
            <MiniBar value={pct} max={85} color="bg-blue-600" height="h-1.5" />
            <span className="text-[11px] font-bold text-ink-900 tabular-nums">85%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
