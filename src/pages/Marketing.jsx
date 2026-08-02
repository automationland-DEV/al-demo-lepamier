import { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Icons } from "../components/Icons";
import { usePalette, scoreTone } from "../theme/palette";
import {
  Page, PageHeader, Tabs, Button, Toast as UiToast, Eyebrow, Hairline,
  StatusTag as UiStatusTag, Tag, Panel as UiPanel, SectionHead,
  ChartLegend, chartTip as uiChartTip, axisProps, gridProps,
} from "../components/ui";

const {
  Megaphone, Facebook, Instagram, Youtube, Twitter, Linkedin, Music2,
  Share2, Hash, AtSign, FileText, Workflow,
  Webhook, Bot, Target, MousePointerClick, Heart, CalendarClock, CalendarDays,
  TrendingUp, TrendingDown, Plus, Download, Star, Users, Clock, DollarSign,
  Eye, Send, CheckCircle2, XCircle, Hourglass, Sparkles, Copy, Building2,
  Globe2, Zap, ChevronRight, ChevronDown, X, Repeat, Edit2, Bell, Bookmark,
  Search,
} = Icons;

/** Bỏ dấu tiếng Việt để tìm kiếm trong hàng chờ không phụ thuộc dấu */
const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

/* ════════ Bảng màu kênh ════════
 * Đây là màu THƯƠNG HIỆU NGOÀI — không đổi theo bộ sưu tập, vì đó là nhận
 * diện của họ chứ không phải trang trí của mình (Design.md §2.2).
 * v4 bỏ gradient nên chỉ giữ một màu đặc cho mỗi kênh. */
const CHANNELS = {
  facebook:  { name: "Facebook",    icon: Facebook,  from: "#1877F2", to: "#1877F2" },
  instagram: { name: "Instagram",   icon: Instagram, from: "#E1306C", to: "#E1306C" },
  zalo:      { name: "Zalo OA",     icon: Send,      from: "#0068FF", to: "#0068FF" },
  tiktok:    { name: "TikTok",      icon: Music2,    from: "#111827", to: "#111827" },
  youtube:   { name: "YouTube",     icon: Youtube,   from: "#FF0000", to: "#FF0000" },
  twitter:   { name: "X / Twitter", icon: Twitter,   from: "#0f172a", to: "#0f172a" },
  linkedin:  { name: "LinkedIn",    icon: Linkedin,  from: "#0A66C2", to: "#0A66C2" },
  website:   { name: "Website",     icon: Globe2,    from: "#0891b2", to: "#0891b2" },
  email:     { name: "Newsletter",  icon: AtSign,    from: "#7c3aed", to: "#7c3aed" },
};

/* Trạng thái bài viết → tone ngữ nghĩa. v3 ghi cứng hex pastel nên chói ở
 * chế độ tối; nay trỏ vào token nên tự đảo theo chế độ. */
const STATUS = {
  draft:      { label: "Nháp",        tone: "neutral" },
  review:     { label: "Chờ duyệt",   tone: "info" },
  scheduled:  { label: "Đã lên lịch", tone: "info" },
  publishing: { label: "Đang đăng",   tone: "warning" },
  published:  { label: "Đã đăng",     tone: "success" },
  failed:     { label: "Lỗi",         tone: "danger" },
};

const TABS = [
  { key: "overview",   label: "Tổng quan",  icon: Sparkles },
  { key: "channels",   label: "Kênh đăng",  icon: Share2 },
  { key: "automation", label: "Automation", icon: Bot },
  { key: "queue",      label: "Hàng chờ",   icon: CalendarClock },
  { key: "analytics",  label: "Phân tích",  icon: TrendingUp },
];

/* ════════════════════════════════════════════════════════════ */

export default function Marketing() {
  const { brand: BRAND, series } = usePalette();
  const KPI = useMemo(() => series(6), [series]);
  const [tab, setTab] = useState("overview");
  const [shareOpen, setShareOpen] = useState(null);
  const [autoOpen, setAutoOpen] = useState(null);

  /* Dữ liệu vào state để bật/tắt automation và thêm workflow/bài viết ghi được */
  const [data, setData] = useState(() => buildData());
  const [composeOpen, setComposeOpen] = useState(false);
  const [flowFormOpen, setFlowFormOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [channelOpen, setChannelOpen] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const toggleAutomation = (a) => {
    const next = a.status === "active" ? "paused" : "active";
    setData((d) => ({
      ...d,
      automations: d.automations.map((x) => (x.id === a.id ? { ...x, status: next } : x)),
    }));
    setAutoOpen((o) => (o && o.id === a.id ? { ...o, status: next } : o));
    notify(`${a.name} → ${next === "active" ? "Đã kích hoạt" : "Đã tạm dừng"}`);
  };

  const addWorkflow = (payload) => {
    const flow = {
      id: `a${Date.now()}`,
      name: payload.name,
      trigger: payload.trigger,
      status: payload.status,
      runCount: 0, successRate: 100, postedCount: 0,
      steps: [
        { kind: "Trigger", label: payload.trigger, desc: "Vừa tạo từ Marketing Hub", icon: Webhook },
        ...payload.actions.map((act) => ({ kind: "Action", label: act, desc: "Bước tự động", icon: Zap })),
      ],
    };
    setData((d) => ({ ...d, automations: [flow, ...d.automations] }));
    setFlowFormOpen(false);
    notify(`Đã tạo workflow “${payload.name}”`);
  };

  const addPost = (payload) => {
    /* Đăng ngay thì lấy mốc thời gian hiện tại của hệ thống demo (28/07/2026),
       không dùng giá trị mặc định của ô chọn lịch. */
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const stamp = payload.schedule === "now"
      ? `28/07 · ${hhmm}`
      : `${payload.date.slice(8, 10)}/${payload.date.slice(5, 7)} · ${payload.time}`;

    const post = {
      id: `p${Date.now()}`,
      title: payload.title,
      excerpt: payload.excerpt,
      category: payload.category,
      author: "Marketing Team",
      date: stamp,
      tags: payload.tags,
      channels: payload.channels,
      status: payload.schedule === "now" ? "publishing" : "scheduled",
      engagement: "—",
    };
    setData((d) => ({ ...d, recentPosts: [post, ...d.recentPosts] }));
    setComposeOpen(false);
    notify(payload.schedule === "now"
      ? `Đang đăng “${payload.title}” lên ${payload.channels.length} kênh`
      : `Đã lên lịch “${payload.title}” · ${payload.date} ${payload.time}`);
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Marketing Hub"
        title="Trung tâm Marketing"
        live
        meta={[
          "9 kênh đang kết nối",
          ...data.heroMeta.map((m) => `${m.value} ${m.label.toLowerCase()}`),
        ]}
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={() => setExportOpen(true)}>
              <span className="hidden sm:inline">Xuất báo cáo</span>
            </Button>
            <Button variant="outline" icon={Workflow} onClick={() => setFlowFormOpen(true)}>
              <span className="hidden sm:inline">Tạo Automation</span>
            </Button>
            <Button icon={Plus} onClick={() => setComposeOpen(true)}>Bài viết mới</Button>
          </>
        }
      />

      {/* ═══════ TABS ═══════ */}
      <Tabs value={tab} onChange={setTab} items={TABS} className="mb-2" />

      {tab === "overview"   && <Overview data={data} kpi={KPI} brand={BRAND} onShare={setShareOpen} />}
      {tab === "channels"   && <ChannelsTab data={data} brand={BRAND} onShare={setShareOpen} onDetail={setChannelOpen} />}
      {tab === "automation" && <AutomationTab data={data} brand={BRAND} onView={setAutoOpen}
                                              onToggle={toggleAutomation} onNew={() => setFlowFormOpen(true)} />}
      {tab === "queue"      && <QueueTab data={data} brand={BRAND} onShare={setShareOpen} />}
      {tab === "analytics"  && <AnalyticsTab data={data} brand={BRAND} />}

      {shareOpen && <ShareModal post={shareOpen} onClose={() => setShareOpen(null)} />}
      {autoOpen && (
        <AutomationModal flow={autoOpen} onClose={() => setAutoOpen(null)}
                         onToggle={() => toggleAutomation(autoOpen)} />
      )}
      {composeOpen && <ComposeModal brand={BRAND} onClose={() => setComposeOpen(false)} onSubmit={addPost} />}
      {flowFormOpen && <WorkflowModal brand={BRAND} onClose={() => setFlowFormOpen(false)} onSubmit={addWorkflow} />}
      {exportOpen && <ExportModal data={data} onClose={() => setExportOpen(false)} onPick={(f) => { setExportOpen(false); notify(`Đang chuẩn bị ${f}`); }} />}
      {channelOpen && <ChannelModal ch={channelOpen} onClose={() => setChannelOpen(null)} />}

      <UiToast message={toast} onClose={() => setToast(null)} />

      <Hairline className="mt-16 mb-4" />
      <div className="flex items-center justify-center gap-1.5 text-[11px]" style={{ color: "var(--fg-subtle)" }}>
        <Megaphone className="w-3 h-3" /> Marketing Hub · Đồng bộ đa kênh · Cập nhật liên tục · 02/08/2026
      </div>
    </Page>
  );
}

/* ════════════════ TAB: TỔNG QUAN ════════════════ */
function Overview({ data, kpi, brand, onShare }) {
  const BRAND = brand;
  return (
    <>
      <Section eyebrow="Hiệu quả" title="KPI tuần này" sub="So với tuần trước" icon={Target} />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {data.overviewKpi.map((k, i) => <KpiCard key={k.label} k={{ ...k, ...kpi[i] }} />)}
      </div>

      <Section eyebrow="Nội dung" title="Bài viết gần đây" sub="Trạng thái & đăng tải đa kênh" icon={FileText}
               right={<Pill>{data.recentPosts.length} bài</Pill>} />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-[13px]">
            <thead>
              <tr style={{ backgroundColor: "var(--surface-2)" }}>
                {["Bài viết", "Danh mục", "Kênh", "Trạng thái", "Tương tác", ""].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[10.5px] font-medium uppercase tracking-wider ${i === 4 ? "text-right" : "text-left"}`}
                      style={{ color: "var(--fg-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentPosts.map((p) => {
                const st = STATUS[p.status] || STATUS.draft;
                return (
                  <tr key={p.id} className="border-t transition hover:bg-ink-50" style={{ borderColor: "var(--border-soft)" }}>
                    <td className="px-5 py-3.5 max-w-[300px]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: st.dot }} />
                        <div className="min-w-0">
                          <div className="font-medium truncate" style={{ color: "var(--fg)" }}>{p.title}</div>
                          <div className="text-[11px] truncate mt-0.5" style={{ color: "var(--fg-subtle)" }}>
                            {p.author} · {p.date} · #{p.tags?.slice(0, 2).join(" #")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><CatPill>{p.category}</CatPill></td>
                    <td className="px-5 py-3.5"><ChannelStack ids={p.channels} /></td>
                    <td className="px-5 py-3.5"><StatusTag s={p.status} /></td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums" style={{ color: "var(--fg)" }}>
                      {p.engagement}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn onClick={() => onShare(p)} title="Chia sẻ nhanh" tone="brand"><Share2 className="w-4 h-4" /></IconBtn>
                        <IconBtn title="Sửa"><Edit2 className="w-4 h-4" /></IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Section eyebrow="Tự động hóa" title="Automation đang chạy" sub="Tự động đăng tải đa kênh" icon={Bot} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.automations.map((a) => <AutomationCard key={a.id} a={a} brand={BRAND} />)}
      </div>
    </>
  );
}

/* ════════════════ TAB: KÊNH ĐĂNG ════════════════ */
function ChannelsTab({ data, onShare, onDetail }) {
  return (
    <>
      <Section eyebrow="Kết nối" title="Kênh đăng" sub="Trạng thái kết nối & sức khỏe" icon={Share2} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.channels.map((c) => {
          const m = CHANNELS[c.id];
          const Icon = m.icon;
          const health = c.health;
          const ht = scoreTone(health);
          const connected = c.status === "connected";
          return (
            <div key={c.id} className="card-hover border p-5"
                 style={{
                   borderRadius: "var(--r)",
                   backgroundColor: "var(--surface)",
                   borderColor: "var(--border)",
                   boxShadow: "var(--shadow-card)",
                 }}>
              {/* Ô icon giữ màu thương hiệu thật của kênh — Design.md §2.2 */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 flex items-center justify-center text-white shrink-0"
                      style={{ borderRadius: "var(--r-sm)", backgroundColor: m.from }}>
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[15px] font-medium truncate" style={{ color: "var(--fg)" }}>{c.name}</div>
                  <div className="text-[11px] flex items-center gap-1.5 mt-0.5" style={{ color: "var(--fg-muted)" }}>
                    <span className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: connected ? "var(--success)" : "var(--danger)" }} />
                    {connected ? "Đã kết nối" : "Mất kết nối"} · {m.name}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-px mt-4 border overflow-hidden"
                   style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}>
                <MiniStat label="Followers" value={c.followers} />
                <MiniStat label="Bài đăng"  value={c.posts} />
                <MiniStat label="Tương tác" value={c.engagement} />
              </div>

              <div className="flex items-center gap-2.5 mt-4">
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold shrink-0"
                      style={{ color: "var(--fg-subtle)" }}>Sức khỏe</span>
                <div className="flex-1 h-0.5 overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
                  <div className="h-full" style={{ width: `${health}%`, backgroundColor: ht.base }} />
                </div>
                <span className="text-[12px] tnum" style={{ color: "var(--fg)" }}>{health}%</span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button className="flex-1" size="sm" variant="outline"
                        onClick={() => onDetail?.({ ...c, meta: m, health })}>
                  Xem chi tiết
                </Button>
                <Button
                  className="flex-1" size="sm"
                  onClick={() => onShare({ id: "demo", title: `Đăng nhanh lên ${c.name}`, category: m.name,
                                           excerpt: "Bài viết sẽ được tạo nhanh từ template và đăng lên kênh này.", channels: [c.id] })}>
                  Đăng nhanh
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Section eyebrow="Lịch" title="Lịch đăng tuần này" sub="Hàng chờ & slot trống" icon={CalendarDays} />
      <Panel>
        <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--border)" }}>
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
            <div key={d} className="px-2 py-3 text-center text-[10.5px] uppercase font-medium tracking-wider"
                 style={{ color: "var(--fg-muted)" }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {data.calendar.map((day, i) => (
            <div key={i} className="border-r last:border-r-0 p-2 min-h-[190px] space-y-2"
                 style={{ borderColor: "var(--border-soft)" }}>
              <div className="text-[10.5px] font-medium tabular-nums" style={{ color: "var(--fg-subtle)" }}>{day.date}</div>
              {day.slots.map((s) => {
                const ch = CHANNELS[s.channel];
                const Icon = ch?.icon;
                return (
                  <div key={s.id} className="rounded-[var(--r-sm)] p-2 text-white overflow-hidden"
                       style={{ background: `linear-gradient(135deg,${ch.from},${ch.to})`,
                                boxShadow: `0 6px 14px -8px ${ch.from}` }}>
                    <div className="flex items-center gap-1 text-[9.5px] font-medium opacity-90">
                      {Icon && <Icon className="w-2.5 h-2.5" />} {s.time}
                    </div>
                    <div className="text-[11px] font-medium leading-tight mt-0.5 line-clamp-2">{s.title}</div>
                  </div>
                );
              })}
              {day.slots.length === 0 && (
                <div className="rounded-[var(--r-sm)] border border-dashed h-16 flex items-center justify-center text-[10.5px] font-semibold"
                     style={{ borderColor: "var(--border)", color: "var(--fg-subtle)" }}>
                  Trống
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

/* ════════════════ TAB: AUTOMATION ════════════════ */
function AutomationTab({ data, brand, onView, onToggle, onNew }) {
  const BRAND = brand;
  const active = data.automations.filter((a) => a.status === "active").length;
  return (
    <>
      <Section eyebrow="Tự động hóa" title="Workflow Automation"
               sub={`${active}/${data.automations.length} đang chạy`} icon={Workflow}
               right={
                 <button onClick={onNew}
                         className="glowbtn inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--r-sm)] text-white text-[12px] font-medium active:scale-95"
                         style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
                   <Plus className="w-3.5 h-3.5" /> Workflow mới
                 </button>
               } />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.automations.map((a) => (
          <AutomationCard key={a.id} a={a} brand={BRAND} expanded onView={onView} onToggle={onToggle} />
        ))}
      </div>

      <Section eyebrow="Thư viện" title="Triggers có sẵn" sub="Sự kiện kích hoạt automation" icon={Webhook} />
      <BlockGrid items={data.triggers} />

      <Section eyebrow="Thư viện" title="Hành động tự động hóa" sub="Action block — kéo vào workflow" icon={Zap} />
      <BlockGrid items={data.actions} />
    </>
  );
}

/** Lưới khối trigger/action. Màu lấy từ bảng đất theo thứ tự thay vì các hex
 *  neon còn sót trong buildData() — chúng là màu phân loại, Design.md §2.4. */
function BlockGrid({ items }) {
  const { series } = usePalette();
  const colors = useMemo(() => series(7), [series]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((t, i) => {
        const c = colors[i % colors.length];
        return (
          <div key={i} className="card-hover border p-4 cursor-pointer"
               style={{
                 borderRadius: "var(--r)",
                 backgroundColor: "var(--surface)",
                 borderColor: "var(--border)",
                 boxShadow: "var(--shadow-card)",
               }}>
            <div className="w-9 h-9 flex items-center justify-center mb-3 border"
                 style={{
                   borderRadius: "var(--r-sm)",
                   backgroundColor: c.soft,
                   borderColor: c.base,
                   color: c.fg,
                 }}>
              <t.icon className="w-4 h-4" />
            </div>
            <div className="text-[13px] font-medium truncate" style={{ color: "var(--fg)" }}>{t.name}</div>
            <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--fg-muted)" }}>{t.desc}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════ TAB: HÀNG CHỜ ════════════════ */
function QueueTab({ data, brand, onShare }) {
  const BRAND = brand;
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [chan, setChan] = useState("all");

  const chanOptions = useMemo(
    () => [...new Set(data.queue.map((x) => x.channel))],
    [data.queue]
  );

  const queue = useMemo(() => {
    const needle = deaccent(q.trim());
    return data.queue.filter((x) => {
      if (status !== "all" && x.status !== status) return false;
      if (chan !== "all" && x.channel !== chan) return false;
      if (needle && !deaccent(`${x.title} ${x.category} ${x.author} ${CHANNELS[x.channel]?.name || ""}`).includes(needle)) return false;
      return true;
    });
  }, [data.queue, q, status, chan]);

  const hasFilter = q.trim() !== "" || status !== "all" || chan !== "all";
  const reset = () => { setQ(""); setStatus("all"); setChan("all"); };

  return (
    <>
      <Section eyebrow="Hàng chờ" title="Hàng chờ đăng tải"
               sub={hasFilter ? `${queue.length}/${data.queue.length} bài` : `${data.queue.length} bài đang chờ`}
               icon={Clock} />

      {/* Bộ lọc hàng chờ */}
      <div className="rounded-[var(--r)] border p-2.5 mb-4 flex items-center gap-2.5 flex-wrap"
           style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-subtle)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)}
                 aria-label="Tìm bài trong hàng chờ"
                 placeholder="Tìm theo tiêu đề, danh mục, người đăng…"
                 className="w-full h-11 pl-11 pr-10 rounded-[var(--r-sm)] text-[13px] border-0 outline-none"
                 style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }} />
          {q && (
            <button onClick={() => setQ("")} aria-label="Xoá"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-subtle)" }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <QueueChip on={status === "all"} onClick={() => setStatus("all")} brand={BRAND}>Tất cả</QueueChip>
          {Object.entries(STATUS)
            .filter(([k]) => data.queue.some((x) => x.status === k))
            .map(([k, s]) => (
              <QueueChip key={k} on={status === k} onClick={() => setStatus(status === k ? "all" : k)} brand={BRAND}>
                {s.label}
              </QueueChip>
            ))}
        </div>

        <div className="relative shrink-0">
          <select value={chan} onChange={(e) => setChan(e.target.value)}
                  aria-label="Lọc theo kênh"
                  className="h-11 pl-4 pr-9 rounded-[var(--r-sm)] text-[13px] font-semibold border-0 outline-none appearance-none cursor-pointer"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }}>
            <option value="all">Tất cả kênh</option>
            {chanOptions.map((c) => <option key={c} value={c}>{CHANNELS[c]?.name || c}</option>)}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                       style={{ color: "var(--fg-subtle)" }} />
        </div>

        {hasFilter && (
          <button onClick={reset}
                  className="h-11 px-4 rounded-[var(--r-sm)] text-[12.5px] font-medium border transition active:scale-95 shrink-0"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}>
            Xoá lọc
          </button>
        )}
      </div>

      <Panel>
        {queue.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-14 h-14 mx-auto rounded-[var(--r)] flex items-center justify-center text-white mb-3"
                 style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
              <Search className="w-6 h-6" />
            </div>
            <div className="text-[14px] font-medium" style={{ color: "var(--fg)" }}>Không có bài nào khớp</div>
            <div className="text-[12px] mt-1" style={{ color: "var(--fg-muted)" }}>Thử đổi từ khoá hoặc bỏ bớt bộ lọc.</div>
            <button onClick={reset} className="mt-4 h-10 px-5 rounded-[var(--r-sm)] text-[12.5px] font-medium text-white"
                    style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
              Xoá bộ lọc
            </button>
          </div>
        ) : (
        <div className="divide-y" style={{ borderColor: "var(--border-soft)" }}>
          {queue.map((q) => {
            const ch = CHANNELS[q.channel];
            const Icon = ch?.icon;
            return (
              <div key={q.id} className="flex items-center gap-4 p-4 transition hover:bg-ink-50">
                <div className="shrink-0 w-16 rounded-[var(--r-sm)] py-2 text-center text-white"
                     style={{ background: `linear-gradient(135deg,${ch.from},${ch.to})` }}>
                  <div className="text-[10px] font-medium opacity-90">{q.day}</div>
                  <div className="text-[15px] font-display font-medium tabular-nums leading-none mt-0.5">{q.time}</div>
                  <div className="text-[9.5px] opacity-80 mt-0.5">{q.date}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[14px] truncate" style={{ color: "var(--fg)" }}>{q.title}</div>
                  <div className="text-[11.5px] truncate mt-0.5" style={{ color: "var(--fg-muted)" }}>
                    {q.category} · {q.author} · {q.postType === "reel" ? "Video ngắn" : q.postType === "video" ? "Video" : q.postType === "carousel" ? "Carousel" : "Bài viết"}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-[var(--r-sm)] flex items-center justify-center text-white"
                       style={{ background: `linear-gradient(135deg,${ch.from},${ch.to})` }}>
                    {Icon && <Icon className="w-4 h-4" />}
                  </div>
                </div>
                <StatusTag s={q.status} />
                <IconBtn onClick={() => onShare(q)} tone="brand" title="Chia sẻ"><Share2 className="w-4 h-4" /></IconBtn>
              </div>
            );
          })}
        </div>
        )}
      </Panel>

      <Section eyebrow="Hàng chờ" title="Đã đăng gần đây" sub="Auto-publish · 24h qua" icon={CheckCircle2} />
      <Panel>
        <div className="divide-y" style={{ borderColor: "var(--border-soft)" }}>
          {data.history.map((h) => {
            const ch = CHANNELS[h.channel];
            const Icon = ch?.icon;
            const ok = h.result === "success";
            return (
              <div key={h.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-[var(--r-sm)] flex items-center justify-center text-white shrink-0"
                     style={{ backgroundColor: ok ? "var(--success)" : "var(--danger)" }}>
                  {ok ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[13.5px] truncate" style={{ color: "var(--fg)" }}>{h.title}</div>
                  <div className="text-[11.5px] truncate mt-0.5" style={{ color: ok ? "var(--fg-muted)" : "#be123c" }}>
                    {h.time} · {h.error || "Đã đăng thành công"}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-[var(--r-sm)] flex items-center justify-center text-white shrink-0"
                     style={{ background: `linear-gradient(135deg,${ch.from},${ch.to})` }}>
                  {Icon && <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[14px] font-medium tabular-nums shrink-0" style={{ color: "var(--fg)" }}>
                  {h.reach === "—" ? "—" : `+${h.reach}`}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}

/* ════════════════ TAB: PHÂN TÍCH ════════════════ */
function AnalyticsTab({ data }) {
  /* Chuỗi biểu đồ lấy từ bảng màu — v3 ghi cứng #8b5cf6/#f43f5e nên biểu đồ
     là mảng neon duy nhất còn lại sau khi cả trang đã chuyển sang tông đất. */
  const { house, metal } = usePalette();

  return (
    <>
      <Section eyebrow="Phân tích" title="Hiệu quả 30 ngày" sub="Reach · engagement · conversion" icon={TrendingUp} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Reach & Engagement theo ngày" sub="Tổng đa kênh" pad>
          <ChartLegend
            className="mb-4"
            items={[
              { label: "Reach", color: house.base, area: true },
              { label: "Engagement", color: metal.base },
            ]}
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.reach30} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  {/* Ngoại lệ gradient được phép: vùng tô dưới đường — Design.md §2.5 */}
                  <linearGradient id="gReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={house.base} stopOpacity={0.14} />
                    <stop offset="100%" stopColor={house.base} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="d" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...uiChartTip} />
                <Area type="monotone" dataKey="reach" stroke={house.base} strokeWidth={1.5}
                      fill="url(#gReach)" name="Reach" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="eng" stroke={metal.base} strokeWidth={1.5}
                      fill="none" name="Engagement" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Phân bổ kênh" sub="% Reach 30 ngày" pad>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie data={data.channelMix} dataKey="value" nameKey="name"
                     innerRadius={54} outerRadius={78} paddingAngle={1}
                     stroke="var(--surface)" strokeWidth={2}>
                  {data.channelMix.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...uiChartTip} formatter={(v, n) => [`${v}%`, n]} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <Hairline soft className="my-4" />
          <ul className="space-y-2.5">
            {data.channelMix.map((e) => (
              <li key={e.name} className="flex items-center gap-2.5 text-[12px]">
                <span aria-hidden className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                <span className="flex-1 truncate" style={{ color: "var(--fg-muted)" }}>{e.name}</span>
                <span className="tnum" style={{ color: "var(--fg)" }}>{e.value}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Panel title="Top 5 bài hiệu quả" sub="Theo engagement" pad>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topPosts} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid {...gridProps} horizontal={false} vertical />
                <XAxis type="number" {...axisProps} />
                <YAxis dataKey="t" type="category" width={124} {...axisProps} />
                <Tooltip {...uiChartTip} />
                <Bar dataKey="eng" fill={house.base} radius={[0, 2, 2, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Performance đa chiều" sub="Hiện tại so với mục tiêu" pad>
          <ChartLegend
            className="mb-4"
            items={[
              { label: "Hiện tại", color: house.base },
              { label: "Mục tiêu", color: metal.base },
            ]}
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.radar}>
                <PolarGrid stroke="var(--border-soft)" />
                <PolarAngleAxis dataKey="k" stroke="var(--fg-subtle)" fontSize={10} />
                <PolarRadiusAxis stroke="var(--border-soft)" fontSize={9} />
                <Radar name="Hiện tại" dataKey="now" stroke={house.base} fill={house.base}
                       fillOpacity={0.12} strokeWidth={1.5} />
                <Radar name="Mục tiêu" dataKey="target" stroke={metal.base} fill="none" strokeWidth={1.5} />
                <Tooltip {...uiChartTip} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ════════════════ THÀNH PHẦN CHUNG ════════════════ */

/* Tiêu đề section — nhãn lông mày + kẻ tóc + tiêu đề serif (Design.md §3 ①).
   Giữ prop `icon` của v3 để 5 tab bên dưới không phải sửa; icon nay chỉ là
   dấu nhỏ màu kim loại chứ không còn ô gradient. */
function Section({ eyebrow, title, sub, icon: Icon, right }) {
  return (
    <SectionHead
      eyebrow={
        <span className="inline-flex items-center gap-1.5">
          {Icon && <Icon className="w-3 h-3" style={{ color: "var(--metal)" }} />}
          {eyebrow || "Marketing"}
        </span>
      }
      title={title}
      sub={sub}
      right={right}
    />
  );
}

function Panel({ children, title, sub, pad }) {
  return (
    <UiPanel title={title} sub={sub} flush={!pad}>
      {children}
    </UiPanel>
  );
}

/** Ô KPI — v4 bỏ ô icon gradient, quầng mờ và bóng màu. Chỉ còn nhãn lông
 *  mày, con số, và biến động tô bằng màu ngữ nghĩa. */
function KpiCard({ k }) {
  const up = (k.trend ?? 0) >= 0;
  const T = up ? TrendingUp : TrendingDown;
  return (
    <div
      className="card-hover border p-5"
      style={{
        borderRadius: "var(--r)",
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <Eyebrow className="truncate">{k.label}</Eyebrow>
        <k.icon className="w-4 h-4 shrink-0" style={{ color: "var(--fg-subtle)" }} />
      </div>
      <div className="mt-3 flex items-baseline gap-2 flex-wrap">
        <span
          className="text-[26px] font-medium tnum"
          style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}
        >
          {k.value}
        </span>
        <span
          className="inline-flex items-center gap-0.5 text-[12px] font-medium tnum"
          style={{ color: up ? "var(--success)" : "var(--danger)" }}
        >
          <T className="w-3 h-3" />{up ? "+" : ""}{k.trend}%
        </span>
      </div>
    </div>
  );
}

function AutomationCard({ a, expanded, onView, onToggle }) {
  const on = a.status === "active";
  return (
    <div
      className="card-hover border p-5"
      style={{
        borderRadius: "var(--r)",
        backgroundColor: "var(--surface)",
        borderColor: on ? "var(--border)" : "var(--border-soft)",
        boxShadow: "var(--shadow-card)",
        opacity: on ? 1 : 0.75,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-9 h-9 shrink-0 grid place-items-center border"
            style={{
              borderRadius: "var(--r-sm)",
              backgroundColor: on ? "var(--accent-soft)" : "var(--surface-2)",
              borderColor: on ? "var(--accent)" : "var(--border)",
              color: on ? "var(--accent-fg)" : "var(--fg-subtle)",
            }}
          >
            <Bot className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[14px] font-medium truncate" style={{ color: "var(--fg)" }}>{a.name}</div>
            <div className="text-[11.5px] truncate mt-0.5" style={{ color: "var(--fg-muted)" }}>{a.trigger}</div>
          </div>
        </div>
        <UiStatusTag tone={on ? "success" : "neutral"}>
          {on ? "Đang chạy" : "Tạm dừng"}
        </UiStatusTag>
      </div>

      <div className="flex items-center gap-1 mt-4">
        {a.steps.slice(0, 3).map((s, i, arr) => (
          <div key={i} className="flex items-center gap-1 flex-1 min-w-0">
            <div
              className="px-2 py-1.5 text-[10.5px] font-medium flex items-center gap-1 truncate flex-1 border"
              title={`${s.kind}: ${s.label}`}
              style={{
                borderRadius: "var(--r-sm)",
                backgroundColor: "var(--surface-2)",
                borderColor: "var(--border)",
                color: "var(--fg-muted)",
              }}
            >
              <s.icon className="w-3 h-3 shrink-0" style={{ color: "var(--metal)" }} />
              <span className="truncate">{s.label}</span>
            </div>
            {i < arr.length - 1 && (
              <ChevronRight className="w-3 h-3 shrink-0" style={{ color: "var(--fg-subtle)" }} />
            )}
          </div>
        ))}
        {a.steps.length > 3 && (
          <span
            className="shrink-0 px-2 py-1.5 text-[10.5px] font-medium tnum border"
            title={a.steps.slice(3).map((s) => s.label).join(" → ")}
            style={{
              borderRadius: "var(--r-sm)",
              backgroundColor: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--fg-muted)",
            }}
          >
            +{a.steps.length - 3}
          </span>
        )}
      </div>

      <div
        className="grid grid-cols-3 gap-px mt-4 border overflow-hidden"
        style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}
      >
        <MiniStat label="Lượt chạy" value={a.runCount} />
        <MiniStat label="Thành công" value={`${a.successRate}%`} tone="var(--success)" />
        <MiniStat label="Đã đăng" value={a.postedCount} />
      </div>

      {expanded && (
        <div className="flex items-center gap-2 mt-4">
          <Button className="flex-1" size="sm" onClick={() => onView?.(a)}>Xem chi tiết</Button>
          <Button className="flex-1" size="sm" variant="outline" onClick={() => onToggle?.(a)}>
            {on ? "Tạm dừng" : "Kích hoạt"}
          </Button>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <div className="min-w-0 p-3" style={{ backgroundColor: "var(--surface)" }}>
      <div className="text-[16px] font-medium tnum leading-none truncate" style={{ color: tone || "var(--fg)" }}>
        {value}
      </div>
      <div
        className="text-[9px] uppercase tracking-[0.14em] font-semibold mt-1.5 truncate"
        style={{ color: "var(--fg-subtle)" }}
      >
        {label}
      </div>
    </div>
  );
}

/** Chồng icon kênh. Màu thương hiệu thật, nền đặc, viền theo bề mặt. */
function ChannelStack({ ids = [] }) {
  return (
    <div className="flex items-center">
      {ids.slice(0, 4).map((c, i) => {
        const ch = CHANNELS[c];
        if (!ch) return null;
        const Icon = ch.icon;
        return (
          <span key={c} title={ch.name}
                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: ch.from,
                         marginLeft: i === 0 ? 0 : -7, zIndex: 10 - i,
                         boxShadow: "0 0 0 2px var(--surface)" }}>
            <Icon className="w-3 h-3" />
          </span>
        );
      })}
      {ids.length > 4 && (
        <span className="ml-2 text-[11px] tnum" style={{ color: "var(--fg-subtle)" }}>
          +{ids.length - 4}
        </span>
      )}
    </div>
  );
}

function StatusTag({ s }) {
  const c = STATUS[s] || STATUS.draft;
  return <UiStatusTag tone={c.tone}>{c.label}</UiStatusTag>;
}

function CatPill({ children }) {
  return <Tag>{children}</Tag>;
}

function Pill({ children }) {
  return (
    <span
      className="inline-flex items-center px-3 h-8 text-[12px] font-medium border"
      style={{
        borderRadius: "var(--r-sm)",
        backgroundColor: "var(--surface-2)",
        borderColor: "var(--border)",
        color: "var(--fg-muted)",
      }}
    >
      {children}
    </span>
  );
}

function IconBtn({ children, onClick, title, tone }) {
  return (
    <button onClick={onClick} title={title} aria-label={title}
            className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-[var(--surface-3)]"
            style={{
              borderRadius: "var(--r-sm)",
              color: tone === "brand" ? "var(--accent)" : "var(--fg-subtle)",
            }}>
      {children}
    </button>
  );
}

/* ════════════════ MODAL: CHIA SẺ ════════════════ */
function ShareModal({ post, onClose }) {
  const { brand: BRAND } = usePalette();
  const [channels, setChannels] = useState(["facebook", "zalo"]);
  const [tone, setTone] = useState("default");
  const [copied, setCopied] = useState(false);

  const link = `https://condohub.vn/blog/${(post.title || "demo").toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 50)}`;

  const text = useMemo(() => {
    const t = {
      default: `${post.title}\n\n${post.excerpt || "Đọc chi tiết tại Condo HUB Hotels."}`,
      teaser: `🌴 ${post.title}\n\n${post.excerpt || "Trải nghiệm đẳng cấp tại Condo HUB."}\n👉 `,
      promo: `🎁 ƯU ĐÃI ĐẶC BIỆT — ${post.title}\n\n${post.excerpt || "Đặt phòng hôm nay để nhận ưu đãi."}\n👉 `,
    };
    return t[tone] + link;
  }, [post, tone, link]);

  const targets = [
    { id: "facebook", name: "Facebook", icon: Facebook, from: "#1877F2", to: "#3b82f6", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(text)}` },
    { id: "zalo", name: "Zalo", icon: Send, from: "#0068FF", to: "#0ea5e9", url: `https://sp.zalo.me/share?url=${encodeURIComponent(link)}&title=${encodeURIComponent(post.title || "")}&desc=${encodeURIComponent(post.excerpt || "")}` },
    { id: "twitter", name: "X", icon: Twitter, from: "#334155", to: "#0f172a", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, from: "#0A66C2", to: "#0ea5e9", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}` },
    { id: "email", name: "Email", icon: AtSign, from: "#8b5cf6", to: "#a855f7", url: `mailto:?subject=${encodeURIComponent(post.title || "")}&body=${encodeURIComponent(text)}` },
    { id: "copy", name: "Copy link", icon: Copy, from: "#0ea5e9", to: "#06b6d4", url: null },
  ];

  const toggle = (id) => setChannels((a) => a.includes(id) ? a.filter((x) => x !== id) : [...a, id]);

  return (
    <Modal onClose={onClose} icon={Share2} title="Chia sẻ bài viết" sub={post.title} wide>
      <div className="p-5 space-y-6">
        {/* Preview */}
        <div>
          <Label>Preview</Label>
          <div className="rounded-[var(--r)] border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <div className="aspect-[16/9] relative"
                 style={{ backgroundColor: "var(--accent)" }}>
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-[var(--r-sm)] px-2.5 py-1 border border-white/25">
                <Building2 className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] font-medium text-white uppercase tracking-wider">Condo HUB Hotels</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-2 py-0.5 rounded-[var(--r-sm)] text-[9.5px] font-medium bg-white text-violet-700 uppercase tracking-wider mb-2">
                  {post.category || "Blog"}
                </span>
                <div className="text-white font-display font-medium text-[19px] leading-tight line-clamp-2">
                  {post.title}
                </div>
              </div>
            </div>
            <div className="p-4" style={{ backgroundColor: "var(--surface)" }}>
              <div className="text-[13px] leading-relaxed line-clamp-2" style={{ color: "var(--fg-muted)" }}>
                {post.excerpt || "Khám phá trải nghiệm nghỉ dưỡng đẳng cấp 5 sao tại hệ thống Condo HUB Hotels & Resorts."}
              </div>
              <div className="mt-2 text-[11px] truncate" style={{ color: "var(--fg-subtle)" }}>{link}</div>
            </div>
          </div>
        </div>

        {/* Văn phong */}
        <div>
          <Label>Văn phong</Label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: "default", label: "Mặc định", icon: FileText, desc: "Giữ nguyên" },
              { id: "teaser", label: "Teaser", icon: Sparkles, desc: "Hấp dẫn + emoji" },
              { id: "promo", label: "Khuyến mãi", icon: Bookmark, desc: "Có CTA đặt phòng" },
            ].map((t) => {
              const on = tone === t.id;
              return (
                <button key={t.id} onClick={() => setTone(t.id)}
                        className="p-3 rounded-[var(--r)] border text-left transition"
                        style={on
                          ? { borderColor: "var(--accent)", backgroundColor: "var(--accent-soft)" }
                          : { borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <t.icon className="w-4 h-4" style={{ color: on ? "#6d28d9" : "var(--fg-subtle)" }} />
                    <span className="text-[12px] font-medium" style={{ color: on ? "#6d28d9" : "var(--fg)" }}>{t.label}</span>
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--fg-muted)" }}>{t.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kênh */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label inline>Chia sẻ qua kênh</Label>
            <span className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>Đã chọn {channels.length}/{targets.length}</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {targets.map((t) => {
              const on = channels.includes(t.id);
              return (
                <button key={t.id} onClick={() => toggle(t.id)}
                        className="p-3 rounded-[var(--r)] border text-center transition"
                        style={on
                          ? { borderColor: "#8b5cf6", backgroundColor: "#f1ecfe", boxShadow: "0 0 0 3px rgba(139,92,246,.18)" }
                          : { borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
                  <div className="w-9 h-9 rounded-[var(--r-sm)] mx-auto mb-2 flex items-center justify-center text-white"
                       style={{ background: `linear-gradient(135deg,${t.from},${t.to})` }}>
                    <t.icon className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-medium truncate" style={{ color: on ? "var(--accent-fg)" : "var(--fg-muted)" }}>
                    {t.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nội dung */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label inline>Nội dung sẽ gửi</Label>
            <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                    className="text-[11.5px] font-medium flex items-center gap-1" style={{ color: "#7c3aed" }}>
              {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Đã copy</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
          <div className="rounded-[var(--r)] p-4 text-[13px] whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto"
               style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }}>
            {text}
          </div>
        </div>
      </div>

      <ModalFooter
        left={<><Sparkles className="w-3.5 h-3.5 inline mr-1" style={{ color: "#7c3aed" }} /> Có thể chỉnh nội dung trước khi gửi</>}
        onClose={onClose}
        action={
          <button
            onClick={() => {
              channels.filter((id) => id !== "copy").forEach((id) => {
                const t = targets.find((x) => x.id === id);
                if (t?.url) window.open(t.url, "_blank", "noopener,noreferrer,width=600,height=600");
              });
              if (channels.includes("copy")) {
                navigator.clipboard?.writeText(text);
                setCopied(true);
                setTimeout(() => { setCopied(false); onClose(); }, 900);
              } else onClose();
            }}
            className="glowbtn inline-flex items-center gap-2 h-10 px-5 rounded-[var(--r-sm)] text-white text-[13px] font-medium"
            style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
            <Share2 className="w-4 h-4" /> Chia sẻ {channels.length > 0 ? `(${channels.length})` : ""}
          </button>
        }
      />
    </Modal>
  );
}

/* ════════════════ MODAL: AUTOMATION ════════════════ */
function AutomationModal({ flow, onClose }) {
  const { brand: BRAND } = usePalette();
  return (
    <Modal onClose={onClose} icon={Workflow} title={`Workflow: ${flow.name}`} sub={flow.trigger} wide>
      <div className="p-5">
        <Label>Sơ đồ luồng</Label>
        <div className="space-y-2">
          {flow.steps.map((s, i) => (
            <div key={i}>
              <div className="rounded-[var(--r)] border p-4 flex items-start gap-3"
                   style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
                <div className="w-10 h-10 rounded-[var(--r-sm)] flex items-center justify-center text-white shrink-0"
                     style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})`,
                              boxShadow: "0 6px 14px -7px rgba(139,92,246,.8)" }}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9.5px] uppercase tracking-wider font-medium" style={{ color: "#7c3aed" }}>
                      Bước {i + 1}
                    </span>
                    <CatPill>{s.kind}</CatPill>
                  </div>
                  <div className="font-medium text-[14px] mt-1 truncate" style={{ color: "var(--fg)" }}>{s.label}</div>
                  {s.desc && <div className="text-[12px] mt-0.5" style={{ color: "var(--fg-muted)" }}>{s.desc}</div>}
                </div>
              </div>
              {i < flow.steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ChevronDown className="w-5 h-5" style={{ color: "#a855f7" }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <ModalFooter
        left={<>Đã chạy <b style={{ color: "var(--fg)" }}>{flow.runCount}</b> · Thành công <b style={{ color: "#15803d" }}>{flow.successRate}%</b></>}
        onClose={onClose}
        action={
          <button onClick={onClose}
                  className="h-10 px-5 rounded-[var(--r-sm)] text-white text-[13px] font-medium"
                  style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
            Đóng
          </button>
        }
      />
    </Modal>
  );
}

/* ════════════════ MODAL SHELL ════════════════ */
/* Modal riêng của trang — giữ chữ ký v3 (icon/title/sub/wide) nhưng dựng theo
 * hình thức v4: bo 6px, nhãn lông mày + tiêu đề serif, không ô icon gradient.
 * Khác <Modal> trong ui/ ở chỗ thân tự cuộn và footer là children, nên các
 * modal dài của trang này không phải sửa cấu trúc. */
function Modal({ children, onClose, icon: Icon, title, sub, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
         style={{ backgroundColor: "rgba(25,28,22,.42)", backdropFilter: "blur(3px)" }}
         onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
         role="dialog" aria-modal="true" aria-label={title}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[92vh] overflow-hidden flex flex-col border animate-fadeIn`}
           style={{
             borderRadius: "var(--r)",
             backgroundColor: "var(--surface)",
             borderColor: "var(--border)",
             boxShadow: "var(--shadow-modal)",
           }}>
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b shrink-0"
             style={{ borderColor: "var(--border)" }}>
          <div className="min-w-0">
            <Eyebrow className="mb-2">
              <span className="inline-flex items-center gap-1.5">
                {Icon && <Icon className="w-3 h-3" style={{ color: "var(--metal)" }} />}
                {sub || "Marketing"}
              </span>
            </Eyebrow>
            <div className="font-display text-[22px] leading-tight truncate" style={{ color: "var(--fg)" }}>
              {title}
            </div>
          </div>
          <button onClick={onClose} aria-label="Đóng" title="Đóng"
                  className="w-8 h-8 flex items-center justify-center shrink-0 -mr-1 transition-colors hover:bg-[var(--surface-3)]"
                  style={{ borderRadius: "var(--r-sm)", color: "var(--fg-subtle)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ left, onClose, action }) {
  return (
    <div className="px-6 py-4 border-t flex items-center justify-between gap-3 shrink-0"
         style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}>
      <span className="text-[12px] truncate" style={{ color: "var(--fg-muted)" }}>{left}</span>
      <div className="flex items-center gap-2.5 shrink-0">
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        {action}
      </div>
    </div>
  );
}

/* ════════════════ BỔ SUNG: soạn bài, workflow, xuất, kênh ════════════════ */

function QueueChip({ on, onClick, children }) {
  return (
    <button onClick={onClick} aria-pressed={on}
            className="inline-flex items-center h-9 px-3.5 text-[12px] font-medium border transition-colors"
            style={{
              borderRadius: "var(--r-sm)",
              backgroundColor: on ? "var(--accent-soft)" : "var(--surface)",
              borderColor: on ? "var(--accent)" : "var(--border)",
              color: on ? "var(--accent-fg)" : "var(--fg-muted)",
            }}>
      {children}
    </button>
  );
}

function FieldRow({ label, error, children }) {
  return (
    <div className="min-w-0">
      <Label>{label}</Label>
      {children}
      {error && (
        <div className="mt-1.5 text-[11.5px] inline-flex items-center gap-1" style={{ color: "var(--danger-fg)" }}>
          <XCircle className="w-3 h-3 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}

/* Ô nhập trong modal — cao 40px, bo 4px, có viền. v3 dùng rounded-full không viền. */
const roundField = {
  className: "w-full h-10 px-3 text-[13px] border outline-none",
};
const fieldStyle = {
  borderRadius: "var(--r-sm)",
  backgroundColor: "var(--surface)",
  borderColor: "var(--border)",
  color: "var(--fg)",
};

/* ── Soạn bài viết mới ── */
const CATEGORIES = ["Trải nghiệm", "Khuyến mãi", "Cẩm nang", "Câu chuyện", "Sự kiện", "Đánh giá"];

function ComposeModal({ brand, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [channels, setChannels] = useState(["facebook"]);
  const [tags, setTags] = useState("");
  const [schedule, setSchedule] = useState("now");
  const [date, setDate] = useState("2026-07-29");
  const [time, setTime] = useState("09:00");
  const [touched, setTouched] = useState(false);

  const errors = {};
  if (!title.trim()) errors.title = "Bắt buộc nhập tiêu đề";
  else if (title.trim().length < 8) errors.title = "Tiêu đề nên từ 8 ký tự để hiển thị tốt trên mạng xã hội";
  if (!excerpt.trim()) errors.excerpt = "Bắt buộc nhập mô tả ngắn";
  if (!channels.length) errors.channels = "Chọn ít nhất 1 kênh đăng";
  if (schedule === "later" && !date) errors.date = "Chọn ngày đăng";

  const err = (k) => (touched ? errors[k] : undefined);

  const submit = () => {
    setTouched(true);
    if (Object.keys(errors).length) return;
    onSubmit({
      title: title.trim(), excerpt: excerpt.trim(), category, channels,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      schedule, date, time,
    });
  };

  const toggleChan = (id) =>
    setChannels((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <Modal onClose={onClose} icon={FileText} title="Bài viết mới" sub="Soạn và phân phối đa kênh" wide>
      <div className="p-5 space-y-4">
        <FieldRow label="Tiêu đề" error={err("title")}>
          <input {...roundField} style={fieldStyle} value={title} onChange={(e) => setTitle(e.target.value)}
                 placeholder="Ví dụ: Ưu đãi mùa hè tại Condo HUB Hồ Tràm" />
          <div className="mt-1.5 text-[10.5px]" style={{ color: "var(--fg-subtle)" }}>{title.length} ký tự</div>
        </FieldRow>

        <FieldRow label="Mô tả ngắn" error={err("excerpt")}>
          <textarea rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full px-4 py-3 rounded-[var(--r)] text-[13px] border-0 outline-none resize-y"
                    style={fieldStyle} placeholder="Đoạn mô tả hiển thị khi chia sẻ lên mạng xã hội…" />
        </FieldRow>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Danh mục">
            <div className="relative">
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 pl-4 pr-9 rounded-[var(--r-sm)] text-[13px] font-semibold border-0 outline-none appearance-none cursor-pointer"
                      style={fieldStyle}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                           style={{ color: "var(--fg-subtle)" }} />
            </div>
          </FieldRow>
          <FieldRow label="Thẻ (cách nhau bởi dấu phẩy)">
            <input {...roundField} style={fieldStyle} value={tags} onChange={(e) => setTags(e.target.value)}
                   placeholder="summer, promo, ho-tram" />
          </FieldRow>
        </div>

        <FieldRow label={`Kênh đăng · đã chọn ${channels.length}`} error={err("channels")}>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CHANNELS).map(([id, c]) => {
              const on = channels.includes(id);
              const Icon = c.icon;
              return (
                <button key={id} onClick={() => toggleChan(id)} aria-pressed={on}
                        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--r-sm)] text-[12px] font-medium border transition active:scale-95"
                        style={on
                          ? { background: `linear-gradient(135deg,${c.from},${c.to})`, color: "#fff", borderColor: "transparent" }
                          : { backgroundColor: "var(--surface)", color: "var(--fg-muted)", borderColor: "var(--border)" }}>
                  <Icon className="w-3.5 h-3.5" /> {c.name}
                </button>
              );
            })}
          </div>
        </FieldRow>

        <FieldRow label="Thời điểm đăng" error={err("date")}>
          <div className="flex items-center gap-2 flex-wrap">
            <QueueChip on={schedule === "now"} onClick={() => setSchedule("now")} brand={brand}>Đăng ngay</QueueChip>
            <QueueChip on={schedule === "later"} onClick={() => setSchedule("later")} brand={brand}>Lên lịch</QueueChip>
            {schedule === "later" && (
              <>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                       className="h-11 px-4 rounded-[var(--r-sm)] text-[13px] border-0 outline-none" style={fieldStyle} />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                       className="h-11 px-4 rounded-[var(--r-sm)] text-[13px] border-0 outline-none" style={fieldStyle} />
              </>
            )}
          </div>
        </FieldRow>
      </div>

      <ModalFooter
        left={touched && Object.keys(errors).length > 0
          ? `Còn ${Object.keys(errors).length} trường chưa hợp lệ`
          : `${channels.length} kênh · ${schedule === "now" ? "đăng ngay" : `${date} ${time}`}`}
        onClose={onClose}
        action={
          <button onClick={submit}
                  className="h-10 px-5 rounded-[var(--r-sm)] text-[13px] font-medium text-white inline-flex items-center gap-2"
                  style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
            <Send className="w-4 h-4" /> {schedule === "now" ? "Đăng ngay" : "Lên lịch"}
          </button>
        }
      />
    </Modal>
  );
}

/* ── Tạo workflow ── */
const TRIGGER_OPTIONS = [
  "Khi xuất bản bài viết mới", "Mỗi thứ 2 · 09:00", "Sau khi khách trả phòng +24h",
  "Khi có booking mới", "Khi đăng video TikTok", "Khi nhận đánh giá mới",
];
const ACTION_OPTIONS = [
  "Đăng Facebook", "Đăng Instagram", "Đăng Zalo OA", "Gửi Newsletter",
  "Thông báo Slack", "Gắn tag CRM", "Ping Google Index",
];

function WorkflowModal({ brand, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState(TRIGGER_OPTIONS[0]);
  const [actions, setActions] = useState([]);
  const [status, setStatus] = useState("active");
  const [touched, setTouched] = useState(false);

  const errors = {};
  if (!name.trim()) errors.name = "Bắt buộc đặt tên workflow";
  else if (name.trim().length < 3) errors.name = "Tên quá ngắn";
  if (!actions.length) errors.actions = "Chọn ít nhất 1 hành động";

  const err = (k) => (touched ? errors[k] : undefined);

  const submit = () => {
    setTouched(true);
    if (Object.keys(errors).length) return;
    onSubmit({ name: name.trim(), trigger, actions, status });
  };

  const toggleAct = (a) =>
    setActions((s) => (s.includes(a) ? s.filter((x) => x !== a) : [...s, a]));

  return (
    <Modal onClose={onClose} icon={Workflow} title="Workflow mới" sub="Kịch bản tự động đa kênh" wide>
      <div className="p-5 space-y-4">
        <FieldRow label="Tên workflow" error={err("name")}>
          <input {...roundField} style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)}
                 placeholder="Ví dụ: Auto-post khuyến mãi cuối tuần" />
        </FieldRow>

        <FieldRow label="Trigger — sự kiện kích hoạt">
          <div className="relative">
            <select value={trigger} onChange={(e) => setTrigger(e.target.value)}
                    className="w-full h-11 pl-4 pr-9 rounded-[var(--r-sm)] text-[13px] font-semibold border-0 outline-none appearance-none cursor-pointer"
                    style={fieldStyle}>
              {TRIGGER_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                         style={{ color: "var(--fg-subtle)" }} />
          </div>
        </FieldRow>

        <FieldRow label={`Hành động · đã chọn ${actions.length}`} error={err("actions")}>
          <div className="flex flex-wrap gap-2">
            {ACTION_OPTIONS.map((a) => (
              <QueueChip key={a} on={actions.includes(a)} onClick={() => toggleAct(a)} brand={brand}>{a}</QueueChip>
            ))}
          </div>
        </FieldRow>

        <FieldRow label="Trạng thái sau khi tạo">
          <div className="flex items-center gap-2">
            <QueueChip on={status === "active"} onClick={() => setStatus("active")} brand={brand}>Chạy ngay</QueueChip>
            <QueueChip on={status === "paused"} onClick={() => setStatus("paused")} brand={brand}>Tạm dừng</QueueChip>
          </div>
        </FieldRow>

        {actions.length > 0 && (
          <div className="rounded-[var(--r)] p-4" style={{ backgroundColor: "var(--surface-2)" }}>
            <Label>Xem trước luồng</Label>
            <div className="flex items-center gap-2 flex-wrap text-[12px] font-medium" style={{ color: "var(--fg)" }}>
              <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--r-sm)] text-white"
                    style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
                <Webhook className="w-3.5 h-3.5" /> {trigger}
              </span>
              {actions.map((a) => (
                <span key={a} className="inline-flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--fg-subtle)" }} />
                  <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--r-sm)]"
                        style={{ backgroundColor: "var(--surface)", color: "var(--fg-muted)" }}>
                    <Zap className="w-3.5 h-3.5" /> {a}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <ModalFooter
        left={touched && Object.keys(errors).length > 0
          ? `Còn ${Object.keys(errors).length} trường chưa hợp lệ`
          : `1 trigger · ${actions.length} hành động`}
        onClose={onClose}
        action={
          <button onClick={submit}
                  className="h-10 px-5 rounded-[var(--r-sm)] text-[13px] font-medium text-white inline-flex items-center gap-2"
                  style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
            <CheckCircle2 className="w-4 h-4" /> Tạo workflow
          </button>
        }
      />
    </Modal>
  );
}

/* ── Xuất báo cáo ── */
function ExportModal({ data, onClose, onPick }) {
  const opts = [
    { fmt: "Báo cáo tổng hợp (PDF)", desc: `KPI 30 ngày · ${data.channels.length} kênh · biểu đồ` },
    { fmt: "Dữ liệu bài viết (CSV)", desc: `${data.recentPosts.length} bài gần đây + hàng chờ` },
    { fmt: "Hiệu suất kênh (Excel)", desc: "Reach, engagement, health từng kênh" },
    { fmt: "Nhật ký Automation (CSV)", desc: `${data.automations.length} workflow · lượt chạy & tỉ lệ thành công` },
  ];
  return (
    <Modal onClose={onClose} icon={Download} title="Xuất báo cáo" sub="Chọn định dạng cần tải">
      <div className="p-5 space-y-2">
        {opts.map((o) => (
          <button key={o.fmt} onClick={() => onPick(o.fmt)}
                  className="w-full text-left flex items-center gap-3 p-3.5 rounded-[var(--r)] border transition hover:bg-ink-50 active:scale-[.99]"
                  style={{ borderColor: "var(--border)" }}>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium" style={{ color: "var(--fg)" }}>{o.fmt}</div>
              <div className="text-[11.5px] mt-0.5" style={{ color: "var(--fg-muted)" }}>{o.desc}</div>
            </div>
            <Download className="w-4 h-4 shrink-0" style={{ color: "var(--fg-subtle)" }} />
          </button>
        ))}
      </div>
    </Modal>
  );
}

/* ── Chi tiết kênh ── */
function ChannelModal({ ch, onClose }) {
  const meta = CHANNELS[ch.id];
  const Icon = meta?.icon;
  const tone = scoreTone(ch.health);
  return (
    <Modal onClose={onClose} icon={Icon || Share2} title={meta?.name || ch.id} sub={ch.name}>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-[var(--r)] text-white"
             style={{ background: `linear-gradient(135deg,${meta.from},${meta.to})` }}>
          <div className="w-12 h-12 rounded-[var(--r)] bg-white/20 flex items-center justify-center shrink-0">
            {Icon && <Icon className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-medium truncate">{ch.name}</div>
            <div className="text-[12px] opacity-85">{meta?.name} · Đang kết nối</div>
          </div>
          <div className="ml-auto text-right shrink-0">
            <div className="text-[10px] uppercase font-medium opacity-80">Followers</div>
            <div className="text-[18px] font-medium tabular-nums">{ch.followers}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <MiniStat label="Bài đã đăng" value={ch.posts} />
          <MiniStat label="Tương tác" value={ch.engagement} />
          <MiniStat label="Sức khỏe" value={`${ch.health}%`} />
        </div>

        <div className="rounded-[var(--r)] p-4" style={{ backgroundColor: tone.bg }}>
          <div className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: tone.ink }}>
            Đánh giá kênh
          </div>
          <div className="text-[12.5px] font-semibold" style={{ color: tone.ink }}>
            {ch.health >= 85
              ? "Kênh hoạt động tốt, tần suất và tương tác đều ổn định."
              : ch.health >= 70
                ? "Kênh ổn nhưng tương tác đang giảm — nên tăng tần suất đăng."
                : "Kênh cần chú ý: tương tác thấp so với lượng theo dõi."}
          </div>
        </div>
      </div>
      <ModalFooter left={`Kênh ${meta?.name}`} onClose={onClose} action={null} />
    </Modal>
  );
}

function Label({ children, inline }) {
  return (
    <div className={`text-[10.5px] uppercase tracking-wider font-medium ${inline ? "" : "mb-2.5"}`}
         style={{ color: "var(--fg-subtle)" }}>
      {children}
    </div>
  );
}

/* ════════════════ DATA ════════════════ */
function buildData() {
  const heroMeta = [
    { label: "Bài viết", value: "128" },
    { label: "Đã đăng", value: "342" },
    { label: "Đang chờ", value: "23" },
    { label: "Automation", value: "8" },
  ];

  const overviewKpi = [
    { label: "Reach",         value: "1.28M",  trend: 12.4, icon: Eye,                from: "#8b5cf6", to: "#6366f1" },
    { label: "Engagement",    value: "84.2K",  trend: 18.6, icon: Heart,              from: "#f43f5e", to: "#ec4899" },
    { label: "Click",         value: "32.6K",  trend: 9.1,  icon: MousePointerClick,  from: "#3b82f6", to: "#0ea5e9" },
    { label: "Conversion",    value: "1.84%",  trend: 4.2,  icon: Target,             from: "#10b981", to: "#14b8a6" },
    { label: "ROI quảng cáo", value: "4.8x",   trend: -2.1, icon: DollarSign,         from: "#f59e0b", to: "#f97316" },
    { label: "Followers",     value: "+12.4K", trend: 22.8, icon: Users,              from: "#d946ef", to: "#a855f7" },
  ];

  const channels = [
    { id: "facebook",  name: "Condo HUB Hotels",  followers: "184.2K", posts: 28, engagement: "32.4K", health: 96, status: "connected" },
    { id: "instagram", name: "@condohub.vn",      followers: "98.4K",  posts: 36, engagement: "24.1K", health: 92, status: "connected" },
    { id: "zalo",      name: "Condo HUB OA",      followers: "62.8K",  posts: 18, engagement: "12.6K", health: 88, status: "connected" },
    { id: "tiktok",    name: "@condohubhotels",   followers: "126.4K", posts: 42, engagement: "48.2K", health: 94, status: "connected" },
    { id: "youtube",   name: "Condo HUB Channel", followers: "32.8K",  posts: 8,  engagement: "8.4K",  health: 78, status: "connected" },
    { id: "twitter",   name: "@condohubhotels",   followers: "12.4K",  posts: 14, engagement: "2.1K",  health: 64, status: "connected" },
    { id: "linkedin",  name: "Condo HUB Group",   followers: "8.6K",   posts: 12, engagement: "1.4K",  health: 82, status: "connected" },
    { id: "website",   name: "Blog condohub.vn",  followers: "—",      posts: 32, engagement: "18.2K", health: 90, status: "connected" },
    { id: "email",     name: "Newsletter",         followers: "24.6K",  posts: 4,  engagement: "3.8K",  health: 86, status: "connected" },
  ];

  const recentPosts = [
    { id: "p1", title: "Top 10 điểm check-in mùa hè tại Phú Quốc", excerpt: "Khám phá những góc sống ảo đẹp nhất tại đảo ngọc cùng Condo HUB.",
      category: "Trải nghiệm", author: "Nguyễn Minh K.", date: "28/07 · 09:30", tags: ["phu-quoc", "summer", "check-in"],
      channels: ["facebook", "instagram", "tiktok", "website"], status: "published", engagement: "12.4K" },
    { id: "p2", title: "Ưu đãi 30% phòng Deluxe tháng 8", excerpt: "Đặt phòng sớm để nhận ưu đãi hấp dẫn.",
      category: "Khuyến mãi", author: "Marketing Team", date: "28/07 · 08:00", tags: ["promo", "deluxe", "summer-sale"],
      channels: ["facebook", "zalo", "email"], status: "publishing", engagement: "8.2K" },
    { id: "p3", title: "Bí quyết chọn resort cho gia đình có trẻ nhỏ", excerpt: "Hướng dẫn chi tiết từ A-Z cho kỳ nghỉ gia đình hoàn hảo.",
      category: "Cẩm nang", author: "Trần Hồng N.", date: "27/07 · 16:00", tags: ["family", "kids", "tips"],
      channels: ["website", "facebook", "linkedin"], status: "published", engagement: "5.8K" },
    { id: "p4", title: "Behind the scenes: Đầu bếp 5 sao tại Condo HUB", excerpt: "Câu chuyện về những đôi tay vàng làm nên ẩm thực đẳng cấp.",
      category: "Câu chuyện", author: "Lê Quốc C.", date: "27/07 · 14:00", tags: ["chef", "fnb", "behind-the-scenes"],
      channels: ["youtube", "instagram", "facebook"], status: "scheduled", engagement: "—" },
    { id: "p5", title: "Sự kiện âm nhạc Acoustic cuối tuần", excerpt: "Đêm nhạc acoustic lãng mạn bên bể bơi vô cực.",
      category: "Sự kiện", author: "Event Team", date: "26/07 · 10:00", tags: ["event", "acoustic", "weekend"],
      channels: ["facebook", "instagram", "zalo"], status: "review", engagement: "—" },
    { id: "p6", title: "Review khách hàng: Kỳ nghỉ đáng nhớ tại Đà Lạt", excerpt: "Chia sẻ từ gia đình anh Tuấn sau 3 ngày tại LP2.",
      category: "Đánh giá", author: "CSKH Team", date: "26/07 · 09:00", tags: ["review", "da-lat", "customer-story"],
      channels: ["facebook", "website", "email"], status: "published", engagement: "6.2K" },
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
    { date: "31/07", slots: [{ id: "s9", time: "11:00", title: "Tour Đà Lạt", channel: "instagram" }]},
    { date: "01/08", slots: [
      { id: "s10", time: "09:00", title: "Khuyến mãi T8", channel: "facebook" },
      { id: "s11", time: "15:00", title: "Review mới", channel: "website" },
    ]},
    { date: "02/08", slots: [{ id: "s12", time: "20:00", title: "Live BBQ", channel: "facebook" }]},
    { date: "03/08", slots: [] },
  ];

  const automations = [
    { id: "a1", name: "Auto-post blog mới", trigger: "Khi xuất bản bài viết mới",
      status: "active", runCount: 124, successRate: 98, postedCount: 312,
      steps: [
        { kind: "Trigger", label: "Xuất bản bài", desc: "Lắng nghe sự kiện 'post.published' từ CMS", icon: Webhook },
        { kind: "Action", label: "Đăng FB + IG", desc: "Auto-publish lên 2 kênh", icon: Share2 },
        { kind: "Action", label: "Gửi email", desc: "Newsletter cho 24.6K subscribers", icon: AtSign },
        { kind: "Action", label: "Slack team", desc: "Thông báo team Marketing", icon: Bell },
      ]},
    { id: "a2", name: "Khuyến mãi đa kênh", trigger: "Mỗi thứ 2 · 09:00",
      status: "active", runCount: 12, successRate: 100, postedCount: 36,
      steps: [
        { kind: "Trigger", label: "Cron T2 09:00", desc: "Hàng tuần tự động chạy", icon: Clock },
        { kind: "Action", label: "Lấy promo", desc: "Từ module Khuyến mãi", icon: Sparkles },
        { kind: "Action", label: "Đăng 4 kênh", desc: "FB · IG · Zalo · Email", icon: Share2 },
      ]},
    { id: "a3", name: "Review tự động sau checkout", trigger: "Sau khi khách trả phòng +24h",
      status: "active", runCount: 86, successRate: 94, postedCount: 81,
      steps: [
        { kind: "Trigger", label: "Booking.checkout +24h", desc: "Trigger từ hệ thống booking", icon: Webhook },
        { kind: "Filter", label: "Rating ≥ 4 sao", desc: "Chỉ gửi cho khách hài lòng", icon: Star },
        { kind: "Action", label: "Gửi email", desc: "Template cảm ơn + link", icon: AtSign },
        { kind: "Action", label: "Gắn tag VIP", desc: "Auto update CRM", icon: Hash },
      ]},
    { id: "a4", name: "Repurpose TikTok → Reels", trigger: "Khi đăng video TikTok",
      status: "paused", runCount: 24, successRate: 100, postedCount: 24,
      steps: [
        { kind: "Trigger", label: "TikTok.published", desc: "Từ kênh TikTok chính", icon: Webhook },
        { kind: "Transform", label: "Re-format 9:16", desc: "Tối ưu cho Instagram Reels", icon: Repeat },
        { kind: "Action", label: "Đăng IG Reels", desc: "Auto-publish IG", icon: Share2 },
      ]},
    { id: "a5", name: "SEO sitemap auto-update", trigger: "Sau khi publish bài",
      status: "active", runCount: 124, successRate: 100, postedCount: 0,
      steps: [
        { kind: "Trigger", label: "post.published", desc: "Sự kiện xuất bản", icon: Webhook },
        { kind: "Action", label: "Ping Google", desc: "IndexNow + sitemap.xml", icon: Globe2 },
      ]},
    { id: "a6", name: "Email drip 7 ngày", trigger: "Khi có booking mới",
      status: "paused", runCount: 18, successRate: 88, postedCount: 0,
      steps: [
        { kind: "Trigger", label: "booking.created", desc: "Từ hệ thống booking", icon: Webhook },
        { kind: "Wait", label: "Đợi 1 ngày", desc: "Gửi email chào mừng", icon: Hourglass },
        { kind: "Action", label: "Gửi drip 1", desc: "Template 'Check-in'", icon: AtSign },
        { kind: "Wait", label: "Đợi 3 ngày", desc: "", icon: Hourglass },
        { kind: "Action", label: "Gửi drip 2", desc: "Template 'Khám phá'", icon: AtSign },
      ]},
  ];

  const triggers = [
    { name: "Post Published",  desc: "Sau khi xuất bản bài",  icon: FileText,     from: "#8b5cf6", to: "#6366f1" },
    { name: "Booking Created", desc: "Có đơn đặt phòng mới",  icon: CalendarDays, from: "#3b82f6", to: "#0ea5e9" },
    { name: "Form Submitted",  desc: "Khách gửi form",        icon: Send,         from: "#10b981", to: "#14b8a6" },
    { name: "Webhook",         desc: "Từ hệ thống bên ngoài", icon: Webhook,      from: "#f59e0b", to: "#f97316" },
    { name: "Schedule",        desc: "Theo lịch cố định",     icon: Clock,        from: "#f43f5e", to: "#ec4899" },
    { name: "New Follower",    desc: "Có follower mới",       icon: Users,        from: "#d946ef", to: "#a855f7" },
    { name: "Review mới",      desc: "Khách để lại review",   icon: Star,         from: "#eab308", to: "#f59e0b" },
    { name: "Tag Added",       desc: "CRM gắn tag",           icon: Hash,         from: "#06b6d4", to: "#0ea5e9" },
  ];

  const actions = [
    { name: "Đăng Facebook",    desc: "Auto-publish bài viết",   icon: Facebook,  from: "#1877F2", to: "#3b82f6" },
    { name: "Đăng Instagram",   desc: "Feed / Story / Reels",    icon: Instagram, from: "#E1306C", to: "#f97316" },
    { name: "Gửi Zalo OA",      desc: "Broadcast tới followers", icon: Send,      from: "#0068FF", to: "#0ea5e9" },
    { name: "Email Newsletter", desc: "Gửi broadcast",           icon: AtSign,    from: "#8b5cf6", to: "#a855f7" },
    { name: "Đăng TikTok",      desc: "Upload video",            icon: Music2,    from: "#25F4EE", to: "#FE2C55" },
    { name: "IndexNow",         desc: "Báo Google index",        icon: Globe2,    from: "#0ea5e9", to: "#06b6d4" },
    { name: "Gắn tag CRM",      desc: "Auto-tag khách",          icon: Hash,      from: "#10b981", to: "#14b8a6" },
    { name: "Notify Slack",     desc: "Thông báo team",          icon: Bell,      from: "#f59e0b", to: "#f97316" },
  ];

  const queue = [
    { id: "q1", title: "Ưu đãi 30% phòng Deluxe tháng 8", category: "Khuyến mãi", channel: "facebook",  author: "Marketing",   date: "29/07", day: "T4", time: "09:00", status: "scheduled", postType: "carousel" },
    { id: "q2", title: "Behind the scenes đầu bếp",        category: "Câu chuyện", channel: "instagram", author: "Lê Q.C",      date: "29/07", day: "T4", time: "14:00", status: "scheduled", postType: "reel" },
    { id: "q3", title: "Sự kiện Acoustic cuối tuần",       category: "Sự kiện",    channel: "zalo",      author: "Event Team",  date: "30/07", day: "T5", time: "17:00", status: "review",    postType: "post" },
    { id: "q4", title: "Tour Đà Lạt 4N3Đ",                 category: "Trải nghiệm",channel: "tiktok",    author: "Trần H.N",    date: "30/07", day: "T5", time: "20:00", status: "scheduled", postType: "video" },
    { id: "q5", title: "Mẹo đặt phòng mùa cao điểm",       category: "Cẩm nang",   channel: "website",   author: "Nguyễn M.K",  date: "31/07", day: "T6", time: "08:30", status: "scheduled", postType: "post" },
    { id: "q6", title: "Review mới từ khách Đà Lạt",       category: "Đánh giá",   channel: "linkedin",  author: "CSKH",        date: "31/07", day: "T6", time: "15:00", status: "scheduled", postType: "post" },
    { id: "q7", title: "Khuyến mãi Family tháng 8",        category: "Khuyến mãi", channel: "email",     author: "Marketing",   date: "01/08", day: "T7", time: "09:00", status: "scheduled", postType: "post" },
  ];

  const history = [
    { id: "h1", title: "Top 10 check-in Phú Quốc", channel: "facebook",  time: "28/07 09:30", reach: "12.4K", result: "success" },
    { id: "h2", title: "Reel biển hoàng hôn",      channel: "instagram", time: "27/07 18:45", reach: "8.6K",  result: "success" },
    { id: "h3", title: "Ưu đãi phòng Suite",       channel: "zalo",      time: "27/07 14:20", reach: "4.2K",  result: "success" },
    { id: "h4", title: "Behind chef",              channel: "youtube",   time: "27/07 14:00", reach: "—",     result: "failed", error: "API quota exceeded" },
    { id: "h5", title: "Review Đà Lạt Tuấn family",channel: "facebook",  time: "26/07 09:00", reach: "6.2K",  result: "success" },
    { id: "h6", title: "Newsletter tuần 30",       channel: "email",     time: "25/07 08:00", reach: "3.8K",  result: "success" },
  ];

  const reach30 = Array.from({ length: 30 }, (_, i) => ({
    d: `${i + 1}/7`,
    reach: Math.round(28_000 + Math.sin(i / 4) * 12_000 + (i % 7 === 5 ? 18_000 : 0)),
    eng: Math.round(1_800 + Math.cos(i / 3) * 800 + (i % 7 === 5 ? 1_200 : 0)),
  }));

  const channelMix = [
    { name: "TikTok",    value: 32, color: "#FE2C55" },
    { name: "Facebook",  value: 24, color: "#1877F2" },
    { name: "Instagram", value: 18, color: "#E1306C" },
    { name: "Website",   value: 12, color: "#0ea5e9" },
    { name: "Zalo",      value: 8,  color: "#6366f1" },
    { name: "Khác",      value: 6,  color: "#a855f7" },
  ];

  const topPosts = [
    { t: "Reel biển hoàng hôn", eng: 48_200 },
    { t: "Top 10 check-in", eng: 32_400 },
    { t: "Behind chef", eng: 28_600 },
    { t: "Ưu đãi Deluxe", eng: 22_100 },
    { t: "Review Đà Lạt", eng: 18_400 },
  ];

  const radar = [
    { k: "Reach", now: 86, target: 100 },
    { k: "Engagement", now: 72, target: 85 },
    { k: "Growth", now: 94, target: 90 },
    { k: "Click CTR", now: 58, target: 75 },
    { k: "Conversion", now: 42, target: 60 },
    { k: "ROI", now: 76, target: 80 },
  ];

  return {
    heroMeta, overviewKpi, channels, recentPosts, calendar, automations,
    triggers, actions, queue, history, reach30, channelMix, topPosts, radar,
  };
}
