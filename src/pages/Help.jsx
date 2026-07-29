import { useState } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";

const {
  Book, Zap, Compass, BedDouble, CalendarCheck, Users, UserCog,
  Sparkles, BarChart3, Building2, Wallet, MessageSquare, Search,
  Keyboard, ChevronRight, ExternalLink, Mail, Phone,
  Globe, Shield, CreditCard, HelpCircle, Check,
  Plus, MapPin, AlertCircle, Palette
} = Icons;

const SECTIONS = [
  { id: "quickstart", label: "Bắt đầu nhanh",       Icon: Zap },
  { id: "modules",    label: "Các chức năng",        Icon: Compass },
  { id: "branches",   label: "Quản lý chi nhánh",    Icon: Building2 },
  { id: "tips",       label: "Mẹo & thủ thuật",      Icon: Keyboard },
  { id: "contact",    label: "Liên hệ hỗ trợ",       Icon: HelpCircle },
];

function SectionIcon({ id }) {
  if (id === "quickstart") return <Zap className="w-4 h-4" />;
  if (id === "modules")    return <Compass className="w-4 h-4" />;
  if (id === "branches")   return <Building2 className="w-4 h-4" />;
  if (id === "tips")       return <Keyboard className="w-4 h-4" />;
  if (id === "contact")    return <HelpCircle className="w-4 h-4" />;
  return null;
}

const MODULES = [
  { Icon: BarChart3,     title: "Dashboard",      desc: "Tổng quan doanh thu, công suất phòng, booking mới theo thời gian thực. Hỗ trợ lọc theo chi nhánh.", color: "blue" },
  { Icon: Building2,     title: "Chi nhánh",      desc: "Quản lý 4 khu nghỉ dưỡng: Sapa, Hạ Long, Đà Nẵng, Phú Quốc. Bật/tắt trạng thái hoạt động và cấu hình giá.", color: "emerald" },
  { Icon: BedDouble,     title: "Phòng & cơ sở",  desc: "Theo dõi trạng thái phòng (trống/đang ở/bảo trì), giá theo mùa, hạng phòng và tiện nghi đi kèm.", color: "amber" },
  { Icon: CalendarCheck, title: "Đặt phòng",      desc: "Tạo booking mới, check-in/check-out, quản lý đoàn khách, hủy/đổi lịch và xuất hóa đơn.", color: "rose" },
  { Icon: Users,         title: "Khách hàng",     desc: "Hồ sơ khách, lịch sử lưu trú, điểm thành viên, ghi chú nội bộ và phân nhóm theo nhu cầu.", color: "violet" },
  { Icon: UserCog,       title: "Nhân viên",      desc: "Quản lý hồ sơ nhân viên, ca làm, lương thưởng, phân quyền truy cập theo vai trò.", color: "cyan" },
  { Icon: Sparkles,      title: "Dịch vụ",        desc: "Quản lý các dịch vụ kèm theo: spa, nhà hàng, đưa đón sân bay, tour tham quan…", color: "pink" },
  { Icon: BarChart3,     title: "Báo cáo",        desc: "Doanh thu, tỷ lệ lấp đầy, top khách hàng, hiệu suất chi nhánh. Xuất CSV/PDF.", color: "indigo" },
  { Icon: MessageSquare, title: "Hộp thư",        desc: "Tin nhắn nội bộ với khách và giữa nhân viên, gắn file đính kèm, lịch sử trao đổi theo booking.", color: "teal" },
  { Icon: Book,          title: "Bài viết & SEO", desc: "Quản lý nội dung trang chủ, blog du lịch, hình ảnh và meta SEO cho từng chi nhánh.", color: "orange" },
  { Icon: Wallet,        title: "Thanh toán",     desc: "Theo dõi công nợ, đối soát VNPay/Momo/Stripe, hoàn tiền và quản lý hóa đơn VAT.", color: "lime" },
];

const TIPS = [
  { kbd: "Ctrl + K",      desc: "Mở nhanh thanh tìm kiếm trên Topbar — gõ phòng, booking, khách hàng, nhân viên…" },
  { kbd: "Click số liệu", desc: "Trên Dashboard, click vào bất kỳ stat card nào để xem chi tiết theo chi nhánh / thời gian." },
  { kbd: "Kéo thả phòng", desc: "Trong trang Phòng, kéo thả để chuyển trạng thái phòng nhanh (Trống → Check-in → Check-out)." },
  { kbd: "Lọc chi nhánh", desc: "Mọi trang đều có dropdown chi nhánh góc phải Topbar — chọn 1 hoặc \"Tất cả\" để gộp dữ liệu." },
  { kbd: "Nhấn đúp dòng", desc: "Nhấn đúp vào 1 dòng bất kỳ trong bảng để mở nhanh chi tiết (áp dụng cho Phòng, Booking, Khách, Nhân viên)." },
  { kbd: "Tuỳ chỉnh UI",  desc: "Vào Cài đặt → Tuỳ chỉnh giao diện để đổi màu chủ đạo, chế độ sáng/tối, mật độ và cỡ chữ." },
];

const STEPS = [
  { num: 1, title: "Chọn chi nhánh",  desc: "Mặc định là \"Tất cả chi nhánh\". Nhấn vào dropdown chi nhánh góc phải Topbar để lọc dữ liệu theo 1 khu." },
  { num: 2, title: "Thêm phòng",      desc: "Vào Phòng → Thêm phòng. Điền hạng phòng, sức chứa, giá mặc định và hình ảnh." },
  { num: 3, title: "Tạo booking",     desc: "Vào Đặt phòng → Tạo mới. Chọn khách (hoặc tạo mới), chọn phòng trống theo ngày, áp dụng giảm giá nếu có." },
  { num: 4, title: "Check-in",        desc: "Mở booking → Check-in. Hệ thống tự động chuyển phòng sang trạng thái \"Đang ở\"." },
  { num: 5, title: "Check-out",       desc: "Mở booking → Check-out. Xuất hóa đơn, ghi nhận doanh thu và phát sinh dịch vụ kèm theo." },
];

const COLOR_CLASSES = {
  blue:    "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber:   "bg-amber-50 text-amber-700",
  rose:    "bg-rose-50 text-rose-700",
  violet:  "bg-violet-50 text-violet-700",
  cyan:    "bg-cyan-50 text-cyan-700",
  pink:    "bg-pink-50 text-pink-700",
  indigo:  "bg-indigo-50 text-indigo-700",
  teal:    "bg-teal-50 text-teal-700",
  orange:  "bg-orange-50 text-orange-700",
  lime:    "bg-lime-50 text-lime-700",
};

const BRANCHES_LIST = [
  { name: "Sapa",     code: "LPR-SPA", rooms: 48 },
  { name: "Hạ Long",  code: "LPR-HLO", rooms: 64 },
  { name: "Đà Nẵng",  code: "LPR-DNG", rooms: 72 },
  { name: "Phú Quốc", code: "LPR-PQC", rooms: 56 },
];

const BRANCH_CREATE_STEPS = [
  { t: "Vào Chi nhánh → Thêm chi nhánh", d: "Hệ thống sẽ mở form nhập liệu: tên, mã, địa chỉ, số phòng khởi tạo." },
  { t: "Điền thông tin cơ bản",           d: "Tên hiển thị, thành phố, tỉnh, hotline, email, người quản lý." },
  { t: "Chọn tiện ích & giá khởi điểm",   d: "Đánh dấu các tiện ích sẵn có (hồ bơi, spa, gym…) và giá phòng trung bình." },
  { t: "Lưu",                              d: "Chi nhánh mới sẽ xuất hiện ngay trong dropdown Topbar, danh sách, và Dashboard." },
];

const BRANCH_IMPACTS = [
  { Icon: Check, label: "Phòng",     desc: "Danh sách phòng trống — chưa có phòng nào, cần thêm thủ công." },
  { Icon: Check, label: "Booking",   desc: "Không có booking nào được gán vào chi nhánh mới." },
  { Icon: Check, label: "Doanh thu", desc: "Mặc định = 0. Tổng doanh thu không bị ảnh hưởng." },
  { Icon: Check, label: "Nhân viên", desc: "Cần gán nhân viên vào chi nhánh mới từ trang Nhân viên." },
  { Icon: Check, label: "Trạng thái", desc: "Mặc định = \"Hoạt động\". Có thể chuyển sang \"Tạm đóng\" hoặc \"Đang tu sửa\"." },
  { Icon: Check, label: "Xoá",       desc: "Nếu tạo nhầm, vào chi nhánh → Xoá. Dữ liệu liên quan sẽ được thông báo trước khi xoá." },
];

const CONTACT_CHANNELS = [
  { Icon: Mail,          label: "Email",       value: "support@lepalmier.vn",         href: "mailto:support@lepalmier.vn" },
  { Icon: Phone,         label: "Hotline",     value: "1900 6868 (24/7)",              href: "tel:19006868" },
  { Icon: MessageSquare, label: "Live chat",   value: "Trong hệ thống, 8:00 – 22:00", href: "/messages" },
  { Icon: Globe,         label: "Trang hỗ trợ", value: "help.lepalmier.vn",             href: "https://help.lepalmier.vn" },
];

export default function Help() {
  const [active, setActive] = useState("quickstart");

  return (
    <div className="max-w-[1320px] mx-auto pb-12 px-3 sm:px-4 lg:px-6">
      <PageHeader
        title="Hướng dẫn sử dụng"
        subtitle="Tài liệu tham khảo nhanh cho hệ thống Le Palmier Resort Group"
        actions={
          <a className="btn-primary" href="mailto:support@lepalmier.vn">
            <Mail className="w-4 h-4" /> Liên hệ hỗ trợ
          </a>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-5">
        <Card className="lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                  active === s.id ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-50"
                }`}
              >
                <SectionIcon id={s.id} />
                {s.label}
              </button>
            ))}
          </nav>

          <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-brand-50 to-brand-100/40 border border-brand-100">
            <div className="flex items-center gap-2 mb-1.5">
              <Palette className="w-3.5 h-3.5 text-brand-600" />
              <div className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Mẹo</div>
            </div>
            <p className="text-xs text-ink-700 leading-relaxed">
              Thử đổi giao diện sang <strong>Tối</strong> hoặc <strong>Tím</strong> trong
              Cài đặt → Tuỳ chỉnh giao diện.
            </p>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          {active === "quickstart" && <Quickstart />}
          {active === "modules" && <Modules />}
          {active === "branches" && <BranchesGuide />}
          {active === "tips" && <Tips />}
          {active === "contact" && <Contact />}
        </div>
      </div>
    </div>
  );
}

function Quickstart() {
  return (
    <>
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Bắt đầu nhanh trong 5 bước</h3>
            <p className="text-xs text-ink-500 mt-0.5">Dành cho quản trị viên mới — từ lúc đăng nhập đến booking đầu tiên chỉ trong ~5 phút.</p>
          </div>
        </div>

        <ol className="space-y-3">
          {STEPS.map((s) => (
            <li key={s.num} className="flex items-start gap-3 p-3 rounded-lg border border-ink-100 bg-ink-50/40">
              <div className="w-8 h-8 rounded-full bg-ink-900 text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                {s.num}
              </div>
              <div>
                <div className="font-semibold text-sm text-ink-900">{s.title}</div>
                <p className="text-[12px] text-ink-600 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Đã xong 5 bước?</h3>
            <p className="text-xs text-ink-500 mt-0.5">Bạn đã sẵn sàng vận hành một booking đầu tiên.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a href="/dashboard" className="p-3 rounded-lg border border-ink-100 hover:border-brand-600 transition flex items-center gap-3">
            <BarChart3 className="w-4 h-4 text-brand-600" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-ink-900">Mở Dashboard</div>
              <div className="text-[11px] text-ink-500">Xem tổng quan hệ thống</div>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-400" />
          </a>
          <a href="/rooms" className="p-3 rounded-lg border border-ink-100 hover:border-brand-600 transition flex items-center gap-3">
            <BedDouble className="w-4 h-4 text-brand-600" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-ink-900">Quản lý phòng</div>
              <div className="text-[11px] text-ink-500">Thêm / sửa phòng</div>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-400" />
          </a>
          <a href="/settings" className="p-3 rounded-lg border border-ink-100 hover:border-brand-600 transition flex items-center gap-3">
            <Palette className="w-4 h-4 text-brand-600" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-ink-900">Tuỳ chỉnh giao diện</div>
              <div className="text-[11px] text-ink-500">Đổi màu & mật độ</div>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-400" />
          </a>
        </div>
      </Card>
    </>
  );
}

function Modules() {
  return (
    <Card>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-ink-900">Các chức năng chính</h3>
          <p className="text-xs text-ink-500 mt-0.5">Hệ thống có 11 module — click vào menu bên trái để vào từng module.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {MODULES.map((m) => {
          const Icon = m.Icon;
          return (
            <div key={m.title} className="p-3 rounded-lg border border-ink-100 hover:border-ink-300 transition">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${COLOR_CLASSES[m.color]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-display font-bold text-sm text-ink-900">{m.title}</div>
              </div>
              <p className="text-[12px] text-ink-600 leading-relaxed">{m.desc}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Tips() {
  return (
    <>
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Phím tắt & thủ thuật</h3>
            <p className="text-xs text-ink-500 mt-0.5">Một vài mẹo nhỏ giúp bạn thao tác nhanh hơn.</p>
          </div>
        </div>

        <div className="space-y-2">
          {TIPS.map((t, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-ink-100 bg-ink-50/40">
              <kbd className="shrink-0 inline-flex items-center px-2 py-1 rounded-md border border-ink-200 bg-white text-[11px] font-mono font-semibold text-ink-700">
                {t.kbd}
              </kbd>
              <p className="text-[12px] text-ink-700 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Tuỳ chỉnh trải nghiệm của bạn</h3>
            <p className="text-[12px] text-ink-600 mt-1 leading-relaxed">
              Vào <a href="/settings" className="text-brand-700 font-semibold hover:underline">Cài đặt</a> →
              mục <strong>Tuỳ chỉnh giao diện</strong> để:
            </p>
            <ul className="text-[12px] text-ink-700 mt-2 space-y-1.5 list-disc list-inside">
              <li>Đổi màu chủ đạo (Xanh navy / Xanh lục / Tím / Cam / Đỏ / Vàng)</li>
              <li>Bật <strong>Chế độ tối</strong> để giảm mỏi mắt</li>
              <li>Tăng/giảm <strong>mật độ</strong> hiển thị: Thu gọn / Thoải mái / Rộng rãi</li>
              <li>Đổi <strong>cỡ chữ</strong> cho phù hợp</li>
            </ul>
          </div>
        </div>
      </Card>
    </>
  );
}

function Contact() {
  return (
    <>
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Liên hệ hỗ trợ</h3>
            <p className="text-xs text-ink-500 mt-0.5">Đội ngũ vận hành Le Palmier luôn sẵn sàng hỗ trợ bạn.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CONTACT_CHANNELS.map((c) => {
            const Icon = c.Icon;
            return (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="p-3 rounded-lg border border-ink-100 hover:border-brand-600 transition flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-500">{c.label}</div>
                  <div className="text-[13px] font-semibold text-ink-900 truncate">{c.value}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-ink-400" />
              </a>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900">SLA hỗ trợ</h3>
            <div className="grid grid-cols-3 gap-3 mt-3 text-[12px]">
              <div className="p-2.5 rounded-md bg-ink-50">
                <div className="text-[10px] font-semibold uppercase text-ink-500">Critical</div>
                <div className="font-display font-bold text-ink-900 mt-0.5">≤ 1 giờ</div>
              </div>
              <div className="p-2.5 rounded-md bg-ink-50">
                <div className="text-[10px] font-semibold uppercase text-ink-500">Normal</div>
                <div className="font-display font-bold text-ink-900 mt-0.5">≤ 4 giờ</div>
              </div>
              <div className="p-2.5 rounded-md bg-ink-50">
                <div className="text-[10px] font-semibold uppercase text-ink-500">Thường</div>
                <div className="font-display font-bold text-ink-900 mt-0.5">≤ 24 giờ</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

function BranchesGuide() {
  return (
    <>
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Tổng quan</h3>
            <p className="text-xs text-ink-500 mt-0.5">
              Hiện có {BRANCHES_LIST.length} chi nhánh — bạn có thể thêm nhiều hơn bất cứ lúc nào.
              Mỗi chi nhánh là một vùng vận hành độc lập với phòng, booking, doanh thu, nhân sự riêng.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BRANCHES_LIST.map((b) => (
            <div key={b.code} className="p-3 rounded-lg border border-ink-100 bg-ink-50/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-sm text-ink-900">{b.name}</div>
                <div className="text-[11px] text-ink-500">Mã: <span className="font-mono">{b.code}</span> · {b.rooms} phòng</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                Hoạt động
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Thêm chi nhánh mới</h3>
            <p className="text-xs text-ink-500 mt-0.5">
              Lỡ tạo thêm thì sao? — Hoàn toàn không ảnh hưởng các chi nhánh khác. Mỗi chi nhánh chạy độc lập.
            </p>
          </div>
        </div>

        <ol className="space-y-3">
          {BRANCH_CREATE_STEPS.map((s, i) => (
            <li key={i} className="flex items-start gap-3 p-3 rounded-lg border border-ink-100 bg-ink-50/40">
              <div className="w-8 h-8 rounded-full bg-ink-900 text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                {i + 1}
              </div>
              <div>
                <div className="font-semibold text-sm text-ink-900">{s.t}</div>
                <p className="text-[12px] text-ink-600 mt-0.5 leading-relaxed">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Lỡ tạo thêm thì sao?</h3>
            <p className="text-xs text-ink-500 mt-0.5">Không ảnh hưởng dữ liệu đang có — mọi thứ tách biệt.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
          {BRANCH_IMPACTS.map((row, i) => {
            const Icon = row.Icon;
            return (
              <div key={i} className="p-3 rounded-lg border border-ink-100 flex items-start gap-2.5">
                <Icon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-ink-900">{row.label}</div>
                  <div className="text-ink-600 mt-0.5">{row.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Mẹo vận hành</h3>
            <ul className="text-[12px] text-ink-700 mt-2 space-y-1.5 list-disc list-inside">
              <li>Mã chi nhánh (<span className="font-mono">LPR-XXX</span>) nên đặt theo tỉnh/thành để dễ tra cứu.</li>
              <li>Ngay sau khi tạo, vào <strong>Phòng</strong> → Thêm nhiều phòng cùng lúc bằng cách nhập dải số (101–120, 201–220…).</li>
              <li>Đặt <strong>giá mặc định theo mùa</strong> để booking tự động áp dụng giá cao/thấp điểm.</li>
              <li>Phân quyền: vào <a href="/staff" className="text-brand-700 font-semibold hover:underline">Nhân viên</a> → chọn nhân viên → gán chi nhánh phụ trách.</li>
            </ul>
          </div>
        </div>
      </Card>
    </>
  );
}