import ReportPage from "../components/ReportPage";
import { Icons } from "../components/Icons";
import { formatVND } from "../utils/format";

const { TrendingUp, TrendingDown } = Icons;

const METRICS = [
  { k: "Doanh thu",        current: 28_450_000_000, prev: 25_120_000_000, unit: "" },
  { k: "Công suất",        current: 78,               prev: 73,              unit: "%" },
  { k: "ADR",              current: 2_350_000,        prev: 2_180_000,       unit: "" },
  { k: "RevPAR",           current: 1_833_000,        prev: 1_591_000,       unit: "" },
  { k: "Số khách",         current: 12_486,           prev: 11_240,          unit: "" },
  { k: "Số đêm bán",       current: 18_420,           prev: 17_280,          unit: "" },
  { k: "Tỷ lệ hủy",       current: 4.8,              prev: 6.2,             unit: "%" },
  { k: "Repetition rate",  current: 38,               prev: 32,              unit: "%" },
];

export default function PeriodComparison() {
  return (
    <ReportPage title="So sánh kỳ" subtitle="Kỳ này (30 ngày qua) so với cùng kỳ năm trước">
      <div className="bg-white border border-ink-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-ink-50 text-left text-ink-500 uppercase tracking-wider text-[10px]">
                <th className="px-3 sm:px-4 py-3 font-semibold">Chỉ số</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-right">Kỳ này</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-right hidden sm:table-cell">Cùng kỳ năm trước</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-right hidden md:table-cell">Chênh lệch</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => {
                const diff = m.current - m.prev;
                const pct = m.prev ? ((diff / m.prev) * 100).toFixed(1) : 0;
                const positive = diff >= 0;
                const upGood = m.k !== "Tỷ lệ hủy";
                const good = positive === upGood;
                const Arrow = positive ? TrendingUp : TrendingDown;
                const cc = good ? "text-emerald-600" : "text-rose-600";
                const fmt = (v) => m.unit === "%" ? `${v}%` : m.unit === "" ? formatVND(v) : v.toLocaleString("vi-VN");
                return (
                  <tr key={m.k} className="border-t border-ink-100">
                    <td className="px-3 sm:px-4 py-3 font-semibold text-ink-900">{m.k}</td>
                    <td className="px-3 sm:px-4 py-3 text-right font-bold tabular-nums">{fmt(m.current)}</td>
                    <td className="px-3 sm:px-4 py-3 text-right tabular-nums text-ink-500 hidden sm:table-cell">{fmt(m.prev)}</td>
                    <td className={`px-3 sm:px-4 py-3 text-right tabular-nums ${cc} hidden md:table-cell`}>
                      {positive ? "+" : ""}{fmt(diff)}
                    </td>
                    <td className={`px-3 sm:px-4 py-3 text-right tabular-nums ${cc} font-semibold whitespace-nowrap`}>
                      <span className="inline-flex items-center gap-1 justify-end">
                        <Arrow className="w-3 h-3" />
                        {positive ? "+" : ""}{pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ReportPage>
  );
}
