import { NavLink } from "react-router-dom";
import { Icons } from "./Icons";
import BranchSelector from "./BranchSelector";
import { X, Menu } from "lucide-react";

const {
  LayoutDashboard, Building2, BedDouble, CalendarCheck, Users, UserCog,
  BarChart3, MessageSquare, Settings, ConciergeBell, ChevronRight,
  Utensils, Megaphone, Newspaper, FolderTree,
} = Icons;

const navGroups = [
  {
    title: "Tổng quan",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, badge: null },
    ],
  },
  {
    title: "Vận hành",
    items: [
      { to: "/branches", label: "Khu du lịch", icon: Building2, badge: "4" },
      { to: "/rooms", label: "Phòng & Căn", icon: BedDouble, badge: "1.2K" },
      { to: "/bookings", label: "Đặt chỗ", icon: CalendarCheck, badge: "320" },
      { to: "/guests", label: "Khách tham quan", icon: Users, badge: "240" },
    ],
  },
  {
    title: "Nhân sự",
    items: [
      { to: "/staff", label: "Nhân viên", icon: UserCog, badge: "316" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { to: "/marketing",        label: "Marketing Hub",    icon: Megaphone, badge: "MỚI" },
      { to: "/posts",            label: "Bài viết",         icon: Newspaper, badge: null },
      { to: "/post-categories",  label: "Danh mục bài viết", icon: FolderTree, badge: null },
    ],
  },
  {
    title: "Dịch vụ & Báo cáo",
    items: [
      { to: "/services", label: "Dịch vụ", icon: ConciergeBell, badge: null },
      { to: "/restaurant-ops", label: "Vận hành nhà hàng", icon: Utensils, badge: "HOT" },
      { to: "/reports", label: "Báo cáo", icon: BarChart3, badge: null },
      { to: "/messages", label: "Tin nhắn", icon: MessageSquare, badge: "8" },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { to: "/settings", label: "Cài đặt", icon: Settings, badge: null },
    ],
  },
];

export default function Sidebar({ collapsed, mobileOpen = false, onCloseMobile, onToggleCollapse }) {
  // Desktop: collapsed icon-only · Mobile: luôn expanded khi mở drawer
  const isMobile = mobileOpen;
  const effectiveCollapsed = isMobile ? false : collapsed;

  return (
    <>
      {/* Backdrop chỉ hiện trên mobile */}
      {isMobile && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          ${isMobile ? "fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[300px] shadow-pop" : "hidden lg:flex sticky top-0"}
          ${!isMobile && (collapsed ? "lg:w-[72px]" : "lg:w-[260px]")}
          transition-[width,transform] duration-200 ease-out shrink-0 border-r flex flex-col h-screen
        `}
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--fg)",
        }}
      >
        {/* Logo + nút thu gọn.
            Nút ba gạch nằm ở đây (sát thương hiệu) cho desktop; trên mobile
            sidebar là drawer nên nút mở nằm ở Topbar, chỗ này là nút đóng. */}
        <div
          className={`h-[60px] flex items-center border-b shrink-0 ${
            effectiveCollapsed ? "justify-center px-2" : "gap-2 px-3"
          }`}
          style={{ borderColor: "var(--border)" }}
        >
          {effectiveCollapsed ? (
            /* Thu gọn: chỉ hiện logo — bấm vào logo để mở rộng lại */
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md hover:bg-ink-100 transition inline-flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label="Mở rộng thanh bên"
              title="Mở rộng thanh bên"
              aria-expanded={false}
            >
              <img src="/img/logo.png" alt="Le Palmier" className="h-8 w-auto object-contain" />
            </button>
          ) : (
            <>
              <img
                src="/img/logo.png"
                alt="Le Palmier"
                className="h-8 w-auto shrink-0 object-contain"
              />
              <div className="leading-tight min-w-0 flex-1">
                <div className="font-semibold text-[14px] tracking-tight truncate" style={{ color: "var(--fg)" }}>
                  Le Palmier
                </div>
                <div className="text-[10px] uppercase tracking-[0.12em] font-medium truncate" style={{ color: "var(--fg-muted)" }}>
                  Resort Group
                </div>
              </div>

              {/* Nút thu gọn nằm bên PHẢI thương hiệu. Mobile dùng nút đóng bên dưới. */}
              {!isMobile && (
                <button
                  onClick={onToggleCollapse}
                  className="p-2 rounded-md hover:bg-ink-100 text-ink-600 transition shrink-0 inline-flex items-center justify-center min-h-[40px] min-w-[40px]"
                  aria-label="Thu gọn thanh bên"
                  title="Thu gọn thanh bên"
                  aria-expanded={true}
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
            </>
          )}

          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-md hover:bg-ink-100 text-ink-600 inline-flex items-center justify-center min-h-[40px] min-w-[40px] shrink-0"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Branch switcher */}
        <BranchSelector collapsed={effectiveCollapsed} />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 sm:py-4">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5 last:mb-0">
              {!effectiveCollapsed && (
                <div
                  className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.12em] font-semibold"
                  style={{ color: "var(--fg-subtle)" }}
                >
                  {group.title}
                </div>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      onClick={() => isMobile && onCloseMobile?.()}
                      title={effectiveCollapsed ? item.label : undefined}
                      style={({ isActive }) =>
                        isActive
                          ? { backgroundColor: "var(--accent)", color: "var(--on-accent)" }
                          : { color: "var(--fg)" }
                      }
                      className={({ isActive }) =>
                        `group flex items-center gap-2.5 px-2.5 min-h-[40px] py-2 rounded-md text-[13px] font-medium transition ${
                          effectiveCollapsed ? "justify-center" : ""
                        } ${isActive ? "" : "hover:opacity-80"}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className="w-[18px] h-[18px] shrink-0" />
                          {!effectiveCollapsed && (
                            <>
                              <span className="flex-1 truncate">{item.label}</span>
                              {item.badge && (
                                <span
                                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                  style={
                                    isActive
                                      ? { backgroundColor: "rgba(255,255,255,0.2)", color: "var(--on-accent)" }
                                      : { backgroundColor: "var(--surface-3)", color: "var(--fg-muted)" }
                                  }
                                >
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}