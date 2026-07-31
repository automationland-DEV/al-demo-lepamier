import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Icons } from "../components/Icons";
import { branches, rooms, staff, dashboardStats } from "../data/mockData";

const {
  Mail, Lock, Eye, EyeOff, LogIn, Sparkles, ShieldCheck, Building2,
  CheckCircle2, ArrowRight, Activity, Zap, Globe, KeyRound, Fingerprint,
  BedDouble, Users, Crown, MapPin, Star, AlertCircle, Sun, Moon,
} = Icons;

/* Tài khoản demo — hệ thống không có backend, mọi mật khẩu đều được chấp nhận */
const DEMO_ACCOUNT = {
  id: "admin",
  email: "admin@lepalmier.vn",
  password: "lepalmier2026",
  name: "Nguyễn Văn A",
  role: "Giám đốc vận hành",
  desc: "Toàn quyền · 4 chi nhánh",
  avatar: "NV",
  badge: "Admin",
};

const FEATURES = [
  { Icon: ShieldCheck, label: "2FA & SSO",      desc: "Bảo mật đa lớp" },
  { Icon: Activity,    label: "Realtime BI",    desc: "Đồng bộ mỗi 30s" },
  { Icon: Sparkles,    label: "AI Forecast",    desc: "Dự báo doanh thu" },
  { Icon: Globe,       label: "Multi-branch",   desc: "Một tài khoản, mọi chi nhánh" },
];

const SSO_PROVIDERS = [
  { name: "Google",    Icon: Fingerprint },
  { name: "Microsoft", Icon: ShieldCheck },
  { name: "SSO/SAML",  Icon: KeyRound },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

const formatCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));

export default function Login() {
  const navigate = useNavigate();
  const { login, DEMO_USER } = useAuth();
  const { theme, setTheme } = useTheme();

  const [email, setEmail] = useState(DEMO_ACCOUNT.email);
  const [password, setPassword] = useState(DEMO_ACCOUNT.password);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slide, setSlide] = useState(0);

  /* Ảnh showcase lấy trực tiếp từ dữ liệu chi nhánh */
  const showcase = useMemo(
    () =>
      branches.map((b) => ({
        id: b.id,
        image: b.image,
        name: b.name,
        city: b.city,
        region: b.region,
        type: b.type,
        rating: b.rating,
      })),
    []
  );

  const stats = useMemo(
    () => [
      { Icon: Building2, value: String(branches.length), label: "Chi nhánh" },
      { Icon: BedDouble, value: formatCount(rooms.length), label: "Phòng & căn" },
      { Icon: Users, value: formatCount(staff.length), label: "Nhân sự" },
      { Icon: Activity, value: `${dashboardStats.occupancyRate}%`, label: "Lấp đầy" },
    ],
    []
  );

  /* Tự chuyển ảnh chi nhánh — dừng lại nếu người dùng tắt hiệu ứng chuyển động */
  useEffect(() => {
    if (showcase.length < 2 || prefersReducedMotion()) return;
    const timer = setInterval(
      () => setSlide((s) => (s + 1) % showcase.length),
      5200
    );
    return () => clearInterval(timer);
  }, [showcase.length]);

  const active = showcase[slide] ?? showcase[0];

  const signIn = (payload) => {
    setLoading(true);
    setTimeout(() => {
      login({ ...DEMO_USER, ...payload });
      setLoading(false);
      navigate("/", { replace: true });
    }, 650);
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (loading) return;

    if (!email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email chưa đúng định dạng, ví dụ: ten@lepalmier.vn");
      return;
    }
    if (password.length < 4) {
      setError("Mật khẩu phải có tối thiểu 4 ký tự.");
      return;
    }

    setError("");
    signIn({
      email: email.trim(),
      name: DEMO_ACCOUNT.name,
      avatar: DEMO_ACCOUNT.avatar,
      role: DEMO_ACCOUNT.role,
    });
  };

  const handleQuickLogin = () => {
    if (loading) return;
    setError("");
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    signIn({
      email: DEMO_ACCOUNT.email,
      name: DEMO_ACCOUNT.name,
      avatar: DEMO_ACCOUNT.avatar,
      role: DEMO_ACCOUNT.role,
    });
  };

  const trackCaps = (e) => setCapsOn(e.getModifierState?.("CapsLock") === true);

  const themeToggle = (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={theme === "dark" ? "Giao diện sáng" : "Giao diện tối"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border transition active:scale-95"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--fg-muted)",
      }}
    >
      {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );

  const brandMark = (
    <div className="flex items-center gap-3">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-display text-[18px] font-extrabold shadow-lg"
        style={{
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
          color: "var(--on-accent)",
          boxShadow: "0 8px 22px color-mix(in oklab, var(--accent) 35%, transparent)",
        }}
      >
        LP
      </div>
      <div className="min-w-0 leading-tight">
        <div className="truncate font-display text-[16px] font-bold tracking-tight" style={{ color: "var(--fg)" }}>
          Le Palmier
        </div>
        <div className="truncate text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "var(--fg-subtle)" }}>
          Hospitality Cloud
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden lg:flex-row"
      style={{ backgroundColor: "var(--bg-app)" }}
    >
      {/* ── Nền trang trí: 2 quầng sáng + lưới chấm mờ ────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-floatSoft absolute -left-24 -top-32 h-[380px] w-[380px] rounded-full blur-3xl"
          style={{ backgroundColor: "var(--accent)", opacity: 0.14 }}
        />
        <div
          className="absolute -bottom-40 left-[18%] h-[420px] w-[420px] rounded-full blur-3xl"
          style={{ backgroundColor: "var(--highlight)", opacity: 0.1 }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--fg) 12%, transparent) 1px, transparent 0)",
            backgroundSize: "22px 22px",
            opacity: 0.5,
            maskImage: "radial-gradient(ellipse at 25% 0%, #000 0%, transparent 65%)",
            WebkitMaskImage: "radial-gradient(ellipse at 25% 0%, #000 0%, transparent 65%)",
          }}
        />
      </div>

      {/* ══ MOBILE HERO — chỉ hiện dưới lg ═════════════════════════ */}
      <header className="relative h-[220px] w-full shrink-0 overflow-hidden sm:h-[280px] lg:hidden">
        <img
          src={active.image}
          alt={`Ảnh ${active.name}`}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--accent-strong) 62%, transparent) 0%, rgba(8,12,20,.5) 42%, var(--surface) 100%)",
          }}
        />
        <div
          className="relative flex h-full flex-col justify-between px-5 pb-12 sm:px-8"
          style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/15 shadow-sm backdrop-blur-md">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="font-display text-[15px] font-bold text-white">Le Palmier</div>
                <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/75">
                  Hospitality Cloud
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white backdrop-blur-md transition active:scale-95"
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                <MapPin className="h-2.5 w-2.5" /> {active.city}
              </div>
              <div className="mt-1.5 truncate font-display text-[17px] font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.6)]">
                {active.name}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-md">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
              {active.rating}
            </div>
          </div>
        </div>
      </header>

      {/* ══ CỘT FORM ═══════════════════════════════════════════════ */}
      <div
        className="relative z-10 -mt-7 flex w-full flex-1 flex-col rounded-t-[28px] border-t px-5 pt-7 sm:px-8 lg:mt-0 lg:max-w-[620px] lg:rounded-none lg:border-t-0 lg:bg-transparent lg:px-12 lg:py-10"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-soft)",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
        }}
      >
        {/* Thanh trên — chỉ desktop, mobile đã có trong hero */}
        <div className="mb-10 hidden items-center justify-between gap-3 lg:flex">
          {brandMark}
          {themeToggle}
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center">
          {/* ── Tiêu đề ── */}
          <div className="animate-fadeIn">
            <div
              className="mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: "var(--accent-soft)",
                color: "var(--accent-fg)",
                borderColor: "color-mix(in oklab, var(--accent) 25%, transparent)",
              }}
            >
              <Sparkles className="h-3.5 w-3.5" /> Chào mừng trở lại · v2.4
            </div>
            <h1
              className="font-display text-[28px] font-extrabold leading-tight tracking-tight sm:text-[34px]"
              style={{ color: "var(--fg)" }}
            >
              Đăng nhập hệ thống
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              Quản trị hợp nhất chuỗi khách sạn, resort và F&amp;B trên một mặt phẳng duy nhất.
            </p>
          </div>

          {/* ── Thẻ tài khoản demo ── */}
          <div className="animate-slideUp mt-6" style={{ animationDelay: "60ms" }}>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--fg-subtle)" }}>
              Tài khoản dùng thử
            </div>
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              className="group w-full rounded-2xl border p-3.5 text-left transition duration-300 active:scale-[.99] disabled:opacity-60 sm:p-4"
              style={{
                backgroundColor: "var(--accent-soft)",
                borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold shadow-md"
                  style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
                    color: "var(--on-accent)",
                  }}
                >
                  {DEMO_ACCOUNT.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="truncate text-[14px] font-bold" style={{ color: "var(--fg)" }}>
                      {DEMO_ACCOUNT.name}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
                    >
                      {DEMO_ACCOUNT.badge}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-[11.5px] font-medium" style={{ color: "var(--fg-muted)" }}>
                    {DEMO_ACCOUNT.role} · {DEMO_ACCOUNT.desc}
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 shrink-0 transition group-hover:scale-110" style={{ color: "var(--accent)" }} />
              </div>
            </button>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate className="animate-slideUp mt-6 space-y-4" style={{ animationDelay: "120ms" }}>
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--fg-subtle)" }}
              >
                <Mail className="h-3.5 w-3.5" /> Địa chỉ email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "var(--fg-subtle)" }}
                />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="input h-12 rounded-xl pl-10 text-[16px] sm:h-11 sm:text-[13.5px]"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="ten@lepalmier.vn"
                  aria-invalid={Boolean(error)}
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  htmlFor="login-password"
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: "var(--fg-subtle)" }}
                >
                  <Lock className="h-3.5 w-3.5" /> Mật khẩu
                </label>
                <button type="button" className="text-[11px] font-bold hover:underline" style={{ color: "var(--accent)" }}>
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "var(--fg-subtle)" }}
                />
                <input
                  id="login-password"
                  name="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  className="input h-12 rounded-xl pl-10 pr-12 text-[16px] sm:h-11 sm:text-[13.5px]"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyUp={trackCaps}
                  onKeyDown={trackCaps}
                  onBlur={() => setCapsOn(false)}
                  placeholder="••••••••"
                  aria-invalid={Boolean(error)}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg transition active:scale-90"
                  style={{ color: "var(--fg-subtle)" }}
                  tabIndex={-1}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {capsOn && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "var(--warning-fg)" }}>
                  <AlertCircle className="h-3 w-3" /> Đang bật Caps Lock
                </div>
              )}
            </div>

            {/* Thông báo lỗi — khối riêng, không chèn cạnh checkbox */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[12.5px] font-semibold"
                style={{
                  backgroundColor: "var(--danger-soft)",
                  borderColor: "var(--danger-border)",
                  color: "var(--danger-fg)",
                }}
              >
                <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                <span className="min-w-0">{error}</span>
              </div>
            )}

            {/* Ghi nhớ đăng nhập */}
            <label className="flex cursor-pointer select-none items-center gap-2.5 py-1 text-[12.5px] font-medium" style={{ color: "var(--fg)" }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 shrink-0 rounded"
                style={{ accentColor: "var(--accent)" }}
              />
              Duy trì đăng nhập trong 30 ngày
            </label>

            {/* Nút chính */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl px-4 py-3.5 text-[14px] font-bold shadow-lg transition duration-300 active:scale-[.98] disabled:opacity-70 sm:py-3"
              style={{
                /* accent → accent-hover: ở dark mode --accent-strong là sắc độ SÁNG hơn,
                   dùng nó sẽ tạo nút nhạt màu, chữ trắng không đọc được */
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
                color: "var(--on-accent)",
                boxShadow: "0 10px 26px color-mix(in oklab, var(--accent) 32%, transparent)",
              }}
            >
              {!loading && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 -left-1/4 w-1/4 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/35 to-transparent blur-[2px]"
                  style={{ animation: "shine 3.6s ease-in-out infinite" }}
                />
              )}
              <span className="relative inline-flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Đang xác thực…
                  </>
                ) : (
                  <>
                    <LogIn className="h-[18px] w-[18px]" /> Đăng nhập hệ thống
                  </>
                )}
              </span>
            </button>

            {/* Đăng nhập nhanh */}
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border py-3.5 text-[13.5px] font-bold transition duration-300 active:scale-[.98] disabled:opacity-70 sm:py-3"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--accent)",
                borderColor: "color-mix(in oklab, var(--accent) 32%, transparent)",
              }}
            >
              <Zap className="h-4 w-4" />
              Đăng nhập nhanh tài khoản mẫu
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* ── SSO ── */}
          <div className="animate-slideUp mt-6" style={{ animationDelay: "180ms" }}>
            <div
              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--fg-subtle)" }}
            >
              <span className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
              <span>hoặc tiếp tục với</span>
              <span className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
            </div>
            <div className="mt-3.5 grid grid-cols-3 gap-2.5 sm:gap-3">
              {SSO_PROVIDERS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={handleQuickLogin}
                  disabled={loading}
                  className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-[11.5px] font-semibold transition active:scale-95 disabled:opacity-70 sm:flex-row sm:gap-1.5 sm:text-[12.5px]"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--fg)",
                  }}
                >
                  <p.Icon className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Chân trang ── */}
          <div className="mt-6 text-center text-[12px] font-medium" style={{ color: "var(--fg-muted)" }}>
            Chưa có tài khoản?{" "}
            <a href="#" className="font-bold hover:underline" style={{ color: "var(--accent)" }}>
              Liên hệ sales
            </a>
            <span className="mx-2" style={{ color: "var(--fg-subtle)" }}>·</span>
            <a href="#" className="hover:underline" style={{ color: "var(--fg-subtle)" }}>Điều khoản</a>
            <span className="mx-2" style={{ color: "var(--fg-subtle)" }}>·</span>
            <a href="#" className="hover:underline" style={{ color: "var(--fg-subtle)" }}>Bảo mật</a>
          </div>
        </div>

        <div className="mt-8 text-center text-[10.5px]" style={{ color: "var(--fg-subtle)" }}>
          © 2026 Le Palmier Hospitality Group · v2.4.1
        </div>
      </div>

      {/* ══ SHOWCASE — chỉ từ lg trở lên ═══════════════════════════ */}
      <aside className="relative hidden flex-1 overflow-hidden lg:flex">
        {showcase.map((item, i) => (
          <img
            key={item.id}
            src={item.image}
            alt={`Ảnh ${item.name}`}
            aria-hidden={i !== slide}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out"
            style={{ opacity: i === slide ? 1 : 0 }}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--accent-strong) 55%, transparent) 0%, rgba(8,12,20,.35) 45%, rgba(8,12,20,.82) 100%)",
          }}
        />
        <div
          className="animate-floatSoft absolute -right-28 -top-28 h-[360px] w-[360px] rounded-full blur-3xl"
          style={{ backgroundColor: "var(--accent)", opacity: 0.28 }}
        />

        <div className="relative flex h-full w-full flex-col justify-between p-8 text-white xl:p-12">
          {/* Thương hiệu */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/15 shadow-sm backdrop-blur-md">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[16px] font-bold">Le Palmier Group</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">
                Hospitality · F&amp;B · Travel
              </div>
            </div>
          </div>

          {/* Khối nội dung giữa */}
          <div className="max-w-[520px]">
            <h2 className="font-display text-[30px] font-bold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,.5)] xl:text-[36px]">
              Vận hành cả chuỗi resort<br />trên một mặt phẳng duy nhất.
            </h2>
            <p className="mt-3 max-w-[440px] text-[13.5px] leading-relaxed text-white/85">
              Đặt phòng, buồng phòng, nhân sự, F&amp;B và báo cáo — hợp nhất theo thời gian thực,
              phân quyền tới từng chi nhánh.
            </p>

            <div className="mt-7 grid max-w-[480px] grid-cols-2 gap-2.5">
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-md"
                >
                  <f.Icon className="h-4 w-4 shrink-0 text-white/90" />
                  <div className="min-w-0 leading-tight">
                    <div className="truncate text-[12.5px] font-bold">{f.label}</div>
                    <div className="truncate text-[10.5px] text-white/70">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chỉ số + caption chi nhánh */}
          <div>
            <div className="grid max-w-[520px] grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-md">
                  <s.Icon className="mb-1.5 h-4 w-4 text-white/80" />
                  <div className="font-display text-[19px] font-bold leading-none tabular-nums">{s.value}</div>
                  <div className="mt-1 truncate text-[10.5px] text-white/70">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider backdrop-blur-md">
                  <MapPin className="h-2.5 w-2.5" /> {active.city} · {active.region}
                </div>
                <div className="mt-1.5 truncate font-display text-[16px] font-bold">{active.name}</div>
                <div className="truncate text-[11.5px] text-white/70">{active.type}</div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {showcase.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSlide(i)}
                    aria-label={`Xem ${item.name}`}
                    aria-current={i === slide}
                    className="h-1.5 rounded-full bg-white transition-all duration-300"
                    style={{ width: i === slide ? 26 : 10, opacity: i === slide ? 1 : 0.45 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
