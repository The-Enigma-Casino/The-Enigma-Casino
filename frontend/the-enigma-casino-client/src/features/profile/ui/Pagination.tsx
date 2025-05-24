interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-wrap justify-center gap-6 mt-6 text-white items-center font-bold text-3xl">
      <span className="cursor-pointer" onClick={handlePrev}>{'‹'}</span>

      {getPageNumbers().map((num, index) =>
        typeof num === 'number' ? (
          <span
            key={num}
            className={`cursor-pointer px-2 ${num === page ? 'text-Principal font-bold' : 'text-white'}`}
            onClick={() => { onPageChange(num) }
            }
          >
            {num}
          </span>
        ) : (
          <span key={`ellipsis-${index}`} className="px-2 text-white/50 select-none">…</span>
        )
      )}

      <span className="cursor-pointer" onClick={handleNext}>{'›'}</span>
    </div>
  );
};

export default Pagination;
