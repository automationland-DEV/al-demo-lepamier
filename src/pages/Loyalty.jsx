import { useCallback, useEffect, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { loyaltyMembers as seed, loyaltyTiers, pointRules } from "../data/adminData";
import { formatVND, formatVNDFull, formatDate } from "../utils/format";
import { usePalette } from "../theme/palette";
import Pagination from "../components/Pagination";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat, SectionHead,
  Button, IconButton, SearchInput, Select, Field, Input, Tabs,
  Tag, StatusTag, Avatar, Table, Th, Td, Tr, Modal, EmptyState, Toast,
  Eyebrow, Hairline, ChartLegend, axisProps, gridProps, chartTip,
} from "../components/ui";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

/**
 * KHÁCH THÂN THIẾT — hạng thành viên, điểm tích lũy và quy tắc tính điểm.
 *
 * Trang Hồ sơ khách trả lời "ai đã ở đây". Trang này trả lời "ai đáng giữ":
 * hạng thành viên suy ra từ số lần lưu trú, điểm suy ra từ chi tiêu × hệ số
 * hạng, nên hai con số luôn khớp nhau chứ không phải hai trường rời rạc.
 */

const {
  Crown, Gift, Award, TrendingUp, Users, Eye, Check,
  Percent, Mail, Phone, CalendarDays,
} = Icons;

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const SORTS = [
  { key: "points-desc", label: "Điểm cao nhất" },
  { key: "spent-desc", label: "Chi tiêu nhiều nhất" },
  { key: "stays-desc", label: "Lưu trú nhiều nhất" },
  { key: "recent", label: "Ghé gần đây nhất" },
  { key: "name-asc", label: "Tên A → Z" },
];

export default function Loyalty() {
  const { seriesMap, chart } = usePalette();
  const T = useMemo(() => seriesMap(loyaltyTiers.map((t) => t.id)), [seriesMap]);
  const [barColor] = chart(1);

  const [list, setList] = useState(seed);
  const [tab, setTab] = useState("members");
  const [tier, setTier] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("points-desc");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [award, setAward] = useState(null);
  const [toast, setToast] = useState(null);
  const PAGE_SIZE = 12;

  useEffect(() => setPage(1), [tier, search, sort]);

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    const out = list.filter((m) => {
      if (tier !== "all" && m.tier !== tier) return false;
      if (q && !deaccent(`${m.name} ${m.phone} ${m.email}`).includes(q)) return false;
      return true;
    });
    const by = {
      "points-desc": (a, b) => b.points - a.points,
      "spent-desc": (a, b) => b.spent - a.spent,
      "stays-desc": (a, b) => b.stays - a.stays,
      recent: (a, b) => String(b.lastStay).localeCompare(String(a.lastStay)),
      "name-asc": (a, b) => a.name.localeCompare(b.name, "vi"),
    }[sort];
    return [...out].sort(by);
  }, [list, tier, search, sort]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalPoints = list.reduce((s, m) => s + m.points - m.redeemed, 0);
  const totalSpent = list.reduce((s, m) => s + m.spent, 0);
  const elite = list.filter((m) => ["platinum", "diamond"].includes(m.tier)).length;
  const avgSpend = list.length ? Math.round(totalSpent / list.length) : 0;

  /* Phân bố thành viên theo hạng — dùng cả cho biểu đồ và dải hạng */
  const byTier = useMemo(
    () =>
      loyaltyTiers.map((t) => {
        const members = list.filter((m) => m.tier === t.id);
        return {
          id: t.id,
          name: t.name,
          count: members.length,
          spent: members.reduce((s, m) => s + m.spent, 0),
          points: members.reduce((s, m) => s + m.points, 0),
        };
      }),
    [list]
  );

  const grant = useCallback((member, points, reason) => {
    const p = Number(points) || 0;
    setList((prev) => prev.map((m) => (m.id === member.id ? { ...m, points: m.points + p } : m)));
    setAward(null);
    setToast(`Đã cộng ${p.toLocaleString("vi-VN")} điểm cho ${member.name}${reason ? ` — ${reason}` : ""}`);
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Khách hàng"
        title="Khách thân thiết"
        meta={[
          `${list.length} thành viên đang hoạt động`,
          `${elite} khách hạng Bạch kim trở lên`,
          `Tổng điểm khả dụng ${totalPoints.toLocaleString("vi-VN")}`,
        ]}
        actions={<Button icon={Gift} onClick={() => setAward(list[0])}>Cộng điểm thủ công</Button>}
      />

      <StatStrip cols={4}>
        <Stat label="Thành viên" value={list.length} icon={Users}
          hint={`${elite} khách hạng cao`} />
        <Stat label="Điểm khả dụng" value={totalPoints.toLocaleString("vi-VN")} icon={Award}
          hint="Đã trừ điểm đã quy đổi" />
        <Stat label="Chi tiêu tích lũy" value={formatVND(totalSpent)} icon={TrendingUp}
          hint={`Trung bình ${formatVND(avgSpend)} / khách`} />
        <Stat label="Tỉ lệ khách hạng cao" value={`${Math.round((elite / list.length) * 100)}%`}
          icon={Crown} progress={Math.round((elite / list.length) * 100)}
          hint="Bạch kim và Kim cương" />
      </StatStrip>

      {/* Dải hạng — bấm để lọc nhanh */}
      <div className="mt-5 grid gap-px border overflow-hidden grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        style={{ borderRadius: "var(--r)", backgroundColor: "var(--border)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
        {byTier.map((t) => {
          const c = T[t.id] || {};
          const on = tier === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTier(on ? "all" : t.id)}
              className="p-5 text-left transition-colors"
              style={{ backgroundColor: on ? "var(--surface-2)" : "var(--surface)" }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.base }} />
                <span className="text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: "var(--fg-subtle)" }}>
                  {t.name}
                </span>
              </div>
              <div className="mt-2.5 text-[26px] font-medium tnum" style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}>
                {t.count}
              </div>
              <div className="mt-1 text-[12px] tnum" style={{ color: "var(--fg-muted)" }}>
                {formatVND(t.spent)}
              </div>
            </button>
          );
        })}
      </div>

      <Tabs
        className="mt-8"
        value={tab}
        onChange={setTab}
        items={[
          { key: "members", label: "Danh sách thành viên", icon: Users, count: filtered.length },
          { key: "tiers", label: "Hạng & Quyền lợi", icon: Crown },
          { key: "rules", label: "Quy tắc tích điểm", icon: Percent },
        ]}
      />

      {/* ── Thành viên ── */}
      {tab === "members" && (
        <>
          <Toolbar className="mt-5">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, số điện thoại hoặc email…"
              wrapperClassName="flex-1 min-w-[220px]"
            />
            <Select value={tier} onChange={(e) => setTier(e.target.value)} wrapperClassName="w-[170px]">
              <option value="all">Tất cả hạng</option>
              {loyaltyTiers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} wrapperClassName="w-[190px]">
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </Select>
          </Toolbar>

          <Panel className="mt-5" flush>
            {filtered.length === 0 ? (
              <EmptyState icon={Crown} title="Không có thành viên nào khớp"
                desc="Thử tìm bằng số điện thoại, hoặc bỏ bộ lọc hạng." />
            ) : (
              <>
                <Table minWidth={1040}>
                  <thead>
                    <tr>
                      <Th>Thành viên</Th>
                      <Th>Hạng</Th>
                      <Th align="right">Lưu trú</Th>
                      <Th align="right">Chi tiêu</Th>
                      <Th align="right">Điểm khả dụng</Th>
                      <Th>Tiến độ lên hạng</Th>
                      <Th align="right">Ghé gần nhất</Th>
                      <Th align="right">Thao tác</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((m) => {
                      const c = T[m.tier] || {};
                      const cur = loyaltyTiers.find((t) => t.id === m.tier);
                      const next = m.nextTier?.id !== m.tier ? m.nextTier : null;
                      const pct = next
                        ? Math.min(100, Math.round(((m.stays - cur.min) / Math.max(next.min - cur.min, 1)) * 100))
                        : 100;
                      return (
                        <Tr key={m.id} onClick={() => setDetail(m)}>
                          <Td>
                            <div className="flex items-center gap-3">
                              <Avatar name={m.name} src={m.avatar} size={34} />
                              <div className="min-w-0">
                                <div className="font-medium truncate" style={{ color: "var(--fg)" }}>{m.name}</div>
                                <div className="text-[11px] tnum" style={{ color: "var(--fg-subtle)" }}>{m.phone}</div>
                              </div>
                            </div>
                          </Td>
                          <Td><Tag dot={c.base}>{m.tierName}</Tag></Td>
                          <Td align="right" num>{m.stays}</Td>
                          <Td align="right" num>{formatVND(m.spent)}</Td>
                          <Td align="right" num>
                            <span className="font-medium" style={{ color: "var(--fg)" }}>
                              {(m.points - m.redeemed).toLocaleString("vi-VN")}
                            </span>
                          </Td>
                          <Td>
                            <div className="flex items-center gap-2.5">
                              <div className="w-20 h-1 overflow-hidden shrink-0" style={{ backgroundColor: "var(--surface-3)" }}>
                                <div className="h-full" style={{ width: `${pct}%`, backgroundColor: "var(--accent)" }} />
                              </div>
                              <span className="text-[11px] whitespace-nowrap" style={{ color: "var(--fg-subtle)" }}>
                                {next ? `→ ${next.name}` : "Hạng cao nhất"}
                              </span>
                            </div>
                          </Td>
                          <Td align="right" num>{formatDate(m.lastStay)}</Td>
                          <Td align="right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <IconButton icon={Gift} label="Cộng điểm" size="sm" onClick={() => setAward(m)} />
                              <IconButton icon={Eye} label="Xem chi tiết" size="sm" onClick={() => setDetail(m)} />
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

          <SectionHead
            eyebrow="Phân tích"
            title="Chi tiêu tích lũy theo hạng"
            sub="Nhóm khách nào thực sự đóng góp doanh thu."
          />
          <Panel>
            <ChartLegend className="mb-4" items={[{ label: "Chi tiêu tích lũy", color: barColor }]} />
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byTier} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis {...axisProps} tickFormatter={(v) => formatVND(v)} width={64} />
                  <Tooltip {...chartTip} formatter={(v, _n, p) => [formatVNDFull(v), `${p.payload.count} thành viên`]} />
                  <Bar dataKey="spent" radius={[3, 3, 0, 0]} maxBarSize={64}>
                    {byTier.map((t) => <Cell key={t.id} fill={(T[t.id] || {}).base || barColor} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </>
      )}

      {/* ── Hạng & quyền lợi ── */}
      {tab === "tiers" && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loyaltyTiers.map((t) => {
            const c = T[t.id] || {};
            const stat = byTier.find((x) => x.id === t.id);
            return (
              <article
                key={t.id}
                className="border p-5 flex flex-col card-hover"
                style={{
                  borderRadius: "var(--r)",
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.base }} />
                      <Eyebrow>Hạng {t.name}</Eyebrow>
                    </span>
                    <h3 className="mt-2 font-display text-[24px] leading-tight" style={{ color: "var(--fg)" }}>
                      {t.name}
                    </h3>
                  </div>
                  <span className="text-[26px] font-medium tnum shrink-0" style={{ color: "var(--fg)" }}>
                    {stat?.count ?? 0}
                  </span>
                </div>

                <div className="mt-3 text-[13px]" style={{ color: "var(--fg-muted)" }}>
                  Đạt từ <strong className="tnum" style={{ color: "var(--fg)" }}>{t.min}</strong> lần lưu trú ·
                  hệ số tích điểm <strong className="tnum" style={{ color: "var(--fg)" }}>×{t.rate}</strong>
                </div>

                <Hairline className="my-4" soft />

                <ul className="space-y-2 text-[13px] flex-1">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2.5" style={{ color: "var(--fg-muted)" }}>
                      <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: c.base }} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-4 flex items-center justify-between text-[12px]"
                  style={{ borderTop: "1px solid var(--border-soft)" }}>
                  <span style={{ color: "var(--fg-subtle)" }}>Chi tiêu tích lũy</span>
                  <span className="font-medium tnum" style={{ color: "var(--fg)" }}>{formatVND(stat?.spent || 0)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Quy tắc ── */}
      {tab === "rules" && (
        <Panel className="mt-5" flush title="Quy tắc tính điểm"
          sub="Áp dụng tự động khi khách trả phòng. Bản demo chỉ minh họa cấu hình.">
          <Table minWidth={760}>
            <thead>
              <tr>
                <Th>Quy tắc</Th>
                <Th>Diễn giải</Th>
                <Th align="right">Giá trị</Th>
                <Th>Trạng thái</Th>
              </tr>
            </thead>
            <tbody>
              {pointRules.map((r) => (
                <Tr key={r.id}>
                  <Td><span className="font-medium">{r.name}</span></Td>
                  <Td><span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{r.desc}</span></Td>
                  <Td align="right" num>{r.value}</Td>
                  <Td>
                    <StatusTag tone={r.active ? "success" : "neutral"}>
                      {r.active ? "Đang áp dụng" : "Tạm tắt"}
                    </StatusTag>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}

      {/* ── Chi tiết thành viên ── */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        wide
        eyebrow={`Hạng ${detail?.tierName || ""}`}
        title={detail?.name || ""}
        sub={detail ? `Thành viên từ ${formatDate(detail.joined)}` : ""}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDetail(null)}>Đóng</Button>
            <Button icon={Gift} onClick={() => { setAward(detail); setDetail(null); }}>Cộng điểm</Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={detail.name} src={detail.avatar} size={56} />
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--fg-muted)" }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: "var(--fg-subtle)" }} />
                  <span className="tnum">{detail.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--fg-muted)" }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: "var(--fg-subtle)" }} />
                  <span className="truncate">{detail.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border overflow-hidden"
              style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}>
              {[
                ["Lượt lưu trú", detail.stays],
                ["Chi tiêu", formatVND(detail.spent)],
                ["Điểm tích lũy", detail.points.toLocaleString("vi-VN")],
                ["Đã quy đổi", detail.redeemed.toLocaleString("vi-VN")],
              ].map(([k, v]) => (
                <div key={k} className="px-4 py-3" style={{ backgroundColor: "var(--surface)" }}>
                  <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--fg-subtle)" }}>{k}</div>
                  <div className="mt-1 text-[15px] font-medium tnum" style={{ color: "var(--fg)" }}>{v}</div>
                </div>
              ))}
            </div>

            <div>
              <Eyebrow className="mb-2.5">Quyền lợi đang hưởng</Eyebrow>
              <ul className="space-y-2 text-[13px]">
                {(loyaltyTiers.find((t) => t.id === detail.tier)?.perks || []).map((p) => (
                  <li key={p} className="flex items-start gap-2.5" style={{ color: "var(--fg-muted)" }}>
                    <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--fg-muted)" }}>
              <CalendarDays className="w-3.5 h-3.5" style={{ color: "var(--fg-subtle)" }} />
              Ghé gần nhất {formatDate(detail.lastStay)}
            </div>
          </div>
        )}
      </Modal>

      <AwardModal open={!!award} member={award} list={list} onPick={setAward} onClose={() => setAward(null)} onSubmit={grant} />
      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}

/* ═══════════ Cộng điểm thủ công ═══════════ */
function AwardModal({ open, member, list, onPick, onClose, onSubmit }) {
  const [points, setPoints] = useState(500);
  const [reason, setReason] = useState("Thưởng sinh nhật");

  if (!member) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Điểm thưởng"
      title={`Cộng điểm cho ${member.name}`}
      sub={`Đang có ${(member.points - member.redeemed).toLocaleString("vi-VN")} điểm khả dụng`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button icon={Check} onClick={() => onSubmit(member, points, reason)}>Cộng điểm</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Thành viên">
          <Select value={member.id} onChange={(e) => onPick(list.find((m) => m.id === e.target.value))}>
            {list.map((m) => (
              <option key={m.id} value={m.id}>{m.name} — {m.tierName}</option>
            ))}
          </Select>
        </Field>
        <Field label="Số điểm cộng thêm">
          <Input type="number" min={1} step={100} value={points} onChange={(e) => setPoints(e.target.value)} />
        </Field>
        <Field label="Lý do">
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            {["Thưởng sinh nhật", "Giới thiệu bạn bè", "Bù trừ khiếu nại", "Khách VIP dịp lễ", "Điều chỉnh thủ công"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
