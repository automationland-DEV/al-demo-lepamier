import { useCallback, useEffect, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { transactions as seed, CASH_CATS } from "../data/adminData";
import { branches } from "../data/mockData";
import { formatVND, formatVNDFull, formatDate } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import { usePalette } from "../theme/palette";
import Pagination from "../components/Pagination";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat, SectionHead,
  Button, IconButton, SearchInput, Select, Field, Input, Segmented,
  Tag, StatusTag, Table, Th, Td, Tr, Modal, EmptyState, Toast,
  ChartLegend, axisProps, gridProps, chartTip,
} from "../components/ui";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, BarChart,
} from "recharts";

/**
 * THU CHI — sổ quỹ của cả chuỗi.
 *
 * Trang Báo cáo trả lời "doanh thu bao nhiêu". Trang này trả lời câu khác:
 * "tiền thực sự vào ra thế nào". Doanh thu ghi nhận khi khách trả phòng,
 * còn dòng tiền chỉ động khi tiền chạm tài khoản — hai con số lệch nhau và
 * chính khoảng lệch đó mới làm khách sạn chết vốn.
 */

const {
  ArrowLeftRight, ArrowDownRight, ArrowUpRight, Plus, Check, Download,
  Wallet, AlertCircle,
} = Icons;

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const ALL_CATS = [...CASH_CATS.income, ...CASH_CATS.expense];

const EMPTY = {
  type: "expense", catId: "supply", amount: 5_000_000,
  method: "Chuyển khoản", note: "", branchId: "", date: "2026-08-02",
};

export default function Cashflow() {
  const { activeBranchId } = useActiveBranch();
  const { seriesMap, chart } = usePalette();
  const EXP = useMemo(() => seriesMap(CASH_CATS.expense.map((c) => c.id)), [seriesMap]);
  const [inColor, outColor] = chart(2);

  const [list, setList] = useState(seed);
  const [type, setType] = useState("all");
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const [toast, setToast] = useState(null);
  const PAGE_SIZE = 14;

  useEffect(() => setPage(1), [type, cat, search, activeBranchId]);

  const scoped = useMemo(
    () => (activeBranchId === "ALL" ? list : list.filter((t) => t.branchId === activeBranchId)),
    [list, activeBranchId]
  );

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    return scoped.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (cat !== "all" && t.catId !== cat) return false;
      if (q && !deaccent(`${t.id} ${t.category} ${t.note} ${t.ref} ${t.by}`).includes(q)) return false;
      return true;
    });
  }, [scoped, type, cat, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const income = scoped.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = scoped.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const unapproved = scoped.filter((t) => !t.approved).length;
  const margin = income ? Math.round((net / income) * 100) : 0;

  /* Dòng tiền theo ngày, kèm số dư lũy kế — thấy ngay ngày nào âm quỹ */
  const daily = useMemo(() => {
    const map = new Map();
    scoped.forEach((t) => {
      const d = map.get(t.date) || { date: t.date, income: 0, expense: 0 };
      d[t.type] += t.amount;
      map.set(t.date, d);
    });
    let running = 0;
    return [...map.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => {
        running += d.income - d.expense;
        return {
          ...d,
          label: new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
          expenseNeg: -d.expense,
          balance: running,
        };
      });
  }, [scoped]);

  /* Cơ cấu chi phí — nơi tiền chảy ra */
  const byExpense = useMemo(
    () =>
      CASH_CATS.expense
        .map((c) => ({
          id: c.id,
          name: c.label,
          amount: scoped.filter((t) => t.catId === c.id).reduce((s, t) => s + t.amount, 0),
        }))
        .filter((c) => c.amount > 0)
        .sort((a, b) => b.amount - a.amount),
    [scoped]
  );

  /* Thu chi theo chi nhánh — chỉ có nghĩa khi đang xem toàn hệ thống */
  const byBranch = useMemo(
    () =>
      branches.map((b) => ({
        name: b.code,
        income: list.filter((t) => t.branchId === b.id && t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: list.filter((t) => t.branchId === b.id && t.type === "expense").reduce((s, t) => s + t.amount, 0),
      })),
    [list]
  );

  const add = useCallback((data) => {
    const c = ALL_CATS.find((x) => x.id === data.catId);
    const b = branches.find((x) => x.id === data.branchId) || branches[0];
    setList((prev) => [
      {
        ...data,
        id: `TC-${String(prev.length + 1).padStart(5, "0")}`,
        category: c?.label || "Khác",
        branchId: b.id,
        branchName: b.name,
        branchCode: b.code,
        amount: Number(data.amount) || 0,
        ref: data.type === "income" ? "Thu tay" : "Chi tay",
        by: "Quản trị viên",
        approved: false,
      },
      ...prev,
    ]);
    setForm(null);
    setToast(data.type === "income" ? "Đã ghi phiếu thu" : "Đã ghi phiếu chi");
  }, []);

  const approve = useCallback((t) => {
    setList((prev) => prev.map((x) => (x.id === t.id ? { ...x, approved: true } : x)));
    setToast(`Đã duyệt phiếu ${t.id}`);
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Tài chính"
        title="Thu chi"
        meta={[
          `${scoped.length} giao dịch 45 ngày gần nhất`,
          `Dòng tiền thuần ${formatVND(net)}`,
          unapproved ? `${unapproved} phiếu chờ duyệt` : "Đã duyệt hết",
        ]}
        live={unapproved > 0}
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={() => setToast("Đã xuất sổ quỹ (bản demo)")}>
              Xuất sổ quỹ
            </Button>
            <Button icon={Plus} onClick={() => setForm({ ...EMPTY, branchId: branches[0].id })}>
              Ghi phiếu
            </Button>
          </>
        }
      />

      <StatStrip cols={4}>
        <Stat label="Tổng thu" value={formatVND(income)} icon={ArrowDownRight}
          hint={`${scoped.filter((t) => t.type === "income").length} phiếu thu`} />
        <Stat label="Tổng chi" value={formatVND(expense)} icon={ArrowUpRight}
          hint={`${scoped.filter((t) => t.type === "expense").length} phiếu chi`} />
        <Stat label="Dòng tiền thuần" value={formatVND(net)} icon={Wallet}
          delta={margin} deltaSuffix="%" hint="Chênh lệch thu trừ chi" />
        <Stat label="Phiếu chờ duyệt" value={unapproved} icon={AlertCircle}
          hint={unapproved ? "Cần duyệt trước khi khóa sổ" : "Sổ quỹ đã sạch"} />
      </StatStrip>

      <SectionHead
        eyebrow="Dòng tiền"
        title="Thu chi và số dư lũy kế"
        sub="Cột là thu chi trong ngày, đường là số dư cộng dồn từ đầu kỳ."
      />
      <Panel>
        <ChartLegend
          className="mb-4"
          items={[
            { label: "Thu trong ngày", color: inColor, area: true },
            { label: "Chi trong ngày", color: outColor, area: true },
            { label: "Số dư lũy kế", color: "var(--metal)" },
          ]}
        />
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={daily} margin={{ top: 4, right: 8, left: 8, bottom: 4 }} stackOffset="sign">
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
              {/* Cột chi vẽ xuống dưới trục nên giá trị âm — nhãn phải giữ dấu,
                  nếu chỉ lấy trị tuyệt đối thì mốc dưới cùng đọc ra số dương sai */}
              <YAxis
                {...axisProps}
                tickFormatter={(v) => (v < 0 ? "−" : "") + formatVND(Math.abs(v))}
                width={68}
              />
              <Tooltip
                {...chartTip}
                formatter={(v, n) => [
                  formatVNDFull(Math.abs(v)),
                  n === "income" ? "Thu" : n === "expenseNeg" ? "Chi" : "Số dư lũy kế",
                ]}
              />
              <Bar dataKey="income" stackId="cash" fill={inColor} radius={[3, 3, 0, 0]} maxBarSize={22} />
              <Bar dataKey="expenseNeg" stackId="cash" fill={outColor} radius={[0, 0, 3, 3]} maxBarSize={22} />
              <Line type="monotone" dataKey="balance" stroke="var(--metal)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Cơ cấu chi phí" sub="Tiền chảy ra ở đâu nhiều nhất">
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byExpense} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid {...gridProps} horizontal={false} vertical />
                <XAxis type="number" {...axisProps} tickFormatter={(v) => formatVND(v)} />
                <YAxis type="category" dataKey="name" {...axisProps} width={128} />
                <Tooltip {...chartTip} formatter={(v) => [formatVNDFull(v), "Chi phí"]} />
                <Bar dataKey="amount" radius={[0, 3, 3, 0]} maxBarSize={20}>
                  {byExpense.map((c) => <Cell key={c.id} fill={(EXP[c.id] || {}).base || outColor} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Thu chi theo chi nhánh" sub="Toàn hệ thống, không phụ thuộc chi nhánh đang chọn">
          <ChartLegend
            className="mb-4"
            items={[{ label: "Thu", color: inColor, area: true }, { label: "Chi", color: outColor, area: true }]}
          />
          <div style={{ height: 232 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byBranch} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={(v) => formatVND(v)} width={64} />
                <Tooltip {...chartTip} formatter={(v, n) => [formatVNDFull(v), n === "income" ? "Thu" : "Chi"]} />
                <Bar dataKey="income" fill={inColor} radius={[3, 3, 0, 0]} maxBarSize={26} />
                <Bar dataKey="expense" fill={outColor} radius={[3, 3, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <SectionHead
        eyebrow="Sổ quỹ"
        title="Danh sách giao dịch"
        sub="Phiếu chưa duyệt không được tính vào báo cáo khóa sổ."
        right={
          <Segmented
            value={type}
            onChange={setType}
            size="sm"
            options={[
              { value: "all", label: "Tất cả" },
              { value: "income", label: "Thu" },
              { value: "expense", label: "Chi" },
            ]}
          />
        }
      />

      <Toolbar>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo số phiếu, khoản mục, diễn giải hoặc người lập…"
          wrapperClassName="flex-1 min-w-[240px]"
        />
        <Select value={cat} onChange={(e) => setCat(e.target.value)} wrapperClassName="w-[220px]">
          <option value="all">Tất cả khoản mục</option>
          <optgroup label="Khoản thu">
            {CASH_CATS.income.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </optgroup>
          <optgroup label="Khoản chi">
            {CASH_CATS.expense.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </optgroup>
        </Select>
      </Toolbar>

      <Panel className="mt-5" flush>
        {filtered.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="Không có giao dịch nào khớp"
            desc="Thử bỏ bớt bộ lọc khoản mục, hoặc chuyển sang xem tất cả chi nhánh." />
        ) : (
          <>
            <Table minWidth={1060}>
              <thead>
                <tr>
                  <Th>Phiếu</Th>
                  <Th>Khoản mục</Th>
                  <Th>Chi nhánh</Th>
                  <Th>Diễn giải</Th>
                  <Th>Hình thức</Th>
                  <Th align="right">Số tiền</Th>
                  <Th>Trạng thái</Th>
                  <Th align="right">Thao tác</Th>
                </tr>
              </thead>
              <tbody>
                {paged.map((t) => {
                  const isIn = t.type === "income";
                  return (
                    <Tr key={t.id}>
                      <Td>
                        <div className="font-medium tnum" style={{ color: "var(--fg)" }}>{t.id}</div>
                        <div className="text-[11px] tnum" style={{ color: "var(--fg-subtle)" }}>
                          {formatDate(t.date)} · {t.ref}
                        </div>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: isIn ? "var(--success)" : (EXP[t.catId] || {}).base }}
                          />
                          {t.category}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{t.branchCode}</span>
                      </Td>
                      <Td>
                        <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{t.note}</span>
                        <div className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>{t.by}</div>
                      </Td>
                      <Td><Tag>{t.method}</Tag></Td>
                      <Td align="right" num>
                        <span className="font-medium" style={{ color: isIn ? "var(--success-fg)" : "var(--danger-fg)" }}>
                          {isIn ? "+" : "−"}{formatVND(t.amount)}
                        </span>
                      </Td>
                      <Td>
                        <StatusTag tone={t.approved ? "success" : "warning"}>
                          {t.approved ? "Đã duyệt" : "Chờ duyệt"}
                        </StatusTag>
                      </Td>
                      <Td align="right">
                        {!t.approved && (
                          <IconButton icon={Check} label="Duyệt phiếu" size="sm" onClick={() => approve(t)} />
                        )}
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

      <TxForm open={!!form} data={form} onClose={() => setForm(null)} onSave={add} />
      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}

/* ═══════════ Ghi phiếu thu / chi ═══════════ */
function TxForm({ open, data, onClose, onSave }) {
  const [v, setV] = useState(EMPTY);
  const [lastOpen, setLastOpen] = useState(false);

  if (open !== lastOpen) {
    setLastOpen(open);
    if (open && data) setV(data);
  }

  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));
  const cats = v.type === "income" ? CASH_CATS.income : CASH_CATS.expense;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Sổ quỹ"
      title={v.type === "income" ? "Ghi phiếu thu" : "Ghi phiếu chi"}
      sub="Phiếu mới ở trạng thái chờ duyệt cho tới khi kế toán trưởng xác nhận."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button icon={Check} onClick={() => onSave(v)}>Lưu phiếu</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Segmented
          value={v.type}
          onChange={(t) =>
            setV((p) => ({ ...p, type: t, catId: (t === "income" ? CASH_CATS.income : CASH_CATS.expense)[0].id }))
          }
          options={[
            { value: "income", label: "Phiếu thu", icon: ArrowDownRight },
            { value: "expense", label: "Phiếu chi", icon: ArrowUpRight },
          ]}
          className="w-full"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Khoản mục">
            <Select value={v.catId} onChange={set("catId")}>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
          </Field>
          <Field label="Chi nhánh">
            <Select value={v.branchId} onChange={set("branchId")}>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
          <Field label="Số tiền (VNĐ)" hint={formatVNDFull(Number(v.amount) || 0)}>
            <Input type="number" step={100000} value={v.amount} onChange={set("amount")} />
          </Field>
          <Field label="Hình thức">
            <Select value={v.method} onChange={set("method")}>
              {["Tiền mặt", "Chuyển khoản", "Thẻ", "VNPay", "Momo"].map((m) => <option key={m}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Ngày ghi sổ">
            <Input type="date" value={v.date} onChange={set("date")} />
          </Field>
          <Field label="Diễn giải">
            <Input value={v.note} onChange={set("note")} placeholder="Chi mua nguyên liệu bếp…" />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
