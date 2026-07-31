import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Modal } from "../components/DashboardPrimitives";
import { Icons } from "../components/Icons";
import { bookings as seedBookings, bookingStatusList, branches, roomTypeList, guests } from "../data/mockData";
import { formatVND, formatVNDFull, formatDate } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import Pagination from "../components/Pagination";

const {
  Search, Filter, Plus, Download, MoreHorizontal, Users, ChevronDown, Eye, X, Check,
  ArrowUpDown, RotateCcw, SearchX, AlertCircle, Trash2, Edit2, CalendarCheck,
  LogIn, LogOut, Wallet, CheckCircle2, XCircle, Building2,
} = Icons;

/* Ngày "hôm nay" của bộ dữ liệu mock (xem references/data-model.md) */
const TODAY = "2026-07-28";

const STATUS = {
  pending:     { label: "Chờ xác nhận", tone: "warning" },
  confirmed:   { label: "Đã xác nhận",  tone: "info" },
  checked_in:  { label: "Đang ở",       tone: "accent" },
  checked_out: { label: "Đã trả phòng", tone: "neutral" },
  cancelled:   { label: "Đã hủy",       tone: "danger" },
};

const toneVars = (tone) => ({
  solid:  tone === "accent" ? "var(--accent)" : `var(--${tone})`,
  soft:   `var(--${tone}-soft)`,
  fg:     `var(--${tone}-fg)`,
  border: tone === "accent" ? "var(--accent)" : `var(--${tone}-border)`,
});

const SORTS = [
  { key: "checkin-desc", label: "Nhận phòng gần nhất" },
  { key: "checkin-asc",  label: "Nhận phòng xa nhất" },
  { key: "total-desc",   label: "Giá trị cao nhất" },
  { key: "total-asc",    label: "Giá trị thấp nhất" },
  { key: "guest-asc",    label: "Tên khách A → Z" },
  { key: "created-desc", label: "Mới tạo nhất" },
];

const DATE_PRESETS = [
  { key: "all",      label: "Tất cả" },
  { key: "today",    label: "Hôm nay" },
  { key: "next7",    label: "7 ngày tới" },
  { key: "next30",   label: "30 ngày tới" },
  { key: "past",     label: "Đã qua" },
];

const EMPTY_FILTERS = {
  status: "all", branch: "all", sources: [], types: [],
  payment: "all", datePreset: "all", dateFrom: "", dateTo: "",
  minTotal: "", maxTotal: "",
};

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const addDays = (iso, n) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export default function Bookings() {
  const { activeBranchId } = useActiveBranch();

  const [list, setList] = useState(seedBookings);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState("checkin-desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detail, setDetail] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [menuId, setMenuId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [picked, setPicked] = useState([]);
  const [toast, setToast] = useState(null);

  const sortRef = useRef(null);
  const menuRef = useRef(null);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    setFilters((f) => ({ ...f, branch: activeBranchId === "ALL" ? "all" : activeBranchId }));
  }, [activeBranchId]);

  useEffect(() => { setCurrentPage(1); }, [filters, search, sort, pageSize]);

  useEffect(() => {
    const onDown = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuId(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const sourceOptions = useMemo(
    () => [...new Set(seedBookings.map((b) => b.source))].sort((a, b) => a.localeCompare(b, "vi")),
    []
  );

  /* Phạm vi theo chi nhánh — thẻ KPI đếm trên phạm vi này chứ không phải toàn bộ,
     để số liệu khớp với bộ lọc chi nhánh đang chọn. */
  const scoped = useMemo(
    () => (filters.branch === "all" ? list : list.filter((b) => b.branchId === filters.branch)),
    [list, filters.branch]
  );

  const dateWindow = useMemo(() => {
    switch (filters.datePreset) {
      case "today":  return [TODAY, TODAY];
      case "next7":  return [TODAY, addDays(TODAY, 7)];
      case "next30": return [TODAY, addDays(TODAY, 30)];
      case "past":   return ["0000-01-01", addDays(TODAY, -1)];
      default:       return [filters.dateFrom || null, filters.dateTo || null];
    }
  }, [filters.datePreset, filters.dateFrom, filters.dateTo]);

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    const [from, to] = dateWindow;
    const out = scoped.filter((b) => {
      if (filters.status !== "all" && b.status !== filters.status) return false;
      if (filters.sources.length && !filters.sources.includes(b.source)) return false;
      if (filters.types.length && !filters.types.includes(b.roomType)) return false;
      if (filters.payment === "paid" && b.paid < b.total) return false;
      if (filters.payment === "debt" && b.paid >= b.total) return false;
      if (from && b.checkIn < from) return false;
      if (to && b.checkIn > to) return false;
      if (filters.minTotal !== "" && b.total < Number(filters.minTotal)) return false;
      if (filters.maxTotal !== "" && b.total > Number(filters.maxTotal)) return false;
      if (q && !deaccent(`${b.id} ${b.guestName} ${b.branchName} ${b.source} ${b.roomTypeName}`).includes(q)) return false;
      return true;
    });
    const cmp = {
      "checkin-desc": (a, b) => (b.checkIn || "").localeCompare(a.checkIn || ""),
      "checkin-asc":  (a, b) => (a.checkIn || "").localeCompare(b.checkIn || ""),
      "total-desc":   (a, b) => b.total - a.total,
      "total-asc":    (a, b) => a.total - b.total,
      "guest-asc":    (a, b) => a.guestName.localeCompare(b.guestName, "vi"),
      "created-desc": (a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""),
    }[sort];
    return [...out].sort(cmp);
  }, [scoped, filters, search, sort, dateWindow]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const stats = useMemo(() => ({
    total: scoped.length,
    pending: scoped.filter((b) => b.status === "pending").length,
    confirmed: scoped.filter((b) => b.status === "confirmed").length,
    checkedIn: scoped.filter((b) => b.status === "checked_in").length,
    cancelled: scoped.filter((b) => b.status === "cancelled").length,
    revenue: scoped.reduce((s, b) => s + b.total, 0),
    debt: scoped.reduce((s, b) => s + Math.max(0, b.total - b.paid), 0),
  }), [scoped]);

  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) + (filters.branch !== "all" ? 1 : 0) +
    filters.sources.length + filters.types.length +
    (filters.payment !== "all" ? 1 : 0) +
    (filters.datePreset !== "all" ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0) +
    (filters.minTotal !== "" ? 1 : 0) + (filters.maxTotal !== "" ? 1 : 0);
  const hasQuery = activeFilterCount > 0 || search.trim() !== "";

  const toggleIn = (key, value) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));

  const resetFilters = () => { setFilters({ ...EMPTY_FILTERS }); setSearch(""); };

  /* ── thao tác ── */
  const patch = (ids, changes, msg) => {
    setList((l) => l.map((b) => (ids.includes(b.id) ? { ...b, ...(typeof changes === "function" ? changes(b) : changes) } : b)));
    setDetail((d) => (d && ids.includes(d.id) ? { ...d, ...(typeof changes === "function" ? changes(d) : changes) } : d));
    notify(msg);
  };

  const setStatus = (ids, status) =>
    patch(ids, { status }, ids.length > 1
      ? `Đã chuyển ${ids.length} booking sang “${STATUS[status].label}”`
      : `${ids[0]} → ${STATUS[status].label}`);

  const collect = (b) =>
    patch([b.id], { paid: b.total }, `Đã thu ${formatVND(b.total - b.paid)} của ${b.guestName}`);

  const removeBooking = (b) => {
    setList((l) => l.filter((x) => x.id !== b.id));
    setPicked((p) => p.filter((id) => id !== b.id));
    setDetail(null);
    setConfirm(null);
    setMenuId(null);
    notify(`Đã xoá booking ${b.id}`);
  };

  const saveBooking = (payload) => {
    if (editing) {
      setList((l) => l.map((b) => (b.id === editing.id ? { ...b, ...payload } : b)));
      notify(`Đã cập nhật ${editing.id}`);
    } else {
      const id = `BK-${String(Date.now()).slice(-6)}`;
      setList((l) => [{ ...payload, id, createdAt: TODAY }, ...l]);
      notify(`Đã tạo booking ${id}`);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const togglePick = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const pickAllOnPage = () => {
    const ids = paginated.map((b) => b.id);
    setPicked((p) => (ids.every((id) => p.includes(id)) ? p.filter((id) => !ids.includes(id)) : [...new Set([...p, ...ids])]));
  };

  return (
    <div>
      <PageHeader
        title="Quản lý đặt chỗ"
        subtitle={`${stats.total} booking · Doanh thu ${formatVND(stats.revenue)}${stats.debt > 0 ? ` · Còn nợ ${formatVND(stats.debt)}` : ""}`}
        actions={
          <>
            <button onClick={() => setShowFilter((v) => !v)} className="btn-outline" aria-expanded={showFilter}>
              <Filter className="w-4 h-4" /> Bộ lọc
              {activeFilterCount > 0 && (
                <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold inline-flex items-center justify-center tabular-nums"
                  style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button onClick={() => setExportOpen(true)} className="btn-outline">
              <Download className="w-4 h-4" /> Xuất dữ liệu
            </button>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-primary">
              <Plus className="w-4 h-4" /> Tạo booking
            </button>
          </>
        }
      />

      {/* ── Thẻ trạng thái (đồng thời là bộ lọc nhanh) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-5">
        {[
          { key: "all",         label: "Tất cả",       value: stats.total,     tone: null },
          { key: "pending",     label: "Chờ xác nhận", value: stats.pending,   tone: "warning" },
          { key: "confirmed",   label: "Đã xác nhận",  value: stats.confirmed, tone: "info" },
          { key: "checked_in",  label: "Đang ở",       value: stats.checkedIn, tone: "accent" },
          { key: "cancelled",   label: "Đã hủy",       value: stats.cancelled, tone: "danger" },
        ].map((s) => {
          const on = filters.status === s.key;
          const t = s.tone ? toneVars(s.tone) : null;
          return (
            <button
              key={s.key}
              onClick={() => setFilters((f) => ({ ...f, status: s.key }))}
              aria-pressed={on}
              className={`card p-4 text-left transition-all duration-300 relative overflow-hidden group ${
                on ? "shadow-lg -translate-y-1" : "hover:shadow-md hover:-translate-y-0.5"
              }`}
              style={on
                ? { backgroundColor: t?.solid || "var(--accent)", borderColor: "transparent", color: "var(--on-accent)" }
                : undefined}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider truncate"
                style={{ color: on ? "var(--on-accent)" : "var(--fg-muted)", opacity: on ? .85 : 1 }}>
                {s.label}
              </div>
              <div className="text-2xl font-extrabold font-display mt-1.5 tabular-nums leading-none"
                style={{ color: on ? "var(--on-accent)" : "var(--fg)" }}>
                {s.value}
              </div>
              <div className="mt-2.5 inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={on
                  ? { backgroundColor: "rgba(255,255,255,.22)", color: "var(--on-accent)" }
                  : { backgroundColor: t?.soft || "var(--surface-3)", color: t?.fg || "var(--fg-muted)" }}>
                {stats.total > 0 ? Math.round((s.value / stats.total) * 100) : 0}%
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Tìm kiếm + điều khiển ── */}
      <Card className="mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm kiếm booking"
              placeholder="Mã booking, tên khách, chi nhánh, nguồn…"
              className="input pl-9 pr-9 text-[16px] sm:text-[13px]"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Xoá tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full inline-flex items-center justify-center text-ink-400 hover:bg-ink-100 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative" ref={sortRef}>
            <button onClick={() => setSortOpen((v) => !v)} className="btn-outline whitespace-nowrap" aria-expanded={sortOpen}>
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">{SORTS.find((s) => s.key === sort)?.label}</span>
              <span className="sm:hidden">Sắp xếp</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 rounded-lg border shadow-pop z-30 overflow-hidden"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                {SORTS.map((s) => (
                  <button key={s.key} onClick={() => { setSort(s.key); setSortOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12.5px] hover:bg-ink-50 transition"
                    style={sort === s.key ? { color: "var(--accent)", fontWeight: 700 } : { color: "var(--fg)" }}>
                    {sort === s.key ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
            aria-label="Số dòng mỗi trang" className="input w-auto cursor-pointer">
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / trang</option>)}
          </select>
        </div>

        {showFilter && (
          <div className="mt-4 pt-4 border-t border-ink-100 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Group label="Chi nhánh">
                <select value={filters.branch} onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}
                  className="input cursor-pointer">
                  <option value="all">Tất cả chi nhánh</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Group>

              <Group label="Thanh toán">
                <div className="flex flex-wrap gap-1.5">
                  {[{ k: "all", l: "Tất cả" }, { k: "paid", l: "Đã thu đủ" }, { k: "debt", l: "Còn nợ" }].map((p) => (
                    <Chip key={p.k} on={filters.payment === p.k} onClick={() => setFilters((f) => ({ ...f, payment: p.k }))}>
                      {p.l}
                    </Chip>
                  ))}
                </div>
              </Group>
            </div>

            <Group label={`Nguồn đặt${filters.sources.length ? ` · ${filters.sources.length}` : ""}`}>
              <div className="flex flex-wrap gap-1.5">
                {sourceOptions.map((s) => (
                  <Chip key={s} on={filters.sources.includes(s)} onClick={() => toggleIn("sources", s)}>{s}</Chip>
                ))}
              </div>
            </Group>

            <Group label={`Hạng phòng${filters.types.length ? ` · ${filters.types.length}` : ""}`}>
              <div className="flex flex-wrap gap-1.5">
                {roomTypeList.map((t) => (
                  <Chip key={t.key} on={filters.types.includes(t.key)} onClick={() => toggleIn("types", t.key)}>{t.name}</Chip>
                ))}
              </div>
            </Group>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Group label="Ngày nhận phòng">
                <div className="flex flex-wrap gap-1.5">
                  {DATE_PRESETS.map((d) => (
                    <Chip key={d.key} on={filters.datePreset === d.key}
                      onClick={() => setFilters((f) => ({ ...f, datePreset: d.key, dateFrom: "", dateTo: "" }))}>
                      {d.label}
                    </Chip>
                  ))}
                </div>
              </Group>

              <Group label="Hoặc chọn khoảng ngày">
                <div className="flex items-center gap-2">
                  <input type="date" value={filters.dateFrom}
                    onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value, datePreset: "all" }))}
                    className="input text-[13px]" aria-label="Từ ngày" />
                  <span className="text-ink-400 text-[12px]">—</span>
                  <input type="date" value={filters.dateTo}
                    onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value, datePreset: "all" }))}
                    className="input text-[13px]" aria-label="Đến ngày" />
                </div>
              </Group>

              <Group label="Giá trị booking (VNĐ)">
                <div className="flex items-center gap-2">
                  <input type="number" min="0" step="1000000" placeholder="Từ" value={filters.minTotal}
                    onChange={(e) => setFilters((f) => ({ ...f, minTotal: e.target.value }))} className="input text-[13px]" />
                  <span className="text-ink-400 text-[12px]">—</span>
                  <input type="number" min="0" step="1000000" placeholder="Đến" value={filters.maxTotal}
                    onChange={(e) => setFilters((f) => ({ ...f, maxTotal: e.target.value }))} className="input text-[13px]" />
                </div>
              </Group>
            </div>

            <button onClick={resetFilters} disabled={!hasQuery}
              className="btn-outline disabled:opacity-40 disabled:cursor-not-allowed">
              <RotateCcw className="w-4 h-4" /> Đặt lại tất cả
            </button>
          </div>
        )}
      </Card>

      {/* ── Chip điều kiện ── */}
      {hasQuery && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-ink-500">
            <strong className="text-ink-900 tabular-nums">{filtered.length}</strong>/{stats.total} booking
          </span>
          {search.trim() && <ActiveChip onRemove={() => setSearch("")}>“{search.trim()}”</ActiveChip>}
          {filters.status !== "all" && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, status: "all" }))}>{STATUS[filters.status].label}</ActiveChip>}
          {filters.branch !== "all" && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, branch: "all" }))}>{branches.find((b) => b.id === filters.branch)?.name}</ActiveChip>}
          {filters.sources.map((s) => <ActiveChip key={s} onRemove={() => toggleIn("sources", s)}>{s}</ActiveChip>)}
          {filters.types.map((t) => <ActiveChip key={t} onRemove={() => toggleIn("types", t)}>{roomTypeList.find((x) => x.key === t)?.name}</ActiveChip>)}
          {filters.payment !== "all" && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, payment: "all" }))}>{filters.payment === "paid" ? "Đã thu đủ" : "Còn nợ"}</ActiveChip>}
          {filters.datePreset !== "all" && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, datePreset: "all" }))}>{DATE_PRESETS.find((d) => d.key === filters.datePreset)?.label}</ActiveChip>}
          {filters.dateFrom && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, dateFrom: "" }))}>Từ {formatDate(filters.dateFrom)}</ActiveChip>}
          {filters.dateTo && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, dateTo: "" }))}>Đến {formatDate(filters.dateTo)}</ActiveChip>}
          {filters.minTotal !== "" && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, minTotal: "" }))}>≥ {formatVND(Number(filters.minTotal))}</ActiveChip>}
          {filters.maxTotal !== "" && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, maxTotal: "" }))}>≤ {formatVND(Number(filters.maxTotal))}</ActiveChip>}
          <button onClick={resetFilters} className="text-[12px] font-semibold hover:underline" style={{ color: "var(--accent)" }}>
            Xoá hết
          </button>
        </div>
      )}

      {/* ── Thao tác hàng loạt ── */}
      {picked.length > 0 && (
        <div className="mb-4 rounded-md border px-3 py-2.5 flex items-center gap-2 flex-wrap animate-fadeIn"
          style={{ backgroundColor: "var(--accent-soft)", borderColor: "var(--accent)" }}>
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--accent-fg)" }} />
          <span className="text-[12.5px] font-bold" style={{ color: "var(--accent-fg)" }}>Đã chọn {picked.length}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {["confirmed", "checked_in", "checked_out", "cancelled"].map((k) => (
              <button key={k} onClick={() => { setStatus(picked, k); setPicked([]); }}
                className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition active:scale-95"
                style={{ backgroundColor: "var(--surface)", color: toneVars(STATUS[k].tone).fg, borderColor: toneVars(STATUS[k].tone).border }}>
                {STATUS[k].label}
              </button>
            ))}
          </div>
          <button onClick={() => setPicked([])} className="ml-auto text-[12px] font-semibold hover:underline" style={{ color: "var(--accent-fg)" }}>
            Bỏ chọn
          </button>
        </div>
      )}

      {/* ── Bảng ── */}
      <Card className="!p-0">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <SearchX className="w-10 h-10 mx-auto text-ink-300 mb-3" />
            <div className="text-sm font-semibold text-ink-900">Không tìm thấy booking nào</div>
            <div className="text-xs text-ink-500 mt-1">Thử bỏ bớt điều kiện lọc hoặc đổi từ khoá.</div>
            <button onClick={resetFilters} className="btn-primary mt-4 mx-auto">
              <RotateCcw className="w-4 h-4" /> Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr>
                    <th className="table-th w-10">
                      <input type="checkbox" aria-label="Chọn tất cả trong trang"
                        checked={paginated.length > 0 && paginated.every((b) => picked.includes(b.id))}
                        onChange={pickAllOnPage} className="w-4 h-4" style={{ accentColor: "var(--accent)" }} />
                    </th>
                    <th className="table-th">Mã</th>
                    <th className="table-th">Khách hàng</th>
                    <th className="table-th hidden md:table-cell">Chi nhánh</th>
                    <th className="table-th hidden lg:table-cell">Phòng</th>
                    <th className="table-th hidden sm:table-cell">Nhận</th>
                    <th className="table-th hidden sm:table-cell">Trả</th>
                    <th className="table-th hidden md:table-cell">Nguồn</th>
                    <th className="table-th text-right">Tổng tiền</th>
                    <th className="table-th">Trạng thái</th>
                    <th className="table-th text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((b) => {
                    const t = toneVars(STATUS[b.status]?.tone || "neutral");
                    const debt = Math.max(0, b.total - b.paid);
                    return (
                      <tr key={b.id} className="hover:bg-ink-50 transition border-b border-ink-100">
                        <td className="table-td">
                          <input type="checkbox" checked={picked.includes(b.id)} onChange={() => togglePick(b.id)}
                            aria-label={`Chọn ${b.id}`} className="w-4 h-4" style={{ accentColor: "var(--accent)" }} />
                        </td>
                        <td className="table-td">
                          <button onClick={() => setDetail(b)} className="font-mono text-xs font-semibold hover:underline"
                            style={{ color: "var(--accent)" }}>{b.id}</button>
                        </td>
                        <td className="table-td">
                          <button onClick={() => setDetail(b)} className="flex items-center gap-2.5 text-left">
                            <img src={b.guestAvatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-ink-200" />
                            <div className="min-w-0">
                              <div className="font-semibold text-ink-900 truncate hover:underline">{b.guestName}</div>
                              <div className="text-xs text-ink-500">{b.guests} khách · {b.nights} đêm</div>
                            </div>
                          </button>
                        </td>
                        <td className="table-td text-xs hidden md:table-cell">{b.branchName}</td>
                        <td className="table-td hidden lg:table-cell font-medium">{b.roomTypeName}</td>
                        <td className="table-td text-xs hidden sm:table-cell tabular-nums">{formatDate(b.checkIn)}</td>
                        <td className="table-td text-xs hidden sm:table-cell tabular-nums">{formatDate(b.checkOut)}</td>
                        <td className="table-td hidden md:table-cell">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border whitespace-nowrap"
                            style={{ backgroundColor: "var(--surface-3)", color: "var(--fg-muted)", borderColor: "var(--border)" }}>
                            {b.source}
                          </span>
                        </td>
                        <td className="table-td text-right">
                          <div className="font-bold text-ink-900 tabular-nums">{formatVND(b.total)}</div>
                          {debt > 0 && (
                            <div className="text-[10px] font-semibold tabular-nums" style={{ color: "var(--danger-fg)" }}>
                              Còn nợ {formatVND(debt)}
                            </div>
                          )}
                        </td>
                        <td className="table-td">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap"
                            style={{ backgroundColor: t.soft, color: t.fg, border: `1px solid ${t.border}` }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.solid }} />
                            {STATUS[b.status]?.label || b.status}
                          </span>
                        </td>
                        <td className="table-td">
                          <div className="flex items-center justify-end gap-1">
                            <IconBtn title="Xem chi tiết" onClick={() => setDetail(b)}><Eye className="w-4 h-4" /></IconBtn>
                            <div className="relative" ref={menuId === b.id ? menuRef : null}>
                              <IconBtn title="Thao tác khác" onClick={() => setMenuId(menuId === b.id ? null : b.id)}>
                                <MoreHorizontal className="w-4 h-4" />
                              </IconBtn>
                              {menuId === b.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-pop z-30 overflow-hidden py-1"
                                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                                  {b.status === "pending" && (
                                    <MenuItem icon={CheckCircle2} label="Xác nhận" onClick={() => { setStatus([b.id], "confirmed"); setMenuId(null); }} />
                                  )}
                                  {b.status === "confirmed" && (
                                    <MenuItem icon={LogIn} label="Nhận phòng" onClick={() => { setStatus([b.id], "checked_in"); setMenuId(null); }} />
                                  )}
                                  {b.status === "checked_in" && (
                                    <MenuItem icon={LogOut} label="Trả phòng" onClick={() => { setStatus([b.id], "checked_out"); setMenuId(null); }} />
                                  )}
                                  {debt > 0 && (
                                    <MenuItem icon={Wallet} label={`Thu ${formatVND(debt)}`} onClick={() => { collect(b); setMenuId(null); }} />
                                  )}
                                  <MenuItem icon={Edit2} label="Chỉnh sửa" onClick={() => { setEditing(b); setFormOpen(true); setMenuId(null); }} />
                                  {b.status !== "cancelled" && (
                                    <MenuItem icon={XCircle} label="Huỷ booking" onClick={() => { setStatus([b.id], "cancelled"); setMenuId(null); }} />
                                  )}
                                  <div className="my-1 h-px" style={{ backgroundColor: "var(--border-soft)" }} />
                                  <MenuItem icon={Trash2} label="Xoá" danger onClick={() => { setConfirm(b); setMenuId(null); }} />
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-3 sm:px-5">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filtered.length}
                itemsPerPage={pageSize}
              />
            </div>
          </>
        )}
      </Card>

      {/* ── Chi tiết ── */}
      <BookingDetail
        booking={detail}
        onClose={() => setDetail(null)}
        onStatus={(s) => setStatus([detail.id], s)}
        onCollect={() => collect(detail)}
        onEdit={() => { setEditing(detail); setDetail(null); setFormOpen(true); }}
      />

      {/* ── Form ── */}
      <BookingForm
        open={formOpen}
        initial={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={saveBooking}
      />

      {/* ── Xuất dữ liệu ── */}
      <Modal open={exportOpen} onClose={() => setExportOpen(false)} icon={Download}
        title="Xuất dữ liệu đặt chỗ" subtitle={`${filtered.length} booking đang hiển thị theo bộ lọc`} width="max-w-md">
        <div className="space-y-2">
          {[
            { fmt: "Excel (.xlsx)", desc: "Đầy đủ cột, có định dạng" },
            { fmt: "CSV", desc: "Dữ liệu thô để phân tích" },
            { fmt: "PDF", desc: "Bản in cho lễ tân" },
          ].map((f) => (
            <button key={f.fmt}
              onClick={() => { setExportOpen(false); notify(`Đang chuẩn bị ${f.fmt} · ${filtered.length} dòng`); }}
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

      {/* ── Xác nhận xoá ── */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} icon={AlertCircle}
        title="Xoá booking?" subtitle={confirm ? `${confirm.id} · ${confirm.guestName}` : ""} width="max-w-md"
        footer={
          <>
            <button onClick={() => setConfirm(null)} className="btn-outline">Huỷ</button>
            <button onClick={() => removeBooking(confirm)} className="px-3 py-2 rounded-md text-[12.5px] font-bold"
              style={{ backgroundColor: "var(--danger)", color: "var(--on-accent)" }}>
              Xoá vĩnh viễn
            </button>
          </>
        }>
        <p className="text-[12.5px] text-ink-700 leading-relaxed">
          Booking trị giá <strong className="text-ink-900">{confirm ? formatVND(confirm.total) : ""}</strong> sẽ bị gỡ khỏi danh sách.
          Nếu chỉ muốn dừng đặt chỗ, hãy dùng “Huỷ booking” để giữ lại lịch sử.
        </p>
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

/* ═══════════ UI nhỏ ═══════════ */

function Group({ label, children }) {
  return (
    <div className="min-w-0">
      <div className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500 mb-1.5 min-h-[15px]">{label}</div>
      {children}
    </div>
  );
}

function Chip({ on, onClick, children }) {
  return (
    <button onClick={onClick} aria-pressed={on}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition active:scale-95"
      style={on
        ? { backgroundColor: "var(--accent)", color: "var(--on-accent)", borderColor: "var(--accent)" }
        : { backgroundColor: "var(--surface)", color: "var(--fg-muted)", borderColor: "var(--border)" }}>
      {children}
    </button>
  );
}

function ActiveChip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)", borderColor: "var(--accent)" }}>
      {children}
      <button onClick={onRemove} aria-label="Bỏ điều kiện" className="w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-black/10">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function IconBtn({ title, onClick, children }) {
  return (
    <button onClick={onClick} title={title} aria-label={title}
      className="w-8 h-8 rounded-md inline-flex items-center justify-center text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition active:scale-90">
      {children}
    </button>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium hover:bg-ink-50 transition text-left"
      style={{ color: danger ? "var(--danger-fg)" : "var(--fg)" }}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
    </button>
  );
}

function Info({ label, value, className = "", mono }) {
  return (
    <div className={className}>
      <div className="text-ink-500 text-[11px]">{label}</div>
      <div className={`font-semibold text-ink-900 break-words ${mono ? "font-mono text-[11.5px]" : ""}`}>{value}</div>
    </div>
  );
}

/* ═══════════ CHI TIẾT BOOKING ═══════════ */

function BookingDetail({ booking: b, onClose, onStatus, onCollect, onEdit }) {
  if (!b) return null;
  const t = toneVars(STATUS[b.status]?.tone || "neutral");
  const debt = Math.max(0, b.total - b.paid);
  const paidPct = b.total > 0 ? Math.round((b.paid / b.total) * 100) : 0;

  const next = {
    pending:    { key: "confirmed",   label: "Xác nhận booking", icon: CheckCircle2 },
    confirmed:  { key: "checked_in",  label: "Nhận phòng",       icon: LogIn },
    checked_in: { key: "checked_out", label: "Trả phòng",        icon: LogOut },
  }[b.status];

  return (
    <Modal open={!!b} onClose={onClose} icon={CalendarCheck}
      title={`Booking ${b.id}`} subtitle={`${b.guestName} · ${b.branchName}`} width="max-w-lg"
      footer={
        <>
          <button onClick={onEdit} className="mr-auto btn-outline"><Edit2 className="w-4 h-4" /> Chỉnh sửa</button>
          {b.status !== "cancelled" && (
            <button onClick={() => onStatus("cancelled")} className="btn-outline" style={{ color: "var(--danger-fg)" }}>
              <XCircle className="w-4 h-4" /> Huỷ
            </button>
          )}
          {next && (
            <button onClick={() => onStatus(next.key)} className="btn-primary">
              <next.icon className="w-4 h-4" /> {next.label}
            </button>
          )}
        </>
      }>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-md border" style={{ backgroundColor: t.soft, borderColor: t.border }}>
          <img src={b.guestAvatar} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 ring-2" style={{ borderColor: t.solid }} />
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-bold text-ink-900 truncate">{b.guestName}</div>
            <div className="text-[11.5px]" style={{ color: t.fg }}>{STATUS[b.status]?.label}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-ink-500">Tổng</div>
            <div className="text-[15px] font-bold text-ink-900 tabular-nums">{formatVND(b.total)}</div>
          </div>
        </div>

        {/* Thanh toán */}
        <div className="rounded-md border p-3" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500">Thanh toán</span>
            <span className="text-[12px] font-bold tabular-nums" style={{ color: debt > 0 ? "var(--warning-fg)" : "var(--success-fg)" }}>
              {paidPct}%
            </span>
          </div>
          <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${paidPct}%`, backgroundColor: debt > 0 ? "var(--warning)" : "var(--success)" }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11.5px]">
            <span className="text-ink-500">Đã thu <strong className="text-ink-900 tabular-nums">{formatVNDFull(b.paid)}</strong></span>
            {debt > 0 ? (
              <button onClick={onCollect} className="font-bold hover:underline" style={{ color: "var(--accent)" }}>
                Thu nốt {formatVND(debt)}
              </button>
            ) : (
              <span className="font-semibold inline-flex items-center gap-1" style={{ color: "var(--success-fg)" }}>
                <Check className="w-3 h-3" /> Đã thu đủ
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <Info label="Nhận phòng" value={formatDate(b.checkIn)} />
          <Info label="Trả phòng" value={formatDate(b.checkOut)} />
          <Info label="Số đêm" value={`${b.nights} đêm`} />
          <Info label="Số khách" value={`${b.guests} khách`} />
          <Info label="Hạng phòng" value={b.roomTypeName} />
          <Info label="Nguồn đặt" value={b.source} />
          <Info label="Chi nhánh" value={b.branchName} className="col-span-2" />
          <Info label="Ngày tạo" value={formatDate(b.createdAt)} />
          <Info label="Mã khách" value={b.guestId} mono />
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════ FORM TẠO / SỬA ═══════════ */

const BLANK = {
  guestName: "", guestId: "", guestAvatar: "https://i.pravatar.cc/100?img=12",
  branchId: "", branchName: "", roomType: "STD", roomTypeName: "Standard",
  checkIn: TODAY, checkOut: "", guests: 2, nights: 1,
  status: "pending", source: "Walk-in", total: "", paid: 0,
};

const SOURCES = ["Walk-in", "Booking.com", "Agoda", "Traveloka", "Website", "Đại lý", "Số điện thoại", "Email"];

function BookingForm({ open, initial, onClose, onSubmit }) {
  const [v, setV] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({}); setTouched(false);
    setV(initial
      ? { ...BLANK, ...initial, total: String(initial.total ?? ""), paid: String(initial.paid ?? 0) }
      : { ...BLANK, branchId: branches[0]?.id || "", branchName: branches[0]?.name || "", checkOut: addDays(TODAY, 1) });
  }, [open, initial]);

  const set = (k, val) => setV((s) => ({ ...s, [k]: val }));

  /* Số đêm và tổng tiền tự tính lại khi đổi ngày hoặc hạng phòng */
  const nights = useMemo(() => {
    if (!v.checkIn || !v.checkOut) return 0;
    const d = Math.round((new Date(v.checkOut) - new Date(v.checkIn)) / 86400000);
    return d > 0 ? d : 0;
  }, [v.checkIn, v.checkOut]);

  const suggested = useMemo(() => {
    const base = roomTypeList.find((t) => t.key === v.roomType)?.basePrice || 0;
    return base * nights;
  }, [v.roomType, nights]);

  const validate = (s) => {
    const e = {};
    if (!s.guestName.trim()) e.guestName = "Bắt buộc nhập tên khách";
    else if (s.guestName.trim().length < 2) e.guestName = "Tên khách quá ngắn";
    if (!s.branchId) e.branchId = "Chọn chi nhánh";
    if (!s.checkIn) e.checkIn = "Chọn ngày nhận phòng";
    if (!s.checkOut) e.checkOut = "Chọn ngày trả phòng";
    else if (s.checkOut <= s.checkIn) e.checkOut = "Ngày trả phải sau ngày nhận";
    const g = Number(s.guests);
    if (!Number.isInteger(g) || g < 1 || g > 20) e.guests = "Số khách từ 1 đến 20";
    const total = Number(s.total);
    if (s.total === "") e.total = "Bắt buộc nhập tổng tiền";
    else if (!(total > 0)) e.total = "Tổng tiền phải lớn hơn 0";
    const paid = Number(s.paid || 0);
    if (paid < 0) e.paid = "Số tiền đã thu không thể âm";
    else if (s.total !== "" && paid > total) e.paid = "Đã thu không được vượt tổng tiền";
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(v);
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`b-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    const br = branches.find((x) => x.id === v.branchId);
    const rt = roomTypeList.find((x) => x.key === v.roomType);
    onSubmit({
      ...v,
      guestName: v.guestName.trim(),
      guestId: v.guestId || `GU-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
      branchName: br?.name || "",
      roomTypeName: rt?.name || "",
      nights,
      guests: Number(v.guests),
      total: Number(v.total),
      paid: Number(v.paid || 0),
    });
  };

  const err = (k) => (touched ? errors[k] : undefined);

  return (
    <Modal open={open} onClose={onClose} icon={initial ? Edit2 : Plus}
      title={initial ? "Chỉnh sửa booking" : "Tạo booking mới"}
      subtitle={initial ? `${initial.id} · ${initial.guestName}` : "Các trường có dấu * là bắt buộc"}
      width="max-w-2xl"
      footer={
        <>
          {touched && Object.keys(errors).length > 0 && (
            <span className="mr-auto text-[12px] font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--danger-fg)" }}>
              <AlertCircle className="w-3.5 h-3.5" /> Còn {Object.keys(errors).length} trường chưa hợp lệ
            </span>
          )}
          <button type="button" onClick={onClose} className="btn-outline">Huỷ</button>
          <button type="submit" form="booking-form" className="btn-primary">
            <Check className="w-4 h-4" /> {initial ? "Lưu thay đổi" : "Tạo booking"}
          </button>
        </>
      }>
      <form id="booking-form" onSubmit={submit} noValidate className="space-y-5">
        <Section title="Khách hàng" icon={Users}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field className="sm:col-span-2" label="Tên khách" required error={err("guestName")} id="b-guestName">
              <input id="b-guestName" className="input" value={v.guestName} list="guest-suggest"
                onChange={(e) => set("guestName", e.target.value)} placeholder="Nguyễn Văn A" />
              <datalist id="guest-suggest">
                {guests.slice(0, 40).map((g) => <option key={g.id} value={g.name} />)}
              </datalist>
            </Field>
            <Field label="Số khách" required error={err("guests")} id="b-guests">
              <input id="b-guests" type="number" min="1" max="20" className="input" value={v.guests}
                onChange={(e) => set("guests", e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section title="Lưu trú" icon={Building2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Chi nhánh" required error={err("branchId")} id="b-branchId">
              <select id="b-branchId" className="input" value={v.branchId} onChange={(e) => set("branchId", e.target.value)}>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Hạng phòng" required id="b-roomType" hint="Đổi hạng sẽ gợi ý lại giá">
              <select id="b-roomType" className="input" value={v.roomType} onChange={(e) => set("roomType", e.target.value)}>
                {roomTypeList.map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Nhận phòng" required error={err("checkIn")} id="b-checkIn">
              <input id="b-checkIn" type="date" className="input" value={v.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
            </Field>
            <Field label="Trả phòng" required error={err("checkOut")} id="b-checkOut"
              hint={nights > 0 ? `${nights} đêm` : undefined}>
              <input id="b-checkOut" type="date" className="input" value={v.checkOut} onChange={(e) => set("checkOut", e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section title="Thanh toán & nguồn" icon={Wallet}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Tổng tiền (VNĐ)" required error={err("total")} id="b-total"
              hint={suggested > 0 ? `Gợi ý theo hạng phòng × ${nights} đêm: ${formatVNDFull(suggested)}` : undefined}>
              <div className="flex gap-2">
                <input id="b-total" type="number" min="0" step="100000" className="input" value={v.total}
                  onChange={(e) => set("total", e.target.value)} placeholder="2500000" />
                {suggested > 0 && (
                  <button type="button" onClick={() => set("total", String(suggested))} className="btn-outline shrink-0 whitespace-nowrap">
                    Dùng gợi ý
                  </button>
                )}
              </div>
            </Field>
            <Field label="Đã thu (VNĐ)" error={err("paid")} id="b-paid" hint="Để 0 nếu chưa thu">
              <input id="b-paid" type="number" min="0" step="100000" className="input" value={v.paid}
                onChange={(e) => set("paid", e.target.value)} />
            </Field>
            <Field label="Nguồn đặt" required id="b-source">
              <select id="b-source" className="input" value={v.source} onChange={(e) => set("source", e.target.value)}>
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Trạng thái" required id="b-status">
              <select id="b-status" className="input" value={v.status} onChange={(e) => set("status", e.target.value)}>
                {bookingStatusList.map((s) => <option key={s.key} value={s.key}>{STATUS[s.key]?.label || s.label}</option>)}
              </select>
            </Field>
          </div>
        </Section>
      </form>
    </Modal>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-[11px] uppercase font-bold tracking-wider mb-2 inline-flex items-center gap-1.5"
        style={{ color: "var(--accent)" }}>
        {Icon && <Icon className="w-3.5 h-3.5" />} {title}
      </legend>
      {children}
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
