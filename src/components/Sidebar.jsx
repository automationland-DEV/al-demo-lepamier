import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Icons } from "./Icons";
import BranchSelector from "./BranchSelector";
import { branches, rooms, staff, guests, bookings } from "../data/mockData";
import { invoices, receivables, reviews, menuItems, ingredients, promotions } from "../data/adminData";

const {
  LayoutDashboard, Building2, BedDouble, CalendarCheck, Users, UserCog,
  BarChart3, MessageSquare, Settings, ConciergeBell, Utensils, Megaphone,
  Newspaper, FolderTree, GraduationCap, Globe, PanelLeft, X, ChevronDown,
  LayoutList, Tags, BookOpen, Boxes, Crown, Star, CalendarClock,
  ReceiptText, Landmark, ArrowLeftRight, TicketPercent, ShieldCheck, ScrollText,
} = Icons;

const LS_KEY = "condohub.nav.groups";

/**
 * Điều hướng chia theo NHÓM NGHIỆP VỤ, không theo "loại màn hình".
 * Người vận hành nghĩ theo bộ phận họ phụ trách (lễ tân → Khách sạn,
 * bếp → Nhà hàng, kế toán → Tài chính) nên menu bám đúng cách nghĩ đó.
 *
 * Số badge đọc thẳng từ dữ liệu — trước đây hardcode và đã lệch thực tế.
 * Nhãn theo từ điển thuật ngữ Design.md §13.
 */
function useNav() {
  return useMemo(() => {
    const n = (v) => v.toLocaleString("vi-VN");
    const unpaid = invoices.filter((i) => i.status !== "paid").length;
    const overdue = receivables.filter((r) => r.worstOverdue > 0).length;
    const unreplied = reviews.filter((r) => !r.replied).length;
    const lowStock = ingredients.filter((i) => i.level !== "ok").length;

    return [
      {
        id: "overview",
        title: "Tổng quan",
        icon: LayoutDashboard,
        items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
      },
      {
        id: "hotel",
        title: "Khách sạn",
        icon: BedDouble,
        items: [
          { to: "/branches", label: "Chi nhánh", icon: Building2, badge: n(branches.length) },
          { to: "/rooms", label: "Phòng", icon: BedDouble, badge: n(rooms.length) },
          { to: "/room-types", label: "Hạng phòng", icon: LayoutList },
          { to: "/rates", label: "Bảng giá", icon: Tags },
          { to: "/bookings", label: "Đặt phòng", icon: CalendarCheck, badge: n(bookings.length) },
          { to: "/services", label: "Dịch vụ & Tiện ích", icon: ConciergeBell },
        ],
      },
      {
        id: "fnb",
        title: "Nhà hàng",
        icon: Utensils,
        items: [
          { to: "/restaurant-ops", label: "Vận hành nhà hàng", icon: Utensils },
          { to: "/menu", label: "Thực đơn", icon: BookOpen, badge: n(menuItems.length) },
          { to: "/inventory", label: "Kho & Nguyên liệu", icon: Boxes, badge: lowStock ? n(lowStock) : null },
        ],
      },
      {
        id: "crm",
        title: "Khách hàng",
        icon: Users,
        items: [
          { to: "/guests", label: "Hồ sơ khách", icon: Users, badge: n(guests.length) },
          { to: "/loyalty", label: "Khách thân thiết", icon: Crown },
          { to: "/reviews", label: "Đánh giá", icon: Star, badge: unreplied ? n(unreplied) : null },
          { to: "/messages", label: "Tin nhắn", icon: MessageSquare, badge: "8" },
        ],
      },
      {
        id: "hr",
        title: "Nhân sự",
        icon: UserCog,
        items: [
          { to: "/staff", label: "Nhân viên", icon: UserCog, badge: n(staff.length) },
          { to: "/payroll", label: "Bảng công & Lương", icon: CalendarClock },
        ],
      },
      {
        id: "finance",
        title: "Tài chính",
        icon: Landmark,
        items: [
          { to: "/invoices", label: "Hóa đơn", icon: ReceiptText, badge: unpaid ? n(unpaid) : null },
          { to: "/receivables", label: "Công nợ", icon: Landmark, badge: overdue ? n(overdue) : null },
          { to: "/cashflow", label: "Thu chi", icon: ArrowLeftRight },
          { to: "/reports", label: "Báo cáo", icon: BarChart3 },
        ],
      },
      {
        id: "marketing",
        title: "Marketing",
        icon: Megaphone,
        items: [
          { to: "/marketing", label: "Chiến dịch", icon: Megaphone },
          { to: "/promotions", label: "Khuyến mãi", icon: TicketPercent, badge: n(promotions.filter((p) => p.active).length) },
          /* Trang này có 2 tab (/website và /website/users); điều hướng giữa
             hai tab nằm trong trang nên sidebar chỉ giữ một mục. */
          { to: "/website", label: "Website", icon: Globe },
          { to: "/posts", label: "Bài viết", icon: Newspaper },
          { to: "/post-categories", label: "Danh mục bài viết", icon: FolderTree },
        ],
      },
      {
        id: "system",
        title: "Hệ thống",
        icon: Settings,
        items: [
          { to: "/roles", label: "Phân quyền", icon: ShieldCheck },
          { to: "/audit-log", label: "Nhật ký hệ thống", icon: ScrollText },
          { to: "/help", label: "Hướng dẫn sử dụng", icon: GraduationCap },
          { to: "/settings", label: "Cài đặt", icon: Settings },
        ],
      },
    ];
  }, []);
}

/** Mục điều hướng. Mục đang mở KHÔNG tô nền đầy màu như v3 — nó được đánh
 *  dấu bằng vạch đồng thau bên trái, chi tiết nhận diện ② (Design.md §3). */
function NavItem({ item, collapsed, indent = false, onNavigate }) {
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to === "/"}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          `relative group flex items-center gap-2.5 min-h-[36px] py-1.5 text-[13px] transition-colors ${
            collapsed ? "justify-center px-2" : `${indent ? "pl-6" : "pl-3.5"} pr-2.5`
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

/** Đầu nhóm gập được. Nhóm chứa route đang mở luôn được bung ra. */
function GroupHead({ group, open, hasActive, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center gap-2 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.16em] font-semibold transition-colors"
      style={{ color: hasActive ? "var(--fg-muted)" : "var(--fg-subtle)", borderRadius: "var(--r-sm)" }}
    >
      <span className="flex-1 text-left truncate">{group.title}</span>
      <ChevronDown
        className="w-3.5 h-3.5 shrink-0 transition-transform"
        style={{ transform: open ? "none" : "rotate(-90deg)", transitionDuration: ".18s" }}
      />
    </button>
  );
}

export default function Sidebar({ collapsed, mobileOpen = false, onCloseMobile, onToggleCollapse }) {
  // Desktop: thu gọn thành cột icon · Mobile: luôn mở rộng khi là drawer
  const isMobile = mobileOpen;
  const effectiveCollapsed = isMobile ? false : collapsed;
  const navGroups = useNav();
  const { pathname } = useLocation();

  /* Nhóm nào đang mở — nhớ qua localStorage để không phải bung lại mỗi lần
     tải trang. Lần đầu mở tất cả để người dùng thấy toàn bộ hệ thống. */
  const [openIds, setOpenIds] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* localStorage bị chặn — dùng mặc định */
    }
    return navGroupIds();
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(openIds));
    } catch {
      /* bỏ qua */
    }
  }, [openIds]);

  /** Nhóm chứa route đang xem — dùng để tự bung và làm đậm tiêu đề nhóm */
  const activeGroupId = useMemo(() => {
    const hit = navGroups.find((g) =>
      g.items.some((it) => (it.to === "/" ? pathname === "/" : pathname.startsWith(it.to)))
    );
    return hit?.id || null;
  }, [navGroups, pathname]);

  // Điều hướng bằng breadcrumb / liên kết trong trang có thể nhảy sang nhóm
  // đang gập — bung nó ra để người dùng luôn thấy mình đang đứng ở đâu.
  useEffect(() => {
    if (activeGroupId) setOpenIds((prev) => (prev.includes(activeGroupId) ? prev : [...prev, activeGroupId]));
  }, [activeGroupId]);

  const toggle = useCallback(
    (id) => setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    []
  );

  const closeOnNavigate = useCallback(() => {
    if (isMobile) onCloseMobile?.();
  }, [isMobile, onCloseMobile]);

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
          {navGroups.map((group, gi) => {
            /* Khi thu gọn thì không có chỗ cho tiêu đề nhóm — đổ phẳng toàn
               bộ mục, ngăn cách bằng kẻ tóc, và bỏ qua trạng thái gập. */
            if (effectiveCollapsed) {
              return (
                <div key={group.id} className={gi > 0 ? "mt-3" : ""}>
                  {gi > 0 && (
                    <div
                      aria-hidden
                      className="mx-3 mb-3 h-px"
                      style={{ backgroundColor: "var(--border-soft)" }}
                    />
                  )}
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavItem key={item.to} item={item} collapsed onNavigate={closeOnNavigate} />
                    ))}
                  </ul>
                </div>
              );
            }

            // Nhóm chỉ có một mục (Tổng quan) không cần đầu nhóm gập
            if (group.items.length === 1) {
              return (
                <ul key={group.id} className={gi > 0 ? "mt-4" : ""}>
                  <NavItem item={group.items[0]} collapsed={false} onNavigate={closeOnNavigate} />
                </ul>
              );
            }

            const open = openIds.includes(group.id);
            return (
              <div key={group.id} className={gi > 0 ? "mt-3" : ""}>
                <GroupHead
                  group={group}
                  open={open}
                  hasActive={activeGroupId === group.id}
                  onToggle={() => toggle(group.id)}
                />
                {open && (
                  <ul className="space-y-0.5 mt-1">
                    {group.items.map((item) => (
                      <NavItem
                        key={item.to}
                        item={item}
                        collapsed={false}
                        indent
                        onNavigate={closeOnNavigate}
                      />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

/* Danh sách id nhóm — khai báo tách rời vì useState initializer chạy trước
   khi useNav() có kết quả, không thể tham chiếu navGroups ở đó. */
function navGroupIds() {
  return ["overview", "hotel", "fnb", "crm", "hr", "finance", "marketing", "system"];
}
