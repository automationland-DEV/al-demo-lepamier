import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useActiveBranch } from "../context/BranchContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Modal } from "../components/DashboardPrimitives";
import { Icons } from "../components/Icons";
import { branches as seedBranches, rooms, bookings } from "../data/mockData";
import { formatVND } from "../utils/format";

const {
  Building2, Plus, MapPin, Phone, Mail, Star, Users, BedDouble, Wallet,
  MoreHorizontal, Search, Filter, Dumbbell, Coffee, Car, ConciergeBell, Eye,
  TrendingUp, TrendingDown, ArrowUpRight, CalendarCheck, Percent,
  X, ChevronRight, ChevronDown, Globe, Compass, Check, AlertCircle, SearchX,
  ExternalLink, Edit2, BarChart3, User, Copy, Power, Trash2, ArrowUpDown, RotateCcw,
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

const ALL_FACILITIES = [
  "Hồ bơi", "Spa", "Phòng gym", "Nhà hàng", "Rooftop bar",
  "Bãi đỗ xe", "Phòng họp", "Sân vườn", "BBQ ngoài trời", "Bãi biển riêng",
];

const BRANCH_TYPES = [
  "Nghỉ dưỡng sinh thái", "Beach Resort", "Khách sạn trung tâm",
  "Mountain Retreat", "Boutique Hotel", "Serviced Apartment",
];

const REGIONS = [
  "Long An", "Bà Rịa - Vũng Tàu", "Tây Ninh", "TP. Hồ Chí Minh",
  "Đồng Nai", "Bình Dương", "Bến Tre", "Tiền Giang",
];

const STATUS_MAP = {
  active:     { label: "Hoạt động",   tone: "success" },
  renovating: { label: "Đang tu sửa", tone: "warning" },
  inactive:   { label: "Tạm đóng",    tone: "danger" },
};

const SORTS = [
  { key: "name-asc",  label: "Tên A → Z" },
  { key: "name-desc", label: "Tên Z → A" },
  { key: "rev-desc",  label: "Doanh thu cao nhất" },
  { key: "rev-asc",   label: "Doanh thu thấp nhất" },
  { key: "occ-desc",  label: "Lấp đầy cao nhất" },
  { key: "occ-asc",   label: "Lấp đầy thấp nhất" },
  { key: "rooms-desc",label: "Nhiều phòng nhất" },
  { key: "rating-desc", label: "Đánh giá cao nhất" },
];

const TABS = [
  { key: "overview",  label: "Tổng quan" },
  { key: "facilities",label: "Tiện nghi" },
  { key: "rooms",     label: "Phòng" },
  { key: "financials",label: "Tài chính" },
  { key: "activity",  label: "Hoạt động" },
];

const EMPTY_FILTERS = {
  status: "all",
  regions: [],
  types: [],
  facilities: [],
  minRooms: "",
  maxRooms: "",
  minOcc: 0,
  minRating: 0,
};

/* ═══════════════ helpers ═══════════════ */

/** Bỏ dấu + hạ chữ thường để tìm kiếm không phụ thuộc dấu tiếng Việt:
 *  gõ "ho tram" vẫn ra "Hồ Tràm". Xử lý riêng đ/Đ vì NFD không tách được. */
const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

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
      tone: { STD: "neutral", SUP: "info", DLX: "accent", STE: "highlight", EXE: "warning", PRE: "danger" }[k],
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

  return {
    total, available, occupied, reserved, cleaning, maint,
    realOccupancy, byType, branchBookings, monthlyRevenue, peak,
    ageYears: Math.max(1, 2026 - yearFounded),
    adr: total ? Math.round(branch.revenue / Math.max(1, branch.occupancy) / 12 / 30) : 0,
    staffCount: Math.round(branch.totalRooms / 1.8),
    reviewCount: Math.round(120 + branch.rating * 80),
  };
}

function StatusPill({ status, className = "" }) {
  const s = STATUS_MAP[status] || STATUS_MAP.active;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap ${className}`}
      style={{
        backgroundColor: `var(--${s.tone}-soft)`,
        color: `var(--${s.tone}-fg)`,
        border: `1px solid var(--${s.tone}-border)`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `var(--${s.tone})` }} />
      {s.label}
    </span>
  );
}

/* ═══════════════ page ═══════════════ */

export default function Branches() {
  const { activeBranchId, setBranch, isAll } = useActiveBranch();

  /* Danh sách nằm trong state để form "Thêm chi nhánh" ghi được vào */
  const [branchList, setBranchList] = useState(seedBranches);

  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState("name-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("overview");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const sortRef = useRef(null);
  const menuRef = useRef(null);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  /* Đóng dropdown khi bấm ra ngoài */
  useEffect(() => {
    const onDown = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuId(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* ── lọc + sắp xếp ── */
  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    const out = branchList.filter((b) => {
      if (filters.status !== "all" && b.status !== filters.status) return false;
      if (filters.regions.length && !filters.regions.includes(b.region)) return false;
      if (filters.types.length && !filters.types.includes(b.type)) return false;
      if (filters.facilities.length && !filters.facilities.every((f) => (b.facilities || []).includes(f))) return false;
      if (filters.minRooms !== "" && b.totalRooms < Number(filters.minRooms)) return false;
      if (filters.maxRooms !== "" && b.totalRooms > Number(filters.maxRooms)) return false;
      if (b.occupancy < filters.minOcc) return false;
      if (b.rating < filters.minRating) return false;
      if (q && !deaccent(`${b.name} ${b.city} ${b.code} ${b.manager} ${b.region} ${b.address} ${b.type}`).includes(q)) return false;
      return true;
    });

    const cmp = {
      "name-asc":  (a, b) => a.name.localeCompare(b.name, "vi"),
      "name-desc": (a, b) => b.name.localeCompare(a.name, "vi"),
      "rev-desc":  (a, b) => b.revenue - a.revenue,
      "rev-asc":   (a, b) => a.revenue - b.revenue,
      "occ-desc":  (a, b) => b.occupancy - a.occupancy,
      "occ-asc":   (a, b) => a.occupancy - b.occupancy,
      "rooms-desc":(a, b) => b.totalRooms - a.totalRooms,
      "rating-desc": (a, b) => b.rating - a.rating,
    }[sort];
    return [...out].sort(cmp);
  }, [branchList, filters, search, sort]);

  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) +
    filters.regions.length + filters.types.length + filters.facilities.length +
    (filters.minRooms !== "" ? 1 : 0) + (filters.maxRooms !== "" ? 1 : 0) +
    (filters.minOcc > 0 ? 1 : 0) + (filters.minRating > 0 ? 1 : 0);

  const hasQuery = activeFilterCount > 0 || search.trim() !== "";

  const totalRooms = branchList.reduce((s, b) => s + b.totalRooms, 0);
  const totalRevenue = branchList.reduce((s, b) => s + b.revenue, 0);
  const avgOccupancy = branchList.length
    ? Math.round(branchList.reduce((s, b) => s + b.occupancy, 0) / branchList.length) : 0;

  const selected = selectedId ? branchList.find((b) => b.id === selectedId) : null;
  const stats = useMemo(() => (selected ? buildBranchStats(selected) : null), [selected]);

  const toggleIn = (key, value) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));

  const resetFilters = () => { setFilters(EMPTY_FILTERS); setSearch(""); };

  /* ── thao tác trên chi nhánh ── */
  const saveBranch = (payload) => {
    if (editing) {
      setBranchList((list) => list.map((b) => (b.id === editing.id ? { ...b, ...payload } : b)));
      notify(`Đã cập nhật ${payload.name}`);
    } else {
      setBranchList((list) => [{ ...payload, id: `BR-${payload.code}-${String(list.length + 1).padStart(3, "0")}` }, ...list]);
      notify(`Đã thêm chi nhánh ${payload.name}`);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const duplicateBranch = (b) => {
    const copy = {
      ...b,
      id: `BR-${b.code}-${Date.now().toString().slice(-4)}`,
      name: `${b.name} (bản sao)`,
    };
    setBranchList((list) => [copy, ...list]);
    setMenuId(null);
    notify(`Đã nhân bản ${b.name}`);
  };

  const toggleStatus = (b) => {
    const next = b.status === "active" ? "inactive" : "active";
    setBranchList((list) => list.map((x) => (x.id === b.id ? { ...x, status: next } : x)));
    setMenuId(null);
    notify(`${b.name} → ${STATUS_MAP[next].label}`);
  };

  const removeBranch = (b) => {
    setBranchList((list) => list.filter((x) => x.id !== b.id));
    if (selectedId === b.id) setSelectedId(null);
    if (activeBranchId === b.id) setBranch("ALL");
    setConfirm(null);
    setMenuId(null);
    notify(`Đã xoá ${b.name}`);
  };

  const openEdit = (b) => { setEditing(b); setFormOpen(true); setMenuId(null); };
  const openCreate = () => { setEditing(null); setFormOpen(true); };

  return (
    <div>
      <PageHeader
        title="Quản lý khu du lịch"
        subtitle={`Theo dõi ${branchList.length} chi nhánh · Tổng ${totalRooms.toLocaleString("vi-VN")} phòng · ${avgOccupancy}% lấp đầy TB`}
        actions={
          <>
            <button
              onClick={() => setShowFilter((v) => !v)}
              className="btn-outline relative"
              aria-expanded={showFilter}
            >
              <Filter className="w-4 h-4" /> Bộ lọc
              {activeFilterCount > 0 && (
                <span
                  className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold inline-flex items-center justify-center tabular-nums"
                  style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button className="btn-primary" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Thêm chi nhánh
            </button>
          </>
        }
      />

      {/* ── Summary ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <SummaryCard label="Tổng chi nhánh" value={branchList.length} icon={Building2} tone="accent"
          foot={<><ArrowUpRight className="w-3 h-3" /> +1 mới trong quý</>} />
        <SummaryCard label="Tổng phòng" value={totalRooms.toLocaleString("vi-VN")} icon={BedDouble} tone="info"
          foot="Đông & Tây Nam Bộ" />
        <SummaryCard label="Lấp đầy TB" value={`${avgOccupancy}%`} icon={Users} tone="highlight"
          foot={<><TrendingUp className="w-3 h-3" /> +5% vs tháng trước</>} />
        <SummaryCard label="Doanh thu năm" value={formatVND(totalRevenue)} icon={Wallet} tone="warning"
          foot={<><TrendingUp className="w-3 h-3" /> +18% YoY</>} />
      </div>

      {/* ── Thanh tìm kiếm + điều khiển ── */}
      <Card className="mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 pr-9 text-[16px] sm:text-[13px]"
              placeholder="Tìm theo tên, thành phố, mã, quản lý, địa chỉ…"
              aria-label="Tìm kiếm chi nhánh"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Xoá tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full inline-flex items-center justify-center text-ink-400 hover:bg-ink-100 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sắp xếp */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="btn-outline whitespace-nowrap"
              aria-expanded={sortOpen}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">{SORTS.find((s) => s.key === sort)?.label}</span>
              <span className="sm:hidden">Sắp xếp</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-56 rounded-lg border shadow-pop z-30 overflow-hidden"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
              >
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => { setSort(s.key); setSortOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12.5px] hover:bg-ink-50 transition"
                    style={sort === s.key ? { color: "var(--accent)", fontWeight: 700 } : { color: "var(--fg)" }}
                  >
                    {sort === s.key ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lưới / Bảng */}
          <div className="flex gap-0.5 p-0.5 border border-ink-200 rounded-md" role="group" aria-label="Kiểu hiển thị">
            {[{ k: "grid", l: "Lưới" }, { k: "table", l: "Bảng" }].map((v) => (
              <button
                key={v.k}
                onClick={() => setView(v.k)}
                aria-pressed={view === v.k}
                className="px-3 py-1.5 rounded text-[12px] font-medium transition"
                style={view === v.k
                  ? { backgroundColor: "var(--accent)", color: "var(--on-accent)" }
                  : { color: "var(--fg-muted)" }}
              >
                {v.l}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bộ lọc nâng cao ── */}
        {showFilter && (
          <div className="mt-4 pt-4 border-t border-ink-100 space-y-4 animate-fadeIn">
            <FilterGroup label="Trạng thái">
              <div className="flex flex-wrap gap-1.5">
                {[{ key: "all", label: "Tất cả" },
                  ...Object.entries(STATUS_MAP).map(([k, v]) => ({ key: k, label: v.label }))
                ].map((f) => (
                  <Chip key={f.key} on={filters.status === f.key} onClick={() => setFilters((x) => ({ ...x, status: f.key }))}>
                    {f.label}
                  </Chip>
                ))}
              </div>
            </FilterGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FilterGroup label={`Khu vực${filters.regions.length ? ` · ${filters.regions.length}` : ""}`}>
                <div className="flex flex-wrap gap-1.5">
                  {[...new Set([...REGIONS, ...branchList.map((b) => b.region)])].map((r) => (
                    <Chip key={r} on={filters.regions.includes(r)} onClick={() => toggleIn("regions", r)}>{r}</Chip>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup label={`Loại hình${filters.types.length ? ` · ${filters.types.length}` : ""}`}>
                <div className="flex flex-wrap gap-1.5">
                  {[...new Set([...BRANCH_TYPES, ...branchList.map((b) => b.type)])].map((t) => (
                    <Chip key={t} on={filters.types.includes(t)} onClick={() => toggleIn("types", t)}>{t}</Chip>
                  ))}
                </div>
              </FilterGroup>
            </div>

            <FilterGroup label={`Tiện nghi bắt buộc${filters.facilities.length ? ` · ${filters.facilities.length}` : ""}`}>
              <div className="flex flex-wrap gap-1.5">
                {ALL_FACILITIES.map((f) => {
                  const Icon = facilityIcons[f] || Building2;
                  return (
                    <Chip key={f} on={filters.facilities.includes(f)} onClick={() => toggleIn("facilities", f)}>
                      <Icon className="w-3 h-3" /> {f}
                    </Chip>
                  );
                })}
              </div>
            </FilterGroup>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FilterGroup label="Số phòng">
                <div className="flex items-center gap-2">
                  <input type="number" min="0" placeholder="Từ" value={filters.minRooms}
                    onChange={(e) => setFilters((x) => ({ ...x, minRooms: e.target.value }))}
                    className="input text-[13px]" />
                  <span className="text-ink-400 text-[12px]">—</span>
                  <input type="number" min="0" placeholder="Đến" value={filters.maxRooms}
                    onChange={(e) => setFilters((x) => ({ ...x, maxRooms: e.target.value }))}
                    className="input text-[13px]" />
                </div>
              </FilterGroup>

              <FilterGroup label={`Lấp đầy tối thiểu · ${filters.minOcc}%`}>
                <input type="range" min="0" max="100" step="5" value={filters.minOcc}
                  onChange={(e) => setFilters((x) => ({ ...x, minOcc: Number(e.target.value) }))}
                  className="w-full" style={{ accentColor: "var(--accent)" }} />
              </FilterGroup>

              <FilterGroup label="Đánh giá tối thiểu">
                <div className="flex items-center gap-1">
                  {[0, 3, 3.5, 4, 4.5].map((r) => (
                    <Chip key={r} on={filters.minRating === r} onClick={() => setFilters((x) => ({ ...x, minRating: r }))}>
                      {r === 0 ? "Tất cả" : <><Star className="w-3 h-3 fill-current" /> {r}+</>}
                    </Chip>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup label="">
                <button
                  onClick={resetFilters}
                  disabled={!hasQuery}
                  className="btn-outline w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" /> Đặt lại tất cả
                </button>
              </FilterGroup>
            </div>
          </div>
        )}
      </Card>

      {/* ── Chip điều kiện đang áp dụng ── */}
      {hasQuery && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-ink-500">
            <strong className="text-ink-900 tabular-nums">{filtered.length}</strong>/{branchList.length} chi nhánh
          </span>
          {search.trim() && <ActiveChip onRemove={() => setSearch("")}>Từ khoá: “{search.trim()}”</ActiveChip>}
          {filters.status !== "all" && (
            <ActiveChip onRemove={() => setFilters((x) => ({ ...x, status: "all" }))}>
              {STATUS_MAP[filters.status].label}
            </ActiveChip>
          )}
          {filters.regions.map((r) => <ActiveChip key={r} onRemove={() => toggleIn("regions", r)}>{r}</ActiveChip>)}
          {filters.types.map((t) => <ActiveChip key={t} onRemove={() => toggleIn("types", t)}>{t}</ActiveChip>)}
          {filters.facilities.map((f) => <ActiveChip key={f} onRemove={() => toggleIn("facilities", f)}>{f}</ActiveChip>)}
          {filters.minRooms !== "" && <ActiveChip onRemove={() => setFilters((x) => ({ ...x, minRooms: "" }))}>≥ {filters.minRooms} phòng</ActiveChip>}
          {filters.maxRooms !== "" && <ActiveChip onRemove={() => setFilters((x) => ({ ...x, maxRooms: "" }))}>≤ {filters.maxRooms} phòng</ActiveChip>}
          {filters.minOcc > 0 && <ActiveChip onRemove={() => setFilters((x) => ({ ...x, minOcc: 0 }))}>Lấp đầy ≥ {filters.minOcc}%</ActiveChip>}
          {filters.minRating > 0 && <ActiveChip onRemove={() => setFilters((x) => ({ ...x, minRating: 0 }))}>★ ≥ {filters.minRating}</ActiveChip>}
          <button onClick={resetFilters} className="text-[12px] font-semibold hover:underline" style={{ color: "var(--accent)" }}>
            Xoá hết
          </button>
        </div>
      )}

      {/* ── Banner phạm vi ── */}
      {!isAll && (
        <div className="mb-5 flex items-center justify-between gap-3 text-[12px] px-3 py-2.5 rounded-md bg-white border border-ink-200 text-ink-700">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <span>Đang xem dữ liệu của <strong className="text-ink-900">1 chi nhánh</strong> · dùng sidebar để chuyển</span>
          </div>
          <button onClick={() => setBranch("ALL")} className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>
            Xem tất cả
          </button>
        </div>
      )}

      {/* ── Không có kết quả ── */}
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-14">
            <SearchX className="w-10 h-10 mx-auto text-ink-300 mb-3" />
            <div className="text-sm font-semibold text-ink-900">Không tìm thấy chi nhánh nào</div>
            <div className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
              Thử bỏ bớt điều kiện lọc hoặc đổi từ khoá tìm kiếm.
            </div>
            <button onClick={resetFilters} className="btn-primary mt-4 mx-auto">
              <RotateCcw className="w-4 h-4" /> Đặt lại bộ lọc
            </button>
          </div>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const isActive = activeBranchId === b.id;
            const s = buildBranchStats(b);
            return (
              <div
                key={b.id}
                className="card overflow-hidden transition relative p-0 group hover:shadow-pop hover:-translate-y-0.5"
                style={isActive ? { borderColor: "var(--accent)", boxShadow: "0 0 0 1px var(--accent)" } : undefined}
              >
                {/* Ảnh bìa — bấm để mở chi tiết */}
                <button
                  onClick={() => setSelectedId(b.id)}
                  className="relative h-36 w-full overflow-hidden block text-left"
                  aria-label={`Xem chi tiết ${b.name}`}
                >
                  <img src={b.image} alt="" loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{
                    background: "linear-gradient(to top, rgba(7,13,26,.92), rgba(7,13,26,.45) 55%, rgba(7,13,26,.15))",
                  }} />
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    <span className="text-white/85 text-[10px] font-semibold uppercase tracking-widest bg-black/35 backdrop-blur-sm px-1.5 py-0.5 rounded">
                      {b.code} · {b.region}
                    </span>
                    <StatusPill status={b.status} className="backdrop-blur-sm" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <div className="text-white min-w-0">
                      <div className="font-semibold text-base leading-tight truncate">{b.city}</div>
                      <div className="text-[10px] text-white/75 mt-0.5 truncate">{b.type}</div>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded shrink-0">
                      <Star className="w-3 h-3 fill-amber-800 text-amber-800" />{b.rating}
                    </span>
                  </div>
                </button>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <button onClick={() => setSelectedId(b.id)} className="min-w-0 text-left">
                      <h3 className="font-semibold text-[14px] text-ink-900 truncate hover:underline">{b.name}</h3>
                      <div className="text-[11px] text-ink-500 mt-0.5 truncate">Quản lý: {b.manager}</div>
                    </button>

                    {/* Menu ⋯ */}
                    <div className="relative shrink-0" ref={menuId === b.id ? menuRef : null}>
                      <button
                        onClick={() => setMenuId(menuId === b.id ? null : b.id)}
                        aria-label={`Thao tác với ${b.name}`}
                        aria-expanded={menuId === b.id}
                        className="w-8 h-8 rounded-md inline-flex items-center justify-center text-ink-400 hover:bg-ink-100 hover:text-ink-900 transition"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {menuId === b.id && (
                        <div
                          className="absolute right-0 top-full mt-1 w-52 rounded-lg border shadow-pop z-30 overflow-hidden py-1"
                          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                        >
                          <MenuItem icon={Eye} label="Xem chi tiết" onClick={() => { setSelectedId(b.id); setMenuId(null); }} />
                          <MenuItem icon={Edit2} label="Chỉnh sửa" onClick={() => openEdit(b)} />
                          <MenuItem icon={Copy} label="Nhân bản" onClick={() => duplicateBranch(b)} />
                          <MenuItem icon={Power} label={b.status === "active" ? "Tạm đóng" : "Mở lại"} onClick={() => toggleStatus(b)} />
                          <div className="my-1 h-px" style={{ backgroundColor: "var(--border-soft)" }} />
                          <MenuItem icon={Trash2} label="Xoá chi nhánh" danger onClick={() => { setConfirm(b); setMenuId(null); }} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-[12px] text-ink-500 mb-3">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{b.address}</span></div>
                    <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" />{b.phone}</div>
                    <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 shrink-0" /><span className="truncate">{b.email}</span></div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3 py-2.5 border-y border-ink-100">
                    <MiniStat label="Phòng" value={b.totalRooms} />
                    <MiniStat label="Lấp đầy" value={`${b.occupancy}%`} accent className="border-x border-ink-100" />
                    <MiniStat label="Nhân sự" value={s.staffCount} />
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {(b.facilities || []).slice(0, 4).map((f) => {
                      const Icon = facilityIcons[f] || Building2;
                      return (
                        <span key={f} className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-ink-50 text-ink-600 border border-ink-100">
                          <Icon className="w-3 h-3" />{f}
                        </span>
                      );
                    })}
                    {(b.facilities || []).length > 4 && (
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
                    <div className="h-full rounded-full transition-all" style={{ width: `${b.occupancy}%`, backgroundColor: "var(--accent)" }} />
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => { setBranch(isActive ? "ALL" : b.id); notify(isActive ? "Đã bỏ chọn chi nhánh" : `Đang xem ${b.name}`); }}
                      className="flex-1 text-[12px] font-semibold py-2 rounded-md transition flex items-center justify-center gap-1.5 active:scale-95"
                      style={isActive
                        ? { backgroundColor: "var(--accent)", color: "var(--on-accent)" }
                        : { backgroundColor: "var(--surface)", color: "var(--accent)", border: "1px solid var(--accent)" }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isActive ? "Bỏ chọn" : "Đặt làm đang xem"}
                    </button>
                    <button
                      onClick={() => openEdit(b)}
                      title="Chỉnh sửa"
                      aria-label={`Chỉnh sửa ${b.name}`}
                      className="px-2.5 py-2 rounded-md border border-ink-200 text-ink-600 hover:bg-ink-50 transition active:scale-95"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
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
                  <th className="table-th text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const isActive = activeBranchId === b.id;
                  return (
                    <tr key={b.id} className="hover:bg-ink-50 transition"
                      style={isActive ? { backgroundColor: "var(--accent-soft)" } : undefined}>
                      <td className="table-td font-mono text-[12px]">
                        {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle" style={{ backgroundColor: "var(--accent)" }} />}
                        {b.code}
                      </td>
                      <td className="table-td">
                        <button onClick={() => setSelectedId(b.id)} className="text-left hover:underline">
                          <div className="font-semibold text-ink-900">{b.name}</div>
                          <div className="text-[11px] text-ink-500">{b.type}</div>
                        </button>
                      </td>
                      <td className="table-td hidden sm:table-cell">{b.city}</td>
                      <td className="table-td hidden md:table-cell">{b.manager}</td>
                      <td className="table-td tabular-nums hidden sm:table-cell">{b.totalRooms}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="w-16 sm:w-20 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                            <div className="h-full" style={{ width: `${b.occupancy}%`, backgroundColor: "var(--accent)" }} />
                          </div>
                          <span className="font-semibold text-[12px] tabular-nums">{b.occupancy}%</span>
                        </div>
                      </td>
                      <td className="table-td font-semibold tabular-nums hidden md:table-cell">{formatVND(b.revenue)}</td>
                      <td className="table-td"><StatusPill status={b.status} /></td>
                      <td className="table-td">
                        <div className="flex items-center justify-end gap-1">
                          <IconBtn title="Đặt làm đang xem" onClick={() => { setBranch(isActive ? "ALL" : b.id); notify(isActive ? "Đã bỏ chọn" : `Đang xem ${b.name}`); }}>
                            <Eye className="w-4 h-4" style={isActive ? { color: "var(--accent)" } : undefined} />
                          </IconBtn>
                          <IconBtn title="Chỉnh sửa" onClick={() => openEdit(b)}><Edit2 className="w-4 h-4" /></IconBtn>
                          <IconBtn title="Xoá" onClick={() => setConfirm(b)}><Trash2 className="w-4 h-4" /></IconBtn>
                          <IconBtn title="Xem chi tiết" onClick={() => setSelectedId(b.id)}><ChevronRight className="w-4 h-4" /></IconBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ═══ DRAWER CHI TIẾT ═══ */}
      {selected && stats && (
        <BranchDrawer
          branch={selected}
          stats={stats}
          isActive={selected.id === activeBranchId}
          onClose={() => setSelectedId(null)}
          onToggleActive={() => {
            setBranch(selected.id === activeBranchId ? "ALL" : selected.id);
            notify(selected.id === activeBranchId ? "Đã bỏ chọn" : `Đang xem ${selected.name}`);
          }}
          onEdit={() => openEdit(selected)}
          onNotify={notify}
          tab={tab}
          setTab={setTab}
        />
      )}

      {/* ═══ FORM THÊM / SỬA ═══ */}
      <BranchForm
        open={formOpen}
        initial={editing}
        existingCodes={branchList.filter((b) => b.id !== editing?.id).map((b) => b.code)}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={saveBranch}
      />

      {/* ═══ XÁC NHẬN XOÁ ═══ */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        icon={AlertCircle}
        title="Xoá chi nhánh?"
        subtitle={confirm?.name}
        width="max-w-md"
        footer={
          <>
            <button onClick={() => setConfirm(null)} className="btn-outline">Huỷ</button>
            <button
              onClick={() => removeBranch(confirm)}
              className="px-3 py-2 rounded-md text-[12.5px] font-bold"
              style={{ backgroundColor: "var(--danger)", color: "var(--on-accent)" }}
            >
              Xoá vĩnh viễn
            </button>
          </>
        }
      >
        <p className="text-[12.5px] text-ink-700 leading-relaxed">
          Toàn bộ dữ liệu hiển thị của <strong className="text-ink-900">{confirm?.name}</strong> sẽ bị gỡ khỏi danh sách.
          Thao tác này không thể hoàn tác trong phiên làm việc.
        </p>
      </Modal>

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-lg shadow-pop border text-[12.5px] font-semibold animate-slideUp max-w-[92vw]"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}
        >
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--success)" }} />
            {toast}
          </span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ UI nhỏ ═══════════════ */

function SummaryCard({ label, value, icon: Icon, tone, foot }) {
  const solid = tone === "accent" ? "var(--accent)" : `var(--${tone})`;
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-ink-500 uppercase tracking-wider font-semibold">{label}</div>
          <div className="text-[20px] sm:text-[22px] font-bold text-ink-900 mt-1 leading-none tabular-nums break-all">{value}</div>
          <div className="text-[11px] mt-1.5 inline-flex items-center gap-1" style={{ color: "var(--fg-muted)" }}>{foot}</div>
        </div>
        <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: solid, color: "var(--on-accent)" }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

function MiniStat({ label, value, accent, className = "" }) {
  return (
    <div className={`text-center ${className}`}>
      <div className="text-ink-500 text-[10px] uppercase tracking-wider">{label}</div>
      <div className="font-bold text-[14px] tabular-nums" style={accent ? { color: "var(--accent)" } : { color: "var(--fg)" }}>
        {value}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="min-w-0">
      <div className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500 mb-1.5 min-h-[15px]">{label}</div>
      {children}
    </div>
  );
}

function Chip({ on, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition active:scale-95"
      style={on
        ? { backgroundColor: "var(--accent)", color: "var(--on-accent)", borderColor: "var(--accent)" }
        : { backgroundColor: "var(--surface)", color: "var(--fg-muted)", borderColor: "var(--border)" }}
    >
      {children}
    </button>
  );
}

function ActiveChip({ children, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)", borderColor: "var(--accent)" }}
    >
      {children}
      <button onClick={onRemove} aria-label="Bỏ điều kiện" className="w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-black/10">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium hover:bg-ink-50 transition text-left"
      style={{ color: danger ? "var(--danger-fg)" : "var(--fg)" }}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
    </button>
  );
}

function IconBtn({ title, onClick, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="w-8 h-8 rounded-md inline-flex items-center justify-center text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition active:scale-90"
    >
      {children}
    </button>
  );
}

/* ═══════════════ FORM THÊM / SỬA CHI NHÁNH ═══════════════ */

const BLANK = {
  name: "", code: "", city: "", region: REGIONS[0], type: BRANCH_TYPES[0],
  address: "", phone: "", email: "", manager: "", openingDate: "2026-01-01",
  totalRooms: "", rating: 4.5, occupancy: 70, revenue: "", status: "active",
  facilities: [], image: "",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80";

function BranchForm({ open, initial, existingCodes = [], onClose, onSubmit }) {
  const [v, setV] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setTouched(false);
    setV(initial
      ? { ...BLANK, ...initial, totalRooms: String(initial.totalRooms ?? ""), revenue: String(initial.revenue ?? "") }
      : BLANK);
  }, [open, initial]);

  const set = (k, val) => setV((s) => ({ ...s, [k]: val }));

  const validate = (state) => {
    const e = {};
    if (!state.name.trim()) e.name = "Bắt buộc nhập tên chi nhánh";
    else if (state.name.trim().length < 3) e.name = "Tên phải từ 3 ký tự";

    const code = state.code.trim().toUpperCase();
    if (!code) e.code = "Bắt buộc nhập mã";
    else if (!/^[A-Z]{2,3}$/.test(code)) e.code = "Mã gồm 2–3 chữ cái in hoa, ví dụ: HCM";
    else if (existingCodes.includes(code)) e.code = "Mã này đã được dùng";

    if (!state.city.trim()) e.city = "Bắt buộc nhập thành phố";
    if (!state.address.trim()) e.address = "Bắt buộc nhập địa chỉ";

    if (!state.phone.trim()) e.phone = "Bắt buộc nhập số điện thoại";
    else if (!/^0\d{9}$/.test(state.phone.trim())) e.phone = "SĐT gồm 10 số, bắt đầu bằng 0";

    if (!state.email.trim()) e.email = "Bắt buộc nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) e.email = "Email chưa đúng định dạng";

    if (!state.manager.trim()) e.manager = "Bắt buộc nhập người quản lý";
    if (!state.openingDate) e.openingDate = "Chọn ngày khai trương";

    const rooms_ = Number(state.totalRooms);
    if (state.totalRooms === "") e.totalRooms = "Bắt buộc nhập số phòng";
    else if (!Number.isInteger(rooms_) || rooms_ < 1 || rooms_ > 2000) e.totalRooms = "Số phòng từ 1 đến 2000";

    if (state.revenue !== "" && Number(state.revenue) < 0) e.revenue = "Doanh thu không thể âm";
    if (!state.facilities.length) e.facilities = "Chọn ít nhất 1 tiện nghi";
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(v);
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`f-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    onSubmit({
      ...v,
      code: v.code.trim().toUpperCase(),
      name: v.name.trim(),
      city: v.city.trim(),
      address: v.address.trim(),
      phone: v.phone.trim(),
      email: v.email.trim(),
      manager: v.manager.trim(),
      totalRooms: Number(v.totalRooms),
      revenue: v.revenue === "" ? 2_400_000_000 : Number(v.revenue),
      occupancy: Number(v.occupancy),
      rating: Number(v.rating),
      image: v.image.trim() || DEFAULT_IMAGE,
      gallery: initial?.gallery || [],
    });
  };

  const err = (k) => (touched ? errors[k] : undefined);

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={initial ? Edit2 : Plus}
      title={initial ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
      subtitle={initial ? initial.name : "Điền thông tin cơ bản · các trường có dấu * là bắt buộc"}
      width="max-w-2xl"
      footer={
        <>
          {touched && Object.keys(errors).length > 0 && (
            <span className="mr-auto text-[12px] font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--danger-fg)" }}>
              <AlertCircle className="w-3.5 h-3.5" />
              Còn {Object.keys(errors).length} trường chưa hợp lệ
            </span>
          )}
          <button type="button" onClick={onClose} className="btn-outline">Huỷ</button>
          <button type="submit" form="branch-form" className="btn-primary">
            <Check className="w-4 h-4" /> {initial ? "Lưu thay đổi" : "Tạo chi nhánh"}
          </button>
        </>
      }
    >
      <form id="branch-form" onSubmit={submit} noValidate className="space-y-5">
        <FormSection title="Thông tin cơ bản">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field className="sm:col-span-2" label="Tên chi nhánh" required error={err("name")} id="f-name">
              <input id="f-name" className="input" value={v.name} onChange={(e) => set("name", e.target.value)}
                placeholder="Condo HUB Resort Cần Giờ" />
            </Field>
            <Field label="Mã" required error={err("code")} id="f-code" hint="2–3 chữ in hoa">
              <input id="f-code" className="input uppercase" maxLength={3} value={v.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="CG" />
            </Field>
            <Field label="Thành phố / Huyện" required error={err("city")} id="f-city">
              <input id="f-city" className="input" value={v.city} onChange={(e) => set("city", e.target.value)} placeholder="Cần Giờ" />
            </Field>
            <Field label="Khu vực" required id="f-region">
              <select id="f-region" className="input" value={v.region} onChange={(e) => set("region", e.target.value)}>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Loại hình" required id="f-type">
              <select id="f-type" className="input" value={v.type} onChange={(e) => set("type", e.target.value)}>
                {BRANCH_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field className="sm:col-span-3" label="Địa chỉ" required error={err("address")} id="f-address">
              <input id="f-address" className="input" value={v.address} onChange={(e) => set("address", e.target.value)}
                placeholder="123 Đường Duyên Hải, H. Cần Giờ" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Liên hệ">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Số điện thoại" required error={err("phone")} id="f-phone">
              <input id="f-phone" className="input" inputMode="tel" value={v.phone}
                onChange={(e) => set("phone", e.target.value)} placeholder="0912345678" />
            </Field>
            <Field label="Email" required error={err("email")} id="f-email">
              <input id="f-email" className="input" inputMode="email" value={v.email}
                onChange={(e) => set("email", e.target.value)} placeholder="branch.cg@condohub.vn" />
            </Field>
            <Field label="Người quản lý" required error={err("manager")} id="f-manager">
              <input id="f-manager" className="input" value={v.manager} onChange={(e) => set("manager", e.target.value)}
                placeholder="Nguyễn Văn A" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Quy mô & vận hành">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Tổng số phòng" required error={err("totalRooms")} id="f-totalRooms">
              <input id="f-totalRooms" type="number" min="1" max="2000" className="input" value={v.totalRooms}
                onChange={(e) => set("totalRooms", e.target.value)} placeholder="120" />
            </Field>
            <Field label="Ngày khai trương" required error={err("openingDate")} id="f-openingDate">
              <input id="f-openingDate" type="date" className="input" value={v.openingDate}
                onChange={(e) => set("openingDate", e.target.value)} />
            </Field>
            <Field label="Trạng thái" id="f-status">
              <select id="f-status" className="input" value={v.status} onChange={(e) => set("status", e.target.value)}>
                {Object.entries(STATUS_MAP).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Doanh thu năm (VNĐ)" error={err("revenue")} id="f-revenue" hint="Bỏ trống = mặc định">
              <input id="f-revenue" type="number" min="0" className="input" value={v.revenue}
                onChange={(e) => set("revenue", e.target.value)} placeholder="2400000000" />
            </Field>
            <Field className="col-span-2" label={`Lấp đầy dự kiến · ${v.occupancy}%`} id="f-occupancy">
              <input id="f-occupancy" type="range" min="0" max="100" step="1" value={v.occupancy}
                onChange={(e) => set("occupancy", e.target.value)} className="w-full" style={{ accentColor: "var(--accent)" }} />
            </Field>
            <Field className="col-span-2" label={`Đánh giá · ${Number(v.rating).toFixed(1)} ★`} id="f-rating">
              <input id="f-rating" type="range" min="1" max="5" step="0.1" value={v.rating}
                onChange={(e) => set("rating", e.target.value)} className="w-full" style={{ accentColor: "var(--accent)" }} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Tiện nghi" required error={err("facilities")}>
          <div className="flex flex-wrap gap-1.5">
            {ALL_FACILITIES.map((f) => {
              const Icon = facilityIcons[f] || Building2;
              const on = v.facilities.includes(f);
              return (
                <Chip key={f} on={on} onClick={() => set("facilities", on ? v.facilities.filter((x) => x !== f) : [...v.facilities, f])}>
                  <Icon className="w-3 h-3" /> {f}
                </Chip>
              );
            })}
          </div>
          <div className="text-[11px] text-ink-500 mt-2">Đã chọn {v.facilities.length}/{ALL_FACILITIES.length}</div>
        </FormSection>

        <FormSection title="Ảnh đại diện">
          <div className="flex items-start gap-3">
            <div className="w-28 h-20 rounded-md overflow-hidden border shrink-0 bg-ink-100" style={{ borderColor: "var(--border)" }}>
              <img src={v.image || DEFAULT_IMAGE} alt="" className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }} />
            </div>
            <Field className="flex-1" label="Đường dẫn ảnh" id="f-image" hint="Bỏ trống sẽ dùng ảnh mặc định">
              <input id="f-image" className="input" value={v.image} onChange={(e) => set("image", e.target.value)}
                placeholder="https://…" />
            </Field>
          </div>
        </FormSection>
      </form>
    </Modal>
  );
}

function FormSection({ title, required, error, children }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-[11px] uppercase font-bold tracking-wider mb-2" style={{ color: "var(--accent)" }}>
        {title}{required && <span style={{ color: "var(--danger)" }}> *</span>}
      </legend>
      {children}
      {error && (
        <div className="mt-1.5 text-[11.5px] font-semibold inline-flex items-center gap-1" style={{ color: "var(--danger-fg)" }}>
          <AlertCircle className="w-3 h-3" /> {error}
        </div>
      )}
    </fieldset>
  );
}

function Field({ label, required, error, hint, id, children, className = "" }) {
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

/* ═══════════════ DRAWER ═══════════════ */

function BranchDrawer({ branch: selected, stats, isActive, onClose, onToggleActive, onEdit, onNotify, tab, setTab }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink-900/50 backdrop-blur-[2px]" onClick={onClose} role="presentation" />
      <div
        role="dialog" aria-modal="true" aria-label={selected.name}
        className="w-full max-w-[680px] shadow-2xl flex flex-col overflow-hidden animate-slideUp"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <div className="relative h-44 overflow-hidden text-white shrink-0">
          <img src={selected.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, rgba(7,13,26,.94), rgba(7,13,26,.6) 55%, rgba(7,13,26,.25))",
          }} />
          <button onClick={onClose} aria-label="Đóng"
            className="absolute top-4 right-4 w-9 h-9 rounded-md bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition z-10">
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 text-white/80 text-[11px] uppercase tracking-widest font-semibold">
              <Building2 className="w-3.5 h-3.5" />{selected.code} · {selected.region} · {selected.type}
            </div>
            <h2 className="font-display font-bold text-[22px] mt-1 leading-tight">{selected.name}</h2>
            <div className="flex items-center gap-2 text-[12px] text-white/80 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{selected.city}</span>
              <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded font-bold">
                <Star className="w-3 h-3 fill-amber-800 text-amber-800" />{selected.rating}
              </span>
              <span>· {stats.reviewCount} đánh giá</span>
              <StatusPill status={selected.status} />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-2.5 border-b flex items-center gap-2 flex-wrap shrink-0"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <button onClick={onToggleActive}
            className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded transition flex items-center gap-1.5 active:scale-95"
            style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}>
            <Eye className="w-3 h-3" />{isActive ? "Bỏ chọn chi nhánh" : "Đặt làm đang xem"}
          </button>
          <button onClick={onEdit}
            className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded border text-ink-700 hover:bg-ink-50 transition flex items-center gap-1.5 active:scale-95"
            style={{ borderColor: "var(--border)" }}>
            <Edit2 className="w-3 h-3" /> Chỉnh sửa
          </button>
          <button
            onClick={() => {
              const url = `https://condohub.vn/${(selected.code || "").toLowerCase()}`;
              navigator.clipboard?.writeText(url);
              onNotify(`Đã sao chép liên kết: ${url}`);
            }}
            className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded border text-ink-700 hover:bg-ink-50 transition flex items-center gap-1.5 active:scale-95"
            style={{ borderColor: "var(--border)" }}>
            <ExternalLink className="w-3 h-3" /> Sao chép liên kết
          </button>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-ink-500 font-semibold font-mono">{selected.id}</span>
        </div>

        <div className="border-b px-4 sm:px-6 flex gap-0.5 overflow-x-auto no-scrollbar shrink-0"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              aria-current={tab === t.key}
              className="px-3 py-2.5 text-[12px] font-semibold whitespace-nowrap border-b-2 transition"
              style={tab === t.key
                ? { borderColor: "var(--accent)", color: "var(--accent)" }
                : { borderColor: "transparent", color: "var(--fg-muted)" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5" style={{ backgroundColor: "var(--bg-app)" }}>
          {tab === "overview" && <TabOverview selected={selected} stats={stats} />}
          {tab === "facilities" && (
            <Card>
              <div className="font-semibold text-[13px] text-ink-900 mb-3">Tiện nghi ({(selected.facilities || []).length})</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(selected.facilities || []).map((f) => {
                  const Icon = facilityIcons[f] || Building2;
                  return (
                    <div key={f} className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-ink-50 border border-ink-100">
                      <div className="w-8 h-8 rounded-md flex items-center justify-center border bg-white"
                        style={{ color: "var(--accent)", borderColor: "var(--border)" }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[12px] font-semibold text-ink-900">{f}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
          {tab === "rooms" && <TabRooms selected={selected} stats={stats} />}
          {tab === "financials" && <TabFinancials selected={selected} stats={stats} />}
          {tab === "activity" && <TabActivity stats={stats} />}
        </div>
      </div>
    </div>
  );
}

function TabOverview({ selected, stats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { label: "Lấp đầy", value: `${stats.realOccupancy}%`, icon: Percent, tone: "accent", sub: "thực tế" },
          { label: "Doanh thu", value: formatVND(selected.revenue), icon: Wallet, tone: "warning", sub: "năm nay" },
          { label: "ADR", value: formatVND(stats.adr), icon: BarChart3, tone: "highlight", sub: "/phòng/đêm" },
          { label: "Nhân sự", value: stats.staffCount, icon: Users, tone: "success", sub: "đang làm" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-md border border-ink-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">{k.label}</span>
              <div className="w-6 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: k.tone === "accent" ? "var(--accent)" : `var(--${k.tone})`, color: "var(--on-accent)" }}>
                <k.icon className="w-3 h-3" />
              </div>
            </div>
            <div className="font-bold text-[16px] text-ink-900 tabular-nums leading-none break-all">{k.value}</div>
            <div className="text-[10px] text-ink-500 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-[13px] text-ink-900">Thông tin chung</div>
          <span className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold font-mono">{selected.id}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <Info label="Loại hình" value={selected.type} />
          <Info label="Khu vực" value={selected.region} />
          <Info label="Ngày khai trương" value={selected.openingDate} />
          <Info label="Thời gian hoạt động" value={`${stats.ageYears} năm`} />
          <Info className="col-span-2" label="Địa chỉ" value={selected.address} />
        </div>
        <div className="border-t border-ink-100 mt-3 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <a href={`tel:${selected.phone}`} className="flex items-center gap-2 hover:underline">
            <Phone className="w-3.5 h-3.5 text-ink-500 shrink-0" /><span className="text-ink-700 tabular-nums">{selected.phone}</span>
          </a>
          <a href={`mailto:${selected.email}`} className="flex items-center gap-2 hover:underline min-w-0">
            <Mail className="w-3.5 h-3.5 text-ink-500 shrink-0" /><span className="text-ink-700 truncate">{selected.email}</span>
          </a>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-ink-500 shrink-0" />
            <span className="text-ink-700">GĐ: <strong className="text-ink-900">{selected.manager}</strong></span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="w-3.5 h-3.5 text-ink-500 shrink-0" />
            <span className="text-ink-700 truncate">condohub.vn/{(selected.code || "").toLowerCase()}</span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-[13px] text-ink-900">Thư viện ảnh</div>
          <span className="text-[11px] text-ink-500">{(selected.gallery?.length || 0) + 1} ảnh</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[selected.image, ...(selected.gallery || [])].slice(0, 6).map((src, i) => (
            <a key={i} href={src} target="_blank" rel="noreferrer"
              className="relative aspect-[4/3] rounded-md overflow-hidden group cursor-zoom-in bg-ink-100 block">
              <img src={src} alt="" loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition" />
              </div>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold uppercase tracking-wider text-white bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
                  Ảnh chính
                </span>
              )}
            </a>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-[13px] text-ink-900">Trạng thái phòng</div>
          <span className="text-[11px] text-ink-500">Tổng <strong className="text-ink-900 tabular-nums">{stats.total}</strong> phòng</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {[
            { key: "available", label: "Trống", tone: "info" },
            { key: "occupied",  label: "Đang ở", tone: "accent" },
            { key: "reserved",  label: "Đã đặt", tone: "highlight" },
            { key: "cleaning",  label: "Đang dọn", tone: "warning" },
            { key: "maint",     label: "Bảo trì", tone: "danger" },
          ].map((s) => {
            const val = stats[s.key] || 0;
            const pct = stats.total ? Math.round((val / stats.total) * 100) : 0;
            const solid = s.tone === "accent" ? "var(--accent)" : `var(--${s.tone})`;
            return (
              <div key={s.key} className="rounded-md p-2.5 border"
                style={{ backgroundColor: `var(--${s.tone}-soft)`, borderColor: `var(--${s.tone}-border)` }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: solid }} />
                  <span className="text-[10px] uppercase tracking-wider font-semibold truncate" style={{ color: `var(--${s.tone}-fg)` }}>{s.label}</span>
                </div>
                <div className="font-bold text-[18px] mt-1 tabular-nums leading-none" style={{ color: `var(--${s.tone}-fg)` }}>{val}</div>
                <div className="text-[10px] mt-1 tabular-nums" style={{ color: `var(--${s.tone}-fg)`, opacity: .75 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value, className = "" }) {
  return (
    <div className={className}>
      <div className="text-ink-500 text-[11px]">{label}</div>
      <div className="font-semibold text-ink-900">{value}</div>
    </div>
  );
}

function TabRooms({ selected, stats }) {
  return (
    <div className="space-y-3">
      <Card>
        <div className="font-semibold text-[13px] text-ink-900 mb-3">Phân bổ theo hạng phòng</div>
        <div className="space-y-2.5">
          {stats.byType.map((t) => {
            const pct = stats.total ? Math.round((t.total / stats.total) * 100) : 0;
            const solid = t.tone === "accent" ? "var(--accent)" : `var(--${t.tone})`;
            return (
              <div key={t.key}>
                <div className="flex items-center justify-between mb-1 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: solid }} />
                    <span className="text-[12px] font-semibold text-ink-900 truncate">{t.name}</span>
                    <span className="text-[11px] text-ink-500 shrink-0">({t.key})</span>
                  </div>
                  <div className="text-[11px] text-ink-700 tabular-nums shrink-0">
                    <strong className="text-ink-900">{t.total}</strong> phòng · {formatVND(t.avg)}/đêm
                  </div>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full" style={{ width: `${pct}%`, backgroundColor: solid }} />
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
            <div key={r.id} className="flex items-center justify-between gap-2 p-2.5 rounded-md border border-ink-100 hover:bg-ink-50 transition">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-md bg-ink-100 text-ink-700 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                  {r.number}
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-ink-900 truncate">{r.typeName}</div>
                  <div className="text-[10px] text-ink-500 tabular-nums">{formatVND(r.price)}</div>
                </div>
              </div>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 ${r.statusSoft || "bg-ink-100 text-ink-700"}`}>
                {r.statusLabel}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TabFinancials({ selected, stats }) {
  return (
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
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={formatVND(v)}>
                <div className="w-full rounded-t transition-all group-hover:opacity-80"
                  style={{ height: `${h}%`, backgroundColor: "var(--accent)" }} />
                <div className="text-[9px] text-ink-500 font-mono">T{i + 1}</div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-ink-100">
          <Info label="Cao điểm" value={formatVND(stats.peak)} />
          <Info label="TB/tháng" value={formatVND(Math.round(selected.revenue / 12))} />
          <Info label="ADR" value={formatVND(stats.adr)} />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">Doanh thu / phòng</div>
          <div className="font-bold text-ink-900 text-[18px] tabular-nums mt-1 break-all">
            {formatVND(Math.round(selected.revenue / Math.max(1, selected.totalRooms)))}
          </div>
          <div className="text-[10px] mt-1 inline-flex items-center gap-1" style={{ color: "var(--success-fg)" }}>
            <TrendingUp className="w-3 h-3" /> +12% YoY
          </div>
        </Card>
        <Card>
          <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">Chi phí ước tính</div>
          <div className="font-bold text-ink-900 text-[18px] tabular-nums mt-1 break-all">
            {formatVND(Math.round(selected.revenue * 0.62))}
          </div>
          <div className="text-[10px] mt-1 inline-flex items-center gap-1" style={{ color: "var(--danger-fg)" }}>
            <TrendingDown className="w-3 h-3" /> 62% DT
          </div>
        </Card>
      </div>
    </div>
  );
}

function TabActivity({ stats }) {
  return (
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
              <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)" }}>
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
  );
}
