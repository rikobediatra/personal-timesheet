"use client";

type HistoryPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

function pageNumbers(current: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const start = Math.max(1, Math.min(current - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, i) => start + i);
}

export function HistoryPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: HistoryPaginationProps) {
  if (total === 0) {
    return null;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = pageNumbers(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-space-sm bg-surface-container-low/40 px-space-md py-3 font-label-sm text-label-sm text-on-surface-variant sm:flex-row">
      <div className="flex items-center gap-2">
        <span>
          Showing {from} to {to} of {total} submissions
        </span>
      </div>
      <div className="flex items-center gap-1">
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n)}
            className={
              n === page
                ? "rounded bg-surface-container-lowest px-2.5 py-1 font-semibold text-primary shadow-sm"
                : "rounded px-2.5 py-1 transition-colors hover:bg-surface-container-low"
            }
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
