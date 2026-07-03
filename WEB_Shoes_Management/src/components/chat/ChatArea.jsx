import { useState, useRef, useEffect, useCallback } from 'react'
import { FiX, FiChevronLeft, FiImage, FiSend, FiMessageCircle } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import { getImageUrl, formatLastActive } from '~/utils/formatters'
import { MessageList } from './MessageList'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { Link } from 'react-router-dom'

export const ChatArea = ({
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
  const isLoadingMoreRef = useRef(false)

  useEffect(() => {
    if (selectedImage) {
      setImagePreview(URL.createObjectURL(selectedImage))
    } else {
      setImagePreview(null)
    }
  }, [selectedImage])

  const handleScroll = useCallback((e) => {
    const container = e.target
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
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:bg-gray-200 p-1.5 rounded-full transition-colors cursor-pointer hidden sm:block">
            <FiX size={20} />
          </button>
          <FiMessageCircle size={48} className="text-gray-300 mb-3" />
          <p className="text-xs font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
          <p className="text-[10px] text-center px-8 mt-1">Nhấn vào cửa hàng bên trái để xem tin nhắn</p>
        </div>
      </div>
    )
  }

  const isUserClient = currentUser.id === activeChat.client_id
  const displayName = isUserClient ? activeChat.store_name : activeChat.client_name
  const displayAvatar = isUserClient ? activeChat.store_logo : activeChat.client_avatar
  const isOnline = isUserClient ? activeChat.store_online : activeChat.client_online
  const lastActive = isUserClient ? activeChat.store_last_active : activeChat.client_last_active

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <div className="bg-brand-primary px-4 py-2.5 flex items-center justify-between text-white shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="hover:bg-white/20 p-1 rounded-full transition-colors cursor-pointer sm:hidden"
          >
            <FiChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <img
              src={getImageUrl(displayAvatar, 'https://placehold.co/100x100/f6f9fc/a0aabf?text=User')}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/50 bg-white shrink-0"
            />
            <div className="flex flex-col">
              <Link to={`/store/${activeChat.store_id}`} className="font-bold text-sm leading-tight">{displayName}</Link>
              <span className={`text-[10px] font-normal leading-tight mt-0.5 ${isOnline ? 'text-green-200' : 'text-white/70'}`}>
                {isOnline ? 'Đang hoạt động' : `Hoạt động ${formatLastActive(lastActive).toLowerCase()}`}
              </span>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer">
          <FiX size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {loadingMore && (
          <div className="flex justify-center py-2 bg-gray-50">
            <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400 ml-2">Đang tải tin nhắn cũ...</span>
          </div>
        )}

        <MessageList
          messages={messages}
          loadingChat={loadingChat}
          currentUser={currentUser}
          messagesEndRef={messagesEndRef}
          onScroll={handleScroll}
        />

        {imagePreview && (
          <div className="px-3 py-1.5 bg-gray-100 border-t border-gray-200 relative flex items-center">
            <img src={imagePreview} alt="preview" className="h-12 w-12 object-cover rounded-lg" />
            <button onClick={removeImage} className="absolute top-1 left-12 bg-black/50 text-white rounded-full p-0.5 shadow-sm hover:bg-black/70">
              <FiX size={12} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-2 bg-white border-t border-gray-200 flex items-center gap-2">
          <label className="text-gray-400 hover:text-brand-primary cursor-pointer p-1.5 transition-colors">
            <FiImage size={18} />
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-full border-gray-200 focus-visible:ring-brand-primary/20 text-sm h-8"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="submit"
                disabled={!messageText.trim() && !selectedImage}
                className="bg-brand-primary text-white p-1.5 rounded-full hover:bg-[#c73652] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Gửi</p>
            </TooltipContent>
          </Tooltip>
        </form>
      </div>
    </div>
  )
}