# Công thức dựng trang

## Khung trang chuẩn

```jsx
import { useState, useMemo, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Pagination from "../components/Pagination";
import { Icons } from "../components/Icons";
import { bookings } from "../data/mockData";
import { formatVND, formatDate } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import { StatusPill } from "../components/Semantic";

const { Search, Plus, Filter, Download } = Icons;

export default function TenTrang() {
  const { activeBranchId, activeBranch, isAll } = useActiveBranch();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 1. Thu hẹp theo chi nhánh đang chọn
  const scoped = useMemo(
    () => (isAll ? bookings : bookings.filter((b) => b.branchId === activeBranchId)),
    [activeBranchId, isAll]
  );

  // 2. Đổi filter → về trang 1
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, activeBranchId]);

  // 3. Áp filter + search
  const filtered = useMemo(() => scoped.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search && !`${b.guestName} ${b.id}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [scoped, statusFilter, search]);

  // 4. Cắt trang
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  return (
    <div>
      <PageHeader
        title="Quản lý đặt phòng"
        subtitle={`${scoped.length} đặt phòng ${isAll ? "trong hệ thống" : `tại ${activeBranch?.name}`}`}
        actions={
          <>
            <button className="btn-outline"><Download className="w-4 h-4" /> Xuất CSV</button>
            <button className="btn-primary"><Plus className="w-4 h-4" /> Thêm mới</button>
          </>
        }
      />

      {/* … nội dung … */}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
        itemsPerPage={pageSize}
      />
    </div>
  );
}
```

Thứ tự `scoped → filter → paginate` là bắt buộc: đếm cho KPI/subtitle lấy từ `scoped`, `totalItems` của `Pagination` lấy từ `filtered`, render lấy từ `paginated`. `Pagination` tự ẩn khi `totalPages <= 1`.

## Thanh filter + ô tìm kiếm

```jsx
<Card className="mb-6">
  <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1 min-w-0">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        className="input pl-9"
        placeholder="Tìm theo tên khách, mã đặt phòng…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
    <select className="input sm:w-56" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
      <option value="all">Tất cả trạng thái</option>
      {bookingStatusList.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
    </select>
  </div>
</Card>
```

## Hàng KPI

```jsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
  <StatCard title="Tổng doanh thu" value={formatVND(total)} delta="+12.4%" deltaDir="up"
            icon={Icons.TrendingUp} accent="brand" sub="So với tháng trước" />
  …
</div>
```

Ô KPI bấm được để lọc thì thêm viền + ring khi active (xem `pages/Guests.jsx`, phần `tierStats`).

## Bảng

```jsx
<Card title="Danh sách" subtitle={`${filtered.length} bản ghi`}>
  <div className="overflow-x-auto -mx-3 sm:-mx-5 px-3 sm:px-5">
    <table className="w-full min-w-[720px]">
      <thead>
        <tr>
          <th className="table-th">Mã</th>
          <th className="table-th">Khách</th>
          <th className="table-th text-right">Thành tiền</th>
          <th className="table-th">Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        {paginated.map((b) => (
          <tr key={b.id} className="hover:bg-ink-50/40 transition">
            <td className="table-td font-medium">{b.id}</td>
            <td className="table-td">{b.guestName}</td>
            <td className="table-td text-right tabular-nums">{formatVND(b.total)}</td>
            <td className="table-td"><StatusPill tone="success">Đã xác nhận</StatusPill></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</Card>
```

Bảng luôn bọc `overflow-x-auto` + `min-w-[…]` — layout đã chặn cuộn ngang ở `main`.

## Trạng thái rỗng

```jsx
{paginated.length === 0 && (
  <div className="text-center py-12">
    <Icons.SearchX className="w-10 h-10 mx-auto text-ink-300 mb-3" />
    <div className="text-sm font-semibold text-ink-900">Không tìm thấy kết quả</div>
    <div className="text-xs text-ink-500 mt-1">Thử đổi từ khóa hoặc bỏ bớt bộ lọc</div>
  </div>
)}
```

## Bố cục danh sách + panel chi tiết

Dùng cho Guests/Messages: lưới `lg:grid-cols-3`, danh sách chiếm 2 cột, panel chi tiết `lg:sticky lg:top-6`. Giữ item đang chọn hợp lệ mỗi khi trang/filter đổi:

```jsx
useEffect(() => {
  if (!paginated.length) return setSelected(null);
  if (!paginated.some((x) => x.id === selected?.id)) setSelected(paginated[0]);
}, [paginated]);
```

## Biểu đồ (Recharts)

Recharts nhận màu qua prop, **không đọc được CSS var** → lấy giá trị đã tính bằng `useThemeVars()`:

```jsx
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useThemeVars } from "../context/ThemeContext";
import { revenueChart } from "../data/mockData";

const v = useThemeVars();

<Card title="Doanh thu 12 tháng" subtitle="Đơn vị: tỷ đồng">
  <ResponsiveContainer width="100%" height={280}>
    <AreaChart data={revenueChart}>
      <defs>
        <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={v.accent} stopOpacity={0.35} />
          <stop offset="100%" stopColor={v.accent} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={v["border-soft"]} vertical={false} />
      <XAxis dataKey="month" tick={{ fill: v["fg-muted"], fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: v["fg-muted"], fontSize: 11 }} axisLine={false} tickLine={false}
             tickFormatter={(x) => `${(x / 1e9).toFixed(0)} tỷ`} />
      <Tooltip contentStyle={{ backgroundColor: v.surface, border: `1px solid ${v.border}`, borderRadius: 8, fontSize: 12 }}
               formatter={(x) => formatVND(x)} />
      <Area type="monotone" dataKey="revenue" stroke={v.accent} fill="url(#gRevenue)" strokeWidth={2} />
    </AreaChart>
  </ResponsiveContainer>
</Card>
```

Luôn bọc `ResponsiveContainer` với `height` cố định; `id` của gradient phải là duy nhất trong toàn trang.

## Trước khi kết thúc

1. `npm run lint` — `react/rules-of-hooks` là `error`, hook không được đặt sau `return` hay trong nhánh điều kiện.
2. Kiểm tra ở cả `data-theme="light"` và `dark`, đổi thử một accent khác navy.
3. Thu hẹp cửa sổ xuống ~375px: không được cuộn ngang.
4. Đổi chi nhánh trên sidebar: số liệu và subtitle phải đổi theo.
