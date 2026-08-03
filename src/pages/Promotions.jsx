import { useCallback, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { promotions as seed, CHANNELS } from "../data/adminData";
import { branches } from "../data/mockData";
import { formatVND, formatVNDFull, formatDate } from "../utils/format";
import { usePalette } from "../theme/palette";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat, SectionHead,
  Button, IconButton, SearchInput, Select, Field, Input, Segmented,
  Tag, StatusTag, Table, Th, Td, Tr, Modal, EmptyState, Toast,
  Dropdown, MenuItem, Eyebrow, Hairline,
} from "../components/ui";

/**
 * KHUYẾN MÃI — mã giảm giá và điều kiện áp dụng.
 *
 * Một mã khuyến mãi chỉ có ích khi biết nó "đắt" bao nhiêu. Vì vậy mỗi thẻ
 * hiển thị cả doanh thu mã đó mang về lẫn phần giá trị đã giảm đi, thay vì
 * chỉ đếm số lượt dùng như hầu hết công cụ khuyến mãi.
 */

const {
  TicketPercent, Plus, Copy, Edit2, Trash2, Check, Ban, Percent,
  TrendingUp, Users, AlertCircle, BadgePercent,
} = Icons;

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const SCOPE_LABEL = { room: "Tiền phòng", service: "Dịch vụ", all: "Toàn bộ hóa đơn" };

const EMPTY = {
  code: "", name: "", type: "percent", value: 10, scope: "room",
  minNights: 1, from: "2026-08-02", to: "2026-12-31", limit: 100,
  channels: ["direct"], branches: branches.map((b) => b.id), active: true, desc: "",
};

/** Giá trị đã giảm — mã phần trăm quy đổi trên hóa đơn giả định 3 triệu */
const discountValue = (p) =>
  p.type === "percent" ? Math.round((p.value / 100) * 3_000_000 * p.used) : p.value * p.used;

export default function Promotions() {
  const { seriesMap } = usePalette();
  const S = useMemo(() => seriesMap(["room", "service", "all"]), [seriesMap]);

  const [list, setList] = useState(seed);
  const [state, setState] = useState("all");
  const [scope, setScope] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    return list.filter((p) => {
      if (state === "active" && (!p.active || p.expired)) return false;
      if (state === "scheduled" && new Date(p.from) <= new Date(2026, 7, 2)) return false;
      if (state === "ended" && !p.expired) return false;
      if (scope !== "all" && p.scope !== scope) return false;
      if (q && !deaccent(`${p.code} ${p.name} ${p.desc}`).includes(q)) return false;
      return true;
    });
  }, [list, state, scope, search]);

  const running = list.filter((p) => p.active && !p.expired).length;
  const totalUsed = list.reduce((s, p) => s + p.used, 0);
  const totalRevenue = list.reduce((s, p) => s + p.revenue, 0);
  const totalDiscount = list.reduce((s, p) => s + discountValue(p), 0);

  const save = useCallback((data) => {
    setList((prev) => {
      const exists = prev.some((p) => p.id === data.id);
      return exists ? prev.map((p) => (p.id === data.id ? data : p)) : [data, ...prev];
    });
    setForm(null);
    setToast(seed.some((p) => p.id === data.id) ? "Đã lưu chương trình" : "Đã tạo mã khuyến mãi");
  }, []);

  const toggle = useCallback((p) => {
    setList((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)));
    setToast(p.active ? `Đã tạm dừng mã ${p.code}` : `Đã kích hoạt lại mã ${p.code}`);
  }, []);

  const remove = useCallback((p) => {
    setList((prev) => prev.filter((x) => x.id !== p.id));
    setConfirm(null);
    setToast(`Đã xóa mã ${p.code}`);
  }, []);

  const copy = useCallback((p) => {
    if (navigator.clipboard) navigator.clipboard.writeText(p.code).catch(() => {});
    setToast(`Đã sao chép mã ${p.code}`);
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Marketing"
        title="Khuyến mãi"
        meta={[
          `${running} chương trình đang chạy`,
          `${totalUsed.toLocaleString("vi-VN")} lượt sử dụng`,
          `Doanh thu gắn mã ${formatVND(totalRevenue)}`,
        ]}
        actions={<Button icon={Plus} onClick={() => setForm({ ...EMPTY, id: null })}>Tạo mã khuyến mãi</Button>}
      />

      <StatStrip cols={4}>
        <Stat label="Đang chạy" value={running} icon={TicketPercent}
          hint={`${list.length} chương trình đã tạo`} />
        <Stat label="Lượt sử dụng" value={totalUsed.toLocaleString("vi-VN")} icon={Users}
          hint="Cộng dồn từ đầu chương trình" />
        <Stat label="Doanh thu gắn mã" value={formatVND(totalRevenue)} icon={TrendingUp}
          hint="Đơn hàng có áp dụng khuyến mãi" />
        <Stat label="Giá trị đã giảm" value={formatVND(totalDiscount)} icon={Percent}
          progress={totalRevenue ? Math.min(100, Math.round((totalDiscount / totalRevenue) * 100)) : 0}
          hint="Chi phí thực của các chương trình" />
      </StatStrip>

      <Toolbar className="mt-5">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã hoặc tên chương trình…"
          wrapperClassName="flex-1 min-w-[220px]"
        />
        <Select value={scope} onChange={(e) => setScope(e.target.value)} wrapperClassName="w-[190px]">
          <option value="all">Tất cả phạm vi</option>
          {Object.entries(SCOPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Segmented
          value={state}
          onChange={setState}
          options={[
            { value: "all", label: "Tất cả" },
            { value: "active", label: "Đang chạy" },
            { value: "scheduled", label: "Sắp diễn ra" },
            { value: "ended", label: "Đã kết thúc" },
          ]}
        />
      </Toolbar>

      {filtered.length === 0 ? (
        <Panel className="mt-5">
          <EmptyState
            icon={TicketPercent}
            title="Không có chương trình nào khớp"
            desc="Thử bỏ bớt bộ lọc trạng thái, hoặc tạo một mã khuyến mãi mới."
            action={<Button icon={Plus} onClick={() => setForm({ ...EMPTY, id: null })}>Tạo mã khuyến mãi</Button>}
          />
        </Panel>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const c = S[p.scope] || {};
            const usedPct = p.limit ? Math.min(100, Math.round((p.used / p.limit) * 100)) : null;
            const tone = p.expired ? "neutral" : p.active ? "success" : "warning";
            return (
              <article
                key={p.id}
                className="border p-5 flex flex-col card-hover"
                style={{
                  borderRadius: "var(--r)",
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  boxShadow: "var(--shadow-card)",
                  opacity: p.expired ? 0.72 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => copy(p)}
                      title="Bấm để sao chép mã"
                      className="inline-flex items-center gap-2 h-7 px-2.5 text-[12px] font-semibold tracking-[0.08em] border transition-colors"
                      style={{
                        borderRadius: "var(--r-sm)",
                        backgroundColor: c.soft,
                        borderColor: "var(--border)",
                        color: c.fg,
                      }}
                    >
                      {p.code}
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <h3 className="mt-2.5 font-display text-[19px] leading-tight" style={{ color: "var(--fg)" }}>
                      {p.name}
                    </h3>
                  </div>
                  <StatusTag tone={tone}>
                    {p.expired ? "Đã kết thúc" : p.active ? "Đang chạy" : "Tạm dừng"}
                  </StatusTag>
                </div>

                <p className="mt-2.5 text-[13px] leading-relaxed line-clamp-2" style={{ color: "var(--fg-muted)" }}>
                  {p.desc}
                </p>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-[28px] font-medium tnum" style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}>
                    {p.type === "percent" ? `−${p.value}%` : `−${formatVND(p.value)}`}
                  </span>
                  <span className="text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                    trên {SCOPE_LABEL[p.scope].toLowerCase()}
                  </span>
                </div>

                <Hairline className="my-4" soft />

                <div className="grid grid-cols-2 gap-y-2.5 text-[12px]">
                  {[
                    ["Hiệu lực", `${formatDate(p.from)} – ${formatDate(p.to)}`],
                    ["Điều kiện", p.minNights > 1 ? `Từ ${p.minNights} đêm` : "Không giới hạn"],
                    ["Lượt dùng", p.limit ? `${p.used}/${p.limit}` : `${p.used} (không giới hạn)`],
                    ["Doanh thu", formatVND(p.revenue)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ color: "var(--fg-subtle)" }}>{k}</div>
                      <div className="mt-0.5 font-medium tnum" style={{ color: "var(--fg)" }}>{v}</div>
                    </div>
                  ))}
                </div>

                {usedPct != null && (
                  <div className="mt-4">
                    <div className="h-1 overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
                      <div
                        className="h-full"
                        style={{
                          width: `${usedPct}%`,
                          backgroundColor: usedPct >= 90 ? "var(--danger)" : "var(--accent)",
                          transition: "width .4s var(--ease)",
                        }}
                      />
                    </div>
                    <div className="mt-1.5 text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                      Đã dùng {usedPct}% hạn mức phát hành
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.channels.map((ch) => (
                    <Tag key={ch}>{CHANNELS.find((x) => x.id === ch)?.label || ch}</Tag>
                  ))}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                  <span className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                    {p.branches.length === branches.length ? "Tất cả chi nhánh" : `${p.branches.length} chi nhánh`}
                  </span>
                  <div className="flex items-center gap-1">
                    <IconButton icon={Edit2} label="Sửa chương trình" size="md" onClick={() => setForm(p)} />
                    <Dropdown trigger={<IconButton icon={BadgePercent} label="Thao tác khác" size="md" />}>
                      <MenuItem icon={p.active ? Ban : Check} onClick={() => toggle(p)}>
                        {p.active ? "Tạm dừng chương trình" : "Kích hoạt lại"}
                      </MenuItem>
                      <MenuItem icon={Copy} onClick={() => copy(p)}>Sao chép mã</MenuItem>
                      <MenuItem icon={Trash2} danger onClick={() => setConfirm(p)}>Xóa chương trình</MenuItem>
                    </Dropdown>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <SectionHead
        eyebrow="Đối chiếu"
        title="Hiệu quả từng chương trình"
        sub="Doanh thu mang về so với giá trị đã giảm — cột cuối là phần thực sự có lãi."
      />
      <Panel flush>
        <Table minWidth={920}>
          <thead>
            <tr>
              <Th>Chương trình</Th>
              <Th>Phạm vi</Th>
              <Th align="right">Lượt dùng</Th>
              <Th align="right">Doanh thu</Th>
              <Th align="right">Giá trị đã giảm</Th>
              <Th align="right">Chênh lệch</Th>
              <Th>Trạng thái</Th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const disc = discountValue(p);
              const gap = p.revenue - disc;
              return (
                <Tr key={p.id}>
                  <Td>
                    <div className="font-medium" style={{ color: "var(--fg)" }}>{p.name}</div>
                    <div className="text-[11px] tracking-[0.08em]" style={{ color: "var(--fg-subtle)" }}>{p.code}</div>
                  </Td>
                  <Td><Tag dot={(S[p.scope] || {}).base}>{SCOPE_LABEL[p.scope]}</Tag></Td>
                  <Td align="right" num>{p.used.toLocaleString("vi-VN")}</Td>
                  <Td align="right" num>{formatVND(p.revenue)}</Td>
                  <Td align="right" num>
                    <span style={{ color: "var(--danger-fg)" }}>−{formatVND(disc)}</span>
                  </Td>
                  <Td align="right" num>
                    <span className="font-medium" style={{ color: gap >= 0 ? "var(--success-fg)" : "var(--danger-fg)" }}>
                      {gap >= 0 ? "+" : "−"}{formatVND(Math.abs(gap))}
                    </span>
                  </Td>
                  <Td>
                    <StatusTag tone={p.expired ? "neutral" : p.active ? "success" : "warning"}>
                      {p.expired ? "Đã kết thúc" : p.active ? "Đang chạy" : "Tạm dừng"}
                    </StatusTag>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Panel>

      <PromoForm open={!!form} data={form} onClose={() => setForm(null)} onSave={save} />

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        eyebrow="Xác nhận"
        title={`Xóa mã ${confirm?.code || ""}?`}
        sub="Khách đang giữ mã này sẽ không áp dụng được nữa. Thao tác chỉ ảnh hưởng bản demo."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>Hủy</Button>
            <Button variant="danger" icon={Trash2} onClick={() => remove(confirm)}>Xóa chương trình</Button>
          </>
        }
      >
        <div className="flex items-start gap-3 text-[13px]" style={{ color: "var(--fg-muted)" }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
          <span>
            Mã đã được dùng <strong className="tnum" style={{ color: "var(--fg)" }}>{confirm?.used}</strong> lượt.
            Cân nhắc tạm dừng thay vì xóa để giữ số liệu đối chiếu.
          </span>
        </div>
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}

/* ═══════════ Form tạo / sửa ═══════════ */
function PromoForm({ open, data, onClose, onSave }) {
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
  const toggleIn = (k, val) =>
    setV((p) => ({
      ...p,
      [k]: p[k].includes(val) ? p[k].filter((x) => x !== val) : [...p[k], val],
    }));

  const errCode = touched && !v.code.trim() ? "Bắt buộc nhập mã" : "";
  const errName = touched && !v.name.trim() ? "Bắt buộc nhập tên chương trình" : "";

  const submit = () => {
    setTouched(true);
    if (!v.code.trim() || !v.name.trim()) return;
    onSave({
      ...v,
      id: v.id || `KM-${Date.now().toString().slice(-3)}`,
      code: v.code.toUpperCase().replace(/\s+/g, ""),
      used: v.used || 0,
      revenue: v.revenue || 0,
      expired: new Date(v.to) < new Date(2026, 7, 2),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      eyebrow={data?.id ? "Chỉnh sửa" : "Tạo mới"}
      title={data?.id ? `Sửa ${data.name}` : "Tạo mã khuyến mãi"}
      sub="Mã sẽ áp dụng tự động khi khách nhập đúng và thỏa điều kiện."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button icon={Check} onClick={submit}>{data?.id ? "Lưu thay đổi" : "Tạo chương trình"}</Button>
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Mã khuyến mãi" required error={errCode} hint="Viết liền, không dấu">
          <Input value={v.code} onChange={set("code")} placeholder="HE2026" />
        </Field>
        <Field label="Tên chương trình" required error={errName}>
          <Input value={v.name} onChange={set("name")} placeholder="Ưu đãi hè 2026" />
        </Field>
        <Field label="Kiểu giảm giá">
          <Select value={v.type} onChange={set("type")}>
            <option value="percent">Giảm theo phần trăm</option>
            <option value="fixed">Giảm số tiền cố định</option>
          </Select>
        </Field>
        <Field
          label={v.type === "percent" ? "Mức giảm (%)" : "Số tiền giảm (VNĐ)"}
          hint={v.type === "fixed" ? formatVNDFull(v.value) : undefined}
        >
          <Input type="number" value={v.value} onChange={setNum("value")} step={v.type === "percent" ? 1 : 50000} />
        </Field>
        <Field label="Áp dụng cho">
          <Select value={v.scope} onChange={set("scope")}>
            {Object.entries(SCOPE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </Select>
        </Field>
        <Field label="Số đêm tối thiểu">
          <Input type="number" min={0} max={14} value={v.minNights} onChange={setNum("minNights")} />
        </Field>
        <Field label="Bắt đầu">
          <Input type="date" value={v.from} onChange={set("from")} />
        </Field>
        <Field label="Kết thúc">
          <Input type="date" value={v.to} onChange={set("to")} />
        </Field>
        <Field label="Hạn mức phát hành" hint="Để 0 nếu không giới hạn" className="sm:col-span-2">
          <Input type="number" min={0} value={v.limit} onChange={setNum("limit")} />
        </Field>
        <Field label="Mô tả ngắn" className="sm:col-span-2">
          <Input value={v.desc} onChange={set("desc")} placeholder="Giảm 25% tiền phòng cho kỳ nghỉ hè từ 2 đêm." />
        </Field>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-5">
        <div>
          <Eyebrow className="mb-2.5">Kênh áp dụng</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {CHANNELS.map((ch) => {
              const on = v.channels.includes(ch.id);
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => toggleIn("channels", ch.id)}
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium border transition-colors"
                  style={{
                    borderRadius: "var(--r-sm)",
                    backgroundColor: on ? "var(--accent-soft)" : "var(--surface-2)",
                    borderColor: on ? "var(--accent)" : "var(--border)",
                    color: on ? "var(--accent-fg)" : "var(--fg-muted)",
                  }}
                >
                  {on && <Check className="w-3.5 h-3.5" />}
                  {ch.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Eyebrow className="mb-2.5">Chi nhánh áp dụng</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {branches.map((b) => {
              const on = v.branches.includes(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleIn("branches", b.id)}
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium border transition-colors"
                  style={{
                    borderRadius: "var(--r-sm)",
                    backgroundColor: on ? "var(--accent-soft)" : "var(--surface-2)",
                    borderColor: on ? "var(--accent)" : "var(--border)",
                    color: on ? "var(--accent-fg)" : "var(--fg-muted)",
                  }}
                >
                  {on && <Check className="w-3.5 h-3.5" />}
                  {b.city}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
