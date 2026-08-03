import { useCallback, useEffect, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { invoices as seed } from "../data/adminData";
import { formatVND, formatVNDFull, formatDate } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import { usePalette } from "../theme/palette";
import Pagination from "../components/Pagination";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat,
  Button, IconButton, SearchInput, Select, Field, Segmented,
  StatusTag, Avatar, Table, Th, Td, Tr, Modal, EmptyState, Toast,
  Hairline,
} from "../components/ui";

/**
 * HÓA ĐƠN — chứng từ bán hàng cho từng lượt lưu trú.
 *
 * Hóa đơn không sinh ra từ hư không: mỗi hóa đơn tham chiếu một booking,
 * dòng đầu tiên luôn là tiền phòng (số đêm × giá), các dòng sau là dịch vụ
 * phát sinh. Phí phục vụ 5% và VAT 8% tính chồng lên đúng thứ tự kế toán,
 * nên tổng tiền ở đây khớp với trang Thu chi.
 */

const {
  ReceiptText, Check, Eye, Printer, Download, Wallet, Percent,
  AlertCircle, Send, CircleDollarSign,
} = Icons;

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const STATUS = {
  paid: { tone: "success", label: "Đã thanh toán" },
  open: { tone: "info", label: "Đang mở" },
  unpaid: { tone: "danger", label: "Chưa thanh toán" },
};

const METHODS = ["Tiền mặt", "Thẻ tín dụng", "VNPay", "Chuyển khoản", "Momo"];

export default function Invoices() {
  const { activeBranchId } = useActiveBranch();
  const { seriesMap } = usePalette();
  const K = useMemo(() => seriesMap(["room", "service"]), [seriesMap]);

  const [list, setList] = useState(seed);
  const [status, setStatus] = useState("all");
  const [kind, setKind] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [paying, setPaying] = useState(null);
  const [toast, setToast] = useState(null);
  const PAGE_SIZE = 12;

  useEffect(() => setPage(1), [status, kind, search, activeBranchId]);

  const scoped = useMemo(
    () => (activeBranchId === "ALL" ? list : list.filter((i) => i.branchId === activeBranchId)),
    [list, activeBranchId]
  );

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    return scoped.filter((i) => {
      if (status !== "all" && i.status !== status) return false;
      if (kind === "company" && !i.company) return false;
      if (kind === "personal" && i.company) return false;
      if (q && !deaccent(`${i.id} ${i.guestName} ${i.bookingId} ${i.company || ""} ${i.roomNumber || ""}`).includes(q))
        return false;
      return true;
    });
  }, [scoped, status, kind, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const revenue = filtered.reduce((s, i) => s + i.total, 0);
  const collected = filtered.reduce((s, i) => s + i.paid, 0);
  const outstanding = revenue - collected;
  const vat = filtered.reduce((s, i) => s + i.vat, 0);
  const collectPct = revenue ? Math.round((collected / revenue) * 100) : 0;

  const pay = useCallback((inv, method) => {
    setList((prev) => prev.map((i) => (i.id === inv.id ? { ...i, status: "paid", paid: i.total, method } : i)));
    setPaying(null);
    setDetail(null);
    setToast(`Đã ghi nhận thanh toán ${formatVND(inv.total - inv.paid)} cho ${inv.id}`);
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Tài chính"
        title="Hóa đơn"
        meta={[
          `${filtered.length} hóa đơn trong phạm vi`,
          `Doanh thu ${formatVND(revenue)}`,
          outstanding > 0 ? `Còn phải thu ${formatVND(outstanding)}` : "Đã thu đủ",
        ]}
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={() => setToast("Đã xuất danh sách hóa đơn (bản demo)")}>
              Xuất Excel
            </Button>
            <Button icon={ReceiptText} onClick={() => setToast("Bản demo chỉ minh họa giao diện")}>
              Lập hóa đơn
            </Button>
          </>
        }
      />

      <StatStrip cols={4}>
        <Stat label="Tổng giá trị hóa đơn" value={formatVND(revenue)} icon={ReceiptText}
          hint={`${filtered.length} chứng từ`} />
        <Stat label="Đã thu" value={formatVND(collected)} icon={Wallet} progress={collectPct}
          hint={`Đạt ${collectPct}% giá trị hóa đơn`} />
        <Stat label="Còn phải thu" value={formatVND(outstanding)} icon={AlertCircle}
          hint={`${filtered.filter((i) => i.status !== "paid").length} hóa đơn chưa tất toán`} />
        <Stat label="Thuế GTGT" value={formatVND(vat)} icon={Percent}
          hint="VAT 8% trên giá trị sau phí phục vụ" />
      </StatStrip>

      <Toolbar className="mt-5">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo số hóa đơn, tên khách, mã đặt phòng hoặc số phòng…"
          wrapperClassName="flex-1 min-w-[240px]"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} wrapperClassName="w-[190px]">
          <option value="all">Tất cả trạng thái</option>
          <option value="paid">Đã thanh toán</option>
          <option value="open">Đang mở (khách đang ở)</option>
          <option value="unpaid">Chưa thanh toán</option>
        </Select>
        <Segmented
          value={kind}
          onChange={setKind}
          size="md"
          options={[
            { value: "all", label: "Tất cả" },
            { value: "personal", label: "Cá nhân" },
            { value: "company", label: "Công ty" },
          ]}
        />
      </Toolbar>

      <Panel className="mt-5" flush>
        {filtered.length === 0 ? (
          <EmptyState icon={ReceiptText} title="Không có hóa đơn nào khớp"
            desc="Thử tìm bằng mã đặt phòng, hoặc bỏ bộ lọc trạng thái." />
        ) : (
          <>
            <Table minWidth={1100}>
              <thead>
                <tr>
                  <Th>Hóa đơn</Th>
                  <Th>Khách hàng</Th>
                  <Th>Phòng</Th>
                  <Th align="right">Tiền hàng</Th>
                  <Th align="right">Phí + VAT</Th>
                  <Th align="right">Tổng cộng</Th>
                  <Th align="right">Đã thu</Th>
                  <Th>Trạng thái</Th>
                  <Th align="right">Thao tác</Th>
                </tr>
              </thead>
              <tbody>
                {paged.map((i) => {
                  const st = STATUS[i.status];
                  return (
                    <Tr key={i.id} onClick={() => setDetail(i)}>
                      <Td>
                        <div className="font-medium tnum" style={{ color: "var(--fg)" }}>{i.id}</div>
                        <div className="text-[11px] tnum" style={{ color: "var(--fg-subtle)" }}>
                          {formatDate(i.issued)} · {i.bookingId}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={i.guestName} src={i.guestAvatar} size={30} />
                          <div className="min-w-0">
                            <div className="truncate" style={{ color: "var(--fg)" }}>{i.guestName}</div>
                            {i.company && (
                              <div className="text-[11px] truncate" style={{ color: "var(--fg-subtle)" }}>{i.company}</div>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className="tnum">{i.roomNumber || "—"}</span>
                        <div className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>{i.branchName}</div>
                      </Td>
                      <Td align="right" num>{formatVND(i.subtotal)}</Td>
                      <Td align="right" num>
                        <span style={{ color: "var(--fg-muted)" }}>{formatVND(i.serviceFee + i.vat)}</span>
                      </Td>
                      <Td align="right" num>
                        <span className="font-medium" style={{ color: "var(--fg)" }}>{formatVND(i.total)}</span>
                      </Td>
                      <Td align="right" num>
                        <span style={{ color: i.paid < i.total ? "var(--warning-fg)" : "var(--success-fg)" }}>
                          {formatVND(i.paid)}
                        </span>
                      </Td>
                      <Td><StatusTag tone={st.tone}>{st.label}</StatusTag></Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <IconButton icon={Eye} label="Xem hóa đơn" size="sm" onClick={() => setDetail(i)} />
                          {i.status !== "paid" && (
                            <IconButton icon={CircleDollarSign} label="Ghi nhận thanh toán" size="sm" onClick={() => setPaying(i)} />
                          )}
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
          </>
        )}
      </Panel>

      {/* ── Chi tiết hóa đơn ── */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        wide
        eyebrow={detail ? `${detail.branchName} · ${formatDate(detail.issued)}` : ""}
        title={detail ? `Hóa đơn ${detail.id}` : ""}
        sub={detail ? `Đặt phòng ${detail.bookingId} · Phòng ${detail.roomNumber || "—"}` : ""}
        footer={
          <>
            <Button variant="ghost" icon={Printer} onClick={() => setToast("Đã gửi lệnh in (bản demo)")}>In hóa đơn</Button>
            {detail?.status !== "paid" ? (
              <Button icon={CircleDollarSign} onClick={() => setPaying(detail)}>Ghi nhận thanh toán</Button>
            ) : (
              <Button variant="outline" icon={Send} onClick={() => setToast("Đã gửi hóa đơn qua email (bản demo)")}>
                Gửi cho khách
              </Button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={detail.guestName} src={detail.guestAvatar} size={44} />
                <div>
                  <div className="font-medium" style={{ color: "var(--fg)" }}>{detail.guestName}</div>
                  {detail.company ? (
                    <div className="text-[12px]" style={{ color: "var(--fg-muted)" }}>
                      {detail.company} · MST {detail.taxCode}
                    </div>
                  ) : (
                    <div className="text-[12px]" style={{ color: "var(--fg-muted)" }}>Khách lẻ</div>
                  )}
                </div>
              </div>
              <StatusTag tone={STATUS[detail.status].tone}>{STATUS[detail.status].label}</StatusTag>
            </div>

            <Table minWidth={480}>
              <thead>
                <tr>
                  <Th>Nội dung</Th>
                  <Th align="right">SL</Th>
                  <Th align="right">Đơn giá</Th>
                  <Th align="right">Thành tiền</Th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((it, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <span className="inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: (K[it.kind] || {}).base }} />
                        {it.name}
                      </span>
                    </Td>
                    <Td align="right" num>{it.qty}</Td>
                    <Td align="right" num>{formatVNDFull(it.price)}</Td>
                    <Td align="right" num>{formatVNDFull(it.qty * it.price)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>

            <div className="space-y-2">
              {[
                ["Tiền hàng", detail.subtotal],
                ["Phí phục vụ (5%)", detail.serviceFee],
                ["Thuế GTGT (8%)", detail.vat],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 text-[13px]">
                  <span style={{ color: "var(--fg-muted)" }}>{k}</span>
                  <span className="tnum" style={{ color: "var(--fg)" }}>{formatVNDFull(v)}</span>
                </div>
              ))}
              <Hairline className="my-3" />
              <div className="flex items-center justify-between gap-4">
                <span className="text-[13px] font-medium" style={{ color: "var(--fg)" }}>Tổng cộng</span>
                <span className="text-[22px] font-medium tnum" style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}>
                  {formatVNDFull(detail.total)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-[13px]">
                <span style={{ color: "var(--fg-muted)" }}>
                  Đã thanh toán{detail.method ? ` · ${detail.method}` : ""}
                </span>
                <span className="tnum" style={{ color: "var(--success-fg)" }}>{formatVNDFull(detail.paid)}</span>
              </div>
              {detail.paid < detail.total && (
                <div className="flex items-center justify-between gap-4 text-[13px]">
                  <span style={{ color: "var(--fg-muted)" }}>Còn phải thu</span>
                  <span className="tnum font-medium" style={{ color: "var(--danger-fg)" }}>
                    {formatVNDFull(detail.total - detail.paid)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <PayModal open={!!paying} inv={paying} onClose={() => setPaying(null)} onPay={pay} />
      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}

/* ═══════════ Ghi nhận thanh toán ═══════════ */
function PayModal({ open, inv, onClose, onPay }) {
  const [method, setMethod] = useState(METHODS[0]);
  if (!inv) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={inv.id}
      title="Ghi nhận thanh toán"
      sub={`${inv.guestName} · ${inv.branchName}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button icon={Check} onClick={() => onPay(inv, method)}>Xác nhận đã thu</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          className="grid grid-cols-2 gap-px border overflow-hidden"
          style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}
        >
          {[
            ["Tổng hóa đơn", formatVNDFull(inv.total)],
            ["Còn phải thu", formatVNDFull(inv.total - inv.paid)],
          ].map(([k, v]) => (
            <div key={k} className="px-4 py-3" style={{ backgroundColor: "var(--surface)" }}>
              <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--fg-subtle)" }}>{k}</div>
              <div className="mt-1 text-[15px] font-medium tnum" style={{ color: "var(--fg)" }}>{v}</div>
            </div>
          ))}
        </div>

        <Field label="Hình thức thanh toán">
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            {METHODS.map((m) => <option key={m}>{m}</option>)}
          </Select>
        </Field>

        <div className="flex items-start gap-3 text-[12px]" style={{ color: "var(--fg-muted)" }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--fg-subtle)" }} />
          <span>Giao dịch sẽ đồng thời xuất hiện ở sổ Thu chi. Bản demo chỉ đổi trạng thái trên giao diện.</span>
        </div>
      </div>
    </Modal>
  );
}
