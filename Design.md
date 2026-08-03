# Condo HUB — Design System v4 · "Palmier Riviera"

> Ngôn ngữ thiết kế chuẩn cho toàn bộ hệ thống quản trị Condo HUB.
> *Palmier* là mã hiệu của ngôn ngữ thiết kế, không phải tên sản phẩm —
> tên sản phẩm trong mọi nhãn UI vẫn là **Condo HUB**.
> **Mọi trang mới và mọi PR sửa UI phải tuân theo file này.**
> Cập nhật 02/08/2026 · Thay thế hoàn toàn v3 "Vivid Bento".

---

## 0. Đọc trước khi viết bất kỳ dòng UI nào

Nếu bạn là AI agent được giao dựng hoặc sửa một trang:

1. **Đọc hết file này.**
2. **Import component từ `src/components/ui/`** — đó là nguồn sự thật, quan trọng hơn mọi mô tả bằng chữ ở đây. Không copy-paste component giữa các trang nữa.
3. **Mở hai file tham chiếu** để xem cách ghép chúng lại:
   - `src/pages/Staff.jsx` — mẫu **trang danh sách**
   - `src/pages/Marketing.jsx` — mẫu **trang hub nhiều tab**
4. Không tự chế màu. Mọi màu đến từ CSS variable hoặc `usePalette()`.
5. Code xong chạy checklist §14.

Quy tắc vàng: **nếu hai trang cùng loại mà nhìn khác nhau, là sai.**

### Điều gì đã đổi so với v3

v3 là ngôn ngữ SaaS Mỹ: gradient 135° rực rỡ, bo tròn hoàn toàn, bóng đổ có màu, 7 màu cầu vồng mã hóa phân loại, hover nhấc 5px. v4 đi ngược lại toàn bộ.

| | v3 "Vivid Bento" | v4 "Riviera" |
|---|---|---|
| Nền | xám lạnh `#e9ecf2` | giấy ngà ấm `#EEEAE1` |
| Bề mặt | trắng tinh `#ffffff` | trắng ấm `#FBFAF7` |
| Nhấn | gradient indigo→tím | một màu nhà phẳng, không gradient |
| Bo góc | `rounded-full` khắp nơi | 6px thẻ · 4px control · tròn chỉ cho avatar |
| Bóng | bóng màu, hover nhấc 5px | gần như không bóng, hover chỉ đổi nền |
| Tiêu đề | sans extrabold 38px | **serif regular 40px** |
| Màu phân loại | 7 gradient rực | 7 sắc đất cùng dải sáng |
| Phân cấp | bằng màu và độ đậm | bằng cỡ chữ, khoảng trắng, đường kẻ |

---

## 1. Nguyên tắc

**1. Giấy, mực, và một chút kim loại.**
Ba vật liệu, không hơn. Nền là giấy ngà. Chữ là mực than. Nhấn là *một* màu nhà, cộng đồng thau dùng dè như dập nhũ trên bìa thực đơn. Mỗi lần bạn định thêm màu thứ tư, hãy dùng khoảng trắng.

**2. Phân cấp bằng chữ, không bằng màu.**
Màu chỉ mang **ngữ nghĩa** (thành công / cảnh báo / lỗi) hoặc **phân loại**. Cấp bậc thị giác đến từ cỡ chữ, độ đậm, khoảng trắng và đường kẻ. Một thẻ quan trọng hơn không phải vì nó tím, mà vì con số trong nó to gấp ba.

**3. Đường kẻ thay cho hộp.**
Ưu tiên đường kẻ tóc 1px và khoảng trắng hơn là bao mọi thứ trong hộp có bóng. Bốn ô KPI là **một** panel chia bằng vạch dọc, không phải bốn thẻ trôi nổi.

**4. Khoảng trắng là thứ đắt tiền nhất.**
Padding thẻ 24px, không phải 20px. Giữa hai khối lớn 48px. Nếu trang trông trống, đó là đang đúng.

**5. Chuyển động kín đáo.**
Không nhấc thẻ, không quầng sáng. Hover đổi nền một bậc hoặc hiện vạch đồng thau. 160ms. Người dùng mở phần mềm này 40 lần một ngày — chuyển động phải vô hình.

**6. Con số là nội dung chính.**
Mọi con số dùng `tabular-nums`, canh phải trong bảng, có đường kẻ mảnh bên dưới khi đứng một mình.

---

## 2. Design tokens

### 2.1 Bề mặt & chữ — luôn dùng CSS variable

Khai báo trong `src/index.css`, tự đổi theo sáng/tối và bộ sưu tập màu người dùng chọn.

| Token | Sáng | Tối | Vai trò |
|---|---|---|---|
| `--bg-app` | `#EEEAE1` | `#131410` | Nền trang — giấy |
| `--surface` | `#FBFAF7` | `#1B1D18` | Nền thẻ, panel, modal, dropdown |
| `--surface-2` | `#F4F1EA` | `#22241E` | Khay chìm, header bảng, ô input |
| `--surface-3` | `#E9E4D9` | `#2C2F27` | Hover, nền thanh tiến trình |
| `--border` | `#DED8CB` | `#33362D` | Viền tóc 1px |
| `--border-soft` | `#EBE6DC` | `#262922` | Ngăn giữa hàng bảng, divider trong thẻ |
| `--fg` | `#191C16` | `#EDEAE1` | Tên, giá trị, số |
| `--fg-muted` | `#4E534A` | `#A8A99F` | Mô tả, nhãn cột, chữ phụ |
| `--fg-subtle` | `#6E7368` | `#85877D` | Placeholder, nhãn 10px, timestamp |

Cả `--fg-muted` và `--fg-subtle` đều đạt ≥ 4.5:1 trên `--surface` ở **cả hai** chế độ — khác v3, nơi `--fg-subtle` chỉ đạt 3.0:1. Được phép dùng cho chữ nhỏ.

**Cấm** `bg-white`, `text-ink-900`, `border-ink-200`, `bg-blue-700` trong code mới. Dùng `style={{ backgroundColor: "var(--surface)" }}`.

### 2.2 Bốn bộ sưu tập màu

Thay cho 6 accent + chế độ Đa sắc của v3. Người dùng chọn trong **Cài đặt → Giao diện**. Mỗi bộ là một cặp *màu nhà* + *kim loại* đã phối sẵn — không thể chọn ra tổ hợp xấu.

| id | Tên | Màu nhà (sáng) | Màu nhà (tối) | Kim loại | Cảm giác |
|---|---|---|---|---|---|
| `olive` | **Ô-liu & Đồng thau** *(mặc định)* | `#2F4A3C` | `#8FB39B` | `#A8834B` | Vườn Provence, khách sạn miền quê |
| `bordeaux` | **Bordeaux & Xương** | `#5B2434` | `#C89099` | `#A8834B` | Hầm rượu, phòng ăn tối |
| `marine` | **Hải quân & Cát** | `#1F3A5F` | `#8FAECC` | `#B08D57` | Bờ biển Côte d'Azur |
| `noir` | **Noir & Champagne** | `#252420` | `#CFC9BC` | `#B99A5B` | Sảnh khách sạn về đêm |

Token dẫn xuất, dùng trực tiếp:

| Token | Vai trò |
|---|---|
| `--accent` | Nút chính, vạch tab đang chọn, liên kết |
| `--accent-strong` | Trạng thái `:hover` của nút chính, tiêu đề trên nền nhạt |
| `--accent-soft` | Nền pill, hàng bảng được chọn, vùng biểu đồ |
| `--accent-fg` | Chữ trên nền `--accent-soft` |
| `--on-accent` | Chữ/icon trên nền `--accent` |
| `--metal` | **Kim loại.** Vạch chỉ mục đang hoạt động, dấu góc, ngôi sao đánh giá, chuỗi biểu đồ được nhấn |
| `--metal-soft` | Nền huy hiệu kim loại |
| `--metal-fg` | Chữ trên nền `--metal-soft` |

> ⚠️ **Kim loại dùng dè.** Tối đa 2–3 chỗ trên một màn hình. Nó là dập nhũ, không phải màu nền. Không bao giờ tô kín một vùng lớn bằng `--metal`.

### 2.3 Màu ngữ nghĩa — không đổi theo bộ sưu tập

Sắc tố tự nhiên, không phải màu neon. Đây là điểm phân biệt rõ nhất với v3.

| Ý nghĩa | `--x` | `--x-soft` | `--x-fg` | Ghi chú |
|---|---|---|---|---|
| `success` | `#2E6B4F` | `#E2ECE5` | `#245540` | Xanh thông, không phải emerald |
| `warning` | `#9A6B18` | `#F5EBD8` | `#7C5512` | Hoàng thổ, không phải amber |
| `danger` | `#9B3B36` | `#F4E4E1` | `#82302C` | Đất nung, không phải đỏ tươi |
| `info` | `#35566E` | `#E3EAEF` | `#2B4658` | Xanh đá phiến |
| `neutral` | `#6E7368` | `#ECE8DF` | `#4E534A` | Xám ô-liu |

Lấy qua `TONE` trong `src/theme/palette.js`, hoặc `var(--success-soft)` v.v. Ở chế độ tối các bộ này tự đảo — **không được hardcode hex pastel trong JSX.**

### 2.4 Màu phân loại — bảng đất

Vai trò nhân viên, danh mục bài viết, hạng phòng, nguồn đặt phòng. **Giống nhau ở mọi bộ sưu tập**, để người dùng đổi bộ màu vẫn nhận ra "màu của bộ phận Lễ tân".

| # | Tên | hex | Dùng cho (ví dụ) |
|---|---|---|---|
| 1 | Ô-liu | `#3E5C49` | Quản lý |
| 2 | Đồng thau | `#A8834B` | Lễ tân |
| 3 | Đất nung | `#9B5B45` | Buồng phòng |
| 4 | Đá phiến | `#465A6B` | Ẩm thực |
| 5 | Mận | `#6B4557` | An ninh |
| 6 | Xô thơm | `#7E8F6E` | Kỹ thuật |
| 7 | Đất sét | `#8C6F5C` | Kế toán |

Bảy sắc này nằm cùng một dải độ sáng (L\* 38–50) nên đứng cạnh nhau không cái nào át cái nào — đọc như một bộ mẫu sơn, không như hộp bút màu.

Lấy qua `usePalette()`:

```jsx
import { usePalette, TONE, scoreTone } from "../theme/palette";

function MyPage() {
  const { house, metal, series, seriesMap } = usePalette();

  const KPI  = useMemo(() => series(4), [series]);
  const ROLE = useMemo(() => seriesMap(ROLE_KEYS), [seriesMap]);

  // house.base / .strong / .soft / .fg   → nút chính, tab, liên kết
  // metal.base / .soft / .fg             → vạch nhấn, huy hiệu
  // ROLE[key].base / .soft / .fg         → chấm phân loại · nền pill · chữ pill
}
```

Mỗi phần tử có **3** giá trị (`base`, `soft`, `fg`) — không còn `from`/`to` vì **v4 không dùng gradient**.

Cần phân loại mới? Thêm khóa vào mảng truyền cho `seriesMap()` — không thêm hex.

### 2.5 Gradient

**Không dùng.** Ba ngoại lệ duy nhất:

1. Vùng tô dưới đường biểu đồ (`<Area>`) — dọc, từ `--accent` opacity .14 xuống 0.
2. Lớp phủ đọc chữ trên ảnh — dọc, đen trong suốt → đen 62%.
3. Skeleton đang tải — vệt sáng chạy ngang.

Gradient 135° hai màu của v3 **đã bị gỡ bỏ**. Nếu bạn thấy nó trong một trang, trang đó chưa migrate.

### 2.6 Chữ

Hai họ chữ:

- `font-display` = **Playfair Display** — chỉ dùng cho tiêu đề trang, tiêu đề section, và số liệu lớn trong trang mục lục/báo cáo. **Luôn weight 400 hoặc 500.** Playfair ở weight 700+ trông rẻ tiền.
- Mặc định = **Inter** — mọi thứ còn lại, kể cả số KPI.

| Vai trò | Họ | Cỡ | Weight | Ghi chú |
|---|---|---|---|---|
| Tiêu đề trang | display | `36px` / `sm:44px` | `400` | `tracking-[-0.015em] leading-[1.05]` |
| Tiêu đề section | display | `22px` | `400` | `tracking-[-0.01em]` |
| Số KPI lớn | sans | `32px` | `500` | `tabular-nums tracking-[-0.02em]` |
| Số KPI nhỏ | sans | `24px` | `500` | `tabular-nums` |
| Tên đối tượng trong thẻ | sans | `15px` | `600` | |
| Tiêu đề panel | sans | `13px` | `600` | `uppercase tracking-[0.08em]` |
| Body, ô bảng | sans | `13px` | `400` / `500` | |
| Chip, pill, chú thích | sans | `11–12px` | `500` | |
| Nhãn lông mày (eyebrow) | sans | `10px` | `600` | `uppercase tracking-[0.16em]` màu `--fg-subtle` |

**Không dùng `extrabold`/`font-black` ở bất kỳ đâu.** Trần là `600`. Đây là thay đổi lớn so với v3, nơi mọi thứ đều `extrabold`.

Mọi con số: `tabular-nums`. Số trong bảng: canh phải.

### 2.7 Khoảng cách

Thang **4 · 8 · 12 · 16 · 24 · 32 · 48 · 64**.

| Vị trí | Giá trị |
|---|---|
| Padding thẻ / panel | `p-6` (24px) · panel nhỏ `p-5` |
| Padding ô bảng | `px-5 py-3.5` |
| Khay chìm trong thẻ | `p-4` |
| Giữa các thẻ trong grid | `gap-4` |
| Giữa hai khối lớn | `mt-12` (48px) |
| Header trang → nội dung | `pb-8` |
| Chiều rộng tối đa nội dung | `1320px` |

### 2.8 Bo góc

| Đối tượng | Giá trị |
|---|---|
| Thẻ, panel, bảng, modal | `rounded-[var(--r)]` = **6px** |
| Nút, input, select, tag, tab, khay | `rounded-[var(--r-sm)]` = **4px** |
| Avatar, chấm trạng thái, nút icon tròn | `rounded-full` |
| Ảnh bìa, biểu đồ | `rounded-[var(--r)]` |

**Không dùng** `rounded-full` cho nút hoặc input nữa — đó là dấu hiệu rõ nhất của v3. Cũng không dùng `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`.

### 2.9 Viền & bóng

Viền là công cụ chính. Bóng gần như không tồn tại.

```css
--shadow-card:  0 1px 2px rgba(25,28,22,.04);
--shadow-pop:   0 16px 48px -24px rgba(25,28,22,.28);   /* dropdown, popover */
--shadow-modal: 0 32px 80px -32px rgba(25,28,22,.42);
```

| Đối tượng | Xử lý |
|---|---|
| Thẻ, panel | `border 1px --border` + `--shadow-card` |
| Thẻ nổi bật | thêm viền `--accent` thay vì thêm bóng |
| Dropdown, popover | `--shadow-pop` + viền |
| Modal | `--shadow-modal` + viền |
| Hover thẻ | đổi `borderColor` sang `--fg-subtle`, **không** đổi transform |

**Không có bóng màu.** Không `boxShadow` mang màu của phần tử. Đó là v3.

### 2.10 Chuyển động

| Hiệu ứng | Giá trị |
|---|---|
| Hover nền / viền | `.16s cubic-bezier(.2,.6,.2,1)` |
| Vạch đồng thau chỉ mục đang chọn | `transform: scaleX()` `.22s` |
| Mở modal / drawer | opacity + `translateY(6px)` `.2s` |
| Chấm live | nhấp nháy opacity `2s`, **không** `animate-ping` |
| Skeleton | vệt sáng chạy `1.4s` |

Biến dùng chung: `--ease: cubic-bezier(.2,.6,.2,1)`.

`@media (prefers-reduced-motion: reduce)` đã tắt toàn bộ — không cần xử lý thêm.

---

## 3. Sáu chi tiết nhận diện

Đây là thứ khiến người ta nhìn một ảnh chụp màn hình và biết đó là Le Palmier. Nếu trang bạn dựng không có ít nhất ba trong sáu thứ này, nó chưa đúng ngôn ngữ.

**① Nhãn lông mày + đường kẻ tóc.**
Trên mọi tiêu đề section: nhãn 10px IN HOA giãn chữ, rồi đường kẻ 1px chạy hết chiều ngang, rồi mới tới tiêu đề serif.

```jsx
<div className="text-[10px] font-semibold uppercase tracking-[0.16em]"
     style={{ color: "var(--fg-subtle)" }}>Vận hành</div>
<div className="h-px my-3" style={{ backgroundColor: "var(--border)" }} />
<h2 className="font-display text-[22px]" style={{ color: "var(--fg)" }}>Tỉ lệ lấp đầy</h2>
```

**② Vạch đồng thau chỉ mục đang hoạt động.**
Mục sidebar đang mở, tab đang chọn, hàng bảng đang xem — đánh dấu bằng vạch `2px` màu `--metal`, không phải bằng nền đầy màu.

**③ Tiêu đề serif weight thường.**
Playfair Display 400 ở 44px. Không bao giờ in đậm.

**④ Dải KPI liền khối.**
Bốn chỉ số nằm trong **một** panel, chia bằng vạch dọc `1px`, không phải bốn thẻ rời có bóng.

**⑤ Số liệu có đường kẻ chân.**
Con số lớn đứng một mình luôn có `border-top` mảnh phía trên hoặc `border-bottom` phía dưới nhóm, như bảng giá in.

**⑥ Dấu góc.**
Thẻ được nhấn mạnh (thẻ chi nhánh nổi bật, thẻ trong empty state) có bốn dấu góc chữ L 8px màu `--metal`, gợi dấu xén trong in ấn. Class `.corners`. Dùng tối đa **một** chỗ mỗi màn hình.

---

## 4. Class tiện ích toàn cục

Khai báo ở cuối `src/index.css`. **Dùng trực tiếp, không tự viết lại trong `<style>` của trang.**

| Class / biến | Tác dụng |
|---|---|
| `--r` / `--r-sm` | 6px / 4px |
| `--ease` | `cubic-bezier(.2,.6,.2,1)` |
| `.hairline` | Đường kẻ 1px màu `--border`, dùng thay `<hr>` |
| `.rule-eyebrow` | Cụm nhãn lông mày + kẻ tóc (chi tiết ①) |
| `.mark` | Vạch đồng thau chỉ mục đang chọn (chi tiết ②) |
| `.corners` | Bốn dấu góc chữ L đồng thau (chi tiết ⑥) |
| `.card-hover` | Hover đổi màu viền, không transform |
| `.noscroll` | Ẩn thanh cuộn cho hàng cuộn ngang |
| `.skeleton` | Nền + vệt sáng chạy cho trạng thái đang tải |
| `.tnum` | `font-variant-numeric: tabular-nums` |

### 4.1 Nền trang — phẳng

Nền trang là **một màu phẳng `var(--bg-app)`**. Không vệt sáng, không gradient wash, không hoa văn, không canvas.

```jsx
<div className="max-w-[1320px] mx-auto pb-16">
```

> **Ba thứ đã thử và đã gỡ bỏ, đừng làm lại:**
> 1. **Canvas 3D động** phản ứng theo chuột — nhiễu, không tăng giá trị.
> 2. **Vệt gradient tím** ở đầu trang — làm nền bẩn.
> 3. **Quầng gradient mờ trong góc thẻ KPI** (v3) — với bảng màu đất nó biến thành vệt bùn.

---

## 5. Bố cục trang chuẩn

```
<div className="max-w-[1320px] mx-auto pb-16">

  ① HEADER      nhãn lông mày · tiêu đề serif 44px · dòng số liệu · nút hành động
  ② KẺ TÓC      đường 1px hết chiều ngang
  ③ DẢI KPI     một panel, 2–6 cột chia bằng vạch dọc
  ④ TOOLBAR     panel một hàng: tìm kiếm + select + segmented
  ⑤ NỘI DUNG    bảng / lưới thẻ / nội dung tab
  ⑥ PAGINATION

</div>
```

Trang nhiều tab chèn hàng **tab có vạch đồng thau** ngay sau ②, rồi mỗi tab tự chạy ③–⑥, phân đoạn bằng `<SectionHead>`.

Khác v3: **không còn hàng chip lọc gradient cuộn ngang.** Bộ lọc phân loại nằm trong `<Select>` của toolbar. Nếu thực sự cần chip, dùng `<Tag>` phẳng có viền.

---

## 6. Component — import, đừng copy

Tất cả ở `src/components/ui/`. Đây là nguồn sự thật; phần dưới chỉ để đối chiếu nhanh.

| Component | Dùng cho |
|---|---|
| `PageHeader` | ① — nhãn lông mày, tiêu đề serif, dòng meta, vùng nút |
| `SectionHead` | Nhãn lông mày + kẻ + tiêu đề serif + mô tả + vùng phải |
| `StatStrip` / `Stat` | ③ — dải KPI liền khối chia bằng vạch dọc |
| `Panel` | Khung có viền, header tùy chọn |
| `Toolbar` | ④ — hàng tìm kiếm + lọc |
| `Button` | `variant`: `primary` \| `outline` \| `ghost` \| `danger` · `size`: `sm` \| `md` |
| `Input` `Select` `Field` | Điều khiển form, cao 40px, bo 4px |
| `Segmented` | Chuyển đổi 2–4 lựa chọn |
| `Tabs` | Tab có vạch đồng thau |
| `Tag` | Nhãn phân loại phẳng, có viền |
| `StatusTag` | Nhãn trạng thái ngữ nghĩa, có chấm |
| `Avatar` | Chữ viết tắt làm nền, ảnh chỉ hiện khi `onLoad` |
| `Table` `Th` `Td` | Bảng — header `--surface-2`, hàng ngăn bằng `--border-soft` |
| `Modal` | Bo 6px, backdrop mờ, footer nền `--surface-2` |
| `EmptyState` | Icon nhẹ + tiêu đề serif + nút |
| `Skeleton` | Trạng thái đang tải |

### 6.1 PageHeader

```jsx
<PageHeader
  eyebrow="Nhân sự"
  title="Đội ngũ Condo HUB"
  meta={[`${total} nhân viên`, `${branches} chi nhánh`, "Cập nhật 09:24"]}
  actions={<>
    <Button variant="outline" icon={Download}>Xuất danh sách</Button>
    <Button icon={Plus}>Thêm nhân viên</Button>
  </>}
/>
```

Tiêu đề nên **có cá tính** ("Đội ngũ Condo HUB", "Trung tâm Marketing"), không phải nhãn menu khô ("Nhân viên"). `meta` ngăn nhau bằng dấu `·` mờ.

### 6.2 StatStrip — dải KPI

Đặc trưng bắt buộc: **một** khung viền, các cột chia bằng `border-left` 1px, nhãn lông mày ở trên, số 32px `tabular-nums` ở dưới, biến động là chữ nhỏ có mũi tên. Không icon gradient, không quầng mờ, không bóng màu.

```jsx
<StatStrip>
  <Stat label="Tỉ lệ lấp đầy" value="87,4%" delta={+2.1} />
  <Stat label="Doanh thu tháng" value="18,45 tỷ" delta={+5.4} />
  <Stat label="Đặt phòng mới" value="320" delta={-1.2} />
  <Stat label="Đánh giá" value="4,8" hint="trên 1.204 lượt" />
</StatStrip>
```

`delta` dương dùng `--success`, âm dùng `--danger`, **chỉ tô chữ và mũi tên**, không tô nền.

### 6.3 Button

| variant | Nền | Chữ | Viền |
|---|---|---|---|
| `primary` | `--accent` | `--on-accent` | không |
| `outline` | `--surface` | `--fg` | `--border` → hover `--fg-subtle` |
| `ghost` | trong suốt | `--fg-muted` | không, hover nền `--surface-3` |
| `danger` | `--danger-soft` | `--danger-fg` | `--danger-border` |

Cao `40px` (`md`) / `32px` (`sm`), bo 4px, chữ 13px weight 500. Nhãn là **động từ + danh từ**.

### 6.4 Tabs

Hàng tab phẳng, chữ 13px. Tab đang chọn: chữ `--fg`, vạch `2px` màu `--metal` ở đáy, chạy `scaleX` khi đổi. Tab chưa chọn: chữ `--fg-subtle`. Không nền, không pill, không gradient.

### 6.5 Tag & StatusTag

```jsx
// Phân loại — phẳng, viền mảnh, có chấm màu phân loại
<Tag dot={ROLE[key].base}>{ROLE[key].label}</Tag>

// Trạng thái — nền ngữ nghĩa mờ, có chấm
<StatusTag tone="success">Đang hoạt động</StatusTag>
```

Cao `24px`, bo 4px, chữ 11px weight 500. `Tag` nền `--surface-2` viền `--border`. `StatusTag` nền `--{tone}-soft` chữ `--{tone}-fg`.

### 6.6 Bảng

Header nền `--surface-2`, chữ `10px` weight 600 IN HOA giãn `0.12em`, màu `--fg-subtle`. Hàng ngăn bằng `border-top` màu `--border-soft`, hover nền `--surface-2`. Hàng đang chọn có vạch `--metal` 2px bên trái. Bọc trong `<Panel>`, `overflow-x-auto`, `min-w-[880px]`.

Cột số canh phải, `tabular-nums`. Cột hành động canh phải, nút `ghost` cỡ `sm`, chỉ hiện rõ khi hover hàng.

### 6.7 Avatar

Vòng tròn, nền `--surface-3`, chữ viết tắt màu `--fg-muted` weight 500. **Luôn vẽ chữ viết tắt làm nền**, ảnh chỉ hiện khi `onLoad`. Viền `1px --border`. Không vòng gradient. Cỡ: 28 (bảng) · 36 (danh sách) · 48 (thẻ) · 72+ (chi tiết).

### 6.8 Modal

Bo `var(--r)`, backdrop `rgba(25,28,22,.42)` + `blur(3px)`, header có nhãn lông mày + tiêu đề serif 22px, thân `p-6`, footer nền `--surface-2` viền trên, nút Hủy (`outline`) + nút chính (`primary`) canh phải.

Cỡ: `max-w-lg` mặc định, `max-w-2xl` khi `wide`.

### 6.9 EmptyState

Icon 28px màu `--fg-subtle` trong ô vuông viền tóc 64px có `.corners` → tiêu đề serif 20px → mô tả 13px `--fg-muted` → nút `outline`. Không icon gradient, không `.floaty`.

---

## 7. Biểu đồ (Recharts)

Bảng màu biểu đồ lấy từ §2.4 theo thứ tự. Một chuỗi → `--accent`. Chuỗi được nhấn → `--metal`.

| Thành phần | Quy định |
|---|---|
| Area | `fill="url(#g)"` dọc, stop đầu opacity `.14`, stop cuối `0`, `strokeWidth={1.5}` |
| Line | `strokeWidth={1.5}`, `dot={false}`, `activeDot={{ r: 3 }}` |
| Bar | **Màu phẳng**, `radius={[2,2,0,0]}`, `barSize` 10–14 |
| Donut | `innerRadius={62} outerRadius={84} paddingAngle={1} cornerRadius={0}`, `stroke="var(--surface)" strokeWidth={2}` |
| Lưới | chỉ `horizontal`, `stroke="var(--border-soft)"`, **không** `strokeDasharray` |
| Trục | `stroke="var(--fg-subtle)"`, `fontSize={10}`, `tickLine={false} axisLine={false}` |
| Tooltip | `chartTip` — nền `--surface`, viền `--border`, bo 4px, `--shadow-pop`, chữ 12px |
| Legend | `fontSize: 11`, `iconType="plainline"`, đặt **trên** biểu đồ, canh trái |
| Chiều cao | `h-72` (288px) — cao hơn v3 để đường thở |

Bỏ: gradient ngang trên bar, `strokeDasharray="3 6"` trên lưới, tooltip nền đen, bo góc 8px trên bar.

---

## 8. Mẫu trang

14 mẫu phủ 38 route.

| Mẫu | Áp dụng cho | Đặc thù |
|---|---|---|
| **A** Danh sách | Staff ✅ · RoomTypes ✅ · Menu ✅ · Invoices ✅ · Promotions ✅ · Bookings · Services · Branches · Posts · Guests | §5 đầy đủ. Toggle Bảng/Thẻ, mặc định **Bảng** |
| **B** Chi tiết | Branches (chi tiết) | Ảnh bìa 1320×280 + lớp phủ đọc chữ, tab bên dưới |
| **C** Dashboard | Dashboard ✅ | Tối đa **4** khối lớn |
| **D** Danh sách + panel bên | Guests | Danh sách 2fr / panel 1fr sticky; <1024px thành drawer |
| **E** Sơ đồ lưới dày đặc | Rooms | Ô 64px viền tóc, **chỉ 1 chấm trạng thái**, không tô nền ô |
| **F** Cây phân cấp | PostCategories | Tối đa 3 cấp, thụt 24px, đường nối dọc màu `--border` |
| **G** Feed + chọn nhiều | Notifications | Nhóm theo ngày, thanh bulk thay chỗ toolbar |
| **H** Form / Cài đặt | Settings · Profile | Nav trái 220px + nội dung max 720px |
| **I** Hội thoại 2 cột | Messages | Danh sách 320px + chat 1fr, bong bóng max 65% |
| **J** Hub nhiều tab | Marketing ✅ · Rates ✅ · Inventory ✅ · Loyalty ✅ · Payroll ✅ · Roles ✅ · RestaurantOperations · Reports | Tabs + `<SectionHead>` phân đoạn |
| **K** Trang con báo cáo | 6 trang `/reports/*` | 1 biểu đồ chính + 1 bảng |
| **L** Trang mục lục | ReportDetail | Lưới thẻ viền tóc, tiêu đề serif |
| **M** Tài liệu | Help | Mục lục sticky 220px + nội dung 720px, chữ body 15px |
| **N** Xác thực | Login | Ngoài layout, form 420px trái + ảnh phải toàn chiều cao |
| **O** Sổ / Nhật ký | AuditLog ✅ · Cashflow ✅ · Receivables ✅ · Reviews ✅ | Bộ lọc nhiều trục (ai · cái gì · khi nào) trên một hàng riêng, bảng dày, phân trang 20 dòng |

✅ = đã dựng theo v4, dùng làm tham chiếu.

---

## 9. Bốn trạng thái bắt buộc

- **Đang tải** — `<Skeleton>` đúng hình dạng nội dung thật. Không spinner toàn trang.
- **Rỗng** — §6.9. Phân biệt "chưa có dữ liệu" và "bộ lọc không khớp" (cái sau bắt buộc có nút xóa lọc).
- **Lỗi** — khối nền `--danger-soft` chữ `--danger-fg` viền `--danger-border`, nêu **cách xử lý**, có nút "Thử lại".
- **Vô hiệu** — `opacity .45` + `cursor: not-allowed` + `title` giải thích.

---

## 10. Responsive

| Breakpoint | Thay đổi |
|---|---|
| `< 640px` | 1 cột · `StatStrip` xếp dọc, vạch chia thành ngang · toolbar xuống dòng · bảng cuộn ngang · vùng chạm ≥ 44px |
| `sm` | Toolbar nằm ngang · `StatStrip` 2 cột |
| `md` | Hiện cột phụ trong bảng · lưới thẻ 2 cột |
| `lg` | `StatStrip` 4 cột · lưới thẻ 3 cột · sidebar cố định |
| `xl` | Lưới thẻ 4 cột · `StatStrip` tối đa 6 cột |

Tiêu đề trang `text-[36px] sm:text-[44px]`.

---

## 11. Chế độ tối

Không phải "đảo màu" — là **buổi tối trong khách sạn**. Nền `#131410` ấm chứ không xanh lạnh, bề mặt nâng dần bằng độ sáng chứ không bằng bóng.

**Luật khi viết code mới:**
- Nền/chữ/viền: **luôn** `var(--*)`.
- Màu nhà ở chế độ tối là sắc **nhạt** của cùng tông (xem bảng §2.2) — nên chữ đè lên nó phải là `var(--on-accent)` (màu tối), không phải `#fff`.
- Kim loại giữ nguyên độ ấm, chỉ sáng thêm một bậc.
- Màu ngữ nghĩa và màu phân loại đã có bộ tối riêng trong `index.css`. **Không hardcode pastel trong JSX.**

---

## 12. Định dạng dữ liệu

Dùng `src/utils/format.js`, không tự viết lại.

| Ngữ cảnh | Hàm | Ví dụ |
|---|---|---|
| KPI, biểu đồ, thẻ | `formatVND` | `18,45 tỷ` · `2,4 tr` · `612K` |
| Bảng, hóa đơn, tooltip, chi tiết | `formatVNDFull` | `18.450.000.000 ₫` |

- Ngày `28/07/2026` · ngày giờ `28/07/2026 09:24` · khoảng `28/07 – 03/08`.
- Thời gian tương đối chỉ trong 24h, quá thì dùng ngày tuyệt đối.
- Phần trăm: 0 chữ số thập phân cho tỉ lệ, 1 chữ số cho tăng trưởng. Dấu phẩy thập phân kiểu Việt: `87,4%`.
- **`0` và "không có dữ liệu" khác nhau**: số không hiển thị `0`, thiếu dữ liệu hiển thị `—`.
- Mọi số: `tabular-nums`.

---

## 13. Từ điển thuật ngữ

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

Quy tắc chữ: nút = **động từ + danh từ** (`Thêm nhân viên`, `Xuất báo cáo`). Viết hoa chữ đầu câu. Không VIẾT HOA TOÀN BỘ trừ nhãn lông mày 10px. Thông báo lỗi nói **cách sửa**, không nói mã lỗi.

---

## 14. Checklist trước khi merge

**Hệ thống**
- [ ] Đã đọc §0, import component từ `src/components/ui/` thay vì copy
- [ ] Dùng đúng mẫu trang ở §8
- [ ] Có ít nhất 3 trong 6 chi tiết nhận diện §3

**Token**
- [ ] Không có `bg-white`, `text-ink-*`, `border-ink-*`, `blue-*`, `violet-*`, `emerald-*` trong code mới
- [ ] **Không có `linear-gradient` nào** ngoài 3 ngoại lệ §2.5
- [ ] Bo góc chỉ `var(--r)` · `var(--r-sm)` · `rounded-full` (avatar/chấm)
- [ ] Không có `font-extrabold` / `font-black` — trần là `600`
- [ ] Không có `boxShadow` mang màu phần tử
- [ ] Tiêu đề trang và section dùng `font-display` weight 400

**Nội dung**
- [ ] Có đúng một điểm nhìn chính
- [ ] Số có `tabular-nums`, canh phải trong bảng
- [ ] Tiền/ngày/% theo §12 · phân biệt `0` và `—`
- [ ] Thuật ngữ theo §13 · nút là động từ + danh từ
- [ ] Nhãn trong ô hẹp không bị cắt cụt (kiểm tra ở 1280px)

**Tương tác**
- [ ] Đủ 4 trạng thái §9
- [ ] Rỗng do lọc có nút "Xóa bộ lọc"
- [ ] Đổi bộ lọc reset về trang 1
- [ ] Danh sách > 10 mục có `Pagination`
- [ ] Nút icon-only có `aria-label` + `title`

**Kiểm thử**
- [ ] `npm run build` sạch, `npx oxlint <file>` không cảnh báo
- [ ] Xem thật ở 375px · 768px · 1440px
- [ ] Thử cả **4 bộ sưu tập** × sáng/tối
- [ ] Không có lỗi JS trong console (kiểm tra mọi tab nếu là mẫu J)

---

## 15. Tương thích ngược trong lúc migrate

Tầng token và `usePalette()` đã đổi, nhưng **API cũ vẫn còn** để 22 trang chưa migrate không vỡ:

- `usePalette()` vẫn trả `brand`, `series`, `seriesMap`, `isMulti`, `accentHex`. Mỗi phần tử series vẫn có `from`/`to`/`soft`/`ink` — nhưng `from` và `to` giờ **rất gần nhau**, nên gradient 135° cũ render ra gần như màu phẳng đất. Trang cũ tự động dịu đi.
- `TONE` giữ nguyên khóa, đổi hex sang sắc tố tự nhiên.
- `.lift` và `.glowbtn` **vẫn tồn tại nhưng đã bị giảm mạnh** — nhấc 5px thành 2px, bóng màu thành bóng trung tính. Không dùng trong code mới; chúng chỉ tồn tại để trang cũ không giật cục.
- Các alias `bg-white`, `text-ink-*`, `bg-brand-*` vẫn trỏ vào CSS variable mới.

Khi migrate trang cuối cùng, xóa toàn bộ mục này cùng `.lift` / `.glowbtn` và lớp alias.

---

## 16. Trạng thái migrate

| Trang / component | Trạng thái |
|---|---|
| `src/components/ui/` | ✅ **Thư viện component v4 — nguồn sự thật** |
| `Staff.jsx` | ✅ v4 — **file tham chiếu mẫu A** (danh sách) |
| `Marketing.jsx` | ✅ v4 — **file tham chiếu mẫu J** (hub nhiều tab) |
| `Dashboard.jsx` | ✅ v4 — **file tham chiếu mẫu C**, đã cắt 17 khối → 4 |
| `Sidebar.jsx` · `Topbar.jsx` · `BranchSelector.jsx` | ✅ v4 — khung vỏ. Sidebar chia **8 nhóm nghiệp vụ** gập được, nhớ trạng thái ở `condohub.nav.groups` |
| `RoomTypes.jsx` · `Rates.jsx` | ✅ v4 — nhóm Khách sạn |
| `Menu.jsx` · `Inventory.jsx` | ✅ v4 — nhóm Nhà hàng |
| `Loyalty.jsx` · `Reviews.jsx` | ✅ v4 — nhóm Khách hàng |
| `Payroll.jsx` | ✅ v4 — nhóm Nhân sự |
| `Invoices.jsx` · `Receivables.jsx` · `Cashflow.jsx` | ✅ v4 — nhóm Tài chính |
| `Promotions.jsx` | ✅ v4 — nhóm Marketing |
| `Roles.jsx` · `AuditLog.jsx` | ✅ v4 — nhóm Hệ thống |
| `Footer.jsx` · `Pagination.jsx` | ✅ v4 — dùng chung mọi trang |
| `Settings.jsx` | ⚠️ Phần **Giao diện** đã sang v4 (chọn bộ sưu tập màu); các tab còn lại vẫn v3 |
| `Rooms.jsx` | ⬜ Ưu tiên 1 — mẫu E |
| `Guests.jsx` | ⬜ Ưu tiên 2 — mẫu D |
| `Bookings.jsx` | ⬜ Ưu tiên 3 — mẫu A |
| `Posts.jsx` · `PostCategories.jsx` · `Services.jsx` | ⬜ Mẫu A / F — đang ở v3 |
| `Messages.jsx` | ⬜ Mẫu I — đang ở v3 |
| `WebsiteOverview.jsx` · `WebsiteUsers.jsx` | ⬜ Mẫu J — đang ở v3 |
| `Branches.jsx` | ⬜ Mẫu A + B |
| `RestaurantOperations.jsx` | ⬜ Mẫu J, 2552 dòng — nặng nhất |
| `Reports.jsx` + 6 trang `/reports/*` | ⬜ Mẫu J / K |
| `Notifications.jsx` | ⬜ Mẫu G |
| `Profile.jsx` | ⬜ Mẫu H |
| `Help.jsx` · `Login.jsx` | ⬜ Mẫu M / N |

---

## 17. Nợ kỹ thuật đã biết

1. ~~Cài đặt "Mật độ" không hoạt động~~ — **đã sửa ở v4**: `index.css` chuyển sang selector `[data-density="compact"]` khớp với attribute mà `ThemeContext` ghi.
2. **Bundle 1 chunk ~1,9 MB** — chưa code-splitting theo route.
3. **`vite.config.js` thiếu `@vitejs/plugin-react`** — build chạy được nhưng mất Fast Refresh.
4. **`AppearanceModal.jsx`, `StatCard.jsx`** — không được import ở đâu, nên xóa.
5. **`Dockerfile` chạy `npm run dev`** — production đang chạy dev server của Vite, không phải bản build.
6. Các component v3 còn nằm rải trong `Staff.jsx` / `Marketing.jsx` / `WebsitePrimitives.jsx` sẽ được xóa dần khi các trang còn lại migrate sang `src/components/ui/`.

---

## 18. Tóm tắt

> **Hình thức:** giấy ngà ấm, thẻ trắng ấm viền tóc 1px bo 6px, gần như không bóng. Tiêu đề serif Playfair weight thường. Một màu nhà phẳng + đồng thau dùng dè như dập nhũ. Không gradient.
>
> **Màu:** ngữ nghĩa dùng sắc tố tự nhiên (thông, hoàng thổ, đất nung, đá phiến). Phân loại dùng bảy sắc đất cùng dải sáng, **giữ nguyên ở mọi bộ sưu tập**.
>
> **Phân cấp:** bằng cỡ chữ, khoảng trắng và đường kẻ — không bằng màu.
>
> **Bố cục:** header serif → kẻ tóc → dải KPI liền khối → toolbar một hàng → nội dung → phân trang.
>
> **Cách làm:** import từ `src/components/ui/`. Đừng sáng tác lại.
