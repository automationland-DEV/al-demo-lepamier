import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { BranchProvider } from "./context/BranchContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Branches from "./pages/Branches";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Staff from "./pages/Staff";
import Guests from "./pages/Guests";
import Services from "./pages/Services";
import Reports from "./pages/Reports";
import ReportDetail from "./pages/ReportDetail";
import RevenueTimeline from "./pages/RevenueTimeline";
import RevenueStructure from "./pages/RevenueStructure";
import OccupancyByRoom from "./pages/OccupancyByRoom";
import Forecast from "./pages/Forecast";
import TopAgencies from "./pages/TopAgencies";
import PeriodComparison from "./pages/PeriodComparison";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Profile from "./pages/Profile";
import RestaurantOperations from "./pages/RestaurantOperations";
import Marketing from "./pages/Marketing";
import WebsiteOverview from "./pages/WebsiteOverview";
import WebsiteUsers from "./pages/WebsiteUsers";
import Posts from "./pages/Posts";
import PostCategories from "./pages/PostCategories";
/* Bổ sung đợt "đủ nghiệp vụ" — 13 trang lấp các mảng còn thiếu của bản demo */
import RoomTypes from "./pages/RoomTypes";
import Rates from "./pages/Rates";
import MenuPage from "./pages/Menu";
import Inventory from "./pages/Inventory";
import Loyalty from "./pages/Loyalty";
import Reviews from "./pages/Reviews";
import Payroll from "./pages/Payroll";
import Invoices from "./pages/Invoices";
import Receivables from "./pages/Receivables";
import Cashflow from "./pages/Cashflow";
import Promotions from "./pages/Promotions";
import Roles from "./pages/Roles";
import AuditLog from "./pages/AuditLog";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Chatbot from "./components/Chatbot";
import Footer from "./components/Footer";

/* Auth gate — nếu chưa đăng nhập, redirect /login (giữ route hiện tại) */
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Trang app-shell (chat toàn màn hình): main lấy chiều cao tuyệt đối
  // calc(100vh - 61px) thay vì flex-1, vì flex-1 phải dựa vào tổ tiên có
  // "definite height" — ở đây tổ tiên chỉ có min-h-screen (giá trị TỐI THIỂU,
  // không phải cố định) nên chuỗi flex-grow không chặn được nội dung tự giãn.
  // calc(100vh) không phụ thuộc tổ tiên nên luôn đúng, và KHÔNG áp dụng cho
  // các route khác để không đổi cách cuộn hiện có của chúng.
  // 61px = chiều cao thật của Topbar (60px nội dung + 1px border-bottom,
  // đã đo bằng getBoundingClientRect — không phải 60px như class h-[60px] gợi ý).
  const isFullHeightPage = pathname === "/messages";

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg-app)" }}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setMobileOpen(!mobileOpen);
            } else {
              setCollapsed(!collapsed);
            }
          }}
        />
        {/* Trang thường dùng overflow-x-clip chứ không phải hidden: `hidden` khiến
            overflow-y thành `auto`, biến main thành vùng cuộn và làm hỏng mọi
            position:sticky bên trong (mục lục Dashboard, panel Khách tham quan).
            Riêng trang app-shell vẫn giữ overflow-hidden vì nó cố định chiều cao
            và tự quản lý cuộn bên trong. */}
        <main
          className={
            isFullHeightPage
              ? "flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden"
              : "flex-1 p-4 md:p-6 lg:p-8 overflow-x-clip"
          }
          style={isFullHeightPage ? { height: "calc(100vh - 61px)" } : undefined}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="/services" element={<Services />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/detail" element={<ReportDetail />} />
            <Route path="/reports/revenue-timeline" element={<RevenueTimeline />} />
            <Route path="/reports/revenue-structure" element={<RevenueStructure />} />
            <Route path="/reports/occupancy-by-room" element={<OccupancyByRoom />} />
            <Route path="/reports/forecast" element={<Forecast />} />
            <Route path="/reports/top-agencies" element={<TopAgencies />} />
            <Route path="/reports/period-comparison" element={<PeriodComparison />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile"  element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/help" element={<Help />} />
            <Route path="/restaurant-ops" element={<RestaurantOperations />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/website" element={<WebsiteOverview />} />
            <Route path="/website/users" element={<WebsiteUsers />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/post-categories" element={<PostCategories />} />

            {/* Khách sạn */}
            <Route path="/room-types" element={<RoomTypes />} />
            <Route path="/rates" element={<Rates />} />
            {/* Nhà hàng */}
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/inventory" element={<Inventory />} />
            {/* Khách hàng */}
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="/reviews" element={<Reviews />} />
            {/* Nhân sự */}
            <Route path="/payroll" element={<Payroll />} />
            {/* Tài chính */}
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/receivables" element={<Receivables />} />
            <Route path="/cashflow" element={<Cashflow />} />
            {/* Marketing */}
            <Route path="/promotions" element={<Promotions />} />
            {/* Hệ thống */}
            <Route path="/roles" element={<Roles />} />
            <Route path="/audit-log" element={<AuditLog />} />
          </Routes>
          {!isFullHeightPage && (
            <div>
              <Footer />
            </div>
          )}
        </main>
      </div>
      <Chatbot />
    </div>
  );
}

/* Router — login nằm ngoài layout, các trang khác bắt buộc auth */
function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <BranchProvider>
            <AppRouter />
          </BranchProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}