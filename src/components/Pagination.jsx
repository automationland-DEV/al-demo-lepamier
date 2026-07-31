import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPages = () => {
    const pages = [];
    const windowSize = 2; // Number of pages to show around current page
    const start = Math.max(1, currentPage - windowSize);
    const end = Math.min(totalPages, currentPage + windowSize);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="mt-6 pt-5 border-t border-ink-200 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      {/* Information text */}
      <div className="text-xs text-ink-500 font-medium order-2 sm:order-1">
        Hiển thị <span className="font-semibold text-ink-900 tabular-nums">{startItem}-{endItem}</span> trong tổng số <span className="font-semibold text-ink-900 tabular-nums">{totalItems}</span> bản ghi
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-ink-200 bg-white text-ink-600 hover:border-brand-500 hover:text-brand-700 disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:text-ink-600 disabled:cursor-not-allowed transition duration-200 shadow-sm"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPages().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-xs text-ink-400 font-semibold"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 text-xs font-bold rounded-lg transition duration-200 ${
                isActive
                  ? "bg-brand-500 text-on-accent shadow-sm ring-2 ring-brand-200"
                  : "bg-white text-ink-700 border border-ink-200 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-ink-200 bg-white text-ink-600 hover:border-brand-500 hover:text-brand-700 disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:text-ink-600 disabled:cursor-not-allowed transition duration-200 shadow-sm"
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
