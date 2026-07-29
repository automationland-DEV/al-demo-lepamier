import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Icons } from "../components/Icons";
import { StatusPill } from "../components/Semantic";

const {
  Mail, Lock, Eye, EyeOff, LogIn, Sparkles, ShieldCheck,
  Building2, Crown, CheckCircle2, ArrowRight, Bell, Activity,
  BadgeCheck, Star, Zap, Globe, KeyRound, Fingerprint, Coffee,
  Wifi, Car, Dumbbell, Trees, Compass, ChevronRight,
  BedDouble, Users,
} = Icons;

const DEMO_ACCOUNTS = [
  {
    id: "admin",
    email: "admin@lepalmier.vn",
    password: "••••••••",
    role: "Giám đốc vận hành",
    avatar: "NV",
    name: "Nguyễn Văn A",
    desc: "Full quyền · 4 chi nhánh",
    tone: "accent",
    badge: "Admin",
  },
  {
    id: "manager",
    email: "manager.pq@lepalmier.vn",
    password: "••••••••",
    role: "Quản lý chi nhánh",
    avatar: "TL",
    name: "Trần Linh",
    desc: "Phú Quốc · LP3",
    tone: "info",
    badge: "Manager",
  },
  {
    id: "staff",
    email: "staff.sg@lepalmier.vn",
    password: "••••••••",
    role: "Lễ tân",
    avatar: "PV",
    name: "Phạm Vy",
    desc: "Sài Gòn · LP1 · ca sáng",
    tone: "success",
    badge: "Staff",
  },
];

const STATS = [
  { Icon: Building2, value: "4",      label: "Chi nhánh"      },
  { Icon: BedDouble, value: "682",    label: "Phòng"          },
  { Icon: Users,     value: "48",     label: "Nhân viên"      },
  { Icon: Activity,  value: "98.4%",  label: "Uptime"         },
];

const FEATURES = [
  { Icon: ShieldCheck, label: "2FA & SSO",              desc: "Bảo mật đa lớp"          },
  { Icon: Activity,    label: "Realtime BI",            desc: "Dashboard 30s sync"      },
  { Icon: Sparkles,    label: "AI Forecast",            desc: "Dự báo doanh thu Q+1"    },
  { Icon: Globe,       label: "Multi-branch",           desc: "1 tài khoản · 4 chi nhánh" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, DEMO_USER } = useAuth();
  const [selected, setSelected] = useState(DEMO_ACCOUNTS[0]);
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pickAccount = (acc) => {
    setSelected(acc);
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }
    setError("");
    setLoading(true);
    // Mock authenticate — chấp nhận bất kỳ mật khẩu nào >= 4 ký tự
    setTimeout(() => {
      login({
        ...DEMO_USER,
        email,
        name: selected.name,
        avatar: selected.avatar,
        role: selected.role,
      });
      setLoading(false);
      navigate("/", { replace: true });
    }, 700);
  };

  const handleQuickLogin = (acc) => {
    setSelected(acc);
    setEmail(acc.email);
    setPassword(acc.password);
    setLoading(true);
    setTimeout(() => {
      login({
        ...DEMO_USER,
        email: acc.email,
        name: acc.name,
        avatar: acc.avatar,
        role: acc.role,
      });
      setLoading(false);
      navigate("/", { replace: true });
    }, 500);
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ backgroundColor: "var(--bg-app)" }}
    >
      {/* LEFT — form */}
      <div className="flex-1 flex flex-col px-5 sm:px-10 py-8 sm:py-10 max-w-full lg:max-w-[640px] w-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 sm:mb-12">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-bold text-[18px] shadow-pop"
            style={{ backgroundColor: "var(--accent)" }}
          >
            LP
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-ink-900 text-[15px]">Le Palmier</div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-ink-500">Hospitality Cloud</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-[440px]">
          {/* Heading */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
              style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)" }}>
              <Sparkles className="w-3 h-3" /> Welcome back · v2.4
            </div>
            <h1 className="font-display font-bold text-ink-900 text-[28px] sm:text-[32px] leading-tight">
              Đăng nhập vào hệ thống quản trị
            </h1>
            <p className="text-[14px] text-ink-500 mt-1.5">
              Quản lý chuỗi khách sạn · F&B · marketing & CSKH trên một nền tảng duy nhất
            </p>
          </div>

          {/* Demo accounts chips */}
          <div className="mt-5">
            <div className="text-[10.5px] uppercase font-bold tracking-wider text-ink-500 mb-2">
              Demo · chọn nhanh tài khoản mẫu
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isActive = selected.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => pickAccount(acc)}
                    className="rounded-md border p-2.5 text-left transition"
                    style={{
                      backgroundColor: isActive ? "var(--accent-soft)" : "var(--surface)",
                      borderColor: isActive ? "var(--accent)" : "var(--border)",
                      borderWidth: isActive ? "2px" : "1px",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-md text-white flex items-center justify-center font-bold text-[11px] shrink-0"
                        style={{ backgroundColor: `var(--${acc.tone})` }}
                      >
                        {acc.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-ink-900 text-[12.5px] truncate">{acc.name}</div>
                        <div className="text-[10px] text-ink-500 truncate">{acc.role}</div>
                      </div>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--accent)" }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {/* Email */}
            <div>
              <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </label>
              <input
                type="email"
                className="input mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@lepalmier.vn"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase font-bold tracking-wider text-ink-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Mật khẩu
                </label>
                <button type="button" className="text-[11px] font-semibold hover:underline" style={{ color: "var(--accent)" }}>
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  type={show ? "text" : "password"}
                  className="input pr-9 font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900"
                  tabIndex={-1}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember + error */}
            <div className="flex items-center justify-between text-[12px]">
              <label className="flex items-center gap-1.5 text-ink-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: "var(--accent)" }}
                />
                Duy trì đăng nhập 30 ngày
              </label>
              {error && (
                <span className="text-rose-700 font-semibold">{error}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center !py-2.5 !text-[14px] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Đang xác thực…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Đăng nhập
                </>
              )}
            </button>

            {/* Quick login — nút lớn demo */}
            <button
              type="button"
              onClick={() => handleQuickLogin(selected)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-[13px] font-bold border-2 transition"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--accent)",
                color: "var(--accent)",
              }}
            >
              <Zap className="w-4 h-4" />
              Đăng nhập nhanh với tài khoản mẫu
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* SSO */}
          <div className="mt-5">
            <div className="flex items-center gap-3 text-[10.5px] text-ink-400 uppercase font-bold tracking-wider">
              <span className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
              <span>hoặc đăng nhập với</span>
              <span className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { name: "Google",   Icon: Fingerprint, color: "#ea4335" },
                { name: "Microsoft", Icon: ShieldCheck, color: "#0078d4" },
                { name: "SSO/SAML", Icon: KeyRound,    color: "#6366f1" },
              ].map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleQuickLogin(selected)}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-md border text-[12px] font-semibold hover:border-ink-900 transition"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}
                >
                  <p.Icon className="w-3.5 h-3.5" style={{ color: p.color }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-[11px] text-ink-500">
            Chưa có tài khoản?{" "}
            <a href="#" className="font-bold hover:underline" style={{ color: "var(--accent)" }}>
              Liên hệ sales
            </a>
            <span className="mx-2">·</span>
            <a href="#" className="hover:underline">Điều khoản</a>
            <span className="mx-2">·</span>
            <a href="#" className="hover:underline">Bảo mật</a>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-[10.5px] text-ink-400 text-center mt-6">
          © 2026 Le Palmier Hospitality Group · v2.4.1 · Đồng bộ {new Date().toLocaleDateString("vi-VN")}
        </div>
      </div>

      {/* RIGHT — showcase */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
        }}>
        <div className="absolute inset-0 bg-soft-grid opacity-25" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: "#fff" }} />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: "#fcd34d" }} />

        <div className="relative z-10 flex flex-col p-8 xl:p-12 text-white w-full">
          {/* Top brand */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Crown className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-[16px]">Le Palmier Group</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-white/70">
                Hospitality · F&B · Travel
              </div>
            </div>
          </div>

          {/* Hero copy */}
          <div className="flex-1 flex flex-col justify-center max-w-[520px]">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[10.5px] uppercase font-bold tracking-wider w-fit mb-4">
              <Sparkles className="w-3 h-3" /> #1 Hospitality Cloud Việt Nam
            </div>
            <h2 className="font-display font-bold text-[36px] xl:text-[44px] leading-tight">
              Quản trị chuỗi khách sạn, F&B & marketing — một mặt phẳng duy nhất.
            </h2>
            <p className="text-[14px] text-white/80 mt-3 leading-relaxed">
              Đồng bộ 4 chi nhánh · 682 phòng · 48 nhân viên · AI forecast · realtime BI. Tất cả chỉ trong một dashboard.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mt-6">
              {STATS.map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-md p-3">
                  <s.Icon className="w-4 h-4 mb-1.5 text-white/80" />
                  <div className="font-display font-bold text-[20px] tabular-nums leading-none">{s.value}</div>
                  <div className="text-[10px] text-white/70 uppercase tracking-wider font-semibold mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Feature list */}
            <div className="grid grid-cols-2 gap-2 mt-5">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-start gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-md p-2.5">
                  <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center shrink-0">
                    <f.Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[12.5px]">{f.label}</div>
                    <div className="text-[10.5px] text-white/70">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-lg p-4 mt-6">
            <div className="flex items-center gap-1 mb-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-300 text-amber-300" />
              ))}
            </div>
            <p className="text-[12.5px] text-white/90 leading-relaxed italic">
              &ldquo;Từ khi dùng Le Palmier Cloud, occupancy tăng 24%, chi phí OTA giảm 38%. Tôi đã cắt 2 phần mềm riêng lẻ và gộp về một nền tảng duy nhất.&rdquo;
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">HS</div>
              <div className="flex-1">
                <div className="text-[12px] font-bold">Hoàng Sơn</div>
                <div className="text-[10px] text-white/70">CEO · Nha Trang Coast Hotels</div>
              </div>
              <StatusPill tone="accent">Verified</StatusPill>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between mt-6 text-[10.5px] text-white/70">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> SOC2 · ISO 27001 · GDPR
            </div>
            <div className="flex items-center gap-3">
              <span>Tiếng Việt</span>
              <span>·</span>
              <span>GMT+7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}