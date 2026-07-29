import ReportPage from "../components/ReportPage";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatVND } from "../utils/format";

const data = Array.from({ length: 14 }, (_, i) => {
  const occ = Math.round(68 + Math.sin(i / 1.6) * 12 + i * 0.5);
  return { d: `${i + 1}`, occ: Math.min(98, Math.max(40, occ)), r: 280 + Math.round(Math.cos(i / 2) * 60 + i * 4) };
});

const tooltipStyle = { background: "#0f1218", border: "none", borderRadius: 6, fontSize: 12, color: "#fff", padding: "8px 12px" };

export default function Forecast() {
  const totalRev = data.reduce((s, x) => s + x.r * 2_350_000, 0);
  const avgOcc = Math.round(data.reduce((s, x) => s + x.occ, 0) / data.length);
  return (
    <ReportPage title="Dự báo" subtitle="Công suất & doanh thu tiềm năng 14 ngày tới">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="bg-white border border-ink-200 border-l-4 border-l-emerald-500 rounded-md px-3.5 sm:px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">Công suất TB dự báo</div>
          <div className="text-[20px] sm:text-[22px] font-bold text-ink-900 mt-1 tabular-nums">{avgOcc}%</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">+8 điểm vs kỳ trước</div>
        </div>
        <div className="bg-white border border-ink-200 border-l-4 border-l-blue-500 rounded-md px-3.5 sm:px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">DT tiềm năng</div>
          <div className="text-[20px] sm:text-[22px] font-bold text-ink-900 mt-1 tabular-nums truncate">{formatVND(totalRev)}</div>
          <div className="text-[11px] text-blue-700 mt-0.5">14 ngày tới</div>
        </div>
        <div className="bg-white border border-ink-200 border-l-4 border-l-violet-500 rounded-md px-3.5 sm:px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">Đêm bán dự kiến</div>
          <div className="text-[20px] sm:text-[22px] font-bold text-ink-900 mt-1 tabular-nums">3,120</div>
          <div className="text-[11px] text-violet-700 mt-0.5">+412 vs kỳ trước</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 min-w-0">
        <div className="bg-white border border-ink-200 rounded-md p-3 sm:p-5 overflow-hidden min-w-0">
          <div className="text-[13px] font-semibold text-ink-900 mb-3">Công suất dự báo (%)</div>
          <div className="h-52 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" vertical={false} />
                <XAxis dataKey="d" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} domain={[40, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="occ" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-ink-200 rounded-md p-3 sm:p-5 overflow-hidden min-w-0">
          <div className="text-[13px] font-semibold text-ink-900 mb-3">Doanh thu tiềm năng (triệu / ngày)</div>
          <div className="h-52 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" vertical={false} />
                <XAxis dataKey="d" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="r" fill="#0c91e9" radius={[3, 3, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ReportPage>
  );
}
