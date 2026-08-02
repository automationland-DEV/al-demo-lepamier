import { useCallback, useEffect, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { ratePlans as seed, roomTypes, CHANNELS, SEASONS, inventoryCalendar } from "../data/adminData";
import { formatVND, formatVNDFull, formatDate } from "../utils/format";
import { usePalette } from "../theme/palette";
import Pagination from "../components/Pagination";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat, SectionHead,
  Button, IconButton, SearchInput, Select, Field, Input, Tabs,
  Tag, StatusTag, Table, Th, Td, Tr, Modal, EmptyState, Toast,
} from "../components/ui";

/**
 * BẢNG GIÁ — giá bán theo mùa × hạng phòng × kênh phân phối.
 *
 * Ba trục này là lý do một khách sạn không thể chỉ có "một giá": cùng hạng
 * Deluxe, bán qua Booking.com dịp lễ và bán trực tiếp mùa thấp điểm chênh
 * nhau hơn hai lần. Trang gộp cả ba trục vào một bảng, kèm cột "thực thu"
 * (đã trừ hoa hồng) vì đó mới là con số kế toán quan tâm.
 */

const {
  Tags, Plus, Percent, Edit2, Calendar, TrendingUp,
  Check, AlertCircle, Copy, CalendarDays,
} = Icons;

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const SEASON_TONE = { low: "info", normal: "neutral", high: "warning", peak: "danger" };

const PLANS = [...new Set(seed.map((r) => r.plan))];

export default function Rates() {
  const { seriesMap } = usePalette();
  const CH = useMemo(() => seriesMap(CHANNELS.map((c) => c.id)), [seriesMap]);

  const [list, setList] = useState(seed);
  const [tab, setTab] = useState("grid");
  const [plan, setPlan] = useState("all");
  const [roomType, setRoomType] = useState("all");
  const [channel, setChannel] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState(null);
  const [toast, setToast] = useState(null);
  const PAGE_SIZE = 14;

  useEffect(() => setPage(1), [plan, roomType, channel, search, tab]);

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    return list.filter((r) => {
      if (plan !== "all" && r.plan !== plan) return false;
      if (roomType !== "all" && r.roomType !== roomType) return false;
      if (channel !== "all" && r.channel !== channel) return false;
      if (q && !deaccent(`${r.plan} ${r.roomTypeName} ${r.channelName}`).includes(q)) return false;
      return true;
    });
  }, [list, plan, roomType, channel, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avg = filtered.length
    ? Math.round(filtered.reduce((s, r) => s + r.price, 0) / filtered.length)
    : 0;
  const avgNet = filtered.length
    ? Math.round(filtered.reduce((s, r) => s + r.netPrice, 0) / filtered.length)
    : 0;
  const lossPct = avg ? Math.round(((avg - avgNet) / avg) * 100) : 0;
  const activePlans = new Set(list.filter((r) => r.active).map((r) => r.plan)).size;

  /* Ma trận giá: hàng = hạng phòng, cột = kênh. Chỉ hiện khi đã chọn 1 gói,
     vì trộn nhiều gói vào cùng một ô sẽ tạo con số vô nghĩa. */
  const matrixPlan = plan === "all" ? PLANS[0] : plan;
  const matrix = useMemo(() => {
    const rows = roomTypes.map((rt) => {
      const cells = CHANNELS.map((ch) => {
        const hit = list.find((r) => r.plan === matrixPlan && r.roomType === rt.code && r.channel === ch.id);
        return hit || null;
      });
      return { rt, cells };
    });
    return rows;
  }, [list, matrixPlan]);

  const save = useCallback((row) => {
    setList((prev) => prev.map((r) => (r.id === row.id ? row : r)));
    setEdit(null);
    setToast(`Đã cập nhật giá ${row.roomTypeName} · ${row.channelName}`);
  }, []);

  const bumpPlan = useCallback((planName, pct) => {
    setList((prev) =>
      prev.map((r) =>
        r.plan === planName
          ? {
              ...r,
              price: Math.round((r.price * (1 + pct / 100)) / 10000) * 10000,
              netPrice: Math.round((r.price * (1 + pct / 100) * (1 - r.commission / 100)) / 10000) * 10000,
            }
          : r
      )
    );
    setToast(`Đã ${pct > 0 ? "tăng" : "giảm"} ${Math.abs(pct)}% cho gói "${planName}"`);
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Khách sạn"
        title="Bảng giá"
        meta={[
          `${activePlans} gói giá đang hiệu lực`,
          `${roomTypes.length} hạng phòng × ${CHANNELS.length} kênh bán`,
          `Trung bình ${formatVNDFull(avg)} / đêm`,
        ]}
        actions={
          <>
            <Button variant="outline" icon={Copy} onClick={() => setToast("Đã nhân bản gói giá (bản demo)")}>
              Nhân bản gói
            </Button>
            <Button icon={Plus} onClick={() => setToast("Bản demo chỉ minh họa giao diện")}>
              Tạo gói giá
            </Button>
          </>
        }
      />

      <StatStrip cols={4}>
        <Stat label="Giá công bố trung bình" value={formatVNDFull(avg)} icon={Tags}
          hint="Trên phạm vi bộ lọc đang chọn" />
        <Stat label="Thực thu trung bình" value={formatVNDFull(avgNet)} icon={TrendingUp}
          hint="Sau khi trừ hoa hồng kênh bán" />
        <Stat label="Hao hụt hoa hồng" value={`${lossPct}%`} icon={Percent} progress={lossPct}
          hint="Chênh lệch giữa giá công bố và thực thu" />
        <Stat label="Dòng giá" value={filtered.length.toLocaleString("vi-VN")} icon={CalendarDays}
          hint={`${list.length.toLocaleString("vi-VN")} dòng trong toàn bộ hệ thống`} />
      </StatStrip>

      <Tabs
        className="mt-8"
        value={tab}
        onChange={setTab}
        items={[
          { key: "grid", label: "Ma trận giá", icon: Tags },
          { key: "list", label: "Toàn bộ dòng giá", icon: Calendar, count: filtered.length },
          { key: "inventory", label: "Tồn phòng mở bán", icon: CalendarDays },
        ]}
      />

      {tab !== "inventory" && (
        <Toolbar className="mt-5">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo gói giá, hạng phòng hoặc kênh…"
            wrapperClassName="flex-1 min-w-[200px]"
          />
          <Select value={plan} onChange={(e) => setPlan(e.target.value)} wrapperClassName="w-[190px]">
            <option value="all">Tất cả gói giá</option>
            {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Select value={roomType} onChange={(e) => setRoomType(e.target.value)} wrapperClassName="w-[170px]">
            <option value="all">Tất cả hạng phòng</option>
            {roomTypes.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
          </Select>
          <Select value={channel} onChange={(e) => setChannel(e.target.value)} wrapperClassName="w-[190px]">
            <option value="all">Tất cả kênh bán</option>
            {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </Toolbar>
      )}

      {/* ── Ma trận giá ── */}
      {tab === "grid" && (
        <>
          <Panel
            className="mt-5"
            flush
            title={`Gói "${matrixPlan}"`}
            sub="Giá công bố mỗi đêm. Bấm vào ô để chỉnh."
            right={
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="outline" onClick={() => bumpPlan(matrixPlan, -5)}>−5%</Button>
                <Button size="sm" variant="outline" onClick={() => bumpPlan(matrixPlan, 5)}>+5%</Button>
              </div>
            }
          >
            <Table minWidth={940}>
              <thead>
                <tr>
                  <Th>Hạng phòng</Th>
                  {CHANNELS.map((c) => (
                    <Th key={c.id} align="right">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: (CH[c.id] || {}).base }} />
                        {c.label}
                      </span>
                    </Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map(({ rt, cells }) => (
                  <Tr key={rt.code}>
                    <Td>
                      <div className="font-medium" style={{ color: "var(--fg)" }}>{rt.name}</div>
                      <div className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                        Gốc {formatVND(rt.basePrice)}
                      </div>
                    </Td>
                    {cells.map((cell, i) => (
                      <Td key={CHANNELS[i].id} align="right" num>
                        {cell ? (
                          <button
                            type="button"
                            onClick={() => setEdit(cell)}
                            className="inline-flex flex-col items-end px-2 py-1 -mr-2 transition-colors"
                            style={{ borderRadius: "var(--r-sm)" }}
                            title="Bấm để chỉnh giá"
                          >
                            <span className="font-medium tnum" style={{ color: "var(--fg)" }}>
                              {formatVND(cell.price)}
                            </span>
                            {cell.commission > 0 && (
                              <span className="text-[11px] tnum" style={{ color: "var(--fg-subtle)" }}>
                                thực thu {formatVND(cell.netPrice)}
                              </span>
                            )}
                          </button>
                        ) : (
                          <span style={{ color: "var(--fg-subtle)" }}>—</span>
                        )}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>

          <SectionHead
            eyebrow="Tham chiếu"
            title="Hệ số mùa và hoa hồng kênh"
            sub="Hai bảng nền quyết định mọi con số ở ma trận phía trên."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="Hệ số mùa" flush>
              <Table minWidth={320}>
                <thead>
                  <tr><Th>Mùa</Th><Th align="right">Hệ số</Th><Th align="right">Ví dụ hạng Standard</Th></tr>
                </thead>
                <tbody>
                  {SEASONS.map((s) => (
                    <Tr key={s.id}>
                      <Td><StatusTag tone={SEASON_TONE[s.id]}>{s.label}</StatusTag></Td>
                      <Td align="right" num>×{s.factor.toFixed(2)}</Td>
                      <Td align="right" num>{formatVNDFull(Math.round(roomTypes[0].basePrice * s.factor))}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Panel>

            <Panel title="Hoa hồng kênh bán" flush>
              <Table minWidth={320}>
                <thead>
                  <tr><Th>Kênh</Th><Th align="right">Hoa hồng</Th><Th align="right">Thực thu / 1 tr</Th></tr>
                </thead>
                <tbody>
                  {CHANNELS.map((c) => (
                    <Tr key={c.id}>
                      <Td>
                        <span className="inline-flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: (CH[c.id] || {}).base }} />
                          {c.label}
                        </span>
                      </Td>
                      <Td align="right" num>{c.commission}%</Td>
                      <Td align="right" num>{formatVNDFull(Math.round(1_000_000 * (1 - c.commission / 100)))}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Panel>
          </div>
        </>
      )}

      {/* ── Toàn bộ dòng giá ── */}
      {tab === "list" && (
        <Panel className="mt-5" flush>
          {filtered.length === 0 ? (
            <EmptyState icon={Tags} title="Không có dòng giá nào khớp"
              desc="Thử bỏ bớt bộ lọc gói giá, hạng phòng hoặc kênh bán." />
          ) : (
            <>
              <Table minWidth={1040}>
                <thead>
                  <tr>
                    <Th>Gói giá</Th>
                    <Th>Hạng phòng</Th>
                    <Th>Kênh bán</Th>
                    <Th align="right">Giá công bố</Th>
                    <Th align="right">Hoa hồng</Th>
                    <Th align="right">Thực thu</Th>
                    <Th>Hiệu lực</Th>
                    <Th align="right">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r) => (
                    <Tr key={r.id} onClick={() => setEdit(r)}>
                      <Td>
                        <div className="font-medium" style={{ color: "var(--fg)" }}>{r.plan}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <StatusTag tone={SEASON_TONE[r.season]}>
                            {SEASONS.find((s) => s.id === r.season)?.label}
                          </StatusTag>
                          {r.weekendOnly && <Tag>Chỉ cuối tuần</Tag>}
                          {r.minNights > 1 && <Tag>Từ {r.minNights} đêm</Tag>}
                        </div>
                      </Td>
                      <Td>{r.roomTypeName}</Td>
                      <Td>
                        <span className="inline-flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: (CH[r.channel] || {}).base }} />
                          {r.channelName}
                        </span>
                      </Td>
                      <Td align="right" num>{formatVNDFull(r.price)}</Td>
                      <Td align="right" num>{r.commission}%</Td>
                      <Td align="right" num>
                        <span style={{ color: r.commission > 12 ? "var(--warning-fg)" : "var(--fg)" }}>
                          {formatVNDFull(r.netPrice)}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-[12px] tnum" style={{ color: "var(--fg-muted)" }}>
                          {formatDate(r.from)} – {formatDate(r.to)}
                        </span>
                      </Td>
                      <Td align="right">
                        <div onClick={(e) => e.stopPropagation()}>
                          <IconButton icon={Edit2} label="Chỉnh giá" size="sm" onClick={() => setEdit(r)} />
                        </div>
                      </Td>
                    </Tr>
                  ))}
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
      )}

      {/* ── Tồn phòng mở bán ── */}
      {tab === "inventory" && (
        <Panel
          className="mt-5"
          flush
          title="Tồn phòng 14 ngày tới"
          sub="Số phòng đã bán / tổng số phòng mở bán mỗi ngày, theo hạng."
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 1120 }}>
              <thead>
                <tr>
                  <Th className="sticky left-0 z-10">Hạng phòng</Th>
                  {inventoryCalendar[0].days.map((d) => (
                    <Th key={d.date} align="center">
                      {new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                    </Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventoryCalendar.map((row) => (
                  <Tr key={row.roomType}>
                    <Td className="sticky left-0 z-10" style={{ backgroundColor: "var(--surface)" }}>
                      <span className="font-medium">{row.roomTypeName}</span>
                    </Td>
                    {row.days.map((d) => {
                      const pct = Math.round((d.sold / d.total) * 100);
                      const tone = pct >= 90 ? "danger" : pct >= 70 ? "warning" : "success";
                      return (
                        <Td key={d.date} align="center" num>
                          <span
                            className="inline-flex flex-col items-center px-2 py-1"
                            style={{
                              borderRadius: "var(--r-sm)",
                              backgroundColor: `var(--${tone}-soft)`,
                              color: `var(--${tone}-fg)`,
                            }}
                            title={`Còn ${d.total - d.sold} phòng · giá ${formatVNDFull(d.price)}`}
                          >
                            <span className="text-[12px] font-medium tnum">{d.total - d.sold}</span>
                            <span className="text-[10px] tnum">{pct}%</span>
                          </span>
                        </Td>
                      );
                    })}
                  </Tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]"
            style={{ color: "var(--fg-muted)", borderTop: "1px solid var(--border)" }}>
            <span>Số lớn: phòng còn trống · Số nhỏ: tỉ lệ đã bán</span>
            {[["success", "Dưới 70%"], ["warning", "70 – 89%"], ["danger", "Từ 90%"]].map(([t, l]) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `var(--${t})` }} />
                {l}
              </span>
            ))}
          </div>
        </Panel>
      )}

      <RateEditor open={!!edit} row={edit} onClose={() => setEdit(null)} onSave={save} />
      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}

/* ═══════════ Chỉnh một dòng giá ═══════════ */
function RateEditor({ open, row, onClose, onSave }) {
  const [price, setPrice] = useState(0);
  const [minNights, setMinNights] = useState(1);
  const [active, setActive] = useState(true);
  const [lastId, setLastId] = useState(null);

  if (open && row && row.id !== lastId) {
    setLastId(row.id);
    setPrice(row.price);
    setMinNights(row.minNights);
    setActive(row.active);
  }

  if (!row) return null;

  const net = Math.round((price * (1 - row.commission / 100)) / 10000) * 10000;
  const diff = row.price ? Math.round(((price - row.price) / row.price) * 100) : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={row.plan}
      title={`${row.roomTypeName} · ${row.channelName}`}
      sub={`Hiệu lực ${formatDate(row.from)} – ${formatDate(row.to)}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button icon={Check} onClick={() => onSave({ ...row, price, netPrice: net, minNights, active })}>
            Lưu giá
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Giá công bố mỗi đêm (VNĐ)" hint={diff !== 0 ? `${diff > 0 ? "+" : ""}${diff}% so với hiện tại` : undefined}>
          <Input type="number" step={50000} value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} />
        </Field>

        <div
          className="grid grid-cols-3 gap-px border overflow-hidden"
          style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}
        >
          {[
            ["Hoa hồng kênh", `${row.commission}%`],
            ["Thực thu", formatVNDFull(net)],
            ["Chênh lệch", `${formatVND(price - net)}`],
          ].map(([k, v]) => (
            <div key={k} className="px-4 py-3" style={{ backgroundColor: "var(--surface)" }}>
              <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--fg-subtle)" }}>{k}</div>
              <div className="mt-1 text-[14px] font-medium tnum" style={{ color: "var(--fg)" }}>{v}</div>
            </div>
          ))}
        </div>

        <Field label="Số đêm tối thiểu">
          <Input type="number" min={1} max={14} value={minNights} onChange={(e) => setMinNights(Number(e.target.value) || 1)} />
        </Field>

        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 h-11 border transition-colors"
          style={{
            borderRadius: "var(--r-sm)",
            backgroundColor: active ? "var(--success-soft)" : "var(--surface-2)",
            borderColor: active ? "var(--success-border)" : "var(--border)",
            color: active ? "var(--success-fg)" : "var(--fg-muted)",
          }}
        >
          <span className="text-[13px] font-medium">
            {active ? "Đang mở bán trên kênh này" : "Đang tạm ngừng bán"}
          </span>
          {active ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        </button>
      </div>
    </Modal>
  );
}
