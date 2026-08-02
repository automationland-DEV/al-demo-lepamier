import { Fragment, useCallback, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { roles as seedRoles, permissionModules, ACTIONS, systemUsers as seedUsers } from "../data/adminData";
import { usePalette } from "../theme/palette";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat,
  Button, IconButton, SearchInput, Select, Tabs,
  Tag, StatusTag, Avatar, Table, Th, Td, Tr, Modal, EmptyState, Toast,
  Eyebrow, Hairline,
} from "../components/ui";

/**
 * PHÂN QUYỀN — vai trò, ma trận quyền và tài khoản người dùng.
 *
 * Điểm dễ sai của mọi hệ thống phân quyền là chỉ có "vai trò" mà quên
 * "phạm vi dữ liệu": một Quản lý chi nhánh có quyền sửa đặt phòng, nhưng
 * chỉ với chi nhánh của mình. Vì vậy mỗi vai trò ở đây có thêm trường
 * `scope` (toàn hệ thống / theo chi nhánh) hiển thị ngay cạnh tên.
 */

const {
  ShieldCheck, ShieldAlert, KeyRound, Users, Check, X,
  UserPlus, Eye, Ban, Building2, AlertCircle,
} = Icons;

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const MODULE_GROUPS = [...new Set(permissionModules.map((m) => m.group))];

export default function Roles() {
  const { seriesMap } = usePalette();
  const G = useMemo(() => seriesMap(MODULE_GROUPS), [seriesMap]);

  const [roles, setRoles] = useState(seedRoles);
  const [users, setUsers] = useState(seedUsers);
  const [tab, setTab] = useState("matrix");
  const [activeRole, setActiveRole] = useState(seedRoles[2].id);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);

  const role = roles.find((r) => r.id === activeRole) || roles[0];

  const filteredUsers = useMemo(() => {
    const q = deaccent(search.trim());
    return users.filter((u) => {
      if (roleFilter !== "all" && u.roleId !== roleFilter) return false;
      if (q && !deaccent(`${u.name} ${u.email} ${u.roleName}`).includes(q)) return false;
      return true;
    });
  }, [users, roleFilter, search]);

  const totalGrants = useMemo(
    () => Object.values(role.perms).reduce((s, a) => s + a.length, 0),
    [role]
  );
  const maxGrants = permissionModules.length * ACTIONS.length;

  const togglePerm = useCallback(
    (moduleId, actionId) => {
      if (role.system) {
        setToast("Vai trò hệ thống không sửa được quyền");
        return;
      }
      setRoles((prev) =>
        prev.map((r) => {
          if (r.id !== role.id) return r;
          const cur = r.perms[moduleId] || [];
          const next = cur.includes(actionId) ? cur.filter((a) => a !== actionId) : [...cur, actionId];
          return { ...r, perms: { ...r.perms, [moduleId]: next } };
        })
      );
    },
    [role]
  );

  const toggleRow = useCallback(
    (moduleId) => {
      if (role.system) return;
      setRoles((prev) =>
        prev.map((r) => {
          if (r.id !== role.id) return r;
          const cur = r.perms[moduleId] || [];
          const next = cur.length === ACTIONS.length ? [] : ACTIONS.map((a) => a.id);
          return { ...r, perms: { ...r.perms, [moduleId]: next } };
        })
      );
    },
    [role]
  );

  const toggleUser = useCallback((u) => {
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)));
    setToast(u.active ? `Đã khóa tài khoản ${u.name}` : `Đã mở khóa tài khoản ${u.name}`);
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Hệ thống"
        title="Phân quyền"
        meta={[
          `${roles.length} vai trò`,
          `${users.length} tài khoản đang khai báo`,
          `${users.filter((u) => u.twoFA).length} tài khoản bật xác thực hai lớp`,
        ]}
        actions={
          <>
            <Button variant="outline" icon={UserPlus} onClick={() => setToast("Bản demo chỉ minh họa giao diện")}>
              Thêm tài khoản
            </Button>
            <Button icon={ShieldCheck} onClick={() => setToast("Bản demo chỉ minh họa giao diện")}>
              Tạo vai trò
            </Button>
          </>
        }
      />

      <StatStrip cols={4}>
        <Stat label="Vai trò" value={roles.length} icon={ShieldCheck}
          hint={`${roles.filter((r) => r.system).length} vai trò hệ thống không sửa được`} />
        <Stat label="Tài khoản hoạt động" value={users.filter((u) => u.active).length} icon={Users}
          hint={`${users.filter((u) => !u.active).length} tài khoản đang khóa`} />
        <Stat label="Xác thực hai lớp" value={`${Math.round((users.filter((u) => u.twoFA).length / users.length) * 100)}%`}
          icon={KeyRound} progress={Math.round((users.filter((u) => u.twoFA).length / users.length) * 100)}
          hint="Nên đạt 100% với vai trò quản lý" />
        <Stat label="Vai trò giới hạn chi nhánh" value={roles.filter((r) => r.scope === "branch").length}
          icon={Building2} hint="Chỉ thấy dữ liệu chi nhánh được gán" />
      </StatStrip>

      <Tabs
        className="mt-8"
        value={tab}
        onChange={setTab}
        items={[
          { key: "matrix", label: "Ma trận quyền", icon: ShieldCheck },
          { key: "roles", label: "Danh sách vai trò", icon: KeyRound, count: roles.length },
          { key: "users", label: "Tài khoản", icon: Users, count: users.length },
        ]}
      />

      {/* ── Ma trận quyền ── */}
      {tab === "matrix" && (
        <>
          <Toolbar className="mt-5">
            <Select value={activeRole} onChange={(e) => setActiveRole(e.target.value)} wrapperClassName="w-[240px]">
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
            <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
              <StatusTag tone={role.scope === "all" ? "info" : "warning"}>
                {role.scope === "all" ? "Toàn hệ thống" : "Giới hạn theo chi nhánh"}
              </StatusTag>
              {role.system && <StatusTag tone="neutral">Vai trò hệ thống</StatusTag>}
              <span className="text-[12px] tnum" style={{ color: "var(--fg-muted)" }}>
                {totalGrants}/{maxGrants} quyền đang bật
              </span>
            </div>
          </Toolbar>

          {role.system && (
            <div
              className="mt-4 flex items-start gap-3 px-5 py-4 border text-[13px]"
              style={{
                borderRadius: "var(--r)",
                backgroundColor: "var(--info-soft)",
                borderColor: "var(--info-border)",
                color: "var(--info-fg)",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>{role.name}</strong> là vai trò hệ thống — luôn có toàn quyền và không chỉnh sửa được.
                Muốn giới hạn thì tạo một vai trò mới thay vì sửa vai trò này.
              </span>
            </div>
          )}

          <Panel className="mt-5" flush title={`Quyền của vai trò "${role.name}"`} sub={role.desc}>
            <Table minWidth={860}>
              <thead>
                <tr>
                  <Th>Chức năng</Th>
                  {ACTIONS.map((a) => <Th key={a.id} align="center">{a.label}</Th>)}
                  <Th align="center">Toàn quyền</Th>
                </tr>
              </thead>
              <tbody>
                {MODULE_GROUPS.map((grp) => (
                  <Fragment key={grp}>
                    {/* Hàng tiêu đề nhóm — dùng <td> thô vì Td của bộ ui không nhận colSpan */}
                    <tr>
                      <td
                        colSpan={ACTIONS.length + 2}
                        className="px-5 py-2"
                        style={{ backgroundColor: "var(--surface-2)", borderTop: "1px solid var(--border-soft)" }}
                      >
                        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] font-semibold"
                          style={{ color: "var(--fg-subtle)" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: (G[grp] || {}).base }} />
                          {grp}
                        </span>
                      </td>
                    </tr>
                    {permissionModules
                      .filter((m) => m.group === grp)
                      .map((m) => {
                        const granted = role.perms[m.id] || [];
                        const full = granted.length === ACTIONS.length;
                        return (
                          <Tr key={m.id}>
                            <Td>{m.label}</Td>
                            {ACTIONS.map((a) => {
                              const on = granted.includes(a.id);
                              return (
                                <Td key={a.id} align="center">
                                  <button
                                    type="button"
                                    onClick={() => togglePerm(m.id, a.id)}
                                    aria-pressed={on}
                                    aria-label={`${a.label} ${m.label}`}
                                    title={`${a.label} — ${m.label}`}
                                    className="w-6 h-6 grid place-items-center border transition-colors"
                                    style={{
                                      borderRadius: "var(--r-sm)",
                                      backgroundColor: on ? "var(--success-soft)" : "var(--surface-2)",
                                      borderColor: on ? "var(--success-border)" : "var(--border)",
                                      color: on ? "var(--success-fg)" : "var(--fg-subtle)",
                                      cursor: role.system ? "not-allowed" : "pointer",
                                      opacity: role.system ? 0.6 : 1,
                                    }}
                                  >
                                    {on ? <Check className="w-3.5 h-3.5" /> : <X className="w-3 h-3" />}
                                  </button>
                                </Td>
                              );
                            })}
                            <Td align="center">
                              <button
                                type="button"
                                onClick={() => toggleRow(m.id)}
                                className="text-[11px] font-medium underline-offset-2 hover:underline"
                                style={{ color: role.system ? "var(--fg-subtle)" : "var(--accent-fg)" }}
                                disabled={role.system}
                              >
                                {full ? "Bỏ hết" : "Chọn hết"}
                              </button>
                            </Td>
                          </Tr>
                        );
                      })}
                  </Fragment>
                ))}
              </tbody>
            </Table>
          </Panel>
        </>
      )}

      {/* ── Danh sách vai trò ── */}
      {tab === "roles" && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roles.map((r) => {
            const grants = Object.values(r.perms).reduce((s, a) => s + a.length, 0);
            const pct = Math.round((grants / maxGrants) * 100);
            return (
              <article
                key={r.id}
                className="border p-5 flex flex-col card-hover"
                style={{
                  borderRadius: "var(--r)",
                  backgroundColor: "var(--surface)",
                  borderColor: r.id === activeRole ? "var(--accent)" : "var(--border)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Eyebrow className="mb-1.5">
                      {r.scope === "all" ? "Toàn hệ thống" : "Theo chi nhánh"}
                    </Eyebrow>
                    <h3 className="font-display text-[20px] leading-tight" style={{ color: "var(--fg)" }}>
                      {r.name}
                    </h3>
                  </div>
                  {r.system ? (
                    <ShieldAlert className="w-5 h-5 shrink-0" style={{ color: "var(--metal)" }} />
                  ) : (
                    <ShieldCheck className="w-5 h-5 shrink-0" style={{ color: "var(--fg-subtle)" }} />
                  )}
                </div>

                <p className="mt-2.5 text-[13px] leading-relaxed flex-1" style={{ color: "var(--fg-muted)" }}>
                  {r.desc}
                </p>

                <Hairline className="my-4" soft />

                <div className="flex items-center justify-between gap-3 text-[12px]">
                  <span style={{ color: "var(--fg-subtle)" }}>Người dùng</span>
                  <span className="font-medium tnum" style={{ color: "var(--fg)" }}>{r.users}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-[12px]">
                  <span style={{ color: "var(--fg-subtle)" }}>Độ phủ quyền</span>
                  <span className="font-medium tnum" style={{ color: "var(--fg)" }}>{pct}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
                  <div className="h-full" style={{ width: `${pct}%`, backgroundColor: "var(--accent)" }} />
                </div>

                <div className="mt-4 flex items-center justify-end gap-1.5">
                  <Button size="sm" variant="outline" icon={Eye}
                    onClick={() => { setActiveRole(r.id); setTab("matrix"); }}>
                    Xem quyền
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Tài khoản ── */}
      {tab === "users" && (
        <>
          <Toolbar className="mt-5">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email hoặc vai trò…"
              wrapperClassName="flex-1 min-w-[220px]"
            />
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} wrapperClassName="w-[220px]">
              <option value="all">Tất cả vai trò</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </Toolbar>

          <Panel className="mt-5" flush>
            {filteredUsers.length === 0 ? (
              <EmptyState icon={Users} title="Không có tài khoản nào khớp"
                desc="Thử tìm bằng email, hoặc bỏ bộ lọc vai trò." />
            ) : (
              <Table minWidth={980}>
                <thead>
                  <tr>
                    <Th>Người dùng</Th>
                    <Th>Vai trò</Th>
                    <Th>Phạm vi dữ liệu</Th>
                    <Th align="center">Hai lớp</Th>
                    <Th align="right">Đăng nhập gần nhất</Th>
                    <Th>Trạng thái</Th>
                    <Th align="right">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <Tr key={u.id} onClick={() => setDetail(u)}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} src={u.avatar} size={34} />
                          <div className="min-w-0">
                            <div className="font-medium truncate" style={{ color: "var(--fg)" }}>{u.name}</div>
                            <div className="text-[11px] truncate" style={{ color: "var(--fg-subtle)" }}>{u.email}</div>
                          </div>
                        </div>
                      </Td>
                      <Td><Tag>{u.roleName}</Tag></Td>
                      <Td>
                        <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{u.branchName}</span>
                      </Td>
                      <Td align="center">
                        {u.twoFA ? (
                          <Check className="w-4 h-4 inline" style={{ color: "var(--success)" }} />
                        ) : (
                          <X className="w-3.5 h-3.5 inline" style={{ color: "var(--fg-subtle)" }} />
                        )}
                      </Td>
                      <Td align="right" num>
                        <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{u.lastLogin}</span>
                      </Td>
                      <Td>
                        <StatusTag tone={u.active ? "success" : "danger"}>
                          {u.active ? "Hoạt động" : "Đã khóa"}
                        </StatusTag>
                      </Td>
                      <Td align="right">
                        <div onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            icon={u.active ? Ban : Check}
                            label={u.active ? "Khóa tài khoản" : "Mở khóa"}
                            size="sm"
                            onClick={() => toggleUser(u)}
                          />
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Panel>
        </>
      )}

      {/* ── Chi tiết tài khoản ── */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        eyebrow={detail?.roleName}
        title={detail?.name || ""}
        sub={detail?.email}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDetail(null)}>Đóng</Button>
            <Button
              icon={Eye}
              onClick={() => {
                setActiveRole(detail.roleId);
                setTab("matrix");
                setDetail(null);
              }}
            >
              Xem quyền của vai trò
            </Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={detail.name} src={detail.avatar} size={52} />
              <div className="space-y-1.5">
                <StatusTag tone={detail.active ? "success" : "danger"}>
                  {detail.active ? "Đang hoạt động" : "Đã khóa"}
                </StatusTag>
                <div className="text-[12px]" style={{ color: "var(--fg-muted)" }}>
                  Đăng nhập gần nhất {detail.lastLogin}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px border overflow-hidden"
              style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}>
              {[
                ["Vai trò", detail.roleName],
                ["Phạm vi dữ liệu", detail.branchName],
                ["Xác thực hai lớp", detail.twoFA ? "Đã bật" : "Chưa bật"],
                ["Mã nhân viên", detail.staffId],
              ].map(([k, v]) => (
                <div key={k} className="px-4 py-3" style={{ backgroundColor: "var(--surface)" }}>
                  <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--fg-subtle)" }}>{k}</div>
                  <div className="mt-1 text-[13px] font-medium" style={{ color: "var(--fg)" }}>{v}</div>
                </div>
              ))}
            </div>

            {!detail.twoFA && (
              <div className="flex items-start gap-3 text-[13px] px-4 py-3 border"
                style={{
                  borderRadius: "var(--r-sm)",
                  backgroundColor: "var(--warning-soft)",
                  borderColor: "var(--warning-border)",
                  color: "var(--warning-fg)",
                }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Tài khoản chưa bật xác thực hai lớp. Với vai trò có quyền duyệt, nên bắt buộc bật.</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}
