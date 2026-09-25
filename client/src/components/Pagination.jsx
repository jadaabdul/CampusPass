import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);

    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div
      className="
        mt-8
        flex
        items-center
        justify-center
        gap-2
      "
    >
      {/* Previous Button */}

      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          border
          border-border
          bg-surface
          text-text-muted
          transition
          hover:bg-primary/10
          hover:text-primary
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page Numbers */}

      <div
        className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-border
          bg-surface/70
          px-2
          py-1
          backdrop-blur-xl
        "
      >
        {getPages().map((page, index) =>
          page === "..." ? (
            <span
              key={index}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                text-text-muted
              "
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-sm
                font-semibold
                transition

                ${
                  currentPage === page
                    ? `
                    bg-primary
                    text-white
                    shadow-lg
                    shadow-primary/30
                  `
                    : `
                    text-text-muted
                    hover:bg-primary/10
                    hover:text-text
                  `
                }
              `}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next Button */}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          border
          border-border
          bg-surface
          text-text-muted
          transition
          hover:bg-primary/10
          hover:text-primary
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
