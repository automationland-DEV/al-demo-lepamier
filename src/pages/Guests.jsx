import { useState, useMemo, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";
import { guests, branches } from "../data/mockData";
import { formatVND, formatDate } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import Pagination from "../components/Pagination";

const { Users, Search, Plus, Filter, MoreHorizontal, Phone, Mail, Star, Download, MessageSquare, Eye } = Icons;

const TIER_COLORS = {
  "Thường": "bg-ink-100 text-ink-700 border border-ink-200",
  "Bạc": "bg-slate-200 text-slate-800 border border-slate-300",
  "Vàng": "bg-amber-100 text-amber-700 border border-amber-200",
  "Bạch kim": "bg-violet-100 text-violet-700 border border-violet-200",
  "Kim cương": "bg-rose-100 text-rose-700 border border-rose-200",
};

export default function Guests() {
  const { activeBranchId, activeBranch, isAll } = useActiveBranch();
  const [tierFilter, setTierFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Lọc theo branch toàn cục
  const scopedGuests = useMemo(
    () => (isAll ? guests : guests.filter((g) => g.branchId === activeBranchId)),
    [activeBranchId, isAll]
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tierFilter, search, activeBranchId]);

  const filtered = useMemo(() => {
    return scopedGuests.filter((g) => {
      if (tierFilter !== "all" && g.tier !== tierFilter) return false;
      if (search && !`${g.name} ${g.email} ${g.phone}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [scopedGuests, tierFilter, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginatedGuests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Set default selected guest
  useEffect(() => {
    if (paginatedGuests.length > 0) {
      // Keep previous selected if it is still in the list, otherwise select first of current page
      const exists = paginatedGuests.some((g) => g.id === selected?.id);
      if (!exists) {
        setSelected(paginatedGuests[0]);
      }
    } else {
      setSelected(null);
    }
  }, [paginatedGuests]);

  const tierStats = ["Thường", "Bạc", "Vàng", "Bạch kim", "Kim cương"].map((t) => ({
    tier: t,
    count: scopedGuests.filter((g) => g.tier === t).length,
  }));

  return (
    <div>
      <PageHeader
        title="Quản lý khách hàng"
        subtitle={`${scopedGuests.length} khách ${isAll ? "trong hệ thống" : `tại ${activeBranch?.name}`} · Chương trình thẻ thành viên 5 hạng`}
        actions={
          <>
            <button className="btn-outline"><Download className="w-4 h-4" /> Xuất CSV</button>
            <button className="btn-primary"><Plus className="w-4 h-4" /> Thêm khách</button>
          </>
        }
      />

      {/* Tier cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {tierStats.map((t) => {
          const isActive = tierFilter === t.tier;
          const activeBg = 
            t.tier === "Kim cương" ? "bg-rose-50 border-rose-400 ring-2 ring-rose-100" :
            t.tier === "Bạch kim" ? "bg-violet-50 border-violet-400 ring-2 ring-violet-100" :
            t.tier === "Vàng" ? "bg-amber-50 border-amber-400 ring-2 ring-amber-100" :
            t.tier === "Bạc" ? "bg-slate-100 border-slate-400 ring-2 ring-slate-200" :
            "bg-ink-50 border-ink-400 ring-2 ring-ink-100";
            
          return (
            <button
              key={t.tier}
              onClick={() => setTierFilter(tierFilter === t.tier ? "all" : t.tier)}
              className={`card p-3 sm:p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                isActive ? activeBg : "bg-white border-ink-200 hover:shadow-md hover:border-brand-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Star className={`w-4 h-4 ${
                  t.tier === "Kim cương" ? "fill-rose-400 text-rose-400" :
                  t.tier === "Bạch kim" ? "fill-violet-400 text-violet-400" :
                  t.tier === "Vàng" ? "fill-amber-400 text-amber-400" :
                  t.tier === "Bạc" ? "fill-slate-400 text-slate-400" :
                  "fill-ink-300 text-ink-300"
                }`} />
                <div className="text-[10px] font-bold uppercase tracking-wide text-ink-500 truncate">
                  {t.tier}
                </div>
              </div>
              <div className="text-2xl font-extrabold font-display leading-none mt-1.5">{t.count}</div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại…"
            className="input pl-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Card>
            <div className="overflow-x-auto -mx-3 sm:-mx-5">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th className="table-th">Khách hàng</th>
                    <th className="table-th hidden md:table-cell">Quốc tịch</th>
                    <th className="table-th">Hạng</th>
                    <th className="table-th text-center hidden sm:table-cell">Bookings</th>
                    <th className="table-th text-right">Chi tiêu</th>
                    <th className="table-th hidden lg:table-cell">Lần cuối</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGuests.map((g) => (
                    <tr
                      key={g.id}
                      onClick={() => setSelected(g)}
                      className={`hover:bg-brand-50/20 border-b border-ink-100 transition-all cursor-pointer ${
                        selected?.id === g.id ? "bg-brand-50/40 font-medium" : ""
                      }`}
                    >
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <img src={g.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-ink-200" />
                          <div className="min-w-0">
                            <div className="font-semibold text-ink-900 truncate">{g.name}</div>
                            <div className="text-xs text-ink-500 truncate">{g.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-xs hidden md:table-cell">{g.nationality}</td>
                      <td className="table-td">
                        <span className={`badge ${TIER_COLORS[g.tier]}`}>
                          {g.tier === "Kim cương" && "💎 "}
                          {g.tier}
                        </span>
                      </td>
                      <td className="table-td text-center font-bold hidden sm:table-cell">{g.totalBookings}</td>
                      <td className="table-td text-right font-extrabold text-ink-900">{formatVND(g.totalSpent)}</td>
                      <td className="table-td text-xs hidden lg:table-cell">{formatDate(g.lastVisit)}</td>
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
        </div>

        {/* Detail panel */}
        <Card title="Chi tiết khách hàng" subtitle={selected ? selected.id : "Chọn khách để xem chi tiết"}>
          {selected ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-3 bg-gradient-to-br from-ink-50 to-ink-100/50 rounded-xl border border-ink-200">
                <img src={selected.avatar} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-4 ring-white shadow-md shrink-0" />
                <div className="min-w-0">
                  <div className="font-display font-bold text-ink-900 text-base truncate">{selected.name}</div>
                  <span className={`badge ${TIER_COLORS[selected.tier]} mt-1.5 px-2.5 py-0.5 rounded-full font-bold shadow-sm`}>
                    {selected.tier === "Kim cương" && "💎 "}
                    {selected.tier}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 text-[13px] bg-white p-3 rounded-lg border border-ink-100 shadow-sm">
                <div className="flex items-center gap-2.5 text-ink-700">
                  <Phone className="w-4 h-4 text-ink-400 shrink-0" /> 
                  <span className="font-mono">{selected.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-ink-700">
                  <Mail className="w-4 h-4 text-ink-400 shrink-0" /> 
                  <span className="truncate">{selected.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-ink-700">
                  <Users className="w-4 h-4 text-ink-400 shrink-0" /> 
                  <span>Quốc tịch: <span className="font-semibold text-ink-900">{selected.nationality}</span></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="card p-3 !shadow-none bg-ink-50 border border-ink-100 rounded-lg text-center sm:text-left">
                  <div className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold">Tổng booking</div>
                  <div className="text-xl font-bold font-display text-ink-900 mt-0.5">{selected.totalBookings}</div>
                </div>
                <div className="card p-3 !shadow-none bg-ink-50 border border-ink-100 rounded-lg text-center sm:text-left">
                  <div className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold">Tổng chi tiêu</div>
                  <div className="text-xl font-bold font-display text-ink-900 mt-0.5 break-all">{formatVND(selected.totalSpent)}</div>
                </div>
              </div>

              {Array.isArray(selected.notes) && selected.notes.length > 0 && (
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-2">Ghi chú đặc biệt</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.notes.map((n) => (
                      <span key={n} className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 flex-wrap">
                <button className="btn-primary flex-1 min-w-[140px] justify-center shadow-sm"><MessageSquare className="w-4 h-4" /> Nhắn tin</button>
                <button className="btn-outline flex-1 min-w-[120px] justify-center shadow-sm">Lịch sử</button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-ink-400 text-center py-16">
              <Users className="w-12 h-12 mx-auto mb-3 text-ink-200" />
              Chọn một khách hàng để xem thông tin chi tiết
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}