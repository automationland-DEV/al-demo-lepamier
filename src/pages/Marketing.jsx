import { useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart as RechartsPieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import PageHeader from "../components/PageHeader";
import { Icons } from "../components/Icons";
import { formatVNDFull, formatVND } from "../utils/format";

const {
  Megaphone, Facebook, Instagram, Youtube, Twitter, Linkedin, Music2,
  Share2, Link2, Hash, AtSign, ImageIcon, FileText, Rss,
  Workflow, GitBranch, PlayCircle, PauseCircle, Webhook, Bot, Target,
  MousePointerClick, Heart, ThumbsUp, Repeat, Bookmark,
  CalendarClock, CalendarDays, Newspaper, PencilLine, FileEdit,
  TrendingUp, TrendingDown, Plus, Filter, Download, Search,
  MoreHorizontal, Star, Users, Clock, DollarSign, Eye, Send,
  CheckCircle2, XCircle, Hourglass, Sparkles, Copy, ExternalLink,
  Building2, Globe2, Zap, ChevronRight, Edit2, Trash2,
  ChevronDown, X, Check, Save, LayoutGrid, List, Bell,
  PieChart: PieChartIcon,
} = Icons;

const tooltipStyle = {
  background: "#0f1218",
  border: "none",
  borderRadius: 6,
  fontSize: 12,
  color: "#fff",
  padding: "8px 12px",
};

const TODAY = "28/07/2026";

const CHANNELS = {
  facebook:  { name: "Facebook",  icon: Facebook,  color: "#1877F2", bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  instagram: { name: "Instagram", icon: Instagram, color: "#E1306C", bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-200" },
  zalo:      { name: "Zalo OA",   icon: Send,      color: "#0068FF", bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200" },
  tiktok:    { name: "TikTok",    icon: Music2,    color: "#000000", bg: "bg-ink-100",    text: "text-ink-900",    border: "border-ink-200" },
  youtube:   { name: "YouTube",   icon: Youtube,   color: "#FF0000", bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-200" },
  twitter:   { name: "X / Twitter", icon: Twitter, color: "#0F1419", bg: "bg-ink-100",    text: "text-ink-900",    border: "border-ink-200" },
  linkedin:  { name: "LinkedIn",  icon: Linkedin,  color: "#0A66C2", bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200" },
  website:   { name: "Website",   icon: Globe2,    color: "#0ea5e9", bg: "bg-sky-50",     text: "text-sky-700",    border: "border-sky-200" },
  email:     { name: "Email",     icon: AtSign,    color: "#8b5cf6", bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-200" },
};

const STATUS = {
  draft:     { label: "Nháp",            dot: "bg-ink-400",     cls: "bg-ink-100 text-ink-700 border-ink-200" },
  scheduled: { label: "Đã lên lịch",     dot: "bg-blue-500",    cls: "bg-blue-50 text-blue-700 border-blue-200" },
  publishing:{ label: "Đang đăng",       dot: "bg-amber-500",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
  published: { label: "Đã đăng",         dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed:    { label: "Lỗi",             dot: "bg-rose-500",    cls: "bg-rose-50 text-rose-700 border-rose-200" },
  review:    { label: "Chờ duyệt",       dot: "bg-violet-500",  cls: "bg-violet-50 text-violet-700 border-violet-200" },
};

export default function Marketing() {
  const [tab, setTab] = useState("overview");
  const [shareOpen, setShareOpen] = useState(null); // post being shared
  const [autoOpen, setAutoOpen] = useState(null);   // automation being viewed

  const data = useMemo(() => buildData(), []);

  return (
    <div className="max-w-[1320px] mx-auto pb-12 px-3 sm:px-4 lg:px-6">

      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden rounded-md bg-gradient-to-br from-violet-700 via-fuchsia-700 to-rose-700 text-white shadow-sm">
        <div className="absolute inset-0 opacity-[0.08] bg-soft-grid" />
        <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-violet-400/30 blur-3xl" />
        <div className="relative px-4 sm:px-7 py-4 sm:py-6 flex items-start justify-between gap-3 sm:gap-6 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/80 font-semibold flex-wrap">
              <Megaphone className="w-3.5 h-3.5" />
              MARKETING HUB
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-400/30">
                <span className="relative flex w-2 h-2 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-emerald-300 opacity-70 animate-ping" style={{ animationDuration: "1.8s" }} />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-300" />
                </span>
                9 kênh đang kết nối
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-9 h-9 rounded-md bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-display font-bold text-[18px] sm:text-[28px] leading-tight truncate">
                Trung tâm Marketing — Le Palmier Hotels
              </h1>
            </div>
            <p className="text-[12.5px] sm:text-[13px] text-white/85 mt-2 max-w-2xl">
              Quản lý bài viết · đa kênh · automation đăng tải · SEO · phân tích hiệu quả.
            </p>
            <div className="flex items-center gap-2 mt-2.5 sm:mt-3 flex-wrap">
              {data.heroMeta.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded px-2 py-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold whitespace-nowrap">{m.label}</span>
                  <span className="text-[12px] font-semibold tabular-nums truncate">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto flex-wrap">
            <button className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-[12.5px] font-semibold flex items-center gap-2 transition flex-1 sm:flex-none justify-center">
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Xuất báo cáo</span><span className="sm:hidden">Xuất</span>
            </button>
            <button className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-[12.5px] font-semibold flex items-center gap-2 transition flex-1 sm:flex-none justify-center">
              <Workflow className="w-4 h-4" /> <span className="hidden sm:inline">Tạo Automation</span><span className="sm:hidden">Auto</span>
            </button>
            <button className="px-3 py-2 rounded-md bg-white text-violet-700 hover:bg-violet-50 text-[12.5px] font-bold flex items-center gap-2 transition shadow-sm flex-1 sm:flex-none justify-center">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Bài viết mới</span><span className="sm:hidden">Tạo</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="mt-5 sm:mt-6 flex items-center gap-1 border-b border-ink-200 overflow-x-auto">
        {[
          { id: "overview",  label: "Tổng quan",    icon: Sparkles },
          { id: "channels",  label: "Kênh đăng",   icon: Share2 },
          { id: "automation",label: "Automation",   icon: Bot },
          { id: "queue",     label: "Hàng chờ",     icon: CalendarClock },
          { id: "analytics", label: "Phân tích",   icon: TrendingUp },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 sm:px-4 py-2.5 text-[12.5px] font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                active
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-ink-500 hover:text-ink-900 hover:border-ink-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      {tab === "overview" && <Overview data={data} onShare={(p) => setShareOpen(p)} />}
      {tab === "channels" && <ChannelsTab data={data} onShare={(p) => setShareOpen(p)} />}
      {tab === "automation" && <AutomationTab data={data} onView={(a) => setAutoOpen(a)} />}
      {tab === "queue" && <QueueTab data={data} onShare={(p) => setShareOpen(p)} />}
      {tab === "analytics" && <AnalyticsTab data={data} />}

      {/* ═══ SHARE MODAL ═══ */}
      {shareOpen && <ShareModal post={shareOpen} onClose={() => setShareOpen(null)} />}
      {/* ═══ AUTOMATION MODAL ═══ */}
      {autoOpen && <AutomationModal flow={autoOpen} onClose={() => setAutoOpen(null)} />}

      <div className="mt-10 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
        <Megaphone className="w-3 h-3" />
        Marketing Hub · Đồng bộ đa kênh · Cập nhật real-time · 28/07/2026
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   TAB: OVERVIEW
════════════════════════════════════════════════ */
function Overview({ data, onShare }) {
  return (
    <>
      <SectionHeader icon={Target} label="KPI tuần này" sub="So với tuần trước" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {data.overviewKpi.map((k, i) => (
          <KPI k={k} key={i} />
        ))}
      </div>

      <SectionHeader icon={Sparkles} label="Bài viết gần đây" sub="Trạng thái & đăng tải đa kênh" right={
        <Badge tone="violet">{data.recentPosts.length} bài</Badge>
      } />
      <Card title="Danh sách bài viết" subtitle="Mới nhất" icon={FileText} accent="violet" className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-ink-500 uppercase tracking-wider text-[10px] bg-ink-50">
                <th className="px-3 sm:px-5 py-3 font-semibold">Bài viết</th>
                <th className="px-3 sm:px-5 py-3 font-semibold hidden md:table-cell">Danh mục</th>
                <th className="px-3 sm:px-5 py-3 font-semibold hidden lg:table-cell">Kênh</th>
                <th className="px-3 sm:px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-3 sm:px-5 py-3 font-semibold text-right">Tương tác</th>
                <th className="px-3 sm:px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {data.recentPosts.map((p, i) => (
                <tr key={p.id} className={`border-t border-ink-100 ${i % 2 ? "bg-ink-50/40" : ""} hover:bg-violet-50/30 transition`}>
                  <td className="px-3 sm:px-5 py-3 min-w-0 max-w-[260px]">
                    <div className="font-semibold text-ink-900 truncate flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          STATUS[p.status]?.dot || "bg-ink-300"
                        }`} />
                      {p.title}
                    </div>
                    <div className="text-[10px] text-ink-500 mt-0.5 truncate">
                      {p.author} · {p.date}
                      {p.tags?.length > 0 && <span className="ml-1">· <Tag size={9} className="inline w-2.5 h-2.5" /> {p.tags.slice(0, 2).join(", ")}</span>}
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3 hidden md:table-cell">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-3 sm:px-5 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1 flex-wrap">
                      {p.channels.slice(0, 4).map((c) => {
                        const ch = CHANNELS[c];
                        if (!ch) return null;
                        const Icon = ch.icon;
                        return (
                          <div key={c} title={ch.name} className={`w-6 h-6 rounded-full flex items-center justify-center ${ch.bg}`}>
                            <Icon className={`w-3 h-3 ${ch.text}`} />
                          </div>
                        );
                      })}
                      {p.channels.length > 4 && (
                        <span className="text-[10px] text-ink-500 font-bold">+{p.channels.length - 4}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <StatusPill s={p.status} />
                  </td>
                  <td className="px-3 sm:px-5 py-3 text-right tabular-nums font-bold text-ink-900">
                    {p.engagement}
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onShare(p)}
                        title="Chia sẻ nhanh"
                        className="w-7 h-7 rounded-md hover:bg-violet-100 text-violet-700 flex items-center justify-center transition"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded-md hover:bg-ink-100 text-ink-500 flex items-center justify-center transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionHeader icon={Bot} label="Automation đang chạy" sub="Tự động đăng tải đa kênh" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {data.automations.map((a) => (
          <AutomationCard a={a} key={a.id} />
        ))}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════
   TAB: CHANNELS
════════════════════════════════════════════════ */
function ChannelsTab({ data, onShare }) {
  return (
    <>
      <SectionHeader icon={Share2} label="Kênh đăng" sub="Trạng thái kết nối & sức khỏe" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {data.channels.map((c) => {
          const meta = CHANNELS[c.id];
          const Icon = meta.icon;
          return (
            <div key={c.id} className="bg-white border border-ink-200 rounded-md p-4 sm:p-5 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-md flex items-center justify-center shrink-0" style={{ background: meta.color + "14", color: meta.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-bold text-ink-900 truncate">{c.name}</div>
                    <div className="text-[10px] text-ink-500 flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === "connected" ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {c.status === "connected" ? "Đã kết nối" : "Mất kết nối"}
                    </div>
                  </div>
                </div>
                <button className="text-[10px] font-semibold text-ink-500 hover:text-violet-700 shrink-0">Cấu hình</button>
              </div>
              <div className="grid grid-cols-3 gap-2 my-3 pt-3 border-t border-ink-100">
                <Stat label="Followers" value={c.followers} />
                <Stat label="Bài đăng" value={c.posts} />
                <Stat label="Tương tác" value={c.engagement} tone="emerald" />
              </div>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[10px] uppercase tracking-wider text-ink-500 font-bold">Sức khỏe</span>
                <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.health}%`, background: c.health > 80 ? "#10b981" : c.health > 60 ? "#f59e0b" : "#f43f5e" }} />
                </div>
                <span className="text-[10px] font-bold text-ink-900 tabular-nums">{c.health}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex-1 px-2.5 py-1.5 rounded-md border border-ink-200 text-ink-700 text-[11px] font-semibold hover:bg-ink-50 transition">
                  Xem chi tiết
                </button>
                <button
                  onClick={() => onShare({ id: "demo", title: `Đăng nhanh lên ${c.name}`, excerpt: "Bài viết sẽ được tạo nhanh từ template và đăng lên kênh này.", channels: [c.id] })}
                  className="flex-1 px-2.5 py-1.5 rounded-md text-white text-[11px] font-semibold hover:opacity-90 transition"
                  style={{ background: meta.color }}
                >
                  Đăng nhanh
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <SectionHeader icon={CalendarDays} label="Lịch đăng tuần này" sub="Hàng chờ & slot trống" />
      <Card title="Content calendar" subtitle="Theo tuần" icon={CalendarClock} accent="violet" className="p-0">
        <div className="grid grid-cols-7 border-b border-ink-200">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[10px] uppercase font-bold text-ink-500 tracking-wider border-r last:border-r-0 border-ink-200">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {data.calendar.map((day, i) => (
            <div key={i} className="border-r last:border-r-0 border-ink-100 p-1.5 sm:p-2 min-h-[180px] space-y-1.5">
              <div className="text-[10px] font-bold text-ink-500 tabular-nums">{day.date}</div>
              {day.slots.map((s, j) => {
                const ch = CHANNELS[s.channel];
                const Icon = ch?.icon;
                return (
                  <div
                    key={j}
                    onClick={() => onShare(s)}
                    className={`p-1.5 rounded text-[10px] cursor-pointer hover:shadow-sm transition border ${ch?.bg} ${ch?.border} ${ch?.text}`}
                    title={s.title}
                  >
                    <div className="flex items-center gap-1 font-bold truncate">
                      {Icon && <Icon className="w-2.5 h-2.5 shrink-0" />}
                      <span className="truncate">{s.time}</span>
                    </div>
                    <div className="font-semibold text-ink-900 truncate mt-0.5">{s.title}</div>
                  </div>
                );
              })}
              {day.slots.length === 0 && (
                <div className="text-[9px] text-ink-400 italic text-center py-3">Trống</div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/* ════════════════════════════════════════════════
   TAB: AUTOMATION
════════════════════════════════════════════════ */
function AutomationTab({ data, onView }) {
  return (
    <>
      <SectionHeader icon={Workflow} label="Workflow Automation" sub="Kéo thả để tạo kịch bản tự động" right={
        <button className="px-3 py-1.5 rounded-md bg-violet-700 text-white text-[11.5px] font-bold flex items-center gap-1.5 hover:bg-violet-800 transition">
          <Plus className="w-3.5 h-3.5" /> Workflow mới
        </button>
      } />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {data.automations.map((a) => (
          <AutomationCard key={a.id} a={a} onView={onView} expanded />
        ))}
      </div>

      <SectionHeader icon={Webhook} label="Triggers có sẵn" sub="Sự kiện kích hoạt automation" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {data.triggers.map((t, i) => {
          const Icon = t.icon;
          return (
            <div key={i} className="bg-white border border-ink-200 rounded-md p-3 hover:border-violet-300 hover:shadow-sm transition cursor-pointer">
              <div className={`w-9 h-9 rounded-md ${t.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${t.text}`} />
              </div>
              <div className="font-semibold text-[12.5px] text-ink-900 truncate">{t.name}</div>
              <div className="text-[10px] text-ink-500 mt-0.5">{t.desc}</div>
            </div>
          );
        })}
      </div>

      <SectionHeader icon={Zap} label="Hành động có thể tự động hóa" sub="Action blocks — kéo vào workflow" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {data.actions.map((t, i) => {
          const Icon = t.icon;
          return (
            <div key={i} className="bg-white border border-ink-200 rounded-md p-3 hover:border-violet-300 hover:shadow-sm transition cursor-pointer">
              <div className={`w-9 h-9 rounded-md ${t.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${t.text}`} />
              </div>
              <div className="font-semibold text-[12.5px] text-ink-900 truncate">{t.name}</div>
              <div className="text-[10px] text-ink-500 mt-0.5">{t.desc}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════
   TAB: QUEUE
════════════════════════════════════════════════ */
function QueueTab({ data, onShare }) {
  return (
    <>
      <SectionHeader icon={Clock} label="Hàng chờ đăng tải" sub={`${data.queue.length} bài đang chờ`} />
      <Card title="Lịch trình đăng" subtitle="Tự động theo slot đã cấu hình" icon={CalendarClock} accent="violet" className="p-0">
        <div className="divide-y divide-ink-100">
          {data.queue.map((q) => {
            const ch = CHANNELS[q.channel];
            const Icon = ch?.icon;
            return (
              <div key={q.id} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-violet-50/30 transition">
                <div className="text-center shrink-0 w-16">
                  <div className="text-[10px] uppercase font-bold text-violet-700">{q.date.split("/")[0]}/{q.date.split("/")[1]}</div>
                  <div className="text-[10px] text-ink-500 mt-0.5">{q.day}</div>
                  <div className="text-[14px] font-display font-bold text-ink-900 tabular-nums">{q.time}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-[13px] truncate">{q.title}</div>
                  <div className="text-[10px] text-ink-500 truncate">
                    {q.category} · {q.author} · {q.postType === "reel" ? "Video ngắn" : q.postType === "video" ? "Video" : q.postType === "carousel" ? "Carousel" : "Bài viết"}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${ch?.bg}`} title={ch?.name}>
                    {Icon && <Icon className={`w-3.5 h-3.5 ${ch?.text}`} />}
                  </div>
                  <span className="text-[10px] text-ink-500 font-semibold hidden sm:inline">{ch?.name}</span>
                </div>
                <StatusPill s={q.status} />
                <button
                  onClick={() => onShare(q)}
                  className="w-8 h-8 rounded-md hover:bg-violet-100 text-violet-700 flex items-center justify-center transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <SectionHeader icon={CheckCircle2} label="Đã đăng gần đây" sub="Auto-publish · 24h qua" />
      <Card title="Lịch sử đăng" subtitle="Tracking thành công/thất bại" icon={CheckCircle2} accent="emerald" className="p-0">
        <div className="divide-y divide-ink-100">
          {data.history.map((h) => {
            const ch = CHANNELS[h.channel];
            const Icon = ch?.icon;
            return (
              <div key={h.id} className="flex items-center gap-3 p-3 sm:p-4">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                  h.result === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}>
                  {h.result === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-[12.5px] truncate">{h.title}</div>
                  <div className="text-[10px] text-ink-500 truncate">
                    {h.time} · {h.error || "Đã đăng thành công"}
                  </div>
                </div>
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${ch?.bg}`}>
                  {Icon && <Icon className={`w-3.5 h-3.5 ${ch?.text}`} />}
                </div>
                <span className="text-[12px] font-bold text-ink-900 tabular-nums shrink-0">+{h.reach}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

/* ════════════════════════════════════════════════
   TAB: ANALYTICS
════════════════════════════════════════════════ */
function AnalyticsTab({ data }) {
  return (
    <>
      <SectionHeader icon={TrendingUp} label="Hiệu quả 30 ngày" sub="Reach · engagement · conversion" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
        <Card title="Reach & Engagement theo ngày" subtitle="Tổng đa kênh" icon={TrendingUp} accent="violet">
          <div className="h-52 sm:h-64 overflow-hidden min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.reach30} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="reachG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="engG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" vertical={false} />
                <XAxis dataKey="d" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                <Area type="monotone" dataKey="reach" stroke="#8b5cf6" strokeWidth={2} fill="url(#reachG)" name="Reach" />
                <Area type="monotone" dataKey="eng" stroke="#f43f5e" strokeWidth={2} fill="url(#engG)" name="Engagement" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Phân bổ kênh" subtitle="% Reach 30 ngày" icon={PieChartIcon} accent="violet">
          <div className="h-52 sm:h-64 overflow-hidden min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie data={data.channelMix} dataKey="value" innerRadius={48} outerRadius={80} paddingAngle={2} stroke="#fff" strokeWidth={2}>
                  {data.channelMix.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" verticalAlign="bottom" />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-5">
        <Card title="Top 5 bài hiệu quả" subtitle="Theo engagement" icon={Star} accent="amber">
          <div className="h-52 sm:h-64 overflow-hidden min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topPosts} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" horizontal={false} />
                <XAxis type="number" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="t" type="category" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="eng" fill="#8b5cf6" radius={[0, 3, 3, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Performance đa chiều" subtitle="Reach · Engagement · Growth · Click · Conv · ROI" icon={Target} accent="violet">
          <div className="h-56 sm:h-64 overflow-hidden min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.radar}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="k" stroke="#8792a8" fontSize={10} />
                <PolarRadiusAxis stroke="#e5e7eb" fontSize={9} />
                <Radar name="Hiện tại" dataKey="now" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                <Radar name="Mục tiêu" dataKey="target" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════ */
function SectionHeader({ icon: Icon, label, sub, right }) {
  return (
    <div className="flex items-end justify-between gap-3 sm:gap-4 mt-7 sm:mt-9 mb-3">
      <div className="flex items-stretch gap-3 min-w-0 flex-1">
        <div className="w-1 rounded-sm bg-violet-600" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-display font-bold text-[12.5px] sm:text-[14px] tracking-wide uppercase text-violet-800 flex-wrap">
            {Icon && <Icon className="w-4 h-4 text-violet-700 shrink-0" />}
            <span className="truncate">{label}</span>
          </div>
          {sub && <div className="text-[12px] text-ink-500 mt-0.5 truncate">{sub}</div>}
        </div>
      </div>
      {right && <div className="shrink-0 flex items-center gap-1.5">{right}</div>}
    </div>
  );
}

function Badge({ tone = "violet", children }) {
  const map = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    ink: "bg-ink-100 text-ink-700 border-ink-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${map[tone] || map.violet}`}>
      {children}
    </span>
  );
}

function StatusPill({ s }) {
  const cfg = STATUS[s] || STATUS.draft;
  return <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cfg.cls}`}>{cfg.label}</span>;
}

function Card({ children, className = "", title, subtitle, right, icon: Icon, accent = "violet" }) {
  const accentMap = {
    blue: "text-blue-700", emerald: "text-emerald-700", amber: "text-amber-700",
    rose: "text-rose-700", violet: "text-violet-700", ink: "text-ink-700",
  };
  return (
    <div className={`bg-white border border-ink-200 rounded-md ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-ink-100">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className={`w-4 h-4 shrink-0 ${accentMap[accent] || accentMap.violet}`} />}
            <div className="min-w-0">
              {title && <div className="font-semibold text-[13px] text-ink-900 truncate">{title}</div>}
              {subtitle && <div className="text-[11px] text-ink-500 mt-0.5 truncate">{subtitle}</div>}
            </div>
          </div>
          {right && <div className="shrink-0 flex items-center gap-1.5">{right}</div>}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Tag({ size = 11, className = "w-3 h-3" }) {
  return <Hash className={className} style={{ width: size, height: size }} />;
}

function KPI({ k }) {
  const up = (k?.trend ?? 0) >= 0;
  const Icn = up ? TrendingUp : TrendingDown;
  const toneCls = up
    ? "text-emerald-700 bg-emerald-50 border-emerald-100"
    : "text-rose-700 bg-rose-50 border-rose-100";
  const Icon = k?.icon || Sparkles;
  return (
    <div className="bg-white border border-ink-200 rounded-md p-3 sm:p-3.5 hover:shadow-sm transition">
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <Icon className={`w-4 h-4 ${k?.color || "text-violet-700"}`} />
        <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded border ${toneCls}`}>
          <Icn className="w-2.5 h-2.5" />
          {up ? "+" : ""}{k?.trend ?? 0}%
        </span>
      </div>
      <div className="text-[18px] sm:text-[20px] font-display font-bold text-ink-900 tabular-nums leading-none break-all">{k?.value ?? "—"}</div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold mt-1.5 truncate">{k?.label ?? ""}</div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const toneCls = tone === "emerald" ? "text-emerald-700" : "text-ink-900";
  return (
    <div>
      <div className={`text-[14px] sm:text-[16px] font-display font-bold tabular-nums leading-none ${toneCls}`}>{value}</div>
      <div className="text-[9px] text-ink-500 uppercase tracking-wider font-semibold mt-1">{label}</div>
    </div>
  );
}

function AutomationCard({ a, expanded, onView }) {
  return (
    <div className={`bg-white border rounded-md p-4 sm:p-5 hover:shadow-sm transition ${
      a.status === "active" ? "border-violet-200" : "border-ink-200"
    }`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-md ${a.status === "active" ? "bg-violet-100 text-violet-700" : "bg-ink-100 text-ink-500"} flex items-center justify-center shrink-0`}>
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-ink-900 text-[13px] truncate">{a.name}</div>
            <div className="text-[10px] text-ink-500 truncate">{a.trigger}</div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
          a.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-ink-100 text-ink-500 border-ink-200"
        }`}>
          {a.status === "active" ? <><PlayCircle className="w-2.5 h-2.5" /> Chạy</> : <><PauseCircle className="w-2.5 h-2.5" /> Tạm</>}
        </span>
      </div>
      <div className="flex items-center gap-1.5 my-3">
        {a.steps.map((s, i) => (
          <div key={i} className="flex items-center gap-1 flex-1 min-w-0">
            <div className={`px-1.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 truncate flex-1 ${
              a.status === "active" ? "bg-violet-50 text-violet-700" : "bg-ink-50 text-ink-500"
            }`} title={s.label}>
              <s.icon className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{s.label}</span>
            </div>
            {i < a.steps.length - 1 && <ChevronRight className="w-3 h-3 text-ink-400 shrink-0" />}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-ink-100">
        <Stat label="Lượt chạy" value={a.runCount} />
        <Stat label="Thành công" value={`${a.successRate}%`} tone="emerald" />
        <Stat label="Đã đăng" value={a.postedCount} />
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-2">
          <button onClick={() => onView?.(a)} className="flex-1 px-2.5 py-1.5 rounded-md bg-violet-700 text-white text-[11px] font-semibold hover:bg-violet-800 transition">
            Xem chi tiết
          </button>
          <button className="flex-1 px-2.5 py-1.5 rounded-md border border-ink-200 text-ink-700 text-[11px] font-semibold hover:bg-ink-50 transition">
            {a.status === "active" ? "Tạm dừng" : "Kích hoạt"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   MODAL: SHARE
════════════════════════════════════════════════ */
function ShareModal({ post, onClose }) {
  const [channels, setChannels] = useState(["facebook", "zalo"]);
  const [tone, setTone] = useState("default");
  const [copied, setCopied] = useState(false);

  const link = `https://lepalmier.vn/blog/${(post.title || "demo").toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 50)}`;

  const text = useMemo(() => {
    const titles = {
      default: `${post.title}\n\n${post.excerpt || "Đọc chi tiết tại Le Palmier Hotels."}`,
      teaser: `🌴 ${post.title}\n\n${post.excerpt || "Trải nghiệm đẳng cấp tại Le Palmier."}\n👉 `,
      promo: `🎁 ƯU ĐÃI ĐẶC BIỆT — ${post.title}\n\n${post.excerpt || "Đặt phòng hôm nay để nhận ưu đãi."}\n👉 `,
    };
    return titles[tone] + link;
  }, [post, tone, link]);

  const shareTargets = [
    { id: "facebook",  name: "Facebook",  icon: Facebook,  color: "#1877F2", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(text)}` },
    { id: "zalo",      name: "Zalo",      icon: Send,      color: "#0068FF", url: `https://sp.zalo.me/share?url=${encodeURIComponent(link)}&title=${encodeURIComponent(post.title || "")}&desc=${encodeURIComponent(post.excerpt || "")}` },
    { id: "twitter",   name: "X / Twitter", icon: Twitter, color: "#0F1419", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` },
    { id: "linkedin",  name: "LinkedIn",  icon: Linkedin,  color: "#0A66C2", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}` },
    { id: "email",     name: "Email",     icon: MailIcon,  color: "#8b5cf6", url: `mailto:?subject=${encodeURIComponent(post.title || "")}&body=${encodeURIComponent(text)}` },
    { id: "copy",      name: "Copy link", icon: Copy,      color: "#0ea5e9", url: null },
  ];

  const toggle = (id) => setChannels((arr) => arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-md w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-ink-900 truncate">Chia sẻ bài viết</div>
              <div className="text-[11px] text-ink-500 truncate">{post.title}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-ink-100 text-ink-500 flex items-center justify-center transition shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Preview Card */}
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-2">Preview</div>
            <div className="bg-white border border-ink-200 rounded-md overflow-hidden">
              <div className="aspect-[16/9] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 relative">
                <div className="absolute inset-0 bg-soft-grid opacity-[0.1]" />
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded px-2 py-1 border border-white/20">
                  <Building2 className="w-3.5 h-3.5 text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Le Palmier Hotels</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/95 text-violet-700 uppercase tracking-wider mb-1.5">
                    {post.category || "Blog"}
                  </div>
                  <div className="text-white font-display font-bold text-[16px] sm:text-[18px] leading-tight line-clamp-2 drop-shadow">
                    {post.title}
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="text-[12px] text-ink-700 line-clamp-2 leading-relaxed">
                  {post.excerpt || "Khám phá trải nghiệm nghỉ dưỡng đẳng cấp 5 sao tại hệ thống Le Palmier Hotels & Resorts trên khắp Việt Nam."}
                </div>
                <div className="mt-2 text-[10px] text-ink-400 truncate">{link}</div>
              </div>
            </div>
          </div>

          {/* Tone */}
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-2">Văn phong</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "default", label: "Mặc định",  icon: FileText, desc: "Giữ nguyên" },
                { id: "teaser",  label: "Teaser",    icon: Sparkles, desc: "Hấp dẫn + emoji" },
                { id: "promo",   label: "Khuyến mãi", icon: Tag,     desc: "Có CTA đặt phòng" },
              ].map((t) => {
                const Icon = t.icon;
                const active = tone === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`p-2.5 rounded-md border text-left transition ${
                      active ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200" : "border-ink-200 hover:border-violet-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className={`w-3.5 h-3.5 ${active ? "text-violet-700" : "text-ink-500"}`} />
                      <span className={`text-[11px] font-bold ${active ? "text-violet-700" : "text-ink-900"}`}>{t.label}</span>
                    </div>
                    <div className="text-[10px] text-ink-500">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Channels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-wider font-bold text-ink-500">Chia sẻ qua kênh</div>
              <div className="text-[10px] text-ink-400">Đã chọn {channels.length}/{shareTargets.length}</div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {shareTargets.map((t) => {
                const Icon = t.icon;
                const active = channels.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    className={`p-2.5 rounded-md border text-center transition ${
                      active ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200" : "border-ink-200 hover:border-ink-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full mx-auto mb-1.5 flex items-center justify-center" style={{ background: t.color + "1a", color: t.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className={`text-[10px] font-bold ${active ? "text-violet-700" : "text-ink-700"}`}>{t.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-wider font-bold text-ink-500">Nội dung sẽ gửi</div>
              <button
                onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="text-[10px] font-bold text-violet-700 hover:text-violet-800 flex items-center gap-1"
              >
                {copied ? <><CheckCircle2 className="w-3 h-3" /> Đã copy</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <div className="bg-ink-50 border border-ink-200 rounded-md p-3 text-[12px] text-ink-800 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
              {text}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-ink-200 flex items-center justify-between gap-2 shrink-0 bg-ink-50">
          <span className="text-[11px] text-ink-500 truncate">
            <Sparkles className="w-3 h-3 inline mr-1 text-violet-700" /> Có thể chỉnh nội dung trước khi gửi
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose} className="px-3 py-1.5 rounded-md border border-ink-200 text-ink-700 text-[12px] font-semibold hover:bg-white transition">
              Hủy
            </button>
            <button
              onClick={() => {
                // Open URLs for selected non-copy targets
                channels.filter((id) => id !== "copy").forEach((id) => {
                  const t = shareTargets.find((x) => x.id === id);
                  if (t?.url) window.open(t.url, "_blank", "noopener,noreferrer,width=600,height=600");
                });
                if (channels.includes("copy")) {
                  navigator.clipboard?.writeText(text);
                  setCopied(true);
                  setTimeout(() => { setCopied(false); onClose(); }, 1000);
                } else {
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-md bg-violet-700 text-white text-[12px] font-bold hover:bg-violet-800 transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              Chia sẻ {channels.length > 0 ? `(${channels.length})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

/* ════════════════════════════════════════════════
   MODAL: AUTOMATION DETAIL
════════════════════════════════════════════════ */
function AutomationModal({ flow, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-md w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
              <Workflow className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-ink-900 truncate">Workflow: {flow.name}</div>
              <div className="text-[11px] text-ink-500 truncate">{flow.trigger}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-ink-100 text-ink-500 flex items-center justify-center transition shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-3">Sơ đồ luồng</div>
          <div className="space-y-3">
            {flow.steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="relative">
                  <div className="bg-white border-2 border-violet-200 rounded-md p-3 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-md bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-violet-700">Bước {i + 1}</span>
                        <Badge tone="violet">{s.kind}</Badge>
                      </div>
                      <div className="font-semibold text-ink-900 mt-0.5 truncate">{s.label}</div>
                      <div className="text-[11px] text-ink-500 mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                  {i < flow.steps.length - 1 && (
                    <div className="flex justify-center py-1.5">
                      <ChevronDown className="w-4 h-4 text-violet-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="px-5 py-3 border-t border-ink-200 flex items-center justify-between gap-2 shrink-0 bg-ink-50">
          <span className="text-[11px] text-ink-500 truncate">
            Đã chạy: <b className="text-ink-900 tabular-nums">{flow.runCount}</b> · Thành công: <b className="text-emerald-700 tabular-nums">{flow.successRate}%</b>
          </span>
          <button onClick={onClose} className="px-3 py-1.5 rounded-md bg-violet-700 text-white text-[12px] font-bold hover:bg-violet-800 transition">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════ */
function buildData() {
  const heroMeta = [
    { label: "Bài viết",  value: "128" },
    { label: "Đã đăng",   value: "342" },
    { label: "Đang chờ",   value: "23" },
    { label: "Automation", value: "8" },
  ];

  const overviewKpi = [
    { label: "Reach", value: "1.28M", trend: 12.4, icon: Eye,        color: "text-violet-700" },
    { label: "Engagement", value: "84.2K", trend: 18.6, icon: Heart,    color: "text-rose-700" },
    { label: "Click", value: "32.6K", trend: 9.1, icon: MousePointerClick, color: "text-blue-700" },
    { label: "Conversion", value: "1.84%", trend: 4.2, icon: Target,    color: "text-emerald-700" },
    { label: "ROI quảng cáo", value: "4.8x", trend: -2.1, icon: DollarSign, color: "text-amber-700" },
    { label: "Followers", value: "+12.4K", trend: 22.8, icon: Users,   color: "text-fuchsia-700" },
  ];

  const channels = [
    { id: "facebook",  name: "Le Palmier Hotels",   followers: "184.2K", posts: 28, engagement: "32.4K", health: 96, status: "connected" },
    { id: "instagram", name: "@lepalmier.vn",       followers: "98.4K",  posts: 36, engagement: "24.1K", health: 92, status: "connected" },
    { id: "zalo",      name: "Le Palmier OA",       followers: "62.8K",  posts: 18, engagement: "12.6K", health: 88, status: "connected" },
    { id: "tiktok",    name: "@lepalmierhotels",    followers: "126.4K", posts: 42, engagement: "48.2K", health: 94, status: "connected" },
    { id: "youtube",   name: "Le Palmier Channel",  followers: "32.8K",  posts: 8,  engagement: "8.4K",  health: 78, status: "connected" },
    { id: "twitter",   name: "@lepalmierhotels",    followers: "12.4K",  posts: 14, engagement: "2.1K",  health: 64, status: "connected" },
    { id: "linkedin",  name: "Le Palmier Group",    followers: "8.6K",   posts: 12, engagement: "1.4K",  health: 82, status: "connected" },
    { id: "website",   name: "Blog lepalmier.vn",   followers: "—",      posts: 32, engagement: "18.2K", health: 90, status: "connected" },
    { id: "email",     name: "Newsletter",          followers: "24.6K",  posts: 4,  engagement: "3.8K",  health: 86, status: "connected" },
  ];

  const recentPosts = [
    {
      id: "p1", title: "Top 10 điểm check-in mùa hè tại Phú Quốc", excerpt: "Khám phá những góc sống ảo đẹp nhất tại đảo ngọc cùng Le Palmier.",
      category: "Trải nghiệm", author: "Nguyễn Minh K.", date: "28/07 · 09:30",
      tags: ["phu-quoc", "summer", "check-in"],
      channels: ["facebook", "instagram", "tiktok", "website"], status: "published", engagement: "12.4K",
    },
    {
      id: "p2", title: "Ưu đãi 30% phòng Deluxe tháng 8", excerpt: "Đặt phòng sớm để nhận ưu đãi hấp dẫn.",
      category: "Khuyến mãi", author: "Marketing Team", date: "28/07 · 08:00",
      tags: ["promo", "deluxe", "summer-sale"],
      channels: ["facebook", "zalo", "email"], status: "publishing", engagement: "8.2K",
    },
    {
      id: "p3", title: "Bí quyết chọn resort cho gia đình có trẻ nhỏ", excerpt: "Hướng dẫn chi tiết từ A-Z cho kỳ nghỉ gia đình hoàn hảo.",
      category: "Cẩm nang", author: "Trần Hồng N.", date: "27/07 · 16:00",
      tags: ["family", "kids", "tips"],
      channels: ["website", "facebook", "linkedin"], status: "published", engagement: "5.8K",
    },
    {
      id: "p4", title: "Behind the scenes: Đầu bếp 5 sao tại Le Palmier", excerpt: "Câu chuyện về những đôi tay vàng làm nên ẩm thực đẳng cấp.",
      category: "Câu chuyện", author: "Lê Quốc C.", date: "27/07 · 14:00",
      tags: ["chef", "fnb", "behind-the-scenes"],
      channels: ["youtube", "instagram", "facebook"], status: "scheduled", engagement: "—",
    },
    {
      id: "p5", title: "Sự kiện âm nhạc Acoustic cuối tuần", excerpt: "Đêm nhạc acoustic lãng mạn bên bể bơi vô cực.",
      category: "Sự kiện", author: "Event Team", date: "26/07 · 10:00",
      tags: ["event", "acoustic", "weekend"],
      channels: ["facebook", "instagram", "zalo"], status: "review", engagement: "—",
    },
    {
      id: "p6", title: "Review khách hàng: Kỳ nghỉ đáng nhớ tại Đà Lạt", excerpt: "Chia sẻ từ gia đình anh Tuấn sau 3 ngày tại LP2.",
      category: "Đánh giá", author: "CSKH Team", date: "26/07 · 09:00",
      tags: ["review", "da-lat", "customer-story"],
      channels: ["facebook", "website", "email"], status: "published", engagement: "6.2K",
    },
  ];

  const calendar = [
    { date: "28/07", slots: [
      { id: "s1", time: "09:00", title: "Top 10 check-in", channel: "facebook" },
      { id: "s2", time: "12:00", title: "Ưu đãi Deluxe", channel: "zalo" },
      { id: "s3", time: "18:00", title: "Behind chef", channel: "youtube" },
    ]},
    { date: "29/07", slots: [
      { id: "s4", time: "08:30", title: "Mẹo đặt phòng", channel: "website" },
      { id: "s5", time: "14:00", title: "Reel biển Phú Quốc", channel: "tiktok" },
    ]},
    { date: "30/07", slots: [
      { id: "s6", time: "10:00", title: "Family package", channel: "facebook" },
      { id: "s7", time: "17:00", title: "Acoustic đêm", channel: "instagram" },
      { id: "s8", time: "20:00", title: "Live concert", channel: "youtube" },
    ]},
    { date: "31/07", slots: [
      { id: "s9", time: "11:00", title: "Tour Đà Lạt", channel: "instagram" },
    ]},
    { date: "01/08", slots: [
      { id: "s10", time: "09:00", title: "Khuyến mãi T8", channel: "facebook" },
      { id: "s11", time: "15:00", title: "Review mới", channel: "website" },
    ]},
    { date: "02/08", slots: [
      { id: "s12", time: "20:00", title: "Live BBQ", channel: "facebook" },
    ]},
    { date: "03/08", slots: [] },
  ];

  const automations = [
    {
      id: "a1", name: "Auto-post blog mới", trigger: "Khi xuất bản bài viết mới",
      status: "active", runCount: 124, successRate: 98, postedCount: 312,
      steps: [
        { kind: "Trigger", label: "Xuất bản bài",   desc: "Lắng nghe sự kiện 'post.published' từ CMS", icon: Webhook },
        { kind: "Action",  label: "Đăng FB + IG",   desc: "Auto-publish lên 2 kênh",                    icon: Share2 },
        { kind: "Action",  label: "Gửi email",      desc: "Newsletter cho 24.6K subscribers",            icon: AtSign },
        { kind: "Action",  label: "Slack team",     desc: "Thông báo team Marketing",                    icon: Bell },
      ],
    },
    {
      id: "a2", name: "Khuyến mãi đa kênh", trigger: "Mỗi thứ 2 · 09:00",
      status: "active", runCount: 12, successRate: 100, postedCount: 36,
      steps: [
        { kind: "Trigger", label: "Cron T2 09:00", desc: "Hàng tuần tự động chạy",  icon: Clock },
        { kind: "Action",  label: "Lấy promo",     desc: "Từ module Khuyến mãi",     icon: Sparkles },
        { kind: "Action",  label: "Đăng 4 kênh",   desc: "FB · IG · Zalo · Email",  icon: Share2 },
      ],
    },
    {
      id: "a3", name: "Review tự động sau checkout", trigger: "Sau khi khách trả phòng +24h",
      status: "active", runCount: 86, successRate: 94, postedCount: 81,
      steps: [
        { kind: "Trigger", label: "Booking.checkout +24h", desc: "Trigger từ hệ thống booking", icon: Webhook },
        { kind: "Filter",  label: "Rating ≥ 4 sao",        desc: "Chỉ gửi cho khách hài lòng",  icon: Star },
        { kind: "Action",  label: "Gửi email",             desc: "Template cảm ơn + link",       icon: AtSign },
        { kind: "Action",  label: "Gắn tag VIP",           desc: "Auto update CRM",              icon: Hash },
      ],
    },
    {
      id: "a4", name: "Repurpose TikTok → Reels", trigger: "Khi đăng video TikTok",
      status: "paused", runCount: 24, successRate: 100, postedCount: 24,
      steps: [
        { kind: "Trigger", label: "TikTok.published", desc: "Từ kênh TikTok chính",      icon: Webhook },
        { kind: "Transform", label: "Re-format 9:16", desc: "Tối ưu cho Instagram Reels", icon: Repeat },
        { kind: "Action",  label: "Đăng IG Reels",   desc: "Auto-publish IG",            icon: Share2 },
      ],
    },
    {
      id: "a5", name: "SEO sitemap auto-update", trigger: "Sau khi publish bài",
      status: "active", runCount: 124, successRate: 100, postedCount: 0,
      steps: [
        { kind: "Trigger", label: "post.published", desc: "Sự kiện xuất bản",           icon: Webhook },
        { kind: "Action",  label: "Ping Google",    desc: "IndexNow + sitemap.xml",     icon: Globe2 },
      ],
    },
    {
      id: "a6", name: "Email drip 7 ngày", trigger: "Khi có booking mới",
      status: "paused", runCount: 18, successRate: 88, postedCount: 0,
      steps: [
        { kind: "Trigger", label: "booking.created", desc: "Từ hệ thống booking",      icon: Webhook },
        { kind: "Wait",    label: "Đợi 1 ngày",      desc: "Gửi email chào mừng",       icon: Hourglass },
        { kind: "Action",  label: "Gửi drip 1",      desc: "Template 'Check-in'",       icon: AtSign },
        { kind: "Wait",    label: "Đợi 3 ngày",      desc: "",                            icon: Hourglass },
        { kind: "Action",  label: "Gửi drip 2",      desc: "Template 'Khám phá'",       icon: AtSign },
      ],
    },
  ];

  const triggers = [
    { name: "Post Published",  desc: "Sau khi xuất bản bài",  icon: FileText,     bg: "bg-violet-50", text: "text-violet-700" },
    { name: "Booking Created", desc: "Có đơn đặt phòng mới",  icon: CalendarDays, bg: "bg-blue-50",   text: "text-blue-700" },
    { name: "Form Submitted",  desc: "Khách gửi form",        icon: Send,         bg: "bg-emerald-50",text: "text-emerald-700" },
    { name: "Webhook",         desc: "Từ hệ thống bên ngoài", icon: Webhook,      bg: "bg-amber-50",  text: "text-amber-700" },
    { name: "Schedule",        desc: "Theo lịch cố định",     icon: Clock,        bg: "bg-rose-50",   text: "text-rose-700" },
    { name: "New Follower",    desc: "Có follower mới",       icon: Users,        bg: "bg-fuchsia-50",text: "text-fuchsia-700" },
    { name: "Review mới",      desc: "Khách để lại review",   icon: Star,         bg: "bg-amber-50",  text: "text-amber-700" },
    { name: "Tag Added",       desc: "CRM gắn tag",           icon: Hash,         bg: "bg-blue-50",   text: "text-blue-700" },
  ];

  const actions = [
    { name: "Đăng Facebook",     desc: "Auto-publish bài viết", icon: Facebook,   bg: "bg-blue-50",  text: "text-blue-700" },
    { name: "Đăng Instagram",    desc: "Feed / Story / Reels",  icon: Instagram,  bg: "bg-rose-50",  text: "text-rose-700" },
    { name: "Gửi Zalo OA",       desc: "Broadcast tới followers", icon: Send,    bg: "bg-blue-50",  text: "text-blue-700" },
    { name: "Email Newsletter",  desc: "Gửi broadcast",         icon: AtSign,     bg: "bg-violet-50",text: "text-violet-700" },
    { name: "Đăng TikTok",       desc: "Upload video",          icon: Music2,     bg: "bg-ink-100", text: "text-ink-900" },
    { name: "IndexNow",          desc: "Báo Google index",      icon: Globe2,     bg: "bg-sky-50",   text: "text-sky-700" },
    { name: "Gắn tag CRM",       desc: "Auto-tag khách",        icon: Hash,       bg: "bg-emerald-50",text: "text-emerald-700" },
    { name: "Notify Slack",      desc: "Thông báo team",        icon: Bell,       bg: "bg-amber-50", text: "text-amber-700" },
  ];

  const queue = [
    { id: "q1", title: "Ưu đãi 30% phòng Deluxe tháng 8",  category: "Khuyến mãi", channel: "facebook",  author: "Marketing", date: "29/07", day: "T4", time: "09:00", status: "scheduled", postType: "carousel" },
    { id: "q2", title: "Behind the scenes đầu bếp",         category: "Câu chuyện",  channel: "instagram", author: "Lê Q.C",   date: "29/07", day: "T4", time: "14:00", status: "scheduled", postType: "reel" },
    { id: "q3", title: "Sự kiện Acoustic cuối tuần",         category: "Sự kiện",     channel: "zalo",      author: "Event Team", date: "30/07", day: "T5", time: "17:00", status: "review",    postType: "post" },
    { id: "q4", title: "Tour Đà Lạt 4N3Đ",                  category: "Trải nghiệm", channel: "tiktok",    author: "Trần H.N",   date: "30/07", day: "T5", time: "20:00", status: "scheduled", postType: "video" },
    { id: "q5", title: "Mẹo đặt phòng mùa cao điểm",         category: "Cẩm nang",    channel: "website",   author: "Nguyễn M.K", date: "31/07", day: "T6", time: "08:30", status: "scheduled", postType: "post" },
    { id: "q6", title: "Review mới từ khách Đà Lạt",         category: "Đánh giá",    channel: "linkedin",  author: "CSKH",       date: "31/07", day: "T6", time: "15:00", status: "scheduled", postType: "post" },
    { id: "q7", title: "Khuyến mãi Family tháng 8",         category: "Khuyến mãi",  channel: "email",     author: "Marketing", date: "01/08", day: "T7", time: "09:00", status: "scheduled", postType: "post" },
  ];

  const history = [
    { id: "h1", title: "Top 10 check-in Phú Quốc",   channel: "facebook", time: "28/07 09:30", reach: "12.4K", result: "success" },
    { id: "h2", title: "Reel biển hoàng hôn",         channel: "instagram",time: "27/07 18:45", reach: "8.6K",  result: "success" },
    { id: "h3", title: "Ưu đãi phòng Suite",          channel: "zalo",     time: "27/07 14:20", reach: "4.2K",  result: "success" },
    { id: "h4", title: "Behind chef",                  channel: "youtube",  time: "27/07 14:00", reach: "—",     result: "failed", error: "API quota exceeded" },
    { id: "h5", title: "Review Đà Lạt Tuấn family",   channel: "facebook", time: "26/07 09:00", reach: "6.2K",  result: "success" },
    { id: "h6", title: "Newsletter tuần 30",           channel: "email",    time: "25/07 08:00", reach: "3.8K",  result: "success" },
  ];

  const reach30 = Array.from({ length: 30 }, (_, i) => ({
    d: `${i + 1}/7`,
    reach: Math.round(28_000 + Math.sin(i / 4) * 12_000 + (i % 7 === 5 ? 18_000 : 0)),
    eng:   Math.round(1_800  + Math.cos(i / 3) * 800  + (i % 7 === 5 ? 1_200 : 0)),
  }));

  const channelMix = [
    { name: "TikTok",    value: 32, color: "#000000" },
    { name: "Facebook",  value: 24, color: "#1877F2" },
    { name: "Instagram", value: 18, color: "#E1306C" },
    { name: "Website",   value: 12, color: "#0ea5e9" },
    { name: "Zalo",      value: 8,  color: "#0068FF" },
    { name: "Khác",      value: 6,  color: "#8b5cf6" },
  ];

  const topPosts = [
    { t: "Reel biển hoàng hôn", eng: 48_200 },
    { t: "Top 10 check-in",      eng: 32_400 },
    { t: "Behind chef",          eng: 28_600 },
    { t: "Ưu đãi Deluxe",        eng: 22_100 },
    { t: "Review Đà Lạt",        eng: 18_400 },
  ];

  const radar = [
    { k: "Reach",        now: 86, target: 100 },
    { k: "Engagement",   now: 72, target: 85 },
    { k: "Growth",       now: 94, target: 90 },
    { k: "Click CTR",    now: 58, target: 75 },
    { k: "Conversion",   now: 42, target: 60 },
    { k: "ROI",          now: 76, target: 80 },
  ];

  return {
    heroMeta, overviewKpi, channels, recentPosts, calendar, automations,
    triggers, actions, queue, history,
    reach30, channelMix, topPosts, radar,
  };
}