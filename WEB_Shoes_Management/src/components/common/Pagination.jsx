import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  // Tạo mảng số trang để render
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-2 my-12">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-10 h-10 flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronLeft />
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 flex cursor-pointer items-center justify-center rounded-lg font-semibold transition-all ${
            currentPage === page
              ? 'bg-[#e94560] text-white shadow-md shadow-[#e94560]/30'
              : 'border border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-10 h-10 flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronRight />
      </button>
    </div>
  )
}