import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";
import { StatusPill, AccentPill, Trend, TONE } from "../components/Semantic";

const {
  Bell, Calendar, Filter, MoreHorizontal, Check, CheckCheck,
  Search, Trash2, Settings, Mail, Smartphone, MessageSquare,
  AlertCircle, CheckCircle2, Clock, Activity, Star, Zap,
  Heart, Key, CreditCard, UserCog, Building2, BedDouble,
  CalendarCheck, TrendingUp, TrendingDown, Wallet, Percent,
  Sparkles, Shield, Coffee, MapPin, Crown, BadgeCheck,
  ChevronRight, ChevronDown, Eye, EyeOff, Save, RotateCcw,
  Volume2, VolumeX, Globe, Languages, Moon, X, Plus,
  Hourglass, PartyPopper, Newspaper, Briefcase, Receipt,
  ArrowUpRight, Tag, Users, Megaphone, Bot, Radio,
  Flame, Send, ListFilter, Bookmark, Share2, Pin, PinOff,
  FileText,
} = Icons;

/* ═══════════════════════════════════════════════════════════════════
   DỮ LIỆU MẪU — phong phú, phản ánh hệ thống hotel mgmt
   ═══════════════════════════════════════════════════════════════════ */
const NOTIFICATIONS = [
  // Hôm nay
  { id: "N-001", time: "2 phút trước",   date: "Hôm nay 09:43", type: "booking",    priority: "high",   category: "booking",      title: "Booking mới cần xác nhận",          desc: "Phòng Villa Sapa — check-in 14/08, 4 khách, tổng 12.8 triệu",           meta: { code: "BK-2418", branch: "LP2 Đà Lạt",   source: "Booking.com" }, unread: true,  pinned: true,  icon: CalendarCheck },
  { id: "N-002", time: "15 phút trước",  date: "Hôm nay 09:30", type: "alert",      priority: "urgent", category: "alert",        title: "Phòng B-204 báo sự cố điều hoà",     desc: "Khách phản ánh nóng lúc 09:15. Cần xử lý trong 30 phút theo SLA",      meta: { code: "RM-204", branch: "LP1 Sài Gòn",  severity: "P1" }, unread: true,  pinned: true,  icon: AlertCircle },
  { id: "N-003", time: "1 giờ trước",     date: "Hôm nay 08:43", type: "ai",         priority: "info",   category: "ai",           title: "AI phát hiện bất thường doanh thu",  desc: "Chi nhánh LP3 thứ 2 thấp hơn 18% so với baseline. Có thể do occupancy giảm", meta: { branch: "LP3 Phú Quốc", model: "forecast-v2.4" }, unread: true,  pinned: false, icon: Bot },
  { id: "N-004", time: "2 giờ trước",     date: "Hôm nay 07:46", type: "success",    priority: "low",    category: "system",       title: "Check-out hoàn tất · đoàn 24 khách",  desc: "Đã hoàn tất check-out đoàn công ty Sun Group tại khu Phú Quốc",         meta: { code: "CO-908", branch: "LP3 Phú Quốc",  guests: 24 }, unread: true,  pinned: false, icon: CheckCircle2 },
  { id: "N-005", time: "3 giờ trước",     date: "Hôm nay 06:30", type: "review",     priority: "info",   category: "review",       title: "Đánh giá 5★ mới từ Sarah Lee",         desc: "“Phòng sạch, nhân viên nhiệt tình, view đẹp. Sẽ quay lại!”",          meta: { rating: 5, branch: "LP4 Nha Trang", platform: "Google" }, unread: false, pinned: false, icon: Star },
  { id: "N-006", time: "4 giờ trước",     date: "Hôm nay 05:21", type: "system",     priority: "low",    category: "system",       title: "Sao lưu dữ liệu đêm hoàn tất",        desc: "Backup 4.8 GB thành công lúc 03:00. Validation 100% checksum",        meta: { size: "4.8 GB", status: "ok" }, unread: false, pinned: false, icon: Shield },

  // Hôm qua
  { id: "N-007", time: "Hôm qua 22:14",   date: "Hôm qua",       type: "alert",      priority: "high",   category: "alert",        title: "Kho F&B sắp hết nguyên liệu",         desc: "Wagyu A5 còn 2.1 kg · Cua king size còn 1.4 kg. Cần đặt thêm trong 24h", meta: { items: 2, branch: "LP1 Sài Gòn" }, unread: false, pinned: false, icon: AlertCircle },
  { id: "N-008", time: "Hôm qua 21:30",   date: "Hôm qua",       type: "campaign",   priority: "info",   category: "marketing",    title: "Chiến dịch email Hè rực rỡ đã gửi",     desc: "Gửi đến 12,840 khách · Open rate 28.4% · CTR 6.7% (đang chạy)",         meta: { sent: 12840, open: 3646, ctr: "6.7%" }, unread: false, pinned: false, icon: Megaphone },
  { id: "N-009", time: "Hôm qua 20:08",   date: "Hôm qua",       type: "staff",      priority: "info",   category: "staff",        title: "Ca tối đã phân công đầy đủ",           desc: "Bếp trưởng Nguyễn Văn B xác nhận ca 22:00. 8 nhân viên điểm danh OK",  meta: { branch: "LP2 Đà Lạt", shift: "Tối" }, unread: false, pinned: false, icon: Users },
  { id: "N-010", time: "Hôm qua 18:45",   date: "Hôm qua",       type: "payment",    priority: "high",   category: "payment",      title: "Hoá đơn INV-2607 quá hạn 1 ngày",      desc: "Khách hàng Trần Văn Nam chưa thanh toán 4.2 triệu. Tự động nhắc 2 lần", meta: { code: "INV-2607", amount: "4.2 triệu", overdue: 1 }, unread: false, pinned: false, icon: CreditCard },
  { id: "N-011", time: "Hôm qua 17:00",   date: "Hôm qua",       type: "system",     priority: "low",    category: "system",       title: "Cập nhật hệ thống v2.4.1",             desc: "Đã áp dụng thành công. Không cần restart. 8 cải tiến nhỏ + 3 fix",      meta: { version: "v2.4.1", size: "12 MB" }, unread: false, pinned: false, icon: Sparkles },
  { id: "N-012", time: "Hôm qua 14:32",   date: "Hôm qua",       type: "security",   priority: "urgent", category: "security",     title: "Đăng nhập mới từ Chrome (iPhone)",     desc: "Phát hiện đăng nhập từ thiết bị lạ — 113.161.x.x · TP. HCM · 14:32",   meta: { ip: "113.161.x.x", device: "iPhone 15 Pro" }, unread: false, pinned: false, icon: Shield },

  // Tuần này
  { id: "N-013", time: "23/07 09:00",     date: "23/07",         type: "report",     priority: "info",   category: "report",       title: "Báo cáo doanh thu tuần 30 đã sẵn sàng", desc: "Tăng 18.4% so với tuần trước · Tổng 24.8 tỷ · Báo cáo 12 trang",         meta: { period: "Tuần 30", growth: 18.4 }, unread: false, pinned: false, icon: TrendingUp },
  { id: "N-014", time: "22/07 16:21",     date: "22/07",         type: "booking",    priority: "high",   category: "booking",      title: "Hủy booking đoàn 12 khách",             desc: "Đoàn Sun Group huỷ tour 26/07. Hoàn 38.5 triệu theo chính sách. Free 1 đêm", meta: { code: "BK-2341", refund: "38.5 triệu" }, unread: false, pinned: false, icon: CalendarCheck },
  { id: "N-015", time: "21/07 11:15",     date: "21/07",         type: "ai",         priority: "info",   category: "ai",           title: "AI forecast: tuần 31 dự kiến tăng 24%", desc: "Dựa trên 7 tín hiệu: holiday, weather, search trend, OTA ranking, …",     meta: { model: "forecast-v2.4", confidence: 0.87 }, unread: false, pinned: false, icon: Bot },
  { id: "N-016", time: "20/07 10:00",     date: "20/07",         type: "review",     priority: "info",   category: "review",       title: "Cụm review tiêu cực trên Booking.com",   desc: "3 review 1-2★ trong 24h về 'wifi yếu'. Đề xuất nâng cấp 4 router",      meta: { count: 3, rating: "1-2★", topic: "wifi" }, unread: false, pinned: false, icon: Star },
  { id: "N-017", time: "19/07 22:00",     date: "19/07",         type: "system",     priority: "low",    category: "system",       title: "Sla uptime đạt 99.97% tháng 7",          desc: "Vượt cam kết 99.9%. Credit dịch vụ chưa phát sinh. Xuất báo cáo Uptime", meta: { uptime: "99.97%", sla: "99.9%" }, unread: false, pinned: false, icon: Shield },

  // Cũ hơn
  { id: "N-018", time: "15/07 14:00",     date: "15/07",         type: "campaign",   priority: "info",   category: "marketing",    title: "Chiến dịch Wedding Season đã về đích",   desc: "Đạt 142 booking · 856 triệu doanh thu · ROI 4.2x",                   meta: { bookings: 142, revenue: "856 triệu", roi: "4.2x" }, unread: false, pinned: false, icon: Megaphone },
  { id: "N-019", time: "12/07 09:00",     date: "12/07",         type: "alert",      priority: "high",   category: "alert",        title: "Sự cố POS chi nhánh LP2",              desc: "Mất kết nối 12 phút. Tự động fallback khi đã mất 3 phút. Đã khắc phục", meta: { branch: "LP2 Đà Lạt", duration: "12 phút" }, unread: false, pinned: false, icon: AlertCircle },
  { id: "N-020", time: "10/07 16:30",     date: "10/07",         type: "report",     priority: "info",   category: "report",       title: "Nhập liệu test hệ thống KPI",          desc: "Bạn đã import 2,841 bản ghi KPI từ Excel. Mapping 124 cột thành công",  meta: { rows: 2841, columns: 124 }, unread: false, pinned: false, icon: FileText },
];

const TYPE_META = {
  booking:   { label: "Booking", tone: "accent",    description: "Đặt phòng & lịch đến" },
  alert:     { label: "Cảnh báo", tone: "danger",   description: "Sự cố, tồn kho, thiết bị" },
  ai:        { label: "AI",       tone: "highlight", description: "Gợi ý & dự báo từ AI" },
  success:   { label: "Thành công", tone: "success", description: "Hoàn tất tác vụ" },
  review:    { label: "Đánh giá", tone: "warning",   description: "Review từ khách" },
  system:    { label: "Hệ thống",  tone: "neutral",  description: "Cập nhật & bảo trì" },
  campaign:  { label: "Marketing", tone: "info",     description: "Chiến dịch & email" },
  staff:     { label: "Nhân sự",    tone: "accent",   description: "Ca & phân công" },
  payment:   { label: "Thanh toán", tone: "warning",  description: "Hoá đơn & thu chi" },
  security:  { label: "Bảo mật",    tone: "danger",   description: "Đăng nhập & thiết bị" },
  report:    { label: "Báo cáo",    tone: "info",     description: "Báo cáo & phân tích" },
};

const PRIORITY_META = {
  urgent: { label: "Khẩn cấp", tone: "danger",  weight: 4 },
  high:   { label: "Cao",      tone: "warning", weight: 3 },
  info:   { label: "Bình thường", tone: "info",   weight: 2 },
  low:    { label: "Thấp",      tone: "neutral", weight: 1 },
};

/* Trả bộ màu của một mức ưu tiên. Luôn đi qua TONE thay vì tự nối chuỗi
   `var(--${tone}-soft)` — tone "neutral" không có biến CSS tương ứng. */
const toneOf = (priority) => TONE[PRIORITY_META[priority]?.tone] || TONE.neutral;

const CHANNELS = [
  { id: "inapp", label: "Trong app",   Icon: Bell,         desc: "Hiển thị ngay trên hệ thống",      default: true },
  { id: "email", label: "Email",        Icon: Mail,         desc: "Gửi về hộp thư cá nhân",            default: true },
  { id: "push",  label: "Push",         Icon: Smartphone,   desc: "Realtime trên thiết bị di động",    default: false },
  { id: "sms",   label: "SMS",          Icon: MessageSquare, desc: "Tin nhắn tới số đăng ký",          default: false },
  { id: "telegram", label: "Telegram", Icon: Send,          desc: "Bot chat Condo HUB",              default: false },
  { id: "slack", label: "Slack",        Icon: Radio,         desc: "Webhook tới channel #ops",         default: false },
];

const FILTERS = [
  { id: "all",       label: "Tất cả",          Icon: ListFilter },
  { id: "unread",    label: "Chưa đọc",        Icon: Mail },
  { id: "pinned",    label: "Đã ghim",         Icon: Pin },
  { id: "urgent",    label: "Khẩn cấp",        Icon: AlertCircle },
  { id: "ai",        label: "AI",              Icon: Bot },
  { id: "booking",   label: "Booking",         Icon: CalendarCheck },
  { id: "alert",     label: "Cảnh báo",        Icon: AlertCircle },
  { id: "marketing", label: "Marketing",       Icon: Megaphone },
  { id: "payment",   label: "Thanh toán",      Icon: CreditCard },
];

export default function Notifications() {
  const navigate = useNavigate();
  const [view, setView] = useState("feed"); // feed | settings | preferences
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [pinned, setPinned] = useState(new Set(["N-001", "N-002"]));
  const [read, setRead] = useState(new Set(["N-007", "N-008", "N-009", "N-010", "N-011", "N-012", "N-013", "N-014", "N-015", "N-016", "N-017", "N-018", "N-019", "N-020"]));
  const [active, setActive] = useState(NOTIFICATIONS[0]);

  const togglePin = (id) => {
    setPinned((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleRead = (id) => {
    setRead((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((n) => n.id)));
  };

  const markAllRead = () => {
    setRead(new Set(NOTIFICATIONS.map((n) => n.id)));
  };

  /* Filter + sort */
  const filtered = useMemo(() => {
    let list = [...NOTIFICATIONS];
    if (filter === "unread") list = list.filter((n) => !read.has(n.id));
    if (filter === "pinned") list = list.filter((n) => pinned.has(n.id));
    if (filter === "urgent") list = list.filter((n) => n.priority === "urgent" || n.priority === "high");
    if (["ai", "booking", "alert", "marketing", "payment"].includes(filter)) {
      list = list.filter((n) => n.category === filter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.desc.toLowerCase().includes(q) ||
        (n.meta?.code || "").toLowerCase().includes(q) ||
        (n.meta?.branch || "").toLowerCase().includes(q)
      );
    }
    /* pinned first, then priority weight, then time desc */
    return list.sort((a, b) => {
      const ap = pinned.has(a.id) ? 1 : 0;
      const bp = pinned.has(b.id) ? 1 : 0;
      if (ap !== bp) return bp - ap;
      const aw = PRIORITY_META[a.priority].weight;
      const bw = PRIORITY_META[b.priority].weight;
      if (aw !== bw) return bw - aw;
      return 0;
    });
  }, [filter, query, pinned, read]);

  const stats = {
    total: NOTIFICATIONS.length,
    unread: NOTIFICATIONS.filter((n) => !read.has(n.id)).length,
    urgent: NOTIFICATIONS.filter((n) => n.priority === "urgent").length,
    today: NOTIFICATIONS.filter((n) => n.date.startsWith("Hôm nay")).length,
  };

  return (
    <div className="max-w-[1320px] mx-auto pb-12 px-3 sm:px-4 lg:px-6">
      <PageHeader
        title="Trung tâm thông báo"
        subtitle={`${stats.unread} chưa đọc · ${stats.urgent} khẩn cấp · ${stats.today} hôm nay`}
        actions={
          <>
            <button className="btn-outline" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4" /> Đánh dấu đã đọc
            </button>
            <button
              className="btn-primary"
              onClick={() => setView(view === "settings" ? "feed" : "settings")}
            >
              <Settings className="w-4 h-4" /> {view === "settings" ? "Xem thông báo" : "Cài đặt thông báo"}
            </button>
          </>
        }
      />

      {/* View switcher */}
      <div className="flex items-center gap-1 mb-3 sm:mb-4 border-b overflow-x-auto" style={{ borderColor: "var(--border-soft)" }}>
        {[
          { id: "feed",        label: "Hộp thư",          Icon: Bell },
          { id: "settings",    label: "Đặt lịch thông báo", Icon: Calendar },
          { id: "preferences", label: "Tuỳ chỉnh kênh",    Icon: Settings },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold border-b-2 transition -mb-px shrink-0 whitespace-nowrap"
            style={
              view === v.id
                ? { borderColor: "var(--accent)", color: "var(--accent)" }
                : { borderColor: "transparent", color: "var(--fg-muted)" }
            }
          >
            <v.Icon className="w-4 h-4" /> {v.label}
          </button>
        ))}
      </div>

      {view === "feed" && (
        <FeedView
          stats={stats}
          filter={filter}
          setFilter={setFilter}
          query={query}
          setQuery={setQuery}
          filtered={filtered}
          all={NOTIFICATIONS}
          selected={selected}
          toggleSelect={toggleSelect}
          selectAll={selectAll}
          togglePin={togglePin}
          toggleRead={toggleRead}
          pinned={pinned}
          read={read}
          active={active}
          setActive={setActive}
        />
      )}

      {view === "settings" && (
        <ScheduleSettings />
      )}

      {view === "preferences" && (
        <ChannelPreferences />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   1. FEED VIEW — hộp thư đầy đủ
   ═══════════════════════════════════════════════════════════ */
function FeedView({ stats, filter, setFilter, query, setQuery, filtered, all, selected, toggleSelect, selectAll, togglePin, toggleRead, pinned, read, active, setActive }) {
  // Group by date
  const groups = useMemo(() => {
    const g = {};
    for (const n of filtered) {
      const k = n.date.split(" ")[0] === "Hôm" ? "Hôm nay" : n.date.split(" ")[0] === "Hôm" ? "Hôm qua" : n.date;
      const key = n.date.includes("Hôm nay") ? "Hôm nay" : n.date.includes("Hôm qua") ? "Hôm qua" : "Trước đó";
      if (!g[key]) g[key] = [];
      g[key].push(n);
    }
    return g;
  }, [filtered]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">
      {/* Sidebar filters */}
      <div className="hidden lg:block lg:col-span-3 space-y-4">
        {/* Stats */}
        <Card className="!p-3.5">
          <div className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500 mb-2.5">Tổng quan</div>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Tổng"    value={stats.total}   tone="neutral" />
            <StatTile label="Chưa đọc" value={stats.unread} tone="accent" />
            <StatTile label="Khẩn cấp" value={stats.urgent} tone="danger" />
            <StatTile label="Hôm nay" value={stats.today}   tone="info" />
          </div>
        </Card>

        {/* Filters */}
        <Card className="!p-3">
          <div className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500 mb-2 px-1">Bộ lọc</div>
          <nav className="space-y-0.5">
            {FILTERS.map((f) => {
              const count = all.filter((n) => {
                if (f.id === "all") return true;
                if (f.id === "unread") return !read.has(n.id);
                if (f.id === "pinned") return pinned.has(n.id);
                if (f.id === "urgent") return n.priority === "urgent" || n.priority === "high";
                return n.category === f.id;
              }).length;
              const isActive = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] font-medium transition"
                  style={{
                    backgroundColor: isActive ? "var(--accent-soft)" : "transparent",
                    color: isActive ? "var(--accent-fg)" : "var(--fg)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <f.Icon className="w-3.5 h-3.5" />
                    {f.label}
                  </span>
                  <span
                    className="text-[10px] font-bold tabular-nums px-1.5 rounded"
                    style={{
                      backgroundColor: isActive ? "var(--accent)" : "var(--surface-3)",
                      color: isActive ? "var(--on-accent)" : "var(--fg-muted)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* AI summary */}
        <Card className="!p-3" style={{
          background: "linear-gradient(135deg, var(--highlight-soft), var(--surface))",
          borderColor: "var(--highlight)",
        }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4" style={{ color: "var(--highlight-fg)" }} />
            <span className="text-[11px] uppercase font-bold tracking-wider" style={{ color: "var(--highlight-fg)" }}>
              AI tóm tắt
            </span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--fg)" }}>
            Bạn có <b style={{ color: "var(--danger-fg)" }}>1 việc khẩn</b> (sự cố điều hoà B-204) và <b style={{ color: "var(--warning-fg)" }}>3 ưu tiên cao</b> cần xử lý trong hôm nay. Tổng thời gian ước tính ~45 phút.
          </p>
          <button className="mt-2 text-[11px] font-bold hover:underline" style={{ color: "var(--highlight-fg)" }}>
            Xem danh sách ưu tiên →
          </button>
        </Card>
      </div>

      {/* List */}
      <div className="col-span-1 lg:col-span-5 min-w-0">
        <Card className="!p-0 overflow-hidden">
          {/* Search + toolbar */}
          <div className="px-3 py-2.5 border-b" style={{ borderColor: "var(--border-soft)" }}>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
                <input
                  className="w-full pl-8 pr-3 h-8 rounded-md text-[12.5px] border focus:outline-none focus:border-ink-900"
                  style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)", color: "var(--fg)" }}
                  placeholder="Tìm kiếm thông báo..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button className="p-2 rounded-md hover:bg-ink-50 text-ink-600" title="Lọc nâng cao">
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
            {selected.size > 0 && (
              <div className="flex items-center gap-2 mt-2 px-1.5 py-1.5 rounded-md text-[11.5px]"
                style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)" }}>
                <span className="font-bold">Đã chọn {selected.size}</span>
                <span className="opacity-60">·</span>
                <button className="font-semibold hover:underline flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Đã đọc
                </button>
                <span className="opacity-60">·</span>
                <button className="font-semibold hover:underline flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Ghim
                </button>
                <span className="opacity-60">·</span>
                <button className="font-semibold hover:underline flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Xoá
                </button>
                <span className="flex-1" />
                <button onClick={() => {}} className="font-semibold hover:underline">Bỏ chọn</button>
              </div>
            )}
          </div>

          {/* Header chips */}
          <div className="px-3 py-1.5 border-b flex items-center justify-between text-[10.5px] text-ink-500 font-semibold"
            style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-2)" }}>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.size === filtered.length && filtered.length > 0}
                onChange={selectAll}
                className="rounded"
                style={{ accentColor: "var(--accent)" }}
              />
              Chọn tất cả
            </label>
            <span className="flex items-center gap-1">
              <span className="font-bold tabular-nums">{filtered.length}</span> thông báo
            </span>
          </div>

          {/* List */}
          <div className="max-h-[640px] overflow-y-auto">
            {Object.entries(groups).map(([label, list]) => (
              <div key={label}>
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-ink-500 sticky top-0 z-10"
                  style={{ backgroundColor: "var(--surface-2)" }}>
                  {label} · {list.length}
                </div>
                {list.map((n) => (
                  <NotificationRow
                    key={n.id}
                    n={n}
                    isRead={read.has(n.id)}
                    isPinned={pinned.has(n.id)}
                    isSelected={selected.has(n.id)}
                    isActive={active.id === n.id}
                    onClick={() => setActive(n)}
                    onToggle={() => toggleSelect(n.id)}
                    onPin={() => togglePin(n.id)}
                    onRead={() => toggleRead(n.id)}
                  />
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-10 text-center">
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2"
                  style={{ backgroundColor: "var(--surface-3)", color: "var(--fg-muted)" }}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="font-semibold text-ink-900 text-[13px]">Không có thông báo</div>
                <div className="text-[11px] text-ink-500 mt-0.5">Thay đổi bộ lọc hoặc quay lại sau</div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Detail */}
      <div className="hidden lg:block lg:col-span-4">
        <NotificationDetail
          n={active}
          isRead={read.has(active.id)}
          isPinned={pinned.has(active.id)}
          onPin={() => togglePin(active.id)}
          onRead={() => toggleRead(active.id)}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Schedule Settings — Đặt thông báo chi tiết
   ═══════════════════════════════════════════════════════════ */
function ScheduleSettings() {
  const [schedules, setSchedules] = useState([
    {
      id: "s-001",
      name: "Khẩn cấp · SLA P1",
      description: "Sự cố ngừng hoạt động — phải biết ngay lập tức",
      enabled: true,
      priority: "urgent",
      channels: ["inapp", "email", "push", "sms"],
      trigger: "instant",
      quiet: false,
      categories: ["alert", "security"],
      keywords: "down, 500, ngừng, mất kết nối, p1",
      matchAll: true,
      lastSent: "2 phút trước",
      stats: { sent24h: 2, openRate: 100, ctr: 92 },
    },
    {
      id: "s-002",
      name: "Booking mới · Xác nhận trong 15 phút",
      description: "Mọi booking mới từ các nguồn OTA + direct",
      enabled: true,
      priority: "high",
      channels: ["inapp", "email", "push"],
      trigger: "instant",
      quiet: true,
      categories: ["booking"],
      keywords: "",
      matchAll: false,
      lastSent: "2 phút trước",
      stats: { sent24h: 14, openRate: 96, ctr: 78 },
    },
    {
      id: "s-003",
      name: "Khuyến nghị AI · Forecast",
      description: "Tóm tắt daily & cảnh báo bất thường từ AI",
      enabled: true,
      priority: "info",
      channels: ["inapp", "email"],
      trigger: "digest",
      cadence: "daily",
      time: "08:00",
      days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      quiet: true,
      categories: ["ai", "report"],
      keywords: "",
      lastSent: "8 giờ trước",
      stats: { sent24h: 1, openRate: 88, ctr: 64 },
    },
    {
      id: "s-004",
      name: "Review tiêu cực · Phản hồi trong 2h",
      description: "Review 1-3★ cần phản hồi nhanh",
      enabled: true,
      priority: "high",
      channels: ["inapp", "email", "push"],
      trigger: "instant",
      quiet: true,
      categories: ["review"],
      keywords: "1★, 2★, tiêu cực, complaint",
      lastSent: "2 ngày trước",
      stats: { sent24h: 0, openRate: 100, ctr: 95 },
    },
    {
      id: "s-005",
      name: "Báo cáo doanh thu · Tuần",
      description: "Tổng kết tuần, gửi vào sáng thứ 2",
      enabled: true,
      priority: "info",
      channels: ["inapp", "email"],
      trigger: "digest",
      cadence: "weekly",
      time: "08:00",
      day: "mon",
      quiet: true,
      categories: ["report"],
      lastSent: "Thứ 2 tuần trước",
      stats: { sent24h: 0, openRate: 92, ctr: 41 },
    },
    {
      id: "s-006",
      name: "Marketing · Realtime campaign",
      description: "Theo dõi performance chiến dịch mỗi 30 phút",
      enabled: false,
      priority: "info",
      channels: ["inapp"],
      trigger: "interval",
      cadence: "30min",
      quiet: true,
      categories: ["marketing"],
      lastSent: "—",
      stats: { sent24h: 0, openRate: 0, ctr: 0 },
    },
    {
      id: "s-007",
      name: "Bảo mật · Đăng nhập mới",
      description: "Bất kỳ đăng nhập từ thiết bị/vị trí lạ",
      enabled: true,
      priority: "urgent",
      channels: ["inapp", "email", "sms"],
      trigger: "instant",
      quiet: false,
      categories: ["security"],
      lastSent: "5 ngày trước",
      stats: { sent24h: 0, openRate: 100, ctr: 100 },
    },
  ]);

  const [editing, setEditing] = useState(schedules[0]);
  const [openCreator, setOpenCreator] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">
      {/* List */}
      <div className="col-span-1 lg:col-span-5 min-w-0">
        <Card className="!p-0 overflow-hidden">
          <div className="px-3 py-2.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border-soft)" }}>
            <div>
              <div className="font-display font-bold text-ink-900 text-[14px]">Quy tắc thông báo</div>
              <div className="text-[11px] text-ink-500">{schedules.filter((s) => s.enabled).length}/{schedules.length} đang bật</div>
            </div>
            <button className="btn-primary !py-1.5 !text-[12px]" onClick={() => setOpenCreator(true)}>
              <Plus className="w-3.5 h-3.5" /> Tạo quy tắc
            </button>
          </div>

          <div className="max-h-[640px] overflow-y-auto">
            {schedules.map((s) => {
              const isActive = editing.id === s.id;
              const tone = PRIORITY_META[s.priority].tone;
              return (
                <button
                  key={s.id}
                  onClick={() => setEditing(s)}
                  className="w-full text-left px-3 py-2.5 border-b transition"
                  style={{
                    borderColor: "var(--border-soft)",
                    backgroundColor: isActive ? "var(--accent-soft)" : "transparent",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-1 h-12 rounded-full shrink-0 self-stretch"
                      style={{ backgroundColor: s.enabled ? `var(--${tone})` : "var(--fg-subtle)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-ink-900 text-[13px] truncate">{s.name}</span>
                        {s.enabled ? <StatusPill tone="success">Bật</StatusPill> : <StatusPill tone="neutral">Tắt</StatusPill>}
                      </div>
                      <div className="text-[11px] text-ink-500 mt-0.5 line-clamp-1">{s.description}</div>
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {s.priority && <StatusPill tone={tone} className="!text-[9px]">{PRIORITY_META[s.priority].label}</StatusPill>}
                        {s.channels.slice(0, 3).map((c) => {
                          const ch = CHANNELS.find((x) => x.id === c);
                          return (
                            <span key={c} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-semibold"
                              style={{ backgroundColor: "var(--surface-3)", color: "var(--fg-muted)" }}>
                              <ch.Icon className="w-2.5 h-2.5" /> {ch.label}
                            </span>
                          );
                        })}
                        {s.channels.length > 3 && (
                          <span className="text-[9.5px] text-ink-500 font-semibold">+{s.channels.length - 3}</span>
                        )}
                        <span className="text-[10px] text-ink-400 ml-auto">{s.lastSent}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Smart templates */}
        <Card className="mt-4 !p-3">
          <div className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Mẫu thông minh
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { Icon: AlertCircle, label: "SLA P1",          desc: "Khẩn cấp · 24/7"        },
              { Icon: CalendarCheck, label: "Booking daily",  desc: "Tổng kết 21:00" },
              { Icon: TrendingUp,    label: "Doanh thu weekly", desc: "Thứ 2 · 08:00" },
              { Icon: Star,          label: "Review 5★",       desc: "Khen · kỷ niệm" },
            ].map((t, i) => (
              <button
                key={i}
                className="rounded-md border p-2.5 text-left hover:border-ink-900 transition"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-soft)" }}
              >
                <t.Icon className="w-3.5 h-3.5 mb-1" style={{ color: "var(--accent)" }} />
                <div className="font-semibold text-ink-900 text-[12px]">{t.label}</div>
                <div className="text-[10px] text-ink-500">{t.desc}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Detail editor */}
      <div className="col-span-1 lg:col-span-7 min-w-0">
        <ScheduleEditor
          schedule={editing}
          onChange={setEditing}
        />
      </div>

      {openCreator && <NewRuleModal onClose={() => setOpenCreator(false)} onCreate={(s) => {
        setSchedules((prev) => [s, ...prev]);
        setEditing(s);
        setOpenCreator(false);
      }} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Schedule Editor — form chỉnh sửa chi tiết
   ═══════════════════════════════════════════════════════════ */
function ScheduleEditor({ schedule, onChange }) {
  const [tab, setTab] = useState("general");
  const update = (k, v) => onChange({ ...schedule, [k]: v });
  const toggleChannel = (id) => {
    const next = schedule.channels.includes(id)
      ? schedule.channels.filter((x) => x !== id)
      : [...schedule.channels, id];
    update("channels", next);
  };

  const TABS = [
    { id: "general", label: "Chung",       Icon: Bell },
    { id: "trigger", label: "Điều kiện",   Icon: Filter },
    { id: "channel", label: "Kênh gửi",    Icon: Send },
    { id: "quiet",   label: "Quiet hours", Icon: Moon },
    { id: "stats",   label: "Thống kê",    Icon: TrendingUp },
  ];

  return (
    <Card className="!p-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-soft)" }}>
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-md flex items-center justify-center shrink-0"
            style={{
              backgroundColor: schedule.enabled ? toneOf(schedule.priority).bg : "var(--surface-3)",
              color: schedule.enabled ? toneOf(schedule.priority).fg : "var(--fg-muted)",
            }}
          >
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                className="text-[15px] font-bold bg-transparent border-none focus:outline-none flex-1 min-w-0"
                style={{ color: "var(--fg)" }}
                value={schedule.name}
                onChange={(e) => update("name", e.target.value)}
              />
              {schedule.enabled ? <StatusPill tone="success">Bật</StatusPill> : <StatusPill tone="neutral">Tắt</StatusPill>}
              <StatusPill tone={PRIORITY_META[schedule.priority].tone}>
                {PRIORITY_META[schedule.priority].label}
              </StatusPill>
            </div>
            <input
              className="text-[12px] mt-0.5 bg-transparent border-none focus:outline-none w-full"
              style={{ color: "var(--fg-muted)" }}
              value={schedule.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <Switch checked={schedule.enabled} onChange={(v) => update("enabled", v)} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 border-b" style={{ borderColor: "var(--border-soft)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold border-b-2 transition -mb-px"
            style={
              tab === t.id
                ? { borderColor: "var(--accent)", color: "var(--accent)" }
                : { borderColor: "transparent", color: "var(--fg-muted)" }
            }
          >
            <t.Icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 space-y-4">
        {tab === "general" && (
          <>
            <Row label="Mã quy tắc">
              <input className="input font-mono !text-[12px]" defaultValue={schedule.id} />
            </Row>
            <Row label="Mức ưu tiên">
              <div className="flex items-center gap-1.5">
                {Object.entries(PRIORITY_META).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => update("priority", k)}
                    className="px-2.5 py-1 rounded-md text-[12px] font-semibold border transition"
                    style={{
                      backgroundColor: schedule.priority === k ? toneOf(k).bg : "var(--surface)",
                      borderColor: schedule.priority === k ? toneOf(k).solid : "var(--border)",
                      color: schedule.priority === k ? toneOf(k).fg : "var(--fg-muted)",
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </Row>
            <Row label="Thời điểm kích hoạt">
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "instant",  label: "Ngay lập tức", Icon: Zap, desc: "Realtime" },
                  { id: "digest",   label: "Theo lịch",   Icon: Calendar, desc: "Daily/Weekly" },
                  { id: "interval", label: "Định kỳ",     Icon: Hourglass, desc: "Mỗi N phút" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => update("trigger", t.id)}
                    className="rounded-md border p-2.5 text-center transition"
                    style={{
                      backgroundColor: schedule.trigger === t.id ? "var(--accent-soft)" : "var(--surface)",
                      borderColor: schedule.trigger === t.id ? "var(--accent)" : "var(--border)",
                    }}
                  >
                    <t.Icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: schedule.trigger === t.id ? "var(--accent)" : "var(--fg-muted)" }} />
                    <div className="font-semibold text-[12px] text-ink-900">{t.label}</div>
                    <div className="text-[10px] text-ink-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </Row>
            {schedule.trigger === "digest" && (
              <Row label="Tần suất">
                <div className="flex items-center gap-2">
                  <select className="input !flex-none" value={schedule.cadence} onChange={(e) => update("cadence", e.target.value)}>
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                  </select>
                  <input type="time" className="input !flex-none w-32" value={schedule.time} onChange={(e) => update("time", e.target.value)} />
                  {schedule.cadence === "weekly" && (
                    <select className="input !flex-none" value={schedule.day} onChange={(e) => update("day", e.target.value)}>
                      <option value="mon">Thứ 2</option>
                      <option value="tue">Thứ 3</option>
                      <option value="wed">Thứ 4</option>
                      <option value="thu">Thứ 5</option>
                      <option value="fri">Thứ 6</option>
                      <option value="sat">Thứ 7</option>
                      <option value="sun">Chủ nhật</option>
                    </select>
                  )}
                </div>
              </Row>
            )}
            {schedule.trigger === "interval" && (
              <Row label="Mỗi">
                <div className="flex items-center gap-2">
                  <input className="input !flex-none w-24" defaultValue={schedule.cadence} />
                  <span className="text-[12px] text-ink-500">(5min · 15min · 30min · 1h · 4h)</span>
                </div>
              </Row>
            )}
          </>
        )}

        {tab === "trigger" && (
          <>
            <Row label="Danh mục áp dụng">
              <div className="flex items-center gap-1.5 flex-wrap">
                {Object.entries(TYPE_META).map(([k, v]) => {
                  const on = schedule.categories.includes(k);
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        const next = on
                          ? schedule.categories.filter((x) => x !== k)
                          : [...schedule.categories, k];
                        update("categories", next);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-semibold border transition"
                      style={{
                        backgroundColor: on ? `var(--${v.tone}-soft)` : "var(--surface)",
                        borderColor: on ? `var(--${v.tone})` : "var(--border)",
                        color: on ? `var(--${v.tone}-fg)` : "var(--fg-muted)",
                      }}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </Row>
            <Row label="Từ khoá (tách bởi dấu phẩy)">
              <textarea
                className="input min-h-[70px]"
                placeholder="ví dụ: down, 500, ngừng, mất kết nối, p1"
                defaultValue={schedule.keywords}
                onChange={(e) => update("keywords", e.target.value)}
              />
            </Row>
            <Row label="Logic">
              <div className="flex items-center gap-3 text-[12px]">
                <label className="flex items-center gap-1.5 text-ink-700">
                  <input type="checkbox" defaultChecked={schedule.matchAll} style={{ accentColor: "var(--accent)" }} />
                  Áp dụng khi <b>khớp tất cả</b> điều kiện (AND)
                </label>
              </div>
            </Row>
            <Row label="Đối tượng">
              <div className="flex items-center gap-1.5 flex-wrap">
                <AccentPill>Chi nhánh của tôi</AccentPill>
                <StatusPill tone="info">LP1 · LP2 · LP3 · LP4</StatusPill>
                <button className="text-[11px] font-semibold hover:underline" style={{ color: "var(--accent)" }}>
                  + Thêm điều kiện
                </button>
              </div>
            </Row>
          </>
        )}

        {tab === "channel" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CHANNELS.map((c) => {
                const on = schedule.channels.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleChannel(c.id)}
                    className="rounded-md border p-3 text-left transition"
                    style={{
                      backgroundColor: on ? "var(--accent-soft)" : "var(--surface)",
                      borderColor: on ? "var(--accent)" : "var(--border)",
                      borderWidth: on ? "2px" : "1px",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: on ? "var(--accent)" : "var(--surface-3)",
                          color: on ? "var(--on-accent)" : "var(--fg-muted)",
                        }}
                      >
                        <c.Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink-900 text-[12.5px]">{c.label}</div>
                        <div className="text-[10.5px] text-ink-500">{c.desc}</div>
                      </div>
                      <Switch checked={on} onChange={() => toggleChannel(c.id)} />
                    </div>
                  </button>
                );
              })}
            </div>
            <Row label="Fallback (nếu kênh chính lỗi)">
              <select className="input">
                <option>Không</option>
                <option>Email → SMS</option>
                <option>Push → SMS</option>
                <option>Email → Telegram</option>
              </select>
            </Row>
          </>
        )}

        {tab === "quiet" && (
          <>
            <div className="rounded-md border p-3 flex items-start gap-3"
              style={{
                backgroundColor: schedule.quiet ? "var(--info-soft)" : "var(--surface-2)",
                borderColor: schedule.quiet ? "var(--info)" : "var(--border-soft)",
              }}>
              <Moon className="w-4 h-4 mt-0.5" style={{ color: schedule.quiet ? "var(--info-fg)" : "var(--fg-muted)" }} />
              <div className="flex-1">
                <div className="font-semibold text-ink-900 text-[13px]">Không làm phiền theo khung giờ</div>
                <div className="text-[11.5px] text-ink-500 mt-0.5">
                  Trong khung giờ này, thông báo sẽ gom lại gửi 1 lần khi hết giờ. Riêng ưu tiên <b>Khẩn cấp</b> vẫn đẩy qua.
                </div>
              </div>
              <Switch checked={schedule.quiet} onChange={(v) => update("quiet", v)} />
            </div>
            {schedule.quiet && (
              <Row label="Khung giờ">
                <div className="flex items-center gap-2">
                  <input type="time" className="input !flex-none w-32" defaultValue="22:00" />
                  <span className="text-ink-500">→</span>
                  <input type="time" className="input !flex-none w-32" defaultValue="07:00" />
                </div>
              </Row>
            )}
            <Row label="Ngày áp dụng">
              <div className="flex items-center gap-1">
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                  <button
                    key={d}
                    className="w-9 h-9 rounded-md text-[11px] font-bold transition"
                    style={{
                      backgroundColor: "var(--accent-soft)",
                      color: "var(--accent-fg)",
                      border: "1px solid var(--accent)",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Row>
          </>
        )}

        {tab === "stats" && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <StatTile label="Đã gửi 24h" value={schedule.stats.sent24h} tone="accent" />
              <StatTile label="Open rate"   value={`${schedule.stats.openRate}%`} tone="success" />
              <StatTile label="CTR"         value={`${schedule.stats.ctr}%`} tone="info" />
            </div>
            <Card className="!p-3 mt-2">
              <div className="text-[11px] uppercase font-bold tracking-wider text-ink-500 mb-2">Hoạt động 7 ngày</div>
              <div className="flex items-end gap-1 h-20">
                {[12, 8, 14, 6, 9, 11, 2].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t" style={{ height: `${v * 5}px`, backgroundColor: i === 6 ? "var(--accent)" : "var(--accent-soft)" }} />
                    <span className="text-[9px] text-ink-500 font-bold">T{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10.5px] text-ink-500 mt-2">Tổng: 62 lượt gửi · 96% open rate</div>
            </Card>
            <Row label="Lần gửi gần nhất">
              <span className="text-[12.5px] text-ink-700 font-semibold">{schedule.lastSent}</span>
            </Row>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-2)" }}>
        <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
          <Clock className="w-3 h-3" /> Cập nhật 2 phút trước
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline !py-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
          </button>
          <button className="btn-primary !py-1.5">
            <Save className="w-3.5 h-3.5" /> Lưu thay đổi
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   Channel Preferences
   ═══════════════════════════════════════════════════════════ */
function ChannelPreferences() {
  const [state, setState] = useState(
    CHANNELS.reduce((acc, c) => ({ ...acc, [c.id]: c.default }), {})
  );
  const [dnd, setDnd] = useState({ from: "22:00", to: "07:00", enabled: true });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
      <div className="lg:col-span-2 space-y-3 sm:space-y-5">
        <Card title="Kênh nhận thông báo">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CHANNELS.map((c) => (
              <ChannelRow
                key={c.id}
                c={c}
                on={state[c.id]}
                onToggle={() => setState((p) => ({ ...p, [c.id]: !p[c.id] }))}
              />
            ))}
          </div>
        </Card>

        <Card title="Lịch yên tĩnh (Do Not Disturb)">
          <div className="flex items-start gap-3 p-3 rounded-md border"
            style={{
              backgroundColor: dnd.enabled ? "var(--info-soft)" : "var(--surface-2)",
              borderColor: dnd.enabled ? "var(--info)" : "var(--border-soft)",
            }}>
            <Moon className="w-4 h-4 mt-0.5" style={{ color: dnd.enabled ? "var(--info-fg)" : "var(--fg-muted)" }} />
            <div className="flex-1">
              <div className="font-semibold text-ink-900 text-[13px]">Tự động tắt tiếng vào ban đêm</div>
              <div className="text-[11.5px] text-ink-500 mt-0.5">
                Trong khung giờ này, thông báo đẩy qua sẽ bị tắt. Riêng ưu tiên Khẩn cấp vẫn đẩy qua.
              </div>
            </div>
            <Switch checked={dnd.enabled} onChange={(v) => setDnd({ ...dnd, enabled: v })} />
          </div>
          {dnd.enabled && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] text-ink-500">Từ</span>
              <input type="time" className="input !flex-none w-32" value={dnd.from} onChange={(e) => setDnd({ ...dnd, from: e.target.value })} />
              <span className="text-ink-500">→</span>
              <input type="time" className="input !flex-none w-32" value={dnd.to} onChange={(e) => setDnd({ ...dnd, to: e.target.value })} />
            </div>
          )}
        </Card>

        <Card title="Tần suất cho mỗi loại">
          <div className="space-y-2">
            {Object.entries(TYPE_META).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2.5 px-2.5 py-2 rounded-md"
                style={{ backgroundColor: "var(--surface-2)" }}>
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `var(--${v.tone}-soft)`,
                    color: `var(--${v.tone}-fg)`,
                  }}
                >
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-[12.5px]">{v.label}</div>
                  <div className="text-[10.5px] text-ink-500">{v.description}</div>
                </div>
                <select className="input !flex-none !w-32 !text-[11.5px]">
                  <option>Realtime</option>
                  <option>Mỗi 15 phút</option>
                  <option>Mỗi giờ</option>
                  <option>Daily 8h</option>
                  <option>Weekly</option>
                </select>
                <Switch checked={true} onChange={() => {}} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-3 sm:space-y-5">
        <Card title="Tóm tắt ngày">
          <p className="text-[12.5px] text-ink-700 leading-relaxed">
            Hôm nay bạn nhận <b className="text-ink-900">14 thông báo</b> qua 3 kênh (in-app · email · push). <b className="text-ink-900">2 đang chờ</b> xử lý.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <StatTile label="Trong app" value="14" tone="accent" />
            <StatTile label="Email"    value="11" tone="info" />
            <StatTile label="Push"     value="6"  tone="success" />
            <StatTile label="SMS"      value="0"  tone="neutral" />
          </div>
        </Card>

        <Card title="Mẹo"
          style={{
            background: "linear-gradient(135deg, var(--highlight-soft), var(--surface))",
            borderColor: "var(--highlight)",
          }}>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5" style={{ color: "var(--highlight-fg)" }} />
            <div className="text-[12px] leading-relaxed" style={{ color: "var(--fg)" }}>
              Bạn có thể tạo <b>quy tắc thông minh</b> theo ngữ cảnh: ví dụ "Im lặng vào Chủ nhật" hoặc "Chỉ review 5★ qua Telegram". Vào tab <b>Đặt thông báo</b> để thiết lập.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ChannelRow({ c, on, onToggle }) {
  return (
    <div
      className="rounded-md border p-3 flex items-center gap-2.5"
      style={{
        backgroundColor: on ? "var(--accent-soft)" : "var(--surface)",
        borderColor: on ? "var(--accent)" : "var(--border-soft)",
        borderWidth: on ? "2px" : "1px",
      }}
    >
      <div
        className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
        style={{
          backgroundColor: on ? "var(--accent)" : "var(--surface-3)",
          color: on ? "var(--on-accent)" : "var(--fg-muted)",
        }}
      >
        <c.Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink-900 text-[13px]">{c.label}</div>
        <div className="text-[10.5px] text-ink-500">{c.desc}</div>
      </div>
      <Switch checked={on} onChange={onToggle} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   New Rule Modal — tạo quy tắc mới
   ═══════════════════════════════════════════════════════════ */
function NewRuleModal({ onClose, onCreate }) {
  const [name, setName] = useState("Quy tắc mới");
  const [prio, setPrio] = useState("info");
  const [trigger, setTrigger] = useState("instant");
  const [channels, setChannels] = useState(["inapp", "email"]);

  const toggleCh = (id) => {
    setChannels((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl shadow-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 font-display font-bold text-base"
            style={{ color: "var(--fg)" }}>
            <Plus className="w-4 h-4" style={{ color: "var(--accent)" }} />
            Tạo quy tắc thông báo mới
          </div>
          <button className="p-1.5 rounded-md hover:opacity-70" onClick={onClose} style={{ color: "var(--fg-muted)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500">Tên quy tắc</label>
            <input className="input mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500">Mức ưu tiên</label>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {Object.entries(PRIORITY_META).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setPrio(k)}
                    className="px-2 py-1.5 rounded-md text-[12px] font-semibold border"
                    style={{
                      backgroundColor: prio === k ? toneOf(k).bg : "var(--surface)",
                      borderColor: prio === k ? toneOf(k).solid : "var(--border)",
                      color: prio === k ? toneOf(k).fg : "var(--fg-muted)",
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500">Thời điểm</label>
              <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                {["instant", "digest", "interval"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTrigger(t)}
                    className="px-2 py-1.5 rounded-md text-[11.5px] font-semibold border"
                    style={{
                      backgroundColor: trigger === t ? "var(--accent-soft)" : "var(--surface)",
                      borderColor: trigger === t ? "var(--accent)" : "var(--border)",
                      color: trigger === t ? "var(--accent-fg)" : "var(--fg-muted)",
                    }}
                  >
                    {t === "instant" ? "Ngay" : t === "digest" ? "Lịch" : "Định kỳ"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500 mb-1.5 block">Kênh gửi</label>
            <div className="grid grid-cols-3 gap-2">
              {CHANNELS.slice(0, 6).map((c) => {
                const on = channels.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCh(c.id)}
                    className="rounded-md border p-2 text-center"
                    style={{
                      backgroundColor: on ? "var(--accent-soft)" : "var(--surface)",
                      borderColor: on ? "var(--accent)" : "var(--border)",
                    }}
                  >
                    <c.Icon className="w-3.5 h-3.5 mx-auto mb-0.5" style={{ color: on ? "var(--accent)" : "var(--fg-muted)" }} />
                    <div className="text-[11px] font-semibold text-ink-900">{c.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}>
          <button className="btn-outline" onClick={onClose}>Huỷ</button>
          <button
            className="btn-primary"
            onClick={() => onCreate({
              id: `s-${Date.now()}`,
              name,
              description: "Quy tắc mới được tạo",
              enabled: true,
              priority: prio,
              channels,
              trigger,
              cadence: "daily",
              time: "08:00",
              days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
              quiet: true,
              categories: ["booking"],
              keywords: "",
              lastSent: "Chưa có",
              stats: { sent24h: 0, openRate: 0, ctr: 0 },
            })}
          >
            <Plus className="w-4 h-4" /> Tạo quy tắc
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Notification Row + Detail — phần phụ trợ
   ═══════════════════════════════════════════════════════════ */
function NotificationRow({ n, isRead, isPinned, isSelected, isActive, onClick, onToggle, onPin, onRead }) {
  const type = TYPE_META[n.type] || TYPE_META.system;
  const Icon = n.icon;
  return (
    <div
      className="border-b transition"
      style={{
        borderColor: "var(--border-soft)",
        backgroundColor: isActive ? "var(--accent-soft)" : isRead ? "transparent" : "var(--surface)",
        borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
      }}
    >
      <div className="flex items-start gap-2 px-3 py-2.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => { e.stopPropagation(); onToggle(); }}
          onClick={(e) => e.stopPropagation()}
          className="mt-1.5 rounded"
          style={{ accentColor: "var(--accent)" }}
        />
        <button onClick={onClick} className="flex-1 flex items-start gap-2.5 text-left min-w-0">
          <div className="relative shrink-0">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center"
              style={{
                backgroundColor: `var(--${type.tone}-soft)`,
                color: `var(--${type.tone}-fg)`,
              }}
            >
              <Icon className="w-4 h-4" />
            </div>
            {!isRead && (
              <span
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--accent)", border: "2px solid var(--surface)" }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {isPinned && <Pin className="w-3 h-3" style={{ color: "var(--accent)" }} />}
              <span className={`text-[13px] truncate ${isRead ? "text-ink-700 font-medium" : "text-ink-900 font-bold"}`}>
                {n.title}
              </span>
              {n.priority === "urgent" && <StatusPill tone="danger">Khẩn</StatusPill>}
              {n.priority === "high" && <StatusPill tone="warning">Cao</StatusPill>}
            </div>
            <div className="text-[11.5px] text-ink-500 mt-0.5 line-clamp-1">{n.desc}</div>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-ink-500">
              <span className="font-semibold">{n.time}</span>
              <span className="opacity-60">·</span>
              <span className="inline-flex items-center gap-1">
                <Bell className="w-2.5 h-2.5" /> {type.label}
              </span>
              {n.meta?.branch && (
                <>
                  <span className="opacity-60">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-2.5 h-2.5" /> {n.meta.branch}
                  </span>
                </>
              )}
            </div>
          </div>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onPin(); }}
          className="p-1 rounded hover:bg-ink-100 text-ink-400 hover:text-ink-900"
          title={isPinned ? "Bỏ ghim" : "Ghim"}
        >
          {isPinned ? <Pin className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} /> : <PinOff className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

function NotificationDetail({ n, isRead, isPinned, onPin, onRead }) {
  const type = TYPE_META[n.type] || TYPE_META.system;
  const Icon = n.icon;
  return (
    <Card className="!p-0 overflow-hidden sticky top-4">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: "var(--border-soft)" }}>
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-md flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `var(--${type.tone}-soft)`,
              color: `var(--${type.tone}-fg)`,
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <StatusPill tone={type.tone}>{type.label}</StatusPill>
              <StatusPill tone={PRIORITY_META[n.priority].tone}>{PRIORITY_META[n.priority].label}</StatusPill>
              {isPinned && <StatusPill tone="accent">Ghim</StatusPill>}
            </div>
            <h2 className="font-display font-bold text-ink-900 text-[16px] mt-1.5">{n.title}</h2>
            <div className="text-[11.5px] text-ink-500 mt-1 flex items-center gap-1.5 flex-wrap">
              <Clock className="w-3 h-3" /> {n.date}
              {n.meta?.branch && (
                <>
                  <span>·</span>
                  <Building2 className="w-3 h-3" /> {n.meta.branch}
                </>
              )}
            </div>
          </div>
          <button
            onClick={onPin}
            className="p-1.5 rounded-md hover:bg-ink-100"
            title={isPinned ? "Bỏ ghim" : "Ghim"}
          >
            {isPinned ? <Pin className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} /> : <PinOff className="w-3.5 h-3.5 text-ink-400" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="text-[13px] text-ink-700 leading-relaxed">{n.desc}</div>

        {/* Meta grid */}
        {n.meta && (
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {Object.entries(n.meta).map(([k, v]) => (
              <div
                key={k}
                className="rounded-md border p-2"
                style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}
              >
                <div className="text-[9.5px] uppercase font-bold tracking-wider text-ink-500">{k}</div>
                <div className="font-semibold text-ink-900 text-[12px] mt-0.5">{String(v)}</div>
              </div>
            ))}
          </div>
        )}

        {/* AI actions */}
        <div className="mt-4 rounded-md border p-3"
          style={{
            background: "linear-gradient(135deg, var(--highlight-soft), var(--surface))",
            borderColor: "var(--highlight)",
          }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--highlight-fg)" }} />
            <span className="text-[11px] uppercase font-bold tracking-wider" style={{ color: "var(--highlight-fg)" }}>
              AI gợi ý xử lý
            </span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--fg)" }}>
            {n.priority === "urgent" && "Phản hồi trong 5 phút để giữ SLA. Đề xuất phân công cho Trưởng ca đang trực."}
            {n.priority === "high" && "Xử lý trong 30 phút. Đã có 3 thông báo cùng loại trong 24h qua."}
            {n.priority === "info" && "Theo dõi phản hồi 24h. Có thể ghim để xem lại."}
            {n.priority === "low" && "Tự động xử lý — không cần thao tác."}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button className="btn-primary">
            <ArrowUpRight className="w-3.5 h-3.5" /> Mở chi tiết
          </button>
          <button className="btn-outline" onClick={onRead}>
            <CheckCheck className="w-3.5 h-3.5" /> {isRead ? "Đánh dấu chưa đọc" : "Đã đọc"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-1.5">
          <button className="btn-outline !py-1.5 !text-[11px]"><Share2 className="w-3 h-3" /> Chia sẻ</button>
          <button className="btn-outline !py-1.5 !text-[11px]"><Bookmark className="w-3 h-3" /> Lưu</button>
          <button className="btn-outline !py-1.5 !text-[11px]"><Trash2 className="w-3 h-3" /> Xoá</button>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-2)" }}>
        <div className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500 mb-2">Lịch sử</div>
        <div className="space-y-1.5">
          {[
            { tone: "info",    time: "Vừa xong",    text: "Đẩy thông báo realtime" },
            { tone: "success", time: "5s trước",     text: "Người nhận click mở" },
            { tone: "neutral", time: "2 phút trước", text: "Tạo sự kiện từ " + (n.meta?.source || "hệ thống") },
          ].map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-[11.5px]">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `var(--${h.tone})` }} />
              <span className="text-ink-700">{h.text}</span>
              <span className="text-ink-500 font-semibold">{h.time}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   UI primitives
   ═══════════════════════════════════════════════════════════ */
/* tone nhận thẳng khóa semantic (success/warning/danger/info/highlight/accent/neutral).
   Trước đây map qua PRIORITY_META — bảng đó chỉ có urgent/high/info/low nên
   tone="accent"/"danger"/"success" trả undefined và làm crash cả trang. */
function StatTile({ label, value, tone = "neutral" }) {
  const t = TONE[tone] || TONE.neutral;
  return (
    <div
      className="rounded-md border p-2.5"
      style={{
        backgroundColor: t.bg,
        borderColor: t.border,
      }}
    >
      <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: t.fg }}>{label}</div>
      <div className="font-display font-bold text-ink-900 text-[18px] tabular-nums leading-none mt-1">{value}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
      <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500 pt-2">{label}</label>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition shrink-0"
      style={{ backgroundColor: checked ? "var(--accent)" : "var(--border)" }}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Button({ children, onClick, className = "", primary = false }) {
  return (
    <button
      onClick={onClick}
      className={primary ? "btn-primary" : "btn-outline"}
    >
      {children}
    </button>
  );
}