import { useMemo, useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Icons } from "../components/Icons";
import Pagination from "../components/Pagination";
import { Modal } from "../components/DashboardPrimitives";
import { usePalette, TONE, scoreTone } from "../theme/palette";

const {
  FileText, Plus, Edit2, Trash2, Search, Download, Filter, Hash,
  Eye, Heart, Share2, MessageSquare, Calendar, Clock,
  CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Sparkles,
  LayoutGrid, List, X, ChevronRight, Send, Star, PenLine,
} = Icons;

/* Mau thuong hieu + mau danh muc lay tu usePalette() trong component */
const CAT_KEYS = ["Trải nghiệm", "Cẩm nang", "Câu chuyện", "Sự kiện", "Khuyến mãi", "Đánh giá"];

/* Trạng thái bài viết — luôn dùng màu ngữ nghĩa, KHÔNG đổi theo accent */
const STATUS = {
  published:  { label: "Đã đăng",     ...TONE.success },
  publishing: { label: "Đang đăng",   ...TONE.warning },
  scheduled:  { label: "Đã lên lịch", ...TONE.info },
  review:     { label: "Chờ duyệt",   bg: "#f1ecfe", ink: "#6d28d9", dot: "#8b5cf6", from: "#8b5cf6", to: "#6366f1" },
  draft:      { label: "Nháp",        ...TONE.neutral },
  failed:     { label: "Lỗi",         ...TONE.danger },
};

/* Trạng thái cần người xử lý — dùng để dựng dải việc cần làm */
const NEEDS_ACTION = ["failed", "review", "draft"];

const parseNum = (v) => {
  if (typeof v === "number") return v;
  if (!v || v === "—") return 0;
  const n = parseFloat(String(v).replace(/[^\d.]/g, ""));
  return String(v).toUpperCase().includes("K") ? n * 1000 : n;
};

const fmtNum = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(Math.round(n)));

function formatToday() {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
}

function getBlankPost() {
  return {
    id: null,
    title: "",
    excerpt: "",
    category: CAT_KEYS[0],
    author: "Nguyễn Văn A",
    date: formatToday(),
    readTime: "5 phút",
    status: "draft",
    postType: "Bài viết",
    scheduledAt: "",
    reviewer: "",
    error: "",
    tags: [],
    featured: false,
    cover: "",
    views: "—",
    likes: "—",
    shares: "—",
    comments: "—",
    seo: 72,
    readability: 78,
    kw: 1.6,
    backlinks: 0,
    mainKeywords: [],
    chart: Array.from({ length: 14 }, (_, d) => ({ d: `${d + 1}/7`, v: 0 })),
  };
}

export default function Posts() {
  const { brand: BRAND, series, seriesMap } = usePalette();
  const CAT = useMemo(() => seriesMap(CAT_KEYS), [seriesMap]);
  const KPI = useMemo(() => series(4), [series]);
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState(() => getBlankPost());
  const [page, setPage] = useState(1);
  const pageSize = view === "grid" ? 9 : 10;

  const fileInputRef = useRef(null);

  const onPickCover = (e) => {
    const f = e?.target?.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setDraft((d) => ({ ...d, cover: url }));
  };

  const removeCover = () => setDraft((d) => ({ ...d, cover: "" }));

  const saveNewPost = () => {
    const next = { ...draft, id: `p${Date.now()}`, date: formatToday() };
    setPosts((s) => [next, ...s]);
    setCreateOpen(false);
    setDraft(getBlankPost());
  };

  const data = useMemo(() => buildData(), []);
  const [posts, setPosts] = useState(() => data.posts);

  useEffect(() => {
    if (!createOpen) {
      setDraft(getBlankPost());
    }
  }, [createOpen]);

  // Lượt xem trung bình của bài đã đăng — dùng làm mốc so sánh trên từng thẻ
  const avgViews = useMemo(() => {
    const pub = posts.filter((p) => p.status === "published");
    return pub.reduce((s, p) => s + parseNum(p.views), 0) / Math.max(pub.length, 1);
  }, [posts]);

  const needsAction = useMemo(
    () => posts.filter((p) => NEEDS_ACTION.includes(p.status)),
    [posts]
  );

  const list = useMemo(() => posts.filter((p) => {
    if (filter === "action") return NEEDS_ACTION.includes(p.status);
    if (filter !== "all" && p.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q)
          || p.author.toLowerCase().includes(q)
          || p.tags.some((t) => t.includes(q));
    }
    return true;
  }), [posts, filter, search]);

  const totalPages = Math.ceil(list.length / pageSize);
  const paginated = useMemo(
    () => list.slice((page - 1) * pageSize, page * pageSize),
    [list, page, pageSize]
  );

  useEffect(() => setPage(1), [filter, search, view]);

  const published = posts.filter((p) => p.status === "published").length;

  return (
    <div className="max-w-[1360px] mx-auto pb-10">

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-1 pb-6">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.14em] text-white mb-3"
               style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
            <PenLine className="w-3 h-3" /> Nội dung
          </div>
          <h1 className="font-display font-extrabold tracking-[-0.03em] text-[32px] sm:text-[38px] leading-none"
              style={{ color: "var(--fg)" }}>
            Bài viết
          </h1>
          <div className="flex items-center gap-2.5 mt-2.5 text-[13px] flex-wrap" style={{ color: "var(--fg-muted)" }}>
            <span><b className="font-extrabold" style={{ color: "var(--fg)" }}>{data.posts.length}</b> bài viết</span>
            <span className="opacity-40">•</span>
            <span><b className="font-extrabold" style={{ color: "var(--fg)" }}>{published}</b> đã đăng</span>
            <span className="opacity-40">•</span>
            <span>Lượt xem TB <b className="font-extrabold tabular-nums" style={{ color: "var(--fg)" }}>{fmtNum(avgViews)}</b></span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <GhostBtn icon={Filter}>Lọc</GhostBtn>
          <GhostBtn icon={Download}>Xuất</GhostBtn>
          <button onClick={() => setCreateOpen(true)}
                  className="glowbtn inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})`,
                           boxShadow: "0 8px 20px -8px rgba(139,92,246,.65)" }}>
            <Plus className="w-4 h-4" /> Viết bài mới
          </button>
        </div>
      </div>

      {/* ═══ DẢI VIỆC CẦN LÀM — chỉ hiện khi thật sự có ═══ */}
      {needsAction.length > 0 && (
        <ActionStrip
          items={needsAction}
          onFilter={() => { setFilter("action"); setView("list"); }}
        />
      )}

      {/* ═══ KPI — 4 ô, đều dẫn tới hành động ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {data.kpi.map((k, i) => <KpiCard key={k.label} k={{ ...k, ...KPI[i] }} />)}
      </div>

      {/* ═══ CHIP LỌC ═══ */}
      <div className="noscroll flex items-center gap-2.5 overflow-x-auto pb-3 mb-3">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}
                    from="#475569" to="#1e293b" label="Tất cả" count={data.posts.length} />
        {Object.entries(STATUS).map(([key, s]) => {
          const n = data.posts.filter((p) => p.status === key).length;
          if (!n) return null;
          return (
            <FilterChip key={key} active={filter === key}
                        onClick={() => setFilter(filter === key ? "all" : key)}
                        from={s.from} to={s.to} label={s.label} count={n} />
          );
        })}
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div className="rounded-[var(--r)] border p-2.5 mb-5 flex items-center gap-2.5 flex-wrap"
           style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-subtle)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
                 placeholder="Tìm theo tiêu đề, tác giả hoặc tag…"
                 className="w-full h-11 pl-11 pr-10 rounded-full text-[13px] border-0 outline-none"
                 style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }} />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Xóa"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-subtle)" }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <span className="text-[12.5px] font-semibold px-2 shrink-0" style={{ color: "var(--fg-muted)" }}>
          {list.length} kết quả
        </span>

        <Segmented gradient value={view} onChange={setView}
                   options={[
                     { key: "grid", label: "Thẻ", icon: LayoutGrid },
                     { key: "list", label: "Bảng", icon: List },
                   ]} />
      </div>

      {/* ═══ NỘI DUNG ═══ */}
      {list.length === 0 ? (
        <EmptyState onClear={() => { setFilter("all"); setSearch(""); }} />
      ) : view === "grid" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((p) => (
              <PostCard key={p.id} p={p} avg={avgViews} cat={CAT} brand={BRAND} onOpen={() => setActive(p)} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage}
                      totalItems={list.length} itemsPerPage={pageSize} />
        </>
      ) : (
        <div className="rounded-[var(--r)] border overflow-hidden"
             style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-[13px]">
              <thead>
                <tr style={{ backgroundColor: "var(--surface-2)" }}>
                  {["Bài viết", "Danh mục", "Trạng thái", "SEO", "Lượt xem", "Tương tác", ""].map((h, i) => (
                    <th key={i}
                        className={`px-5 py-3.5 text-[10.5px] font-extrabold uppercase tracking-wider ${i >= 4 && i < 6 ? "text-right" : "text-left"}`}
                        style={{ color: "var(--fg-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <PostRow key={p.id} p={p} avg={avgViews} cat={CAT} onOpen={() => setActive(p)} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 pb-2">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage}
                        totalItems={list.length} itemsPerPage={pageSize} />
          </div>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tạo bài viết mới" icon={FileText} width="max-w-3xl"
             footer={
               <>
                 <button onClick={() => setCreateOpen(false)}
                         className="h-10 px-4 rounded-full border text-[13px] font-bold"
                         style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>
                   Hủy
                 </button>
                 <button onClick={saveNewPost}
                         className="h-10 px-5 rounded-full text-white text-[13px] font-bold"
                         style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
                   Tạo bài viết
                 </button>
               </>
             }>
        <div className="flex flex-col gap-4" style={{ maxHeight: '78vh' }}>
          <div className="rounded-2xl border-dashed border-2 p-6 h-96 relative"
               style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-3)" }}>
            {draft.cover ? (
              <img src={draft.cover} alt="cover" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="flex flex-col items-center gap-3 z-10 text-[13px] text-center" style={{ color: "var(--fg-muted)" }}>
                <FileText className="w-12 h-12" />
                <div className="font-semibold">Ảnh bìa (tùy chọn)</div>
                <div className="text-sm">Kéo thả hoặc chọn ảnh JPG/PNG (dưới 5MB)</div>
              </div>
            )}

            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 h-9 px-3 rounded-full bg-white/8 text-[13px] font-bold"
                      style={{ border: "1px solid var(--border)", color: "var(--fg)" }}>
                Chọn ảnh
              </button>
              {draft.cover && (
                <button onClick={removeCover}
                        className="inline-flex items-center gap-2 h-9 px-3 rounded-full border text-[13px] font-bold"
                        style={{ borderColor: "var(--border)", color: "var(--fg-muted)", background: "var(--surface)" }}>
                  Xóa
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickCover} />
            </div>
          </div>

          <div className="overflow-y-auto px-1" style={{ paddingRight: 8 }}>
            <div className="space-y-4 pb-4">
              <div>
                <Label>Tiêu đề</Label>
                <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                       placeholder="Viết tiêu đề hấp dẫn..."
                       className="w-full h-12 px-3 rounded-md text-[15px] border"
                       style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--fg)" }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Danh mục</Label>
                  <select value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                          className="w-full h-11 px-3 rounded-md text-[14px] border"
                          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--fg)" }}>
                    {CAT_KEYS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Thẻ (phân cách bằng dấu phẩy)</Label>
                  <input value={draft.tags.join(",")} onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }))}
                         placeholder="ví dụ: phu-quoc, summer, check-in"
                         className="w-full h-11 px-3 rounded-md text-[14px] border"
                         style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--fg)" }} />
                </div>
              </div>

              <div>
                <Label>Tóm tắt</Label>
                <textarea value={draft.excerpt} onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
                          placeholder="Viết tóm tắt ngắn (dùng cho thẻ mô tả)…"
                          className="w-full min-h-[120px] p-3 rounded-md text-[14px] border"
                          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--fg)" }} />
              </div>

              <div className="flex items-center gap-3">
                <input id="featured" type="checkbox" checked={draft.featured} onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))} />
                <label htmlFor="featured" style={{ color: "var(--fg-muted)" }} className="text-sm">Đánh dấu là nổi bật</label>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {active && <PostDrawer post={active} avg={avgViews} cat={CAT} brand={BRAND} onClose={() => setActive(null)} />}
    </div>
  );
}

/* ═══════════════ DẢI VIỆC CẦN LÀM ═══════════════ */
function ActionStrip({ items, onFilter }) {
  const { brand: BRAND } = usePalette();
  const byStatus = items.reduce((m, p) => ((m[p.status] = (m[p.status] || 0) + 1), m), {});
  const failed = byStatus.failed || 0;

  return (
    <div className="rounded-[var(--r)] border p-4 mb-5 flex items-center gap-4 flex-wrap"
         style={{
           backgroundColor: "var(--surface)",
           borderColor: failed ? "#fecdd3" : "var(--border)",
         }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
           style={{
             background: failed
               ? `linear-gradient(135deg,${TONE.danger.from},${TONE.danger.to})`
               : `linear-gradient(135deg,${BRAND.from},${BRAND.to})`,
             boxShadow: `0 6px 14px -7px ${failed ? TONE.danger.from : BRAND.from}`,
           }}>
        {failed ? <AlertCircle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-display font-extrabold text-[15px]" style={{ color: "var(--fg)" }}>
          {items.length} bài cần bạn xử lý
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {Object.entries(byStatus).map(([k, n]) => {
            const s = STATUS[k];
            return (
              <span key={k} className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11.5px] font-bold"
                    style={{ backgroundColor: s.bg, color: s.ink }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                {n} {s.label.toLowerCase()}
              </span>
            );
          })}
        </div>
      </div>

      <button onClick={onFilter}
              className="glowbtn inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-[13px] font-bold text-white shrink-0"
              style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
        Xem danh sách <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ═══════════════ KPI ═══════════════ */
function KpiCard({ k }) {
  const up = (k.trend ?? 0) >= 0;
  const T = up ? TrendingUp : TrendingDown;
  const alert = k.tone === "alert";
  return (
    <div className="lift relative rounded-[var(--r)] border p-5 overflow-hidden"
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", "--glow": `${k.from}55` }}>
      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl opacity-20"
           style={{ background: `linear-gradient(135deg,${k.from},${k.to})` }} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-extrabold uppercase tracking-wider truncate" style={{ color: "var(--fg-muted)" }}>
            {k.label}
          </div>
          <div className="font-display font-extrabold text-[30px] leading-none tracking-tight tabular-nums mt-2.5"
               style={{ color: "var(--fg)" }}>
            {k.value}
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
             style={{ background: `linear-gradient(135deg,${k.from},${k.to})`, boxShadow: `0 8px 18px -8px ${k.from}` }}>
          <k.icon className="w-5 h-5" />
        </div>
      </div>
      <div className="relative flex items-center gap-2 mt-3 text-[12px]" style={{ color: "var(--fg-muted)" }}>
        <span className="truncate">{k.foot}</span>
        {k.trend != null && !alert && (
          <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-extrabold shrink-0"
                style={up ? { backgroundColor: TONE.success.bg, color: TONE.success.ink } : { backgroundColor: TONE.danger.bg, color: TONE.danger.ink }}>
            <T className="w-3 h-3" />{up ? "+" : ""}{k.trend}%
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ THẺ BÀI VIẾT ═══════════════ */
function PostCard({ p, avg, cat, onOpen }) {
  const s = STATUS[p.status];
  const isLive = p.status === "published";

  return (
    <div onClick={onOpen}
         className="lift group rounded-[var(--r)] border overflow-hidden cursor-pointer flex flex-col"
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", "--glow": `${s.from}45` }}>

      {/* Ảnh bìa — thấp hơn bản cũ để nhường chỗ cho thông tin */}
      <div className="relative aspect-[2/1] overflow-hidden shrink-0" style={{ backgroundColor: "var(--surface-3)" }}>
        {p.cover && (
          <img src={p.cover} alt="" loading="lazy"
               className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(15,18,24,.82) 0%,rgba(15,18,24,.15) 55%,transparent 100%)" }} />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <CatPill cat={p.category} c={cat} solid />
          <StatusTag s={p.status} solid />
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          {p.featured && (
            <span className="inline-flex items-center gap-1 px-2 h-5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider text-white mb-1.5"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
              <Star className="w-2.5 h-2.5" fill="currentColor" /> Nổi bật
            </span>
          )}
          <div className="text-white font-display font-extrabold text-[15px] leading-snug line-clamp-2">
            {p.title}
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-[11.5px] flex-wrap" style={{ color: "var(--fg-muted)" }}>
          <span className="font-bold" style={{ color: "var(--fg)" }}>{p.author}</span>
          <span className="opacity-40">•</span><span>{p.date}</span>
          <span className="opacity-40">•</span><span className="tabular-nums">{p.readTime}</span>
        </div>

        <p className="text-[12.5px] mt-2 line-clamp-2 leading-relaxed flex-1" style={{ color: "var(--fg-muted)" }}>
          {p.excerpt}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          {p.tags.slice(0, 3).map((t) => (
            <span key={t} className="inline-flex items-center gap-0.5 px-2 h-6 rounded-full text-[11px] font-bold"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--fg-muted)" }}>
              <Hash className="w-2.5 h-2.5" />{t}
            </span>
          ))}
        </div>

        {/* Chân thẻ đổi theo trạng thái:
            đã đăng → hiệu suất so với trung bình · chưa đăng → việc cần làm */}
        <div className="mt-4 pt-3.5 border-t" style={{ borderColor: "var(--border-soft)" }}>
          {isLive ? <LivePerformance p={p} avg={avg} /> : <PendingInfo p={p} />}
        </div>
      </div>
    </div>
  );
}

/** Bài đã đăng: 3 số tương tác + so sánh với lượt xem trung bình + điểm SEO */
function LivePerformance({ p, avg }) {
  const v = parseNum(p.views);
  const ratio = avg > 0 ? v / avg : 0;
  const good = ratio >= 1;

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[12px]" style={{ color: "var(--fg-muted)" }}>
          <span className="inline-flex items-center gap-1 tabular-nums"><Eye className="w-3.5 h-3.5" />{p.views}</span>
          <span className="inline-flex items-center gap-1 tabular-nums"><Heart className="w-3.5 h-3.5" />{p.likes}</span>
          <span className="inline-flex items-center gap-1 tabular-nums"><Share2 className="w-3.5 h-3.5" />{p.shares}</span>
        </div>
        <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-extrabold tabular-nums shrink-0"
              style={good ? { backgroundColor: TONE.success.bg, color: TONE.success.ink } : { backgroundColor: TONE.warning.bg, color: TONE.warning.ink }}>
          {good ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {ratio.toFixed(1)}× TB
        </span>
      </div>
      <SeoBar score={p.seo} className="mt-3" />
    </>
  );
}

/** Bài chưa đăng: thay 4 dấu "—" vô nghĩa bằng việc cần làm cụ thể */
function PendingInfo({ p }) {
  const s = STATUS[p.status];
  const info = {
    scheduled:  { icon: Calendar,    text: `Tự đăng lúc ${p.scheduledAt}` },
    review:     { icon: CheckCircle2,text: `Chờ ${p.reviewer} duyệt` },
    draft:      { icon: PenLine,     text: "Bản nháp — chưa hoàn thiện" },
    failed:     { icon: AlertCircle, text: p.error || "Đăng thất bại" },
    publishing: { icon: Send,        text: "Đang đăng lên các kênh…" },
  }[p.status] || { icon: Clock, text: s.label };
  const Icon = info.icon;

  return (
    <>
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
           style={{ backgroundColor: s.bg, color: s.ink }}>
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-[12px] font-bold truncate">{info.text}</span>
      </div>
      <SeoBar score={p.seo} className="mt-3" />
    </>
  );
}

/** Điểm SEO dạng thanh — nhìn phát biết bài nào cần tối ưu */
function SeoBar({ score, className = "" }) {
  const t = scoreTone(score);
  const g = [t.from, t.to];
  const ink = t.ink;
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="text-[10px] font-extrabold uppercase tracking-wider shrink-0" style={{ color: "var(--fg-subtle)" }}>
        SEO
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: `linear-gradient(90deg,${g[0]},${g[1]})` }} />
      </div>
      <span className="text-[12px] font-extrabold tabular-nums shrink-0" style={{ color: ink }}>{score}</span>
    </div>
  );
}

/* ═══════════════ HÀNG BẢNG ═══════════════ */
function PostRow({ p, avg, cat, onOpen }) {
  const v = parseNum(p.views);
  const ratio = avg > 0 ? v / avg : 0;
  const live = p.status === "published";

  return (
    <tr className="border-t transition hover:bg-ink-50" style={{ borderColor: "var(--border-soft)" }}>
      <td className="px-5 py-3.5 max-w-[340px]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: "var(--surface-3)" }}>
            {p.cover && <img src={p.cover} alt="" loading="lazy" className="w-full h-full object-cover" />}
          </div>
          <div className="min-w-0">
            <div className="font-bold truncate flex items-center gap-1.5" style={{ color: "var(--fg)" }}>
              {p.featured && <Star className="w-3 h-3 shrink-0" fill="#f59e0b" color="#f59e0b" />}
              {p.title}
            </div>
            <div className="text-[11px] truncate mt-0.5" style={{ color: "var(--fg-subtle)" }}>
              {p.author} · {p.date} · {p.postType}
            </div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5"><CatPill cat={p.category} c={cat} /></td>
      <td className="px-5 py-3.5">
        <StatusTag s={p.status} />
        {!live && (
          <div className="text-[11px] mt-1 truncate max-w-[180px]" style={{ color: "var(--fg-subtle)" }}>
            {p.status === "scheduled" ? p.scheduledAt
              : p.status === "review" ? p.reviewer
              : p.status === "failed" ? p.error : ""}
          </div>
        )}
      </td>
      <td className="px-5 py-3.5 w-[140px]"><SeoBar score={p.seo} /></td>
      <td className="px-5 py-3.5 text-right">
        <div className="font-extrabold tabular-nums" style={{ color: "var(--fg)" }}>{p.views}</div>
        {live && (
          <div className="text-[11px] font-bold tabular-nums" style={{ color: ratio >= 1 ? TONE.success.ink : TONE.warning.ink }}>
            {ratio.toFixed(1)}× TB
          </div>
        )}
      </td>
      <td className="px-5 py-3.5 text-right tabular-nums" style={{ color: "var(--fg-muted)" }}>
        {live ? `${p.likes} · ${p.shares}` : "—"}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <IconBtn onClick={onOpen} title="Xem chi tiết" tone="brand"><Eye className="w-4 h-4" /></IconBtn>
          <IconBtn title="Sửa"><Edit2 className="w-4 h-4" /></IconBtn>
        </div>
      </td>
    </tr>
  );
}

/* ═══════════════ DRAWER CHI TIẾT ═══════════════ */
function PostDrawer({ post, avg, cat, brand, onClose }) {
  const BRAND = brand;
  const v = parseNum(post.views);
  const ratio = avg > 0 ? v / avg : 0;
  const live = post.status === "published";

  return (
    <div className="fixed inset-0 z-50 flex justify-end"
         style={{ backgroundColor: "rgba(15,18,24,.55)", backdropFilter: "blur(6px)" }}
         onClick={onClose}>
      <div className="w-full max-w-xl h-full overflow-y-auto"
           style={{ backgroundColor: "var(--surface)" }}
           onClick={(e) => e.stopPropagation()}>

        <div className="sticky top-0 z-10 px-5 py-4 border-b flex items-center justify-between gap-3"
             style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-soft)" }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                 style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-extrabold text-[15px] truncate" style={{ color: "var(--fg)" }}>
                {post.title}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "var(--fg-muted)" }}>
                {post.author} · {post.date} · {post.readTime}
              </div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Đóng"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-ink-100 shrink-0"
                  style={{ color: "var(--fg-muted)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
            {post.cover && <img src={post.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(15,18,24,.7),transparent 60%)" }} />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <CatPill cat={post.category} c={cat} solid />
              <StatusTag s={post.status} solid />
            </div>
          </div>

          {!live && <PendingInfo p={post} />}

          {live && (
            <>
              <div className="grid grid-cols-4 gap-2.5">
                <MiniStat icon={Eye} label="Lượt xem" value={post.views} from="#6366f1" to="#8b5cf6" />
                <MiniStat icon={Heart} label="Thích" value={post.likes} from="#f43f5e" to="#ec4899" />
                <MiniStat icon={Share2} label="Chia sẻ" value={post.shares} from="#0ea5e9" to="#3b82f6" />
                <MiniStat icon={MessageSquare} label="Bình luận" value={post.comments} from="#10b981" to="#14b8a6" />
              </div>

              <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--surface-2)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10.5px] uppercase tracking-wider font-extrabold" style={{ color: "var(--fg-subtle)" }}>
                    Lượt xem 14 ngày
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-extrabold tabular-nums"
                        style={ratio >= 1 ? { backgroundColor: TONE.success.bg, color: TONE.success.ink } : { backgroundColor: TONE.warning.bg, color: TONE.warning.ink }}>
                    {ratio.toFixed(1)}× trung bình
                  </span>
                </div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={post.chart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gPost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.55} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 6" stroke="var(--border-soft)" vertical={false} />
                      <XAxis dataKey="d" stroke="var(--fg-subtle)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--fg-subtle)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "#0f1218", border: "none", borderRadius: 12, fontSize: 12, color: "#fff", padding: "10px 14px" }} />
                      <Area type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gPost)" name="Lượt xem" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* SEO */}
          <div>
            <Label>Phân tích SEO</Label>
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: "var(--surface-2)" }}>
              <SeoBar score={post.seo} />
              <SeoBar score={post.readability} />
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <MiniStat label="Mật độ từ khóa" value={`${post.kw}%`} from="#8b5cf6" to="#a855f7" compact />
                <MiniStat label="Backlinks" value={post.backlinks} from="#10b981" to="#14b8a6" compact />
              </div>
              <div className="pt-1">
                <div className="text-[10.5px] uppercase font-extrabold tracking-wider mb-2" style={{ color: "var(--fg-subtle)" }}>
                  Từ khóa chính
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {post.mainKeywords.map((k) => (
                    <span key={k} className="px-2.5 h-6 inline-flex items-center rounded-full text-[11px] font-bold"
                          style={{ backgroundColor: "#f1ecfe", color: "#6d28d9" }}>{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Thẻ</Label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {post.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-0.5 px-2.5 h-7 rounded-full text-[12px] font-bold"
                      style={{ backgroundColor: "var(--surface-2)", color: "var(--fg-muted)" }}>
                  <Hash className="w-3 h-3" />{t}
                </span>
              ))}
            </div>
          </div>

          {/* Hành động */}
          <div className="flex items-center gap-2.5 pt-2">
            <button className="flex-1 h-11 rounded-full text-white text-[13px] font-bold inline-flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
              <Edit2 className="w-4 h-4" /> Chỉnh sửa
            </button>
            <button className="h-11 px-4 rounded-full border text-[13px] font-bold inline-flex items-center gap-2"
                    style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>
              <Share2 className="w-4 h-4" /> Chia sẻ
            </button>
            <button aria-label="Xóa bài viết" title="Xóa bài viết"
                    className="w-11 h-11 rounded-full border inline-flex items-center justify-center"
                    style={{ borderColor: "#fecdd3", color: "#be123c" }}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ THÀNH PHẦN NHỎ ═══════════════ */

function MiniStat({ icon: Icon, label, value, from, to, compact }) {
  return (
    <div className="rounded-xl p-3 min-w-0" style={{ backgroundColor: compact ? "var(--surface)" : "var(--surface-2)" }}>
      {Icon && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white mb-2"
             style={{ background: `linear-gradient(135deg,${from},${to})` }}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      )}
      <div className="font-display font-extrabold text-[16px] tabular-nums leading-none truncate" style={{ color: "var(--fg)" }}>
        {value}
      </div>
      <div className="text-[9.5px] uppercase tracking-wider font-extrabold mt-1 truncate" style={{ color: "var(--fg-subtle)" }}>
        {label}
      </div>
    </div>
  );
}

function StatusTag({ s, solid }) {
  const c = STATUS[s] || STATUS.draft;
  if (solid) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[10.5px] font-extrabold text-white whitespace-nowrap"
            style={{ background: `linear-gradient(135deg,${c.from},${c.to})` }}>
        {c.label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[11px] font-extrabold whitespace-nowrap"
          style={{ backgroundColor: c.bg, color: c.ink }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {c.label}
    </span>
  );
}

function CatPill({ cat, c, solid }) {
  const t = c?.[cat] || c?.[CAT_KEYS[0]] || { soft: "#f1ecfe", ink: "#6d28d9" };
  return (
    <span className="inline-flex items-center px-2.5 h-6 rounded-full text-[11px] font-extrabold whitespace-nowrap"
          style={solid ? { backgroundColor: "#fff", color: t.ink } : { backgroundColor: t.soft, color: t.ink }}>
      {cat}
    </span>
  );
}

function FilterChip({ active, onClick, label, count, from, to }) {
  return (
    <button onClick={onClick}
            className="shrink-0 inline-flex items-center gap-2 h-9 pl-3.5 pr-2.5 rounded-full text-[12.5px] font-bold border transition-all duration-200"
            style={active
              ? { background: `linear-gradient(135deg,${from},${to})`, color: "#fff", borderColor: "transparent",
                  boxShadow: `0 8px 18px -8px ${from}` }
              : { backgroundColor: "var(--surface)", color: "var(--fg-muted)", borderColor: "var(--border)" }}>
      {!active && <span className="w-2 h-2 rounded-full" style={{ background: `linear-gradient(135deg,${from},${to})` }} />}
      {label}
      <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-full tabular-nums"
            style={active ? { backgroundColor: "rgba(255,255,255,.25)", color: "#fff" }
                          : { backgroundColor: "var(--surface-3)", color: "var(--fg-muted)" }}>
        {count}
      </span>
    </button>
  );
}

function Segmented({ options, value, onChange, gradient }) {
  const { brand: BRAND } = usePalette();
  return (
    <div className="inline-flex items-center gap-1 h-11 p-1 rounded-full shrink-0"
         style={{ backgroundColor: "var(--surface-2)" }}>
      {options.map((o) => {
        const on = value === o.key;
        return (
          <button key={o.key} onClick={() => onChange(o.key)}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-bold transition-all duration-200"
                  style={on
                    ? gradient
                      ? { background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})`, color: "#fff",
                          boxShadow: "0 6px 14px -6px rgba(139,92,246,.7)" }
                      : { backgroundColor: "var(--surface)", color: "var(--fg)" }
                    : { color: "var(--fg-muted)" }}>
            {o.icon && <o.icon className="w-3.5 h-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function GhostBtn({ icon: Icon, children }) {
  return (
    <button className="inline-flex items-center gap-2 h-11 px-4 rounded-full text-[13px] font-bold border transition hover:border-violet-300"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}>
      <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{children}</span>
    </button>
  );
}

function IconBtn({ children, onClick, title, tone }) {
  return (
    <button onClick={onClick} title={title} aria-label={title}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-ink-100"
            style={{ color: tone === "brand" ? "#7c3aed" : "var(--fg-subtle)" }}>
      {children}
    </button>
  );
}

function Label({ children }) {
  return (
    <div className="text-[10.5px] uppercase tracking-wider font-extrabold mb-2.5" style={{ color: "var(--fg-subtle)" }}>
      {children}
    </div>
  );
}

function EmptyState({ onClear }) {
  const { brand: BRAND } = usePalette();
  return (
    <div className="rounded-[var(--r)] border py-20 text-center"
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="floaty w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white mb-4"
           style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
        <Search className="w-7 h-7" />
      </div>
      <div className="text-[16px] font-bold" style={{ color: "var(--fg)" }}>Không tìm thấy bài viết nào</div>
      <div className="text-[13px] mt-1" style={{ color: "var(--fg-muted)" }}>
        Thử đổi từ khóa hoặc bỏ bớt bộ lọc nhé.
      </div>
      <button onClick={onClear} className="mt-5 h-10 px-5 rounded-full text-[13px] font-bold text-white"
              style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
        Xóa tất cả bộ lọc
      </button>
    </div>
  );
}

/* ═══════════════ DỮ LIỆU ═══════════════ */
function buildData() {
  // KPI đổi trọng tâm: bỏ "Tags" và "SEO TB" (không dẫn tới hành động nào),
  // thêm "Cần xử lý" — con số duy nhất khiến người dùng phải làm gì đó.
  const kpi = [
    { label: "Tổng bài viết", value: 168,   trend: 4.2,  icon: FileText,     from: "#6366f1", to: "#8b5cf6", foot: "Toàn hệ thống" },
    { label: "Đã đăng",       value: 142,   trend: 12.4, icon: CheckCircle2, from: "#10b981", to: "#14b8a6", foot: "85% tổng số" },
    { label: "Cần xử lý",     value: 12,    tone: "alert", icon: AlertCircle, from: "#f59e0b", to: "#f97316", foot: "Duyệt · nháp · lỗi" },
    { label: "Lượt xem TB",   value: "2.4K", trend: 18.6, icon: Eye,          from: "#0ea5e9", to: "#3b82f6", foot: "Mỗi bài đã đăng" },
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

  const T = (i, arr) => arr[i];

  const posts = Array.from({ length: 12 }, (_, i) => ({
    id: `p${i}`,
    title: T(i, [
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
    ]),
    excerpt: T(i, [
      "Khám phá những góc sống ảo đẹp nhất tại đảo ngọc cùng Le Palmier Phú Quốc trong mùa hè này.",
      "Hướng dẫn chi tiết từ A-Z cho kỳ nghỉ gia đình hoàn hảo, từ chọn phòng đến hoạt động.",
      "Câu chuyện về những đôi tay vàng làm nên ẩm thực đẳng cấp tại hệ thống Le Palmier.",
      "Đêm nhạc acoustic lãng mạn bên hồ bơi vô cực với ban nhạc The Fingers.",
      "Đặt phòng sớm để nhận ưu đãi hấp dẫn lên đến 30% phòng Deluxe tháng 8.",
      "Chia sẻ từ gia đình anh Tuấn sau 3 ngày tuyệt vời tại LP2 Đà Lạt.",
      "Trải nghiệm làm bánh croissants và macarons cùng đầu bếp người Pháp tại LP1.",
      "5 mẹo nhỏ giúp bạn đặt được phòng đẹp trong mùa cao điểm.",
      "Đà Lạt mùa thu — se lạnh vừa phải, hoa dã quỳ nở rộ, ít đông đúc.",
      "Lớp yoga miễn phí mỗi sáng từ 6h-7h tại bãi biển riêng LP3.",
      "Lịch trình chi tiết 4 ngày 3 đêm cho gia đình 4 người tại LP3.",
      "Khám phá công việc thầm lặng của đội ngũ housekeeping đẳng cấp 5 sao.",
    ]),
    category: T(i, ["Trải nghiệm","Cẩm nang","Câu chuyện","Sự kiện","Khuyến mãi","Đánh giá","Sự kiện","Cẩm nang","Trải nghiệm","Sự kiện","Cẩm nang","Câu chuyện"]),
    author: T(i, ["Nguyễn Minh K.","Trần Hồng N.","Lê Quốc C.","Event Team","Marketing Team","CSKH Team","Event Team","Nguyễn Minh K.","Trần Hồng N.","Event Team","Trần Hồng N.","Lê Quốc C."]),
    date: T(i, ["28/07/2026","27/07/2026","27/07/2026","26/07/2026","28/07/2026","26/07/2026","25/07/2026","24/07/2026","23/07/2026","22/07/2026","21/07/2026","20/07/2026"]),
    readTime: T(i, ["5 phút","8 phút","6 phút","3 phút","2 phút","4 phút","4 phút","5 phút","6 phút","2 phút","7 phút","5 phút"]),
    status: T(i, ["published","published","scheduled","review","publishing","published","published","published","scheduled","draft","published","failed"]),
    postType: T(i, ["Carousel","Bài viết","Video","Bài viết","Carousel","Bài viết","Reel","Bài viết","Bài viết","Bài viết","Bài viết","Video"]),
    // Thông tin cho bài chưa đăng — thay cho 4 dấu "—" của bản cũ
    scheduledAt: T(i, ["—","—","29/07 · 14:00","—","—","—","—","—","30/07 · 09:00","—","—","—"]),
    reviewer: T(i, ["—","—","—","Nguyễn Minh K.","—","—","—","—","—","—","—","—"]),
    error: T(i, ["","","","","","","","","","","","Ảnh bìa vượt 5MB — cần nén lại"]),
    tags: T(i, [
      ["phu-quoc","summer","check-in"], ["family","kids","tips"], ["chef","fnb","behind"],
      ["event","acoustic","weekend"], ["promo","deluxe","sale"], ["review","da-lat","customer"],
      ["workshop","baking","french"], ["tips","booking","peak"], ["da-lat","autumn","travel"],
      ["yoga","wellness","free"], ["phu-quoc","family","itinerary"], ["housekeeping","behind","staff"],
    ]),
    featured: T(i, [true,false,false,true,true,false,false,false,false,false,false,false]),
    views: T(i, ["12.4K","5.8K","—","—","8.2K","6.2K","4.8K","9.4K","—","—","11.2K","—"]),
    likes: T(i, ["1.2K","640","—","—","820","720","480","980","—","—","1.1K","—"]),
    shares: T(i, ["324","186","—","—","248","192","124","268","—","—","312","—"]),
    comments: T(i, ["86","42","—","—","64","58","32","72","—","—","94","—"]),
    seo: T(i, [94, 88, 82, 76, 92, 84, 78, 86, 80, 70, 90, 72]),
    readability: T(i, [88, 84, 90, 92, 86, 80, 84, 88, 82, 76, 86, 80]),
    kw: T(i, [2.4, 1.8, 2.1, 1.2, 3.2, 1.6, 1.4, 2.6, 1.8, 1.0, 2.2, 1.8]),
    backlinks: T(i, [14, 8, 6, 4, 12, 9, 3, 7, 5, 1, 11, 2]),
    mainKeywords: T(i, [
      ["phú quốc","check-in","mùa hè"], ["resort gia đình","trẻ nhỏ"], ["đầu bếp","le palmier"],
      ["acoustic","hồ bơi"], ["ưu đãi","deluxe"], ["review","đà lạt"],
      ["workshop","bánh"], ["đặt phòng","mẹo"], ["đà lạt","mùa thu"],
      ["yoga","biển"], ["phú quốc","4n3đ"], ["housekeeping","5 sao"],
    ]),
    chart: Array.from({ length: 14 }, (_, d) => ({ d: `${d + 1}/7`, v: Math.round(800 + Math.sin(d / 2) * 400 + (d > 9 ? 600 : 0)) })),
    cover: covers[i % covers.length],
  }));

  return { kpi, posts };
}
