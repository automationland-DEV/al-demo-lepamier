import { useCallback, useEffect, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { payroll as seed, timesheet, payrollPeriods } from "../data/adminData";
import { branches } from "../data/mockData";
import { formatVND, formatVNDFull } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import { usePalette } from "../theme/palette";
import Pagination from "../components/Pagination";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat,
  Button, IconButton, SearchInput, Select, Tabs,
  StatusTag, Avatar, Table, Th, Td, Tr, Modal, EmptyState, Toast,
  Eyebrow, Hairline,
} from "../components/ui";

/**
 * BẢNG CÔNG & LƯƠNG — chốt công, tính lương và duyệt chi.
 *
 * Lương ở đây không phải một con số nhập tay: nó cộng từ ngày công thực tế,
 * giờ tăng ca, phụ cấp, tip, thưởng rồi trừ bảo hiểm và khấu trừ. Mọi thành
 * phần đều hiện trong phiếu lương, để khi nhân viên thắc mắc thì mở ra là
 * đối chiếu được ngay.
 */

const {
  CalendarClock, Wallet, Check, Eye, Download, Users, Timer,
  AlertCircle, Printer, Ban,
} = Icons;

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const STATUS = {
  approved: { tone: "success", label: "Đã duyệt" },
  pending: { tone: "warning", label: "Chờ duyệt" },
  draft: { tone: "neutral", label: "Nháp" },
};

const DAY_TONE = { work: "success", off: "neutral", leave: "warning" };
const DAY_LABEL = { work: "Đi làm", off: "Nghỉ tuần", leave: "Nghỉ phép" };

export default function Payroll() {
  const { activeBranchId } = useActiveBranch();
  const { seriesMap } = usePalette();
  const ROLES = useMemo(() => [...new Set(seed.map((p) => p.role))], []);
  const R = useMemo(() => seriesMap(ROLES), [seriesMap, ROLES]);

  const [list, setList] = useState(seed);
  const [tab, setTab] = useState("payroll");
  const [period, setPeriod] = useState(payrollPeriods[0]);
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [slip, setSlip] = useState(null);
  const [toast, setToast] = useState(null);
  const PAGE_SIZE = 12;

  useEffect(() => setPage(1), [status, role, search, activeBranchId, period]);

  const scoped = useMemo(
    () => (activeBranchId === "ALL" ? list : list.filter((p) => p.branchId === activeBranchId)),
    [list, activeBranchId]
  );

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    return scoped.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (role !== "all" && p.role !== role) return false;
      if (q && !deaccent(`${p.name} ${p.roleLabel}`).includes(q)) return false;
      return true;
    });
  }, [scoped, status, role, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalNet = filtered.reduce((s, p) => s + p.net, 0);
  const totalOt = filtered.reduce((s, p) => s + p.otPay, 0);
  const totalOtHours = filtered.reduce((s, p) => s + p.otHours, 0);
  const pending = scoped.filter((p) => p.status !== "approved").length;
  const avgAttendance = filtered.length
    ? Math.round((filtered.reduce((s, p) => s + p.workedDays / p.standardDays, 0) / filtered.length) * 100)
    : 0;

  const approve = useCallback((row) => {
    setList((prev) => prev.map((p) => (p.id === row.id ? { ...p, status: "approved" } : p)));
    setToast(`Đã duyệt lương cho ${row.name}`);
  }, []);

  const approveAll = useCallback(() => {
    const ids = new Set(filtered.filter((p) => p.status !== "approved").map((p) => p.id));
    if (!ids.size) return;
    setList((prev) => prev.map((p) => (ids.has(p.id) ? { ...p, status: "approved" } : p)));
    setToast(`Đã duyệt ${ids.size} phiếu lương`);
  }, [filtered]);

  return (
    <Page>
      <PageHeader
        eyebrow="Nhân sự"
        title="Bảng công & Lương"
        meta={[
          `Kỳ lương ${period.split("-").reverse().join("/")}`,
          `${filtered.length} nhân viên trong phạm vi`,
          `Tổng chi ${formatVND(totalNet)}`,
        ]}
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={() => setToast("Đã xuất bảng lương (bản demo)")}>
              Xuất Excel
            </Button>
            <Button icon={Check} onClick={approveAll} disabled={!filtered.some((p) => p.status !== "approved")}>
              Duyệt toàn bộ
            </Button>
          </>
        }
      />

      <StatStrip cols={4}>
        <Stat label="Tổng chi lương" value={formatVND(totalNet)} icon={Wallet}
          hint="Thực nhận sau bảo hiểm và khấu trừ" />
        <Stat label="Chi phí tăng ca" value={formatVND(totalOt)} icon={Timer}
          hint={`${totalOtHours.toLocaleString("vi-VN")} giờ tăng ca`} />
        <Stat label="Tỉ lệ chuyên cần" value={`${avgAttendance}%`} icon={Users} progress={avgAttendance}
          hint="Ngày công thực tế / ngày công chuẩn" />
        <Stat label="Phiếu chờ duyệt" value={pending} icon={AlertCircle}
          hint={pending ? "Cần duyệt trước ngày chốt kỳ" : "Đã duyệt hết"} />
      </StatStrip>

      <Tabs
        className="mt-8"
        value={tab}
        onChange={setTab}
        items={[
          { key: "payroll", label: "Bảng lương", icon: Wallet, count: filtered.length },
          { key: "timesheet", label: "Bảng công tháng", icon: CalendarClock },
        ]}
      />

      {/* ── Bảng lương ── */}
      {tab === "payroll" && (
        <>
          <Toolbar className="mt-5">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên nhân viên hoặc vị trí…"
              wrapperClassName="flex-1 min-w-[200px]"
            />
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} wrapperClassName="w-[150px]">
              {payrollPeriods.map((p) => (
                <option key={p} value={p}>Kỳ {p.split("-").reverse().join("/")}</option>
              ))}
            </Select>
            <Select value={role} onChange={(e) => setRole(e.target.value)} wrapperClassName="w-[170px]">
              <option value="all">Tất cả vị trí</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{seed.find((p) => p.role === r)?.roleLabel}</option>
              ))}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} wrapperClassName="w-[160px]">
              <option value="all">Tất cả trạng thái</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
              <option value="draft">Nháp</option>
            </Select>
          </Toolbar>

          <Panel className="mt-5" flush>
            {filtered.length === 0 ? (
              <EmptyState icon={Wallet} title="Không có phiếu lương nào khớp"
                desc="Thử bỏ bớt bộ lọc vị trí hoặc trạng thái." />
            ) : (
              <>
                <Table minWidth={1120}>
                  <thead>
                    <tr>
                      <Th>Nhân viên</Th>
                      <Th align="right">Ngày công</Th>
                      <Th align="right">Tăng ca</Th>
                      <Th align="right">Lương cơ bản</Th>
                      <Th align="right">Phụ cấp + Tip</Th>
                      <Th align="right">Khấu trừ</Th>
                      <Th align="right">Thực nhận</Th>
                      <Th>Trạng thái</Th>
                      <Th align="right">Thao tác</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((p) => {
                      const c = R[p.role] || {};
                      const st = STATUS[p.status];
                      return (
                        <Tr key={p.id} onClick={() => setSlip(p)}>
                          <Td>
                            <div className="flex items-center gap-3">
                              <Avatar name={p.name} src={p.avatar} size={34} />
                              <div className="min-w-0">
                                <div className="font-medium truncate" style={{ color: "var(--fg)" }}>{p.name}</div>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.base }} />
                                  <span className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>{p.roleLabel}</span>
                                </div>
                              </div>
                            </div>
                          </Td>
                          <Td align="right" num>
                            <span style={{ color: p.workedDays < p.standardDays ? "var(--warning-fg)" : "var(--fg)" }}>
                              {p.workedDays}/{p.standardDays}
                            </span>
                          </Td>
                          <Td align="right" num>{p.otHours}h</Td>
                          <Td align="right" num>{formatVND(p.actual)}</Td>
                          <Td align="right" num>{formatVND(p.allowance + p.tip + p.bonus)}</Td>
                          <Td align="right" num>
                            <span style={{ color: "var(--danger-fg)" }}>−{formatVND(p.insurance + p.deduction)}</span>
                          </Td>
                          <Td align="right" num>
                            <span className="font-medium" style={{ color: "var(--fg)" }}>{formatVND(p.net)}</span>
                          </Td>
                          <Td><StatusTag tone={st.tone}>{st.label}</StatusTag></Td>
                          <Td align="right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <IconButton icon={Eye} label="Xem phiếu lương" size="sm" onClick={() => setSlip(p)} />
                              {p.status !== "approved" && (
                                <IconButton icon={Check} label="Duyệt" size="sm" onClick={() => approve(p)} />
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
        </>
      )}

      {/* ── Bảng công ── */}
      {tab === "timesheet" && (
        <Panel
          className="mt-5"
          flush
          title="Bảng công tháng 7/2026"
          sub="Mỗi ô là một ngày. Di chuột để xem chi tiết."
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 1180 }}>
              <thead>
                <tr>
                  <Th>Nhân viên</Th>
                  {Array.from({ length: 31 }, (_, i) => (
                    <Th key={i} align="center">{i + 1}</Th>
                  ))}
                  <Th align="right">Công</Th>
                </tr>
              </thead>
              <tbody>
                {timesheet
                  .filter((t) => activeBranchId === "ALL" || t.branchId === activeBranchId)
                  .slice(0, 20)
                  .map((t) => {
                    const workDays = t.days.filter((d) => d.status === "work").length;
                    return (
                      <Tr key={t.staffId}>
                        <Td>
                          <div className="font-medium truncate" style={{ color: "var(--fg)", maxWidth: 160 }}>{t.name}</div>
                          <div className="text-[11px] truncate" style={{ color: "var(--fg-subtle)", maxWidth: 160 }}>{t.shift}</div>
                        </Td>
                        {t.days.map((d) => (
                          <Td key={d.day} align="center" className="px-1">
                            <span
                              className="inline-block w-4 h-4"
                              title={`Ngày ${d.day} — ${DAY_LABEL[d.status]}${d.hours ? ` (${d.hours}h)` : ""}`}
                              style={{
                                borderRadius: 2,
                                backgroundColor: `var(--${DAY_TONE[d.status]}${d.status === "off" ? "-soft" : ""})`,
                                opacity: d.status === "work" && d.hours > 8 ? 1 : d.status === "work" ? 0.62 : 1,
                              }}
                            />
                          </Td>
                        ))}
                        <Td align="right" num>{workDays}</Td>
                      </Tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]"
            style={{ color: "var(--fg-muted)", borderTop: "1px solid var(--border)" }}>
            {[["success", "Đi làm"], ["success", "Có tăng ca"], ["warning", "Nghỉ phép"], ["neutral-soft", "Nghỉ tuần"]].map(([t, l], i) => (
              <span key={l} className="inline-flex items-center gap-1.5">
                <span
                  className="w-3 h-3"
                  style={{ borderRadius: 2, backgroundColor: `var(--${t})`, opacity: i === 0 ? 0.62 : 1 }}
                />
                {l}
              </span>
            ))}
            <span>Hiển thị 20 nhân viên đầu tiên của phạm vi đang chọn.</span>
          </div>
        </Panel>
      )}

      {/* ── Phiếu lương ── */}
      <Modal
        open={!!slip}
        onClose={() => setSlip(null)}
        wide
        eyebrow={`Kỳ lương ${period.split("-").reverse().join("/")}`}
        title={slip ? `Phiếu lương — ${slip.name}` : ""}
        sub={slip ? `${slip.roleLabel} · ${slip.branchName}` : ""}
        footer={
          <>
            <Button variant="ghost" icon={Printer} onClick={() => setToast("Đã gửi lệnh in (bản demo)")}>In phiếu</Button>
            {slip?.status !== "approved" ? (
              <Button icon={Check} onClick={() => { approve(slip); setSlip(null); }}>Duyệt phiếu lương</Button>
            ) : (
              <Button variant="outline" icon={Ban} onClick={() => setSlip(null)}>Đóng</Button>
            )}
          </>
        }
      >
        {slip && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={slip.name} src={slip.avatar} size={52} />
              <div>
                <div className="font-medium text-[15px]" style={{ color: "var(--fg)" }}>{slip.name}</div>
                <div className="text-[12px]" style={{ color: "var(--fg-muted)" }}>
                  {slip.roleLabel} · {branches.find((b) => b.id === slip.branchId)?.name}
                </div>
              </div>
              <div className="ml-auto"><StatusTag tone={STATUS[slip.status].tone}>{STATUS[slip.status].label}</StatusTag></div>
            </div>

            <div className="grid grid-cols-3 gap-px border overflow-hidden"
              style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}>
              {[
                ["Ngày công", `${slip.workedDays}/${slip.standardDays}`],
                ["Nghỉ phép", `${slip.leaveDays} ngày`],
                ["Tăng ca", `${slip.otHours} giờ`],
              ].map(([k, v]) => (
                <div key={k} className="px-4 py-3" style={{ backgroundColor: "var(--surface)" }}>
                  <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--fg-subtle)" }}>{k}</div>
                  <div className="mt-1 text-[15px] font-medium tnum" style={{ color: "var(--fg)" }}>{v}</div>
                </div>
              ))}
            </div>

            <div>
              <Eyebrow className="mb-3">Chi tiết khoản thu</Eyebrow>
              <div className="space-y-2">
                {[
                  ["Lương theo ngày công thực tế", slip.actual, "plus"],
                  ["Tiền tăng ca", slip.otPay, "plus"],
                  ["Phụ cấp", slip.allowance, "plus"],
                  ["Tip chia theo bộ phận", slip.tip, "plus"],
                  ["Thưởng hiệu suất", slip.bonus, "plus"],
                  ["Bảo hiểm bắt buộc (10,5%)", slip.insurance, "minus"],
                  ["Khấu trừ khác", slip.deduction, "minus"],
                ]
                  .filter(([, v]) => v > 0)
                  .map(([k, v, sign]) => (
                    <div key={k} className="flex items-center justify-between gap-4 text-[13px]">
                      <span style={{ color: "var(--fg-muted)" }}>{k}</span>
                      <span className="tnum font-medium"
                        style={{ color: sign === "minus" ? "var(--danger-fg)" : "var(--fg)" }}>
                        {sign === "minus" ? "−" : ""}{formatVNDFull(v)}
                      </span>
                    </div>
                  ))}
              </div>

              <Hairline className="my-4" />

              <div className="flex items-center justify-between gap-4">
                <span className="text-[13px] font-medium" style={{ color: "var(--fg)" }}>Thực nhận</span>
                <span className="text-[22px] font-medium tnum" style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}>
                  {formatVNDFull(slip.net)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}
