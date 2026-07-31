import { useState, useMemo, useEffect } from "react";
import PageHero, { SectionHeader, Card, Badge } from "../components/DashboardPrimitives";
import { Icons } from "../components/Icons";
import { rooms, branches, roomStatusList, roomTypeList } from "../data/mockData";
import { formatVND } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";

const {
  BedDouble, Search, Filter, Plus, Users, MapPin,
  ChevronRight, Wrench, Sparkles, Wallet, Building2, ChevronDown,
} = Icons;

const STATUS_DETAILS = {
  available:    { label: "Trống",     dot: "bg-blue-500",   soft: "bg-blue-50",     border: "border-blue-200",   text: "text-blue-700"   },
  occupied:     { label: "Đang ở",    dot: "bg-brand-500",  soft: "bg-brand-50",    border: "border-brand-200",  text: "text-brand-700"  },
  reserved:     { label: "Đã đặt",    dot: "bg-violet-500", soft: "bg-violet-50",   border: "border-violet-200", text: "text-violet-700" },
  cleaning:     { label: "Đang dọn",  dot: "bg-amber-500",  soft: "bg-amber-50",    border: "border-amber-200",  text: "text-amber-700"  },
  maintenance:  { label: "Bảo trì",   dot: "bg-rose-500",   soft: "bg-rose-50",     border: "border-rose-200",   text: "text-rose-700"   },
};

const TYPE_OPTIONS = ["all", ...roomTypeList.map((t) => t.key)];

export default function Rooms() {
  const { activeBranchId } = useActiveBranch();
  const [branchId, setBranchId] = useState(
    activeBranchId === "ALL" ? (branches[0]?.id || "ALL") : activeBranchId
  );
  const [status, setStatus] = useState("all");
  const [roomType, setRoomType] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (activeBranchId !== "ALL") setBranchId(activeBranchId);
  }, [activeBranchId]);

  const branch = branches.find((b) => b.id === branchId);

  const branchRooms = useMemo(
    () => rooms.filter((r) => r.branchId === branchId),
    [branchId]
  );

  const filtered = useMemo(() => {
    return branchRooms.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (roomType !== "all" && r.type !== roomType) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.number.toLowerCase().includes(q) && !r.typeName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [branchRooms, status, roomType, search]);

  const filteredIds = useMemo(() => new Set(filtered.map((r) => r.id)), [filtered]);

  const byFloor = useMemo(() => {
    return branchRooms.reduce((acc, r) => {
      if (!acc[r.floor]) acc[r.floor] = [];
      acc[r.floor].push(r);
      return acc;
    }, {});
  }, [branchRooms]);

  const statusCounts = useMemo(() => {
    return branchRooms.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
  }, [branchRooms]);

  const totalBranches = rooms.length;
  const occupiedCount = statusCounts.occupied || 0;
  const occupancyPct = branch.totalRooms > 0 ? Math.round((occupiedCount / branch.totalRooms) * 100) : 0;

  return (
    <div className="max-w-[1240px] mx-auto pb-16 px-1">

      {/* ── 1. HERO ───────────────────────────────────────── */}
      <PageHero
        eyebrow="Vận hành · Quản lý phòng"
        title="Quản lý phòng"
        subtitle={`Theo dõi trạng thái ${totalBranches.toLocaleString("vi-VN")} phòng trên toàn hệ thống`}
        live
        meta={[
          { label: "Chi nhánh", value: branches.length },
          { label: "Phòng", value: branch.totalRooms },
          { label: "Đang ở", value: occupiedCount },
          { label: "Lấp đầy", value: `${occupancyPct}%` },
        ]}
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-[12px] font-semibold transition">
              <Filter className="w-4 h-4" /> Bộ lọc nâng cao
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white text-blue-800 hover:bg-white/95 text-[12px] font-bold transition shadow-sm">
              <Plus className="w-4 h-4" /> Thêm phòng
            </button>
          </>
        }
      />

      {/* ── 4. BRANCH INFO BAR ────────────────────────────── */}
      <SectionHeader icon={BedDouble} label="Thông tin chi nhánh" sub={`Hiện đang chọn: ${branch.name}`} />
      <Card>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-md bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-white font-display font-bold text-[16px] shadow-sm shrink-0">
            {branch.code}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-display font-bold text-ink-900 text-base truncate">{branch.name}</div>
              <Badge tone="emerald"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE</Badge>
            </div>
            <div className="text-[12px] text-ink-500 flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {branch.address}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> QL: {branch.manager}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center shrink-0 border-l border-ink-100 pl-3 sm:pl-6 w-full sm:w-auto">
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold">Tổng phòng</div>
              <div className="font-display font-bold text-[18px] sm:text-[22px] text-ink-900 tabular-nums leading-none mt-1">{branch.totalRooms}</div>
            </div>
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold">Đang ở</div>
              <div className="font-display font-bold text-[18px] sm:text-[22px] text-brand-600 tabular-nums leading-none mt-1">{occupiedCount}</div>
            </div>
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold">Lấp đầy</div>
              <div className="font-display font-bold text-[18px] sm:text-[22px] text-blue-600 tabular-nums leading-none mt-1">{branch.occupancy}%</div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 2. BRANCH + STATUS COUNTS ─────────────────────── */}
      <SectionHeader icon={Building2} label="Chi nhánh & Trạng thái" sub="Chọn chi nhánh và theo dõi nhanh" />
      <Card>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span className="text-[12.5px] font-semibold text-ink-900">Chi nhánh:</span>
          </div>

          <div className="relative flex-1 min-w-[260px]">
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full appearance-none bg-white border border-ink-200 rounded-md pl-3 pr-9 py-2 text-[12.5px] font-semibold text-ink-900 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} · {b.totalRooms} phòng
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {roomStatusList.map((s) => {
              const detail = STATUS_DETAILS[s.key];
              const count = statusCounts[s.key] || 0;
              return (
                <div
                  key={s.key}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${detail.soft} ${detail.border}`}
                >
                  <span className={`w-2 h-2 rounded-full ${detail.dot}`} />
                  <span className={`text-[11.5px] font-semibold ${detail.text}`}>{detail.label}</span>
                  <span className="text-[12px] font-display font-bold text-ink-900 tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── 3. FILTERS ROW ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Status legend */}
        <Card title="Lọc theo trạng thái" subtitle="1 chạm để lọc" icon={Filter} accent="blue" className="lg:col-span-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setStatus("all")}
              className={`px-3 py-1.5 rounded-md text-[12px] font-semibold border transition ${
                status === "all"
                  ? "bg-ink-900 text-white border-ink-900 shadow-sm"
                  : "bg-white text-ink-700 border-ink-200 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              Tất cả ({branchRooms.length})
            </button>
            {roomStatusList.map((s) => {
              const detail = STATUS_DETAILS[s.key];
              const active = status === s.key;
              const count = statusCounts[s.key] || 0;
              return (
                <button
                  key={s.key}
                  onClick={() => setStatus(s.key)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold border transition ${
                    active
                      ? "bg-ink-900 text-white border-ink-900 shadow-sm"
                      : `${detail.soft} ${detail.border} ${detail.text} hover:opacity-80`
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${active ? "bg-white" : detail.dot}`} />
                  {s.label} ({count})
                </button>
              );
            })}
          </div>
        </Card>

        {/* Search + type filter */}
        <Card title="Tìm kiếm" subtitle="Số phòng hoặc hạng phòng" icon={Search} accent="cyan">
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Số phòng hoặc loại…"
                className="w-full bg-white border border-ink-200 rounded-md pl-10 pr-3 py-2 text-[12.5px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <div className="relative">
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full appearance-none bg-white border border-ink-200 rounded-md px-3 pr-9 py-2 text-[12.5px] font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition cursor-pointer"
              >
                <option value="all">Tất cả hạng phòng</option>
                {roomTypeList.map((t) => (
                  <option key={t.key} value={t.key}>{t.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px] text-ink-500">
              <span>Đang hiển thị</span>
              <span className="font-bold text-ink-900 tabular-nums">{filtered.length}/{branchRooms.length} phòng</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 5. FLOORS GRID ────────────────────────────────── */}
      <SectionHeader
        icon={BedDouble}
        label="Sơ đồ phòng theo tầng"
        sub={`${filtered.length} phòng · ${Object.keys(byFloor).length} tầng`}
        right={<Badge tone="blue">Đồng bộ vừa xong</Badge>}
      />

      {filtered.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-ink-100 text-ink-400 flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <div className="text-[14px] font-semibold text-ink-900">Không có phòng nào khớp</div>
            <div className="text-[12px] text-ink-500 mt-1">Thử bỏ bộ lọc hoặc đổi chi nhánh khác.</div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(byFloor).sort().map(([floor, list]) => (
            <Card
              key={floor}
              title={`Tầng ${floor}`}
              subtitle={`${list.filter(r => filteredIds.has(r.id)).length} phòng khớp`}
              icon={BedDouble}
              accent="violet"
              right={<Badge tone="violet">{list.length} PN</Badge>}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {list.map((r) => {
                  const isMatch = filteredIds.has(r.id);
                  const detail = STATUS_DETAILS[r.status] || STATUS_DETAILS.available;
                  const Sicon =
                    r.status === "occupied" ? Users :
                    r.status === "cleaning" ? Sparkles :
                    r.status === "maintenance" ? Wrench :
                    r.status === "reserved" ? ChevronRight :
                    BedDouble;
                  return (
                    <button
                      key={r.id}
                      disabled={!isMatch}
                      className={`group relative border-2 ${detail.border} ${detail.soft} rounded-md p-2 sm:p-3 text-left transition-all duration-300 ${
                        isMatch
                          ? "hover:shadow-card hover:-translate-y-0.5 cursor-pointer"
                          : "opacity-25 grayscale pointer-events-none scale-95 border-dashed border-ink-200 bg-ink-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-display font-bold text-ink-900 text-[15px] leading-none tabular-nums">
                          {r.number}
                        </div>
                        <span className={`w-2 h-2 rounded-full ${detail.dot}`} />
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold mb-1 truncate">
                        {r.typeName}
                      </div>
                      <div className={`inline-flex items-center gap-1 text-[11px] font-bold ${detail.text}`}>
                        <Sicon className="w-3 h-3" strokeWidth={2.4} />
                        {detail.label}
                      </div>
                      {r.guest && (
                        <div className="text-[10.5px] text-ink-700 mt-1.5 truncate font-medium">
                          👤 {r.guest}
                        </div>
                      )}
                      <div className="text-[10.5px] text-ink-500 mt-1 flex items-center gap-1 tabular-nums">
                        <Wallet className="w-3 h-3" /> {formatVND(r.price)}
                      </div>
                      <ChevronRight className={`absolute top-2 right-2 w-3.5 h-3.5 ${detail.text} opacity-0 group-hover:opacity-100 transition`} />
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
        <BedDouble className="w-3 h-3" />
        Sơ đồ phòng minh họa · Đồng bộ PMS mỗi 30s
      </div>
    </div>
  );
}