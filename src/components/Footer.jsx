import { Link } from "react-router-dom";
import { Icons } from "./Icons";

const { ChevronRight, MapPin, Phone, Mail } = Icons;

const QUICK_LINKS = [
  { to: "/branches", label: "Chi nhánh" },
  { to: "/rooms",    label: "Phòng" },
  { to: "/bookings", label: "Đặt phòng" },
  { to: "/guests",   label: "Khách hàng" },
  { to: "/services", label: "Dịch vụ" },
  { to: "/reports",  label: "Báo cáo" },
];

export default function Footer() {
  return (
    /* v3 tô nền gradient xanh dương cứng nên chân trang là mảng màu duy nhất
       không đổi theo bộ sưu tập, xuất hiện ở MỌI trang. Nay dùng màu nhà đặc
       (Design.md §2.2) và một vạch đồng thau thay dải cầu vồng. */
    <footer
      className="mt-12 overflow-hidden"
      style={{
        borderRadius: "var(--r)",
        backgroundColor: "var(--accent)",
        color: "var(--on-accent)",
      }}
    >
      <div className="h-0.5" style={{ backgroundColor: "var(--metal)" }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4 sm:px-6 py-7 text-center md:text-left">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden"
              style={{ borderRadius: "var(--r-sm)", backgroundColor: "color-mix(in oklab, var(--on-accent) 12%, transparent)" }}>
              <img
                src="/img/logo.png"
                alt="Condo HUB"
                className="h-9 w-auto object-contain"
                style={{ filter: "var(--logo-on-accent)" }}
              />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-[15px] tracking-wide truncate">
                Condo HUB
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-semibold">
                Hotel & Resort
              </div>
            </div>
          </div>
          <p className="text-[12px] opacity-70 leading-relaxed mt-3">
            Hệ thống quản lý khách sạn tập trung 4 chi nhánh · Đức Hòa · Hồ Tràm · Long An · Tây Ninh.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] opacity-60 font-semibold mb-3">
            Truy cập nhanh
          </div>
          <ul className="space-y-2 text-[12px]">
            {QUICK_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="opacity-80 hover:opacity-100 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] opacity-60 font-semibold mb-3">
            Liên hệ
          </div>
          <ul className="space-y-2.5 text-[12px] opacity-80">
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70" />
              <span>128 Nguyễn Trung Trực, Bến Tre</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span className="tabular-nums">+84 275 3820 246</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span className="tabular-nums">+84 909 456 789</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span>info@condohub.vn</span>
            </li>
          </ul>
        </div>

        {/* System */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] opacity-60 font-semibold mb-3">
            Hệ thống
          </div>
          <ul className="space-y-2.5 text-[12px] opacity-80">
            <li className="flex items-center justify-between">
              <span>Phiên bản</span>
              <span className="font-mono tabular-nums opacity-100">v1.0.0</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Trạng thái</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full pulse-soft" style={{ backgroundColor: "currentColor" }} />
                <span className="font-medium opacity-100">Online</span>
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Cơ sở dữ liệu</span>
              <span className="font-mono tabular-nums">PostgreSQL 15</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Uptime</span>
              <span className="font-mono tabular-nums">99.98%</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Latency</span>
              <span className="font-mono tabular-nums opacity-100">42ms</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderColor: "color-mix(in oklab, var(--on-accent) 15%, transparent)" }}
           className="border-t px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] opacity-60 text-center md:text-left">
        <div>© 2026 Condo HUB Hotel & Resort. Bảo lưu mọi quyền.</div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-1.5">
          <Link to="/help"     className="hover:opacity-100 transition">Trợ giúp</Link>
          <Link to="/messages" className="hover:opacity-100 transition">Hỗ trợ</Link>
          <Link to="/settings" className="hover:opacity-100 transition">Cài đặt</Link>
          <span className="opacity-30">·</span>
          <span className="font-mono tabular-nums">build 2026.07.28</span>
        </div>
      </div>
    </footer>
  );
}
