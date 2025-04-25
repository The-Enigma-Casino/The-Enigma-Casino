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

  return (
    <div className="flex flex-wrap justify-center gap-6 mt-6 text-white items-center font-bold text-3xl">
      <span className="cursor-pointer" onClick={handlePrev}>{'‹'}</span>

      {[...Array(totalPages)].map((_, i) => {
        const currentPage = i + 1;
        return (
          <span
            key={currentPage}
            className={`cursor-pointer px-2 ${currentPage === page ? 'text-Principal font-bold' : 'text-white'}`}
            onClick={() => onPageChange(currentPage)}
          >
            {currentPage}
          </span>
        );
      })}

      {totalPages > 5 && <span>…</span>}
      <span className="cursor-pointer" onClick={handleNext}>{'›'}</span>
    </div>
  );
};

export default Pagination;
