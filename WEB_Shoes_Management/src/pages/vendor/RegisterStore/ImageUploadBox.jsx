import { FiUploadCloud, FiX, FiImage } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export const ImageUploadBox = ({ label, file, setFile, aspectClass = 'aspect-square', icon: Icon = FiImage }) => {
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) setFile(selectedFile)
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-bold text-brand-secondary flex items-center gap-2">
        <Icon className="text-brand-primary" /> {label}
      </label>

      <div className="relative group">
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className={`relative w-full ${aspectClass} rounded-[2rem] overflow-hidden border-2 border-gray-100 shadow-sm`}
            >
              <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="bg-white text-red-500 p-3 rounded-full hover:bg-red-50 transition-all duration-300 cursor-pointer active:scale-90 shadow-xl"
                >
                  <FiX size={24} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.label
              key="upload"
              whileHover={{ borderColor: '#e94560', backgroundColor: 'rgba(233, 69, 96, 0.02)' }}
              className={`w-full ${aspectClass} border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 group bg-gray-50/50`}
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform duration-500 ease-out">
                <FiUploadCloud size={32} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
              </div>
              <span className="text-sm font-bold text-gray-500 group-hover:text-brand-secondary">Chọn ảnh tải lên</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </motion.label>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}