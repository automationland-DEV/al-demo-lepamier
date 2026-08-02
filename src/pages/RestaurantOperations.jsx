import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area, BarChart, Bar, ComposedChart,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Icons } from "../components/Icons";
import { Modal, useChartPalette } from "../components/DashboardPrimitives";
import { formatVNDFull, formatVND } from "../utils/format";

const {
  Utensils, UtensilsCrossed, ChefHat, Wine, Soup, CookingPot, Receipt,
  Flame, Store,
  ChevronRight, TrendingUp, TrendingDown, Plus, Filter, Download,
  Search, MoreHorizontal, Star, Users, Clock, Coffee, AlertCircle,
  Calendar, DollarSign, Heart,
  CheckCircle2, XCircle, Hourglass, Percent, MapPin,
  Wallet, Phone, Send, MessageCircle, ImageIcon, Paperclip,
  Smile, Reply, Check, CheckCheck, X, RotateCcw, SearchX,
} = Icons;

/* Trục & lưới biểu đồ dựng từ palette theo theme — trước đây lưới là #eceef2
   (gần trắng) nên ở dark mode thành vạch chói. */
const axisOf = (p) => ({ stroke: p["fg-muted"], fontSize: 10, tickLine: false, axisLine: false });
const gridOf = (p) => ({ strokeDasharray: "3 6", stroke: p["border-soft"] });
const tipOf = (p) => ({
  background: p.surface,
  border: `1px solid ${p.border}`,
  borderRadius: 8,
  fontSize: 12,
  color: p.fg,
  padding: "8px 12px",
  boxShadow: "0 10px 30px rgba(0,0,0,.18)",
});

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const TODAY = "28/07/2026";

const EMOJIS = ["😊", "🙏", "👍", "🎉", "❤️", "😅", "🍽️", "🥘", "🍜", "🥗", "⏰", "✅"];

// Lấy 2 ký tự đầu của tên để hiển thị avatar (an toàn khi tên undefined/rỗng)
function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}

export default function RestaurantOperations() {
  const [shift, setShift] = useState("all");
  const [branch, setBranch] = useState("all");
  const p = useChartPalette();
  const axis = axisOf(p);
  const grid = gridOf(p);
  const tooltipStyle = tipOf(p);

  const base = useMemo(() => buildData({ shift, branch }), [shift, branch]);

  /* Các phần người dùng thao tác được giữ trong state riêng, phần còn lại
     lấy thẳng từ buildData để không phải sao chép cả tập dữ liệu lớn. */
  const [live, setLive] = useState(null);
  useEffect(() => {
    setLive({
      kitchen: base.kitchen,
      reservations: base.reservations,
      inventory: base.inventory,
      issues: base.issues,
    });
  }, [base]);

  const data = useMemo(() => ({ ...base, ...(live || {}) }), [base, live]);

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [rsvStatus, setRsvStatus] = useState("all");
  const [station, setStation] = useState("all");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [rsvFormOpen, setRsvFormOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const q = deaccent(search.trim());

  /* Lọc dùng chung cho bếp / đặt bàn / món / tồn kho */
  const kitchen = useMemo(() => (data.kitchen || []).filter((r) => {
    if (station !== "all" && r.station !== station) return false;
    if (urgentOnly && r.priority !== "rush" && r.elapsed <= r.target) return false;
    if (q && !deaccent(`${r.id} ${r.table} ${(r.items || []).join(" ")} ${r.station}`).includes(q)) return false;
    return true;
  }), [data.kitchen, station, urgentOnly, q]);

  const reservations = useMemo(() => (data.reservations || []).filter((r) => {
    if (rsvStatus !== "all" && r.status !== rsvStatus) return false;
    if (q && !deaccent(`${r.name} ${r.phone} ${r.table} ${r.branchName} ${r.note || ""}`).includes(q)) return false;
    return true;
  }), [data.reservations, rsvStatus, q]);

  const topDishes = useMemo(() => (data.topDishes || []).filter((d) =>
    !q || deaccent(`${d.name} ${d.cat || ""}`).includes(q)), [data.topDishes, q]);

  const inventory = useMemo(() => (data.inventory || []).filter((it) =>
    !q || deaccent(it.name).includes(q)), [data.inventory, q]);

  const filterCount = (rsvStatus !== "all" ? 1 : 0) + (station !== "all" ? 1 : 0) + (urgentOnly ? 1 : 0);
  const hasQuery = filterCount > 0 || q !== "";
  const resetAll = () => { setSearch(""); setRsvStatus("all"); setStation("all"); setUrgentOnly(false); };

  /* ── thao tác ── */
  const advanceKitchen = (row) => {
    const order = ["Bếp lạnh", "Bếp nóng", "Ra món"];
    const i = order.indexOf(row.station);
    if (i === -1 || i === order.length - 1) {
      setLive((s) => ({ ...s, kitchen: s.kitchen.filter((k) => k.id !== row.id) }));
      notify(`Đơn ${row.id} đã ra món · hoàn tất`);
      return;
    }
    const next = order[i + 1];
    setLive((s) => ({ ...s, kitchen: s.kitchen.map((k) => (k.id === row.id ? { ...k, station: next } : k)) }));
    notify(`Đơn ${row.id} → ${next}`);
  };

  const setRsv = (r, status) => {
    setLive((s) => ({ ...s, reservations: s.reservations.map((x) => (x.id === r.id ? { ...x, status } : x)) }));
    notify(`${r.name} · ${r.time} → ${RSV_LABEL[status] || status}`);
  };

  const reorder = (it) => {
    setLive((s) => ({
      ...s,
      inventory: s.inventory.map((x) => (x.name === it.name ? { ...x, stock: x.max, days: Math.round(x.days * (x.max / Math.max(1, x.stock))) } : x)),
    }));
    notify(`Đã đặt bổ sung ${it.name} · về mức ${it.max} ${it.unit}`);
  };

  const resolveIssue = (idx) => {
    setLive((s) => ({ ...s, issues: s.issues.map((x, i) => (i === idx ? { ...x, status: "resolved" } : x)) }));
    notify("Đã đánh dấu sự cố là đã xử lý");
  };

  const addReservation = (payload) => {
    setLive((s) => ({
      ...s,
      reservations: [...s.reservations, { ...payload, id: `RS-${Date.now().toString().slice(-5)}` }]
        .sort((a, b) => a.time.localeCompare(b.time)),
    }));
    setRsvFormOpen(false);
    notify(`Đã đặt bàn cho ${payload.name} · ${payload.time} · ${payload.guests} khách`);
  };

  if (!live) return null;

  return (
    <div className="max-w-[1320px] mx-auto pb-12 px-3 sm:px-4 lg:px-6">

      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden rounded-md bg-gradient-to-br from-amber-900 via-orange-800 to-rose-700 text-white shadow-sm">
        <div className="absolute inset-0 opacity-[0.08] bg-soft-grid" />
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-rose-400/25 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-amber-400/25 blur-3xl" />
        <div className="relative px-4 py-4 sm:px-6 sm:py-5 flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/70 font-semibold flex-wrap">
              <Utensils className="w-3.5 h-3.5" />
              F&amp;B · Vận hành nhà hàng
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                <span className="relative flex w-2 h-2 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-emerald-300 opacity-70 animate-ping" style={{ animationDuration: "1.8s" }} />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_4px_1px_rgba(110,231,183,0.7)]" />
                </span>
                LIVE
              </span>
            </div>
            <h1 className="font-display font-bold text-[20px] sm:text-[28px] leading-tight mt-1 truncate">
              Nhà Hàng
            </h1>
            <p className="text-[13px] text-white/80 mt-1 max-w-2xl">
              Bếp · phục vụ · đặt bàn · doanh thu — theo dõi real-time toàn hệ thống 4 nhà hàng.
            </p>
            <div className="flex items-center gap-2 mt-2 sm:mt-3 flex-wrap">
              {data.heroMeta.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded px-2 py-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold whitespace-nowrap">{m.label}</span>
                  <span className="text-[12px] font-semibold tabular-nums truncate">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button onClick={() => setExportOpen(true)}
                    className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-[12.5px] font-semibold flex items-center gap-2 transition active:scale-95">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất báo cáo</span>
              <span className="sm:hidden">Xuất</span>
            </button>
            <button onClick={() => setRsvFormOpen(true)}
                    className="px-3 py-2 rounded-md bg-white text-amber-700 hover:bg-amber-50 text-[12.5px] font-bold flex items-center gap-2 transition shadow-sm active:scale-95">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tạo đơn / đặt bàn</span>
              <span className="sm:hidden">Tạo đơn</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ STRIP BÀN — FLOOR PLAN VIEW ═══ */}
      <SectionHeader
        icon={UtensilsCrossed}
        label="Sơ đồ bàn — theo nhà hàng"
        sub="Trạng thái real-time · nhấn để xem chi tiết"
        right={
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] font-semibold flex-wrap">
            <Dot color="bg-emerald-500" /> Trống
            <Dot color="bg-amber-500" /> Đang phục vụ
            <Dot color="bg-violet-500" /> Đã đặt
            <Dot color="bg-rose-500" /> Bảo trì
          </div>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {data.restaurants.map((r) => (
          <RestaurantFloor
            key={r.id}
            r={r}
            selected={branch === r.id}
            onSelect={() => setBranch(branch === r.id ? "all" : r.id)}
            onTable={(t) => setTableOpen({ t, r })}
          />
        ))}
      </div>

      {/* ═══ FILTER BAR ═══ */}
      <div className="mt-7 sm:mt-9 bg-white border border-ink-200 rounded-md p-3 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mr-1 hidden sm:inline">Lọc ca:</span>
          {[
            { id: "all", label: "Cả ngày", icon: Clock },
            { id: "lunch", label: "Trưa · 11h-14h", icon: Soup },
            { id: "afternoon", label: "Xế · 14h-17h", icon: Coffee },
            { id: "dinner", label: "Tối · 17h-22h", icon: Wine },
          ].map((s) => {
            const active = shift === s.id;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setShift(s.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11.5px] font-semibold border transition flex items-center gap-1.5 ${
                  active
                    ? "bg-amber-700 text-white border-amber-700 shadow-sm"
                    : "bg-white text-ink-700 border-ink-200 hover:border-amber-300 hover:text-amber-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.label.split(" · ")[0]}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button onClick={() => setShowFilter((v) => !v)} aria-expanded={showFilter}
                  className="px-3 py-1.5 rounded-md bg-ink-100 text-ink-700 text-[11.5px] font-semibold flex items-center gap-1.5 hover:bg-ink-200 transition active:scale-95">
            <Filter className="w-3.5 h-3.5" /> Nâng cao
            {filterCount > 0 && (
              <span className="min-w-[16px] h-4 px-1 rounded-full bg-amber-700 text-white text-[9.5px] font-bold inline-flex items-center justify-center tabular-nums">
                {filterCount}
              </span>
            )}
          </button>
          <button onClick={() => setShowSearch((v) => !v)} aria-expanded={showSearch}
                  className="px-3 py-1.5 rounded-md bg-amber-700 text-white text-[11.5px] font-bold flex items-center gap-1.5 hover:bg-amber-800 transition active:scale-95">
            <Search className="w-3.5 h-3.5" /> Tìm món / đơn
          </button>
        </div>

        {/* Ô tìm kiếm — lọc đồng thời bếp, đặt bàn, món và nguyên liệu */}
        {showSearch && (
          <div className="w-full pt-3 mt-1 border-t border-ink-100 animate-fadeIn">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                aria-label="Tìm món, đơn, khách đặt bàn"
                placeholder="Tìm mã đơn, bàn, tên món, khách đặt bàn, nguyên liệu…"
                className="input pl-9 pr-9 text-[16px] sm:text-[13px]"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Xoá tìm kiếm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full inline-flex items-center justify-center text-ink-400 hover:bg-ink-100 transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {q && (
              <div className="mt-2 flex items-center gap-2 flex-wrap text-[11.5px] text-ink-500">
                <span>Kết quả:</span>
                <ResultChip n={kitchen.length} label="đơn bếp" />
                <ResultChip n={reservations.length} label="đặt bàn" />
                <ResultChip n={topDishes.length} label="món" />
                <ResultChip n={inventory.length} label="nguyên liệu" />
              </div>
            )}
          </div>
        )}

        {/* Bộ lọc nâng cao */}
        {showFilter && (
          <div className="w-full pt-3 mt-1 border-t border-ink-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
            <FilterGroup label="Trạng thái đặt bàn">
              <div className="flex flex-wrap gap-1.5">
                {[{ k: "all", l: "Tất cả" }, ...Object.entries(RSV_LABEL).map(([k, l]) => ({ k, l }))].map((s) => (
                  <OpsChip key={s.k} on={rsvStatus === s.k} onClick={() => setRsvStatus(s.k)}>{s.l}</OpsChip>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Khu bếp">
              <div className="flex flex-wrap gap-1.5">
                {["all", "Bếp nóng", "Bếp lạnh", "Ra món"].map((s) => (
                  <OpsChip key={s} on={station === s} onClick={() => setStation(s)}>
                    {s === "all" ? "Tất cả" : s}
                  </OpsChip>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Ưu tiên">
              <div className="flex flex-wrap gap-1.5 items-center">
                <OpsChip on={urgentOnly} onClick={() => setUrgentOnly((v) => !v)}>
                  <Flame className="w-3 h-3" /> Chỉ đơn gấp / trễ
                </OpsChip>
                <button onClick={resetAll} disabled={!hasQuery}
                        className="px-3 py-1.5 rounded-full text-[11.5px] font-semibold border transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}>
                  <RotateCcw className="w-3 h-3" /> Đặt lại
                </button>
              </div>
            </FilterGroup>
          </div>
        )}
      </div>

      {/* ═══ KPI LỚN ═══ */}
      <SectionHeader icon={Percent} label="KPI vận hành" sub="Hiệu suất theo real-time" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPIBig
          label="Doanh thu hôm nay"
          value={formatVND(data.revToday)}
          sub={`${data.ordersToday} đơn · ${data.guestsToday} khách`}
          dotColor="bg-amber-500"
          accent="amber"
          icon={Wallet}
          trend={{ value: 18.4, label: "so với hôm qua" }}
        />
        <KPIBig
          label="Bill trung bình"
          value={formatVND(data.avgBill)}
          sub={`Trên ${data.guestsToday} khách phục vụ`}
          dotColor="bg-rose-500"
          accent="rose"
          icon={Receipt}
          trend={{ value: 4.2, label: "so với tuần trước" }}
        />
        <KPIBig
          label="Công suất bàn"
          value={`${data.tableOcc}%`}
          sub={`${data.tablesOccupied}/${data.tablesTotal} bàn đang dùng`}
          dotColor="bg-emerald-500"
          accent="emerald"
          icon={Store}
          trend={{ value: 6.1, label: "so với ca trước" }}
        />
        <KPIBig
          label="Thời gian chờ TB"
          value={`${data.avgWait}'`}
          sub="Từ lúc khách ngồi đến món đầu tiên"
          dotColor="bg-blue-500"
          accent="blue"
          icon={Hourglass}
          trend={{ value: -12, label: "giảm so với hôm qua", invertColor: true }}
        />
      </div>

      {/* ═══ BẾP & PHỤC VỤ ═══ */}
      <SectionHeader
        icon={ChefHat}
        label="Bếp & Phục vụ"
        sub="Số liệu realtime theo ca"
        right={
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-ink-500">
            <span className="relative flex w-2 h-2 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-70 animate-ping" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </span>
            Đồng bộ 30s trước
          </span>
        }
      />
      {/* Bảng bếp ~447px còn "Ca làm việc" ~852px. Trước đây dùng items-start nên
          hai cột lệch hẳn 405px. Nay cố định chiều cao hàng và bật fill: cả hai
          cao bằng nhau, cột ca làm việc cuộn bên trong. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:h-[520px]">
        <Card fill title="Trạng thái đơn trong bếp"
              subtitle={hasQuery ? `${kitchen.length}/${data.kitchen.length} đơn · nhấn để chuyển bước` : "KDS · nhấn vào đơn để chuyển bước"}
              icon={ChefHat} accent="amber" className="lg:col-span-2 min-w-0">
          <KitchenBoard rows={kitchen} onAdvance={advanceKitchen} onReset={resetAll} hasQuery={hasQuery} />
        </Card>
        <Card fill title="Ca làm việc" subtitle="Phân công hôm nay" icon={Users} accent="violet">
          <ShiftBoard rows={data.shifts} />
        </Card>
      </div>

      {/* ═══ MENU PERFORMANCE ═══ */}
      <SectionHeader icon={Soup} label="Hiệu suất thực đơn" sub="Top món, doanh thu, rating" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card title="Top 5 món bán chạy"
              subtitle={hasQuery ? `${topDishes.length}/${data.topDishes.length} món khớp` : "Hôm nay · theo số lượng"}
              icon={Soup} accent="amber" className="lg:col-span-2">
          <TopDishes items={topDishes} />
        </Card>
        <Card title="Phân bổ danh mục" subtitle="% doanh thu" icon={PieChart} accent="rose">
          <CategoryMix data={data.categoryMix} />
        </Card>
      </div>

      {/* ═══ CHART DOANH THU + GIỜ CAO ĐIỂM ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mt-5">
        <Card title="Doanh thu 14 ngày" subtitle="VNĐ" icon={TrendingUp} accent="emerald" className="lg:col-span-2 overflow-hidden min-w-0">
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.rev14} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="d" {...axis} />
                <YAxis yAxisId="l" stroke="#f59e0b" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} />
                <YAxis yAxisId="r" orientation="right" stroke="#8b5cf6" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatVNDFull(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                <Area yAxisId="l" type="monotone" dataKey="rev" stroke="#f59e0b" strokeWidth={2} fill="url(#revR)" name="Doanh thu" />
                <Bar yAxisId="r" dataKey="guests" fill="#8b5cf6" radius={[3, 3, 0, 0]} barSize={18} name="Lượt khách" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Giờ cao điểm" subtitle="Khách theo khung giờ" icon={Clock} accent="amber">
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.peakHours} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="h" {...axis} />
                <YAxis {...axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="guests" radius={[3, 3, 0, 0]} barSize={14}>
                  {data.peakHours.map((p, i) => (
                    <Cell key={i} fill={p.peak ? "#f43f5e" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ═══ ĐẶT BÀN ═══ */}
      <SectionHeader
        icon={Calendar}
        label="Đặt bàn hôm nay"
        sub={hasQuery
          ? `${reservations.length}/${data.reservations.length} lượt khớp bộ lọc`
          : `${data.reservations.length} lượt · tổng ${data.guestsRsv} khách`}
        right={
          <button onClick={() => setRsvFormOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-amber-700 text-white text-[11.5px] font-bold flex items-center gap-1.5 hover:bg-amber-800 transition active:scale-95">
            <Plus className="w-3.5 h-3.5" /> Thêm đặt bàn
          </button>
        }
      />
      <Card title="Danh sách đặt bàn" subtitle="Sắp xếp theo giờ · nhấn nút để đổi trạng thái" icon={Calendar} accent="blue" className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-ink-500 uppercase tracking-wider text-[10px] bg-ink-50">
                <th className="px-3 sm:px-5 py-3 font-semibold">Giờ</th>
                <th className="px-3 sm:px-5 py-3 font-semibold">Khách hàng</th>
                <th className="px-3 sm:px-5 py-3 font-semibold">Nhà hàng</th>
                <th className="px-3 sm:px-5 py-3 font-semibold hidden sm:table-cell">Bàn</th>
                <th className="px-3 sm:px-5 py-3 font-semibold text-center">Khách</th>
                <th className="px-3 sm:px-5 py-3 font-semibold hidden md:table-cell">Ghi chú</th>
                <th className="px-3 sm:px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-3 sm:px-5 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <SearchX className="w-9 h-9 mx-auto text-ink-300 mb-2.5" />
                    <div className="text-[13px] font-semibold text-ink-900">Không có lượt đặt bàn nào khớp</div>
                    <div className="text-[11.5px] text-ink-500 mt-1">Thử đổi từ khoá hoặc bỏ bớt bộ lọc.</div>
                    <button onClick={resetAll}
                            className="mt-3 px-4 py-2 rounded-md bg-amber-700 text-white text-[12px] font-bold inline-flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
                    </button>
                  </td>
                </tr>
              )}
              {reservations.map((r, i) => (
                <tr key={r.id} className={`border-t border-ink-100 ${i % 2 ? "bg-ink-50/40" : ""} hover:bg-amber-50/40 transition`}>
                  <td className="px-3 sm:px-5 py-3 font-bold text-ink-900 tabular-nums whitespace-nowrap">
                    {r.time}
                  </td>
                  <td className="px-3 sm:px-5 py-3 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                        {initials(r.name).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-ink-900 truncate">{r.name}</div>
                        <div className="text-[10px] text-ink-500 tabular-nums">{r.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3 text-ink-700 whitespace-nowrap">
                    <span className="font-semibold">{r.branchCode}</span> · {r.branchName}
                  </td>
                  <td className="px-3 sm:px-5 py-3 hidden sm:table-cell text-ink-700 whitespace-nowrap">
                    {r.table}
                  </td>
                  <td className="px-3 sm:px-5 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-full bg-ink-100 text-ink-700 text-[11px] font-bold tabular-nums">
                      {r.guests}
                    </span>
                  </td>
                  <td className="px-3 sm:px-5 py-3 hidden md:table-cell text-ink-600 max-w-[200px] truncate">
                    {r.note || "—"}
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <StatusPill s={r.status} />
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {r.status !== "seated" && r.status !== "cancelled" && (
                        <OpsAction title="Xác nhận đã tới & xếp bàn" tone="emerald" onClick={() => setRsv(r, "seated")}>
                          <CheckCircle2 className="w-4 h-4" />
                        </OpsAction>
                      )}
                      {r.status === "pending" && (
                        <OpsAction title="Xác nhận đặt bàn" tone="blue" onClick={() => setRsv(r, "confirmed")}>
                          <Check className="w-4 h-4" />
                        </OpsAction>
                      )}
                      {r.status !== "cancelled" && (
                        <OpsAction title="Huỷ đặt bàn" tone="rose" onClick={() => setRsv(r, "cancelled")}>
                          <XCircle className="w-4 h-4" />
                        </OpsAction>
                      )}
                      {r.status === "cancelled" && (
                        <OpsAction title="Khôi phục" tone="ink" onClick={() => setRsv(r, "confirmed")}>
                          <RotateCcw className="w-4 h-4" />
                        </OpsAction>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ═══ TOP BÀN + NGUYÊN LIỆU ═══ */}
      <SectionHeader icon={Star} label="Top bàn & Nguyên liệu" sub="Bàn đắt khách · tồn kho bếp" />
      {/* Top bàn ~439px, tồn kho ~877px — lệch 438px. Cùng cách xử lý như trên. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:h-[520px]">
        <Card fill title="Bàn có doanh thu cao" subtitle="Top 5 trong ngày" icon={Utensils} accent="amber">
          <TopTables items={data.topTables} />
        </Card>
        <Card fill title="Nguyên liệu sắp hết" subtitle="Cảnh báo bếp — nhấn để đặt bổ sung" icon={AlertCircle} accent="rose">
          <Inventory items={inventory} onReorder={reorder} />
        </Card>
      </div>

      {/* ═══ NHÀ CUNG CẤP + ĐÁNH GIÁ ═══ */}
      <SectionHeader icon={Receipt} label="Nhà cung cấp & Đánh giá" sub="PO đang mở · feedback khách" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <Card title="Đơn mua hàng hôm nay" subtitle="PO đang chờ giao" icon={Truck} accent="blue">
          <PurchaseOrders items={data.pos} />
        </Card>
        <Card title="Đánh giá mới" subtitle="Từ khách đã dùng bữa" icon={Heart} accent="rose">
          <ReviewList items={data.reviews} />
        </Card>
      </div>

      {/* ═══ HOA HỒNG + SỰ CỐ ═══ */}
      {/* Tip ~401px, sự cố ~539px — lệch 138px. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:h-[480px]">
        <Card fill title="Tip / hoa hồng" subtitle="Theo ca · nhân viên" icon={DollarSign} accent="emerald" className="lg:col-span-2">
          <TipsBoard rows={data.tips} />
        </Card>
        <Card fill title="Sự cố & xử lý" subtitle="Trong ngày" icon={AlertCircle} accent="rose">
          <IssuesList items={data.issues} onResolve={resolveIssue} />
        </Card>
      </div>

      {/* ═══ TIN NHẮN KHÁCH HÀNG - ĐA KÊNH ═══ */}
      <SectionHeader
        icon={MessageCircle}
        label="Hộp thoại khách hàng — đa kênh"
        sub="Tin nhắn đổ về từ TikTok · Zalo · Messenger · Instagram · SMS · Email"
        right={
          <div className="flex items-center gap-2 text-[10px] font-semibold flex-wrap">
            {data.channels.map((c) => (
              <span key={c.id} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border ${c.tone}`} title={c.name}>
                {/* Trước đây dùng nháy kép nên ${c.dot} là chuỗi literal — chấm không bao giờ được tô màu */}
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                {c.short} <span className="tabular-nums font-bold">{c.unread}</span>
              </span>
            ))}
          </div>
        }
      />
      <Card title="Inbox thống nhất" subtitle={`${data.conversations.reduce((s, c) => s + (c.unread || 0), 0)} tin chưa đọc · hợp nhất mọi nền tảng`} icon={MessageCircle} accent="amber">
        <MultiChannelInbox
          conversations={data.conversations}
        />
      </Card>

      <div className="mt-10 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
        <Utensils className="w-3 h-3" />
        Số liệu minh họa · Cập nhật real-time · Nguồn: POS · KDS · 28/07 09:24
      </div>

      {/* ═══ MODAL: XUẤT BÁO CÁO ═══ */}
      <Modal open={exportOpen} onClose={() => setExportOpen(false)} icon={Download}
             title="Xuất báo cáo vận hành" subtitle={`Ca ${SHIFT_LABEL[shift]} · ${branch === "all" ? "tất cả nhà hàng" : branch}`}
             width="max-w-md">
        <div className="space-y-2">
          {[
            { fmt: "Báo cáo ca (PDF)", desc: `Doanh thu ${formatVND(data.revToday)} · ${data.ordersToday} đơn` },
            { fmt: "Chi tiết đơn (Excel)", desc: `${data.reservations.length} lượt đặt bàn + KDS` },
            { fmt: "Tồn kho & PO (CSV)", desc: `${data.inventory.length} nguyên liệu · ${data.pos.length} đơn mua` },
            { fmt: "Bảng tip theo ca (CSV)", desc: "Phân bổ hoa hồng nhân viên" },
          ].map((f) => (
            <button key={f.fmt}
                    onClick={() => { setExportOpen(false); notify(`Đang chuẩn bị ${f.fmt}`); }}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-md border transition hover:bg-ink-50 active:scale-[.99]"
                    style={{ borderColor: "var(--border)" }}>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-ink-900">{f.fmt}</div>
                <div className="text-[11px] text-ink-500 mt-0.5">{f.desc}</div>
              </div>
              <Download className="w-4 h-4 text-ink-400 shrink-0" />
            </button>
          ))}
        </div>
      </Modal>

      {/* ═══ MODAL: ĐẶT BÀN ═══ */}
      <ReservationForm
        open={rsvFormOpen}
        restaurants={data.restaurants}
        onClose={() => setRsvFormOpen(false)}
        onSubmit={addReservation}
      />

      {/* ═══ MODAL: CHI TIẾT BÀN ═══ */}
      <Modal open={!!tableOpen} onClose={() => setTableOpen(null)} icon={UtensilsCrossed}
             title={tableOpen ? `Bàn ${tableOpen.t.id}` : ""} subtitle={tableOpen?.r?.name} width="max-w-sm">
        {tableOpen && (() => {
          const tone = TABLE_TONE[tableOpen.t.status] || "neutral";
          return (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-md border"
                   style={{ backgroundColor: `var(--${tone}-soft)`, borderColor: `var(--${tone}-border)` }}>
                <div className="w-11 h-11 rounded-md flex items-center justify-center shrink-0"
                     style={{ backgroundColor: `var(--${tone})`, color: "var(--on-accent)" }}>
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: `var(--${tone}-fg)` }}>
                    Trạng thái
                  </div>
                  <div className="text-[15px] font-bold" style={{ color: `var(--${tone}-fg)` }}>
                    {TABLE_LABEL[tableOpen.t.status] || tableOpen.t.status}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-[12px]">
                <OpsInfo label="Mã bàn" value={`Bàn ${tableOpen.t.id}`} />
                <OpsInfo label="Nhà hàng" value={tableOpen.r.code} />
                <OpsInfo label="Vị trí" value={tableOpen.r.location} />
                <OpsInfo label="Công suất NH" value={`${tableOpen.r.occupied}/${tableOpen.r.total} bàn`} />
              </div>
            </div>
          );
        })()}
      </Modal>

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

/* ═══════════ Bổ sung: nhãn, chip, thao tác, form ═══════════ */

const RSV_LABEL = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  seated: "Đã xếp bàn",
  cancelled: "Đã huỷ",
};

const SHIFT_LABEL = { all: "cả ngày", lunch: "trưa", afternoon: "xế", dinner: "tối" };

/* Khớp với giá trị status thật trong makeTables(): vacant | occupied | reserved | ooo */
const TABLE_TONE = { vacant: "success", occupied: "warning", reserved: "highlight", ooo: "danger" };
const TABLE_LABEL = { vacant: "Trống", occupied: "Đang phục vụ", reserved: "Đã đặt", ooo: "Bảo trì" };

function FilterGroup({ label, children }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function OpsChip({ on, onClick, children }) {
  return (
    <button onClick={onClick} aria-pressed={on}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] font-semibold border transition active:scale-95 ${
              on ? "bg-amber-700 text-white border-amber-700 shadow-sm"
                 : "bg-white text-ink-700 border-ink-200 hover:border-amber-300 hover:text-amber-700"}`}>
      {children}
    </button>
  );
}

function ResultChip({ n, label }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
      <span className="tabular-nums">{n}</span> {label}
    </span>
  );
}

function OpsAction({ title, tone, onClick, children }) {
  const map = {
    emerald: "hover:bg-emerald-50 text-emerald-700",
    blue: "hover:bg-blue-50 text-blue-700",
    rose: "hover:bg-rose-50 text-rose-700",
    ink: "hover:bg-ink-100 text-ink-600",
  };
  return (
    <button onClick={onClick} title={title} aria-label={title}
            className={`w-8 h-8 rounded-md inline-flex items-center justify-center transition active:scale-90 ${map[tone] || map.ink}`}>
      {children}
    </button>
  );
}

function OpsInfo({ label, value }) {
  return (
    <div className="rounded-md border p-2.5" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}>
      <div className="text-[10px] uppercase font-bold tracking-wider text-ink-500">{label}</div>
      <div className="text-[13px] font-bold text-ink-900 mt-0.5 truncate">{value}</div>
    </div>
  );
}

const BLANK_RSV = {
  time: "18:00", name: "", phone: "", guests: 2,
  branchCode: "", branchName: "", table: "", note: "", status: "pending",
};

function ReservationForm({ open, restaurants = [], onClose, onSubmit }) {
  const [v, setV] = useState(BLANK_RSV);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({}); setTouched(false);
    const first = restaurants[0];
    setV({ ...BLANK_RSV, branchCode: first?.code || "", branchName: first?.name || "", table: "" });
  }, [open, restaurants]);

  const set = (k, val) => setV((s) => ({ ...s, [k]: val }));

  const pickBranch = (code) => {
    const r = restaurants.find((x) => x.code === code);
    setV((s) => ({ ...s, branchCode: code, branchName: r?.name || "", table: "" }));
  };

  const freeTables = useMemo(() => {
    const r = restaurants.find((x) => x.code === v.branchCode);
    return (r?.tables || []).filter((t) => t.status === "vacant");
  }, [restaurants, v.branchCode]);

  const validate = (s) => {
    const e = {};
    if (!s.name.trim()) e.name = "Bắt buộc nhập tên khách";
    else if (s.name.trim().length < 2) e.name = "Tên khách quá ngắn";
    if (!s.phone.trim()) e.phone = "Bắt buộc nhập số điện thoại";
    else if (!/^0\d{9}$/.test(s.phone.trim())) e.phone = "SĐT gồm 10 số, bắt đầu bằng 0";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time)) e.time = "Giờ không hợp lệ";
    const g = Number(s.guests);
    if (!Number.isInteger(g) || g < 1 || g > 30) e.guests = "Số khách từ 1 đến 30";
    if (!s.branchCode) e.branchCode = "Chọn nhà hàng";
    if (!s.table) e.table = freeTables.length ? "Chọn bàn còn trống" : "Nhà hàng này hiện không còn bàn trống";
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(v);
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`rsv-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    onSubmit({ ...v, name: v.name.trim(), phone: v.phone.trim(), guests: Number(v.guests) });
  };

  const err = (k) => (touched ? errors[k] : undefined);

  return (
    <Modal open={open} onClose={onClose} icon={Calendar}
           title="Tạo đặt bàn" subtitle="Các trường có dấu * là bắt buộc" width="max-w-xl"
           footer={
             <>
               {touched && Object.keys(errors).length > 0 && (
                 <span className="mr-auto text-[12px] font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--danger-fg)" }}>
                   <AlertCircle className="w-3.5 h-3.5" /> Còn {Object.keys(errors).length} trường chưa hợp lệ
                 </span>
               )}
               <button type="button" onClick={onClose} className="btn-outline">Huỷ</button>
               <button type="submit" form="rsv-form"
                       className="px-4 py-2 rounded-md bg-amber-700 text-white text-[12.5px] font-bold inline-flex items-center gap-2 hover:bg-amber-800 transition">
                 <Check className="w-4 h-4" /> Đặt bàn
               </button>
             </>
           }>
      <form id="rsv-form" onSubmit={submit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <RsvField label="Tên khách" required error={err("name")} id="rsv-name">
          <input id="rsv-name" className="input" value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Nguyễn Văn A" />
        </RsvField>
        <RsvField label="Số điện thoại" required error={err("phone")} id="rsv-phone">
          <input id="rsv-phone" className="input" inputMode="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0912345678" />
        </RsvField>
        <RsvField label="Giờ đến" required error={err("time")} id="rsv-time">
          <input id="rsv-time" type="time" className="input" value={v.time} onChange={(e) => set("time", e.target.value)} />
        </RsvField>
        <RsvField label="Số khách" required error={err("guests")} id="rsv-guests">
          <input id="rsv-guests" type="number" min="1" max="30" className="input" value={v.guests} onChange={(e) => set("guests", e.target.value)} />
        </RsvField>
        <RsvField label="Nhà hàng" required error={err("branchCode")} id="rsv-branchCode">
          <select id="rsv-branchCode" className="input" value={v.branchCode} onChange={(e) => pickBranch(e.target.value)}>
            {restaurants.map((r) => <option key={r.code} value={r.code}>{r.code} · {r.name}</option>)}
          </select>
        </RsvField>
        <RsvField label="Bàn" required error={err("table")} id="rsv-table"
                  hint={freeTables.length ? `${freeTables.length} bàn còn trống` : undefined}>
          <select id="rsv-table" className="input" value={v.table} onChange={(e) => set("table", e.target.value)}
                  disabled={!freeTables.length}>
            <option value="">{freeTables.length ? "— Chọn bàn —" : "Không còn bàn trống"}</option>
            {freeTables.map((t) => <option key={t.id} value={`Bàn ${t.id}`}>Bàn {t.id}</option>)}
          </select>
        </RsvField>
        <RsvField className="sm:col-span-2" label="Ghi chú" id="rsv-note">
          <input id="rsv-note" className="input" value={v.note} onChange={(e) => set("note", e.target.value)}
                 placeholder="Kỷ niệm, dị ứng, yêu cầu chỗ ngồi…" />
        </RsvField>
      </form>
    </Modal>
  );
}

function RsvField({ label, required, error, hint, id, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="block text-[11px] font-semibold text-ink-600 mb-1">
        {label}{required && <span style={{ color: "var(--danger)" }}> *</span>}
      </label>
      {children}
      {error ? (
        <div className="mt-1 text-[11px] font-semibold inline-flex items-center gap-1" style={{ color: "var(--danger-fg)" }}>
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </div>
      ) : hint ? (
        <div className="mt-1 text-[10.5px] text-ink-400">{hint}</div>
      ) : null}
    </div>
  );
}

/* ═══════════ SUB-COMPONENTS ═══════════ */

function SectionHeader({ icon: Icon, label, sub, right }) {
  return (
    <div className="flex items-end justify-between gap-3 sm:gap-4 mt-7 sm:mt-9 mb-3">
      <div className="flex items-stretch gap-3 min-w-0 flex-1">
        <div className="w-1 rounded-sm bg-amber-600" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-display font-bold text-[12.5px] sm:text-[14px] tracking-wide uppercase text-amber-800 flex-wrap">
            {Icon && <Icon className="w-4 h-4 text-amber-700 shrink-0" />}
            <span className="truncate">{label}</span>
          </div>
          {sub && <div className="text-[12px] text-ink-500 mt-0.5 truncate">{sub}</div>}
        </div>
      </div>
      {right && <div className="shrink-0 flex items-center gap-1.5">{right}</div>}
    </div>
  );
}

function Badge({ tone = "amber", children }) {
  const map = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    ink: "bg-ink-100 text-ink-700 border-ink-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${map[tone] || map.amber}`}>
      {children}
    </span>
  );
}

/* fill: thẻ lấp đầy chiều cao ô lưới và cho phần thân tự cuộn.
   Dùng khi hai thẻ cùng hàng lệch chiều cao nhiều — đặt chiều cao cố định
   cho hàng lưới (lg:h-[...]) rồi bật fill để cả hai cao bằng nhau, thẻ nào
   dài hơn thì cuộn bên trong thay vì kéo cả section cao lên. */
function Card({ children, className = "", title, subtitle, right, icon: Icon, accent = "amber", fill = false }) {
  const accentMap = {
    blue: "text-blue-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
    violet: "text-violet-700",
    ink: "text-ink-700",
  };
  return (
    <div className={`bg-white border border-ink-200 rounded-md ${fill ? "flex flex-col min-h-0" : ""} ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-ink-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className={`w-4 h-4 shrink-0 ${accentMap[accent] || accentMap.amber}`} />}
            <div className="min-w-0">
              {title && <div className="font-semibold text-[13px] text-ink-900 truncate">{title}</div>}
              {subtitle && <div className="text-[11px] text-ink-500 mt-0.5 truncate">{subtitle}</div>}
            </div>
          </div>
          {right && <div className="shrink-0 flex items-center gap-1.5">{right}</div>}
        </div>
      )}
      <div className={`p-4 sm:p-5 ${fill ? "flex-1 min-h-0 overflow-y-auto" : ""}`}>{children}</div>
    </div>
  );
}

function KPIBig({ label, value, sub, dotColor = "bg-amber-500", icon: Icon, accent = "amber", trend }) {
  const a = {
    blue: { icon: "bg-blue-100 text-blue-700", border: "border-l-blue-500" },
    emerald: { icon: "bg-emerald-100 text-emerald-700", border: "border-l-emerald-500" },
    amber: { icon: "bg-amber-100 text-amber-700", border: "border-l-amber-500" },
    rose: { icon: "bg-rose-100 text-rose-700", border: "border-l-rose-500" },
    violet: { icon: "bg-violet-100 text-violet-700", border: "border-l-violet-500" },
  }[accent] || { icon: "bg-amber-100 text-amber-700", border: "border-l-amber-500" };

  const up = trend.value >= 0;
  const Icn = up ? TrendingUp : TrendingDown;
  const toneCls = trend.invertColor
    ? (trend.value <= 0 ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-700 bg-rose-50 border-rose-100")
    : (up ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-700 bg-rose-50 border-rose-100");

  return (
    <div className={`bg-white border border-ink-200 border-l-4 ${a.border} rounded-md p-4 sm:p-5 relative overflow-hidden`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold truncate">
              {label}
            </span>
          </div>
          <div className="text-[22px] sm:text-[26px] leading-[1.05] font-display font-bold text-ink-900 tabular-nums mt-2 break-all">
            {value}
          </div>
          {sub && <div className="text-[12px] text-ink-500 mt-2 leading-relaxed">{sub}</div>}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-md ${a.icon} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold truncate">{trend.label}</span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${toneCls}`}>
            <Icn className="w-3 h-3" />
            {up ? "+" : ""}{trend.value}{trend.suffix || "%"}
          </span>
        </div>
      )}
    </div>
  );
}

function Dot({ color }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

function RestaurantFloor({ r, selected, onSelect, onTable }) {
  return (
    <div
      // flex-col + mt-auto ở footer: các thẻ bị kéo cao bằng thẻ nhiều bàn
      // nhất (LP3 có 32 bàn), nếu không thì thẻ ít bàn để trống một khoảng
      // lớn phía dưới thay vì dán dòng tổng kết xuống đáy.
      className={`bg-white border rounded-md p-4 transition flex flex-col ${
        selected ? "border-amber-500 ring-2 ring-amber-200/60 shadow-md" : "border-ink-200 hover:border-amber-300 hover:shadow-sm"
      }`}
    >
      {/* Nút chọn nhà hàng và các ô bàn là anh em, không lồng nhau —
          <button> trong <button> là HTML không hợp lệ, React sẽ cảnh báo. */}
      <button
        onClick={onSelect}
        aria-pressed={selected}
        title={selected ? "Bỏ lọc theo nhà hàng này" : `Lọc theo ${r.name}`}
        className="w-full text-left flex items-start justify-between gap-2 mb-3 group"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-700 truncate">
            {r.code}
          </div>
          <div className="font-display font-bold text-[14px] text-ink-900 truncate mt-0.5 group-hover:text-amber-700 transition-colors">
            {r.name}
          </div>
          <div className="text-[10px] text-ink-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{r.location}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[18px] font-display font-bold text-ink-900 tabular-nums leading-none">
            {r.occupied}/{r.total}
          </div>
          <div className="text-[10px] text-ink-500 mt-0.5">bàn đang dùng</div>
        </div>
      </button>

      <div className="grid grid-cols-5 gap-1.5 content-start">
        {r.tables.map((t) => {
          const tone = TABLE_TONE[t.status] || "neutral";
          return (
            <button
              key={t.id}
              onClick={() => onTable?.(t)}
              title={`Bàn ${t.id} · ${TABLE_LABEL[t.status] || t.status}`}
              aria-label={`Chi tiết bàn ${t.id} — ${TABLE_LABEL[t.status] || t.status}`}
              className="aspect-square rounded text-[9px] font-bold flex items-center justify-center border transition hover:scale-110 hover:shadow-sm active:scale-95"
              style={{
                background: `var(--${tone}-soft)`,
                borderColor: `var(--${tone}-border)`,
                color: `var(--${tone}-fg)`,
              }}
            >
              {t.id}
            </button>
          );
        })}
      </div>

      <button
        onClick={onSelect}
        className="w-full mt-auto pt-3 border-t border-ink-100 flex items-center justify-between text-[10px] text-ink-500"
      >
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{r.avgWait} chờ TB</span>
        <span className="font-semibold text-amber-700 truncate">{formatVND(r.revToday)}</span>
      </button>
    </div>
  );
}

function StatusPill({ s }) {
  const map = {
    seated:     { text: "Đã ngồi", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    waiting:    { text: "Chờ bàn",  cls: "bg-amber-50 text-amber-700 border-amber-200" },
    incoming:   { text: "Sắp tới",  cls: "bg-blue-50 text-blue-700 border-blue-200" },
    finished:   { text: "Hoàn tất",  cls: "bg-violet-50 text-violet-700 border-violet-200" },
    cancelled:  { text: "Hủy",       cls: "bg-rose-50 text-rose-700 border-rose-200" },
    noshow:     { text: "No-show",   cls: "bg-rose-50 text-rose-700 border-rose-200" },
    confirmed:  { text: "Xác nhận",   cls: "bg-blue-50 text-blue-700 border-blue-200" },
  };
  const cfg = map[s] || map.confirmed;
  return <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cfg.cls}`}>{cfg.text}</span>;
}

function KitchenBoard({ rows, onAdvance, onReset, hasQuery }) {
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) {
    return (
      <div className="py-10 text-center">
        <SearchX className="w-9 h-9 mx-auto text-ink-300 mb-2.5" />
        <div className="text-[13px] font-semibold text-ink-900">
          {hasQuery ? "Không có đơn nào khớp" : "Bếp đã xử lý hết đơn"}
        </div>
        {hasQuery && (
          <button onClick={onReset}
                  className="mt-3 px-4 py-2 rounded-md bg-amber-700 text-white text-[12px] font-bold inline-flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 text-[10px] uppercase tracking-wider font-bold text-ink-500 px-2 py-1">
        <div className="col-span-2">#Đơn</div>
        <div className="col-span-3">Bàn</div>
        <div className="col-span-3">Món</div>
        <div className="col-span-2 text-right">Thời gian</div>
        <div className="col-span-2 text-right">Khu bếp</div>
      </div>
      {list.map((r, i) => {
        const items = Array.isArray(r?.items) ? r.items : [];
        const cls =
          r.priority === "rush" ? "bg-rose-50 border-l-rose-500"
          : r.priority === "late" ? "bg-amber-50 border-l-amber-500"
          : "bg-white border-l-blue-500";
        return (
          <button
            key={i}
            onClick={() => onAdvance?.(r)}
            title={`Chuyển đơn ${r.id} sang bước tiếp theo`}
            className={`w-full text-left grid grid-cols-12 items-center px-2.5 py-2 rounded-md border-l-4 ${cls} text-[12px] transition hover:shadow-card hover:-translate-y-px active:scale-[.995]`}
          >
            <div className="col-span-2 font-bold text-ink-900 tabular-nums">{r.id}</div>
            <div className="col-span-3 text-ink-700 truncate">{r.table}</div>
            <div className="col-span-3 text-ink-700 truncate">
              {items.slice(0, 2).join(", ")}{items.length > 2 ? ` +${items.length - 2}` : ""}
            </div>
            <div className="col-span-2 text-right tabular-nums font-semibold">
              <span className={r.elapsed > r.target ? "text-rose-700" : "text-ink-700"}>{r.elapsed}'</span>
              {/* Hàng bếp có nền tone-soft (nâu/đỏ đậm ở dark mode) nên chữ phụ
                  phải dùng ink-600 trở lên, ink-400 chỉ đạt 2.9:1. */}
              <span className="text-ink-700 opacity-80 text-[10px] font-normal"> / {r.target}'</span>
            </div>
            <div className="col-span-2 text-right inline-flex items-center justify-end gap-1">
              <Badge tone={r.station === "Bếp nóng" ? "rose" : r.station === "Bếp lạnh" ? "blue" : "violet"}>{r.station}</Badge>
              <ChevronRight className="w-3.5 h-3.5 text-ink-400 shrink-0" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ShiftBoard({ rows }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  return (
    <div className="space-y-2.5">
      {safeRows.map((s) => (
        <div key={s.name} className="border border-ink-100 rounded-md p-2.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-md bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-ink-900 text-[12.5px] truncate">{s.name}</div>
                <div className="text-[10px] text-ink-500 tabular-nums">{s.start}–{s.end}</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[15px] font-display font-bold text-ink-900 tabular-nums">{s.on}/{s.total}</div>
              <div className="text-[10px] text-ink-500">có mặt</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(Array.isArray(s?.members) ? s.members : []).map((m, i) => (
              <div key={i} className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                m.status === "on" ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" : "bg-ink-100 text-ink-400"
              }`} title={m.name}>
                {initials(m.name).toUpperCase() || "?"}
                {m.status === "on" && <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />}
              </div>
            ))}
            <span className="text-[10px] text-ink-500 ml-1 tabular-nums">+{s.total - s.on} nghỉ</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopDishes({ items }) {
  return (
    <div className="space-y-2.5">
      {items.map((d, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-ink-50 transition">
          <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
            {i + 1}
          </div>
          <div className="w-12 h-12 rounded-md shrink-0 flex items-center justify-center text-amber-700" style={{ background: d.bg || "#fef3c7" }}>
            <Soup className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-ink-900 text-[12.5px] truncate">{d.name}</div>
            <div className="text-[10px] text-ink-500 truncate">{d.cat} · {formatVND(d.price)}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[14px] font-display font-bold text-ink-900 tabular-nums">{d.qty}</div>
            <div className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {d.rating}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryMix({ data }) {
  // Component con nên phải tự lấy palette — `tooltipStyle` của trang cha
  // không nằm trong scope này.
  const p = useChartPalette();
  return (
    <div>
      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={48} outerRadius={72} paddingAngle={2} dataKey="value" cornerRadius={3} stroke={p.surface} strokeWidth={2} startAngle={90} endAngle={-270}>
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={tipOf(p)} formatter={(v) => formatVNDFull(v)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-[9px] uppercase tracking-wider text-ink-500 font-bold">Tổng DT</div>
          <div className="text-[16px] font-display font-bold text-ink-900 tabular-nums leading-none mt-0.5">
            {formatVND(data.reduce((s, x) => s + x.value, 0))}
          </div>
        </div>
      </div>
      <div className="space-y-1.5 mt-2">
        {data.map((m) => (
          <div key={m.name} className="flex items-center gap-2 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: m.color }} />
            <span className="font-semibold text-ink-700 flex-1 truncate">{m.name}</span>
            <span className="font-bold text-ink-900 tabular-nums w-10 text-right">{m.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopTables({ items }) {
  return (
    <div className="space-y-2.5">
      {items.map((t, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-amber-50/40 transition border border-transparent hover:border-ink-100">
          <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-display font-bold tabular-nums shrink-0">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-ink-900 text-[12.5px] truncate">Bàn {t.id}</div>
            <div className="text-[10px] text-ink-500">{t.area} · {t.turns} lượt khách</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[13px] font-display font-bold text-ink-900 tabular-nums">{formatVND(t.rev)}</div>
            <div className="text-[10px] text-ink-500 truncate">{t.avgStay} khách/lượt</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Inventory({ items, onReorder }) {
  if (!items.length) {
    return <div className="py-8 text-center text-[12px] text-ink-500">Không có nguyên liệu nào khớp</div>;
  }
  return (
    <div className="space-y-2">
      {items.map((it, i) => {
        const pct = (it.stock / it.max) * 100;
        const cls = pct < 25 ? "bg-rose-500" : pct < 50 ? "bg-amber-500" : "bg-emerald-500";
        return (
          <div key={i} className="px-3 py-2.5 rounded-md border border-ink-100">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                  <CookingPot className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-ink-900 text-[12.5px] truncate">{it.name}</span>
              </div>
              <span className="text-[11px] font-bold text-ink-900 tabular-nums shrink-0">
                {it.stock}<span className="text-ink-400 font-normal">/{it.max} {it.unit}</span>
              </span>
            </div>
            <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${cls}`} style={{ width: `${Math.max(8, pct)}%` }} />
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] text-ink-500 mt-1.5">
              <span className="tabular-nums">Còn đủ dùng ~{it.days} ngày</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`font-bold ${pct < 25 ? "text-rose-700" : pct < 50 ? "text-amber-700" : "text-emerald-700"}`}>
                  {pct < 25 ? "KHẨN" : pct < 50 ? "SẮP HẾT" : "ỔN"}
                </span>
                {pct < 100 && (
                  <button onClick={() => onReorder?.(it)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition active:scale-95">
                    Đặt thêm
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PurchaseOrders({ items }) {
  return (
    <div className="space-y-2">
      {items.map((p, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5 rounded-md border border-ink-100 hover:bg-blue-50/30 transition">
          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <TruckIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono font-bold text-ink-900 text-[12px]">{p.code}</span>
              <span className="text-[10px] text-ink-500 truncate">{p.supplier}</span>
            </div>
            <div className="text-[10px] text-ink-500 tabular-nums">
              Giao dự kiến: {p.eta} · {p.items} mặt hàng
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[13px] font-display font-bold tabular-nums text-ink-900">{formatVND(p.amount)}</div>
            <Badge tone={p.status === "received" ? "emerald" : p.status === "shipped" ? "blue" : "amber"}>
              {p.status === "received" ? "Đã nhận" : p.status === "shipped" ? "Đang giao" : "Chờ duyệt"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewList({ items }) {
  return (
    <div className="space-y-3">
      {items.map((r, i) => (
        <div key={i} className="pb-3 border-b border-ink-100 last:border-0 last:pb-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-ink-900 text-[12.5px] truncate">{r.name}</span>
            <div className="flex items-center gap-0.5 shrink-0">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`w-3 h-3 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-ink-200"}`} />
              ))}
            </div>
          </div>
          <div className="text-[10px] text-ink-500 mt-0.5">{r.branch} · {r.time}</div>
          <p className="text-[11.5px] text-ink-700 mt-1 leading-relaxed">"{r.text}"</p>
          {r.dish && <div className="mt-1 text-[10px] text-amber-700 font-semibold">🍽 Đã gọi: {r.dish}</div>}
        </div>
      ))}
    </div>
  );
}

function TipsBoard({ rows }) {
  return (
    <div>
      <div className="grid grid-cols-12 text-[10px] uppercase tracking-wider font-bold text-ink-500 px-2 py-1">
        <div className="col-span-4">Nhân viên</div>
        <div className="col-span-2 text-right">Đơn</div>
        <div className="col-span-3 text-right">Hoa hồng</div>
        <div className="col-span-3 text-right">Tip</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-12 items-center px-2 py-2 rounded-md hover:bg-emerald-50/40 transition text-[12px] border-b border-ink-100 last:border-0">
          <div className="col-span-4 font-semibold text-ink-900 truncate flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              {initials(r.name).toUpperCase() || "?"}
            </div>
            <span className="truncate">{r.name}</span>
          </div>
          <div className="col-span-2 text-right tabular-nums text-ink-700">{r.orders}</div>
          <div className="col-span-3 text-right tabular-nums font-bold text-emerald-700">{formatVND(r.commission)}</div>
          <div className="col-span-3 text-right tabular-nums font-bold text-amber-700">{formatVND(r.tips)}</div>
        </div>
      ))}
    </div>
  );
}

function IssuesList({ items, onResolve }) {
  const open = items.filter((x) => x.status !== "resolved").length;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10.5px] text-ink-500 pb-1">
        <span><b className="text-ink-900 tabular-nums">{open}</b> sự cố đang mở</span>
        {open === 0 && (
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
            <CheckCircle2 className="w-3 h-3" /> Đã xử lý hết
          </span>
        )}
      </div>

      {items.map((it, i) => {
        const done = it.status === "resolved";
        return (
          <div
            key={i}
            className={`rounded-md border border-l-4 p-3 transition ${
              done ? "bg-ink-50 border-ink-200 border-l-emerald-500 opacity-70"
              : it.priority === "high" ? "bg-rose-50 border-rose-200 border-l-rose-500"
              : it.priority === "medium" ? "bg-amber-50 border-amber-200 border-l-amber-500"
              : "bg-white border-ink-200 border-l-blue-500"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge tone={done ? "emerald" : it.priority === "high" ? "rose" : it.priority === "medium" ? "amber" : "blue"}>
                {done ? "Đã xử lý" : it.priority === "high" ? "Cao" : it.priority === "medium" ? "Trung bình" : "Thấp"}
              </Badge>
              <span className={`text-[12px] font-semibold truncate ${done ? "text-ink-500 line-through" : "text-ink-900"}`}>
                {it.title}
              </span>
            </div>
            {/* Thẻ sự cố có nền tone-soft đậm ở dark mode → dùng ink-700 cho
                phần mô tả, ink-600 vẫn tụt xuống 3.8:1. */}
            <div className="text-[11px] text-ink-700 opacity-90">{it.desc}</div>
            <div className="text-[10px] text-ink-700 opacity-75 mt-1.5 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 min-w-0 truncate">
                <Clock className="w-3 h-3 shrink-0" /> {it.time} · {it.handler}
              </span>
              {!done && (
                <button
                  onClick={() => onResolve?.(i)}
                  title={`Đánh dấu đã xử lý: ${it.title}`}
                  className="shrink-0 px-2 py-0.5 rounded-full border border-emerald-300 bg-white text-emerald-700 text-[10px] font-bold hover:bg-emerald-50 transition active:scale-95 inline-flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Xử lý
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════ MULTI-CHANNEL INBOX ═══════════ */

/* Logo cho các kênh nhắn — dạng SVG inline giống brand thật */
const ChannelIcon = ({ channel, className = "w-3.5 h-3.5" }) => {
  const m = {
    zalo: { bg: "bg-[#0068FF]", letter: "Z" },
    messenger: { bg: "bg-gradient-to-br from-[#00B2FF] to-[#006AFF]", letter: "M" },
    tiktok: { bg: "bg-black", letter: "T" },
    instagram: { bg: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]", letter: "I" },
    facebook: { bg: "bg-[#1877F2]", letter: "f" },
    sms: { bg: "bg-emerald-500", letter: "S" },
    email: { bg: "bg-rose-500", letter: "@" },
    whatsapp: { bg: "bg-[#25D366]", letter: "W" },
    telegram: { bg: "bg-[#229ED9]", letter: "T" },
  }[channel] || { bg: "bg-ink-500", letter: "?" };
  return (
    <span className={`inline-flex items-center justify-center ${className} rounded-full ${m.bg} text-white font-bold text-[9px] shrink-0`} style={{ width: '1.5em', height: '1.5em' }}>
      {m.letter}
    </span>
  );
};

function MultiChannelInbox({ conversations }) {
  // Bản mock là nguồn gốc; `safe` là bản sao có thể thay đổi để trả lời được.
  const source = Array.isArray(conversations) ? conversations : [];
  const [safe, setSafe] = useState(source);
  useEffect(() => setSafe(Array.isArray(conversations) ? conversations : []), [conversations]);

  const [selectedId, setSelectedId] = useState(source[0]?.id || null);
  const selected = safe.find((c) => c.id === selectedId) || safe[0];
  const [filterChannel, setFilterChannel] = useState("all");
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const flash = useCallback((msg) => {
    setNote(msg);
    setTimeout(() => setNote(""), 2200);
  }, []);

  /** Ghi thêm một tin nhắn vào hội thoại đang mở và xoá cờ chưa đọc */
  const pushMessage = useCallback((msg) => {
    if (!selected) return;
    const time = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    setSafe((list) =>
      list.map((c) =>
        c.id === selected.id
          ? { ...c, unread: 0, typing: false, messages: [...(c.messages || []), { from: "staff", time, read: false, ...msg }] }
          : c
      )
    );
  }, [selected]);

  const send = useCallback(() => {
    const text = reply.trim();
    if (!text) return;
    pushMessage({ text });
    setReply("");
    flash("Đã gửi tin nhắn");
  }, [reply, pushMessage, flash]);

  // Mở hội thoại nào thì hội thoại đó hết chưa đọc
  const openThread = useCallback((id) => {
    setSelectedId(id);
    setSafe((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }, []);

  const channelDefs = [
    { id: "all", label: "Tất cả", count: safe.length, tone: "bg-amber-700 text-white border-amber-700" },
    { id: "zalo", label: "Zalo", count: safe.filter((c) => c.channel === "zalo").length, tone: "bg-blue-50 text-blue-700 border-blue-200" },
    { id: "messenger", label: "Messenger", count: safe.filter((c) => c.channel === "messenger").length, tone: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    { id: "tiktok", label: "TikTok", count: safe.filter((c) => c.channel === "tiktok").length, tone: "bg-ink-900 text-white border-ink-900" },
    { id: "instagram", label: "Instagram", count: safe.filter((c) => c.channel === "instagram").length, tone: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
    { id: "facebook", label: "Facebook", count: safe.filter((c) => c.channel === "facebook").length, tone: "bg-blue-50 text-blue-700 border-blue-200" },
    { id: "sms", label: "SMS", count: safe.filter((c) => c.channel === "sms").length, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "email", label: "Email", count: safe.filter((c) => c.channel === "email").length, tone: "bg-rose-50 text-rose-700 border-rose-200" },
    { id: "whatsapp", label: "WhatsApp", count: safe.filter((c) => c.channel === "whatsapp").length, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ];

  const filtered = filterChannel === "all" ? safe : safe.filter((c) => c.channel === filterChannel);

  return (
    <>
    {/* Mobile: hai panel xếp dọc, mỗi panel tự có chiều cao riêng — nếu ép
        h-[520px] cho cả cụm thì trên điện thoại danh sách và khung chat chia
        nhau 520px, cả hai đều không dùng được. */}
    <div className="grid grid-cols-12 gap-3 md:h-[520px]">
      {/* LEFT — channel filter + conversation list */}
      <div className="col-span-12 md:col-span-4 h-[300px] md:h-auto border border-ink-200 rounded-md overflow-hidden flex flex-col bg-ink-50/40">
        {/* Channel pills */}
        <div className="px-2.5 py-2 border-b border-ink-200 bg-white">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
            {channelDefs.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setFilterChannel(ch.id)}
                className={`shrink-0 px-2 py-1 rounded-full text-[10.5px] font-bold border whitespace-nowrap transition ${
                  filterChannel === ch.id ? ch.tone + " shadow-sm" : "bg-white text-ink-700 border-ink-200 hover:border-amber-300"
                }`}
              >
                {ch.label}
                <span className={`ml-1 tabular-nums ${filterChannel === ch.id ? "opacity-90" : "text-ink-500"}`}>{ch.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => {
            const active = selected?.id === c.id;
            const lastMsg = c.messages?.[c.messages.length - 1];
            const lastFrom = lastMsg?.from || "customer";
            return (
              <button
                key={c.id}
                onClick={() => openThread(c.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-ink-100 transition flex items-start gap-2.5 ${
                  active ? "bg-amber-50" : "hover:bg-amber-50/40"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center font-bold text-[12px]">
                    {initials(c.name).toUpperCase() || "?"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 ring-2 ring-white rounded-full">
                    <ChannelIcon channel={c.channel} className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-ink-900 text-[12px] truncate">{c.name}</div>
                    <div className="text-[9.5px] text-ink-500 tabular-nums shrink-0">{c.lastTime}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <div className="text-[10.5px] text-ink-600 truncate">
                      {lastFrom === "staff" && <span className="text-ink-600 mr-0.5">Bạn:</span>}
                      {lastMsg?.text || "—"}
                    </div>
                    {c.unread > 0 && (
                      <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-bold flex items-center justify-center tabular-nums">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <ChannelLabel channel={c.channel} />
                    {c.branchCode && (
                      <span className="inline-flex items-center text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
                        {c.branchCode}
                      </span>
                    )}
                    {c.tag && (
                      <span className="inline-flex items-center text-[9px] font-semibold text-ink-600 bg-ink-100 px-1 rounded truncate">
                        #{c.tag}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-6 text-center text-[11px] text-ink-500">Không có hội thoại trên kênh này</div>
          )}
        </div>
      </div>

      {/* RIGHT — chat thread */}
      <div className="col-span-12 md:col-span-8 h-[460px] md:h-auto border border-ink-200 rounded-md flex flex-col bg-white overflow-hidden">
        {selected ? (
          <>
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-ink-200 flex items-center justify-between gap-2 bg-gradient-to-r from-amber-50/60 to-rose-50/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center font-bold text-[12px]">
                    {initials(selected.name).toUpperCase() || "?"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 ring-2 ring-white rounded-full">
                    <ChannelIcon channel={selected.channel} className="w-3 h-3" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-ink-900 text-[12.5px] truncate flex items-center gap-1.5">
                    {selected.name}
                    {selected.verified && <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-ink-500 flex items-center gap-1.5 flex-wrap">
                    <ChannelLabel channel={selected.channel} detail />
                    <span>·</span>
                    <span>{selected.phone || selected.handle}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => flash(selected.phone ? `Đang gọi ${selected.phone}…` : "Khách này chưa có số điện thoại")}
                  className="w-7 h-7 rounded-md hover:bg-ink-100 text-ink-500 hover:text-amber-700 flex items-center justify-center transition"
                  title="Gọi"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setProfileOpen(true)}
                  className="w-7 h-7 rounded-md hover:bg-ink-100 text-ink-500 hover:text-amber-700 flex items-center justify-center transition"
                  title="Hồ sơ khách"
                >
                  <Users className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    pushMessage({ type: "system", text: `Đã tạo đơn nháp cho ${selected.name}` });
                    flash("Đã tạo đơn nháp từ hội thoại");
                  }}
                  className="w-7 h-7 rounded-md hover:bg-ink-100 text-ink-500 hover:text-amber-700 flex items-center justify-center transition"
                  title="Tạo đơn từ hội thoại"
                >
                  <Receipt className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setSafe((l) => l.map((c) => (c.id === selected.id ? { ...c, unread: c.unread ? 0 : 1 } : c)));
                    flash(selected.unread ? "Đã đánh dấu đã đọc" : "Đã đánh dấu chưa đọc");
                  }}
                  className="w-7 h-7 rounded-md hover:bg-ink-100 text-ink-500 hover:text-amber-700 flex items-center justify-center transition"
                  title={selected.unread ? "Đánh dấu đã đọc" : "Đánh dấu chưa đọc"}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Context bar — quick info */}
            {selected.context && (
              <div className="px-4 py-2 bg-ink-50 border-b border-ink-200 text-[10.5px] flex items-center gap-3 flex-wrap text-ink-700">
                <span className="font-bold uppercase tracking-wider text-ink-500">Ngữ cảnh:</span>
                {selected.context.orderCode && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                    <Receipt className="w-2.5 h-2.5" /> Đơn {selected.context.orderCode}
                  </span>
                )}
                {selected.context.table && (
                  <span className="inline-flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-ink-400" /> {selected.context.table}
                  </span>
                )}
                {selected.context.branchCode && (
                  <span className="inline-flex items-center gap-1">
                    <Store className="w-3 h-3 text-ink-400" /> {selected.context.branchCode}
                  </span>
                )}
                {selected.context.guests && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3 h-3 text-ink-400" /> {selected.context.guests} khách
                  </span>
                )}
                {selected.context.time && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-ink-400" /> {selected.context.time}
                  </span>
                )}
                {selected.context.value && (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    💰 {selected.context.value}
                  </span>
                )}
                {selected.context.sla && (
                  <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                    <Hourglass className="w-2.5 h-2.5" /> SLA {selected.context.sla}
                  </span>
                )}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gradient-to-b from-ink-50/40 to-white">
              {(selected.messages || []).map((m, i) => (
                <Bubble key={i} m={m} prev={selected.messages[i - 1]} />
              ))}
              {selected.typing && (
                <div className="flex items-center gap-1.5 text-[10.5px] text-ink-500 italic">
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                  {selected.name} đang nhập…
                </div>
              )}
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2 border-t border-ink-200 bg-white flex items-center gap-1 overflow-x-auto">
              <Reply className="w-3 h-3 text-ink-400 shrink-0" />
              {selected.quickReplies?.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setReply(q)}
                  className="shrink-0 px-2 py-1 rounded-full text-[10.5px] font-semibold border border-ink-200 bg-ink-50 text-ink-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Composer */}
            <div className="px-4 py-2.5 border-t border-ink-200 bg-white flex items-end gap-2 relative">
              {/* Toast nội bộ panel — nổi ngay trên ô soạn */}
              {note && (
                <div className="absolute -top-9 left-4 px-2.5 py-1 rounded-md bg-ink-900 text-white text-[10.5px] font-semibold shadow-lg animate-fadeIn">
                  {note}
                </div>
              )}
              <button
                onClick={() => {
                  pushMessage({ type: "system", text: "Đã đính kèm: menu-thang-08.pdf" });
                  flash("Đã đính kèm tệp mẫu");
                }}
                className="w-8 h-8 rounded-md hover:bg-ink-100 text-ink-500 hover:text-amber-700 flex items-center justify-center shrink-0 transition"
                title="Đính kèm tệp"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  pushMessage({ type: "system", text: "Đã gửi ảnh món ăn" });
                  flash("Đã gửi ảnh");
                }}
                className="w-8 h-8 rounded-md hover:bg-ink-100 text-ink-500 hover:text-amber-700 flex items-center justify-center shrink-0 transition"
                title="Gửi ảnh"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <div className="relative shrink-0">
                <button
                  onClick={() => setEmojiOpen((v) => !v)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition ${
                    emojiOpen ? "bg-amber-100 text-amber-700" : "hover:bg-ink-100 text-ink-500 hover:text-amber-700"
                  }`}
                  title="Chèn emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                {emojiOpen && (
                  <div className="absolute bottom-10 left-0 z-20 p-1.5 rounded-md bg-white border border-ink-200 shadow-lg grid grid-cols-6 gap-0.5 w-[168px]">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => { setReply((r) => r + e); setEmojiOpen(false); }}
                        className="w-6 h-6 rounded hover:bg-amber-50 text-[14px] leading-none flex items-center justify-center"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={`Trả lời qua ${channelDefs.find((x) => x.id === selected.channel)?.label || "tin nhắn"}… (Enter để gửi)`}
                rows={1}
                className="flex-1 resize-none px-3 py-2 rounded-md border border-ink-200 bg-ink-50 text-[12px] focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 max-h-20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button
                onClick={send}
                disabled={!reply.trim()}
                className={`px-3 py-2 rounded-md text-[12px] font-bold flex items-center gap-1.5 transition shrink-0 ${
                  reply.trim()
                    ? "bg-amber-700 hover:bg-amber-800 text-white shadow-sm active:scale-95"
                    : "bg-ink-100 text-ink-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Gửi
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-ink-400 text-[12px]">
            Chọn một hội thoại để xem chi tiết
          </div>
        )}
      </div>
    </div>

    <Modal
      open={profileOpen && !!selected}
      onClose={() => setProfileOpen(false)}
      icon={Users}
      title={selected?.name || ""}
      subtitle="Hồ sơ khách từ hội thoại"
      width="max-w-sm"
    >
      {selected && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center font-bold text-[15px] shrink-0">
              {initials(selected.name).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-ink-900 text-[14px] truncate">{selected.name}</div>
              <div className="mt-0.5"><ChannelLabel channel={selected.channel} detail /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <OpsInfo label="Liên hệ" value={selected.phone || selected.handle || "—"} />
            <OpsInfo label="Chi nhánh" value={selected.branchCode || "—"} />
            <OpsInfo label="Nhãn" value={selected.tag ? `#${selected.tag}` : "—"} />
            <OpsInfo label="Chưa đọc" value={String(selected.unread || 0)} />
            <OpsInfo label="Số tin nhắn" value={String(selected.messages?.length || 0)} />
            <OpsInfo label="Xác thực" value={selected.verified ? "Đã xác thực" : "Chưa"} />
          </div>
          {selected.context && (
            <div className="rounded-md border border-ink-200 bg-ink-50 p-2.5 text-[11px] text-ink-700 space-y-1">
              <div className="font-bold uppercase tracking-wider text-[9.5px] text-ink-500">Ngữ cảnh gần nhất</div>
              {selected.context.orderCode && <div>Đơn: <b>{selected.context.orderCode}</b></div>}
              {selected.context.table && <div>Bàn: <b>{selected.context.table}</b></div>}
              {selected.context.guests && <div>Số khách: <b>{selected.context.guests}</b></div>}
              {selected.context.value && <div>Giá trị: <b>{selected.context.value}</b></div>}
            </div>
          )}
        </div>
      )}
    </Modal>
    </>
  );
}

function ChannelLabel({ channel, detail = false }) {
  const m = {
    zalo:      { label: detail ? "Zalo OA" : "Zalo",      cls: "bg-blue-50 text-blue-700 border-blue-200" },
    messenger: { label: detail ? "Facebook Messenger" : "Messenger", cls: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    tiktok:    { label: detail ? "TikTok DM" : "TikTok",  cls: "bg-ink-900 text-white border-ink-900" },
    instagram: { label: detail ? "Instagram DM" : "Instagram", cls: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
    facebook:  { label: detail ? "Facebook Page" : "Facebook", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    sms:       { label: detail ? "SMS Brandname" : "SMS",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    email:     { label: detail ? "Email" : "Email",        cls: "bg-rose-50 text-rose-700 border-rose-200" },
    whatsapp:  { label: detail ? "WhatsApp Business" : "WhatsApp", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    telegram:  { label: detail ? "Telegram" : "Telegram",   cls: "bg-sky-50 text-sky-700 border-sky-200" },
  }[channel] || { label: channel, cls: "bg-ink-100 text-ink-700 border-ink-200" };
  return (
    <span className={`inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider px-1 py-0.5 rounded border ${m.cls}`}>
      {m.label}
    </span>
  );
}

function Bubble({ m, prev }) {
  const isStaff = m.from === "staff";
  const sameAuthor = prev && prev.from === m.from;
  const time = m.time || "";

  if (m.type === "system") {
    return (
      <div className="flex justify-center">
        <span className="text-[10px] text-ink-500 bg-ink-100 border border-ink-200 px-2 py-1 rounded-full">
          {m.text}
        </span>
      </div>
    );
  }

  if (m.type === "image") {
    return (
      <div className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[75%] ${isStaff ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
          <div className="rounded-md overflow-hidden border border-ink-200">
            <img src={m.src} alt={m.alt || ""} className="max-w-[260px] w-full object-cover" loading="lazy" />
          </div>
          <div className={`text-[9.5px] text-ink-500 flex items-center gap-1 ${isStaff ? "flex-row-reverse" : ""}`}>
            <span className="tabular-nums">{time}</span>
            {isStaff && (m.read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-ink-400" />)}
          </div>
        </div>
      </div>
    );
  }

  if (m.type === "card") {
    return (
      <div className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[80%] rounded-md border ${isStaff ? "bg-amber-50 border-amber-200" : "bg-white border-ink-200"} overflow-hidden`}>
          <div className="px-3 py-2 border-b border-ink-100 bg-white/70 flex items-center gap-1.5">
            <Receipt className="w-3 h-3 text-amber-700" />
            <span className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider">{m.cardTitle || "Đơn hàng"}</span>
          </div>
          <div className="p-3 space-y-1.5 text-[11.5px]">
            {m.lines?.map((l, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <span className="text-ink-700">· {l.name} <span className="text-ink-400">×{l.qty}</span></span>
                <span className="font-bold text-ink-900 tabular-nums">{formatVND(l.price)}</span>
              </div>
            ))}
            {m.total && (
              <div className="flex items-center justify-between gap-3 pt-1.5 mt-1.5 border-t border-ink-200">
                <span className="font-bold text-ink-700">Tổng</span>
                <span className="font-bold text-emerald-700 tabular-nums">{formatVND(m.total)}</span>
              </div>
            )}
          </div>
          {m.actions && (
            <div className="px-3 py-2 border-t border-ink-100 bg-white/70 flex gap-1.5">
              {m.actions.map((a, i) => (
                <button key={i} className="flex-1 px-2 py-1 rounded text-[10.5px] font-bold border border-amber-200 text-amber-800 hover:bg-amber-100">
                  {a}
                </button>
              ))}
            </div>
          )}
          <div className="px-3 py-1 text-[9.5px] text-ink-500 flex items-center justify-between">
            <span>{time}</span>
            {isStaff && (m.read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-ink-400" />)}
          </div>
        </div>
      </div>
    );
  }

  // Default text bubble
  return (
    <div className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] ${sameAuthor ? "mt-0.5" : "mt-2"} ${isStaff ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
        {!sameAuthor && (
          <div className={`text-[10px] font-bold mb-0.5 ${isStaff ? "text-amber-700" : "text-ink-500"}`}>
            {isStaff ? "Condo HUB" : m.author || "Khách"}
          </div>
        )}
        <div
          className={`px-3 py-2 rounded-2xl text-[12px] leading-relaxed ${
            isStaff
              ? "bg-gradient-to-br from-amber-600 to-rose-600 text-white rounded-br-md"
              : "bg-white border border-ink-200 text-ink-800 rounded-bl-md"
          }`}
        >
          {m.text}
        </div>
        <div className={`text-[9.5px] text-ink-500 flex items-center gap-1 ${isStaff ? "flex-row-reverse" : ""}`}>
          <span className="tabular-nums">{time}</span>
          {isStaff && (m.read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-ink-400" />)}
        </div>
      </div>
    </div>
  );
}

/* TruckIcon local placeholder to avoid extra lucide import */
function TruckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function Truck({ ...props }) {
  return <TruckIcon {...props} />;
}

/* ═══════════ DATA ═══════════ */

function buildData({ shift, branch }) {
  /* Sơ đồ bàn — mỗi ký tự là một bàn, đánh số 01 → 35 theo thứ tự.
     o = đang phục vụ · v = trống · r = đã đặt · x = bảo trì
     Mỗi nhóm 5 ký tự = đúng một hàng của lưới grid-cols-5 nên soi bằng mắt
     là ra ngay sơ đồ thật. Tổng bàn và số bàn đang dùng được TÍNH từ chuỗi
     này (xem makeRestaurant) thay vì gõ tay, nên không bao giờ lệch nhau. */
  const restaurants = [
    makeRestaurant({
      id: "lp1", code: "LP1", name: "Condo HUB Sài Gòn", area: "Quận 1",
      avgWait: 10, revToday: 118_400_000,
      map: "ooroo ovooo oooxo ovoor oooov ooovo ooooo",
    }),
    makeRestaurant({
      id: "lp2", code: "LP2", name: "Condo HUB Đà Lạt", area: "Phường 4",
      avgWait: 7, revToday: 96_800_000,
      map: "ooroo voovo oroov ooxvo voroo ovoor oovoo",
    }),
    makeRestaurant({
      id: "lp3", code: "LP3", name: "Condo HUB Phú Quốc", area: "Bãi Trường",
      avgWait: 14, revToday: 142_600_000,
      map: "oooor ooooo oxooo ooovo ooroo oooov ooooo",
    }),
    makeRestaurant({
      id: "lp4", code: "LP4", name: "Condo HUB Nha Trang", area: "Trần Phú",
      avgWait: 8, revToday: 88_200_000,
      map: "oorvo oovvo xovoo oroov ovoro oovoo voroo",
    }),
  ];

  const heroMeta = [
    { label: "Ngày", value: TODAY },
    { label: "Tổng bàn", value: restaurants.reduce((s, r) => s + r.total, 0) },
    { label: "Đang dùng", value: restaurants.reduce((s, r) => s + r.occupied, 0) },
    { label: "Nhà hàng", value: restaurants.length },
  ];

  const kitchen = [
    { id: "#A247", table: "LP3 · Bàn 12 (Terrace)", items: ["Bò Wagyu áp chảo", "Súp bào ngư", "Salad Caesar"], elapsed: 14, target: 15, priority: "late",  station: "Bếp nóng" },
    { id: "#A251", table: "LP1 · Bàn 07 (VIP)",     items: ["Tôm hùm nướng bơ", "Khoai tây nghiền"],  elapsed: 22, target: 20, priority: "rush",  station: "Bếp nóng" },
    { id: "#A253", table: "LP2 · Bàn 09",            items: ["Pizza Margherita", "Tiramisu"],          elapsed: 6,  target: 15, priority: "ok",    station: "Lò nướng" },
    { id: "#A255", table: "LP4 · Bàn 03",            items: ["Sashimi set", "Miso soup"],               elapsed: 4,  target: 12, priority: "ok",    station: "Bếp lạnh" },
    { id: "#A258", table: "LP1 · Bàn 02",            items: ["Phở bò Wagyu", "Chả giò"],               elapsed: 11, target: 10, priority: "late",  station: "Bếp nóng" },
    { id: "#A259", table: "LP3 · Bàn 22",            items: ["Cơm chiên hải sản", "Sữa dừa"],        elapsed: 3,  target: 12, priority: "ok",    station: "Bếp nóng" },
    { id: "#A261", table: "LP2 · Bàn 14",            items: ["Lẩu Thái", "Bò Mỹ"],                     elapsed: 8,  target: 18, priority: "ok",    station: "Bếp nóng" },
  ];

  const shifts = [
    { name: "Ca sáng", start: "06:00", end: "14:00", on: 12, total: 14,
      members: makeMembers(14, 12) },
    { name: "Ca trưa", start: "11:00", end: "15:00", on: 18, total: 20,
      members: makeMembers(20, 18) },
    { name: "Ca chiều", start: "15:00", end: "19:00", on: 8, total: 10,
      members: makeMembers(10, 8) },
    { name: "Ca tối", start: "17:00", end: "23:00", on: 22, total: 26,
      members: makeMembers(26, 22) },
    { name: "Ca đêm", start: "22:00", end: "06:00", on: 4, total: 6,
      members: makeMembers(6, 4) },
  ];

  const topDishes = [
    { name: "Bò Wagyu áp chảo",  qty: 84, price: 1_280_000, cat: "Món chính · Beef", rating: 4.9, bg: "#fef3c7" },
    { name: "Tôm hùm nướng bơ", qty: 62, price: 2_450_000, cat: "Hải sản",         rating: 4.9, bg: "#fee2e2" },
    { name: "Súp bào ngư",      qty: 56, price: 680_000,   cat: "Khai vị",         rating: 4.8, bg: "#dbeafe" },
    { name: "Pizza Margherita", qty: 48, price: 320_000,   cat: "Ý · Lò nướng",    rating: 4.6, bg: "#fce7f3" },
    { name: "Sashimi set",      qty: 42, price: 890_000,   cat: "Nhật · Bếp lạnh", rating: 4.7, bg: "#dcfce7" },
  ];

  const categoryMix = [
    { name: "Món chính",       value: 168_400_000, pct: 38, color: "#f59e0b" },
    { name: "Hải sản",         value: 132_800_000, pct: 30, color: "#0ea5e9" },
    { name: "Khai vị / Súp",   value: 53_100_000,  pct: 12, color: "#8b5cf6" },
    { name: "Tráng miệng",     value: 44_200_000,  pct: 10, color: "#f43f5e" },
    { name: "Đồ uống",         value: 44_300_000,  pct: 10, color: "#10b981" },
  ];

  const rev14 = Array.from({ length: 14 }, (_, i) => ({
    d: `${i + 1}/8`,
    rev: Math.round(280_000_000 + Math.sin(i / 3) * 60_000_000 + (i % 7 === 5 ? 80_000_000 : 0)),
    guests: Math.round(180 + Math.cos(i / 2) * 50),
  }));

  const peakHours = [
    { h: "10h", guests: 18, peak: false },
    { h: "11h", guests: 42, peak: false },
    { h: "12h", guests: 156, peak: true },
    { h: "13h", guests: 184, peak: true },
    { h: "14h", guests: 96, peak: false },
    { h: "15h", guests: 32, peak: false },
    { h: "16h", guests: 24, peak: false },
    { h: "17h", guests: 48, peak: false },
    { h: "18h", guests: 142, peak: true },
    { h: "19h", guests: 198, peak: true },
    { h: "20h", guests: 176, peak: true },
    { h: "21h", guests: 88, peak: false },
    { h: "22h", guests: 32, peak: false },
  ];

  const reservations = [
    { id: "R001", time: "11:30", name: "Nguyễn Minh K.", phone: "0901 234 567", branchCode: "LP1", branchName: "Sài Gòn", table: "Bàn 05 (4 chỗ)", guests: 4, note: "Góc view, hoa tươi", status: "confirmed" },
    { id: "R002", time: "12:00", name: "Lê Hoa Phương", phone: "0912 345 678", branchCode: "LP3", branchName: "Phú Quốc", table: "Bàn 22 (6 chỗ)", guests: 6, note: "Sinh nhật, bánh kem", status: "seated" },
    { id: "R003", time: "12:15", name: "Trần Văn Nam", phone: "0923 456 789", branchCode: "LP2", branchName: "Đà Lạt", table: "Bàn 09 (2 chỗ)", guests: 2, note: "Window seat", status: "incoming" },
    { id: "R004", time: "13:00", name: "Cty TNHH ABC", phone: "0934 567 890", branchCode: "LP1", branchName: "Sài Gòn", table: "Phòng VIP 2 (10 chỗ)", guests: 8, note: "Set menu 1.2tr/ng", status: "waiting" },
    { id: "R005", time: "18:30", name: "Sarah Lee",     phone: "+82 10 1234 5678", branchCode: "LP3", branchName: "Phú Quốc", table: "Terrace (4 chỗ)", guests: 4, note: "Allergic shrimp", status: "confirmed" },
    { id: "R006", time: "19:00", name: "Phạm Thị Lan", phone: "0945 678 901", branchCode: "LP4", branchName: "Nha Trang", table: "Bàn 14 (4 chỗ)", guests: 4, note: "Anniversary", status: "seated" },
    { id: "R007", time: "19:30", name: "Đỗ Quang Huy", phone: "0956 789 012", branchCode: "LP1", branchName: "Sài Gòn", table: "Phòng VIP 1 (12 chỗ)", guests: 10, note: "Business dinner", status: "confirmed" },
    { id: "R008", time: "20:00", name: "Walk-in",       phone: "—",                 branchCode: "LP3", branchName: "Phú Quốc", table: "Bàn 28 (2 chỗ)", guests: 2, note: "", status: "waiting" },
    { id: "R009", time: "20:30", name: "Đoàn VNG (24)", phone: "0967 890 123", branchCode: "LP1", branchName: "Sài Gòn", table: "Sảnh lớn (24 chỗ)", guests: 24, note: "Set menu 1.8tr", status: "incoming" },
  ];

  const topTables = [
    { id: "12", area: "LP3 · Terrace ocean view", turns: 9,  rev: 18_400_000, avgStay: 4 },
    { id: "VIP2", area: "LP1 · Phòng VIP 2",      turns: 3,  rev: 12_600_000, avgStay: 8 },
    { id: "22", area: "LP3 · Beachfront",          turns: 11, rev: 9_200_000,  avgStay: 6 },
    { id: "VIP1", area: "LP1 · Phòng VIP 1",      turns: 2,  rev: 8_800_000,  avgStay: 10 },
    { id: "09", area: "LP4 · Garden",              turns: 7,  rev: 6_400_000,  avgStay: 4 },
  ];

  const inventory = [
    { name: "Bò Wagyu A5 (Nhật)", stock: 4, max: 30, unit: "kg",   days: 1 },
    { name: "Tôm hùm Alaska",    stock: 6, max: 40, unit: "con",  days: 2 },
    { name: "Bào ngư Đài Loan",   stock: 18, max: 60, unit: "con", days: 3 },
    { name: "Rau xà lách organic",stock: 12, max: 50, unit: "kg",  days: 2 },
    { name: "Pho mát Burrata",    stock: 22, max: 40, unit: "cục",  days: 4 },
    { name: "Rượu vang Château",  stock: 28, max: 80, unit: "chai", days: 6 },
    { name: "Gạo Japonica",       stock: 240, max: 500, unit: "kg", days: 14 },
    { name: "Dầu ô-liu extra",    stock: 18, max: 50, unit: "chai", days: 7 },
  ];

  const pos = [
    { code: "PO-2607-0142", supplier: "Cty TNHH Wagyu Japan", eta: "Hôm nay 14:00", items: 6,  amount: 18_400_000, status: "shipped" },
    { code: "PO-2607-0143", supplier: "Hải sản Phú Quốc",    eta: "Hôm nay 16:30", items: 12, amount: 8_200_000,  status: "received" },
    { code: "PO-2607-0144", supplier: "Rau củ Đà Lạt Organic", eta: "Mai 06:00",   items: 18, amount: 2_400_000,  status: "pending" },
    { code: "PO-2607-0145", supplier: "Cty TNHH Rượu Đà Lạt", eta: "30/07 10:00", items: 8,  amount: 24_800_000, status: "shipped" },
    { code: "PO-2607-0146", supplier: "Phô mai Âu Cheese Co.", eta: "31/07 09:00", items: 5,  amount: 6_400_000,  status: "pending" },
  ];

  const reviews = [
    { name: "Nguyễn Minh Khôi", branch: "LP1 · Sài Gòn", time: "12 phút trước", rating: 5, text: "Bò Wagyu mềm như tan trong miệng. Set menu đáng tiền!", dish: "Bò Wagyu áp chảo" },
    { name: "Sarah Lee",        branch: "LP3 · Phú Quốc", time: "1 giờ trước",   rating: 5, text: "Phục vụ chu đáo, đầu bếp thay đổi món khi biết tôi dị ứng tôm.", dish: "Sashimi set" },
    { name: "Lê Hoa Phương",    branch: "LP3 · Phú Quốc", time: "3 giờ trước",   rating: 4, text: "View biển đẹp. Phần hơi nhỏ so với giá.", dish: "Tôm hùm nướng bơ" },
    { name: "Trần Văn Nam",     branch: "LP2 · Đà Lạt",   time: "Hôm qua",       rating: 5, text: "Pizza lò củi chín tới, nhân viên nhiệt tình.", dish: "Pizza Margherita" },
    { name: "Đỗ Quang Huy",     branch: "LP4 · Nha Trang", time: "Hôm qua",       rating: 4, text: "Không gian lãng mạn, hợp hẹn hò cặp đôi.", dish: "Lẩu Thái hải sản" },
  ];

  const tips = [
    { name: "Nguyễn Văn An", orders: 28, commission: 4_200_000, tips: 1_840_000 },
    { name: "Trần Thị Bình", orders: 24, commission: 3_600_000, tips: 1_560_000 },
    { name: "Lê Quốc Cường", orders: 19, commission: 2_850_000, tips: 980_000 },
    { name: "Phạm Hồng Duyên", orders: 32, commission: 4_800_000, tips: 2_120_000 },
    { name: "Đỗ Minh Khoa",  orders: 15, commission: 2_250_000, tips: 720_000 },
    { name: "Võ Thị Lan",    orders: 21, commission: 3_150_000, tips: 1_260_000 },
  ];

  const issues = [
    { priority: "high",   title: "Bếp nóng LP1 quá tải ca tối", desc: "Đơn #A251 trễ 2 phút. Cần tăng 1 đầu bếp phụ.", time: "5 phút trước", handler: "Đầu bếp Trần Văn B" },
    { priority: "medium", title: "Khách phàn nàn độ ồn LP3",     desc: "Phòng 22 — bàn karaoke gần. Đã chuyển bàn.",  time: "12 phút trước", handler: "Quản lý Lê Hoa P" },
    { priority: "medium", title: "Thiếu bào ngư LP4",            desc: "Đã đặt thêm 30 con từ nhà cung cấp Đài Loan.", time: "30 phút trước", handler: "Bếp Phạm Hồng D" },
    { priority: "low",    title: "Tủ lạnh bảo quản rung nhẹ",  desc: "LP2 · Bếp lạnh. Lịch sửa 30/07 14:00.",       time: "1 giờ trước",  handler: "Kỹ thuật Hoàng" },
  ];

  /* ═══ INBOX ĐA KÊNH — dữ liệu mô phỏng thật ═══ */
  const channels = [
    { id: "zalo",      short: "Zalo",      name: "Zalo OA · Condo HUB",      tone: "bg-blue-50 text-blue-700 border-blue-200",        dot: "bg-[#0068FF]", unread: 14 },
    { id: "messenger", short: "Messenger", name: "Facebook Messenger",        tone: "bg-cyan-50 text-cyan-700 border-cyan-200",        dot: "bg-gradient-to-r from-cyan-400 to-blue-500", unread: 9 },
    { id: "tiktok",    short: "TikTok",    name: "TikTok DM @condohub.vn",  tone: "bg-ink-900 text-white border-ink-900",            dot: "bg-black", unread: 7 },
    { id: "instagram", short: "IG",        name: "Instagram @condohub",      tone: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", dot: "bg-gradient-to-r from-fuchsia-400 to-rose-400", unread: 5 },
    { id: "facebook",  short: "FB",        name: "Facebook Page /condo.hub", tone: "bg-blue-50 text-blue-700 border-blue-200",        dot: "bg-[#1877F2]", unread: 4 },
    { id: "sms",       short: "SMS",       name: "SMS Brandname CONDO HUB",  tone: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", unread: 3 },
    { id: "email",     short: "Email",     name: "Email contact@condohub.vn",tone: "bg-rose-50 text-rose-700 border-rose-200",        dot: "bg-rose-500", unread: 2 },
  ];

  const conversations = [
    {
      id: "c1",
      channel: "zalo",
      name: "Nguyễn Minh K.",
      phone: "0901 234 567",
      verified: true,
      handle: "@minhkhanh.zalo",
      lastTime: "09:24",
      unread: 2,
      branchCode: "LP3",
      tag: "VIP",
      context: {
        orderCode: "#A261",
        table: "Bàn 14 (4 chỗ)",
        branchCode: "LP3 · Phú Quốc",
        guests: 4,
        time: "12:30 hôm nay",
        value: "4.250.000đ",
        sla: "5 phút",
      },
      typing: true,
      quickReplies: ["Cảm ơn anh/chị đã phản hồi", "Bếp đang chuẩn bị", "Báo quản lý kiểm tra"],
      messages: [
        { from: "customer", text: "Cho mình hỏi món Wagyu còn không ạ?", time: "09:18", author: "Nguyễn Minh K." },
        { from: "staff",    text: "Dạ còn ạ, bếp vừa nhập thêm 2kg Wagyu A5 sáng nay ạ 🙏", time: "09:19" },
        { from: "customer", text: "Mình muốn đặt thêm phần bào ngư Đài Loan cho 4 người, có cần báo trước không?", time: "09:22", author: "Nguyễn Minh K." },
        { from: "staff",    text: "Dạ anh/chị cho em xin đơn hiện tại để em cập nhật nhé ạ", time: "09:23" },
      ],
    },
    {
      id: "c2",
      channel: "messenger",
      name: "Sarah Lee",
      phone: "+82 10 1234 5678",
      verified: true,
      handle: "sarah.lee.kr",
      lastTime: "09:21",
      unread: 1,
      branchCode: "LP3",
      tag: "Quốc tế",
      context: {
        orderCode: "#A255",
        table: "Terrace (4 chỗ)",
        branchCode: "LP3 · Phú Quốc",
        guests: 4,
        time: "13:00 hôm nay",
        value: "6.800.000đ",
      },
      quickReplies: ["Confirm reservation", "Send menu PDF", "Call back"],
      messages: [
        { from: "customer", text: "Hi! I have a booking at 13:00 today. Can I change to outdoor terrace?", time: "09:15", author: "Sarah Lee" },
        { from: "staff",    text: "Hi Sarah! Yes, we have a terrace table available ocean view. Confirm please 🙏", time: "09:18" },
        { from: "customer", text: "Perfect! And can the chef avoid shrimp in all dishes? My friend is allergic.", time: "09:21", author: "Sarah Lee" },
      ],
    },
    {
      id: "c3",
      channel: "tiktok",
      name: "@ngocxinh.dalat",
      phone: "—",
      handle: "@ngocxinh.dalat",
      lastTime: "09:20",
      unread: 3,
      tag: "Influencer",
      context: null,
      quickReplies: ["Gửi voucher 20%", "Mời quay review", "Cảm ơn review"],
      messages: [
        { from: "customer", text: "Mình vừa quay clip Condo HUB Đà Lạt được 1.2tr view! 🥰 Cảm ơn team nhiều nha", time: "09:08" },
        { from: "customer", text: "Cho mình hỏi combo set menu cho 4 người giá sao vậy shop?", time: "09:14" },
        { from: "customer", text: "Reply nhanh giúp mình nha, view đang tăng mạnh 🔥", time: "09:20" },
      ],
    },
    {
      id: "c4",
      channel: "instagram",
      name: "@tran_lan_phuong",
      phone: "0932 111 222",
      handle: "@tran_lan_phuong",
      lastTime: "09:18",
      unread: 0,
      branchCode: "LP1",
      tag: "Sự kiện",
      context: {
        orderCode: "Event 28/08",
        branchCode: "LP1 · Sài Gòn",
        guests: 60,
        time: "18:30 · 28/08",
        value: "84.000.000đ",
      },
      quickReplies: ["Gửi proposal", "Gọi tư vấn"],
      messages: [
        { from: "customer", text: "Em muốn đặt tiệc sinh nhật 60 khách cuối tháng 8 có set menu không ạ?", time: "08:42" },
        { from: "staff",    text: "Dạ có ạ, bên em có set A/B/C cho 60 khách, em gửi proposal qua email nhé ạ", time: "08:46" },
        { from: "customer", text: "Ok em gửi qua email phuong.tran@gmail.com nha. Cảm ơn!", time: "08:50" },
        { from: "staff",    text: "Dạ nhận được rồi ạ, báo sales đầu giờ chiều liên hệ anh/chị nha 🙏", time: "09:18", read: true },
      ],
    },
    {
      id: "c5",
      channel: "facebook",
      name: "Đoàn VNG (24)",
      phone: "0967 890 123",
      handle: "Đoàn VNG · doanvng.vn",
      lastTime: "09:12",
      unread: 0,
      branchCode: "LP1",
      tag: "Doanh nghiệp",
      context: {
        orderCode: "Banquet 24 khách",
        table: "Sảnh lớn (24 chỗ)",
        branchCode: "LP1 · Sài Gòn",
        guests: 24,
        time: "20:30 hôm nay",
        value: "42.000.000đ",
      },
      quickReplies: ["Confirm set menu", "Gửi bill"],
      messages: [
        { from: "customer", text: "Team mình đến 20:00, bàn đã chuẩn bị chưa?", time: "08:30" },
        { from: "staff",    text: "Dạ rồi ạ, đầu bếp đang chuẩn bị set menu 1.8tr, view bàn biển ạ", time: "08:35" },
        { from: "customer", text: "OK cảm ơn, đến giờ mình qua", time: "08:40" },
        { from: "staff",    text: "Dạ đón tiếp đoàn anh/chị ạ", time: "09:12", read: true },
      ],
    },
    {
      id: "c6",
      channel: "sms",
      name: "Phạm Văn Tuấn",
      phone: "0988 765 432",
      handle: "+84 988 765 432",
      lastTime: "08:55",
      unread: 0,
      branchCode: "LP2",
      tag: "Đặt bàn",
      context: {
        orderCode: "R011",
        table: "Bàn 09 (2 chỗ)",
        branchCode: "LP2 · Đà Lạt",
        guests: 2,
        time: "19:30 tối nay",
      },
      quickReplies: [],
      messages: [
        { from: "system",  text: "Hệ thống Condo HUB: Cảm ơn anh/chị đã đặt bàn tại LP2 Đà Lạt 19:30 tối nay", time: "08:00" },
        { from: "customer", text: "OK xác nhận. Có cho mang theo chó nhỏ 3kg không?", time: "08:42" },
        { from: "staff",    text: "CONDO HUB: Dạ có ạ, khu vực garden cho phép mang pet dưới 5kg. Anh/chị lưu ý vòng yếm cho pet ạ", time: "08:55", read: true },
      ],
    },
    {
      id: "c7",
      channel: "email",
      name: "Kevin Wong — Tour operator",
      phone: "—",
      handle: "kevin@discoverytravel.asia",
      lastTime: "08:40",
      unread: 1,
      tag: "Đối tác",
      context: {
        orderCode: "MOU 28/08",
        branchCode: "Tất cả",
        guests: 200,
        time: "Tháng 8-10/2026",
        value: "2.4 tỷ",
      },
      quickReplies: ["Trả lời sau", "Chuyển sales"],
      messages: [
        { from: "customer", text: "Subject: Group booking 200 pax — Aug/Sep 2026", time: "08:30", author: "Kevin Wong" },
        { from: "customer", text: "Dear Condo HUB team, we have 200 pax Singapore market Aug-Sep looking for 3 nights all-inclusive. Please quote.", time: "08:30" },
        { from: "system",   text: "Email tự động phân loại → Sales Manager", time: "08:31" },
      ],
    },
    {
      id: "c8",
      channel: "zalo",
      name: "Lê Hoa Phương",
      phone: "0912 345 678",
      handle: "@phuong.le",
      lastTime: "08:20",
      unread: 0,
      branchCode: "LP1",
      tag: "Phàn nàn",
      context: {
        orderCode: "#A247",
        branchCode: "LP1 · Sài Gòn",
        time: "Tối qua",
      },
      quickReplies: ["Gửi voucher xin lỗi", "Gọi quản lý"],
      messages: [
        { from: "customer", text: "Tối qua mình tới LP1, bếp nóng chậm 30 phút. Hơi thất vọng 😞", time: "22:15" },
        { from: "staff",    text: "Dạ em xin lỗi anh/chị ạ, ca tối qua bếp đông quá. Em gửi voucher 500k xin lỗi nha ạ", time: "22:30" },
        { from: "customer", text: "Ok cảm ơn em, nhân viên phục vụ Bình nhiệt tình lắm", time: "22:45" },
        { from: "system",   text: "→ Ticket #IC-241 đóng (handled by Bình)", time: "08:20" },
      ],
    },
    {
      id: "c9",
      channel: "tiktok",
      name: "@foodie.hcm",
      phone: "—",
      handle: "@foodie.hcm",
      lastTime: "08:00",
      unread: 0,
      tag: "Influencer",
      context: null,
      quickReplies: [],
      messages: [
        { from: "customer", text: "Shop ơi cho mình quay set Wagyu review free được không? Mình 380k followers", time: "07:30" },
        { from: "staff",    text: "Dạ được ạ, bên em có chương trình FOC review cho KOL từ 50k followers. Em gửi brief qua email nhé!", time: "07:55" },
        { from: "customer", text: "Ok gửi nha, mail: foodie.hcm@gmail.com", time: "08:00" },
      ],
    },
    {
      id: "c10",
      channel: "messenger",
      name: "Trần Văn Nam",
      phone: "0923 456 789",
      lastTime: "07:45",
      unread: 0,
      branchCode: "LP2",
      tag: "Đặt bàn",
      context: {
        orderCode: "R003",
        table: "Bàn 09 (2 chỗ)",
        branchCode: "LP2 · Đà Lạt",
        guests: 2,
        time: "12:15 hôm nay",
      },
      quickReplies: [],
      messages: [
        { from: "customer", text: "Cho mình hỏi bàn 09 có view vườn không?", time: "07:30" },
        { from: "staff",    text: "Dạ có ạ, bàn 09 view vườn hoa đào phía sau ạ 🌸", time: "07:40" },
        { from: "customer", text: "Perfect, giữ giúp mình nhé. Cảm ơn", time: "07:45" },
      ],
    },
    {
      id: "c11",
      channel: "whatsapp",
      name: "+971 50 123 4567",
      phone: "+971 50 123 4567",
      lastTime: "07:20",
      unread: 0,
      tag: "Quốc tế",
      context: null,
      quickReplies: [],
      messages: [
        { from: "customer", text: "Hi, do you have halal food options? I am from Dubai visiting next week.", time: "07:15" },
        { from: "staff",    text: "Hello! Yes, Condo HUB has certified halal kitchen options. We will prepare a welcome package for you 🙏", time: "07:20" },
      ],
    },
  ];

  return {
    heroMeta,
    restaurants,
    revToday: 331_900_000,
    ordersToday: 486,
    guestsToday: 1_624,
    avgBill: 2_140_000,
    /* Tính từ restaurants — trước đây gõ cứng 72/96 nên đổi số bàn là sai ngay. */
    tablesOccupied: restaurants.reduce((s, r) => s + r.occupied, 0),
    tablesTotal: restaurants.reduce((s, r) => s + r.total, 0),
    tableOcc: Math.round(
      (restaurants.reduce((s, r) => s + r.occupied, 0) /
        restaurants.reduce((s, r) => s + r.total, 0)) * 100
    ),
    avgWait: 8,
    kitchen,
    shifts,
    topDishes,
    categoryMix,
    rev14,
    peakHours,
    reservations,
    guestsRsv: 60,
    topTables,
    inventory,
    pos,
    reviews,
    tips,
    issues,
    channels,
    conversations,
  };
}

/* Mỗi nhà hàng 35 bàn. Đổi số này thì chỉ cần sửa độ dài chuỗi sơ đồ tương ứng. */
const TABLES_PER_RESTAURANT = 35;
const FLOOR_CODE = { o: "occupied", v: "vacant", r: "reserved", x: "ooo" };

/* Dựng nhà hàng từ chuỗi sơ đồ: total và occupied luôn khớp với lưới bàn
   vì cùng suy ra từ một nguồn, không gõ tay hai nơi rồi lệch. */
function makeRestaurant({ id, code, name, area, avgWait, revToday, map }) {
  const cells = map.replace(/\s+/g, "");
  if (cells.length !== TABLES_PER_RESTAURANT) {
    console.warn(`[${code}] sơ đồ bàn có ${cells.length} ký tự, cần ${TABLES_PER_RESTAURANT}`);
  }
  const tables = [...cells].map((ch, i) => ({
    id: String(i + 1).padStart(2, "0"),
    label: "",
    status: FLOOR_CODE[ch] || "vacant",
  }));
  return {
    id, code, name, avgWait, revToday, tables,
    total: tables.length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    location: `${area} · ${tables.length} bàn`,
  };
}

function makeMembers(total, on) {
  const names = ["NV", "QL", "BV", "PT", "TN", "TN", "LT", "LT", "TH", "PD",
                 "TV", "TT", "PV", "PV", "CL", "CL", "DH", "DH", "HD", "HD",
                 "MH", "TN", "TT", "DC", "DC", "HH"];
  return Array.from({ length: total }, (_, i) => ({
    name: names[i % names.length] + " " + (i + 1),
    status: i < on ? "on" : "off",
  }));
}
