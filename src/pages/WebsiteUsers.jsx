import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Icons } from "../components/Icons";
import {
  branches, websiteUserDaily, websiteUserBase, websiteTopUsers,
  websiteHourly, WEB_USER_METRICS, ACTIVE_REACH_EXPONENT,
} from "../data/mockData";
import { useActiveBranch } from "../context/BranchContext";
import { usePalette } from "../theme/palette";
import {
  WebsiteTabs, RangePicker, KpiCard, Panel, TopTable, EmptyState, Toast,
} from "../components/WebsitePrimitives";
import {
  resolveRange, previousRange, sumRange, growth, daysBetween, dayIndex,
  parseISO, ddmm, ddmmyyyy, num, pct0, pct1, chartTip,
} from "../utils/website";

const {
  UsersRound, UserPlus, Activity, Download, Share2, CalendarCheck,
  MessageSquare, Phone, Clock, FileDown,
} = Icons;

/* Gộp biểu đồ — mỗi mức cần khoảng thời gian tối thiểu mới có ý nghĩa */
const GROUPS = [
  { key: "day",   label: "Theo ngày",  minDays: 0 },
  { key: "week",  label: "Theo tuần",  minDays: 15 },
  { key: "month", label: "Theo tháng", minDays: 60 },
];

/* 5 bảng TOP — thứ tự này quyết định luôn màu gradient của từng bảng */
const TOP_TABLES = [
  { metric: "downloads", icon: Download,      title: "TOP người dùng tải bảng giá nhiều nhất",   valueHead: "Số lượt tải" },
  { metric: "shares",    icon: Share2,        title: "TOP người dùng chia sẻ nhiều nhất",        valueHead: "Số lượt chia sẻ" },
  { metric: "bookings",  icon: CalendarCheck, title: "TOP người dùng đặt phòng nhiều nhất",      valueHead: "Số lượt đặt" },
  { metric: "chats",     icon: MessageSquare, title: "TOP người dùng chat với admin nhiều nhất", valueHead: "Số lượt chat" },
  { metric: "calls",     icon: Phone,         title: "TOP người dùng gọi nhiều nhất",            valueHead: "Số lượt gọi" },
];

const BRANCH_BY_ID = branches.reduce((a, b) => ((a[b.id] = b), a), {});

/** Nhãn khung giờ 2 tiếng: 0 → "00:00 - 01:59" */
const slotLabel = (i) =>
  `${String(i * 2).padStart(2, "0")}:00 - ${String(i * 2 + 1).padStart(2, "0")}:59`;

/** Hệ số mùa vụ của một tài khoản tại thời điểm giữa khoảng đang xem.
 *  Nhờ nó, đổi khoảng thời gian thì thứ hạng đổi thật chứ không chỉ đổi độ lớn. */
const seasonal = (phase, mid) => 1 + 0.5 * Math.sin(2 * Math.PI * (mid / 70 + phase));

export default function WebsiteUsers() {
  const { activeBranchId, activeBranch, isAll } = useActiveBranch();
  const { brand, series, seriesMap } = usePalette();

  const KPI = useMemo(() => series(6), [series]);
  const RANK = useMemo(() => series(3), [series]);
  const CHANNEL = useMemo(() => seriesMap(["web", "mobile"]), [seriesMap]);

  const [rangeKey, setRangeKey] = useState("30d");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [group, setGroup] = useState("day");
  const [toast, setToast] = useState(null);

  const rangeRef = useRef(null);
  const toastTimer = useRef(null);

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const onDown = (e) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target)) setRangeOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const scopedIds = useMemo(
    () => (isAll ? branches.map((b) => b.id) : [activeBranchId]),
    [isAll, activeBranchId]
  );

  const range = useMemo(() => resolveRange(rangeKey), [rangeKey]);
  const rangeDays = useMemo(() => daysBetween(range.from, range.to), [range]);

  useEffect(() => {
    const cur = GROUPS.find((g) => g.key === group);
    if (cur && rangeDays < cur.minDays) {
      setGroup([...GROUPS].reverse().find((g) => rangeDays >= g.minDays)?.key || "day");
    }
  }, [rangeDays, group]);

  /* ── Tài khoản: tổng tích luỹ, đăng ký mới, hoạt động ── */

  const userStats = useMemo(() => {
    let created = 0;       // tài khoản tạo từ đầu dữ liệu tới hết khoảng đang xem
    let newInRange = 0;
    let dauSum = 0;
    let dauDays = 0;

    for (const row of websiteUserDaily) {
      if (row.date > range.to) break;
      let dayNew = 0, dayDau = 0;
      for (const id of scopedIds) {
        const m = row.byBranch[id];
        if (!m) continue;
        dayNew += m.newUsers;
        dayDau += m.dau;
      }
      created += dayNew;
      if (row.date >= range.from) {
        newInRange += dayNew;
        dauSum += dayDau;
        dauDays++;
      }
    }

    const base = scopedIds.reduce((n, id) => n + (websiteUserBase[id] || 0), 0);
    const total = base + created;
    const avgDau = dauDays ? dauSum / dauDays : 0;
    // Người vào nhiều ngày chỉ tính một lần → không cộng thẳng DAU
    const active = Math.min(total, Math.round(avgDau * rangeDays ** ACTIVE_REACH_EXPONENT));

    return { total, newInRange, active, activeRate: total ? (active / total) * 100 : 0 };
  }, [range, scopedIds, rangeDays]);

  const prevNewUsers = useMemo(() => {
    const p = previousRange(range);
    let n = 0;
    for (const row of websiteUserDaily) {
      if (row.date < p.from || row.date > p.to) continue;
      for (const id of scopedIds) n += row.byBranch[id]?.newUsers || 0;
    }
    return n;
  }, [range, scopedIds]);

  /* ── Biểu đồ tăng trưởng ── */

  const daily = useMemo(() => {
    const out = [];
    for (const row of websiteUserDaily) {
      if (row.date < range.from || row.date > range.to) continue;
      let active = 0, fresh = 0;
      for (const id of scopedIds) {
        const m = row.byBranch[id];
        if (!m) continue;
        active += m.dau;
        fresh += m.newUsers;
      }
      out.push({ date: row.date, active, fresh });
    }
    return out;
  }, [range, scopedIds]);

  const chartData = useMemo(() => {
    if (group === "day") return daily.map((d) => ({ label: ddmm(d.date), active: d.active, fresh: d.fresh }));

    const buckets = new Map();
    for (const d of daily) {
      const dt = parseISO(d.date);
      let key, label;
      if (group === "week") {
        const monday = new Date(dt);
        monday.setDate(monday.getDate() - ((dt.getDay() + 6) % 7));
        key = `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;
        label = `${String(monday.getDate()).padStart(2, "0")}/${String(monday.getMonth() + 1).padStart(2, "0")}`;
      } else {
        key = `${dt.getFullYear()}-${dt.getMonth()}`;
        label = `T${dt.getMonth() + 1}`;
      }
      const cur = buckets.get(key) || { label, active: 0, fresh: 0 };
      // Người dùng hoạt động là số người, không phải lượt → gộp bằng trung bình
      cur.active += d.active;
      cur.fresh += d.fresh;
      cur._n = (cur._n || 0) + 1;
      buckets.set(key, cur);
    }
    return [...buckets.values()].map((b) => ({
      label: b.label,
      active: Math.round(b.active / b._n),
      fresh: b.fresh,
    }));
  }, [daily, group]);

  /* ── 5 bảng TOP người dùng ── */

  const totals = useMemo(() => sumRange(range, scopedIds), [range, scopedIds]);

  const topUsers = useMemo(() => {
    const mid = (dayIndex(range.from) + dayIndex(range.to)) / 2;
    // Chi nhánh đang chọn thì chỉ xét tài khoản quan tâm chi nhánh đó
    const pool = isAll ? websiteTopUsers : websiteTopUsers.filter((u) => u.branchId === activeBranchId);

    return Object.fromEntries(
      WEB_USER_METRICS.map((m) => [
        m,
        pool
          .map((u) => ({
            id: u.id,
            name: u.name,
            sub: `${u.tier} · ${BRANCH_BY_ID[u.branchId]?.city || "—"}`,
            value: Math.round(totals[m] * u.share[m] * seasonal(u.phase, mid)),
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5),
      ])
    );
  }, [totals, range, isAll, activeBranchId]);

  /* ── Truy cập theo khung giờ (trung bình mỗi ngày) ── */

  const hourly = useMemo(() => {
    // Web = máy tính + máy tính bảng, khớp với cách chia thiết bị ở tab Tổng quan
    const webTotal = totals.desktop + totals.tablet;
    const mobileTotal = totals.mobile;

    // Trọng số giờ của phạm vi = bình quân có trọng số theo lưu lượng từng chi nhánh
    const wByBranch = Object.fromEntries(
      scopedIds.map((id) => [id, sumRange(range, [id]).visits])
    );
    const wSum = Object.values(wByBranch).reduce((a, x) => a + x, 0) || 1;

    return Array.from({ length: 24 }, (_, h) => {
      let wW = 0, wM = 0;
      for (const id of scopedIds) {
        const share = wByBranch[id] / wSum;
        wW += websiteHourly[id][h].web * share;
        wM += websiteHourly[id][h].mobile * share;
      }
      return {
        hour: h,
        label: `${String(h).padStart(2, "0")}:00`,
        web: (webTotal * wW) / rangeDays,
        mobile: (mobileTotal * wM) / rangeDays,
      };
    });
  }, [totals, range, scopedIds, rangeDays]);

  const hourChart = useMemo(
    () => hourly.map((h) => ({ ...h, total: h.web + h.mobile })),
    [hourly]
  );

  /* Gộp 24 giờ thành 12 khung 2 tiếng cho bảng chi tiết */
  const slots = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = hourly[i * 2], b = hourly[i * 2 + 1];
        return { label: slotLabel(i), web: a.web + b.web, mobile: a.mobile + b.mobile };
      }),
    [hourly]
  );

  const slotTotal = useMemo(
    () => slots.reduce((acc, s) => ({ web: acc.web + s.web, mobile: acc.mobile + s.mobile }),
                       { web: 0, mobile: 0 }),
    [slots]
  );

  const peak = useMemo(
    () => hourChart.reduce((a, x) => (x.total > a.total ? x : a), hourChart[0]),
    [hourChart]
  );

  const compareLabel = "so với kỳ trước";

  const kpis = [
    {
      metric: "total", icon: UsersRound, label: "Tổng người dùng", value: userStats.total,
      foot: "Tổng số tài khoản đã tạo", ...KPI[0],
    },
    {
      metric: "new", icon: UserPlus, label: "Người dùng mới", value: userStats.newInRange,
      trend: growth(userStats.newInRange, prevNewUsers), ...KPI[1],
    },
    {
      metric: "rate", icon: Activity, label: "Tỉ lệ hoạt động", value: pct0(userStats.activeRate), raw: true,
      foot: `${num(userStats.active)} / ${num(userStats.total)} tài khoản có hoạt động (ước tính)`,
      ...KPI[2],
    },
  ];

  const exportCsv = () => {
    const lines = [
      `# Quản lý người dùng website — ${ddmmyyyy(range.from)} đến ${ddmmyyyy(range.to)}`,
      `# Phạm vi: ${isAll ? "Toàn hệ thống" : activeBranch?.name}`,
      `# Tổng người dùng: ${userStats.total} · Mới: ${userStats.newInRange} · Hoạt động: ${userStats.active}`,
      "",
      "Ngày,Người dùng hoạt động,Người dùng mới",
      ...daily.map((d) => [ddmmyyyy(d.date), d.active, d.fresh].join(",")),
      "",
      "Khung giờ,Web,Mobile,Tổng truy cập (trung bình mỗi ngày)",
      ...slots.map((s) => [s.label, Math.round(s.web), Math.round(s.mobile), Math.round(s.web + s.mobile)].join(",")),
    ];
    const url = URL.createObjectURL(
      new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `nguoi-dung-website-${range.from}-${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Đã xuất ${daily.length} ngày dữ liệu ra CSV`);
  };

  const noData = daily.length === 0;

  return (
    <div className="max-w-[1360px] mx-auto pb-10">
      {/* ═══ HEADER ═══ */}
      <div className="relative flex flex-wrap items-end justify-between gap-4 pt-1 pb-6">
        <div className="min-w-0">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.14em] text-white mb-3"
            style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}
          >
            <UsersRound className="w-3 h-3" /> Marketing
          </div>
          <h1
            className="font-display font-extrabold tracking-[-0.03em] text-[32px] sm:text-[38px] leading-none"
            style={{ color: "var(--fg)" }}
          >
            Quản lý người dùng
          </h1>
          <div className="flex items-center gap-2.5 mt-2.5 text-[13px] flex-wrap" style={{ color: "var(--fg-muted)" }}>
            <span>Thống kê toàn bộ tài khoản đăng ký trên website</span>
            <span className="opacity-40">•</span>
            <span>{isAll ? "Toàn hệ thống" : activeBranch?.name}</span>
            <span className="opacity-40">•</span>
            <span className="tabular-nums">{rangeDays} ngày</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <RangePicker
            value={rangeKey}
            onChange={(k) => { setRangeKey(k); setRangeOpen(false); }}
            open={rangeOpen}
            onToggle={() => setRangeOpen((v) => !v)}
            innerRef={rangeRef}
          />
          <button
            onClick={exportCsv}
            disabled={noData}
            title={noData ? "Không có dữ liệu trong khoảng đã chọn" : "Tải báo cáo dạng CSV"}
            className="glowbtn inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-bold text-white active:scale-95 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg,${brand.from},${brand.to})`,
              boxShadow: `0 8px 20px -8px ${brand.from}99`,
              opacity: noData ? 0.4 : 1,
            }}
          >
            <FileDown className="w-4 h-4" /> Xuất báo cáo
          </button>
        </div>
      </div>

      <WebsiteTabs />

      {noData ? (
        <EmptyState
          title="Chưa có dữ liệu người dùng"
          desc="Khoảng thời gian đang chọn nằm ngoài phạm vi dữ liệu website."
          actionLabel="Về 30 ngày qua"
          onReset={() => setRangeKey("30d")}
        />
      ) : (
        <>
          {/* ═══ KPI BENTO ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {kpis.map((k) => <KpiCard key={k.metric} {...k} compareLabel={compareLabel} />)}
          </div>

          {/* ═══ BIỂU ĐỒ TĂNG TRƯỞNG ═══ */}
          <Panel
            title="Biểu đồ tăng trưởng người dùng"
            sub={`${num(userStats.newInRange)} tài khoản mới · trung bình ${num(daily.reduce((n, d) => n + d.active, 0) / daily.length)} người hoạt động mỗi ngày`}
            right={
              <div className="inline-flex items-center gap-1 h-9 p-1 rounded-full"
                   style={{ backgroundColor: "var(--surface-2)" }}>
                {GROUPS.map((g) => {
                  const on = g.key === group;
                  const off = rangeDays < g.minDays;
                  return (
                    <button
                      key={g.key}
                      onClick={() => !off && setGroup(g.key)}
                      disabled={off}
                      title={off ? `Cần ít nhất ${g.minDays} ngày dữ liệu` : undefined}
                      className="h-7 px-3 rounded-full text-[11.5px] font-bold transition-all duration-200 disabled:cursor-not-allowed"
                      style={
                        on
                          ? { background: `linear-gradient(135deg,${brand.from},${brand.to})`, color: "#fff",
                              boxShadow: `0 6px 14px -6px ${brand.from}b3` }
                          : { color: "var(--fg-muted)", opacity: off ? 0.4 : 1 }
                      }
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            }
            pad
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gUserActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={brand.from} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={brand.from} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gUserNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={KPI[1].from} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={KPI[1].from} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-soft)" strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--fg-subtle)" fontSize={10}
                         tickLine={false} axisLine={false} minTickGap={22} />
                  <YAxis stroke="var(--fg-subtle)" fontSize={10} tickLine={false} axisLine={false}
                         width={48} tickFormatter={(v) => num(v)} />
                  <Tooltip contentStyle={chartTip} formatter={(v) => num(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                  <Area type="monotone" dataKey="active" name="Người dùng hoạt động"
                        stroke={brand.from} strokeWidth={2.5} fill="url(#gUserActive)" />
                  <Area type="monotone" dataKey="fresh" name="Người dùng mới"
                        stroke={KPI[1].from} strokeWidth={2.5} fill="url(#gUserNew)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* ═══ 5 BẢNG TOP + BẢNG KHUNG GIỜ ═══
              Sáu bảng nằm chung MỘT lưới. Trước đây tách làm hai lưới 3 và 5 ô nên
              khi màn hình rơi về 2 cột thì cả hai lưới đều lẻ ô, sinh ra khoảng
              trống cuối mỗi lưới. 6 chia hết cho cả 2 lẫn 3 cột → không còn ô trống. */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {TOP_TABLES.map((t, i) => (
              <TopTable
                key={t.metric}
                icon={t.icon}
                c={KPI[i]}
                rank={RANK}
                title={t.title}
                sub={isAll ? "Toàn hệ thống" : activeBranch?.city}
                nameHead="Người dùng"
                valueHead={t.valueHead}
                rows={topUsers[t.metric]}
                to="/guests"
                avatar
              />
            ))}

            <Panel
              title="Chi tiết truy cập theo khung giờ"
              sub={`Trung bình mỗi ngày · giờ cao điểm ${peak.label}`}
            >
              {/* 12 khung giờ cao hơn bảng TOP 5 dòng → giới hạn chiều cao rồi cuộn,
                  giữ đầu bảng và dòng tổng dính lại để hàng lưới không bị kéo dài. */}
              <div className="overflow-auto max-h-[344px]">
                <table className="w-full min-w-[340px]">
                  <thead>
                    <tr>
                      <th className="sticky top-0 z-10 text-left px-4 py-2 text-[10.5px] font-extrabold uppercase tracking-wider"
                          style={{ color: "var(--fg-subtle)", backgroundColor: "var(--surface-2)" }}>Khung giờ</th>
                      <th className="sticky top-0 z-10 text-right px-3 py-2 text-[10.5px] font-extrabold uppercase tracking-wider"
                          style={{ color: "var(--fg-subtle)", backgroundColor: "var(--surface-2)" }}>Web</th>
                      <th className="sticky top-0 z-10 text-right px-3 py-2 text-[10.5px] font-extrabold uppercase tracking-wider"
                          style={{ color: "var(--fg-subtle)", backgroundColor: "var(--surface-2)" }}>Mobile</th>
                      <th className="sticky top-0 z-10 text-right px-4 py-2 text-[10.5px] font-extrabold uppercase tracking-wider whitespace-nowrap"
                          style={{ color: "var(--fg-subtle)", backgroundColor: "var(--surface-2)" }}>Tổng truy cập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((s) => (
                      <tr key={s.label} className="border-t hover:bg-ink-50 transition"
                          style={{ borderColor: "var(--border-soft)" }}>
                        <td className="px-4 py-2 text-[12px] font-bold tabular-nums whitespace-nowrap"
                            style={{ color: "var(--fg)" }}>{s.label}</td>
                        <td className="px-3 py-2 text-right text-[12px] tabular-nums"
                            style={{ color: "var(--fg-muted)" }}>{num(s.web)}</td>
                        <td className="px-3 py-2 text-right text-[12px] tabular-nums"
                            style={{ color: "var(--fg-muted)" }}>{num(s.mobile)}</td>
                        <td className="px-4 py-2 text-right text-[12px] font-extrabold tabular-nums"
                            style={{ color: "var(--fg)" }}>{num(s.web + s.mobile)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="sticky bottom-0 z-10 border-t-2 px-4 py-2.5 text-[12px] font-extrabold"
                          style={{ color: "var(--fg)", borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}>Tổng</td>
                      <td className="sticky bottom-0 z-10 border-t-2 px-3 py-2.5 text-right text-[12px] font-extrabold tabular-nums"
                          style={{ color: "var(--fg)", borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}>{num(slotTotal.web)}</td>
                      <td className="sticky bottom-0 z-10 border-t-2 px-3 py-2.5 text-right text-[12px] font-extrabold tabular-nums"
                          style={{ color: "var(--fg)", borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}>{num(slotTotal.mobile)}</td>
                      <td className="sticky bottom-0 z-10 border-t-2 px-4 py-2.5 text-right text-[12px] font-extrabold tabular-nums"
                          style={{ color: "var(--fg)", borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}>{num(slotTotal.web + slotTotal.mobile)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Panel>
          </div>

          {/* ═══ 2 BIỂU ĐỒ KHUNG GIỜ ═══ Hai ô, luôn kín hàng ở mọi bề ngang. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Panel
              title="Tổng truy cập theo khung giờ"
              sub={`Trung bình mỗi ngày · đỉnh ${num(peak.total)} lượt lúc ${peak.label}`}
              pad
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourChart} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gHourTotal" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor={brand.to} />
                        <stop offset="100%" stopColor={brand.from} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border-soft)" strokeDasharray="3 6" vertical={false} />
                    <XAxis dataKey="label" stroke="var(--fg-subtle)" fontSize={10}
                           tickLine={false} axisLine={false} interval={3} />
                    <YAxis stroke="var(--fg-subtle)" fontSize={10} tickLine={false} axisLine={false}
                           width={48} tickFormatter={(v) => num(v)} />
                    <Tooltip contentStyle={chartTip} cursor={{ fill: "var(--surface-3)", opacity: 0.5 }}
                             formatter={(v) => [num(v), "Lượt truy cập"]} />
                    <Bar dataKey="total" name="Lượt truy cập" fill="url(#gHourTotal)"
                         radius={[8, 8, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel
              title="Kênh truy cập theo khung giờ"
              sub={`Web ${pct1((slotTotal.web / (slotTotal.web + slotTotal.mobile)) * 100)}% · Mobile ${pct1((slotTotal.mobile / (slotTotal.web + slotTotal.mobile)) * 100)}%`}
              pad
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourChart} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gHourWeb" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor={CHANNEL.web.to} />
                        <stop offset="100%" stopColor={CHANNEL.web.from} />
                      </linearGradient>
                      <linearGradient id="gHourMobile" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor={CHANNEL.mobile.to} />
                        <stop offset="100%" stopColor={CHANNEL.mobile.from} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border-soft)" strokeDasharray="3 6" vertical={false} />
                    <XAxis dataKey="label" stroke="var(--fg-subtle)" fontSize={10}
                           tickLine={false} axisLine={false} interval={3} />
                    <YAxis stroke="var(--fg-subtle)" fontSize={10} tickLine={false} axisLine={false}
                           width={48} tickFormatter={(v) => num(v)} />
                    <Tooltip contentStyle={chartTip} cursor={{ fill: "var(--surface-3)", opacity: 0.5 }}
                             formatter={(v) => num(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                    <Bar dataKey="web" name="Web" stackId="ch" fill="url(#gHourWeb)" barSize={12} />
                    <Bar dataKey="mobile" name="Mobile" stackId="ch" fill="url(#gHourMobile)"
                         radius={[8, 8, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          {/* Chú thích cách đọc — hai biểu đồ trên là trung bình, không phải tổng kỳ */}
          <div className="flex items-start gap-2 mt-3 text-[11.5px]" style={{ color: "var(--fg-subtle)" }}>
            <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              Số liệu khung giờ là <strong style={{ color: "var(--fg-muted)" }}>trung bình mỗi ngày</strong> trong {rangeDays} ngày
              đã chọn, không phải tổng cả kỳ — để so được nhịp truy cập giữa các khoảng thời gian dài ngắn khác nhau.
              Web gồm máy tính và máy tính bảng.
            </span>
          </div>
        </>
      )}

      {toast && <Toast>{toast}</Toast>}
    </div>
  );
}
