import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Modal } from "../components/DashboardPrimitives";
import { Icons } from "../components/Icons";
import { guests as seedGuests, branches, bookings } from "../data/mockData";
import { formatVND, formatDate } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import Pagination from "../components/Pagination";

const {
  Users, Search, Plus, Filter, MoreHorizontal, Phone, Mail, Star, Download,
  MessageSquare, Eye, X, Check, ChevronDown, ArrowUpDown, RotateCcw, SearchX,
  AlertCircle, Trash2, Edit2, CalendarCheck, Wallet, Globe, Send, CheckCircle2,
} = Icons;

const TIERS = [
  { key: "Thường",    tone: "neutral",   emoji: "" },
  { key: "Bạc",       tone: "info",      emoji: "" },
  { key: "Vàng",      tone: "warning",   emoji: "" },
  { key: "Bạch kim",  tone: "highlight", emoji: "" },
  { key: "Kim cương", tone: "danger",    emoji: "💎 " },
];
const TIER_MAP = TIERS.reduce((a, t) => { a[t.key] = t; return a; }, {});

const toneVars = (tone) => ({
  solid:  tone === "accent" ? "var(--accent)" : `var(--${tone})`,
  soft:   `var(--${tone}-soft)`,
  fg:     `var(--${tone}-fg)`,
  border: tone === "accent" ? "var(--accent)" : `var(--${tone}-border)`,
});

const SORTS = [
  { key: "spent-desc",   label: "Chi tiêu cao nhất" },
  { key: "spent-asc",    label: "Chi tiêu thấp nhất" },
  { key: "bookings-desc",label: "Nhiều booking nhất" },
  { key: "recent-desc",  label: "Ghé gần đây nhất" },
  { key: "recent-asc",   label: "Lâu chưa quay lại" },
  { key: "name-asc",     label: "Tên A → Z" },
];

const VISIT_PRESETS = [
  { key: "all",   label: "Tất cả" },
  { key: "m1",    label: "Trong 1 tháng" },
  { key: "m3",    label: "Trong 3 tháng" },
  { key: "old",   label: "Trên 3 tháng" },
];

const TODAY = "2026-07-28";

const EMPTY_FILTERS = {
  tiers: [], nationalities: [], notes: [],
  minSpent: "", maxSpent: "", minBookings: "", visit: "all",
};

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const monthsBetween = (a, b) =>
  (new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24 * 30.44);

export default function Guests() {
  const { activeBranchId, activeBranch, isAll } = useActiveBranch();

  const [list, setList] = useState(seedGuests);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState("spent-desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [historyOf, setHistoryOf] = useState(null);
  const [messageTo, setMessageTo] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [picked, setPicked] = useState([]);
  const [toast, setToast] = useState(null);

  const sortRef = useRef(null);
  const menuRef = useRef(null);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuId(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const scoped = useMemo(
    () => (isAll ? list : list.filter((g) => g.branchId === activeBranchId)),
    [list, activeBranchId, isAll]
  );

  const nationalityOptions = useMemo(
    () => [...new Set(seedGuests.map((g) => g.nationality))].sort((a, b) => a.localeCompare(b, "vi")),
    []
  );
  const noteOptions = useMemo(
    () => [...new Set(seedGuests.flatMap((g) => g.notes || []))].sort((a, b) => a.localeCompare(b, "vi")),
    []
  );

  useEffect(() => { setCurrentPage(1); }, [filters, search, sort, pageSize, activeBranchId]);

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    const out = scoped.filter((g) => {
      if (filters.tiers.length && !filters.tiers.includes(g.tier)) return false;
      if (filters.nationalities.length && !filters.nationalities.includes(g.nationality)) return false;
      if (filters.notes.length && !filters.notes.some((n) => (g.notes || []).includes(n))) return false;
      if (filters.minSpent !== "" && g.totalSpent < Number(filters.minSpent)) return false;
      if (filters.maxSpent !== "" && g.totalSpent > Number(filters.maxSpent)) return false;
      if (filters.minBookings !== "" && g.totalBookings < Number(filters.minBookings)) return false;
      if (filters.visit !== "all") {
        const m = monthsBetween(g.lastVisit, TODAY);
        if (filters.visit === "m1" && !(m <= 1)) return false;
        if (filters.visit === "m3" && !(m <= 3)) return false;
        if (filters.visit === "old" && !(m > 3)) return false;
      }
      if (q && !deaccent(`${g.name} ${g.email} ${g.phone} ${g.nationality} ${(g.notes || []).join(" ")}`).includes(q)) return false;
      return true;
    });
    const cmp = {
      "spent-desc":    (a, b) => b.totalSpent - a.totalSpent,
      "spent-asc":     (a, b) => a.totalSpent - b.totalSpent,
      "bookings-desc": (a, b) => b.totalBookings - a.totalBookings,
      "recent-desc":   (a, b) => (b.lastVisit || "").localeCompare(a.lastVisit || ""),
      "recent-asc":    (a, b) => (a.lastVisit || "").localeCompare(b.lastVisit || ""),
      "name-asc":      (a, b) => a.name.localeCompare(b.name, "vi"),
    }[sort];
    return [...out].sort(cmp);
  }, [scoped, filters, search, sort]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  /* Giữ khách đang chọn nếu vẫn còn trong trang, ngược lại chọn người đầu */
  useEffect(() => {
    if (!paginated.length) { setSelected(null); return; }
    setSelected((prev) => (prev && paginated.some((g) => g.id === prev.id) ? prev : paginated[0]));
  }, [paginated]);

  const tierStats = useMemo(
    () => TIERS.map((t) => ({ ...t, count: scoped.filter((g) => g.tier === t.key).length })),
    [scoped]
  );

  const totals = useMemo(() => ({
    spent: scoped.reduce((s, g) => s + g.totalSpent, 0),
    bookings: scoped.reduce((s, g) => s + g.totalBookings, 0),
  }), [scoped]);

  const activeFilterCount =
    filters.tiers.length + filters.nationalities.length + filters.notes.length +
    (filters.minSpent !== "" ? 1 : 0) + (filters.maxSpent !== "" ? 1 : 0) +
    (filters.minBookings !== "" ? 1 : 0) + (filters.visit !== "all" ? 1 : 0);
  const hasQuery = activeFilterCount > 0 || search.trim() !== "";

  const toggleIn = (key, value) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));

  const resetFilters = () => { setFilters({ ...EMPTY_FILTERS }); setSearch(""); };

  /* ── thao tác ── */
  const saveGuest = (payload) => {
    if (editing) {
      setList((l) => l.map((g) => (g.id === editing.id ? { ...g, ...payload } : g)));
      setSelected((s) => (s?.id === editing.id ? { ...s, ...payload } : s));
      notify(`Đã cập nhật ${payload.name}`);
    } else {
      const id = `GU-${String(Date.now()).slice(-5)}`;
      setList((l) => [{ ...payload, id }, ...l]);
      notify(`Đã thêm khách ${payload.name}`);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const removeGuest = (g) => {
    setList((l) => l.filter((x) => x.id !== g.id));
    setPicked((p) => p.filter((id) => id !== g.id));
    if (selected?.id === g.id) setSelected(null);
    setConfirm(null);
    notify(`Đã xoá khách ${g.name}`);
  };

  const togglePick = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const pickAllOnPage = () => {
    const ids = paginated.map((g) => g.id);
    setPicked((p) => (ids.every((id) => p.includes(id)) ? p.filter((id) => !ids.includes(id)) : [...new Set([...p, ...ids])]));
  };

  const guestBookings = useCallback(
    (g) => bookings.filter((b) => b.guestId === g.id).sort((a, b) => (b.checkIn || "").localeCompare(a.checkIn || "")),
    []
  );

  return (
    <div>
      <PageHeader
        title="Khách tham quan"
        subtitle={`${scoped.length} khách ${isAll ? "trong hệ thống" : `tại ${activeBranch?.name ?? "chi nhánh đang chọn"}`} · Tổng chi tiêu ${formatVND(totals.spent)}`}
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
              <Download className="w-4 h-4" /> Xuất danh sách
            </button>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-primary">
              <Plus className="w-4 h-4" /> Thêm khách
            </button>
          </>
        }
      />

      {/* ── Thẻ hạng thành viên (đồng thời là bộ lọc) ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-5">
        {tierStats.map((t) => {
          const on = filters.tiers.includes(t.key);
          const v = toneVars(t.tone);
          return (
            <button
              key={t.key}
              onClick={() => toggleIn("tiers", t.key)}
              aria-pressed={on}
              className="card p-3 sm:p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              style={on ? { backgroundColor: v.soft, borderColor: v.solid, boxShadow: `0 0 0 2px ${v.soft}` } : undefined}
            >
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 shrink-0" style={{ fill: v.solid, color: v.solid }} />
                <div className="text-[10px] font-bold uppercase tracking-wide truncate"
                  style={{ color: on ? v.fg : "var(--fg-muted)" }}>
                  {t.emoji}{t.key}
                </div>
              </div>
              <div className="text-2xl font-extrabold font-display leading-none mt-1.5 tabular-nums"
                style={{ color: on ? v.fg : "var(--fg)" }}>
                {t.count}
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
              aria-label="Tìm kiếm khách"
              placeholder="Tên, email, điện thoại, quốc tịch, ghi chú…"
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
            <Group label={`Quốc tịch${filters.nationalities.length ? ` · ${filters.nationalities.length}` : ""}`}>
              <div className="flex flex-wrap gap-1.5">
                {nationalityOptions.map((n) => (
                  <Chip key={n} on={filters.nationalities.includes(n)} onClick={() => toggleIn("nationalities", n)}>{n}</Chip>
                ))}
              </div>
            </Group>

            <Group label={`Ghi chú đặc biệt${filters.notes.length ? ` · ${filters.notes.length}` : ""}`}>
              <div className="flex flex-wrap gap-1.5">
                {noteOptions.map((n) => (
                  <Chip key={n} on={filters.notes.includes(n)} onClick={() => toggleIn("notes", n)}>{n}</Chip>
                ))}
              </div>
            </Group>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Group label="Chi tiêu (VNĐ)">
                <div className="flex items-center gap-2">
                  <input type="number" min="0" step="1000000" placeholder="Từ" value={filters.minSpent}
                    onChange={(e) => setFilters((f) => ({ ...f, minSpent: e.target.value }))} className="input text-[13px]" />
                  <span className="text-ink-400 text-[12px]">—</span>
                  <input type="number" min="0" step="1000000" placeholder="Đến" value={filters.maxSpent}
                    onChange={(e) => setFilters((f) => ({ ...f, maxSpent: e.target.value }))} className="input text-[13px]" />
                </div>
              </Group>

              <Group label="Số booking tối thiểu">
                <input type="number" min="0" placeholder="vd 5" value={filters.minBookings}
                  onChange={(e) => setFilters((f) => ({ ...f, minBookings: e.target.value }))} className="input text-[13px]" />
              </Group>

              <Group label="Lần ghé gần nhất">
                <div className="flex flex-wrap gap-1.5">
                  {VISIT_PRESETS.map((p) => (
                    <Chip key={p.key} on={filters.visit === p.key} onClick={() => setFilters((f) => ({ ...f, visit: p.key }))}>
                      {p.label}
                    </Chip>
                  ))}
                </div>
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
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-ink-500">
            <strong className="text-ink-900 tabular-nums">{filtered.length}</strong>/{scoped.length} khách
          </span>
          {search.trim() && <ActiveChip onRemove={() => setSearch("")}>“{search.trim()}”</ActiveChip>}
          {filters.tiers.map((t) => <ActiveChip key={t} onRemove={() => toggleIn("tiers", t)}>{t}</ActiveChip>)}
          {filters.nationalities.map((n) => <ActiveChip key={n} onRemove={() => toggleIn("nationalities", n)}>{n}</ActiveChip>)}
          {filters.notes.map((n) => <ActiveChip key={n} onRemove={() => toggleIn("notes", n)}>{n}</ActiveChip>)}
          {filters.minSpent !== "" && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, minSpent: "" }))}>≥ {formatVND(Number(filters.minSpent))}</ActiveChip>}
          {filters.maxSpent !== "" && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, maxSpent: "" }))}>≤ {formatVND(Number(filters.maxSpent))}</ActiveChip>}
          {filters.minBookings !== "" && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, minBookings: "" }))}>≥ {filters.minBookings} booking</ActiveChip>}
          {filters.visit !== "all" && <ActiveChip onRemove={() => setFilters((f) => ({ ...f, visit: "all" }))}>{VISIT_PRESETS.find((p) => p.key === filters.visit)?.label}</ActiveChip>}
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
          <span className="text-[12.5px] font-bold" style={{ color: "var(--accent-fg)" }}>Đã chọn {picked.length} khách</span>
          <button onClick={() => setMessageTo({ bulk: true, count: picked.length })}
            className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition active:scale-95"
            style={{ backgroundColor: "var(--surface)", color: "var(--accent-fg)", borderColor: "var(--accent)" }}>
            <MessageSquare className="w-3 h-3 inline mr-1" /> Gửi tin hàng loạt
          </button>
          <button onClick={() => { setExportOpen(true); }}
            className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition active:scale-95"
            style={{ backgroundColor: "var(--surface)", color: "var(--accent-fg)", borderColor: "var(--accent)" }}>
            <Download className="w-3 h-3 inline mr-1" /> Xuất đã chọn
          </button>
          <button onClick={() => setPicked([])} className="ml-auto text-[12px] font-semibold hover:underline" style={{ color: "var(--accent-fg)" }}>
            Bỏ chọn
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Card className="!p-0">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <SearchX className="w-10 h-10 mx-auto text-ink-300 mb-3" />
                <div className="text-sm font-semibold text-ink-900">Không tìm thấy khách nào</div>
                <div className="text-xs text-ink-500 mt-1">Thử bỏ bớt điều kiện lọc hoặc đổi từ khoá.</div>
                <button onClick={resetFilters} className="btn-primary mt-4 mx-auto">
                  <RotateCcw className="w-4 h-4" /> Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr>
                        <th className="table-th w-10">
                          <input type="checkbox" aria-label="Chọn tất cả trong trang"
                            checked={paginated.length > 0 && paginated.every((g) => picked.includes(g.id))}
                            onChange={pickAllOnPage} className="w-4 h-4" style={{ accentColor: "var(--accent)" }} />
                        </th>
                        <th className="table-th">Khách hàng</th>
                        <th className="table-th hidden md:table-cell">Quốc tịch</th>
                        <th className="table-th">Hạng</th>
                        <th className="table-th text-center hidden sm:table-cell">Booking</th>
                        <th className="table-th text-right">Chi tiêu</th>
                        <th className="table-th hidden lg:table-cell">Lần cuối</th>
                        <th className="table-th text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((g) => {
                        const v = toneVars(TIER_MAP[g.tier]?.tone || "neutral");
                        const on = selected?.id === g.id;
                        return (
                          <tr key={g.id} className="border-b border-ink-100 transition hover:bg-ink-50"
                            style={on ? { backgroundColor: "var(--accent-soft)" } : undefined}>
                            <td className="table-td">
                              <input type="checkbox" checked={picked.includes(g.id)} onChange={() => togglePick(g.id)}
                                aria-label={`Chọn ${g.name}`} className="w-4 h-4" style={{ accentColor: "var(--accent)" }} />
                            </td>
                            <td className="table-td">
                              <button onClick={() => setSelected(g)} className="flex items-center gap-3 text-left w-full">
                                <img src={g.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-ink-200" />
                                <div className="min-w-0">
                                  <div className="font-semibold text-ink-900 truncate hover:underline">{g.name}</div>
                                  <div className="text-xs text-ink-500 truncate">{g.email}</div>
                                </div>
                              </button>
                            </td>
                            <td className="table-td text-xs hidden md:table-cell">{g.nationality}</td>
                            <td className="table-td">
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap"
                                style={{ backgroundColor: v.soft, color: v.fg, border: `1px solid ${v.border}` }}>
                                {TIER_MAP[g.tier]?.emoji}{g.tier}
                              </span>
                            </td>
                            <td className="table-td text-center font-bold hidden sm:table-cell tabular-nums">{g.totalBookings}</td>
                            <td className="table-td text-right font-extrabold text-ink-900 tabular-nums">{formatVND(g.totalSpent)}</td>
                            <td className="table-td text-xs hidden lg:table-cell tabular-nums">{formatDate(g.lastVisit)}</td>
                            <td className="table-td">
                              <div className="flex items-center justify-end gap-1">
                                <IconBtn title="Xem chi tiết" onClick={() => setSelected(g)}><Eye className="w-4 h-4" /></IconBtn>
                                <div className="relative" ref={menuId === g.id ? menuRef : null}>
                                  <IconBtn title="Thao tác khác" onClick={() => setMenuId(menuId === g.id ? null : g.id)}>
                                    <MoreHorizontal className="w-4 h-4" />
                                  </IconBtn>
                                  {menuId === g.id && (
                                    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-pop z-30 overflow-hidden py-1"
                                      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                                      <MenuItem icon={MessageSquare} label="Nhắn tin" onClick={() => { setMessageTo(g); setMenuId(null); }} />
                                      <MenuItem icon={CalendarCheck} label="Lịch sử đặt phòng" onClick={() => { setHistoryOf(g); setMenuId(null); }} />
                                      <MenuItem icon={Edit2} label="Chỉnh sửa" onClick={() => { setEditing(g); setFormOpen(true); setMenuId(null); }} />
                                      <div className="my-1 h-px" style={{ backgroundColor: "var(--border-soft)" }} />
                                      <MenuItem icon={Trash2} label="Xoá khách" danger onClick={() => { setConfirm(g); setMenuId(null); }} />
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
        </div>

        {/* ── Panel chi tiết ── */}
        <Card title="Chi tiết khách hàng" subtitle={selected ? selected.id : "Chọn khách để xem chi tiết"}
          className="xl:sticky xl:top-[76px] self-start">
          {selected ? (
            <GuestPanel
              guest={selected}
              bookingCount={guestBookings(selected).length}
              onMessage={() => setMessageTo(selected)}
              onHistory={() => setHistoryOf(selected)}
              onEdit={() => { setEditing(selected); setFormOpen(true); }}
            />
          ) : (
            <div className="text-sm text-ink-400 text-center py-16">
              <Users className="w-12 h-12 mx-auto mb-3 text-ink-200" />
              Chọn một khách hàng để xem thông tin chi tiết
            </div>
          )}
        </Card>
      </div>

      {/* ── Form thêm / sửa ── */}
      <GuestForm
        open={formOpen}
        initial={editing}
        existingEmails={list.filter((g) => g.id !== editing?.id).map((g) => g.email.toLowerCase())}
        nationalities={nationalityOptions}
        noteOptions={noteOptions}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={saveGuest}
      />

      {/* ── Lịch sử đặt phòng ── */}
      <Modal open={!!historyOf} onClose={() => setHistoryOf(null)} icon={CalendarCheck}
        title="Lịch sử đặt phòng" subtitle={historyOf ? `${historyOf.name} · ${historyOf.totalBookings} lượt ghi nhận` : ""}
        width="max-w-lg">
        {historyOf && (() => {
          const hist = guestBookings(historyOf);
          if (!hist.length) {
            return (
              <div className="text-center py-10">
                <CalendarCheck className="w-10 h-10 mx-auto text-ink-300 mb-3" />
                <div className="text-[13px] font-semibold text-ink-900">Chưa có booking nào trong hệ thống</div>
                <div className="text-[11.5px] text-ink-500 mt-1">
                  Hồ sơ ghi nhận {historyOf.totalBookings} lượt lưu trú từ dữ liệu lịch sử.
                </div>
              </div>
            );
          }
          return (
            <div className="space-y-2">
              {hist.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-md border border-ink-100 hover:bg-ink-50 transition">
                  <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)" }}>
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold text-ink-900 truncate">{b.branchName}</div>
                    <div className="text-[11px] text-ink-500 truncate">
                      {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.roomTypeName} · {b.nights} đêm
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[12px] font-bold text-ink-900 tabular-nums">{formatVND(b.total)}</div>
                    <div className="text-[10px] text-ink-500">{b.source}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </Modal>

      {/* ── Nhắn tin ── */}
      <MessageModal
        target={messageTo}
        onClose={() => setMessageTo(null)}
        onSend={(channel) => {
          const who = messageTo?.bulk ? `${messageTo.count} khách` : messageTo?.name;
          setMessageTo(null);
          if (messageTo?.bulk) setPicked([]);
          notify(`Đã gửi ${channel} tới ${who}`);
        }}
      />

      {/* ── Xuất ── */}
      <Modal open={exportOpen} onClose={() => setExportOpen(false)} icon={Download}
        title="Xuất danh sách khách"
        subtitle={picked.length > 0 ? `${picked.length} khách đã chọn` : `${filtered.length} khách theo bộ lọc hiện tại`}
        width="max-w-md">
        <div className="space-y-2">
          {[
            { fmt: "CSV", desc: "Mở được bằng Excel / Google Sheets" },
            { fmt: "Excel (.xlsx)", desc: "Giữ định dạng cột và tiền tệ" },
            { fmt: "vCard (.vcf)", desc: "Nhập vào danh bạ điện thoại" },
          ].map((f) => (
            <button key={f.fmt}
              onClick={() => { const n = picked.length || filtered.length; setExportOpen(false); notify(`Đang chuẩn bị ${f.fmt} · ${n} khách`); }}
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
        title="Xoá khách hàng?" subtitle={confirm?.name} width="max-w-md"
        footer={
          <>
            <button onClick={() => setConfirm(null)} className="btn-outline">Huỷ</button>
            <button onClick={() => removeGuest(confirm)} className="px-3 py-2 rounded-md text-[12.5px] font-bold"
              style={{ backgroundColor: "var(--danger)", color: "var(--on-accent)" }}>
              Xoá vĩnh viễn
            </button>
          </>
        }>
        <p className="text-[12.5px] text-ink-700 leading-relaxed">
          Hồ sơ <strong className="text-ink-900">{confirm?.name}</strong> cùng {confirm?.totalBookings} lượt lưu trú
          và {confirm ? formatVND(confirm.totalSpent) : ""} chi tiêu sẽ bị gỡ khỏi danh sách.
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

/* ═══════════ PANEL CHI TIẾT ═══════════ */

function GuestPanel({ guest: g, bookingCount, onMessage, onHistory, onEdit }) {
  const v = toneVars(TIER_MAP[g.tier]?.tone || "neutral");
  const avgSpend = g.totalBookings > 0 ? Math.round(g.totalSpent / g.totalBookings) : 0;
  const months = monthsBetween(g.lastVisit, TODAY);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-3 rounded-xl border"
        style={{ backgroundColor: v.soft, borderColor: v.border }}>
        <img src={g.avatar} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-4 shadow-md shrink-0"
          style={{ borderColor: v.solid, "--tw-ring-color": "var(--surface)" }} />
        <div className="min-w-0">
          <div className="font-display font-bold text-ink-900 text-base truncate">{g.name}</div>
          <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
            style={{ backgroundColor: "var(--surface)", color: v.fg, borderColor: v.border }}>
            {TIER_MAP[g.tier]?.emoji}{g.tier}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 text-[13px] p-3 rounded-lg border border-ink-100">
        <a href={`tel:${g.phone}`} className="flex items-center gap-2.5 text-ink-700 hover:underline">
          <Phone className="w-4 h-4 text-ink-400 shrink-0" /><span className="font-mono">{g.phone}</span>
        </a>
        <a href={`mailto:${g.email}`} className="flex items-center gap-2.5 text-ink-700 hover:underline min-w-0">
          <Mail className="w-4 h-4 text-ink-400 shrink-0" /><span className="truncate">{g.email}</span>
        </a>
        <div className="flex items-center gap-2.5 text-ink-700">
          <Globe className="w-4 h-4 text-ink-400 shrink-0" />
          <span>Quốc tịch: <span className="font-semibold text-ink-900">{g.nationality}</span></span>
        </div>
        <div className="flex items-center gap-2.5 text-ink-700">
          <CalendarCheck className="w-4 h-4 text-ink-400 shrink-0" />
          <span>Ghé gần nhất: <span className="font-semibold text-ink-900">{formatDate(g.lastVisit)}</span>
            <span className="text-ink-500"> ({months < 1 ? "dưới 1 tháng" : `${Math.round(months)} tháng trước`})</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Tổng booking" value={g.totalBookings} sub={`${bookingCount} trong hệ thống`} />
        <Stat label="Tổng chi tiêu" value={formatVND(g.totalSpent)} sub={`TB ${formatVND(avgSpend)}/lượt`} />
      </div>

      {Array.isArray(g.notes) && g.notes.length > 0 && (
        <div className="p-3 rounded-lg border" style={{ backgroundColor: "var(--warning-soft)", borderColor: "var(--warning-border)" }}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--warning-fg)" }}>
            Ghi chú đặc biệt
          </div>
          <div className="flex flex-wrap gap-1.5">
            {g.notes.map((n) => (
              <span key={n} className="text-[10.5px] font-bold px-2 py-0.5 rounded-full border"
                style={{ backgroundColor: "var(--surface)", color: "var(--warning-fg)", borderColor: "var(--warning-border)" }}>
                {n}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1 flex-wrap">
        <button onClick={onMessage} className="btn-primary flex-1 min-w-[130px] justify-center">
          <MessageSquare className="w-4 h-4" /> Nhắn tin
        </button>
        <button onClick={onHistory} className="btn-outline flex-1 min-w-[110px] justify-center">
          <CalendarCheck className="w-4 h-4" /> Lịch sử
        </button>
        <button onClick={onEdit} className="btn-outline justify-center" title="Chỉnh sửa" aria-label="Chỉnh sửa khách">
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="p-3 rounded-lg border" style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold">{label}</div>
      <div className="text-xl font-bold font-display text-ink-900 mt-0.5 tabular-nums break-all">{value}</div>
      {sub && <div className="text-[10px] text-ink-500 mt-1 truncate">{sub}</div>}
    </div>
  );
}

/* ═══════════ NHẮN TIN ═══════════ */

function MessageModal({ target, onClose, onSend }) {
  const [channel, setChannel] = useState("Email");
  const [text, setText] = useState("");

  useEffect(() => {
    if (target) { setChannel("Email"); setText(""); }
  }, [target]);

  if (!target) return null;
  const bulk = !!target.bulk;

  return (
    <Modal open={!!target} onClose={onClose} icon={MessageSquare}
      title={bulk ? "Gửi tin hàng loạt" : `Nhắn tin cho ${target.name}`}
      subtitle={bulk ? `${target.count} khách đã chọn` : target.email}
      width="max-w-lg"
      footer={
        <>
          <button onClick={onClose} className="btn-outline">Huỷ</button>
          <button onClick={() => onSend(channel)} disabled={!text.trim()}
            className="btn-primary disabled:opacity-45 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" /> Gửi {channel}
          </button>
        </>
      }>
      <div className="space-y-3">
        <div>
          <div className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500 mb-1.5">Kênh gửi</div>
          <div className="flex flex-wrap gap-1.5">
            {["Email", "SMS", "Zalo"].map((c) => (
              <Chip key={c} on={channel === c} onClick={() => setChannel(c)}>{c}</Chip>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500 mb-1.5">Mẫu có sẵn</div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { l: "Cảm ơn", t: "Cảm ơn quý khách đã lựa chọn Condo HUB. Rất mong được đón tiếp quý khách lần sau!" },
              { l: "Ưu đãi", t: "Condo HUB gửi tặng quý khách mã giảm 15% cho kỳ nghỉ tiếp theo. Áp dụng đến hết tháng này." },
              { l: "Mời đánh giá", t: "Quý khách vui lòng dành 1 phút đánh giá trải nghiệm vừa qua để chúng tôi phục vụ tốt hơn." },
            ].map((tpl) => (
              <Chip key={tpl.l} on={text === tpl.t} onClick={() => setText(tpl.t)}>{tpl.l}</Chip>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="msg-body" className="block text-[11px] font-semibold text-ink-600 mb-1">Nội dung</label>
          <textarea id="msg-body" rows={5} value={text} onChange={(e) => setText(e.target.value)}
            className="input resize-y" placeholder="Nhập nội dung tin nhắn…" />
          <div className="mt-1 text-[10.5px] text-ink-400">{text.length} ký tự</div>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════ FORM THÊM / SỬA ═══════════ */

const BLANK = {
  name: "", email: "", phone: "", nationality: "Việt Nam", tier: "Thường",
  totalBookings: 0, totalSpent: "", lastVisit: TODAY, branchId: "",
  avatar: "https://i.pravatar.cc/100?img=5", notes: [],
};

function GuestForm({ open, initial, existingEmails = [], nationalities = [], noteOptions = [], onClose, onSubmit }) {
  const [v, setV] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({}); setTouched(false);
    setV(initial
      ? { ...BLANK, ...initial, totalSpent: String(initial.totalSpent ?? ""), totalBookings: String(initial.totalBookings ?? 0), notes: initial.notes || [] }
      : { ...BLANK, branchId: branches[0]?.id || "" });
  }, [open, initial]);

  const set = (k, val) => setV((s) => ({ ...s, [k]: val }));

  /* Hạng thẻ gợi ý theo số lượt lưu trú — cùng công thức với dữ liệu gốc */
  const suggestedTier = useMemo(() => {
    const n = Number(v.totalBookings) || 0;
    return TIERS[Math.min(TIERS.length - 1, Math.floor(n / 3))].key;
  }, [v.totalBookings]);

  const validate = (s) => {
    const e = {};
    if (!s.name.trim()) e.name = "Bắt buộc nhập họ tên";
    else if (s.name.trim().length < 2) e.name = "Họ tên quá ngắn";

    const email = s.email.trim().toLowerCase();
    if (!email) e.email = "Bắt buộc nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email chưa đúng định dạng";
    else if (existingEmails.includes(email)) e.email = "Email này đã có trong danh sách khách";

    if (!s.phone.trim()) e.phone = "Bắt buộc nhập số điện thoại";
    else if (!/^0\d{9}$/.test(s.phone.trim())) e.phone = "SĐT gồm 10 số, bắt đầu bằng 0";

    if (!s.nationality.trim()) e.nationality = "Bắt buộc nhập quốc tịch";
    if (!s.lastVisit) e.lastVisit = "Chọn ngày ghé gần nhất";
    else if (s.lastVisit > TODAY) e.lastVisit = "Không thể ở tương lai";

    const nb = Number(s.totalBookings);
    if (!Number.isInteger(nb) || nb < 0 || nb > 500) e.totalBookings = "Số booking từ 0 đến 500";

    if (s.totalSpent !== "" && Number(s.totalSpent) < 0) e.totalSpent = "Chi tiêu không thể âm";
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(v);
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`g-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    onSubmit({
      ...v,
      name: v.name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      nationality: v.nationality.trim(),
      totalBookings: Number(v.totalBookings),
      totalSpent: v.totalSpent === "" ? 0 : Number(v.totalSpent),
    });
  };

  const err = (k) => (touched ? errors[k] : undefined);

  return (
    <Modal open={open} onClose={onClose} icon={initial ? Edit2 : Plus}
      title={initial ? "Chỉnh sửa khách hàng" : "Thêm khách hàng"}
      subtitle={initial ? `${initial.id} · ${initial.name}` : "Các trường có dấu * là bắt buộc"}
      width="max-w-2xl"
      footer={
        <>
          {touched && Object.keys(errors).length > 0 && (
            <span className="mr-auto text-[12px] font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--danger-fg)" }}>
              <AlertCircle className="w-3.5 h-3.5" /> Còn {Object.keys(errors).length} trường chưa hợp lệ
            </span>
          )}
          <button type="button" onClick={onClose} className="btn-outline">Huỷ</button>
          <button type="submit" form="guest-form" className="btn-primary">
            <Check className="w-4 h-4" /> {initial ? "Lưu thay đổi" : "Thêm khách"}
          </button>
        </>
      }>
      <form id="guest-form" onSubmit={submit} noValidate className="space-y-5">
        <Section title="Thông tin liên hệ" icon={Users}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Họ và tên" required error={err("name")} id="g-name">
              <input id="g-name" className="input" value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Nguyễn Thị B" />
            </Field>
            <Field label="Quốc tịch" required error={err("nationality")} id="g-nationality">
              <input id="g-nationality" className="input" list="nat-list" value={v.nationality}
                onChange={(e) => set("nationality", e.target.value)} />
              <datalist id="nat-list">{nationalities.map((n) => <option key={n} value={n} />)}</datalist>
            </Field>
            <Field label="Email" required error={err("email")} id="g-email">
              <input id="g-email" className="input" inputMode="email" value={v.email}
                onChange={(e) => set("email", e.target.value)} placeholder="ten@email.vn" />
            </Field>
            <Field label="Số điện thoại" required error={err("phone")} id="g-phone">
              <input id="g-phone" className="input" inputMode="tel" value={v.phone}
                onChange={(e) => set("phone", e.target.value)} placeholder="0912345678" />
            </Field>
          </div>
        </Section>

        <Section title="Lịch sử & hạng thẻ" icon={Wallet}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Số lượt lưu trú" required error={err("totalBookings")} id="g-totalBookings">
              <input id="g-totalBookings" type="number" min="0" max="500" className="input" value={v.totalBookings}
                onChange={(e) => set("totalBookings", e.target.value)} />
            </Field>
            <Field label="Tổng chi tiêu (VNĐ)" error={err("totalSpent")} id="g-totalSpent" hint="Bỏ trống = 0">
              <input id="g-totalSpent" type="number" min="0" step="1000000" className="input" value={v.totalSpent}
                onChange={(e) => set("totalSpent", e.target.value)} placeholder="24000000" />
            </Field>
            <Field label="Ghé gần nhất" required error={err("lastVisit")} id="g-lastVisit">
              <input id="g-lastVisit" type="date" max={TODAY} className="input" value={v.lastVisit}
                onChange={(e) => set("lastVisit", e.target.value)} />
            </Field>
            <Field className="sm:col-span-2" label="Hạng thẻ" required id="g-tier"
              hint={suggestedTier !== v.tier ? `Theo ${v.totalBookings || 0} lượt lưu trú, hạng gợi ý là “${suggestedTier}”` : "Khớp với số lượt lưu trú"}>
              <div className="flex gap-2">
                <select id="g-tier" className="input" value={v.tier} onChange={(e) => set("tier", e.target.value)}>
                  {TIERS.map((t) => <option key={t.key} value={t.key}>{t.key}</option>)}
                </select>
                {suggestedTier !== v.tier && (
                  <button type="button" onClick={() => set("tier", suggestedTier)} className="btn-outline shrink-0 whitespace-nowrap">
                    Dùng gợi ý
                  </button>
                )}
              </div>
            </Field>
            <Field label="Chi nhánh gắn với khách" id="g-branchId">
              <select id="g-branchId" className="input" value={v.branchId} onChange={(e) => set("branchId", e.target.value)}>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Ghi chú đặc biệt" icon={AlertCircle}>
          <div className="flex flex-wrap gap-1.5">
            {noteOptions.map((n) => {
              const on = v.notes.includes(n);
              return (
                <Chip key={n} on={on} onClick={() => set("notes", on ? v.notes.filter((x) => x !== n) : [...v.notes, n])}>
                  {n}
                </Chip>
              );
            })}
          </div>
          <div className="text-[11px] text-ink-500 mt-2">Đã chọn {v.notes.length}/{noteOptions.length}</div>
        </Section>
      </form>
    </Modal>
  );
}

/* ═══════════ UI nhỏ ═══════════ */

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
    <button type="button" onClick={onClick} aria-pressed={on}
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
