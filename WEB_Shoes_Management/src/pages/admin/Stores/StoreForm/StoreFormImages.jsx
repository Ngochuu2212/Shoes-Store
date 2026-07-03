import { useRef } from 'react'
import { motion } from 'framer-motion'
import { FiCamera, FiTrash2, FiUploadCloud, FiImage, FiLayout } from 'react-icons/fi'

export const StoreFormImages = ({
  logoPreview,
  bannerPreview,
  onLogoChange,
  onBannerChange,
  onRemoveLogo,
  onRemoveBanner
}) => {
  const logoInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  const handleLogoClick = () => logoInputRef.current?.click()
  const handleBannerClick = () => bannerInputRef.current?.click()

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300 sticky top-24"
    >
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FiImage className="text-emerald-500" size={16} />
        </div>
        Hình ảnh cửa hàng
      </h3>

      <div className="space-y-4">
        {/* Logo */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-2">Logo cửa hàng</label>
          <div
            onClick={handleLogoClick}
            className="relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/30"
          >
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => onLogoChange(e.target.files?.[0] || null)}
              className="hidden"
            />
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-24 h-24 mx-auto rounded-xl object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemoveLogo() }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-md"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-2">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiCamera size={20} className="text-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-600">Tải logo lên</p>
                <p className="text-[10px] text-gray-400">JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Banner */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-2">Banner cửa hàng</label>
          <div
            onClick={handleBannerClick}
            className="relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/30"
          >
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => onBannerChange(e.target.files?.[0] || null)}
              className="hidden"
            />
            {bannerPreview ? (
              <div className="relative">
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-24 rounded-xl object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemoveBanner() }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-md"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-2">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiLayout size={20} className="text-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-600">Tải banner lên</p>
                <p className="text-[10px] text-gray-400">JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          * Để trống nếu không muốn thêm ảnh
        </p>
      </div>
    </motion.div>
  )
}