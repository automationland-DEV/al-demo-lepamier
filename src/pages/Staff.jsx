import { useState, useMemo, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";
import { staff, branches } from "../data/mockData";
import { formatVND } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import Pagination from "../components/Pagination";

const {
  UserCog, Search, Filter, Plus, MoreHorizontal, Phone, Mail, Star,
  Briefcase, Download, MapPin, ChevronDown, LayoutGrid, List, Building2,
} = Icons;

const ROLE_MAP = {
  manager: { label: "Quản lý", color: "bg-violet-100 text-violet-700", accent: "violet" },
  reception: { label: "Lễ tân", color: "bg-blue-100 text-blue-700", accent: "blue" },
  housekeeping: { label: "Buồng phòng", color: "bg-cyan-100 text-cyan-700", accent: "cyan" },
  fnb: { label: "Ẩm thực", color: "bg-amber-100 text-amber-700", accent: "amber" },
  security: { label: "An ninh", color: "bg-rose-100 text-rose-700", accent: "rose" },
  maintenance: { label: "Kỹ thuật", color: "bg-slate-100 text-slate-700", accent: "ink" },
  accountant: { label: "Kế toán", color: "bg-ink-100 text-ink-700", accent: "ink" },
};

const ROLE_ICON = {
  manager: UserCog, reception: Briefcase, housekeeping: Building2,
  fnb: Star, security: UserCog, maintenance: Briefcase, accountant: Briefcase,
};

const TODAY = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function Staff() {
  const { activeBranchId } = useActiveBranch();
  const [branchFilter, setBranchFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setBranchFilter(activeBranchId === "ALL" ? "all" : activeBranchId);
  }, [activeBranchId]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [branchFilter, roleFilter, statusFilter, search]);

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
  }), [staff, branchFilter, roleFilter, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const safeStaff = Array.isArray(staff) ? staff : [];

  const stats = useMemo(() => ({
    total: safeStaff.length,
    active: safeStaff.filter((s) => s?.status === "active").length,
    leave: safeStaff.filter((s) => s?.status === "leave").length,
    branches: new Set(safeStaff.map((s) => s?.branchId).filter(Boolean)).size,
    avgSalary: safeStaff.reduce((sum, s) => sum + (s?.salary || 0), 0) / Math.max(safeStaff.length, 1),
    roles: new Set(safeStaff.map((s) => s?.role).filter(Boolean)).size,
  }), [safeStaff]);

  const roleStats = Object.keys(ROLE_MAP || {}).map((key) => ({
    key,
    label: ROLE_MAP[key]?.label || key,
    count: safeStaff.filter((s) => s?.role === key).length,
  })).filter((r) => r.count > 0);

  return (
    <div>
      {/* ── HERO ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-md bg-gradient-to-br from-violet-900 via-violet-800 to-violet-700 text-white shadow-sm">
        <div className="absolute inset-0 opacity-[0.07] bg-soft-grid" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative px-4 py-5 sm:px-6 flex items-start justify-between gap-4 sm:gap-6 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/70 font-semibold flex-wrap">
              <UserCog className="w-3.5 h-3.5" />
              Nhân sự · Quản lý
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                <span className="relative flex w-2 h-2 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-emerald-300 opacity-70 animate-ping" style={{ animationDuration: "1.8s" }} />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_4px_1px_rgba(110,231,183,0.7)]" />
                </span>
                LIVE
              </span>
            </div>
            <h1 className="font-display font-bold text-[22px] sm:text-[28px] leading-tight mt-1 truncate">
              Quản lý nhân viên
            </h1>
            <p className="text-[13px] text-white/80 mt-1 max-w-2xl">
              Theo dõi hồ sơ, ca làm và hiệu suất nhân sự toàn hệ thống.
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {[
                { label: "Chốt ngày", value: TODAY },
                { label: "Tổng NV", value: stats.total },
                { label: "Đang làm", value: stats.active },
                { label: "Chi nhánh", value: stats.branches },
                { label: "Vai trò", value: stats.roles },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded px-2 py-1">
                  <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">{m.label}</span>
                  <span className="text-[12px] font-semibold tabular-nums">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-[12.5px] font-semibold flex items-center gap-2 transition">
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Xuất danh sách</span><span className="sm:hidden">Xuất</span>
            </button>
            <button className="px-3 py-2 rounded-md bg-white text-violet-700 hover:bg-violet-50 text-[12.5px] font-bold flex items-center gap-2 transition shadow-sm">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Tuyển nhân viên</span><span className="sm:hidden">Tuyển</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI STRIP ──────────────────────────────────── */}
      <div className="bg-white border border-ink-200 rounded-md py-5 px-1 grid grid-cols-2 md:grid-cols-4 gap-y-4 items-stretch mt-5">
        <div className="md:border-r md:border-ink-100 px-2 sm:px-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-[10px] uppercase tracking-wider text-ink-500 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            Tổng nhân viên
          </div>
          <div className="text-[22px] font-display font-bold text-ink-900 tabular-nums mt-1.5 leading-none">
            {stats.total}
          </div>
          <div className="text-[10px] text-ink-500 mt-1">{stats.branches} chi nhánh</div>
        </div>
        <div className="md:border-r md:border-ink-100 px-2 sm:px-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-[10px] uppercase tracking-wider text-ink-500 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đang làm việc
          </div>
          <div className="text-[22px] font-display font-bold text-emerald-600 tabular-nums mt-1.5 leading-none">
            {stats.active}
          </div>
          <div className="text-[10px] text-ink-500 mt-1">
            {stats.total > 0 ? Math.round(stats.active / stats.total * 100) : 0}% tổng số
          </div>
        </div>
        <div className="md:border-r md:border-ink-100 px-2 sm:px-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-[10px] uppercase tracking-wider text-ink-500 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Nghỉ phép
          </div>
          <div className="text-[22px] font-display font-bold text-amber-600 tabular-nums mt-1.5 leading-none">
            {stats.leave}
          </div>
          <div className="text-[10px] text-ink-500 mt-1">Cần phân ca thay</div>
        </div>
        <div className="px-2 sm:px-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-[10px] uppercase tracking-wider text-ink-500 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Lương TB
          </div>
          <div className="text-[18px] sm:text-[22px] font-display font-bold text-ink-900 tabular-nums mt-1.5 leading-none break-all">
            {formatVND(stats.avgSalary)}
          </div>
          <div className="text-[10px] text-ink-500 mt-1">/ tháng</div>
        </div>
      </div>

      {/* ── FILTER BAR ─────────────────────────────────── */}
      <Card className="mt-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SĐT hoặc email…"
              className="w-full pl-10 pr-3 py-2 text-[13px] bg-ink-50 border border-ink-200 rounded-md focus:outline-none focus:border-violet-500 focus:bg-white transition"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full sm:w-auto pl-9 pr-8 py-2 text-[13px] bg-white border border-ink-200 rounded-md focus:outline-none focus:border-violet-500 appearance-none cursor-pointer"
            >
              <option value="all">Tất cả chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>
          <div className="relative w-full sm:w-auto">
            <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto pl-9 pr-8 py-2 text-[13px] bg-white border border-ink-200 rounded-md focus:outline-none focus:border-violet-500 appearance-none cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              {Object.keys(ROLE_MAP).map((k) => (
                <option key={k} value={k}>{ROLE_MAP[k].label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>
          <div className="inline-flex bg-ink-50 border border-ink-200 rounded-md p-0.5">
            {[
              { key: "all", label: "Tất cả" },
              { key: "active", label: "Đang làm" },
              { key: "leave", label: "Nghỉ phép" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`px-3 py-1.5 text-[12px] font-semibold rounded transition ${
                  statusFilter === s.key
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-ink-600 hover:text-violet-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="ml-auto inline-flex bg-ink-50 border border-ink-200 rounded-md p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 rounded text-[12px] font-semibold flex items-center gap-1.5 transition ${
                view === "grid" ? "bg-violet-700 text-white shadow-sm" : "text-ink-600 hover:text-violet-700"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Thẻ
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 rounded text-[12px] font-semibold flex items-center gap-1.5 transition ${
                view === "table" ? "bg-violet-700 text-white shadow-sm" : "text-ink-600 hover:text-violet-700"
              }`}
            >
              <List className="w-3.5 h-3.5" /> Bảng
            </button>
          </div>
        </div>
      </Card>

      {/* ── ROLE CHIPS ─────────────────────────────────── */}
      <div className="flex items-center gap-4 mt-5 overflow-x-auto pb-1.5">
        <button
          onClick={() => setRoleFilter("all")}
          className={`shrink-0 px-6 py-2 rounded-full text-[11.5px] font-bold border transition-all duration-200 ${
            roleFilter === "all"
              ? "bg-violet-700 text-white border-violet-700 shadow-md transform -translate-y-0.5"
              : "bg-white text-ink-700 border-ink-200 hover:border-violet-300 hover:text-violet-700 hover:shadow-sm"
          }`}
        >
          Tất cả vai trò · {staff.length}
        </button>
        {roleStats.map((r) => {
          const isActive = roleFilter === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setRoleFilter(roleFilter === r.key ? "all" : r.key)}
              className={`shrink-0 px-6 py-2 rounded-full text-[11.5px] font-bold border transition-all duration-200 ${
                isActive
                  ? "bg-violet-700 text-white border-violet-700 shadow-md transform -translate-y-0.5"
                  : "bg-white text-ink-700 border-ink-200 hover:border-violet-300 hover:text-violet-700 hover:shadow-sm"
              }`}
            >
              {r.label} · {r.count}
            </button>
          );
        })}
      </div>

      {/* ── RESULT META ────────────────────────────────── */}
      <div className="flex items-center justify-between mt-6 mb-3">
        <div className="text-[12px] text-ink-500">
          Hiển thị <strong className="text-ink-900 tabular-nums">{Math.min(filtered.length, pageSize)}</strong> / {filtered.length} nhân viên
          {(roleFilter !== "all" || branchFilter !== "all" || search || statusFilter !== "all") && (
            <button
              onClick={() => { setRoleFilter("all"); setBranchFilter("all"); setSearch(""); setStatusFilter("all"); }}
              className="ml-2 text-violet-700 font-semibold hover:underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* ── LIST ───────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-ink-400 text-[13px]">Không tìm thấy nhân viên phù hợp với bộ lọc hiện tại.</div>
        </Card>
      ) : view === "grid" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedStaff.map((s) => {
              const Icon = ROLE_ICON[s.role] || UserCog;
              const roleAccentColor = 
                s.role === "manager" ? "#8b5cf6" : 
                s.role === "reception" ? "#3b82f6" : 
                s.role === "housekeeping" ? "#06b6d4" : 
                s.role === "fnb" ? "#f59e0b" : 
                s.role === "security" ? "#f43f5e" : 
                "#64748b";

              return (
                <div
                  key={s.id}
                  className="bg-white border border-ink-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: roleAccentColor }} />
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center shrink-0 border border-violet-100 shadow-sm">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-ink-900 text-[13.5px] truncate">{s.name}</div>
                        <button className="text-ink-400 hover:text-violet-700 opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-ink-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 ${ROLE_MAP[s.role]?.color}`}>
                        {ROLE_MAP[s.role]?.label}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3.5 space-y-1.5 text-[11.5px] text-ink-600 bg-ink-50/50 p-2.5 rounded-lg border border-ink-100/50">
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                      <span className="tabular-nums font-mono">{s.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  </div>
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-ink-500 font-semibold">Chi nhánh</div>
                      <div className="font-bold text-ink-900 truncate mt-0.5">{s.branchName?.split(" ").slice(-1)[0] || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-ink-500 font-semibold">Ca làm việc</div>
                      <div className="font-bold text-ink-900 truncate mt-0.5">{s.shift?.split(" ")[1] || s.shift?.split(" ")[0]}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      s.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-250"
                        : "bg-amber-50 text-amber-700 border border-amber-250"
                    }`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                        s.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                      {s.status === "active" ? "Đang làm" : "Nghỉ phép"}
                    </span>
                    {s.rating && (
                      <div className="text-[11.5px] font-extrabold text-amber-600 flex items-center gap-1 tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-amber-450 text-amber-450" />
                        {s.rating}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
            itemsPerPage={pageSize}
          />
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto -mx-3 sm:-mx-5">
            <table className="w-full text-[12.5px] min-w-[640px]">
              <thead>
                <tr className="text-left text-ink-500 uppercase tracking-wider text-[10px] bg-ink-50">
                  <th className="px-5 py-3 font-semibold border-b border-ink-200">Nhân viên</th>
                  <th className="px-5 py-3 font-semibold hidden sm:table-cell border-b border-ink-200">Vai trò</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell border-b border-ink-200">Chi nhánh</th>
                  <th className="px-5 py-3 font-semibold hidden lg:table-cell border-b border-ink-200">Liên hệ</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell border-b border-ink-200">Ca làm</th>
                  <th className="px-5 py-3 font-semibold text-right border-b border-ink-200">Lương</th>
                  <th className="px-5 py-3 font-semibold text-center border-b border-ink-200">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStaff.map((s, i) => (
                  <tr key={s.id} className={`border-b border-ink-100 hover:bg-brand-50/20 transition-all ${i % 2 ? "bg-ink-50/20" : ""}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center shrink-0 border border-violet-100 shadow-sm">
                          <UserCog className="w-4 h-4" strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-ink-900 truncate">{s.name}</div>
                          <div className="text-[10px] text-ink-500 hidden sm:block">Gia nhập {s.joinedAt}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ROLE_MAP[s.role]?.color}`}>
                        {ROLE_MAP[s.role]?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-700 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-ink-400" />
                        {s.branchName}
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <div className="text-[11px] flex items-center gap-1.5 text-ink-700">
                        <Phone className="w-3 h-3 text-ink-400" />
                        <span className="tabular-nums font-mono">{s.phone}</span>
                      </div>
                      <div className="text-[11px] flex items-center gap-1.5 text-ink-500 truncate mt-0.5">
                        <Mail className="w-3 h-3 text-ink-400" />
                        <span className="truncate max-w-[180px]">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[11.5px] text-ink-700 hidden md:table-cell">{s.shift}</td>
                    <td className="px-5 py-3 text-right font-extrabold tabular-nums text-ink-900">{formatVND(s.salary)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        s.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-250"
                          : "bg-amber-50 text-amber-700 border border-amber-250"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {s.status === "active" ? "Đang làm" : "Nghỉ phép"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
            itemsPerPage={pageSize}
          />
        </Card>
      )}
    </div>
  );
}