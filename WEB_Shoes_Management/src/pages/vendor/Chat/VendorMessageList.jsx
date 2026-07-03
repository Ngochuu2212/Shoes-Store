import { formatMessageTime, shouldShowTimeDivider } from '~/utils/formatters'
import { FiMessageCircle } from 'react-icons/fi'

export const VendorMessageList = ({
  messages,
  loadingChat,
  currentUser,
  messagesEndRef,
  onScroll // Thêm prop onScroll
}) => {
  if (loadingChat) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <FiMessageCircle size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">Chưa có tin nhắn nào</p>
          <p className="text-xs text-center mt-1">Hãy gửi tin nhắn để bắt đầu trò chuyện</p>
        </div>
        <div ref={messagesEndRef} />
      </div>
    )
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gradient-to-b from-gray-50 to-white"
      onScroll={onScroll}
    >
      {messages.map((msg, idx) => {
        const actualSenderId = msg.sender_id || msg.senderId
        const actualCreatedAt = msg.created_at || msg.createdAt

        const isMe = actualSenderId === currentUser.id
        const prevMsg = idx > 0 ? messages[idx - 1] : null
        const prevCreatedAt = prevMsg ? (prevMsg.created_at || prevMsg.createdAt) : null
        const showTimeDivider = shouldShowTimeDivider(prevCreatedAt, actualCreatedAt)

        // Parse images nếu có
        let images = []
        if (msg.images) {
          try {
            images = typeof msg.images === 'string' ? JSON.parse(msg.images) : msg.images
          } catch (e) {
            images = []
          }
        }

        return (
          <div key={idx}>
            {showTimeDivider && (
              <div className="flex justify-center my-3">
                <span className="text-[11px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {formatMessageTime(actualCreatedAt)}
                </span>
              </div>
            )}

            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                isMe
                  ? 'bg-brand-primary text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
              }`}>
                {!isMe && (
                  <p className="text-[10px] font-semibold text-brand-primary mb-1">
                    {msg.sender_name || 'Khách hàng'}
                  </p>
                )}

                {msg.content && <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>}

                {images.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {images.map((img, imgIdx) => (
                      <img
                        key={imgIdx}
                        src={img.secure_url}
                        alt={`image-${imgIdx}`}
                        className="rounded-lg max-w-full max-h-48 object-cover cursor-pointer"
                        onClick={() => window.open(img.secure_url, '_blank')}
                      />
                    ))}
                  </div>
                )}

                <div className={`text-[9px] mt-1 ${isMe ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                  {formatMessageTime(actualCreatedAt)}
                </div>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}