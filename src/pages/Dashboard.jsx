import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icons } from "../components/Icons";
import { formatVND, formatVNDFull } from "../utils/format";
import MarqueeStrip from "../components/MarqueeStrip";
import PageHero, {
  SectionHeader, Card, Badge, HeroActions, Modal, ModalRow, useChartPalette,
} from "../components/DashboardPrimitives";
import {
  KPIBig, KPIAccent, StripMetric, OccupancyGauge, MiniBar,
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

/* Trục & lưới biểu đồ — dựng từ palette theo theme thay vì hex cứng.
   Trước đây lưới là #eceef2 (gần trắng) nên ở dark mode thành vạch chói. */
const axisProps = (p) => ({
  stroke: p["fg-muted"],
  fontSize: 10,
  tickLine: false,
  axisLine: false,
});
const gridProps = (p) => ({ strokeDasharray: "3 6", stroke: p["border-soft"] });
const tooltipStyleOf = (p) => ({
  background: p.surface,
  border: `1px solid ${p.border}`,
  borderRadius: 8,
  fontSize: 12,
  color: p.fg,
  padding: "8px 12px",
  boxShadow: "0 10px 30px rgba(0,0,0,.18)",
});

/* ───── Notes: các UI primitives (Card, Badge, KPIBig, KPIAccent, StripMetric,
       StatusCell, OccupancyGauge, SectionHeader...) đã được tách ra
       DashboardPrimitives.jsx & DashboardKPIs.jsx. Phần này giữ cho file
       tập trung vào composition + data. ───── */

const TODAY = "28/07/2026";

/* Mục lục nhảy nhanh — trang có 17 khối, cuộn thẳng một mạch rất khó định vị */
const SECTIONS = [
  { id: "sec-kpi",      label: "Tổng quan" },
  { id: "sec-ops",      label: "Vận hành" },
  { id: "sec-finance",  label: "Tài chính" },
  { id: "sec-forecast", label: "Dự báo" },
  { id: "sec-alerts",   label: "Cảnh báo" },
];

/* ───── Page ───── */

export default function Dashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState(30);
  const p = useChartPalette();
  const axis = axisProps(p);
  const grid = gridProps(p);
  const tooltipStyle = tooltipStyleOf(p);
  const data = useMemo(() => buildData(range, p), [range, p]);

  /* ── Trạng thái tương tác ── */
  const [modal, setModal] = useState(null);        // khoá của hộp thoại đang mở
  const [detail, setDetail] = useState(null);      // bản ghi đang xem chi tiết
  const [refreshing, setRefreshing] = useState(false);
  const [syncedAt, setSyncedAt] = useState(data.lastSync);
  const [toast, setToast] = useState(null);
  const [doneKeys, setDoneKeys] = useState([]);    // các mục đã xử lý (check-in, gửi mail…)
  const [resolvedAlerts, setResolvedAlerts] = useState([]);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const markDone = useCallback((key, msg) => {
    setDoneKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    notify(msg);
  }, [notify]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setSyncedAt(`28/07 ${hh}:${mm} · vừa xong`);
      setRefreshing(false);
      notify("Đã đồng bộ lại số liệu từ PMS");
    }, 900);
  }, [notify]);

  const closeModal = useCallback(() => { setModal(null); setDetail(null); }, []);

  /* Scroll-spy: lấy section cuối cùng đã vượt qua vạch mốc.
     Tính trực tiếp thay vì IntersectionObserver — observer bỏ sót khi người dùng
     nhảy nhanh qua nhiều section cùng lúc. */
  const [activeSec, setActiveSec] = useState(SECTIONS[0].id);
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const line = 150; // ngay dưới topbar (60) + thanh mục lục
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActiveSec(current);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goSection = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

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
        title="Dash Board"
        subtitle="Theo dõi toàn bộ hoạt động khách sạn thời gian thực — số liệu, cảnh báo, cơ hội."
        live
        meta={[
          { label: "Chốt ngày", value: TODAY },
          { label: "Chi nhánh", value: "4" },
          { label: "Phòng", value: data.totalRooms },
          { label: "Công suất", value: `${data.occupancy}%` },
        ]}
        actions={
          <HeroActions
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onExport={() => setModal("export")}
            onExpand={() => navigate("/reports")}
          />
        }
      />

      {/* ── 2. MARQUEE ────────────────────────────────────── */}
      <MarqueeStrip items={marqueeItems} speed={70} tone="blue" className="mt-3" />

      {/* ── 3. RANGE FILTER + ACTIONS ─────────────────────── */}
      {/* ── MỤC LỤC DÍNH ──────────────────────────────────── */}
      <nav
        aria-label="Mục lục dashboard"
        className="sticky top-[60px] z-20 -mx-1 sm:mx-0 mt-3 px-1 sm:px-0 py-2 border-b backdrop-blur-md"
        style={{
          backgroundColor: "color-mix(in oklab, var(--bg-app) 88%, transparent)",
          borderColor: "var(--border-soft)",
        }}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {SECTIONS.map((s) => {
            const on = activeSec === s.id;
            return (
              <button
                key={s.id}
                onClick={() => goSection(s.id)}
                aria-current={on ? "true" : undefined}
                className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition active:scale-95"
                style={
                  on
                    ? { backgroundColor: "var(--accent)", color: "var(--on-accent)" }
                    : { color: "var(--fg-muted)", backgroundColor: "var(--surface)", border: "1px solid var(--border)" }
                }
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <div
          className="inline-flex rounded-full p-1 border shadow-sm"
          role="group"
          aria-label="Khoảng thời gian"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              aria-pressed={range === d}
              className="px-4 sm:px-5 py-1.5 text-[12px] font-semibold rounded-full transition active:scale-95"
              style={
                range === d
                  ? { backgroundColor: "var(--accent)", color: "var(--on-accent)" }
                  : { color: "var(--fg-muted)" }
              }
            >
              {d} ngày
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setModal("opslog")}
            className="px-3 py-2 rounded-md border text-[12.5px] font-semibold transition active:scale-95 flex items-center gap-1.5"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}
          >
            <Clock className="w-4 h-4" /> Nhật ký
          </button>
          <Link
            to="/reports/detail"
            className="px-4 py-2 rounded-md text-[12.5px] font-semibold transition active:scale-95 flex items-center gap-2"
            style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)", border: "1px solid color-mix(in oklab, var(--accent) 30%, transparent)" }}
          >
            Báo cáo chi tiết <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── 4. KPI LỚN ────────────────────────────────────── */}
      <SectionHeader id="sec-kpi" icon={Percent} label="KPI tổng quan" sub="Số liệu hiệu suất chính" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPIBig
          label="Công suất"
          value={`${data.occupancy}%`}
          sub={`${data.occupied} / ${data.totalRooms} phòng · trên đà tăng`}
          icon={BedDouble}
          accent="emerald"
          trend={{ value: 5.2, label: "so với kỳ trước" }}
        />
        <KPIBig
          label="ADR / RevPAR"
          value={`${formatVND(data.adr)} · ${formatVND(data.revpar)}`}
          sub="Giá bán phòng trung bình · Doanh thu mỗi phòng khả dụng"
          icon={Wallet}
          accent="blue"
          trend={{ value: 3.8, label: "so với kỳ trước" }}
        />
      </div>

      {/* ── 5. STRIP 5 CHỈ SỐ ─────────────────────────────── */}
      <SectionHeader icon={Activity} label="Chỉ số nhanh" sub={`Trong ${range} ngày gần nhất`} />
      <div className="bg-white border border-ink-200 rounded-md py-4 sm:py-5 px-2 grid grid-cols-2 md:grid-cols-5 gap-y-4 items-stretch">
        <div className="md:border-r md:border-ink-100"><StripMetric value={formatVND(data.revToday)}  label="Doanh thu hôm nay" tone="violet"  icon={Wallet} /></div>
        <div className="md:border-r md:border-ink-100"><StripMetric value={formatVND(data.revMTD)}     label="MTD"               tone="amber"   icon={Wallet} /></div>
        <div className="md:border-r md:border-ink-100"><StripMetric value={formatVND(data.revYTD)}     label="YTD"               tone="blue"    icon={TrendingUp} /></div>
        <div className="md:border-r md:border-ink-100"><StripMetric value={`${data.cancelRate}%`}      label="Tỷ lệ hủy"         tone="rose"    icon={Hourglass} /></div>
        <div><StripMetric value={`${data.repeatGuest}%`}    label="Khách quay lại"    tone="emerald" icon={Users} last /></div>
      </div>

      {/* ── 6. OCCUPANCY GAUGE + QUICK ACTIONS ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6 sm:mt-9">
        <div className="lg:col-span-2">
          <SectionHeader icon={BedDouble} label="Công suất thời gian thực" sub="Hiện tại · so với mục tiêu" />
          <Card>
            <OccupancyGauge total={data.totalRooms} occupied={data.occupied} />

            {/* Lấp phần trống dưới đồng hồ: xu hướng 7 ngày + tách theo chi nhánh */}
            <div className="mt-4 pt-4 border-t border-ink-100 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold mb-2">
                  Xu hướng 7 ngày
                </div>
                <div className="h-[76px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.occ7d} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <defs>
                        <linearGradient id="occ7" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={p.accent} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={p.accent} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="d" {...axis} fontSize={9} />
                      <YAxis {...axis} width={28} domain={[50, 95]} hide />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                      <Area type="monotone" dataKey="v" stroke={p.accent} strokeWidth={2} fill="url(#occ7)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold mb-2">
                  Theo chi nhánh
                </div>
                <div className="space-y-2">
                  {data.occByBranch.map((b) => (
                    <div key={b.code} className="flex items-center gap-2.5">
                      <span
                        className="w-7 h-5 rounded text-[9px] font-bold flex items-center justify-center shrink-0 tabular-nums"
                        style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)" }}
                      >
                        {b.code}
                      </span>
                      <span className="text-[11.5px] text-ink-700 truncate flex-1 min-w-0">{b.name}</span>
                      <div className="w-16 shrink-0">
                        <MiniBar
                          value={b.occ}
                          tone={b.occ >= 80 ? "emerald" : b.occ >= 65 ? "amber" : "rose"}
                          height="h-1.5"
                        />
                      </div>
                      <span className="text-[11px] font-bold tabular-nums w-8 text-right shrink-0">{b.occ}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div>
          <SectionHeader icon={Sparkles} label="Thao tác nhanh" sub="Bấm để mở danh sách xử lý" />
          <Card>
            <QuickActions actions={data.quickActions} onAction={setModal} bare />
          </Card>
        </div>
      </div>

      {/* ── 7. VẬN HÀNH PHÒNG ─────────────────────────────── */}
      <SectionHeader id="sec-ops" icon={LogIn} label="Vận hành phòng" sub="Trạng thái & số liệu theo thời gian thực" />
      <OperationsGrid data={{ ...data, lastSync: syncedAt }} onOpenLog={() => setModal("opslog")} />

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
                    <stop offset="0%"   stopColor={p.accent} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={p.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="day" {...axis} />
                <YAxis {...axis} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatVNDFull(v)} />
                <Area type="monotone" dataKey="v" stroke={p.accent} strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── 9. CƠ CẤU + CHANNEL MIX ───────────────────────── */}
      <SectionHeader icon={Layers} label="Cơ cấu doanh thu & Kênh bán" sub="Phân bổ theo nguồn thu" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex flex-col h-full">
            <div className="relative h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.mix} innerRadius={62} outerRadius={92} paddingAngle={2}
                       dataKey="value" cornerRadius={4} stroke={p.surface} strokeWidth={2}
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
      <SectionHeader id="sec-finance" icon={Wallet} label="Tài chính" sub="Chi phí · lợi nhuận · công nợ" />
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
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="m" {...axis} />
                <YAxis {...axis} tickFormatter={(v) => `${v}tỷ`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="v" fill={p.highlight} radius={[3, 3, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Top công nợ" subtitle="Quá hạn · bấm để nhắc thu" icon={Hourglass} accent="rose">
          <ul className="space-y-1">
            {data.debtors.map((d) => {
              const done = doneKeys.includes(`debt-${d.name}`);
              return (
                <li key={d.name}>
                  <button
                    onClick={() => markDone(`debt-${d.name}`, `Đã gửi nhắc thu công nợ tới ${d.name}`)}
                    disabled={done}
                    className="w-full text-left flex items-center justify-between gap-2 text-[12px] py-2 px-1.5 -mx-1.5 rounded-md border-b border-ink-100 last:border-0 hover:bg-ink-50 transition active:scale-[.99] disabled:opacity-55"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-ink-900 truncate">{d.name}</div>
                      <div className="text-ink-500 text-[10px]">
                        {done ? "Đã gửi nhắc thu" : `${d.days} ngày quá hạn · bấm để nhắc`}
                      </div>
                    </div>
                    <div className="font-bold tabular-nums shrink-0">{formatVND(d.amount)}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* ── 11. TOP ROOMS + STAFF SHIFT ────────────────────── */}
      <SectionHeader icon={Star} label="Hiệu suất chi tiết" sub="Top phòng bán chạy & nhân sự theo ca" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopRooms items={data.topRooms} onSelect={(r) => { setDetail(r); setModal("room"); }} />
        <StaffShift items={data.staffShift} />
      </div>

      {/* ── 12. TRẠNG THÁI PHÒNG THEO LOẠI ────────────────── */}
      <SectionHeader icon={Layers} label="Trạng thái phòng theo loại" sub="Phân bổ theo hạng phòng" />
      <Card>
        <div className="h-48 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byRoomType} layout="vertical" barCategoryGap={10} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid {...grid} horizontal={false} />
              <XAxis type="number" {...axis} />
              <YAxis type="category" dataKey="name" {...axis} fontSize={11} width={104} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6, color: p["fg-muted"] }} iconType="circle" />
              <Bar dataKey="occupied" stackId="a" fill={p.highlight} name="Có khách" />
              <Bar dataKey="vacant"   stackId="a" fill={p.success}   name="Trống" />
              <Bar dataKey="ooo"      stackId="a" fill={p.danger}    name="OOO" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── 13. DỰ BÁO 14 NGÀY ────────────────────────────── */}
      <SectionHeader id="sec-forecast" icon={TrendingUp} label="Dự báo 14 ngày tới" sub="Công suất & doanh thu tiềm năng" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card title="Công suất dự báo (%)" icon={TrendingUp} accent="blue"
          right={<Badge tone="emerald"><TrendingUp className="w-3 h-3" /> +12.4%</Badge>}>
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.forecast14} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="d" {...axis} />
                <YAxis {...axis} domain={[40, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="v" stroke={p.accent} strokeWidth={2} dot={{ r: 3, fill: p.accent }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Doanh thu tiềm năng (triệu / ngày)" icon={Wallet} accent="emerald">
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.forecast14} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="d" {...axis} />
                <YAxis {...axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="r" fill={p.success} radius={[3, 3, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── 14. DÒNG TIỀN DỰ KIẾN ─────────────────────────── */}
      <SectionHeader icon={Activity} label="Dòng tiền dự kiến" sub="Lũy kế (area) vs Hằng ngày (bar)" />
      <Card>
        <div className="h-48 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.cashflow} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="cum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={p.accent} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={p.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...grid} vertical={false} />
              <XAxis dataKey="d" {...axis} />
              <YAxis yAxisId="l" {...axis} stroke={p.accent}
                tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}tỷ`} />
              <YAxis yAxisId="r" orientation="right" {...axis} stroke={p.success}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: p["fg-muted"] }} iconType="circle" />
              <Area yAxisId="l" type="monotone" dataKey="cum" stroke={p.accent} strokeWidth={2} fill="url(#cum)" name="Lũy kế" />
              <Bar  yAxisId="r" dataKey="day" fill={p.success} radius={[2, 2, 0, 0]} barSize={10} name="Hằng ngày" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── 15. BẢNG DỰ BÁO CHI TIẾT ─────────────────────── */}
      <SectionHeader icon={CalendarCheck} label="Bảng dự báo chi tiết" sub="14 ngày tới · từng ngày" />
      <Card className="p-0">
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
      <SectionHeader
        id="sec-alerts"
        icon={Bell}
        label="Cảnh báo & Cơ hội"
        sub="Gợi ý hành động ưu tiên"
        count={data.alerts.length - resolvedAlerts.length}
        right={
          resolvedAlerts.length > 0 && (
            <button
              onClick={() => setResolvedAlerts([])}
              className="text-[11.5px] font-semibold hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Hoàn tác ({resolvedAlerts.length})
            </button>
          )
        }
      />
      <div className="space-y-2.5">
        {data.alerts.map((a, i) => {
          const isWarn = a.level === "warning";
          const isInfo = a.level === "info";
          const ring = isWarn ? "border-l-amber-500" : isInfo ? "border-l-blue-500" : "border-l-rose-500";
          const resolved = resolvedAlerts.includes(i);
          return (
            <div
              key={i}
              className={`bg-white border border-ink-200 border-l-4 ${ring} rounded-md px-3 py-2.5 sm:px-4 sm:py-3 flex items-start gap-3 transition ${
                resolved ? "opacity-55" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[13px] font-semibold text-ink-900 ${resolved ? "line-through" : ""}`}>{a.title}</span>
                  <Badge tone={resolved ? "emerald" : isWarn ? "amber" : isInfo ? "blue" : "rose"}>
                    {resolved ? "Đã xử lý" : isWarn ? "Warning" : isInfo ? "Info" : "Critical"}
                  </Badge>
                </div>
                <div className="text-[12px] text-ink-700 mt-0.5">{a.desc}</div>
                <div className="text-[12px] italic mt-1 flex items-center gap-1" style={{ color: "var(--accent)" }}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {a.action}
                </div>
                <div className="text-[10px] text-ink-400 mt-1.5 flex items-center gap-1.5">
                  <Bell className="w-3 h-3" />
                  Ngày mục tiêu: {a.target}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => { setDetail(a); setModal("alert"); }}
                  className="px-2.5 py-1.5 rounded-md text-[11.5px] font-semibold border transition active:scale-95"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}
                >
                  Chi tiết
                </button>
                <button
                  onClick={() =>
                    setResolvedAlerts((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))
                  }
                  className="px-2.5 py-1.5 rounded-md text-[11.5px] font-bold transition active:scale-95"
                  style={
                    resolved
                      ? { backgroundColor: "var(--surface-3)", color: "var(--fg-muted)" }
                      : { backgroundColor: "var(--accent)", color: "var(--on-accent)" }
                  }
                >
                  {resolved ? "Mở lại" : "Xử lý"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
        <Layers className="w-3 h-3" />
        Số liệu minh họa · Cập nhật liên tục · Nguồn: PMS · {syncedAt}
      </div>

      {/* ── HỘP THOẠI THAO TÁC ────────────────────────────── */}

      <Modal open={modal === "checkin"} onClose={closeModal} icon={LogIn}
        title="Khách đến hôm nay" subtitle={`${data.arrivalsToday.length} lượt · ${TODAY}`}>
        {data.arrivalsToday.map((a) => {
          const done = doneKeys.includes(`in-${a.code}`);
          return (
            <ModalRow
              key={a.code}
              lead={a.eta}
              title={`${a.guest}${a.vip ? " · VIP" : ""}`}
              sub={`${a.code} · Phòng ${a.room} · ${a.type} · ${a.branch}`}
              right={`${a.nights} đêm`}
              rightSub={`${a.guests} khách`}
              actionLabel={done ? "Đã nhận" : "Check-in"}
              onAction={done ? undefined : () => markDone(`in-${a.code}`, `Đã check-in ${a.guest} · phòng ${a.room}`)}
            />
          );
        })}
      </Modal>

      <Modal open={modal === "checkout"} onClose={closeModal} icon={LogOut}
        title="Trả phòng hôm nay" subtitle={`${data.departuresToday.length} lượt · ${data.departuresToday.filter((d) => !d.paid).length} chưa thanh toán`}>
        {data.departuresToday.map((d) => {
          const done = doneKeys.includes(`out-${d.code}`) || d.paid;
          return (
            <ModalRow
              key={d.code}
              lead={d.checkout}
              title={d.guest}
              sub={`${d.code} · ${d.room}`}
              right={formatVND(d.total)}
              rightSub={done ? "Đã thanh toán" : "Chờ thu"}
              tone={done ? "success" : "warning"}
              actionLabel={done ? "Xong" : "Thu tiền"}
              onAction={done ? undefined : () => markDone(`out-${d.code}`, `Đã thu ${formatVND(d.total)} từ ${d.guest}`)}
            />
          );
        })}
      </Modal>

      <Modal open={modal === "maintenance"} onClose={closeModal} icon={Wrench}
        title="Hàng đợi kỹ thuật" subtitle={`${data.maintenanceQueue.length} phiếu đang mở`}>
        {data.maintenanceQueue.map((m) => {
          const done = doneKeys.includes(`fix-${m.room}`);
          const toneMap = { high: "danger", medium: "warning", low: "info" };
          return (
            <ModalRow
              key={m.room}
              lead={m.room}
              tone={toneMap[m.priority]}
              title={m.issue}
              sub={`${m.branch} · báo ${m.since} · dự kiến xong ${m.eta}`}
              right={{ high: "Cao", medium: "Vừa", low: "Thấp" }[m.priority]}
              rightSub="Ưu tiên"
              actionLabel={done ? "Đã giao" : "Giao việc"}
              onAction={done ? undefined : () => markDone(`fix-${m.room}`, `Đã giao phiếu kỹ thuật phòng ${m.room}`)}
            />
          );
        })}
      </Modal>

      <Modal open={modal === "review"} onClose={closeModal} icon={Star}
        title="Gửi yêu cầu đánh giá" subtitle="Khách vừa trả phòng · gửi qua email">
        {data.reviewTargets.map((r) => {
          const done = doneKeys.includes(`rev-${r.guest}`) || r.sent;
          return (
            <ModalRow
              key={r.guest}
              lead={<Star className="w-4 h-4" />}
              title={r.guest}
              sub={`${r.email} · ${r.branch} · rời ${r.left}`}
              rightSub={done ? "Đã gửi" : "Chưa gửi"}
              actionLabel={done ? "Đã gửi" : "Gửi mail"}
              onAction={done ? undefined : () => markDone(`rev-${r.guest}`, `Đã gửi yêu cầu đánh giá tới ${r.guest}`)}
            />
          );
        })}
      </Modal>

      <Modal open={modal === "fnb"} onClose={closeModal} icon={Coffee}
        title="Menu F&B hôm nay" subtitle={`${data.fnbMenu.length} món · doanh số trong ngày`}
        footer={
          <div className="flex items-center justify-between w-full gap-3">
            <span className="text-[12px] text-ink-500">Tổng doanh thu F&amp;B</span>
            <span className="text-[14px] font-bold tabular-nums text-ink-900">
              {formatVND(data.fnbMenu.reduce((s, m) => s + m.price * m.sold, 0))}
            </span>
          </div>
        }
      >
        {data.fnbMenu.map((m) => (
          <ModalRow
            key={m.name}
            lead={<Coffee className="w-4 h-4" />}
            title={m.name}
            sub={`${m.cat} · ${formatVND(m.price)}/${m.unit}`}
            right={formatVND(m.price * m.sold)}
            rightSub={`${m.sold} lượt`}
          />
        ))}
      </Modal>

      <Modal open={modal === "booking"} onClose={closeModal} icon={CalendarCheck}
        title="Tạo đặt phòng mới" subtitle="Nhập nhanh · dữ liệu minh họa"
        footer={
          <>
            <button onClick={closeModal} className="px-3 py-2 rounded-md text-[12.5px] font-semibold border"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}>
              Huỷ
            </button>
            <button
              onClick={() => { closeModal(); notify("Đã tạo booking mới · mã BK-2431"); }}
              className="px-3 py-2 rounded-md text-[12.5px] font-bold"
              style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
            >
              Tạo booking
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tên khách"><input className="input" defaultValue="Khách mới" /></Field>
          <Field label="Số điện thoại"><input className="input" inputMode="tel" defaultValue="09" /></Field>
          <Field label="Chi nhánh">
            <select className="input">
              {["Le Palmier Resort Đức Hòa", "Le Palmier Eco Park Hồ Tràm", "Le Palmier Garden Long An", "Le Palmier Land Tây Ninh"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Hạng phòng">
            <select className="input">
              {["Standard", "Superior", "Deluxe", "Suite", "Executive Suite", "Presidential"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Nhận phòng"><input type="date" className="input" defaultValue="2026-07-28" /></Field>
          <Field label="Trả phòng"><input type="date" className="input" defaultValue="2026-07-31" /></Field>
          <Field label="Số khách"><input type="number" min="1" className="input" defaultValue={2} /></Field>
          <Field label="Nguồn">
            <select className="input">
              {["Walk-in", "Booking.com", "Agoda", "Website", "Đại lý"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
      </Modal>

      <Modal open={modal === "opslog"} onClose={closeModal} icon={Clock}
        title="Nhật ký vận hành" subtitle={`Hôm nay · đồng bộ ${syncedAt}`} width="max-w-xl">
        <ol className="space-y-2.5">
          {data.opsLog.map((l, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[11px] font-bold tabular-nums text-ink-500 w-11 shrink-0 pt-0.5">{l.time}</span>
              <span
                className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                style={{ backgroundColor: `var(--${l.tone === "info" ? "info" : l.tone})` }}
              />
              <div className="min-w-0 flex-1 pb-2.5 border-b border-ink-100 last:border-0">
                <div className="text-[12.5px] text-ink-900">{l.text}</div>
                <div className="text-[10.5px] text-ink-500 mt-0.5">{l.actor}</div>
              </div>
            </li>
          ))}
        </ol>
      </Modal>

      <Modal open={modal === "export"} onClose={closeModal} icon={Layers}
        title="Xuất báo cáo" subtitle={`Dữ liệu ${range} ngày · tính đến ${TODAY}`}>
        <div className="space-y-2">
          {[
            { fmt: "Excel (.xlsx)", desc: "Toàn bộ bảng số liệu + biểu đồ", size: "2.4 MB" },
            { fmt: "PDF", desc: "Bản trình bày cho ban giám đốc", size: "1.1 MB" },
            { fmt: "CSV", desc: "Dữ liệu thô để phân tích", size: "480 KB" },
          ].map((f) => (
            <button
              key={f.fmt}
              onClick={() => { closeModal(); notify(`Đang chuẩn bị tệp ${f.fmt}…`); }}
              className="w-full text-left flex items-center gap-3 p-3 rounded-md border transition hover:bg-ink-50 active:scale-[.99]"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-ink-900">{f.fmt}</div>
                <div className="text-[11px] text-ink-500 mt-0.5">{f.desc}</div>
              </div>
              <span className="text-[11px] text-ink-500 tabular-nums shrink-0">{f.size}</span>
              <ChevronRight className="w-4 h-4 text-ink-400 shrink-0" />
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={modal === "room"} onClose={closeModal} icon={Star}
        title={detail?.name || "Chi tiết phòng"} subtitle={detail ? `${detail.type} · ${detail.branch}` : ""}>
        {detail && (
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Doanh thu tuần" value={formatVND(detail.revenue)} />
            <Stat label="Tăng trưởng" value={`+${detail.growth}%`} />
            <Stat label="Hạng phòng" value={detail.type} />
            <Stat label="Chi nhánh" value={detail.branch} />
            <Stat label="Đêm đã bán" value="18 / 21 đêm" />
            <Stat label="ADR phòng này" value={formatVND(Math.round(detail.revenue / 18))} />
          </div>
        )}
      </Modal>

      <Modal open={modal === "alert"} onClose={closeModal} icon={Bell}
        title={detail?.title || "Cảnh báo"} subtitle={detail ? `Ngày mục tiêu: ${detail.target}` : ""}
        footer={
          <button
            onClick={() => { closeModal(); notify("Đã ghi nhận · sẽ theo dõi tiến độ"); }}
            className="px-3 py-2 rounded-md text-[12.5px] font-bold"
            style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
          >
            Giao cho phụ trách
          </button>
        }
      >
        {detail && (
          <div className="space-y-3">
            <p className="text-[12.5px] text-ink-700 leading-relaxed">{detail.desc}</p>
            <div className="rounded-md p-3 text-[12.5px]"
              style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)" }}>
              <div className="font-bold mb-1 flex items-center gap-1.5"><ArrowUpRight className="w-3.5 h-3.5" /> Hành động đề xuất</div>
              {detail.action}
            </div>
          </div>
        )}
      </Modal>

      {/* ── TOAST ─────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-lg shadow-pop border text-[12.5px] font-semibold animate-slideUp max-w-[92vw]"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}>
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--success)" }} />
            {toast}
          </span>
        </div>
      )}
    </div>
  );
}

/* ───── field/stat nhỏ dùng trong modal ───── */

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-md border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}>
      <div className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500">{label}</div>
      <div className="text-[15px] font-bold text-ink-900 tabular-nums mt-1">{value}</div>
    </div>
  );
}

/* ───── dataset ───── */

function buildData(range, p = {}) {
  /* Bảng màu phân loại lấy từ palette theme — trước đây là hex cứng nên
     biểu đồ không đổi theo accent lẫn theme. */
  const series = [
    p.accent || "#0c91e9",
    p.highlight || "#8b5cf6",
    p.success || "#10b981",
    p.warning || "#f59e0b",
    p.danger || "#f43f5e",
    p.info || "#06b6d4",
  ];
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
    { name: "Phòng",         value: Math.round(revMonth * 0.62), color: series[0] },
    { name: "F&B",           value: Math.round(revMonth * 0.22), color: series[1] },
    { name: "Spa & Wellness",value: Math.round(revMonth * 0.07), color: series[2] },
    { name: "Sự kiện",       value: Math.round(revMonth * 0.05), color: series[3] },
    { name: "Khác",          value: Math.round(revMonth * 0.04), color: series[4] },
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

  /* Lấp khoảng trống dưới đồng hồ công suất */
  const occ7d = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d, i) => ({
    d,
    v: Math.round(68 + Math.sin(i / 1.3) * 9 + (i >= 5 ? 11 : 0)),
  }));

  const occByBranch = [
    { code: "DH", name: "Đức Hòa",  occ: 82, rooms: 68 },
    { code: "HT", name: "Hồ Tràm",  occ: 91, rooms: 74 },
    { code: "LA", name: "Long An",  occ: 64, rooms: 52 },
    { code: "TN", name: "Tây Ninh", occ: 71, rooms: 54 },
  ];

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
    { name: "Booking.com", color: series[0], bookings: 142, revenue: 4_820_000_000, pct: 36 },
    { name: "Agoda",       color: series[1], bookings: 98,  revenue: 3_120_000_000, pct: 25 },
    { name: "Walk-in",     color: series[2], bookings: 64,  revenue: 1_980_000_000, pct: 16 },
    { name: "Website",     color: series[3], bookings: 52,  revenue: 1_640_000_000, pct: 13 },
    { name: "Traveloka",   color: series[4], bookings: 28,  revenue: 920_000_000,   pct: 7 },
    { name: "Đại lý",      color: series[5], bookings: 12,  revenue: 440_000_000,   pct: 3 },
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

  /* ── Dữ liệu cho từng thao tác nhanh ── */

  const arrivalsToday = [
    { code: "BK-2418", guest: "Nguyễn Văn An",   room: "1205", type: "Deluxe Sea View", eta: "14:00", nights: 3, guests: 2, branch: "Hồ Tràm",  vip: true },
    { code: "BK-2419", guest: "Trần Thị Bình",   room: "0803", type: "Presidential",    eta: "15:30", nights: 2, guests: 2, branch: "Hồ Tràm",  vip: true },
    { code: "BK-2421", guest: "Lê Hoàng Cường",  room: "0412", type: "Superior Garden", eta: "16:00", nights: 1, guests: 4, branch: "Tây Ninh", vip: false },
    { code: "BK-2423", guest: "Đoàn Hàn Quốc (28)", room: "Nhiều phòng", type: "Standard ×14", eta: "17:00", nights: 4, guests: 28, branch: "Hồ Tràm", vip: false },
    { code: "BK-2425", guest: "Phạm Minh Dũng",  room: "0702", type: "Suite",           eta: "18:20", nights: 2, guests: 2, branch: "Long An",  vip: false },
    { code: "BK-2427", guest: "Vũ Quốc Nam",     room: "0501", type: "Executive Suite", eta: "20:00", nights: 5, guests: 1, branch: "Đức Hòa",  vip: true },
  ];

  const departuresToday = [
    { code: "CO-0908", guest: "Cty VNG (14 phòng)", room: "Tầng 8", checkout: "11:00", total: 245_000_000, paid: true },
    { code: "CO-0911", guest: "Hoàng Khánh My",     room: "0304",   checkout: "11:30", total: 8_400_000,   paid: true },
    { code: "CO-0912", guest: "Bùi Phương Linh",    room: "0615",   checkout: "12:00", total: 12_600_000,  paid: false },
    { code: "CO-0914", guest: "Đỗ Quang Huy",       room: "1102",   checkout: "12:00", total: 18_900_000,  paid: false },
  ];

  const maintenanceQueue = [
    { room: "0308", branch: "Hồ Tràm",  issue: "Điều hòa không lạnh",      priority: "high",   since: "2 giờ trước", eta: "18:00" },
    { room: "0412", branch: "Hồ Tràm",  issue: "Rò nước vòi lavabo",       priority: "medium", since: "5 giờ trước", eta: "Hôm nay" },
    { room: "0207", branch: "Đức Hòa",  issue: "Khóa từ lỗi đọc thẻ",      priority: "high",   since: "1 giờ trước", eta: "16:30" },
    { room: "0910", branch: "Long An",  issue: "Bóng đèn phòng tắm cháy",  priority: "low",    since: "Hôm qua",     eta: "Mai" },
  ];

  const fnbMenu = [
    { name: "Buffet sáng",        cat: "Ăn uống",   price: 350_000, unit: "người",  sold: 280 },
    { name: "Set trưa Á",         cat: "Ăn uống",   price: 420_000, unit: "suất",   sold: 96  },
    { name: "Bò Wagyu A5",        cat: "Nhà hàng",  price: 1_850_000, unit: "phần", sold: 24  },
    { name: "Cocktail signature", cat: "Bar",       price: 260_000, unit: "ly",     sold: 148 },
    { name: "Minibar phòng",      cat: "Tiện ích",  price: 250_000, unit: "lần",    sold: 62  },
    { name: "Tiệc BBQ bãi biển",  cat: "Sự kiện",   price: 780_000, unit: "khách",  sold: 45  },
  ];

  const reviewTargets = [
    { guest: "Cty VNG (14 phòng)", branch: "Hồ Tràm",  left: "Hôm nay 11:00", email: "booking@vng.com.vn",  sent: false },
    { guest: "Hoàng Khánh My",     branch: "Đức Hòa",  left: "Hôm nay 11:30", email: "my.hk@email.vn",      sent: false },
    { guest: "Ngô Thanh Tú",       branch: "Long An",  left: "Hôm qua 12:00", email: "tu.nt@email.vn",      sent: true  },
    { guest: "Dương Gia Hân",      branch: "Tây Ninh", left: "Hôm qua 10:20", email: "han.dg@email.vn",     sent: true  },
  ];

  const opsLog = [
    { time: "09:24", actor: "Hệ thống",        text: "Đồng bộ PMS thành công · 248 phòng · 0 lỗi",          tone: "info" },
    { time: "09:18", actor: "Lễ tân · Uy Trần", text: "Check-in phòng 1205 · Nguyễn Văn An · 3 đêm",        tone: "success" },
    { time: "09:05", actor: "Buồng phòng",     text: "Hoàn tất dọn 6 phòng tầng 4 · chuyển trạng thái Sẵn sàng", tone: "success" },
    { time: "08:47", actor: "Kỹ thuật",        text: "Nhận phiếu bảo trì P.0308 · điều hòa · ưu tiên cao",  tone: "warning" },
    { time: "08:30", actor: "Lễ tân · Diệu Huỳnh", text: "Check-out đoàn VNG · 14 phòng · thu 245tr",       tone: "success" },
    { time: "08:12", actor: "OTA",             text: "Booking.com đẩy 3 đặt phòng mới cho Hồ Tràm",         tone: "info" },
    { time: "07:55", actor: "Hệ thống",        text: "Cảnh báo: 2 phòng OOO vượt ngưỡng tại Hồ Tràm",       tone: "danger" },
    { time: "07:30", actor: "An ninh",         text: "Bàn giao ca đêm → ca sáng · không sự cố",             tone: "info" },
  ];

  const quickActions = [
    { key: "checkin",     icon: LogIn,         label: "Check-in nhanh",      sub: "Khách đến hôm nay",     tone: "blue",    badge: arrivalsToday.length },
    { key: "booking",     icon: CalendarCheck, label: "Đặt phòng mới",       sub: "Tạo booking thủ công",  tone: "emerald" },
    { key: "checkout",    icon: LogOut,        label: "Check-out",           sub: "Trả phòng & thanh toán", tone: "amber",  badge: departuresToday.filter((d) => !d.paid).length },
    { key: "maintenance", icon: Wrench,        label: "Phiếu kỹ thuật",      sub: "Bảo trì / sửa chữa",    tone: "rose",    badge: maintenanceQueue.length },
    { key: "review",      icon: Star,          label: "Gửi đánh giá",        sub: "Yêu cầu qua email",     tone: "violet",  badge: reviewTargets.filter((r) => !r.sent).length },
    { key: "fnb",         icon: Coffee,        label: "Order F&B",           sub: "Menu & doanh số hôm nay", tone: "cyan" },
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
    dailyRevenue, mix, costByMonth, byRoomType, occ7d, occByBranch,
    forecast14, forecastTable, cashflow,
    debtors, alerts,
    channelMix, staffShift, topRooms, reviews, activity, quickActions,
    arrivalsToday, departuresToday, maintenanceQueue, fnbMenu, reviewTargets, opsLog,
    lastSync,
  };
}
