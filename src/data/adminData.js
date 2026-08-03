/**
 * Dữ liệu mock cho các module quản trị bổ sung.
 *
 * Tách khỏi `mockData.js` có chủ đích: file đó dùng seed = 42 và mọi lời gọi
 * rand() nối tiếp nhau, chèn thêm vào giữa sẽ đổi toàn bộ dữ liệu phía sau.
 * File này có bộ sinh số riêng nên thêm/sửa thoải mái mà không ảnh hưởng
 * chi nhánh · phòng · nhân viên · khách · booking.
 */
import { branches, rooms, staff, guests, bookings, roomTypeList } from "./mockData";

/* ═══════════ Bộ sinh số ngẫu nhiên riêng ═══════════ */
let s = 20260802;
const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
const ri = (a, b) => Math.floor(rnd() * (b - a + 1)) + a;
const pick = (a) => a[Math.floor(rnd() * a.length)];
const pickN = (a, n) => {
  const c = [...a], o = [];
  for (let i = 0; i < n && c.length; i++) o.push(c.splice(Math.floor(rnd() * c.length), 1)[0]);
  return o;
};
const d = (offset) => {
  const x = new Date(2026, 7, 2);
  x.setDate(x.getDate() + offset);
  return x.toISOString().slice(0, 10);
};

const BR = branches.map((b) => b.id);
const brName = (id) => branches.find((b) => b.id === id)?.name || "—";
const brCode = (id) => branches.find((b) => b.id === id)?.code || "—";

/* ═══════════════════════════════════════════════════════════
   1. HẠNG PHÒNG — danh mục nền, admin khai báo
   ═══════════════════════════════════════════════════════════ */
const RT_META = {
  STD: { beds: "1 giường đôi", size: 24, cap: 2, img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=450&fit=crop&q=80" },
  SUP: { beds: "1 giường đôi lớn", size: 30, cap: 2, img: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=450&fit=crop&q=80" },
  DLX: { beds: "1 King hoặc 2 đơn", size: 38, cap: 3, img: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=450&fit=crop&q=80" },
  STE: { beds: "1 King + sofa bed", size: 55, cap: 4, img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=450&fit=crop&q=80" },
  EXE: { beds: "1 King + phòng khách", size: 72, cap: 4, img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=450&fit=crop&q=80" },
  PRE: { beds: "2 phòng ngủ King", size: 120, cap: 6, img: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=450&fit=crop&q=80" },
};
const AMENITY_POOL = [
  "Wifi tốc độ cao", "Điều hòa", "Két an toàn", "Minibar", "Máy pha cà phê",
  "Bồn tắm", "Ban công", "View biển", "Bàn làm việc", "TV 55 inch",
  "Máy sấy tóc", "Áo choàng tắm", "Dép đi trong phòng", "Ấm siêu tốc",
];

export const roomTypes = roomTypeList.map((t, i) => {
  const m = RT_META[t.key];
  const count = rooms.filter((r) => r.type === t.key).length;
  return {
    id: `RT-${t.key}`,
    code: t.key,
    name: t.name,
    basePrice: t.basePrice,
    capacity: m.cap,
    beds: m.beds,
    size: m.size,
    amenities: pickN(AMENITY_POOL, 5 + (i % 4)),
    image: m.img,
    roomCount: count,
    branches: BR.slice(0, i === 5 ? 2 : i === 4 ? 3 : 4),
    active: true,
    desc: `Hạng ${t.name} — ${m.size}m², ${m.beds.toLowerCase()}, tối đa ${m.cap} khách.`,
  };
});

/* ═══════════════════════════════════════════════════════════
   2. BẢNG GIÁ — giá theo mùa / kênh bán
   ═══════════════════════════════════════════════════════════ */
export const SEASONS = [
  { id: "low", label: "Thấp điểm", factor: 0.82 },
  { id: "normal", label: "Bình thường", factor: 1 },
  { id: "high", label: "Cao điểm", factor: 1.35 },
  { id: "peak", label: "Lễ Tết", factor: 1.8 },
];
export const CHANNELS = [
  { id: "direct", label: "Website / Trực tiếp", commission: 0 },
  { id: "booking", label: "Booking.com", commission: 15 },
  { id: "agoda", label: "Agoda", commission: 18 },
  { id: "traveloka", label: "Traveloka", commission: 12 },
  { id: "agency", label: "Đại lý", commission: 10 },
];

export const ratePlans = (() => {
  const out = [];
  const defs = [
    { name: "Giá công bố", season: "normal", from: d(-60), to: d(120), minNights: 1 },
    { name: "Hè 2026", season: "high", from: d(-30), to: d(45), minNights: 2 },
    { name: "Thấp điểm sau hè", season: "low", from: d(46), to: d(110), minNights: 1 },
    { name: "Lễ 2/9", season: "peak", from: d(28), to: d(33), minNights: 3 },
    { name: "Đặt sớm 30 ngày", season: "normal", from: d(-10), to: d(90), minNights: 2, discount: 12 },
    { name: "Cuối tuần", season: "high", from: d(-60), to: d(120), minNights: 1, weekendOnly: true },
  ];
  defs.forEach((p, i) => {
    roomTypes.forEach((rt) => {
      CHANNELS.forEach((ch) => {
        const base = rt.basePrice * (SEASONS.find((x) => x.id === p.season)?.factor || 1);
        const afterDiscount = base * (1 - (p.discount || 0) / 100);
        out.push({
          id: `RP-${String(out.length + 1).padStart(4, "0")}`,
          planId: `PLAN-${i + 1}`,
          plan: p.name,
          season: p.season,
          roomType: rt.code,
          roomTypeName: rt.name,
          channel: ch.id,
          channelName: ch.label,
          commission: ch.commission,
          price: Math.round(afterDiscount / 10000) * 10000,
          netPrice: Math.round((afterDiscount * (1 - ch.commission / 100)) / 10000) * 10000,
          minNights: p.minNights,
          weekendOnly: !!p.weekendOnly,
          from: p.from,
          to: p.to,
          active: i !== 2,
        });
      });
    });
  });
  return out;
})();

/* Tồn phòng mở bán 14 ngày tới, theo hạng */
export const inventoryCalendar = roomTypes.map((rt) => ({
  roomType: rt.code,
  roomTypeName: rt.name,
  days: Array.from({ length: 14 }, (_, i) => {
    const total = rt.roomCount;
    const sold = Math.min(total, ri(Math.floor(total * 0.2), Math.floor(total * 0.85)));
    return { date: d(i), total, sold, open: total - ri(0, 2), price: rt.basePrice + ri(-2, 6) * 50000 };
  }),
}));

/* ═══════════════════════════════════════════════════════════
   3. THỰC ĐƠN
   ═══════════════════════════════════════════════════════════ */
export const MENU_GROUPS = [
  { id: "appetizer", label: "Khai vị" },
  { id: "main", label: "Món chính" },
  { id: "seafood", label: "Hải sản" },
  { id: "soup", label: "Súp & Lẩu" },
  { id: "dessert", label: "Tráng miệng" },
  { id: "drink", label: "Đồ uống" },
];


/* Cột cuối là ảnh minh họa, hai dạng:
 *   "photo-…"   mã ảnh Unsplash — dựng URL qua dishImage() để xin đúng kích
 *               thước cần, thay vì tải ảnh gốc vài MB.
 *   "https://…" URL đầy đủ, dùng cho ảnh Creative Commons tìm qua Openverse.
 *
 * TỪNG ẢNH ĐÃ ĐƯỢC SOI BẰNG MẮT, không chỉ kiểm tra link còn sống. Lượt
 * chọn đầu tiên toàn mã Unsplash: cả 22 link đều trả 200 nhưng 10 ảnh sai
 * món — "Cua hoàng đế hấp" ra ảnh nhân vật hoạt hình, "Lẩu Thái" ra tô
 * ramen, "Kem dừa" ra bàn tay cầm bánh mì. Mười món đó nay dùng ảnh CC
 * khớp đúng món, tác giả ghi ngay trên từng dòng.
 *
 * Link chết thì thẻ rơi về nền + icon nhóm món chứ không để ô trắng —
 * xem <Cover> trong src/pages/Menu.jsx.
 */
const DISHES = [
  // CC BY · "Vietnamese Fresh Spring Rolls" — DesheBoard
  ["Gỏi cuốn tôm thịt", "appetizer", 120000, 45000, "phần", "https://live.staticflickr.com/2694/4254482711_683416ac59_b.jpg"],
  ["Salad Caesar", "appetizer", 165000, 62000, "phần", "photo-1550304943-4f24f54ddde9"],
  // CC BY · Wikimedia Commons — Vyacheslav Argenberg
  ["Chả giò hải sản", "appetizer", 145000, 55000, "phần", "https://upload.wikimedia.org/wikipedia/commons/5/51/Vietnamese_fried_spring_rolls_in_Ho_Chi_Minh_City%2C_Vietnam.jpg"],
  ["Bò Wagyu A5 áp chảo", "main", 1850000, 980000, "phần", "photo-1546964124-0cce460f38ef"],
  ["Sườn cừu nướng thảo mộc", "main", 720000, 310000, "phần", "photo-1544025162-d76694265947"],
  ["Cơm chiên hải sản", "main", 285000, 95000, "phần", "photo-1603133872878-684f208fb84b"],
  // CC BY · "Pho Chu The" — thatwelike
  ["Phở bò Wagyu", "main", 320000, 120000, "tô", "https://live.staticflickr.com/8428/7601535008_7baee9878e_b.jpg"],
  // CC BY · "Grilled Lobster" — eekim
  ["Tôm hùm Alaska nướng bơ", "seafood", 2400000, 1350000, "con", "https://live.staticflickr.com/2029/2060922163_9fcb4fd277_b.jpg"],
  // CC BY · "Yang's Abalone Dish" — snowpea&bokchoi
  ["Bào ngư Đài Loan sốt dầu hào", "seafood", 1650000, 890000, "phần", "https://live.staticflickr.com/4120/4798196346_a02a5b9c16_b.jpg"],
  // CC BY · "Alaskan King Crab Legs" — missbossy
  ["Cua hoàng đế hấp", "seafood", 3200000, 1900000, "kg", "https://live.staticflickr.com/3115/3241225745_783a98ab8f_b.jpg"],
  ["Sashimi thập cẩm", "seafood", 890000, 420000, "phần", "photo-1579871494447-9811cf80d66c"],
  // CC BY · "Double Boiled Coral Shark's Fin Soup" — chee.hong
  ["Súp bào ngư vi cá", "soup", 650000, 280000, "chén", "https://live.staticflickr.com/2034/2230290995_de6803213f_b.jpg"],
  // CC BY · "Tom Yum soup" — adactio
  ["Lẩu Thái hải sản", "soup", 780000, 310000, "nồi", "https://live.staticflickr.com/72/192069451_dea625246a_b.jpg"],
  ["Súp bí đỏ kem tươi", "soup", 135000, 42000, "chén", "photo-1476718406336-bb5a9690ee2a"],
  ["Tiramisu", "dessert", 145000, 48000, "phần", "photo-1571877227200-a0d98ea607e9"],
  // CC BY · "Homemade Flan" — snowpea&bokchoi
  ["Bánh flan caramel", "dessert", 95000, 28000, "phần", "https://live.staticflickr.com/4121/4740674824_4897fdc785_b.jpg"],
  // CC BY · "Coconut ice cream" — shankar s.
  ["Kem dừa Bến Tre", "dessert", 120000, 38000, "phần", "https://live.staticflickr.com/2907/14064796859_6e9e1f01d9_b.jpg"],
  ["Rượu vang Château đỏ", "drink", 1450000, 780000, "chai", "photo-1510812431401-41d2bd2722f3"],
  ["Cocktail Palmier Sunset", "drink", 265000, 85000, "ly", "photo-1514362545857-3bc16c4c7d1b"],
  ["Nước ép cam tươi", "drink", 85000, 25000, "ly", "photo-1613478223719-2ab802602423"],
  ["Cà phê sữa đá", "drink", 65000, 18000, "ly", "photo-1461023058943-07fcbe16d735"],
  ["Trà đào cam sả", "drink", 95000, 28000, "ly", "photo-1556679343-c7306c1976bc"],
];

/** Ảnh bìa thẻ 16:10. Chỉ Unsplash cho phép xin kích thước qua query string;
 *  ảnh CC dùng nguyên link, vốn đã ở mức ~1024px — vừa cho cả thẻ lẫn modal. */
const dishImage = (src, w = 640) =>
  src.startsWith("http")
    ? src
    : `https://images.unsplash.com/${src}?w=${w}&h=${Math.round((w * 10) / 16)}&fit=crop&crop=entropy&q=80&auto=format`;

/* Mô tả riêng cho từng món — trước đây dùng một câu khuôn cho cả 22 món,
   trên thẻ thì 22 dòng giống hệt nhau đọc rất giả. */
const DISH_DESC = {
  "Gỏi cuốn tôm thịt": "Tôm sú và ba chỉ luộc, cuốn bánh tráng với bún và rau thơm, chấm tương đậu phộng.",
  "Salad Caesar": "Xà lách romaine, bánh mì nướng bơ tỏi, phô mai Parmesan bào và sốt Caesar tự làm.",
  "Chả giò hải sản": "Nhân tôm, mực và cua bể, cuốn bánh tráng rế, chiên vàng giòn hai lửa.",
  "Bò Wagyu A5 áp chảo": "Thăn lưng Wagyu A5 nhập Nhật, áp chảo tái chín, dùng kèm muối tiêu Hoàng Su Phì.",
  "Sườn cừu nướng thảo mộc": "Sườn cừu New Zealand ướp hương thảo và tỏi, nướng lò than, sốt vang đỏ.",
  "Cơm chiên hải sản": "Cơm gạo Japonica chiên tôm, mực và sò điệp trên lửa lớn, thơm mùi chảo.",
  "Phở bò Wagyu": "Nước dùng ninh 12 tiếng từ xương ống, ăn kèm lát Wagyu trần tái tại bàn.",
  "Tôm hùm Alaska nướng bơ": "Tôm hùm còn sống chọn tại bể, nướng bơ tỏi, phủ phô mai Mozzarella.",
  "Bào ngư Đài Loan sốt dầu hào": "Bào ngư nguyên con hầm mềm, rưới sốt dầu hào cô đặc, dùng nóng.",
  "Cua hoàng đế hấp": "Cua hoàng đế hấp bia giữ ngọt thịt, chấm muối ớt xanh Nha Trang.",
  "Sashimi thập cẩm": "Cá hồi, cá ngừ, sò điệp và tôm ngọt, cắt theo thớ, dùng kèm wasabi tươi.",
  "Súp bào ngư vi cá": "Súp truyền thống nấu nước dùng gà ta, bào ngư thái sợi và vi cá thủ công.",
  "Lẩu Thái hải sản": "Nước lẩu chua cay riềng sả, hải sản tươi chọn trong ngày, phục vụ 2–4 khách.",
  "Súp bí đỏ kem tươi": "Bí đỏ Đà Lạt nướng rồi xay mịn với kem tươi, rắc hạt bí rang.",
  "Tiramisu": "Bánh ngâm cà phê Espresso, kem Mascarpone Ý, phủ bột cacao nguyên chất.",
  "Bánh flan caramel": "Trứng gà ta và sữa tươi hấp cách thủy, lớp caramel thắng thủ công.",
  "Kem dừa Bến Tre": "Kem dừa dừa xiêm Bến Tre, phục vụ trong trái dừa, rắc đậu phộng rang.",
  "Rượu vang Château đỏ": "Vang đỏ Bordeaux, tannin mềm, hợp món bò và cừu nướng.",
  "Cocktail Palmier Sunset": "Rum trắng, nước ép xoài, chanh dây và siro hoa dâm bụt — món signature của quầy bar.",
  "Nước ép cam tươi": "Cam sành Vĩnh Long vắt tại quầy, không thêm đường.",
  "Cà phê sữa đá": "Robusta Đắk Lắk pha phin, sữa đặc Ông Thọ, đá viên tinh khiết.",
  "Trà đào cam sả": "Trà ô long ủ lạnh, đào ngâm, cam tươi và sả đập dập.",
};

export const menuItems = DISHES.map((x, i) => {
  const [name, group, price, cost, unit, img] = x;
  return {
    id: `MN-${String(i + 1).padStart(3, "0")}`,
    code: `M${String(i + 1).padStart(3, "0")}`,
    name, group, price, cost, unit,
    image: dishImage(img),
    imageLarge: dishImage(img, 1200),
    margin: Math.round(((price - cost) / price) * 100),
    branches: i % 7 === 0 ? BR.slice(0, 2) : BR,
    active: i !== 9 && i !== 17,
    signature: [3, 7, 8, 12].includes(i),
    prepTime: ri(5, 35),
    sold30d: ri(20, 480),
    desc: DISH_DESC[name] || `${name} — chế biến theo công thức chuẩn của bếp trưởng.`,
  };
});

/* ═══════════════════════════════════════════════════════════
   4. KHO & NGUYÊN LIỆU
   ═══════════════════════════════════════════════════════════ */
export const suppliers = [
  { id: "SUP-01", name: "Cty TNHH Hải sản Biển Đông", cat: "Hải sản", phone: "0283 822 1190", rating: 4.6, debt: 148_000_000 },
  { id: "SUP-02", name: "Thực phẩm sạch Đà Lạt Farm", cat: "Rau củ", phone: "0263 355 8821", rating: 4.8, debt: 42_000_000 },
  { id: "SUP-03", name: "Nhập khẩu Bò Nhật Kobe VN", cat: "Thịt", phone: "0287 300 4455", rating: 4.4, debt: 268_000_000 },
  { id: "SUP-04", name: "Rượu & Đồ uống Cellar Sài Gòn", cat: "Đồ uống", phone: "0283 911 7788", rating: 4.5, debt: 96_000_000 },
  { id: "SUP-05", name: "Gạo & Nông sản Long An", cat: "Khô", phone: "0272 388 2200", rating: 4.2, debt: 18_000_000 },
];

const INGREDIENTS = [
  ["Bò Wagyu A5 (Nhật)", "Thịt", "kg", 4, 30, 2_800_000, "SUP-03", 1],
  ["Tôm hùm Alaska", "Hải sản", "con", 6, 40, 1_250_000, "SUP-01", 2],
  ["Bào ngư Đài Loan", "Hải sản", "con", 18, 60, 620_000, "SUP-01", 3],
  ["Cua hoàng đế", "Hải sản", "kg", 9, 25, 1_850_000, "SUP-01", 4],
  ["Cá hồi Na Uy phi lê", "Hải sản", "kg", 22, 45, 680_000, "SUP-01", 6],
  ["Rau xà lách organic", "Rau củ", "kg", 12, 50, 85_000, "SUP-02", 2],
  ["Cà chua bi Đà Lạt", "Rau củ", "kg", 34, 60, 62_000, "SUP-02", 5],
  ["Nấm hương tươi", "Rau củ", "kg", 15, 30, 180_000, "SUP-02", 4],
  ["Pho mát Burrata", "Sữa", "cục", 22, 40, 195_000, "SUP-05", 4],
  ["Bơ lạt Pháp", "Sữa", "kg", 28, 40, 320_000, "SUP-05", 12],
  ["Rượu vang Château", "Đồ uống", "chai", 28, 80, 780_000, "SUP-04", 60],
  ["Gạo Japonica", "Khô", "kg", 240, 500, 42_000, "SUP-05", 14],
  ["Dầu ô-liu extra virgin", "Khô", "chai", 18, 50, 285_000, "SUP-05", 7],
  ["Sườn cừu New Zealand", "Thịt", "kg", 16, 35, 890_000, "SUP-03", 8],
  ["Cà phê hạt Arabica", "Đồ uống", "kg", 32, 60, 420_000, "SUP-04", 21],
];

export const ingredients = INGREDIENTS.map((x, i) => {
  const [name, cat, unit, stock, max, price, supplierId, days] = x;
  const pct = Math.round((stock / max) * 100);
  return {
    id: `NL-${String(i + 1).padStart(3, "0")}`,
    name, cat, unit, stock, max, price, supplierId, daysLeft: days,
    supplier: suppliers.find((sp) => sp.id === supplierId)?.name || "—",
    pct,
    level: days <= 2 ? "critical" : days <= 7 ? "low" : "ok",
    value: stock * price,
    branch: pick(BR),
    lastIn: d(-ri(1, 12)),
  };
});

export const stockMoves = Array.from({ length: 28 }, (_, i) => {
  const ing = pick(ingredients);
  const type = rnd() > 0.42 ? "out" : "in";
  const qty = type === "in" ? ri(10, 60) : ri(1, 12);
  return {
    id: `PX-${String(i + 1).padStart(4, "0")}`,
    date: d(-ri(0, 20)),
    type,
    ingredientId: ing.id,
    ingredient: ing.name,
    unit: ing.unit,
    qty,
    value: qty * ing.price,
    branchId: ing.branch,
    branchName: brName(ing.branch),
    note: type === "in" ? `Nhập từ ${ing.supplier}` : pick(["Xuất bếp nóng", "Xuất bếp lạnh", "Xuất quầy bar", "Hao hụt kiểm kê"]),
    by: pick(staff).name,
  };
}).sort((a, b) => b.date.localeCompare(a.date));

/* ═══════════════════════════════════════════════════════════
   5. KHÁCH THÂN THIẾT
   ═══════════════════════════════════════════════════════════ */
export const loyaltyTiers = [
  { id: "standard", name: "Thường", min: 0, rate: 1, color: "neutral", perks: ["Tích 1 điểm / 10.000đ"] },
  { id: "silver", name: "Bạc", min: 3, rate: 1.2, color: "info", perks: ["Tích 1,2 điểm / 10.000đ", "Nhận phòng sớm 13:00"] },
  { id: "gold", name: "Vàng", min: 6, rate: 1.5, color: "warning", perks: ["Tích 1,5 điểm / 10.000đ", "Nhận sớm & trả muộn miễn phí", "Giảm 10% dịch vụ spa"] },
  { id: "platinum", name: "Bạch kim", min: 12, rate: 2, color: "highlight", perks: ["Tích 2 điểm / 10.000đ", "Nâng hạng phòng khi còn trống", "Buffet sáng miễn phí 2 khách"] },
  { id: "diamond", name: "Kim cương", min: 20, rate: 2.5, color: "success", perks: ["Tích 2,5 điểm / 10.000đ", "Nâng hạng phòng ưu tiên", "Đưa đón sân bay miễn phí", "Quản gia riêng"] },
];

const tierOf = (n) => loyaltyTiers.slice().reverse().find((t) => n >= t.min) || loyaltyTiers[0];

export const loyaltyMembers = guests.slice(0, 60).map((g, i) => {
  const stays = g.totalBookings;
  const t = tierOf(stays);
  const points = Math.round((g.totalSpent / 10000) * t.rate);
  return {
    id: `LM-${String(i + 1).padStart(4, "0")}`,
    guestId: g.id,
    name: g.name,
    avatar: g.avatar,
    phone: g.phone,
    email: g.email,
    tier: t.id,
    tierName: t.name,
    stays,
    spent: g.totalSpent,
    points,
    redeemed: Math.round(points * (rnd() * 0.4)),
    joined: d(-ri(60, 900)),
    lastStay: g.lastVisit,
    nextTier: loyaltyTiers[Math.min(loyaltyTiers.findIndex((x) => x.id === t.id) + 1, 4)],
  };
});

export const pointRules = [
  { id: "PR-1", name: "Tích điểm lưu trú", desc: "Áp dụng trên tiền phòng đã thanh toán", value: "1 điểm / 10.000đ", active: true },
  { id: "PR-2", name: "Tích điểm dịch vụ", desc: "Spa, nhà hàng, tour — không tính minibar", value: "0,5 điểm / 10.000đ", active: true },
  { id: "PR-3", name: "Thưởng sinh nhật", desc: "Cộng một lần trong tháng sinh nhật", value: "+500 điểm", active: true },
  { id: "PR-4", name: "Giới thiệu bạn bè", desc: "Khi người được giới thiệu hoàn tất lưu trú đầu tiên", value: "+1.000 điểm", active: true },
  { id: "PR-5", name: "Đổi điểm lấy đêm nghỉ", desc: "Quy đổi khi đặt trực tiếp qua website", value: "10.000 điểm = 1 đêm Standard", active: true },
  { id: "PR-6", name: "Hết hạn điểm", desc: "Điểm không phát sinh giao dịch sẽ hết hạn", value: "24 tháng", active: false },
];

/* ═══════════════════════════════════════════════════════════
   6. ĐÁNH GIÁ
   ═══════════════════════════════════════════════════════════ */
export const REVIEW_SOURCES = [
  { id: "google", label: "Google", color: "#4285F4" },
  { id: "booking", label: "Booking.com", color: "#003580" },
  { id: "agoda", label: "Agoda", color: "#FF6B00" },
  { id: "tripadvisor", label: "TripAdvisor", color: "#00AF87" },
  { id: "direct", label: "Khảo sát nội bộ", color: "#6366f1" },
];

const REVIEW_TEXT = {
  5: ["Phòng rộng, view biển tuyệt đẹp. Nhân viên nhiệt tình, ăn sáng ngon.",
      "Khu nghỉ dưỡng yên tĩnh, sạch sẽ. Chắc chắn sẽ quay lại!",
      "Dịch vụ spa rất tốt, kỹ thuật viên chuyên nghiệp. Rất đáng tiền.",
      "Đội ngũ lễ tân xử lý nhanh, nhận phòng sớm không mất phí."],
  4: ["Vị trí trung tâm, dễ di chuyển. Phòng hơi nhỏ nhưng ổn.",
      "Buffet sáng đa dạng, hồ bơi đẹp. Giá hơi cao dịp lễ.",
      "Nhìn chung tốt, chỉ tiếc là wifi ban công hơi yếu."],
  3: ["Phòng ổn nhưng cách âm chưa tốt, nghe tiếng hành lang.",
      "Ăn sáng lặp món giữa các ngày. Dịch vụ thì vẫn ổn.",
      "Chờ nhận phòng khá lâu vào cuối tuần."],
  2: ["Điều hòa phòng kêu to, báo kỹ thuật hai lần mới xử lý.",
      "Đặt phòng view biển nhưng nhận phòng view vườn, không được báo trước."],
  1: ["Phòng chưa dọn sạch khi nhận. Rất thất vọng với mức giá này.",
      "Bị tính thêm phí minibar không dùng, mất thời gian đối chiếu."],
};

export const reviews = Array.from({ length: 46 }, (_, i) => {
  const r = rnd();
  const rating = r > 0.55 ? 5 : r > 0.3 ? 4 : r > 0.16 ? 3 : r > 0.07 ? 2 : 1;
  const src = pick(REVIEW_SOURCES);
  const g = pick(guests);
  const b = pick(BR);
  const replied = rating >= 4 ? rnd() > 0.45 : rnd() > 0.7;
  return {
    id: `RV-${String(i + 1).padStart(4, "0")}`,
    source: src.id,
    sourceName: src.label,
    rating,
    guestName: g.name,
    guestAvatar: g.avatar,
    branchId: b,
    branchName: brName(b),
    date: d(-ri(0, 60)),
    text: pick(REVIEW_TEXT[rating]),
    replied,
    reply: replied ? "Condo HUB cảm ơn quý khách đã dành thời gian chia sẻ. Chúng tôi đã ghi nhận và sẽ cải thiện." : null,
    tags: pickN(["Sạch sẽ", "Nhân viên", "Vị trí", "Giá cả", "Ăn sáng", "Tiện nghi", "Yên tĩnh"], ri(1, 3)),
  };
}).sort((a, b) => b.date.localeCompare(a.date));

/* ═══════════════════════════════════════════════════════════
   7. BẢNG CÔNG & LƯƠNG
   ═══════════════════════════════════════════════════════════ */
export const payrollPeriods = ["2026-07", "2026-06", "2026-05"];

export const payroll = staff.slice(0, 48).map((st, i) => {
  const standard = 26;
  const worked = standard - ri(0, 3);
  const otHours = ri(0, 22);
  const base = st.salary;
  const perDay = Math.round(base / standard);
  const actual = perDay * worked;
  const otPay = otHours * Math.round(perDay / 8 * 1.5);
  const allowance = ri(3, 12) * 100_000;
  const tip = ["fnb", "reception"].includes(st.role) ? ri(4, 28) * 100_000 : 0;
  const bonus = i % 7 === 0 ? 2_000_000 : 0;
  const insurance = Math.round(base * 0.105);
  const deduction = ri(0, 3) * 100_000;
  const gross = actual + otPay + allowance + tip + bonus;
  return {
    id: `PR-${String(i + 1).padStart(4, "0")}`,
    staffId: st.id,
    name: st.name,
    avatar: st.avatar,
    role: st.role,
    roleLabel: st.roleLabel,
    branchId: st.branchId,
    branchName: st.branchName,
    period: "2026-07",
    standardDays: standard,
    workedDays: worked,
    leaveDays: standard - worked,
    otHours,
    base, actual, otPay, allowance, tip, bonus, insurance, deduction,
    gross,
    net: gross - insurance - deduction,
    status: i < 32 ? "approved" : i < 44 ? "pending" : "draft",
  };
});

export const timesheet = staff.slice(0, 48).map((st) => ({
  staffId: st.id,
  name: st.name,
  branchId: st.branchId,
  shift: st.shift,
  days: Array.from({ length: 31 }, (_, i) => {
    const dow = new Date(2026, 6, i + 1).getDay();
    const r = rnd();
    return {
      day: i + 1,
      status: r > 0.93 ? "leave" : r > 0.88 ? "off" : dow === 0 ? "off" : "work",
      hours: r > 0.93 ? 0 : dow === 0 ? 0 : 8 + (r > 0.8 ? ri(1, 3) : 0),
    };
  }),
}));

/* ═══════════════════════════════════════════════════════════
   8. HÓA ĐƠN
   ═══════════════════════════════════════════════════════════ */
const SERVICE_LINES = [
  ["Buffet sáng", 350_000], ["Spa & Massage 60'", 890_000], ["Đưa đón sân bay", 450_000],
  ["Giặt ủi", 80_000], ["Minibar", 250_000], ["Nhà hàng", 680_000], ["Tour city", 680_000],
];

export const invoices = bookings
  .filter((b) => b.status === "checked_out" || b.status === "checked_in")
  .slice(0, 72)
  .map((bk, i) => {
    const roomLine = { name: `Tiền phòng ${bk.roomTypeName} · ${bk.nights} đêm`, qty: bk.nights, price: Math.round(bk.total / bk.nights), kind: "room" };
    const extras = pickN(SERVICE_LINES, ri(0, 3)).map(([name, price]) => ({
      name, qty: ri(1, 3), price, kind: "service",
    }));
    const items = [roomLine, ...extras];
    const subtotal = items.reduce((sm, it) => sm + it.qty * it.price, 0);
    const serviceFee = Math.round(subtotal * 0.05);
    const vat = Math.round((subtotal + serviceFee) * 0.08);
    const total = subtotal + serviceFee + vat;
    const st = bk.status === "checked_in" ? "open" : i % 9 === 0 ? "unpaid" : "paid";
    return {
      id: `HD-${String(i + 1).padStart(5, "0")}`,
      bookingId: bk.id,
      guestName: bk.guestName,
      guestAvatar: bk.guestAvatar,
      branchId: bk.branchId,
      branchName: bk.branchName,
      roomNumber: bk.roomNumber,
      issued: bk.checkOut,
      items, subtotal, serviceFee, vat, total,
      paid: st === "paid" ? total : st === "open" ? Math.round(total * 0.3) : 0,
      status: st,
      method: st === "paid" ? pick(["Tiền mặt", "Thẻ tín dụng", "VNPay", "Chuyển khoản"]) : null,
      taxCode: i % 4 === 0 ? `03${ri(10000000, 99999999)}` : null,
      company: i % 4 === 0 ? pick(["Cty CP Du lịch Sài Gòn", "Cty TNHH VNG", "Tập đoàn Sun Group", "Cty CP FPT"]) : null,
    };
  });

/* ═══════════════════════════════════════════════════════════
   9. CÔNG NỢ
   ═══════════════════════════════════════════════════════════ */
const DEBTOR_DEFS = [
  ["Booking.com B.V.", "ota", "Đối tác OTA"],
  ["Agoda Company Pte", "ota", "Đối tác OTA"],
  ["Traveloka Việt Nam", "ota", "Đối tác OTA"],
  ["Cty CP Du lịch Sài Gòn", "corp", "Khách doanh nghiệp"],
  ["Tập đoàn Sun Group", "corp", "Khách doanh nghiệp"],
  ["Cty TNHH VNG", "corp", "Khách doanh nghiệp"],
  ["Cty CP FPT", "corp", "Khách doanh nghiệp"],
  ["Đại lý Tây Ninh Travel", "agency", "Đại lý"],
  ["Vietravel Chi nhánh HCM", "agency", "Đại lý"],
  ["Cty TNHH ABC Travel", "agency", "Đại lý"],
];

export const receivables = DEBTOR_DEFS.map((x, i) => {
  const [name, type, typeName] = x;
  const docs = Array.from({ length: ri(2, 6) }, (_, j) => {
    const overdue = ri(-20, 75);
    const amount = ri(12, 240) * 1_000_000;
    return {
      id: `CN-${String(i + 1).padStart(2, "0")}-${j + 1}`,
      invoiceId: `HD-${String(ri(1, 72)).padStart(5, "0")}`,
      issued: d(-overdue - 30),
      due: d(-overdue),
      overdueDays: overdue > 0 ? overdue : 0,
      amount,
      paid: overdue > 60 ? 0 : Math.round(amount * (rnd() > 0.6 ? 0.5 : 0)),
      branchId: pick(BR),
    };
  });
  const total = docs.reduce((sm, x2) => sm + x2.amount - x2.paid, 0);
  const worst = Math.max(...docs.map((x2) => x2.overdueDays));
  return {
    id: `DT-${String(i + 1).padStart(3, "0")}`,
    name, type, typeName,
    contact: `ketoan${i + 1}@${name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 10)}.vn`,
    phone: `0${ri(28, 29)} ${ri(3000, 3999)} ${ri(1000, 9999)}`,
    term: pick([15, 30, 45, 60]),
    docs,
    total,
    worstOverdue: worst,
    bucket: worst === 0 ? "current" : worst <= 30 ? "d30" : worst <= 60 ? "d60" : "d90",
  };
});

export const agingBuckets = [
  { id: "current", label: "Trong hạn", tone: "success" },
  { id: "d30", label: "Quá hạn 1–30 ngày", tone: "info" },
  { id: "d60", label: "Quá hạn 31–60 ngày", tone: "warning" },
  { id: "d90", label: "Quá hạn trên 60 ngày", tone: "danger" },
];

/* ═══════════════════════════════════════════════════════════
   10. THU CHI
   ═══════════════════════════════════════════════════════════ */
export const CASH_CATS = {
  income: [
    { id: "room", label: "Tiền phòng" },
    { id: "fnb", label: "Nhà hàng & Bar" },
    { id: "service", label: "Dịch vụ kèm theo" },
    { id: "event", label: "Sự kiện & Hội nghị" },
    { id: "other_in", label: "Thu khác" },
  ],
  expense: [
    { id: "payroll", label: "Lương & Phúc lợi" },
    { id: "supply", label: "Nguyên vật liệu" },
    { id: "utility", label: "Điện nước & Nhiên liệu" },
    { id: "maintain", label: "Bảo trì & Sửa chữa" },
    { id: "marketing", label: "Marketing & Hoa hồng" },
    { id: "admin", label: "Chi phí quản lý" },
    { id: "tax", label: "Thuế & Phí" },
  ],
};

export const transactions = Array.from({ length: 120 }, (_, i) => {
  const isIncome = rnd() > 0.42;
  const cats = isIncome ? CASH_CATS.income : CASH_CATS.expense;
  const cat = pick(cats);
  const base = isIncome
    ? { room: [40, 380], fnb: [8, 120], service: [3, 45], event: [30, 260], other_in: [2, 20] }[cat.id]
    : { payroll: [80, 260], supply: [20, 180], utility: [15, 70], maintain: [5, 60], marketing: [10, 90], admin: [5, 40], tax: [20, 150] }[cat.id];
  const b = pick(BR);
  return {
    id: `TC-${String(i + 1).padStart(5, "0")}`,
    date: d(-ri(0, 45)),
    type: isIncome ? "income" : "expense",
    catId: cat.id,
    category: cat.label,
    branchId: b,
    branchName: brName(b),
    branchCode: brCode(b),
    amount: ri(base[0], base[1]) * 1_000_000,
    method: pick(["Tiền mặt", "Chuyển khoản", "Thẻ", "VNPay", "Momo"]),
    ref: isIncome ? `HD-${String(ri(1, 72)).padStart(5, "0")}` : `PC-${String(ri(1, 200)).padStart(4, "0")}`,
    note: isIncome ? `Thu ${cat.label.toLowerCase()}` : `Chi ${cat.label.toLowerCase()}`,
    by: pick(staff).name,
    approved: rnd() > 0.12,
  };
}).sort((a, b) => b.date.localeCompare(a.date));

/* ═══════════════════════════════════════════════════════════
   11. KHUYẾN MÃI
   ═══════════════════════════════════════════════════════════ */
export const promotions = [
  { code: "HE2026", name: "Ưu đãi hè 2026", type: "percent", value: 25, scope: "room", minNights: 2, from: d(-30), to: d(30), used: 184, limit: 500, channels: ["direct", "booking"], branches: BR, active: true, desc: "Giảm 25% tiền phòng cho kỳ nghỉ hè từ 2 đêm." },
  { code: "DATSOM30", name: "Đặt sớm 30 ngày", type: "percent", value: 12, scope: "room", minNights: 1, from: d(-60), to: d(90), used: 312, limit: 1000, channels: ["direct"], branches: BR, active: true, desc: "Đặt trước tối thiểu 30 ngày để nhận ưu đãi." },
  { code: "SPA50", name: "Spa giảm nửa giá", type: "percent", value: 50, scope: "service", minNights: 0, from: d(-14), to: d(16), used: 96, limit: 200, channels: ["direct"], branches: BR.slice(0, 3), active: true, desc: "Áp dụng cho gói massage 60 phút, chỉ khách đang lưu trú." },
  { code: "TIKTOK50", name: "Voucher TikTok", type: "fixed", value: 500_000, scope: "room", minNights: 2, from: d(-20), to: d(29), used: 428, limit: 500, channels: ["direct"], branches: BR, active: true, desc: "Mã dành riêng cho khách đến từ chiến dịch TikTok." },
  { code: "LE29", name: "Lễ 2/9", type: "percent", value: 15, scope: "all", minNights: 3, from: d(26), to: d(34), used: 0, limit: 300, channels: ["direct", "booking", "agoda"], branches: BR, active: true, desc: "Combo nghỉ lễ tối thiểu 3 đêm, gồm ăn sáng." },
  { code: "CORP10", name: "Khách doanh nghiệp", type: "percent", value: 10, scope: "all", minNights: 1, from: d(-90), to: d(180), used: 67, limit: 0, channels: ["agency"], branches: BR, active: true, desc: "Giá hợp đồng cho công ty ký thỏa thuận năm." },
  { code: "WELCOME", name: "Khách lần đầu", type: "fixed", value: 300_000, scope: "room", minNights: 1, from: d(-120), to: d(240), used: 245, limit: 0, channels: ["direct"], branches: BR, active: true, desc: "Tự động áp dụng cho khách chưa từng lưu trú." },
  { code: "FLASH24", name: "Flash sale 24h", type: "percent", value: 35, scope: "room", minNights: 1, from: d(-40), to: d(-38), used: 89, limit: 100, channels: ["direct", "booking"], branches: BR.slice(0, 2), active: false, desc: "Chiến dịch đã kết thúc, giữ lại để đối chiếu hiệu quả." },
].map((p, i) => ({
  ...p,
  id: `KM-${String(i + 1).padStart(3, "0")}`,
  revenue: p.used * ri(2, 9) * 1_000_000,
  expired: new Date(p.to) < new Date(2026, 7, 2),
}));

/* ═══════════════════════════════════════════════════════════
   12. PHÂN QUYỀN
   ═══════════════════════════════════════════════════════════ */
export const permissionModules = [
  { id: "dashboard", label: "Dashboard", group: "Tổng quan" },
  { id: "branches", label: "Chi nhánh", group: "Khách sạn" },
  { id: "rooms", label: "Phòng & Hạng phòng", group: "Khách sạn" },
  { id: "rates", label: "Bảng giá", group: "Khách sạn" },
  { id: "bookings", label: "Đặt phòng", group: "Khách sạn" },
  { id: "restaurant", label: "Vận hành nhà hàng", group: "Nhà hàng" },
  { id: "menu", label: "Thực đơn", group: "Nhà hàng" },
  { id: "stock", label: "Kho & Nguyên liệu", group: "Nhà hàng" },
  { id: "guests", label: "Khách hàng & Loyalty", group: "Khách hàng" },
  { id: "reviews", label: "Đánh giá", group: "Khách hàng" },
  { id: "staff", label: "Nhân viên", group: "Nhân sự" },
  { id: "payroll", label: "Bảng công & Lương", group: "Nhân sự" },
  { id: "invoices", label: "Hóa đơn", group: "Tài chính" },
  { id: "receivables", label: "Công nợ", group: "Tài chính" },
  { id: "cashflow", label: "Thu chi", group: "Tài chính" },
  { id: "reports", label: "Báo cáo", group: "Tài chính" },
  { id: "marketing", label: "Marketing & Khuyến mãi", group: "Marketing" },
  { id: "system", label: "Cấu hình hệ thống", group: "Hệ thống" },
];

export const ACTIONS = [
  { id: "view", label: "Xem" },
  { id: "create", label: "Thêm" },
  { id: "edit", label: "Sửa" },
  { id: "delete", label: "Xóa" },
  { id: "approve", label: "Duyệt" },
];

const fullAccess = () =>
  Object.fromEntries(permissionModules.map((m) => [m.id, ACTIONS.map((a) => a.id)]));

const grant = (map) =>
  Object.fromEntries(permissionModules.map((m) => [m.id, map[m.id] || []]));

export const roles = [
  {
    id: "owner", name: "Chủ đầu tư", desc: "Toàn quyền trên mọi chi nhánh, kể cả cấu hình hệ thống.",
    scope: "all", users: 2, system: true, perms: fullAccess(),
  },
  {
    id: "gm", name: "Giám đốc vận hành", desc: "Toàn quyền nghiệp vụ, không đụng cấu hình hệ thống.",
    scope: "all", users: 3, system: false,
    perms: grant(Object.fromEntries(permissionModules.filter((m) => m.id !== "system").map((m) => [m.id, ["view", "create", "edit", "approve"]]))),
  },
  {
    id: "branch_manager", name: "Quản lý chi nhánh", desc: "Chỉ dữ liệu của chi nhánh được phân công.",
    scope: "branch", users: 4, system: false,
    perms: grant({
      dashboard: ["view"], branches: ["view"], rooms: ["view", "edit"], rates: ["view"],
      bookings: ["view", "create", "edit", "approve"], restaurant: ["view", "edit"],
      menu: ["view"], stock: ["view", "create", "edit"], guests: ["view", "edit"],
      reviews: ["view", "edit"], staff: ["view", "edit"], payroll: ["view"],
      invoices: ["view", "create"], receivables: ["view"], cashflow: ["view", "create"], reports: ["view"],
    }),
  },
  {
    id: "accountant", name: "Kế toán", desc: "Tập trung vào hóa đơn, công nợ, thu chi và lương.",
    scope: "all", users: 3, system: false,
    perms: grant({
      dashboard: ["view"], bookings: ["view"], guests: ["view"], staff: ["view"],
      payroll: ["view", "edit", "approve"], invoices: ["view", "create", "edit"],
      receivables: ["view", "create", "edit", "approve"], cashflow: ["view", "create", "edit", "approve"],
      reports: ["view"],
    }),
  },
  {
    id: "reception", name: "Lễ tân", desc: "Nhận và trả phòng, tra cứu khách.",
    scope: "branch", users: 24, system: false,
    perms: grant({
      dashboard: ["view"], rooms: ["view", "edit"], bookings: ["view", "create", "edit"],
      guests: ["view", "create", "edit"], invoices: ["view", "create"],
    }),
  },
  {
    id: "chef", name: "Bếp trưởng", desc: "Thực đơn, kho bếp và vận hành nhà hàng.",
    scope: "branch", users: 4, system: false,
    perms: grant({
      dashboard: ["view"], restaurant: ["view", "edit"], menu: ["view", "create", "edit"],
      stock: ["view", "create", "edit", "approve"],
    }),
  },
  {
    id: "marketer", name: "Nhân viên Marketing", desc: "Nội dung, chiến dịch và mã khuyến mãi.",
    scope: "all", users: 5, system: false,
    perms: grant({ dashboard: ["view"], marketing: ["view", "create", "edit"], reviews: ["view", "edit"], guests: ["view"] }),
  },
];

export const systemUsers = staff.slice(0, 26).map((st, i) => {
  const r = i === 0 ? "owner" : i < 3 ? "gm" : i < 7 ? "branch_manager"
    : i < 10 ? "accountant" : i < 14 ? "chef" : i < 19 ? "marketer" : "reception";
  return {
    id: `U-${String(i + 1).padStart(4, "0")}`,
    staffId: st.id,
    name: st.name,
    email: st.email,
    avatar: st.avatar,
    roleId: r,
    roleName: roles.find((x) => x.id === r)?.name,
    branchId: roles.find((x) => x.id === r)?.scope === "branch" ? st.branchId : null,
    branchName: roles.find((x) => x.id === r)?.scope === "branch" ? st.branchName : "Tất cả chi nhánh",
    active: i !== 11 && i !== 23,
    twoFA: i % 3 === 0,
    lastLogin: `${d(-ri(0, 9))} ${String(ri(6, 22)).padStart(2, "0")}:${String(ri(0, 59)).padStart(2, "0")}`,
  };
});

/* ═══════════════════════════════════════════════════════════
   13. NHẬT KÝ HỆ THỐNG
   ═══════════════════════════════════════════════════════════ */
export const LOG_ACTIONS = [
  { id: "create", label: "Thêm mới", tone: "success" },
  { id: "update", label: "Cập nhật", tone: "info" },
  { id: "delete", label: "Xóa", tone: "danger" },
  { id: "approve", label: "Duyệt", tone: "highlight" },
  { id: "login", label: "Đăng nhập", tone: "neutral" },
  { id: "export", label: "Xuất dữ liệu", tone: "warning" },
];

const LOG_TEMPLATES = [
  ["update", "rates", (v) => `Đổi giá hạng ${v.rt} kênh ${v.ch} từ ${v.a} sang ${v.b}`],
  ["create", "bookings", (v) => `Tạo đặt phòng ${v.bk} cho khách ${v.g}`],
  ["delete", "bookings", (v) => `Hủy đặt phòng ${v.bk} — hoàn ${v.a}`],
  ["approve", "payroll", (v) => `Duyệt bảng lương tháng 7 cho ${v.n} nhân viên`],
  ["update", "rooms", (v) => `Chuyển phòng ${v.rm} sang trạng thái bảo trì`],
  ["create", "menu", (v) => `Thêm món "${v.dish}" vào thực đơn`],
  ["update", "stock", (v) => `Nhập kho ${v.ing} — ${v.qty}`],
  ["approve", "receivables", (v) => `Xác nhận thanh toán công nợ ${v.dt}`],
  ["export", "reports", () => `Xuất báo cáo doanh thu tháng 7 (PDF)`],
  ["login", "system", (v) => `Đăng nhập từ ${v.ip}`],
  ["update", "system", () => `Đổi cấu hình thuế VAT từ 8% sang 10%`],
  ["delete", "guests", (v) => `Xóa hồ sơ khách trùng lặp ${v.g}`],
  ["create", "marketing", (v) => `Tạo mã khuyến mãi ${v.code}`],
  ["update", "staff", (v) => `Đổi chi nhánh phụ trách của ${v.g}`],
];

export const auditLog = Array.from({ length: 90 }, (_, i) => {
  const [action, module, tpl] = pick(LOG_TEMPLATES);
  const u = pick(systemUsers);
  const b = pick(BR);
  const vars = {
    rt: pick(roomTypes).name,
    ch: pick(CHANNELS).label,
    a: `${ri(12, 48)}00.000đ`,
    b: `${ri(12, 48)}00.000đ`,
    bk: `BK-${String(ri(1, 320)).padStart(6, "0")}`,
    g: pick(guests).name,
    n: ri(28, 48),
    rm: pick(rooms).number,
    dish: pick(menuItems).name,
    ing: pick(ingredients).name,
    qty: `${ri(10, 80)} ${pick(["kg", "con", "chai", "thùng"])}`,
    dt: pick(DEBTOR_DEFS)[0],
    code: pick(promotions).code,
    ip: `113.161.${ri(1, 254)}.${ri(1, 254)}`,
  };
  const day = ri(0, 20);
  return {
    id: `LOG-${String(90 - i).padStart(5, "0")}`,
    at: `${d(-day)} ${String(ri(6, 23)).padStart(2, "0")}:${String(ri(0, 59)).padStart(2, "0")}:${String(ri(0, 59)).padStart(2, "0")}`,
    action,
    actionLabel: LOG_ACTIONS.find((x) => x.id === action)?.label,
    module,
    moduleLabel: permissionModules.find((m) => m.id === module)?.label || "Hệ thống",
    userId: u.id,
    userName: u.name,
    userAvatar: u.avatar,
    roleName: u.roleName,
    branchId: b,
    branchName: brName(b),
    detail: tpl(vars),
    ip: vars.ip,
    device: pick(["Chrome · Windows", "Safari · macOS", "Chrome · Android", "Safari · iPhone", "Edge · Windows"]),
  };
}).sort((a, b) => b.at.localeCompare(a.at));
