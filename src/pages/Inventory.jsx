import { useCallback, useEffect, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { ingredients as seedIng, stockMoves as seedMoves, suppliers } from "../data/adminData";
import { branches } from "../data/mockData";
import { formatVND, formatVNDFull, formatDate } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import { usePalette } from "../theme/palette";
import Pagination from "../components/Pagination";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat,
  Button, SearchInput, Select, Field, Input, Tabs,
  Tag, StatusTag, Table, Th, Td, Tr, Modal, EmptyState, Toast,
  Eyebrow, Hairline,
} from "../components/ui";

/**
 * KHO & NGUYÊN LIỆU — tồn kho bếp, phiếu nhập/xuất và nhà cung cấp.
 *
 * Chỉ số quan trọng nhất không phải "còn bao nhiêu kg" mà là "còn đủ mấy
 * ngày" — bếp trưởng đặt hàng theo số ngày, không theo khối lượng. Vì vậy
 * cột `daysLeft` được đặt trước cột số lượng và quyết định màu cảnh báo.
 */

const {
  Boxes, Plus, Truck, Warehouse, AlertTriangle, ArrowDownRight, ArrowUpRight,
  Check, PackageSearch, Star, Phone,
} = Icons;

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const LEVEL = {
  critical: { tone: "danger", label: "Sắp hết" },
  low: { tone: "warning", label: "Cần đặt thêm" },
  ok: { tone: "success", label: "Đủ dùng" },
};

export default function Inventory() {
  const { activeBranchId } = useActiveBranch();
  const { seriesMap } = usePalette();
  const CATS = useMemo(() => [...new Set(seedIng.map((i) => i.cat))], []);
  const C = useMemo(() => seriesMap(CATS), [seriesMap, CATS]);

  const [list, setList] = useState(seedIng);
  const [moves, setMoves] = useState(seedMoves);
  const [tab, setTab] = useState("stock");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [level, setLevel] = useState("all");
  const [page, setPage] = useState(1);
  const [movePage, setMovePage] = useState(1);
  const [form, setForm] = useState(null);
  const [toast, setToast] = useState(null);
  const PAGE_SIZE = 12;

  useEffect(() => setPage(1), [search, cat, level]);

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    return list.filter((i) => {
      if (cat !== "all" && i.cat !== cat) return false;
      if (level !== "all" && i.level !== level) return false;
      if (activeBranchId !== "ALL" && i.branch !== activeBranchId) return false;
      if (q && !deaccent(`${i.name} ${i.supplier}`).includes(q)) return false;
      return true;
    });
  }, [list, search, cat, level, activeBranchId]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const scopedMoves = useMemo(
    () => (activeBranchId === "ALL" ? moves : moves.filter((m) => m.branchId === activeBranchId)),
    [moves, activeBranchId]
  );
  const pagedMoves = scopedMoves.slice((movePage - 1) * PAGE_SIZE, movePage * PAGE_SIZE);

  const stockValue = filtered.reduce((s, i) => s + i.value, 0);
  const critical = filtered.filter((i) => i.level === "critical").length;
  const low = filtered.filter((i) => i.level === "low").length;
  const inValue = scopedMoves.filter((m) => m.type === "in").reduce((s, m) => s + m.value, 0);
  const outValue = scopedMoves.filter((m) => m.type === "out").reduce((s, m) => s + m.value, 0);

  const receive = useCallback((ing, qty, note) => {
    const q = Number(qty) || 0;
    if (q <= 0) return;
    setList((prev) =>
      prev.map((i) => {
        if (i.id !== ing.id) return i;
        const stock = i.stock + q;
        const pct = Math.round((stock / i.max) * 100);
        // Số ngày dùng còn lại suy ra từ tốc độ tiêu thụ hiện tại
        const perDay = i.stock / Math.max(i.daysLeft, 1);
        const daysLeft = Math.round(stock / Math.max(perDay, 0.1));
        return {
          ...i, stock, pct, daysLeft, value: stock * i.price, lastIn: "2026-08-02",
          level: daysLeft <= 2 ? "critical" : daysLeft <= 7 ? "low" : "ok",
        };
      })
    );
    setMoves((prev) => [
      {
        id: `PX-${String(prev.length + 1).padStart(4, "0")}`,
        date: "2026-08-02",
        type: "in",
        ingredientId: ing.id,
        ingredient: ing.name,
        unit: ing.unit,
        qty: q,
        value: q * ing.price,
        branchId: ing.branch,
        branchName: branches.find((b) => b.id === ing.branch)?.name || "—",
        note: note || `Nhập từ ${ing.supplier}`,
        by: "Quản trị viên",
      },
      ...prev,
    ]);
    setForm(null);
    setToast(`Đã nhập ${q} ${ing.unit} ${ing.name}`);
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Nhà hàng"
        title="Kho & Nguyên liệu"
        meta={[
          `${filtered.length} mặt hàng trong phạm vi`,
          `Giá trị tồn ${formatVND(stockValue)}`,
          critical ? `${critical} mặt hàng sắp hết` : "Không có mặt hàng nào sắp hết",
        ]}
        live={critical > 0}
        actions={<Button icon={Truck} onClick={() => setForm(filtered[0] || list[0])}>Nhập kho</Button>}
      />

      <StatStrip cols={4}>
        <Stat label="Giá trị tồn kho" value={formatVND(stockValue)} icon={Warehouse}
          hint={`${filtered.length} mặt hàng đang theo dõi`} />
        <Stat label="Sắp hết" value={critical} icon={AlertTriangle}
          hint="Còn dưới 2 ngày sử dụng" />
        <Stat label="Cần đặt thêm" value={low} icon={PackageSearch}
          hint="Còn dưới 7 ngày sử dụng" />
        <Stat label="Nhập / Xuất 20 ngày" value={formatVND(inValue)} icon={ArrowDownRight}
          hint={`Đã xuất ${formatVND(outValue)}`} />
      </StatStrip>

      {critical > 0 && (
        <div
          className="mt-5 flex flex-wrap items-center gap-3 px-5 py-4 border"
          style={{
            borderRadius: "var(--r)",
            backgroundColor: "var(--danger-soft)",
            borderColor: "var(--danger-border)",
            color: "var(--danger-fg)",
          }}
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-[13px] flex-1 min-w-[240px]">
            <strong>{critical} mặt hàng</strong> còn dưới 2 ngày sử dụng —{" "}
            {filtered.filter((i) => i.level === "critical").map((i) => i.name).join(", ")}.
          </span>
          <Button size="sm" variant="outline" icon={Truck}
            onClick={() => setForm(filtered.find((i) => i.level === "critical"))}>
            Tạo phiếu nhập
          </Button>
        </div>
      )}

      <Tabs
        className="mt-8"
        value={tab}
        onChange={setTab}
        items={[
          { key: "stock", label: "Tồn kho", icon: Boxes, count: filtered.length },
          { key: "moves", label: "Phiếu nhập / xuất", icon: ArrowUpRight, count: scopedMoves.length },
          { key: "suppliers", label: "Nhà cung cấp", icon: Truck, count: suppliers.length },
        ]}
      />

      {/* ── Tồn kho ── */}
      {tab === "stock" && (
        <>
          <Toolbar className="mt-5">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên nguyên liệu hoặc nhà cung cấp…"
              wrapperClassName="flex-1 min-w-[220px]"
            />
            <Select value={cat} onChange={(e) => setCat(e.target.value)} wrapperClassName="w-[170px]">
              <option value="all">Tất cả nhóm hàng</option>
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select value={level} onChange={(e) => setLevel(e.target.value)} wrapperClassName="w-[180px]">
              <option value="all">Tất cả mức tồn</option>
              <option value="critical">Sắp hết</option>
              <option value="low">Cần đặt thêm</option>
              <option value="ok">Đủ dùng</option>
            </Select>
          </Toolbar>

          <Panel className="mt-5" flush>
            {filtered.length === 0 ? (
              <EmptyState icon={Boxes} title="Không có nguyên liệu nào khớp"
                desc="Thử bỏ bớt bộ lọc nhóm hàng hoặc mức tồn." />
            ) : (
              <>
                <Table minWidth={1060}>
                  <thead>
                    <tr>
                      <Th>Nguyên liệu</Th>
                      <Th>Nhóm</Th>
                      <Th align="right">Còn dùng được</Th>
                      <Th>Mức tồn</Th>
                      <Th align="right">Tồn hiện tại</Th>
                      <Th align="right">Giá trị</Th>
                      <Th>Nhà cung cấp</Th>
                      <Th align="right">Thao tác</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((i) => {
                      const lv = LEVEL[i.level];
                      const c = C[i.cat] || {};
                      return (
                        <Tr key={i.id}>
                          <Td>
                            <div className="font-medium" style={{ color: "var(--fg)" }}>{i.name}</div>
                            <div className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                              Nhập gần nhất {formatDate(i.lastIn)}
                            </div>
                          </Td>
                          <Td><Tag dot={c.base}>{i.cat}</Tag></Td>
                          <Td align="right" num>
                            <span style={{ color: `var(--${lv.tone}-fg)`, fontWeight: 500 }}>
                              {i.daysLeft} ngày
                            </span>
                          </Td>
                          <Td>
                            <div className="flex items-center gap-2.5">
                              <div className="w-20 h-1 overflow-hidden shrink-0" style={{ backgroundColor: "var(--surface-3)" }}>
                                <div className="h-full" style={{ width: `${i.pct}%`, backgroundColor: `var(--${lv.tone})` }} />
                              </div>
                              <span className="text-[11px] tnum" style={{ color: "var(--fg-muted)" }}>{i.pct}%</span>
                            </div>
                          </Td>
                          <Td align="right" num>{i.stock.toLocaleString("vi-VN")} {i.unit}</Td>
                          <Td align="right" num>{formatVND(i.value)}</Td>
                          <Td>
                            <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{i.supplier}</span>
                          </Td>
                          <Td align="right">
                            <Button size="sm" variant="outline" icon={Plus} onClick={() => setForm(i)}>Nhập</Button>
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
              </>
            )}
          </Panel>
        </>
      )}

      {/* ── Phiếu nhập / xuất ── */}
      {tab === "moves" && (
        <Panel className="mt-5" flush>
          <Table minWidth={980}>
            <thead>
              <tr>
                <Th>Phiếu</Th>
                <Th>Loại</Th>
                <Th>Nguyên liệu</Th>
                <Th align="right">Số lượng</Th>
                <Th align="right">Giá trị</Th>
                <Th>Chi nhánh</Th>
                <Th>Diễn giải</Th>
                <Th>Người lập</Th>
              </tr>
            </thead>
            <tbody>
              {pagedMoves.map((m) => (
                <Tr key={m.id}>
                  <Td>
                    <div className="font-medium tnum" style={{ color: "var(--fg)" }}>{m.id}</div>
                    <div className="text-[11px] tnum" style={{ color: "var(--fg-subtle)" }}>{formatDate(m.date)}</div>
                  </Td>
                  <Td>
                    <StatusTag tone={m.type === "in" ? "success" : "info"}>
                      {m.type === "in" ? "Nhập kho" : "Xuất kho"}
                    </StatusTag>
                  </Td>
                  <Td>{m.ingredient}</Td>
                  <Td align="right" num>
                    <span style={{ color: m.type === "in" ? "var(--success-fg)" : "var(--fg)" }}>
                      {m.type === "in" ? "+" : "−"}{m.qty.toLocaleString("vi-VN")} {m.unit}
                    </span>
                  </Td>
                  <Td align="right" num>{formatVND(m.value)}</Td>
                  <Td>
                    <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{m.branchName}</span>
                  </Td>
                  <Td>
                    <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{m.note}</span>
                  </Td>
                  <Td>
                    <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{m.by}</span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <div className="px-6 pb-5">
            <Pagination
              currentPage={movePage}
              totalPages={Math.ceil(scopedMoves.length / PAGE_SIZE)}
              onPageChange={setMovePage}
              totalItems={scopedMoves.length}
              itemsPerPage={PAGE_SIZE}
            />
          </div>
        </Panel>
      )}

      {/* ── Nhà cung cấp ── */}
      {tab === "suppliers" && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((s) => {
            const items = list.filter((i) => i.supplierId === s.id);
            return (
              <article
                key={s.id}
                className="border p-5 card-hover"
                style={{
                  borderRadius: "var(--r)",
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Eyebrow className="mb-1.5">{s.cat}</Eyebrow>
                    <h3 className="font-display text-[18px] leading-tight" style={{ color: "var(--fg)" }}>
                      {s.name}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[13px] font-medium tnum shrink-0"
                    style={{ color: "var(--metal)" }}>
                    <Star className="w-3.5 h-3.5" />
                    {s.rating}
                  </span>
                </div>

                <Hairline className="my-4" soft />

                <div className="space-y-2.5 text-[13px]">
                  <div className="flex items-center gap-2" style={{ color: "var(--fg-muted)" }}>
                    <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--fg-subtle)" }} />
                    <span className="tnum">{s.phone}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span style={{ color: "var(--fg-muted)" }}>Mặt hàng cung cấp</span>
                    <span className="font-medium tnum" style={{ color: "var(--fg)" }}>{items.length}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span style={{ color: "var(--fg-muted)" }}>Công nợ phải trả</span>
                    <span className="font-medium tnum" style={{ color: s.debt > 150_000_000 ? "var(--warning-fg)" : "var(--fg)" }}>
                      {formatVND(s.debt)}
                    </span>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {items.slice(0, 3).map((i) => <Tag key={i.id}>{i.name}</Tag>)}
                    {items.length > 3 && <Tag>+{items.length - 3}</Tag>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ReceiveModal open={!!form} ing={form} list={list} onPick={setForm} onClose={() => setForm(null)} onSubmit={receive} />
      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}

/* ═══════════ Phiếu nhập kho ═══════════ */
function ReceiveModal({ open, ing, list, onPick, onClose, onSubmit }) {
  const [qty, setQty] = useState(10);
  const [note, setNote] = useState("");

  if (!ing) return null;

  const after = ing.stock + (Number(qty) || 0);
  const overflow = after > ing.max;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Nhập kho"
      title={ing.name}
      sub={`Tồn hiện tại ${ing.stock} ${ing.unit} · còn dùng được ${ing.daysLeft} ngày`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button icon={Check} onClick={() => onSubmit(ing, qty, note)}>Xác nhận nhập</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Chọn nguyên liệu">
          <Select value={ing.id} onChange={(e) => onPick(list.find((i) => i.id === e.target.value))}>
            {list.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} — còn {i.stock} {i.unit} ({i.daysLeft} ngày)
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={`Số lượng nhập (${ing.unit})`}
          error={overflow ? `Vượt sức chứa kho (tối đa ${ing.max} ${ing.unit})` : ""}
          hint={`Thành tiền ${formatVNDFull((Number(qty) || 0) * ing.price)}`}
        >
          <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
        </Field>

        <div
          className="grid grid-cols-3 gap-px border overflow-hidden"
          style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}
        >
          {[
            ["Nhà cung cấp", ing.supplier],
            ["Đơn giá", formatVNDFull(ing.price)],
            ["Tồn sau nhập", `${after} ${ing.unit}`],
          ].map(([k, v]) => (
            <div key={k} className="px-4 py-3" style={{ backgroundColor: "var(--surface)" }}>
              <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--fg-subtle)" }}>{k}</div>
              <div className="mt-1 text-[13px] font-medium" style={{ color: "var(--fg)" }}>{v}</div>
            </div>
          ))}
        </div>

        <Field label="Diễn giải" hint="Không bắt buộc">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập bổ sung cho tiệc cuối tuần…" />
        </Field>
      </div>
    </Modal>
  );
}
