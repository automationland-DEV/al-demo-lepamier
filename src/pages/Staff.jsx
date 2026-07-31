import { useState, useMemo, useEffect } from "react";
import { Icons } from "../components/Icons";
import { staff, branches } from "../data/mockData";
import { formatVND } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import Pagination from "../components/Pagination";
import { usePalette, TONE } from "../theme/palette";

const {
  Users, UserCheck, Search, Plus, MoreHorizontal, Phone, Mail, Star,
  Download, ChevronDown, LayoutGrid, List, Building2, Clock, Wallet,
  X, Sparkles, TrendingUp,
} = Icons;

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
  const pageSize = 12;

  useEffect(() => {
    setBranchFilter(activeBranchId === "ALL" ? "all" : activeBranchId);
  }, [activeBranchId]);

  useEffect(() => setPage(1), [branchFilter, roleFilter, statusFilter, search]);

  const filtered = useMemo(() => staff.filter((s) => {
    if (branchFilter !== "all" && s.branchId !== branchFilter) return false;
    if (roleFilter !== "all" && s.role !== roleFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) &&
          !s.phone?.includes(q) &&
          !s.email?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [branchFilter, roleFilter, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );

  const stats = useMemo(() => {
    const active = staff.filter((s) => s.status === "active").length;
    return {
      total: staff.length,
      active,
      leave: staff.filter((s) => s.status === "leave").length,
      branches: new Set(staff.map((s) => s.branchId)).size,
      avgSalary: staff.reduce((n, s) => n + (s.salary || 0), 0) / Math.max(staff.length, 1),
      activePct: Math.round((active / staff.length) * 100),
    };
  }, []);

  const roleCounts = useMemo(() => {
    const m = {};
    for (const s of staff) m[s.role] = (m[s.role] || 0) + 1;
    return m;
  }, []);

  const hasFilter = branchFilter !== "all" || roleFilter !== "all" || statusFilter !== "all" || search;
  const clearAll = () => {
    setBranchFilter("all"); setRoleFilter("all"); setStatusFilter("all"); setSearch("");
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
            className="inline-flex items-center gap-2 h-11 px-4 rounded-full text-[13px] font-bold border transition hover:border-indigo-300"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}
          >
            <Download className="w-4 h-4" /> Xuất danh sách
          </button>
          <button
            className="glowbtn inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-bold text-white"
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

        <Segmented
          gradient
          value={view}
          onChange={setView}
          options={[
            { key: "grid", label: "Thẻ", icon: LayoutGrid },
            { key: "table", label: "Bảng", icon: List },
          ]}
        />
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
            {paginated.map((s) => <StaffCard key={s.id} s={s} c={ROLE[s.role]} />)}
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
                  {["Nhân viên", "Vai trò", "Chi nhánh", "Liên hệ", "Ca làm", "Lương", "Đánh giá", "Trạng thái"].map((h, i) => (
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
                        <div className="flex items-center gap-3">
                          <Avatar src={s.avatar} name={s.name} size={36} from={r.from} to={r.to} />
                          <div className="min-w-0">
                            <div className="font-bold truncate" style={{ color: "var(--fg)" }}>{s.name}</div>
                            <div className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>Gia nhập {s.joinedAt}</div>
                          </div>
                        </div>
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

function StaffCard({ s, c }) {
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
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="text-[15.5px] font-extrabold tracking-tight truncate leading-tight"
               style={{ color: "var(--fg)" }}>
            {s.name}
          </div>
          <div className="mt-1.5"><RolePill role={s.role} c={r} /></div>
        </div>
        <button aria-label="Thao tác" title="Thao tác"
                className="p-1.5 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition hover:bg-ink-100"
                style={{ color: "var(--fg-subtle)" }}>
          <MoreHorizontal className="w-4 h-4" />
        </button>
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
