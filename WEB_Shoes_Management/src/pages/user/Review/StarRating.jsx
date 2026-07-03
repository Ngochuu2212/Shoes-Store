import { useState } from 'react'
import { FiStar } from 'react-icons/fi'

export const StarRating = ({ value, onChange, label }) => {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform duration-200 hover:scale-125 cursor-pointer"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <FiStar
              size={28}
              className={`transition-colors duration-300 ${
                star <= (hover || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-3 text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded">
          {value === 0 ? 'Chưa đánh giá' : `${value} Sao`}
        </span>
      </div>
    </div>
  )
}