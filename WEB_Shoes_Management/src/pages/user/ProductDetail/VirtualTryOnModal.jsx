import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX, FiUpload, FiDownload, FiRefreshCw, FiChevronRight,
  FiRotateCw, FiCompass, FiTrash2, FiAlertCircle
} from 'react-icons/fi'
import { LuFlipHorizontal } from 'react-icons/lu'
import { aiApiService } from '~/services/ai/aiApiService'
import { toast } from 'react-toastify'

export const VirtualTryOnModal = ({ isOpen, onClose, shoeImage, productName }) => {
  const [uploadedImgUrl, setUploadedImgUrl] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  
  // Các trạng thái điều chỉnh vị trí và kích thước giày
  const [position, setPosition] = useState({ x: 150, y: 220 })
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  
  // Trạng thái kéo thả
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  // Trạng thái AI Phân tích
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [loadingText, setLoadingText] = useState('Đang khởi động AI Stylist...')

  const fileInputRef = useRef(null)
  const containerRef = useRef(null)

  // Reset state khi mở/đóng modal
  useEffect(() => {
    if (isOpen) {
      setUploadedImgUrl(null)
      setImageFile(null)
      setAiResult('')
      setScale(1.0)
      setRotation(0)
      setIsFlipped(false)
      setPosition({ x: 150, y: 220 })
    }
  }, [isOpen])

  // Xử lý kéo thả giày (Mouse Events)
  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    
    // Giới hạn trong container
    const x = e.clientX - dragStart.x
    const y = e.clientY - dragStart.y
    setPosition({ x, y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Xử lý kéo thả giày (Touch Events - cho Mobile)
  const handleTouchStart = (e) => {
    if (e.touches.length === 0) return
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
  }

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length === 0) return
    const touch = e.touches[0]
    const x = touch.clientX - dragStart.x
    const y = touch.clientY - dragStart.y
    setPosition({ x, y })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Xử lý chọn hình ảnh chân
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn!')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImgUrl(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Chọn ảnh bằng cách nhấn vào vùng upload
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Xử lý ghép ảnh và tải xuống
  const handleDownloadImage = () => {
    if (!uploadedImgUrl) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    const bgImg = new Image()
    bgImg.src = uploadedImgUrl
    
    toast.info('Đang chuẩn bị tạo ảnh thử giày...')

    bgImg.onload = () => {
      canvas.width = bgImg.naturalWidth
      canvas.height = bgImg.naturalHeight
      
      // Vẽ ảnh nền (chân)
      ctx.drawImage(bgImg, 0, 0)
      
      // Vẽ giày đè lên
      const shoeImg = new Image()
      shoeImg.crossOrigin = 'anonymous'
      shoeImg.src = shoeImage
      
      shoeImg.onload = () => {
        const container = containerRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        
        // Tỉ lệ scale giữa ảnh gốc và khung hiển thị UI
        const scaleX = bgImg.naturalWidth / rect.width
        const scaleY = bgImg.naturalHeight / rect.height
        
        // Giày hiển thị trên UI có kích thước mặc định w-48 (192px)
        const uiShoeWidth = 192 
        const uiShoeHeight = (192 / shoeImg.width) * shoeImg.height
        
        const finalWidth = uiShoeWidth * scale * scaleX
        const finalHeight = uiShoeHeight * scale * scaleY
        
        // Trọng tâm xoay của giày
        const cx = position.x * scaleX
        const cy = position.y * scaleY
        
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate((rotation * Math.PI) / 180)
        
        if (isFlipped) {
          ctx.scale(-1, 1)
        }
        
        ctx.drawImage(shoeImg, -finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight)
        ctx.restore()
        
        // Tải ảnh về
        const link = document.createElement('a')
        link.download = `tryon-${productName.replace(/\s+/g, '-').toLowerCase()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        toast.success('🎉 Đã tải ảnh thử giày thành công!')
      }

      shoeImg.onerror = () => {
        toast.error('Không thể tải ảnh giày từ máy chủ để ghép ảnh.')
      }
    }
  }

  // Gọi Gemini AI tư vấn
  const handleAnalyzeTryOn = async () => {
    if (!imageFile) return
    
    setAiLoading(true)
    setAiResult('')
    
    // Hiệu ứng đổi text loading cho sinh động
    const loadingTexts = [
      'Đang gửi dữ liệu hình ảnh tới AI Stylist...',
      'AI đang quan sát dáng bàn chân của bạn...',
      'AI đang đối chiếu với đôi giày đang xem...',
      'Đang tính toán mức độ phối đồ và tone da...',
      'AI Stylist đang soạn lời tư vấn thời trang cho bạn...'
    ]
    
    let textIdx = 0
    setLoadingText(loadingTexts[0])
    const interval = setInterval(() => {
      textIdx = (textIdx + 1) % loadingTexts.length
      setLoadingText(loadingTexts[textIdx])
    }, 2800)

    try {
      const data = await aiApiService.analyzeTryOn(imageFile, shoeImage, productName)
      setAiResult(data.review)
      toast.success('✨ AI Stylist đã hoàn thành bài phân tích tư vấn!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi kết nối tới AI Stylist.')
    } finally {
      clearInterval(interval)
      setAiLoading(false)
    }
  }

  // Render text markdown cơ bản
  const renderFormattedReview = (text) => {
    if (!text) return null
    return text.split('\n').map((line, idx) => {
      let content = line.trim()
      if (content.startsWith('### ')) {
        return <h4 key={idx} className="text-base font-bold text-gray-900 mt-4 mb-2">{content.substring(4)}</h4>
      }
      if (content.startsWith('## ')) {
        return <h3 key={idx} className="text-lg font-extrabold text-brand-secondary mt-5 mb-2">{content.substring(3)}</h3>
      }
      if (content.startsWith('**') && content.endsWith('**')) {
        return <p key={idx} className="font-bold text-gray-800 my-1">{content.replace(/\*\*/g, '')}</p>
      }
      
      // Format bold inline text
      const parts = []
      let temp = content
      const regex = /\*\*(.*?)\*\*/g
      let match
      let lastIndex = 0
      
      while ((match = regex.exec(temp)) !== null) {
        if (match.index > lastIndex) {
          parts.push(temp.substring(lastIndex, match.index))
        }
        parts.push(<strong key={match.index} className="font-extrabold text-gray-900">{match[1]}</strong>)
        lastIndex = regex.lastIndex
      }
      if (lastIndex < temp.length) {
        parts.push(temp.substring(lastIndex))
      }

      if (content.startsWith('- ') || content.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 list-disc my-1 text-gray-700 text-sm leading-relaxed">
            {parts.length > 0 ? parts : content.substring(2)}
          </li>
        )
      }
      
      return (
        <p key={idx} className="text-gray-700 text-sm leading-relaxed my-1.5 min-h-[1rem]">
          {parts.length > 0 ? parts : content}
        </p>
      )
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.42 }}
            className="relative bg-white w-full max-w-4xl h-[90vh] md:h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 m-4 border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
                  <FiCompass size={16} />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black text-gray-800">Thử Giày Ảo & Stylist AI</h2>
                  <p className="text-[10px] md:text-xs text-gray-400">Ưm thử mẫu giày và nhận lời khuyên phong cách từ Gemini AI</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6">
              {/* Left Side: Try On Box */}
              <div className="flex-1 flex flex-col gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {!uploadedImgUrl ? (
                  /* Vùng Upload */
                  <div
                    onClick={triggerFileInput}
                    className="flex-1 aspect-[3/4] max-h-[480px] border-3 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/20 hover:bg-purple-50/40 rounded-3xl flex flex-col items-center justify-center gap-4 p-8 text-center cursor-pointer transition-all duration-300 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <FiUpload size={28} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-700 text-sm md:text-base">Tải ảnh chụp bàn chân lên</p>
                      <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">
                        Hãy chụp bàn chân hoặc đôi chân của bạn từ trên xuống và tải lên đây để ướm giày thử.
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm">
                      Chọn ảnh
                    </span>
                  </div>
                ) : (
                  /* Vùng Tương tác Ướm Giày */
                  <div className="flex-1 flex flex-col gap-4">
                    <div
                      ref={containerRef}
                      id="tryon-container"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className="relative w-full aspect-[3/4] max-h-[480px] bg-slate-100 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center select-none"
                    >
                      {/* Background (chân) */}
                      <img
                        src={uploadedImgUrl}
                        alt="User foot"
                        className="w-full h-full object-cover pointer-events-none"
                      />

                      {/* Foreground (giày) */}
                      <div
                        id="shoe-overlay"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        style={{
                          position: 'absolute',
                          left: position.x,
                          top: position.y,
                          transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
                          cursor: isDragging ? 'grabbing' : 'grab',
                          touchAction: 'none'
                        }}
                        className="select-none p-4"
                      >
                        <img
                          src={shoeImage}
                          alt="Shoe try on"
                          className="w-48 h-auto object-contain pointer-events-none select-none drop-shadow-lg"
                        />
                      </div>

                      {/* Nút hủy ảnh ở góc */}
                      <button
                        onClick={() => {
                          setUploadedImgUrl(null)
                          setImageFile(null)
                          setAiResult('')
                        }}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Xóa ảnh chân"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    {/* Bộ điều khiển sliders */}
                    <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-3 shrink-0">
                      {/* Scale Slider */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-500 w-16 uppercase">Kích cỡ:</span>
                        <input
                          type="range"
                          min="0.4"
                          max="2.2"
                          step="0.01"
                          value={scale}
                          onChange={(e) => setScale(parseFloat(e.target.value))}
                          className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-xs font-mono font-bold text-gray-700 w-8 text-right">
                          {Math.round(scale * 100)}%
                        </span>
                      </div>

                      {/* Rotation Slider */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-500 w-16 uppercase">Xoay góc:</span>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          step="1"
                          value={rotation}
                          onChange={(e) => setRotation(parseInt(e.target.value))}
                          className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-xs font-mono font-bold text-gray-700 w-8 text-right">
                          {rotation}°
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <button
                          onClick={() => setIsFlipped(prev => !prev)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors
                            ${isFlipped ? 'bg-purple-100 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          <LuFlipHorizontal size={14} />
                          <span>Lật giày</span>
                        </button>
                        <button
                          onClick={handleDownloadImage}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold cursor-pointer transition-colors"
                        >
                          <FiDownload size={14} />
                          <span>Tải ảnh thử</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: AI Stylist Panel */}
              <div className="w-full lg:w-[360px] bg-slate-50/50 rounded-3xl border border-slate-100 p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <FiCompass className="text-purple-600" size={18} />
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">Trợ lý thời trang AI</h3>
                </div>

                {!uploadedImgUrl ? (
                  /* Chưa có ảnh */
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border border-gray-100 rounded-2xl">
                    <FiAlertCircle size={28} className="text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                      Hãy tải ảnh chụp bàn chân của bạn lên trước để AI Stylist có thể nhận xét và tư vấn cách phối đồ.
                    </p>
                  </div>
                ) : aiLoading ? (
                  /* Loading */
                  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-2xl min-h-[300px]">
                    <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
                      <div className="relative w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100">
                        <FiCompass size={20} className="animate-spin" />
                      </div>
                    </div>
                    <p className="text-xs font-black text-gray-700 animate-pulse text-center leading-relaxed">
                      {loadingText}
                    </p>
                  </div>
                ) : aiResult ? (
                  /* Show kết quả */
                  <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 overflow-y-auto max-h-[360px] lg:max-h-[none]">
                    <div className="border-l-4 border-purple-500 pl-3 mb-4">
                      <p className="text-xs font-extrabold text-purple-700 tracking-wider uppercase">Tư vấn phong cách</p>
                    </div>
                    <div className="space-y-1">
                      {renderFormattedReview(aiResult)}
                    </div>
                  </div>
                ) : (
                  /* Nút phân tích ảnh */
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border border-gray-100 rounded-2xl min-h-[300px]">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 shadow-sm">
                      <FiCompass size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-600 max-w-[200px] leading-relaxed mb-4">
                      Sau khi di chuyển giày về đúng vị trí chân, bấm nút bên dưới để nhờ AI nhận xét.
                    </p>
                    <button
                      onClick={handleAnalyzeTryOn}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-purple-100 cursor-pointer transition-all hover:scale-[1.03]"
                    >
                      <FiCompass size={14} />
                      <span>AI Nhận Xét Phối Đồ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
