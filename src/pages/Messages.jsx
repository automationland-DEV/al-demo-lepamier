import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";

const { MessageSquare, Send, Search, MoreHorizontal, Phone, Video, Paperclip, Smile } = Icons;

const conversations = [
  { id: 1, name: "Nguyễn Văn An", avatar: "https://i.pravatar.cc/100?img=33", lastMsg: "Cảm ơn anh/chị đã đặt phòng tại Le Palmier!", time: "Vừa xong", unread: 2, online: true },
  { id: 2, name: "Trần Thị Bình", avatar: "https://i.pravatar.cc/100?img=5", lastMsg: "Vui lòng cho tôi phòng view biển nhé", time: "5 phút", unread: 0, online: true },
  { id: 3, name: "Lê Hoàng Cường", avatar: "https://i.pravatar.cc/100?img=12", lastMsg: "Bạn có thể gửi lịch trình spa không?", time: "15 phút", unread: 1, online: false },
  { id: 4, name: "Booking.com Support", avatar: "https://i.pravatar.cc/100?img=68", lastMsg: "Có 5 đánh giá mới cần phản hồi", time: "1 giờ", unread: 5, online: false },
  { id: 5, name: "Phạm Minh Dũng", avatar: "https://i.pravatar.cc/100?img=15", lastMsg: "Check-out sớm được không?", time: "2 giờ", unread: 0, online: false },
];

const messages = [
  { id: 1, from: "them", text: "Chào anh/chị, tôi vừa đặt phòng Deluxe 3 đêm tại Le Palmier Hồ Tràm", time: "10:30" },
  { id: 2, from: "us", text: "Chào anh! Cảm ơn anh đã chọn Le Palmier 🌴\nChúng tôi đã ghi nhận booking của anh từ ngày 28/7 đến 31/7.", time: "10:32" },
  { id: 3, from: "them", text: "Tôi muốn hỏi về dịch vụ đưa đón sân bay", time: "10:33" },
  { id: 4, from: "us", text: "Dạ có ạ! Chúng tôi có dịch vụ đưa đón sân bay với giá 450K/chuyến. Anh muốn đón lúc mấy giờ ạ?", time: "10:34" },
  { id: 5, from: "them", text: "Khoảng 14h ngày 28/7. Và tôi muốn đặt thêm spa 60'", time: "10:36" },
  { id: 6, from: "us", text: "Tuyệt vời ạ! Tôi đã ghi nhận:\n• Đưa đón sân bay 14h ngày 28/7\n• Spa 60' cho 2 người vào ngày 29/7\nAnh có muốn đặt thêm dịch vụ nào không?", time: "10:38" },
  { id: 7, from: "them", text: "Cảm ơn nhiều! 👍", time: "10:40" },
];

export default function Messages() {
  return (
    <div>
      <PageHeader
        title="Tin nhắn & Hỗ trợ"
        subtitle="Quản lý liên hệ đa kênh với khách hàng và đối tác"
        actions={
          <button className="btn-primary">+ Cuộc hội thoại mới</button>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-12 h-[600px] sm:h-[640px]">
          {/* Conversation list */}
          <div className="col-span-12 md:col-span-4 border-r border-ink-100 flex flex-col min-h-0">
            <div className="p-3 sm:p-4 border-b border-ink-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input className="input pl-10" placeholder="Tìm cuộc hội thoại…" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  className="w-full flex items-start gap-3 p-3 sm:p-4 border-b border-ink-50 hover:bg-ink-50 transition text-left"
                >
                  <div className="relative shrink-0">
                    <img src={c.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                    {c.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full ring-2 ring-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="font-semibold text-sm text-ink-900 truncate">{c.name}</div>
                      <span className="text-xs text-ink-400 whitespace-nowrap ml-2">{c.time}</span>
                    </div>
                    <div className="text-xs text-ink-500 truncate mt-0.5">{c.lastMsg}</div>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat panel */}
          <div className="hidden md:flex col-span-8 flex-col min-h-0">
            {/* Header */}
            <div className="p-4 border-b border-ink-100 flex items-center gap-3">
              <img src="https://i.pravatar.cc/100?img=33" alt="" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900 truncate">Nguyễn Văn An</div>
                <div className="text-xs text-blue-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Đang online
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-ink-100"><Phone className="w-4 h-4 text-ink-600" /></button>
              <button className="p-2 rounded-lg hover:bg-ink-100"><Video className="w-4 h-4 text-ink-600" /></button>
              <button className="p-2 rounded-lg hover:bg-ink-100"><MoreHorizontal className="w-4 h-4 text-ink-600" /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-ink-50/40">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === "us" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] sm:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                    m.from === "us"
                      ? "bg-brand-600 text-white rounded-br-sm"
                      : "bg-white text-ink-900 rounded-bl-sm shadow-card"
                  }`}>
                    <div className="whitespace-pre-line break-words">{m.text}</div>
                    <div className={`text-[10px] mt-1 ${m.from === "us" ? "text-white/70" : "text-ink-400"}`}>
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <div className="p-3 sm:p-4 border-t border-ink-100 flex items-center gap-2 flex-wrap">
              <button className="p-2 rounded-lg hover:bg-ink-100 text-ink-600"><Paperclip className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg hover:bg-ink-100 text-ink-600"><Smile className="w-4 h-4" /></button>
              <input className="input flex-1 min-w-[140px]" placeholder="Nhập tin nhắn…" />
              <button className="btn-primary"><Send className="w-4 h-4" /> Gửi</button>
            </div>
          </div>

          {/* Mobile empty state when no chat open */}
          <div className="md:hidden flex-1 flex flex-col items-center justify-center text-center p-6 bg-ink-50/40">
            <MessageSquare className="w-12 h-12 text-ink-200 mb-3" />
            <div className="text-sm text-ink-500 font-semibold">Chọn một cuộc hội thoại</div>
            <div className="text-xs text-ink-400 mt-1">Nhấn vào khách bên trái để mở chat</div>
          </div>
        </div>
      </Card>
    </div>
  );
}