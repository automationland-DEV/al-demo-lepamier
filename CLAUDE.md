# Condo HUB — Hệ thống quản trị chuỗi khách sạn

Ứng dụng React thuần front-end, **không có backend**. Toàn bộ số liệu là mock data sinh theo seed cố định (`seed = 42` trong `src/data/mockData.js`). Mọi thao tác create/edit/delete chỉ đổi UI state. Giao diện 100% tiếng Việt.

## ⚠️ Bắt buộc trước khi viết bất kỳ UI nào

**Đọc `Design.md` trước.** Đó là đặc tả giao diện chuẩn (v4 "Palmier Riviera") và là bắt buộc, không phải gợi ý.

**Import component từ `src/components/ui/` — đừng copy-paste giữa các trang.** Đó là nguồn sự thật: `Button`, `Panel`, `StatStrip`/`Stat`, `Table`, `Modal`, `Tabs`, `Tag`, `StatusTag`, `Avatar`, `EmptyState`, `Toast`, `PageHeader`, `SectionHead`…

Sau đó mở file tham chiếu để xem cách ghép chúng lại:

| Loại trang | File mẫu |
|---|---|
| Danh sách (bảng + thẻ + lọc + phân trang) | `src/pages/Staff.jsx` |
| Dashboard (tối đa 4 khối lớn) | `src/pages/Dashboard.jsx` |
| Hub nhiều tab (KPI + bảng + modal + biểu đồ) | `src/pages/Marketing.jsx` |

Ba file này đã theo v4. Phần lớn trang còn lại **chưa migrate** — đừng lấy chúng làm mẫu. Bảng trạng thái ở `Design.md` §16.

Năm lỗi hay gặp nhất:
1. **Dùng gradient.** v4 không có gradient (trừ 3 ngoại lệ ở `Design.md` §2.5). Nếu bạn định viết `linear-gradient(135deg,…)` là đang làm theo v3.
2. **Hardcode hex.** Màu nhà/kim loại lấy qua `usePalette()`; màu ngữ nghĩa và bề mặt lấy qua `var(--*)`. Người dùng chọn được 4 **bộ sưu tập màu** trong Cài đặt; hardcode là trang của bạn không đổi theo.
3. Viết `bg-white`, `text-ink-900`, `border-ink-200` → phải dùng `var(--surface)`, `var(--fg)`, `var(--border)`, nếu không chế độ tối vỡ.
4. **`rounded-full` cho nút/input** → v4 dùng `var(--r-sm)` = 4px. Tròn chỉ dành cho avatar và chấm trạng thái.
5. **`font-extrabold` / `font-bold`** → trần độ đậm của v4 là `600`. Tiêu đề dùng `font-display` (Playfair Display) weight **400**.

`.lift` / `.glowbtn` là di sản v3, đã bị giảm hiệu lực trong `src/index.css` để trang cũ không giật cục. **Không dùng trong code mới** — dùng `.card-hover`.

## Lệnh

```bash
npm run dev      # Vite dev server, mặc định :5173
npm run build    # build production
npm run lint     # oxlint
```

Không có test suite. Sau khi sửa UI: chạy `npm run build` và `npx oxlint <file vừa sửa>`, cả hai phải sạch.

## Tech stack

React 19 · Vite 8 · React Router 7 · Tailwind 3 · Recharts · lucide-react. Không TypeScript.

## Kiến trúc

```
src/
  App.jsx            BrowserRouter + 3 provider lồng nhau + 25 route
  context/           Theme (sáng/tối, 4 bộ sưu tập màu) · Auth (localStorage) · Branch (lọc chi nhánh toàn cục)
  theme/palette.js   usePalette() — màu nhà, kim loại, bảng đất, màu ngữ nghĩa
  data/mockData.js   nguồn dữ liệu duy nhất — branches, rooms, staff, guests, bookings
  components/ui/     ★ thư viện component v4 — import từ đây
  components/        Sidebar, Topbar, Chatbot, Pagination, Icons, Semantic…
  pages/             25 trang
  utils/format.js    formatVND, formatVNDFull, formatDate
```

**Ba context là xương sống:**

- `ThemeContext` — ghi `data-theme` / `data-collection` / `data-density` lên `<html>`; toàn bộ màu chạy qua CSS variable trong `src/index.css`. **Người dùng đổi được 4 bộ sưu tập (Ô-liu & Đồng thau · Bordeaux & Xương · Hải quân & Cát · Noir & Champagne), nên không được coi bất kỳ màu nào là màu thương hiệu cố định.** `data-accent` vẫn được ghi (bằng chính id bộ sưu tập) cho tới khi trang cuối cùng migrate.
- `AuthContext` — auth giả, lưu key `condohub.auth` vào localStorage. `RequireAuth` trong `App.jsx` chặn route.
- `BranchContext` — `activeBranchId` (`"ALL"` hoặc id chi nhánh). Các trang danh sách phải `useEffect` đồng bộ theo nó, **không tự tạo bộ chọn chi nhánh thứ hai**.

Dữ liệu thật sinh ra: **4 chi nhánh · 713 phòng · 124 nhân viên · 240 khách · 320 booking**. (README ghi 12 chi nhánh / 1.800 phòng là số cũ, sai.)

## Quy ước

- Icon: luôn import qua `src/components/Icons.jsx`, không import trực tiếp `lucide-react`.
- Tiền/ngày/phần trăm: dùng `src/utils/format.js`, quy tắc ở `Design.md` §11.
- Thuật ngữ tiếng Việt: bảng chuẩn ở `Design.md` §12 (dùng "chi nhánh" không dùng "khu du lịch", "đặt phòng" không dùng "đặt chỗ"…).
- Comment trong code viết tiếng Việt, theo phong cách file hiện có.

## Nợ kỹ thuật đã biết

Danh sách đầy đủ ở `Design.md` §17. Đáng chú ý:

- Bundle vẫn 1 chunk ~2,2 MB — chưa code-splitting theo route.
- `vite.config.js` thiếu `@vitejs/plugin-react` — build chạy được nhưng mất Fast Refresh.
- `AppearanceModal.jsx`, `StatCard.jsx` không được import ở đâu, nên xóa.
- Lớp tương thích ngược ở cuối `src/index.css` (alias `bg-white`/`ink-*`/`brand-*`, ánh xạ pastel Tailwind, `.lift`/`.glowbtn`) tồn tại **chỉ** để ~20 trang chưa migrate không vỡ. Xóa hết khi trang cuối cùng chuyển sang `src/components/ui/`.

Đã sửa trong đợt v4: mật độ hiển thị (selector `[data-density]`), badge số ở `Sidebar.jsx` (nay đọc thẳng từ `mockData`), `Topbar.jsx` (breadcrumb theo route, tên người dùng đọc `useAuth()`), `Footer.jsx` (hết nền xanh dương cứng).

## CI/CD

`Jenkinsfile`: Checkout → Install → Lint → Test → Build → Deploy. Deploy bỏ qua khi là Pull Request. Deploy bằng ssh vào VPS rồi `docker compose up -d --build`.

Lưu ý: `Dockerfile` đang chạy `npm run dev` — tức production đang chạy dev server của Vite, không phải bản build.
