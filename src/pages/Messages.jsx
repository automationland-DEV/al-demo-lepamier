import { useState, useRef, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";

const {
  MessageSquare, Send, Search, MoreHorizontal, Phone, Video, Paperclip,
  Smile, ArrowLeft, X, File, Download, Circle, Pin, Trash2, UserPlus
} = Icons;

const conversations = [
  { id: 1, name: "Nguyễn Văn An", avatar: "https://i.pravatar.cc/100?img=33", lastMsg: "Cảm ơn anh/chị đã đặt phòng tại Le Palmier!", time: "Vừa xong", unread: 2, online: true },
  { id: 2, name: "Trần Thị Bình", avatar: "https://i.pravatar.cc/100?img=5", lastMsg: "Vui lòng cho tôi phòng view biển nhé", time: "5 phút", unread: 0, online: true },
  { id: 3, name: "Lê Hoàng Cường", avatar: "https://i.pravatar.cc/100?img=12", lastMsg: "Bạn có thể gửi lịch trình spa không?", time: "15 phút", unread: 1, online: false },
  { id: 4, name: "Booking.com Support", avatar: "https://i.pravatar.cc/100?img=68", lastMsg: "Có 5 đánh giá mới cần phản hồi", time: "1 giờ", unread: 5, online: false },
  { id: 5, name: "Phạm Minh Dũng", avatar: "https://i.pravatar.cc/100?img=15", lastMsg: "Check-out sớm được không?", time: "2 giờ", unread: 0, online: false },
];

const mockMessagesByThread = {
  1: [
    { id: 1, from: "them", text: "Chào anh/chị, tôi vừa đặt phòng Deluxe 3 đêm tại Le Palmier Hồ Tràm", time: "10:30" },
    { id: 2, from: "us", text: "Chào anh! Cảm ơn anh đã chọn Le Palmier 🌴\nChúng tôi đã ghi nhận booking của anh từ ngày 28/7 đến 31/7.", time: "10:32" },
    { id: 3, from: "them", text: "Tôi muốn hỏi về dịch vụ đưa đón sân bay", time: "10:33" },
    { id: 4, from: "us", text: "Dạ có ạ! Chúng tôi có dịch vụ đưa đón sân bay với giá 450K/chuyến. Anh muốn đón lúc mấy giờ ạ?", time: "10:34" },
    { id: 5, from: "them", text: "Khoảng 14h ngày 28/7. Và tôi muốn đặt thêm spa 60'", time: "10:36" },
    { id: 6, from: "us", text: "Tuyệt vời ạ! Tôi đã ghi nhận:\n• Đưa đón sân bay 14h ngày 28/7\n• Spa 60' cho 2 người vào ngày 29/7\nAnh có muốn đặt thêm dịch vụ nào không?", time: "10:38" },
    { id: 7, from: "them", text: "Cảm ơn nhiều! 👍", time: "10:40" },
  ],
  2: [
    { id: 1, from: "them", text: "Chào bạn, tôi muốn đặt phòng view biển cho kỳ nghỉ tuần sau.", time: "09:15" },
    { id: 2, from: "us", text: "Chào chị! Chị muốn đặt phòng tại chi nhánh nào ạ? Hiện tại Hồ Tràm đang có phòng view biển rất đẹp.", time: "09:18" },
    { id: 3, from: "them", text: "Vui lòng cho tôi phòng view biển nhé", time: "09:20" },
  ],
  3: [
    { id: 1, from: "them", text: "Cho tôi hỏi bảng giá dịch vụ Spa của chi nhánh Tây Ninh.", time: "Hôm qua" },
    { id: 2, from: "us", text: "Dạ em gửi chị bảng giá Spa chi tiết ạ. Gói massage body 60 phút là 890K.", time: "Hôm qua" },
    { id: 3, from: "them", text: "Bạn có thể gửi lịch trình spa không?", time: "08:12" },
  ],
  4: [
    { id: 1, from: "them", text: "[Hệ thống] Thông báo có 5 đánh giá mới trên kênh Booking.com", time: "Hôm qua" },
    { id: 2, from: "us", text: "Đã nhận. Đang chuẩn bị mẫu phản hồi khách hàng.", time: "Hôm qua" },
    { id: 3, from: "them", text: "Có 5 đánh giá mới cần phản hồi", time: "10:00" },
  ],
  5: [
    { id: 1, from: "them", text: "Tôi muốn đổi lịch bay nên cần check-out sớm hơn dự kiến.", time: "07:30" },
    { id: 2, from: "us", text: "Dạ được chứ ạ. Anh dự kiến check-out vào lúc mấy giờ để lễ tân chuẩn bị hóa đơn ạ?", time: "07:35" },
    { id: 3, from: "them", text: "Check-out sớm được không?", time: "08:00" },
  ]
};

const EMOJIS = ["🌴", "🏨", "🛎️", "🍷", "⭐", "👍", "❤️", "😊", "🎉", "🔥", "✨", "🌊", "🥥", "🛫", "💼", "📞", "💡", "😂"];

export default function Messages() {
  const [activeId, setActiveId] = useState(1);
  const [showListOnMobile, setShowListOnMobile] = useState(true);
  const [threads, setThreads] = useState(mockMessagesByThread);
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [convs, setConvs] = useState(conversations);

  const [activeHeaderMenu, setActiveHeaderMenu] = useState(false);
  const [activeItemMenuId, setActiveItemMenuId] = useState(null);

  // Clear unread count when conversation is selected/viewed
  useEffect(() => {
    setConvs((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c))
    );
  }, [activeId]);

  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const headerMenuRef = useRef(null);
  const itemMenuRef = useRef(null);

  // Close popups on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setActiveHeaderMenu(false);
      }
      if (itemMenuRef.current && !itemMenuRef.current.contains(e.target)) {
        setActiveItemMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handlePinConv = (id) => {
    setConvs(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
    setActiveHeaderMenu(false);
    setActiveItemMenuId(null);
  };

  const handleAddToGroup = (id) => {
    const name = convs.find(c => c.id === id)?.name;
    alert(`Đã thêm khách hàng "${name}" vào nhóm quản trị viên Le Palmier!`);
    setActiveHeaderMenu(false);
    setActiveItemMenuId(null);
  };

  const handleDeleteConv = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá đoạn hội thoại này không?")) {
      setConvs(prev => prev.filter(c => c.id !== id));
      setActiveHeaderMenu(false);
      setActiveItemMenuId(null);
      
      if (activeId === id) {
        const remaining = convs.filter(c => c.id !== id);
        if (remaining.length > 0) {
          setActiveId(remaining[0].id);
        }
      }
    }
  };

  const menuOptions = (id) => [
    {
      label: convs.find(c => c.id === id)?.pinned ? "Bỏ ghim hội thoại" : "Ghim hội thoại",
      icon: Pin,
      action: () => handlePinConv(id),
    },
    {
      label: "Thêm vào nhóm",
      icon: UserPlus,
      action: () => handleAddToGroup(id),
    },
    {
      label: "Xoá đoạn hội thoại",
      icon: Trash2,
      action: () => handleDeleteConv(id),
      danger: true,
    }
  ];

  // Scroll to bottom when conversation changes or new message is added
  const scrollChatToBottom = (behavior = "auto") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: behavior
      });
    }
  };

  const activeConv = convs.find((c) => c.id === activeId) || convs[0];
  const activeMessages = threads[activeId] || [];

  // Instant scroll on switching conversation
  useEffect(() => {
    scrollChatToBottom("instant");
  }, [activeId, showListOnMobile]);

  // Smooth scroll when active thread's messages length changes (e.g. sending a message)
  const currentMessagesCount = activeMessages.length;
  useEffect(() => {
    scrollChatToBottom("smooth");
  }, [currentMessagesCount]);

  const handleSelectConv = (id) => {
    setActiveId(id);
    setShowListOnMobile(false);
    setShowEmoji(false);
    setSelectedFile(null);
  };

  const handleEmojiSelect = (emoji) => {
    setInputText((prev) => prev + emoji);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMsg = {
      id: activeMessages.length + 1,
      from: "us",
      text: inputText.trim(),
      time: timeStr,
      file: selectedFile ? { name: selectedFile.name, size: selectedFile.size } : null,
    };

    setThreads((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMsg],
    }));

    setInputText("");
    setSelectedFile(null);
    setShowEmoji(false);
  };

  const filteredConversations = convs.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1240px] mx-auto pb-8">
      <PageHeader
        title="Tin nhắn & Hỗ trợ"
        subtitle="Quản lý liên hệ đa kênh với khách hàng và đối tác"
        actions={
          <button className="btn-primary">+ Cuộc hội thoại mới</button>
        }
      />

      <Card className="p-0 overflow-hidden shadow-pop border border-ink-200">
        <div className="grid grid-cols-12 h-[600px] sm:h-[660px] relative">
          {/* Conversation list */}
          <div
            className={`col-span-12 md:col-span-4 border-r border-ink-100 flex flex-col min-h-0 ${
              showListOnMobile ? "flex" : "hidden md:flex"
            }`}
          >
            <div className="p-3 sm:p-4 border-b border-ink-100 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  className="input pl-10 bg-ink-50 border-transparent focus:bg-white focus:border-ink-900 rounded-xl"
                  placeholder="Tìm cuộc hội thoại…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white divide-y divide-ink-50">
              {[...filteredConversations]
                .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
                .map((c, index) => {
                  const isActive = c.id === activeId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectConv(c.id)}
                      style={{
                        borderLeftColor: isActive ? "var(--accent)" : "transparent",
                      }}
                      className={`w-full flex items-start gap-3 p-3.5 border-l-4 transition text-left group relative ${
                        isActive ? "bg-ink-50/70" : "hover:bg-ink-50/30"
                      }`}
                    >
                      <div className="relative shrink-0 mt-0.5">
                        <img src={c.avatar} alt={c.name} className="w-11 h-11 rounded-full object-cover border border-ink-200 shadow-sm" />
                        {c.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-[13.5px] text-ink-900 truncate flex items-center gap-1">
                            {c.name}
                            {c.pinned && (
                              <Pin className="w-3 h-3 text-amber-500 fill-amber-500 rotate-45 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10.5px] text-ink-400 whitespace-nowrap font-medium">{c.time}</span>
                            {c.unread > 0 ? (
                              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10.5px] font-bold flex items-center justify-center border border-white ring-2 ring-red-500/10 shadow-sm shrink-0">
                                {c.unread}
                              </span>
                            ) : (
                              <div className="w-5 h-5 shrink-0" />
                            )}
                          </div>
                        </div>
                        <div className="text-[11.5px] text-ink-500 truncate mt-1 pr-6">{c.lastMsg}</div>
                      </div>

                      {/* Three-dots menu icon on hover */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveItemMenuId(activeItemMenuId === c.id ? null : c.id);
                        }}
                        className={`absolute right-2.5 bottom-2.5 w-7 h-7 rounded-full border border-ink-200 bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-ink-50 text-ink-600 z-10 transition-all duration-150 active:scale-90 ${
                          activeItemMenuId === c.id ? "opacity-100" : ""
                        }`}
                        title="Tùy chọn cuộc trò chuyện"
                      >
                        <MoreHorizontal className="w-4 h-4 text-ink-650" />
                      </button>

                      {/* Popover options menu for item */}
                      {activeItemMenuId === c.id && (
                        <div
                          ref={itemMenuRef}
                          className={`absolute right-2.5 z-20 w-48 bg-white border border-ink-200 rounded-xl shadow-lg p-1.5 animate-slideUp ${
                            index < 2 ? "top-10" : "bottom-10"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {menuOptions(c.id).map((opt) => (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                opt.action();
                              }}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[12px] font-medium rounded-lg transition text-left ${
                                opt.danger
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-ink-700 hover:bg-ink-50"
                              }`}
                            >
                              <opt.icon className="w-3.5 h-3.5" />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-ink-400 text-xs">
                  Không tìm thấy cuộc hội thoại nào
                </div>
              )}
            </div>
          </div>

          {/* Chat panel */}
          <div
            className={`col-span-12 md:col-span-8 flex flex-col min-h-0 bg-ink-50/20 ${
              !showListOnMobile ? "flex" : "hidden md:flex"
            }`}
          >
            {/* Header */}
            <div className="p-3.5 border-b border-ink-100 flex items-center gap-3 bg-white shadow-sm z-10">
              {/* Back button on mobile */}
              <button
                onClick={() => setShowListOnMobile(true)}
                className="md:hidden p-2 -ml-1 rounded-lg hover:bg-ink-50 text-ink-600 transition shrink-0"
                title="Quay lại"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                <img src={activeConv.avatar} alt={activeConv.name} className="w-10 h-10 rounded-full object-cover border border-ink-200" />
                {activeConv.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] text-ink-900 truncate">{activeConv.name}</div>
                <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  {activeConv.online ? "Đang online" : "Ngoại tuyến"}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 relative">
                <button className="p-2 rounded-lg hover:bg-ink-50 text-ink-600 transition" title="Gọi thoại"><Phone className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg hover:bg-ink-50 text-ink-600 transition" title="Gọi video"><Video className="w-4 h-4" /></button>
                
                <div className="relative">
                  <button
                    onClick={() => setActiveHeaderMenu(!activeHeaderMenu)}
                    className={`p-2 rounded-lg hover:bg-ink-50 text-ink-600 transition ${activeHeaderMenu ? "bg-ink-50 text-ink-900" : ""}`}
                    title="Thao tác khác"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  
                  {activeHeaderMenu && (
                    <div
                      ref={headerMenuRef}
                      className="absolute right-0 top-10 z-20 w-48 bg-white border border-ink-200 rounded-xl shadow-lg p-1.5 animate-slideUp"
                    >
                      {menuOptions(activeConv.id).map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={opt.action}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] font-medium rounded-lg transition text-left ${
                            opt.danger
                              ? "text-red-600 hover:bg-red-50"
                              : "text-ink-700 hover:bg-ink-50"
                          }`}
                        >
                          <opt.icon className="w-3.5 h-3.5" />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Feed */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {activeMessages.map((m) => {
                const isUs = m.from === "us";
                return (
                  <div key={m.id} className={`flex ${isUs ? "justify-end" : "justify-start"} items-end gap-2`}>
                    {!isUs && (
                      <img src={activeConv.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border border-ink-200 mb-0.5" />
                    )}
                    <div className={`flex flex-col ${isUs ? "items-end" : "items-start"} gap-1 max-w-[80%] sm:max-w-md`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl shadow-sm text-[13.5px] leading-relaxed ${
                          isUs
                            ? "bg-brand-600 text-white rounded-tr-sm"
                            : "bg-white text-ink-900 border border-ink-200 rounded-tl-sm"
                        }`}
                      >
                        {m.text && <div className="whitespace-pre-line break-words">{m.text}</div>}
                        
                        {/* File Card in bubble */}
                        {m.file && (
                          <div
                            className={`mt-2 p-2.5 border rounded-xl flex items-center gap-2.5 min-w-[210px] ${
                              isUs
                                ? "bg-white/10 border-white/20 text-white"
                                : "bg-ink-50 border-ink-200 text-ink-900"
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                                isUs ? "bg-white/15 border-white/25 text-white" : "bg-white border-ink-200 text-blue-700"
                              }`}
                            >
                              <File className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="text-[12px] font-semibold truncate leading-tight">{m.file.name}</div>
                              <div className={`text-[10px] mt-0.5 ${isUs ? "text-white/70" : "text-ink-400"}`}>
                                {(m.file.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                            <button
                              type="button"
                              className={`p-1.5 rounded-md transition ${
                                isUs ? "hover:bg-white/15 text-white" : "hover:bg-ink-150 text-ink-600"
                              }`}
                              title="Tải xuống file"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        
                        <div
                          className={`text-[9.5px] text-right mt-1.5 font-medium tabular-nums ${
                            isUs ? "text-white/70" : "text-ink-400"
                          }`}
                        >
                          {m.time}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <div className="p-3.5 border-t border-ink-100 bg-white relative z-15">
              {/* File input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Selected File Chip */}
              {selectedFile && (
                <div className="flex items-center justify-between px-3 py-2 bg-ink-50 border border-ink-200 rounded-xl text-xs text-ink-700 mb-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2 truncate">
                    <File className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="truncate font-semibold text-[11.5px]">{selectedFile.name}</span>
                    <span className="text-ink-400 text-[10px] shrink-0">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 rounded-full hover:bg-ink-150 text-ink-500 transition shrink-0"
                    title="Xóa đính kèm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Emoji Picker Popover */}
              {showEmoji && (
                <div
                  ref={emojiRef}
                  className="absolute bottom-16 left-4 z-30 w-64 bg-white/95 backdrop-blur-md border border-ink-200 rounded-xl p-3 shadow-pop animate-slideUp"
                >
                  <div className="text-[10px] uppercase tracking-wider font-bold text-ink-400 mb-2 flex justify-between items-center">
                    <span>Chọn Emoji nhanh</span>
                    <button
                      type="button"
                      onClick={() => setShowEmoji(false)}
                      className="text-ink-500 hover:text-ink-900 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiSelect(emoji)}
                        className="w-8 h-8 rounded-lg hover:bg-ink-50 flex items-center justify-center text-[18px] transition active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Compose Bar */}
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-lg hover:bg-ink-50 transition shrink-0 ${
                    selectedFile ? "text-blue-700 bg-blue-50" : "text-ink-600"
                  }`}
                  title="Đính kèm file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmoji(!showEmoji)}
                  className={`p-2 rounded-lg hover:bg-ink-50 transition shrink-0 ${
                    showEmoji ? "text-blue-700 bg-blue-50" : "text-ink-600"
                  }`}
                  title="Chọn Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="input flex-1 min-w-[140px] bg-ink-50 border-transparent focus:bg-white focus:border-ink-900 rounded-xl py-2 px-3.5 text-[13px]"
                  placeholder="Nhập tin nhắn…"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() && !selectedFile}
                  className="btn-primary shrink-0 !py-2 !px-3.5 !rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Gửi</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </Card>
      
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideUp {
          animation: slideUp 0.15s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
      `}</style>
    </div>
  );
}