# Le Palmier — Design System v3 · "Vivid Bento"

> Đặc tả giao diện chuẩn cho toàn bộ admin Le Palmier.
> **Mọi trang mới và mọi PR sửa UI phải tuân theo file này.**
> Cập nhật 31/07/2026 · Thay thế hoàn toàn v1 (Clean Admin) và v2.

---

## 0. Đọc trước khi viết bất kỳ dòng UI nào

Nếu bạn là AI agent (Claude Code) được giao dựng hoặc sửa một trang:

1. **Đọc hết file này.**
2. **Mở hai file tham chiếu** — chúng là nguồn sự thật, quan trọng hơn mọi mô tả bằng chữ ở đây:
   - `src/pages/Staff.jsx` — mẫu **trang danh sách** (header, KPI bento, chip lọc, toolbar, thẻ, bảng, phân trang, empty state)
   - `src/pages/Marketing.jsx` — mẫu **trang hub nhiều tab** (tab pill, section header, panel, thẻ kênh, lịch, automation, modal, biểu đồ)
3. **Sao chép công thức, đừng sáng tác lại.** Khi cần một KPI card, copy `KpiCard` từ `Staff.jsx`. Khi cần modal, copy `Modal` + `ModalFooter` từ `Marketing.jsx`.
4. Chỉ dùng gradient trong bảng ở §2.2. **Không tự nghĩ ra cặp màu mới.**
5. Sau khi code xong, chạy checklist §13.

Quy tắc vàng: **nếu hai trang cùng loại mà nhìn khác nhau, là sai.**

---

## 1. Nguyên tắc

1. **Sống động nhưng có hệ thống.** Màu rực rỡ được phép, nhưng phải lấy từ bảng gradient cố định. Ngẫu hứng màu là lỗi.
2. **Mỗi màn hình một điểm nhìn.** Số KPI hoặc tiêu đề trang phải to áp đảo, đọc được từ 2 mét.
3. **Bề mặt nổi khối.** Thẻ trắng trên nền xám sâu, bo 16px, hover nhấc lên kèm bóng đổ mang chính màu của thẻ.
4. **Màu mã hóa phân loại.** Vai trò, kênh, danh mục, trạng thái — mỗi thứ một gradient riêng và **luôn giữ nguyên** ở mọi trang.
5. **Chuyển động nhẹ, có mục đích.** Hover nhấc 5px, chip ping cho trạng thái live. Không animation trang trí kéo dài.

---

## 2. Design tokens

### 2.1 Bề mặt & chữ — luôn dùng CSS variable

Khai báo trong `src/index.css`, tự đổi theo light/dark và 6 accent người dùng chọn.

| Token | Light | Vai trò |
|---|---|---|
| `--bg-app` | `#e9ecf2` | Nền trang. **Phải sẫm hơn thẻ rõ rệt** |
| `--surface` | `#ffffff` | Nền thẻ, panel, modal, dropdown |
| `--surface-2` | `#f4f6f9` | Khay chìm trong thẻ, header bảng, ô input, nền tab |
| `--surface-3` | `#e6e9f0` | Hover, thanh nền progress, chip đếm |
| `--border` | `#d2d8e3` | Viền thẻ 1px |
| `--border-soft` | — | Ngăn giữa hàng bảng, divider trong thẻ |
| `--fg` | `#1f2531` | Tên, giá trị, số |
| `--fg-muted` | `#67738b` | Mô tả, nhãn cột, chữ phụ |
| `--fg-subtle` | `#8792a8` | Placeholder, nhãn 10px, timestamp |

**Cấm** `bg-white`, `text-ink-900`, `border-ink-200`, `bg-blue-700` trong code mới. Dùng `style={{ backgroundColor: "var(--surface)" }}`.

### 2.2 Bảng gradient — trái tim của hệ thống

Mọi gradient đều là `linear-gradient(135deg, from, to)`.

> ⛔ **Không hardcode hex gradient trong trang nữa.** Lấy qua `usePalette()` từ
> `src/theme/palette.js` — nếu không, công tắc Đơn sắc/Đa sắc trong Cài đặt sẽ
> không tác động được tới trang của bạn.

```jsx
import { usePalette, TONE, scoreTone } from "../theme/palette";

function MyPage() {
  const { brand, series, seriesMap, isMulti } = usePalette();

  const KPI  = useMemo(() => series(4), [series]);              // 4 bộ màu KPI
  const ROLE = useMemo(() => seriesMap(ROLE_KEYS), [seriesMap]); // gán theo khóa

  // brand.from / brand.to        → nút chính, chip nhãn trang, tab đang chọn
  // KPI[i].from / .to            → ô icon KPI
  // ROLE[key].from/.to/.soft/.ink → gradient · nền pill · chữ trên pill
}
```

Component con nằm ngoài hàm trang thì **tự gọi `usePalette()`** thay vì nhận
qua prop — nó là hook nên dùng trong component là hợp lệ.

### Ba loại màu — xử lý khác nhau

| Loại | Ví dụ | Đổi theo Đơn sắc/Đa sắc? |
|---|---|---|
| **Phân loại** | Vai trò nhân viên · danh mục bài viết · chuỗi KPI · nhóm danh mục | ✅ Có |
| **Ngữ nghĩa** | Thành công · cảnh báo · lỗi · điểm SEO | ❌ Không — đổi là mất nghĩa |
| **Thương hiệu ngoài** | Facebook · YouTube · TikTok · Zalo | ❌ Không — là nhận diện của họ |

Màu ngữ nghĩa lấy từ hằng `TONE` và hàm `scoreTone(v)` trong cùng module.

### Hai chế độ

**Đa sắc** (`accent = "multi"`) — mỗi nhóm một màu riêng, lấy theo thứ tự:

| # | from | to |
|---|---|---|
| 1 | `#6366f1` | `#8b5cf6` indigo |
| 2 | `#10b981` | `#14b8a6` emerald |
| 3 | `#f59e0b` | `#f97316` amber |
| 4 | `#0ea5e9` | `#3b82f6` sky |
| 5 | `#f43f5e` | `#ec4899` rose |
| 6 | `#d946ef` | `#a855f7` fuchsia |
| 7 | `#84cc16` | `#10b981` lime |

**Đơn sắc** (6 accent còn lại) — `monoSeries()` sinh dải cùng tông với accent,
độ sáng đi từ 36% (bộ đầu) tới 62% (bộ cuối). Người dùng chọn accent Xanh lục
thì cả 7 vai trò đều xanh lục, khác nhau ở độ đậm nhạt.

Cần thêm một nhóm phân loại mới? Chỉ cần thêm khóa vào mảng truyền cho
`seriesMap()` — **không thêm hex**.

**Thương hiệu** — `brand.from` / `brand.to`. Ở chế độ Đa sắc là indigo→tím,
ở chế độ đơn sắc là chính accent người dùng chọn.

**KPI** — thứ tự cố định, ô thứ n dùng gradient thứ n:

| # | from | to | Dùng cho |
|---|---|---|---|
| 1 | `#6366f1` | `#8b5cf6` | Chỉ số tổng / chính |
| 2 | `#10b981` | `#14b8a6` | Tích cực, đang hoạt động |
| 3 | `#f59e0b` | `#f97316` | Cần chú ý, chờ xử lý |
| 4 | `#0ea5e9` | `#3b82f6` | Tài chính, số tiền |
| 5 | `#f43f5e` | `#ec4899` | Tương tác, cảm xúc |
| 6 | `#d946ef` | `#a855f7` | Tăng trưởng, người theo dõi |

**Vai trò / danh mục** — 7 màu, đã dùng ở `Staff.jsx`. Mỗi phần tử có 4 giá trị: `from`, `to` (gradient), `soft` (nền pill), `ink` (chữ trên pill):

```js
manager:      { from: "#8b5cf6", to: "#6366f1", soft: "#f1ecfe", ink: "#6d28d9" }
reception:    { from: "#0ea5e9", to: "#3b82f6", soft: "#e4f3fe", ink: "#0369a1" }
housekeeping: { from: "#14b8a6", to: "#06b6d4", soft: "#d8f7f2", ink: "#0f766e" }
fnb:          { from: "#f59e0b", to: "#f97316", soft: "#fef1d8", ink: "#b45309" }
security:     { from: "#f43f5e", to: "#ec4899", soft: "#ffe6ea", ink: "#be123c" }
maintenance:  { from: "#84cc16", to: "#10b981", soft: "#eafbd6", ink: "#4d7c0f" }
accountant:   { from: "#d946ef", to: "#a855f7", soft: "#fbe9fe", ink: "#a21caf" }
```

Cần phân loại mới (hạng phòng, nguồn booking, hạng thành viên…) → lấy tiếp theo thứ tự bảng này, **không chế màu mới**.

**Kênh mạng xã hội** — dùng màu thương hiệu thật, đã dùng ở `Marketing.jsx`:

```js
facebook  #1877F2 → #3b82f6      instagram #E1306C → #f97316
zalo      #0068FF → #0ea5e9      tiktok    #25F4EE → #FE2C55
youtube   #FF0000 → #f43f5e      twitter   #334155 → #0f172a
linkedin  #0A66C2 → #0ea5e9      website   #0ea5e9 → #06b6d4
email     #8b5cf6 → #a855f7
```

**Trạng thái** — nền pastel + chữ đậm, dùng cho `StatusTag`:

| Trạng thái | bg | ink | dot |
|---|---|---|---|
| Thành công / đang hoạt động | `#d9f9e7` | `#15803d` | `#10b981` |
| Chờ / tạm dừng | `#fef1d8` | `#b45309` | `#f59e0b` |
| Lỗi / đã hủy | `#ffe6ea` | `#be123c` | `#f43f5e` |
| Đang xử lý / đã lên lịch | `#e4f3fe` | `#0369a1` | `#0ea5e9` |
| Chờ duyệt | `#f1ecfe` | `#6d28d9` | `#8b5cf6` |
| Nháp / trung tính | `#eef1f6` | `#475569` | `#94a3b8` |

### 2.3 Chữ

Hai font: `font-display` = Plus Jakarta Sans (tiêu đề, số). Mặc định = Inter.

| Vai trò | Cỡ | Weight | Ghi chú |
|---|---|---|---|
| Tiêu đề trang | `32px` / `sm:38px` | `extrabold` | `tracking-[-0.03em] leading-none` |
| Số KPI lớn | `30–34px` | `extrabold` | `tabular-nums`, display |
| Số KPI nhỏ (6 ô) | `26px` | `extrabold` | display |
| Tiêu đề section | `17px` | `extrabold` | display |
| Tên đối tượng trong thẻ | `15px` | `extrabold` | |
| Tiêu đề panel / card | `14px` | `bold` | |
| Body, ô bảng | `13px` | `regular / bold` | |
| Chip, pill, chú thích | `11–12px` | `bold / extrabold` | |
| Nhãn IN HOA nhỏ | `10–11px` | `extrabold` | `uppercase tracking-wider` |

Mọi con số: `tabular-nums`. Số trong bảng: canh phải.

### 2.4 Khoảng cách

Thang **4 · 8 · 12 · 16 · 20 · 24 · 36**.

| Vị trí | Giá trị |
|---|---|
| Padding thẻ | `p-5` (20px) · thẻ nhỏ `p-4` |
| Khay chìm trong thẻ | `p-3` + `rounded-xl` |
| Giữa các thẻ trong grid | `gap-4` |
| Giữa 2 khối lớn | `mt-9` (section) |
| Header trang → nội dung | `pb-6` |

### 2.5 Bo góc

| Đối tượng | Giá trị |
|---|---|
| Thẻ, panel, bảng | `rounded-[var(--r)]` = **16px** |
| Ô icon, khay chìm, block nhỏ | `rounded-xl` = 12px |
| Modal | `rounded-[20px]` |
| Nút, input, select, chip, tab, pill | `rounded-full` |
| Avatar, chấm | `rounded-full` |

**Không dùng** `rounded-md`, `rounded-lg`, `rounded-2xl` trong code mới.

### 2.6 Đổ bóng màu

Bóng luôn mang màu của chính phần tử, không phải màu đen.

```jsx
// Thẻ hover — đặt --glow rồi thêm class .lift
<div className="lift" style={{ "--glow": `${color}50` }} />

// Ô icon gradient
boxShadow: `0 6px 14px -7px ${from}`

// Nút chính gradient
boxShadow: "0 8px 20px -8px rgba(99,102,241,.6)"
```

### 2.7 Chuyển động

| Hiệu ứng | Giá trị |
|---|---|
| Thẻ hover | `translateY(-5px)`, `.28s cubic-bezier(.22,1,.36,1)` |
| Nút hover | `translateY(-1px)`, `.2s ease` |
| Chip / tab đổi trạng thái | `.2s` |
| Chấm live | `animate-ping` (Tailwind) |
| Icon empty state | `.floaty` (3s lên xuống) |

Đã có `@media (prefers-reduced-motion: reduce)` tắt toàn bộ — không cần xử lý thêm.

---

## 3. Class tiện ích toàn cục

Khai báo sẵn ở cuối `src/index.css`. **Dùng trực tiếp, không tự viết lại trong `<style>` của trang.**

| Class / biến | Tác dụng |
|---|---|
| `--r` / `--r-sm` | 16px / 12px — bo góc chuẩn |
| `.lift` | Hover nhấc 5px + bóng màu. Cần đặt `--glow` trên phần tử |
| `.glowbtn` | Hover nhấc 1px + quầng sáng. Dùng cho nút gradient |
| `.noscroll` | Ẩn thanh cuộn cho hàng chip cuộn ngang |
| `.floaty` | Icon trôi lên xuống 3s |

### 3.1 Nền trang — phẳng

Nền trang là **một màu phẳng `var(--bg-app)`**. Không vệt sáng, không gradient wash, không hoa văn, không canvas.

Container gốc của trang chỉ cần:

```jsx
<div className="max-w-[1360px] mx-auto pb-10">
```

Chiều sâu đến **hoàn toàn từ bề mặt thẻ**: thẻ trắng nổi trên nền xám sâu (§3.9 — chênh lệch `--bg-app` / `--surface`), viền 1px, `shadow-card`, và quầng gradient mờ **bên trong** từng thẻ (`KpiCard`, `StaffCard`). Không cần và không được thêm gì ở tầng nền.

> **Hai thứ đã thử và đã gỡ bỏ, đừng làm lại:**
>
> 1. **Canvas 3D động** — khối cầu chiếu phối cảnh, phản ứng theo chuột và cuộn trang. Trên phần mềm quản trị mở 40 lần/ngày, chuyển động ở nền gây nhiễu chứ không tăng giá trị.
> 2. **Vệt gradient tím tĩnh** ở đầu trang. Nó làm nền "bẩn" và cạnh tranh với chính các thẻ gradient là thứ đáng được nhìn.
>
> Chuyển động chỉ được xảy ra khi người dùng tương tác trực tiếp: hover thẻ (`.lift`), đổi tab, chấm trạng thái live.

---

## 4. Bố cục trang chuẩn

```
<div className="relative max-w-[1360px] mx-auto pb-10">

  ① Vệt sáng nền (tùy chọn, chỉ trang chính)
  ② HEADER      chip gradient · tiêu đề 38px · dòng số liệu · nút hành động
  ③ KPI BENTO   2–6 thẻ, grid-cols-2 lg:grid-cols-4 (hoặc xl:grid-cols-6)
  ④ CHIP LỌC    hàng cuộn ngang (nếu có phân loại) — tùy chọn
  ⑤ TOOLBAR     panel bo 16px chứa search + select + segmented, tất cả rounded-full
  ⑥ NỘI DUNG    grid thẻ / bảng / tab content
  ⑦ PAGINATION

</div>
```

Trang nhiều tab (như Marketing) chèn hàng **tab pill** ngay sau ②, rồi mỗi tab tự chạy ③–⑦ của riêng nó, phân đoạn bằng `<Section>`.

---

## 5. Công thức component

Tất cả đã có sẵn trong `Staff.jsx` / `Marketing.jsx` — copy từ đó. Dưới đây là bản rút gọn để đối chiếu.

### 5.1 Header trang

```jsx
<div className="relative flex flex-wrap items-end justify-between gap-4 pt-1 pb-6">
  <div className="min-w-0">
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px]
                    font-extrabold uppercase tracking-[0.14em] text-white mb-3"
         style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
      <Icon className="w-3 h-3" /> Nhãn nhóm
    </div>
    <h1 className="font-display font-extrabold tracking-[-0.03em] text-[32px] sm:text-[38px] leading-none"
        style={{ color: "var(--fg)" }}>
      Tiêu đề trang
    </h1>
    <div className="flex items-center gap-2.5 mt-2.5 text-[13px] flex-wrap"
         style={{ color: "var(--fg-muted)" }}>
      {/* chấm live + số liệu, ngăn bằng • opacity-40 */}
    </div>
  </div>
  <div className="flex items-center gap-2.5">
    {/* nút phụ: h-11 rounded-full border · nút chính: .glowbtn gradient */}
  </div>
</div>
```

Tiêu đề nên **có cá tính** ("Đội ngũ Le Palmier", "Trung tâm Marketing"), không phải nhãn menu khô ("Nhân viên").

### 5.2 Thẻ KPI

Đặc trưng bắt buộc: quầng mờ góc phải trên · ô icon gradient bo 12px có bóng màu · số extrabold · `.lift` + `--glow`.

```jsx
<div className="lift relative rounded-[var(--r)] border p-5 overflow-hidden"
     style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", "--glow": `${from}55` }}>
  <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl opacity-20"
       style={{ background: `linear-gradient(135deg,${from},${to})` }} />
  {/* nhãn 11px uppercase → số 30px extrabold → ô icon 44px gradient */}
  {/* tùy chọn: thanh progress gradient · chip xu hướng */}
</div>
```

### 5.3 Chip lọc gradient

Chưa chọn: nền `--surface`, viền, **chấm gradient** bên trái. Đang chọn: gradient đầy + bóng màu, chấm biến mất, số đếm nền `rgba(255,255,255,.25)`.

### 5.4 Toolbar

Một panel `rounded-[var(--r)]` chứa tất cả: ô tìm `rounded-full h-11` nền `--surface-2`, select pill, segmented. Nút đổi kiểu hiển thị đang chọn dùng gradient thương hiệu.

### 5.5 Thẻ trong lưới

```
avatar viền gradient  ·  tên 15px extrabold  ·  pill phân loại  ·  nút ⋯ (hiện khi hover)
2 dòng liên hệ/mô tả, icon mang màu ink của phân loại
khay chìm rounded-xl · grid 3 chỉ số
chân thẻ: StatusTag  +  chip số liệu
```

Toàn thẻ `.lift` với `--glow` là màu phân loại. Có quầng mờ góc hiện dần khi hover (`opacity-0 group-hover:opacity-25`).

### 5.6 Bảng

Header nền `--surface-2`, chữ `10.5px extrabold uppercase`, không viền dưới riêng. Hàng ngăn bằng `border-t` màu `--border-soft`, hover `bg-ink-50`. Bọc trong `<Panel>` bo 16px, `overflow-x-auto`, `min-w-[820px]`.

### 5.7 Pill trạng thái · phân loại · đánh giá

```jsx
// Trạng thái: nền pastel + chấm màu
<span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[11px] font-extrabold"
      style={{ backgroundColor: c.bg, color: c.ink }}>
  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
  {c.label}
</span>
```

Pill phân loại: `h-6`, nền `soft`, chữ `ink`, có chấm gradient nếu là vai trò.

### 5.8 Avatar

Vòng ngoài gradient (padding 2.5px) → vòng trong. **Luôn vẽ chữ viết tắt làm nền**, ảnh chỉ hiện khi `onLoad` (ảnh ngoài có thể không tải được). Cỡ: 32 (bảng) · 40 (danh sách) · 52 (thẻ) · 64+ (chi tiết).

### 5.9 Segmented · PillSelect

Khay `h-11 p-1 rounded-full` nền `--surface-2`. Nút con `h-9 px-3.5 rounded-full`. Đang chọn: `--surface` + bóng nhẹ (lọc) hoặc gradient + glow (hành động chính).

### 5.10 Section header

```jsx
<div className="flex items-end justify-between gap-4 mt-9 mb-4">
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
         style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})`,
                  boxShadow: "0 6px 14px -7px rgba(139,92,246,.8)" }}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <div className="font-display font-extrabold text-[17px] tracking-tight">{title}</div>
      <div className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{sub}</div>
    </div>
  </div>
  {right}
</div>
```

### 5.11 Panel

Khung `rounded-[var(--r)] border overflow-hidden` nền `--surface`. Có header tùy chọn (tiêu đề 14px + phụ đề), thân `p-5` hoặc để trống nếu chứa bảng/lịch.

### 5.12 Modal

`rounded-[20px]`, backdrop `rgba(15,18,24,.55)` + `blur(6px)`, header có ô icon gradient, footer nền `--surface-2` với nút Hủy (viền) + nút chính (gradient). Copy `Modal` + `ModalFooter` từ `Marketing.jsx`.

Cỡ: `max-w-lg` mặc định, `max-w-2xl` khi `wide`.

### 5.13 Empty state

Icon trong ô **gradient bo 2xl 64px** có class `.floaty` → tiêu đề 16px bold → mô tả 13px → nút gradient "Xóa bộ lọc".

---

## 6. Biểu đồ (Recharts)

| Thành phần | Quy định |
|---|---|
| Area | `fill="url(#gradId)"`, stop đầu opacity `.5–.55`, stop cuối `0`, `strokeWidth={2.5}` |
| Bar | Tô gradient (`<linearGradient>` ngang), `radius={[0,8,8,0]}` hoặc `[8,8,0,0]`, `barSize` 14–18 |
| Donut | `innerRadius={52} outerRadius={86} paddingAngle={3} cornerRadius={6}`, `stroke="var(--surface)" strokeWidth={3}` |
| Radar | `fillOpacity` 0.35 (hiện tại) / 0.12 (mục tiêu), `strokeWidth={2}` |
| Lưới | `stroke="var(--border-soft)"`, `strokeDasharray="3 6"` |
| Trục | `stroke="var(--fg-subtle)"`, `fontSize={10}`, `tickLine={false} axisLine={false}` |
| Tooltip | `chartTip` — nền `#0f1218`, bo 12px, `boxShadow: "0 12px 30px -8px rgba(0,0,0,.45)"` |
| Legend | `fontSize: 11`, `iconType="circle"` |
| Chiều cao | `h-64` chuẩn |

Màu chuỗi lấy từ §2.2. Một chuỗi → gradient thương hiệu. Nhiều chuỗi → theo thứ tự bảng KPI.

---

## 7. Mẫu trang

13 mẫu phủ 25 route. Cấu trúc giữ nguyên từ v2, **chỉ đổi lớp trình bày** sang Vivid Bento.

| Mẫu | Áp dụng cho | Đặc thù |
|---|---|---|
| **A** Danh sách | Bookings · Staff ✅ · Services · Branches · Posts | §4 đầy đủ. Có toggle Thẻ/Bảng |
| **B** Chi tiết | Branches (chi tiết) | Header có ảnh/avatar lớn + tab pill |
| **C** Dashboard | Dashboard | Tối đa 4 khối lớn, không nhồi 17 section |
| **D** Danh sách + panel bên | Guests | Danh sách 2fr / panel 1fr sticky; <1024px thành drawer |
| **E** Sơ đồ lưới dày đặc | Rooms | Ô 64px, nền `--surface`, **chỉ 1 chấm trạng thái**, không tô nền ô |
| **F** Cây phân cấp | PostCategories | Tối đa 3 cấp, thụt 24px |
| **G** Feed + chọn nhiều | Notifications | Nhóm theo ngày, thanh bulk thay chỗ toolbar |
| **H** Form / Cài đặt | Settings · Profile | Nav trái 220px + nội dung max 720px. Toggle lưu ngay, input cần nút Lưu |
| **I** Hội thoại 2 cột | Messages | Danh sách 320px + chat 1fr, bong bóng max 65% |
| **J** Hub nhiều tab | Marketing ✅ · RestaurantOperations · Reports | Tab pill + `<Section>` phân đoạn |
| **K** Trang con báo cáo | 6 trang `/reports/*` | 1 biểu đồ chính + 1 bảng |
| **L** Trang mục lục | ReportDetail | Lưới thẻ gradient |
| **M** Tài liệu | Help | Mục lục sticky 220px + nội dung 760px |
| **N** Xác thực | Login | Ngoài layout, form 480px + ảnh phải |

✅ = đã dựng theo v3, dùng làm tham chiếu.

---

## 8. Bốn trạng thái bắt buộc

Mọi khung nhìn có dữ liệu phải xử lý đủ:

- **Đang tải** — skeleton nền `--surface-3` đúng hình dạng nội dung thật. Không spinner toàn trang.
- **Rỗng** — §5.13. Phân biệt "chưa có dữ liệu" và "bộ lọc không khớp" (cái sau bắt buộc có nút xóa lọc).
- **Lỗi** — khối nền `#ffe6ea` chữ `#be123c`, nêu cách xử lý, có nút "Thử lại".
- **Vô hiệu** — `opacity .4` + `cursor: not-allowed` + `title` giải thích.

---

## 9. Responsive

| Breakpoint | Thay đổi |
|---|---|
| `< 640px` | 1 cột · KPI `grid-cols-2` · toolbar xuống dòng · bảng cuộn ngang · vùng chạm ≥ 44px |
| `sm` | Toolbar bắt đầu nằm ngang |
| `md` | Hiện cột phụ trong bảng · lưới thẻ 2 cột |
| `lg` | KPI 4 cột · lưới thẻ 3 cột · sidebar cố định |
| `xl` | Lưới thẻ 4 cột · KPI 6 cột (trang hub) |

Tiêu đề trang `text-[32px] sm:text-[38px]`. Hàng chip lọc luôn `overflow-x-auto` + `.noscroll`.

---

## 10. Dark mode — hiện trạng và luật

**Hiện trạng:** nền, chữ, viền chạy đúng vì dùng CSS variable. **Chưa tinh chỉnh** phần pastel — các nền `#f1ecfe`, `#d9f9e7`, `#ffe6ea`… là màu sáng cố định, trên nền tối sẽ chói.

**Luật khi viết code mới:**
- Nền/chữ/viền: **luôn** dùng `var(--*)`.
- Gradient: dùng được cả 2 chế độ, giữ nguyên.
- Pastel (`soft`/`bg` của pill): tạm chấp nhận. Khi làm lượt dark mode, chỉ cần sửa các bảng màu ở §2.2 chứ không phải sửa từng trang — **vì vậy không được hardcode pastel rải rác trong JSX, phải để trong bảng màu ở đầu file.**

Nợ riêng: `src/components/Topbar.jsx` còn `bg-white` cứng — computed background trả về `rgb(255,255,255)` kể cả ở dark mode. Cần migrate.

---

## 11. Định dạng dữ liệu

Dùng `src/utils/format.js`, không tự viết lại.

| Ngữ cảnh | Hàm | Ví dụ |
|---|---|---|
| KPI, biểu đồ, thẻ | `formatVND` | `18.45 tỷ` · `2.4 tr` · `612K` |
| Bảng, hóa đơn, tooltip, chi tiết | `formatVNDFull` | `18.450.000.000 VNĐ` |

- Ngày `28/07/2026` · ngày giờ `28/07/2026 09:24` · khoảng `28/07 – 03/08`.
- Thời gian tương đối chỉ trong 24h, quá thì dùng ngày tuyệt đối.
- Phần trăm: 0 chữ số thập phân cho tỉ lệ, 1 chữ số cho tăng trưởng.
- **`0` và "không có dữ liệu" khác nhau**: số không hiển thị `0`, thiếu dữ liệu hiển thị `—`.
- Mọi số: `tabular-nums`.

---

## 12. Từ điển thuật ngữ

Một đối tượng — một tên gọi, dùng thống nhất ở sidebar, tiêu đề trang và nội dung.

| Dùng | Không dùng |
|---|---|
| **Chi nhánh** | khu du lịch, cơ sở, resort |
| **Đặt phòng** | đặt chỗ, booking (trong nhãn UI) |
| **Khách hàng** | khách tham quan, khách lưu trú |
| **Phòng** | phòng & căn, buồng |
| **Nhân viên** | nhân sự (chỉ dùng làm tên nhóm menu) |
| **Tỉ lệ lấp đầy** | công suất, occupancy |
| **Nhận phòng / Trả phòng** | check-in / check-out trong nhãn UI |

Quy tắc chữ: nút = **động từ + danh từ** (`Thêm nhân viên`, `Xuất báo cáo`). Viết hoa chữ đầu câu. Không VIẾT HOA TOÀN BỘ trừ nhãn 10–11px. Thông báo lỗi nói **cách sửa**, không nói mã lỗi.

> ⚠️ `src/components/Sidebar.jsx` hiện vi phạm bảng này ("Khu du lịch", "Đặt chỗ", "Khách tham quan") và badge số sai (ghi 316 nhân viên, thực tế 124). Cần sửa.

---

## 13. Checklist trước khi merge

**Hệ thống**
- [ ] Đã đọc §0 và mở file tham chiếu tương ứng
- [ ] Dùng đúng mẫu trang ở §7
- [ ] Gradient lấy từ §2.2, không tự chế cặp màu
- [ ] Class `.lift` / `.glowbtn` lấy từ `index.css`, không viết `<style>` trong trang

**Token**
- [ ] Không có `bg-white`, `text-ink-*`, `border-ink-*`, `blue-*`, `violet-*` trong code mới
- [ ] Bo góc chỉ `var(--r)` · `rounded-xl` · `rounded-full` · `rounded-[20px]` (modal)
- [ ] Cỡ chữ nằm trong bảng §2.3
- [ ] Bóng mang màu phần tử, không phải đen

**Nội dung**
- [ ] Có đúng một điểm nhìn chính (số KPI hoặc tiêu đề)
- [ ] Số có `tabular-nums`, canh phải trong bảng
- [ ] Tiền/ngày/% theo §11 · phân biệt `0` và `—`
- [ ] Thuật ngữ theo §12 · nút là động từ + danh từ
- [ ] Nhãn trong ô hẹp không bị cắt cụt (kiểm tra ở 1280px)

**Tương tác**
- [ ] Đủ 4 trạng thái §8
- [ ] Rỗng do lọc có nút "Xóa bộ lọc"
- [ ] Đổi bộ lọc reset về trang 1
- [ ] Danh sách > 10 mục có `Pagination`
- [ ] Nút icon-only có `aria-label` + `title`

**Kiểm thử**
- [ ] `npm run build` sạch, `npx oxlint <file>` không cảnh báo
- [ ] Xem thật ở 375px · 768px · 1440px
- [ ] Bật dark mode — không có mảng trắng bất thường
- [ ] Không có lỗi JS trong console (kiểm tra mọi tab nếu là mẫu J)

---

## 14. Trạng thái migrate

| Trang | Trạng thái |
|---|---|
| `Staff.jsx` | ✅ v3 — **file tham chiếu mẫu A** |
| `Marketing.jsx` | ✅ v3 — **file tham chiếu mẫu J** |
| `Rooms.jsx` | ⬜ Ưu tiên 1 — gộp 5 khối lọc thành 1 toolbar, thẻ phòng bỏ nền màu |
| `Guests.jsx` | ⬜ Ưu tiên 2 — mẫu D, gần giống Staff nên nhanh |
| `Bookings.jsx` | ⬜ Ưu tiên 3 — mẫu A, đã có Pagination sẵn |
| `Branches.jsx` | ⬜ Mẫu A + B |
| `Posts.jsx` · `PostCategories.jsx` | ⬜ Mẫu A / F |
| `RestaurantOperations.jsx` | ⬜ Mẫu J, 1820 dòng — nặng nhất |
| `Reports.jsx` + 6 trang `/reports/*` | ⬜ Mẫu J / K |
| `Notifications.jsx` | ⬜ Mẫu G |
| `Settings.jsx` · `Profile.jsx` | ⬜ Mẫu H — cần bổ sung spec form chi tiết khi làm |
| `Messages.jsx` | ⬜ Mẫu I |
| `Help.jsx` · `Login.jsx` | ⬜ Mẫu M / N |
| `Dashboard.jsx` | ⬜ Làm cuối — cần cắt từ 17 khối xuống 4 trước khi restyle |

---

## 15. Nợ kỹ thuật đã biết

1. **Cài đặt "Mật độ" không hoạt động** — `ThemeContext.jsx` ghi attribute `data-density`, `index.css` lại viết selector class `.density-compact`. Chọn một trong hai.
2. **`Sidebar.jsx`** — badge số sai (316 nhân viên / 1.2K phòng, thực tế 124 / 713) và thuật ngữ trái §12.
3. **`Topbar.jsx`** — `bg-white` cứng, hỏng dark mode; breadcrumb ghi "Dashboard" cố định; tên người dùng hardcode thay vì đọc `useAuth()`.
4. **Chưa tách component dùng chung** — `KpiCard`, `Avatar`, `Segmented`, `PillSelect`, `Modal`, `Section`, `StatusTag` hiện nằm trong `Staff.jsx` / `Marketing.jsx`. Khi migrate trang thứ ba, **tách ngay** sang `src/components/` thay vì copy lần thứ ba.
5. **Bundle 1 chunk 1.88 MB** — chưa code-splitting theo route.
6. **`vite.config.js` thiếu `@vitejs/plugin-react`** — build chạy được nhưng mất Fast Refresh.
7. **`AppearanceModal.jsx`, `StatCard.jsx`** — không được import ở đâu, nên xóa.

---

## 16. Tóm tắt

> **Hình thức:** thẻ trắng bo 16px trên nền xám sâu, gradient 135° lấy từ bảng cố định, ô icon gradient có bóng màu, hover nhấc 5px kèm bóng mang chính màu đó. Control bo tròn hoàn toàn. Số liệu extrabold, to áp đảo.
>
> **Màu:** mã hóa phân loại — vai trò, kênh, danh mục, trạng thái mỗi thứ một gradient, **giữ nguyên xuyên suốt mọi trang**.
>
> **Bố cục:** header có cá tính → KPI bento → chip lọc → toolbar một hàng → nội dung → phân trang.
>
> **Cách làm:** copy công thức từ `Staff.jsx` và `Marketing.jsx`. Đừng sáng tác lại.
