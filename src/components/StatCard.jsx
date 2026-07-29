import { Icons } from "./Icons";
const { TrendingUp, TrendingDown } = Icons;

const accents = {
  brand:   { bg: "bg-blue-700",     text: "text-white",         chip: "bg-blue-50 text-blue-700 border-blue-100" },
  blue:    { bg: "bg-blue-700",     text: "text-white",         chip: "bg-blue-50 text-blue-700 border-blue-100" },
  amber:   { bg: "bg-amber-500",       text: "text-white",         chip: "bg-amber-50 text-amber-700 border-amber-100" },
  violet:  { bg: "bg-violet-600",      text: "text-white",         chip: "bg-violet-50 text-violet-700 border-violet-100" },
  rose:    { bg: "bg-rose-600",        text: "text-white",         chip: "bg-rose-50 text-rose-700 border-rose-100" },
  ink:     { bg: "bg-ink-900",         text: "text-white",         chip: "bg-ink-100 text-ink-700 border-ink-200" },
};

export default function StatCard({ title, value, delta, deltaDir = "up", icon: Icon, accent = "brand", sub }) {
  const a = accents[accent] || accents.brand;
  const up = deltaDir === "up";
  return (
    <div className="stat-card p-3 sm:p-4">
      <div className="flex items-start justify-between mb-2.5 sm:mb-3 gap-2">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center ${a.bg} ${a.text} shrink-0`}>
          <Icon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
        </div>
        {delta != null && (
          <div className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded border tabular-nums shrink-0 ${
            up ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-rose-50 text-rose-700 border-rose-100"
          }`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] sm:text-[12px] text-ink-500 font-medium truncate">{title}</div>
        <div className="text-[20px] sm:text-[24px] font-bold text-ink-900 mt-1 leading-none tabular-nums break-all">
          {value}
        </div>
        {sub && <div className="text-[10.5px] sm:text-[11px] text-ink-400 mt-1.5 sm:mt-2 truncate">{sub}</div>}
      </div>
    </div>
  );
}
