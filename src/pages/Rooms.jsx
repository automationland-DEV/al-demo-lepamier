import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageHero, { SectionHeader, Card, Badge, Modal } from "../components/DashboardPrimitives";
import { Icons } from "../components/Icons";
import { rooms as seedRooms, branches, roomStatusList, roomTypeList } from "../data/mockData";
import { formatVND, formatVNDFull } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";

const {
  BedDouble, Search, Filter, Plus, Users, MapPin, X, Check, Trash2, Edit2,
  ChevronRight, ChevronDown, Wrench, Sparkles, Wallet, Building2, LogIn, LogOut,
  ArrowUpDown, RotateCcw, SearchX, AlertCircle, Eye, Layers, CheckCircle2,
} = Icons;

/* Trạng thái phòng → tone semantic (đổi theo theme + accent) */
const STATUS = {
  available:   { label: "Trống",    tone: "info",      icon: BedDouble },
  occupied:    { label: "Đang ở",   tone: "accent",    icon: Users },
  reserved:    { label: "Đã đặt",   tone: "highlight", icon: ChevronRight },
  cleaning:    { label: "Đang dọn", tone: "warning",   icon: Sparkles },
  maintenance: { label: "Bảo trì",  tone: "danger",    icon: Wrench },
};

const toneVars = (tone) => ({
  solid:  tone === "accent" ? "var(--accent)" : `var(--${tone})`,
  soft:   `var(--${tone}-soft)`,
  fg:     `var(--${tone}-fg)`,
  border: tone === "accent" ? "var(--accent)" : `var(--${tone}-border)`,
});

const SORTS = [
  { key: "number-asc",  label: "Số phòng tăng dần" },
  { key: "number-desc", label: "Số phòng giảm dần" },
  { key: "price-desc",  label: "Giá cao nhất" },
  { key: "price-asc",   label: "Giá thấp nhất" },
  { key: "type-asc",    label: "Theo hạng phòng" },
  { key: "status-asc",  label: "Theo trạng thái" },
];

const EMPTY_FILTERS = {
  status: "all", types: [], floors: [], minPrice: "", maxPrice: "", onlyGuest: false,
};

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

export default function Rooms() {
  const { activeBranchId } = useActiveBranch();

  const [roomList, setRoomList] = useState(seedRooms);
  const [branchId, setBranchId] = useState(() =>
    activeBranchId !== "ALL" && branches.some((b) => b.id === activeBranchId)
      ? activeBranchId
      : (branches[0]?.id || "ALL")
  );
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState("number-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const [view, setView] = useState("floor");
  const [hideUnmatched, setHideUnmatched] = useState(true);
  const [detail, setDetail] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [picked, setPicked] = useState([]);
  const [toast, setToast] = useState(null);

  const sortRef = useRef(null);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    if (activeBranchId !== "ALL" && branches.some((b) => b.id === activeBranchId)) {
      setBranchId(activeBranchId);
    }
  }, [activeBranchId]);

  useEffect(() => {
    const onDown = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* Đổi chi nhánh thì bỏ chọn hàng loạt để tránh thao tác nhầm lên phòng không còn hiển thị */
  useEffect(() => { setPicked([]); }, [branchId]);

  const isAllBranches = branchId === "ALL";
  /* Guard: chi nhánh đang chọn có thể không tồn tại trong mock (vd vừa tạo ở trang Khu du lịch) */
  const branch = branches.find((b) => b.id === branchId) || null;

  const scoped = useMemo(
    () => (isAllBranches ? roomList : roomList.filter((r) => r.branchId === branchId)),
    [roomList, branchId, isAllBranches]
  );

  const floorOptions = useMemo(
    () => [...new Set(scoped.map((r) => r.floor))].sort((a, b) => a - b),
    [scoped]
  );

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    const out = scoped.filter((r) => {
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.types.length && !filters.types.includes(r.type)) return false;
      if (filters.floors.length && !filters.floors.includes(r.floor)) return false;
      if (filters.minPrice !== "" && r.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice !== "" && r.price > Number(filters.maxPrice)) return false;
      if (filters.onlyGuest && !r.guest) return false;
      if (q && !deaccent(`${r.number} ${r.typeName} ${r.guest || ""} ${r.branchName}`).includes(q)) return false;
      return true;
    });
    const cmp = {
      "number-asc":  (a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }),
      "number-desc": (a, b) => b.number.localeCompare(a.number, undefined, { numeric: true }),
      "price-desc":  (a, b) => b.price - a.price,
      "price-asc":   (a, b) => a.price - b.price,
      "type-asc":    (a, b) => a.typeName.localeCompare(b.typeName, "vi"),
      "status-asc":  (a, b) => a.status.localeCompare(b.status),
    }[sort];
    return [...out].sort(cmp);
  }, [scoped, filters, search, sort]);

  const filteredIds = useMemo(() => new Set(filtered.map((r) => r.id)), [filtered]);

  const statusCounts = useMemo(
    () => scoped.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {}),
    [scoped]
  );

  /* Nhóm theo tầng (hoặc chi nhánh → tầng khi xem tất cả) */
  const groups = useMemo(() => {
    const src = hideUnmatched ? filtered : scoped;
    const map = {};
    for (const r of src) {
      const key = isAllBranches ? `${r.branchName} · Tầng ${r.floor}` : `Tầng ${r.floor}`;
      (map[key] ||= []).push(r);
    }
    return Object.entries(map).sort((a, b) =>
      a[0].localeCompare(b[0], "vi", { numeric: true })
    );
  }, [filtered, scoped, hideUnmatched, isAllBranches]);

  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) + filters.types.length + filters.floors.length +
    (filters.minPrice !== "" ? 1 : 0) + (filters.maxPrice !== "" ? 1 : 0) + (filters.onlyGuest ? 1 : 0);
  const hasQuery = activeFilterCount > 0 || search.trim() !== "";

  const occupiedCount = statusCounts.occupied || 0;
  const totalScoped = scoped.length;
  const occupancyPct = totalScoped ? Math.round((occupiedCount / totalScoped) * 100) : 0;

  const toggleIn = (key, value) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));

  const resetFilters = () => { setFilters(EMPTY_FILTERS); setSearch(""); };

  /* ── thao tác ── */
  const setRoomStatus = (ids, status) => {
    const meta = STATUS[status];
    setRoomList((list) => list.map((r) =>
      ids.includes(r.id)
        ? { ...r, status, statusLabel: meta.label, guest: status === "occupied" ? (r.guest || "Khách mới") : null }
        : r
    ));
    setDetail((d) => (d && ids.includes(d.id) ? { ...d, status, statusLabel: meta.label } : d));
    notify(ids.length > 1 ? `Đã chuyển ${ids.length} phòng sang “${meta.label}”` : `Phòng ${roomList.find((r) => r.id === ids[0])?.number} → ${meta.label}`);
  };

  const saveRoom = (payload) => {
    if (editing) {
      setRoomList((list) => list.map((r) => (r.id === editing.id ? { ...r, ...payload } : r)));
      notify(`Đã cập nhật phòng ${payload.number}`);
    } else {
      const b = branches.find((x) => x.id === payload.branchId);
      setRoomList((list) => [{
        ...payload,
        id: `RM-${b?.code || "NEW"}-${Date.now().toString().slice(-5)}`,
        branchCode: b?.code || "",
        branchName: b?.name || "",
        statusLabel: STATUS[payload.status].label,
      }, ...list]);
      notify(`Đã thêm phòng ${payload.number}`);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const deleteRoom = (r) => {
    setRoomList((list) => list.filter((x) => x.id !== r.id));
    setPicked((p) => p.filter((id) => id !== r.id));
    setDetail(null);
    notify(`Đã xoá phòng ${r.number}`);
  };

  const togglePick = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const pickAllVisible = () => {
    const ids = filtered.map((r) => r.id);
    setPicked((p) => (ids.every((id) => p.includes(id)) ? [] : ids));
  };

  return (
    <div className="max-w-[1240px] mx-auto pb-16 px-1">
      <PageHero
        eyebrow="Vận hành · Quản lý phòng"
        title="Phòng & Căn"
        subtitle={
          branch
            ? `Theo dõi trạng thái phòng tại ${branch.name}`
            : "Theo dõi trạng thái phòng trên toàn hệ thống"
        }
        live
        meta={[
          { label: "Phạm vi", value: isAllBranches ? "Tất cả" : (branch?.code ?? "—") },
          { label: "Phòng", value: totalScoped },
          { label: "Đang ở", value: occupiedCount },
          { label: "Lấp đầy", value: `${occupancyPct}%` },
        ]}
        actions={
          <>
            <button
              onClick={() => setShowFilter((v) => !v)}
              aria-expanded={showFilter}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-[12px] font-semibold transition active:scale-95"
            >
              <Filter className="w-4 h-4" /> Bộ lọc
              {activeFilterCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[10px] font-bold inline-flex items-center justify-center tabular-nums"
                  style={{ color: "var(--accent-strong)" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setEditing(null); setFormOpen(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white text-[12px] font-bold transition shadow-sm active:scale-95"
              style={{ color: "var(--accent-strong)" }}
            >
              <Plus className="w-4 h-4" /> Thêm phòng
            </button>
          </>
        }
      />

      {/* ── Chi nhánh + đếm trạng thái ── */}
      <SectionHeader icon={Building2} label="Chi nhánh & trạng thái" sub="Chọn phạm vi và lọc nhanh theo trạng thái" />
      <Card>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              aria-label="Chọn chi nhánh"
              className="input appearance-none pr-9 font-semibold cursor-pointer"
            >
              <option value="ALL">Tất cả chi nhánh · {roomList.length} phòng</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} · {roomList.filter((r) => r.branchId === b.id).length} phòng
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusFilterChip
              on={filters.status === "all"}
              onClick={() => setFilters((f) => ({ ...f, status: "all" }))}
              label="Tất cả"
              count={totalScoped}
            />
            {roomStatusList.map((s) => (
              <StatusFilterChip
                key={s.key}
                tone={STATUS[s.key]?.tone}
                on={filters.status === s.key}
                onClick={() => setFilters((f) => ({ ...f, status: f.status === s.key ? "all" : s.key }))}
                label={STATUS[s.key]?.label || s.label}
                count={statusCounts[s.key] || 0}
              />
            ))}
          </div>
        </div>

        {branch && (
          <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-3 flex-wrap text-[12px] text-ink-500">
            <span className="w-9 h-9 rounded-md flex items-center justify-center font-display font-bold text-[13px] shrink-0"
              style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}>
              {branch.code}
            </span>
            <span className="flex items-center gap-1 min-w-0"><MapPin className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{branch.address}</span></span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> QL: {branch.manager}</span>
            <Badge tone="emerald" className="ml-auto">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--success)" }} /> LIVE
            </Badge>
          </div>
        )}
      </Card>

      {/* ── Tìm kiếm + điều khiển ── */}
      <Card className="mt-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm kiếm phòng"
              className="input pl-9 pr-9 text-[16px] sm:text-[13px]"
              placeholder="Số phòng, hạng phòng, tên khách…"
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

          <div className="flex gap-0.5 p-0.5 border border-ink-200 rounded-md" role="group" aria-label="Kiểu hiển thị">
            {[{ k: "floor", l: "Sơ đồ" }, { k: "list", l: "Danh sách" }].map((v) => (
              <button key={v.k} onClick={() => setView(v.k)} aria-pressed={view === v.k}
                className="px-3 py-1.5 rounded text-[12px] font-medium transition"
                style={view === v.k ? { backgroundColor: "var(--accent)", color: "var(--on-accent)" } : { color: "var(--fg-muted)" }}>
                {v.l}
              </button>
            ))}
          </div>
        </div>

        {showFilter && (
          <div className="mt-4 pt-4 border-t border-ink-100 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Group label={`Hạng phòng${filters.types.length ? ` · ${filters.types.length}` : ""}`}>
                <div className="flex flex-wrap gap-1.5">
                  {roomTypeList.map((t) => (
                    <Chip key={t.key} on={filters.types.includes(t.key)} onClick={() => toggleIn("types", t.key)}>
                      {t.name}
                    </Chip>
                  ))}
                </div>
              </Group>

              <Group label={`Tầng${filters.floors.length ? ` · ${filters.floors.length}` : ""}`}>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {floorOptions.map((f) => (
                    <Chip key={f} on={filters.floors.includes(f)} onClick={() => toggleIn("floors", f)}>
                      Tầng {f}
                    </Chip>
                  ))}
                </div>
              </Group>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Group label="Khoảng giá (VNĐ/đêm)">
                <div className="flex items-center gap-2">
                  <input type="number" min="0" step="100000" placeholder="Từ" value={filters.minPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} className="input text-[13px]" />
                  <span className="text-ink-400 text-[12px]">—</span>
                  <input type="number" min="0" step="100000" placeholder="Đến" value={filters.maxPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} className="input text-[13px]" />
                </div>
              </Group>

              <Group label="Có khách">
                <Chip on={filters.onlyGuest} onClick={() => setFilters((f) => ({ ...f, onlyGuest: !f.onlyGuest }))}>
                  <Users className="w-3 h-3" /> Chỉ phòng có khách
                </Chip>
              </Group>

              <Group label="Phòng không khớp">
                <Chip on={hideUnmatched} onClick={() => setHideUnmatched((v) => !v)}>
                  {hideUnmatched ? <><Eye className="w-3 h-3" /> Đang ẩn</> : <><Layers className="w-3 h-3" /> Đang làm mờ</>}
                </Chip>
              </Group>

              <Group label="">
                <button onClick={resetFilters} disabled={!hasQuery}
                  className="btn-outline w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                  <RotateCcw className="w-4 h-4" /> Đặt lại tất cả
                </button>
              </Group>
            </div>
          </div>
        )}
      </Card>

      {/* ── Chip điều kiện ── */}
      {hasQuery && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-ink-500">
            <strong className="text-ink-900 tabular-nums">{filtered.length}</strong>/{totalScoped} phòng
          </span>
          {search.trim() && <ActiveChip onRemove={() => setSearch("")}>“{search.trim()}”</ActiveChip>}
          {filters.status !== "all" && (
            <ActiveChip onRemove={() => setFilters((f) => ({ ...f, status: "all" }))}>{STATUS[filters.status].label}</ActiveChip>
          )}
          {filters.types.map((t) => (
            <ActiveChip key={t} onRemove={() => toggleIn("types", t)}>{roomTypeList.find((x) => x.key === t)?.name}</ActiveChip>
          ))}
          {filters.floors.map((f) => <ActiveChip key={f} onRemove={() => toggleIn("floors", f)}>Tầng {f}</ActiveChip>)}
          {filters.minPrice !== "" && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, minPrice: "" }))}>≥ {formatVND(Number(filters.minPrice))}</ActiveChip>}
          {filters.maxPrice !== "" && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, maxPrice: "" }))}>≤ {formatVND(Number(filters.maxPrice))}</ActiveChip>}
          {filters.onlyGuest && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, onlyGuest: false }))}>Có khách</ActiveChip>}
          <button onClick={resetFilters} className="text-[12px] font-semibold hover:underline" style={{ color: "var(--accent)" }}>
            Xoá hết
          </button>
        </div>
      )}

      {/* ── Thanh thao tác hàng loạt ── */}
      {picked.length > 0 && (
        <div className="mt-4 rounded-md border px-3 py-2.5 flex items-center gap-2 flex-wrap animate-fadeIn"
          style={{ backgroundColor: "var(--accent-soft)", borderColor: "var(--accent)" }}>
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--accent-fg)" }} />
          <span className="text-[12.5px] font-bold" style={{ color: "var(--accent-fg)" }}>
            Đã chọn {picked.length} phòng
          </span>
          <span className="text-[12px] hidden sm:inline" style={{ color: "var(--accent-fg)", opacity: .8 }}>· chuyển sang:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {roomStatusList.map((s) => (
              <button key={s.key}
                onClick={() => { setRoomStatus(picked, s.key); setPicked([]); }}
                className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition active:scale-95"
                style={{
                  backgroundColor: "var(--surface)",
                  color: toneVars(STATUS[s.key].tone).fg,
                  borderColor: toneVars(STATUS[s.key].tone).border,
                }}>
                {STATUS[s.key].label}
              </button>
            ))}
          </div>
          <button onClick={() => setPicked([])} className="ml-auto text-[12px] font-semibold hover:underline" style={{ color: "var(--accent-fg)" }}>
            Bỏ chọn
          </button>
        </div>
      )}

      {/* ── Danh sách ── */}
      <SectionHeader
        icon={BedDouble}
        label={view === "floor" ? "Sơ đồ phòng theo tầng" : "Danh sách phòng"}
        sub={`${filtered.length} phòng · ${groups.length} nhóm`}
        right={
          filtered.length > 0 && (
            <button onClick={pickAllVisible} className="text-[11.5px] font-semibold hover:underline" style={{ color: "var(--accent)" }}>
              {filtered.every((r) => picked.includes(r.id)) ? "Bỏ chọn tất cả" : "Chọn tất cả đang hiện"}
            </button>
          )
        }
      />

      {filtered.length === 0 ? (
        <Card>
          <div className="py-14 text-center">
            <SearchX className="w-10 h-10 mx-auto text-ink-300 mb-3" />
            <div className="text-[14px] font-semibold text-ink-900">Không có phòng nào khớp</div>
            <div className="text-[12px] text-ink-500 mt-1">Thử bỏ bớt điều kiện lọc hoặc đổi chi nhánh.</div>
            <button onClick={resetFilters} className="btn-primary mt-4 mx-auto">
              <RotateCcw className="w-4 h-4" /> Đặt lại bộ lọc
            </button>
          </div>
        </Card>
      ) : view === "list" ? (
        <Card className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr>
                  <th className="table-th w-10"></th>
                  <th className="table-th">Phòng</th>
                  <th className="table-th">Hạng</th>
                  {isAllBranches && <th className="table-th hidden md:table-cell">Chi nhánh</th>}
                  <th className="table-th hidden sm:table-cell">Tầng</th>
                  <th className="table-th">Giá / đêm</th>
                  <th className="table-th hidden md:table-cell">Khách</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const t = toneVars(STATUS[r.status]?.tone || "info");
                  return (
                    <tr key={r.id} className="hover:bg-ink-50 transition">
                      <td className="table-td">
                        <input type="checkbox" checked={picked.includes(r.id)} onChange={() => togglePick(r.id)}
                          aria-label={`Chọn phòng ${r.number}`} className="w-4 h-4" style={{ accentColor: "var(--accent)" }} />
                      </td>
                      <td className="table-td">
                        <button onClick={() => setDetail(r)} className="font-bold tabular-nums hover:underline">{r.number}</button>
                      </td>
                      <td className="table-td">{r.typeName}</td>
                      {isAllBranches && <td className="table-td hidden md:table-cell text-[11.5px]">{r.branchName}</td>}
                      <td className="table-td hidden sm:table-cell tabular-nums">{r.floor}</td>
                      <td className="table-td tabular-nums font-semibold">{formatVND(r.price)}</td>
                      <td className="table-td hidden md:table-cell text-[11.5px]">{r.guest || "—"}</td>
                      <td className="table-td">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap"
                          style={{ backgroundColor: t.soft, color: t.fg, border: `1px solid ${t.border}` }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.solid }} />
                          {STATUS[r.status]?.label}
                        </span>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center justify-end gap-1">
                          <IconBtn title="Xem chi tiết" onClick={() => setDetail(r)}><Eye className="w-4 h-4" /></IconBtn>
                          <IconBtn title="Chỉnh sửa" onClick={() => { setEditing(r); setFormOpen(true); }}><Edit2 className="w-4 h-4" /></IconBtn>
                          <IconBtn title="Xoá" onClick={() => deleteRoom(r)}><Trash2 className="w-4 h-4" /></IconBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map(([label, list]) => {
            const matchCount = list.filter((r) => filteredIds.has(r.id)).length;
            return (
              <Card key={label} title={label} subtitle={`${matchCount} phòng khớp`} icon={BedDouble} accent="violet"
                right={<Badge tone="violet">{list.length} PN</Badge>}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {list.map((r) => (
                    <RoomTile
                      key={r.id}
                      room={r}
                      matched={filteredIds.has(r.id)}
                      pickedOn={picked.includes(r.id)}
                      onOpen={() => setDetail(r)}
                      onPick={() => togglePick(r.id)}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
        <BedDouble className="w-3 h-3" /> Sơ đồ phòng minh hoạ · Đồng bộ PMS mỗi 30s
      </div>

      {/* ── Chi tiết phòng ── */}
      <RoomDetail
        room={detail}
        onClose={() => setDetail(null)}
        onStatus={(s) => setRoomStatus([detail.id], s)}
        onEdit={() => { setEditing(detail); setDetail(null); setFormOpen(true); }}
        onDelete={() => deleteRoom(detail)}
      />

      {/* ── Form thêm / sửa ── */}
      <RoomForm
        open={formOpen}
        initial={editing}
        defaultBranchId={isAllBranches ? branches[0]?.id : branchId}
        existingNumbers={roomList.filter((r) => r.id !== editing?.id).map((r) => `${r.branchId}|${r.number}`)}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={saveRoom}
      />

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

function StatusFilterChip({ tone, on, onClick, label, count }) {
  const t = tone ? toneVars(tone) : null;
  return (
    <button onClick={onClick} aria-pressed={on}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11.5px] font-semibold border transition active:scale-95"
      style={on
        ? { backgroundColor: t?.solid || "var(--accent)", color: "var(--on-accent)", borderColor: t?.solid || "var(--accent)" }
        : { backgroundColor: t?.soft || "var(--surface)", color: t?.fg || "var(--fg-muted)", borderColor: t?.border || "var(--border)" }}>
      {t && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: on ? "var(--on-accent)" : t.solid }} />}
      {label}
      <span className="font-display font-bold tabular-nums">{count}</span>
    </button>
  );
}

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

function RoomTile({ room: r, matched, pickedOn, onOpen, onPick }) {
  const meta = STATUS[r.status] || STATUS.available;
  const t = toneVars(meta.tone);
  const Sicon = meta.icon;
  return (
    <div
      className={`group relative border-2 rounded-md transition-all duration-300 ${
        matched ? "hover:shadow-card hover:-translate-y-0.5" : "opacity-30 grayscale scale-95"
      }`}
      style={{
        backgroundColor: matched ? t.soft : "var(--surface-2)",
        borderColor: pickedOn ? "var(--accent)" : (matched ? t.border : "var(--border)"),
        borderStyle: matched ? "solid" : "dashed",
        boxShadow: pickedOn ? "0 0 0 2px var(--accent)" : undefined,
      }}
    >
      {/* Hàng đầu: checkbox + số phòng + chấm trạng thái.
          Checkbox nằm trong luồng (không position:absolute) để không che số phòng,
          và tách khỏi <button> để tránh lồng phần tử tương tác. */}
      <div className="flex items-center gap-1.5 px-2 sm:px-3 pt-2">
        {matched ? (
          <input
            type="checkbox" checked={pickedOn} onChange={onPick}
            aria-label={`Chọn phòng ${r.number}`}
            className="w-3.5 h-3.5 shrink-0 cursor-pointer"
            style={{ accentColor: "var(--accent)" }}
          />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <span className="font-display font-bold text-ink-900 text-[15px] leading-none tabular-nums truncate">{r.number}</span>
        <span className="w-2 h-2 rounded-full shrink-0 ml-auto" style={{ backgroundColor: t.solid }} />
      </div>

      <button
        onClick={onOpen}
        disabled={!matched}
        aria-label={`Chi tiết phòng ${r.number}`}
        className="w-full text-left px-2 sm:px-3 pb-2 sm:pb-3 pt-2 disabled:pointer-events-none"
      >
        <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold mb-1 truncate">{r.typeName}</div>
        <div className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: t.fg }}>
          <Sicon className="w-3 h-3" strokeWidth={2.4} />
          {meta.label}
        </div>
        {r.guest && <div className="text-[10.5px] text-ink-700 mt-1.5 truncate font-medium">👤 {r.guest}</div>}
        <div className="text-[10.5px] text-ink-500 mt-1 flex items-center gap-1 tabular-nums">
          <Wallet className="w-3 h-3 shrink-0" /> {formatVND(r.price)}
        </div>
        <ChevronRight className="absolute bottom-2 right-2 w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" style={{ color: t.fg }} />
      </button>
    </div>
  );
}

/* ═══════════ CHI TIẾT PHÒNG ═══════════ */

function RoomDetail({ room, onClose, onStatus, onEdit, onDelete }) {
  if (!room) return null;
  const meta = STATUS[room.status] || STATUS.available;
  const t = toneVars(meta.tone);

  return (
    <Modal
      open={!!room}
      onClose={onClose}
      icon={meta.icon}
      title={`Phòng ${room.number}`}
      subtitle={`${room.typeName} · Tầng ${room.floor} · ${room.branchName}`}
      width="max-w-lg"
      footer={
        <>
          <button onClick={onDelete} className="mr-auto btn-outline" style={{ color: "var(--danger-fg)" }}>
            <Trash2 className="w-4 h-4" /> Xoá
          </button>
          <button onClick={onEdit} className="btn-outline"><Edit2 className="w-4 h-4" /> Chỉnh sửa</button>
          <button onClick={onClose} className="btn-primary">Đóng</button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-md border"
          style={{ backgroundColor: t.soft, borderColor: t.border }}>
          <div className="w-11 h-11 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: t.solid, color: "var(--on-accent)" }}>
            <meta.icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: t.fg, opacity: .8 }}>Trạng thái</div>
            <div className="text-[15px] font-bold" style={{ color: t.fg }}>{meta.label}</div>
          </div>
          <div className="ml-auto text-right shrink-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-ink-500">Giá / đêm</div>
            <div className="text-[14px] font-bold text-ink-900 tabular-nums">{formatVNDFull(room.price)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <Info label="Mã phòng" value={room.id} mono />
          <Info label="Hạng phòng" value={`${room.typeName} (${room.type})`} />
          <Info label="Tầng" value={room.floor} />
          <Info label="Chi nhánh" value={room.branchName} />
          <Info className="col-span-2" label="Khách đang ở" value={room.guest || "Không có"} />
        </div>

        <div>
          <div className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500 mb-2">Chuyển trạng thái</div>
          <div className="flex flex-wrap gap-1.5">
            {roomStatusList.map((s) => {
              const st = toneVars(STATUS[s.key].tone);
              const on = room.status === s.key;
              return (
                <button key={s.key} onClick={() => onStatus(s.key)} disabled={on}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11.5px] font-semibold border transition active:scale-95 disabled:opacity-45 disabled:cursor-default"
                  style={{ backgroundColor: st.soft, color: st.fg, borderColor: st.border }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.solid }} />
                  {STATUS[s.key].label}
                  {on && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500 mb-2">Thao tác nhanh</div>
          <div className="grid grid-cols-2 gap-2">
            <QuickAct icon={LogIn} label="Nhận phòng" disabled={room.status === "occupied"} onClick={() => onStatus("occupied")} />
            <QuickAct icon={LogOut} label="Trả phòng" disabled={room.status !== "occupied"} onClick={() => onStatus("cleaning")} />
            <QuickAct icon={Sparkles} label="Gửi dọn phòng" disabled={room.status === "cleaning"} onClick={() => onStatus("cleaning")} />
            <QuickAct icon={Wrench} label="Báo bảo trì" disabled={room.status === "maintenance"} onClick={() => onStatus("maintenance")} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function QuickAct({ icon: Icon, label, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-2 px-3 py-2.5 rounded-md border text-[12px] font-semibold transition active:scale-95 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      style={{ borderColor: "var(--border)", color: "var(--fg)" }}>
      <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
      {label}
    </button>
  );
}

function Info({ label, value, mono, className = "" }) {
  return (
    <div className={className}>
      <div className="text-ink-500 text-[11px]">{label}</div>
      <div className={`font-semibold text-ink-900 break-all ${mono ? "font-mono text-[11.5px]" : ""}`}>{value}</div>
    </div>
  );
}

/* ═══════════ FORM THÊM / SỬA PHÒNG ═══════════ */

const BLANK_ROOM = {
  number: "", branchId: "", floor: 1, type: "STD", typeName: "Standard",
  price: "", status: "available", guest: "",
};

function RoomForm({ open, initial, defaultBranchId, existingNumbers = [], onClose, onSubmit }) {
  const [v, setV] = useState(BLANK_ROOM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({}); setTouched(false);
    setV(initial
      ? { ...BLANK_ROOM, ...initial, price: String(initial.price ?? ""), guest: initial.guest || "" }
      : { ...BLANK_ROOM, branchId: defaultBranchId || branches[0]?.id || "" });
  }, [open, initial, defaultBranchId]);

  const set = (k, val) => setV((s) => ({ ...s, [k]: val }));

  const setType = (key) => {
    const t = roomTypeList.find((x) => x.key === key);
    setV((s) => ({
      ...s,
      type: key,
      typeName: t?.name || "",
      price: s.price === "" || !initial ? String(t?.basePrice ?? "") : s.price,
    }));
  };

  const validate = (s) => {
    const e = {};
    const num = s.number.trim();
    if (!num) e.number = "Bắt buộc nhập số phòng";
    else if (!/^\d{2,5}$/.test(num)) e.number = "Số phòng gồm 2–5 chữ số, ví dụ: 1205";
    else if (existingNumbers.includes(`${s.branchId}|${num}`)) e.number = "Số phòng này đã tồn tại ở chi nhánh đã chọn";

    if (!s.branchId) e.branchId = "Chọn chi nhánh";

    const fl = Number(s.floor);
    if (!Number.isInteger(fl) || fl < 1 || fl > 60) e.floor = "Tầng từ 1 đến 60";

    const p = Number(s.price);
    if (s.price === "") e.price = "Bắt buộc nhập giá";
    else if (!(p >= 100000 && p <= 100000000)) e.price = "Giá từ 100.000 đến 100.000.000";

    if (s.status === "occupied" && !s.guest.trim()) e.guest = "Phòng “Đang ở” phải có tên khách";
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(v);
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`r-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    onSubmit({
      ...v,
      number: v.number.trim(),
      floor: Number(v.floor),
      price: Number(v.price),
      guest: v.status === "occupied" ? v.guest.trim() : null,
    });
  };

  const err = (k) => (touched ? errors[k] : undefined);

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={initial ? Edit2 : Plus}
      title={initial ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
      subtitle={initial ? `Phòng ${initial.number} · ${initial.branchName}` : "Các trường có dấu * là bắt buộc"}
      width="max-w-xl"
      footer={
        <>
          {touched && Object.keys(errors).length > 0 && (
            <span className="mr-auto text-[12px] font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--danger-fg)" }}>
              <AlertCircle className="w-3.5 h-3.5" /> Còn {Object.keys(errors).length} trường chưa hợp lệ
            </span>
          )}
          <button type="button" onClick={onClose} className="btn-outline">Huỷ</button>
          <button type="submit" form="room-form" className="btn-primary">
            <Check className="w-4 h-4" /> {initial ? "Lưu thay đổi" : "Tạo phòng"}
          </button>
        </>
      }
    >
      <form id="room-form" onSubmit={submit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Số phòng" required error={err("number")} id="r-number" hint="Chỉ chữ số, ví dụ 1205">
            <input id="r-number" className="input" inputMode="numeric" value={v.number}
              onChange={(e) => set("number", e.target.value)} placeholder="1205" />
          </FormField>
          <FormField label="Chi nhánh" required error={err("branchId")} id="r-branchId">
            <select id="r-branchId" className="input" value={v.branchId} onChange={(e) => set("branchId", e.target.value)}>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </FormField>
          <FormField label="Tầng" required error={err("floor")} id="r-floor">
            <input id="r-floor" type="number" min="1" max="60" className="input" value={v.floor}
              onChange={(e) => set("floor", e.target.value)} />
          </FormField>
          <FormField label="Hạng phòng" required id="r-type" hint="Đổi hạng sẽ gợi ý lại giá">
            <select id="r-type" className="input" value={v.type} onChange={(e) => setType(e.target.value)}>
              {roomTypeList.map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}
            </select>
          </FormField>
          <FormField label="Giá / đêm (VNĐ)" required error={err("price")} id="r-price">
            <input id="r-price" type="number" min="100000" step="50000" className="input" value={v.price}
              onChange={(e) => set("price", e.target.value)} placeholder="2500000" />
          </FormField>
          <FormField label="Trạng thái" required id="r-status">
            <select id="r-status" className="input" value={v.status} onChange={(e) => set("status", e.target.value)}>
              {roomStatusList.map((s) => <option key={s.key} value={s.key}>{STATUS[s.key].label}</option>)}
            </select>
          </FormField>
          <FormField className="sm:col-span-2" label="Tên khách" error={err("guest")} id="r-guest"
            hint={v.status === "occupied" ? "Bắt buộc khi trạng thái là Đang ở" : "Chỉ dùng khi phòng đang có khách"}>
            <input id="r-guest" className="input" value={v.guest} onChange={(e) => set("guest", e.target.value)}
              disabled={v.status !== "occupied"} placeholder={v.status === "occupied" ? "Nguyễn Văn A" : "—"} />
          </FormField>
        </div>

        {v.price !== "" && Number(v.price) > 0 && (
          <div className="rounded-md p-3 text-[12px]" style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)" }}>
            Doanh thu ước tính nếu lấp đầy 30 đêm:{" "}
            <strong className="tabular-nums">{formatVNDFull(Number(v.price) * 30)}</strong>
          </div>
        )}
      </form>
    </Modal>
  );
}

function FormField({ label, required, error, hint, id, children, className = "" }) {
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
