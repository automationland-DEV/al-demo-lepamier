import { useEffect, useRef, useState } from "react";
import { Icons } from "./Icons";

const { MessageCircle, X, Send, Sparkles, ChevronRight, RotateCcw } = Icons;

const FAQS = [
  {
    q: "Làm sao tạo booking mới?",
    a: "Vào **Bookings** → bấm **Tạo booking mới** ở góc trên phải. Chọn chi nhánh, phòng trống, khách, ngày nhận/trả rồi lưu.",
  },
  {
    q: "Thêm phòng cho chi nhánh thế nào?",
    a: "Vào **Chi nhánh** → chọn chi nhánh → tab **Phòng** → bấm **Thêm phòng**. Mỗi phòng gồm mã phòng, loại phòng, sức chứa, giá/đêm.",
  },
  {
    q: "Đổi theme sáng/tối?",
    a: "Vào **Cài đặt** → **Giao diện** → chọn Sáng / Tối / Theo hệ thống.",
  },
  {
    q: "Cách thêm nhân viên mới?",
    a: "Vào **Nhân viên** → **Thêm nhân viên** → điền họ tên, email, vai trò, chi nhánh phụ trách → lưu.",
  },
  {
    q: "Xuất báo cáo doanh thu?",
    a: "Vào **Báo cáo** → chọn khoảng thời gian → bấm **Xuất CSV** ở góc trên.",
  },
  {
    q: "Quản lý dịch vụ kèm theo?",
    a: "Vào **Dịch vụ** → bật/tắt dịch vụ, chỉnh giá hoặc thêm dịch vụ mới (ăn sáng, spa, đưa đón sân bay...).",
  },
  {
    q: "Hỗ trợ trực tiếp ở đâu?",
    a: "Gửi email **support@dongtayland.vn** hoặc gọi hotline **1900 6868** (24/7).",
  },
];

const SUGGESTED = [
  "Tạo booking mới",
  "Thêm phòng",
  "Đổi theme",
  "Xuất báo cáo",
];

function matchFaq(text) {
  const t = text.toLowerCase().trim();
  if (!t) return null;
  let best = null;
  let bestScore = 0;
  for (const f of FAQS) {
    const q = f.q.toLowerCase();
    const tokens = q.split(/\s+/).filter((w) => w.length > 2);
    let score = 0;
    for (const tok of tokens) {
      if (t.includes(tok)) score += 1;
    }
    if (t.includes(q.slice(0, Math.min(6, q.length)))) score += 2;
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  }
  return bestScore > 0 ? best : null;
}

function Message({ role, text, time, suggestions, onSuggest }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${isUser ? "order-1" : "order-1"}`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-full bg-brand-600 text-on-accent flex items-center justify-center">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-semibold text-ink-500">Hotel Assistant</span>
          </div>
        )}
        <div
          className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
            isUser
              ? "bg-brand-600 text-on-accent rounded-tr-sm"
              : "bg-white border border-ink-200 text-ink-800 rounded-tl-sm"
          }`}
        >
          {text}
        </div>
        {suggestions && suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggest(s)}
                className="px-2.5 py-1 text-[11px] rounded-full bg-white border border-ink-200 text-ink-700 hover:border-brand-600 hover:text-brand-700 transition flex items-center gap-1"
              >
                {s}
                <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}
        {time && (
          <div className={`text-[10px] text-ink-400 mt-0.5 ${isUser ? "text-right" : ""}`}>
            {time}
          </div>
        )}
      </div>
    </div>
  );
}

function fmtTime(d) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      text: "Xin chào! Tôi là **Hotel Assistant** 👋\nTôi có thể giúp gì cho bạn hôm nay?",
      time: fmtTime(new Date()),
      suggestions: SUGGESTED,
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      const t = e.target;
      if (panelRef.current && panelRef.current.contains(t)) return;
      if (toggleRef.current && toggleRef.current.contains(t)) return;
      setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function pushBot(text, suggestions = []) {
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        role: "bot",
        text,
        time: fmtTime(new Date()),
        suggestions,
      },
    ]);
  }

  function pushUser(text) {
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        role: "user",
        text,
        time: fmtTime(new Date()),
      },
    ]);
  }

  function handleSend(text) {
    const msg = (text ?? input).trim();
    if (!msg) return;
    pushUser(msg);
    setInput("");
    const hit = matchFaq(msg);
    setTimeout(() => {
      if (hit) {
        pushBot(renderInlineInline(hit.a));
      } else {
        pushBot(
          "Xin lỗi, tôi chưa hiểu câu hỏi này. Bạn có thể thử chọn 1 gợi ý bên dưới hoặc mô tả lại giúp tôi nhé.",
          SUGGESTED
        );
      }
    }, 350);
  }

  function handleReset() {
    setMessages([
      {
        id: 1,
        role: "bot",
        text: renderInlineInline(
          "Đã làm mới cuộc hội thoại. Bạn cần hỗ trợ gì?"
        ),
        time: fmtTime(new Date()),
        suggestions: SUGGESTED,
      },
    ]);
  }

  return (
    <>
      <button
        ref={toggleRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Mở chatbot"
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-105 ${
          open ? "bg-ink-700" : "bg-brand-600 hover:bg-brand-700"
        }`}
      >
        {open ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-24 z-50 sm:w-[360px] max-w-[100vw] sm:max-w-[calc(100vw-2rem)] h-[min(560px,calc(100vh-6rem))] sm:h-[520px] max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl border border-ink-200 bg-ink-50 flex flex-col overflow-hidden animate-[slideUp_0.2s_ease-out]"
        >
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-600 text-on-accent flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[13px] sm:text-[14px] leading-tight truncate">
                Hotel Assistant
              </div>
              <div className="text-[10px] text-white/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Đang hoạt động · Trả lời tức thì
              </div>
            </div>
            <button
              onClick={handleReset}
              aria-label="Làm mới"
              className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition shrink-0"
              title="Làm mới cuộc hội thoại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-2.5 sm:px-3 py-3 space-y-3 bg-gradient-to-b from-ink-50 to-white"
          >
            {messages.map((m) => (
              <Message
                key={m.id}
                role={m.role}
                text={typeof m.text === "string" ? renderInline(m.text) : m.text}
                time={m.time}
                suggestions={m.suggestions}
                onSuggest={handleSend}
              />
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-ink-200 bg-white px-2.5 sm:px-3 py-2 sm:py-2.5 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className="flex-1 px-3 py-2 text-[13px] bg-ink-50 rounded-lg border border-transparent focus:border-brand-600 focus:bg-white outline-none transition min-w-0"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-lg bg-brand-600 text-on-accent flex items-center justify-center disabled:bg-ink-300 disabled:cursor-not-allowed hover:bg-brand-700 transition shrink-0"
              aria-label="Gửi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

function renderInlineInline(text) {
  return text;
}
