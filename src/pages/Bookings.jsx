import { useState, useMemo, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";
import { bookings, bookingStatusList, branches } from "../data/mockData";
import { formatVND, formatDate } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";

const { CalendarCheck, Search, Filter, Plus, Download, MoreHorizontal, Phone, Mail, Users, ChevronDown, Eye } = Icons;

const STATUS_MAP = bookingStatusList.reduce((acc, s) => {
  acc[s.key] = s;
  return acc;
}, {});

export default function Bookings() {
  const { activeBranchId } = useActiveBranch();
  const [status, setStatus] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");

  // Đồng bộ với global branch switcher
  useEffect(() => {
    setBranchFilter(activeBranchId === "ALL" ? "all" : activeBranchId);
  }, [activeBranchId]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (branchFilter !== "all" && b.branchId !== branchFilter) return false;
      if (search && !`${b.id} ${b.guestName}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [status, branchFilter, search]);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    checkedIn: bookings.filter((b) => b.status === "checked_in").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    revenue: bookings.reduce((s, b) => s + b.total, 0),
  };

  return (
    <div>
      <PageHeader
        title="Quản lý đặt phòng"
        subtitle={`Tổng ${bookings.length} booking · Doanh thu ${formatVND(stats.revenue)} từ các nguồn`}
        actions={
          <>
            <button className="btn-outline"><Download className="w-4 h-4" /> Xuất Excel</button>
            <button className="btn-primary"><Plus className="w-4 h-4" /> Tạo booking</button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {[
          { key: "all", label: "Tất cả", value: stats.total, color: "bg-ink-50 text-ink-700" },
          { key: "pending", label: "Chờ xác nhận", value: stats.pending, color: "bg-amber-50 text-amber-700" },
          { key: "confirmed", label: "Đã xác nhận", value: stats.confirmed, color: "bg-blue-50 text-blue-700" },
          { key: "checked_in", label: "Đang ở", value: stats.checkedIn, color: "bg-blue-50 text-blue-700" },
          { key: "cancelled", label: "Đã hủy", value: stats.cancelled, color: "bg-rose-50 text-rose-700" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStatus(s.key)}
            className={`card p-3 sm:p-4 text-left transition ${
              status === s.key ? "ring-2 ring-brand-500" : "hover:shadow-pop"
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500 truncate">
              {s.label}
            </div>
            <div className="text-xl sm:text-2xl font-bold font-display mt-1">{s.value}</div>
            <div className={`mt-2 inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded ${s.color}`}>
              {Math.round((s.value / stats.total) * 100)}%
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã booking, tên khách…"
              className="input pl-10"
            />
          </div>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="input w-full sm:w-auto sm:max-w-xs"
          >
            <option value="all">Tất cả chi nhánh</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select className="input w-full sm:w-auto sm:max-w-[180px]">
            <option>Tất cả nguồn</option>
            <option>Website</option>
            <option>Booking.com</option>
            <option>Agoda</option>
            <option>Walk-in</option>
          </select>
          <button className="btn-outline"><Filter className="w-4 h-4" /> Thêm bộ lọc</button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto -mx-3 sm:-mx-5">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="table-th">Mã</th>
                <th className="table-th">Khách hàng</th>
                <th className="table-th hidden md:table-cell">Chi nhánh</th>
                <th className="table-th hidden lg:table-cell">Phòng</th>
                <th className="table-th hidden sm:table-cell">Check-in</th>
                <th className="table-th hidden sm:table-cell">Check-out</th>
                <th className="table-th hidden md:table-cell">Nguồn</th>
                <th className="table-th text-right">Tổng tiền</th>
                <th className="table-th">Trạng thái</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 25).map((b) => {
                const st = STATUS_MAP[b.status];
                return (
                  <tr key={b.id} className="hover:bg-ink-50 transition group">
                    <td className="table-td font-mono text-xs font-semibold text-brand-700">
                      {b.id}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <img src={b.guestAvatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-ink-900 truncate">{b.guestName}</div>
                          <div className="text-xs text-ink-500">{b.guests} khách · {b.nights} đêm</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-xs hidden md:table-cell">{b.branchName}</td>
                    <td className="table-td hidden lg:table-cell">
                      <span className="font-medium">{b.roomTypeName}</span>
                    </td>
                    <td className="table-td text-xs hidden sm:table-cell">{formatDate(b.checkIn)}</td>
                    <td className="table-td text-xs hidden sm:table-cell">{formatDate(b.checkOut)}</td>
                    <td className="table-td hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-ink-50 text-ink-700 font-medium">
                        {b.source}
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <div className="font-bold text-ink-900">{formatVND(b.total)}</div>
                      {b.paid < b.total && (
                        <div className="text-xs text-rose-600 font-medium">
                          Còn nợ {formatVND(b.total - b.paid)}
                        </div>
                      )}
                    </td>
                    <td className="table-td">
                      <span className={`badge ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="table-td">
                      <button className="text-ink-400 hover:text-ink-900">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 pt-4 border-t border-ink-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-xs text-ink-500">
            Hiển thị {Math.min(25, filtered.length)} / {filtered.length} booking
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <button className="btn-outline !py-1 !px-3 text-xs">‹ Trước</button>
            <button className="btn-primary !py-1 !px-3 text-xs">1</button>
            <button className="btn-outline !py-1 !px-3 text-xs">2</button>
            <button className="btn-outline !py-1 !px-3 text-xs">3</button>
            <button className="btn-outline !py-1 !px-3 text-xs">Sau ›</button>
          </div>
        </div>
      </Card>
    </div>
  );
}