import { useState, useRef, useEffect, useCallback } from 'react'
import { FiX, FiChevronLeft, FiImage, FiSend, FiPhone, FiMail, FiMessageCircle } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import { getImageUrl, formatLastActive } from '~/utils/formatters'
import { VendorMessageList } from './VendorMessageList'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'

export const VendorChatArea = ({
  activeChat,
  messages,
  loadingChat,
  loadingMore,
  currentUser,
  onSendMessage,
  onBack,
  onClose,
  messagesEndRef,
  onLoadMore,
  hasMore
}) => {
  const [messageText, setMessageText] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const messageListRef = useRef(null)
  const isLoadingMoreRef = useRef(false)

  // Reset image preview when selectedImage changes
  useEffect(() => {
    if (selectedImage) {
      setImagePreview(URL.createObjectURL(selectedImage))
    } else {
      setImagePreview(null)
    }
  }, [selectedImage])

  // Xử lý scroll để load thêm tin nhắn cũ
  const handleScroll = useCallback((e) => {
    const container = e.target
    // Khi cuộn lên gần đầu (scrollTop <= 50px)
    if (container.scrollTop <= 50 && !isLoadingMoreRef.current && hasMore && !loadingChat) {
      isLoadingMoreRef.current = true
      onLoadMore?.()
      setTimeout(() => {
        isLoadingMoreRef.current = false
      }, 500)
    }
  }, [hasMore, loadingChat, onLoadMore])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!messageText.trim() && !selectedImage) return

    const success = await onSendMessage(messageText, selectedImage)
    if (success) {
      setMessageText('')
      setSelectedImage(null)
      setImagePreview(null)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        <div className="flex flex-col items-center justify-center h-full text-gray-500 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-200 p-2 rounded-full transition-colors cursor-pointer hidden sm:block">
            <FiX size={20} />
          </button>
          <FiMessageCircle size={56} className="text-gray-300 mb-4" />
          <p className="text-sm font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
          <p className="text-xs text-center px-8 mt-1">Nhấn vào khách hàng bên trái để xem tin nhắn</p>
        </div>
      </div>
    )
  }

  const displayName = activeChat.client_name
  const displayAvatar = activeChat.client_avatar
  const isOnline = activeChat.client_online
  const lastActive = activeChat.client_last_active

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer lg:hidden"
          >
            <FiChevronLeft size={20} className="text-gray-600" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={getImageUrl(displayAvatar, 'https://placehold.co/100x100?text=User')}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full bg-green-500"></span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-gray-800 text-base">{displayName}</span>
              <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                {isOnline ? 'Đang hoạt động' : `Hoạt động ${formatLastActive(lastActive).toLowerCase()}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 text-gray-400 hover:text-brand-primary hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <FiPhone size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Liên hệ</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 text-gray-400 hover:text-brand-primary hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <FiMail size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Gửi email</TooltipContent>
          </Tooltip>

          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors cursor-pointer ml-1">
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Message List - Đặt onScroll ở đây */}
      <div
        ref={messageListRef}
        className="flex-1 flex flex-col h-full overflow-hidden"
      >
        {/* Hiển thị loading indicator khi đang load thêm tin nhắn cũ */}
        {loadingMore && (
          <div className="flex justify-center py-2 bg-gray-50">
            <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400 ml-2">Đang tải tin nhắn cũ...</span>
          </div>
        )}

        <VendorMessageList
          messages={messages}
          loadingChat={loadingChat}
          currentUser={currentUser}
          messagesEndRef={messagesEndRef}
          onScroll={handleScroll}
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="px-4 py-2 bg-white border-t border-gray-100 relative flex items-center gap-3">
            <img src={imagePreview} alt="preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">Ảnh đính kèm</p>
              <p className="text-[10px] text-gray-400">{selectedImage?.name}</p>
            </div>
            <button
              onClick={removeImage}
              className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
            >
              <FiX size={14} />
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <label className="text-gray-400 hover:text-brand-primary cursor-pointer p-2 rounded-full transition-colors hover:bg-gray-50">
                <FiImage size={20} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </TooltipTrigger>
            <TooltipContent side="top">Đính kèm ảnh</TooltipContent>
          </Tooltip>

          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-full border-gray-200 focus-visible:ring-brand-primary/20 text-sm h-10 bg-gray-50"
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="submit"
                disabled={!messageText.trim() && !selectedImage}
                className="bg-brand-primary text-white p-2 rounded-full hover:bg-[#c73652] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <FiSend size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Gửi</TooltipContent>
          </Tooltip>
        </form>
      </div>
    </div>
  )
}