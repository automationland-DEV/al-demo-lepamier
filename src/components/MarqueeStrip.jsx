import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * MarqueeStrip — dải chữ chạy ngang, kiểu broadcast ticker.
 * - items: mảng object { icon?, text, tone? }
 * - speed: px/giây (mặc định 60)
 * - pauseOnHover: tạm dừng khi rê chuột
 * - tone: "blue" | "amber" | "rose" | "ink"
 */
export default function MarqueeStrip({
  items,
  speed = 60,
  pauseOnHover = true,
  tone = "blue",
  className = "",
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const [trackW, setTrackW] = useState(0);
  const [containerW, setContainerW] = useState(0);

  // Đo width của 1 bản copy & container
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) setTrackW(trackRef.current.scrollWidth / 2);
      if (wrapRef.current) setContainerW(wrapRef.current.clientWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [safeItems]);

  // Loop animation
  useEffect(() => {
    if (!trackW) return;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setOffset((prev) => {
        let next = prev + speed * dt;
        if (next >= trackW) next -= trackW;
        return next;
      });
      if (!paused) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trackW, speed, paused]);

  const tones = {
    /* "blue" = tone mặc định, nay bám accent thay vì xanh dương cứng */
    blue: {
      bg: "",
      style: {
        backgroundImage:
          "linear-gradient(90deg, color-mix(in oklab, var(--accent) 52%, #070d1a) 0%, color-mix(in oklab, var(--accent) 34%, #070d1a) 50%, color-mix(in oklab, var(--accent) 52%, #070d1a) 100%)",
      },
      text: "text-white",
      chip: "bg-white/15 text-white",
      dot: "bg-white",
      separator: "text-white/30",
    },
    amber: {
      bg: "bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700",
      text: "text-white",
      chip: "bg-white/15 text-white",
      dot: "bg-yellow-200",
      separator: "text-white/30",
    },
    rose: {
      bg: "bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700",
      text: "text-white",
      chip: "bg-white/15 text-white",
      dot: "bg-rose-200",
      separator: "text-white/30",
    },
    ink: {
      bg: "bg-gradient-to-r from-ink-900 via-ink-800 to-ink-900",
      text: "text-white",
      chip: "bg-white/10 text-white",
      dot: "bg-ink-300",
      separator: "text-white/30",
    },
  };
  const t = tones[tone] || tones.blue;

  const Item = ({ it }) => (
    <span className="inline-flex items-center gap-2 px-5 whitespace-nowrap">
      {it.chip && (
        <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded ${t.chip}`}>
          {it.chip}
        </span>
      )}
      {it.icon && <it.icon className={`w-3.5 h-3.5 ${t.text} opacity-90`} />}
      {it.dot && <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />}
      <span className={`text-[12.5px] font-semibold ${t.text}`}>{it.text}</span>
      <span className={`${t.separator} mx-1`}>✦</span>
    </span>
  );

  return (
    <div
      ref={wrapRef}
      onMouseEnter={pauseOnHover ? () => setPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setPaused(false) : undefined}
      className={`relative overflow-hidden rounded-md ${t.bg} ${className}`}
      style={t.style}
    >
      {/* Mask gradient 2 đầu */}
      <div className="absolute inset-y-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-black/35 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-black/35 to-transparent z-10 pointer-events-none" />

      {/* Nút loa cố định bên trái — bật/tắt dòng tin.
          Tắt loa = dừng chạy chữ, thay cho nhãn "LIVE" tĩnh trước đây. */}
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Bật dòng tin" : "Tắt dòng tin"}
        aria-pressed={!paused}
        title={paused ? "Bật dòng tin" : "Tắt dòng tin"}
        className="absolute left-0 top-0 bottom-0 z-20 flex items-center gap-1.5 px-2.5 sm:px-3 bg-black/35 hover:bg-black/50 backdrop-blur-md border-r border-white/15 shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)] transition active:scale-95"
      >
        {paused ? (
          <VolumeX className="w-4 h-4 text-white/70" strokeWidth={2.2} />
        ) : (
          <span className="relative inline-flex items-center justify-center">
            <span className={`absolute -inset-1.5 rounded-full ${t.dot} opacity-25 animate-ping`} style={{ animationDuration: "1.8s" }} />
            <Volume2 className="relative w-4 h-4 text-white drop-shadow-sm" strokeWidth={2.2} />
          </span>
        )}
        <span className={`hidden sm:inline text-[10px] font-bold uppercase tracking-[0.2em] drop-shadow-sm ${paused ? "text-white/60" : "text-white"}`}>
          {paused ? "Tắt" : "Live"}
        </span>
      </button>

      {/* Track — render 2 bản copy liên tiếp để loop liền mạch */}
      <div
        ref={trackRef}
        className="marquee-track flex items-center py-2 will-change-transform"
        style={{
          transform: `translateX(${-offset}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {[...safeItems, ...safeItems].map((it, i) => (
          <Item key={i} it={it} />
        ))}
      </div>

    </div>
  );
}