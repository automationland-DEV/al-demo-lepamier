import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";
import { revenueChart, occupancyByBranch, branches } from "../data/mockData";
import { formatVND, formatVNDFull } from "../utils/format";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, ComposedChart, PieChart as RPieChart, Pie, Cell,
} from "recharts";
import { useState, useMemo } from "react";

const {
  Download, Filter, TrendingUp, Building2, Wallet, BedDouble, Users,
  ArrowUpRight, ArrowDownRight, Sparkles, Target, Crown, Award,
  Globe2, Briefcase, Calendar, ChevronRight, MoreHorizontal,
  BarChart3, Activity, Percent, Zap, Star,
  CheckCircle2, AlertCircle, Eye, Tag, Hash, Hotel, Layers,
  PieChart, Heart,
} = Icons;

const tooltipStyle = {
  background: "#0f1218",
  border: "none",
  borderRadius: 10,
  fontSize: 12,
  color: "#fff",
  padding: "8px 12px",
};

const RANGES = [
  { id: "7d",  label: "7 ngày qua" },
  { id: "mtd", label: "Tháng này (MTD)" },
  { id: "30d", label: "30 ngày qua" },
  { id: "qtd", label: "Quý này (QTD)" },
  { id: "ytd", label: "Năm nay (YTD)" },
  { id: "ly",  label: "12 tháng gần nhất" },
];

export default function Reports() {
  const [range, setRange] = useState("ytd");
  const data = useMemo(() => buildAnalytics(), []);

  return (
    <div className="max-w-[1320px] mx-auto pb-12 px-3 sm:px-4 lg:px-6">

      {/* ═══ HERO — PHỔ BÁO CÁO ═══ */}
      <div className="relative overflow-hidden rounded-md bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 text-white shadow-sm mb-5 sm:mb-6">
        <div className="absolute inset-0 opacity-[0.06] bg-soft-grid" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative px-4 sm:px-7 py-5 sm:py-7">
          <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/70 font-semibold flex-wrap">
                <BarChart3 className="w-3.5 h-3.5" />
                BI · Business Intelligence · Condo HUB Group
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Live · đồng bộ 30s
                </span>
              </div>
              <h1 className="font-display font-bold text-[20px] sm:text-[28px] mt-1.5">
                Báo cáo & Phân tích hiệu suất kinh doanh
              </h1>
              <p className="text-[13px] text-white/75 mt-1 max-w-2xl">
                Phổ báo cáo đa chiều · 4 chi nhánh · 12 KPIs · so sánh YoY · forecast AI · drill-down tới booking
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {data.heroBadges.map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded px-2 py-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold whitespace-nowrap">{b.label}</span>
                    <span className="text-[12px] font-bold tabular-nums truncate">{b.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto flex-wrap">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-[12.5px] font-semibold transition text-white [&>option]:text-ink-900 flex-1 sm:flex-none min-w-0"
              >
                {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <button className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-[12.5px] font-semibold flex items-center gap-2 transition">
                <Filter className="w-4 h-4" /> Bộ lọc
              </button>
              <button className="px-3 py-2 rounded-md bg-white text-brand-700 hover:bg-brand-50 text-[12.5px] font-bold flex items-center gap-2 transition shadow-sm">
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Xuất báo cáo</span><span className="sm:hidden">Xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ KPI NÂNG CAO — 6 CHỈ SỐ ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
        {data.kpi.map((k, i) => <KPICard key={i} k={k} />)}
      </div>

      {/* ═══ REVENUE TREND — COMPOSED ═══ */}
      <Card
        title="Doanh thu & Công suất 12 tháng"
        subtitle="VNĐ · % occupancy · so sánh cùng kỳ năm trước (LY)"
        action={<LegendChips items={[
          { color: "#0c91e9", label: "DT 2026" },
          { color: "#94a3b8", label: "DT 2025 (LY)" },
          { color: "#f59e0b", label: "Target" },
          { color: "#8b5cf6", label: "Occupancy %" },
        ]} />}
        className="mb-5 sm:mb-6"
      >
        <div className="h-64 sm:h-80 overflow-hidden min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.revenueTrend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0c91e9" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#0c91e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" vertical={false} />
              <XAxis dataKey="month" stroke="#8792a8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" stroke="#0c91e9" fontSize={11} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}tỷ`} />
              <YAxis yAxisId="r" orientation="right" stroke="#8b5cf6" fontSize={11} tickLine={false} axisLine={false}
                domain={[40, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => n === "occupancy" ? [`${v}%`, "Occupancy"] : [formatVNDFull(v), n]} />
              <Area yAxisId="l" type="monotone" dataKey="revenue" stroke="#0c91e9" strokeWidth={2.5}
                fill="url(#revG)" name="Doanh thu 2026" dot={{ r: 3, fill: "#0c91e9" }} />
              <Line yAxisId="l" type="monotone" dataKey="lastYear" stroke="#94a3b8" strokeWidth={2}
                strokeDasharray="4 4" dot={false} name="Doanh thu 2025 (LY)" />
              <Line yAxisId="l" type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2}
                strokeDasharray="2 4" dot={false} name="Target" />
              <Line yAxisId="r" type="monotone" dataKey="occupancy" stroke="#8b5cf6" strokeWidth={2.5}
                dot={{ r: 3, fill: "#8b5cf6" }} name="Occupancy %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ═══ 3-COLUMN ROW: radar + branch ranking + channel mix ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 sm:gap-5 mb-5 sm:mb-6 min-w-0">
        {/* Radar */}
        <Card title="Chỉ số hiệu suất tổng thể" subtitle="vs mục tiêu (%)" className="xl:col-span-4 overflow-hidden min-w-0">
          <div className="h-64 sm:h-72 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.healthMetrics}>
                <PolarGrid stroke="#e1e6ed" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#5c6679", fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#b1b9c8", fontSize: 10 }} />
                <Radar name="Hiện tại" dataKey="value" stroke="#0c91e9" fill="#0c91e9" fillOpacity={0.45} strokeWidth={2} />
                <Radar name="Mục tiêu" dataKey="target" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.12} strokeWidth={2} strokeDasharray="3 3" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px]">
            <div className="rounded bg-emerald-50 border border-emerald-100 px-2 py-1.5">
              <div className="text-emerald-700 font-bold">↗ 4 chỉ số trên target</div>
              <div className="text-ink-500">DT · Hài lòng · Hiệu suất · Tái sử dụng</div>
            </div>
            <div className="rounded bg-rose-50 border border-rose-100 px-2 py-1.5">
              <div className="text-rose-700 font-bold">↘ 2 chỉ số dưới target</div>
              <div className="text-ink-500">Chi phí · Occupancy mùa thấp</div>
            </div>
          </div>
        </Card>

        {/* Branch ranking */}
        <Card title="Xếp hạng chi nhánh" subtitle="Theo doanh thu & hiệu suất" className="xl:col-span-5 min-w-0">
          <div className="space-y-2">
            {data.branchRank.map((b, idx) => (
              <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50 transition">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[12px] shrink-0 ${
                  idx === 0 ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300" :
                  idx === 1 ? "bg-slate-200 text-slate-700" :
                  idx === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-ink-100 text-ink-600"
                }`}>
                  {idx === 0 ? <Crown className="w-4 h-4" /> : `#${idx + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="font-semibold text-ink-900 text-[12.5px] truncate">{b.name}</div>
                    {b.badge && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <Sparkles className="w-2.5 h-2.5" /> {b.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10.5px] text-ink-500 flex items-center gap-2 flex-wrap">
                    <span>📍 {b.city}</span>
                    <span>·</span>
                    <span>{b.booked}/{b.totalRooms} phòng</span>
                    <span>·</span>
                    <span>Rev/room <b className="text-ink-700">{formatVND(b.revPerRoom)}</b></span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-ink-900 tabular-nums text-[13px]">{formatVND(b.revenue)}</div>
                  <div className={`text-[10.5px] font-bold inline-flex items-center gap-0.5 ${b.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {b.delta >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    {b.delta >= 0 ? "+" : ""}{b.delta}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Channel mix */}
        <Card title="Kênh bán phòng" subtitle="% doanh thu theo nguồn" className="xl:col-span-3 overflow-hidden min-w-0">
          <div className="h-40 sm:h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie data={data.channelMix} dataKey="value" innerRadius={48} outerRadius={72}
                  paddingAngle={2} cornerRadius={3} stroke="#fff" strokeWidth={2}>
                  {data.channelMix.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, ""]} />
              </RPieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-[9px] uppercase tracking-wider text-ink-500 font-bold">Tổng</div>
              <div className="text-[16px] font-display font-bold text-ink-900 tabular-nums leading-none mt-0.5">
                {formatVND(data.channelMix.reduce((s, x) => s + x.vnd, 0))}
              </div>
            </div>
          </div>
          <div className="space-y-1 mt-2">
            {data.channelMix.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: c.color }} />
                <span className="font-semibold text-ink-700 flex-1 truncate">{c.name}</span>
                <span className="font-bold text-ink-900 tabular-nums w-10 text-right">{c.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ═══ P&L + SEGMENT + FORECAST ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 sm:gap-5 mb-5 sm:mb-6 min-w-0">
        {/* P&L breakdown */}
        <Card title="Báo cáo Lãi & Lỗ (P&L)" subtitle="Tóm tắt 12 tháng · triệu VNĐ" className="xl:col-span-5 min-w-0">
          <div className="space-y-1.5">
            {data.pnl.map((row, i) => {
              const isTotal = row.total;
              const isMargin = row.margin;
              return (
                <div key={i} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md ${
                  isTotal ? "bg-brand-50 border border-brand-200" : isMargin ? "bg-emerald-50 border border-emerald-100" : "bg-ink-50"
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {isTotal ? <Award className="w-3.5 h-3.5 text-brand-700 shrink-0" /> :
                     isMargin ? <Percent className="w-3.5 h-3.5 text-emerald-700 shrink-0" /> :
                     <span className="w-1.5 h-1.5 rounded-full bg-ink-400 shrink-0 ml-1" />}
                    <span className={`text-[12px] truncate ${isTotal ? "font-bold text-brand-800" : isMargin ? "font-bold text-emerald-800" : "text-ink-700"}`}>
                      {row.label}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`tabular-nums ${isTotal ? "font-bold text-brand-900" : isMargin ? "font-bold text-emerald-900" : "font-semibold text-ink-900"}`}>
                      {row.value.toLocaleString("vi-VN")} tr
                    </div>
                    {!isTotal && !isMargin && (
                      <div className="text-[10px] text-ink-500">{row.pct}%</div>
                    )}
                    {isMargin && (
                      <div className="text-[10px] text-emerald-700 font-bold">{row.value}% margin</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Segment breakdown */}
        <Card title="Phân khúc thị trường" subtitle="Khách theo mục đích" className="xl:col-span-3 min-w-0">
          <div className="space-y-2">
            {data.segments.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <s.icon className="w-3 h-3 text-ink-500 shrink-0" />
                    <span className="text-[11.5px] font-semibold text-ink-700 truncate">{s.name}</span>
                  </div>
                  <span className="text-[10.5px] font-bold text-ink-900 tabular-nums shrink-0">{s.pct}%</span>
                </div>
                <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
                <div className="text-[9.5px] text-ink-500 mt-0.5 tabular-nums">
                  {s.count} đêm · ADR <b className="text-ink-700">{formatVND(s.adr)}</b>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-ink-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[9px] uppercase font-bold text-ink-500">Leisure</div>
              <div className="text-[13px] font-display font-bold text-ink-900 tabular-nums">62%</div>
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold text-ink-500">Corporate</div>
              <div className="text-[13px] font-display font-bold text-ink-900 tabular-nums">28%</div>
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold text-ink-500">MICE</div>
              <div className="text-[13px] font-display font-bold text-ink-900 tabular-nums">10%</div>
            </div>
          </div>
        </Card>

        {/* Forecast */}
        <Card title="Forecast 3 tháng tới" subtitle="AI dự báo doanh thu & occupancy"
          action={<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold border border-violet-200">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </span>}
          className="xl:col-span-4 overflow-hidden min-w-0">
          <div className="h-40 sm:h-44 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.forecast} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fcG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" vertical={false} />
                <XAxis dataKey="m" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1_000_000_000).toFixed(1)}tỷ`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="actual" fill="#0c91e9" radius={[3,3,0,0]} barSize={18} name="Thực tế" />
                <Area type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} fill="url(#fcG)" name="Dự báo AI" strokeDasharray="4 3" />
                <Bar dataKey="upper" fill="transparent" stroke="#8b5cf6" strokeDasharray="2 3" name="Trên" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div className="rounded bg-violet-50 border border-violet-100 px-2 py-1.5">
              <div className="text-[9px] uppercase font-bold text-violet-700">T8</div>
              <div className="text-[12px] font-bold text-violet-900 tabular-nums">22.8 tỷ</div>
              <div className="text-[9px] text-emerald-700 font-bold">+14%</div>
            </div>
            <div className="rounded bg-violet-50 border border-violet-100 px-2 py-1.5">
              <div className="text-[9px] uppercase font-bold text-violet-700">T9</div>
              <div className="text-[12px] font-bold text-violet-900 tabular-nums">21.5 tỷ</div>
              <div className="text-[9px] text-emerald-700 font-bold">+9%</div>
            </div>
            <div className="rounded bg-violet-50 border border-violet-100 px-2 py-1.5">
              <div className="text-[9px] uppercase font-bold text-violet-700">T10</div>
              <div className="text-[12px] font-bold text-violet-900 tabular-nums">23.2 tỷ</div>
              <div className="text-[9px] text-emerald-700 font-bold">+18%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ═══ OCCUPANCY HEATMAP + INSIGHTS + TOP ROOMS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 sm:gap-5 mb-5 sm:mb-6 min-w-0">
        {/* Heatmap occupancy */}
        <Card title="Occupancy theo ngày & giờ" subtitle="% công suất · 7 ngày gần nhất" className="xl:col-span-5 overflow-hidden min-w-0">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[10px] tabular-nums">
              <thead>
                <tr>
                  <th className="px-1.5 py-1 text-left text-ink-500 font-semibold uppercase">Giờ</th>
                  {["T2","T3","T4","T5","T6","T7","CN"].map((d) => (
                    <th key={d} className="px-1 py-1 text-center text-ink-500 font-semibold">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.heatmap.map((row, i) => (
                  <tr key={i}>
                    <td className="px-1.5 py-1 font-semibold text-ink-700">{row.h}</td>
                    {row.cells.map((c, j) => {
                      const v = c; // 0..100
                      const bg = v >= 85 ? "#10b981" :
                                 v >= 70 ? "#34d399" :
                                 v >= 55 ? "#fbbf24" :
                                 v >= 40 ? "#fb923c" :
                                           "#f87171";
                      return (
                        <td key={j} className="px-0.5 py-0.5 text-center">
                          <div className="w-full aspect-square rounded flex items-center justify-center text-[8.5px] font-bold text-white"
                               style={{ background: bg }}>
                            {v}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[9.5px] text-ink-500">
            <span>Thấp</span>
            {["#f87171","#fb923c","#fbbf24","#34d399","#10b981"].map((c) => (
              <span key={c} className="w-3 h-3 rounded" style={{ background: c }} />
            ))}
            <span>Cao</span>
            <span className="ml-auto font-semibold text-ink-700">Peak: T6 14h–16h & CN 11h–13h</span>
          </div>
        </Card>

        {/* AI Insights */}
        <Card title="Insights & Cảnh báo" subtitle="AI phát hiện tự động"
          action={<span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-700">
            <Sparkles className="w-3 h-3" /> Smart
          </span>}
          className="xl:col-span-4 min-w-0">
          <div className="space-y-2.5">
            {data.insights.map((it, i) => {
              const tone = it.type === "positive" ? "border-l-emerald-500 bg-emerald-50/60" :
                           it.type === "warning"   ? "border-l-amber-500 bg-amber-50/60" :
                                                      "border-l-blue-500 bg-blue-50/60";
              const Icon = it.type === "positive" ? CheckCircle2 :
                           it.type === "warning"   ? AlertCircle : Eye;
              const iconTone = it.type === "positive" ? "text-emerald-600" :
                               it.type === "warning"   ? "text-amber-600" : "text-blue-600";
              return (
                <div key={i} className={`border-l-4 rounded-r-md p-2.5 ${tone}`}>
                  <div className="flex items-start gap-2">
                    <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${iconTone}`} />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-ink-900 text-[12px]">{it.title}</div>
                      <div className="text-[11px] text-ink-600 leading-relaxed mt-0.5">{it.desc}</div>
                      {it.metric && (
                        <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/80 border border-ink-200 text-ink-900">
                          {it.metric}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top revenue rooms */}
        <Card title="Top hạng phòng" subtitle="Theo doanh thu tháng" className="xl:col-span-3 min-w-0">
          <div className="space-y-2">
            {data.topRooms.map((r, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2 rounded-md hover:bg-ink-50 transition">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {r.code.split("-").pop()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-[12px] truncate">{r.code}</div>
                  <div className="text-[10px] text-ink-500">{r.type} · {r.branch}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-ink-900 tabular-nums text-[12px]">{formatVND(r.rev)}</div>
                  <div className="text-[9.5px] text-ink-500 tabular-nums">{r.nights} đêm</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ═══ DETAILED TABLE — TOÀN HỆ THỐNG ═══ */}
      <Card
        title="Báo cáo chi tiết toàn hệ thống"
        subtitle="Drill-down theo chi nhánh · click vào chi nhánh để xem booking"
        action={
          <div className="flex items-center gap-1.5 text-[10.5px] flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-ink-100 text-ink-700">
              <Layers className="w-3 h-3" /> So sánh cùng kỳ
            </span>
            <button className="px-2 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-200 font-bold flex items-center gap-1">
              <Download className="w-3 h-3" /> Excel
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto -mx-3 sm:-mx-5">
          <table className="w-full">
            <thead>
              <tr className="bg-ink-50">
                <th className="table-th">Chi nhánh</th>
                <th className="table-th text-right hidden sm:table-cell">Phòng</th>
                <th className="table-th text-right hidden md:table-cell">Đã bán</th>
                <th className="table-th text-right">Lấp đầy</th>
                <th className="table-th text-right hidden md:table-cell">ADR</th>
                <th className="table-th text-right hidden lg:table-cell">RevPAR</th>
                <th className="table-th text-right">Doanh thu</th>
                <th className="table-th text-right">YoY</th>
                <th className="table-th hidden sm:table-cell">Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {data.tableData.map((b) => (
                <tr key={b.id} className="hover:bg-ink-50 transition border-b border-ink-100">
                  <td className="table-td">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-brand-gradient text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {b.code}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-ink-900 truncate">{b.name}</div>
                        <div className="text-[10.5px] text-ink-500 flex items-center gap-1">
                          <Globe2 className="w-2.5 h-2.5" /> {b.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-right tabular-nums hidden sm:table-cell">{b.totalRooms}</td>
                  <td className="table-td text-right tabular-nums font-semibold hidden md:table-cell">{b.booked}</td>
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-14 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                             style={{ width: `${b.occupancy}%`, background: b.occupancy >= 80 ? "#10b981" : b.occupancy >= 60 ? "#fbbf24" : "#f87171" }} />
                      </div>
                      <span className="font-bold text-ink-900 tabular-nums">{b.occupancy}%</span>
                    </div>
                  </td>
                  <td className="table-td text-right tabular-nums font-semibold hidden md:table-cell">{formatVND(b.adr)}</td>
                  <td className="table-td text-right tabular-nums hidden lg:table-cell">{formatVND(b.revPar)}</td>
                  <td className="table-td text-right font-bold tabular-nums whitespace-nowrap">{formatVND(b.revenue)}</td>
                  <td className="table-td text-right">
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10.5px] font-bold ${
                      b.yoy >= 0 ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-rose-700 bg-rose-50 border border-rose-200"
                    }`}>
                      {b.yoy >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                      {b.yoy >= 0 ? "+" : ""}{b.yoy}%
                    </span>
                  </td>
                  <td className="table-td hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11.5px]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {b.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-brand-50 border-t-2 border-brand-200">
                <td className="table-td font-bold text-brand-900 uppercase text-[10.5px] tracking-wider">
                  Tổng toàn hệ thống
                </td>
                <td className="table-td text-right font-bold text-brand-900 tabular-nums hidden sm:table-cell">
                  {data.tableData.reduce((s, x) => s + x.totalRooms, 0)}
                </td>
                <td className="table-td text-right font-bold text-brand-900 tabular-nums hidden md:table-cell">
                  {data.tableData.reduce((s, x) => s + x.booked, 0)}
                </td>
                <td className="table-td text-right font-bold text-brand-900 tabular-nums">
                  {Math.round(data.tableData.reduce((s, x) => s + x.occupancy * x.totalRooms, 0) / data.tableData.reduce((s, x) => s + x.totalRooms, 0))}%
                </td>
                <td className="table-td text-right font-bold text-brand-900 tabular-nums hidden md:table-cell">
                  {formatVND(Math.round(data.tableData.reduce((s, x) => s + x.adr * x.booked, 0) / data.tableData.reduce((s, x) => s + x.booked, 0)))}
                </td>
                <td className="table-td text-right font-bold text-brand-900 tabular-nums hidden lg:table-cell">
                  {formatVND(Math.round(data.tableData.reduce((s, x) => s + x.revPar * x.totalRooms, 0) / data.tableData.reduce((s, x) => s + x.totalRooms, 0)))}
                </td>
                <td className="table-td text-right font-bold text-brand-900 tabular-nums whitespace-nowrap">
                  {formatVND(data.tableData.reduce((s, x) => s + x.revenue, 0))}
                </td>
                <td className="table-td text-right">
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                    <ArrowUpRight className="w-2.5 h-2.5" />
                    +{Math.round(data.tableData.reduce((s, x) => s + x.yoy * x.revenue, 0) / data.tableData.reduce((s, x) => s + x.revenue, 0))}%
                  </span>
                </td>
                <td className="table-td hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {(data.tableData.reduce((s, x) => s + x.rating, 0) / data.tableData.length).toFixed(2)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* ═══ FOOTER ═══ */}
      <div className="mt-6 sm:mt-8 flex items-center justify-between gap-3 flex-wrap text-[11px] text-ink-400">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-3 h-3" />
          Số liệu minh họa · nguồn: PMS · POS · RMS · BI Engine · {data.heroBadges[0].value} snapshot
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="px-2.5 py-1 rounded-md border border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-700 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Lên lịch tự động
          </button>
          <button className="px-2.5 py-1 rounded-md border border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-700 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Chia sẻ dashboard
          </button>
          <button className="px-2.5 py-1 rounded-md bg-brand-700 text-on-accent hover:bg-brand-800 flex items-center gap-1 font-bold">
            <Download className="w-3 h-3" /> Xuất PDF executive
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ SUB COMPONENTS ═══════════ */

function LegendChips({ items }) {
  return (
    <div className="flex items-center gap-2 flex-wrap text-[10.5px]">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-ink-50 text-ink-700 border border-ink-200">
          <span className="w-2 h-2 rounded-full" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function KPICard({ k }) {
  const up = k.delta >= 0;
  const accent = k.accent || "brand";
  const accentCls = {
    brand:   { bg: "bg-brand-50", text: "text-brand-700", border: "border-brand-200" },
    blue:    { bg: "bg-blue-50",  text: "text-blue-700",  border: "border-blue-200" },
    violet:  { bg: "bg-violet-50",text: "text-violet-700",border: "border-violet-200" },
    amber:   { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    emerald: { bg: "bg-emerald-50",text:"text-emerald-700",border:"border-emerald-200" },
    rose:    { bg: "bg-rose-50",  text: "text-rose-700",  border: "border-rose-200" },
  }[accent];
  return (
    <div className={`bg-white border border-ink-200 rounded-md p-3 sm:p-3.5 hover:shadow-md transition border-l-4 ${accentCls.border}`}>
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className={`w-8 h-8 rounded-md ${accentCls.bg} ${accentCls.text} flex items-center justify-center`}>
          <k.icon className="w-4 h-4" />
        </div>
        <span className={`inline-flex items-center gap-0.5 text-[9.5px] font-bold px-1 py-0.5 rounded border ${
          up ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-rose-700 bg-rose-50 border-rose-200"
        }`}>
          {up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
          {up ? "+" : ""}{k.delta}%
        </span>
      </div>
      <div className="text-[18px] sm:text-[20px] font-display font-bold text-ink-900 tabular-nums leading-none break-all">
        {k.value}
      </div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold mt-1.5 truncate">{k.label}</div>
      {k.sub && <div className="text-[10px] text-ink-500 mt-0.5">{k.sub}</div>}
    </div>
  );
}

/* ═══════════ DATA ═══════════ */

function buildAnalytics() {
  const tableData = branches.map((b) => {
    const booked = Math.round(b.totalRooms * b.occupancy / 100);
    const revPerRoom = Math.round(b.revenue / b.totalRooms);
    const adr = Math.round(b.revenue / Math.max(booked, 1));
    return {
      ...b,
      booked,
      revPerRoom,
      adr,
      revPar: Math.round(b.revenue / b.totalRooms),
      yoy: randF(-8, 28),
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalRev = tableData.reduce((s, x) => s + x.revenue, 0);
  const totalNights = tableData.reduce((s, x) => s + x.booked, 0);

  const branchRank = tableData.map((b, idx) => ({
    ...b,
    delta: randF(2, 28),
    badge: idx === 0 ? "Top Revenue" : idx === 1 ? "+24% YoY" : null,
  }));

  const kpi = [
    { label: "Tổng doanh thu", value: formatVND(totalRev), sub: "12 tháng", delta: 18.4, icon: Wallet,   accent: "brand" },
    { label: "Lợi nhuận gộp",  value: "74.2 tỷ",          sub: "Margin 29.8%", delta: 12.1, icon: TrendingUp, accent: "emerald" },
    { label: "RevPAR",         value: formatVND(Math.round(tableData.reduce((s, x) => s + x.revPar * x.totalRooms, 0) / tableData.reduce((s, x) => s + x.totalRooms, 0))), sub: "per available room", delta: 9.6, icon: BedDouble, accent: "blue" },
    { label: "ADR TB",         value: formatVND(Math.round(totalRev / Math.max(totalNights, 1))), sub: "average daily rate", delta: 6.2, icon: Tag,       accent: "violet" },
    { label: "Occupancy",      value: `${Math.round(tableData.reduce((s, x) => s + x.occupancy * x.totalRooms, 0) / tableData.reduce((s, x) => s + x.totalRooms, 0))}%`, sub: `${totalNights} đêm bán`, delta: 4.8, icon: Percent,   accent: "amber" },
    { label: "NPS khách",      value: "72",                sub: "Industry avg 54", delta: 8.4, icon: Star,      accent: "rose" },
  ];

  const heroBadges = [
    { label: "Chi nhánh",  value: tableData.length },
    { label: "Phòng",      value: tableData.reduce((s, x) => s + x.totalRooms, 0) },
    { label: "Số đêm YTD", value: totalNights.toLocaleString("vi-VN") },
    { label: "Khách",      value: (totalNights * 1.6).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) },
    { label: "Snapshot",   value: "28/07/2026 · 09:24" },
  ];

  const revenueTrend = revenueChart.map((r, i) => ({
    month: r.month,
    revenue: r.revenue,
    lastYear: Math.round(r.revenue * (0.78 + Math.sin(i) * 0.06)),
    target: 17_000_000_000,
    occupancy: r.occupancy,
  }));

  const healthMetrics = [
    { metric: "Doanh thu",   value: 92, target: 100 },
    { metric: "Lấp đầy",     value: 78, target: 95 },
    { metric: "Hài lòng",    value: 86, target: 90 },
    { metric: "Chi phí",     value: 71, target: 80 },
    { metric: "Tái sử dụng", value: 64, target: 70 },
    { metric: "Hiệu suất",   value: 88, target: 90 },
  ];

  const channelMix = [
    { name: "Booking.com",   value: 32, vnd: totalRev * 0.32, color: "#0c91e9" },
    { name: "Walk-in / Lễ tân", value: 22, vnd: totalRev * 0.22, color: "#10b981" },
    { name: "Agoda",         value: 14, vnd: totalRev * 0.14, color: "#f59e0b" },
    { name: "Traveloka",     value: 12, vnd: totalRev * 0.12, color: "#8b5cf6" },
    { name: "Đoàn / MICE",   value: 10, vnd: totalRev * 0.10, color: "#f43f5e" },
    { name: "Website LP",    value: 6,  vnd: totalRev * 0.06, color: "#06b6d4" },
    { name: "Khác",          value: 4,  vnd: totalRev * 0.04, color: "#64748b" },
  ];

  const pnl = [
    { label: "Doanh thu phòng",       value: Math.round(totalRev / 1_000_000), pct: 72 },
    { label: "Doanh thu F&B",          value: Math.round(totalRev * 0.18 / 1_000_000), pct: 18 },
    { label: "Doanh thu dịch vụ khác", value: Math.round(totalRev * 0.06 / 1_000_000), pct: 6 },
    { label: "Doanh thu sự kiện/MICE", value: Math.round(totalRev * 0.04 / 1_000_000), pct: 4 },
    { label: "Tổng doanh thu",        value: Math.round(totalRev / 1_000_000), total: true },
    { label: "Chi phí vận hành",       value: -Math.round(totalRev * 0.42 / 1_000_000), pct: -42 },
    { label: "Chi phí nhân sự",       value: -Math.round(totalRev * 0.18 / 1_000_000), pct: -18 },
    { label: "Chi phí marketing",     value: -Math.round(totalRev * 0.06 / 1_000_000), pct: -6 },
    { label: "Chi phí OTA",           value: -Math.round(totalRev * 0.05 / 1_000_000), pct: -5 },
    { label: "Lợi nhuận gộp (GOP)",   value: Math.round(totalRev * 0.298 / 1_000_000), margin: 29.8 },
  ];

  const segments = [
    { name: "Leisure · Family",    pct: 38, count: Math.round(totalNights * 0.38), adr: randF(2_400_000, 3_600_000), icon: Users,      color: "linear-gradient(90deg, #f59e0b, #f43f5e)" },
    { name: "Leisure · Couple",    pct: 24, count: Math.round(totalNights * 0.24), adr: randF(2_800_000, 4_200_000), icon: Heart,      color: "linear-gradient(90deg, #f43f5e, #ec4899)" },
    { name: "Corporate",           pct: 18, count: Math.round(totalNights * 0.18), adr: randF(1_800_000, 2_400_000), icon: Briefcase,  color: "linear-gradient(90deg, #0c91e9, #6366f1)" },
    { name: "MICE · Events",       pct: 10, count: Math.round(totalNights * 0.10), adr: randF(3_200_000, 4_800_000), icon: Activity,   color: "linear-gradient(90deg, #10b981, #06b6d4)" },
    { name: "Long-stay",           pct: 6,  count: Math.round(totalNights * 0.06), adr: randF(1_400_000, 2_000_000), icon: Calendar,   color: "linear-gradient(90deg, #8b5cf6, #d946ef)" },
    { name: "Walk-in",             pct: 4,  count: Math.round(totalNights * 0.04), adr: randF(2_000_000, 3_000_000), icon: Hotel,      color: "linear-gradient(90deg, #64748b, #94a3b8)" },
  ];

  const forecast = [
    { m: "T7 (thực tế)",   actual: 21_400_000_000, predicted: null, upper: null },
    { m: "T8 (forecast)",  actual: null,            predicted: 22_800_000_000, upper: 24_600_000_000 },
    { m: "T9 (forecast)",  actual: null,            predicted: 21_500_000_000, upper: 23_200_000_000 },
    { m: "T10 (forecast)", actual: null,            predicted: 23_200_000_000, upper: 25_400_000_000 },
    { m: "T11 (forecast)", actual: null,            predicted: 24_800_000_000, upper: 27_100_000_000 },
    { m: "T12 (forecast)", actual: null,            predicted: 28_400_000_000, upper: 30_600_000_000 },
  ];

  const heatmap = [
    { h: "08h", cells: [12, 14, 16, 18, 22, 78, 68] },
    { h: "10h", cells: [22, 24, 28, 32, 38, 88, 82] },
    { h: "12h", cells: [38, 42, 46, 52, 58, 94, 92] },
    { h: "14h", cells: [42, 48, 52, 56, 64, 96, 88] },
    { h: "16h", cells: [34, 38, 42, 48, 54, 84, 72] },
    { h: "18h", cells: [22, 28, 32, 38, 42, 68, 48] },
    { h: "20h", cells: [14, 18, 22, 26, 32, 46, 28] },
  ];

  const insights = [
    { type: "positive", title: "Doanh thu Q3 vượt target 18.4%", desc: "Booking.com & direct tăng mạnh nhờ chiến dịch 'Hè rực rỡ'", metric: "+18.4% YoY" },
    { type: "warning",   title: "Chi phí OTA tăng 24%",            desc: "Nên đẩy mạnh direct booking qua website & Zalo OA để giảm commission", metric: "8.4 tỷ chi phí" },
    { type: "info",      title: "Phú Quốc peak season 15/08–25/08", desc: "Dự báo full occupancy. Đề xuất mở thêm 12 phòng từ phòng đang bảo trì", metric: "Forecast 98%" },
    { type: "positive", title: "NPS khách tăng 8 điểm",            desc: "Chương trình 'Butler riêng' được đánh giá 9.2/10 — scale toàn hệ thống", metric: "NPS 72" },
    { type: "warning",   title: "ADR LP2 Đà Lạt giảm 6%",          desc: "Cạnh tranh giá từ đối thủ mới. Cân nhắc giảm kênh Agoda & tăng direct", metric: "-6% ADR" },
  ];

  const topRooms = [
    { code: "PRES-1201", type: "Presidential Suite", branch: "LP3 Phú Quốc", rev: 184_000_000, nights: 18 },
    { code: "VILLA-OP-08", type: "Ocean Villa",      branch: "LP3 Phú Quốc", rev: 168_400_000, nights: 22 },
    { code: "ROYAL-0502", type: "Royal Suite",        branch: "LP1 Sài Gòn",  rev: 142_800_000, nights: 16 },
    { code: "VILLA-GD-12", type: "Garden Pool Villa", branch: "LP2 Đà Lạt",   rev: 124_600_000, nights: 28 },
    { code: "DLX-OB-204", type: "Deluxe Ocean",       branch: "LP4 Nha Trang", rev: 98_400_000,  nights: 32 },
  ];

  return {
    kpi,
    heroBadges,
    tableData,
    branchRank,
    revenueTrend,
    healthMetrics,
    channelMix,
    pnl,
    segments,
    forecast,
    heatmap,
    insights,
    topRooms,
  };
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randF = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);