import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiCamera } from 'react-icons/fi'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { aiApiService } from '~/services/ai/aiApiService'
import { toast } from 'react-toastify'

export const Search = ({ searchTerm, setSearchTerm, handleSearch }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Tạo preview URL để hiển thị trong lúc quét ảnh
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setIsScanning(true)

    try {
      const response = await aiApiService.searchByImage(file)
      
      if (response && response.products) {
        toast.success(`AI đã tìm thấy ${response.products.length} sản phẩm tương đồng!`)
        // Điều hướng sang trang sản phẩm và truyền kết quả qua react-router state
        navigate('/products', {
          state: {
            aiProducts: response.products,
            uploadedImage: previewUrl,
            keywords: response.keywords
          }
        })
      }
    } catch (error) {
      console.error('Lỗi tìm kiếm hình ảnh AI:', error)
      toast.error(error?.response?.data?.message || 'Không thể nhận diện hình ảnh của bạn!')
    } finally {
      setIsScanning(false)
      // Reset input file để có thể chọn lại chính ảnh đó lần sau
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-xl relative hidden md:block">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
        className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-5 pr-22
                                 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-[#e94560]/20
                                 transition-all duration-300 ease-out text-sm"
      />
      
      {/* Nút Tìm kiếm bằng hình ảnh (Camera) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={isScanning}
              className="w-7 h-7 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              <FiCamera size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tìm kiếm bằng hình ảnh AI</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-brand-primary rounded-full
                                       flex items-center justify-center text-white
                                       transition-all duration-200 ease-out hover:scale-110 hover:bg-[#c73652] cursor-pointer">
            <FiSearch size={14} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tìm kiếm</p>
        </TooltipContent>
      </Tooltip>

      {/* AI Scanning Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center text-white select-none">
          <style>{`
            @keyframes scan {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `}</style>
          
          <div className="relative w-28 h-28 mb-6">
            <div className="w-full h-full rounded-3xl border-2 border-orange-500 bg-gray-900 flex items-center justify-center overflow-hidden shadow-2xl">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-75" />
              )}
            </div>
            <div 
              className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-md shadow-orange-500/50"
              style={{
                animation: 'scan 2.5s linear infinite'
              }}
            />
          </div>
          <h3 className="text-lg font-black tracking-wide flex items-center gap-1.5">
            AI đang phân tích hình ảnh...
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </h3>
          <p className="text-xs text-gray-400 mt-2">Trích xuất từ khóa đặc trưng và tìm kiếm sản phẩm trên hệ thống.</p>
        </div>
      )}
    </form>
  )
}