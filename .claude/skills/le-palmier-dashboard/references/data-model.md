# Mock data — `src/data/mockData.js`

Nguồn dữ liệu duy nhất của app. Không có API, không fetch.

## Bộ sinh có seed

```js
let seed = 42;
const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const pick  = (arr) => …;      // 1 phần tử
const pickN = (arr, n) => …;   // n phần tử không lặp
const randInt = (min, max) => …;
```

`rand()` là LCG tuần tự: **mọi lời gọi đều dịch chuyển trạng thái**. Chèn một `randInt()` vào giữa chuỗi sinh hiện có sẽ đổi toàn bộ dữ liệu sinh sau đó (ID phòng, tên nhân viên, số liệu dashboard…). Muốn thêm trường mới mà giữ nguyên dữ liệu cũ:

- Thêm trường **tĩnh** (không gọi `rand()`), hoặc
- Sinh dataset mới **ở cuối file**, sau tất cả các `export` hiện có.

## Các export

| Export | Kiểu | Ghi chú |
| --- | --- | --- |
| `branches` | 4 chi nhánh | nguồn của mọi quan hệ `branchId` |
| `rooms` | phòng của cả 4 chi nhánh | sinh theo tầng, ~20 phòng/tầng, `branch.totalRooms` ∈ [120, 260] |
| `staff` | 31 người/chi nhánh × 4 | theo `staffRoles` |
| `guests` | 240 khách | |
| `bookings` | 320 booking | tham chiếu guest + branch + roomType |
| `bookingStatusList` | 5 trạng thái | `pending` `confirmed` `checked_in` `checked_out` `cancelled` |
| `roomStatusList` | 5 trạng thái | `available` `occupied` `reserved` `cleaning` `maintenance` |
| `roomTypeList` | 6 hạng phòng | `STD` `SUP` `DLX` `STE` `EXE` `PRE` |
| `serviceList` | 8 dịch vụ | |
| `dashboardStats` | object | KPI tổng hợp |
| `revenueChart` | 12 tháng | `{ month: "T1", revenue, occupancy }` |
| `occupancyByBranch` | theo chi nhánh | `{ name: code, occupancy, revenue }` (revenue đơn vị tỷ) |
| `roomStatusDistribution` | pie | `{ name, value, color }` |
| `bookingsBySource` | pie/bar | `{ name, value }` |
| `recentActivity` | 8 mục | `{ id, type, user, text, time, icon }` |
| `taskList` | 6 mục | `{ id, title, branch, due, priority, done }` |

## Shape từng entity

**branch**
```js
{ id: "BR-DH-001", name, code, city, region, type, address, phone, email, manager,
  rating, totalRooms, occupancy, revenue, status: "active" | "renovating",
  openingDate, facilities: string[], image, gallery: string[] }
```

**room**
```js
{ id: "RM-DH-0101", branchId, branchCode, branchName, floor, number,
  type: "DLX", typeName, price, status, statusLabel, statusColor, statusSoft,
  guest: string | null }
```
`statusColor` / `statusSoft` là class Tailwind có sẵn — dùng lại thay vì tự map màu.

**staff**
```js
{ id: "ST-DH-0001", name, branchId, branchName, role, roleLabel, email, phone,
  shift, status: "active" | "leave", joinedAt, salary, rating, avatar }
```
`role` ∈ `manager` `reception` `housekeeping` `fnb` `security` `maintenance` `accountant`.

**guest**
```js
{ id: "GU-00001", name, email, phone, nationality,
  tier: "Thường" | "Bạc" | "Vàng" | "Bạch kim" | "Kim cương",
  totalBookings, totalSpent, lastVisit, avatar, branchId, notes: string[] }
```

**booking**
```js
{ id: "BK-000001", guestName, guestId, guestAvatar, branchId, branchName,
  roomType, roomTypeName, nights, checkIn, checkOut, guests, status, source,
  total, paid, createdAt }
```
`source` ∈ Walk-in · Booking.com · Agoda · Traveloka · Website · Đại lý · Số điện thoại · Email.

**service**
```js
{ id: "svc-001", name, category, price, unit }
```
`category` ∈ Ăn uống · Sức khỏe · Di chuyển · Tiện ích · Sự kiện · Trải nghiệm.

## Lọc theo chi nhánh

`rooms`, `staff`, `guests`, `bookings` đều có `branchId`. Trang nào hiển thị chúng cũng phải tôn trọng chi nhánh đang chọn:

```jsx
const { activeBranchId, activeBranch, isAll } = useActiveBranch();

const scoped = useMemo(
  () => (isAll ? bookings : bookings.filter((b) => b.branchId === activeBranchId)),
  [activeBranchId, isAll]
);
```

Hoặc dùng helper `filterByBranch(list, activeBranchId)` từ `context/BranchContext`. Subtitle nên phản ánh phạm vi:

```jsx
subtitle={`${scoped.length} đặt phòng ${isAll ? "trong hệ thống" : `tại ${activeBranch?.name}`}`}
```

## Ngày tháng

Dữ liệu được sinh quanh mốc **tháng 7/2026** (`new Date(2026, 6, …)`); `dashboardStats` so ngày cứng `"2026-07-28"`. Đừng dùng `new Date()` thật để lọc "hôm nay" — sẽ ra rỗng. Nếu cần mốc hiện tại, dùng hằng số cùng vùng thời gian với dữ liệu.
