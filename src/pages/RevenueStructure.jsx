import ReportPage from "../components/ReportPage";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatVND, formatVNDFull } from "../utils/format";

const rawData = [
  { name: "Phòng", value: 17_640_000_000, color: "#0c91e9" },
  { name: "F&B", value: 6_260_000_000, color: "#f59e0b" },
  { name: "Spa", value: 1_990_000_000, color: "#10b981" },
  { name: "Sự kiện", value: 1_420_000_000, color: "#8b5cf6" },
  { name: "Khác", value: 1_140_000_000, color: "#f43f5e" },
];
const data = Array.isArray(rawData) ? rawData : [];
const total = data.reduce((s, d) => s + (d?.value || 0), 0) || 1;

const tooltipStyle = { background: "#0f1218", border: "none", borderRadius: 6, fontSize: 12, color: "#fff", padding: "8px 12px" };

export default function RevenueStructure() {
  return (
    <ReportPage title="Cơ cấu doanh thu" subtitle="Theo segment / kênh bán">
      <div className="bg-white border border-ink-200 rounded-md p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center overflow-hidden min-w-0">
        <div className="h-64 sm:h-72 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={50} outerRadius={88} paddingAngle={3} dataKey="value" cornerRadius={4}>
                {data.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatVNDFull(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-[10px] uppercase tracking-wider text-ink-500">Tổng</div>
            <div className="text-[16px] sm:text-[18px] font-bold tabular-nums">{formatVND(total)}</div>
          </div>
        </div>
        <div className="space-y-2 min-w-0">
          {data.map((d) => {
            const pct = ((d.value / total) * 100).toFixed(1);
            return (
              <div key={d.name} className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 rounded-md border border-ink-200 min-w-0">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-ink-900 truncate">{d.name}</div>
                  <div className="text-[11px] text-ink-500">{pct}%</div>
                </div>
                <div className="text-[12px] sm:text-[13px] font-bold tabular-nums truncate">{formatVND(d.value)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </ReportPage>
  );
}
