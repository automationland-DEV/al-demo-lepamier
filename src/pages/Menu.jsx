import { useCallback, useEffect, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { menuItems as seed, MENU_GROUPS } from "../data/adminData";
import { formatVND, formatVNDFull } from "../utils/format";
import { usePalette } from "../theme/palette";
import Pagination from "../components/Pagination";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat, SectionHead,
  Button, IconButton, SearchInput, Select, Field, Input, Segmented,
  Tag, StatusTag, Table, Th, Td, Tr, Modal, EmptyState, Toast,
  Dropdown, MenuItem as Item, Hairline, ChartLegend,
  axisProps, gridProps, chartTip,
} from "../components/ui";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

/**
 * THỰC ĐƠN — danh mục món, giá bán, giá vốn và biên lợi nhuận.
 *
 * Trang Vận hành nhà hàng chỉ trả lời "bàn nào đang có khách". Câu hỏi
 * "món nào đang lỗ" thì phải ở đây: mỗi món gắn giá vốn, nên biên lợi
 * nhuận tính được ngay và sắp xếp được.
 */

const {
  BookOpen, Plus, Edit2, Trash2, MoreHorizontal, LayoutGrid, List,
  Check, Flame, TrendingUp, Salad, Soup, Fish, Cake, Wine, ChefHat,
  AlertCircle, Percent,
} = Icons;

const GROUP_ICON = {
  appetizer: Salad, main: ChefHat, seafood: Fish, soup: Soup, dessert: Cake, drink: Wine,
};

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const SORTS = [
  { key: "sold-desc", label: "Bán chạy nhất" },
  { key: "margin-desc", label: "Biên lợi nhuận cao" },
  { key: "margin-asc", label: "Biên lợi nhuận thấp" },
  { key: "price-desc", label: "Giá cao nhất" },
  { key: "price-asc", label: "Giá thấp nhất" },
  { key: "name-asc", label: "Tên A → Z" },
];

const EMPTY = {
  name: "", group: "main", price: 200000, cost: 80000, unit: "phần",
  prepTime: 15, active: true, signature: false, desc: "", image: "",
};

const marginTone = (m) => (m >= 65 ? "success" : m >= 45 ? "warning" : "danger");


function Cover({ src, alt, group, c = {}, className = "", style }) {
  const [loaded, setLoaded] = useState(false);
  const GIcon = GROUP_ICON[group] || ChefHat;
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: c.soft || "var(--surface-3)", ...style }}
    >
      <div className="absolute inset-0 grid place-items-center">
        <GIcon className="w-1/3 h-1/3 max-w-[38px] max-h-[38px]" style={{ color: c.base || "var(--fg-subtle)" }} />
      </div>
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity .25s var(--ease)" }}
        />
      )}
    </div>
  );
}

/**
 * Thẻ món — cùng bố cục thẻ ở trang Dịch vụ & Tiện ích (ảnh bìa 16:10, nhãn
 * nhóm và tên món đè lên ảnh, giá lớn, khối chỉ số, chân thẻ có thao tác),
 * nhưng dựng bằng ngôn ngữ v4: không gradient, viền tóc, bo 6px, weight ≤ 600.
 *
 * Lớp phủ tối dưới ảnh là ngoại lệ gradient hợp lệ theo Design.md §2.5 —
 * nó tồn tại để chữ trắng đọc được trên ảnh bất kỳ, không phải để trang trí.
 */
function DishCard({ m, c, onOpen, onEdit, onToggle, onDelete }) {
  const groupLabel = MENU_GROUPS.find((g) => g.id === m.group)?.label;

  return (
    <article
      className="group border overflow-hidden flex flex-col card-hover"
      style={{
        borderRadius: "var(--r)",
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card)",
        opacity: m.active ? 1 : 0.74,
      }}
    >
      <button onClick={onOpen} className="relative aspect-[16/10] w-full text-left shrink-0" title={`Xem chi tiết ${m.name}`}>
        
        <Cover src={m.image} alt={m.name} group={m.group} c={c} className="w-full h-full" />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(20,22,18,.82) 0%, rgba(20,22,18,.18) 52%, transparent 100%)" }}
        />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 h-6 px-2 text-[11px] font-medium"
            style={{ borderRadius: "var(--r-sm)", backgroundColor: "rgba(252,251,249,.94)", color: c.fg }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.base }} />
            {groupLabel}
          </span>
          {m.signature && (
            <span
              className="inline-flex items-center gap-1 h-6 px-2 text-[11px] font-medium"
              style={{ borderRadius: "var(--r-sm)", backgroundColor: "rgba(252,251,249,.94)", color: "var(--metal-fg)" }}
              title="Món đặc trưng của bếp"
            >
              <Flame className="w-3 h-3" />
              Đặc trưng
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display text-[19px] leading-tight text-white line-clamp-2">{m.name}</h3>
          <div className="mt-1 text-[11px] tnum" style={{ color: "rgba(255,255,255,.72)" }}>
            {m.code} · {m.unit}
            {!m.active && " · tạm ngừng phục vụ"}
          </div>
        </div>
      </button>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-[12.5px] leading-relaxed line-clamp-2" style={{ color: "var(--fg-muted)" }}>
          {m.desc}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--fg-subtle)" }}>
              Giá bán
            </div>
            <div className="mt-1 text-[22px] font-medium tnum" style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}>
              {formatVNDFull(m.price)}
            </div>
          </div>
          <StatusTag tone={marginTone(m.margin)} className="shrink-0">Biên {m.margin}%</StatusTag>
        </div>

        
        <div
          className="mt-4 mb-4 grid grid-cols-3 gap-px border overflow-hidden"
          style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}
        >
          {[
            ["Giá vốn", formatVND(m.cost)],
            ["Bán 30N", m.sold30d.toLocaleString("vi-VN")],
            ["Ra món", `${m.prepTime}′`],
          ].map(([k, v]) => (
            <div key={k} className="px-2.5 py-2" style={{ backgroundColor: "var(--surface-2)" }}>
              <div className="text-[10px] uppercase tracking-[0.1em] font-semibold truncate" style={{ color: "var(--fg-subtle)" }}>
                {k}
              </div>
              <div className="mt-0.5 text-[12.5px] font-medium tnum truncate" style={{ color: "var(--fg)" }}>{v}</div>
            </div>
          ))}
        </div>

        <div
          className="mt-auto pt-4 flex items-center justify-between gap-2"
          style={{ borderTop: "1px solid var(--border-soft)" }}
        >
          <StatusTag tone={m.active ? "success" : "neutral"}>
            {m.active ? "Đang phục vụ" : "Tạm ngừng"}
          </StatusTag>
          {/* Trước đây nhóm nút này ẩn tới khi rê chuột (giống thẻ ở trang Dịch
              vụ). Bỏ đi: trên thiết bị cảm ứng không có trạng thái hover nên
              thao tác coi như biến mất, và ngay trên desktop cũng khó đoán là
              thẻ có nút. */}
          <div className="flex items-center gap-0.5">
            <IconButton icon={Edit2} label="Sửa món" size="md" onClick={onEdit} />
            <IconButton icon={Check} label={m.active ? "Tạm ngừng phục vụ" : "Phục vụ lại"} size="md" onClick={onToggle} />
            <IconButton icon={Trash2} label="Xóa khỏi thực đơn" size="md" onClick={onDelete} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Menu() {
  const { seriesMap, chart } = usePalette();
  const G = useMemo(() => seriesMap(MENU_GROUPS.map((g) => g.id)), [seriesMap]);
  const [barColor] = chart(1);

  const [list, setList] = useState(seed);
  const [group, setGroup] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("sold-desc");
  const [view, setView] = useState("grid");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  // Thẻ cao hơn hàng bảng nên mỗi trang lấy ít hơn, tránh cuộn quá dài
  const PAGE_SIZE = view === "grid" ? 8 : 12;

  useEffect(() => setPage(1), [group, search, sort, status, view]);

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    const out = list.filter((m) => {
      if (group !== "all" && m.group !== group) return false;
      if (status === "active" && !m.active) return false;
      if (status === "off" && m.active) return false;
      if (status === "signature" && !m.signature) return false;
      if (q && !deaccent(`${m.name} ${m.code}`).includes(q)) return false;
      return true;
    });
    const by = {
      "sold-desc": (a, b) => b.sold30d - a.sold30d,
      "margin-desc": (a, b) => b.margin - a.margin,
      "margin-asc": (a, b) => a.margin - b.margin,
      "price-desc": (a, b) => b.price - a.price,
      "price-asc": (a, b) => a.price - b.price,
      "name-asc": (a, b) => a.name.localeCompare(b.name, "vi"),
    }[sort];
    return [...out].sort(by);
  }, [list, group, search, sort, status]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const revenue30d = filtered.reduce((s, m) => s + m.price * m.sold30d, 0);
  const cost30d = filtered.reduce((s, m) => s + m.cost * m.sold30d, 0);
  const avgMargin = filtered.length
    ? Math.round(filtered.reduce((s, m) => s + m.margin, 0) / filtered.length)
    : 0;

  /* Doanh thu 30 ngày theo nhóm món — trả lời "tiền đến từ đâu" */
  const byGroup = useMemo(
    () =>
      MENU_GROUPS.map((g) => {
        const items = list.filter((m) => m.group === g.id);
        return {
          name: g.label,
          id: g.id,
          revenue: items.reduce((s, m) => s + m.price * m.sold30d, 0),
          count: items.length,
        };
      }).sort((a, b) => b.revenue - a.revenue),
    [list]
  );

  const save = useCallback((data) => {
    setList((prev) => {
      const exists = prev.some((m) => m.id === data.id);
      return exists ? prev.map((m) => (m.id === data.id ? data : m)) : [data, ...prev];
    });
    setForm(null);
    setToast(seed.some((m) => m.id === data.id) ? "Đã lưu món" : "Đã thêm món vào thực đơn");
  }, []);

  const remove = useCallback((m) => {
    setList((prev) => prev.filter((x) => x.id !== m.id));
    setConfirm(null);
    setToast(`Đã xóa "${m.name}" khỏi thực đơn`);
  }, []);

  const toggle = useCallback((m) => {
    setList((prev) => prev.map((x) => (x.id === m.id ? { ...x, active: !x.active } : x)));
    setToast(m.active ? `Đã tạm ngừng phục vụ "${m.name}"` : `Đã phục vụ lại "${m.name}"`);
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Nhà hàng"
        title="Thực đơn"
        meta={[
          `${list.length} món trên thực đơn`,
          `${list.filter((m) => m.signature).length} món đặc trưng`,
          `Biên lợi nhuận trung bình ${avgMargin}%`,
        ]}
        actions={
          <>
            <Segmented
              value={view}
              onChange={setView}
              size="sm"
              options={[
                { value: "grid", label: "Thẻ", icon: LayoutGrid },
                { value: "table", label: "Bảng", icon: List },
              ]}
            />
            <Button icon={Plus} onClick={() => setForm({ ...EMPTY, id: null })}>Thêm món</Button>
          </>
        }
      />

      <StatStrip cols={4}>
        <Stat label="Doanh thu 30 ngày" value={formatVND(revenue30d)} icon={TrendingUp}
          hint="Ước tính từ số lượng bán × giá bán" />
        <Stat label="Giá vốn 30 ngày" value={formatVND(cost30d)} icon={Flame}
          hint={`Lãi gộp ${formatVND(revenue30d - cost30d)}`} />
        <Stat label="Biên lợi nhuận" value={`${avgMargin}%`} icon={Percent} progress={avgMargin}
          hint="Trung bình trên các món đang lọc" />
        <Stat label="Món đang phục vụ" value={list.filter((m) => m.active).length} icon={BookOpen}
          hint={`${list.filter((m) => !m.active).length} món tạm ngừng`} />
      </StatStrip>

      <Toolbar className="mt-5">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên món hoặc mã…"
          wrapperClassName="flex-1 min-w-[200px]"
        />
        <Select value={group} onChange={(e) => setGroup(e.target.value)} wrapperClassName="w-[170px]">
          <option value="all">Tất cả nhóm món</option>
          {MENU_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} wrapperClassName="w-[170px]">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang phục vụ</option>
          <option value="off">Tạm ngừng</option>
          <option value="signature">Món đặc trưng</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} wrapperClassName="w-[190px]">
          {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </Select>
      </Toolbar>

      {filtered.length === 0 ? (
        <Panel className="mt-5">
          <EmptyState icon={BookOpen} title="Không có món nào khớp"
            desc="Thử bỏ bớt bộ lọc nhóm món hoặc trạng thái."
            action={<Button icon={Plus} onClick={() => setForm({ ...EMPTY, id: null })}>Thêm món</Button>} />
        </Panel>
      ) : view === "table" ? (
        <Panel className="mt-5" flush>
          <Table minWidth={1020}>
            <thead>
              <tr>
                <Th>Món</Th>
                <Th>Nhóm</Th>
                <Th align="right">Giá bán</Th>
                <Th align="right">Giá vốn</Th>
                <Th align="right">Biên LN</Th>
                <Th align="right">Bán 30 ngày</Th>
                <Th align="right">Chế biến</Th>
                <Th align="right">Thao tác</Th>
              </tr>
            </thead>
            <tbody>
              {paged.map((m) => {
                const c = G[m.group] || {};
                return (
                  <Tr key={m.id} onClick={() => setDetail(m)}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Cover
                          src={m.image}
                          alt={m.name}
                          group={m.group}
                          c={c}
                          className="w-10 h-10 shrink-0 border"
                          style={{ borderRadius: "var(--r-sm)", borderColor: "var(--border)" }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium truncate" style={{ color: "var(--fg)" }}>{m.name}</span>
                            {m.signature && <Flame className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--metal)" }} />}
                          </div>
                          <div className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                            {m.code} · {m.unit}
                            {!m.active && " · tạm ngừng"}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td><Tag dot={c.base}>{MENU_GROUPS.find((g) => g.id === m.group)?.label}</Tag></Td>
                    <Td align="right" num>{formatVNDFull(m.price)}</Td>
                    <Td align="right" num>
                      <span style={{ color: "var(--fg-muted)" }}>{formatVNDFull(m.cost)}</span>
                    </Td>
                    <Td align="right">
                      <StatusTag tone={marginTone(m.margin)}>{m.margin}%</StatusTag>
                    </Td>
                    <Td align="right" num>{m.sold30d.toLocaleString("vi-VN")}</Td>
                    <Td align="right" num>{m.prepTime}′</Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <IconButton icon={Edit2} label="Sửa món" size="sm" onClick={() => setForm(m)} />
                        <Dropdown trigger={<IconButton icon={MoreHorizontal} label="Thao tác khác" size="sm" />}>
                          <Item icon={Check} onClick={() => toggle(m)}>
                            {m.active ? "Tạm ngừng phục vụ" : "Phục vụ lại"}
                          </Item>
                          <Item icon={Trash2} danger onClick={() => setConfirm(m)}>Xóa khỏi thực đơn</Item>
                        </Dropdown>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
          <div className="px-6 pb-5">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
              onPageChange={setPage}
              totalItems={filtered.length}
              itemsPerPage={PAGE_SIZE}
            />
          </div>
        </Panel>
      ) : (
        <>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {paged.map((m) => (
              <DishCard
                key={m.id}
                m={m}
                c={G[m.group] || {}}
                onOpen={() => setDetail(m)}
                onEdit={() => setForm(m)}
                onToggle={() => toggle(m)}
                onDelete={() => setConfirm(m)}
              />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
            onPageChange={setPage}
            totalItems={filtered.length}
            itemsPerPage={PAGE_SIZE}
          />
        </>
      )}

      <SectionHead
        eyebrow="Phân tích"
        title="Doanh thu 30 ngày theo nhóm món"
        sub="Nhóm nào gánh doanh thu, nhóm nào chỉ để đủ menu."
      />
      <Panel>
        <ChartLegend className="mb-4" items={[{ label: "Doanh thu ước tính 30 ngày", color: barColor }]} />
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byGroup} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => formatVND(v)} width={64} />
              <Tooltip
                {...chartTip}
                formatter={(v, _n, p) => [formatVNDFull(v), `${p.payload.count} món`]}
              />
              <Bar dataKey="revenue" radius={[3, 3, 0, 0]} maxBarSize={56}>
                {byGroup.map((g) => (
                  <Cell key={g.id} fill={(G[g.id] || {}).base || barColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <MenuForm open={!!form} data={form} onClose={() => setForm(null)} onSave={save} />

      {/* ── Chi tiết món ── */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        wide
        eyebrow={detail ? `${detail.code} · ${MENU_GROUPS.find((g) => g.id === detail.group)?.label}` : ""}
        title={detail?.name || ""}
        sub={detail?.desc}
        footer={
          <>
            <Button variant="ghost" onClick={() => { toggle(detail); setDetail(null); }}>
              {detail?.active ? "Tạm ngừng phục vụ" : "Phục vụ lại"}
            </Button>
            <Button icon={Edit2} onClick={() => { setForm(detail); setDetail(null); }}>Sửa món</Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <Cover
              src={detail.imageLarge || detail.image}
              alt={detail.name}
              group={detail.group}
              c={G[detail.group] || {}}
              className="w-full aspect-[16/9]"
              style={{ borderRadius: "var(--r-sm)" }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border overflow-hidden"
              style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}>
              {[
                ["Giá bán", formatVNDFull(detail.price)],
                ["Giá vốn", formatVNDFull(detail.cost)],
                ["Biên lợi nhuận", `${detail.margin}%`],
                ["Ra món", `${detail.prepTime} phút`],
              ].map(([k, v]) => (
                <div key={k} className="px-4 py-3" style={{ backgroundColor: "var(--surface)" }}>
                  <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--fg-subtle)" }}>{k}</div>
                  <div className="mt-1 text-[14px] font-medium tnum" style={{ color: "var(--fg)" }}>{v}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusTag tone={detail.active ? "success" : "neutral"}>
                {detail.active ? "Đang phục vụ" : "Tạm ngừng"}
              </StatusTag>
              {detail.signature && <Tag dot="var(--metal)">Món đặc trưng</Tag>}
              <Tag>Đơn vị: {detail.unit}</Tag>
              <Tag>
                {detail.branches.length === 4 ? "Tất cả chi nhánh" : `${detail.branches.length} chi nhánh`}
              </Tag>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4 text-[13px]">
                <span style={{ color: "var(--fg-muted)" }}>Bán 30 ngày qua</span>
                <span className="tnum font-medium" style={{ color: "var(--fg)" }}>
                  {detail.sold30d.toLocaleString("vi-VN")} {detail.unit}
                </span>
              </div>
              <Hairline className="my-3" soft />
              <div className="flex items-center justify-between gap-4 text-[13px]">
                <span style={{ color: "var(--fg-muted)" }}>Doanh thu ước tính</span>
                <span className="tnum font-medium" style={{ color: "var(--fg)" }}>
                  {formatVNDFull(detail.price * detail.sold30d)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4 text-[13px]">
                <span style={{ color: "var(--fg-muted)" }}>Lãi gộp ước tính</span>
                <span className="tnum font-medium" style={{ color: "var(--success-fg)" }}>
                  {formatVNDFull((detail.price - detail.cost) * detail.sold30d)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        eyebrow="Xác nhận"
        title={`Xóa "${confirm?.name || ""}"?`}
        sub="Món sẽ biến mất khỏi thực đơn của mọi chi nhánh. Thao tác chỉ ảnh hưởng bản demo."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>Hủy</Button>
            <Button variant="danger" icon={Trash2} onClick={() => remove(confirm)}>Xóa món</Button>
          </>
        }
      >
        <div className="flex items-start gap-3 text-[13px]" style={{ color: "var(--fg-muted)" }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
          <span>
            Món này bán được <strong className="tnum" style={{ color: "var(--fg)" }}>
              {confirm?.sold30d?.toLocaleString("vi-VN")}
            </strong> {confirm?.unit} trong 30 ngày qua. Cân nhắc tạm ngừng thay vì xóa.
          </span>
        </div>
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}

/* ═══════════ Form thêm / sửa món ═══════════ */
function MenuForm({ open, data, onClose, onSave }) {
  const [v, setV] = useState(EMPTY);
  const [touched, setTouched] = useState(false);
  const key = data?.id || "new";
  const [lastKey, setLastKey] = useState(key);

  if (open && key !== lastKey) {
    setLastKey(key);
    setV(data || EMPTY);
    setTouched(false);
  }

  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));
  const setNum = (k) => (e) => setV((p) => ({ ...p, [k]: Number(e.target.value) || 0 }));

  const margin = v.price ? Math.round(((v.price - v.cost) / v.price) * 100) : 0;
  const errName = touched && !v.name.trim() ? "Bắt buộc nhập tên món" : "";
  const errCost = touched && v.cost >= v.price ? "Giá vốn phải nhỏ hơn giá bán" : "";

  const submit = () => {
    setTouched(true);
    if (!v.name.trim() || v.cost >= v.price) return;
    onSave({
      ...v,
      id: v.id || `MN-${Date.now().toString().slice(-6)}`,
      code: v.code || `M${Date.now().toString().slice(-3)}`,
      margin,
      sold30d: v.sold30d || 0,
      branches: v.branches || [],
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      eyebrow={data?.id ? "Chỉnh sửa" : "Thêm mới"}
      title={data?.id ? `Sửa "${data.name}"` : "Thêm món vào thực đơn"}
      sub="Nhập cả giá vốn để hệ thống tính được biên lợi nhuận."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button icon={Check} onClick={submit}>{data?.id ? "Lưu thay đổi" : "Thêm món"}</Button>
        </>
      }
    >
      {/* Ảnh xem trước đặt ngay trên ô nhập URL — dán link xong là thấy kết quả,
          khỏi phải đóng modal rồi mở lại thẻ để kiểm tra. */}
      <div className="mb-5 grid sm:grid-cols-[200px_minmax(0,1fr)] gap-4 items-start">
        <Cover
          src={v.image}
          alt={v.name || "Ảnh món"}
          group={v.group}
          className="w-full aspect-[16/10] border"
          style={{ borderRadius: "var(--r-sm)", borderColor: "var(--border)" }}
        />
        <Field
          label="Ảnh món (URL)"
          hint="Bản demo không upload"
        >
          <Input value={v.image} onChange={set("image")} placeholder="https://images.unsplash.com/…" />
          <p className="mt-2 text-[11px] leading-relaxed" style={{ color: "var(--fg-subtle)" }}>
            Để trống thì thẻ dùng nền và icon của nhóm món. Ảnh nên có tỉ lệ 16:10 để không bị cắt mất phần chính.
          </p>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Tên món" required error={errName} className="sm:col-span-2">
          <Input value={v.name} onChange={set("name")} placeholder="Tôm hùm Alaska nướng bơ" />
        </Field>
        <Field label="Nhóm món">
          <Select value={v.group} onChange={set("group")}>
            {MENU_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </Select>
        </Field>
        <Field label="Đơn vị tính">
          <Select value={v.unit} onChange={set("unit")}>
            {["phần", "tô", "chén", "ly", "chai", "con", "kg", "nồi"].map((u) => <option key={u}>{u}</option>)}
          </Select>
        </Field>
        <Field label="Giá bán (VNĐ)">
          <Input type="number" step={5000} value={v.price} onChange={setNum("price")} />
        </Field>
        <Field label="Giá vốn (VNĐ)" error={errCost} hint={`Biên lợi nhuận ${margin}%`}>
          <Input type="number" step={5000} value={v.cost} onChange={setNum("cost")} />
        </Field>
        <Field label="Thời gian chế biến (phút)">
          <Input type="number" min={1} max={120} value={v.prepTime} onChange={setNum("prepTime")} />
        </Field>
        <Field label="Mô tả ngắn" className="sm:col-span-2">
          <Input value={v.desc} onChange={set("desc")} placeholder="Tôm hùm còn sống chọn tại bể, nướng bơ tỏi, phủ phô mai…" />
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          { k: "active", on: "Đang phục vụ", off: "Tạm ngừng phục vụ", icon: Check },
          { k: "signature", on: "Món đặc trưng", off: "Món thường", icon: Flame },
        ].map((t) => {
          const on = !!v[t.k];
          return (
            <button
              key={t.k}
              type="button"
              onClick={() => setV((p) => ({ ...p, [t.k]: !p[t.k] }))}
              className="inline-flex items-center gap-2 h-9 px-3.5 text-[12px] font-medium border transition-colors"
              style={{
                borderRadius: "var(--r-sm)",
                backgroundColor: on ? "var(--accent-soft)" : "var(--surface-2)",
                borderColor: on ? "var(--accent)" : "var(--border)",
                color: on ? "var(--accent-fg)" : "var(--fg-muted)",
              }}
            >
              <t.icon className="w-4 h-4" />
              {on ? t.on : t.off}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
