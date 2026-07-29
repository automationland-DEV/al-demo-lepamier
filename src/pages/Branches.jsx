import { useState, useMemo } from "react";
import { useActiveBranch } from "../context/BranchContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";
import { branches, rooms, bookings } from "../data/mockData";
import { formatVND } from "../utils/format";

const {
  Building2, Plus, MapPin, Phone, Mail, Star, Users, BedDouble, Wallet,
  MoreHorizontal, Search, Filter, Wifi, Dumbbell, Coffee, Car, ConciergeBell, Wrench, Shield, Eye,
  TrendingUp, TrendingDown, ArrowUpRight, CalendarCheck, Clock, Key, Activity,
  CheckCircle2, AlertCircle, X, ChevronRight, Globe, Compass, Layers,
  ExternalLink, Edit2, PieChart, Percent, BarChart3, User,
} = Icons;

const facilityIcons = {
  "Hồ bơi": ConciergeBell,
  "Spa": ConciergeBell,
  "Phòng gym": Dumbbell,
  "Nhà hàng": Coffee,
  "Rooftop bar": Coffee,
  "Bãi đỗ xe": Car,
  "Phòng họp": Building2,
  "Sân vườn": Building2,
  "BBQ ngoài trời": ConciergeBell,
  "Bãi biển riêng": Compass,
};

const STATUS_MAP = {
  active: { label: "Hoạt động", dot: "bg-emerald-500", pill: "bg-emerald-100 text-emerald-700" },
  renovating: { label: "Đang tu sửa", dot: "bg-amber-500", pill: "bg-amber-100 text-amber-700" },
  inactive: { label: "Tạm đóng", dot: "bg-rose-500", pill: "bg-rose-100 text-rose-700" },
};

const TABS = [
  { key: "overview",  label: "Tổng quan" },
  { key: "facilities",label: "Tiện nghi" },
  { key: "rooms",     label: "Phòng" },
  { key: "financials",label: "Tài chính" },
  { key: "activity",  label: "Hoạt động" },
];

// Sinh data tổng hợp cho mỗi chi nhánh
function buildBranchStats(branch) {
  const branchRooms = rooms.filter((r) => r.branchId === branch.id);
  const total = branchRooms.length || branch.totalRooms;
  const available = branchRooms.filter((r) => r.status === "available").length;
  const occupied  = branchRooms.filter((r) => r.status === "occupied").length;
  const reserved  = branchRooms.filter((r) => r.status === "reserved").length;
  const cleaning  = branchRooms.filter((r) => r.status === "cleaning").length;
  const maint     = branchRooms.filter((r) => r.status === "maintenance").length;
  const realOccupancy = total ? Math.round(((occupied + reserved) / total) * 100) : branch.occupancy;

  const byType = ["STD", "SUP", "DLX", "STE", "EXE", "PRE"].map((k) => {
    const arr = branchRooms.filter((r) => r.type === k);
    return {
      key: k,
      name: { STD: "Standard", SUP: "Superior", DLX: "Deluxe", STE: "Suite", EXE: "Executive", PRE: "Presidential" }[k],
      total: arr.length,
      avg: arr.length ? Math.round(arr.reduce((s, r) => s + r.price, 0) / arr.length) : 0,
      color: { STD: "bg-slate-400", SUP: "bg-blue-400", DLX: "bg-cyan-400", STE: "bg-violet-400", EXE: "bg-amber-400", PRE: "bg-rose-400" }[k],
    };
  }).filter((t) => t.total > 0);

  const branchBookings = bookings.filter((b) => b.branchId === branch.id)
    .sort((a, b) => (b.checkIn || "").localeCompare(a.checkIn || ""))
    .slice(0, 6);

  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const seasonal = 0.85 + Math.sin((i + 4) / 12 * Math.PI * 2) * 0.18;
    return Math.round((branch.revenue / 12) * seasonal);
  });
  const peak = Math.max(...monthlyRevenue);

  const yearFounded = parseInt(branch.openingDate?.slice(0, 4) || "2020", 10);
  const ageYears = Math.max(1, 2026 - yearFounded);

  return {
    total, available, occupied, reserved, cleaning, maint,
    realOccupancy, byType, branchBookings, monthlyRevenue, peak,
    ageYears,
    adr: total ? Math.round(branch.revenue / Math.max(1, branch.occupancy) / 12 / 30) : 0,
    staffCount: Math.round(branch.totalRooms / 1.8),
    reviewCount: Math.round(120 + branch.rating * 80),
  };
}

export default function Branches() {
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("overview");
  const { activeBranchId, setBranch, isAll } = useActiveBranch();

  const filtered = branches.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (search && !`${b.name} ${b.city} ${b.code}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalRooms = branches.reduce((s, b) => s + b.totalRooms, 0);
  const totalRevenue = branches.reduce((s, b) => s + b.revenue, 0);
  const avgOccupancy = Math.round(branches.reduce((s, b) => s + b.occupancy, 0) / branches.length);

  const selected = selectedId ? branches.find((b) => b.id === selectedId) : null;
  const stats = useMemo(() => (selected ? buildBranchStats(selected) : null), [selected]);

  return (
    <div>
      <PageHeader
        title="Quản lý chi nhánh"
        subtitle={`Theo dõi ${branches.length} chi nhánh trọng điểm · Tổng ${totalRooms.toLocaleString("vi-VN")} phòng · ${avgOccupancy}% lấp đầy TB`}
        actions={
          <>
            <button className="btn-outline">
              <Filter className="w-4 h-4" /> Bộ lọc
            </button>
            <button className="btn-primary">
              <Plus className="w-4 h-4" /> Thêm chi nhánh
            </button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] text-ink-500 uppercase tracking-wider font-semibold">Tổng chi nhánh</div>
              <div className="text-[22px] font-bold text-ink-900 mt-1 leading-none tabular-nums">{branches.length}</div>
              <div className="text-[11px] text-blue-700 mt-1.5 inline-flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +1 mới trong quý
              </div>
            </div>
            <div className="w-10 h-10 rounded-md bg-ink-900 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] text-ink-500 uppercase tracking-wider font-semibold">Tổng phòng</div>
              <div className="text-[22px] font-bold text-ink-900 mt-1 leading-none tabular-nums">{totalRooms.toLocaleString("vi-VN")}</div>
              <div className="text-[11px] text-ink-500 mt-1.5">Đông & Tây Nam Bộ</div>
            </div>
            <div className="w-10 h-10 rounded-md bg-blue-700 text-white flex items-center justify-center shrink-0">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] text-ink-500 uppercase tracking-wider font-semibold">Lấp đầy TB</div>
              <div className="text-[22px] font-bold text-ink-900 mt-1 leading-none tabular-nums">{avgOccupancy}%</div>
              <div className="text-[11px] text-blue-700 mt-1.5 inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +5% vs tháng trước
              </div>
            </div>
            <div className="w-10 h-10 rounded-md bg-violet-700 text-white flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] text-ink-500 uppercase tracking-wider font-semibold">Doanh thu năm</div>
              <div className="text-[18px] font-bold text-ink-900 mt-1 leading-none tabular-nums">{formatVND(totalRevenue)}</div>
              <div className="text-[11px] text-blue-700 mt-1.5 inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18% YoY
              </div>
            </div>
            <div className="w-10 h-10 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters bar */}
      <Card className="mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
              placeholder="Tìm theo tên, thành phố, mã chi nhánh…"
            />
          </div>
          <div className="flex gap-0.5 p-0.5 bg-ink-50 rounded-md">
            {[
              { key: "all", label: "Tất cả" },
              { key: "active", label: "Hoạt động" },
              { key: "renovating", label: "Đang tu sửa" },
              { key: "inactive", label: "Tạm đóng" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded text-[12px] font-medium transition ${
                  filter === f.key
                    ? "bg-white text-ink-900 shadow-sm"
                    : "text-ink-500 hover:text-ink-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-0.5 p-0.5 border border-ink-200 rounded-md">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 rounded text-[12px] font-medium transition ${
                view === "grid" ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"
              }`}
            >
              Lưới
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 rounded text-[12px] font-medium transition ${
                view === "table" ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"
              }`}
            >
              Bảng
            </button>
          </div>
        </div>
      </Card>

      {/* Scope banner */}
      {!isAll && (
        <div className="mb-5 flex items-center justify-between gap-3 text-[12px] px-3 py-2.5 rounded-md bg-white border border-ink-200 text-ink-700">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-700" />
            <span>Đang xem dữ liệu của <strong className="text-ink-900">1 chi nhánh</strong> · dùng sidebar để chuyển</span>
          </div>
          <button onClick={() => setBranch("ALL")} className="text-blue-700 font-semibold hover:underline">
            Xem tất cả
          </button>
        </div>
      )}

      {/* Branch list */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const isActive = activeBranchId === b.id;
            const s = buildBranchStats(b);
            return (
            <Card
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              className={`overflow-hidden hover:shadow-card transition cursor-pointer relative p-0 group ${
                isActive ? "ring-1 ring-blue-700 border-blue-700" : ""
              }`}
            >
              {isActive && (
                <span className="absolute top-3 right-3 z-10 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-700 text-white">
                  Đang xem
                </span>
              )}

              {/* Banner — image with overlay */}
              <div className="relative h-36 overflow-hidden">
                <img
                  src={b.image}
                  alt={b.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/55 to-blue-900/25" />
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                  <span className="text-blue-100 text-[10px] font-semibold uppercase tracking-widest bg-blue-950/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
                    {b.code} · {b.region}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm ${STATUS_MAP[b.status].pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_MAP[b.status].dot}`} />
                    {STATUS_MAP[b.status].label}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div className="text-white">
                    <div className="font-semibold text-base leading-tight">{b.city}</div>
                    <div className="text-[10px] text-blue-100 mt-0.5">{b.type}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-white bg-amber-400/95 text-amber-950 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-amber-700 text-amber-700" />
                    {b.rating}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[14px] text-ink-900 truncate">{b.name}</h3>
                    <div className="text-[11px] text-ink-500 mt-0.5">{b.type}</div>
                  </div>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-ink-400 hover:text-ink-700 transition"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 text-[12px] text-ink-500 mb-3">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{b.address}</span></div>
                  <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" /> {b.phone}</div>
                  <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 shrink-0" /> <span className="truncate">{b.email}</span></div>
                </div>

                {/* Mini KPI grid */}
                <div className="grid grid-cols-3 gap-2 mb-3 py-2.5 border-y border-ink-100">
                  <div className="text-center">
                    <div className="text-ink-500 text-[10px] uppercase tracking-wider">Phòng</div>
                    <div className="font-bold text-ink-900 text-[14px] tabular-nums">{b.totalRooms}</div>
                  </div>
                  <div className="text-center border-x border-ink-100">
                    <div className="text-ink-500 text-[10px] uppercase tracking-wider">Lấp đầy</div>
                    <div className="font-bold text-blue-700 text-[14px] tabular-nums">{b.occupancy}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-ink-500 text-[10px] uppercase tracking-wider">Nhân sự</div>
                    <div className="font-bold text-ink-900 text-[14px] tabular-nums">{s.staffCount}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-ink-500 truncate">Quản lý: <strong className="text-ink-900">{b.manager}</strong></span>
                  <span className="text-[11px] font-semibold text-ink-900 tabular-nums">{formatVND(b.revenue)}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
                    <CalendarCheck className="w-3 h-3" />
                    <span>Mở cửa {b.openingDate}</span>
                  </div>
                  <span className="text-[11px] text-ink-500">{s.ageYears} năm</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {b.facilities.slice(0, 4).map((f) => {
                    const Icon = facilityIcons[f] || Building2;
                    return (
                      <span key={f} className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-ink-50 text-ink-600 border border-ink-100">
                        <Icon className="w-3 h-3" /> {f}
                      </span>
                    );
                  })}
                  {b.facilities.length > 4 && (
                    <span className="text-[10px] text-ink-400 px-1 self-center">+{b.facilities.length - 4}</span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-ink-500">Công suất phòng</span>
                  <span className="text-[11px] font-semibold text-ink-900 tabular-nums">
                    {Math.floor((b.totalRooms * b.occupancy) / 100)}/{b.totalRooms}
                  </span>
                </div>
                <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" style={{ width: `${b.occupancy}%` }} />
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setBranch(isActive ? "ALL" : b.id); }}
                    className={`flex-1 text-[12px] font-semibold py-1.5 rounded-md transition flex items-center justify-center gap-1.5 ${
                      isActive
                        ? "bg-ink-900 text-white hover:bg-ink-800"
                        : "bg-white text-blue-700 border border-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isActive ? "Bỏ chọn" : "Đặt làm đang xem"}
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1.5 rounded-md border border-ink-200 text-ink-600 hover:bg-ink-50 transition"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      ) : (
        <Card className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Mã</th>
                  <th className="table-th">Chi nhánh</th>
                  <th className="table-th hidden sm:table-cell">Thành phố</th>
                  <th className="table-th hidden md:table-cell">Quản lý</th>
                  <th className="table-th hidden sm:table-cell">Phòng</th>
                  <th className="table-th">Lấp đầy</th>
                  <th className="table-th hidden md:table-cell">Doanh thu</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const isActive = activeBranchId === b.id;
                  return (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className={`hover:bg-ink-50 transition cursor-pointer ${
                      isActive ? "bg-blue-50/60 hover:bg-blue-50" : ""
                    }`}
                  >
                    <td className="table-td font-mono text-[12px]">
                      {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-700 mr-2 align-middle" />}
                      {b.code}
                    </td>
                    <td className="table-td">
                      <div className="font-semibold text-ink-900">{b.name}</div>
                      <div className="text-[11px] text-ink-500 sm:hidden">{b.city}</div>
                      <div className="text-[11px] text-ink-500 hidden sm:block">{b.type}</div>
                    </td>
                    <td className="table-td hidden sm:table-cell">{b.city}</td>
                    <td className="table-td hidden md:table-cell">{b.manager}</td>
                    <td className="table-td tabular-nums hidden sm:table-cell">{b.totalRooms}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-16 sm:w-20 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${b.occupancy}%` }} />
                        </div>
                        <span className="font-semibold text-[12px] tabular-nums">{b.occupancy}%</span>
                      </div>
                    </td>
                    <td className="table-td font-semibold tabular-nums hidden md:table-cell">{formatVND(b.revenue)}</td>
                    <td className="table-td">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${STATUS_MAP[b.status].pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_MAP[b.status].dot}`} />
                        {STATUS_MAP[b.status].label}
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-ink-500 hover:text-ink-900 transition"
                        title="Xem chi tiết"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─────────────── DETAIL DRAWER ─────────────── */}
      {selected && stats && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-ink-900/40 backdrop-blur-[2px]"
            onClick={() => setSelectedId(null)}
          />
          <div className="w-full max-w-[680px] bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right">
            {/* Header — image with overlay */}
            <div className="relative h-44 overflow-hidden text-white">
              <img
                src={selected.image || "/img/branches/placeholder.jpg"}
                alt={selected.name}
                onError={(e) => { e.currentTarget.src = "/img/branches/placeholder.jpg"; }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/70 to-blue-900/30" />
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-md bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <div className="relative flex items-center gap-2 text-blue-100 text-[11px] uppercase tracking-widest font-semibold">
                  <Building2 className="w-3.5 h-3.5" />
                  {selected.code} · {selected.region} · {selected.type}
                </div>
                <h2 className="relative font-display font-bold text-[22px] mt-1 leading-tight">
                  {selected.name}
                </h2>
                <div className="relative flex items-center gap-3 text-[12px] text-blue-100 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {selected.city}</span>
                  <span className="inline-flex items-center gap-1 bg-amber-400/95 text-amber-950 px-1.5 py-0.5 rounded font-semibold">
                    <Star className="w-3 h-3 fill-amber-700 text-amber-700" /> {selected.rating}
                  </span>
                  <span className="text-blue-200/80">· {stats.reviewCount} đánh giá</span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${STATUS_MAP[selected.status].pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_MAP[selected.status].dot}`} />
                    {STATUS_MAP[selected.status].label}
                  </span>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="px-4 sm:px-6 py-2.5 bg-white border-b border-ink-200 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setBranch(selected.id === activeBranchId ? "ALL" : selected.id)}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded transition flex items-center gap-1.5 ${
                  selected.id === activeBranchId
                    ? "bg-ink-900 text-white hover:bg-ink-800"
                    : "bg-blue-700 text-white hover:bg-blue-800"
                }`}
              >
                <Eye className="w-3 h-3" />
                {selected.id === activeBranchId ? "Bỏ chọn chi nhánh" : "Đặt làm đang xem"}
              </button>
              <button className="text-[11px] font-semibold px-2.5 py-1.5 rounded border border-ink-200 text-ink-700 hover:bg-ink-50 transition flex items-center gap-1.5">
                <Edit2 className="w-3 h-3" /> Chỉnh sửa
              </button>
              <button className="text-[11px] font-semibold px-2.5 py-1.5 rounded border border-ink-200 text-ink-700 hover:bg-ink-50 transition flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" /> Mở trang
              </button>
              <div className="ml-auto text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
                <span className="font-mono text-ink-700">{selected.id}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-ink-200 px-4 sm:px-6 flex gap-0.5 overflow-x-auto bg-white">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-2.5 text-[12px] font-semibold whitespace-nowrap border-b-2 transition ${
                    tab === t.key
                      ? "border-blue-700 text-ink-900"
                      : "border-transparent text-ink-500 hover:text-ink-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-ink-50/50">
              {tab === "overview" && (
                <div className="space-y-4">
                  {/* KPI grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                      { label: "Lấp đầy",  value: `${stats.realOccupancy}%`, icon: Percent, color: "bg-blue-600", sub: `+${stats.realOccupancy - selected.occupancy}%` },
                      { label: "Doanh thu", value: formatVND(selected.revenue), icon: Wallet, color: "bg-amber-500", sub: "năm nay" },
                      { label: "ADR", value: formatVND(stats.adr), icon: BarChart3, color: "bg-violet-600", sub: "/phòng/đêm" },
                      { label: "Nhân sự", value: stats.staffCount, icon: Users, color: "bg-emerald-600", sub: "đang làm" },
                    ].map((k) => (
                      <div key={k.label} className="bg-white rounded-md border border-ink-200 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">{k.label}</span>
                          <div className={`w-6 h-6 rounded ${k.color} text-white flex items-center justify-center`}>
                            <k.icon className="w-3 h-3" />
                          </div>
                        </div>
                        <div className="font-bold text-[16px] text-ink-900 tabular-nums leading-none">{k.value}</div>
                        <div className="text-[10px] text-ink-500 mt-1">{k.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Info grid */}
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-[13px] text-ink-900">Thông tin chung</div>
                      <span className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">#{selected.id}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[12px]">
                      <div>
                        <div className="text-ink-500 text-[11px]">Loại hình</div>
                        <div className="font-semibold text-ink-900">{selected.type}</div>
                      </div>
                      <div>
                        <div className="text-ink-500 text-[11px]">Khu vực</div>
                        <div className="font-semibold text-ink-900">{selected.region}</div>
                      </div>
                      <div>
                        <div className="text-ink-500 text-[11px]">Ngày khai trương</div>
                        <div className="font-semibold text-ink-900 tabular-nums">{selected.openingDate}</div>
                      </div>
                      <div>
                        <div className="text-ink-500 text-[11px]">Thời gian hoạt động</div>
                        <div className="font-semibold text-ink-900">{stats.ageYears} năm</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-ink-500 text-[11px]">Địa chỉ</div>
                        <div className="font-semibold text-ink-900">{selected.address}</div>
                      </div>
                    </div>
                    <div className="border-t border-ink-100 mt-3 pt-3 grid grid-cols-2 gap-3 text-[12px]">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-ink-500" />
                        <span className="text-ink-700 tabular-nums">{selected.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-ink-500" />
                        <span className="text-ink-700 truncate">{selected.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-ink-500" />
                        <span className="text-ink-700">GĐ: <strong className="text-ink-900">{selected.manager}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-ink-500" />
                        <span className="text-ink-700">lepalmier.vn/{(selected.code || "").toLowerCase()}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Gallery */}
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-[13px] text-ink-900">Thư viện ảnh</div>
                      <span className="text-[11px] text-ink-500">{(selected.gallery?.length || 0) + 1} ảnh</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[selected.image, ...(selected.gallery || [])].slice(0, 4).map((src, i) => (
                        <a
                          key={i}
                          href={src}
                          target="_blank"
                          rel="noreferrer"
                          className="relative aspect-[4/3] rounded-md overflow-hidden group cursor-zoom-in bg-ink-100 block"
                        >
                          <img
                            src={src}
                            alt={`${selected.name} ${i + 1}`}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-blue-950/0 group-hover:bg-blue-950/40 transition flex items-center justify-center">
                            <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition" />
                          </div>
                          {i === 0 && (
                            <span className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold uppercase tracking-wider text-white bg-blue-950/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
                              Ảnh chính
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </Card>

                  {/* Mini map */}
                  <Card>
                    <div className="font-semibold text-[13px] text-ink-900 mb-3">Vị trí</div>
                    <div className="relative h-44 rounded-md bg-gradient-to-br from-blue-50 to-cyan-50 border border-ink-200 overflow-hidden">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="400" height="180" fill="url(#grid)" />
                        <path d="M 0 130 Q 100 110 200 140 T 400 120" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
                        <path d="M 0 60 Q 150 80 250 50 T 400 70" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
                        <circle cx="200" cy="90" r="6" fill="#1e40af" />
                        <circle cx="200" cy="90" r="14" fill="none" stroke="#1e40af" strokeWidth="1.5" opacity="0.4" />
                        <circle cx="200" cy="90" r="24" fill="none" stroke="#1e40af" strokeWidth="1" opacity="0.2" />
                        <text x="200" y="120" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1e40af">{selected.city}</text>
                      </svg>
                      <div className="absolute bottom-2 left-2 text-[10px] text-ink-500 bg-white/80 px-1.5 py-0.5 rounded font-mono">
                        {selected.code} · {selected.region}
                      </div>
                    </div>
                  </Card>

                  {/* Room availability */}
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-[13px] text-ink-900">Trạng thái phòng</div>
                      <span className="text-[11px] text-ink-500">Tổng <strong className="text-ink-900 tabular-nums">{stats.total}</strong> phòng</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {[
                        { key: "available", label: "Trống", color: "bg-blue-500", text: "text-blue-700", soft: "bg-blue-50" },
                        { key: "occupied",  label: "Đang ở", color: "bg-blue-600", text: "text-blue-700", soft: "bg-blue-50" },
                        { key: "reserved",  label: "Đã đặt", color: "bg-violet-500", text: "text-violet-700", soft: "bg-violet-50" },
                        { key: "cleaning",  label: "Đang dọn", color: "bg-amber-500", text: "text-amber-700", soft: "bg-amber-50" },
                        { key: "maint",     label: "Bảo trì", color: "bg-rose-500", text: "text-rose-700", soft: "bg-rose-50" },
                      ].map((s) => {
                        const v = stats[s.key] || 0;
                        const pct = stats.total ? Math.round((v / stats.total) * 100) : 0;
                        return (
                          <div key={s.key} className={`rounded-md ${s.soft} p-2.5 border border-ink-100`}>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${s.color}`} />
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-600">{s.label}</span>
                            </div>
                            <div className={`font-bold text-[18px] mt-1 ${s.text} tabular-nums leading-none`}>{v}</div>
                            <div className="text-[10px] text-ink-500 mt-1 tabular-nums">{pct}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {tab === "facilities" && (
                <Card>
                  <div className="font-semibold text-[13px] text-ink-900 mb-3">
                    Tiện nghi ({(selected.facilities || []).length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selected.facilities || []).map((f) => {
                      const Icon = facilityIcons[f] || Building2;
                      return (
                        <div key={f} className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-ink-50 border border-ink-100">
                          <div className="w-8 h-8 rounded-md bg-white text-blue-700 flex items-center justify-center border border-ink-200">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[12px] font-semibold text-ink-900">{f}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {tab === "rooms" && (
                <div className="space-y-3">
                  <Card>
                    <div className="font-semibold text-[13px] text-ink-900 mb-3">Phân bổ theo hạng phòng</div>
                    <div className="space-y-2.5">
                      {stats.byType.map((t) => {
                        const pct = stats.total ? Math.round((t.total / stats.total) * 100) : 0;
                        return (
                          <div key={t.key}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${t.color}`} />
                                <span className="text-[12px] font-semibold text-ink-900">{t.name}</span>
                                <span className="text-[11px] text-ink-500">({t.key})</span>
                              </div>
                              <div className="text-[11px] text-ink-700 tabular-nums">
                                <strong className="text-ink-900">{t.total}</strong> phòng · {formatVND(t.avg)}/đêm
                              </div>
                            </div>
                            <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                              <div className={`h-full ${t.color}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-[13px] text-ink-900">Phòng nổi bật</div>
                      <span className="text-[11px] text-ink-500">{stats.total} phòng tổng</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rooms.filter((r) => r.branchId === selected.id).slice(0, 8).map((r) => (
                        <div key={r.id} className="flex items-center justify-between p-2.5 rounded-md border border-ink-100 hover:bg-ink-50 transition">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-ink-100 text-ink-700 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                              {r.number}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[12px] font-semibold text-ink-900 truncate">{r.typeName}</div>
                              <div className="text-[10px] text-ink-500 tabular-nums">{formatVND(r.price)}</div>
                            </div>
                          </div>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${r.statusSoft || "bg-ink-100 text-ink-700"}`}>
                            {r.statusLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {tab === "financials" && (
                <div className="space-y-3">
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-[13px] text-ink-900">Doanh thu 12 tháng</div>
                      <span className="text-[11px] text-ink-500">Tổng <strong className="text-ink-900 tabular-nums">{formatVND(selected.revenue)}</strong></span>
                    </div>
                    <div className="flex items-end gap-1.5 h-32">
                      {stats.monthlyRevenue.map((v, i) => {
                        const h = stats.peak ? Math.max(4, (v / stats.peak) * 100) : 4;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full bg-gradient-to-t from-blue-700 to-cyan-400 rounded-t" style={{ height: `${h}%` }} />
                            <div className="text-[9px] text-ink-500 font-mono">T{i + 1}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-ink-100">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">Cao điểm</div>
                        <div className="font-bold text-ink-900 text-[14px] tabular-nums">{formatVND(stats.peak)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">TB/tháng</div>
                        <div className="font-bold text-ink-900 text-[14px] tabular-nums">{formatVND(Math.round(selected.revenue / 12))}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">ADR</div>
                        <div className="font-bold text-ink-900 text-[14px] tabular-nums">{formatVND(stats.adr)}</div>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <Card>
                      <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">Doanh thu / phòng</div>
                      <div className="font-bold text-ink-900 text-[18px] tabular-nums mt-1">
                        {formatVND(Math.round(selected.revenue / Math.max(1, selected.totalRooms)))}
                      </div>
                      <div className="text-[10px] text-blue-700 mt-1 inline-flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +12% YoY
                      </div>
                    </Card>
                    <Card>
                      <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">Chi phí ước tính</div>
                      <div className="font-bold text-ink-900 text-[18px] tabular-nums mt-1">
                        {formatVND(Math.round(selected.revenue * 0.62))}
                      </div>
                      <div className="text-[10px] text-rose-600 mt-1 inline-flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> 62% DT
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {tab === "activity" && (
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-[13px] text-ink-900">Đặt phòng gần đây</div>
                    <span className="text-[11px] text-ink-500">{stats.branchBookings.length} lượt</span>
                  </div>
                  {stats.branchBookings.length === 0 ? (
                    <div className="text-center py-8 text-ink-500 text-[12px]">Chưa có đặt phòng nào</div>
                  ) : (
                    <div className="space-y-2">
                      {stats.branchBookings.map((bk, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-md border border-ink-100 hover:bg-ink-50 transition">
                          <div className="w-9 h-9 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <CalendarCheck className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-semibold text-ink-900 truncate">{bk.guestName || "Khách lẻ"}</div>
                            <div className="text-[11px] text-ink-500 truncate">
                              {bk.checkIn} → {bk.checkOut} · {bk.roomTypeName || "STD"} · {bk.nights} đêm
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[12px] font-bold text-ink-900 tabular-nums">{formatVND(bk.total || 0)}</div>
                            <div className="text-[10px] text-ink-500">{bk.source || "Walk-in"}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
