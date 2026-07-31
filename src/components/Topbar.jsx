import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Bell, ChevronDown, ChevronRight, HelpCircle, LogOut,
  Settings, Menu, Command, Calendar, Building2, Globe, AlertCircle,
  CheckCircle2, UserCog, CreditCard, Activity, Sun, Moon
} from "lucide-react";
import { useActiveBranch } from "../context/BranchContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { TONE } from "./Semantic";

/* Style dùng lại cho các panel dropdown và nút viền trên topbar */
const panelStyle = { backgroundColor: "var(--surface)", borderColor: "var(--border)" };
const outlineBtnStyle = { backgroundColor: "var(--surface)", borderColor: "var(--border)" };

export default function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [openBranch, setOpenBranch] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const branchRef = useRef(null);
  const { activeBranchId, activeBranch, branches, setBranch, isAll } = useActiveBranch();

  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const themeLabel = isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối";

  // Close dropdowns on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setOpenUser(false);
      if (branchRef.current && !branchRef.current.contains(e.target)) setOpenBranch(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ⌘K keyboard
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
    { id: 1, type: "alert", title: "Booking mới cần xác nhận", desc: "Phòng Villa Sapa — check-in 14/08", time: "2 phút trước", unread: true },
    { id: 2, type: "ok", title: "Check-out hoàn tất", desc: "Đoàn 24 khách — Khu Phú Quốc", time: "15 phút trước", unread: true },
    { id: 3, type: "info", title: "Báo cáo doanh thu tháng 7 đã sẵn sàng", desc: "Tăng 18% so với tháng trước", time: "1 giờ trước", unread: false },
    { id: 4, type: "alert", title: "Phòng B-204 báo sự cố điều hoà", desc: "Cần xử lý trong 30 phút", time: "2 giờ trước", unread: false },
  ];

  const notifIcons = {
    alert: { Icon: AlertCircle, tone: "warning" },
    ok: { Icon: CheckCircle2, tone: "success" },
    info: { Icon: Activity, tone: "info" },
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 border-b" style={panelStyle}>
      <div className="flex items-center gap-2 sm:gap-3 md:gap-3 px-3 md:px-5 h-[60px]">
        {/* Nút mở menu — chỉ dưới lg. Từ lg trở lên sidebar luôn hiện và
            nút thu gọn nằm trong sidebar, ngay cạnh thương hiệu Le Palmier. */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-ink-100 text-ink-600 transition shrink-0 inline-flex items-center justify-center min-h-[40px] min-w-[40px]"
          aria-label="Mở menu điều hướng"
          title="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-1.5 text-[13px] min-w-0">
          <span className="text-ink-500 font-medium">Quản trị</span>
          <ChevronRight className="w-3.5 h-3.5 text-ink-300" />
          <span className="text-ink-900 font-semibold truncate">Dashboard</span>
        </div>

        {/* Mobile title */}
        <div className="md:hidden flex items-center gap-1.5 min-w-0 flex-1">
          <img src="/img/logo.png" alt="" className="h-7 w-auto shrink-0" />
          <span className="font-semibold text-[13px] text-ink-900 truncate">Le Palmier</span>
        </div>

        {/* Center: search */}
        <div className="flex-1 flex justify-center px-2 md:px-4">
          <div className="relative w-full max-w-[520px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              id="topbar-search"
              className="input pl-9 pr-3 md:pr-16 h-9 bg-ink-50 text-[16px] sm:text-[13px]"
              placeholder="Tìm phòng, booking, khách hàng…"
            />
            <kbd className="hidden md:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded border border-ink-200 text-ink-500 bg-ink-100">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Date selector — từ xl trở lên: ở đúng mốc lg (1024px) sidebar chiếm 260px
              nên hàng hành động vượt quá bề ngang khả dụng */}
          <button
            className="hidden xl:flex items-center gap-1.5 h-9 px-2.5 rounded-md border text-ink-700 text-[13px] hover:border-ink-400 transition"
            style={outlineBtnStyle}
          >
            <Calendar className="w-3.5 h-3.5 text-ink-500" />
            <span className="font-medium">28/07 – 03/08</span>
          </button>

          {/* Branch switcher (topbar mini) */}
          <div className="relative" ref={branchRef}>
            <button
              onClick={() => setOpenBranch(!openBranch)}
              className="hidden sm:flex items-center gap-1.5 h-9 px-2.5 rounded-md border text-[13px] text-ink-700 hover:border-ink-400 transition"
              style={outlineBtnStyle}
              title="Chọn chi nhánh"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--accent)" }} />
              <span className="font-semibold truncate max-w-[100px] lg:max-w-[140px]">
                {isAll ? "Tất cả chi nhánh" : activeBranch?.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-ink-400 transition-transform ${openBranch ? "rotate-180" : ""}`} />
            </button>
            {openBranch && (
              <div
                className="absolute right-2 sm:right-0 top-full mt-1.5 w-[calc(100vw-1rem)] sm:w-72 max-w-[calc(100vw-1rem)] rounded-lg shadow-pop border overflow-hidden z-40"
                style={panelStyle}
              >
                <div className="px-3 py-2 border-b border-ink-100">
                  <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                    Phạm vi dữ liệu
                  </div>
                </div>
                <button
                  onClick={() => { setBranch("ALL"); setOpenBranch(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-ink-50 text-[13px] ${isAll ? "bg-ink-50" : ""}`}
                >
                  <Globe className="w-4 h-4 text-ink-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900">Tất cả chi nhánh</div>
                    <div className="text-[11px] text-ink-500">Gộp dữ liệu toàn hệ thống</div>
                  </div>
                  {isAll && <CheckCircle2 className="w-4 h-4" style={{ color: "var(--accent)" }} />}
                </button>
                <div className="h-px bg-ink-100" />
                <div className="max-h-64 overflow-y-auto">
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => { setBranch(b.id); setOpenBranch(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-ink-50 text-[13px] ${
                        activeBranchId === b.id ? "bg-ink-50" : ""
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                        style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
                      >
                        {b.code}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink-900 truncate">{b.name}</div>
                        <div className="text-[11px] text-ink-500">{b.city}</div>
                      </div>
                      {activeBranchId === b.id && <CheckCircle2 className="w-4 h-4" style={{ color: "var(--accent)" }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Đổi giao diện sáng / tối.
              Ẩn dưới sm vì topbar mobile đã chật — ở đó dùng mục trong menu người dùng. */}
          <button
            onClick={toggleTheme}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-md hover:bg-ink-100 text-ink-600 transition active:scale-95"
            title={themeLabel}
            aria-label={themeLabel}
            aria-pressed={isDark}
          >
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          {/* Help */}
          <button
            onClick={() => navigate("/help")}
            className="hidden md:flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-md hover:bg-ink-100 text-ink-600 transition"
            title="Hướng dẫn sử dụng"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif(!openNotif)}
              className={`relative flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-md transition ${
                openNotif ? "bg-ink-100 text-ink-900" : "hover:bg-ink-100 text-ink-600"
              }`}
              title="Thông báo"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ring-2"
                  style={{
                    backgroundColor: "var(--danger)",
                    color: "var(--on-accent)",
                    "--tw-ring-color": "var(--surface)",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            {openNotif && (
              <div
                className="absolute right-2 sm:right-0 top-full mt-1.5 w-[calc(100vw-1rem)] sm:w-96 max-w-96 rounded-lg shadow-pop border overflow-hidden z-40"
                style={panelStyle}
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink-100">
                  <div>
                    <div className="text-[13px] font-semibold text-ink-900">Thông báo</div>
                    <div className="text-[11px] text-ink-500">{unreadCount} chưa đọc</div>
                  </div>
                  <button className="text-[11px] font-semibold hover:underline" style={{ color: "var(--accent)" }}>
                    Đánh dấu đã đọc
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-ink-100">
                  {notifications.map((n) => {
                    const cfg = notifIcons[n.type];
                    const NIcon = cfg.Icon;
                    const t = TONE[cfg.tone];
                    return (
                      <button
                        key={n.id}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-ink-50 transition"
                      >
                        <div
                          className="w-8 h-8 rounded-md border flex items-center justify-center shrink-0"
                          style={{ backgroundColor: t.bg, color: t.fg, borderColor: t.border }}
                        >
                          <NIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-[13px] font-semibold text-ink-900">{n.title}</div>
                            {n.unread && (
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                                style={{ backgroundColor: "var(--accent)" }}
                              />
                            )}
                          </div>
                          <div className="text-[12px] text-ink-500 mt-0.5 line-clamp-1">{n.desc}</div>
                          <div className="text-[11px] text-ink-400 mt-1">{n.time}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t border-ink-100 bg-ink-50">
                  <button
                    onClick={() => { setOpenNotif(false); navigate("/notifications"); }}
                    className="w-full text-[12px] font-semibold text-ink-700 hover:text-ink-900"
                  >
                    Xem tất cả thông báo →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider - chỉ hiện từ md+ */}
          <div className="hidden md:block w-px h-6 bg-ink-200 mx-1" />

          {/* User menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setOpenUser(!openUser)}
              className={`flex items-center gap-2 sm:gap-2.5 pl-1 pr-1.5 h-10 sm:h-9 rounded-md transition ${
                openUser ? "bg-ink-100" : "hover:bg-ink-100"
              }`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
              >
                NV
              </div>
              <div className="hidden md:block leading-tight text-left min-w-0">
                <div className="text-[12px] font-semibold text-ink-900 truncate">Nguyễn Văn A</div>
                <div className="text-[10px] text-ink-500 truncate">Quản trị viên</div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-ink-400 hidden md:block transition-transform ${openUser ? "rotate-180" : ""}`} />
            </button>
            {openUser && (
              <div
                className="absolute right-2 sm:right-0 top-full mt-1.5 w-[calc(100vw-1rem)] sm:w-64 max-w-64 rounded-lg shadow-pop border overflow-hidden z-40"
                style={panelStyle}
              >
                <div className="px-3 py-3 border-b border-ink-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                      style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
                    >
                      NV
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-ink-900 truncate">Nguyễn Văn A</div>
                      <div className="text-[11px] text-ink-500 truncate">nguyen.a@lepalmier.vn</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold border"
                      style={{
                        backgroundColor: "var(--success-soft)",
                        color: "var(--success-fg)",
                        borderColor: "var(--success-border)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--success)" }} />
                      Đang hoạt động
                    </span>
                    <span className="text-ink-400">·</span>
                    <span className="text-ink-500">4 chi nhánh</span>
                  </div>
                </div>
                <div className="py-1">
                  {/* Bản mobile của nút đổi giao diện — nút icon bị ẩn ở khổ hẹp */}
                  <MenuItem
                    Icon={isDark ? Sun : Moon}
                    label={isDark ? "Giao diện sáng" : "Giao diện tối"}
                    onClick={() => { setOpenUser(false); toggleTheme(); }}
                  />
                  <MenuItem
                    Icon={UserCog}
                    label="Hồ sơ cá nhân"
                    onClick={() => { setOpenUser(false); navigate("/profile"); }}
                  />
                  <MenuItem
                    Icon={CreditCard}
                    label="Thanh toán & gói"
                    onClick={() => { setOpenUser(false); navigate("/profile?tab=billing"); }}
                  />
                  <MenuItem
                    Icon={Settings}
                    label="Cài đặt"
                    onClick={() => { setOpenUser(false); navigate("/settings"); }}
                  />
                </div>
                <div className="border-t border-ink-100 py-1">
                  <MenuItem
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

function MenuItem({ Icon, label, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] transition hover:bg-ink-50"
      style={danger ? { color: "var(--danger-fg)" } : undefined}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className={`font-medium ${danger ? "" : "text-ink-700"}`}>{label}</span>
    </button>
  );
}
