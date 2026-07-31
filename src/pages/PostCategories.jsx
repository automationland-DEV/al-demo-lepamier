import { useMemo, useState } from "react";
import { Modal } from "../components/DashboardPrimitives";
import { Icons } from "../components/Icons";
import { usePalette, scoreTone, TONE } from "../theme/palette";

const {
  FolderTree, Layers, FileText, Hash, Star, Sparkles, ChevronRight,
  Edit2, Trash2, Plus, Search, Download, Filter, Newspaper, AlertCircle,
  ChevronsUpDown, X, Eye, ArrowUpDown, PenLine,
} = Icons;

/* Mau thuong hieu + mau danh muc lay tu usePalette() trong component */
const TONE_KEYS = ["rose","emerald","sky","amber","violet","fuchsia","slate"];

export default function PostCategories() {
  const { brand: BRAND, series, seriesMap } = usePalette();
  const PALETTE = useMemo(() => seriesMap(TONE_KEYS), [seriesMap]);
  const KPI = useMemo(() => series(4), [series]);
  const data = useMemo(() => buildData(), []);
  const [treeState, setTreeState] = useState(data.tree);
  const [expanded, setExpanded] = useState({ c1: true });
  const [search, setSearch] = useState("");

  const toggle = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const allOpen = treeState.every((c) => !c.children.length || expanded[c.id]);
  const toggleAll = () =>
    setExpanded(allOpen ? {} : Object.fromEntries(treeState.map((c) => [c.id, true])));

  // Lọc: giữ danh mục gốc nếu chính nó hoặc con khớp từ khoá
  const tree = useMemo(() => {
    if (!search) return treeState;
    const q = search.toLowerCase();
    const hit = (c) => c.name.toLowerCase().includes(q) || c.slug.includes(q);
    return treeState
      .map((c) => {
        if (hit(c)) return c;
        const kids = c.children.filter(hit);
        return kids.length ? { ...c, children: kids } : null;
      })
      .filter(Boolean);
  }, [treeState, search]);

  // Modal for creating category
  const [createCatOpen, setCreateCatOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catDraft, setCatDraft] = useState(() => ({ name: "", slug: "", tone: TONE_KEYS[0], icon: "Newspaper", children: [] }));

  const ICON_OPTIONS = [
    "FolderTree", "Layers", "FileText", "Hash",
    "Star", "Sparkles", "Search", "Newspaper",
  ];
  const getIconName = (iconComp) => ICON_OPTIONS.find((name) => Icons[name] === iconComp) || "Newspaper";
  const resetCatDraft = () => ({ name: "", slug: "", tone: TONE_KEYS[0], icon: "Newspaper", children: [] });
  const openEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setCatDraft({
      name: cat.name,
      slug: cat.slug,
      tone: cat.tone,
      icon: getIconName(cat.icon),
      children: cat.children.map((child) => child.name),
    });
    setCreateCatOpen(true);
  };
  const closeCatModal = () => {
    setCreateCatOpen(false);
    setEditingCatId(null);
    setCatDraft(resetCatDraft());
  };

  const addChildInput = () => setCatDraft((d) => ({ ...d, children: [...d.children, ""] }));
  const updateChildInput = (idx, val) => setCatDraft((d) => ({ ...d, children: d.children.map((c, i) => i === idx ? val : c) }));
  const removeChildInput = (idx) => setCatDraft((d) => ({ ...d, children: d.children.filter((_, i) => i !== idx) }));

  const saveCategory = () => {
    if (!catDraft.name.trim()) return;
    const id = editingCatId || `c${Date.now()}`;
    const slug = catDraft.slug.trim() || catDraft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newCat = {
      id,
      name: catDraft.name,
      slug,
      posts: 0,
      views: "0",
      updated: "Mới",
      seo: 80,
      tone: catDraft.tone,
      icon: Icons[catDraft.icon] || Newspaper,
      featured: false,
      children: catDraft.children.filter(Boolean).map((n, i) => ({ id: `${id}-${i}`, name: n, slug: n.toLowerCase().replace(/[^a-z0-9]+/g, "-"), posts: 0, views: "0", seo: 78 })),
    };
    setTreeState((s) => editingCatId ? s.map((c) => c.id === editingCatId ? newCat : c) : [newCat, ...s]);
    closeCatModal();
  };

  const totalPosts = treeState.reduce((n, c) => n + c.posts, 0);
  const maxTag = Math.max(...data.tags.map((t) => t.count));

  // Danh mục cần chú ý: SEO dưới 85, sắp xếp thấp nhất trước
  const needsWork = useMemo(() => {
    const flat = [];
    treeState.forEach((c) => {
      flat.push(c);
      c.children.forEach((k) => flat.push({ ...k, parent: c.name, tone: c.tone }));
    });
    return flat.filter((c) => c.seo < 85).sort((a, b) => a.seo - b.seo).slice(0, 5);
  }, [treeState]);

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
            Danh mục bài viết
          </h1>
          <div className="flex items-center gap-2.5 mt-2.5 text-[13px] flex-wrap" style={{ color: "var(--fg-muted)" }}>
            <span><b className="font-extrabold" style={{ color: "var(--fg)" }}>{treeState.length}</b> danh mục gốc</span>
            <span className="opacity-40">•</span>
            <span><b className="font-extrabold" style={{ color: "var(--fg)" }}>{treeState.reduce((s,c)=>s + c.children.length,0)}</b> danh mục con</span>
            <span className="opacity-40">•</span>
            <span><b className="font-extrabold tabular-nums" style={{ color: "var(--fg)" }}>{totalPosts}</b> bài viết</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <GhostBtn icon={Filter}>Lọc</GhostBtn>
          <GhostBtn icon={Download}>Xuất</GhostBtn>
          <button onClick={() => {
                    setEditingCatId(null);
                    setCatDraft(resetCatDraft());
                    setCreateCatOpen(true);
                  }}
                  className="glowbtn inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})`,
                           boxShadow: "0 8px 20px -8px rgba(139,92,246,.65)" }}>
            <Plus className="w-4 h-4" /> Tạo danh mục
          </button>
        </div>
      </div>

      <Modal open={createCatOpen} onClose={closeCatModal} title={editingCatId ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"} icon={FolderTree} width="max-w-lg"
             footer={
               <>
                 <button onClick={closeCatModal} className="h-10 px-4 rounded-full border text-[13px] font-bold" style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>Hủy</button>
                 <button onClick={saveCategory} className="h-10 px-5 rounded-full text-white text-[13px] font-bold" style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>{editingCatId ? "Lưu" : "Tạo"}</button>
               </>
             }>
        <div className="space-y-3">
          <div>
            <div className="text-[12px] font-bold mb-1" style={{ color: "var(--fg-muted)" }}>Tên danh mục</div>
            <input value={catDraft.name} onChange={(e) => setCatDraft((d) => ({ ...d, name: e.target.value }))}
                   className="w-full h-11 px-3 rounded-md text-[14px] border" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--fg)" }} />
          </div>

          <div>
            <div className="text-[12px] font-bold mb-1" style={{ color: "var(--fg-muted)" }}>Slug (tùy chọn)</div>
            <input value={catDraft.slug} onChange={(e) => setCatDraft((d) => ({ ...d, slug: e.target.value }))}
                   className="w-full h-11 px-3 rounded-md text-[14px] border" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--fg)" }} />
          </div>

          <div>
            <div className="text-[12px] font-bold mb-2" style={{ color: "var(--fg-muted)" }}>Icon danh mục</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                "FolderTree", "Layers", "FileText", "Hash",
                "Star", "Sparkles", "Search", "Newspaper",
              ].map((name) => {
                const Icon = Icons[name];
                const active = catDraft.icon === name;
                return (
                  <button key={name} type="button"
                          onClick={() => setCatDraft((d) => ({ ...d, icon: name }))}
                          className="h-11 rounded-xl border flex items-center justify-center transition"
                          style={{
                            borderColor: active ? "#8b5cf6" : "var(--border)",
                            backgroundColor: active ? "rgba(139,92,246,.08)" : "var(--surface)",
                            color: active ? "#7c3aed" : "var(--fg)",
                          }}>
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[12px] font-bold mb-1" style={{ color: "var(--fg-muted)" }}>Danh mục con</div>
            <div className="space-y-2">
              {catDraft.children.map((ch, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={ch} onChange={(e) => updateChildInput(i, e.target.value)}
                         className="flex-1 h-10 px-3 rounded-md text-[14px] border" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--fg)" }} />
                  <button onClick={() => removeChildInput(i)} className="h-10 w-10 rounded-md text-[14px] border" style={{ borderColor: "var(--border)" }}>×</button>
                </div>
              ))}
              <button onClick={addChildInput} className="inline-flex items-center gap-2 h-10 px-3 rounded-full text-[13px] font-bold border" style={{ borderColor: "var(--border)" }}>+ Thêm danh mục con</button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ═══ KPI ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {data.stats.map((s, i) => <KpiCard key={s.label} k={{ ...s, ...KPI[i] }} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ═══ CÂY DANH MỤC ═══ */}
        <div className="lg:col-span-2 rounded-[var(--r)] border overflow-hidden"
             style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>

          <div className="px-5 py-4 border-b flex items-center gap-3 flex-wrap"
               style={{ borderColor: "var(--border-soft)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                 style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})`,
                          boxShadow: "0 6px 14px -7px rgba(139,92,246,.8)" }}>
              <FolderTree className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display font-extrabold text-[16px]" style={{ color: "var(--fg)" }}>Cây danh mục</div>
              <div className="text-[12px]" style={{ color: "var(--fg-muted)" }}>Nhấn để mở rộng · thanh màu là tỉ trọng bài viết</div>
            </div>
            <button onClick={toggleAll}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-bold border transition hover:border-violet-300"
                    style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>
              <ChevronsUpDown className="w-3.5 h-3.5" /> {allOpen ? "Thu tất cả" : "Mở tất cả"}
            </button>
            <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-bold border transition hover:border-violet-300"
                    style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>
              <ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp
            </button>
          </div>

          {/* Ô tìm */}
          <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border-soft)" }}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-subtle)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                     placeholder="Tìm danh mục hoặc slug…"
                     className="w-full h-10 pl-11 pr-10 rounded-full text-[13px] border-0 outline-none"
                     style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }} />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Xóa"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-subtle)" }}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="p-3">
            {tree.length === 0 ? (
              <div className="py-16 text-center">
                <div className="floaty w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white mb-3"
                     style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
                  <Search className="w-6 h-6" />
                </div>
                <div className="text-[15px] font-bold" style={{ color: "var(--fg)" }}>Không có danh mục nào khớp</div>
                <button onClick={() => setSearch("")}
                        className="mt-4 h-10 px-5 rounded-full text-[13px] font-bold text-white"
                        style={{ background: `linear-gradient(135deg,${BRAND.from},${BRAND.to})` }}>
                  Xóa tìm kiếm
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {tree.map((c) => (
                  <RootNode key={c.id} cat={c} total={totalPosts} c={PALETTE[c.tone]}
                            open={!!expanded[c.id]} onToggle={() => toggle(c.id)}
                            onEdit={() => openEditCategory(c)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══ CỘT PHỤ ═══ */}
        <div className="space-y-4">

          {/* Tags — cỡ chữ theo tần suất */}
          <Panel icon={Hash} title="Tags phổ biến" sub={`${data.tags.length} thẻ đang dùng`}
                 right={<button className="text-[12px] font-bold" style={{ color: "#7c3aed" }}>Quản lý</button>}>
            <div className="flex items-center gap-2 flex-wrap">
              {data.tags.map((t) => {
                const w = t.count / maxTag;
                return (
                  <span key={t.name}
                        className="inline-flex items-center gap-1 rounded-full font-bold whitespace-nowrap transition"
                        style={{
                          fontSize: `${11 + w * 3}px`,
                          padding: `${3 + w * 3}px ${8 + w * 4}px`,
                          backgroundColor: t.hot ? "#f1ecfe" : "var(--surface-2)",
                          color: t.hot ? "#6d28d9" : "var(--fg-muted)",
                        }}>
                    <Hash className="w-2.5 h-2.5 opacity-70" />{t.name}
                    <span className="tabular-nums opacity-60">{t.count}</span>
                  </span>
                );
              })}
            </div>
          </Panel>

          {/* Cần chú ý — thay cho "Danh mục nổi bật" vốn trùng dữ liệu với cây */}
          <Panel icon={AlertCircle} title="Cần tối ưu SEO" sub={`${needsWork.length} danh mục dưới 85 điểm`}
                 tone="warn">
            <div className="space-y-2.5">
              {needsWork.map((c) => {
                const t = scoreTone(c.seo);
                return (
                  <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl transition hover:bg-ink-50">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                         style={{ background: `linear-gradient(135deg,${PALETTE[c.tone].from},${PALETTE[c.tone].to})` }}>
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold truncate" style={{ color: "var(--fg)" }}>{c.name}</div>
                      <div className="text-[11px] truncate" style={{ color: "var(--fg-subtle)" }}>
                        {c.parent ? `trong ${c.parent}` : `${c.posts} bài viết`}
                      </div>
                    </div>
                    <span className="text-[14px] font-display font-extrabold tabular-nums shrink-0" style={{ color: t.ink }}>
                      {c.seo}
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel icon={Sparkles} title="Tip SEO">
            <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              Mỗi danh mục nên có <b style={{ color: "#7c3aed" }}>mô tả SEO</b> 120–160 ký tự và{" "}
              <b style={{ color: "#7c3aed" }}>ảnh bìa</b> tỉ lệ 16:9 để Google hiển thị đẹp trên kết quả tìm kiếm.
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ NÚT GỐC ═══════════════ */
function RootNode({ cat, total, open, onToggle, c, onEdit }) {
  const share = Math.round((cat.posts / total) * 100);
  const t = scoreTone(cat.seo);

  return (
    <div className="rounded-2xl border overflow-hidden transition"
         style={{ borderColor: open ? c.soft : "transparent", backgroundColor: open ? "var(--surface-2)" : "transparent" }}>

      {/* Hàng danh mục gốc */}
      <div className="flex items-center gap-3 p-3 rounded-2xl transition hover:bg-ink-50 group">
        <button onClick={onToggle}
                aria-label={open ? "Thu gọn" : "Mở rộng"}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0 hover:bg-ink-100 ${cat.children.length ? "" : "invisible"}`}
                style={{ color: "var(--fg-subtle)" }}>
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
        </button>

        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
             style={{ background: `linear-gradient(135deg,${c.from},${c.to})`, boxShadow: `0 6px 14px -7px ${c.from}` }}>
          <cat.icon className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-extrabold truncate" style={{ color: "var(--fg)" }}>{cat.name}</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "var(--surface-3)", color: "var(--fg-subtle)" }}>/{cat.slug}</span>
            {cat.featured && (
              <span className="inline-flex items-center gap-1 px-2 h-5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider text-white"
                    style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                <Star className="w-2.5 h-2.5" fill="currentColor" /> Nổi bật
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11.5px]" style={{ color: "var(--fg-muted)" }}>
            <span className="tabular-nums font-bold" style={{ color: "var(--fg)" }}>{cat.posts}</span> bài
            <span className="opacity-40">•</span>
            <span className="inline-flex items-center gap-1 tabular-nums"><Eye className="w-3 h-3" />{cat.views}</span>
            <span className="opacity-40">•</span>
            <span>{cat.children.length} danh mục con</span>
          </div>
        </div>

        {/* Tỉ trọng bài viết — nhìn phát biết danh mục nào đang gánh nội dung */}
        <div className="hidden md:block w-[112px] shrink-0">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider mb-1"
               style={{ color: "var(--fg-subtle)" }}>
            <span>Tỉ trọng</span><span className="tabular-nums">{share}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
            <div className="h-full rounded-full" style={{ width: `${share}%`, background: `linear-gradient(90deg,${c.from},${c.to})` }} />
          </div>
        </div>

        <div className="hidden lg:block w-[112px] shrink-0">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider mb-1"
               style={{ color: "var(--fg-subtle)" }}>
            <span>SEO</span><span className="tabular-nums" style={{ color: t.ink }}>{cat.seo}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
            <div className="h-full rounded-full" style={{ width: `${cat.seo}%`, background: `linear-gradient(90deg,${t.from},${t.to})` }} />
          </div>
        </div>

        <RowActions onEdit={onEdit} />
      </div>

      {/* Danh mục con */}
      {open && cat.children.length > 0 && (
        <div className="pl-[52px] pr-3 pb-3">
          <div className="border-l-2 pl-3 space-y-0.5" style={{ borderColor: c.soft }}>
            {cat.children.map((k) => (
              <ChildNode key={k.id} cat={k} c={c} parentPosts={cat.posts} onEdit={() => openEditCategory({ ...k, children: [] })} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ NÚT CON ═══════════════ */
function ChildNode({ cat, c, parentPosts, onEdit }) {
  const share = Math.round((cat.posts / parentPosts) * 100);
  const t = scoreTone(cat.seo);

  return (
    <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl transition hover:bg-ink-50 group">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
           style={{ backgroundColor: c.soft, color: c.ink }}>
        <FileText className="w-3.5 h-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13.5px] font-bold truncate" style={{ color: "var(--fg)" }}>{cat.name}</span>
          <span className="text-[10.5px] font-mono" style={{ color: "var(--fg-subtle)" }}>/{cat.slug}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[11px]" style={{ color: "var(--fg-muted)" }}>
          <span className="tabular-nums">{cat.posts} bài</span>
          <span className="opacity-40">•</span>
          <span className="tabular-nums">{cat.views} lượt xem</span>
          <span className="opacity-40">•</span>
          <span className="tabular-nums">{share}% danh mục cha</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 w-[112px] shrink-0">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
          <div className="h-full rounded-full" style={{ width: `${cat.seo}%`, background: `linear-gradient(90deg,${t.from},${t.to})` }} />
        </div>
        <span className="text-[11.5px] font-extrabold tabular-nums" style={{ color: t.ink }}>{cat.seo}</span>
      </div>

      <RowActions small onEdit={onEdit} />
    </div>
  );
}

function RowActions({ small, onEdit }) {
  const s = small ? "w-7 h-7" : "w-8 h-8";
  const i = small ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
      <button title="Chỉnh sửa" aria-label="Chỉnh sửa"
              onClick={onEdit}
              className={`${s} rounded-lg flex items-center justify-center transition hover:bg-ink-100`}
              style={{ color: "#7c3aed" }}>
        <Edit2 className={i} />
      </button>
      <button title="Xóa" aria-label="Xóa"
              className={`${s} rounded-lg flex items-center justify-center transition hover:bg-ink-100`}
              style={{ color: "#be123c" }}>
        <Trash2 className={i} />
      </button>
    </div>
  );
}

/* ═══════════════ THÀNH PHẦN CHUNG ═══════════════ */

function KpiCard({ k }) {
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
          <div className="text-[12px] mt-2 truncate" style={{ color: "var(--fg-muted)" }}>{k.sub}</div>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
             style={{ background: `linear-gradient(135deg,${k.from},${k.to})`, boxShadow: `0 8px 18px -8px ${k.from}` }}>
          <k.icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function Panel({ icon: Icon, title, sub, right, tone, children }) {
  const { brand } = usePalette();
  const g = tone === "warn" ? [TONE.warning.from, TONE.warning.to] : [brand.from, brand.to];
  return (
    <div className="rounded-[var(--r)] border overflow-hidden"
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="px-4 py-3.5 border-b flex items-center gap-2.5" style={{ borderColor: "var(--border-soft)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
             style={{ background: `linear-gradient(135deg,${g[0]},${g[1]})` }}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[13.5px] truncate" style={{ color: "var(--fg)" }}>{title}</div>
          {sub && <div className="text-[11px] truncate" style={{ color: "var(--fg-muted)" }}>{sub}</div>}
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
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

/* ═══════════════ DỮ LIỆU ═══════════════ */
function buildData() {
  const mk = (id, name, slug, posts, o = {}) => ({
    id, name, slug, posts,
    views: o.views || (posts * (o.viewMult || 800)).toLocaleString("vi-VN"),
    updated: o.updated || "2 giờ trước",
    seo: o.seo ?? 78,
    tone: o.tone || "violet",
    icon: o.icon || Newspaper,
    featured: o.featured || false,
    children: o.children || [],
  });

  const tree = [
    mk("c1", "Khuyến mãi & Ưu đãi", "khuyen-mai", 42, {
      tone: "rose", icon: Sparkles, featured: true, seo: 92, viewMult: 1200,
      children: [
        mk("c1-1", "Flash sale",     "flash-sale",   14, { seo: 88 }),
        mk("c1-2", "Mùa cao điểm",   "mua-cao-diem", 18, { seo: 86 }),
        mk("c1-3", "Đặt sớm",        "dat-som",      10, { seo: 82 }),
      ],
    }),
    mk("c2", "Trải nghiệm & Khám phá", "trai-nghiem", 38, {
      tone: "emerald", icon: Sparkles, seo: 88, viewMult: 1100,
      children: [
        mk("c2-1", "Ẩm thực",              "am-thuc",   16, { seo: 86 }),
        mk("c2-2", "Hoạt động ngoài trời", "hoat-dong", 12, { seo: 84 }),
        mk("c2-3", "Văn hóa địa phương",   "van-hoa",   10, { seo: 80 }),
      ],
    }),
    mk("c3", "Cẩm nang du lịch", "cam-nang", 26, {
      tone: "sky", icon: FileText, seo: 94, viewMult: 1500,
      children: [
        mk("c3-1", "Mẹo đặt phòng",        "meo-dat-phong",  8, { seo: 92 }),
        mk("c3-2", "Lịch trình tham quan", "lich-trinh",    10, { seo: 88 }),
        mk("c3-3", "Visa & Giấy tờ",       "visa-giay-to",   8, { seo: 90 }),
      ],
    }),
    mk("c4", "Câu chuyện Le Palmier", "cau-chuyen", 18, {
      tone: "amber", icon: Star, featured: true, seo: 84, viewMult: 900,
      children: [
        mk("c4-1", "Behind the scenes",   "behind-the-scenes", 8, { seo: 82 }),
        mk("c4-2", "Nhân vật truyền cảm", "nhan-vat",          6, { seo: 78 }),
        mk("c4-3", "Cộng đồng",           "cong-dong",         4, { seo: 80 }),
      ],
    }),
    mk("c5", "Đánh giá khách hàng", "danh-gia", 22, {
      tone: "violet", icon: Star, seo: 80, viewMult: 700,
      children: [
        mk("c5-1", "Review phòng",      "review-phong",       12, { seo: 78 }),
        mk("c5-2", "Review dịch vụ",    "review-dich-vu",      6, { seo: 76 }),
        mk("c5-3", "Video testimonial", "video-testimonial",   4, { seo: 82 }),
      ],
    }),
    mk("c6", "Sự kiện & Workshop", "su-kien", 14, {
      tone: "fuchsia", icon: Sparkles, seo: 76, viewMult: 600,
      children: [
        mk("c6-1", "Workshop ẩm thực", "workshop-am-thuc", 6, { seo: 80 }),
        mk("c6-2", "Yoga & Wellness",  "yoga-wellness",    5, { seo: 72 }),
        mk("c6-3", "Team building",    "team-building",    3, { seo: 74 }),
      ],
    }),
    mk("c7", "Hướng dẫn sử dụng", "huong-dan", 8, {
      tone: "slate", icon: FileText, seo: 70, viewMult: 400,
    }),
  ];

  const subCount = tree.reduce((n, c) => n + c.children.length, 0);

  const stats = [
    { label: "Danh mục gốc", value: tree.length, sub: "Cấp cao nhất",   icon: FolderTree, from: "#6366f1", to: "#8b5cf6" },
    { label: "Danh mục con", value: subCount,    sub: `Trong ${tree.length} cây`, icon: Layers, from: "#10b981", to: "#14b8a6" },
    { label: "Bài viết",     value: 168,         sub: "Đang hoạt động", icon: FileText,   from: "#0ea5e9", to: "#3b82f6" },
    { label: "Tags",         value: 64,          sub: "Trên blog",      icon: Hash,       from: "#d946ef", to: "#a855f7" },
  ];

  const tags = [
    { name: "phu-quoc", count: 28, hot: true },
    { name: "da-lat", count: 22, hot: true },
    { name: "nha-trang", count: 18, hot: true },
    { name: "summer-sale", count: 14, hot: true },
    { name: "family", count: 12, hot: false },
    { name: "promo", count: 12, hot: false },
    { name: "review", count: 10, hot: false },
    { name: "beach", count: 10, hot: false },
    { name: "fnb", count: 9, hot: false },
    { name: "behind", count: 8, hot: false },
    { name: "workshop", count: 6, hot: false },
    { name: "wedding", count: 6, hot: false },
    { name: "wellness", count: 5, hot: false },
    { name: "acoustic", count: 5, hot: false },
    { name: "luxury", count: 4, hot: false },
    { name: "voucher", count: 4, hot: false },
  ];

  return { tree, subCount, stats, tags };
}
