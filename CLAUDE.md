# Le Palmier — Hệ thống quản trị chuỗi khách sạn

Ứng dụng React thuần front-end, **không có backend**. Toàn bộ số liệu là mock data sinh theo seed cố định (`seed = 42` trong `src/data/mockData.js`). Mọi thao tác create/edit/delete chỉ đổi UI state. Giao diện 100% tiếng Việt.

## ⚠️ Bắt buộc trước khi viết bất kỳ UI nào

**Đọc `Design.md` trước.** Đó là đặc tả giao diện chuẩn (v3 "Vivid Bento") và là bắt buộc, không phải gợi ý.

Sau đó mở file tham chiếu tương ứng và **copy công thức từ đó thay vì tự sáng tác**:

| Loại trang | File mẫu |
|---|---|
| Danh sách (grid thẻ + bảng + lọc + phân trang) | `src/pages/Staff.jsx` |
| Hub nhiều tab (KPI + bảng + thẻ + modal + biểu đồ) | `src/pages/Marketing.jsx` |

Hai file này đã theo v3. Mọi trang khác **chưa migrate** — đừng lấy chúng làm mẫu. Bảng trạng thái migrate ở `Design.md` §14.

Ba lỗi hay gặp nhất:
1. Tự nghĩ ra cặp màu gradient mới → chỉ được lấy từ `Design.md` §2.2.
2. Viết `bg-white`, `text-ink-900`, `border-ink-200` → phải dùng `var(--surface)`, `var(--fg)`, `var(--border)`, nếu không dark mode vỡ.
3. Viết lại `.lift` / `.glowbtn` trong thẻ `<style>` của trang → chúng đã là class toàn cục trong `src/index.css`.

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
  context/           Theme (light/dark, 6 accent) · Auth (localStorage) · Branch (lọc chi nhánh toàn cục)
  data/mockData.js   nguồn dữ liệu duy nhất — branches, rooms, staff, guests, bookings
  components/        Sidebar, Topbar, Chatbot, Pagination, Icons, Semantic…
  pages/             25 trang
  utils/format.js    formatVND, formatVNDFull, formatDate
```

**Ba context là xương sống:**

- `ThemeContext` — ghi `data-theme` / `data-accent` lên `<html>`; toàn bộ màu chạy qua CSS variable trong `src/index.css`. **Người dùng đổi được 6 accent, nên không được coi xanh dương là màu thương hiệu cố định.**
- `AuthContext` — auth giả, lưu key `lepalmier.auth` vào localStorage. `RequireAuth` trong `App.jsx` chặn route.
- `BranchContext` — `activeBranchId` (`"ALL"` hoặc id chi nhánh). Các trang danh sách phải `useEffect` đồng bộ theo nó, **không tự tạo bộ chọn chi nhánh thứ hai**.

Dữ liệu thật sinh ra: **4 chi nhánh · 713 phòng · 124 nhân viên · 240 khách · 320 booking**. (README ghi 12 chi nhánh / 1.800 phòng là số cũ, sai.)

## Quy ước

- Icon: luôn import qua `src/components/Icons.jsx`, không import trực tiếp `lucide-react`.
- Tiền/ngày/phần trăm: dùng `src/utils/format.js`, quy tắc ở `Design.md` §11.
- Thuật ngữ tiếng Việt: bảng chuẩn ở `Design.md` §12 (dùng "chi nhánh" không dùng "khu du lịch", "đặt phòng" không dùng "đặt chỗ"…).
- Comment trong code viết tiếng Việt, theo phong cách file hiện có.

## Nợ kỹ thuật đã biết

Danh sách đầy đủ ở `Design.md` §15. Đáng chú ý:

- Cài đặt "Mật độ" **không hoạt động** — `ThemeContext` ghi attribute `data-density` nhưng `index.css` viết selector class `.density-compact`.
- `Sidebar.jsx` badge số sai (316 nhân viên / 1.2K phòng — thực tế 124 / 713) và thuật ngữ trái quy ước.
- `Topbar.jsx` còn `bg-white` cứng nên hỏng dark mode; tên người dùng hardcode thay vì đọc `useAuth()`.
- Khi migrate trang thứ ba sang v3: **tách** `KpiCard`, `Avatar`, `Segmented`, `PillSelect`, `Modal`, `Section`, `StatusTag` từ `Staff.jsx`/`Marketing.jsx` sang `src/components/` thay vì copy lần nữa.

## CI/CD

`Jenkinsfile`: Checkout → Install → Lint → Test → Build → Deploy. Deploy bỏ qua khi là Pull Request. Deploy bằng ssh vào VPS rồi `docker compose up -d --build`.

Lưu ý: `Dockerfile` đang chạy `npm run dev` — tức production đang chạy dev server của Vite, không phải bản build.
