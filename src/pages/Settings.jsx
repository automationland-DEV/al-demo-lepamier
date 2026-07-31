import { useState } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";
import { useTheme, ACCENTS, DENSITIES, FONT_SIZES } from "../context/ThemeContext";
import { StatusPill, AccentPill, Trend, ToneBox, ToneDot, ToneAlert } from "../components/Semantic";

const {
  User, Bell, Shield, Globe, CreditCard, Palette, Save,
  Sun, Moon, Check, RotateCcw, Layout, Zap, Type,
  Sparkles, BarChart3, ShieldCheck, Eye, Layers, Server,
} = Icons;

const SECTIONS = [
  {
    id: "account", icon: User, title: "Thông tin tài khoản", desc: "Cập nhật thông tin cá nhân và ảnh đại diện",
    fields: [
      { label: "Họ và tên", value: "Nguyễn Quản Lý" },
      { label: "Email", value: "admin@lepalmier.vn" },
      { label: "Số điện thoại", value: "0987654321" },
      { label: "Chức vụ", value: "Giám đốc vận hành" },
    ],
  },
  {
    id: "notif", icon: Bell, title: "Thông báo", desc: "Cấu hình các kênh nhận thông báo",
    fields: [
      { label: "Email thông báo", type: "toggle", on: true },
      { label: "Push notification", type: "toggle", on: true },
      { label: "SMS cho booking mới", type: "toggle", on: false },
      { label: "Báo cáo tuần", type: "toggle", on: true },
    ],
  },
  {
    id: "sec", icon: Shield, title: "Bảo mật", desc: "Mật khẩu, xác thực 2 yếu tố",
    fields: [
      { label: "Đổi mật khẩu", type: "button", btn: "Đổi ngay" },
      { label: "Xác thực 2 yếu tố", type: "toggle", on: true },
      { label: "Thiết bị đang đăng nhập", type: "button", btn: "Quản lý" },
    ],
  },
  {
    id: "lang", icon: Globe, title: "Ngôn ngữ & Múi giờ", desc: "Cấu hình hiển thị",
    fields: [
      { label: "Ngôn ngữ", type: "select", options: ["Tiếng Việt", "English", "日本語", "한국어"] },
      { label: "Múi giờ", type: "select", options: ["GMT+7 (Hà Nội)", "GMT+8 (Singapore)", "GMT+9 (Tokyo)"] },
      { label: "Định dạng ngày", type: "select", options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
    ],
  },
  {
    id: "pay", icon: CreditCard, title: "Thanh toán", desc: "Cấu hình cổng thanh toán và hóa đơn",
    fields: [
      { label: "VNPay", type: "toggle", on: true },
      { label: "Momo", type: "toggle", on: true },
      { label: "Stripe (quốc tế)", type: "toggle", on: true },
      { label: "Tiền tệ mặc định", type: "select", options: ["VND", "USD", "EUR"] },
    ],
  },
];

export default function Settings() {
  const [active, setActive] = useState("account");
  const sec = SECTIONS.find((s) => s.id === active) || SECTIONS[0];

  return (
    <div className="max-w-[1320px] mx-auto pb-12 px-3 sm:px-4 lg:px-6">
      <PageHeader
        title="Cài đặt hệ thống"
        subtitle="Quản lý tài khoản, bảo mật, giao diện và cấu hình ứng dụng"
        actions={
          <button className="btn-primary"><Save className="w-4 h-4" /> Lưu thay đổi</button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">
        {/* Side nav */}
        <Card className="lg:col-span-3 h-fit lg:sticky lg:top-4">
          <div className="px-1 mb-2.5 text-[10px] uppercase tracking-wider font-bold text-ink-500">
            Danh mục
          </div>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition text-left ${
                  active === s.id ? "" : "hover:bg-ink-50"
                }`}
                style={
                  active === s.id
                    ? { backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)" }
                    : { color: "var(--fg-muted)" }
                }
              >
                <s.icon className="w-4 h-4" />
                {s.title}
              </button>
            ))}
          </nav>
          <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border-soft)" }}>
            <div className="px-1 mb-2.5 text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--fg-muted)" }}>
              Giao diện
            </div>
            <button
              onClick={() => setActive("appearance")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition text-left ${
                active === "appearance" ? "" : "hover:bg-ink-50"
              }`}
              style={
                active === "appearance"
                  ? { backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)" }
                  : { color: "var(--fg-muted)" }
              }
            >
              <Palette className="w-4 h-4" />
              Tuỳ chỉnh giao diện
            </button>
          </div>
        </Card>

        {/* Sections */}
        <div className="lg:col-span-9 space-y-5">
          {active === "appearance" ? (
            <AppearancePanel />
          ) : (
            <Card>
              <div className="flex items-start gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <sec.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-ink-900">{sec.title}</h3>
                  <p className="text-xs text-ink-500 mt-0.5">{sec.desc}</p>
                </div>
              </div>
              <div className="space-y-4">
                {sec.fields.map((f, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 items-center">
                    <label className="text-[13px] font-medium text-ink-700">{f.label}</label>
                    <div className="md:col-span-2">
                      {f.type === "toggle" ? (
                        <button
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            f.on ? "" : ""
                          }`}
                          style={{ backgroundColor: f.on ? "var(--accent)" : "var(--border)" }}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              f.on ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      ) : f.type === "button" ? (
                        <button className="btn-outline">{f.btn}</button>
                      ) : f.type === "select" ? (
                        <select className="input">
                          {(Array.isArray(f.options) ? f.options : []).map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input className="input" defaultValue={f.value} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   APPEARANCE PANEL — 3 tab con: Màu / Bố cục / Nâng cao
   Đổi theme phản ánh TOÀN BỘ hệ thống (đã wired CSS var)
   ═══════════════════════════════════════════════════════════ */
function AppearancePanel() {
  const [tab, setTab] = useState("color");
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <Palette className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-ink-900">Tuỳ chỉnh giao diện</h3>
            <p className="text-xs text-ink-500 mt-0.5">
              Thay đổi màu chủ đạo, chế độ sáng/tối, mật độ và cỡ chữ — <b>áp dụng toàn hệ thống</b>
            </p>
          </div>
          <ReloadTheme />
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 border-b" style={{ borderColor: "var(--border-soft)" }}>
          {[
            { id: "color",   label: "Màu sắc",         Icon: Palette },
            { id: "layout",  label: "Bố cục",          Icon: Layout  },
            { id: "advanced",label: "Nâng cao",        Icon: Zap     },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-semibold border-b-2 transition -mb-px"
              style={
                tab === t.id
                  ? { borderColor: "var(--accent)", color: "var(--accent)" }
                  : { borderColor: "transparent", color: "var(--fg-muted)" }
              }
            >
              <t.Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
        <div className="pt-4">
          {tab === "color" && <ColorConfig />}
          {tab === "layout" && <LayoutConfig />}
          {tab === "advanced" && <AdvancedConfig />}
        </div>
      </Card>

      <LivePreview />
    </div>
  );
}

/* Nhỏ: nút reset theme */
function ReloadTheme() {
  const { reset } = useTheme();
  return (
    <button
      className="btn-outline"
      onClick={reset}
      title="Khôi phục mặc định"
    >
      <RotateCcw className="w-4 h-4" /> Khôi phục mặc định
    </button>
  );
}

function ColorConfig() {
  const { theme, accent, setTheme, setAccent } = useTheme();
  return (
    <div className="space-y-5">
      {/* Mode */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5 text-ink-500">
          Chế độ hiển thị
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "light", label: "Sáng", desc: "Phù hợp ban ngày · nền trắng", Icon: Sun },
            { id: "dark",  label: "Tối",  desc: "Dễ chịu cho mắt ban đêm",       Icon: Moon },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setTheme(m.id)}
              className={`p-4 rounded-lg border-2 text-left transition flex items-center gap-3 ${
                theme === m.id ? "" : "hover:border-ink-300"
              }`}
              style={{
                backgroundColor: "var(--surface)",
                borderColor: theme === m.id ? "var(--accent)" : "var(--border)",
              }}
            >
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
              >
                <m.Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[13px] text-ink-900">{m.label}</div>
                <div className="text-[11px] text-ink-500">{m.desc}</div>
              </div>
              {theme === m.id && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
                >
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Accent */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5 text-ink-500">
          Màu chủ đạo
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ACCENTS.map((a) => {
            const isActive = accent === a.id;
            const swatch = theme === "dark" ? a.dark : a.light;
            return (
              <button
                key={a.id}
                onClick={() => setAccent(a.id)}
                className={`p-3 rounded-lg border-2 transition flex items-center gap-3 ${
                  isActive ? "" : "hover:border-ink-300"
                }`}
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: isActive ? "var(--accent)" : "var(--border)",
                }}
              >
                <span
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm"
                  style={a.swatch ? { background: a.swatch } : { backgroundColor: swatch }}
                >
                  {isActive && <Check className="w-4 h-4" />}
                </span>
                <div className="min-w-0 text-left">
                  <div className="text-[13px] font-semibold text-ink-900 truncate">{a.label}</div>
                  <div className={`text-[10px] text-ink-500 truncate ${a.desc ? "" : "font-mono"}`}>
                    {a.desc || swatch}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Giải thích ảnh hưởng */}
      <div className="rounded-md border p-3" style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
          <div className="text-[11px] uppercase tracking-wider font-bold" style={{ color: "var(--fg-muted)" }}>
            Các vùng bị ảnh hưởng
          </div>
        </div>
        <div className="text-[11.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Đổi màu chủ đạo & chế độ sẽ tự động áp dụng cho: <b>button primary</b>, <b>link</b>, <b>highlight sidebar</b>, <b>chart series chính</b>, <b>gradient brand</b>, <b>status active</b>, <b>focus ring</b>, <b>dark mode surfaces</b>.
          <br /><br />
          Chọn <b>một màu cụ thể</b> → toàn hệ thống về <b>đơn sắc</b>: mọi nhóm phân loại (vai trò nhân viên, danh mục bài viết, chuỗi KPI) dùng chung tông màu đó, chỉ khác độ sáng.
          Chọn <b>Đa sắc</b> → mỗi nhóm một màu riêng để phân biệt nhanh hơn.
          <br /><br />
          <b>Không đổi trong mọi chế độ:</b> màu trạng thái (thành công · cảnh báo · lỗi) vì đổi là mất ý nghĩa, và màu thương hiệu kênh ngoài (Facebook · YouTube · TikTok) vì đó là nhận diện của họ.
        </div>
      </div>
    </div>
  );
}

function LayoutConfig() {
  const { density, fontSize, setDensity, setFontSize } = useTheme();
  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5 text-ink-500">
          Mật độ hiển thị
        </div>
        <div className="grid grid-cols-3 gap-3">
          {DENSITIES.map((d) => (
            <button
              key={d.id}
              onClick={() => setDensity(d.id)}
              className={`p-3 rounded-lg border-2 transition text-left ${
                density === d.id ? "" : "hover:border-ink-300"
              }`}
              style={{
                backgroundColor: "var(--surface)",
                borderColor: density === d.id ? "var(--accent)" : "var(--border)",
              }}
            >
              <div className="font-semibold text-[13px] text-ink-900">{d.label}</div>
              <div className="text-[10px] text-ink-500 mb-2">
                {d.id === "compact"    ? "Thu gọn ~80% padding" :
                 d.id === "comfortable" ? "Mặc định · 100%"      :
                                          "Rộng rãi ~125% padding"}
              </div>
              <div className="flex items-end gap-0.5 h-7">
                {[1, 1, 1, 1, 1, 1, 1].map((_, i) => (
                  <span
                    key={i}
                    className="w-1 rounded"
                    style={{
                      height: d.id === "compact" ? "30%" : d.id === "comfortable" ? "60%" : "100%",
                      backgroundColor: "var(--accent)",
                    }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5 text-ink-500">
          Cỡ chữ
        </div>
        <div className="grid grid-cols-3 gap-3">
          {FONT_SIZES.map((f) => (
            <button
              key={f.id}
              onClick={() => setFontSize(f.id)}
              className={`p-3 rounded-lg border-2 text-center transition ${
                fontSize === f.id ? "" : "hover:border-ink-300"
              }`}
              style={{
                backgroundColor: "var(--surface)",
                borderColor: fontSize === f.id ? "var(--accent)" : "var(--border)",
              }}
            >
              <div className="font-bold text-ink-900" style={{ fontSize: `${f.value * 14}px` }}>
                Aa
              </div>
              <div className="text-[10px] text-ink-500 mt-1">{f.label} · {f.value}x</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdvancedConfig() {
  const { theme, accent } = useTheme();
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="!p-4">
          <div className="text-[11px] uppercase font-bold tracking-wider mb-2" style={{ color: "var(--fg-muted)" }}>
            Bộ màu semantic đang dùng
          </div>
          <div className="space-y-1.5">
            {[
              { tone: "success",   label: "Success",  desc: "Hoàn thành, tăng trưởng" },
              { tone: "warning",   label: "Warning",  desc: "Cảnh báo, sắp tới hạn" },
              { tone: "danger",    label: "Danger",   desc: "Lỗi, giảm sút" },
              { tone: "info",      label: "Info",     desc: "Thông tin chung" },
              { tone: "highlight", label: "Highlight",desc: "AI, đề xuất, nổi bật" },
            ].map((t) => (
              <div key={t.tone} className="flex items-center gap-2 p-1.5 rounded">
                <ToneDot tone={t.tone} className="w-3.5 h-3.5" />
                <div className="flex-1">
                  <div className="text-[12px] font-semibold text-ink-900">{t.label}</div>
                  <div className="text-[10px] text-ink-500">{t.desc}</div>
                </div>
                <StatusPill tone={t.tone}>{t.label}</StatusPill>
              </div>
            ))}
          </div>
        </Card>

        <Card className="!p-4">
          <div className="text-[11px] uppercase font-bold tracking-wider mb-2" style={{ color: "var(--fg-muted)" }}>
            Thông tin theme
          </div>
          <div className="space-y-2 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-ink-500">Chế độ</span>
              <span className="font-semibold text-ink-900 inline-flex items-center gap-1.5">
                {theme === "dark" ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                {theme === "dark" ? "Tối" : "Sáng"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-500">Accent</span>
              <span className="font-semibold text-ink-900 inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                {ACCENTS.find((a) => a.id === accent)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-500">Storage</span>
              <span className="font-semibold text-ink-900 font-mono text-[11px]">localStorage('lepalmier.theme')</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-500">Phản ứng</span>
              <span className="font-semibold text-ink-900 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ backgroundColor: "var(--success)" }} />
                Live · 0ms
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FeatureIcon Icon={BarChart3} label="Charts" sub="Recharts series đổi theo accent" />
        <FeatureIcon Icon={ShieldCheck} label="Status" sub="Success/Danger liên kết màu chủ" />
        <FeatureIcon Icon={Eye} label="Live preview" sub="Đổi → thấy ngay không reload" />
      </div>
    </div>
  );
}

function FeatureIcon({ Icon, label, sub }) {
  return (
    <div
      className="rounded-md border p-3 flex items-center gap-3"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div
        className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="font-semibold text-[12px] text-ink-900">{label}</div>
        <div className="text-[10.5px] text-ink-500">{sub}</div>
      </div>
    </div>
  );
}

/* Live preview — hiển thị đúng theme đang chọn */
function LivePreview() {
  return (
    <Card title="Xem trước thực tế" subtitle="Mọi thành phần dưới đây render bằng theme hiện tại">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Buttons */}
        <PreviewBlock title="Buttons">
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary">Primary</button>
            <button className="btn-outline">Outline</button>
            <button className="btn-ghost">Ghost</button>
          </div>
        </PreviewBlock>

        {/* Status pills */}
        <PreviewBlock title="Status pills (semantic)">
          <div className="flex flex-wrap gap-1.5">
            <StatusPill tone="success">+12.4%</StatusPill>
            <StatusPill tone="warning">Sắp hết</StatusPill>
            <StatusPill tone="danger">Lỗi</StatusPill>
            <StatusPill tone="info">Mới</StatusPill>
            <StatusPill tone="highlight">AI</StatusPill>
            <AccentPill>Premium</AccentPill>
          </div>
        </PreviewBlock>

        {/* Trends */}
        <PreviewBlock title="Trends">
          <div className="flex flex-wrap gap-1.5">
            <Trend value={18.4} />
            <Trend value={-4.2} />
            <Trend value={9.6} label="vs hôm qua" />
            <Trend value={42} size="lg" />
          </div>
        </PreviewBlock>

        {/* Stat */}
        <PreviewBlock title="KPI card">
          <div
            className="rounded-md border p-3 flex items-center gap-3"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--fg-muted)" }}>
                Doanh thu hôm nay
              </div>
              <div className="font-display font-bold text-ink-900 text-[18px] tabular-nums">3.84 tỷ</div>
            </div>
            <Trend value={18.4} size="lg" />
          </div>
        </PreviewBlock>

        {/* Alerts */}
        <PreviewBlock title="Tone alerts">
          <div className="space-y-1.5">
            <ToneAlert tone="success" title="Doanh thu vượt target" desc="Booking.com tăng 24% đầu tháng" metric="+18.4%" />
            <ToneAlert tone="warning" title="Sắp hết hàng" desc="Wagyu A5 chỉ còn 2kg" metric="2kg" />
            <ToneAlert tone="danger" title="Lỗi kết nối POS" desc="Mất kết nối 2 chi nhánh" metric="3 phút" />
            <ToneAlert tone="info" title="Cập nhật hệ thống" desc="Phiên bản 2.4 đã sẵn sàng" />
            <ToneAlert tone="highlight" title="AI đề xuất" desc="Mở thêm 12 phòng cho peak 15/08" metric="+12 phòng" />
          </div>
        </PreviewBlock>

        {/* Input */}
        <PreviewBlock title="Inputs">
          <div className="space-y-2">
            <input className="input" placeholder="Tìm kiếm..." />
            <select className="input">
              <option>-- Chọn chi nhánh --</option>
              <option>LP1 Sài Gòn</option>
              <option>LP2 Đà Lạt</option>
            </select>
          </div>
        </PreviewBlock>
      </div>
    </Card>
  );
}

function PreviewBlock({ title, children }) {
  return (
    <div
      className="rounded-md border p-3.5"
      style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-soft)" }}
    >
      <div className="text-[10px] uppercase font-bold tracking-wider mb-2.5" style={{ color: "var(--fg-muted)" }}>
        {title}
      </div>
      {children}
    </div>
  );
}
