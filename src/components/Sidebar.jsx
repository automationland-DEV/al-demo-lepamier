import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { Icons } from "./Icons";
import BranchSelector from "./BranchSelector";
import { branches, rooms, staff, guests, bookings } from "../data/mockData";

const {
  LayoutDashboard, Building2, BedDouble, CalendarCheck, Users, UserCog,
  BarChart3, MessageSquare, Settings, ConciergeBell, Utensils, Megaphone,
  Newspaper, FolderTree, GraduationCap, Globe, PanelLeft, X,
} = Icons;

/**
 * Số badge trước đây hardcode và đã lệch thực tế (ghi 316 nhân viên / 1.2K
 * phòng, thực tế 124 / 713). Nay đọc thẳng từ mockData nên không trôi được
 * nữa. Nhãn theo từ điển thuật ngữ Design.md §13.
 */
function useNav() {
  return useMemo(() => {
    const n = (v) => v.toLocaleString("vi-VN");
    return [
      {
        title: "Tổng quan",
        items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
      },
      {
        title: "Vận hành",
        items: [
          { to: "/branches", label: "Chi nhánh", icon: Building2, badge: n(branches.length) },
          { to: "/rooms", label: "Phòng", icon: BedDouble, badge: n(rooms.length) },
          { to: "/bookings", label: "Đặt phòng", icon: CalendarCheck, badge: n(bookings.length) },
          { to: "/guests", label: "Khách hàng", icon: Users, badge: n(guests.length) },
        ],
      },
      {
        title: "Nhân sự",
        items: [{ to: "/staff", label: "Nhân viên", icon: UserCog, badge: n(staff.length) }],
      },
      {
        title: "Marketing",
        items: [
          { to: "/marketing", label: "Marketing", icon: Megaphone },
          /* Trang này có 2 tab (/website và /website/users); điều hướng giữa
             hai tab nằm trong trang nên sidebar chỉ giữ một mục. */
          { to: "/website", label: "Website", icon: Globe },
          { to: "/posts", label: "Bài viết", icon: Newspaper },
          { to: "/post-categories", label: "Danh mục bài viết", icon: FolderTree },
        ],
      },
      {
        title: "Dịch vụ & Báo cáo",
        items: [
          { to: "/services", label: "Dịch vụ", icon: ConciergeBell },
          { to: "/restaurant-ops", label: "Nhà hàng", icon: Utensils },
          { to: "/reports", label: "Báo cáo", icon: BarChart3 },
          { to: "/messages", label: "Tin nhắn", icon: MessageSquare, badge: "8" },
        ],
      },
      {
        title: "Hệ thống",
        items: [
          { to: "/help", label: "Hướng dẫn sử dụng", icon: GraduationCap },
          { to: "/settings", label: "Cài đặt", icon: Settings },
        ],
      },
    ];
  }, []);
}

/** Mục điều hướng. Mục đang mở KHÔNG tô nền đầy màu như v3 — nó được đánh
 *  dấu bằng vạch đồng thau bên trái, chi tiết nhận diện ② (Design.md §3). */
function NavItem({ item, collapsed, onNavigate }) {
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to === "/"}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          `relative group flex items-center gap-2.5 min-h-[38px] py-2 text-[13px] transition-colors ${
            collapsed ? "justify-center px-2" : "pl-3.5 pr-2.5"
          } ${isActive ? "font-medium" : ""}`
        }
        style={({ isActive }) => ({
          borderRadius: "var(--r-sm)",
          backgroundColor: isActive ? "var(--surface-2)" : "transparent",
          color: isActive ? "var(--fg)" : "var(--fg-muted)",
          transitionDuration: ".16s",
        })}
      >
        {({ isActive }) => (
          <>
            {isActive && !collapsed && (
              <span
                aria-hidden
                className="absolute left-0 top-1.5 bottom-1.5 w-0.5"
                style={{ backgroundColor: "var(--metal)" }}
              />
            )}
            <item.icon
              className="w-[17px] h-[17px] shrink-0"
              style={{ color: isActive ? "var(--metal)" : "var(--fg-subtle)" }}
            />
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className="text-[11px] tnum shrink-0"
                    style={{ color: "var(--fg-subtle)" }}
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
  );
}

export default function Sidebar({ collapsed, mobileOpen = false, onCloseMobile, onToggleCollapse }) {
  // Desktop: thu gọn thành cột icon · Mobile: luôn mở rộng khi là drawer
  const isMobile = mobileOpen;
  const effectiveCollapsed = isMobile ? false : collapsed;
  const navGroups = useNav();

  return (
    <>
      {/* Backdrop chỉ hiện trên mobile */}
      {isMobile && (
        <div
          className="lg:hidden fixed inset-0 z-40 transition-opacity duration-200"
          style={{ backgroundColor: "rgba(25,28,22,.42)", backdropFilter: "blur(3px)" }}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          ${isMobile ? "fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[300px]" : "hidden lg:flex sticky top-0"}
          ${!isMobile && (collapsed ? "lg:w-[72px]" : "lg:w-[248px]")}
          transition-[width,transform] duration-200 ease-out shrink-0 border-r flex flex-col h-screen
        `}
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--fg)",
          boxShadow: isMobile ? "var(--shadow-pop)" : "none",
        }}
      >
        {/* Thương hiệu + nút thu gọn */}
        <div
          className={`h-[60px] flex items-center border-b shrink-0 ${
            effectiveCollapsed ? "justify-center px-2" : "gap-2.5 px-4"
          }`}
          style={{ borderColor: "var(--border)" }}
        >
          {effectiveCollapsed ? (
            <button
              onClick={onToggleCollapse}
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] transition-colors"
              style={{ borderRadius: "var(--r-sm)" }}
              aria-label="Mở rộng thanh bên"
              title="Mở rộng thanh bên"
              aria-expanded={false}
            >
              <img src="/img/logo.png" alt="Condo HUB" className="h-7 w-auto object-contain" />
            </button>
          ) : (
            <>
              <img
                src="/img/logo.png"
                alt=""
                className="h-7 w-auto shrink-0 object-contain"
              />
              <div className="leading-tight min-w-0 flex-1">
                {/* Chữ ký serif — chi tiết nhận diện ③ */}
                <div className="font-display text-[17px] truncate" style={{ color: "var(--fg)" }}>
                  Condo HUB
                </div>
                <div
                  className="text-[9px] uppercase tracking-[0.16em] font-semibold truncate"
                  style={{ color: "var(--metal)" }}
                >
                  Hotel &amp; Resort
                </div>
              </div>

              {!isMobile && (
                <button
                  onClick={onToggleCollapse}
                  className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] shrink-0 transition-colors"
                  style={{ borderRadius: "var(--r-sm)", color: "var(--fg-subtle)" }}
                  aria-label="Thu gọn thanh bên"
                  title="Thu gọn thanh bên"
                  aria-expanded={true}
                >
                  <PanelLeft className="w-[18px] h-[18px]" />
                </button>
              )}
            </>
          )}

          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] shrink-0"
              style={{ borderRadius: "var(--r-sm)", color: "var(--fg-subtle)" }}
              aria-label="Đóng menu"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>

        <BranchSelector collapsed={effectiveCollapsed} />

        <nav className="flex-1 overflow-y-auto px-2.5 py-4 noscroll">
          {navGroups.map((group, gi) => (
            <div key={group.title} className={gi > 0 ? "mt-6" : ""}>
              {!effectiveCollapsed ? (
                <div
                  className="px-3.5 mb-2 text-[10px] uppercase tracking-[0.16em] font-semibold"
                  style={{ color: "var(--fg-subtle)" }}
                >
                  {group.title}
                </div>
              ) : (
                gi > 0 && (
                  <div
                    aria-hidden
                    className="mx-3 mb-3 h-px"
                    style={{ backgroundColor: "var(--border-soft)" }}
                  />
                )
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem
                    key={item.to}
                    item={item}
                    collapsed={effectiveCollapsed}
                    onNavigate={() => isMobile && onCloseMobile?.()}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
