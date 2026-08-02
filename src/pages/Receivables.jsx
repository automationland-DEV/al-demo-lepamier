import { useCallback, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { receivables as seed, agingBuckets } from "../data/adminData";
import { formatVND, formatVNDFull, formatDate } from "../utils/format";
import { usePalette } from "../theme/palette";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat, SectionHead,
  Button, IconButton, SearchInput, Select, Field, Input,
  Tag, StatusTag, Table, Th, Td, Tr, Modal, EmptyState, Toast,
  ChartLegend, axisProps, gridProps, chartTip,
} from "../components/ui";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

/**
 * CÔNG NỢ PHẢI THU — tiền đã ghi doanh thu nhưng chưa về tài khoản.
 *
 * Cách nhìn chuẩn của kế toán là "phân tuổi nợ" (aging): cùng 200 triệu
 * nhưng nợ trong hạn và nợ quá 60 ngày là hai câu chuyện khác hẳn. Vì vậy
 * trang mở đầu bằng bốn rổ tuổi nợ, rồi mới tới danh sách đối tượng.
 */

const {
  Landmark, Send, Phone, Mail, Check, Eye, AlertTriangle,
  Clock, Download, CircleDollarSign,
} = Icons;

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const TYPE_LABEL = { ota: "Đối tác OTA", corp: "Khách doanh nghiệp", agency: "Đại lý" };

export default function Receivables() {
  const { seriesMap, chart } = usePalette();
  const T = useMemo(() => seriesMap(["ota", "corp", "agency"]), [seriesMap]);
  const [barColor] = chart(1);

  const [list, setList] = useState(seed);
  const [bucket, setBucket] = useState("all");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [remind, setRemind] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    return list.filter((d) => {
      if (bucket !== "all" && d.bucket !== bucket) return false;
      if (type !== "all" && d.type !== type) return false;
      if (q && !deaccent(`${d.name} ${d.contact}`).includes(q)) return false;
      return true;
    });
  }, [list, bucket, type, search]);

  const total = list.reduce((s, d) => s + d.total, 0);
  const overdue = list.filter((d) => d.worstOverdue > 0).reduce((s, d) => s + d.total, 0);
  const worst = list.filter((d) => d.bucket === "d90").reduce((s, d) => s + d.total, 0);
  const avgTerm = list.length ? Math.round(list.reduce((s, d) => s + d.term, 0) / list.length) : 0;

  /* Bốn rổ tuổi nợ — nền của cả trang */
  const aging = useMemo(
    () =>
      agingBuckets.map((b) => {
        const items = list.filter((d) => d.bucket === b.id);
        return {
          id: b.id,
          name: b.label,
          tone: b.tone,
          count: items.length,
          amount: items.reduce((s, d) => s + d.total, 0),
        };
      }),
    [list]
  );

  const settle = useCallback((debtor) => {
    setList((prev) =>
      prev.map((d) =>
        d.id === debtor.id
          ? { ...d, total: 0, worstOverdue: 0, bucket: "current", docs: d.docs.map((x) => ({ ...x, paid: x.amount, overdueDays: 0 })) }
          : d
      )
    );
    setDetail(null);
    setToast(`Đã tất toán công nợ ${debtor.name}`);
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Tài chính"
        title="Công nợ phải thu"
        meta={[
          `${list.length} đối tượng công nợ`,
          `Tổng dư nợ ${formatVND(total)}`,
          `Quá hạn ${formatVND(overdue)}`,
        ]}
        live={worst > 0}
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={() => setToast("Đã xuất báo cáo tuổi nợ (bản demo)")}>
              Xuất báo cáo
            </Button>
            <Button icon={Send} onClick={() => setRemind(filtered[0] || list[0])}>Gửi nhắc nợ</Button>
          </>
        }
      />

      <StatStrip cols={4}>
        <Stat label="Tổng dư nợ" value={formatVND(total)} icon={Landmark}
          hint={`Trên ${list.reduce((s, d) => s + d.docs.length, 0)} chứng từ`} />
        <Stat label="Nợ quá hạn" value={formatVND(overdue)} icon={AlertTriangle}
          progress={total ? Math.round((overdue / total) * 100) : 0}
          hint={`Chiếm ${total ? Math.round((overdue / total) * 100) : 0}% dư nợ`} />
        <Stat label="Quá hạn trên 60 ngày" value={formatVND(worst)} icon={Clock}
          hint="Nhóm rủi ro cao, cần can thiệp" />
        <Stat label="Kỳ hạn thanh toán bình quân" value={`${avgTerm} ngày`} icon={CircleDollarSign}
          hint="Theo hợp đồng đã ký với đối tác" />
      </StatStrip>

      {/* Rổ tuổi nợ — bấm để lọc */}
      <div className="mt-5 grid gap-px border overflow-hidden grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ borderRadius: "var(--r)", backgroundColor: "var(--border)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
        {aging.map((b) => {
          const on = bucket === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setBucket(on ? "all" : b.id)}
              className="p-5 text-left transition-colors"
              style={{ backgroundColor: on ? "var(--surface-2)" : "var(--surface)" }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: `var(--${b.tone})` }} />
                <span className="text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: "var(--fg-subtle)" }}>
                  {b.name}
                </span>
              </div>
              <div className="mt-2.5 text-[24px] font-medium tnum" style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}>
                {formatVND(b.amount)}
              </div>
              <div className="mt-1 text-[12px]" style={{ color: "var(--fg-muted)" }}>
                {b.count} đối tượng
              </div>
            </button>
          );
        })}
      </div>

      <Toolbar className="mt-5">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên đối tác hoặc email kế toán…"
          wrapperClassName="flex-1 min-w-[220px]"
        />
        <Select value={type} onChange={(e) => setType(e.target.value)} wrapperClassName="w-[200px]">
          <option value="all">Tất cả loại đối tượng</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Select value={bucket} onChange={(e) => setBucket(e.target.value)} wrapperClassName="w-[200px]">
          <option value="all">Tất cả tuổi nợ</option>
          {agingBuckets.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </Select>
      </Toolbar>

      <Panel className="mt-5" flush>
        {filtered.length === 0 ? (
          <EmptyState icon={Landmark} title="Không có công nợ nào khớp"
            desc="Thử bỏ bớt bộ lọc tuổi nợ hoặc loại đối tượng." />
        ) : (
          <Table minWidth={1020}>
            <thead>
              <tr>
                <Th>Đối tượng</Th>
                <Th>Loại</Th>
                <Th align="right">Kỳ hạn</Th>
                <Th align="right">Chứng từ</Th>
                <Th align="right">Quá hạn lâu nhất</Th>
                <Th align="right">Dư nợ</Th>
                <Th>Tuổi nợ</Th>
                <Th align="right">Thao tác</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const c = T[d.type] || {};
                const b = agingBuckets.find((x) => x.id === d.bucket);
                return (
                  <Tr key={d.id} onClick={() => setDetail(d)}>
                    <Td>
                      <div className="font-medium" style={{ color: "var(--fg)" }}>{d.name}</div>
                      <div className="text-[11px] truncate" style={{ color: "var(--fg-subtle)", maxWidth: 240 }}>
                        {d.contact}
                      </div>
                    </Td>
                    <Td><Tag dot={c.base}>{d.typeName}</Tag></Td>
                    <Td align="right" num>{d.term} ngày</Td>
                    <Td align="right" num>{d.docs.length}</Td>
                    <Td align="right" num>
                      <span style={{ color: d.worstOverdue > 30 ? "var(--danger-fg)" : d.worstOverdue > 0 ? "var(--warning-fg)" : "var(--fg-muted)" }}>
                        {d.worstOverdue > 0 ? `${d.worstOverdue} ngày` : "Trong hạn"}
                      </span>
                    </Td>
                    <Td align="right" num>
                      <span className="font-medium" style={{ color: "var(--fg)" }}>{formatVND(d.total)}</span>
                    </Td>
                    <Td><StatusTag tone={b.tone}>{b.label}</StatusTag></Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <IconButton icon={Send} label="Gửi nhắc nợ" size="sm" onClick={() => setRemind(d)} />
                        <IconButton icon={Eye} label="Xem chứng từ" size="sm" onClick={() => setDetail(d)} />
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Panel>

      <SectionHead
        eyebrow="Phân tích"
        title="Dư nợ theo tuổi nợ"
        sub="Nợ càng già thì khả năng thu hồi càng thấp — cột bên phải là phần cần xử lý trước."
      />
      <Panel>
        <ChartLegend className="mb-4" items={[{ label: "Dư nợ theo rổ tuổi", color: barColor }]} />
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aging} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => formatVND(v)} width={64} />
              <Tooltip {...chartTip} formatter={(v, _n, p) => [formatVNDFull(v), `${p.payload.count} đối tượng`]} />
              <Bar dataKey="amount" radius={[3, 3, 0, 0]} maxBarSize={72}>
                {aging.map((b) => <Cell key={b.id} fill={`var(--${b.tone})`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* ── Chứng từ của một đối tượng ── */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        wide
        eyebrow={detail?.typeName}
        title={detail?.name || ""}
        sub={detail ? `Kỳ hạn ${detail.term} ngày · ${detail.docs.length} chứng từ` : ""}
        footer={
          <>
            <Button variant="ghost" icon={Send} onClick={() => { setRemind(detail); setDetail(null); }}>
              Gửi nhắc nợ
            </Button>
            <Button icon={Check} onClick={() => settle(detail)} disabled={!detail?.total}>
              Tất toán công nợ
            </Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-4 text-[13px]">
              <span className="inline-flex items-center gap-2" style={{ color: "var(--fg-muted)" }}>
                <Mail className="w-3.5 h-3.5" style={{ color: "var(--fg-subtle)" }} />
                <span className="truncate">{detail.contact}</span>
              </span>
              <span className="inline-flex items-center gap-2" style={{ color: "var(--fg-muted)" }}>
                <Phone className="w-3.5 h-3.5" style={{ color: "var(--fg-subtle)" }} />
                <span className="tnum">{detail.phone}</span>
              </span>
            </div>

            <Table minWidth={520}>
              <thead>
                <tr>
                  <Th>Chứng từ</Th>
                  <Th align="right">Hạn thanh toán</Th>
                  <Th align="right">Quá hạn</Th>
                  <Th align="right">Còn nợ</Th>
                </tr>
              </thead>
              <tbody>
                {detail.docs.map((doc) => (
                  <Tr key={doc.id}>
                    <Td>
                      <div className="tnum font-medium" style={{ color: "var(--fg)" }}>{doc.invoiceId}</div>
                      <div className="text-[11px] tnum" style={{ color: "var(--fg-subtle)" }}>
                        Phát hành {formatDate(doc.issued)}
                      </div>
                    </Td>
                    <Td align="right" num>{formatDate(doc.due)}</Td>
                    <Td align="right" num>
                      <span style={{ color: doc.overdueDays > 0 ? "var(--danger-fg)" : "var(--fg-muted)" }}>
                        {doc.overdueDays > 0 ? `${doc.overdueDays} ngày` : "—"}
                      </span>
                    </Td>
                    <Td align="right" num>{formatVNDFull(doc.amount - doc.paid)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>

            <div className="flex items-center justify-between gap-4 pt-1">
              <span className="text-[13px] font-medium" style={{ color: "var(--fg)" }}>Tổng dư nợ</span>
              <span className="text-[22px] font-medium tnum" style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}>
                {formatVNDFull(detail.total)}
              </span>
            </div>
          </div>
        )}
      </Modal>

      <RemindModal open={!!remind} debtor={remind} onClose={() => setRemind(null)}
        onSend={(d) => { setRemind(null); setToast(`Đã gửi email nhắc nợ tới ${d.name}`); }} />
      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}

/* ═══════════ Email nhắc nợ ═══════════ */
function RemindModal({ open, debtor, onClose, onSend }) {
  const [tone, setTone] = useState("polite");
  if (!debtor) return null;

  const BODY = {
    polite: `Kính gửi Quý đối tác ${debtor.name},\n\nCondo HUB xin thông báo hiện còn ${formatVNDFull(debtor.total)} chưa được thanh toán theo các chứng từ đính kèm. Rất mong Quý đối tác sắp xếp thanh toán trong thời gian sớm nhất.\n\nTrân trọng cảm ơn.`,
    firm: `Kính gửi Quý đối tác ${debtor.name},\n\nKhoản công nợ ${formatVNDFull(debtor.total)} đã quá hạn ${debtor.worstOverdue} ngày so với thỏa thuận thanh toán ${debtor.term} ngày. Đề nghị Quý đối tác thanh toán trước ngày 15 tháng này để tránh ảnh hưởng đến hợp tác.\n\nTrân trọng.`,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      eyebrow="Nhắc nợ"
      title={`Gửi email tới ${debtor.name}`}
      sub={`Dư nợ ${formatVNDFull(debtor.total)} · quá hạn lâu nhất ${debtor.worstOverdue} ngày`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button icon={Send} onClick={() => onSend(debtor)}>Gửi email</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Người nhận">
          <Input value={debtor.contact} readOnly />
        </Field>

        <div className="flex gap-2">
          {[
            { id: "polite", label: "Nhắc nhẹ nhàng" },
            { id: "firm", label: "Nhắc dứt khoát" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTone(t.id)}
              className="h-9 px-3.5 text-[12px] font-medium border transition-colors"
              style={{
                borderRadius: "var(--r-sm)",
                backgroundColor: tone === t.id ? "var(--accent-soft)" : "var(--surface-2)",
                borderColor: tone === t.id ? "var(--accent)" : "var(--border)",
                color: tone === t.id ? "var(--accent-fg)" : "var(--fg-muted)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Field label="Nội dung email">
          <textarea
            readOnly
            rows={8}
            value={BODY[tone]}
            className="w-full p-3 text-[13px] leading-relaxed border outline-none resize-y"
            style={{
              borderRadius: "var(--r-sm)",
              backgroundColor: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
          />
        </Field>
      </div>
    </Modal>
  );
}
