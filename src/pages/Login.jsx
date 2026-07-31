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
        <div className="flex items-center gap-3 mb-8 sm:mb-12 animate-fadeIn">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-display font-extrabold text-[19px] shadow-lg shadow-brand-500/20"
            style={{ background: "linear-gradient(135deg, var(--accent-strong) 0%, var(--accent) 100%)" }}
          >
            LP
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-ink-900 text-[16px] tracking-tight">Le Palmier</div>
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-ink-500">Hospitality Cloud</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-[440px]">
          {/* Heading */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 shadow-sm border"
              style={{ 
                backgroundColor: "var(--accent-soft)", 
                color: "var(--accent-fg)",
                borderColor: "color-mix(in oklab, var(--accent) 20%, transparent)"
              }}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Welcome back · Le Palmier v2.4
            </div>
            <h1 className="font-display font-extrabold text-ink-900 text-[30px] sm:text-[34px] leading-tight tracking-tight">
              Đăng nhập hệ thống
            </h1>
            <p className="text-[13.5px] text-ink-500 mt-2 leading-relaxed">
              Quản trị hợp nhất chuỗi khách sạn, resort, nhà hàng & F&B trên một mặt phẳng duy nhất.
            </p>
          </div>

          {/* Demo account card */}
          <div className="mt-6">
            <div className="text-[10px] uppercase font-bold tracking-widest text-ink-400 mb-2">
              Tài khoản dùng thử (Demo Account)
            </div>
            <div>
              {DEMO_ACCOUNTS.map((acc) => {
                return (
                  <div
                    key={acc.id}
                    onClick={() => pickAccount(acc)}
                    className="w-full rounded-2xl border-2 p-4 text-left transition-all duration-300 shadow-sm bg-gradient-to-r from-brand-50/50 to-indigo-50/30 border-brand-200/80 hover:shadow-md cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-[13px] shrink-0 shadow-md bg-gradient-to-tr from-brand-500 to-indigo-650"
                      >
                        {acc.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink-900 text-[14px]">{acc.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-600 text-white shadow-sm">
                            {acc.badge}
                          </span>
                        </div>
                        <div className="text-[11.5px] text-ink-500 mt-1 font-medium">{acc.role} · {acc.desc}</div>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-ink-400 flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-ink-400" /> Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="email"
                  className="input pl-10 py-2.5 bg-ink-50/50 border-ink-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl text-[13px] transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@lepalmier.vn"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-ink-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-ink-400" /> Mật khẩu truy cập
                </label>
                <button type="button" className="text-[11px] font-bold hover:underline" style={{ color: "var(--accent)" }}>
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type={show ? "text" : "password"}
                  className="input pl-10 pr-10 py-2.5 bg-ink-50/50 border-ink-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl text-[13px] transition-all duration-200 font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900 transition-colors"
                  tabIndex={-1}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember + error */}
            <div className="flex items-center justify-between text-[12px] pt-1">
              <label className="flex items-center gap-2 text-ink-700 cursor-pointer select-none font-medium text-[12.5px]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-ink-300 w-4 h-4 text-brand-600 focus:ring-brand-500"
                  style={{ accentColor: "var(--accent)" }}
                />
                Duy trì đăng nhập 30 ngày
              </label>
              {error && (
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100 animate-pulse">{error}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-[14px] font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] active:scale-95 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, var(--accent-strong) 0%, var(--accent) 100%)",
                boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)"
              }}
            >
              {loading ? (
                <>
                  <span className="w-4.5 h-4.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Đang xác thực tài khoản…
                </>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" /> Đăng nhập hệ thống
                </>
              )}
            </button>

            {/* Quick login */}
            <button
              type="button"
              onClick={() => handleQuickLogin(selected)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-bold border transition-all duration-300 hover:scale-[1.01] active:scale-95 bg-white shadow-sm"
              style={{
                color: "var(--accent)",
                borderColor: "color-mix(in oklab, var(--accent) 30%, transparent)"
              }}
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              Đăng nhập nhanh với tài khoản mẫu
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* SSO */}
          <div className="mt-6">
            <div className="flex items-center gap-3 text-[10px] text-ink-400 uppercase font-bold tracking-widest">
              <span className="flex-1 h-px bg-ink-150" />
              <span>hoặc đăng nhập bằng</span>
              <span className="flex-1 h-px bg-ink-150" />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3.5">
              {[
                { name: "Google",   Icon: Fingerprint, color: "#ea4335" },
                { name: "Microsoft", Icon: ShieldCheck, color: "#0078d4" },
                { name: "SSO/SAML", Icon: KeyRound,    color: "#6366f1" },
              ].map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleQuickLogin(selected)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-ink-200 text-[12.5px] font-semibold bg-white hover:bg-ink-50 hover:border-ink-300 text-ink-700 transition active:scale-95 shadow-sm"
                >
                  <p.Icon className="w-4 h-4" style={{ color: p.color }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-[12px] text-ink-500 font-medium">
            Chưa có tài khoản?{" "}
            <a href="#" className="font-bold hover:underline" style={{ color: "var(--accent)" }}>
              Liên hệ sales
            </a>
            <span className="mx-2 text-ink-300">·</span>
            <a href="#" className="hover:underline text-ink-400">Điều khoản</a>
            <span className="mx-2 text-ink-300">·</span>
            <a href="#" className="hover:underline text-ink-400">Bảo mật</a>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-[10.5px] text-ink-400 text-center mt-8">
          © 2026 Le Palmier Hospitality Group · v2.4.1 · Đồng bộ {new Date().toLocaleDateString("vi-VN")}
        </div>
      </div>

      {/* RIGHT — showcase */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
          alt="Luxury Resort"
          className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 hover:scale-105"
        />

        {/* Dynamic Dark overlay matching the theme's active accent color */}
        <div
          className="absolute inset-0 z-10 transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, color-mix(in oklab, var(--accent-strong) 20%, transparent) 0%, color-mix(in oklab, var(--fg) 50%, transparent) 100%)",
          }}
        />

        {/* Ambient glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl z-10" style={{ backgroundColor: "var(--accent)" }} />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full opacity-10 blur-3xl z-10" style={{ backgroundColor: "var(--accent-soft)" }} />

        <div className="relative z-20 flex flex-col p-8 xl:p-12 text-white w-full h-full justify-between">
          {/* Top brand */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-[16px] text-white">Le Palmier Group</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-white/75">
                Hospitality · F&B · Travel
              </div>
            </div>
          </div>

          {/* Minimal Center Info to highlight the image */}
          <div className="my-auto mx-auto max-w-[500px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg animate-fadeIn -translate-y-12 text-center">
            <h2 className="font-display font-bold text-[28px] leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Quản trị chuỗi khách sạn & F&B trên một mặt phẳng duy nhất.
            </h2>
            <p className="text-[13.5px] text-white/90 mt-2 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Giải pháp tối giản, đồng bộ và chuyên nghiệp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}