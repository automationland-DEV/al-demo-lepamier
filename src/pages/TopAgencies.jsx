import ReportPage from "../components/ReportPage";
import { formatVND } from "../utils/format";

const AGENCIES = [
  { rank: 1, name: "ABC Travel",         booking: 124, room: 312, rev: 1_240_000_000 },
  { rank: 2, name: "Saigontourist",      booking: 98,  room: 256, rev: 980_000_000 },
  { rank: 3, name: "Vietravel",          booking: 86,  room: 218, rev: 870_000_000 },
  { rank: 4, name: "Bamboo Travel",      booking: 72,  room: 184, rev: 720_000_000 },
  { rank: 5, name: "Cty Đoàn Hàn Quốc",  booking: 12,  room: 168, rev: 690_000_000 },
  { rank: 6, name: "Đại lý Tây Ninh",    booking: 64,  room: 152, rev: 580_000_000 },
  { rank: 7, name: "Fiditour",           booking: 58,  room: 138, rev: 520_000_000 },
  { rank: 8, name: "Hanoitourist",       booking: 42,  room: 102, rev: 410_000_000 },
];

export default function TopAgencies() {
  const agencies = Array.isArray(AGENCIES) ? AGENCIES : [];
  const total = agencies.reduce((s, a) => s + (a?.rev || 0), 0) || 1;
  return (
    <ReportPage title="Top công ty / đại lý" subtitle="Doanh thu theo đại lý 30 ngày qua">
      <div className="bg-white border border-ink-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-ink-50 text-left text-ink-500 uppercase tracking-wider text-[10px]">
                <th className="px-3 sm:px-4 py-3 font-semibold w-12">#</th>
                <th className="px-3 sm:px-4 py-3 font-semibold">Đại lý / Công ty</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-right hidden sm:table-cell">Booking</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-right hidden md:table-cell">Phòng đêm</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-right">Doanh thu</th>
                <th className="px-3 sm:px-4 py-3 font-semibold hidden sm:table-cell">Tỷ trọng</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((a) => {
                const pct = ((a.rev / total) * 100).toFixed(1);
                const medal = a.rank === 1 ? "bg-amber-100 text-amber-700" : a.rank === 2 ? "bg-slate-200 text-slate-700" : a.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-ink-100 text-ink-600";
                return (
                  <tr key={a.name} className="border-t border-ink-100 hover:bg-blue-50/40">
                    <td className="px-3 sm:px-4 py-3">
                      <span className={`w-7 h-7 rounded inline-flex items-center justify-center font-bold text-[11px] ${medal}`}>
                        #{a.rank}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-semibold text-ink-900 whitespace-nowrap">{a.name}</td>
                    <td className="px-3 sm:px-4 py-3 text-right tabular-nums hidden sm:table-cell">{a.booking}</td>
                    <td className="px-3 sm:px-4 py-3 text-right tabular-nums hidden md:table-cell">{a.room}</td>
                    <td className="px-3 sm:px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap">{formatVND(a.rev)}</td>
                    <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-ink-500 tabular-nums w-10 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ReportPage>
  );
}
