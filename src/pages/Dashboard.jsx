import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../components/Icons";
import { formatVND, formatVNDFull } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import { usePalette } from "../theme/palette";
import {
  branches, rooms, bookings, guests, revenueChart,
  roomStatusDistribution, bookingsBySource, recentActivity, taskList,
} from "../data/mockData";
import {
  Page, PageHeader, SectionHead, Panel, StatStrip, Stat, Button,
  Segmented, StatusTag, Table, Th, Td, Tr, Eyebrow, Hairline,
  ChartLegend, axisProps, gridProps, chartTip, Delta,
} from "../components/ui";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/**
 * TRANG THAM CHIẾU MẪU C — Dashboard (Design.md §8).
 *
 * v3 nhồi 17 khối vào một trang, phải thêm mục lục nhảy nhanh mới định vị
 * được. v4 cắt xuống ĐÚNG BỐN khối:
 *   ① Dải KPI          — sáu con số điều hành quan tâm mỗi sáng
 *   ② Doanh thu        — một biểu đồ chính + cơ cấu nguồn thu
 *   ③ Vận hành hôm nay — trạng thái phòng + việc cần làm
 *   ④ Chi nhánh        — bảng so sánh + dòng hoạt động
 *
 * Muốn thêm khối thứ năm? Trước hết hãy hỏi khối nào bỏ được.
 */

const {
  Wallet, Percent, CalendarCheck, Users, Star, BedDouble, ArrowRight,
  LogIn, LogOut, Wrench, Sparkles,
} = Icons;

const TODAY = "02/08/2026";

/* Ánh xạ trạng thái phòng → tone ngữ nghĩa. Trước đây màu lấy từ chuỗi
 * "bg-amber-500" trong mockData nên không đổi theo chế độ tối.
 * Khóa phải khớp ĐÚNG `label` của roomStatuses trong mockData.js. */
const ROOM_STATUS_TONE = {
  "Đang ở": "success",
  "Trống": "neutral",
  "Đã đặt": "info",
  "Đang dọn": "warning",
  "Bảo trì": "danger",
};

const ACTIVITY_ICON = {
  checkin: { icon: LogIn, tone: "success" },
  checkout: { icon: LogOut, tone: "info" },
  booking: { icon: CalendarCheck, tone: "info" },
  review: { icon: Star, tone: "warning" },
  service: { icon: Sparkles, tone: "neutral" },
  issue: { icon: Wrench, tone: "danger" },
};

const PRIORITY_TONE = { high: "danger", medium: "warning", low: "neutral" };
const PRIORITY_LABEL = { high: "Gấp", medium: "Vừa", low: "Thấp" };

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeBranchId, activeBranch, isAll } = useActiveBranch();
  const { house, metal, series } = usePalette();
  const [range, setRange] = useState(12);
  const [tasks, setTasks] = useState(taskList);

  const earth = useMemo(() => series(6), [series]);

  /* Phạm vi dữ liệu bám theo chi nhánh đang chọn trên sidebar (BranchContext) */
  const scope = useMemo(() => {
    const scopedRooms = isAll ? rooms : rooms.filter((r) => r.branchId === activeBranchId);
    const scopedBookings = isAll ? bookings : bookings.filter((b) => b.branchId === activeBranchId);
    const scopedBranches = isAll ? branches : branches.filter((b) => b.id === activeBranchId);

    const occupied = scopedRooms.filter((r) => r.status === "occupied").length;
    const revenue = scopedBranches.reduce((n, b) => n + b.revenue, 0);
    const ratingSum = scopedBranches.reduce((n, b) => n + b.rating, 0);

    return {
      rooms: scopedRooms,
      bookings: scopedBookings,
      branches: scopedBranches,
      totalRooms: scopedRooms.length,
      occupied,
      occupancy: scopedRooms.length ? Math.round((occupied / scopedRooms.length) * 100) : 0,
      revenue,
      revpar: scopedRooms.length ? revenue / scopedRooms.length : 0,
      pending: scopedBookings.filter((b) => b.status === "pending").length,
      guests: isAll ? guests.length : Math.round(guests.length / branches.length),
      rating: scopedBranches.length ? ratingSum / scopedBranches.length : 0,
    };
  }, [activeBranchId, isAll]);

  const chartData = useMemo(() => revenueChart.slice(-range), [range]);

  const sourceData = useMemo(() => {
    const total = bookingsBySource.reduce((n, s) => n + s.value, 0) || 1;
    return bookingsBySource.map((s, i) => ({
      ...s,
      pct: Math.round((s.value / total) * 100),
      color: earth[i % earth.length].base,
    }));
  }, [earth]);

  const roomStatus = useMemo(() => {
    const total = roomStatusDistribution.reduce((n, s) => n + s.value, 0) || 1;
    return roomStatusDistribution.map((s) => ({
      ...s,
      pct: Math.round((s.value / total) * 100),
      tone: ROOM_STATUS_TONE[s.name] || "neutral",
    }));
  }, []);

  const openTasks = tasks.filter((t) => !t.done).length;
  const toggleTask = (id) =>
    setTasks((l) => l.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <Page>
      <PageHeader
        eyebrow="Tổng quan"
        title={isAll ? "Toàn hệ thống hôm nay" : activeBranch?.name}
        live
        meta={[
          TODAY,
          `${scope.branches.length} chi nhánh`,
          `${scope.totalRooms.toLocaleString("vi-VN")} phòng`,
          `${scope.pending} đặt phòng chờ duyệt`,
        ]}
        actions={
          <Button variant="outline" iconRight={ArrowRight} onClick={() => navigate("/reports")}>
            Xem báo cáo đầy đủ
          </Button>
        }
      />

      {/* ═══ ① DẢI KPI ═══ */}
      <StatStrip cols={6}>
        <Stat
          label="Doanh thu tháng"
          value={formatVND(scope.revenue)}
          delta={12.4}
          icon={Wallet}
          size="sm"
        />
        <Stat
          label="Tỉ lệ lấp đầy"
          value={`${scope.occupancy}%`}
          progress={scope.occupancy}
          icon={Percent}
          size="sm"
        />
        <Stat
          label="Đặt phòng"
          value={scope.bookings.length.toLocaleString("vi-VN")}
          delta={5.1}
          icon={CalendarCheck}
          size="sm"
        />
        <Stat
          label="Khách lưu trú"
          value={scope.occupied.toLocaleString("vi-VN")}
          icon={Users}
          size="sm"
          hint="Đang ở"
        />
        <Stat
          label="Đánh giá TB"
          value={scope.rating.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          icon={Star}
          size="sm"
          hint="trên 5"
        />
        <Stat
          label="RevPAR"
          value={formatVND(scope.revpar)}
          delta={-1.8}
          icon={BedDouble}
          size="sm"
        />
      </StatStrip>

      {/* ═══ ② DOANH THU ═══ */}
      <SectionHead
        eyebrow="Tài chính"
        title="Doanh thu và tỉ lệ lấp đầy"
        sub="Diễn biến theo tháng, đối chiếu với cơ cấu nguồn đặt phòng"
        right={
          <Segmented
            size="sm"
            value={range}
            onChange={setRange}
            options={[
              { value: 6, label: "6 tháng" },
              { value: 12, label: "12 tháng" },
            ]}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2 flex flex-col" bodyClassName="flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div>
              <Eyebrow>Tổng kỳ</Eyebrow>
              <div className="flex items-baseline gap-2.5 mt-2">
                <span
                  className="text-[28px] font-medium tnum"
                  style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}
                >
                  {formatVND(chartData.reduce((n, d) => n + d.revenue, 0))}
                </span>
                <Delta value={12.4} />
              </div>
            </div>
            <ChartLegend
              className="pt-1"
              items={[
                { label: "Doanh thu", color: house.base, area: true },
                { label: "Tỉ lệ lấp đầy", color: metal.base },
              ]}
            />
          </div>

          <div className="flex-1 min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  {/* Ngoại lệ gradient duy nhất được phép — Design.md §2.5 */}
                  <linearGradient id="dashRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={house.base} stopOpacity={0.14} />
                    <stop offset="100%" stopColor={house.base} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis
                  yAxisId="left"
                  {...axisProps}
                  tickFormatter={(v) => `${Math.round(v / 1_000_000_000)}t`}
                />
                <YAxis yAxisId="right" orientation="right" {...axisProps} unit="%" domain={[0, 100]} />
                <Tooltip
                  {...chartTip}
                  formatter={(v, n) =>
                    n === "revenue" ? [formatVNDFull(v), "Doanh thu"] : [`${v}%`, "Tỉ lệ lấp đầy"]
                  }
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke={house.base}
                  strokeWidth={1.5}
                  fill="url(#dashRevenue)"
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="occupancy"
                  stroke={metal.base}
                  strokeWidth={1.5}
                  fill="none"
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Nguồn đặt phòng" sub={`${scope.bookings.length} đơn trong kỳ`}>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={1}
                  stroke="var(--surface)"
                  strokeWidth={2}
                >
                  {sourceData.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip {...chartTip} formatter={(v, n) => [`${v} đơn`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <Hairline soft className="my-4" />

          <ul className="space-y-2.5">
            {sourceData.map((s) => (
              <li key={s.name} className="flex items-center gap-2.5 text-[12px]">
                <span
                  aria-hidden
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="flex-1 truncate" style={{ color: "var(--fg-muted)" }}>{s.name}</span>
                <span className="tnum" style={{ color: "var(--fg)" }}>{s.pct}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* ═══ ③ VẬN HÀNH HÔM NAY ═══ */}
      <SectionHead
        eyebrow="Vận hành"
        title="Hôm nay tại quầy"
        sub="Trạng thái phòng theo thời gian thực và việc cần xử lý trong ngày"
        right={
          <Button variant="outline" size="sm" iconRight={ArrowRight} onClick={() => navigate("/rooms")}>
            Sơ đồ phòng
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Trạng thái phòng" sub={`${scope.totalRooms.toLocaleString("vi-VN")} phòng`}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomStatus} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid {...gridProps} horizontal={false} vertical />
                <XAxis type="number" {...axisProps} />
                <YAxis type="category" dataKey="name" width={82} {...axisProps} />
                <Tooltip {...chartTip} formatter={(v) => [`${v} phòng`, "Số lượng"]} />
                <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={14}>
                  {roomStatus.map((s) => (
                    <Cell key={s.name} fill={`var(--${s.tone})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Hairline soft className="my-4" />

          <div className="grid grid-cols-3 gap-4">
            {roomStatus.slice(0, 3).map((s) => (
              <div key={s.name}>
                <Eyebrow>{s.name}</Eyebrow>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-[20px] font-medium tnum" style={{ color: "var(--fg)" }}>
                    {s.value}
                  </span>
                  <span className="text-[11px] tnum" style={{ color: "var(--fg-subtle)" }}>{s.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Việc cần làm"
          sub={`${openTasks} việc chưa xong`}
          flush
        >
          <ul>
            {tasks.map((t, i) => (
              <li
                key={t.id}
                className="flex items-start gap-3 px-6 py-3.5"
                style={{ borderTop: i ? "1px solid var(--border-soft)" : "none" }}
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  aria-pressed={t.done}
                  aria-label={t.done ? `Bỏ đánh dấu: ${t.title}` : `Đánh dấu xong: ${t.title}`}
                  className="mt-0.5 w-4 h-4 shrink-0 border grid place-items-center transition-colors"
                  style={{
                    borderRadius: "2px",
                    backgroundColor: t.done ? "var(--accent)" : "var(--surface)",
                    borderColor: t.done ? "var(--accent)" : "var(--border)",
                  }}
                >
                  {t.done && (
                    <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none"
                         stroke="var(--on-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 6.2 4.8 8.5 9.5 3.8" />
                    </svg>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div
                    className="text-[13px] leading-snug"
                    style={{
                      color: t.done ? "var(--fg-subtle)" : "var(--fg)",
                      textDecoration: t.done ? "line-through" : "none",
                    }}
                  >
                    {t.title}
                  </div>
                  <div className="mt-1 text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                    {t.branch} · {t.due}
                  </div>
                </div>

                <StatusTag tone={PRIORITY_TONE[t.priority]}>{PRIORITY_LABEL[t.priority]}</StatusTag>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* ═══ ④ CHI NHÁNH ═══ */}
      <SectionHead
        eyebrow="Mạng lưới"
        title="So sánh chi nhánh"
        sub="Lấp đầy, doanh thu và đánh giá của từng cơ sở trong tháng"
        right={
          <Button variant="outline" size="sm" iconRight={ArrowRight} onClick={() => navigate("/branches")}>
            Quản lý chi nhánh
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel flush className="lg:col-span-2">
          <Table minWidth={620}>
            <thead>
              <tr>
                <Th>Chi nhánh</Th>
                <Th>Khu vực</Th>
                <Th align="right">Phòng</Th>
                <Th align="right">Lấp đầy</Th>
                <Th align="right">Doanh thu</Th>
                <Th align="right">Đánh giá</Th>
                <Th align="right">Trạng thái</Th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <Tr key={b.id} selected={!isAll && b.id === activeBranchId}>
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 flex items-center justify-center text-[9px] font-semibold shrink-0 border"
                        style={{
                          borderRadius: "3px",
                          backgroundColor: "var(--surface-3)",
                          borderColor: "var(--border)",
                          color: "var(--fg-muted)",
                        }}
                      >
                        {b.code}
                      </span>
                      <span className="font-medium truncate">{b.name}</span>
                    </span>
                  </Td>
                  <Td style={{ color: "var(--fg-muted)" }}>{b.region}</Td>
                  <Td align="right" num style={{ color: "var(--fg-muted)" }}>{b.totalRooms}</Td>
                  <Td align="right">
                    <span className="inline-flex items-center gap-2 justify-end">
                      <span
                        className="hidden sm:block w-14 h-0.5 overflow-hidden"
                        style={{ backgroundColor: "var(--surface-3)" }}
                      >
                        <span
                          className="block h-full"
                          style={{ width: `${b.occupancy}%`, backgroundColor: "var(--accent)" }}
                        />
                      </span>
                      <span className="tnum">{b.occupancy}%</span>
                    </span>
                  </Td>
                  <Td align="right" num>{formatVND(b.revenue)}</Td>
                  <Td align="right">
                    <span className="inline-flex items-center gap-1 tnum" style={{ color: "var(--metal)" }}>
                      <Star className="w-3.5 h-3.5" fill="currentColor" />
                      {b.rating.toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
                    </span>
                  </Td>
                  <Td align="right">
                    <StatusTag tone={b.status === "active" ? "success" : "warning"}>
                      {b.status === "active" ? "Hoạt động" : "Đang sửa"}
                    </StatusTag>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Hoạt động gần đây" sub="Cập nhật liên tục" flush>
          <ul className="max-h-[460px] overflow-y-auto">
            {recentActivity.map((a, i) => {
              const cfg = ACTIVITY_ICON[a.type] || ACTIVITY_ICON.service;
              const ActIcon = cfg.icon;
              return (
                <li
                  key={a.id}
                  className="flex items-start gap-3 px-6 py-3.5"
                  style={{ borderTop: i ? "1px solid var(--border-soft)" : "none" }}
                >
                  <span
                    className="w-7 h-7 shrink-0 grid place-items-center border"
                    style={{
                      borderRadius: "var(--r-sm)",
                      backgroundColor: `var(--${cfg.tone}-soft)`,
                      borderColor: `var(--${cfg.tone}-border)`,
                      color: `var(--${cfg.tone}-fg)`,
                    }}
                  >
                    <ActIcon className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] leading-snug" style={{ color: "var(--fg-muted)" }}>
                      <span className="font-medium" style={{ color: "var(--fg)" }}>{a.user}</span>{" "}
                      {a.text}
                    </div>
                    <div className="mt-1 text-[11px]" style={{ color: "var(--fg-subtle)" }}>{a.time}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </Page>
  );
}
