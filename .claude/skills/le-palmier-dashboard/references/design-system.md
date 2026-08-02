# Design system — Condo HUB

Toàn bộ định nghĩa nằm ở `src/index.css`. Hệ màu điều khiển bởi 2 thuộc tính trên `<html>`: `data-theme` (`light` | `dark`) × `data-accent` (`navy` | `green` | `purple` | `orange` | `red` | `amber`) → 12 tổ hợp. Viết CSS/JSX sai token là vỡ 11/12 tổ hợp còn lại.

## 1. CSS variables

**Bề mặt & chữ**

| Var | Ý nghĩa |
| --- | --- |
| `--bg-app` | nền toàn trang |
| `--surface` | nền card/panel |
| `--surface-2` | nền chìm (header bảng, vùng phụ) |
| `--surface-3` | nền hover / chip trung tính |
| `--border` | viền chuẩn |
| `--border-soft` | viền nhạt (chia dòng bảng) |
| `--fg` | chữ chính |
| `--fg-muted` | chữ phụ |
| `--fg-subtle` | chữ mờ / placeholder |
| `--on-accent` | chữ/icon nằm trên nền accent — trắng ở light, **tối (`#0b0e14`) ở dark** vì accent dark là sắc pastel sáng |

**Accent** — `--accent`, `--accent-strong`, `--accent-soft`, `--accent-fg`, `--accent-hover`

⚠️ `--accent-strong` **không phải lúc nào cũng đậm hơn**: ở light nó đậm hơn `--accent`, nhưng ở dark nó *sáng hơn* (navy: `#93c5fd` so với `#60a5fa`). Muốn gradient nút đậm dần thì dùng cặp `--accent → --accent-hover`, cặp này đậm dần ở cả hai theme.

Chữ đè lên nền accent luôn dùng `var(--on-accent)`, không dùng `text-white` — token này đã tự đảo màu theo theme để giữ tương phản ≥ 4.5:1.

**Semantic** — mỗi tone có 4 biến `--<tone>`, `--<tone>-soft`, `--<tone>-fg`, `--<tone>-border`, với tone ∈ `success` `warning` `danger` `info` `highlight` `neutral`.

`neutral` được định nghĩa trong `:root` bằng cách trỏ tới token bề mặt (`--surface-3`, `--fg-muted`, …) nên tự đúng ở mọi theme. Nhờ vậy mẫu dựng biến động `var(--${tone}-soft)` từ tên tone hoạt động với **cả 6 tone** — trước đây thiếu bộ `--neutral-*` nên mọi phần tử `tone="neutral"` render mất nền/viền/chữ. `accent` cũng dùng được với mẫu này (`--accent-soft`, `--accent-fg`), nhưng **không có `--accent-border`** — cần viền thì lấy `TONE.accent.border`.

Dùng inline style khi cần token:

```jsx
<div style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }} />
```

**Layout scale**: `--font-scale` (theo cỡ chữ trong Settings) và `--density-scale`. Đừng đặt `font-size` tuyệt đối cho text lớn của trang.

## 2. Class dựng sẵn (`@layer components`)

| Class | Dùng cho |
| --- | --- |
| `.card` | khung bo góc + shadow + viền theo theme |
| `.btn-primary` | nút hành động chính (nền accent) |
| `.btn-outline` | nút phụ có viền |
| `.btn-ghost` | nút chìm, không viền |
| `.input` | input/select/textarea (có focus ring accent) |
| `.badge` | chip nhỏ inline |
| `.stat-card` | ô KPI (`.card` + padding) |
| `.table-th` / `.table-td` | ô header / ô dữ liệu của bảng |

Ưu tiên các class này thay vì tự dựng lại bằng utility.

## 3. Alias `ink-*` / `brand-*` — dùng được, nhưng có giới hạn

`index.css` override một tập hữu hạn utility Tailwind về CSS var để chúng tự đổi theo dark mode. **Chỉ những class trong danh sách này mới an toàn**, class ngoài danh sách sẽ render màu tĩnh:

- Bề mặt: **`bg-white`**, `hover:bg-white`, `focus:bg-white` → `--surface`
- Chữ: `text-ink-300` → `text-ink-900`
- Nền: `bg-ink-50`, `bg-ink-100`, `bg-ink-200`, **`bg-ink-300`, `bg-ink-400`, `bg-ink-500`**, `bg-ink-50/40`, `bg-ink-50/60`, `bg-ink-50/70`, `bg-ink-50/80`, `bg-ink-100/80`, `disabled:bg-ink-300`
- Viền: `border-ink-100`, `border-ink-200`, `border-ink-300`, `border-ink-400`
- Hover: `hover:bg-ink-50`, `hover:bg-ink-100`, `hover:bg-ink-50/30`, `hover:bg-ink-50/40`, `hover:bg-ink-100/30`
- Chia: `divide-ink-100`
- Ring: `ring-white`, `ring-ink-100`, `ring-ink-200`, `ring-brand-100`, `ring-brand-200`
- Brand nền: `bg-brand-50/100/200/500/600/700/800/900`, `bg-brand-gradient`
- Brand chữ: `text-brand-600/700/800/900`
- Brand viền: `border-brand-100`, `border-brand-200`, `border-brand-300`
- Brand hover/focus: `hover:bg-brand-50`, `hover:text-brand-700`, `hover:border-brand-300/400/500/600`, `focus:border-brand-600`
- Chữ trên nền accent: **`text-on-accent`** → `--on-accent`

Cần sắc độ khác (ví dụ `text-brand-500`) thì **dùng inline style với CSS var**, đừng thêm class mới rồi hy vọng nó tự đúng.

`bg-white/10`, `bg-white/20`… là **class khác** và không bị alias — chúng vẫn là trắng thật, đúng cho hiệu ứng kính trên ảnh tối.

## 4. Không dùng

- `text-black`, `bg-gray-*`, `border-gray-*` — không theo theme.
- `text-white` khi nền là `bg-brand-*` hoặc một tone solid → ở dark mode nền là sắc pastel sáng. Dùng `text-on-accent`.
- Mã hex/`rgb()` viết thẳng trong JSX cho màu giao diện.
- Class `dark:` của Tailwind — dự án không bật `darkMode` trong `tailwind.config.js`, theme đi qua `data-theme` + CSS var.

Ngoại lệ **cố ý**, giữ nguyên, đừng nhân rộng:

- Bảng màu cứng theo *danh mục nghiệp vụ*: `TIER_COLORS` (`pages/Guests.jsx`), `CATEGORY_COLORS` (`pages/Services.jsx`), `roomStatuses[].color` (`mockData.js`), `accents` (`components/StatCard.jsx`), các chip `slate-*` cho hạng "Bạc" và huy chương hạng 2. Đây là chip sáng + chữ đậm, tự nhất quán ở cả hai theme.
- `bg-ink-700/800/900` (kể cả `bg-ink-900/40`, `/60`, `/80`) — **luôn** đi kèm `text-white` để tạo chip/lớp phủ tối, vốn đã đúng ở cả hai theme. Cố tình không alias.

## 5. Component semantic (`src/components/Semantic.jsx`)

Tone hợp lệ: `success` `warning` `danger` `info` `highlight` `accent` `neutral`.

```jsx
import { StatusPill, Trend, AccentPill, ToneBox, ToneDot, ToneAlert, InlineLabel, TONE } from "../components/Semantic";

<StatusPill tone="success" icon={Icons.Check}>Đã xác nhận</StatusPill>
<StatusPill tone="danger" solid>Đã hủy</StatusPill>

<Trend value={12.4} />                        {/* +12.4% — xanh */}
<Trend value={-3.1} size="lg" label="so với tháng trước" />

<ToneAlert tone="warning" icon={Icons.AlertTriangle}
           title="Tỷ lệ lấp đầy giảm" desc="Chi nhánh Tây Ninh giảm 8% tuần này" metric="-8%" />

<ToneDot tone="info" />
<ToneBox tone="neutral">…</ToneBox>
<InlineLabel tone="highlight">Mới</InlineLabel>
```

`TONE[tone]` trả `{ bg, fg, border, solid }` (đều là chuỗi `var(--…)`) — dùng khi cần tự style một khối theo tone.

Ánh xạ ngữ nghĩa quen thuộc trong dự án: `success` = hoàn tất/đang hoạt động · `warning` = chờ xử lý/bảo trì · `danger` = hủy/lỗi · `info` = thông tin/trống · `highlight` = nhấn mạnh, khuyến mãi · `neutral` = đã kết thúc.

## 6. Component bố cục

```jsx
<PageHeader title="Quản lý khách hàng" subtitle="240 khách · 5 hạng thẻ" actions={<>…</>} />

<Card title="Doanh thu 12 tháng" subtitle="Đơn vị: tỷ đồng" action={<button className="btn-ghost">Xem tất cả</button>}>
  …
</Card>

<StatCard title="Doanh thu tháng" value={formatVND(18_450_000_000)} delta="+12.4%" deltaDir="up"
          icon={Icons.TrendingUp} accent="brand" sub="So với tháng trước" />
```

`StatCard.accent`: `brand` | `blue` | `amber` | `violet` | `rose` | `ink`.

## 7. Typography & responsive

- Tiêu đề dùng `font-display` (Plus Jakarta Sans); phần còn lại mặc định Inter.
- Cỡ chữ trong dự án viết dạng bracket: `text-[13px]`, `text-[11px]`, `text-[10px]` — bám theo thang này, đừng trộn `text-sm`/`text-xs` tùy tiện.
- Mobile-first: khai báo cỡ nhỏ trước rồi tăng dần (`p-3 sm:p-5`, `text-[20px] sm:text-[24px]`, `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`).
- Vùng bấm trên mobile tối thiểu `min-h-[40px]`.
- Text dài phải có `truncate` hoặc `break-words` + cha `min-w-0`, nếu không sẽ tràn ngang (`main` đã đặt `overflow-x-hidden`).
