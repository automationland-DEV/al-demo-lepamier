import { useCallback, useState, useMemo, useEffect } from "react";
import { Icons } from "../components/Icons";
import { staff as seedStaff, branches } from "../data/mockData";
import { formatVND, formatVNDFull } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import Pagination from "../components/Pagination";
import { usePalette } from "../theme/palette";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat,
  Button, IconButton, SearchInput, Select, Field, Input, Segmented,
  Tag, StatusTag, Avatar, Table, Th, Td, Tr, Modal, EmptyState,
  Toast, Dropdown, MenuItem, Eyebrow, Hairline,
} from "../components/ui";

/**
 * TRANG THAM CHIẾU MẪU A — danh sách (Design.md §8).
 * Trang danh sách mới copy bố cục từ đây, nhưng component thì import từ
 * src/components/ui/ chứ đừng copy lại.
 */

const {
  Users, UserCheck, Search, Plus, MoreHorizontal, Phone, Mail, Star,
  Download, LayoutGrid, List, Clock, Wallet, ArrowUpDown, Edit2, Trash2,
  AlertCircle, Eye, RotateCcw, CalendarCheck, Power, SlidersHorizontal,
} = Icons;

/** Bỏ dấu tiếng Việt để tìm kiếm không phụ thuộc dấu — trang này toàn tên Việt
 *  nên gõ "nguyen van an" vẫn phải ra "Nguyễn Văn An". */
const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const SORTS = [
  { key: "name-asc", label: "Tên A → Z" },
  { key: "salary-desc", label: "Lương cao nhất" },
  { key: "salary-asc", label: "Lương thấp nhất" },
  { key: "rating-desc", label: "Đánh giá cao nhất" },
  { key: "rating-asc", label: "Đánh giá thấp nhất" },
  { key: "joined-desc", label: "Mới gia nhập" },
];

const SHIFTS = ["Ca sáng", "Ca chiều", "Ca đêm"];

/* Vai trò — màu lấy từ bảng đất theo thứ tự khóa này (Design.md §2.4) */
const ROLE_KEYS = ["manager", "reception", "housekeeping", "fnb", "security", "maintenance", "accountant"];
const ROLE_LABEL = {
  manager: "Quản lý", reception: "Lễ tân", housekeeping: "Buồng phòng",
  fnb: "Ẩm thực", security: "An ninh", maintenance: "Kỹ thuật", accountant: "Kế toán",
};

const STATUS_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang làm" },
  { value: "leave", label: "Nghỉ phép" },
];

const BRANCH_BY_ID = branches.reduce((a, b) => ((a[b.id] = b), a), {});

function parseShift(raw = "") {
  const m = String(raw).match(/^Ca\s+(\S+)\s*\((.+)\)$/);
  if (!m) return { label: raw || "—", time: "" };
  return {
    label: m[1].charAt(0).toUpperCase() + m[1].slice(1),
    time: m[2].replace(/h/g, "").replace("-", "–"),
  };
}

export default function Staff() {
  const { activeBranchId } = useActiveBranch();
  const { seriesMap } = usePalette();
  const ROLE = useMemo(() => seriesMap(ROLE_KEYS), [seriesMap]);

  const [branchFilter, setBranchFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [list, setList] = useState(seedStaff);
  const [sort, setSort] = useState("name-asc");
  const [showFilter, setShowFilter] = useState(false);
  const [shiftFilter, setShiftFilter] = useState([]);
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [detail, setDetail] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg) => setToast(msg), []);

  useEffect(() => {
    setBranchFilter(activeBranchId === "ALL" ? "all" : activeBranchId);
  }, [activeBranchId]);

  useEffect(() => setPage(1),
    [branchFilter, roleFilter, statusFilter, search, sort, pageSize, shiftFilter, minSalary, maxSalary, minRating]);

  /* Phạm vi theo chi nhánh — KPI và số đếm vai trò bám phạm vi này để khớp
     với bộ lọc đang chọn, thay vì luôn đếm trên toàn hệ thống. */
  const scoped = useMemo(
    () => (branchFilter === "all" ? list : list.filter((s) => s.branchId === branchFilter)),
    [list, branchFilter]
  );

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    const out = scoped.filter((s) => {
      if (roleFilter !== "all" && s.role !== roleFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (shiftFilter.length && !shiftFilter.some((sh) => (s.shift || "").startsWith(sh))) return false;
      if (minSalary !== "" && (s.salary || 0) < Number(minSalary)) return false;
      if (maxSalary !== "" && (s.salary || 0) > Number(maxSalary)) return false;
      if (minRating > 0 && (s.rating || 0) < minRating) return false;
      if (q && !deaccent(
        `${s.name} ${s.phone || ""} ${s.email || ""} ${ROLE_LABEL[s.role] || ""} ${BRANCH_BY_ID[s.branchId]?.name || ""} ${s.shift || ""}`
      ).includes(q)) return false;
      return true;
    });
    const cmp = {
      "name-asc": (a, b) => a.name.localeCompare(b.name, "vi"),
      "salary-desc": (a, b) => (b.salary || 0) - (a.salary || 0),
      "salary-asc": (a, b) => (a.salary || 0) - (b.salary || 0),
      "rating-desc": (a, b) => (b.rating || 0) - (a.rating || 0),
      "rating-asc": (a, b) => (a.rating || 0) - (b.rating || 0),
      "joined-desc": (a, b) => (b.joinedAt || "").localeCompare(a.joinedAt || ""),
    }[sort];
    return [...out].sort(cmp);
  }, [scoped, roleFilter, statusFilter, search, sort, shiftFilter, minSalary, maxSalary, minRating]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const stats = useMemo(() => {
    const active = scoped.filter((s) => s.status === "active").length;
    return {
      total: scoped.length,
      active,
      leave: scoped.filter((s) => s.status === "leave").length,
      branches: new Set(scoped.map((s) => s.branchId)).size,
      avgSalary: scoped.reduce((n, s) => n + (s.salary || 0), 0) / Math.max(scoped.length, 1),
      activePct: scoped.length ? Math.round((active / scoped.length) * 100) : 0,
      payroll: scoped.reduce((n, s) => n + (s.salary || 0), 0),
    };
  }, [scoped]);

  const roleCounts = useMemo(() => {
    const m = {};
    for (const s of scoped) m[s.role] = (m[s.role] || 0) + 1;
    return m;
  }, [scoped]);

  const advCount =
    shiftFilter.length + (minSalary !== "" ? 1 : 0) + (maxSalary !== "" ? 1 : 0) + (minRating > 0 ? 1 : 0);
  const hasFilter =
    branchFilter !== "all" || roleFilter !== "all" || statusFilter !== "all" || search || advCount > 0;

  const clearAll = () => {
    setBranchFilter("all"); setRoleFilter("all"); setStatusFilter("all"); setSearch("");
    setShiftFilter([]); setMinSalary(""); setMaxSalary(""); setMinRating(0);
  };

  const toggleShift = (sh) =>
    setShiftFilter((f) => (f.includes(sh) ? f.filter((x) => x !== sh) : [...f, sh]));

  /* ── thao tác ── */
  const saveStaff = (payload) => {
    if (editing) {
      setList((l) => l.map((s) => (s.id === editing.id ? { ...s, ...payload } : s)));
      setDetail((d) => (d?.id === editing.id ? { ...d, ...payload } : d));
      notify(`Đã cập nhật ${payload.name}`);
    } else {
      const b = branches.find((x) => x.id === payload.branchId);
      setList((l) => [
        { ...payload, id: `ST-${b?.code || "NEW"}-${String(Date.now()).slice(-4)}`, branchName: b?.name || "" },
        ...l,
      ]);
      notify(`Đã thêm nhân viên ${payload.name}`);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const toggleStatus = (s) => {
    const next = s.status === "active" ? "leave" : "active";
    setList((l) => l.map((x) => (x.id === s.id ? { ...x, status: next } : x)));
    setDetail((d) => (d?.id === s.id ? { ...d, status: next } : d));
    notify(`${s.name} → ${next === "active" ? "Đang làm" : "Nghỉ phép"}`);
  };

  const removeStaff = (s) => {
    setList((l) => l.filter((x) => x.id !== s.id));
    if (detail?.id === s.id) setDetail(null);
    setConfirm(null);
    notify(`Đã xóa ${s.name}`);
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Nhân sự"
        title="Đội ngũ Condo HUB"
        live
        meta={[
          `${stats.active} đang trực`,
          `${stats.total} nhân viên`,
          `${stats.branches} chi nhánh`,
        ]}
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={() => setExportOpen(true)}>
              <span className="hidden sm:inline">Xuất danh sách</span>
            </Button>
            <Button icon={Plus} onClick={() => { setEditing(null); setFormOpen(true); }}>
              Thêm nhân viên
            </Button>
          </>
        }
      />

      {/* ═══ DẢI KPI ═══ */}
      <StatStrip cols={4}>
        <Stat
          label="Tổng nhân viên"
          value={stats.total.toLocaleString("vi-VN")}
          icon={Users}
          hint={`${stats.branches} chi nhánh · ${Object.keys(roleCounts).length} vai trò`}
        />
        <Stat
          label="Đang làm việc"
          value={stats.active.toLocaleString("vi-VN")}
          icon={UserCheck}
          progress={stats.activePct}
          hint={`${stats.activePct}% tổng nhân sự`}
        />
        <Stat
          label="Nghỉ phép"
          value={stats.leave.toLocaleString("vi-VN")}
          icon={Clock}
          hint="Cần phân ca thay"
        />
        <Stat
          label="Lương trung bình"
          value={formatVND(stats.avgSalary)}
          icon={Wallet}
          delta={4.2}
          hint="Mỗi tháng"
        />
      </StatStrip>

      {/* ═══ TOOLBAR ═══ */}
      <div className="mt-5">
        <Toolbar>
          <SearchInput
            wrapperClassName="flex-1 min-w-[220px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, số điện thoại, email…"
            aria-label="Tìm nhân viên"
          />

          <Select
            wrapperClassName="w-full sm:w-[190px]"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            aria-label="Lọc theo chi nhánh"
          >
            <option value="all">Tất cả chi nhánh</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>

          <Select
            wrapperClassName="w-full sm:w-[180px]"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Lọc theo vai trò"
          >
            <option value="all">Tất cả vai trò ({stats.total})</option>
            {ROLE_KEYS.map((k) => (
              <option key={k} value={k}>{ROLE_LABEL[k]} ({roleCounts[k] || 0})</option>
            ))}
          </Select>

          <Segmented value={statusFilter} onChange={setStatusFilter} options={STATUS_TABS} />

          <Dropdown
            width={220}
            trigger={
              <Button variant="outline" icon={ArrowUpDown}>
                <span className="hidden lg:inline">{SORTS.find((s) => s.key === sort)?.label}</span>
                <span className="lg:hidden">Sắp xếp</span>
              </Button>
            }
          >
            {SORTS.map((s) => (
              <MenuItem key={s.key} active={sort === s.key} onClick={() => setSort(s.key)}>
                {s.label}
              </MenuItem>
            ))}
          </Dropdown>

          <Button
            variant={showFilter ? "metal" : "outline"}
            icon={SlidersHorizontal}
            onClick={() => setShowFilter((v) => !v)}
            aria-expanded={showFilter}
          >
            Lọc{advCount > 0 ? ` · ${advCount}` : ""}
          </Button>

          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "table", label: "Bảng", icon: List },
              { value: "grid", label: "Thẻ", icon: LayoutGrid },
            ]}
          />

          {showFilter && (
            <div
              className="w-full mt-1 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fadeIn"
              style={{ borderColor: "var(--border-soft)" }}
            >
              <div>
                <Eyebrow className="mb-2">Ca làm</Eyebrow>
                <div className="flex flex-wrap gap-1.5">
                  {SHIFTS.map((sh) => (
                    <ToggleChip key={sh} on={shiftFilter.includes(sh)} onClick={() => toggleShift(sh)}>
                      {sh}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              <div>
                <Eyebrow className="mb-2">Khoảng lương (VNĐ)</Eyebrow>
                <div className="flex items-center gap-2">
                  <Input
                    type="number" min="0" step="1000000" placeholder="Từ"
                    aria-label="Lương từ"
                    value={minSalary} onChange={(e) => setMinSalary(e.target.value)}
                  />
                  <span className="text-[12px]" style={{ color: "var(--fg-subtle)" }}>—</span>
                  <Input
                    type="number" min="0" step="1000000" placeholder="Đến"
                    aria-label="Lương đến"
                    value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Eyebrow className="mb-2">Đánh giá tối thiểu</Eyebrow>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 3.5, 4, 4.5].map((r) => (
                    <ToggleChip key={r} on={minRating === r} onClick={() => setMinRating(r)}>
                      {r === 0 ? "Tất cả" : (
                        <>
                          <Star className="w-3 h-3" fill="currentColor" /> {r}+
                        </>
                      )}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              <div>
                <Eyebrow className="mb-2">Hiển thị</Eyebrow>
                <div className="flex items-center gap-2">
                  <Select
                    wrapperClassName="flex-1"
                    value={String(pageSize)}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    aria-label="Số dòng mỗi trang"
                  >
                    {[12, 24, 48].map((n) => <option key={n} value={n}>{n} / trang</option>)}
                  </Select>
                  <Button variant="outline" icon={RotateCcw} onClick={clearAll} disabled={!hasFilter}>
                    Đặt lại
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Toolbar>
      </div>

      {hasFilter && (
        <div className="flex items-center gap-3 flex-wrap mt-4 text-[12px]">
          <span style={{ color: "var(--fg-muted)" }}>
            <span className="tnum" style={{ color: "var(--fg)" }}>{filtered.length}</span> kết quả
            khớp bộ lọc
          </span>
          <button
            onClick={clearAll}
            className="hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* ═══ NỘI DUNG ═══ */}
      <div className="mt-5">
        {filtered.length === 0 ? (
          <Panel flush>
            <EmptyState
              icon={Search}
              title="Không tìm thấy nhân viên nào"
              desc="Không có hồ sơ nào khớp bộ lọc hiện tại. Thử đổi từ khóa hoặc bỏ bớt điều kiện lọc."
              action={<Button variant="outline" icon={RotateCcw} onClick={clearAll}>Xóa bộ lọc</Button>}
            />
          </Panel>
        ) : view === "table" ? (
          <Panel flush>
            <Table minWidth={960}>
              <thead>
                <tr>
                  <Th>Nhân viên</Th>
                  <Th>Vai trò</Th>
                  <Th>Chi nhánh</Th>
                  <Th>Liên hệ</Th>
                  <Th>Ca làm</Th>
                  <Th align="right">Lương</Th>
                  <Th align="right">Đánh giá</Th>
                  <Th align="right">Trạng thái</Th>
                  <Th align="right">Thao tác</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => {
                  const r = ROLE[s.role];
                  const shift = parseShift(s.shift);
                  return (
                    <Tr key={s.id}>
                      <Td>
                        <button onClick={() => setDetail(s)} className="flex items-center gap-3 text-left w-full">
                          <Avatar src={s.avatar} name={s.name} size={32} />
                          <span className="min-w-0">
                            <span className="block font-medium truncate hover:underline" style={{ color: "var(--fg)" }}>
                              {s.name}
                            </span>
                            <span className="block text-[11px] tnum" style={{ color: "var(--fg-subtle)" }}>
                              Gia nhập {s.joinedAt}
                            </span>
                          </span>
                        </button>
                      </Td>
                      <Td><Tag dot={r.base}>{ROLE_LABEL[s.role]}</Tag></Td>
                      <Td style={{ color: "var(--fg-muted)" }}>{BRANCH_BY_ID[s.branchId]?.city || "—"}</Td>
                      <Td>
                        <span className="block tnum" style={{ color: "var(--fg-muted)" }}>{s.phone}</span>
                        <span className="block text-[11px] truncate max-w-[180px]" style={{ color: "var(--fg-subtle)" }}>
                          {s.email}
                        </span>
                      </Td>
                      <Td style={{ color: "var(--fg-muted)" }}>
                        {shift.label}{" "}
                        <span className="tnum text-[11px]" style={{ color: "var(--fg-subtle)" }}>{shift.time}</span>
                      </Td>
                      <Td align="right" num>{formatVND(s.salary)}</Td>
                      <Td align="right"><Rating value={s.rating} /></Td>
                      <Td align="right">
                        <StatusTag tone={s.status === "active" ? "success" : "warning"}>
                          {s.status === "active" ? "Đang làm" : "Nghỉ phép"}
                        </StatusTag>
                      </Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <IconButton icon={Eye} label="Xem chi tiết" size="sm" onClick={() => setDetail(s)} />
                          <IconButton icon={Edit2} label="Chỉnh sửa" size="sm"
                                      onClick={() => { setEditing(s); setFormOpen(true); }} />
                          <IconButton icon={Trash2} label="Xóa nhân viên" size="sm" onClick={() => setConfirm(s)} />
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
            <div className="px-6 pb-5">
              <Pagination
                currentPage={page} totalPages={totalPages} onPageChange={setPage}
                totalItems={filtered.length} itemsPerPage={pageSize}
              />
            </div>
          </Panel>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map((s) => (
                <StaffCard
                  key={s.id}
                  s={s}
                  role={ROLE[s.role]}
                  onOpen={() => setDetail(s)}
                  onEdit={() => { setEditing(s); setFormOpen(true); }}
                  onToggleStatus={() => toggleStatus(s)}
                  onDelete={() => setConfirm(s)}
                />
              ))}
            </div>
            <Pagination
              currentPage={page} totalPages={totalPages} onPageChange={setPage}
              totalItems={filtered.length} itemsPerPage={pageSize}
            />
          </>
        )}
      </div>

      {/* ═══ CHI TIẾT ═══ */}
      <StaffDetail
        s={detail}
        role={detail ? ROLE[detail.role] : null}
        onClose={() => setDetail(null)}
        onEdit={() => { setEditing(detail); setDetail(null); setFormOpen(true); }}
        onToggleStatus={() => toggleStatus(detail)}
      />

      {/* ═══ FORM ═══ */}
      <StaffForm
        open={formOpen}
        initial={editing}
        defaultBranchId={branchFilter !== "all" ? branchFilter : branches[0]?.id}
        existingEmails={list.filter((s) => s.id !== editing?.id).map((s) => (s.email || "").toLowerCase())}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={saveStaff}
      />

      {/* ═══ XUẤT ═══ */}
      <Modal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        eyebrow="Nhân sự"
        title="Xuất danh sách"
        sub={`${filtered.length} nhân viên theo bộ lọc hiện tại`}
      >
        <div className="space-y-2">
          {[
            { fmt: "Excel (.xlsx)", desc: "Đủ cột, có định dạng lương" },
            { fmt: "CSV", desc: "Dữ liệu thô để phân tích" },
            { fmt: "Bảng lương (PDF)", desc: `Tổng quỹ lương ${formatVND(stats.payroll)}` },
          ].map((f) => (
            <button
              key={f.fmt}
              onClick={() => {
                setExportOpen(false);
                notify(`Đang chuẩn bị ${f.fmt} · ${filtered.length} nhân viên`);
              }}
              className="w-full text-left flex items-center gap-3 p-4 border transition-colors hover:bg-[var(--surface-2)]"
              style={{ borderRadius: "var(--r-sm)", borderColor: "var(--border)" }}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium" style={{ color: "var(--fg)" }}>{f.fmt}</span>
                <span className="block text-[12px] mt-0.5" style={{ color: "var(--fg-muted)" }}>{f.desc}</span>
              </span>
              <Download className="w-4 h-4 shrink-0" style={{ color: "var(--fg-subtle)" }} />
            </button>
          ))}
        </div>
      </Modal>

      {/* ═══ XÁC NHẬN XÓA ═══ */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        eyebrow="Cần xác nhận"
        title="Xóa nhân viên?"
        sub={confirm?.name}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)}>Hủy</Button>
            <Button variant="danger" icon={Trash2} onClick={() => removeStaff(confirm)}>
              Xóa vĩnh viễn
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Hồ sơ <strong style={{ color: "var(--fg)" }}>{confirm?.name}</strong>
          {confirm ? ` · ${ROLE_LABEL[confirm.role]} · ${BRANCH_BY_ID[confirm.branchId]?.city || ""}` : ""} sẽ
          bị gỡ khỏi danh sách. Nếu chỉ tạm nghỉ, hãy dùng “Cho nghỉ phép” để giữ lại hồ sơ.
        </p>
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}

/* ═════════════ Thành phần riêng của trang ═════════════ */

/** Chip bật/tắt trong bộ lọc nâng cao — phẳng, viền tóc, không gradient */
function ToggleChip({ on, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="inline-flex items-center gap-1 h-8 px-3 text-[12px] font-medium border transition-colors"
      style={{
        borderRadius: "var(--r-sm)",
        backgroundColor: on ? "var(--accent-soft)" : "var(--surface)",
        borderColor: on ? "var(--accent)" : "var(--border)",
        color: on ? "var(--accent-fg)" : "var(--fg-muted)",
      }}
    >
      {children}
    </button>
  );
}

/** Đánh giá — chữ + sao, tô màu ngữ nghĩa, không tô nền */
function Rating({ value }) {
  if (value == null) return <span style={{ color: "var(--fg-subtle)" }}>—</span>;
  const tone = value >= 4.5 ? "success" : value >= 4 ? "warning" : "danger";
  return (
    <span
      className="inline-flex items-center gap-1 text-[13px] tnum"
      style={{ color: `var(--${tone})` }}
      title={`${value} trên 5`}
    >
      <Star className="w-3.5 h-3.5" fill="currentColor" />
      {value.toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
    </span>
  );
}

function StaffCard({ s, role, onOpen, onEdit, onToggleStatus, onDelete }) {
  const shift = parseShift(s.shift);
  const branch = BRANCH_BY_ID[s.branchId];

  return (
    <div
      className="group card-hover border p-5 flex flex-col"
      style={{
        borderRadius: "var(--r)",
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-start gap-3">
        <Avatar src={s.avatar} name={s.name} size={44} ring={role.base} />
        <button onClick={onOpen} className="flex-1 min-w-0 text-left">
          <span className="block text-[15px] font-medium truncate hover:underline" style={{ color: "var(--fg)" }}>
            {s.name}
          </span>
          <span className="block mt-1.5">
            <Tag dot={role.base}>{ROLE_LABEL[s.role]}</Tag>
          </span>
        </button>

        <Dropdown
          width={190}
          trigger={
            <IconButton
              icon={MoreHorizontal}
              label={`Thao tác với ${s.name}`}
              size="sm"
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            />
          }
        >
          <MenuItem icon={Eye} onClick={onOpen}>Xem chi tiết</MenuItem>
          <MenuItem icon={Edit2} onClick={onEdit}>Chỉnh sửa</MenuItem>
          <MenuItem icon={Power} onClick={onToggleStatus}>
            {s.status === "active" ? "Cho nghỉ phép" : "Cho đi làm lại"}
          </MenuItem>
          <MenuItem icon={Trash2} danger onClick={onDelete}>Xóa nhân viên</MenuItem>
        </Dropdown>
      </div>

      <div className="mt-4 space-y-1.5 text-[12px]" style={{ color: "var(--fg-muted)" }}>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--fg-subtle)" }} />
          <span className="tnum">{s.phone}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--fg-subtle)" }} />
          <span className="truncate">{s.email}</span>
        </div>
      </div>

      <Hairline soft className="my-4" />

      <div className="grid grid-cols-3 gap-3">
        <CardMetric label="Chi nhánh" value={branch?.city || "—"} />
        <CardMetric label="Ca làm" value={shift.label} hint={shift.time} />
        <CardMetric label="Lương" value={formatVND(s.salary)} />
      </div>

      <div className="mt-4 pt-4 flex items-center justify-between gap-2 border-t" style={{ borderColor: "var(--border-soft)" }}>
        <StatusTag tone={s.status === "active" ? "success" : "warning"}>
          {s.status === "active" ? "Đang làm" : "Nghỉ phép"}
        </StatusTag>
        <Rating value={s.rating} />
      </div>
    </div>
  );
}

function CardMetric({ label, value, hint }) {
  return (
    <div className="min-w-0">
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.14em] truncate"
        style={{ color: "var(--fg-subtle)" }}
      >
        {label}
      </div>
      <div className="text-[13px] font-medium truncate mt-1 tnum" style={{ color: "var(--fg)" }}>{value}</div>
      {hint && <div className="text-[10px] tnum" style={{ color: "var(--fg-subtle)" }}>{hint}</div>}
    </div>
  );
}

function StaffDetail({ s, role, onClose, onEdit, onToggleStatus }) {
  if (!s || !role) return null;
  const shift = parseShift(s.shift);
  const branch = BRANCH_BY_ID[s.branchId];
  const years = Math.max(0, 2026 - parseInt(String(s.joinedAt).slice(0, 4) || "2026", 10));

  return (
    <Modal
      open={!!s}
      onClose={onClose}
      eyebrow={`${ROLE_LABEL[s.role]} · ${branch?.name || "—"}`}
      title={s.name}
      footer={
        <>
          <Button variant="ghost" icon={Power} onClick={onToggleStatus} className="mr-auto">
            {s.status === "active" ? "Cho nghỉ phép" : "Cho đi làm lại"}
          </Button>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          <Button icon={Edit2} onClick={onEdit}>Chỉnh sửa</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar src={s.avatar} name={s.name} size={56} ring={role.base} />
          <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
            <Tag dot={role.base}>{ROLE_LABEL[s.role]}</Tag>
            <StatusTag tone={s.status === "active" ? "success" : "warning"}>
              {s.status === "active" ? "Đang làm" : "Nghỉ phép"}
            </StatusTag>
          </div>
          <Rating value={s.rating} />
        </div>

        <div
          className="grid grid-cols-2 gap-px border overflow-hidden"
          style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}
        >
          <DetailStat label="Lương tháng" value={formatVNDFull(s.salary)} />
          <DetailStat label="Thâm niên" value={years > 0 ? `${years} năm` : "Dưới 1 năm"} sub={`Gia nhập ${s.joinedAt}`} />
          <DetailStat label="Ca làm" value={shift.label} sub={shift.time} />
          <DetailStat label="Chi nhánh" value={branch?.city || "—"} sub={branch?.code} />
        </div>

        <div
          className="border p-4 space-y-2.5 text-[13px]"
          style={{ borderRadius: "var(--r-sm)", borderColor: "var(--border)" }}
        >
          <a href={`tel:${s.phone}`} className="flex items-center gap-2.5 hover:underline" style={{ color: "var(--fg-muted)" }}>
            <Phone className="w-4 h-4 shrink-0" style={{ color: "var(--fg-subtle)" }} />
            <span className="tnum">{s.phone}</span>
          </a>
          <a href={`mailto:${s.email}`} className="flex items-center gap-2.5 hover:underline min-w-0" style={{ color: "var(--fg-muted)" }}>
            <Mail className="w-4 h-4 shrink-0" style={{ color: "var(--fg-subtle)" }} />
            <span className="truncate">{s.email}</span>
          </a>
          <div className="flex items-center gap-2.5" style={{ color: "var(--fg-muted)" }}>
            <CalendarCheck className="w-4 h-4 shrink-0" style={{ color: "var(--fg-subtle)" }} />
            <span>
              Mã nhân viên <span className="font-mono" style={{ color: "var(--fg)" }}>{s.id}</span>
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function DetailStat({ label, value, sub }) {
  return (
    <div className="p-4" style={{ backgroundColor: "var(--surface)" }}>
      <Eyebrow>{label}</Eyebrow>
      <div className="text-[15px] font-medium mt-1.5 tnum break-all" style={{ color: "var(--fg)" }}>{value}</div>
      {sub && <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--fg-subtle)" }}>{sub}</div>}
    </div>
  );
}

const BLANK_STAFF = {
  name: "", role: "reception", branchId: "", phone: "", email: "",
  shift: "Ca sáng (6h-14h)", salary: "", rating: 4.5, status: "active",
  joinedAt: "2026-01-01", avatar: "https://i.pravatar.cc/100?img=15",
};

const SHIFT_OPTIONS = ["Ca sáng (6h-14h)", "Ca chiều (14h-22h)", "Ca đêm (22h-6h)"];

function StaffForm({ open, initial, defaultBranchId, existingEmails = [], onClose, onSubmit }) {
  const [v, setV] = useState(BLANK_STAFF);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setTouched(false);
    setV(initial
      ? { ...BLANK_STAFF, ...initial, salary: String(initial.salary ?? "") }
      : { ...BLANK_STAFF, branchId: defaultBranchId || branches[0]?.id || "" });
  }, [open, initial, defaultBranchId]);

  const set = (k, val) => setV((s) => ({ ...s, [k]: val }));

  const validate = (s) => {
    const e = {};
    if (!s.name.trim()) e.name = "Bắt buộc nhập họ tên";
    else if (s.name.trim().length < 2) e.name = "Họ tên quá ngắn";

    const email = s.email.trim().toLowerCase();
    if (!email) e.email = "Bắt buộc nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email chưa đúng định dạng";
    else if (existingEmails.includes(email)) e.email = "Email này đã có nhân viên khác dùng";

    if (!s.phone.trim()) e.phone = "Bắt buộc nhập số điện thoại";
    else if (!/^0\d{9}$/.test(s.phone.trim())) e.phone = "Số điện thoại gồm 10 số, bắt đầu bằng 0";

    if (!s.branchId) e.branchId = "Chọn chi nhánh";
    if (!s.joinedAt) e.joinedAt = "Chọn ngày gia nhập";
    else if (s.joinedAt > "2026-08-02") e.joinedAt = "Ngày gia nhập không thể ở tương lai";

    const sal = Number(s.salary);
    if (s.salary === "") e.salary = "Bắt buộc nhập lương";
    else if (!(sal >= 3000000 && sal <= 200000000)) e.salary = "Lương từ 3.000.000 đến 200.000.000";

    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(v);
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`s-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    onSubmit({
      ...v,
      name: v.name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      salary: Number(v.salary),
      rating: Number(v.rating),
      roleLabel: ROLE_LABEL[v.role],
    });
  };

  const err = (k) => (touched ? errors[k] : undefined);
  const errCount = touched ? Object.keys(errors).length : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      eyebrow="Nhân sự"
      title={initial ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}
      sub={initial ? `${initial.id} · ${initial.name}` : "Các trường có dấu * là bắt buộc"}
      footer={
        <>
          {errCount > 0 && (
            <span
              className="mr-auto text-[12px] inline-flex items-center gap-1.5"
              style={{ color: "var(--danger-fg)" }}
            >
              <AlertCircle className="w-3.5 h-3.5" /> Còn {errCount} trường chưa hợp lệ
            </span>
          )}
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="submit" form="staff-form">
            {initial ? "Lưu thay đổi" : "Thêm nhân viên"}
          </Button>
        </>
      }
    >
      <form id="staff-form" onSubmit={submit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Họ và tên" required error={err("name")}>
            <Input id="s-name" value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Nguyễn Văn A" />
          </Field>
          <Field label="Vai trò" required>
            <Select id="s-role" value={v.role} onChange={(e) => set("role", e.target.value)}>
              {ROLE_KEYS.map((k) => <option key={k} value={k}>{ROLE_LABEL[k]}</option>)}
            </Select>
          </Field>
          <Field label="Số điện thoại" required error={err("phone")}>
            <Input id="s-phone" inputMode="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0912345678" />
          </Field>
          <Field label="Email" required error={err("email")}>
            <Input id="s-email" inputMode="email" value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="ten@condohub.vn" />
          </Field>
          <Field label="Chi nhánh" required error={err("branchId")}>
            <Select id="s-branchId" value={v.branchId} onChange={(e) => set("branchId", e.target.value)}>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
          <Field label="Ca làm" required>
            <Select id="s-shift" value={v.shift} onChange={(e) => set("shift", e.target.value)}>
              {SHIFT_OPTIONS.map((sh) => <option key={sh} value={sh}>{sh}</option>)}
            </Select>
          </Field>
          <Field label="Lương tháng (VNĐ)" required error={err("salary")}>
            <Input id="s-salary" type="number" min="3000000" step="500000" value={v.salary}
                   onChange={(e) => set("salary", e.target.value)} placeholder="12000000" />
          </Field>
          <Field label="Ngày gia nhập" required error={err("joinedAt")}>
            <Input id="s-joinedAt" type="date" max="2026-08-02" value={v.joinedAt}
                   onChange={(e) => set("joinedAt", e.target.value)} />
          </Field>
          <Field label="Đánh giá" hint={`${Number(v.rating).toFixed(1)} ★`}>
            <input
              id="s-rating" type="range" min="1" max="5" step="0.1" value={v.rating}
              onChange={(e) => set("rating", e.target.value)}
              className="w-full h-10" style={{ accentColor: "var(--accent)" }}
              aria-label="Đánh giá"
            />
          </Field>
          <Field label="Trạng thái" required>
            <Select id="s-status" value={v.status} onChange={(e) => set("status", e.target.value)}>
              <option value="active">Đang làm</option>
              <option value="leave">Nghỉ phép</option>
            </Select>
          </Field>
        </div>

        {v.salary !== "" && Number(v.salary) > 0 && (
          <div
            className="p-4 text-[13px] border"
            style={{
              borderRadius: "var(--r-sm)",
              backgroundColor: "var(--info-soft)",
              borderColor: "var(--info-border)",
              color: "var(--info-fg)",
            }}
          >
            Chi phí nhân sự cả năm cho vị trí này:{" "}
            <strong className="tnum">{formatVNDFull(Number(v.salary) * 12)}</strong>
          </div>
        )}
      </form>
    </Modal>
  );
}
