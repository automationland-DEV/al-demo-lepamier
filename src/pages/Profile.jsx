import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";
import { StatusPill, AccentPill, Trend } from "../components/Semantic";

const {
  User, Mail, Phone, MapPin, Calendar, Briefcase, Shield, Key, Save,
  Camera, Bell, Globe, Lock, Smartphone, LogOut, Trash2, Upload,
  CheckCircle2, Activity, Award, Clock, Building2, CreditCard,
  Eye, EyeOff, Edit2, FileText, Download, MoreHorizontal, Sparkles,
  Star, Crown, Heart, BadgeCheck, Wallet, Languages, Moon, Settings,
  AlertCircle,
} = Icons;

export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  const user = {
    name: "Nguyễn Văn A",
    username: "nguyen.a",
    email: "nguyen.a@condohub.vn",
    phone: "+84 987 654 321",
    role: "Giám đốc vận hành",
    roleLevel: "Admin",
    status: "active",
    avatar: "NV",
    bio: "Quản lý chuỗi 4 chi nhánh Condo HUB từ 2019. Đam mê F&B, hospitality & data-driven decisions.",
    location: "TP. Hồ Chí Minh, Việt Nam",
    timezone: "GMT+7 (Hà Nội)",
    language: "Tiếng Việt",
    joined: "01/03/2019",
    lastLogin: "29/07/2026 09:24 từ Chrome · HCM",
    emailVerified: true,
    phoneVerified: true,
    twoFA: true,
    plan: "Enterprise · 4 chi nhánh",
    planRenew: "15/03/2027",
  };

  const TABS = [
    { id: "overview", label: "Tổng quan", Icon: User },
    { id: "security", label: "Bảo mật", Icon: Shield },
    { id: "activity", label: "Hoạt động", Icon: Activity },
    { id: "billing", label: "Thanh toán", Icon: CreditCard },
    { id: "preferences", label: "Tuỳ chỉnh", Icon: Sparkles },
  ];

  return (
    <div className="max-w-[1320px] mx-auto pb-12 px-3 sm:px-4 lg:px-6">
      <PageHeader
        title="Hồ sơ cá nhân"
        subtitle="Quản lý thông tin tài khoản, bảo mật và quyền truy cập"
        actions={
          <>
            <button className="btn-outline" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4" /> Cài đặt hệ thống
            </button>
            <button className="btn-primary">
              <Save className="w-4 h-4" /> Lưu thay đổi
            </button>
          </>
        }
      />

      {/* Hero card */}
      <Card className="!p-0 overflow-hidden mb-5">
        {/* Cover */}
        <div className="relative h-32 sm:h-40" style={{
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)"
        }}>
          <div className="absolute inset-0 bg-soft-grid opacity-30" />
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: "var(--accent)" }} />
          <div className="absolute bottom-2 right-3 left-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-white/80">
              <Crown className="w-3 h-3" />
              {user.role} · Toàn quyền
            </div>
            <div className="flex items-center gap-1.5">
              <StatusPill tone="success" icon={BadgeCheck}>Đang hoạt động</StatusPill>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/15 text-white text-[10px] font-bold border border-white/20">
                <Sparkles className="w-2.5 h-2.5" /> Pro
              </span>
            </div>
          </div>
        </div>

        {/* Avatar + basic info */}
        <div className="px-4 sm:px-6 pb-5">
          <div className="flex items-end gap-3 sm:gap-4 -mt-10 sm:-mt-14 flex-wrap sm:flex-nowrap">
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 flex items-center justify-center text-white font-display font-bold text-[30px] sm:text-[42px] shadow-pop"
                style={{
                  backgroundColor: "var(--accent)",
                  borderColor: "var(--surface)",
                }}
              >
                {user.avatar}
              </div>
              <button
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md border-2 transition"
                style={{
                  backgroundColor: "var(--accent)",
                  borderColor: "var(--surface)",
                }}
                title="Đổi ảnh đại diện"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 min-w-0 sm:pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-ink-900 text-[20px] sm:text-[26px] truncate">{user.name}</h1>
                {user.emailVerified && <BadgeCheck className="w-5 h-5 shrink-0" style={{ color: "var(--accent)" }} />}
              </div>
              <div className="text-[12.5px] text-ink-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-ink-700">@{user.username}</span>
                <span className="hidden sm:inline">·</span>
                <Mail className="w-3 h-3" /> <span className="truncate">{user.email}</span>
                <span className="hidden sm:inline">·</span>
                <Phone className="w-3 h-3" /> {user.phone}
              </div>
              <div className="text-[11.5px] text-ink-500 mt-1 flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-3 h-3" /> {user.location}
                <span className="hidden sm:inline">·</span>
                <Calendar className="w-3 h-3" /> Gia nhập {user.joined}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:pb-2 w-full sm:w-auto">
              <button className="btn-outline flex-1 sm:flex-none" onClick={() => setEditing(!editing)}>
                <Edit2 className="w-4 h-4" /> {editing ? "Đang sửa" : "Chỉnh sửa"}
              </button>
              <button className="btn-outline !p-2 shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2 mt-4 sm:mt-5">
            <Stat Icon={Building2} label="Chi nhánh" value="4" sub="LP1 · LP2 · LP3 · LP4" />
            <Stat Icon={Activity} label="Hoạt động 30d" value="186" sub="actions" trend="+24" />
            <Stat Icon={Award} label="Thành tích" value="12" sub="huy hiệu" />
            <Stat Icon={Clock} label="Đăng nhập cuối" value="2 phút" sub="trước" />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t" style={{ borderColor: "var(--border-soft)" }}>
          <div className="flex items-center gap-1 px-3 sm:px-5 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-semibold border-b-2 transition whitespace-nowrap -mb-px"
                style={
                  tab === t.id
                    ? { borderColor: "var(--accent)", color: "var(--accent)" }
                    : { borderColor: "transparent", color: "var(--fg-muted)" }
                }
              >
                <t.Icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tab content */}
      {tab === "overview"   && <OverviewTab  user={user} editing={editing} />}
      {tab === "security"   && <SecurityTab  user={user} show2FA={show2FA} setShow2FA={setShow2FA} />}
      {tab === "activity"   && <ActivityTab />}
      {tab === "billing"    && <BillingTab   user={user} />}
      {tab === "preferences" && <PreferencesTab />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */

function Stat({ Icon, label, value, sub, trend }) {
  return (
    <div
      className="rounded-md border p-2.5 flex items-center gap-2.5"
      style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}
    >
      <div
        className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-ink-500">{label}</div>
        <div className="font-display font-bold text-ink-900 text-[15px] tabular-nums flex items-center gap-1.5">
          {value}
          {trend && <Trend value={Number(trend)} size="sm" />}
        </div>
        <div className="text-[10px] text-ink-500 truncate">{sub}</div>
      </div>
    </div>
  );
}

function OverviewTab({ user, editing }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
      <div className="lg:col-span-2 space-y-3 sm:space-y-5">
        <Card title="Thông tin cơ bản" subtitle="Thông tin hiển thị trên hệ thống">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field Icon={User} label="Họ và tên" value={user.name} editing={editing} />
            <Field Icon={BadgeCheck} label="Tên đăng nhập" value={`@${user.username}`} editing={editing} />
            <Field Icon={Mail} label="Email" value={user.email} verified={user.emailVerified} editing={editing} />
            <Field Icon={Phone} label="Số điện thoại" value={user.phone} verified={user.phoneVerified} editing={editing} />
            <Field Icon={Briefcase} label="Chức vụ" value={user.role} editing={editing} />
            <Field Icon={Shield} label="Quyền" value={user.roleLevel} editing={editing} />
            <Field Icon={MapPin} label="Địa điểm" value={user.location} editing={editing} />
            <Field Icon={Calendar} label="Ngày gia nhập" value={user.joined} disabled />
          </div>

          <div className="mt-4">
            <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500">Giới thiệu</label>
            <textarea
              className="input mt-1.5 min-h-[80px]"
              defaultValue={user.bio}
              disabled={!editing}
            />
          </div>
        </Card>

        <Card title="Chi nhánh phụ trách" subtitle={`${user.role} · 4 chi nhánh`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { code: "LP1", name: "Condo HUB Sài Gòn",   role: "Giám đốc", occ: 92, rev: "12.4 tỷ" },
              { code: "LP2", name: "Condo HUB Đà Lạt",    role: "Quản lý",  occ: 78, rev: "4.8 tỷ" },
              { code: "LP3", name: "Condo HUB Phú Quốc",  role: "Quản lý",  occ: 96, rev: "18.2 tỷ" },
              { code: "LP4", name: "Condo HUB Nha Trang", role: "Quản lý",  occ: 82, rev: "8.5 tỷ" },
            ].map((b) => (
              <div
                key={b.code}
                className="rounded-md border p-3 flex items-center gap-3"
                style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}
              >
                <div
                  className="w-11 h-11 rounded-md text-white flex items-center justify-center font-bold text-[12px] shrink-0"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {b.code}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-[13px] truncate">{b.name}</div>
                  <div className="text-[10.5px] text-ink-500">{b.role} · {b.rev} doanh thu</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-ink-500">Occ</div>
                  <div className="font-bold text-ink-900 tabular-nums">{b.occ}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-3 sm:space-y-5">
        <Card title="Huy hiệu">
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
            {[
              { Icon: Crown, label: "Founder", tone: "warning" },
              { Icon: Star, label: "Top 1 Q3", tone: "info" },
              { Icon: Award, label: "10 năm", tone: "highlight" },
              { Icon: BadgeCheck, label: "Verified", tone: "success" },
              { Icon: Heart, label: "Customer Care", tone: "danger" },
              { Icon: Sparkles, label: "Innovator", tone: "info" },
            ].map((b, i) => (
              <div
                key={i}
                className="rounded-md border p-2 flex flex-col items-center gap-1 text-center"
                style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `var(--${b.tone}-soft)`,
                    color: `var(--${b.tone}-fg)`,
                  }}
                >
                  <b.Icon className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-semibold text-ink-900">{b.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Liên hệ">
          <div className="space-y-2 text-[12.5px]">
            <ContactRow Icon={Mail} label="Email" value={user.email} />
            <ContactRow Icon={Phone} label="Điện thoại" value={user.phone} />
            <ContactRow Icon={MapPin} label="Địa chỉ" value={user.location} />
            <ContactRow Icon={Globe} label="Múi giờ" value={user.timezone} />
            <ContactRow Icon={Languages} label="Ngôn ngữ" value={user.language} />
            <ContactRow Icon={Clock} label="Đăng nhập cuối" value={user.lastLogin} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function SecurityTab({ user, show2FA, setShow2FA }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
      <div className="lg:col-span-2 space-y-3 sm:space-y-5">
        <Card title="Mật khẩu" subtitle="Cập nhật lần cuối 24 ngày trước">
          <div className="space-y-3">
            <PasswordField label="Mật khẩu hiện tại" />
            <PasswordField label="Mật khẩu mới" placeholder="Tối thiểu 8 ký tự" />
            <PasswordField label="Xác nhận mật khẩu mới" />
          </div>
          <div className="mt-4 flex items-center justify-between gap-2 p-3 rounded-md border"
            style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}>
            <div className="flex items-center gap-2 text-[12px]">
              <CheckCircle2 className="w-4 h-4" style={{ color: "var(--success)" }} />
              <span className="text-ink-700">Mật khẩu mạnh — đạt 4/5 tiêu chí</span>
            </div>
            <button className="btn-primary">
              <Key className="w-4 h-4" /> Đổi mật khẩu
            </button>
          </div>
        </Card>

        <Card title="Xác thực 2 yếu tố (2FA)" subtitle="Tăng cường bảo mật bằng lớp bảo vệ thứ hai">
          <div className="flex items-start gap-3 p-3 rounded-md border"
            style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}>
            <div
              className="w-12 h-12 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-ink-900 text-[13px]">Authenticator App</div>
              <div className="text-[11.5px] text-ink-500 mt-0.5">
                {user.twoFA ? "Đang bật · Google Authenticator · 1Password" : "Chưa cấu hình"}
              </div>
              {user.twoFA && (
                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {[6, 4, 8, 2, 9].map((n, i) => (
                    <div
                      key={i}
                      className="h-9 rounded-md flex items-center justify-center font-mono font-bold tabular-nums"
                      style={{ backgroundColor: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border)" }}
                    >
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              className="btn-outline"
              onClick={() => setShow2FA(!show2FA)}
            >
              {user.twoFA ? "Tắt" : "Bật"}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <SmsRow Icon={Mail} label="Email xác nhận" enabled={user.emailVerified} />
            <SmsRow Icon={Phone} label="SMS OTP" enabled={user.phoneVerified} />
          </div>
        </Card>

        <Card title="Thiết bị đang đăng nhập" subtitle="2 thiết bị hoạt động">
          <div className="space-y-2">
            {[
              { device: "MacBook Pro 16 · Chrome",       loc: "TP. HCM, Việt Nam",   ip: "113.161.x.x",    current: true,  time: "Đang hoạt động" },
              { device: "iPhone 15 Pro · Safari iOS",    loc: "TP. HCM, Việt Nam",   ip: "113.161.x.x",    current: false, time: "2 giờ trước" },
              { device: "iPad Air · Safari",              loc: "Đà Lạt, Việt Nam",   ip: "14.241.x.x",     current: false, time: "3 ngày trước" },
            ].map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-md border"
                style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}
              >
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-[13px] flex items-center gap-2 flex-wrap">
                    {d.device}
                    {d.current && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold"
                        style={{ backgroundColor: "var(--success-soft)", color: "var(--success-fg)" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--success)" }} />
                        Thiết bị này
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-ink-500">{d.loc} · IP {d.ip} · {d.time}</div>
                </div>
                {!d.current && (
                  <button className="btn-outline !py-1.5 !px-2.5 !text-[11px]" title="Đăng xuất">
                    <LogOut className="w-3 h-3" /> Đăng xuất
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-3 sm:space-y-5">
        <Card title="Trạng thái bảo mật">
          <div className="text-center py-2">
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center font-display font-bold text-[28px] mb-2"
              style={{
                backgroundColor: "var(--success-soft)",
                color: "var(--success-fg)",
                border: "4px solid var(--success)",
              }}
            >
              96
            </div>
            <div className="font-semibold text-ink-900">Rất tốt</div>
            <div className="text-[11px] text-ink-500">4/5 tiêu chí đạt</div>
          </div>
          <div className="space-y-1.5 mt-3">
            {[
              { l: "Mật khẩu mạnh", ok: true },
              { l: "2FA bật",       ok: true },
              { l: "Email xác thực", ok: true },
              { l: "SĐT xác thực",   ok: true },
              { l: "Thiết bị tin cậy", ok: false },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                {c.ok
                  ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
                  : <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--warning)" }} />
                }
                <span className={c.ok ? "text-ink-900" : "text-ink-500"}>{c.l}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Lịch sử bảo mật">
          <div className="space-y-2">
            {[
              { color: "success", icon: Key,        title: "Đổi mật khẩu",          time: "05/07" },
              { color: "info",    icon: Smartphone, title: "Bật 2FA",                time: "21/06" },
              { color: "info",    icon: Shield,     title: "Đăng nhập mới · iPhone", time: "18/06" },
              { color: "warning", icon: AlertCircle, title: "Cảnh báo đăng nhập lạ", time: "02/06" },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `var(--${e.color}-soft)`,
                    color: `var(--${e.color}-fg)`,
                  }}
                >
                  <e.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-ink-900 truncate">{e.title}</div>
                </div>
                <div className="text-[10.5px] text-ink-500 tabular-nums">{e.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ActivityTab() {
  const events = [
    { icon: FileText, color: "info",      title: "Đã xem báo cáo Doanh thu tháng 7",                time: "29/07 09:24", context: "Reports" },
    { icon: Edit2,    color: "warning",   title: "Chỉnh sửa đơn đặt phòng #BK-2418",                time: "29/07 09:10", context: "Bookings" },
    { icon: CheckCircle2, color: "success", title: "Xác nhận check-in đoàn 24 khách",                time: "29/07 08:42", context: "Front desk" },
    { icon: Mail,     color: "info",      title: "Gửi email campaign Hè rực rỡ",                    time: "29/07 08:15", context: "Marketing" },
    { icon: User,     color: "accent",    title: "Thêm khách hàng Trần Văn Nam",                    time: "28/07 17:30", context: "Guests" },
    { icon: Star,     color: "warning",   title: "Phản hồi review 5★ từ Sarah Lee",                  time: "28/07 16:45", context: "Reviews" },
    { icon: Activity, color: "info",      title: "Mở dashboard doanh thu",                          time: "28/07 16:20", context: "Dashboard" },
    { icon: LogOut,   color: "neutral",   title: "Đăng xuất khỏi iPad",                             time: "28/07 16:00", context: "Auth" },
    { icon: Key,      color: "danger",    title: "Đăng nhập mới từ iPhone 15 Pro",                   time: "28/07 14:32", context: "Auth" },
    { icon: Sparkles, color: "highlight", title: "Sử dụng AI forecast Q3",                           time: "28/07 11:08", context: "Reports" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
      <div className="lg:col-span-2 space-y-3 sm:space-y-5">
        <Card title="Lịch sử hoạt động" subtitle="Hoạt động gần đây của bạn trên hệ thống">
          <div className="space-y-1.5">
            {events.map((e, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2 rounded-md border"
                style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}
              >
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: e.color === "accent" ? "var(--accent-soft)" : `var(--${e.color}-soft)`,
                    color: e.color === "accent" ? "var(--accent)" : `var(--${e.color}-fg)`,
                  }}
                >
                  <e.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-ink-900 truncate">{e.title}</div>
                  <div className="text-[10.5px] text-ink-500">{e.context} · {e.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-3 sm:space-y-5">
        <Card title="Thống kê 30 ngày">
          <div className="space-y-3">
            <StatBar label="Đăng nhập"      value={48}  max={60} tone="accent" />
            <StatBar label="Thao tác CRM"   value={86}  max={120} tone="info" />
            <StatBar label="Báo cáo đã xem" value={32}  max={40} tone="success" />
            <StatBar label="Chiến dịch gửi" value={12}  max={20} tone="warning" />
            <StatBar label="Lỗi / Đăng xuất" value={2}  max={20} tone="danger" />
          </div>
        </Card>

        <Card title="Giờ hoạt động">
          <div className="grid grid-cols-12 gap-1 h-20">
            {[3,8,12,18,22,28,34,42,38,32,18,8].map((v, i) => (
              <div key={i} className="flex items-end">
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${v * 2.2}px`,
                    backgroundColor: i === 8 ? "var(--accent)" : "var(--accent-soft)",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-1 text-[9px] text-ink-500">
            <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
          </div>
          <div className="text-[10px] text-ink-500 mt-2">Giờ cao điểm: 9h–11h sáng</div>
        </Card>
      </div>
    </div>
  );
}

function StatBar({ label, value, max, tone }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-[11px]">
        <span className="text-ink-700 font-semibold">{label}</span>
        <span className="text-ink-500 tabular-nums">{value}<span className="text-ink-300">/{max}</span></span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: `var(--${tone})` }} />
      </div>
    </div>
  );
}

function BillingTab({ user }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
      <div className="lg:col-span-2 space-y-3 sm:space-y-5">
        <Card title="Gói hiện tại" subtitle="Đang sử dụng">
          <div
            className="rounded-md p-4 border-2"
            style={{
              background: "linear-gradient(135deg, var(--accent-soft), var(--surface))",
              borderColor: "var(--accent)",
            }}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5" style={{ color: "var(--accent)" }} />
                  <span className="font-display font-bold text-ink-900 text-[16px]">{user.plan}</span>
                  <AccentPill>Pro</AccentPill>
                </div>
                <div className="text-[11px] text-ink-500 mt-1">
                  Gia hạn tiếp: <b className="text-ink-700">{user.planRenew}</b> · Tự động
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-ink-500 font-bold">Thanh toán hàng năm</div>
                <div className="font-display font-bold text-ink-900 text-[22px] tabular-nums">12.000.000đ</div>
                <div className="text-[10px] text-ink-500">~1.000.000đ/tháng · tiết kiệm 20%</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              <Quota Icon={Building2} label="Chi nhánh" used="4" max="4" />
              <Quota Icon={Users}      label="Nhân viên" used="48" max="100" />
              <Quota Icon={FileText}   label="Storage"  used="68" max="100" unit="GB" />
              <Quota Icon={Activity}   label="API call" used="186K" max="500K" />
            </div>
          </div>
        </Card>

        <Card title="Lịch sử thanh toán" subtitle="6 hoá đơn gần nhất">
          <div className="overflow-x-auto -mx-4 sm:-mx-5">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr>
                  <th className="table-th">Mã</th>
                  <th className="table-th">Ngày</th>
                  <th className="table-th hidden sm:table-cell">Mô tả</th>
                  <th className="table-th text-right">Số tiền</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "INV-2607", date: "15/07/2026", desc: "Gói Enterprise · 12 tháng",    amount: "12.000.000đ", status: "paid" },
                  { id: "INV-2507", date: "15/07/2025", desc: "Gói Enterprise · 12 tháng",    amount: "12.000.000đ", status: "paid" },
                  { id: "INV-2407", date: "15/07/2024", desc: "Gói Pro · 12 tháng",           amount: "6.800.000đ",  status: "paid" },
                  { id: "INV-2401", date: "12/01/2024", desc: "Add-on 10 nhân viên",           amount: "2.400.000đ",  status: "paid" },
                  { id: "INV-2310", date: "08/10/2023", desc: "Setup tích hợp POS",            amount: "4.500.000đ",  status: "paid" },
                  { id: "INV-2307", date: "15/07/2023", desc: "Gói Pro · 12 tháng",           amount: "6.800.000đ",  status: "paid" },
                ].map((r) => (
                  <tr key={r.id} className="hover:bg-ink-50 transition">
                    <td className="table-td font-mono text-[11.5px] font-bold text-ink-900 whitespace-nowrap">{r.id}</td>
                    <td className="table-td text-ink-700 whitespace-nowrap">{r.date}</td>
                    <td className="table-td text-ink-700 hidden sm:table-cell">{r.desc}</td>
                    <td className="table-td text-right font-bold tabular-nums whitespace-nowrap">{r.amount}</td>
                    <td className="table-td">
                      <StatusPill tone="success">Đã thanh toán</StatusPill>
                    </td>
                    <td className="table-td">
                      <button className="text-ink-500 hover:text-ink-900" title="Tải hoá đơn PDF">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="space-y-3 sm:space-y-5">
        <Card title="Phương thức thanh toán">
          <div className="space-y-2">
            {[
              { brand: "VISA", last: "4242", exp: "08/29", def: true },
              { brand: "MC",   last: "8888", exp: "04/28", def: false },
            ].map((c, i) => (
              <div
                key={i}
                className="rounded-md border p-3 flex items-center gap-3"
                style={{
                  backgroundColor: c.def ? "var(--accent-soft)" : "var(--surface-2)",
                  borderColor: c.def ? "var(--accent)" : "var(--border-soft)",
                }}
              >
                <div
                  className="w-11 h-7 rounded-sm flex items-center justify-center font-bold text-[11px] text-white"
                  style={{ backgroundColor: "var(--ink-900)", background: "linear-gradient(135deg, #1f2531, #434b5c)" }}
                >
                  {c.brand}
                </div>
                <div className="flex-1">
                  <div className="font-mono text-[12px] text-ink-900">•••• {c.last}</div>
                  <div className="text-[10px] text-ink-500">Hết hạn {c.exp}</div>
                </div>
                {c.def ? <StatusPill tone="accent">Mặc định</StatusPill> : (
                  <button className="text-ink-500 hover:text-ink-900"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                )}
              </div>
            ))}
            <button className="btn-outline w-full mt-1">
              <CreditCard className="w-4 h-4" /> Thêm thẻ mới
            </button>
          </div>
        </Card>

        <Card title="Địa chỉ hoá đơn">
          <div
            className="rounded-md border p-3 text-[12px]"
            style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}
          >
            <div className="font-semibold text-ink-900">Cty CP Condo HUB Group</div>
            <div className="text-ink-500 mt-1 leading-relaxed">
              88 Lê Duẩn, P. Bến Nghé,<br />
              Quận 1, TP. Hồ Chí Minh<br />
              MST: 0312-456-789
            </div>
          </div>
          <button className="btn-outline w-full mt-2">
            <Edit2 className="w-4 h-4" /> Cập nhật
          </button>
        </Card>
      </div>
    </div>
  );
}

function Quota({ Icon, label, used, max, unit }) {
  const pct = Math.min(100, parseFloat(used) / parseFloat(max) * 100);
  const tone = pct >= 90 ? "danger" : pct >= 70 ? "warning" : "success";
  return (
    <div
      className="rounded-md border p-2.5"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-soft)" }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3" style={{ color: "var(--accent)" }} />
        <span className="text-[10px] uppercase font-bold text-ink-500">{label}</span>
      </div>
      <div className="font-display font-bold text-ink-900 tabular-nums text-[13px]">
        {used}<span className="text-ink-400 text-[11px]">/{max}{unit}</span>
      </div>
      <div className="h-1 mt-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: `var(--${tone})` }} />
      </div>
    </div>
  );
}

function PreferencesTab() {
  const channels = [
    { Icon: Mail,      label: "Email",          desc: "Báo cáo, summary", enabled: true },
    { Icon: Bell,      label: "Push",           desc: "Notification realtime", enabled: true },
    { Icon: Smartphone, label: "SMS",            desc: "Booking cần xác nhận", enabled: false },
    { Icon: Activity,  label: "In-app",          desc: "Tin nhắn trong app", enabled: true },
    { Icon: Languages, label: "Ngôn ngữ",        desc: "Tiếng Việt", enabled: true },
    { Icon: Moon,      label: "Chế độ tối",     desc: "Theo hệ thống", enabled: false },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
      <Card title="Các kênh nhận thông báo">
        <div className="space-y-1.5">
          {channels.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-3 p-2.5 rounded-md border"
              style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
              >
                <c.Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900 text-[13px]">{c.label}</div>
                <div className="text-[10.5px] text-ink-500">{c.desc}</div>
              </div>
              <ToggleSwitch on={c.enabled} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Tùy chọn cá nhân">
        <div className="space-y-3">
          <div>
            <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500">Ngôn ngữ</label>
            <select className="input mt-1.5">
              <option>Tiếng Việt</option>
              <option>English</option>
              <option>日本語</option>
              <option>한국어</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500">Múi giờ</label>
            <select className="input mt-1.5">
              <option>GMT+7 (Hà Nội · HCM)</option>
              <option>GMT+8 (Singapore)</option>
              <option>GMT+9 (Tokyo)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500">Định dạng ngày</label>
            <select className="input mt-1.5">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500">Tiền tệ</label>
            <select className="input mt-1.5">
              <option>VND · đ</option>
              <option>USD · $</option>
              <option>EUR · €</option>
            </select>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-soft)" }}>
          <button className="btn-outline !text-rose-700 !border-rose-200 hover:!bg-rose-50 w-full">
            <Trash2 className="w-4 h-4" /> Xoá tài khoản vĩnh viễn
          </button>
        </div>
      </Card>
    </div>
  );
}

function ToggleSwitch({ on }) {
  return (
    <button
      className="relative inline-flex h-6 w-11 items-center rounded-full transition"
      style={{ backgroundColor: on ? "var(--accent)" : "var(--border)" }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════ */

function Field({ Icon, label, value, verified, editing, disabled }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-[11px] uppercase font-bold tracking-wider text-ink-500">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
        {verified && <BadgeCheck className="w-3 h-3" style={{ color: "var(--success)" }} />}
      </label>
      <input
        className="input mt-1.5"
        defaultValue={value}
        disabled={!editing || disabled}
      />
    </div>
  );
}

function PasswordField({ label, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          type={show ? "text" : "password"}
          className="input pr-9"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function ContactRow({ Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase font-bold text-ink-500 leading-none">{label}</div>
        <div className="text-ink-900 font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}

function SmsRow({ Icon, label, enabled }) {
  return (
    <div
      className="flex items-center gap-2.5 p-2.5 rounded-md border"
      style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}
    >
      <Icon className="w-4 h-4 text-ink-700" />
      <div className="flex-1 text-[13px] font-semibold text-ink-900">{label}</div>
      {enabled ? <StatusPill tone="success">Đã xác thực</StatusPill> : <StatusPill tone="warning">Chưa</StatusPill>}
    </div>
  );
}
