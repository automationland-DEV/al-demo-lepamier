import { useMemo, useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import PageHeader from "../components/PageHeader";
import { Icons } from "../components/Icons";
import Pagination from "../components/Pagination";

const {
  FileText, Plus, Edit2, Trash2, Search, Filter, Download,
  MoreHorizontal, Star, Eye, Heart, Hash, Calendar,
  ImageIcon, ChevronRight, CheckCircle2, Clock, AlertCircle,
  TrendingUp, TrendingDown, Send, Globe2, Sparkles, Share2,
  Link2, AtSign, Target, Users, MousePointerClick, ArrowUpRight,
  LayoutGrid, List, FileEdit, Newspaper, Layers, MessageSquare,
} = Icons;

const tooltipStyle = {
  background: "#0f1218",
  border: "none",
  borderRadius: 6,
  fontSize: 12,
  color: "#fff",
  padding: "8px 12px",
};

const STATUS = {
  draft:     { label: "Nháp",         cls: "bg-ink-100 text-ink-700 border-ink-200" },
  scheduled: { label: "Đã lên lịch",  cls: "bg-blue-50 text-blue-700 border-blue-200" },
  review:    { label: "Chờ duyệt",    cls: "bg-violet-50 text-violet-700 border-violet-200" },
  publishing:{ label: "Đang đăng",    cls: "bg-amber-50 text-amber-700 border-amber-200" },
  published: { label: "Đã đăng",      cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed:    { label: "Lỗi",          cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function Posts() {
  const [view, setView] = useState("grid"); // grid | list
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null); // post detail
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // 6 posts per page for a beautiful 3-column layout (2 rows)

  const data = useMemo(() => buildData(), []);

  const list = useMemo(() => {
    return data.posts.filter((p) =>
      (filter === "all" || p.status === filter) &&
      (search === "" || p.title.toLowerCase().includes(search.toLowerCase()))
    );
  }, [data.posts, filter, search]);

  const totalPages = Math.ceil(list.length / pageSize);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }, [list, currentPage, pageSize]);

  // Reset page when filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  return (
    <div className="max-w-[1320px] mx-auto pb-12 px-3 sm:px-4 lg:px-6">
      <PageHeader
        title="Quản lý bài viết"
        subtitle={`${data.posts.length} bài · ${data.posts.filter((p) => p.status === "published").length} đã đăng`}
        actions={
          <>
            <button className="btn-outline"><Filter className="w-4 h-4" /> Lọc</button>
            <button className="btn-outline"><Download className="w-4 h-4" /> Xuất</button>
            <button className="btn-primary"><Plus className="w-4 h-4" /> Viết bài mới</button>
          </>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
        {data.kpi.map((k, i) => <KPI k={k} key={i} />)}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-ink-200 rounded-md p-3 sm:p-3.5 mb-5 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto sm:order-1 order-2">
          {data.filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11.5px] font-semibold border transition ${
                  active
                    ? "bg-violet-700 text-white border-violet-700 shadow-sm"
                    : "bg-white text-ink-700 border-ink-200 hover:border-violet-300 hover:text-violet-700"
                }`}
              >
                {f.label}
                {f.count != null && (
                  <span className={`ml-1.5 px-1.5 rounded-full text-[10px] tabular-nums ${active ? "bg-white/20" : "bg-ink-100"}`}>
                    {f.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto sm:order-2 order-1 justify-end">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bài viết, tag, tác giả…"
              className="pl-8 pr-3 py-1.5 rounded-md border border-ink-200 bg-ink-50 text-[12px] w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
            />
          </div>
          <div className="flex items-center border border-ink-200 rounded-md overflow-hidden shrink-0">
            <button onClick={() => setView("grid")} className={`p-1.5 ${view === "grid" ? "bg-violet-100 text-violet-700" : "text-ink-500"}`} title="Grid">
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 border-l border-ink-200 ${view === "list" ? "bg-violet-100 text-violet-700" : "text-ink-500"}`} title="List">
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Posts */}
      {view === "grid" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {paginatedPosts.map((p) => (
              <PostCard key={p.id} p={p} onOpen={() => setActive(p)} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={list.length}
            itemsPerPage={pageSize}
          />
        </div>
      ) : (
        <div className="bg-white border border-ink-200 rounded-xl p-4 overflow-hidden">
          <div className="overflow-x-auto -mx-4 -mt-4">
            <table className="w-full text-[12px] min-w-[640px]">
              <thead>
                <tr className="text-left text-ink-500 uppercase tracking-wider text-[10px] bg-ink-50">
                  <th className="px-5 py-3 font-semibold border-b border-ink-200">Bài viết</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell border-b border-ink-200">Danh mục</th>
                  <th className="px-5 py-3 font-semibold hidden lg:table-cell border-b border-ink-200">Tags</th>
                  <th className="px-5 py-3 font-semibold border-b border-ink-200">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold text-right border-b border-ink-200 border-r-0">Lượt xem</th>
                  <th className="px-5 py-3 font-semibold border-b border-ink-200"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedPosts.map((p, i) => (
                  <tr key={p.id} className={`border-b border-ink-100 ${i % 2 ? "bg-ink-50/40" : ""} hover:bg-violet-50/30 transition`}>
                    <td className="px-5 py-3 min-w-0 max-w-[320px]">
                      <div className="font-semibold text-ink-900 truncate flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                        {p.title}
                      </div>
                      <div className="text-[10px] text-ink-500 mt-0.5 truncate">{p.author} · {p.date}</div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">{p.category}</span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1 flex-wrap">
                        {p.tags.slice(0, 2).map((t) => (
                          <span key={t} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-ink-100 text-ink-700">
                            <Hash className="w-2.5 h-2.5" />{t}
                          </span>
                        ))}
                        {p.tags.length > 2 && <span className="text-[10px] text-ink-500 font-bold">+{p.tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3"><StatusPill s={p.status} /></td>
                    <td className="px-5 py-3 text-right tabular-nums font-bold text-ink-900 whitespace-nowrap">{p.views}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setActive(p)} className="w-7 h-7 rounded-md hover:bg-violet-100 text-violet-700 flex items-center justify-center transition">
                          <Eye className="w-3.5 h-3.5" />
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={list.length}
            itemsPerPage={pageSize}
          />
        </div>
      )}

      {/* Detail drawer */}
      {active && <PostDrawer post={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function KPI({ k }) {
  const up = k.trend >= 0;
  const toneCls = up ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-700 bg-rose-50 border-rose-100";
  const Icn = up ? TrendingUp : TrendingDown;
  return (
    <div className="bg-white border border-ink-200 rounded-xl p-3.5 hover:shadow-md transition duration-300">
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <k.icon className="w-4 h-4 text-violet-750" />
        <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${toneCls}`}>
          <Icn className="w-2.5 h-2.5" />
          {up ? "+" : ""}{k.trend}%
        </span>
      </div>
      <div className="text-2xl font-display font-extrabold text-ink-900 tabular-nums leading-none">{k.value}</div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold mt-1.5 truncate">{k.label}</div>
    </div>
  );
}

function StatusPill({ s }) {
  const cfg = STATUS[s] || STATUS.draft;
  return <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.cls}`}>{cfg.label}</span>;
}

function PostCard({ p, onOpen }) {
  return (
    <div onClick={onOpen} className="bg-white border border-ink-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col h-full">
      <div className="aspect-[16/9] relative overflow-hidden bg-ink-100 shrink-0">
        {p.cover ? (
          <img
            src={p.cover}
            alt={p.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/95 text-violet-700 shadow-sm">
            {p.category}
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <StatusPill s={p.status} />
        </div>
        <div className="absolute bottom-2.5 left-2.5 right-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-ink-900/80 text-white border border-white/10">
              {p.postType}
            </span>
            {p.featured && <span className="text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-white shadow-sm">⭐ NỔI BẬT</span>}
          </div>
          <div className="text-white font-display font-bold text-[14px] leading-snug line-clamp-2 drop-shadow">
            {p.title}
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[10px] text-ink-500 flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-ink-700">{p.author}</span>·<span>{p.date}</span>·<span className="tabular-nums">{p.readTime} đọc</span>
        </div>
        <p className="text-[12px] text-ink-700 mt-2 line-clamp-2 leading-relaxed flex-1">{p.excerpt}</p>
        <div className="flex items-center gap-1 flex-wrap mt-3">
          {p.tags.slice(0, 3).map((t) => (
            <span key={t} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-ink-50 text-ink-700 border border-ink-150">
              <Hash className="w-2.5 h-2.5" />{t}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 mt-4 pt-3.5 border-t border-ink-100 shrink-0">
          <div className="flex items-center gap-3 text-[11px] text-ink-500">
            <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{p.views || 0}</span>
            <span className="inline-flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{p.likes || 0}</span>
            <span className="inline-flex items-center gap-1"><Share2 className="w-3.5 h-3.5" />{p.shares || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <span className="text-ink-500 uppercase tracking-wider">SEO</span>
            <span className={`tabular-nums text-xs ${p.seo >= 80 ? "text-emerald-700" : p.seo >= 60 ? "text-amber-700" : "text-rose-700"}`}>{p.seo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostDrawer({ post, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-xl h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-white border-b border-ink-200 px-5 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-violet-750 shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-ink-900 truncate">{post.title}</div>
              <div className="text-[10px] text-ink-500">{post.author} · {post.date}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-ink-100 text-ink-500 flex items-center justify-center transition shrink-0 font-bold text-xl">
            ×
          </button>
        </div>
        <div className="p-5 space-y-5">
          {/* Cover */}
          <div className="aspect-[16/9] rounded-xl relative overflow-hidden bg-ink-100 border border-ink-200 shadow-sm">
            {post.cover ? (
              <img
                src={post.cover}
                alt={post.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/95 text-violet-700 shadow-sm">
                {post.category}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            <SmallStat label="Lượt xem"  value={post.views}  icon={Eye}        tone="violet" />
            <SmallStat label="Thích"     value={post.likes}  icon={Heart}      tone="rose" />
            <SmallStat label="Chia sẻ"   value={post.shares} icon={Share2}     tone="blue" />
            <SmallStat label="Comment"   value={post.comments} icon={MessageSquare} tone="emerald" />
          </div>

          {/* SEO */}
          <Section title="Phân tích SEO" icon={Target}>
            <div className="grid grid-cols-2 gap-3">
              <SEOBlox k="SEO Score" v={post.seo} suffix="/100" tone={post.seo >= 80 ? "emerald" : post.seo >= 60 ? "amber" : "rose"} />
              <SEOBlox k="Readability" v={post.readability} suffix="/100" tone="blue" />
              <SEOBlox k="Keyword density" v={`${post.kw}%`} tone="violet" />
              <SEOBlox k="Backlinks" v={post.backlinks} tone="emerald" />
            </div>
            <div className="mt-3 p-3 rounded-xl bg-ink-50 border border-ink-200">
              <div className="text-[10px] uppercase font-bold text-ink-500 mb-1.5">Từ khóa chính</div>
              <div className="flex items-center gap-1 flex-wrap">
                {post.mainKeywords.map((k) => (
                  <span key={k} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-750 border border-violet-200">{k}</span>
                ))}
              </div>
            </div>
          </Section>

          {/* Tags */}
          <Section title="Tags" icon={Hash}>
            <div className="flex items-center gap-1.5 flex-wrap">
              {post.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 shadow-sm">
                  <Hash className="w-3 h-3" />{t}
                </span>
              ))}
              <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-dashed border-ink-300 text-ink-500 hover:border-violet-400 hover:text-violet-700 transition">
                <Plus className="w-3 h-3" /> Thêm tag
              </button>
            </div>
          </Section>

          {/* Performance */}
          <Section title="Hiệu quả 14 ngày" icon={TrendingUp}>
            <div className="h-40 bg-ink-50/50 p-2.5 rounded-xl border border-ink-150">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={post.chart} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`g-${post.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" vertical={false} />
                  <XAxis dataKey="d" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2} fill={`url(#g-${post.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* Multi-channel */}
          <Section title="Đã đăng kênh" icon={Globe2}>
            <div className="grid grid-cols-3 gap-2">
              {post.channelStats.map((c) => (
                <div key={c.id} className="border border-ink-200 rounded-xl p-2.5 bg-white">
                  <div className="text-[10px] font-bold text-ink-700 uppercase tracking-wider truncate">{c.name}</div>
                  <div className="text-[13px] font-display font-extrabold text-ink-900 tabular-nums mt-0.5">{c.views}</div>
                  <div className="text-[9px] text-emerald-700 font-bold mt-0.5">↑ {c.trend}%</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-ink-200">
            <button className="flex-1 px-3 py-2.5 rounded-lg bg-violet-700 text-white text-[12px] font-bold hover:bg-violet-850 transition flex items-center justify-center gap-1.5 shadow-sm">
              <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
            <button className="flex-1 px-3 py-2.5 rounded-lg border border-ink-200 text-ink-700 text-[12px] font-semibold hover:bg-ink-50 transition flex items-center justify-center gap-1.5 shadow-sm">
              <Share2 className="w-3.5 h-3.5" /> Chia sẻ
            </button>
            <button className="flex-1 px-3 py-2.5 rounded-lg border border-rose-250 text-rose-700 text-[12px] font-semibold hover:bg-rose-50 transition flex items-center justify-center gap-1.5 shadow-sm">
              <Trash2 className="w-3.5 h-3.5" /> Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-violet-750" />
        <div className="text-[10px] uppercase tracking-wider font-bold text-violet-800">{title}</div>
      </div>
      {children}
    </div>
  );
}

function SmallStat({ label, value, icon: Icon, tone = "violet" }) {
  const toneCls = {
    violet: "bg-violet-50 text-violet-700 border border-violet-100",
    rose: "bg-rose-50 text-rose-700 border border-rose-100",
    blue: "bg-blue-50 text-blue-700 border border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  }[tone];
  return (
    <div className="border border-ink-200 rounded-xl p-2.5 text-center">
      <div className={`w-7 h-7 rounded-lg ${toneCls} flex items-center justify-center mx-auto mb-1.5`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="text-[14px] font-display font-bold text-ink-900 tabular-nums leading-none">{value}</div>
      <div className="text-[9px] text-ink-500 uppercase tracking-wider font-semibold mt-1.5">{label}</div>
    </div>
  );
}

function SEOBlox({ k, v, suffix, tone = "violet" }) {
  const toneCls = {
    violet: "text-violet-700 bg-violet-50 border-violet-200",
    rose: "text-rose-700 bg-rose-50 border-rose-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    blue: "text-blue-700 bg-blue-50 border-blue-200",
  }[tone];
  return (
    <div className={`p-2.5 rounded-lg border ${toneCls}`}>
      <div className="text-[9px] uppercase font-bold tracking-wider opacity-85">{k}</div>
      <div className="text-[18px] font-display font-bold tabular-nums leading-none mt-1">
        {v}<span className="text-[10px] opacity-70 font-normal ml-0.5">{suffix || ""}</span>
      </div>
    </div>
  );
}

function buildData() {
  const kpi = [
    { label: "Tổng bài",     value: 168, trend: 4.2,  icon: FileText },
    { label: "Đã đăng",      value: 142, trend: 12.4, icon: CheckCircle2 },
    { label: "Lượt xem TB",  value: "2.4K", trend: 18.6, icon: Eye },
    { label: "Engagement",   value: "8.2%", trend: 6.1, icon: Heart },
    { label: "SEO TB",       value: 86,   trend: 2.4,  icon: Target },
    { label: "Tags",         value: 64,   trend: 12,   icon: Hash },
  ];

  const filters = [
    { id: "all",       label: "Tất cả",       count: 168 },
    { id: "published", label: "Đã đăng",      count: 142 },
    { id: "scheduled", label: "Đã lên lịch",   count: 14 },
    { id: "review",    label: "Chờ duyệt",     count: 6 },
    { id: "draft",     label: "Nháp",          count: 4 },
    { id: "failed",    label: "Lỗi",           count: 2 },
  ];

  const covers = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=450&fit=crop&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=450&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=450&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=450&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=450&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556217477-d325251ece38?w=800&h=450&fit=crop&q=80",
    "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&h=450&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571406761758-9a0eed4d5f24?w=800&h=450&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&h=450&fit=crop&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=450&fit=crop&q=80",
  ];

  const basePost = (i) => ({
    id: `p${i}`,
    title: [
      "Top 10 điểm check-in mùa hè tại Phú Quốc",
      "Bí quyết chọn resort cho gia đình có trẻ nhỏ",
      "Behind the scenes: Đầu bếp 5 sao tại Le Palmier",
      "Sự kiện âm nhạc Acoustic cuối tuần bên hồ bơi",
      "Ưu đãi 30% phòng Deluxe tháng 8 — Đặt sớm",
      "Review khách hàng: Kỳ nghỉ đáng nhớ tại Đà Lạt",
      "Workshop làm bánh cùng đầu bếp Pháp",
      "Mẹo đặt phòng mùa cao điểm không bị 'cháy' phòng",
      "7 lý do nên đi Đà Lạt mùa thu này",
      "Yoga buổi sáng bên biển — Lịch tập tháng 8",
      "Hành trình 4N3Đ khám phá Phú Quốc cùng gia đình",
      "Behind the scenes: Đội ngũ housekeeping 5 sao",
    ][i],
    excerpt: [
      "Khám phá những góc sống ảo đẹp nhất tại đảo ngọc cùng Le Palmier Phú Quốc trong mùa hè này.",
      "Hướng dẫn chi tiết từ A-Z cho kỳ nghỉ gia đình hoàn hảo, từ chọn phòng đến hoạt động.",
      "Câu chuyện về những đôi tay vàng làm nên ẩm thực đẳng cấp tại hệ thống Le Palmier.",
      "Đem nhạc acoustic lãng mạn bên hồ bơi vô cực với ban nhạc The Fingers.",
      "Đặt phòng sớm để nhận ưu đãi hấp dẫn lên đến 30% phòng Deluxe tháng 8.",
      "Chia sẻ từ gia đình anh Tuấn sau 3 ngày tuyệt vời tại LP2 Đà Lạt.",
      "Trải nghiệm làm bánh croissants và macarons cùng đầu bếp người Pháp tại LP1.",
      "5 mẹo nhỏ giúp bạn đặt được phòng đẹp trong mùa cao điểm.",
      "Đà Lạt mùa thu — se lạnh vừa phải, hoa dã quỳ nở rộ, ít đông đúc.",
      "Lớp yoga miễn phí mỗi sáng từ 6h-7h tại bãi biển riêng LP3.",
      "Lịch trình chi tiết 4 ngày 3 đêm cho gia đình 4 người tại LP3.",
      "Khám phá công việc thầm lặng của đội ngũ housekeeping đẳng cấp 5 sao.",
    ][i],
    category: ["Trải nghiệm","Cẩm nang","Câu chuyện","Sự kiện","Khuyến mãi","Đánh giá","Sự kiện","Cẩm nang","Trải nghiệm","Sự kiện","Cẩm nang","Câu chuyện"][i],
    author: ["Nguyễn Minh K.","Trần Hồng N.","Lê Quốc C.","Event Team","Marketing Team","CSKH Team","Event Team","Nguyễn Minh K.","Trần Hồng N.","Event Team","Trần Hồng N.","Lê Quốc C."][i],
    date: ["28/07/2026","27/07/2026","27/07/2026","26/07/2026","28/07/2026","26/07/2026","25/07/2026","24/07/2026","23/07/2026","22/07/2026","21/07/2026","20/07/2026"][i],
    readTime: ["5 phút","8 phút","6 phút","3 phút","2 phút","4 phút","4 phút","5 phút","6 phút","2 phút","7 phút","5 phút"][i],
    status: ["published","published","scheduled","review","publishing","published","published","published","scheduled","draft","published","failed"][i],
    postType: ["Carousel","Bài viết","Video","Bài viết","Carousel","Bài viết","Reel","Bài viết","Bài viết","Bài viết","Bài viết","Video"][i],
    tags: [
      ["phu-quoc","summer","check-in"],
      ["family","kids","tips"],
      ["chef","fnb","behind"],
      ["event","acoustic","weekend"],
      ["promo","deluxe","sale"],
      ["review","da-lat","customer"],
      ["workshop","baking","french"],
      ["tips","booking","peak"],
      ["da-lat","autumn","travel"],
      ["yoga","wellness","free"],
      ["phu-quoc","family","itinerary"],
      ["housekeeping","behind","staff"],
    ][i],
    featured: [true,false,false,true,true,false,false,false,false,false,false,false][i],
    views: ["12.4K","5.8K","—","—","8.2K","6.2K","4.8K","9.4K","—","—","11.2K","—"][i],
    likes: ["1.2K","640","—","—","820","720","480","980","—","—","1.1K","—"][i],
    shares: ["324","186","—","—","248","192","124","268","—","—","312","—"][i],
    comments: ["86","42","—","—","64","58","32","72","—","—","94","—"][i],
    seo: [94, 88, 82, 76, 92, 84, 78, 86, 80, 70, 90, 72][i],
    readability: [88, 84, 90, 92, 86, 80, 84, 88, 82, 76, 86, 80][i],
    kw: [2.4, 1.8, 2.1, 1.2, 3.2, 1.6, 1.4, 2.6, 1.8, 1.0, 2.2, 1.8][i],
    backlinks: [14, 8, 6, 4, 12, 9, 3, 7, 5, 1, 11, 2][i],
    mainKeywords: [
      ["phú quốc","check-in","mùa hè"],
      ["resort gia đình","trẻ nhỏ"],
      ["đầu bếp","le palmier"],
      ["acoustic","hồ bơi"],
      ["ưu đãi","deluxe"],
      ["review","đà lạt"],
      ["workshop","bánh"],
      ["đặt phòng","mẹo"],
      ["đà lạt","mùa thu"],
      ["yoga","biển"],
      ["phú quốc","4n3đ"],
      ["housekeeping","5 sao"],
    ][i],
    channelStats: [
      { id: "fb", name: "Facebook",  views: "8.2K",  trend: 24 },
      { id: "ig", name: "Instagram", views: "2.4K",  trend: 18 },
      { id: "yt", name: "YouTube",   views: "1.8K",  trend: 12 },
    ],
    chart: Array.from({ length: 14 }, (_, d) => ({ d: `${d + 1}/7`, v: Math.round(800 + Math.sin(d / 2) * 400 + (d > 9 ? 600 : 0)) })),
    cover: covers[i % covers.length],
  });

  const posts = Array.from({ length: 12 }, (_, i) => basePost(i));

  return { kpi, filters, posts };
}