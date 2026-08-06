# Aurelia Hotels — Hệ thống quản lý khách sạn đa chi nhánh

Demo UI/UX cho hệ thống quản lý khách sạn quy mô lớn, **12 chi nhánh** trên toàn quốc, **~1,800 phòng**, **316 nhân viên**, **240 khách hàng**, **320 booking**. Toàn bộ dữ liệu là **mock data** sinh ngẫu nhiên có seed ổn định.

## Tech stack

- **React 19** + **Vite 8**
- **Tailwind CSS 3** với design system tùy chỉnh
- **React Router DOM 7** — multi-page routing
- **Recharts** — biểu đồ (Area, Bar, Pie, Line, Radar)
- **Lucide React** — bộ icon thống nhất
- **Inter + Plus Jakarta Sans** — Google Fonts

## Cấu trúc module

| Trang | Mô tả |
| --- | --- |
| `/` Dashboard | Tổng quan doanh thu, lấp đầy, top chi nhánh, activity feed, task list |
| `/branches` Chi nhánh | 12 chi nhánh grid + table, filter, stats |
| `/rooms` Phòng | Quản lý ~1,800 phòng theo tầng, status legend, chi nhánh picker |
| `/bookings` Đặt phòng | 320 booking với stats filter, chi tiết khách + thanh toán |
| `/staff` Nhân viên | 316 nhân viên 7 vai trò, grid + table, filter theo role/chi nhánh |
| `/guests` Khách hàng | 240 khách với 5 hạng thành viên, panel chi tiết bên cạnh |
| `/services` Dịch vụ | 8 dịch vụ theo 6 danh mục, CRUD UI |
| `/reports` Báo cáo | KPI, line chart, radar, ranking chi nhánh, bảng chi tiết |
| `/messages` Tin nhắn | Chat UI 2 cột với conversation list + chat panel |
| `/settings` Cài đặt | 5 nhóm cấu hình: account, notification, security, language, payment |

## Cài đặt

```bash
cd hotel-mgmt
npm install
npm run dev      # chạy local ở http://localhost:5173
npm run build    # build production
```

## Ghi chú

- Mọi số liệu là mock data, random theo seed cố định (`seed = 42`).
- Tất cả action (create/edit/delete/search/filter) chỉ thay đổi UI state, không có backend.
- Phù hợp để demo pitch deck, portfolio, hoặc làm starter cho dự án thật.



## Lưu ý quan trọng " Docker"  trong file đã cập nhật docker rồi!
## nên trước khi push hoặc mer vào nhánh main thì phải chạy lệnh này: 

- Docker compose up -d --build

Khi done rồi thì mới được push hoặc mer vào để tranh lôi
