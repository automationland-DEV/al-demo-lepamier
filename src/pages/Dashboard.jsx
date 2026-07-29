import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icons } from "../components/Icons";
import { formatVND, formatVNDFull } from "../utils/format";
import MarqueeStrip from "../components/MarqueeStrip";
import PageHero, {
  SectionHeader, Card, Badge, FilterPill, HeroActions, NotifDot, Crumb,
} from "../components/DashboardPrimitives";
import {
  KPIBig, KPIAccent, StripMetric, StatusCell, OccupancyGauge,
} from "../components/DashboardKPIs";
import {
  OperationsGrid, TopRooms, ChannelMix, StaffShift,
  ReviewFeed, ActivityTimeline, QuickActions,
} from "../components/DashboardSections";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const {
  ChevronRight, TrendingUp, ArrowUpRight, Bell, AlertCircle,
  Building2, Star, Users, BedDouble, Wallet, Compass, Sparkles,
  LogIn, LogOut, CalendarCheck, Wrench, MessageSquare, Briefcase, Globe,
  Coffee, CreditCard, Hourglass, Layers, Activity, Percent, Clock, BarChart3,
} = Icons;

const tooltipStyle = {
  background: "#0f1218",
  border: "none",
  borderRadius: 6,
  fontSize: 12,
  color: "#fff",
  padding: "8px 12px",
};

/* ───── Notes: các UI primitives (Card, Badge, KPIBig, KPIAccent, StripMetric,
       StatusCell, OccupancyGauge, SectionHeader...) đã được tách ra
       DashboardPrimitives.jsx & DashboardKPIs.jsx. Phần này giữ cho file
       tập trung vào composition + data. ───── */

const TODAY = "28/07/2026";

/* ───── Page ───── */

export default function Dashboard() {
  const [range, setRange] = useState(30);
  const data = useMemo(() => buildData(range), [range]);

  // Marquee items — tin nội bộ realtime
  const marqueeItems = useMemo(() => ([
    { chip: "MỚI", icon: Sparkles, text: `Check-in vừa xong: Phòng 1205 · Deluxe Sea View · Khách Nguyễn Văn A` },
    { chip: "VIP", icon: Star,     text: `Khách VIP Nguyễn Minh K. đã đặt Presidential Suite ngày 02/08` },
    { chip: "OTA", icon: Building2,text: `Booking.com vừa gửi 3 đặt phòng mới cho Hồ Tràm cuối tuần` },
    { chip: "LIVE", icon: BedDouble, text: `Công suất hiện tại: ${data.occupied}/${data.totalRooms} phòng · ${data.occupancy}% lấp đầy` },
    { chip: "DT",   icon: Wallet,  text: `Doanh thu hôm nay: ${formatVND(data.revToday)} · vượt 12% kế hoạch` },
    { chip: "ADR",  icon: TrendingUp, text: `ADR: ${formatVND(data.adr)} · RevPAR: ${formatVND(data.revpar)}` },
    { chip: "KS",   icon: Users,   text: `Đoàn khách Hàn Quốc 28 người sẽ nhận phòng 17:00 tại Hồ Tràm` },
    { chip: "NHÂN SỰ", icon: Users, text: `Cần tuyển 2 lễ tân ca đêm cho chi nhánh Long An — gấp` },
    { chip: "BẢO TRÌ", icon: Wrench, text: `Phòng 308, 412 đang bảo trì · dự kiến hoàn thành 18:00 hôm nay` },
    { chip: "MENU", icon: Compass, text: `Buffet sáng hôm nay: 280 khách · menu Châu Âu + Á` },
    { chip: "ĐÁNH GIÁ", icon: Star, text: `Khách Lê Hoa vừa để lại đánh giá 5⭐: \"Dịch vụ tuyệt vời, phòng sạch đẹp\"` },
    { chip: "CẢNH BÁO", icon: AlertCircle, text: `Tỷ lệ hủy phòng tuần này: 4.8% · trong ngưỡng cho phép` },
  ]), [data]);

  return (
    <div className="max-w-[1240px] mx-auto pb-12 sm:pb-16 px-1 sm:px-0">

      {/* ── 1. HERO ───────────────────────────────────────── */}
      <PageHero
        eyebrow="Dashboard · Tổng quan"
        title="Chủ đầu tư"
        subtitle="Theo dõi toàn bộ hoạt động khách sạn thời gian thực — số liệu, cảnh báo, cơ hội."
        live
        meta={[
          { label: "Chốt ngày", value: TODAY },
          { label: "Chi nhánh", value: "4" },
          { label: "Phòng", value: data.totalRooms },
          { label: "Công suất", value: `${data.occupancy}%` },
        ]}
        actions={null}
      />

      {/* ── 2. MARQUEE ────────────────────────────────────── */}
      <MarqueeStrip items={marqueeItems} speed={70} tone="blue" className="mt-3" />

      {/* ── 3. RANGE FILTER + ACTIONS ─────────────────────── */}
      <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex bg-white border border-ink-200 rounded-full p-1 shadow-sm">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-5 py-1.5 text-[12px] font-semibold rounded-full transition ${
                range === d ? "bg-blue-800 text-white shadow-sm" : "text-ink-700 hover:text-blue-700"
              }`}
            >
              {d} ngày
            </button>
          ))}
        </div>
        <Link
          to="/reports/detail"
          className="px-4 py-2 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[12.5px] font-semibold hover:bg-blue-100 transition flex items-center gap-2"
        >
          Báo cáo chi tiết <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── 4. KPI LỚN ────────────────────────────────────── */}
      <SectionHeader icon={Percent} label="KPI tổng quan" sub="Số liệu hiệu suất chính" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPIBig
          label="Công suất"
          value={`${data.occupancy}%`}
          sub={`${data.occupied} / ${data.totalRooms} phòng · ${data.occupied > 0 ? "trên đà tăng" : ""}`}
          dotColor="bg-emerald-500"
          icon={BedDouble}
          accent="emerald"
          trend={{ value: 5.2, label: "so với kỳ trước" }}
        />
        <KPIBig
          label="ADR / RevPAR"
          value={`${formatVND(data.adr)} · ${formatVND(data.revpar)}`}
          sub="Giá bán phòng trung bình · Doanh thu mỗi phòng khả dụng"
          dotColor="bg-blue-600"
          icon={Wallet}
          accent="blue"
          trend={{ value: 3.8, label: "so với kỳ trước" }}
        />
      </div>

      {/* ── 5. STRIP 5 CHỈ SỐ ─────────────────────────────── */}
      <SectionHeader icon={Activity} label="Chỉ số nhanh" sub={`Trong ${range} ngày gần nhất`} />
      <div className="bg-white border border-ink-200 rounded-md py-4 sm:py-5 px-2 grid grid-cols-2 md:grid-cols-5 gap-y-4 items-stretch">
        <div className="md:border-r md:border-ink-100"><StripMetric value={formatVND(data.revToday)}  label="Doanh thu hôm nay" dotColor="bg-violet-500" icon={Wallet} /></div>
        <div className="md:border-r md:border-ink-100"><StripMetric value={formatVND(data.revMTD)}     label="MTD"               dotColor="bg-amber-500"  icon={Wallet} /></div>
        <div className="md:border-r md:border-ink-100"><StripMetric value={formatVND(data.revYTD)}     label="YTD"               dotColor="bg-blue-600"   icon={TrendingUp} /></div>
        <div className="md:border-r md:border-ink-100"><StripMetric value={`${data.cancelRate}%`}      label="Tỷ lệ hủy"         dotColor="bg-rose-500"   icon={Hourglass} /></div>
        <div><StripMetric value={`${data.repeatGuest}%`}    label="Khách quay lại"    dotColor="bg-emerald-500" icon={Users} last /></div>
      </div>

      {/* ── 6. OCCUPANCY GAUGE + QUICK ACTIONS ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6 sm:mt-9">
        <div className="lg:col-span-2">
          <SectionHeader icon={BedDouble} label="Công suất thời gian thực" sub="Hiện tại · so với mục tiêu" />
          <Card>
            <OccupancyGauge value={data.occupancy} total={data.totalRooms} occupied={data.occupied} />
          </Card>
        </div>
        <div>
          <SectionHeader icon={Sparkles} label="Thao tác nhanh" sub="Truy cập 1 chạm" />
          <QuickActions actions={data.quickActions} />
        </div>
      </div>

      {/* ── 7. VẬN HÀNH PHÒNG ─────────────────────────────── */}
      <SectionHeader icon={LogIn} label="Vận hành phòng" sub="Trạng thái & số liệu theo thời gian thực" />
      <OperationsGrid data={data} />

      {/* ── 8. DOANH THU ──────────────────────────────────── */}
      <SectionHeader
        icon={Wallet}
        label="Doanh thu"
        sub="Theo dõi dòng tiền vào theo ngày"
        right={<Badge tone="blue">{range} ngày qua</Badge>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPIAccent label="Doanh thu hôm nay" value={formatVND(data.revToday)} accent="violet" icon={Wallet} sub="So với hôm qua" />
        <KPIAccent label={`${range} ngày gần nhất`} value={formatVND(data.revMonth)} accent="blue" icon={TrendingUp} sub={`+${data.revMonthGrowth}%`} />
        <KPIAccent label="Công nợ phải thu" value={formatVND(data.receivable)} accent="amber" icon={Hourglass} sub="Đến hạn trong 7 ngày" />
      </div>
      <div className="mt-4">
        <Card title="Doanh thu thực tế 30 ngày qua" subtitle="VNĐ" icon={Wallet} accent="blue">
          <div className="h-48 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyRevenue} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#0c91e9" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0c91e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" vertical={false} />
                <XAxis dataKey="day" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatVNDFull(v)} />
                <Area type="monotone" dataKey="v" stroke="#0c91e9" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── 9. CƠ CẤU + CHANNEL MIX ───────────────────────── */}
      <SectionHeader icon={Layers} label="Cơ cấu doanh thu & Kênh bán" sub="Phân bổ theo nguồn thu" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card title="Cơ cấu doanh thu" subtitle="Tỷ trọng nguồn thu tháng" icon={Wallet} accent="blue" className="lg:col-span-2">
          <div className="flex flex-col h-full">
            <div className="relative h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.mix} innerRadius={62} outerRadius={92} paddingAngle={2}
                       dataKey="value" cornerRadius={4} stroke="#fff" strokeWidth={2}
                       startAngle={90} endAngle={-270}>
                    {data.mix.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatVNDFull(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-[9px] uppercase tracking-[0.18em] text-ink-500 font-bold">Tổng DT</div>
                <div className="text-[20px] font-display font-bold text-ink-900 tabular-nums mt-0.5 leading-none">
                  {formatVND(data.revMonth)}
                </div>
                <div className="text-[10px] text-ink-500 mt-1 font-semibold tabular-nums">5 nguồn</div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-ink-100 space-y-2">
              {data.mix.map((m) => (
                <div key={m.name} className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: m.color }} />
                  <span className="text-[12px] text-ink-700 font-semibold flex-1 truncate">{m.name}</span>
                  <div className="w-16 h-1.5 bg-ink-100 rounded-full overflow-hidden shrink-0">
                    <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                  </div>
                  <span className="text-[11.5px] font-bold text-ink-900 tabular-nums w-10 text-right shrink-0">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <ChannelMix items={data.channelMix} className="lg:col-span-3" />
      </div>

      {/* ── 10. TÀI CHÍNH ─────────────────────────────────── */}
      <SectionHeader icon={Wallet} label="Tài chính" sub="Chi phí · lợi nhuận · công nợ" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <KPIAccent label="Tổng chi phí"    value={formatVND(data.cost)}    accent="ink"     icon={Hourglass} sub={`${data.costRatio}% doanh thu`} />
        <KPIAccent label="Lợi nhuận ròng"  value={formatVND(data.profit)}  accent="emerald" icon={TrendingUp} sub={`Biên LN ${data.profitMargin}%`} />
        <KPIAccent label="Công nợ"          value={formatVND(data.debt)}    accent="rose"    icon={Hourglass} sub="3 khách quá hạn" />
        <KPIAccent label="Trả trước"        value={formatVND(data.prepaid)} accent="blue"    icon={CreditCard} sub="Đã thu" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3 sm:mt-4">
        <Card className="lg:col-span-2" title="Chi phí theo tháng" subtitle="Tỷ VNĐ" icon={BarChart3} accent="violet">
          <div className="h-44 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.costByMonth} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" vertical={false} />
                <XAxis dataKey="m" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}tỷ`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="v" fill="#8b5cf6" radius={[3, 3, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Top công nợ" subtitle="Quá hạn thanh toán" icon={Hourglass} accent="rose">
          <ul className="space-y-2.5">
            {data.debtors.map((d) => (
              <li key={d.name} className="flex items-center justify-between gap-2 text-[12px] pb-2.5 border-b border-ink-100 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <div className="font-semibold text-ink-900 truncate">{d.name}</div>
                  <div className="text-ink-500 text-[10px]">{d.days} ngày quá hạn</div>
                </div>
                <div className="font-bold tabular-nums shrink-0">{formatVND(d.amount)}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ── 11. TOP ROOMS + STAFF SHIFT ────────────────────── */}
      <SectionHeader icon={Star} label="Hiệu suất chi tiết" sub="Top phòng bán chạy & nhân sự theo ca" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopRooms items={data.topRooms} />
        <StaffShift items={data.staffShift} />
      </div>

      {/* ── 12. TRẠNG THÁI PHÒNG THEO LOẠI ────────────────── */}
      <SectionHeader icon={Layers} label="Trạng thái phòng theo loại" sub="Phân bổ theo hạng phòng" />
      <Card title="Phân bổ phòng theo hạng" subtitle="Stacked: Có khách · Trống · OOO" icon={BedDouble} accent="violet">
        <div className="h-48 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byRoomType} layout="vertical" barCategoryGap={10} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" horizontal={false} />
              <XAxis type="number" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#67738b" fontSize={11} tickLine={false} axisLine={false} width={104} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} iconType="circle" />
              <Bar dataKey="occupied" stackId="a" fill="#8b5cf6" name="Có khách" />
              <Bar dataKey="vacant"   stackId="a" fill="#10b981" name="Trống" />
              <Bar dataKey="ooo"      stackId="a" fill="#f43f5e" name="OOO" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── 13. DỰ BÁO 14 NGÀY ────────────────────────────── */}
      <SectionHeader icon={TrendingUp} label="Dự báo 14 ngày tới" sub="Công suất & doanh thu tiềm năng" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card title="Công suất dự báo (%)" icon={TrendingUp} accent="blue"
          right={<Badge tone="emerald"><TrendingUp className="w-3 h-3" /> +12.4%</Badge>}>
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.forecast14} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" vertical={false} />
                <XAxis dataKey="d" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} domain={[40, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="v" stroke="#0c91e9" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Doanh thu tiềm năng (triệu / ngày)" icon={Wallet} accent="emerald">
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.forecast14} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" vertical={false} />
                <XAxis dataKey="d" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="r" fill="#10b981" radius={[3, 3, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── 14. DÒNG TIỀN DỰ KIẾN ─────────────────────────── */}
      <SectionHeader icon={Activity} label="Dòng tiền dự kiến" sub="Lũy kế (area) vs Hằng ngày (bar)" />
      <Card title="Dòng tiền 14 ngày tới" subtitle="Triệu VNĐ" icon={TrendingUp} accent="cyan">
        <div className="h-48 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.cashflow} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="cum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#0c91e9" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0c91e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" vertical={false} />
              <XAxis dataKey="d" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" stroke="#0c91e9" fontSize={10} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}tỷ`} />
              <YAxis yAxisId="r" orientation="right" stroke="#10b981" fontSize={10} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Area yAxisId="l" type="monotone" dataKey="cum" stroke="#0c91e9" strokeWidth={2} fill="url(#cum)" name="Lũy kế" />
              <Bar  yAxisId="r" dataKey="day" fill="#10b981" radius={[2, 2, 0, 0]} barSize={10} name="Hằng ngày" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── 15. BẢNG DỰ BÁO CHI TIẾT ─────────────────────── */}
      <SectionHeader icon={CalendarCheck} label="Bảng dự báo chi tiết" sub="14 ngày tới · từng ngày" />
      <Card className="p-0" title="Dự báo chi tiết" subtitle="Sắp xếp theo ngày" icon={CalendarCheck} accent="blue">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-ink-500 uppercase tracking-wider text-[10px] bg-ink-50">
                <th className="px-5 py-3 font-semibold">Ngày</th>
                <th className="px-5 py-3 font-semibold">Công suất</th>
                <th className="px-5 py-3 font-semibold">Đã đạt / Tổng</th>
                <th className="px-5 py-3 font-semibold text-right">Doanh thu tiềm năng</th>
              </tr>
            </thead>
            <tbody>
              {data.forecastTable.map((r, i) => (
                <tr key={r.d} className={`border-t border-ink-100 ${i % 2 ? "bg-ink-50/40" : ""}`}>
                  <td className="px-5 py-3 font-semibold text-ink-900 tabular-nums">{r.d}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${r.occ >= 80 ? "bg-emerald-500" : r.occ >= 60 ? "bg-amber-500" : "bg-rose-500"}`} />
                      <span className="tabular-nums font-semibold">{r.occ}%</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 tabular-nums text-ink-700">{r.booked}/{r.total} phòng</td>
                  <td className="px-5 py-3 text-right font-bold tabular-nums">{formatVND(r.rev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 16. REVIEW FEED + ACTIVITY TIMELINE ───────────── */}
      <SectionHeader icon={MessageSquare} label="Khách hàng & Hoạt động" sub="Đánh giá mới & live feed" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReviewFeed items={data.reviews} />
        <ActivityTimeline items={data.activity} />
      </div>

      {/* ── 17. CẢNH BÁO & CƠ HỘI ────────────────────────── */}
      <SectionHeader icon={Bell} label="Cảnh báo & Cơ hội" sub="Gợi ý hành động ưu tiên" count={data.alerts.length} />
      <div className="space-y-2.5">
        {data.alerts.map((a, i) => {
          const isWarn = a.level === "warning";
          const isInfo = a.level === "info";
          const ring = isWarn ? "border-l-amber-500" : isInfo ? "border-l-blue-500" : "border-l-rose-500";
          return (
            <div key={i} className={`bg-white border border-ink-200 border-l-4 ${ring} rounded-md px-3 py-2.5 sm:px-4 sm:py-3 flex items-start gap-3`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-ink-900">{a.title}</span>
                  <Badge tone={isWarn ? "amber" : isInfo ? "blue" : "rose"}>
                    {isWarn ? "Warning" : isInfo ? "Info" : "Critical"}
                  </Badge>
                </div>
                <div className="text-[12px] text-ink-700 mt-0.5">{a.desc}</div>
                <div className="text-[12px] text-blue-700 italic mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {a.action}
                </div>
                <div className="text-[10px] text-ink-400 mt-1.5 flex items-center gap-1.5">
                  <Bell className="w-3 h-3" />
                  Ngày mục tiêu: {a.target}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
        <Layers className="w-3 h-3" />
        Số liệu minh họa · Cập nhật liên tục · Nguồn: PMS · {data.lastSync}
      </div>
    </div>
  );
}

/* ───── dataset ───── */

function buildData(range) {
  const totalRooms = 248;
  const occupied = Math.round(totalRooms * 0.78);
  const inHouse = occupied;
  const vacant = Math.round(totalRooms * 0.12);
  const dirty = 6;
  const cleaning = 4;
  const ready = vacant;
  const ooo = 4;
  const revToday = 612_000_000;
  const revMTD = 18_450_000_000;
  const revYTD = 142_300_000_000;
  const cancelRate = 4.8;
  const repeatGuest = 38;
  const adr = 2_350_000;
  const revpar = Math.round(adr * 0.78);
  const revMonth = revMTD;
  const revMonthGrowth = 12.4;
  const receivable = 3_120_000_000;
  const cost = 8_420_000_000;
  const costRatio = Math.round((cost / revMonth) * 100);
  const profit = revMonth - cost;
  const profitMargin = Math.round((profit / revMonth) * 100);
  const debt = 2_180_000_000;
  const prepaid = 1_640_000_000;

  const dailyRevenue = Array.from({ length: range }, (_, i) => ({
    day: `${i + 1}`,
    v: Math.round(450_000_000 + Math.sin(i / 3) * 80_000_000 + (i % 7 === 5 ? 90_000_000 : 0)),
  }));

  const mix = [
    { name: "Phòng",         value: Math.round(revMonth * 0.62), color: "#0c91e9" },
    { name: "F&B",           value: Math.round(revMonth * 0.22), color: "#8b5cf6" },
    { name: "Spa & Wellness",value: Math.round(revMonth * 0.07), color: "#10b981" },
    { name: "Sự kiện",       value: Math.round(revMonth * 0.05), color: "#f59e0b" },
    { name: "Khác",          value: Math.round(revMonth * 0.04), color: "#f43f5e" },
  ];
  mix.forEach((m) => { m.pct = Math.round((m.value / revMonth) * 100); });

  const costByMonth = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"].map((m, i) => ({
    m, v: 5 + Math.sin(i / 2) * 1.5 + (i % 4 === 0 ? 1 : 0),
  }));

  const byRoomType = [
    { name: "Standard",     occupied: 42, vacant: 12, ooo: 1 },
    { name: "Superior",     occupied: 28, vacant: 8,  ooo: 1 },
    { name: "Deluxe",       occupied: 22, vacant: 6,  ooo: 1 },
    { name: "Suite",        occupied: 9,  vacant: 3,  ooo: 0 },
    { name: "Executive",    occupied: 5,  vacant: 2,  ooo: 0 },
    { name: "Presidential", occupied: 1,  vacant: 1,  ooo: 0 },
  ];

  const forecast14 = Array.from({ length: 14 }, (_, i) => {
    const occ = Math.round(62 + Math.sin(i / 1.6) * 14 + i * 0.6);
    const r = Math.round(280 + Math.cos(i / 2) * 60 + i * 4);
    return { d: `${i + 1}`, v: Math.min(98, Math.max(40, occ)), r };
  });
  const forecastTable = forecast14.map((f, i) => {
    const occ = f.v;
    const total = totalRooms;
    const booked = Math.round(total * (occ / 100));
    const rev = f.r * 2_350_000;
    const dayLabel = new Date(2026, 6, 29 + i);
    const dStr = `${String(dayLabel.getDate()).padStart(2, "0")}/${String(dayLabel.getMonth() + 1).padStart(2, "0")}`;
    return { d: dStr, occ, booked, total, rev };
  });

  const cashflow = Array.from({ length: 14 }, (_, i) => {
    const day = 380 + Math.round(Math.sin(i / 2) * 80) + i * 5;
    return {
      d: `${i + 1}`,
      day,
      cum: Math.round(380 * (i + 1) + (i / 14) * 1200),
    };
  });

  const debtors = [
    { name: "Cty TNHH ABC Travel", days: 28, amount: 420_000_000 },
    { name: "Đoàn công ty VNG",     days: 14, amount: 380_000_000 },
    { name: "Khách đoàn Hàn Quốc",  days: 9,  amount: 250_000_000 },
    { name: "Booking.com Thanh toán",days: 5, amount: 180_000_000 },
    { name: "Cty Đại lý Tây Ninh",  days: 3,  amount: 120_000_000 },
  ];

  const alerts = [
    {
      level: "warning",
      title: "Công suất tuần sau dưới mục tiêu",
      desc: "Trung bình 62% trong khi KPI là 78% — ảnh hưởng ~320tr doanh thu.",
      action: "Mở flash-sale 2 ngày & chạy ads OTA",
      target: "30/07/2026",
    },
    {
      level: "info",
      title: "Cơ hội upsell Suite",
      desc: "12 phòng Suite đang trống cuối tuần — nhu cầu cao từ phân khúc corporate.",
      action: "Gửi offer cho 240 khách doanh nghiệp",
      target: "01/08/2026",
    },
    {
      level: "warning",
      title: "Phòng OOO tăng nhẹ",
      desc: "Phòng OOO tăng 2 phòng vs tuần trước, chủ yếu tại Hồ Tràm.",
      action: "Lên lịch bảo trì & cập nhật kênh OTA",
      target: "02/08/2026",
    },
    {
      level: "info",
      title: "Khách quay lại vượt KPI",
      desc: "Tỷ lệ repeat 38% (KPIs: 30%) — ưu đãi thành viên đang phát huy.",
      action: "Đẩy chiến dịch loyalty cho nhóm VIP",
      target: "15/08/2026",
    },
  ];

  const channelMix = [
    { name: "Booking.com", color: "#0c91e9",  bookings: 142, revenue: 4_820_000_000, pct: 36 },
    { name: "Agoda",       color: "#8b5cf6",  bookings: 98,  revenue: 3_120_000_000, pct: 25 },
    { name: "Walk-in",     color: "#10b981",  bookings: 64,  revenue: 1_980_000_000, pct: 16 },
    { name: "Website",     color: "#f59e0b",  bookings: 52,  revenue: 1_640_000_000, pct: 13 },
    { name: "Traveloka",   color: "#f43f5e",  bookings: 28,  revenue: 920_000_000,   pct: 7 },
    { name: "Đại lý",      color: "#06b6d4",  bookings: 12,  revenue: 440_000_000,   pct: 3 },
  ];

  const staffShift = [
    { shift: "Ca sáng",   time: "06:00 - 14:00", count: 42, label: "lễ tân + buồng", fill: 95 },
    { shift: "Ca chiều",  time: "14:00 - 22:00", count: 36, label: "lễ tân + F&B",   fill: 82 },
    { shift: "Ca đêm",    time: "22:00 - 06:00", count: 14, label: "an ninh + trực",  fill: 88 },
    { shift: "Quản lý",   time: "08:00 - 17:00", count: 8,  label: "cấp cao",         fill: 100 },
  ];

  const topRooms = [
    { name: "ROOM 1205 — Deluxe Sea View", type: "DLX", branch: "Hồ Tràm",     revenue: 84_500_000, growth: 28 },
    { name: "ROOM 0803 — Presidential",    type: "PRE", branch: "Hồ Tràm",     revenue: 76_200_000, growth: 22 },
    { name: "ROOM 0501 — Executive Suite", type: "EXE", branch: "Đức Hòa",     revenue: 58_400_000, growth: 18 },
    { name: "ROOM 0412 — Superior Garden", type: "SUP", branch: "Tây Ninh",    revenue: 32_800_000, growth: 12 },
    { name: "ROOM 0702 — Suite",          type: "STE", branch: "Long An",      revenue: 28_200_000, growth: 8  },
  ];

  const reviews = [
    { name: "Nguyễn Minh Khôi", source: "Booking.com", branch: "Hồ Tràm", date: "12 phút trước", rating: 5, text: "Phòng rộng, view biển tuyệt đẹp. Nhân viên nhiệt tình, ăn sáng ngon." },
    { name: "Lê Hoa Phương",   source: "Agoda",       branch: "Đức Hòa",  date: "1 giờ trước",   rating: 5, text: "Khu nghỉ dưỡng yên tĩnh, phòng sạch đẹp. Sẽ quay lại!" },
    { name: "Trần Văn Nam",     source: "Walk-in",     branch: "Long An",   date: "3 giờ trước",   rating: 4, text: "Vị trí trung tâm, dễ di chuyển. Phòng hơi nhỏ nhưng ổn." },
    { name: "Phạm Thị Lan",     source: "Website",     branch: "Tây Ninh", date: "5 giờ trước",   rating: 5, text: "Dịch vụ spa rất tốt, nhân viên chuyên nghiệp. Highly recommend." },
    { name: "Đỗ Quang Huy",     source: "Traveloka",   branch: "Hồ Tràm",  date: "Hôm qua",       rating: 4, text: "Buffet sáng đa dạng, hồ bơi đẹp. Giá hơi cao dịp lễ." },
  ];

  const activity = [
    { type: "checkin", title: "Check-in phòng 1205", desc: "Nguyễn Văn A · Deluxe Sea View · 3 đêm", time: "Vừa xong" },
    { type: "booking", title: "Booking mới từ Booking.com", desc: "Đoàn 12 phòng · 28/07 - 02/08 · 156tr", time: "3 phút" },
    { type: "review",  title: "Đánh giá 5⭐ mới", desc: "Nguyễn Minh K. · \"Dịch vụ tuyệt vời\"", time: "12 phút" },
    { type: "payment", title: "Thanh toán 24.5tr", desc: "Cty VNG · checkout đoàn · 14 phòng", time: "18 phút" },
    { type: "staff",   title: "Ca sáng đã sẵn sàng", desc: "42 nhân viên check-in · lễ tân + buồng", time: "42 phút" },
    { type: "issue",   title: "Bảo trì P.412", desc: "Điều hòa hỏng · dự kiến 18:00 · Hồ Tràm", time: "1 giờ" },
    { type: "review",  title: "Đánh giá 4⭐", desc: "Trần Văn N. · \"Phòng hơi nhỏ nhưng ổn\"", time: "1 giờ" },
  ];

  const quickActions = [
    { icon: LogIn,            label: "Check-in nhanh",       sub: "Quét QR / nhập CCCD",   tone: "blue" },
    { icon: CalendarCheck,    label: "Đặt phòng mới",        sub: "Tạo booking thủ công",  tone: "emerald" },
    { icon: Users,            label: "Thêm khách",           sub: "Walk-in / VIP",          tone: "amber" },
    { icon: Wrench,           label: "Tạo phiếu kỹ thuật",  sub: "Bảo trì / sửa chữa",    tone: "rose" },
    { icon: Star,             label: "Gửi đánh giá",         sub: "Yêu cầu qua email",     tone: "violet" },
    { icon: Coffee,           label: "Order F&B",            sub: "Từ phòng hoặc nhà hàng",tone: "cyan" },
  ];

  const lastSync = "28/07 09:24 · 12 giây trước";

  return {
    totalRooms, occupied,
    occupancy: Math.round((occupied / totalRooms) * 100),
    adr, revpar,
    revToday, revMTD, revYTD,
    cancelRate, repeatGuest,
    checkIns: 86, checkInsDelta: 12,
    checkOuts: 64, checkOutsDelta: 9,
    inHouse, vacant, dirty, cleaning, ready, ooo,
    revMonth, revMonthGrowth, receivable,
    cost, costRatio, profit, profitMargin,
    debt, prepaid,
    dailyRevenue, mix, costByMonth, byRoomType,
    forecast14, forecastTable, cashflow,
    debtors, alerts,
    channelMix, staffShift, topRooms, reviews, activity, quickActions,
    lastSync,
  };
}
