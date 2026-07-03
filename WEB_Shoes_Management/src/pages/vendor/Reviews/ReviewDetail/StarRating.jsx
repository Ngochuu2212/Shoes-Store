import { FiStar } from 'react-icons/fi'

export const StarRating = ({ rating, size = 20 }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          className={star <= rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}
        />
      ))}
    </div>
  )
}