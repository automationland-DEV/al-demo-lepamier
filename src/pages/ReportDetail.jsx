import { useNavigate } from "react-router-dom";
import { Icons } from "../components/Icons";

const { ChevronLeft, ChevronRight, BarChart3, PieChart, BedDouble, Sparkles, Briefcase, Scale } = Icons;

const REPORTS = [
  {
    icon: BarChart3,
    title: "Doanh thu theo thời gian",
    desc: "Xu hướng & doanh thu theo ngày",
    chip: "blue",
    route: "/reports/revenue-timeline",
  },
  {
    icon: PieChart,
    title: "Cơ cấu doanh thu",
    desc: "Theo segment / kênh bán",
    chip: "violet",
    route: "/reports/revenue-structure",
  },
  {
    icon: BedDouble,
    title: "Công suất & loại phòng",
    desc: "Công suất theo loại phòng",
    chip: "emerald",
    route: "/reports/occupancy-by-room",
  },
  {
    icon: Sparkles,
    title: "Dự báo",
    desc: "Công suất & doanh thu tiềm năng",
    chip: "pink",
    route: "/reports/forecast",
  },
  {
    icon: Briefcase,
    title: "Top công ty / đại lý",
    desc: "Doanh thu theo đại lý",
    chip: "amber",
    route: "/reports/top-agencies",
  },
  {
    icon: Scale,
    title: "So sánh kỳ",
    desc: "Kỳ này so với cùng kỳ năm trước",
    chip: "ink",
    route: "/reports/period-comparison",
  },
];

const chipMap = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-700" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700" },
  pink:    { bg: "bg-pink-50",    text: "text-pink-700" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700" },
  ink:     { bg: "bg-ink-100",    text: "text-ink-700" },
};

function ReportListItem({ icon: Icon, title, desc, chip, onClick }) {
  const c = chipMap[chip] || chipMap.blue;
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-b border-ink-100 hover:bg-blue-50/40 active:bg-blue-50 transition group"
    >
      <div className={`w-11 h-11 rounded-md flex items-center justify-center ${c.bg} ${c.text} shrink-0`}>
        <Icon className="w-[22px] h-[22px]" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] text-ink-900 leading-snug">
          {title}
        </div>
        <div className="text-[12px] text-ink-500 mt-0.5">
          {desc}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-ink-300 group-hover:text-blue-700 group-hover:translate-x-0.5 transition shrink-0" strokeWidth={2} />
    </button>
  );
}

export default function ReportDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="bg-blue-800 text-white px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-2 sm:gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition shrink-0"
          aria-label="Quay lại"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center font-display font-bold text-[14px] sm:text-[16px] tracking-wide truncate">
          Báo cáo chi tiết
        </div>
        <div className="w-9 h-9 shrink-0 hidden sm:block" />
      </div>

      <div className="bg-[#F5F1E8] px-4 sm:px-5 py-2.5 sm:py-3 border-b border-ink-100">
        <div className="max-w-[720px] mx-auto text-[12px] text-ink-600">
          Chọn báo cáo để xem chi tiết hiệu suất kinh doanh
        </div>
      </div>

      <div className="max-w-[720px] w-full mx-auto bg-white border-x border-ink-100 flex-1">
        {REPORTS.map((r) => (
          <ReportListItem
            key={r.route}
            icon={r.icon}
            title={r.title}
            desc={r.desc}
            chip={r.chip}
            onClick={() => navigate(r.route)}
          />
        ))}
      </div>

      <div className="bg-[#F5F1E8] flex-1 min-h-[120px]" />
    </div>
  );
}
