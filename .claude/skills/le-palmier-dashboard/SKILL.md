---
name: le-palmier-dashboard
description: Quy ước và công thức làm việc trên dự án Le Palmier — dashboard quản lý khách sạn đa chi nhánh (React 19 + Vite 8 + Tailwind 3 + React Router 7 + Recharts, mock data, UI tiếng Việt). Dùng khi thêm/sửa trang trong src/pages, component trong src/components, mock data, theming/dark mode, filter-search-pagination, biểu đồ, hoặc khi cần chạy/build/lint/deploy repo này.
---

# Le Palmier — Dashboard quản lý khách sạn

Demo UI/UX **không có backend**. Mọi dữ liệu đến từ `src/data/mockData.js` (random có seed cố định `seed = 42`). Mọi action create/edit/delete/search/filter chỉ đổi UI state trong component.

## Lệnh

```bash
npm install
npm run dev      # http://localhost:5173 (host: true, allowedHosts: true)
npm run build    # vite build → dist/
npm run lint     # oxlint (plugins: react, oxc)
npm run preview
```

Không có test runner (`npm run test` không tồn tại — Jenkinsfile gọi kèm `--if-present`). Deploy: Jenkins → SSH vào VPS → `docker compose up -d --build` từ nhánh `main`.

Lưu ý: `vite.config.js` **không khai báo `@vitejs/plugin-react`** dù package có trong devDependencies. Đừng "sửa" điều này nếu không được yêu cầu — chỉ nhớ là React Fast Refresh không hoạt động, sửa file phải reload trang.

## Cấu trúc

```
src/
  App.jsx              # router + layout (Sidebar · Topbar · main · Footer · Chatbot) + auth gate
  index.css            # design tokens (CSS var), @layer components, alias ink-*/brand-*
  context/             # ThemeContext · AuthContext · BranchContext  (thứ tự provider cố định)
  components/          # dùng lại toàn app: Card, PageHeader, StatCard, Pagination, Semantic, Icons…
  pages/               # 1 file = 1 route
  data/mockData.js     # nguồn dữ liệu duy nhất
  utils/format.js      # formatVND, formatVNDFull, formatDate
```

## 5 quy tắc bắt buộc

1. **Tiếng Việt cho mọi text hiển thị** — tiêu đề, nhãn, badge, tooltip, empty state, comment trong code. Định danh (biến, hàm, props) giữ tiếng Anh.
2. **Không hardcode màu Tailwind thô.** Chỉ dùng token/alias theo theme — chi tiết ở `references/design-system.md`. Dùng `text-slate-600`, `bg-white`, `border-gray-200` sẽ vỡ dark mode.
3. **Icon luôn qua wrapper**: `import { Icons } from "../components/Icons"` rồi destructure — không import trực tiếp `lucide-react` trong page/component mới.
4. **Dữ liệu chỉ đọc từ `src/data/mockData.js`.** Cần trường mới thì bổ sung generator ở đó (giữ nguyên `seed = 42`, đừng chèn lệnh `rand()` vào giữa chuỗi sinh hiện có vì sẽ đổi toàn bộ dữ liệu phía sau).
5. **Trang nào có dữ liệu theo chi nhánh thì phải tôn trọng chi nhánh đang chọn** qua `useActiveBranch()`.

## Công thức thêm một trang mới

Bốn bước, thiếu bước nào là trang không truy cập được:

1. Tạo `src/pages/TenTrang.jsx`, `export default function TenTrang()`.
2. Import + khai báo `<Route path="/duong-dan" element={<TenTrang />} />` trong `src/App.jsx` (bên trong `AppLayout`, không phải `AppRouter`).
3. Thêm mục vào `navGroups` trong `src/components/Sidebar.jsx` — đúng nhóm (`Tổng quan` / `Vận hành` / `Nhân sự` / `Marketing` / `Dịch vụ & Báo cáo` / `Hệ thống`), kèm `icon` lấy từ `Icons` và `badge` (chuỗi hoặc `null`).
4. Mở đầu trang bằng `<PageHeader title subtitle actions />`.

Khung trang chuẩn, pattern filter/search/pagination, và cách dùng Recharts: xem `references/page-recipe.md`.

## Contexts

| Hook | Nguồn | Dùng để |
| --- | --- | --- |
| `useActiveBranch()` | `context/BranchContext` | `{ activeBranchId, activeBranch, setBranch, branches, isAll }` — lọc dữ liệu theo chi nhánh; có sẵn helper `filterByBranch(list, activeBranchId)` |
| `useTheme()` | `context/ThemeContext` | `{ theme, accent, density, fontSize, setTheme, setAccent, … }` — ghi `data-theme`/`data-accent`/`data-density` lên `<html>` |
| `useThemeVars()` | `context/ThemeContext` | đọc giá trị CSS var đã tính (**bắt buộc** khi truyền màu cho Recharts) |
| `useAuth()` | `context/AuthContext` | `{ user, isAuthenticated, login, logout }` — login giả lập, lưu `localStorage` |

Tất cả state đều persist ở `localStorage` với prefix `lepalmier.*`.

## Format

```jsx
import { formatVND, formatVNDFull, formatDate } from "../utils/format";

formatVND(2_450_000_000)  // "2.45 tỷ"   — cho KPI, biểu đồ, ô hẹp
formatVNDFull(350000)     // "350.000 VNĐ" — cho bảng giá, chi tiết
formatDate("2026-07-15")  // "15/07/2026"
```

Số liệu luôn thêm class `tabular-nums` để cột không nhảy.

## Tài liệu tham chiếu

- `references/design-system.md` — token màu, class dựng sẵn, component Semantic, luật dark mode. **Đọc trước khi viết bất kỳ JSX nào có màu.**
- `references/data-model.md` — shape đầy đủ của `branches`, `rooms`, `staff`, `guests`, `bookings` và các aggregate; cách thêm dữ liệu mà không phá seed.
- `references/page-recipe.md` — template trang, filter/search/pagination, bảng, panel chi tiết, Recharts.
