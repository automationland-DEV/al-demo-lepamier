// Mock data lớn cho hệ thống quản lý khách sạn đa chi nhánh
// Tất cả là dữ liệu giả lập, phục vụ demo UI/UX

const firstNames = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng",
  "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "An", "Bình", "Châu", "Duy",
  "Gia", "Hân", "Khánh", "Linh", "Minh", "Ngân", "Phú", "Quốc", "Thảo", "Uyên",
];
const lastNames = [
  "An", "Bình", "Cường", "Dũng", "Em", "Phúc", "Giang", "Huy", "Khoa", "Long",
  "My", "Nam", "Oanh", "Phát", "Quang", "Sơn", "Thanh", "Uy", "Vinh", "Yến",
  "Hà", "Lan", "Mai", "Phương", "Trang", "Hương", "Thư", "Diệu", "Hạnh", "Tú",
];

const cities = [
  { city: "Đức Hòa", code: "DH", lat: 10.881, region: "Long An", type: "Nghỉ dưỡng sinh thái", street: "Quốc lộ 1A, H. Đức Hòa" },
  { city: "Hồ Tràm", code: "HT", lat: 10.481, region: "Bà Rịa - Vũng Tàu", type: "Beach Resort", street: "Đường Ven Biển, X. Bình Châu" },
  { city: "Long An", code: "LA", lat: 10.695, region: "Long An", type: "Khách sạn trung tâm", street: "Trần Hưng Đạo, TP. Tân An" },
  { city: "Tây Ninh", code: "TN", lat: 11.311, region: "Tây Ninh", type: "Mountain Retreat", street: "Cách Mạng Tháng 8, TP. Tây Ninh" },
];

const branchPrefixes = [
  "Condo HUB Resort",
  "Condo HUB Eco Park",
  "Condo HUB Garden",
  "Condo HUB Land",
];

const roomTypes = [
  { key: "STD", name: "Standard", basePrice: 1200000, color: "bg-slate-100 text-slate-700" },
  { key: "SUP", name: "Superior", basePrice: 1800000, color: "bg-blue-100 text-blue-700" },
  { key: "DLX", name: "Deluxe", basePrice: 2500000, color: "bg-blue-100 text-blue-700" },
  { key: "STE", name: "Suite", basePrice: 4200000, color: "bg-violet-100 text-violet-700" },
  { key: "EXE", name: "Executive Suite", basePrice: 6500000, color: "bg-amber-100 text-amber-700" },
  { key: "PRE", name: "Presidential", basePrice: 12000000, color: "bg-rose-100 text-rose-700" },
];

const roomStatuses = [
  { key: "available", label: "Trống", color: "bg-blue-500", text: "text-blue-700", soft: "bg-blue-50 border-blue-200" },
  { key: "occupied", label: "Đang ở", color: "bg-brand-500", text: "text-brand-700", soft: "bg-brand-50 border-brand-200" },
  { key: "reserved", label: "Đã đặt", color: "bg-violet-500", text: "text-violet-700", soft: "bg-violet-50 border-violet-200" },
  { key: "cleaning", label: "Đang dọn", color: "bg-amber-500", text: "text-amber-700", soft: "bg-amber-50 border-amber-200" },
  { key: "maintenance", label: "Bảo trì", color: "bg-rose-500", text: "text-rose-700", soft: "bg-rose-50 border-rose-200" },
];

const bookingSources = ["Walk-in", "Booking.com", "Agoda", "Traveloka", "Website", "Đại lý", "Số điện thoại", "Email"];
const bookingStatuses = [
  { key: "pending", label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700" },
  { key: "confirmed", label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  { key: "checked_in", label: "Đang ở", color: "bg-blue-100 text-blue-700" },
  { key: "checked_out", label: "Đã trả phòng", color: "bg-ink-100 text-ink-700" },
  { key: "cancelled", label: "Đã hủy", color: "bg-rose-100 text-rose-700" },
];

const staffRoles = [
  { key: "manager", label: "Quản lý", count: 1 },
  { key: "reception", label: "Lễ tân", count: 6 },
  { key: "housekeeping", label: "Buồng phòng", count: 10 },
  { key: "fnb", label: "Ẩm thực", count: 8 },
  { key: "security", label: "An ninh", count: 3 },
  { key: "maintenance", label: "Kỹ thuật", count: 2 },
  { key: "accountant", label: "Kế toán", count: 1 },
];

const services = [
  { id: "svc-001", name: "Buffet sáng", category: "Ăn uống", price: 350000, unit: "người/lượt" },
  { id: "svc-002", name: "Spa & Massage 60'", category: "Sức khỏe", price: 890000, unit: "lượt" },
  { id: "svc-003", name: "Đưa đón sân bay", category: "Di chuyển", price: 450000, unit: "chuyến" },
  { id: "svc-004", name: "Giặt ủi", category: "Tiện ích", price: 80000, unit: "kg" },
  { id: "svc-005", name: "Phòng họp", category: "Sự kiện", price: 2500000, unit: "buổi" },
  { id: "svc-006", name: "Mini bar", category: "Tiện ích", price: 250000, unit: "lần" },
  { id: "svc-007", name: "Yoga buổi sáng", category: "Sức khỏe", price: 200000, unit: "người" },
  { id: "svc-008", name: "Tour city", category: "Trải nghiệm", price: 680000, unit: "khách" },
];

// ===== Seeded random for stable data =====
let seed = 42;
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pickN = (arr, n) => {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
};
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const generateName = () => `${pick(lastNames)} ${pick(firstNames)}`;
const generatePhone = () => `0${randInt(90, 99)}${randInt(1000000, 9999999)}`.slice(0, 10);
const generateEmail = (name) => {
  const slug = name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 8);
  return `${slug}${randInt(100, 999)}@email.vn`;
};

// ====== Branches (4 chi nhánh chính) ======
const branchImages = [
  // Đức Hòa — eco resort, garden
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&auto=format&fit=crop&q=80",
  // Hồ Tràm — beach resort
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&auto=format&fit=crop&q=80",
  // Long An — city hotel
  "https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200&auto=format&fit=crop&q=80",
  // Tây Ninh — mountain retreat
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&auto=format&fit=crop&q=80",
];
const branchGallery = [
  // Đức Hòa
  [
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
  ],
  // Hồ Tràm
  [
    "https://images.unsplash.com/photo-1505881502353-a1986add3762?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573843981265-be1019b83005?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1200&auto=format&fit=crop&q=80",
  ],
  // Long An
  [
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1564501049412-61e2a092379d?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&auto=format&fit=crop&q=80",
  ],
  // Tây Ninh
  [
    "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&auto=format&fit=crop&q=80",
  ],
];

export const branches = cities.map((c, i) => {
  const prefix = branchPrefixes[i % branchPrefixes.length];
  const totalRooms = randInt(120, 260);
  const occupancy = randInt(55, 95);
  const openYear = randInt(2018, 2025);
  return {
    id: `BR-${c.code}-${String(i + 1).padStart(3, "0")}`,
    name: `${prefix} ${c.city}`,
    code: c.code,
    city: c.city,
    region: c.region,
    type: c.type,
    address: `${randInt(1, 999)} ${c.street}`,
    phone: generatePhone(),
    email: `branch.${c.code.toLowerCase()}@condohub.vn`,
    manager: generateName(),
    rating: +(4.0 + rand() * 1.0).toFixed(1),
    totalRooms,
    occupancy,
    revenue: randInt(2_400_000_000, 9_800_000_000),
    status: i === 0 ? "active" : (rand() > 0.15 ? "active" : "renovating"),
    openingDate: `${openYear}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
    facilities: pickN(
      ["Hồ bơi", "Spa", "Phòng gym", "Nhà hàng", "Rooftop bar", "Bãi đỗ xe", "Phòng họp", "Sân vườn", "BBQ ngoài trời", "Bãi biển riêng"],
      randInt(5, 7)
    ),
    image: branchImages[i % branchImages.length],
    gallery: branchGallery[i % branchGallery.length],
  };
});

// ====== Rooms (sinh nhiều phòng cho mỗi chi nhánh) ======
export const rooms = (() => {
  const list = [];
  let counter = 0;
  branches.forEach((b) => {
    const floors = Math.ceil(b.totalRooms / 20);
    for (let f = 1; f <= floors; f++) {
      const perFloor = f === floors ? b.totalRooms - (floors - 1) * 20 : randInt(14, 22);
      for (let r = 1; r <= perFloor; r++) {
        const type = roomTypes[Math.min(roomTypes.length - 1, Math.floor(rand() * (f === floors ? 4 : 6)))];
        const status = pick(roomStatuses);
        counter++;
        list.push({
          id: `RM-${b.code}-${String(f).padStart(2, "0")}${String(r).padStart(2, "0")}`,
          branchId: b.id,
          branchCode: b.code,
          branchName: b.name,
          floor: f,
          number: `${f}${String(r).padStart(2, "0")}`,
          type: type.key,
          typeName: type.name,
          price: type.basePrice + randInt(-200000, 400000),
          status: status.key,
          statusLabel: status.label,
          statusColor: status.color,
          statusSoft: status.soft,
          guest: status.key === "occupied" ? generateName() : null,
        });
      }
    }
  });
  return list;
})();

// ====== Staff ======
export const staff = (() => {
  const list = [];
  branches.forEach((b) => {
    staffRoles.forEach((role) => {
      for (let i = 0; i < role.count; i++) {
        const name = role.key === "manager" ? b.manager : generateName();
        list.push({
          id: `ST-${b.code}-${String(list.length + 1).padStart(4, "0")}`,
          name,
          branchId: b.id,
          branchName: b.name,
          role: role.key,
          roleLabel: role.label,
          email: generateEmail(name),
          phone: generatePhone(),
          shift: pick(["Ca sáng (6h-14h)", "Ca chiều (14h-22h)", "Ca đêm (22h-6h)"]),
          status: rand() > 0.05 ? "active" : "leave",
          joinedAt: `${randInt(2018, 2025)}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
          salary: randInt(6_000_000, 28_000_000),
          rating: +(3.5 + rand() * 1.5).toFixed(1),
          avatar: `https://i.pravatar.cc/100?img=${randInt(1, 70)}`,
        });
      }
    });
  });
  return list;
})();

// ====== Guests ======
export const guests = (() => {
  const list = [];
  const tiers = ["Thường", "Bạc", "Vàng", "Bạch kim", "Kim cương"];
  const nationalities = ["Việt Nam", "Hàn Quốc", "Nhật Bản", "Trung Quốc", "Mỹ", "Anh", "Pháp", "Úc", "Singapore", "Malaysia"];
  for (let i = 0; i < 240; i++) {
    const name = generateName();
    const totalBookings = randInt(1, 18);
    list.push({
      id: `GU-${String(i + 1).padStart(5, "0")}`,
      name,
      email: generateEmail(name),
      phone: generatePhone(),
      nationality: pick(nationalities),
      tier: tiers[Math.min(tiers.length - 1, Math.floor(totalBookings / 3))],
      totalBookings,
      totalSpent: totalBookings * randInt(2_000_000, 12_000_000),
      lastVisit: `2026-${String(randInt(1, 7)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
      avatar: `https://i.pravatar.cc/100?img=${randInt(1, 70)}`,
      branchId: pick(branches).id,
      notes: pickN(
        ["Khách VIP", "Yêu cầu phòng tầng cao", "Dị ứng lông thú", "Đã từng khiếu nại", "Thích phòng view biển"],
        randInt(0, 2)
      ),
    });
  }
  return list;
})();

// ====== Bookings ======
export const bookings = (() => {
  const list = [];
  for (let i = 0; i < 320; i++) {
    const branch = pick(branches);
    const room = pick(roomTypes);
    const guest = pick(guests);
    const nights = randInt(1, 8);
    const checkInOffset = randInt(-30, 30);
    const checkIn = new Date(2026, 6, 15 + checkInOffset);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);
    const total = (room.basePrice + randInt(-100000, 300000)) * nights;
    list.push({
      id: `BK-${String(i + 1).padStart(6, "0")}`,
      guestName: guest.name,
      guestId: guest.id,
      guestAvatar: guest.avatar,
      branchId: branch.id,
      branchName: branch.name,
      roomType: room.key,
      roomTypeName: room.name,
      nights,
      checkIn: checkIn.toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
      guests: randInt(1, 4),
      status: pick(bookingStatuses).key,
      source: pick(bookingSources),
      total,
      paid: total * (rand() > 0.2 ? 1 : 0.3),
      createdAt: new Date(2026, 6, 1 + checkInOffset - randInt(1, 20)).toISOString().slice(0, 10),
    });
  }
  return list;
})();

export const bookingStatusList = bookingStatuses;
export const roomStatusList = roomStatuses;
export const roomTypeList = roomTypes;
export const serviceList = services;

// ====== Aggregates cho dashboard ======
export const dashboardStats = {
  totalBranches: branches.length,
  totalRooms: rooms.length,
  totalStaff: staff.length,
  totalGuests: guests.length,
  todayCheckIns: bookings.filter((b) => b.checkIn === "2026-07-28" || b.checkIn === "2026-07-27").length,
  todayCheckOuts: bookings.filter((b) => b.checkOut === "2026-07-28" || b.checkOut === "2026-07-27").length,
  occupancyRate: Math.round(
    (rooms.filter((r) => r.status === "occupied").length / rooms.length) * 100
  ),
  monthlyRevenue: 18_450_000_000,
  monthlyRevenueGrowth: 12.4,
  avgRating: 4.7,
  pendingBookings: bookings.filter((b) => b.status === "pending").length,
};

// Chart data (12 tháng)
export const revenueChart = Array.from({ length: 12 }, (_, i) => ({
  month: `T${i + 1}`,
  revenue: randInt(12_000_000_000, 22_000_000_000),
  occupancy: randInt(55, 92),
}));

export const occupancyByBranch = branches.map((b) => ({
  name: b.code,
  occupancy: b.occupancy,
  revenue: b.revenue / 1_000_000_000,
}));

export const roomStatusDistribution = roomStatuses.map((s) => ({
  name: s.label,
  value: rooms.filter((r) => r.status === s.key).length,
  color: s.color.replace("bg-", "#").replace("-500", ""),
}));

export const bookingsBySource = bookingSources.map((s) => ({
  name: s,
  value: bookings.filter((b) => b.source === s).length,
}));

// Recent activity
export const recentActivity = [
  { id: 1, type: "checkin", user: "Nguyễn Văn An", text: "vừa check-in phòng 1204 tại Condo HUB Đức Hòa", time: "2 phút trước", icon: "log-in" },
  { id: 2, type: "booking", user: "Trần Thị Bình", text: "đặt 3 đêm phòng Suite tại Condo HUB Hồ Tràm", time: "8 phút trước", icon: "calendar" },
  { id: 3, type: "review", user: "Lê Hoàng Cường", text: "đánh giá 5★ cho khu Condo HUB Hồ Tràm", time: "15 phút trước", icon: "star" },
  { id: 4, type: "checkout", user: "Phạm Minh Dũng", text: "đã trả phòng 805 tại Condo HUB Long An", time: "22 phút trước", icon: "log-out" },
  { id: 5, type: "service", user: "Khách VIP", text: "yêu cầu dịch vụ spa 60' tại Condo HUB Tây Ninh", time: "35 phút trước", icon: "sparkles" },
  { id: 6, type: "issue", user: "Bùi Phương Linh", text: "báo lỗi điều hòa phòng 304 - Condo HUB Hồ Tràm", time: "1 giờ trước", icon: "alert" },
  { id: 7, type: "booking", user: "Hoàng Khánh My", text: "hủy đặt phòng tại Condo HUB Tây Ninh", time: "1 giờ trước", icon: "x" },
  { id: 8, type: "checkin", user: "Vũ Quốc Nam", text: "check-in sớm phòng 612 tại Condo HUB Đức Hòa", time: "2 giờ trước", icon: "log-in" },
];

export const taskList = [
  { id: 1, title: "Duyệt 14 booking chờ xác nhận", branch: "Tất cả chi nhánh", due: "Hôm nay", priority: "high", done: false },
  { id: 2, title: "Báo cáo doanh thu tuần gửi Ban giám đốc", branch: "Văn phòng", due: "Thứ 6", priority: "high", done: false },
  { id: 3, title: "Kiểm kê minibar tầng 5-12", branch: "Condo HUB Đức Hòa", due: "Hôm nay", priority: "medium", done: true },
  { id: 4, title: "Đào tạo nhân viên mới quy trình check-in", branch: "Condo HUB Hồ Tràm", due: "Mai", priority: "medium", done: false },
  { id: 5, title: "Đặt vật tư cho mùa cao điểm", branch: "Condo HUB Tây Ninh", due: "Tuần này", priority: "low", done: false },
  { id: 6, title: "Cập nhật bảng giá dịch vụ Spa mới", branch: "Tất cả", due: "Thứ 7", priority: "low", done: false },
];

// ═══════════════════════════════════════════════════════════════
// Website analytics — nguồn cho trang "Tổng quan Website" (/website)
//
// ⚠️ Khối này PHẢI nằm cuối file. Nó tiêu thụ rand() nên chèn lên trên sẽ
// dịch toàn bộ chuỗi sinh phía sau và làm đổi hết dữ liệu đã có.
//
// Dữ liệu tách theo NGÀY × CHI NHÁNH để trang lọc được đồng thời theo khoảng
// thời gian và theo chi nhánh đang chọn trên sidebar.
// ═══════════════════════════════════════════════════════════════

/** Ngày "hôm nay" của dữ liệu website — mốc để tính các khoảng 7/30/90 ngày */
export const websiteToday = "2026-08-02";

/** Số ngày lịch sử sinh sẵn.
 *  Phải ≥ 2× khoảng dài nhất trên UI (90 ngày) để kỳ so sánh liền trước cũng
 *  nằm trọn trong dữ liệu, nếu không tăng trưởng sẽ bị thổi phồng. */
const WEB_DAYS = 260;

/** YYYY-MM-DD theo giờ địa phương (toISOString sẽ lệch 1 ngày ở UTC+7) */
const isoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* Chi nhánh nhiều phòng thì kéo được nhiều truy cập hơn */
const webBranchWeight = branches.map((b) => 0.62 + (b.totalRooms / 260) * 0.9);

export const websiteDaily = (() => {
  const out = [];
  const end = new Date(2026, 7, 2); // 02/08/2026

  for (let i = WEB_DAYS - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const weekend = dow === 0 || dow === 6 ? 1.26 : 1;      // cuối tuần khách xem nhiều hơn
    const trend = 0.82 + ((WEB_DAYS - i) / WEB_DAYS) * 0.36; // xu hướng tăng dần vào cao điểm hè

    const byBranch = {};
    branches.forEach((b, bi) => {
      const visits = Math.round(880 * webBranchWeight[bi] * weekend * trend * (0.88 + rand() * 0.24));
      const mobile = Math.round(visits * (0.63 + rand() * 0.08));
      const tablet = Math.round(visits * (0.03 + rand() * 0.02));
      byBranch[b.id] = {
        visits,
        users: Math.round(visits * (0.62 + rand() * 0.1)),
        mobile,
        tablet,
        desktop: visits - mobile - tablet,
        downloads: Math.round(visits * (0.16 + rand() * 0.06)), // tải bảng giá phòng
        shares: Math.round(visits * (0.11 + rand() * 0.05)),
        bookings: Math.round(visits * (0.05 + rand() * 0.03)),  // đặt phòng qua website
        chats: Math.round(visits * (0.07 + rand() * 0.04)),
        calls: Math.round(visits * (0.04 + rand() * 0.02)),
        leads: Math.round(visits * (0.13 + rand() * 0.06)),     // lượt quan tâm: lưu tin, đăng ký nhận giá
      };
    });

    out.push({ date: isoDate(d), byBranch });
  }
  return out;
})();

/** Người đang xem website ngay lúc này — số realtime, không phụ thuộc khoảng ngày */
export const websiteOnline = branches.reduce((acc, b, i) => {
  acc[b.id] = randInt(16, 22 + Math.round(webBranchWeight[i] * 16));
  return acc;
}, {});

/* Tỉ lệ lượt truy cập rơi vào trang chi tiết phòng / trang dịch vụ.
   Đã gộp sẵn vào tổng trọng số bên dưới nên trang chỉ việc nhân với lượt truy cập. */
const ROOM_VIEW_RATE = 0.22;
const SERVICE_VIEW_RATE = 0.14;

/* Độ phổ biến nền của từng loại phòng / dịch vụ — GIỐNG NHAU ở mọi chi nhánh.
   Nếu để mỗi chi nhánh random độc lập thì khi cộng 4 chi nhánh lại, chênh lệch
   triệt tiêu và bảng "TOP" ra 5 dòng gần bằng nhau. Bình phương rand() để vài
   mục nổi trội hẳn, giống hành vi thật của người xem website. */
const popularity = (n, lo, span) => Array.from({ length: n }, () => lo + rand() ** 2 * span);

const roomPopularity = popularity(roomTypes.length, 0.22, 1.9);
const servicePopularity = popularity(services.length, 0.18, 1.7);

/** Trọng số lượt xem theo loại phòng, riêng cho từng chi nhánh — tổng = ROOM_VIEW_RATE */
export const websiteRoomTypeShare = (() => {
  const out = {};
  branches.forEach((b) => {
    const raw = roomTypes.map((_, i) => roomPopularity[i] * (0.82 + rand() * 0.36));
    const sum = raw.reduce((a, x) => a + x, 0);
    out[b.id] = Object.fromEntries(
      roomTypes.map((t, i) => [t.key, (raw[i] / sum) * ROOM_VIEW_RATE])
    );
  });
  return out;
})();

/** Trọng số lượt xem theo dịch vụ, riêng cho từng chi nhánh — tổng = SERVICE_VIEW_RATE */
export const websiteServiceShare = (() => {
  const out = {};
  branches.forEach((b) => {
    const raw = services.map((_, i) => servicePopularity[i] * (0.82 + rand() * 0.36));
    const sum = raw.reduce((a, x) => a + x, 0);
    out[b.id] = Object.fromEntries(
      services.map((s, i) => [s.id, (raw[i] / sum) * SERVICE_VIEW_RATE])
    );
  });
  return out;
})();

/* ───────────────────────────────────────────────────────────────
   Tài khoản người dùng website — nguồn cho trang /website/users
   ─────────────────────────────────────────────────────────────── */

/** Số tài khoản đã tồn tại TRƯỚC ngày đầu tiên của dữ liệu, theo chi nhánh quan tâm */
export const websiteUserBase = branches.reduce((acc, b, i) => {
  acc[b.id] = randInt(1500, 2100) + Math.round(webBranchWeight[i] * 900);
  return acc;
}, {});

/** Đăng ký mới và số tài khoản hoạt động mỗi ngày.
 *  Suy ra từ `websiteDaily` để hai tab luôn khớp nhau: ngày website đông khách
 *  thì cũng là ngày nhiều người đăng ký và nhiều người hoạt động. */
export const websiteUserDaily = websiteDaily.map((row) => {
  const byBranch = {};
  for (const b of branches) {
    const v = row.byBranch[b.id].visits;
    byBranch[b.id] = {
      newUsers: Math.round(v * (0.0032 + rand() * 0.0022)),
      dau: Math.round(v * (0.065 + rand() * 0.03)),
    };
  }
  return { date: row.date, byBranch };
});

/* Số tài khoản riêng biệt có hoạt động trong N ngày luôn nhỏ hơn tổng DAU cộng
   lại (một người vào nhiều ngày chỉ tính một lần). Hệ số mũ 0.45 là cách xấp xỉ
   quen thuộc để suy DAU → MAU; trang hiển thị kèm chữ "ước tính". */
export const ACTIVE_REACH_EXPONENT = 0.45;

/** Bảng vàng: 40 tài khoản hoạt động mạnh nhất.
 *  Tên và ảnh lấy từ `guests` để trùng khớp với dữ liệu khách hàng trong CRM,
 *  thay vì bịa ra một tập người dùng thứ hai không liên quan. */
export const WEB_USER_METRICS = ["downloads", "shares", "bookings", "chats", "calls"];

export const websiteTopUsers = (() => {
  const chosen = pickN(guests, 40);

  /* Mỗi chỉ số có bảng xếp hạng riêng: cùng một dải trọng số giảm dần nhưng
     gán cho người khác nhau, nên 5 bảng TOP không ra y hệt một thứ tự. */
  const shareByMetric = {};
  for (const m of WEB_USER_METRICS) {
    const scale = Array.from({ length: chosen.length }, (_, i) => 0.0021 * 0.93 ** i);
    const order = pickN(chosen.map((_, i) => i), chosen.length); // hoán vị có seed
    const arr = new Array(chosen.length);
    order.forEach((userIdx, rank) => { arr[userIdx] = scale[rank] * (0.88 + rand() * 0.24); });
    shareByMetric[m] = arr;
  }

  return chosen.map((g, i) => ({
    id: g.id,
    name: g.name,
    email: g.email,
    tier: g.tier,
    branchId: g.branchId,
    phase: rand(),                       // lệch pha mùa vụ → đổi khoảng ngày là đổi thứ hạng
    share: Object.fromEntries(WEB_USER_METRICS.map((m) => [m, shareByMetric[m][i]])),
  }));
})();

/* Phân bố truy cập theo 24 giờ. Web dồn vào giờ hành chính, mobile dồn vào
   giờ nghỉ trưa và buổi tối — hai đường cong khác nhau mới ra được biểu đồ
   xếp chồng có ý nghĩa. */
const WEB_HOUR_CURVE    = [12, 7, 4, 3, 3, 5, 14, 30, 62, 88, 96, 90, 78, 72, 88, 92, 80, 62, 46, 38, 34, 28, 22, 16];
const MOBILE_HOUR_CURVE = [22, 14, 8, 5, 5, 9, 20, 38, 58, 70, 76, 82, 92, 86, 78, 74, 76, 80, 88, 96, 92, 80, 60, 38];

/** { [branchId]: [{ hour, web, mobile }] } — trọng số, tổng mỗi kênh = 1 */
export const websiteHourly = (() => {
  const out = {};
  for (const b of branches) {
    const web = WEB_HOUR_CURVE.map((v) => v * (0.9 + rand() * 0.2));
    const mob = MOBILE_HOUR_CURVE.map((v) => v * (0.9 + rand() * 0.2));
    const sw = web.reduce((a, x) => a + x, 0);
    const sm = mob.reduce((a, x) => a + x, 0);
    out[b.id] = web.map((_, h) => ({ hour: h, web: web[h] / sw, mobile: mob[h] / sm }));
  }
  return out;
})();