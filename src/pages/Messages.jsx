import { useState, useRef, useEffect, useMemo } from "react";
import { Icons } from "../components/Icons";
import { branches } from "../data/mockData";
import { formatVND } from "../utils/format";
import { usePalette, TONE } from "../theme/palette";

const {
  MessageCircleMore, Send, Search, MoreHorizontal, Phone, BadgeCheck,
  Paperclip, ImageIcon, Smile, ArrowLeft, X, File, Download, Pin, Trash2,
  UserPlus, Check, CheckCheck, Hourglass, Users, Wallet, MapPin, Clock,
  Utensils, Receipt, Plus, Facebook,
  Instagram, Music2,
} = Icons;

const BRANCH_BY_ID = branches.reduce((a, b) => ((a[b.id] = b), a), {});

/* ═══════ Kênh — màu thương hiệu thật, KHÔNG đổi theo accent (Design.md §2.2) ═══════ */
const CHANNELS = {
  zalo:      { name: "Zalo OA",    icon: Send,             from: "#0068FF", to: "#0ea5e9" },
  messenger: { name: "Messenger",  icon: MessageCircleMore, from: "#4E7FFF", to: "#8A3FFC" },
  tiktok:    { name: "TikTok",     icon: Music2,           from: "#25F4EE", to: "#FE2C55" },
  instagram: { name: "Instagram",  icon: Instagram,        from: "#E1306C", to: "#f97316" },
  facebook:  { name: "Facebook",   icon: Facebook,         from: "#1877F2", to: "#3b82f6" },
};
const CHANNEL_KEYS = Object.keys(CHANNELS);

/* ═══════ Nhãn ngữ cảnh khách hàng ═══════ */
const TAGS = {
  vip:      { label: "VIP",        bg: "#fef1d8", ink: "#b45309" },
  intl:     { label: "Quốc tế",    bg: "#e4f3fe", ink: "#0369a1" },
  influencer:{ label: "Influencer",bg: "#fae2fe", ink: "#a21caf" },
  event:    { label: "Sự kiện",    bg: "#ffe6ea", ink: "#be123c" },
  biz:      { label: "Doanh nghiệp",bg: "#e2fef4", ink: "#0f766e" },
  new:      { label: "Khách mới",  bg: "#eef1f6", ink: "#475569" },
};

const EMOJIS = ["🌴", "🏨", "🍽️", "🍷", "⭐", "👍", "❤️", "😊", "🎉", "🔥", "✨", "🌊", "🥥", "🛫", "💼", "📞", "💡", "🙏"];

const fmtSince = (min) => (min < 60 ? `${min} phút` : `${Math.round(min / 60)} giờ`);

export default function Messages() {
  const { brand } = usePalette();
  const seed = useMemo(buildSeed, []);

  const [convs, setConvs] = useState(seed.conversations);
  const [threads, setThreads] = useState(seed.threads);
  const [activeId, setActiveId] = useState(seed.conversations[0].id);
  const [channel, setChannel] = useState("all");
  const [search, setSearch] = useState("");
  const [showListOnMobile, setShowListOnMobile] = useState(true);
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [typing, setTyping] = useState(false);

  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);
  const menuRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const replyTimer = useRef(null);

  const activeConv = convs.find((c) => c.id === activeId) || convs[0];
  const activeMessages = threads[activeId] || [];

  /* Đánh dấu đã đọc khi mở hội thoại */
  useEffect(() => {
    setConvs((prev) => prev.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c)));
  }, [activeId]);

  /* Đóng popover khi click ra ngoài */
  useEffect(() => {
    const onClick = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuFor(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /* Cuộn xuống đáy khi đổi hội thoại hoặc có tin mới */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeMessages.length, typing]);

  useEffect(() => () => clearTimeout(replyTimer.current), []);

  const filtered = useMemo(() => {
    return convs
      .filter((c) => channel === "all" || c.channel === channel)
      .filter((c) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.lastMsg.toLowerCase().includes(q);
      })
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [convs, channel, search]);

  const totalUnread = convs.reduce((n, c) => n + c.unread, 0);
  const channelCounts = useMemo(() => {
    const m = {};
    for (const c of convs) m[c.channel] = (m[c.channel] || 0) + 1;
    return m;
  }, [convs]);

  const selectConv = (id) => {
    setActiveId(id);
    setShowListOnMobile(false);
    setShowEmoji(false);
    setSelectedFile(null);
    setInputText("");
  };

  const togglePin = (id) => {
    setConvs((p) => p.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
    setMenuFor(null);
  };

  const addToGroup = (id) => {
    setMenuFor(null);
    setConvs((p) => p.map((c) => (c.id === id ? { ...c, addedToGroup: true } : c)));
  };

  const deleteConv = (id) => {
    setConvs((p) => p.filter((c) => c.id !== id));
    setMenuFor(null);
    if (activeId === id) {
      const rest = convs.filter((c) => c.id !== id);
      if (rest.length) setActiveId(rest[0].id);
    }
  };

  const sendMessage = (text, file) => {
    if (!text?.trim() && !file) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const msg = { id: `m${Date.now()}`, from: "us", text: text?.trim() || "", time, status: "sent",
                  file: file ? { name: file.name, size: file.size } : null };

    setThreads((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), msg] }));
    setConvs((prev) => prev.map((c) => (c.id === activeId
      ? { ...c, lastMsg: `Bạn: ${text?.trim() || "Đã gửi tệp đính kèm"}`, time: "Vừa xong" }
      : c)));

    // Mô phỏng đối phương đang gõ rồi phản hồi — cho cảm giác hội thoại thật
    clearTimeout(replyTimer.current);
    setTyping(true);
    replyTimer.current = setTimeout(() => {
      setTyping(false);
      const reply = pickAutoReply(activeConv, text);
      if (!reply) return;
      const now2 = new Date();
      const t2 = `${String(now2.getHours()).padStart(2, "0")}:${String(now2.getMinutes()).padStart(2, "0")}`;
      setThreads((prev) => ({
        ...prev,
        [activeId]: [
          ...(prev[activeId] || []).map((m) => (m.from === "us" ? { ...m, status: "read" } : m)),
          { id: `m${Date.now() + 1}`, from: "them", text: reply, time: t2 },
        ],
      }));
      setConvs((prev) => prev.map((c) => (c.id === activeId ? { ...c, lastMsg: reply, time: "Vừa xong" } : c)));
    }, 1400 + Math.random() * 900);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    sendMessage(inputText, selectedFile);
    setInputText("");
    setSelectedFile(null);
    setShowEmoji(false);
  };

  const sendQuickReply = (text) => sendMessage(text);

  return (
    <div className="max-w-[1360px] mx-auto w-full flex-1 min-h-0 flex flex-col">

      {/* ═══ HEADER — gọn, 2 dòng, không chiếm chỗ của khung chat ═══ */}
      <div className="flex items-center justify-between gap-3 pb-3.5 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
               style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})`,
                        boxShadow: `0 6px 14px -7px ${brand.from}` }}>
            <MessageCircleMore className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-[19px] leading-none truncate" style={{ color: "var(--fg)" }}>
              Tin nhắn
            </h1>
            <div className="text-[12px] mt-1 truncate" style={{ color: "var(--fg-muted)" }}>
              <b className="font-extrabold" style={{ color: "var(--fg)" }}>{totalUnread}</b> tin chưa đọc · Hợp nhất {CHANNEL_KEYS.length} nền tảng · {convs.length} hội thoại
            </div>
          </div>
        </div>
        <button className="glowbtn inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-bold text-white shrink-0"
                style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})`,
                         boxShadow: `0 6px 14px -6px ${brand.from}a6` }}>
          <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Hội thoại mới</span>
        </button>
      </div>

      {/* ═══ BẢNG 2 CỘT — chiếm hết phần còn lại, tự cuộn bên trong ═══ */}
      <div className="flex-1 min-h-0 rounded-[var(--r)] border overflow-hidden"
           style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="grid grid-cols-12 h-full min-h-0">

          {/* ── DANH SÁCH ── */}
          <div className={`col-span-12 md:col-span-4 lg:col-span-4 border-r flex-col min-h-0 ${showListOnMobile ? "flex" : "hidden md:flex"}`}
               style={{ borderColor: "var(--border-soft)" }}>
            <div className="p-3 border-b shrink-0 space-y-2.5" style={{ borderColor: "var(--border-soft)" }}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-subtle)" }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                       placeholder="Tìm hội thoại, khách hàng…"
                       className="w-full h-10 pl-10 pr-3 rounded-full text-[13px] border-0 outline-none"
                       style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }} />
              </div>

              {/* Tab nền tảng — thuộc về danh sách hội thoại nên đặt ngay trong cột này,
                  không phải một hàng riêng chiếm hết chiều rộng trang */}
              <div className="noscroll flex items-center gap-1.5 overflow-x-auto">
                <ChChip active={channel === "all"} onClick={() => setChannel("all")}
                        icon={MessageCircleMore} from="#475569" to="#1e293b" label="Tất cả" count={convs.length} />
                {CHANNEL_KEYS.map((k) => (
                  <ChChip key={k} active={channel === k} onClick={() => setChannel(channel === k ? "all" : k)}
                          icon={CHANNELS[k].icon} from={CHANNELS[k].from} to={CHANNELS[k].to}
                          label={CHANNELS[k].name.replace(" OA", "")} count={channelCounts[k] || 0} />
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-[12.5px]" style={{ color: "var(--fg-subtle)" }}>
                  Không tìm thấy hội thoại nào
                </div>
              ) : filtered.map((c) => (
                <ConvItem key={c.id} c={c} active={c.id === activeId}
                          menuOpen={menuFor === c.id}
                          onOpenMenu={() => setMenuFor(menuFor === c.id ? null : c.id)}
                          menuRef={menuFor === c.id ? menuRef : null}
                          onSelect={() => selectConv(c.id)}
                          onPin={() => togglePin(c.id)}
                          onAddGroup={() => addToGroup(c.id)}
                          onDelete={() => deleteConv(c.id)} />
              ))}
            </div>
          </div>

          {/* ── CHAT ── */}
          <div className={`col-span-12 md:col-span-8 lg:col-span-8 flex-col min-h-0 ${!showListOnMobile ? "flex" : "hidden md:flex"}`}
               style={{ backgroundColor: "var(--surface-2)" }}>

            {/* Header hội thoại */}
            <ChatHeader conv={activeConv} onBack={() => setShowListOnMobile(true)} />

            {/* Thanh ngữ cảnh đơn hàng / booking */}
            {activeConv.context && <ContextBar ctx={activeConv.context} />}

            {/* Dòng tin nhắn */}
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
              {activeMessages.map((m, i) => (
                <Bubble key={m.id} m={m} conv={activeConv}
                        isLastOwn={m.from === "us" && !activeMessages.slice(i + 1).some((x) => x.from === "us")} />
              ))}
              {typing && <TypingBubble conv={activeConv} />}
            </div>

            {/* Gợi ý trả lời nhanh theo ngữ cảnh */}
            {activeConv.quickReplies?.length > 0 && (
              <div className="noscroll px-4 sm:px-5 pb-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
                {activeConv.quickReplies.map((q) => (
                  <button key={q} onClick={() => sendQuickReply(q)}
                          className="shrink-0 h-8 px-3 rounded-full text-[12px] font-semibold border transition hover:border-current"
                          style={{ borderColor: "var(--border)", color: "var(--fg-muted)", backgroundColor: "var(--surface)" }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <Composer
              channel={CHANNELS[activeConv.channel]}
              value={inputText} onChange={setInputText}
              onSubmit={handleSubmit}
              selectedFile={selectedFile} onFile={setSelectedFile}
              showEmoji={showEmoji} onToggleEmoji={() => setShowEmoji((v) => !v)}
              emojiRef={emojiRef} fileInputRef={fileInputRef} textareaRef={textareaRef}
              brand={brand} onPickEmoji={(e) => setInputText((t) => t + e)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ MỤC HỘI THOẠI ═══════════════ */
function ConvItem({ c, active, onSelect, menuOpen, onOpenMenu, menuRef, onPin, onAddGroup, onDelete }) {
  const ch = CHANNELS[c.channel];
  return (
    <div className="relative group">
      <button onClick={onSelect}
              className="w-full flex items-start gap-3 px-3.5 py-3 border-l-[3px] text-left transition"
              style={{ borderColor: active ? ch.from : "transparent",
                       backgroundColor: active ? "var(--surface-2)" : "transparent" }}>
        <div className="relative shrink-0">
          <Avatar src={c.avatar} name={c.name} size={44} from={ch.from} to={ch.to} />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white ring-2"
                style={{ background: `linear-gradient(135deg,${ch.from},${ch.to})`, "--tw-ring-color": "var(--surface)" }}>
            <ch.icon className="w-2.5 h-2.5" />
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <span className={`text-[13.5px] truncate ${c.unread > 0 ? "font-extrabold" : "font-bold"}`}
                    style={{ color: "var(--fg)" }}>{c.name}</span>
              {c.verified && <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "#0ea5e9" }} />}
              {c.pinned && <Pin className="w-3 h-3 shrink-0 rotate-45" style={{ color: "#f59e0b", fill: "#f59e0b" }} />}
            </div>
            <span className="text-[10.5px] shrink-0 tabular-nums" style={{ color: "var(--fg-subtle)" }}>{c.time}</span>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <p className={`text-[12px] truncate flex-1 ${c.unread > 0 ? "font-bold" : ""}`}
               style={{ color: c.unread > 0 ? "var(--fg)" : "var(--fg-muted)" }}>{c.lastMsg}</p>
            {c.unread > 0 && (
              <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center"
                    style={{ backgroundColor: TONE.danger.dot }}>{c.unread}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <MiniPill style={{ backgroundColor: `${ch.from}17`, color: ch.from }}>
              {ch.name.replace(" OA", "").toUpperCase()}
            </MiniPill>
            {c.branchId && (
              <MiniPill style={{ backgroundColor: "var(--surface-3)", color: "var(--fg-muted)" }}>
                {BRANCH_BY_ID[c.branchId]?.code}
              </MiniPill>
            )}
            {c.tag && (
              <MiniPill style={{ backgroundColor: TAGS[c.tag].bg, color: TAGS[c.tag].ink }}>
                #{TAGS[c.tag].label}
              </MiniPill>
            )}
          </div>
        </div>
      </button>

      <button onClick={(e) => { e.stopPropagation(); onOpenMenu(); }}
              aria-label="Tùy chọn hội thoại"
              className="absolute right-2 bottom-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--fg-muted)" }}>
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>

      {menuOpen && (
        <div ref={menuRef}
             className="absolute right-2 bottom-11 z-20 w-48 rounded-2xl p-1.5"
             style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 18px 40px -14px rgba(0,0,0,.3)" }}>
          <MenuRow icon={Pin} label={c.pinned ? "Bỏ ghim" : "Ghim hội thoại"} onClick={onPin} />
          <MenuRow icon={UserPlus} label={c.addedToGroup ? "Đã thêm vào nhóm" : "Thêm vào nhóm"} onClick={onAddGroup} disabled={c.addedToGroup} />
          <MenuRow icon={Trash2} label="Xóa hội thoại" onClick={onDelete} danger />
        </div>
      )}
    </div>
  );
}

function MiniPill({ children, style }) {
  return (
    <span className="inline-flex items-center px-1.5 h-[18px] rounded-full text-[9.5px] font-extrabold whitespace-nowrap" style={style}>
      {children}
    </span>
  );
}

function MenuRow({ icon: Icon, label, onClick, danger, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
            className="w-full flex items-center gap-2.5 px-3 h-9 rounded-xl text-[12.5px] font-semibold transition disabled:opacity-50"
            style={{ color: danger ? TONE.danger.ink : "var(--fg)" }}
            onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = "var(--surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

/* ═══════════════ HEADER CHAT ═══════════════ */
function ChatHeader({ conv, onBack }) {
  const ch = CHANNELS[conv.channel];
  const branch = conv.branchId ? BRANCH_BY_ID[conv.branchId] : null;
  return (
    <div className="px-4 sm:px-5 py-3.5 border-b flex items-center gap-3 shrink-0"
         style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface)" }}>
      <button onClick={onBack} className="md:hidden p-1.5 -ml-1 rounded-full shrink-0" style={{ color: "var(--fg-muted)" }} aria-label="Quay lại">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative shrink-0">
        <Avatar src={conv.avatar} name={conv.name} size={40} from={ch.from} to={ch.to} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-display font-extrabold text-[14.5px] truncate" style={{ color: "var(--fg)" }}>{conv.name}</span>
          {conv.verified && <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: "#0ea5e9" }} />}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-[11.5px] flex-wrap" style={{ color: "var(--fg-muted)" }}>
          <span className="inline-flex items-center gap-1 font-bold" style={{ color: ch.from }}>
            <ch.icon className="w-3 h-3" /> {ch.name}
          </span>
          {conv.phone && <><span className="opacity-40">·</span><span className="tabular-nums">{conv.phone}</span></>}
          {branch && <><span className="opacity-40">·</span><span>{branch.name}</span></>}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <HeaderIconBtn title="Gọi điện"><Phone className="w-4 h-4" /></HeaderIconBtn>
        <HeaderIconBtn title="Hồ sơ khách hàng"><Users className="w-4 h-4" /></HeaderIconBtn>
        {conv.context?.orderCode && <HeaderIconBtn title="Xem đơn hàng"><Receipt className="w-4 h-4" /></HeaderIconBtn>}
        <HeaderIconBtn title="Thêm"><MoreHorizontal className="w-4 h-4" /></HeaderIconBtn>
      </div>
    </div>
  );
}

function HeaderIconBtn({ children, title }) {
  return (
    <button title={title} aria-label={title}
            className="w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-ink-100"
            style={{ color: "var(--fg-muted)" }}>
      {children}
    </button>
  );
}

/* ═══════════════ THANH NGỮ CẢNH ═══════════════ */
function ContextBar({ ctx }) {
  const urgent = ctx.slaMinutes != null && ctx.slaMinutes <= 10;
  return (
    <div className="px-4 sm:px-5 py-2.5 border-b flex items-center gap-2 flex-wrap shrink-0 text-[11.5px]"
         style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface)" }}>
      {ctx.orderCode && (
        <CtxChip icon={Receipt} tone="violet">Đơn #{ctx.orderCode}</CtxChip>
      )}
      {ctx.table && <CtxChip icon={Utensils}>{ctx.table}</CtxChip>}
      {ctx.branchId && <CtxChip icon={MapPin}>{BRANCH_BY_ID[ctx.branchId]?.name}</CtxChip>}
      {ctx.guests && <CtxChip icon={Users}>{ctx.guests} khách</CtxChip>}
      {ctx.time && <CtxChip icon={Clock}>{ctx.time}</CtxChip>}
      {ctx.amount && (
        <CtxChip icon={Wallet} tone="success">{formatVND(ctx.amount)}</CtxChip>
      )}
      {ctx.slaMinutes != null && (
        <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11px] font-extrabold"
              style={urgent ? { backgroundColor: TONE.danger.bg, color: TONE.danger.ink }
                             : { backgroundColor: TONE.warning.bg, color: TONE.warning.ink }}>
          {urgent && (
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full opacity-75 animate-ping" style={{ backgroundColor: TONE.danger.dot }} />
              <span className="relative w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TONE.danger.dot }} />
            </span>
          )}
          <Hourglass className="w-3 h-3" /> SLA {fmtSince(ctx.slaMinutes)}
        </span>
      )}
    </div>
  );
}

function CtxChip({ icon: Icon, children, tone }) {
  const t = tone === "violet" ? { bg: "#f1ecfe", ink: "#6d28d9" }
          : tone === "success" ? { bg: TONE.success.bg, ink: TONE.success.ink }
          : { bg: "var(--surface-2)", ink: "var(--fg-muted)" };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full font-bold whitespace-nowrap"
          style={{ backgroundColor: t.bg, color: t.ink }}>
      <Icon className="w-3 h-3" /> {children}
    </span>
  );
}

/* ═══════════════ BONG BÓNG TIN NHẮN ═══════════════ */
function Bubble({ m, conv, isLastOwn }) {
  const isUs = m.from === "us";
  const ch = CHANNELS[conv.channel];
  return (
    <div className={`flex items-end gap-2 ${isUs ? "justify-end" : "justify-start"}`}>
      {!isUs && <Avatar src={conv.avatar} name={conv.name} size={26} from={ch.from} to={ch.to} className="mb-0.5" />}
      <div className={`flex flex-col ${isUs ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[65%]`}>
        <div className="px-3.5 py-2.5 text-[13.5px] leading-relaxed"
             style={isUs
               ? { background: `linear-gradient(135deg,${ch.from},${ch.to})`, color: "#fff",
                   borderRadius: "16px 16px 4px 16px" }
               : { backgroundColor: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border)",
                   borderRadius: "16px 16px 16px 4px" }}>
          {m.text && <div className="whitespace-pre-line break-words">{m.text}</div>}
          {m.file && <FileCard file={m.file} isUs={isUs} />}
        </div>
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[10px] tabular-nums" style={{ color: "var(--fg-subtle)" }}>{m.time}</span>
          {isUs && isLastOwn && (
            m.status === "read"
              ? <CheckCheck className="w-3.5 h-3.5" style={{ color: ch.from }} />
              : <Check className="w-3.5 h-3.5" style={{ color: "var(--fg-subtle)" }} />
          )}
        </div>
      </div>
    </div>
  );
}

function FileCard({ file, isUs }) {
  return (
    <div className="mt-2 p-2.5 rounded-xl flex items-center gap-2.5 min-w-[200px]"
         style={{ backgroundColor: isUs ? "rgba(255,255,255,.16)" : "var(--surface-2)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
           style={{ backgroundColor: isUs ? "rgba(255,255,255,.18)" : "var(--surface-3)", color: isUs ? "#fff" : "var(--fg-muted)" }}>
        <File className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="text-[11.5px] font-bold truncate">{file.name}</div>
        <div className="text-[10px] mt-0.5 opacity-75">{(file.size / 1024).toFixed(1)} KB</div>
      </div>
      <Download className="w-4 h-4 shrink-0 opacity-80" />
    </div>
  );
}

function TypingBubble({ conv }) {
  const ch = CHANNELS[conv.channel];
  return (
    <div className="flex items-end gap-2 justify-start">
      <Avatar src={conv.avatar} name={conv.name} size={26} from={ch.from} to={ch.to} className="mb-0.5" />
      <div className="px-4 py-3 flex items-center gap-1" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px 16px 16px 4px" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ backgroundColor: "var(--fg-subtle)", animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ Ô SOẠN TIN ═══════════════ */
function Composer({ channel, value, onChange, onSubmit, selectedFile, onFile, showEmoji, onToggleEmoji,
                     emojiRef, fileInputRef, textareaRef, brand, onPickEmoji }) {
  return (
    <div className="p-3 sm:p-3.5 border-t relative shrink-0" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface)" }}>
      <input ref={fileInputRef} type="file" className="hidden"
             onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {selectedFile && (
        <div className="flex items-center justify-between px-3 h-9 rounded-full mb-2 text-[12px]"
             style={{ backgroundColor: "var(--surface-2)", color: "var(--fg-muted)" }}>
          <span className="flex items-center gap-2 truncate">
            <File className="w-3.5 h-3.5 shrink-0" style={{ color: channel.from }} />
            <span className="font-semibold truncate">{selectedFile.name}</span>
          </span>
          <button onClick={() => onFile(null)} aria-label="Bỏ tệp"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {showEmoji && (
        <div ref={emojiRef}
             className="absolute bottom-[72px] left-3 z-30 w-64 rounded-2xl p-3"
             style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 18px 40px -14px rgba(0,0,0,.3)" }}>
          <div className="grid grid-cols-6 gap-1.5">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => onPickEmoji(e)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[17px] transition hover:bg-ink-100">
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <div className="flex items-center gap-0.5 shrink-0 pb-1">
          <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-ink-100" style={{ color: "var(--fg-muted)" }} title="Đính kèm tệp">
            <Paperclip className="w-[18px] h-[18px]" />
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-ink-100" style={{ color: "var(--fg-muted)" }} title="Gửi ảnh">
            <ImageIcon className="w-[18px] h-[18px]" />
          </button>
          <button type="button" onClick={onToggleEmoji}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-ink-100"
                  style={{ color: showEmoji ? channel.from : "var(--fg-muted)" }} title="Emoji">
            <Smile className="w-[18px] h-[18px]" />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
          placeholder={`Trả lời qua ${channel.name}…`}
          rows={1}
          className="flex-1 min-w-0 max-h-[110px] resize-none px-3.5 py-2.5 rounded-2xl text-[13.5px] outline-none border-0"
          style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }}
        />

        <button type="submit" disabled={!value.trim() && !selectedFile}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 transition disabled:opacity-40"
                style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }} title="Gửi">
          <Send className="w-[18px] h-[18px]" />
        </button>
      </form>
    </div>
  );
}

/* ═══════════════ CHIP KÊNH LỌC ═══════════════ */
/* Tab nền tảng — cỡ nhỏ để vừa cột danh sách 320px thay vì chiếm cả hàng ngang trang */
function ChChip({ active, onClick, label, count, from, to, icon: Icon }) {
  return (
    <button onClick={onClick}
            className="shrink-0 inline-flex items-center gap-1.5 h-7 pl-2.5 pr-2 rounded-full text-[11.5px] font-bold border transition-all duration-200"
            style={active
              ? { background: `linear-gradient(135deg,${from},${to})`, color: "#fff", borderColor: "transparent", boxShadow: `0 4px 10px -4px ${from}` }
              : { backgroundColor: "var(--surface-2)", color: "var(--fg-muted)", borderColor: "transparent" }}>
      <Icon className="w-3 h-3 shrink-0" style={active ? undefined : { color: from }} />
      {label}
      <span className="text-[10px] font-extrabold px-1 rounded-full tabular-nums"
            style={active ? { backgroundColor: "rgba(255,255,255,.25)", color: "#fff" } : { backgroundColor: "var(--surface-3)", color: "var(--fg-muted)" }}>
        {count}
      </span>
    </button>
  );
}

/* ═══════════════ AVATAR ═══════════════ */
function Avatar({ src, name, size = 40, from, to, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(false), [src]);
  const initials = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={`relative rounded-full shrink-0 overflow-hidden flex items-center justify-center font-extrabold text-white ${className}`}
         style={{ width: size, height: size, background: `linear-gradient(135deg,${from},${to})`, fontSize: size * 0.36 }}>
      <span>{initials}</span>
      {src && (
        <img src={src} alt="" onLoad={() => setLoaded(true)}
             className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
             style={{ opacity: loaded ? 1 : 0 }} />
      )}
    </div>
  );
}

/* ═══════════════ DỮ LIỆU MOCK — HỘI THOẠI THẬT ═══════════════ */

const AVA = (n) => `https://i.pravatar.cc/120?img=${n}`;
const [DH, HT, LA, TN] = branches.map((b) => b.id);

function pickAutoReply(conv, sentText) {
  const t = (sentText || "").toLowerCase();
  if (t.includes("cảm ơn")) return "Dạ em cảm ơn anh/chị đã tin tưởng Condo HUB ạ 🌴";
  if (t.includes("bếp") || t.includes("chuẩn bị")) return "Dạ vâng, em chờ nhé!";
  if (t.includes("quản lý") || t.includes("kiểm tra")) return "Dạ em cảm ơn, mong được hỗ trợ sớm ạ.";
  const pool = conv.autoReplies || ["Dạ em đã nhận được thông tin ạ.", "Vâng, em cảm ơn anh/chị nhiều 🙏", "Dạ để em kiểm tra rồi phản hồi ngay ạ."];
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildSeed() {
  const conversations = [
    {
      id: "c1", name: "Nguyễn Minh K.", verified: true, avatar: AVA(12), phone: "0901 234 567",
      channel: "zalo", branchId: HT, tag: "vip", unread: 2, pinned: false, time: "2 phút",
      lastMsg: "Mình muốn đặt thêm phần bào ngư Đài Loan cho 4 người, có cần báo trước không?",
      context: { orderCode: "A261", table: "Bàn 14 (4 chỗ)", branchId: HT, guests: 4, time: "12:30 hôm nay", amount: 4250000, slaMinutes: 5 },
      quickReplies: ["Cảm ơn anh/chị đã phản hồi", "Bếp đang chuẩn bị", "Báo quản lý kiểm tra"],
      autoReplies: ["Dạ vậy nhờ nhà hàng chuẩn bị giúp mình nhé, cảm ơn!", "Ok bạn, mình chờ xác nhận nha."],
    },
    {
      id: "c2", name: "Phạm Văn Tuấn", verified: false, avatar: AVA(15), phone: "0978 112 233",
      channel: "zalo", branchId: DH, tag: "new", unread: 0, pinned: false, time: "38 phút",
      lastMsg: "Dạ có ạ, khu vực garden cho phép mang pet nhé anh/chị 🐾",
      context: null,
      quickReplies: ["Cần thêm thông tin gì cứ nhắn nhé", "Gửi anh/chị bảng giá phòng pet-friendly"],
      autoReplies: ["Cảm ơn bạn nhiều, mình sẽ đặt phòng trong tuần này!", "Vậy để mình xem lịch rồi báo lại."],
    },
    {
      id: "c3", name: "Sarah Lee", verified: true, avatar: AVA(47), phone: "+65 9123 4567",
      channel: "messenger", branchId: HT, tag: "intl", unread: 1, pinned: false, time: "6 phút",
      lastMsg: "Perfect! And can the chef avoid shrimp in all dishes? My daughter is allergic.",
      context: { branchId: HT, guests: 6, time: "19:00 tối nay" },
      quickReplies: ["Đã ghi chú dị ứng của quý khách", "Chuyển bếp trưởng xử lý", "Xin lỗi vì bất tiện"],
      autoReplies: ["Thank you so much for the quick response!", "That's very kind, see you tonight then."],
    },
    {
      id: "c4", name: "Lê Hoàng Cường", verified: false, avatar: AVA(22), phone: "0912 445 998",
      channel: "messenger", branchId: TN, tag: "new", unread: 0, pinned: false, time: "1 giờ",
      lastMsg: "Bạn có thể gửi lịch trình spa cuối tuần này không?",
      context: null,
      quickReplies: ["Gửi lịch trình spa cuối tuần", "Ưu đãi combo spa 2 người"],
      autoReplies: ["Cảm ơn shop, để mình xem qua rồi đặt lịch.", "Giá này ổn đó, mình đặt luôn nhé."],
    },
    {
      id: "c5", name: "@ngocxin.dalat", verified: true, avatar: null, phone: null,
      channel: "tiktok", branchId: LA, tag: "influencer", unread: 3, pinned: true, time: "9 phút",
      lastMsg: "Reply nhanh giúp mình nha, video đang lên xu hướng 🔥",
      context: null,
      quickReplies: ["Cảm ơn bạn đã quan tâm", "Đội Marketing sẽ liên hệ sớm", "Gửi bảng giá hợp tác KOL"],
      autoReplies: ["Dạ em cảm ơn ạ, em chờ tin nha 🙏", "Video em quay hôm bữa view tăng dữ lắm luôn!"],
    },
    {
      id: "c6", name: "@minhtu.travel", verified: false, avatar: null, phone: null,
      channel: "tiktok", branchId: null, tag: "influencer", unread: 0, pinned: false, time: "3 giờ",
      lastMsg: "Mã giảm giá TIKTOK50 áp dụng đến khi nào vậy ạ?",
      context: null,
      quickReplies: ["Mã áp dụng đến 31/08", "Chỉ áp dụng cuối tuần"],
      autoReplies: ["Dạ em cảm ơn thông tin ạ!", "Ok em đặt thử ngay đây."],
    },
    {
      id: "c7", name: "@tran_lan_phuong", verified: false, avatar: null, phone: "0933 771 200",
      channel: "instagram", branchId: DH, tag: "event", unread: 1, pinned: false, time: "22 phút",
      lastMsg: "Dạ nhận được rồi ạ, báo sales đầu giờ chiều liên hệ anh/chị nhé.",
      context: { branchId: DH, guests: 120, time: "Sự kiện 15/09" },
      quickReplies: ["Đã chuyển bộ phận Sales", "Xác nhận lịch khảo sát venue", "Gửi báo giá tổ chức sự kiện"],
      autoReplies: ["Dạ em cảm ơn, em chờ anh/chị bên Sales ạ.", "Em cần khảo sát venue trước khi chốt số lượng khách."],
    },
    {
      id: "c8", name: "Đoàn VNG (24)", verified: true, avatar: AVA(31), phone: "028 3822 1190",
      channel: "facebook", branchId: DH, tag: "biz", unread: 0, pinned: true, time: "1 giờ",
      lastMsg: "Dạ đón tiếp đoàn anh/chị ạ, phòng họp đã setup xong 🎉",
      context: { branchId: DH, guests: 24, time: "08:00 mai", amount: 62000000 },
      quickReplies: ["Xác nhận danh sách phòng", "Gửi lịch trình 2 ngày 1 đêm", "Báo kế toán xuất hóa đơn"],
      autoReplies: ["Cảm ơn team Condo HUB, hẹn gặp ngày mai!", "Bên mình cần thêm 1 phòng họp nhỏ nữa được không?"],
    },
    {
      id: "c9", name: "Trần Thị Bích", verified: false, avatar: AVA(9), phone: "0987 234 561",
      channel: "facebook", branchId: HT, tag: "vip", unread: 1, pinned: false, time: "4 phút",
      lastMsg: "Cho mình đặt thêm 2 chai nước suối và khăn tắm lên phòng 512 nhé",
      context: { branchId: HT, time: "Phòng 512" },
      quickReplies: ["Đã báo housekeeping mang lên", "5 phút nữa sẽ có mặt tại phòng"],
      autoReplies: ["Cảm ơn bạn, nhanh quá!", "Ok mình chờ nhé."],
    },
    {
      id: "c10", name: "Booking Support", verified: true, avatar: AVA(68), phone: null,
      channel: "facebook", branchId: null, tag: "biz", unread: 0, pinned: false, time: "Hôm qua",
      lastMsg: "Có 3 đánh giá mới cần phản hồi trên trang của bạn.",
      context: null,
      quickReplies: ["Đã phản hồi toàn bộ đánh giá", "Chuyển bộ phận CSKH xử lý"],
      autoReplies: ["Đã ghi nhận, cảm ơn đối tác."],
    },
    {
      id: "c11", name: "Nguyễn Thị Hoa", verified: false, avatar: AVA(29), phone: "0909 887 765",
      channel: "facebook", branchId: TN, tag: "new", unread: 0, pinned: false, time: "Hôm qua",
      lastMsg: "Chị check-out sớm được không, chị có việc gấp cần bay lúc trưa.",
      context: { branchId: TN, time: "Check-out 10:00" },
      quickReplies: ["Dạ hỗ trợ check-out sớm miễn phí", "Lễ tân chuẩn bị hoá đơn ngay ạ"],
      autoReplies: ["Cảm ơn em nhiều nha, chị ra ngay đây."],
    },
  ];

  const threads = {
    c1: [
      { id: "t1", from: "them", text: "Cho mình hỏi món Wagyu còn không ạ?", time: "09:18" },
      { id: "t2", from: "us", text: "Dạ còn ạ, bếp vừa nhập thêm 2kg Wagyu A5 sáng nay 🥩", time: "09:19", status: "read" },
      { id: "t3", from: "them", text: "Mình muốn đặt thêm phần bào ngư Đài Loan cho 4 người, có cần báo trước không?", time: "09:22" },
      { id: "t4", from: "us", text: "Dạ anh/chị cho em xin đơn hiện tại để em cập nhật phần bào ngư vào ạ, khoảng 15 phút bếp sẽ chuẩn bị xong.", time: "09:24", status: "sent" },
    ],
    c2: [
      { id: "t1", from: "them", text: "Chào shop, khu vực garden của Condo HUB có cho mang thú cưng không ạ?", time: "Hôm qua" },
      { id: "t2", from: "us", text: "Dạ có ạ, khu vực garden cho phép mang pet nhé anh/chị 🐾\nChỉ cần đăng ký trước với lễ tân khi check-in.", time: "Hôm qua", status: "read" },
      { id: "t3", from: "them", text: "Dạ có ạ, khu vực garden cho phép mang pet nhé anh/chị 🐾", time: "09:41" },
    ],
    c3: [
      { id: "t1", from: "them", text: "Hi, we booked a table for 6 at Hồ Tràm tonight at 7PM.", time: "10:02" },
      { id: "t2", from: "us", text: "Hello Sarah! Yes, we've confirmed your table for 6 at 19:00 tonight 🌊", time: "10:05", status: "read" },
      { id: "t3", from: "them", text: "Perfect! And can the chef avoid shrimp in all dishes? My daughter is allergic.", time: "10:07" },
    ],
    c4: [
      { id: "t1", from: "them", text: "Cho mình hỏi bảng giá dịch vụ Spa của chi nhánh Tây Ninh với.", time: "Hôm qua" },
      { id: "t2", from: "us", text: "Dạ em gửi chị bảng giá Spa chi tiết ạ. Gói massage body 60 phút là 890K.", time: "Hôm qua", status: "read" },
      { id: "t3", from: "them", text: "Bạn có thể gửi lịch trình spa cuối tuần này không?", time: "08:12" },
    ],
    c5: [
      { id: "t1", from: "them", text: "Chào Condo HUB, mình muốn hợp tác quay video review resort ạ.", time: "08:40" },
      { id: "t2", from: "us", text: "Dạ em chào bạn! Condo HUB rất mong được hợp tác cùng bạn ạ 🌴", time: "08:45", status: "read" },
      { id: "t3", from: "them", text: "Video hôm bữa mình quay ở Hồ Tràm đang lên xu hướng nè, tag Condo HUB vô luôn 🔥", time: "09:10" },
      { id: "t4", from: "them", text: "Reply nhanh giúp mình nha, video đang lên xu hướng 🔥", time: "09:20" },
    ],
    c6: [
      { id: "t1", from: "them", text: "Mã giảm giá TIKTOK50 áp dụng đến khi nào vậy ạ?", time: "3 giờ trước" },
    ],
    c7: [
      { id: "t1", from: "them", text: "Chào Condo HUB, mình cần tổ chức tiệc cưới khoảng 120 khách vào 15/09.", time: "Hôm qua" },
      { id: "t2", from: "us", text: "Dạ chào anh/chị, Condo HUB Đức Hòa có sảnh tiệc ngoài trời sức chứa 150 khách rất phù hợp ạ 🎉", time: "Hôm qua", status: "read" },
      { id: "t3", from: "them", text: "Dạ nhận được rồi ạ, báo sales đầu giờ chiều liên hệ anh/chị nhé.", time: "13:02" },
    ],
    c8: [
      { id: "t1", from: "them", text: "Đoàn công ty VNG 24 người sẽ đến lúc 08:00 sáng mai, đã book 2 phòng họp.", time: "Hôm qua" },
      { id: "t2", from: "us", text: "Dạ Condo HUB đã ghi nhận đoàn 24 khách, 2 phòng họp cho ngày mai ạ. Tổng chi phí tạm tính 62 triệu.", time: "Hôm qua", status: "read" },
      { id: "t3", from: "them", text: "Dạ đón tiếp đoàn anh/chị ạ, phòng họp đã setup xong 🎉", time: "16:30", status: "sent" },
    ],
    c9: [
      { id: "t1", from: "them", text: "Cho mình đặt thêm 2 chai nước suối và khăn tắm lên phòng 512 nhé", time: "09:55" },
    ],
    c10: [
      { id: "t1", from: "them", text: "[Hệ thống] Có 3 đánh giá mới trên trang của bạn cần phản hồi.", time: "Hôm qua" },
      { id: "t2", from: "us", text: "Đã nhận, đang chuẩn bị mẫu phản hồi khách hàng.", time: "Hôm qua", status: "read" },
    ],
    c11: [
      { id: "t1", from: "them", text: "Chị muốn đổi lịch bay nên cần check-out sớm hơn dự kiến.", time: "Hôm qua" },
      { id: "t2", from: "us", text: "Dạ được ạ, chị dự kiến check-out lúc mấy giờ để lễ tân chuẩn bị hóa đơn ạ?", time: "Hôm qua", status: "read" },
      { id: "t3", from: "them", text: "Chị check-out sớm được không, chị có việc gấp cần bay lúc trưa.", time: "07:30" },
    ],
  };

  return { conversations, threads };
}
