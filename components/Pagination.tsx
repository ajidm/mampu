"use client";

interface Props {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];
  const addPage = (n: number) => pages.push(n);
  const addDots = () => {
    if (pages[pages.length - 1] !== "...") pages.push("...");
  };

  addPage(1);
  if (current > 4) addDots();

  const start = Math.max(2, current - 2);
  const end   = Math.min(total - 1, current + 2);
  for (let i = start; i <= end; i++) addPage(i);

  if (current < total - 3) addDots();
  addPage(total);

  return pages;
}

const btnBase =
  "min-w-[2rem] rounded-md border px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors";
const btnActive  = "border-blue-500 bg-blue-600 text-white";
const btnDefault = "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40";

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalItems);
  const pages = buildPages(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-between"
    >
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium">{from}–{to}</span> of{" "}
        <span className="font-medium">{totalItems}</span> users
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`${btnBase} ${btnDefault}`}
        >
          ‹
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-1 text-gray-400" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={`${btnBase} ${p === page ? btnActive : btnDefault}`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={`${btnBase} ${btnDefault}`}
        >
          ›
        </button>
      </div>
    </nav>
  );
}
