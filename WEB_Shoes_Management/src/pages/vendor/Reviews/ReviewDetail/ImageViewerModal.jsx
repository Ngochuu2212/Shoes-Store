import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export const ImageViewerModal = ({ isOpen, images, selectedIndex, onClose, onIndexChange }) => {
  if (!isOpen || !images.length) return null

  const currentImage = images[selectedIndex]
  const imageUrl = currentImage?.secure_url || currentImage

  const handlePrev = (e) => {
    e.stopPropagation()
    onIndexChange((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = (e) => {
    e.stopPropagation()
    onIndexChange((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <FiX size={32} />
      </button>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
      >
        <FiChevronLeft size={40} />
      </button>

      <img
        src={imageUrl}
        alt={`Review full size ${selectedIndex + 1}`}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
      >
        <FiChevronRight size={40} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
        {selectedIndex + 1} / {images.length}
      </div>
    </div>
  )
}