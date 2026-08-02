import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart as RePieChart, Pie, Cell,
} from "recharts";
import { Icons } from "../components/Icons";
import {
  branches, roomTypeList, serviceList,
  websiteDaily, websiteOnline, websiteRoomTypeShare, websiteServiceShare,
} from "../data/mockData";
import { useActiveBranch } from "../context/BranchContext";
import { usePalette } from "../theme/palette";
import {
  WebsiteTabs, RangePicker, KpiCard, Panel, TopTable, EmptyState, Toast,
} from "../components/WebsitePrimitives";
import {
  resolveRange, previousRange, sumRange, growth, daysBetween,
  parseISO, isoDate, ddmm, ddmmyyyy, num, pct1, chartTip,
} from "../utils/website";

const {
  Globe, Users, Eye, Download, Share2, CalendarCheck, MessageSquare, Phone,
  Building2, BedDouble, ConciergeBell, Heart, Smartphone, Monitor, Tablet,
  FileDown,
} = Icons;

/* Gộp biểu đồ — mỗi mức cần khoảng thời gian tối thiểu mới có ý nghĩa */
const GROUPS = [
  { key: "day",   label: "Theo ngày",  minDays: 0 },
  { key: "week",  label: "Theo tuần",  minDays: 15 },
  { key: "month", label: "Theo tháng", minDays: 60 },
];

const DEVICE_KEYS = ["mobile", "desktop", "tablet"];
const DEVICE_LABEL = { mobile: "Điện thoại", desktop: "Máy tính", tablet: "Máy tính bảng" };
const DEVICE_ICON  = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };

/* ───────────────────────── Trang ───────────────────────── */

export default function WebsiteOverview() {
  const { activeBranchId, activeBranch, isAll } = useActiveBranch();
  const { brand, series, seriesMap } = usePalette();

  const KPI = useMemo(() => series(7), [series]);
  const DEVICE = useMemo(() => seriesMap(DEVICE_KEYS), [seriesMap]);
  const RANK = useMemo(() => series(3), [series]);

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

  /* Chi nhánh trong phạm vi — tôn trọng lựa chọn trên sidebar */
  const scopedIds = useMemo(
    () => (isAll ? branches.map((b) => b.id) : [activeBranchId]),
    [isAll, activeBranchId]
  );

  const range = useMemo(() => resolveRange(rangeKey), [rangeKey]);
  const rangeDays = useMemo(() => daysBetween(range.from, range.to), [range]);

  /* Mức gộp không đủ dữ liệu thì lùi về mức hợp lệ gần nhất */
  useEffect(() => {
    const cur = GROUPS.find((g) => g.key === group);
    if (cur && rangeDays < cur.minDays) {
      setGroup([...GROUPS].reverse().find((g) => rangeDays >= g.minDays)?.key || "day");
    }
  }, [rangeDays, group]);

  const totals = useMemo(() => sumRange(range, scopedIds), [range, scopedIds]);
  const prevTotals = useMemo(
    () => sumRange(previousRange(range), scopedIds),
    [range, scopedIds]
  );

  const onlineNow = useMemo(
    () => scopedIds.reduce((n, id) => n + (websiteOnline[id] || 0), 0),
    [scopedIds]
  );

  /* Chuỗi theo ngày cho biểu đồ traffic */
  const daily = useMemo(() => {
    const out = [];
    for (const row of websiteDaily) {
      if (row.date < range.from || row.date > range.to) continue;
      let visits = 0, users = 0;
      for (const id of scopedIds) {
        const m = row.byBranch[id];
        if (!m) continue;
        visits += m.visits;
        users += m.users;
      }
      out.push({ date: row.date, visits, users });
    }
    return out;
  }, [range, scopedIds]);

  const chartData = useMemo(() => {
    if (group === "day") return daily.map((d) => ({ label: ddmm(d.date), visits: d.visits, users: d.users }));

    const buckets = new Map();
    for (const d of daily) {
      const dt = parseISO(d.date);
      let key, label;
      if (group === "week") {
        const monday = new Date(dt);
        monday.setDate(monday.getDate() - ((dt.getDay() + 6) % 7)); // tuần bắt đầu thứ Hai
        key = isoDate(monday);
        label = ddmm(key);
      } else {
        key = `${dt.getFullYear()}-${dt.getMonth()}`;
        label = `T${dt.getMonth() + 1}`;
      }
      const cur = buckets.get(key) || { label, visits: 0, users: 0 };
      cur.visits += d.visits;
      cur.users += d.users;
      buckets.set(key, cur);
    }
    return [...buckets.values()];
  }, [daily, group]);

  /* Lượt xem / lượt quan tâm của TỪNG chi nhánh — bảng xếp hạng luôn so
     toàn hệ thống, nên không thu hẹp theo chi nhánh đang chọn (đã ghi rõ ở
     phụ đề panel), chỉ đánh dấu chi nhánh đang xem. */
  const branchRows = useMemo(() => {
    return branches
      .map((b) => {
        const t = sumRange(range, [b.id]);
        return { id: b.id, name: b.name, city: b.city, views: t.visits, leads: t.leads };
      })
      .sort((a, b) => b.views - a.views);
  }, [range]);

  const branchLeadRows = useMemo(
    () => [...branchRows].sort((a, b) => b.leads - a.leads),
    [branchRows]
  );

  /* TOP loại phòng — lượt xem trang chi tiết phòng, cộng theo chi nhánh trong phạm vi */
  const roomRows = useMemo(() => {
    const perBranch = Object.fromEntries(scopedIds.map((id) => [id, sumRange(range, [id]).visits]));
    return roomTypeList
      .map((t) => ({
        id: t.key,
        name: t.name,
        views: scopedIds.reduce(
          (n, id) => n + perBranch[id] * (websiteRoomTypeShare[id]?.[t.key] || 0),
          0
        ),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [range, scopedIds]);

  /* TOP dịch vụ — lượt xem trang dịch vụ */
  const serviceRows = useMemo(() => {
    const perBranch = Object.fromEntries(scopedIds.map((id) => [id, sumRange(range, [id]).visits]));
    return serviceList
      .map((s) => ({
        id: s.id,
        name: s.name,
        sub: s.category,
        views: scopedIds.reduce(
          (n, id) => n + perBranch[id] * (websiteServiceShare[id]?.[s.id] || 0),
          0
        ),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [range, scopedIds]);

  const deviceTotal = totals.mobile + totals.desktop + totals.tablet;
  const deviceRows = useMemo(
    () =>
      DEVICE_KEYS.map((k) => ({
        key: k,
        label: DEVICE_LABEL[k],
        value: totals[k],
        share: deviceTotal ? (totals[k] / deviceTotal) * 100 : 0,
      })),
    [totals, deviceTotal]
  );

  const compareLabel = "so với kỳ trước";

  /* Trường định danh đặt tên `metric` chứ không phải `key`: object này được
     spread vào <KpiCard>, mà React 19 cảnh báo khi `key` đi qua spread. */
  const kpis = [
    { metric: "online",    icon: Users,          label: "Người đang online",   value: onlineNow,
      foot: "Đang xem website", live: true },
    { metric: "visits",    icon: Eye,            label: "Tổng lượt truy cập",  value: totals.visits },
    { metric: "downloads", icon: Download,       label: "Lượt tải bảng giá",   value: totals.downloads },
    { metric: "shares",    icon: Share2,         label: "Lượt chia sẻ",        value: totals.shares },
    { metric: "bookings",  icon: CalendarCheck,  label: "Lượt đặt phòng",      value: totals.bookings },
    { metric: "chats",     icon: MessageSquare,  label: "Lượt chat với admin", value: totals.chats },
    { metric: "calls",     icon: Phone,          label: "Lượt gọi",            value: totals.calls },
  ].map((k, i) => ({
    ...k,
    ...KPI[i],
    trend: k.live ? null : growth(totals[k.metric], prevTotals[k.metric]),
  }));

  /* Tỉ lệ đặt phòng thành công trên tổng lượt truy cập */
  const convRate = totals.visits ? (totals.bookings / totals.visits) * 100 : 0;

  /* Xuất báo cáo — CSV dựng ngay trên trình duyệt, không cần backend */
  const exportCsv = () => {
    const head = ["Ngày", "Lượt truy cập", "Lượt người dùng"];
    const lines = [
      `# Tổng quan website — ${ddmmyyyy(range.from)} đến ${ddmmyyyy(range.to)}`,
      `# Phạm vi: ${isAll ? "Toàn hệ thống" : activeBranch?.name}`,
      head.join(","),
      ...daily.map((d) => [ddmmyyyy(d.date), d.visits, d.users].join(",")),
    ];
    const url = URL.createObjectURL(
      new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `tong-quan-website-${range.from}-${range.to}.csv`;
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
            <Globe className="w-3 h-3" /> Marketing
          </div>
          <h1
            className="font-display font-extrabold tracking-[-0.03em] text-[32px] sm:text-[38px] leading-none"
            style={{ color: "var(--fg)" }}
          >
            Tổng quan Website
          </h1>
          <div className="flex items-center gap-2.5 mt-2.5 text-[13px] flex-wrap" style={{ color: "var(--fg-muted)" }}>
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-semibold tabular-nums" style={{ color: "var(--fg)" }}>{num(onlineNow)}</span> người đang online
            </span>
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
          title="Chưa có dữ liệu truy cập"
          desc="Khoảng thời gian đang chọn nằm ngoài phạm vi dữ liệu website."
          actionLabel="Về 30 ngày qua"
          onReset={() => setRangeKey("30d")}
        />
      ) : (
        <>
          {/* ═══ KPI BENTO — hàng 1: 4 ô ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {kpis.slice(0, 4).map((k) => <KpiCard key={k.metric} {...k} compareLabel={compareLabel} />)}
          </div>

          {/* ═══ KPI BENTO — hàng 2: 3 ô rộng ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {kpis.slice(4).map((k) => <KpiCard key={k.metric} {...k} compareLabel={compareLabel} />)}
          </div>

          {/* ═══ BIỂU ĐỒ TRAFFIC + 3 BẢNG TOP ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Panel
                title="Biểu đồ traffic"
                sub={`${num(totals.visits)} lượt truy cập · ${num(totals.users)} người dùng · chuyển đổi ${pct1(convRate)}%`}
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
                        <linearGradient id="gWebVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={brand.from} stopOpacity={0.5} />
                          <stop offset="100%" stopColor={brand.from} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gWebUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={KPI[1].from} stopOpacity={0.45} />
                          <stop offset="100%" stopColor={KPI[1].from} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--border-soft)" strokeDasharray="3 6" vertical={false} />
                      <XAxis dataKey="label" stroke="var(--fg-subtle)" fontSize={10}
                             tickLine={false} axisLine={false} minTickGap={22} />
                      <YAxis stroke="var(--fg-subtle)" fontSize={10} tickLine={false} axisLine={false}
                             width={54} tickFormatter={(v) => num(v)} />
                      <Tooltip contentStyle={chartTip} formatter={(v) => num(v)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                      <Area type="monotone" dataKey="visits" name="Lượt truy cập"
                            stroke={brand.from} strokeWidth={2.5} fill="url(#gWebVisits)" />
                      <Area type="monotone" dataKey="users" name="Lượt người dùng"
                            stroke={KPI[1].from} strokeWidth={2.5} fill="url(#gWebUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            <TopTable
              icon={Building2}
              c={KPI[0]}
              rank={RANK}
              title="TOP chi nhánh được xem nhiều nhất"
              sub="Toàn hệ thống"
              nameHead="Chi nhánh"
              valueHead="Lượt xem"
              rows={branchRows.map((b) => ({
                id: b.id, name: b.name, sub: b.city, value: b.views,
                marked: !isAll && b.id === activeBranchId,
              }))}
              to="/branches"
            />

            <TopTable
              icon={BedDouble}
              c={KPI[3]}
              rank={RANK}
              title="TOP loại phòng được xem nhiều nhất"
              sub={isAll ? "Toàn hệ thống" : activeBranch?.city}
              nameHead="Loại phòng"
              valueHead="Lượt xem"
              rows={roomRows.map((r) => ({ id: r.id, name: r.name, value: r.views }))}
              to="/rooms"
            />

            <TopTable
              icon={ConciergeBell}
              c={KPI[5]}
              rank={RANK}
              title="TOP dịch vụ được xem nhiều nhất"
              sub={isAll ? "Toàn hệ thống" : activeBranch?.city}
              nameHead="Dịch vụ"
              valueHead="Lượt xem"
              rows={serviceRows.map((s) => ({ id: s.id, name: s.name, sub: s.sub, value: s.views }))}
              to="/services"
            />
          </div>

          {/* ═══ THIẾT BỊ + BẢNG QUAN TÂM ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <Panel title="Tỉ lệ truy cập theo thiết bị" sub={`${num(deviceTotal)} lượt truy cập`} pad>
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
                <div className="w-[190px] h-[190px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={deviceRows}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={52}
                        outerRadius={86}
                        paddingAngle={3}
                        cornerRadius={6}
                        stroke="var(--surface)"
                        strokeWidth={3}
                      >
                        {deviceRows.map((d) => (
                          <Cell key={d.key} fill={DEVICE[d.key].from} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTip} formatter={(v) => num(v)} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                <ul className="flex-1 min-w-0 w-full space-y-2.5">
                  {deviceRows.map((d) => {
                    const Ico = DEVICE_ICON[d.key];
                    return (
                      <li key={d.key} className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                              style={{ background: `linear-gradient(135deg,${DEVICE[d.key].from},${DEVICE[d.key].to})` }}>
                          <Ico className="w-3.5 h-3.5" />
                        </span>
                        <span className="flex-1 min-w-0 truncate text-[13px] font-bold" style={{ color: "var(--fg)" }}>
                          {d.label}
                        </span>
                        <span className="text-[13px] font-extrabold tabular-nums" style={{ color: "var(--fg)" }}>
                          {pct1(d.share)}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Panel>

            <div className="lg:col-span-2">
              <TopTable
                icon={Heart}
                c={KPI[4]}
                rank={RANK}
                title="TOP chi nhánh được quan tâm nhiều nhất"
                sub="Lưu tin, đăng ký nhận bảng giá và ưu đãi · toàn hệ thống"
                nameHead="Chi nhánh"
                valueHead="Số lượt quan tâm"
                rows={branchLeadRows.map((b) => ({
                  id: b.id, name: b.name, sub: b.city, value: b.leads,
                  marked: !isAll && b.id === activeBranchId,
                }))}
                to="/branches"
                wide
              />
            </div>
          </div>
        </>
      )}

      {toast && <Toast>{toast}</Toast>}
    </div>
  );
}
