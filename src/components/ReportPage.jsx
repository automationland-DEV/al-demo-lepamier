import { useNavigate } from "react-router-dom";
import { Icons } from "../components/Icons";

const { ChevronLeft } = Icons;

export default function ReportPage({ title, subtitle, children }) {
  const navigate = useNavigate();
  return (
    <div className="max-w-[1100px] mx-auto pb-16 px-3 sm:px-0">
      <div className="bg-blue-800 text-white rounded-md px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => navigate("/reports/detail")}
          className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition shrink-0"
          aria-label="Quay lại"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center font-display font-bold text-[14px] sm:text-[16px] tracking-wide sm:text-left sm:pl-2 truncate">
          {title}
        </div>
        <div className="w-9 h-9 shrink-0 hidden sm:block" />
      </div>

      {subtitle && (
        <div className="mt-3 sm:mt-4 text-[12px] text-ink-600 px-1 truncate">{subtitle}</div>
      )}

      <div className="mt-3 sm:mt-4 min-w-0">{children}</div>
    </div>
  );
}
