import ReportPage from "../components/ReportPage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Standard",      occupied: 42, vacant: 12, ooo: 1 },
  { name: "Superior",      occupied: 28, vacant: 8,  ooo: 1 },
  { name: "Deluxe",        occupied: 22, vacant: 6,  ooo: 1 },
  { name: "Suite",         occupied: 9,  vacant: 3,  ooo: 0 },
  { name: "Executive",     occupied: 5,  vacant: 2,  ooo: 0 },
  { name: "Presidential",  occupied: 1,  vacant: 1,  ooo: 0 },
];

const tooltipStyle = { background: "#0f1218", border: "none", borderRadius: 6, fontSize: 12, color: "#fff", padding: "8px 12px" };

export default function OccupancyByRoom() {
  return (
    <ReportPage title="Công suất & loại phòng" subtitle="Phân bổ theo hạng phòng">
      <div className="bg-white border border-ink-200 rounded-md p-3 sm:p-5 overflow-hidden min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 mb-3">Trạng thái phòng theo loại</div>
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barCategoryGap={8} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#eceef2" horizontal={false} />
              <XAxis type="number" stroke="#8792a8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#67738b" fontSize={11} tickLine={false} axisLine={false} width={88} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="occupied" stackId="a" fill="#8b5cf6" name="Có khách" />
              <Bar dataKey="vacant" stackId="a" fill="#10b981" name="Trống" />
              <Bar dataKey="ooo" stackId="a" fill="#f43f5e" name="OOO" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ReportPage>
  );
}
