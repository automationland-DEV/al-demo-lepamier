import { Icons } from "./Icons";
import { Card, Badge } from "./DashboardPrimitives";
import { KPIAccent, StatusCell } from "./DashboardKPIs";
import { formatVND } from "../utils/format";

const {
  BedDouble, LogIn, LogOut, CalendarCheck, Wrench, Sparkles,
  Building2, Users, Star, MessageSquare, Briefcase, Globe,
  CreditCard, Coffee, Car, ConciergeBell,
  ChevronRight, ArrowUpRight, Clock,
} = Icons;

/* ─────────── § Vận hành phòng — 8 KPI + status grid ─────────── */
export function OperationsGrid({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card
        className="lg:col-span-2"
        title="Số liệu vận hành hôm nay"
        subtitle="Cập nhật real-time mỗi 5 phút"
        icon={LogIn}
        accent="blue"
        right={<Badge tone="emerald"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Real-time</Badge>}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          <KPIAccent label="Check-in" value={data.checkIns} accent="blue" icon={LogIn} sub={`+${data.checkInsDelta} so với hôm qua`} />
          <KPIAccent label="Check-out" value={data.checkOuts} accent="ink" icon={LogOut} sub={`+${data.checkOutsDelta} so với hôm qua`} />
          <KPIAccent label="Lưu trú đang ở" value={data.inHouse} accent="violet" icon={CalendarCheck} sub={`${data.occupied} phòng`} />
          <KPIAccent label="Phòng trống" value={data.vacant} accent="emerald" icon={BedDouble} sub="Có thể bán ngay" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mt-2.5 sm:mt-3">
          <KPIAccent label="Chờ dọn" value={data.dirty} accent="amber" icon={Clock} sub="Ưu tiên trong 30'" />
          <KPIAccent label="Đang dọn" value={data.cleaning} accent="amber" icon={Sparkles} sub="ETA TB 25'" />
          <KPIAccent label="Sẵn sàng" value={data.ready} accent="emerald" icon={BedDouble} sub="Có thể bán" />
          <KPIAccent label="OOO (bảo trì)" value={data.ooo} accent="rose" icon={Wrench} sub="Không thể bán" />
        </div>
        <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Đồng bộ lần cuối: {data.lastSync}
          </div>
          <button className="text-blue-700 font-semibold hover:underline flex items-center gap-1">
            Xem nhật ký vận hành <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </Card>

      <Card title="Trạng thái phòng" subtitle={`Tổng ${data.totalRooms} phòng`} icon={BedDouble} accent="emerald">
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          <StatusCell count={data.vacant}   label="Trống"     dotColor="bg-emerald-500" pct={Math.round(data.vacant / data.totalRooms * 100)} icon={BedDouble} />
          <StatusCell count={data.inHouse}  label="Đang ở"    dotColor="bg-violet-500"  pct={Math.round(data.inHouse / data.totalRooms * 100)} icon={Users} />
          <StatusCell count={data.dirty}    label="Chờ dọn"   dotColor="bg-amber-500"   pct={Math.round(data.dirty / data.totalRooms * 100)} icon={Clock} />
          <StatusCell count={data.cleaning} label="Đang dọn"  dotColor="bg-amber-300"   pct={Math.round(data.cleaning / data.totalRooms * 100)} icon={Sparkles} />
          <StatusCell count={data.ready}    label="Sẵn sàng"  dotColor="bg-blue-500"    pct={Math.round(data.ready / data.totalRooms * 100)} icon={BedDouble} />
          <StatusCell count={data.ooo}      label="OOO"       dotColor="bg-rose-500"    pct={Math.round(data.ooo / data.totalRooms * 100)} icon={Wrench} />
        </div>
      </Card>
    </div>
  );
}

/* ─────────── § Top phòng sắp tới ─────────── */
export function TopRooms({ items = [] }) {
  return (
    <Card title="Top phòng bán chạy" subtitle="Tuần này · theo doanh thu" icon={Star} accent="amber">
      <div className="space-y-1.5 sm:space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-md hover:bg-ink-50 transition border border-transparent hover:border-ink-100">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-display font-bold text-[12px] sm:text-[14px] tabular-nums shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] sm:text-[13px] font-semibold text-ink-900 truncate">{it.name}</div>
              <div className="text-[10.5px] sm:text-[11px] text-ink-500 truncate">{it.type} · {it.branch}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[12px] sm:text-[13px] font-bold tabular-nums text-ink-900">{formatVND(it.revenue)}</div>
              <div className="text-[9.5px] sm:text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> {it.growth}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─────────── § Channel mix (Booking source) ─────────── */
export function ChannelMix({ items = [], className = "" }) {
  const total = items.reduce((s, x) => s + x.bookings, 0);
  const totalRev = items.reduce((s, x) => s + x.revenue, 0);
  return (
    <Card title="Kênh bán phòng" subtitle="7 ngày qua · % đặt phòng" icon={Globe} accent="cyan" className={className}>
      <div className="flex items-center gap-3 sm:gap-5 mb-4 pb-4 border-b border-ink-100 flex-wrap">
        <div className="text-center shrink-0">
          <div className="text-[9px] uppercase tracking-[0.18em] text-ink-500 font-bold">Tổng đặt</div>
          <div className="text-[18px] sm:text-[20px] font-display font-bold text-ink-900 tabular-nums leading-none mt-1">{total}</div>
        </div>
        <div className="hidden sm:block w-px h-10 bg-ink-200" />
        <div className="text-center shrink-0">
          <div className="text-[9px] uppercase tracking-[0.18em] text-ink-500 font-bold">Doanh thu</div>
          <div className="text-[16px] sm:text-[20px] font-display font-bold text-ink-900 tabular-nums leading-none mt-1">{formatVND(totalRev)}</div>
        </div>
        <div className="hidden sm:block w-px h-10 bg-ink-200" />
        <div className="text-center shrink-0">
          <div className="text-[9px] uppercase tracking-[0.18em] text-ink-500 font-bold">Kênh</div>
          <div className="text-[18px] sm:text-[20px] font-display font-bold text-ink-900 tabular-nums leading-none mt-1">{items.length}</div>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((c, i) => (
          <div key={c.name}>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap sm:flex-nowrap">
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ background: c.color }}
              >
                #{i + 1}
              </span>
              <span className="text-[12.5px] font-semibold text-ink-900 flex-1 min-w-0 truncate">{c.name}</span>
              <span className="text-[11px] text-ink-500 tabular-nums shrink-0">
                <strong className="text-ink-900">{c.bookings}</strong> đặt
              </span>
              <span className="text-[12px] font-bold text-ink-900 tabular-nums w-full sm:w-24 text-right sm:text-right shrink-0 break-all">{formatVND(c.revenue)}</span>
            </div>
            <div className="flex items-center gap-2.5 pl-9">
              <div className="flex-1 h-2 bg-ink-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${c.pct}%`, background: c.color }} />
              </div>
              <span className="text-[11px] font-bold text-ink-700 tabular-nums w-10 text-right shrink-0">{c.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─────────── § Staff theo ca ─────────── */
export function StaffShift({ items = [] }) {
  return (
      <Card title="Nhân sự theo ca" subtitle="Hôm nay · realtime" icon={Briefcase} accent="violet">
      <div className="space-y-2 sm:space-y-2.5">
        {items.map((s) => (
          <div key={s.shift} className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <div className="text-[12px] sm:text-[12.5px] font-semibold text-ink-900 truncate">{s.shift}</div>
              <div className="text-[10.5px] sm:text-[11px] text-ink-500">{s.time}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[14px] sm:text-[16px] font-display font-bold tabular-nums">{s.count}</div>
              <div className="text-[9.5px] sm:text-[10px] text-ink-500">{s.label}</div>
            </div>
            <div className="w-full sm:w-16 shrink-0">
              <div className="h-1 bg-ink-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${s.fill}%` }} />
              </div>
              <div className="text-[10px] text-ink-500 text-right mt-0.5 tabular-nums">{s.fill}%</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─────────── § Review feed ─────────── */
export function ReviewFeed({ items = [] }) {
  return (
    <Card title="Đánh giá mới nhất" subtitle="Khách hàng · 24h qua" icon={MessageSquare} accent="rose">
      <div className="space-y-3">
        {items.map((r, i) => (
          <div key={i} className="flex gap-3 pb-3 border-b border-ink-100 last:border-0 last:pb-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center font-bold text-[13px] shrink-0">
              {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-ink-900 truncate">{r.name}</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`w-3 h-3 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-ink-200"}`} />
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-ink-500 mt-0.5">{r.source} · {r.branch} · {r.date}</div>
              <p className="text-[12px] text-ink-700 mt-1 leading-relaxed">"{r.text}"</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─────────── § Activity timeline ─────────── */
export function ActivityTimeline({ items = [] }) {
  const tones = {
    booking: { color: "bg-blue-500", icon: CalendarCheck, label: "Đặt phòng" },
    checkin: { color: "bg-emerald-500", icon: LogIn, label: "Check-in" },
    review:  { color: "bg-amber-500", icon: Star, label: "Đánh giá" },
    payment: { color: "bg-violet-500", icon: CreditCard, label: "Thanh toán" },
    issue:   { color: "bg-rose-500", icon: Wrench, label: "Sự cố" },
    staff:   { color: "bg-ink-500", icon: Users, label: "Nhân sự" },
  };
  return (
    <Card title="Hoạt động trong ngày" subtitle="Live feed mỗi 30s" icon={Clock} accent="blue"
      right={<Badge tone="emerald"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE</Badge>}>
      <ol className="relative space-y-3 pl-7 border-l-2 border-dashed border-ink-200 ml-2">
        {items.map((it, i) => {
          const t = tones[it.type] || tones.booking;
          const Icon = t.icon;
          return (
            <li key={i} className="relative">
              <div className={`absolute -left-[34px] top-0.5 w-6 h-6 rounded-full ${t.color} text-white flex items-center justify-center ring-4 ring-white`}>
                <Icon className="w-3 h-3" />
              </div>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone={it.type === "issue" ? "rose" : "blue"}>{t.label}</Badge>
                    <span className="text-[12px] sm:text-[12.5px] font-semibold text-ink-900 truncate">{it.title}</span>
                  </div>
                  <div className="text-[10.5px] sm:text-[11px] text-ink-500 mt-0.5">{it.desc}</div>
                </div>
                <span className="text-[10px] text-ink-400 tabular-nums shrink-0">{it.time}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/* ─────────── § Quick action tiles ─────────── */
export function QuickActions({ actions = [] }) {
  const palette = {
    blue:    "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    amber:   "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
    rose:    "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200",
    violet:  "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200",
    cyan:    "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200",
  };
  return (
      <Card title="Thao tác nhanh" subtitle="Truy cập 1 chạm" icon={Sparkles} accent="violet">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
        {actions.map((a, i) => {
          const Icon = a.icon || Coffee;
          return (
            <button
              key={i}
              className={`p-2.5 sm:p-3 rounded-md border ${palette[a.tone] || palette.blue} transition flex flex-col items-start gap-1 sm:gap-1.5 text-left min-w-0`}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-white/60 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-[12px] sm:text-[12.5px] font-semibold leading-tight truncate w-full">{a.label}</div>
              {a.sub && <div className="text-[9.5px] sm:text-[10px] opacity-75 leading-tight truncate w-full">{a.sub}</div>}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
