import { Icons } from "./Icons";

const { ChevronLeft, ChevronRight } = Icons;

/* Design System v4 — nút vuông bo 4px, viền tóc, trang đang xem đánh dấu
 * bằng nền accent-soft + vạch đồng thau dưới chân thay vì nền đầy màu. */
function PageBtn({ active, disabled, title, onClick, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-current={active ? "page" : undefined}
      className="relative w-8 h-8 text-[12px] flex items-center justify-center border transition-colors disabled:cursor-not-allowed"
      style={{
        borderRadius: "var(--r-sm)",
        backgroundColor: active ? "var(--accent-soft)" : "var(--surface)",
        borderColor: active ? "var(--accent)" : "var(--border)",
        color: active ? "var(--accent-fg)" : "var(--fg-muted)",
        fontWeight: active ? 500 : 400,
        opacity: disabled ? 0.4 : 1,
        transitionDuration: ".16s",
      }}
    >
      {children}
    </button>
  );
}

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
    const windowSize = 2; // số trang hiện quanh trang đang xem
    const start = Math.max(1, currentPage - windowSize);
    const end = Math.min(totalPages, currentPage + windowSize);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className="mt-6 pt-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 w-full"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="text-[12px] order-2 sm:order-1" style={{ color: "var(--fg-muted)" }}>
        Hiển thị{" "}
        <span className="tnum" style={{ color: "var(--fg)" }}>{startItem}–{endItem}</span>{" "}
        trong tổng số{" "}
        <span className="tnum" style={{ color: "var(--fg)" }}>{totalItems.toLocaleString("vi-VN")}</span>{" "}
        bản ghi
      </div>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <PageBtn
          title="Trang trước"
          disabled={currentPage === 1}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </PageBtn>

        {getPages().map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="w-6 h-8 flex items-center justify-center text-[12px]"
              style={{ color: "var(--fg-subtle)" }}
            >
              …
            </span>
          ) : (
            <PageBtn
              key={`page-${page}`}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              <span className="tnum">{page}</span>
            </PageBtn>
          )
        )}

        <PageBtn
          title="Trang sau"
          disabled={currentPage === totalPages}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </PageBtn>
      </div>
    </div>
  );
}
