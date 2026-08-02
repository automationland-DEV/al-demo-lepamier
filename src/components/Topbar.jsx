import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "./Icons";
import { useActiveBranch } from "../context/BranchContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const {
  Search, Bell, ChevronDown, ChevronRight, HelpCircle, LogOut, Settings,
  Menu, Command, Calendar, Building2, Globe, AlertCircle, CheckCircle2,
  UserCog, CreditCard, Activity, Sun, Moon, Check,
} = Icons;

const panelStyle = { backgroundColor: "var(--surface)", borderColor: "var(--border)" };

/* Breadcrumb trước đây ghi cứng "Dashboard" ở mọi trang. Bảng này khớp với
 * nhãn sidebar để hai chỗ không nói hai kiểu — Design.md §13. */
const ROUTE_TITLES = {
  "/": "Dashboard",
  "/branches": "Chi nhánh",
  "/rooms": "Phòng",
  "/bookings": "Đặt phòng",
  "/guests": "Khách hàng",
  "/staff": "Nhân viên",
  "/services": "Dịch vụ",
  "/restaurant-ops": "Nhà hàng",
  "/reports": "Báo cáo",
  "/reports/detail": "Chi tiết báo cáo",
  "/reports/revenue-timeline": "Doanh thu theo thời gian",
  "/reports/revenue-structure": "Cơ cấu doanh thu",
  "/reports/occupancy-by-room": "Lấp đầy theo hạng phòng",
  "/reports/forecast": "Dự báo",
  "/reports/top-agencies": "Đại lý hàng đầu",
  "/reports/period-comparison": "So sánh kỳ",
  "/messages": "Tin nhắn",
  "/marketing": "Marketing",
  "/website": "Website",
  "/website/users": "Người dùng Website",
  "/posts": "Bài viết",
  "/post-categories": "Danh mục bài viết",
  "/notifications": "Thông báo",
  "/help": "Hướng dẫn sử dụng",
  "/settings": "Cài đặt",
  "/profile": "Hồ sơ cá nhân",
};

/** Nút icon trên topbar — bo 4px, hover đổi nền, không đổ bóng */
function BarButton({ icon: Icon, label, active, onClick, className = "", children }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={label}
      aria-label={label}
      className={`relative flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 transition-colors ${className}`}
      style={{
        borderRadius: "var(--r-sm)",
        backgroundColor: active || hover ? "var(--surface-3)" : "transparent",
        color: active ? "var(--fg)" : "var(--fg-muted)",
        transitionDuration: ".16s",
      }}
    >
      <Icon className="w-[18px] h-[18px]" />
      {children}
    </button>
  );
}

export default function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout, user, DEMO_USER } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [openBranch, setOpenBranch] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const branchRef = useRef(null);
  const { activeBranchId, activeBranch, branches, setBranch, isAll } = useActiveBranch();

  const isDark = theme === "dark";
  const themeLabel = isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối";

  /* Tên và vai trò lấy từ AuthContext thay vì ghi cứng trong JSX. */
  const me = user || DEMO_USER;
  const initials = useMemo(() => {
    if (me.avatar) return me.avatar;
    const p = String(me.name || "").trim().split(/\s+/).filter(Boolean);
    return ((p[0]?.[0] || "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
  }, [me]);

  const pageTitle = ROUTE_TITLES[pathname] || "Quản trị";

  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setOpenUser(false);
      if (branchRef.current && !branchRef.current.contains(e.target)) setOpenBranch(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ⌘K / Ctrl+K đưa con trỏ vào ô tìm kiếm
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("topbar-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const notifications = [
    { id: 1, type: "alert", title: "Đặt phòng mới cần xác nhận", desc: "Villa Sapa — nhận phòng 14/08", time: "2 phút trước", unread: true },
    { id: 2, type: "ok", title: "Trả phòng hoàn tất", desc: "Đoàn 24 khách — chi nhánh Hồ Tràm", time: "15 phút trước", unread: true },
    { id: 3, type: "info", title: "Báo cáo doanh thu tháng 7 đã sẵn sàng", desc: "Tăng 18% so với tháng trước", time: "1 giờ trước", unread: false },
    { id: 4, type: "alert", title: "Phòng B-204 báo sự cố điều hòa", desc: "Cần xử lý trong 30 phút", time: "2 giờ trước", unread: false },
  ];

  const notifIcons = {
    alert: { Icon: AlertCircle, tone: "warning" },
    ok: { Icon: CheckCircle2, tone: "success" },
    info: { Icon: Activity, tone: "info" },
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 border-b" style={panelStyle}>
      <div className="flex items-center gap-2 sm:gap-3 px-3 md:px-5 h-[60px]">
        {/* Nút mở menu — chỉ dưới lg. Từ lg trở lên nút thu gọn nằm trong sidebar. */}
        <BarButton
          icon={Menu}
          label="Mở menu điều hướng"
          onClick={onToggleSidebar}
          className="lg:hidden shrink-0"
        />

        <nav className="hidden md:flex items-center gap-1.5 text-[13px] min-w-0" aria-label="Đường dẫn">
          <span style={{ color: "var(--fg-subtle)" }}>Quản trị</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--fg-subtle)" }} />
          <span className="font-medium truncate" style={{ color: "var(--fg)" }}>{pageTitle}</span>
        </nav>

        {/* Tiêu đề rút gọn cho mobile */}
        <div className="md:hidden flex items-center gap-2 min-w-0 flex-1">
          <img src="/img/logo.png" alt="" className="h-6 w-auto shrink-0" />
          <span className="font-display text-[15px] truncate" style={{ color: "var(--fg)" }}>
            Condo HUB
          </span>
        </div>

        {/* Ô tìm kiếm */}
        <div className="flex-1 flex justify-center px-1 md:px-4">
          <div className="relative w-full max-w-[480px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--fg-subtle)" }}
            />
            <input
              id="topbar-search"
              className="w-full h-9 pl-9 pr-3 md:pr-16 border outline-none text-[16px] sm:text-[13px]"
              style={{
                borderRadius: "var(--r-sm)",
                backgroundColor: "var(--surface-2)",
                borderColor: "var(--border)",
                color: "var(--fg)",
              }}
              placeholder="Tìm phòng, đặt phòng, khách hàng…"
            />
            <kbd
              className="hidden md:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 border"
              style={{
                borderRadius: "3px",
                borderColor: "var(--border)",
                color: "var(--fg-subtle)",
                backgroundColor: "var(--surface)",
              }}
            >
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Khoảng ngày — chỉ từ xl, vì ở đúng mốc lg hàng hành động đã chật */}
          <button
            className="hidden xl:flex items-center gap-2 h-9 px-3 border text-[13px] transition-colors"
            style={{
              borderRadius: "var(--r-sm)",
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
          >
            <Calendar className="w-3.5 h-3.5" style={{ color: "var(--fg-subtle)" }} />
            <span className="tnum">28/07 – 03/08</span>
          </button>

          {/* Chọn chi nhánh */}
          <div className="relative" ref={branchRef}>
            <button
              onClick={() => setOpenBranch(!openBranch)}
              className="hidden sm:flex items-center gap-2 h-9 px-3 border text-[13px] transition-colors"
              style={{
                borderRadius: "var(--r-sm)",
                backgroundColor: "var(--surface)",
                borderColor: openBranch ? "var(--fg-subtle)" : "var(--border)",
                color: "var(--fg)",
              }}
              title="Chọn chi nhánh"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--metal)" }} />
              <span className="truncate max-w-[100px] lg:max-w-[150px]">
                {isAll ? "Tất cả chi nhánh" : activeBranch?.name}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${openBranch ? "rotate-180" : ""}`}
                style={{ color: "var(--fg-subtle)" }}
              />
            </button>
            {openBranch && (
              <div
                className="absolute right-2 sm:right-0 top-full mt-1.5 w-[calc(100vw-1rem)] sm:w-72 max-w-[calc(100vw-1rem)] border overflow-hidden z-40 animate-fadeIn"
                style={{ ...panelStyle, borderRadius: "var(--r)", boxShadow: "var(--shadow-pop)" }}
              >
                <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border-soft)" }}>
                  <div
                    className="text-[10px] uppercase tracking-[0.16em] font-semibold"
                    style={{ color: "var(--fg-subtle)" }}
                  >
                    Phạm vi dữ liệu
                  </div>
                </div>
                <BranchRow
                  icon={Globe}
                  title="Tất cả chi nhánh"
                  sub="Gộp dữ liệu toàn hệ thống"
                  active={isAll}
                  onClick={() => { setBranch("ALL"); setOpenBranch(false); }}
                />
                <div className="h-px" style={{ backgroundColor: "var(--border-soft)" }} />
                <div className="max-h-64 overflow-y-auto">
                  {branches.map((b) => (
                    <BranchRow
                      key={b.id}
                      code={b.code}
                      title={b.name}
                      sub={b.city}
                      active={activeBranchId === b.id}
                      onClick={() => { setBranch(b.id); setOpenBranch(false); }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sáng / tối. Ẩn dưới sm — ở đó dùng mục trong menu người dùng. */}
          <BarButton
            icon={isDark ? Sun : Moon}
            label={themeLabel}
            onClick={toggleTheme}
            className="hidden sm:flex"
          />

          <BarButton
            icon={HelpCircle}
            label="Hướng dẫn sử dụng"
            onClick={() => navigate("/help")}
            className="hidden md:flex"
          />

          {/* Thông báo */}
          <div className="relative" ref={notifRef}>
            <BarButton
              icon={Bell}
              label="Thông báo"
              active={openNotif}
              onClick={() => setOpenNotif(!openNotif)}
            >
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-semibold flex items-center justify-center tnum"
                  style={{
                    backgroundColor: "var(--danger)",
                    color: "var(--surface)",
                    boxShadow: "0 0 0 2px var(--surface)",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </BarButton>
            {openNotif && (
              <div
                className="absolute right-2 sm:right-0 top-full mt-1.5 w-[calc(100vw-1rem)] sm:w-96 max-w-96 border overflow-hidden z-40 animate-fadeIn"
                style={{ ...panelStyle, borderRadius: "var(--r)", boxShadow: "var(--shadow-pop)" }}
              >
                <div
                  className="flex items-center justify-between gap-3 px-4 py-3 border-b"
                  style={{ borderColor: "var(--border-soft)" }}
                >
                  <div>
                    <div
                      className="text-[10px] uppercase tracking-[0.16em] font-semibold"
                      style={{ color: "var(--fg-subtle)" }}
                    >
                      Thông báo
                    </div>
                    <div className="text-[13px] mt-0.5" style={{ color: "var(--fg)" }}>
                      {unreadCount} chưa đọc
                    </div>
                  </div>
                  <button
                    className="text-[12px] hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((n, i) => {
                    const cfg = notifIcons[n.type];
                    const NIcon = cfg.Icon;
                    return (
                      <button
                        key={n.id}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-2)]"
                        style={{ borderTop: i ? "1px solid var(--border-soft)" : "none" }}
                      >
                        <div
                          className="w-8 h-8 border flex items-center justify-center shrink-0"
                          style={{
                            borderRadius: "var(--r-sm)",
                            backgroundColor: `var(--${cfg.tone}-soft)`,
                            color: `var(--${cfg.tone}-fg)`,
                            borderColor: `var(--${cfg.tone}-border)`,
                          }}
                        >
                          <NIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-[13px] font-medium" style={{ color: "var(--fg)" }}>
                              {n.title}
                            </div>
                            {n.unread && (
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                                style={{ backgroundColor: "var(--metal)" }}
                              />
                            )}
                          </div>
                          <div className="text-[12px] mt-0.5 line-clamp-1" style={{ color: "var(--fg-muted)" }}>
                            {n.desc}
                          </div>
                          <div className="text-[11px] mt-1" style={{ color: "var(--fg-subtle)" }}>
                            {n.time}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div
                  className="px-4 py-2.5 border-t"
                  style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-2)" }}
                >
                  <button
                    onClick={() => { setOpenNotif(false); navigate("/notifications"); }}
                    className="w-full text-[12px] font-medium text-left"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Xem tất cả thông báo →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className="hidden md:block w-px h-6 mx-1"
            style={{ backgroundColor: "var(--border)" }}
          />

          {/* Menu người dùng */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setOpenUser(!openUser)}
              className="flex items-center gap-2.5 pl-1 pr-1.5 h-10 sm:h-9 transition-colors"
              style={{
                borderRadius: "var(--r-sm)",
                backgroundColor: openUser ? "var(--surface-3)" : "transparent",
              }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0 border"
                style={{
                  backgroundColor: "var(--surface-3)",
                  borderColor: "var(--metal)",
                  color: "var(--fg-muted)",
                }}
              >
                {initials}
              </span>
              <span className="hidden md:block leading-tight text-left min-w-0">
                <span className="block text-[12px] font-medium truncate" style={{ color: "var(--fg)" }}>
                  {me.name}
                </span>
                <span className="block text-[10px] truncate" style={{ color: "var(--fg-subtle)" }}>
                  {me.role}
                </span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 hidden md:block transition-transform ${openUser ? "rotate-180" : ""}`}
                style={{ color: "var(--fg-subtle)" }}
              />
            </button>
            {openUser && (
              <div
                className="absolute right-2 sm:right-0 top-full mt-1.5 w-[calc(100vw-1rem)] sm:w-64 max-w-64 border overflow-hidden z-40 animate-fadeIn"
                style={{ ...panelStyle, borderRadius: "var(--r)", boxShadow: "var(--shadow-pop)" }}
              >
                <div className="px-4 py-3.5 border-b" style={{ borderColor: "var(--border-soft)" }}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 border"
                      style={{
                        backgroundColor: "var(--surface-3)",
                        borderColor: "var(--metal)",
                        color: "var(--fg-muted)",
                      }}
                    >
                      {initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium truncate" style={{ color: "var(--fg)" }}>
                        {me.name}
                      </div>
                      <div className="text-[11px] truncate" style={{ color: "var(--fg-muted)" }}>
                        {me.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2 text-[10px]">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 h-5 font-medium border"
                      style={{
                        borderRadius: "var(--r-sm)",
                        backgroundColor: "var(--success-soft)",
                        color: "var(--success-fg)",
                        borderColor: "var(--success-border)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--success)" }} />
                      Đang hoạt động
                    </span>
                    <span style={{ color: "var(--fg-subtle)" }}>{me.plan}</span>
                  </div>
                </div>
                <div className="py-1">
                  {/* Bản mobile của nút đổi giao diện — nút icon bị ẩn ở khổ hẹp */}
                  <MenuRow
                    Icon={isDark ? Sun : Moon}
                    label={isDark ? "Giao diện sáng" : "Giao diện tối"}
                    onClick={() => { setOpenUser(false); toggleTheme(); }}
                  />
                  <MenuRow
                    Icon={UserCog}
                    label="Hồ sơ cá nhân"
                    onClick={() => { setOpenUser(false); navigate("/profile"); }}
                  />
                  <MenuRow
                    Icon={CreditCard}
                    label="Thanh toán & gói"
                    onClick={() => { setOpenUser(false); navigate("/profile?tab=billing"); }}
                  />
                  <MenuRow
                    Icon={Settings}
                    label="Cài đặt"
                    onClick={() => { setOpenUser(false); navigate("/settings"); }}
                  />
                </div>
                <div className="border-t py-1" style={{ borderColor: "var(--border-soft)" }}>
                  <MenuRow
                    Icon={LogOut}
                    label="Đăng xuất"
                    danger
                    onClick={() => {
                      setOpenUser(false);
                      logout();
                      navigate("/login", { replace: true });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function BranchRow({ icon: Icon, code, title, sub, active, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[13px] transition-colors"
      style={{
        backgroundColor: active || hover ? "var(--surface-2)" : "transparent",
        boxShadow: active ? "inset 2px 0 0 0 var(--metal)" : "none",
      }}
    >
      {Icon ? (
        <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--fg-muted)" }} />
      ) : (
        <span
          className="w-6 h-6 flex items-center justify-center text-[9px] font-semibold shrink-0 border"
          style={{
            borderRadius: "3px",
            backgroundColor: "var(--surface-3)",
            borderColor: "var(--border)",
            color: "var(--fg-muted)",
          }}
        >
          {code}
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block font-medium truncate" style={{ color: "var(--fg)" }}>{title}</span>
        <span className="block text-[11px] truncate" style={{ color: "var(--fg-muted)" }}>{sub}</span>
      </span>
      {active && <Check className="w-4 h-4 shrink-0" style={{ color: "var(--metal)" }} />}
    </button>
  );
}

function MenuRow({ Icon, label, danger, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="w-full flex items-center gap-2.5 px-4 h-9 text-[13px] transition-colors text-left"
      style={{
        color: danger ? "var(--danger-fg)" : "var(--fg-muted)",
        backgroundColor: hover ? "var(--surface-2)" : "transparent",
      }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
