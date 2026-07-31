import { useMemo, useState, useEffect } from "react";
import { Icons } from "../components/Icons";
import { branches } from "../data/mockData";
import { formatVNDFull, formatVND } from "../utils/format";
import { usePalette, TONE } from "../theme/palette";
import Pagination from "../components/Pagination";

const {
  ConciergeBell, UtensilsCrossed, HeartPulse, Car, PartyPopper, Compass,
  Soup, Flower2, Plane, Shirt, Presentation, Wine, Waves, Map,
  Coffee, ChefHat, GlassWater, Bath, Dumbbell, Bike, Luggage, Music,
  Gift, Camera, Mountain, Ticket, Wifi, Scissors,
  Plus, Search, Filter, X, Edit2, Trash2, Copy, Eye,
  Clock, Users, Star, Wallet, TrendingUp, MapPin, CalendarDays,
  LayoutGrid, List, Check, AlertTriangle, Save, ImagePlus, Power,
  ChevronDown,
} = Icons;

/* ═══════════ Danh mục ═══════════ */
const CATEGORIES = [
  { id: "food",      label: "Ăn uống",     icon: UtensilsCrossed },
  { id: "wellness",  label: "Sức khỏe",    icon: HeartPulse },
  { id: "transport", label: "Di chuyển",   icon: Car },
  { id: "amenity",   label: "Tiện ích",    icon: ConciergeBell },
  { id: "event",     label: "Sự kiện",     icon: PartyPopper },
  { id: "activity",  label: "Trải nghiệm", icon: Compass },
];
const CAT_KEYS = CATEGORIES.map((c) => c.id);
const CAT_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/* ═══════════ Bộ icon cho người dùng chọn khi tạo dịch vụ ═══════════ */
const ICON_SET = {
  Soup, UtensilsCrossed, Coffee, ChefHat, GlassWater, Wine,
  Flower2, HeartPulse, Bath, Dumbbell, Waves,
  Plane, Car, Bike, Luggage,
  Shirt, Wifi, ConciergeBell, Scissors,
  Presentation, PartyPopper, Music, Gift, Ticket,
  Compass, Map, Camera, Mountain,
};

const UNITS = ["người/lượt", "lượt", "chuyến", "kg", "buổi", "lần", "người", "khách", "giờ", "ngày"];

const emptyForm = () => ({
  id: null, name: "", category: "food", icon: "Soup",
  price: "", unit: "lượt", description: "",
  duration: "", capacity: "", hours: "",
  branches: branches.map((b) => b.id), includes: [], cover: "", active: true,
});

export default function Services() {
  const { brand, seriesMap, series } = usePalette();
  const CAT = useMemo(() => seriesMap(CAT_KEYS), [seriesMap]);
  const KPI = useMemo(() => series(4), [series]);

  const [items, setItems] = useState(seedServices);
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const pageSize = view === "grid" ? 8 : 10;

  const [form, setForm] = useState(null);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => setPage(1), [cat, search, view]);

  const notify = (text, tone = "success") => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 3200);
  };

  const list = useMemo(() => items.filter((s) => {
    if (cat !== "all" && s.category !== cat) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q)
          || s.code.toLowerCase().includes(q)
          || s.description.toLowerCase().includes(q);
    }
    return true;
  }), [items, cat, search]);

  const totalPages = Math.ceil(list.length / pageSize);
  const paginated = useMemo(
    () => list.slice((page - 1) * pageSize, page * pageSize),
    [list, page, pageSize]
  );

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((s) => s.active).length,
    revenue: items.reduce((n, s) => n + s.price * s.bookings, 0),
    bookings: items.reduce((n, s) => n + s.bookings, 0),
  }), [items]);

  /* ── Thao tác dữ liệu ── */
  const save = (data) => {
    if (data.id) {
      setItems((arr) => arr.map((s) => (s.id === data.id ? { ...s, ...data } : s)));
      notify(`Đã cập nhật “${data.name}”`);
    } else {
      setItems((arr) => [{
        ...data,
        id: `s${Date.now()}`,
        code: `SVC-${String(arr.length + 1).padStart(3, "0")}`,
        bookings: 0, rating: null,
      }, ...arr]);
      notify(`Đã tạo dịch vụ “${data.name}”`);
    }
    setForm(null);
  };

  const toggleActive = (s) => {
    setItems((arr) => arr.map((x) => (x.id === s.id ? { ...x, active: !x.active } : x)));
    notify(s.active ? `Đã tạm ngưng “${s.name}”` : `Đã bật lại “${s.name}”`, s.active ? "warning" : "success");
  };

  const duplicate = (s) => {
    setItems((arr) => [{
      ...s, id: `s${Date.now()}`, code: `SVC-${String(arr.length + 1).padStart(3, "0")}`,
      name: `${s.name} (bản sao)`, bookings: 0, rating: null,
    }, ...arr]);
    notify(`Đã nhân bản “${s.name}”`);
  };

  const remove = (s) => {
    setItems((arr) => arr.filter((x) => x.id !== s.id));
    setConfirm(null);
    setDetail(null);
    notify(`Đã xóa “${s.name}”`, "danger");
  };

  return (
    <div className="max-w-[1360px] mx-auto pb-10">

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-1 pb-6">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.14em] text-white mb-3"
               style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
            <ConciergeBell className="w-3 h-3" /> Dịch vụ
          </div>
          <h1 className="font-display font-extrabold tracking-[-0.03em] text-[32px] sm:text-[38px] leading-none"
              style={{ color: "var(--fg)" }}>
            Dịch vụ &amp; Tiện ích
          </h1>
          <div className="flex items-center gap-2.5 mt-2.5 text-[13px] flex-wrap" style={{ color: "var(--fg-muted)" }}>
            <span><b className="font-extrabold" style={{ color: "var(--fg)" }}>{stats.total}</b> dịch vụ</span>
            <span className="opacity-40">•</span>
            <span><b className="font-extrabold" style={{ color: "var(--fg)" }}>{stats.active}</b> đang cung cấp</span>
            <span className="opacity-40">•</span>
            <span>{CATEGORIES.length} danh mục · {branches.length} chi nhánh</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <GhostBtn icon={Filter}>Lọc</GhostBtn>
          <button onClick={() => setForm(emptyForm())}
                  className="glowbtn inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})`,
                           boxShadow: `0 8px 20px -8px ${brand.from}a6` }}>
            <Plus className="w-4 h-4" /> Thêm dịch vụ
          </button>
        </div>
      </div>

      {/* ═══ KPI ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard {...KPI[0]} icon={ConciergeBell} label="Tổng dịch vụ" value={stats.total} foot={`${CATEGORIES.length} danh mục`} />
        <KpiCard {...KPI[1]} icon={Power} label="Đang cung cấp" value={stats.active}
                 foot={`${Math.round(stats.active / Math.max(stats.total, 1) * 100)}% tổng số`}
                 progress={Math.round(stats.active / Math.max(stats.total, 1) * 100)} />
        <KpiCard {...KPI[2]} icon={Wallet} label="Doanh thu tháng" value={formatVND(stats.revenue)} foot="Từ dịch vụ kèm theo" trend={8.4} />
        <KpiCard {...KPI[3]} icon={TrendingUp} label="Lượt sử dụng" value={stats.bookings.toLocaleString("vi-VN")} foot="Trong 30 ngày" trend={12.1} />
      </div>

      {/* ═══ CHIP DANH MỤC ═══ */}
      <div className="noscroll flex items-center gap-2.5 overflow-x-auto pb-3 mb-3">
        <CatChip active={cat === "all"} onClick={() => setCat("all")}
                 icon={LayoutGrid} from="#475569" to="#1e293b" label="Tất cả" count={items.length} />
        {CATEGORIES.map((c) => (
          <CatChip key={c.id} active={cat === c.id}
                   onClick={() => setCat(cat === c.id ? "all" : c.id)}
                   icon={c.icon} from={CAT[c.id].from} to={CAT[c.id].to}
                   label={c.label} count={items.filter((s) => s.category === c.id).length} />
        ))}
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div className="rounded-[var(--r)] border p-2.5 mb-5 flex items-center gap-2.5 flex-wrap"
           style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-subtle)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
                 placeholder="Tìm theo tên, mã hoặc mô tả dịch vụ…"
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
          {list.length} dịch vụ
        </span>
        <Segmented value={view} onChange={setView} brand={brand}
                   options={[{ key: "grid", label: "Thẻ", icon: LayoutGrid },
                             { key: "list", label: "Bảng", icon: List }]} />
      </div>

      {/* ═══ NỘI DUNG ═══ */}
      {list.length === 0 ? (
        <EmptyState brand={brand} onClear={() => { setCat("all"); setSearch(""); }} onCreate={() => setForm(emptyForm())} />
      ) : view === "grid" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((s) => (
              <ServiceCard key={s.id} s={s} c={CAT[s.category]}
                           onOpen={() => setDetail(s)} onEdit={() => setForm(toForm(s))}
                           onToggle={() => toggleActive(s)} onDuplicate={() => duplicate(s)}
                           onDelete={() => setConfirm(s)} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage}
                      totalItems={list.length} itemsPerPage={pageSize} />
        </>
      ) : (
        <div className="rounded-[var(--r)] border overflow-hidden"
             style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-[13px]">
              <thead>
                <tr style={{ backgroundColor: "var(--surface-2)" }}>
                  {["Dịch vụ", "Danh mục", "Đơn giá", "Thời lượng", "Chi nhánh", "Lượt dùng", "Trạng thái", ""].map((h, i) => (
                    <th key={i}
                        className={`px-5 py-3.5 text-[10.5px] font-extrabold uppercase tracking-wider ${i === 2 || i === 5 ? "text-right" : "text-left"}`}
                        style={{ color: "var(--fg-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => (
                  <ServiceRow key={s.id} s={s} c={CAT[s.category]}
                              onOpen={() => setDetail(s)} onEdit={() => setForm(toForm(s))}
                              onToggle={() => toggleActive(s)} onDelete={() => setConfirm(s)} />
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

      {/* ═══ LỚP NỔI ═══ */}
      {form && <ServiceForm initial={form} brand={brand} cat={CAT} onClose={() => setForm(null)} onSave={save} />}
      {detail && <ServiceDrawer s={detail} c={CAT[detail.category]} brand={brand}
                                onClose={() => setDetail(null)}
                                onEdit={() => { setForm(toForm(detail)); setDetail(null); }}
                                onToggle={() => { toggleActive(detail); setDetail({ ...detail, active: !detail.active }); }}
                                onDelete={() => setConfirm(detail)} />}
      {confirm && <ConfirmDelete s={confirm} onCancel={() => setConfirm(null)} onConfirm={() => remove(confirm)} />}
      {toast && <Toast {...toast} />}
    </div>
  );
}

/* ═══════════════ THẺ DỊCH VỤ ═══════════════ */
function ServiceCard({ s, c, onOpen, onEdit, onToggle, onDuplicate, onDelete }) {
  const Icon = ICON_SET[s.icon] || ConciergeBell;
  const cat = CAT_BY_ID[s.category];

  return (
    <div className="lift group rounded-[var(--r)] border overflow-hidden flex flex-col"
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)",
                  "--glow": `${c.from}45`, opacity: s.active ? 1 : 0.72 }}>

      <button onClick={onOpen} className="relative aspect-[16/10] overflow-hidden shrink-0 text-left w-full">
        <CoverImage src={s.cover} from={c.from} to={c.to} Icon={Icon} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(15,18,24,.78) 0%,rgba(15,18,24,.1) 55%,transparent 100%)" }} />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[11px] font-extrabold bg-white/95"
                style={{ color: c.ink }}>
            <cat.icon className="w-3.5 h-3.5" /> {cat.label}
          </span>
          {!s.active && (
            <span className="inline-flex items-center px-2.5 h-7 rounded-full text-[10.5px] font-extrabold"
                  style={{ backgroundColor: TONE.neutral.bg, color: TONE.neutral.ink }}>
              Tạm ngưng
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
               style={{ background: `linear-gradient(135deg,${c.from},${c.to})`, boxShadow: `0 6px 14px -7px ${c.from}` }}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 pb-0.5">
            <div className="text-white font-display font-extrabold text-[15px] leading-snug line-clamp-2">{s.name}</div>
            <div className="text-[11px] text-white/70 font-mono">{s.code}</div>
          </div>
        </div>
      </button>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[12.5px] line-clamp-2 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          {s.description}
        </p>

        <div className="flex items-baseline gap-1.5 mt-3">
          <span className="font-display font-extrabold text-[22px] tabular-nums" style={{ color: "var(--fg)" }}>
            {s.price.toLocaleString("vi-VN")}
          </span>
          <span className="text-[12px] font-bold" style={{ color: "var(--fg-muted)" }}>đ / {s.unit}</span>
        </div>

        {/* Danh sách nhãn–giá trị thay cho 3 cột: giá trị như "Tùy quãng đường"
            hay "06:00 – 10:00" quá dài, để 3 cột là bị cắt cụt hết. */}
        <div className="mt-3 p-3 rounded-xl space-y-1.5" style={{ backgroundColor: "var(--surface-2)" }}>
          <Mini icon={Clock} label="Thời lượng" value={s.duration || "Không áp dụng"} />
          <Mini icon={Users} label="Sức chứa" value={s.capacity ? `${s.capacity} khách` : "Không giới hạn"} />
          <Mini icon={MapPin} label="Chi nhánh" value={`${s.branches.length}/${branches.length} khu`} />
        </div>

        <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2"
             style={{ borderColor: "var(--border-soft)" }}>
          <div className="flex items-center gap-3 text-[12px]" style={{ color: "var(--fg-muted)" }}>
            <span className="inline-flex items-center gap-1 tabular-nums"><TrendingUp className="w-3.5 h-3.5" />{s.bookings}</span>
            {s.rating != null && (
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Star className="w-3.5 h-3.5" fill="currentColor" />{s.rating}
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
            <IconBtn onClick={onEdit} title="Chỉnh sửa" tone={c.ink}><Edit2 className="w-4 h-4" /></IconBtn>
            <IconBtn onClick={onToggle} title={s.active ? "Tạm ngưng" : "Bật lại"}><Power className="w-4 h-4" /></IconBtn>
            <IconBtn onClick={onDuplicate} title="Nhân bản"><Copy className="w-4 h-4" /></IconBtn>
            <IconBtn onClick={onDelete} title="Xóa" tone={TONE.danger.ink}><Trash2 className="w-4 h-4" /></IconBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ HÀNG BẢNG ═══════════════ */
function ServiceRow({ s, c, onOpen, onEdit, onToggle, onDelete }) {
  const Icon = ICON_SET[s.icon] || ConciergeBell;
  const cat = CAT_BY_ID[s.category];
  return (
    <tr className="border-t transition hover:bg-ink-50"
        style={{ borderColor: "var(--border-soft)", opacity: s.active ? 1 : 0.66 }}>
      <td className="px-5 py-3.5 max-w-[320px]">
        <button onClick={onOpen} className="flex items-center gap-3 min-w-0 text-left">
          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 relative">
            <CoverImage src={s.cover} from={c.from} to={c.to} Icon={Icon} small />
          </div>
          <div className="min-w-0">
            <div className="font-bold truncate" style={{ color: "var(--fg)" }}>{s.name}</div>
            <div className="text-[11px] font-mono truncate" style={{ color: "var(--fg-subtle)" }}>{s.code}</div>
          </div>
        </button>
      </td>
      <td className="px-5 py-3.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11px] font-extrabold whitespace-nowrap"
              style={{ backgroundColor: c.soft, color: c.ink }}>
          <cat.icon className="w-3 h-3" /> {cat.label}
        </span>
      </td>
      <td className="px-5 py-3.5 text-right">
        <div className="font-extrabold tabular-nums" style={{ color: "var(--fg)" }}>{s.price.toLocaleString("vi-VN")} đ</div>
        <div className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>/ {s.unit}</div>
      </td>
      <td className="px-5 py-3.5" style={{ color: "var(--fg-muted)" }}>{s.duration || "—"}</td>
      <td className="px-5 py-3.5 tabular-nums" style={{ color: "var(--fg-muted)" }}>{s.branches.length}/{branches.length}</td>
      <td className="px-5 py-3.5 text-right tabular-nums font-bold" style={{ color: "var(--fg)" }}>{s.bookings}</td>
      <td className="px-5 py-3.5">
        <button onClick={onToggle}
                className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[11px] font-extrabold transition"
                style={s.active ? { backgroundColor: TONE.success.bg, color: TONE.success.ink }
                                : { backgroundColor: TONE.neutral.bg, color: TONE.neutral.ink }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.active ? TONE.success.dot : TONE.neutral.dot }} />
          {s.active ? "Đang cung cấp" : "Tạm ngưng"}
        </button>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <IconBtn onClick={onOpen} title="Xem chi tiết" tone={c.ink}><Eye className="w-4 h-4" /></IconBtn>
          <IconBtn onClick={onEdit} title="Chỉnh sửa"><Edit2 className="w-4 h-4" /></IconBtn>
          <IconBtn onClick={onDelete} title="Xóa" tone={TONE.danger.ink}><Trash2 className="w-4 h-4" /></IconBtn>
        </div>
      </td>
    </tr>
  );
}

/* ═══════════════ FORM TẠO / SỬA ═══════════════ */
function ServiceForm({ initial, brand, cat, onClose, onSave }) {
  const [f, setF] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [includeInput, setIncludeInput] = useState("");
  const isEdit = !!initial.id;

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const blur = (k) => setTouched((t) => ({ ...t, [k]: true }));

  const errors = {
    name: !f.name.trim() ? "Nhập tên dịch vụ" : null,
    price: f.price === "" || Number(f.price) <= 0 ? "Đơn giá phải lớn hơn 0" : null,
    branches: f.branches.length === 0 ? "Chọn ít nhất một chi nhánh" : null,
  };
  const showErr = (k) => ((touched[k] || submitted) && errors[k]) || null;
  const valid = Object.values(errors).every((e) => !e);

  const submit = () => {
    setSubmitted(true);
    if (!valid) return;
    onSave({ ...f, price: Number(f.price), capacity: f.capacity ? Number(f.capacity) : null });
  };

  const c = cat[f.category];
  const Icon = ICON_SET[f.icon] || ConciergeBell;

  return (
    <Sheet onClose={onClose} wide icon={isEdit ? Edit2 : Plus} brand={brand}
           title={isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
           sub={isEdit ? f.name : "Điền thông tin để tạo dịch vụ kèm theo"}>
      <div className="p-5 space-y-6">

        {/* Xem trước */}
        <div>
          <Label>Xem trước thẻ</Label>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
            <div className="relative aspect-[16/7]">
              <CoverImage src={f.cover} from={c.from} to={c.to} Icon={Icon} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(15,18,24,.78),transparent 65%)" }} />
              <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2.5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                     style={{ background: `linear-gradient(135deg,${c.from},${c.to})` }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-display font-extrabold text-[15px] truncate">
                    {f.name || "Tên dịch vụ"}
                  </div>
                  <div className="text-[11px] text-white/75">
                    {f.price ? `${Number(f.price).toLocaleString("vi-VN")} đ / ${f.unit}` : "Chưa có giá"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Field label="Ảnh bìa" help="Dán link ảnh tỉ lệ 16:9. Bỏ trống sẽ dùng nền gradient + icon.">
          <div className="flex gap-2">
            <input value={f.cover} onChange={(e) => set("cover", e.target.value)} placeholder="https://…"
                   className="flex-1 h-10 px-3.5 rounded-full text-[13px] border-0 outline-none"
                   style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }} />
            <button onClick={() => set("cover", COVER_BY_CAT[f.category])}
                    className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full text-[12.5px] font-bold border shrink-0"
                    style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>
              <ImagePlus className="w-3.5 h-3.5" /> Ảnh gợi ý
            </button>
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4">
          <Field label="Tên dịch vụ" required error={showErr("name")}>
            <Input value={f.name} onChange={(v) => set("name", v)} onBlur={() => blur("name")}
                   invalid={!!showErr("name")} placeholder="VD: Buffet sáng" />
          </Field>
          <Field label="Mã dịch vụ" help={isEdit ? null : "Tự sinh khi lưu"}>
            <Input value={initial.code || "— tự động —"} disabled />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Danh mục" required>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((k) => {
                const on = f.category === k.id;
                const kc = cat[k.id];
                return (
                  <button key={k.id} onClick={() => set("category", k.id)}
                          className="inline-flex items-center gap-2 h-10 px-3 rounded-xl text-[12.5px] font-bold border transition"
                          style={on ? { borderColor: kc.from, backgroundColor: kc.soft, color: kc.ink }
                                    : { borderColor: "var(--border)", color: "var(--fg-muted)" }}>
                    <k.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{k.label}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Icon hiển thị" help="Chọn icon gợi đúng loại dịch vụ">
            <div className="grid grid-cols-7 gap-1.5 p-2.5 rounded-xl max-h-[132px] overflow-y-auto"
                 style={{ backgroundColor: "var(--surface-2)" }}>
              {Object.entries(ICON_SET).map(([name, I]) => {
                const on = f.icon === name;
                return (
                  <button key={name} onClick={() => set("icon", name)} title={name}
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition"
                          style={on ? { background: `linear-gradient(135deg,${c.from},${c.to})`, color: "#fff" }
                                    : { backgroundColor: "var(--surface)", color: "var(--fg-muted)" }}>
                    <I className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <Field label="Mô tả ngắn" help="Hiển thị trên thẻ dịch vụ">
          <textarea value={f.description} onChange={(e) => set("description", e.target.value)}
                    rows={3} maxLength={200}
                    placeholder="Mô tả ngắn gọn dịch vụ này gồm những gì…"
                    className="w-full px-3.5 py-2.5 rounded-2xl text-[13px] border-0 outline-none resize-none"
                    style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }} />
          <div className="text-[11px] text-right mt-1" style={{ color: "var(--fg-subtle)" }}>
            {f.description.length}/200
          </div>
        </Field>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Đơn giá (đ)" required error={showErr("price")}>
            <Input value={f.price} onChange={(v) => set("price", v.replace(/[^\d]/g, ""))}
                   onBlur={() => blur("price")} invalid={!!showErr("price")} placeholder="350000" numeric />
          </Field>
          <Field label="Đơn vị tính" required>
            <Select value={f.unit} onChange={(v) => set("unit", v)} options={UNITS} />
          </Field>
          <Field label="Thời lượng" help="Bỏ trống nếu không áp dụng">
            <Input value={f.duration} onChange={(v) => set("duration", v)} placeholder="60 phút" />
          </Field>
          <Field label="Sức chứa" help="Số khách tối đa">
            <Input value={f.capacity ?? ""} onChange={(v) => set("capacity", v.replace(/[^\d]/g, ""))}
                   placeholder="20" numeric />
          </Field>
        </div>

        <Field label="Giờ phục vụ">
          <Input value={f.hours} onChange={(v) => set("hours", v)} placeholder="06:00 – 10:00 hằng ngày" />
        </Field>

        <Field label="Chi nhánh áp dụng" required error={showErr("branches")} help="Bấm để bật/tắt từng chi nhánh">
          <div className="flex items-center gap-2 flex-wrap">
            {branches.map((b) => {
              const on = f.branches.includes(b.id);
              return (
                <button key={b.id}
                        onClick={() => { blur("branches"); set("branches", on ? f.branches.filter((x) => x !== b.id) : [...f.branches, b.id]); }}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12.5px] font-bold border transition"
                        style={on ? { borderColor: c.from, backgroundColor: c.soft, color: c.ink }
                                  : { borderColor: "var(--border)", color: "var(--fg-muted)" }}>
                  {on ? <Check className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                  {b.city}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Dịch vụ bao gồm" help="Nhấn Enter để thêm từng mục">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {f.includes.map((it) => (
              <span key={it} className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[12px] font-bold"
                    style={{ backgroundColor: c.soft, color: c.ink }}>
                {it}
                <button onClick={() => set("includes", f.includes.filter((x) => x !== it))}
                        aria-label={`Bỏ ${it}`}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {f.includes.length === 0 && (
              <span className="text-[12px]" style={{ color: "var(--fg-subtle)" }}>Chưa có mục nào</span>
            )}
          </div>
          <Input value={includeInput} onChange={setIncludeInput} placeholder="VD: Nước suối miễn phí"
                 onEnter={() => {
                   const v = includeInput.trim();
                   if (v && !f.includes.includes(v)) set("includes", [...f.includes, v]);
                   setIncludeInput("");
                 }} />
        </Field>

        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl" style={{ backgroundColor: "var(--surface-2)" }}>
          <div className="min-w-0">
            <div className="text-[13px] font-bold" style={{ color: "var(--fg)" }}>Cung cấp dịch vụ này</div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--fg-muted)" }}>
              Tắt để tạm ngưng — dữ liệu vẫn giữ nguyên, chỉ không nhận đặt mới.
            </div>
          </div>
          <Toggle on={f.active} onChange={(v) => set("active", v)} color={c.from} />
        </div>
      </div>

      <SheetFooter
        left={!valid && submitted
          ? <span className="inline-flex items-center gap-1.5" style={{ color: TONE.danger.ink }}>
              <AlertTriangle className="w-3.5 h-3.5" /> Còn trường chưa hợp lệ
            </span>
          : <>Trường có dấu <b style={{ color: TONE.danger.ink }}>*</b> là bắt buộc</>}
        onClose={onClose}
        action={
          <button onClick={submit}
                  className="glowbtn inline-flex items-center gap-2 h-10 px-5 rounded-full text-white text-[13px] font-bold"
                  style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
            <Save className="w-4 h-4" /> {isEdit ? "Lưu thay đổi" : "Tạo dịch vụ"}
          </button>
        }
      />
    </Sheet>
  );
}

/* ═══════════════ DRAWER CHI TIẾT ═══════════════ */
function ServiceDrawer({ s, c, brand, onClose, onEdit, onToggle, onDelete }) {
  const Icon = ICON_SET[s.icon] || ConciergeBell;
  const cat = CAT_BY_ID[s.category];
  const revenue = s.price * s.bookings;

  return (
    <Sheet onClose={onClose} wide icon={Icon} brand={brand} title={s.name} sub={`${cat.label} · ${s.code}`}>
      <div className="p-5 space-y-5">
        <div className="relative aspect-[16/8] rounded-2xl overflow-hidden">
          <CoverImage src={s.cover} from={c.from} to={c.to} Icon={Icon} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(15,18,24,.7),transparent 60%)" }} />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[11px] font-extrabold bg-white/95"
                  style={{ color: c.ink }}>
              <cat.icon className="w-3.5 h-3.5" /> {cat.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[11px] font-extrabold"
                  style={s.active ? { backgroundColor: TONE.success.bg, color: TONE.success.ink }
                                  : { backgroundColor: TONE.neutral.bg, color: TONE.neutral.ink }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.active ? TONE.success.dot : TONE.neutral.dot }} />
              {s.active ? "Đang cung cấp" : "Tạm ngưng"}
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-display font-extrabold text-[30px] tabular-nums" style={{ color: "var(--fg)" }}>
            {s.price.toLocaleString("vi-VN")}
          </span>
          <span className="text-[14px] font-bold" style={{ color: "var(--fg-muted)" }}>đ / {s.unit}</span>
        </div>

        {s.description && (
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>{s.description}</p>
        )}

        <div className="grid grid-cols-4 gap-2.5">
          <Stat icon={TrendingUp} label="Lượt dùng" value={s.bookings} c={c} />
          <Stat icon={Wallet} label="Doanh thu" value={formatVND(revenue)} c={c} />
          <Stat icon={Star} label="Đánh giá" value={s.rating ?? "—"} c={c} />
          <Stat icon={MapPin} label="Chi nhánh" value={`${s.branches.length}/${branches.length}`} c={c} />
        </div>

        <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: "var(--surface-2)" }}>
          <Row icon={Clock} label="Thời lượng" value={s.duration || "Không áp dụng"} />
          <Row icon={CalendarDays} label="Giờ phục vụ" value={s.hours || "Theo yêu cầu"} />
          <Row icon={Users} label="Sức chứa tối đa" value={s.capacity ? `${s.capacity} khách` : "Không giới hạn"} />
          <Row icon={Wallet} label="Đơn giá đầy đủ" value={formatVNDFull(s.price)} />
        </div>

        <div>
          <Label>Chi nhánh áp dụng</Label>
          <div className="flex items-center gap-2 flex-wrap">
            {branches.map((b) => {
              const on = s.branches.includes(b.id);
              return (
                <span key={b.id} className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[12px] font-bold"
                      style={on ? { backgroundColor: c.soft, color: c.ink }
                                : { backgroundColor: "var(--surface-2)", color: "var(--fg-subtle)" }}>
                  {on ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {b.city}
                </span>
              );
            })}
          </div>
        </div>

        {s.includes.length > 0 && (
          <div>
            <Label>Bao gồm</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {s.includes.map((it) => (
                <span key={it} className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[12px] font-bold"
                      style={{ backgroundColor: c.soft, color: c.ink }}>
                  <Check className="w-3 h-3" /> {it}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 pt-1">
          <button onClick={onEdit}
                  className="flex-1 h-11 rounded-full text-white text-[13px] font-bold inline-flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
            <Edit2 className="w-4 h-4" /> Chỉnh sửa
          </button>
          <button onClick={onToggle}
                  className="h-11 px-4 rounded-full border text-[13px] font-bold inline-flex items-center gap-2"
                  style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>
            <Power className="w-4 h-4" /> {s.active ? "Tạm ngưng" : "Bật lại"}
          </button>
          <button onClick={onDelete} aria-label="Xóa dịch vụ" title="Xóa dịch vụ"
                  className="w-11 h-11 rounded-full border inline-flex items-center justify-center shrink-0"
                  style={{ borderColor: "#fecdd3", color: TONE.danger.ink }}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Sheet>
  );
}

/* ═══════════════ XÁC NHẬN XÓA ═══════════════ */
function ConfirmDelete({ s, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: "rgba(15,18,24,.55)", backdropFilter: "blur(6px)" }}
         onClick={onCancel}>
      <div className="w-full max-w-md rounded-[20px] p-6"
           style={{ backgroundColor: "var(--surface)", boxShadow: "0 30px 70px -20px rgba(0,0,0,.5)" }}
           onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4"
             style={{ background: `linear-gradient(135deg,${TONE.danger.from},${TONE.danger.to})` }}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="font-display font-extrabold text-[18px]" style={{ color: "var(--fg)" }}>
          Xóa dịch vụ “{s.name}”?
        </div>
        <div className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Dịch vụ đang áp dụng ở <b style={{ color: "var(--fg)" }}>{s.branches.length} chi nhánh</b> và đã có{" "}
          <b style={{ color: "var(--fg)" }}>{s.bookings} lượt sử dụng</b>. Thao tác này không thể hoàn tác.
          Nếu chỉ muốn ngừng bán tạm thời, hãy dùng <b style={{ color: "var(--fg)" }}>Tạm ngưng</b>.
        </div>
        <div className="flex items-center justify-end gap-2.5 mt-6">
          <button onClick={onCancel} autoFocus className="h-10 px-4 rounded-full border text-[13px] font-bold"
                  style={{ borderColor: "var(--border)", color: "var(--fg)" }}>Hủy</button>
          <button onClick={onConfirm} className="h-10 px-5 rounded-full text-white text-[13px] font-bold"
                  style={{ background: `linear-gradient(135deg,${TONE.danger.from},${TONE.danger.to})` }}>
            Xóa dịch vụ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ THÀNH PHẦN DÙNG CHUNG ═══════════════ */

function CoverImage({ src, from, to, Icon, small }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(false), [src]);
  return (
    <div className="absolute inset-0 flex items-center justify-center"
         style={{ background: `linear-gradient(135deg,${from},${to})` }}>
      {!loaded && <Icon className={small ? "w-5 h-5 text-white/80" : "w-10 h-10 text-white/45"} />}
      {src && (
        <img src={src} alt="" onLoad={() => setLoaded(true)}
             className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
             style={{ opacity: loaded ? 1 : 0 }} />
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, foot, from, to, progress, trend }) {
  return (
    <div className="lift relative rounded-[var(--r)] border p-5 overflow-hidden"
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", "--glow": `${from}55` }}>
      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl opacity-20"
           style={{ background: `linear-gradient(135deg,${from},${to})` }} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-extrabold uppercase tracking-wider truncate" style={{ color: "var(--fg-muted)" }}>{label}</div>
          <div className="font-display font-extrabold text-[30px] leading-none tracking-tight tabular-nums mt-2.5"
               style={{ color: "var(--fg)" }}>{value}</div>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
             style={{ background: `linear-gradient(135deg,${from},${to})`, boxShadow: `0 8px 18px -8px ${from}` }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {progress != null && (
        <div className="relative mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: `linear-gradient(90deg,${from},${to})` }} />
        </div>
      )}
      <div className="relative flex items-center gap-2 mt-3 text-[12px]" style={{ color: "var(--fg-muted)" }}>
        <span className="truncate">{foot}</span>
        {trend != null && (
          <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-extrabold shrink-0"
                style={{ backgroundColor: TONE.success.bg, color: TONE.success.ink }}>
            <TrendingUp className="w-3 h-3" />+{trend}%
          </span>
        )}
      </div>
    </div>
  );
}

function CatChip({ active, onClick, label, count, from, to, icon: Icon }) {
  return (
    <button onClick={onClick}
            className="shrink-0 inline-flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-full text-[12.5px] font-bold border transition-all duration-200"
            style={active
              ? { background: `linear-gradient(135deg,${from},${to})`, color: "#fff", borderColor: "transparent",
                  boxShadow: `0 8px 18px -8px ${from}` }
              : { backgroundColor: "var(--surface)", color: "var(--fg-muted)", borderColor: "var(--border)" }}>
      <Icon className="w-4 h-4 shrink-0" style={active ? undefined : { color: from }} />
      {label}
      <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-full tabular-nums"
            style={active ? { backgroundColor: "rgba(255,255,255,.25)", color: "#fff" }
                          : { backgroundColor: "var(--surface-3)", color: "var(--fg-muted)" }}>
        {count}
      </span>
    </button>
  );
}

function Mini({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-[12px] min-w-0">
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--fg-subtle)" }} />
      <span className="shrink-0" style={{ color: "var(--fg-muted)" }}>{label}</span>
      <span className="ml-auto font-bold truncate text-right" style={{ color: "var(--fg)" }}>{value}</span>
    </div>
  );
}

function Stat({ icon: Icon, label, value, c }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: "var(--surface-2)" }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white mb-2"
           style={{ background: `linear-gradient(135deg,${c.from},${c.to})` }}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="font-display font-extrabold text-[16px] tabular-nums leading-none truncate" style={{ color: "var(--fg)" }}>{value}</div>
      <div className="text-[9.5px] uppercase tracking-wider font-extrabold mt-1 truncate" style={{ color: "var(--fg-subtle)" }}>{label}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px]">
      <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--fg-subtle)" }} />
      <span style={{ color: "var(--fg-muted)" }}>{label}</span>
      <span className="ml-auto font-bold text-right" style={{ color: "var(--fg)" }}>{value}</span>
    </div>
  );
}

/* ── Form primitives ── */
function Field({ label, required, help, error, children }) {
  return (
    <div className="min-w-0">
      <div className="text-[12px] font-bold mb-1.5" style={{ color: "var(--fg)" }}>
        {label}{required && <span style={{ color: TONE.danger.ink }}> *</span>}
      </div>
      {children}
      {error ? (
        <div className="text-[11px] mt-1.5 font-semibold" style={{ color: TONE.danger.ink }}>{error}</div>
      ) : help ? (
        <div className="text-[11px] mt-1.5" style={{ color: "var(--fg-subtle)" }}>{help}</div>
      ) : null}
    </div>
  );
}

function Input({ value, onChange, onBlur, onEnter, placeholder, invalid, disabled, numeric }) {
  return (
    <input
      value={value} disabled={disabled} placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)} onBlur={onBlur}
      onKeyDown={(e) => { if (e.key === "Enter" && onEnter) { e.preventDefault(); onEnter(); } }}
      className={`w-full h-10 px-3.5 rounded-full text-[13px] outline-none border transition ${numeric ? "tabular-nums" : ""}`}
      style={{
        backgroundColor: disabled ? "var(--surface-3)" : "var(--surface-2)",
        color: disabled ? "var(--fg-subtle)" : "var(--fg)",
        borderColor: invalid ? TONE.danger.dot : "transparent",
        cursor: disabled ? "not-allowed" : "text",
      }}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
              className="w-full h-10 pl-3.5 pr-9 rounded-full text-[13px] font-semibold border-0 outline-none appearance-none cursor-pointer"
              style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                   style={{ color: "var(--fg-subtle)" }} />
    </div>
  );
}

function Toggle({ on, onChange, color }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} aria-label="Bật/tắt dịch vụ"
            className="relative w-12 h-7 rounded-full transition shrink-0"
            style={{ background: on ? color : "var(--surface-3)" }}>
      <span className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow"
            style={{ left: on ? 26 : 4 }} />
    </button>
  );
}

/* ── Sheet ── */
function Sheet({ children, onClose, icon: Icon, title, sub, brand, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end"
         style={{ backgroundColor: "rgba(15,18,24,.55)", backdropFilter: "blur(6px)" }}
         onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} h-full flex flex-col`}
           style={{ backgroundColor: "var(--surface)" }}
           onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0"
             style={{ borderColor: "var(--border-soft)" }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                 style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-extrabold text-[16px] truncate" style={{ color: "var(--fg)" }}>{title}</div>
              <div className="text-[11.5px] truncate" style={{ color: "var(--fg-muted)" }}>{sub}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Đóng"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-ink-100 shrink-0"
                  style={{ color: "var(--fg-muted)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function SheetFooter({ left, onClose, action }) {
  return (
    <div className="px-5 py-3.5 border-t flex items-center justify-between gap-3 shrink-0"
         style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-2)" }}>
      <span className="text-[11.5px] truncate" style={{ color: "var(--fg-muted)" }}>{left}</span>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onClose} className="h-10 px-4 rounded-full border text-[13px] font-bold"
                style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>Hủy</button>
        {action}
      </div>
    </div>
  );
}

function Toast({ text, tone }) {
  const t = TONE[tone] || TONE.success;
  return (
    <div role="status"
         className="fixed bottom-6 right-6 z-[60] rounded-2xl px-4 py-3 flex items-center gap-2.5 max-w-[360px]"
         style={{ backgroundColor: "var(--surface)", border: `1px solid ${t.dot}`,
                  boxShadow: "0 18px 40px -14px rgba(0,0,0,.35)" }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
           style={{ background: `linear-gradient(135deg,${t.from},${t.to})` }}>
        <Check className="w-4 h-4" />
      </div>
      <span className="text-[13px] font-bold" style={{ color: "var(--fg)" }}>{text}</span>
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
    <button onClick={(e) => { e.stopPropagation(); onClick?.(); }} title={title} aria-label={title}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-ink-100"
            style={{ color: tone || "var(--fg-subtle)" }}>
      {children}
    </button>
  );
}

function Segmented({ options, value, onChange, brand }) {
  return (
    <div className="inline-flex items-center gap-1 h-11 p-1 rounded-full shrink-0"
         style={{ backgroundColor: "var(--surface-2)" }}>
      {options.map((o) => {
        const on = value === o.key;
        return (
          <button key={o.key} onClick={() => onChange(o.key)}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-bold transition-all duration-200"
                  style={on ? { background: `linear-gradient(135deg,${brand.from},${brand.to})`, color: "#fff",
                                boxShadow: `0 6px 14px -6px ${brand.from}b3` }
                            : { color: "var(--fg-muted)" }}>
            <o.icon className="w-3.5 h-3.5" /> {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Label({ children }) {
  return (
    <div className="text-[10.5px] uppercase tracking-wider font-extrabold mb-2.5" style={{ color: "var(--fg-subtle)" }}>
      {children}
    </div>
  );
}

function EmptyState({ onClear, onCreate, brand }) {
  return (
    <div className="rounded-[var(--r)] border py-20 text-center"
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="floaty w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white mb-4"
           style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
        <ConciergeBell className="w-7 h-7" />
      </div>
      <div className="text-[16px] font-bold" style={{ color: "var(--fg)" }}>Không có dịch vụ nào</div>
      <div className="text-[13px] mt-1" style={{ color: "var(--fg-muted)" }}>
        Thử đổi từ khóa, bỏ bộ lọc, hoặc tạo dịch vụ mới.
      </div>
      <div className="flex items-center justify-center gap-2.5 mt-5">
        <button onClick={onClear} className="h-10 px-5 rounded-full border text-[13px] font-bold"
                style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>Xóa bộ lọc</button>
        <button onClick={onCreate}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-[13px] font-bold text-white"
                style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
          <Plus className="w-4 h-4" /> Thêm dịch vụ
        </button>
      </div>
    </div>
  );
}

/* ═══════════════ DỮ LIỆU ═══════════════ */

const COVER_BY_CAT = {
  food:      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&h=450&fit=crop&q=80",
  wellness:  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=450&fit=crop&q=80",
  transport: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=450&fit=crop&q=80",
  amenity:   "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&h=450&fit=crop&q=80",
  event:     "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop&q=80",
  activity:  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=450&fit=crop&q=80",
};

const toForm = (s) => ({
  id: s.id, code: s.code, name: s.name, category: s.category, icon: s.icon,
  price: String(s.price), unit: s.unit, description: s.description,
  duration: s.duration || "", capacity: s.capacity ?? "", hours: s.hours || "",
  branches: [...s.branches], includes: [...s.includes], cover: s.cover || "", active: s.active,
});

function seedServices() {
  const all = branches.map((b) => b.id);
  const some = all.slice(0, 3);
  return [
    {
      id: "s1", code: "SVC-001", name: "Buffet sáng", category: "food", icon: "Soup",
      price: 350000, unit: "người/lượt", duration: "06:00 – 10:00", capacity: 180,
      hours: "Hằng ngày · 06:00 – 10:00", branches: all, active: true,
      description: "Buffet sáng hơn 60 món Á – Âu, có quầy phở và bánh mì nướng tại chỗ.",
      includes: ["Cà phê & nước ép", "Quầy phở nóng", "Bánh mì nướng tại chỗ", "Miễn phí trẻ dưới 6 tuổi"],
      cover: COVER_BY_CAT.food, bookings: 1284, rating: 4.7,
    },
    {
      id: "s2", code: "SVC-002", name: "Spa & Massage 60'", category: "wellness", icon: "Flower2",
      price: 890000, unit: "lượt", duration: "60 phút", capacity: 8,
      hours: "Hằng ngày · 09:00 – 21:00", branches: all, active: true,
      description: "Massage body thư giãn với tinh dầu thiên nhiên, kỹ thuật viên có chứng chỉ quốc tế.",
      includes: ["Xông hơi trước liệu trình", "Trà thảo mộc", "Khăn & dép dùng riêng"],
      cover: COVER_BY_CAT.wellness, bookings: 642, rating: 4.9,
    },
    {
      id: "s3", code: "SVC-003", name: "Đưa đón sân bay", category: "transport", icon: "Plane",
      price: 450000, unit: "chuyến", duration: "Tùy quãng đường", capacity: 4,
      hours: "24/7 · đặt trước 3 giờ", branches: all, active: true,
      description: "Xe 4–7 chỗ đời mới, tài xế đón tận sảnh đến, theo dõi chuyến bay tự động.",
      includes: ["Nước suối miễn phí", "Khăn lạnh", "Chờ miễn phí 60 phút"],
      cover: COVER_BY_CAT.transport, bookings: 418, rating: 4.6,
    },
    {
      id: "s4", code: "SVC-004", name: "Giặt ủi", category: "amenity", icon: "Shirt",
      price: 80000, unit: "kg", duration: "Trả trong 24 giờ", capacity: null,
      hours: "Nhận đồ 07:00 – 20:00", branches: all, active: true,
      description: "Giặt sấy và ủi theo kg, có dịch vụ hỏa tốc trả trong 4 giờ (phụ thu 50%).",
      includes: ["Túi đựng riêng từng phòng", "Giặt khô cho đồ vest"],
      cover: COVER_BY_CAT.amenity, bookings: 906, rating: 4.4,
    },
    {
      id: "s5", code: "SVC-005", name: "Phòng họp", category: "event", icon: "Presentation",
      price: 2500000, unit: "buổi", duration: "4 giờ / buổi", capacity: 60,
      hours: "08:00 – 22:00 · đặt trước 1 ngày", branches: some, active: true,
      description: "Phòng họp có máy chiếu 4K, âm thanh hội nghị, wifi riêng và tiệc trà giữa giờ.",
      includes: ["Máy chiếu & màn 120 inch", "Micro không dây", "Teabreak 1 lần", "Bảng flipchart"],
      cover: COVER_BY_CAT.event, bookings: 132, rating: 4.5,
    },
    {
      id: "s6", code: "SVC-006", name: "Mini bar", category: "amenity", icon: "Wine",
      price: 250000, unit: "lần", duration: "Nạp mỗi ngày", capacity: null,
      hours: "Nạp lúc dọn phòng", branches: all, active: true,
      description: "Đồ uống và snack trong phòng, nạp lại mỗi ngày theo tiêu chuẩn hạng phòng.",
      includes: ["2 chai nước suối miễn phí", "Cà phê & trà túi lọc"],
      cover: COVER_BY_CAT.amenity, bookings: 2140, rating: 4.2,
    },
    {
      id: "s7", code: "SVC-007", name: "Yoga buổi sáng", category: "wellness", icon: "Waves",
      price: 200000, unit: "người", duration: "60 phút", capacity: 25,
      hours: "T2–T7 · 06:00 – 07:00", branches: some, active: false,
      description: "Lớp yoga ngoài trời bên hồ bơi, phù hợp mọi trình độ, có sẵn thảm và khăn.",
      includes: ["Thảm tập", "Nước detox", "Khăn lạnh sau buổi tập"],
      cover: COVER_BY_CAT.wellness, bookings: 88, rating: 4.8,
    },
    {
      id: "s8", code: "SVC-008", name: "Tour city", category: "activity", icon: "Map",
      price: 680000, unit: "khách", duration: "Nửa ngày", capacity: 16,
      hours: "Khởi hành 08:00 & 13:30", branches: all, active: true,
      description: "Tham quan các điểm nổi bật quanh khu nghỉ dưỡng, hướng dẫn viên tiếng Việt & Anh.",
      includes: ["Xe đưa đón", "Hướng dẫn viên", "Vé tham quan", "Nước uống"],
      cover: COVER_BY_CAT.activity, bookings: 274, rating: 4.6,
    },
  ];
}
