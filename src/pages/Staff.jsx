import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import { Icons } from "../components/Icons";
import { staff as seedStaff, branches } from "../data/mockData";
import { formatVND, formatVNDFull } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import Pagination from "../components/Pagination";
import { Modal } from "../components/DashboardPrimitives";
import { usePalette, TONE } from "../theme/palette";

const {
  Users, UserCheck, Search, Plus, MoreHorizontal, Phone, Mail, Star,
  Download, ChevronDown, LayoutGrid, List, Building2, Clock, Wallet,
  X, Sparkles, TrendingUp, Filter, ArrowUpDown, Check, Edit2, Trash2,
  AlertCircle, Eye, RotateCcw, CalendarCheck, Power,
} = Icons;

/** Bỏ dấu tiếng Việt để tìm kiếm không phụ thuộc dấu — trang này toàn tên Việt
 *  nên gõ "nguyen van an" vẫn phải ra "Nguyễn Văn An". */
const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const SORTS = [
  { key: "name-asc",    label: "Tên A → Z" },
  { key: "salary-desc", label: "Lương cao nhất" },
  { key: "salary-asc",  label: "Lương thấp nhất" },
  { key: "rating-desc", label: "Đánh giá cao nhất" },
  { key: "rating-asc",  label: "Đánh giá thấp nhất" },
  { key: "joined-desc", label: "Mới gia nhập" },
];

const SHIFTS = ["Ca sáng", "Ca chiều", "Ca đêm"];

/* Nhãn vai trò — màu lấy từ usePalette() theo thứ tự khóa này */
const ROLE_KEYS = ["manager","reception","housekeeping","fnb","security","maintenance","accountant"];
const ROLE_LABEL = {
  manager: "Quản lý", reception: "Lễ tân", housekeeping: "Buồng phòng",
  fnb: "Ẩm thực", security: "An ninh", maintenance: "Kỹ thuật", accountant: "Kế toán",
};

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "active", label: "Đang làm" },
  { key: "leave", label: "Nghỉ phép" },
];

const BRANCH_BY_ID = branches.reduce((a, b) => ((a[b.id] = b), a), {});

function parseShift(raw = "") {
  const m = String(raw).match(/^Ca\s+(\S+)\s*\((.+)\)$/);
  if (!m) return { label: raw || "—", time: "" };
  return {
    label: m[1].charAt(0).toUpperCase() + m[1].slice(1),
    time: m[2].replace(/h/g, "").replace("-", "–"),
  };
}

function initials(name = "") {
  const p = String(name).trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] || "") + (p.at(-1)?.[0] || "")).toUpperCase();
}

export default function Staff() {
  const { activeBranchId } = useActiveBranch();
  const { brand, series, seriesMap } = usePalette();
  const ROLE = useMemo(() => seriesMap(ROLE_KEYS), [seriesMap]);
  const KPI = useMemo(() => series(4), [series]);
  const [branchFilter, setBranchFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [list, setList] = useState(seedStaff);
  const [sort, setSort] = useState("name-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [shiftFilter, setShiftFilter] = useState([]);
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [detail, setDetail] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [toast, setToast] = useState(null);

  const sortRef = useRef(null);
  const menuRef = useRef(null);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    setBranchFilter(activeBranchId === "ALL" ? "all" : activeBranchId);
  }, [activeBranchId]);

  useEffect(() => setPage(1),
    [branchFilter, roleFilter, statusFilter, search, sort, pageSize, shiftFilter, minSalary, maxSalary, minRating]);

  useEffect(() => {
    const onDown = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuId(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* Phạm vi theo chi nhánh — KPI và số đếm vai trò bám phạm vi này để khớp
     với bộ lọc đang chọn, thay vì luôn đếm trên toàn hệ thống. */
  const scoped = useMemo(
    () => (branchFilter === "all" ? list : list.filter((s) => s.branchId === branchFilter)),
    [list, branchFilter]
  );

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    const out = scoped.filter((s) => {
      if (roleFilter !== "all" && s.role !== roleFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (shiftFilter.length && !shiftFilter.some((sh) => (s.shift || "").startsWith(sh))) return false;
      if (minSalary !== "" && (s.salary || 0) < Number(minSalary)) return false;
      if (maxSalary !== "" && (s.salary || 0) > Number(maxSalary)) return false;
      if (minRating > 0 && (s.rating || 0) < minRating) return false;
      if (q && !deaccent(
        `${s.name} ${s.phone || ""} ${s.email || ""} ${ROLE_LABEL[s.role] || ""} ${BRANCH_BY_ID[s.branchId]?.name || ""} ${s.shift || ""}`
      ).includes(q)) return false;
      return true;
    });
    const cmp = {
      "name-asc":    (a, b) => a.name.localeCompare(b.name, "vi"),
      "salary-desc": (a, b) => (b.salary || 0) - (a.salary || 0),
      "salary-asc":  (a, b) => (a.salary || 0) - (b.salary || 0),
      "rating-desc": (a, b) => (b.rating || 0) - (a.rating || 0),
      "rating-asc":  (a, b) => (a.rating || 0) - (b.rating || 0),
      "joined-desc": (a, b) => (b.joinedAt || "").localeCompare(a.joinedAt || ""),
    }[sort];
    return [...out].sort(cmp);
  }, [scoped, roleFilter, statusFilter, search, sort, shiftFilter, minSalary, maxSalary, minRating]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const stats = useMemo(() => {
    const active = scoped.filter((s) => s.status === "active").length;
    return {
      total: scoped.length,
      active,
      leave: scoped.filter((s) => s.status === "leave").length,
      branches: new Set(scoped.map((s) => s.branchId)).size,
      avgSalary: scoped.reduce((n, s) => n + (s.salary || 0), 0) / Math.max(scoped.length, 1),
      activePct: scoped.length ? Math.round((active / scoped.length) * 100) : 0,
      payroll: scoped.reduce((n, s) => n + (s.salary || 0), 0),
    };
  }, [scoped]);

  const roleCounts = useMemo(() => {
    const m = {};
    for (const s of scoped) m[s.role] = (m[s.role] || 0) + 1;
    return m;
  }, [scoped]);

  const advCount = shiftFilter.length + (minSalary !== "" ? 1 : 0) + (maxSalary !== "" ? 1 : 0) + (minRating > 0 ? 1 : 0);
  const hasFilter = branchFilter !== "all" || roleFilter !== "all" || statusFilter !== "all" || search || advCount > 0;
  const clearAll = () => {
    setBranchFilter("all"); setRoleFilter("all"); setStatusFilter("all"); setSearch("");
    setShiftFilter([]); setMinSalary(""); setMaxSalary(""); setMinRating(0);
  };

  const toggleShift = (sh) =>
    setShiftFilter((f) => (f.includes(sh) ? f.filter((x) => x !== sh) : [...f, sh]));

  /* ── thao tác ── */
  const saveStaff = (payload) => {
    if (editing) {
      setList((l) => l.map((s) => (s.id === editing.id ? { ...s, ...payload } : s)));
      setDetail((d) => (d?.id === editing.id ? { ...d, ...payload } : d));
      notify(`Đã cập nhật ${payload.name}`);
    } else {
      const b = branches.find((x) => x.id === payload.branchId);
      setList((l) => [{ ...payload, id: `ST-${b?.code || "NEW"}-${String(Date.now()).slice(-4)}`, branchName: b?.name || "" }, ...l]);
      notify(`Đã thêm nhân viên ${payload.name}`);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const toggleStatus = (s) => {
    const next = s.status === "active" ? "leave" : "active";
    setList((l) => l.map((x) => (x.id === s.id ? { ...x, status: next } : x)));
    setDetail((d) => (d?.id === s.id ? { ...d, status: next } : d));
    setMenuId(null);
    notify(`${s.name} → ${next === "active" ? "Đang làm" : "Nghỉ phép"}`);
  };

  const removeStaff = (s) => {
    setList((l) => l.filter((x) => x.id !== s.id));
    if (detail?.id === s.id) setDetail(null);
    setConfirm(null);
    setMenuId(null);
    notify(`Đã xoá ${s.name}`);
  };

  return (
    <div className="max-w-[1360px] mx-auto pb-10">
      {/* ═══ HEADER ═══ */}
      <div className="relative flex flex-wrap items-end justify-between gap-4 pt-1 pb-6">
        <div className="min-w-0">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.14em] text-white mb-3"
            style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}
          >
            <Sparkles className="w-3 h-3" /> Nhân sự
          </div>
          <h1
            className="font-display font-extrabold tracking-[-0.03em] text-[32px] sm:text-[38px] leading-none"
            style={{ color: "var(--fg)" }}
          >
            Đội ngũ Le Palmier
          </h1>
          <div className="flex items-center gap-2.5 mt-2.5 text-[13px] flex-wrap" style={{ color: "var(--fg-muted)" }}>
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-semibold" style={{ color: "var(--fg)" }}>{stats.active}</span> đang trực
            </span>
            <span className="opacity-40">•</span>
            <span>{stats.total} nhân viên</span>
            <span className="opacity-40">•</span>
            <span>{stats.branches} chi nhánh</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-full text-[13px] font-bold border transition hover:border-indigo-300 active:scale-95"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}
          >
            <Download className="w-4 h-4" /> Xuất danh sách
          </button>
          <button
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="glowbtn inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-bold text-white active:scale-95"
            style={{
              background: `linear-gradient(135deg,${brand.from},${brand.to})`,
              boxShadow: `0 8px 20px -8px ${brand.from}99`,
            }}
          >
            <Plus className="w-4 h-4" /> Thêm nhân viên
          </button>
        </div>
      </div>

      {/* ═══ KPI BENTO ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard {...KPI[0]} icon={Users}     label="Tổng nhân viên"   value={stats.total}
                 foot={`${stats.branches} chi nhánh · ${Object.keys(roleCounts).length} vai trò`} />
        <KpiCard {...KPI[1]} icon={UserCheck} label="Đang làm việc"    value={stats.active}
                 progress={stats.activePct} foot={`${stats.activePct}% tổng nhân sự`} />
        <KpiCard {...KPI[2]} icon={Clock}     label="Nghỉ phép"        value={stats.leave}
                 foot="Cần phân ca thay" />
        <KpiCard {...KPI[3]} icon={Wallet}    label="Lương trung bình" value={formatVND(stats.avgSalary)}
                 foot="Mỗi tháng" trend="+4.2%" />
      </div>

      {/* ═══ CHIP VAI TRÒ ═══ */}
      <div className="noscroll flex items-center gap-2.5 overflow-x-auto pb-3 mb-3">
        <RoleChip active={roleFilter === "all"} onClick={() => setRoleFilter("all")}
                  from="#475569" to="#1e293b" label="Tất cả" count={stats.total} />
        {ROLE_KEYS.map((key) => (
          <RoleChip
            key={key}
            active={roleFilter === key}
            onClick={() => setRoleFilter(roleFilter === key ? "all" : key)}
            from={ROLE[key].from} to={ROLE[key].to}
            label={ROLE_LABEL[key]} count={roleCounts[key] || 0}
          />
        ))}
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div
        className="rounded-[var(--r)] border p-2.5 mb-5 flex items-center gap-2.5 flex-wrap"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-subtle)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nhân viên theo tên, số điện thoại, email…"
            className="w-full h-11 pl-11 pr-10 rounded-full text-[13px] border-0 outline-none transition"
            style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }}
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Xóa"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-subtle)" }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <PillSelect icon={Building2} value={branchFilter} onChange={setBranchFilter}>
          <option value="all">Tất cả chi nhánh</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </PillSelect>

        <Segmented options={STATUS_TABS} value={statusFilter} onChange={setStatusFilter} />

        {/* Sắp xếp */}
        <div className="relative shrink-0" ref={sortRef}>
          <button
            onClick={() => setSortOpen((v) => !v)}
            aria-expanded={sortOpen}
            className="inline-flex items-center gap-2 h-11 pl-4 pr-3.5 rounded-full text-[13px] font-semibold transition"
            style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }}
          >
            <ArrowUpDown className="w-4 h-4" style={{ color: "var(--fg-subtle)" }} />
            <span className="hidden lg:inline">{SORTS.find((s) => s.key === sort)?.label}</span>
            <span className="lg:hidden">Sắp xếp</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`}
                         style={{ color: "var(--fg-subtle)" }} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border shadow-pop z-30 overflow-hidden p-1"
                 style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              {SORTS.map((s) => (
                <button key={s.key} onClick={() => { setSort(s.key); setSortOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 h-9 rounded-full text-left text-[12.5px] font-semibold transition hover:bg-ink-50"
                        style={sort === s.key ? { color: brand.from } : { color: "var(--fg-muted)" }}>
                  {sort === s.key ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bộ lọc nâng cao */}
        <button
          onClick={() => setShowFilter((v) => !v)}
          aria-expanded={showFilter}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-full text-[13px] font-semibold transition shrink-0"
          style={showFilter
            ? { background: `linear-gradient(135deg,${brand.from},${brand.to})`, color: "#fff" }
            : { backgroundColor: "var(--surface-2)", color: "var(--fg)" }}
        >
          <Filter className="w-4 h-4" /> Lọc
          {advCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold inline-flex items-center justify-center tabular-nums"
                  style={showFilter
                    ? { backgroundColor: "rgba(255,255,255,.25)", color: "#fff" }
                    : { background: `linear-gradient(135deg,${brand.from},${brand.to})`, color: "#fff" }}>
              {advCount}
            </span>
          )}
        </button>

        <Segmented
          gradient
          value={view}
          onChange={setView}
          options={[
            { key: "grid", label: "Thẻ", icon: LayoutGrid },
            { key: "table", label: "Bảng", icon: List },
          ]}
        />

        {showFilter && (
          <div className="w-full mt-1 pt-3.5 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn"
               style={{ borderColor: "var(--border-soft)" }}>
            <FilterBox label="Ca làm">
              <div className="flex flex-wrap gap-1.5">
                {SHIFTS.map((sh) => (
                  <MiniChip key={sh} on={shiftFilter.includes(sh)} onClick={() => toggleShift(sh)} brand={brand}>
                    {sh}
                  </MiniChip>
                ))}
              </div>
            </FilterBox>

            <FilterBox label="Khoảng lương (VNĐ)">
              <div className="flex items-center gap-2">
                <RoundInput type="number" min="0" step="1000000" placeholder="Từ"
                            value={minSalary} onChange={(e) => setMinSalary(e.target.value)} />
                <span className="text-[12px]" style={{ color: "var(--fg-subtle)" }}>—</span>
                <RoundInput type="number" min="0" step="1000000" placeholder="Đến"
                            value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} />
              </div>
            </FilterBox>

            <FilterBox label="Đánh giá tối thiểu">
              <div className="flex flex-wrap gap-1.5">
                {[0, 3.5, 4, 4.5].map((r) => (
                  <MiniChip key={r} on={minRating === r} onClick={() => setMinRating(r)} brand={brand}>
                    {r === 0 ? "Tất cả" : <><Star className="w-3 h-3" fill="currentColor" /> {r}+</>}
                  </MiniChip>
                ))}
              </div>
            </FilterBox>

            <FilterBox label="Hiển thị">
              <div className="flex items-center gap-2">
                <PillSelect icon={List} value={String(pageSize)} onChange={(v) => setPageSize(Number(v))}>
                  {[12, 24, 48].map((n) => <option key={n} value={n}>{n} / trang</option>)}
                </PillSelect>
                <button onClick={clearAll} disabled={!hasFilter}
                        className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full text-[12.5px] font-bold border transition disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}>
                  <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
                </button>
              </div>
            </FilterBox>
          </div>
        )}
      </div>

      {hasFilter && (
        <div className="flex items-center gap-2 flex-wrap mb-4 text-[12px]">
          <span style={{ color: "var(--fg-subtle)" }}>
            {filtered.length} kết quả
          </span>
          <button onClick={clearAll}
                  className="font-bold px-3 h-7 rounded-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition">
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* ═══ NỘI DUNG ═══ */}
      {filtered.length === 0 ? (
        <div className="rounded-[var(--r)] border py-20 text-center"
             style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="floaty w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white mb-4"
               style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
            <Search className="w-7 h-7" />
          </div>
          <div className="text-[16px] font-bold" style={{ color: "var(--fg)" }}>Không tìm thấy ai cả</div>
          <div className="text-[13px] mt-1" style={{ color: "var(--fg-muted)" }}>
            Thử đổi từ khóa hoặc bỏ bớt bộ lọc nhé.
          </div>
          <button onClick={clearAll}
                  className="mt-5 h-10 px-5 rounded-full text-[13px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            Xóa tất cả bộ lọc
          </button>
        </div>
      ) : view === "grid" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((s) => (
              <StaffCard
                key={s.id}
                s={s}
                c={ROLE[s.role]}
                onOpen={() => setDetail(s)}
                menuOpen={menuId === s.id}
                onToggleMenu={() => setMenuId(menuId === s.id ? null : s.id)}
                menuRef={menuId === s.id ? menuRef : null}
                onEdit={() => { setEditing(s); setFormOpen(true); setMenuId(null); }}
                onToggleStatus={() => toggleStatus(s)}
                onDelete={() => { setConfirm(s); setMenuId(null); }}
              />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage}
                      totalItems={filtered.length} itemsPerPage={pageSize} />
        </>
      ) : (
        <div className="rounded-[var(--r)] border overflow-hidden"
             style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-[13px]">
              <thead>
                <tr style={{ backgroundColor: "var(--surface-2)" }}>
                  {["Nhân viên", "Vai trò", "Chi nhánh", "Liên hệ", "Ca làm", "Lương", "Đánh giá", "Trạng thái", "Thao tác"].map((h, i) => (
                    <th key={h}
                        className={`px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider ${i >= 5 ? "text-right" : "text-left"}`}
                        style={{ color: "var(--fg-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => {
                  const r = ROLE[s.role];
                  const shift = parseShift(s.shift);
                  return (
                    <tr key={s.id} className="border-t transition hover:bg-ink-50"
                        style={{ borderColor: "var(--border-soft)" }}>
                      <td className="px-5 py-3">
                        <button onClick={() => setDetail(s)} className="flex items-center gap-3 text-left w-full">
                          <Avatar src={s.avatar} name={s.name} size={36} from={r.from} to={r.to} />
                          <div className="min-w-0">
                            <div className="font-bold truncate hover:underline" style={{ color: "var(--fg)" }}>{s.name}</div>
                            <div className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>Gia nhập {s.joinedAt}</div>
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-3"><RolePill role={s.role} /></td>
                      <td className="px-5 py-3" style={{ color: "var(--fg-muted)" }}>
                        {BRANCH_BY_ID[s.branchId]?.city || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="tabular-nums" style={{ color: "var(--fg-muted)" }}>{s.phone}</div>
                        <div className="text-[11px] truncate max-w-[180px]" style={{ color: "var(--fg-subtle)" }}>{s.email}</div>
                      </td>
                      <td className="px-5 py-3" style={{ color: "var(--fg-muted)" }}>
                        {shift.label} <span className="tabular-nums text-[11px]">{shift.time}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-extrabold tabular-nums" style={{ color: "var(--fg)" }}>
                        {formatVND(s.salary)}
                      </td>
                      <td className="px-5 py-3 text-right"><Rating value={s.rating} /></td>
                      <td className="px-5 py-3 text-right"><StatusTag active={s.status === "active"} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <RowBtn title="Xem chi tiết" onClick={() => setDetail(s)}><Eye className="w-4 h-4" /></RowBtn>
                          <RowBtn title="Chỉnh sửa" onClick={() => { setEditing(s); setFormOpen(true); }}><Edit2 className="w-4 h-4" /></RowBtn>
                          <RowBtn title="Xoá" onClick={() => setConfirm(s)}><Trash2 className="w-4 h-4" /></RowBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 pb-2">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage}
                        totalItems={filtered.length} itemsPerPage={pageSize} />
          </div>
        </div>
      )}

      {/* ═══ CHI TIẾT ═══ */}
      <StaffDetail
        s={detail}
        c={detail ? ROLE[detail.role] : null}
        brand={brand}
        onClose={() => setDetail(null)}
        onEdit={() => { setEditing(detail); setDetail(null); setFormOpen(true); }}
        onToggleStatus={() => toggleStatus(detail)}
      />

      {/* ═══ FORM ═══ */}
      <StaffForm
        open={formOpen}
        initial={editing}
        brand={brand}
        defaultBranchId={branchFilter !== "all" ? branchFilter : branches[0]?.id}
        existingEmails={list.filter((s) => s.id !== editing?.id).map((s) => (s.email || "").toLowerCase())}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={saveStaff}
      />

      {/* ═══ XUẤT ═══ */}
      <Modal open={exportOpen} onClose={() => setExportOpen(false)} icon={Download}
             title="Xuất danh sách nhân sự" subtitle={`${filtered.length} nhân viên theo bộ lọc hiện tại`}
             width="max-w-md">
        <div className="space-y-2">
          {[
            { fmt: "Excel (.xlsx)", desc: "Đủ cột, có định dạng lương" },
            { fmt: "CSV", desc: "Dữ liệu thô để phân tích" },
            { fmt: "Bảng lương (PDF)", desc: `Tổng quỹ lương ${formatVND(stats.payroll)}` },
          ].map((f) => (
            <button key={f.fmt}
                    onClick={() => { setExportOpen(false); notify(`Đang chuẩn bị ${f.fmt} · ${filtered.length} nhân viên`); }}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-2xl border transition hover:bg-ink-50 active:scale-[.99]"
                    style={{ borderColor: "var(--border)" }}>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold" style={{ color: "var(--fg)" }}>{f.fmt}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--fg-muted)" }}>{f.desc}</div>
              </div>
              <Download className="w-4 h-4 shrink-0" style={{ color: "var(--fg-subtle)" }} />
            </button>
          ))}
        </div>
      </Modal>

      {/* ═══ XÁC NHẬN XOÁ ═══ */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} icon={AlertCircle}
             title="Xoá nhân viên?" subtitle={confirm?.name} width="max-w-md"
             footer={
               <>
                 <button onClick={() => setConfirm(null)}
                         className="h-10 px-4 rounded-full text-[12.5px] font-bold border"
                         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}>
                   Huỷ
                 </button>
                 <button onClick={() => removeStaff(confirm)}
                         className="h-10 px-4 rounded-full text-[12.5px] font-bold text-white"
                         style={{ background: `linear-gradient(135deg,${TONE.danger.from},${TONE.danger.to})` }}>
                   Xoá vĩnh viễn
                 </button>
               </>
             }>
        <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Hồ sơ <strong style={{ color: "var(--fg)" }}>{confirm?.name}</strong>
          {confirm ? ` · ${ROLE_LABEL[confirm.role]} · ${BRANCH_BY_ID[confirm.branchId]?.city || ""}` : ""} sẽ bị gỡ khỏi danh sách.
          Nếu chỉ tạm nghỉ, hãy dùng “Cho nghỉ phép” để giữ lại hồ sơ.
        </p>
      </Modal>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] h-11 px-5 rounded-full shadow-pop border text-[12.5px] font-bold flex items-center gap-2 animate-slideUp max-w-[92vw]"
             style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TONE.success.dot }} />
          {toast}
        </div>
      )}
    </div>
  );
}

/* ═════════════ Thành phần ═════════════ */

function KpiCard({ icon: Icon, label, value, foot, from, to, progress, trend }) {
  return (
    <div
      className="lift relative rounded-[var(--r)] border p-5 overflow-hidden"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        "--glow": `${from}55`,
      }}
    >
      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl opacity-20"
           style={{ background: `linear-gradient(135deg,${from},${to})` }} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>
            {label}
          </div>
          <div className="font-display font-extrabold text-[34px] leading-none tracking-tight tabular-nums mt-2.5"
               style={{ color: "var(--fg)" }}>
            {value}
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
             style={{ background: `linear-gradient(135deg,${from},${to})`, boxShadow: `0 8px 18px -8px ${from}` }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {progress != null && (
        <div className="relative mt-4 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
          <div className="h-full rounded-full"
               style={{ width: `${progress}%`, background: `linear-gradient(90deg,${from},${to})` }} />
        </div>
      )}

      <div className="relative flex items-center gap-2 mt-3 text-[12px]" style={{ color: "var(--fg-muted)" }}>
        <span className="truncate">{foot}</span>
        {trend && (
          <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold shrink-0"
                style={{ backgroundColor: TONE.success.bg, color: TONE.success.ink }}>
            <TrendingUp className="w-3 h-3" />{trend}
          </span>
        )}
      </div>
    </div>
  );
}

function RoleChip({ active, onClick, label, count, from, to }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 inline-flex items-center gap-2 h-9 pl-3.5 pr-2.5 rounded-full text-[12.5px] font-bold border transition-all duration-200"
      style={
        active
          ? { background: `linear-gradient(135deg,${from},${to})`, color: "#fff", borderColor: "transparent",
              boxShadow: `0 8px 18px -8px ${from}` }
          : { backgroundColor: "var(--surface)", color: "var(--fg-muted)", borderColor: "var(--border)" }
      }
    >
      {!active && <span className="w-2 h-2 rounded-full" style={{ background: `linear-gradient(135deg,${from},${to})` }} />}
      {label}
      <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-full tabular-nums"
            style={active
              ? { backgroundColor: "rgba(255,255,255,.25)", color: "#fff" }
              : { backgroundColor: "var(--surface-3)", color: "var(--fg-muted)" }}>
        {count}
      </span>
    </button>
  );
}

function StaffCard({ s, c, onOpen, menuOpen, onToggleMenu, menuRef, onEdit, onToggleStatus, onDelete }) {
  const r = c;
  const shift = parseShift(s.shift);
  const branch = BRANCH_BY_ID[s.branchId];

  return (
    <div
      className="lift group relative rounded-[var(--r)] border p-5 overflow-hidden"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", "--glow": `${r.from}50` }}
    >
      <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-25 transition-opacity duration-300"
           style={{ background: `linear-gradient(135deg,${r.from},${r.to})` }} />

      <div className="relative flex items-start gap-3.5">
        <Avatar src={s.avatar} name={s.name} size={52} from={r.from} to={r.to} ring />
        <button onClick={onOpen} className="flex-1 min-w-0 pt-0.5 text-left">
          <div className="text-[15.5px] font-extrabold tracking-tight truncate leading-tight hover:underline"
               style={{ color: "var(--fg)" }}>
            {s.name}
          </div>
          <div className="mt-1.5"><RolePill role={s.role} c={r} /></div>
        </button>

        {/* Menu thao tác — tách khỏi nút mở chi tiết để không lồng phần tử tương tác */}
        <div className="relative shrink-0" ref={menuRef}>
          <button onClick={onToggleMenu} aria-label={`Thao tác với ${s.name}`} aria-expanded={menuOpen}
                  className={`p-1.5 rounded-lg transition hover:bg-ink-100 ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  style={{ color: "var(--fg-subtle)" }}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl border shadow-pop z-30 overflow-hidden p-1"
                 style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <CardMenuItem icon={Eye} label="Xem chi tiết" onClick={onOpen} />
              <CardMenuItem icon={Edit2} label="Chỉnh sửa" onClick={onEdit} />
              <CardMenuItem icon={Power} label={s.status === "active" ? "Cho nghỉ phép" : "Cho đi làm lại"} onClick={onToggleStatus} />
              <CardMenuItem icon={Trash2} label="Xoá nhân viên" danger onClick={onDelete} />
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-4 space-y-1.5 text-[12.5px]" style={{ color: "var(--fg-muted)" }}>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: r.ink }} />
          <span className="tabular-nums">{s.phone}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: r.ink }} />
          <span className="truncate">{s.email}</span>
        </div>
      </div>

      <div className="relative mt-4 rounded-xl p-3 grid grid-cols-3 gap-2"
           style={{ backgroundColor: "var(--surface-2)" }}>
        <Metric label="Chi nhánh" value={branch?.city || "—"} />
        <Metric label="Ca làm"    value={shift.label} hint={shift.time} />
        <Metric label="Lương"     value={formatVND(s.salary)} />
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-2">
        <StatusTag active={s.status === "active"} />
        <Rating value={s.rating} />
      </div>
    </div>
  );
}

function Metric({ label, value, hint }) {
  return (
    <div className="min-w-0">
      <div className="text-[9.5px] font-extrabold uppercase tracking-[0.08em] truncate"
           style={{ color: "var(--fg-subtle)" }}>
        {label}
      </div>
      <div className="text-[13px] font-bold truncate mt-1" style={{ color: "var(--fg)" }}>{value}</div>
      {hint && <div className="text-[10.5px] tabular-nums" style={{ color: "var(--fg-subtle)" }}>{hint}</div>}
    </div>
  );
}

function RolePill({ role, c }) {
  const r = c;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11px] font-extrabold"
          style={{ backgroundColor: r.soft, color: r.ink }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: `linear-gradient(135deg,${r.from},${r.to})` }} />
      {ROLE_LABEL[role]}
    </span>
  );
}

function StatusTag({ active }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[11.5px] font-bold"
          style={active
            ? { backgroundColor: TONE.success.bg, color: TONE.success.ink }
            : { backgroundColor: TONE.warning.bg, color: TONE.warning.ink }}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`} />
      {active ? "Đang làm" : "Nghỉ phép"}
    </span>
  );
}

function Rating({ value }) {
  if (value == null) return <span style={{ color: "var(--fg-subtle)" }}>—</span>;
  const low = value < 4;
  return (
    <span className="inline-flex items-center gap-1 px-2 h-7 rounded-full text-[12.5px] font-extrabold tabular-nums"
          style={low
            ? { backgroundColor: TONE.danger.bg, color: TONE.danger.ink }
            : { backgroundColor: TONE.warning.bg, color: TONE.warning.ink }}>
      <Star className="w-3.5 h-3.5" fill="currentColor" />
      {value}
    </span>
  );
}

function Avatar({ src, name, size = 40, from, to, ring }) {
  const [loaded, setLoaded] = useState(false);
  const pad = ring ? 2.5 : 0;
  return (
    <div
      className="rounded-full shrink-0"
      style={{
        width: size, height: size, padding: pad,
        background: ring ? `linear-gradient(135deg,${from},${to})` : "transparent",
        boxShadow: ring ? `0 6px 14px -6px ${from}` : "none",
      }}
    >
      <div
        className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center font-extrabold"
        style={{
          background: loaded ? "transparent" : `linear-gradient(135deg,${from},${to})`,
          color: "#fff",
          fontSize: Math.round(size * 0.33),
          boxShadow: ring ? "0 0 0 2px var(--surface) inset" : "none",
        }}
      >
        {!loaded && <span>{initials(name)}</span>}
        {src && (
          <img src={src} alt="" onLoad={() => setLoaded(true)}
               className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
               style={{ opacity: loaded ? 1 : 0 }} />
        )}
      </div>
    </div>
  );
}

/* ═════════════ Bổ sung: lọc, menu, chi tiết, form ═════════════ */

function FilterBox({ label, children }) {
  return (
    <div className="min-w-0">
      <div className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] mb-2" style={{ color: "var(--fg-subtle)" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function MiniChip({ on, onClick, brand, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-full text-[12px] font-bold border transition active:scale-95"
            style={on
              ? { background: `linear-gradient(135deg,${brand.from},${brand.to})`, color: "#fff", borderColor: "transparent" }
              : { backgroundColor: "var(--surface)", color: "var(--fg-muted)", borderColor: "var(--border)" }}>
      {children}
    </button>
  );
}

function RoundInput(props) {
  return (
    <input {...props}
           className="w-full h-11 px-4 rounded-full text-[12.5px] border-0 outline-none"
           style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }} />
  );
}

function RowBtn({ title, onClick, children }) {
  return (
    <button onClick={onClick} title={title} aria-label={title}
            className="w-8 h-8 rounded-full inline-flex items-center justify-center transition hover:bg-ink-100 active:scale-90"
            style={{ color: "var(--fg-subtle)" }}>
      {children}
    </button>
  );
}

function CardMenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
            className="w-full flex items-center gap-2.5 px-3 h-9 rounded-full text-[12.5px] font-semibold text-left transition hover:bg-ink-50"
            style={{ color: danger ? TONE.danger.ink : "var(--fg)" }}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
    </button>
  );
}

function StaffDetail({ s, c, brand, onClose, onEdit, onToggleStatus }) {
  if (!s || !c) return null;
  const shift = parseShift(s.shift);
  const branch = BRANCH_BY_ID[s.branchId];
  const years = Math.max(0, 2026 - parseInt(String(s.joinedAt).slice(0, 4) || "2026", 10));

  return (
    <Modal open={!!s} onClose={onClose} icon={Users}
           title={s.name} subtitle={`${ROLE_LABEL[s.role]} · ${branch?.name || "—"}`} width="max-w-lg"
           footer={
             <>
               <button onClick={onToggleStatus}
                       className="mr-auto h-10 px-4 rounded-full text-[12.5px] font-bold border inline-flex items-center gap-2"
                       style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}>
                 <Power className="w-4 h-4" />
                 {s.status === "active" ? "Cho nghỉ phép" : "Cho đi làm lại"}
               </button>
               <button onClick={onClose}
                       className="h-10 px-4 rounded-full text-[12.5px] font-bold border"
                       style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}>
                 Đóng
               </button>
               <button onClick={onEdit}
                       className="h-10 px-4 rounded-full text-[12.5px] font-bold text-white inline-flex items-center gap-2"
                       style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
                 <Edit2 className="w-4 h-4" /> Chỉnh sửa
               </button>
             </>
           }>
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: c.soft }}>
          <Avatar src={s.avatar} name={s.name} size={60} from={c.from} to={c.to} ring />
          <div className="min-w-0 flex-1">
            <div className="text-[16px] font-extrabold truncate" style={{ color: "var(--fg)" }}>{s.name}</div>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <RolePill role={s.role} c={c} />
              <StatusTag active={s.status === "active"} />
            </div>
          </div>
          <Rating value={s.rating} />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <DetailStat label="Lương tháng" value={formatVNDFull(s.salary)} />
          <DetailStat label="Thâm niên" value={years > 0 ? `${years} năm` : "Dưới 1 năm"} sub={`Gia nhập ${s.joinedAt}`} />
          <DetailStat label="Ca làm" value={shift.label} sub={shift.time} />
          <DetailStat label="Chi nhánh" value={branch?.city || "—"} sub={branch?.code} />
        </div>

        <div className="rounded-2xl border p-3.5 space-y-2.5 text-[12.5px]" style={{ borderColor: "var(--border)" }}>
          <a href={`tel:${s.phone}`} className="flex items-center gap-2.5 hover:underline" style={{ color: "var(--fg-muted)" }}>
            <Phone className="w-4 h-4 shrink-0" style={{ color: c.ink }} />
            <span className="tabular-nums">{s.phone}</span>
          </a>
          <a href={`mailto:${s.email}`} className="flex items-center gap-2.5 hover:underline min-w-0" style={{ color: "var(--fg-muted)" }}>
            <Mail className="w-4 h-4 shrink-0" style={{ color: c.ink }} />
            <span className="truncate">{s.email}</span>
          </a>
          <div className="flex items-center gap-2.5" style={{ color: "var(--fg-muted)" }}>
            <CalendarCheck className="w-4 h-4 shrink-0" style={{ color: c.ink }} />
            <span>Mã nhân viên <span className="font-mono font-bold" style={{ color: "var(--fg)" }}>{s.id}</span></span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function DetailStat({ label, value, sub }) {
  return (
    <div className="rounded-2xl p-3.5" style={{ backgroundColor: "var(--surface-2)" }}>
      <div className="text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "var(--fg-subtle)" }}>{label}</div>
      <div className="text-[15px] font-extrabold mt-1 tabular-nums break-all" style={{ color: "var(--fg)" }}>{value}</div>
      {sub && <div className="text-[10.5px] mt-0.5 truncate" style={{ color: "var(--fg-subtle)" }}>{sub}</div>}
    </div>
  );
}

const BLANK_STAFF = {
  name: "", role: "reception", branchId: "", phone: "", email: "",
  shift: "Ca sáng (6h-14h)", salary: "", rating: 4.5, status: "active",
  joinedAt: "2026-01-01", avatar: "https://i.pravatar.cc/100?img=15",
};

const SHIFT_OPTIONS = [
  "Ca sáng (6h-14h)", "Ca chiều (14h-22h)", "Ca đêm (22h-6h)",
];

function StaffForm({ open, initial, brand, defaultBranchId, existingEmails = [], onClose, onSubmit }) {
  const [v, setV] = useState(BLANK_STAFF);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({}); setTouched(false);
    setV(initial
      ? { ...BLANK_STAFF, ...initial, salary: String(initial.salary ?? "") }
      : { ...BLANK_STAFF, branchId: defaultBranchId || branches[0]?.id || "" });
  }, [open, initial, defaultBranchId]);

  const set = (k, val) => setV((s) => ({ ...s, [k]: val }));

  const validate = (s) => {
    const e = {};
    if (!s.name.trim()) e.name = "Bắt buộc nhập họ tên";
    else if (s.name.trim().length < 2) e.name = "Họ tên quá ngắn";

    const email = s.email.trim().toLowerCase();
    if (!email) e.email = "Bắt buộc nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email chưa đúng định dạng";
    else if (existingEmails.includes(email)) e.email = "Email này đã có nhân viên khác dùng";

    if (!s.phone.trim()) e.phone = "Bắt buộc nhập số điện thoại";
    else if (!/^0\d{9}$/.test(s.phone.trim())) e.phone = "SĐT gồm 10 số, bắt đầu bằng 0";

    if (!s.branchId) e.branchId = "Chọn chi nhánh";
    if (!s.joinedAt) e.joinedAt = "Chọn ngày gia nhập";
    else if (s.joinedAt > "2026-07-28") e.joinedAt = "Không thể ở tương lai";

    const sal = Number(s.salary);
    if (s.salary === "") e.salary = "Bắt buộc nhập lương";
    else if (!(sal >= 3000000 && sal <= 200000000)) e.salary = "Lương từ 3.000.000 đến 200.000.000";

    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(v);
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`s-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    onSubmit({
      ...v,
      name: v.name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      salary: Number(v.salary),
      rating: Number(v.rating),
      roleLabel: ROLE_LABEL[v.role],
    });
  };

  const err = (k) => (touched ? errors[k] : undefined);

  return (
    <Modal open={open} onClose={onClose} icon={initial ? Edit2 : Plus}
           title={initial ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}
           subtitle={initial ? `${initial.id} · ${initial.name}` : "Các trường có dấu * là bắt buộc"}
           width="max-w-2xl"
           footer={
             <>
               {touched && Object.keys(errors).length > 0 && (
                 <span className="mr-auto text-[12px] font-bold inline-flex items-center gap-1.5" style={{ color: TONE.danger.ink }}>
                   <AlertCircle className="w-3.5 h-3.5" /> Còn {Object.keys(errors).length} trường chưa hợp lệ
                 </span>
               )}
               <button type="button" onClick={onClose}
                       className="h-10 px-4 rounded-full text-[12.5px] font-bold border"
                       style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}>
                 Huỷ
               </button>
               <button type="submit" form="staff-form"
                       className="h-10 px-4 rounded-full text-[12.5px] font-bold text-white inline-flex items-center gap-2"
                       style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
                 <Check className="w-4 h-4" /> {initial ? "Lưu thay đổi" : "Thêm nhân viên"}
               </button>
             </>
           }>
      <form id="staff-form" onSubmit={submit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Họ và tên" required error={err("name")} id="s-name">
            <FormInput id="s-name" value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Nguyễn Văn A" />
          </FormField>
          <FormField label="Vai trò" required id="s-role">
            <FormSelect id="s-role" value={v.role} onChange={(e) => set("role", e.target.value)}>
              {ROLE_KEYS.map((k) => <option key={k} value={k}>{ROLE_LABEL[k]}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Số điện thoại" required error={err("phone")} id="s-phone">
            <FormInput id="s-phone" inputMode="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0912345678" />
          </FormField>
          <FormField label="Email" required error={err("email")} id="s-email">
            <FormInput id="s-email" inputMode="email" value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="ten@lepalmier.vn" />
          </FormField>
          <FormField label="Chi nhánh" required error={err("branchId")} id="s-branchId">
            <FormSelect id="s-branchId" value={v.branchId} onChange={(e) => set("branchId", e.target.value)}>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Ca làm" required id="s-shift">
            <FormSelect id="s-shift" value={v.shift} onChange={(e) => set("shift", e.target.value)}>
              {SHIFT_OPTIONS.map((sh) => <option key={sh} value={sh}>{sh}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Lương tháng (VNĐ)" required error={err("salary")} id="s-salary">
            <FormInput id="s-salary" type="number" min="3000000" step="500000" value={v.salary}
                       onChange={(e) => set("salary", e.target.value)} placeholder="12000000" />
          </FormField>
          <FormField label="Ngày gia nhập" required error={err("joinedAt")} id="s-joinedAt">
            <FormInput id="s-joinedAt" type="date" max="2026-07-28" value={v.joinedAt}
                       onChange={(e) => set("joinedAt", e.target.value)} />
          </FormField>
          <FormField label={`Đánh giá · ${Number(v.rating).toFixed(1)} ★`} id="s-rating">
            <input id="s-rating" type="range" min="1" max="5" step="0.1" value={v.rating}
                   onChange={(e) => set("rating", e.target.value)}
                   className="w-full h-11" style={{ accentColor: brand.from }} />
          </FormField>
          <FormField label="Trạng thái" required id="s-status">
            <FormSelect id="s-status" value={v.status} onChange={(e) => set("status", e.target.value)}>
              <option value="active">Đang làm</option>
              <option value="leave">Nghỉ phép</option>
            </FormSelect>
          </FormField>
        </div>

        {v.salary !== "" && Number(v.salary) > 0 && (
          <div className="rounded-2xl p-3.5 text-[12.5px]" style={{ backgroundColor: TONE.info.bg, color: TONE.info.ink }}>
            Chi phí nhân sự cả năm cho vị trí này:{" "}
            <strong className="tabular-nums">{formatVNDFull(Number(v.salary) * 12)}</strong>
          </div>
        )}
      </form>
    </Modal>
  );
}

function FormField({ label, required, error, id, children }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-[11px] font-bold mb-1.5" style={{ color: "var(--fg-muted)" }}>
        {label}{required && <span style={{ color: TONE.danger.dot }}> *</span>}
      </label>
      {children}
      {error && (
        <div className="mt-1.5 text-[11px] font-bold inline-flex items-center gap-1" style={{ color: TONE.danger.ink }}>
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}

function FormInput(props) {
  return (
    <input {...props}
           className="w-full h-11 px-4 rounded-full text-[13px] border-0 outline-none"
           style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }} />
  );
}

function FormSelect({ children, ...props }) {
  return (
    <div className="relative">
      <select {...props}
              className="w-full h-11 pl-4 pr-9 rounded-full text-[13px] font-semibold border-0 outline-none appearance-none cursor-pointer"
              style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }}>
        {children}
      </select>
      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                   style={{ color: "var(--fg-subtle)" }} />
    </div>
  );
}

function PillSelect({ icon: Icon, value, onChange, children }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--fg-subtle)" }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 pl-10 pr-9 rounded-full text-[13px] font-semibold border-0 outline-none appearance-none cursor-pointer"
        style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                   style={{ color: "var(--fg-subtle)" }} />
    </div>
  );
}

function Segmented({ options, value, onChange, gradient }) {
  const { brand } = usePalette();
  return (
    <div className="inline-flex items-center gap-1 h-11 p-1 rounded-full shrink-0"
         style={{ backgroundColor: "var(--surface-2)" }}>
      {options.map((o) => {
        const on = value === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-bold transition-all duration-200"
            style={on
              ? gradient
                ? { background: `linear-gradient(135deg,${brand.from},${brand.to})`, color: "#fff",
                    boxShadow: `0 6px 14px -6px ${brand.from}b3` }
                : { backgroundColor: "var(--surface)", color: "var(--fg)", boxShadow: "0 1px 3px rgba(0,0,0,.12)" }
              : { color: "var(--fg-muted)" }}
          >
            {o.icon && <o.icon className="w-3.5 h-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
