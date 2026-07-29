import ReportPage from "../components/ReportPage";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatVND, formatVNDFull } from "../utils/format";

const data = Array.from({ length: 30 }, (_, i) => ({
  d: `${i + 1}`,
  v: Math.round(450_000_000 + Math.sin(i / 3) * 80_000_000 + (i % 7 === 5 ? 90_000_000 : 0)),
}));

const tooltipStyle = { background: "#0f1218", border: "none", borderRadius: 6, fontSize: 12, color: "#fff", padding: "8px 12px" };

export default function RevenueTimeline() {
  return (
    <ReportPage title="Doanh thu theo thời gian" subtitle="Xu hướng doanh thu 30 ngày qua">
      <div className="bg-white border border-ink-200 rounded-md p-3 sm:p-5 overflow-hidden min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 mb-3">Doanh thu thực tế 30 ngày</div>
        <div className="h-56 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="rt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0c91e9" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0c91e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" vertical={false} />
              <XAxis dataKey="d" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1e6).toFixed(0)}tr`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatVNDFull(v)} />
              <Area type="monotone" dataKey="v" stroke="#0c91e9" strokeWidth={2} fill="url(#rt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4 text-center">
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-ink-500 font-semibold truncate">Tổng 30 ngày</div>
            <div className="text-[14px] sm:text-[18px] font-bold tabular-nums mt-1 truncate">{formatVND(28_450_000_000)}</div>
          </div>
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-ink-500 font-semibold truncate">TB / ngày</div>
            <div className="text-[14px] sm:text-[18px] font-bold tabular-nums mt-1 truncate">{formatVND(948_000_000)}</div>
          </div>
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-ink-500 font-semibold truncate">Tăng trưởng</div>
            <div className="text-[14px] sm:text-[18px] font-bold tabular-nums mt-1 text-emerald-600 truncate">+12.4%</div>
          </div>
        </div>
      </div>
    </ReportPage>
  );
}
