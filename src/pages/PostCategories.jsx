import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import { Icons } from "../components/Icons";

const {
  FolderTree, Plus, Edit2, Trash2, Search, MoreHorizontal, ChevronRight,
  FileText, Hash, Eye, Star, Calendar, Layers, Filter, Download,
  ChevronDown, ImageIcon, Newspaper, Sparkles,
} = Icons;

export default function PostCategories() {
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState("all");
  const data = useMemo(() => buildData(), []);

  const toggle = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="max-w-[1320px] mx-auto pb-12 px-3 sm:px-4 lg:px-6">
      <PageHeader
        title="Quản lý danh mục bài viết"
        subtitle={`${data.tree.length} danh mục gốc · ${data.totalPosts} bài viết trong hệ thống`}
        actions={
          <>
            <button className="btn-outline"><Filter className="w-4 h-4" /> Lọc</button>
            <button className="btn-outline"><Download className="w-4 h-4" /> Xuất</button>
            <button className="btn-primary"><Plus className="w-4 h-4" /> Tạo danh mục</button>
          </>
        }
      />

      {/* Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
        {data.stats.map((s, i) => (
          <div key={i} className="bg-white border border-ink-200 rounded-md p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-ink-500 font-bold">
              <s.icon className="w-4 h-4 text-violet-700" />
              {s.label}
            </div>
            <div className="text-[18px] sm:text-[20px] font-display font-bold text-ink-900 tabular-nums mt-1.5">{s.value}</div>
            <div className="text-[10px] text-ink-500 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Tree */}
        <div className="lg:col-span-2 bg-white border border-ink-200 rounded-md overflow-hidden min-w-0">
          <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-ink-100">
            <div className="flex items-center gap-2 min-w-0">
              <FolderTree className="w-4 h-4 text-violet-700 shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-[13px] text-ink-900 truncate">Cây danh mục</div>
                <div className="text-[11px] text-ink-500 hidden sm:block">Nhấn để mở rộng / chỉnh sửa</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="px-2 sm:px-2.5 py-1.5 rounded-md bg-ink-100 text-ink-700 text-[11px] font-semibold flex items-center gap-1.5 hover:bg-ink-200">
                <Layers className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sắp xếp lại</span>
              </button>
              <button className="px-2 sm:px-2.5 py-1.5 rounded-md bg-violet-700 text-white text-[11px] font-bold flex items-center gap-1.5 hover:bg-violet-800">
                <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Thêm</span>
              </button>
            </div>
          </div>
          <div className="p-2 sm:p-3 overflow-x-hidden">
            {data.tree.map((cat) => (
              <CategoryNode
                key={cat.id}
                cat={cat}
                depth={0}
                expanded={expanded}
                toggle={toggle}
              />
            ))}
          </div>
        </div>

        {/* Side: hot tags + popular */}
        <div className="space-y-3 sm:space-y-4 min-w-0">
          <div className="bg-white border border-ink-200 rounded-md p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <Hash className="w-4 h-4 text-violet-700 shrink-0" />
                <div className="font-semibold text-[13px] text-ink-900 truncate">Tags phổ biến</div>
              </div>
              <button className="text-[10px] font-bold text-violet-700 hover:underline shrink-0">Quản lý</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.tags.map((t) => (
                <span key={t.name}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-semibold ${
                    t.hot ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-ink-50 text-ink-700 border-ink-200"
                  }`}
                  title={`${t.count} bài`}
                >
                  <Hash className="w-2.5 h-2.5" />
                  {t.name}
                  <span className="text-[9px] text-ink-400 tabular-nums">{t.count}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-ink-200 rounded-md p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-700" />
              <div className="font-semibold text-[13px] text-ink-900">Danh mục nổi bật</div>
            </div>
            <div className="space-y-2">
              {data.popular.map((p) => (
                <div key={p.id} className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-md hover:bg-violet-50/40 transition">
                  <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: p.color + "20", color: p.color }}>
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 text-[12.5px] truncate">{p.name}</div>
                    <div className="text-[10px] text-ink-500">{p.posts} bài · {p.views}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-ink-200 rounded-md p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-700" />
              <div className="font-semibold text-[13px] text-ink-900">Tip SEO</div>
            </div>
            <div className="text-[11.5px] text-ink-700 leading-relaxed">
              Mỗi danh mục nên có <b className="text-violet-700">mô tả SEO</b> 120-160 ký tự và <b className="text-violet-700">ảnh bìa</b> tỉ lệ 16:9 để Google hiển thị đẹp trên kết quả tìm kiếm.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryNode({ cat, depth, expanded, toggle }) {
  const open = expanded[cat.id];
  const hasChildren = cat.children?.length > 0;
  return (
    <div className="rounded-md hover:bg-violet-50/30 transition group">
      <div className="flex items-center gap-2 px-2 py-2.5">
        <button
          onClick={() => toggle(cat.id)}
          className={`w-5 h-5 rounded flex items-center justify-center text-ink-400 hover:bg-ink-100 transition ${hasChildren ? "" : "invisible"}`}
        >
          <ChevronRight className={`w-3.5 h-3.5 transition ${open ? "rotate-90" : ""}`} />
        </button>
        <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: cat.color + "20", color: cat.color }}>
          <cat.icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-ink-900 text-[13px] truncate">{cat.name}</span>
            <span className="text-[10px] text-ink-400 font-mono">/{cat.slug}</span>
            {cat.featured && <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">⭐ NỔI BẬT</span>}
          </div>
          <div className="text-[10px] text-ink-500 mt-0.5 truncate">
            {cat.posts} bài · {cat.views} lượt xem · Cập nhật {cat.updated}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-ink-500 font-bold">SEO</div>
            <div className="text-[12px] font-bold text-ink-900 tabular-nums">{cat.seo}/100</div>
          </div>
          <div className="w-16 h-1.5 bg-ink-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${cat.seo}%`, background: cat.seo > 80 ? "#10b981" : cat.seo > 60 ? "#f59e0b" : "#f43f5e" }} />
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button title="Chỉnh sửa" className="w-7 h-7 rounded-md text-ink-500 hover:bg-violet-100 hover:text-violet-700 flex items-center justify-center transition">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button title="Xóa" className="w-7 h-7 rounded-md text-ink-500 hover:bg-rose-100 hover:text-rose-700 flex items-center justify-center transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {open && hasChildren && (
        <div className="ml-5 pl-3 border-l-2 border-violet-100 space-y-0.5 mb-1">
          {cat.children.map((c) => (
            <CategoryNode key={c.id} cat={c} depth={depth + 1} expanded={expanded} toggle={toggle} />
          ))}
        </div>
      )}
    </div>
  );
}

function buildData() {
  const mk = (id, name, slug, posts, opts = {}) => ({
    id, name, slug, posts,
    views: opts.views || `${(posts * (opts.viewMult || 800)).toLocaleString()}`,
    updated: opts.updated || "2 giờ trước",
    seo: opts.seo || 78,
    color: opts.color || "#8b5cf6",
    icon: opts.icon || Newspaper,
    featured: opts.featured || false,
    children: opts.children || [],
  });

  const tree = [
    mk("c1", "Khuyến mãi & Ưu đãi", "khuyen-mai", 42, {
      color: "#f43f5e", icon: Sparkles, featured: true, seo: 92, viewMult: 1200,
      children: [
        mk("c1-1", "Flash sale",          "flash-sale",        14, { color: "#f43f5e", seo: 88 }),
        mk("c1-2", "Mùa cao điểm",        "mua-cao-diem",      18, { color: "#fb7185", seo: 86 }),
        mk("c1-3", "Đặt sớm",            "dat-som",            10, { color: "#fda4af", seo: 82 }),
      ],
    }),
    mk("c2", "Trải nghiệm & Khám phá", "trai-nghiem", 38, {
      color: "#10b981", icon: Sparkles, seo: 88, viewMult: 1100,
      children: [
        mk("c2-1", "Ẩm thực",             "am-thuc",            16, { color: "#10b981", seo: 86 }),
        mk("c2-2", "Hoạt động ngoài trời","hoat-dong",          12, { color: "#059669", seo: 84 }),
        mk("c2-3", "Văn hóa địa phương",  "van-hoa",            10, { color: "#34d399", seo: 80 }),
      ],
    }),
    mk("c3", "Cẩm nang du lịch", "cam-nang", 26, {
      color: "#0ea5e9", icon: FileText, seo: 94, viewMult: 1500,
      children: [
        mk("c3-1", "Mẹo đặt phòng",        "meo-dat-phong",       8, { color: "#0ea5e9", seo: 92 }),
        mk("c3-2", "Lịch trình tham quan", "lich-trinh",         10, { color: "#38bdf8", seo: 88 }),
        mk("c3-3", "Visa & Giấy tờ",      "visa-giay-to",         8, { color: "#7dd3fc", seo: 90 }),
      ],
    }),
    mk("c4", "Câu chuyện Le Palmier", "cau-chuyen", 18, {
      color: "#f59e0b", icon: Star, featured: true, seo: 84, viewMult: 900,
      children: [
        mk("c4-1", "Behind the scenes",   "behind-the-scenes",    8, { color: "#f59e0b", seo: 82 }),
        mk("c4-2", "Nhân vật truyền cảm", "nhan-vat",            6, { color: "#fbbf24", seo: 78 }),
        mk("c4-3", "Cộng đồng",           "cong-dong",            4, { color: "#fcd34d", seo: 80 }),
      ],
    }),
    mk("c5", "Đánh giá khách hàng", "danh-gia", 22, {
      color: "#8b5cf6", icon: Star, seo: 80, viewMult: 700,
      children: [
        mk("c5-1", "Review phòng",         "review-phong",       12, { color: "#8b5cf6", seo: 78 }),
        mk("c5-2", "Review dịch vụ",       "review-dich-vu",      6, { color: "#a78bfa", seo: 76 }),
        mk("c5-3", "Video testimonial",    "video-testimonial",    4, { color: "#c4b5fd", seo: 82 }),
      ],
    }),
    mk("c6", "Sự kiện & Workshop", "su-kien", 14, {
      color: "#f43f5e", icon: Sparkles, seo: 76, viewMult: 600,
      children: [
        mk("c6-1", "Workshop ẩm thực",     "workshop-am-thuc",     6, { color: "#f43f5e", seo: 80 }),
        mk("c6-2", "Yoga & Wellness",      "yoga-wellness",        5, { color: "#fb7185", seo: 72 }),
        mk("c6-3", "Team building",        "team-building",        3, { color: "#fda4af", seo: 74 }),
      ],
    }),
    mk("c7", "Hướng dẫn sử dụng", "huong-dan", 8, {
      color: "#64748b", icon: FileText, seo: 70, viewMult: 400,
      children: [],
    }),
  ];

  const stats = [
    { label: "Danh mục gốc", value: 7,  sub: "Tổng cộng", icon: FolderTree },
    { label: "Danh mục con", value: 21, sub: "Trong 7 cây", icon: Layers },
    { label: "Bài viết",     value: 168,sub: "Đang active", icon: FileText },
    { label: "Tags",         value: 64, sub: "Trên blog",   icon: Hash },
  ];

  const tags = [
    { name: "phu-quoc",     count: 28, hot: true },
    { name: "da-lat",       count: 22, hot: true },
    { name: "nha-trang",    count: 18, hot: true },
    { name: "summer-sale",  count: 14, hot: true },
    { name: "family",       count: 12, hot: false },
    { name: "promo",        count: 12, hot: false },
    { name: "review",       count: 10, hot: false },
    { name: "beach",        count: 10, hot: false },
    { name: "fnb",          count: 9,  hot: false },
    { name: "behind",       count: 8,  hot: false },
    { name: "workshop",     count: 6,  hot: false },
    { name: "wedding",      count: 6,  hot: false },
    { name: "wellness",     count: 5,  hot: false },
    { name: "acoustic",     count: 5,  hot: false },
    { name: "luxury",       count: 4,  hot: false },
    { name: "voucher",      count: 4,  hot: false },
  ];

  const popular = [
    { id: "c1", name: "Khuyến mãi & Ưu đãi",   posts: 42, views: "50.4K", color: "#f43f5e" },
    { id: "c3", name: "Cẩm nang du lịch",      posts: 26, views: "39.0K", color: "#0ea5e9" },
    { id: "c2", name: "Trải nghiệm & Khám phá", posts: 38, views: "41.8K", color: "#10b981" },
    { id: "c4", name: "Câu chuyện Le Palmier", posts: 18, views: "16.2K", color: "#f59e0b" },
    { id: "c5", name: "Đánh giá khách hàng",   posts: 22, views: "15.4K", color: "#8b5cf6" },
  ];

  return { tree, stats, tags, popular, totalPosts: 168 };
}