import { useEffect, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { auditLog as seed, LOG_ACTIONS, permissionModules, systemUsers } from "../data/adminData";
import { formatDate } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import { usePalette } from "../theme/palette";
import Pagination from "../components/Pagination";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat, SectionHead,
  Button, SearchInput, Select, Field, Input,
  Tag, StatusTag, Avatar, Table, Th, Td, Tr, Modal, EmptyState, Toast,
} from "../components/ui";

/**
 * NHẬT KÝ HỆ THỐNG — ai đã làm gì, lúc nào, từ đâu.
 *
 * Đây là trang không ai mở cho tới lúc có sự cố, và khi đó thì phải tra ra
 * được ngay. Vì vậy bộ lọc đặt theo đúng ba câu hỏi điều tra: ai (người
 * dùng), cái gì (chức năng + loại hành động), và khi nào (khoảng ngày).
 */

const {
  ScrollText, Download, Activity, ShieldAlert, Users,
  Trash2, Check,
} = Icons;

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

export default function AuditLog() {
  const { activeBranchId } = useActiveBranch();
  const { seriesMap } = usePalette();
  const A = useMemo(() => seriesMap(LOG_ACTIONS.map((a) => a.id)), [seriesMap]);

  const [action, setAction] = useState("all");
  const [module, setModule] = useState("all");
  const [user, setUser] = useState("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);
  const PAGE_SIZE = 20;

  useEffect(() => setPage(1), [action, module, user, search, from, to, activeBranchId]);

  const scoped = useMemo(
    () => (activeBranchId === "ALL" ? seed : seed.filter((l) => l.branchId === activeBranchId)),
    [activeBranchId]
  );

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    return scoped.filter((l) => {
      if (action !== "all" && l.action !== action) return false;
      if (module !== "all" && l.module !== module) return false;
      if (user !== "all" && l.userId !== user) return false;
      const day = l.at.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (q && !deaccent(`${l.detail} ${l.userName} ${l.moduleLabel} ${l.ip}`).includes(q)) return false;
      return true;
    });
  }, [scoped, action, module, user, search, from, to]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const deletions = scoped.filter((l) => l.action === "delete").length;
  const approvals = scoped.filter((l) => l.action === "approve").length;
  const activeUsers = new Set(scoped.map((l) => l.userId)).size;
  const today = scoped.filter((l) => l.at.startsWith("2026-08-02")).length;

  /* Hoạt động 14 ngày gần nhất — nhìn ra ngày bất thường */
  const byDay = useMemo(() => {
    const map = new Map();
    scoped.forEach((l) => {
      const d = l.at.slice(0, 10);
      map.set(d, (map.get(d) || 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, count]) => ({ date, count }));
  }, [scoped]);
  const maxDay = Math.max(1, ...byDay.map((d) => d.count));

  /* Người dùng thao tác nhiều nhất — cột mốc để phát hiện tài khoản lạ */
  const topUsers = useMemo(() => {
    const map = new Map();
    scoped.forEach((l) => {
      const cur = map.get(l.userId) || { id: l.userId, name: l.userName, avatar: l.userAvatar, role: l.roleName, count: 0 };
      cur.count += 1;
      map.set(l.userId, cur);
    });
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [scoped]);

  return (
    <Page>
      <PageHeader
        eyebrow="Hệ thống"
        title="Nhật ký hệ thống"
        meta={[
          `${scoped.length} bản ghi 20 ngày gần nhất`,
          `${activeUsers} tài khoản có thao tác`,
          `${today} thao tác hôm nay`,
        ]}
        live
        actions={
          <Button variant="outline" icon={Download} onClick={() => setToast("Đã xuất nhật ký (bản demo)")}>
            Xuất nhật ký
          </Button>
        }
      />

      <StatStrip cols={4}>
        <Stat label="Tổng thao tác" value={scoped.length} icon={Activity}
          hint="Trong 20 ngày gần nhất" />
        <Stat label="Thao tác xóa" value={deletions} icon={Trash2}
          hint="Cần rà soát kỹ nhất khi có sự cố" />
        <Stat label="Lượt duyệt" value={approvals} icon={Check}
          hint="Duyệt lương, công nợ, phiếu chi" />
        <Stat label="Tài khoản hoạt động" value={activeUsers} icon={Users}
          hint={`Trên ${systemUsers.length} tài khoản khai báo`} />
      </StatStrip>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel title="Hoạt động theo ngày" sub="14 ngày gần nhất trong phạm vi đang xem">
          <div className="flex items-end gap-1.5" style={{ height: 160 }}>
            {byDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full"
                    title={`${formatDate(d.date)} — ${d.count} thao tác`}
                    style={{
                      height: `${(d.count / maxDay) * 100}%`,
                      backgroundColor: d.count >= maxDay * 0.9 ? "var(--metal)" : "var(--accent)",
                      borderRadius: "3px 3px 0 0",
                      minHeight: 3,
                      transition: "height .4s var(--ease)",
                    }}
                  />
                </div>
                <span className="text-[9px] tnum truncate w-full text-center" style={{ color: "var(--fg-subtle)" }}>
                  {d.date.slice(8)}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Thao tác nhiều nhất" sub="Theo tài khoản">
          <div className="space-y-3">
            {topUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setUser(user === u.id ? "all" : u.id)}
                className="w-full flex items-center gap-3 text-left"
              >
                <Avatar name={u.name} src={u.avatar} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] truncate" style={{ color: "var(--fg)" }}>{u.name}</div>
                  <div className="text-[11px] truncate" style={{ color: "var(--fg-subtle)" }}>{u.role}</div>
                </div>
                <div className="w-16 shrink-0">
                  <div className="h-1 overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
                    <div className="h-full" style={{ width: `${(u.count / topUsers[0].count) * 100}%`, backgroundColor: "var(--accent)" }} />
                  </div>
                </div>
                <span className="text-[12px] tnum shrink-0 w-6 text-right" style={{ color: "var(--fg)" }}>{u.count}</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <SectionHead
        eyebrow="Tra cứu"
        title="Dòng nhật ký"
        sub="Lọc theo ba câu hỏi: ai làm, làm gì, và trong khoảng nào."
      />

      <Toolbar>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo nội dung, người thực hiện hoặc địa chỉ IP…"
          wrapperClassName="flex-1 min-w-[220px]"
        />
        <Select value={action} onChange={(e) => setAction(e.target.value)} wrapperClassName="w-[160px]">
          <option value="all">Mọi hành động</option>
          {LOG_ACTIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </Select>
        <Select value={module} onChange={(e) => setModule(e.target.value)} wrapperClassName="w-[190px]">
          <option value="all">Mọi chức năng</option>
          {permissionModules.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </Select>
        <Select value={user} onChange={(e) => setUser(e.target.value)} wrapperClassName="w-[200px]">
          <option value="all">Mọi tài khoản</option>
          {systemUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </Select>
      </Toolbar>

      <div className="mt-2.5 flex flex-wrap items-end gap-3">
        <Field label="Từ ngày" className="w-[170px]">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="Đến ngày" className="w-[170px]">
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
        {(from || to || action !== "all" || module !== "all" || user !== "all" || search) && (
          <Button
            variant="ghost"
            onClick={() => {
              setFrom(""); setTo(""); setAction("all"); setModule("all"); setUser("all"); setSearch("");
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
        <span className="ml-auto text-[12px] tnum" style={{ color: "var(--fg-muted)" }}>
          {filtered.length.toLocaleString("vi-VN")} bản ghi khớp
        </span>
      </div>

      <Panel className="mt-5" flush>
        {filtered.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="Không có bản ghi nào khớp"
            desc="Thử nới khoảng ngày, hoặc bỏ bộ lọc tài khoản. Nhật ký chỉ lưu 20 ngày gần nhất trong bản demo."
          />
        ) : (
          <>
            <Table minWidth={1040}>
              <thead>
                <tr>
                  <Th>Thời điểm</Th>
                  <Th>Người thực hiện</Th>
                  <Th>Hành động</Th>
                  <Th>Chức năng</Th>
                  <Th>Nội dung</Th>
                  <Th align="right">Nguồn</Th>
                </tr>
              </thead>
              <tbody>
                {paged.map((l) => {
                  const meta = LOG_ACTIONS.find((a) => a.id === l.action);
                  return (
                    <Tr key={l.id} onClick={() => setDetail(l)}>
                      <Td>
                        <div className="tnum" style={{ color: "var(--fg)" }}>{l.at.slice(11)}</div>
                        <div className="text-[11px] tnum" style={{ color: "var(--fg-subtle)" }}>
                          {formatDate(l.at.slice(0, 10))}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={l.userName} src={l.userAvatar} size={28} />
                          <div className="min-w-0">
                            <div className="truncate" style={{ color: "var(--fg)" }}>{l.userName}</div>
                            <div className="text-[11px] truncate" style={{ color: "var(--fg-subtle)" }}>{l.roleName}</div>
                          </div>
                        </div>
                      </Td>
                      <Td><StatusTag tone={meta?.tone || "neutral"}>{l.actionLabel}</StatusTag></Td>
                      <Td><Tag dot={(A[l.action] || {}).base}>{l.moduleLabel}</Tag></Td>
                      <Td>
                        <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{l.detail}</span>
                      </Td>
                      <Td align="right">
                        <div className="text-[11px] tnum" style={{ color: "var(--fg-muted)" }}>{l.ip}</div>
                        <div className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>{l.device}</div>
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

      {/* ── Chi tiết một bản ghi ── */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        eyebrow={detail?.id}
        title={detail?.actionLabel ? `${detail.actionLabel} · ${detail.moduleLabel}` : ""}
        sub={detail?.at}
        footer={<Button variant="ghost" onClick={() => setDetail(null)}>Đóng</Button>}
      >
        {detail && (
          <div className="space-y-5">
            <div
              className="p-4 text-[13px] leading-relaxed"
              style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--surface-2)", color: "var(--fg)" }}
            >
              {detail.detail}
            </div>

            <div className="flex items-center gap-3">
              <Avatar name={detail.userName} src={detail.userAvatar} size={40} />
              <div>
                <div className="font-medium text-[14px]" style={{ color: "var(--fg)" }}>{detail.userName}</div>
                <div className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{detail.roleName}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px border overflow-hidden"
              style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}>
              {[
                ["Chi nhánh", detail.branchName],
                ["Chức năng", detail.moduleLabel],
                ["Địa chỉ IP", detail.ip],
                ["Thiết bị", detail.device],
              ].map(([k, v]) => (
                <div key={k} className="px-4 py-3" style={{ backgroundColor: "var(--surface)" }}>
                  <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--fg-subtle)" }}>{k}</div>
                  <div className="mt-1 text-[13px] font-medium" style={{ color: "var(--fg)" }}>{v}</div>
                </div>
              ))}
            </div>

            {detail.action === "delete" && (
              <div className="flex items-start gap-3 text-[13px] px-4 py-3 border"
                style={{
                  borderRadius: "var(--r-sm)",
                  backgroundColor: "var(--danger-soft)",
                  borderColor: "var(--danger-border)",
                  color: "var(--danger-fg)",
                }}>
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Đây là thao tác xóa dữ liệu. Nhật ký giữ lại bản ghi để đối chiếu khi cần khôi phục.</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}
