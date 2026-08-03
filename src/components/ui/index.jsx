/**
 * Condo HUB — Thư viện component Design System v4 "Palmier Riviera".
 * Đặc tả: Design.md §6
 *
 * ĐÂY LÀ NGUỒN SỰ THẬT. Trang mới import từ đây, không copy-paste component
 * giữa các trang như thời v3. Nếu bạn thấy mình sắp viết lại một cái nút,
 * dừng lại và thêm biến thể vào <Button> ở dưới.
 *
 * Ba luật xuyên suốt file này:
 *   1. Không gradient (ngoại lệ: vùng tô dưới đường biểu đồ — Design.md §2.5)
 *   2. Không bóng mang màu phần tử, không transform khi hover
 *   3. Trần độ đậm là 600. Tiêu đề dùng font-display weight 400.
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { Icons } from "../Icons";

const { ChevronDown, X, Check, ArrowUp, ArrowDown, Search: SearchIcon } = Icons;

export const cx = (...a) => a.filter(Boolean).join(" ");

/* Bề mặt dùng lại ở nhiều component */
const SURFACE = { backgroundColor: "var(--surface)", borderColor: "var(--border)" };

/* ═══════════════════════════════════════════════════════════
   1. NGUYÊN LIỆU CƠ BẢN
   ═══════════════════════════════════════════════════════════ */

/** Nhãn lông mày — chi tiết nhận diện ① (Design.md §3) */
export function Eyebrow({ children, className = "", as: As = "div" }) {
  return (
    <As
      className={cx("text-[10px] font-semibold uppercase tracking-[0.16em]", className)}
      style={{ color: "var(--fg-subtle)" }}
    >
      {children}
    </As>
  );
}

/** Đường kẻ tóc — dùng thay <hr> */
export function Hairline({ className = "", soft = false }) {
  return (
    <div
      className={cx("h-px w-full", className)}
      style={{ backgroundColor: soft ? "var(--border-soft)" : "var(--border)" }}
    />
  );
}

/** Dấu chấm phân cách trong dòng meta */
const Dot = () => (
  <span aria-hidden className="opacity-35 select-none">·</span>
);

/* ═══════════════════════════════════════════════════════════
   2. NÚT & ĐIỀU KHIỂN
   ═══════════════════════════════════════════════════════════ */

const BTN_VARIANT = {
  primary: {
    backgroundColor: "var(--accent)",
    color: "var(--on-accent)",
    borderColor: "transparent",
  },
  outline: {
    backgroundColor: "var(--surface)",
    color: "var(--fg)",
    borderColor: "var(--border)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--fg-muted)",
    borderColor: "transparent",
  },
  danger: {
    backgroundColor: "var(--danger-soft)",
    color: "var(--danger-fg)",
    borderColor: "var(--danger-border)",
  },
  metal: {
    backgroundColor: "var(--metal-soft)",
    color: "var(--metal-fg)",
    borderColor: "var(--metal)",
  },
};

/* Chiều cao nút và cỡ icon đi kèm.
 *
 * `sm` trước đây là 32px với icon 14px. Trên các trang nhiều thao tác dạng
 * bảng/thẻ (Hạng phòng, Thực đơn, Hóa đơn…), một hàng ba nút icon 14px nét
 * mảnh 2px đọc ra như ba dấu chấm — người dùng không nhận ra đó là nút bấm.
 * Nay 36px / icon 16px, `md` 40px / icon 18px. */
const BTN_SIZE = {
  sm: "h-9 px-3 text-[12px] gap-1.5",
  md: "h-10 px-4 text-[13px] gap-2",
};

/** Cỡ icon trong nút — dùng chung cho Button và IconButton */
const BTN_ICON = {
  sm: "w-4 h-4",
  md: "w-[18px] h-[18px]",
};

/**
 * Nhãn nút phải là **động từ + danh từ** ("Thêm nhân viên"), Design.md §13.
 */
export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  className = "",
  style,
  disabled,
  children,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const base = BTN_VARIANT[variant] || BTN_VARIANT.primary;

  const hovered = !disabled && hover;
  const resolved = {
    ...base,
    ...(hovered && variant === "primary" && { backgroundColor: "var(--accent-hover)" }),
    ...(hovered && variant === "outline" && { borderColor: "var(--fg-subtle)" }),
    ...(hovered && variant === "ghost" && { backgroundColor: "var(--surface-3)", color: "var(--fg)" }),
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cx(
        "inline-flex items-center justify-center border font-medium whitespace-nowrap transition-colors",
        BTN_SIZE[size] || BTN_SIZE.md,
        disabled && "cursor-not-allowed",
        className
      )}
      style={{
        borderRadius: "var(--r-sm)",
        transitionTimingFunction: "var(--ease)",
        transitionDuration: ".16s",
        opacity: disabled ? 0.45 : 1,
        ...resolved,
        ...style,
      }}
      {...rest}
    >
      {Icon && <Icon className={cx(BTN_ICON[size] || BTN_ICON.md, "shrink-0")} />}
      {children}
      {IconRight && <IconRight className={cx(BTN_ICON[size] || BTN_ICON.md, "shrink-0")} />}
    </button>
  );
}

/**
 * Nút chỉ có icon — luôn cần aria-label + title (Design.md §14).
 *
 * Ô vuông bằng đúng chiều cao nút cùng cỡ (sm 36px, md 40px) để một hàng
 * nút icon xếp cạnh nút chữ không bị lệch đường chân.
 *
 * Padding bỏ bằng inline style chứ KHÔNG bằng class `px-0`: `px-4` của
 * BTN_SIZE nằm sau `px-0` trong stylesheet Tailwind nên `px-0` thua, nút
 * 40px còn lại 32px padding và bóp icon 18px xuống còn 6px. Đó là lý do
 * mọi nút icon trước đây trông như dấu chấm. Inline style thắng mọi class,
 * và `shrink-0` ở trên là lớp chặn thứ hai.
 */
export function IconButton({ icon: Icon, label, size = "md", className = "", style, ...rest }) {
  return (
    <Button
      variant="ghost"
      size={size}
      aria-label={label}
      title={label}
      className={cx(size === "sm" ? "w-9" : "w-10", className)}
      style={{ paddingLeft: 0, paddingRight: 0, ...style }}
      {...rest}
    >
      <Icon className={cx(BTN_ICON[size] || BTN_ICON.md, "shrink-0")} />
    </Button>
  );
}

/** Ô nhập. `icon` đặt icon bên trái, `onClear` hiện nút xóa khi có giá trị. */
export function Input({
  icon: Icon,
  onClear,
  className = "",
  wrapperClassName = "",
  value,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div className={cx("relative", wrapperClassName)}>
      {Icon && (
        <Icon
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--fg-subtle)" }}
        />
      )}
      <input
        value={value}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className={cx(
          "w-full h-10 text-[13px] border outline-none transition-colors",
          Icon ? "pl-9" : "pl-3",
          onClear && value ? "pr-9" : "pr-3",
          className
        )}
        style={{
          borderRadius: "var(--r-sm)",
          backgroundColor: "var(--surface)",
          borderColor: focus ? "var(--accent)" : "var(--border)",
          boxShadow: focus ? "0 0 0 1px var(--accent)" : "none",
          color: "var(--fg)",
          transitionDuration: ".16s",
        }}
        {...rest}
      />
      {onClear && value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Xóa nội dung tìm kiếm"
          title="Xóa"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 grid place-items-center"
          style={{ color: "var(--fg-subtle)" }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/** Ô tìm kiếm — Input đã gắn sẵn icon kính lúp và nút xóa */
export function SearchInput({ value, onChange, placeholder = "Tìm kiếm…", ...rest }) {
  return (
    <Input
      icon={SearchIcon}
      value={value}
      onChange={onChange}
      onClear={() => onChange({ target: { value: "" } })}
      placeholder={placeholder}
      {...rest}
    />
  );
}

/** Select gốc, đã bọc mũi tên riêng để bỏ mũi tên mặc định của trình duyệt */
export function Select({ className = "", wrapperClassName = "", children, ...rest }) {
  return (
    <div className={cx("relative", wrapperClassName)}>
      <select
        className={cx(
          "w-full h-10 pl-3 pr-9 text-[13px] border outline-none appearance-none cursor-pointer transition-colors",
          className
        )}
        style={{
          borderRadius: "var(--r-sm)",
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--fg)",
        }}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--fg-subtle)" }}
      />
    </div>
  );
}

/** Nhãn + điều khiển + lỗi, dùng trong form và modal */
export function Field({ label, hint, error, required, children, className = "" }) {
  return (
    <label className={cx("block", className)}>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="text-[12px] font-medium" style={{ color: "var(--fg)" }}>
          {label}
          {required && <span style={{ color: "var(--danger)" }}> *</span>}
        </span>
        {hint && (
          <span className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <div className="mt-1.5 text-[11px]" style={{ color: "var(--danger-fg)" }}>{error}</div>
      )}
    </label>
  );
}

/** Chuyển đổi 2–4 lựa chọn. Mục đang chọn nổi lên bằng bề mặt, không bằng màu. */
export function Segmented({ value, onChange, options, size = "md", className = "" }) {
  const h = size === "sm" ? "h-8" : "h-10";
  const inner = size === "sm" ? "h-6 px-2.5 text-[11px]" : "h-8 px-3 text-[12px]";
  return (
    <div
      className={cx("inline-flex items-center p-1 border", h, className)}
      style={{
        borderRadius: "var(--r-sm)",
        backgroundColor: "var(--surface-2)",
        borderColor: "var(--border)",
      }}
      role="tablist"
    >
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            title={o.title || o.label}
            onClick={() => onChange(o.value)}
            className={cx("inline-flex items-center gap-1.5 font-medium transition-colors", inner)}
            style={{
              borderRadius: "calc(var(--r-sm) - 1px)",
              backgroundColor: active ? "var(--surface)" : "transparent",
              color: active ? "var(--fg)" : "var(--fg-subtle)",
              boxShadow: active ? "var(--shadow-card)" : "none",
              transitionDuration: ".16s",
            }}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Tab có vạch đồng thau — chi tiết nhận diện ② (Design.md §3, §6.4).
 * Không nền, không pill, không gradient.
 */
export function Tabs({ value, onChange, items, className = "" }) {
  return (
    <div
      className={cx("flex items-center gap-7 border-b overflow-x-auto noscroll", className)}
      style={{ borderColor: "var(--border)" }}
      role="tablist"
    >
      {items.map((t) => {
        const active = t.key === value;
        const Icon = t.icon;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className="relative shrink-0 inline-flex items-center gap-2 pb-3 pt-1 text-[13px] font-medium transition-colors"
            style={{ color: active ? "var(--fg)" : "var(--fg-subtle)", transitionDuration: ".16s" }}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {t.label}
            {t.count != null && (
              <span className="text-[11px] tnum" style={{ color: "var(--fg-subtle)" }}>
                {t.count}
              </span>
            )}
            <span
              aria-hidden
              className="absolute left-0 right-0 -bottom-px h-0.5 origin-left"
              style={{
                backgroundColor: "var(--metal)",
                transform: active ? "scaleX(1)" : "scaleX(0)",
                transition: "transform .22s var(--ease)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. NHÃN
   ═══════════════════════════════════════════════════════════ */

/** Nhãn phân loại — phẳng, viền mảnh, chấm mang màu phân loại */
export function Tag({ dot, children, className = "", title }) {
  return (
    <span
      title={title}
      className={cx(
        "inline-flex items-center gap-1.5 h-6 px-2 text-[11px] font-medium border whitespace-nowrap",
        className
      )}
      style={{
        borderRadius: "var(--r-sm)",
        backgroundColor: "var(--surface-2)",
        borderColor: "var(--border)",
        color: "var(--fg-muted)",
      }}
    >
      {dot && (
        <span
          aria-hidden
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: dot }}
        />
      )}
      {children}
    </span>
  );
}

/** Nhãn trạng thái ngữ nghĩa. tone: success | warning | danger | info | neutral */
export function StatusTag({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 h-6 px-2 text-[11px] font-medium border whitespace-nowrap",
        className
      )}
      style={{
        borderRadius: "var(--r-sm)",
        backgroundColor: `var(--${tone}-soft)`,
        borderColor: `var(--${tone}-border)`,
        color: `var(--${tone}-fg)`,
      }}
    >
      <span
        aria-hidden
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: `var(--${tone})` }}
      />
      {children}
    </span>
  );
}

/** Biến động so với kỳ trước — chỉ tô chữ và mũi tên, không tô nền */
export function Delta({ value, suffix = "%", className = "" }) {
  if (value == null) return null;
  const up = value >= 0;
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={cx("inline-flex items-center gap-0.5 text-[12px] font-medium tnum", className)}
      style={{ color: up ? "var(--success)" : "var(--danger)" }}
    >
      <Arrow className="w-3 h-3" />
      {Math.abs(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}
      {suffix}
    </span>
  );
}

/** Avatar — LUÔN vẽ chữ viết tắt làm nền, ảnh chỉ hiện khi tải xong. */
export function Avatar({ name = "", src, size = 36, className = "", ring }) {
  const [loaded, setLoaded] = useState(false);
  const initials = useMemo(() => {
    const p = String(name).trim().split(/\s+/).filter(Boolean);
    return ((p[0]?.[0] || "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
  }, [name]);

  return (
    <span
      className={cx("relative inline-grid place-items-center rounded-full overflow-hidden shrink-0 border", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: "var(--surface-3)",
        borderColor: ring || "var(--border)",
      }}
      title={name}
    >
      <span
        className="font-medium select-none"
        style={{ fontSize: Math.max(10, Math.round(size * 0.34)), color: "var(--fg-muted)" }}
      >
        {initials}
      </span>
      {src && (
        <img
          src={src}
          alt=""
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity .2s var(--ease)" }}
        />
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. KHUNG TRANG
   ═══════════════════════════════════════════════════════════ */

/** Container gốc của mọi trang — Design.md §5 */
export function Page({ children, className = "" }) {
  return <div className={cx("max-w-[1320px] mx-auto pb-16", className)}>{children}</div>;
}

/**
 * ① Header trang. Tiêu đề nên có cá tính ("Đội ngũ Condo HUB"), không phải
 * nhãn menu khô ("Nhân viên") — Design.md §6.1.
 */
export function PageHeader({ eyebrow, title, meta = [], actions, live = false }) {
  return (
    <header className="pt-1 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
          <h1
            className="font-display text-[36px] sm:text-[44px] leading-[1.05]"
            style={{ color: "var(--fg)", letterSpacing: "-0.015em" }}
          >
            {title}
          </h1>
          {meta.length > 0 && (
            <div
              className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-3 text-[13px]"
              style={{ color: "var(--fg-muted)" }}
            >
              {live && (
                <span
                  aria-hidden
                  className="w-1.5 h-1.5 rounded-full pulse-soft"
                  style={{ backgroundColor: "var(--success)" }}
                />
              )}
              {meta.filter(Boolean).map((m, i) => (
                <span key={i} className="inline-flex items-center gap-2.5">
                  {i > 0 && <Dot />}
                  <span className="tnum">{m}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
      <Hairline className="mt-7" />
    </header>
  );
}

/** Tiêu đề section — nhãn lông mày + kẻ tóc + tiêu đề serif (Design.md §3 ①) */
export function SectionHead({ eyebrow, title, sub, right, className = "" }) {
  return (
    <div className={cx("mt-12 mb-5", className)}>
      {eyebrow && <Eyebrow className="mb-2.5">{eyebrow}</Eyebrow>}
      <Hairline className="mb-4" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-[22px] leading-tight" style={{ color: "var(--fg)" }}>
            {title}
          </h2>
          {sub && (
            <p className="mt-1.5 text-[13px]" style={{ color: "var(--fg-muted)" }}>{sub}</p>
          )}
        </div>
        {right && <div className="flex items-center gap-2.5 shrink-0">{right}</div>}
      </div>
    </div>
  );
}

/**
 * Khung có viền.
 * - `flush` bỏ padding thân (dùng khi chứa bảng hoặc danh sách chạm mép).
 * - `bodyClassName` để thân co giãn khi panel bị lưới kéo cao hơn nội dung
 *   (đặt "flex-1 flex flex-col" rồi cho biểu đồ "flex-1" là hết khoảng trống).
 */
export function Panel({
  title, sub, right, flush = false, bodyClassName = "", children, className = "", style,
}) {
  return (
    <section
      className={cx("border overflow-hidden", className)}
      style={{ borderRadius: "var(--r)", boxShadow: "var(--shadow-card)", ...SURFACE, ...style }}
    >
      {(title || right) && (
        <div
          className="flex items-center justify-between gap-4 px-6 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="min-w-0">
            {title && (
              <div
                className="text-[13px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--fg)" }}
              >
                {title}
              </div>
            )}
            {sub && (
              <div className="mt-1 text-[12px]" style={{ color: "var(--fg-muted)" }}>{sub}</div>
            )}
          </div>
          {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
        </div>
      )}
      <div className={cx(flush ? "" : "p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

/** ④ Toolbar — một hàng chứa tìm kiếm và bộ lọc */
export function Toolbar({ children, className = "" }) {
  return (
    <div
      className={cx("flex flex-wrap items-center gap-2.5 p-3 border", className)}
      style={{ borderRadius: "var(--r)", ...SURFACE }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. DẢI KPI — chi tiết nhận diện ④
   Một panel duy nhất chia bằng vạch dọc 1px, không phải N thẻ
   rời có bóng. Kỹ thuật: gap-px trên nền màu viền, mỗi ô tô
   nền --surface. Tự đúng ở mọi bố cục responsive.
   ═══════════════════════════════════════════════════════════ */

export function StatStrip({ cols = 4, children, className = "" }) {
  const grid = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-3 lg:grid-cols-6",
  }[cols] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div
      className={cx("grid gap-px border overflow-hidden", grid, className)}
      style={{
        borderRadius: "var(--r)",
        backgroundColor: "var(--border)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Một ô trong dải KPI.
 * - `delta` dương → xanh thông, âm → đất nung. Chỉ tô chữ.
 * - `progress` (0–100) vẽ đường kẻ chân — chi tiết nhận diện ⑤.
 */
export function Stat({ label, value, delta, deltaSuffix, hint, progress, icon: Icon, size = "md" }) {
  return (
    <div className="p-6" style={{ backgroundColor: "var(--surface)" }}>
      <div className="flex items-start justify-between gap-3">
        <Eyebrow>{label}</Eyebrow>
        {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--fg-subtle)" }} />}
      </div>

      <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
        <span
          className={cx("font-medium tnum", size === "sm" ? "text-[24px]" : "text-[32px]")}
          style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}
        >
          {value}
        </span>
        <Delta value={delta} suffix={deltaSuffix} />
      </div>

      {progress != null && (
        <div
          className="mt-4 h-0.5 w-full overflow-hidden"
          style={{ backgroundColor: "var(--surface-3)" }}
        >
          <div
            className="h-full"
            style={{
              width: `${Math.max(0, Math.min(100, progress))}%`,
              backgroundColor: "var(--accent)",
              transition: "width .4s var(--ease)",
            }}
          />
        </div>
      )}

      {hint && (
        <div className="mt-2.5 text-[12px]" style={{ color: "var(--fg-muted)" }}>{hint}</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   6. BẢNG — Design.md §6.6
   ═══════════════════════════════════════════════════════════ */

export function Table({ minWidth = 880, children, className = "" }) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cx("w-full border-collapse", className)}
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  );
}

export function Th({ align = "left", sortable, active, dir, onSort, children, className = "" }) {
  const content = (
    <span className="inline-flex items-center gap-1">
      {children}
      {sortable &&
        (active ? (
          dir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3 opacity-30" />
        ))}
    </span>
  );
  return (
    <th
      scope="col"
      className={cx(
        "px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className
      )}
      style={{
        backgroundColor: "var(--surface-2)",
        color: active ? "var(--fg)" : "var(--fg-subtle)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {sortable ? (
        <button type="button" onClick={onSort} className="inline-flex items-center">
          {content}
        </button>
      ) : (
        content
      )}
    </th>
  );
}

export function Td({ align = "left", num = false, children, className = "", style }) {
  return (
    <td
      className={cx(
        "px-5 py-3.5 text-[13px] align-middle",
        num && "tnum",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className
      )}
      style={{ color: "var(--fg)", borderTop: "1px solid var(--border-soft)", ...style }}
    >
      {children}
    </td>
  );
}

/** Hàng bảng. `selected` vẽ vạch đồng thau bên trái (chi tiết nhận diện ②). */
export function Tr({ selected, onClick, children, className = "" }) {
  const [hover, setHover] = useState(false);
  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cx("group relative", onClick && "cursor-pointer", className)}
      style={{
        backgroundColor: selected
          ? "var(--accent-soft)"
          : hover
            ? "var(--surface-2)"
            : "transparent",
        boxShadow: selected ? "inset 2px 0 0 0 var(--metal)" : "none",
        transition: "background-color .16s var(--ease)",
      }}
    >
      {children}
    </tr>
  );
}

/* ═══════════════════════════════════════════════════════════
   7. MODAL — Design.md §6.8
   ═══════════════════════════════════════════════════════════ */

export function Modal({ open, onClose, eyebrow, title, sub, wide, footer, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: "rgba(25,28,22,.42)", backdropFilter: "blur(3px)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cx("w-full my-auto border animate-fadeIn", wide ? "max-w-2xl" : "max-w-lg")}
        style={{
          borderRadius: "var(--r)",
          boxShadow: "var(--shadow-modal)",
          ...SURFACE,
        }}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
          <div className="min-w-0">
            {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
            <h2 className="font-display text-[22px] leading-tight" style={{ color: "var(--fg)" }}>
              {title}
            </h2>
            {sub && (
              <p className="mt-1.5 text-[13px]" style={{ color: "var(--fg-muted)" }}>{sub}</p>
            )}
          </div>
          <IconButton icon={X} label="Đóng" size="sm" onClick={onClose} className="-mr-2 -mt-1" />
        </div>

        <Hairline />
        <div className="p-6">{children}</div>

        {footer && (
          <div
            className="flex items-center justify-end gap-2.5 px-6 py-4 border-t"
            style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   8. BỐN TRẠNG THÁI — Design.md §9
   ═══════════════════════════════════════════════════════════ */

/** Rỗng. Phân biệt "chưa có dữ liệu" và "bộ lọc không khớp". */
export function EmptyState({ icon: Icon, title, desc, action, className = "" }) {
  return (
    <div className={cx("flex flex-col items-center text-center py-16 px-6", className)}>
      {Icon && (
        <div
          className="corners w-16 h-16 grid place-items-center border mb-6"
          style={{ borderColor: "var(--border)" }}
        >
          <Icon className="w-7 h-7" style={{ color: "var(--fg-subtle)" }} />
        </div>
      )}
      <h3 className="font-display text-[20px]" style={{ color: "var(--fg)" }}>{title}</h3>
      {desc && (
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          {desc}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Lỗi — phải nêu CÁCH XỬ LÝ, không nêu mã lỗi (Design.md §13) */
export function ErrorState({ title = "Không tải được dữ liệu", desc, onRetry }) {
  return (
    <div
      className="flex flex-col items-start gap-3 p-5 border"
      style={{
        borderRadius: "var(--r)",
        backgroundColor: "var(--danger-soft)",
        borderColor: "var(--danger-border)",
        color: "var(--danger-fg)",
      }}
      role="alert"
    >
      <div className="text-[13px] font-semibold">{title}</div>
      {desc && <p className="text-[13px] leading-relaxed">{desc}</p>}
      {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Thử lại</Button>}
    </div>
  );
}

export function Skeleton({ w = "100%", h = 12, className = "", style }) {
  return <div className={cx("skeleton", className)} style={{ width: w, height: h, ...style }} />;
}

/** Khung xương cho một dải KPI đang tải */
export function StatStripSkeleton({ cols = 4 }) {
  return (
    <StatStrip cols={cols}>
      {Array.from({ length: cols }, (_, i) => (
        <div key={i} className="p-6" style={{ backgroundColor: "var(--surface)" }}>
          <Skeleton w={92} h={9} />
          <Skeleton w={128} h={28} className="mt-4" />
          <Skeleton w={72} h={10} className="mt-3" />
        </div>
      ))}
    </StatStrip>
  );
}

/* ═══════════════════════════════════════════════════════════
   9. TOAST
   ═══════════════════════════════════════════════════════════ */

export function Toast({ message, tone = "success", onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(() => onClose?.(), 2600);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 h-11 border animate-fadeIn"
      style={{
        borderRadius: "var(--r-sm)",
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-pop)",
      }}
      role="status"
    >
      <Check className="w-4 h-4 shrink-0" style={{ color: `var(--${tone})` }} />
      <span className="text-[13px]" style={{ color: "var(--fg)" }}>{message}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   10. MENU THẢ XUỐNG — dùng cho sắp xếp và menu ⋯ trong bảng
   ═══════════════════════════════════════════════════════════ */

export function Dropdown({ trigger, children, align = "right", width = 200 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          className={cx(
            "absolute z-40 mt-1.5 py-1 border animate-fadeIn",
            align === "right" ? "right-0" : "left-0"
          )}
          style={{
            width,
            borderRadius: "var(--r-sm)",
            boxShadow: "var(--shadow-pop)",
            ...SURFACE,
          }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ icon: Icon, active, danger, children, ...rest }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="w-full flex items-center gap-2.5 px-3 h-9 text-[13px] text-left transition-colors"
      style={{
        color: danger ? "var(--danger-fg)" : active ? "var(--fg)" : "var(--fg-muted)",
        backgroundColor: hover ? "var(--surface-2)" : "transparent",
        fontWeight: active ? 500 : 400,
      }}
      {...rest}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span className="flex-1 truncate">{children}</span>
      {active && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--metal)" }} />}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   11. BIỂU ĐỒ — mặc định dùng chung cho Recharts (Design.md §7)
   Recharts không nhận var(), nên nơi cần hex thật phải đọc qua
   usePalette().chart(n) thay vì dùng các hằng này.
   ═══════════════════════════════════════════════════════════ */

export const axisProps = {
  stroke: "var(--fg-subtle)",
  fontSize: 10,
  tickLine: false,
  axisLine: false,
};

export const gridProps = {
  stroke: "var(--border-soft)",
  vertical: false,
};

/** Tooltip: nền bề mặt + viền, KHÔNG phải nền đen như v3 */
export const chartTip = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    boxShadow: "var(--shadow-pop)",
    fontSize: 12,
    padding: "8px 10px",
    color: "var(--fg)",
  },
  labelStyle: { color: "var(--fg-subtle)", fontSize: 11, marginBottom: 4 },
  itemStyle: { color: "var(--fg)", fontSize: 12, padding: 0 },
  cursor: { stroke: "var(--border)", strokeWidth: 1 },
};

/** Chú giải đặt TRÊN biểu đồ, canh trái — không dùng <Legend> của Recharts */
export function ChartLegend({ items, className = "" }) {
  return (
    <div className={cx("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-2 text-[11px]" style={{ color: "var(--fg-muted)" }}>
          <span
            aria-hidden
            className="w-4 h-px shrink-0"
            style={{ backgroundColor: it.color, height: it.area ? 8 : 2 }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   12. Ngữ cảnh phụ — cho phép Panel lồng biết mình đang ở trong
   một Panel khác để bỏ viền kép. Dùng ít, nhưng tránh được lỗi
   "viền chồng viền" hay gặp khi lồng bảng trong panel.
   ═══════════════════════════════════════════════════════════ */

const NestCtx = createContext(false);
export const useNested = () => useContext(NestCtx);
export const NestProvider = NestCtx.Provider;
