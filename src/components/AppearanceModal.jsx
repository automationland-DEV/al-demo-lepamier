import { useState } from "react";
import { Icons } from "./Icons";
import { useTheme, ACCENTS, DENSITIES, FONT_SIZES } from "../context/ThemeContext";

const { X, Palette, Layout, Sun, Moon, Check, RotateCcw } = Icons;

const TABS = [
  { id: "color",  label: "Màu sắc", Icon: Palette },
  { id: "layout", label: "Bố cục",  Icon: Layout  },
];

export default function AppearanceModal({ open, onClose }) {
  const { theme, accent, density, fontSize, setTheme, setAccent, setDensity, setFontSize, reset } =
    useTheme();
  const [tab, setTab] = useState("color");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[calc(100vw-1.5rem)] sm:w-full max-w-3xl max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] rounded-xl shadow-2xl border overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 font-display font-bold text-base truncate"
            style={{ color: "var(--fg)" }}>
            <Palette className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
            <span className="truncate">Tuỳ chỉnh giao diện</span>
          </div>
          <button className="p-1.5 rounded-md hover:opacity-70 shrink-0"
            onClick={onClose} style={{ color: "var(--fg-muted)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden"
          style={{ minHeight: 420 }}>
          {/* Tabs */}
          <div className="flex sm:flex-col w-full sm:w-32 md:w-40 lg:w-44 border-b sm:border-b-0 sm:border-r p-2 gap-1 sm:gap-1 sm:space-y-1 shrink-0 overflow-x-auto"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 sm:shrink w-auto sm:w-full flex items-center gap-2 sm:gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-left transition whitespace-nowrap ${
                  tab === t.id ? "" : "hover:opacity-80"
                }`}
                style={
                  tab === t.id
                    ? { backgroundColor: "var(--accent)", color: "var(--on-accent)" }
                    : { color: "var(--fg)" }
                }
              >
                <t.Icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto min-w-0">
            {tab === "color" ? <ColorTab /> : <LayoutTab />}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t text-xs shrink-0"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)", color: "var(--fg-muted)" }}>
          <button
            className="inline-flex items-center gap-1.5 font-semibold hover:opacity-80"
            onClick={reset}
            style={{ color: "var(--accent)" }}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Khôi phục mặc định
          </button>
          <button className="btn-primary !py-1.5 !px-3" onClick={onClose}>
            <Check className="w-4 h-4" /> Xong
          </button>
        </div>
      </div>
    </div>
  );
}

function ColorTab() {
  const { theme, accent, setTheme, setAccent } = useTheme();

  return (
    <div className="space-y-6">
      {/* Light / Dark */}
      <div>
        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--fg-muted)" }}>Chế độ hiển thị</div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            onClick={() => setTheme("light")}
            className={`p-3 sm:p-4 rounded-lg border text-left transition ${
              theme === "light" ? "ring-2" : ""
            }`}
            style={{
              backgroundColor: "var(--surface)",
              borderColor: theme === "light" ? "var(--accent)" : "var(--border)",
              "--tw-ring-color": "var(--accent)",
            }}
          >
            <Sun className="w-5 h-5 mb-2" style={{ color: "var(--accent)" }} />
            <div className="font-semibold text-sm" style={{ color: "var(--fg)" }}>Sáng</div>
            <div className="text-[10.5px] sm:text-[11px]" style={{ color: "var(--fg-muted)" }}>Phù hợp ban ngày</div>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`p-3 sm:p-4 rounded-lg border text-left transition ${
              theme === "dark" ? "ring-2" : ""
            }`}
            style={{
              backgroundColor: "var(--surface)",
              borderColor: theme === "dark" ? "var(--accent)" : "var(--border)",
            }}
          >
            <Moon className="w-5 h-5 mb-2" style={{ color: "var(--accent)" }} />
            <div className="font-semibold text-sm" style={{ color: "var(--fg)" }}>Tối</div>
            <div className="text-[10.5px] sm:text-[11px]" style={{ color: "var(--fg-muted)" }}>Dễ chịu cho mắt ban đêm</div>
          </button>
        </div>
      </div>

      {/* Accent palette */}
      <div>
        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--fg-muted)" }}>Màu chủ đạo</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
          {ACCENTS.map((a) => {
            const isActive = accent === a.id;
            const swatch = theme === "dark" ? a.dark : a.light;
            return (
              <button
                key={a.id}
                onClick={() => setAccent(a.id)}
                className="p-2.5 sm:p-3 rounded-lg border flex items-center gap-2.5 sm:gap-3 transition min-w-0"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: isActive ? "var(--accent)" : "var(--border)",
                }}
              >
                <span
                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white"
                  style={{ backgroundColor: swatch }}
                >
                  {isActive && <Check className="w-3.5 h-3.5" />}
                </span>
                <span className="text-sm font-semibold truncate" style={{ color: "var(--fg)" }}>{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <PreviewCard />
    </div>
  );
}

function LayoutTab() {
  const { density, fontSize, setDensity, setFontSize } = useTheme();
  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3"
          style={{ color: "var(--fg-muted)" }}>Mật độ hiển thị</div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {DENSITIES.map((d) => (
            <button
              key={d.id}
              onClick={() => setDensity(d.id)}
              className="p-2.5 sm:p-3 rounded-lg border text-center transition min-w-0"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: density === d.id ? "var(--accent)" : "var(--border)",
              }}
            >
              <div className="font-semibold text-sm truncate" style={{ color: "var(--fg)" }}>{d.label}</div>
              <div className="mt-2 flex justify-center gap-0.5">
                {d.id === "compact" && [1, 1, 1, 1, 1, 1, 1].map((_, i) => (
                  <span key={i} className="w-1 h-6 rounded" style={{ backgroundColor: "var(--accent)" }} />
                ))}
                {d.id === "comfortable" && [1, 1, 1, 1, 1, 1, 1].map((_, i) => (
                  <span key={i} className="w-1 h-9 rounded" style={{ backgroundColor: "var(--accent)" }} />
                ))}
                {d.id === "spacious" && [1, 1, 1, 1, 1, 1, 1].map((_, i) => (
                  <span key={i} className="w-1 h-12 rounded" style={{ backgroundColor: "var(--accent)" }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--fg-muted)" }}>Cỡ chữ</div>
        <div className="flex items-center gap-3 sm:gap-4">
          {FONT_SIZES.map((f) => (
            <button
              key={f.id}
              onClick={() => setFontSize(f.id)}
              className="flex-1 py-2.5 sm:py-3 px-2 rounded-lg border font-semibold transition min-w-0"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: fontSize === f.id ? "var(--accent)" : "var(--border)",
                color: "var(--fg)",
                fontSize: `${f.value * 14}px`,
              }}
            >
              <span className="truncate block">{f.label}</span>
            </button>
          ))}
        </div>
        <input
          type="range"
          min="0.9"
          max="1.15"
          step="0.05"
          value={FONT_SIZES.find((f) => f.id === fontSize)?.value ?? 1}
          onChange={(e) => {
            const v = Number(e.target.value);
            const found = FONT_SIZES.reduce((closest, cur) =>
              Math.abs(cur.value - v) < Math.abs(closest.value - v) ? cur : closest
            );
            setFontSize(found.id);
          }}
          className="w-full mt-3 accent-current"
          style={{ accentColor: "var(--accent)" }}
        />
      </div>

      <PreviewCard />
    </div>
  );
}

function PreviewCard() {
  return (
    <div className="rounded-lg border p-4"
      style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-3"
        style={{ color: "var(--fg-muted)" }}>Xem trước</div>
      <div className="rounded-md p-3 border"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="font-display font-bold text-sm" style={{ color: "var(--fg)" }}>Doanh thu tháng 7</div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-fg)" }}>
            +12.4%
          </span>
        </div>
        <div className="font-display font-bold text-2xl mb-2" style={{ color: "var(--fg)" }}>3.84 tỷ VND</div>
        <div className="flex gap-2">
          <button className="btn-primary !py-1 !text-[12px]">Hành động</button>
          <button className="btn-outline !py-1 !text-[12px]">Huỷ</button>
        </div>
      </div>
    </div>
  );
}