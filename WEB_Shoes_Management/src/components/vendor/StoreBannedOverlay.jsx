import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiLock, FiAlertCircle, FiSend, FiX, FiClock, FiMail,
  FiImage, FiUpload, FiTrash2
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

export const StoreBannedOverlay = ({ store, onAppealSubmit, isSubmitting }) => {
  const [appealReason, setAppealReason] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [evidenceFiles, setEvidenceFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const fileInputRef = useRef(null)

  const MAX_FILES = 5

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_FILES - evidenceFiles.length

    if (files.length > remaining) {
      toast.error(`Chỉ được phép tải lên tối đa ${MAX_FILES} ảnh. Bạn còn ${remaining} ảnh.`)
      return
    }

    // Kiểm tra kích thước file (tối đa 3MB mỗi ảnh)
    const validFiles = files.filter(file => {
      if (file.size > 3 * 1024 * 1024) {
        toast.error(`File "${file.name}" vượt quá 3MB.`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setEvidenceFiles(prev => [...prev, ...validFiles])

      // Tạo preview URLs
      const newPreviews = validFiles.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => [...prev, ...newPreviews])
    }

    // Reset input
    e.target.value = ''
  }

  const removeFile = (index) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index))
    // Revoke URL để giải phóng bộ nhớ
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!appealReason.trim() || appealReason.trim().length < 10) {
      toast.error('Vui lòng nhập lý do giải trình ít nhất 10 ký tự')
      return
    }

    const formData = new FormData()
    formData.append('appealReason', appealReason.trim())

    evidenceFiles.forEach(file => {
      formData.append('evidenceImages', file)
    })

    const result = await onAppealSubmit(formData)

  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <FiLock size={24} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Cửa hàng đã bị khóa</h2>
              <p className="text-xs text-gray-500 mt-0.5">Tạm ngưng hoạt động kinh doanh</p>
            </div>
          </div>
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full">
              BỊ KHÓA
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Thông báo */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 leading-relaxed">
              Cửa hàng của bạn đã bị tạm ngưng hoạt động do vi phạm chính sách của sàn.
              Vui lòng gửi đơn giải trình để được xem xét mở lại.
            </p>
          </div>

          {/* Lý do khóa */}
          {store?.reject_reason && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 uppercase mb-1">📝 Lý do khóa:</p>
              <p className="text-sm text-amber-800">{store.reject_reason}</p>
            </div>
          )}

          {/* Thông tin bổ sung */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase">
                <FiClock size={12} />
                Ngày khóa
              </div>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {store?.updated_at ? new Date(store.updated_at).toLocaleDateString('vi-VN') : 'Chưa xác định'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase">
                <FiMail size={12} />
                Hỗ trợ
              </div>
              <Link to="mailto:support@shoesstore.com" className="text-sm font-semibold text-brand-primary hover:underline mt-0.5 block">
                support@shoesstore.com
              </Link>
            </div>
          </div>

          {/* Form gửi đơn */}
          {!showForm ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-brand-primary to-rose-500 text-white rounded-xl font-bold shadow-md shadow-brand-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <FiAlertCircle size={18} />
              Gửi đơn giải trình
            </motion.button>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Lý do giải trình */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">
                  Lý do giải trình <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="Nhập lý do giải trình và cam kết khắc phục vi phạm..."
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Tối thiểu 10 ký tự
                </p>
              </div>

              {/* Upload ảnh bằng chứng */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">
                  Ảnh bằng chứng (tối đa 5 ảnh, mỗi ảnh ≤ 3MB)
                </label>

                {/* Upload button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                    evidenceFiles.length >= MAX_FILES
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                      : 'border-gray-300 hover:border-brand-primary hover:bg-brand-primary/5'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={evidenceFiles.length >= MAX_FILES || isSubmitting}
                  />
                  <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-500">
                    {evidenceFiles.length >= MAX_FILES
                      ? 'Đã đạt giới hạn 5 ảnh'
                      : 'Nhấn để tải ảnh lên'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {evidenceFiles.length}/{MAX_FILES} ảnh
                  </p>
                </div>

                {/* Preview ảnh */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                          disabled={isSubmitting}
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEvidenceFiles([])
                    setPreviewUrls([])
                    setAppealReason('')
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all cursor-pointer"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || appealReason.trim().length < 10}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-brand-primary to-rose-500 text-white font-bold rounded-xl transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <FiSend size={16} />
                      Gửi đơn
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* Link đến trang theo dõi đơn */}
          <div className="text-center pt-2 border-t border-gray-100">
            <Link
              to="/vendor/appeals"
              className="text-xs text-brand-primary hover:underline font-semibold inline-flex items-center gap-1"
            >
              Xem lịch sử đơn giải trình
              <FiAlertCircle size={12} />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-3xl">
          <p className="text-[10px] text-center text-gray-400">
            Đơn giải trình sẽ được xem xét trong vòng 24-48 giờ làm việc
          </p>
        </div>
      </motion.div>
    </div>
  )
}