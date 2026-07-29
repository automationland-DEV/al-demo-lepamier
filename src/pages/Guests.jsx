import { useState, useMemo, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";
import { guests, branches } from "../data/mockData";
import { formatVND, formatDate } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";

const { Users, Search, Plus, Filter, MoreHorizontal, Phone, Mail, Star, Download, MessageSquare, Eye } = Icons;

const TIER_COLORS = {
  "Thường": "bg-ink-100 text-ink-700",
  "Bạc": "bg-slate-200 text-slate-800",
  "Vàng": "bg-amber-100 text-amber-700",
  "Bạch kim": "bg-violet-100 text-violet-700",
  "Kim cương": "bg-rose-100 text-rose-700",
};

export default function Guests() {
  const { activeBranchId, activeBranch, isAll } = useActiveBranch();
  const [tierFilter, setTierFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  // Lọc theo branch toàn cục
  const scopedGuests = useMemo(
    () => (isAll ? guests : guests.filter((g) => g.branchId === activeBranchId)),
    [activeBranchId, isAll]
  );

  const filtered = scopedGuests.filter((g) => {
    if (tierFilter !== "all" && g.tier !== tierFilter) return false;
    if (search && !`${g.name} ${g.email} ${g.phone}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
        {tierStats.map((t) => (
          <button
            key={t.tier}
            onClick={() => setTierFilter(tierFilter === t.tier ? "all" : t.tier)}
            className={`card p-3 sm:p-4 text-left transition ${
              tierFilter === t.tier ? "ring-2 ring-brand-500" : "hover:shadow-card"
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
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-500 truncate">
                {t.tier}
              </div>
            </div>
            <div className="text-2xl font-bold font-display">{t.count}</div>
          </button>
        ))}
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
                  {filtered.slice(0, 20).map((g) => (
                    <tr
                      key={g.id}
                      onClick={() => setSelected(g)}
                      className={`hover:bg-ink-50 transition cursor-pointer ${
                        selected?.id === g.id ? "bg-brand-50" : ""
                      }`}
                    >
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <img src={g.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
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
                      <td className="table-td text-center font-semibold hidden sm:table-cell">{g.totalBookings}</td>
                      <td className="table-td text-right font-bold text-ink-900">{formatVND(g.totalSpent)}</td>
                      <td className="table-td text-xs hidden lg:table-cell">{formatDate(g.lastVisit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Detail panel */}
        <Card title="Chi tiết khách hàng" subtitle={selected ? selected.id : "Chọn khách để xem chi tiết"}>
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={selected.avatar} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-4 ring-white shadow" />
                <div className="min-w-0">
                  <div className="font-display font-bold text-ink-900 truncate">{selected.name}</div>
                  <span className={`badge ${TIER_COLORS[selected.tier]}`}>{selected.tier}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-ink-700">
                  <Phone className="w-4 h-4 text-ink-400" /> {selected.phone}
                </div>
                <div className="flex items-center gap-2 text-ink-700">
                  <Mail className="w-4 h-4 text-ink-400" /> {selected.email}
                </div>
                <div className="flex items-center gap-2 text-ink-700">
                  <Users className="w-4 h-4 text-ink-400" /> {selected.nationality}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-ink-100">
                <div className="card p-3 !shadow-none bg-ink-50 border-0">
                  <div className="text-xs text-ink-500">Tổng booking</div>
                  <div className="text-xl font-bold font-display text-ink-900">{selected.totalBookings}</div>
                </div>
                <div className="card p-3 !shadow-none bg-ink-50 border-0">
                  <div className="text-xs text-ink-500">Tổng chi tiêu</div>
                  <div className="text-xl font-bold font-display text-ink-900">{formatVND(selected.totalSpent)}</div>
                </div>
              </div>
              {Array.isArray(selected.notes) && selected.notes.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">Ghi chú</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.notes.map((n) => (
                      <span key={n} className="text-xs px-2 py-1 rounded-md bg-amber-50 text-amber-700">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2 flex-wrap">
                <button className="btn-primary flex-1 min-w-[140px]"><MessageSquare className="w-4 h-4" /> Nhắn tin</button>
                <button className="btn-outline flex-1 min-w-[120px]">Lịch sử</button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-ink-400 text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-3 text-ink-200" />
              Click vào một khách hàng để xem chi tiết
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}