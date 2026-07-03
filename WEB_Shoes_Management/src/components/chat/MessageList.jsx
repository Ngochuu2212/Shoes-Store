import { formatMessageTime, shouldShowTimeDivider } from '~/utils/formatters'

export const MessageList = ({ messages, loadingChat, currentUser, messagesEndRef, onScroll }) => {
  if (loadingChat) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-6 h-6 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar" onScroll={onScroll}>
        <p className="text-center text-xs text-gray-400 my-6">Hãy bắt đầu cuộc trò chuyện với cửa hàng</p>
        <div ref={messagesEndRef} />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar" onScroll={onScroll}>
      {messages.map((msg, idx) => {
        const actualSenderId = msg.sender_id || msg.senderId
        const actualCreatedAt = msg.created_at || msg.createdAt

        const isMe = actualSenderId === currentUser.id
        const prevMsg = idx > 0 ? messages[idx - 1] : null
        const prevCreatedAt = prevMsg ? (prevMsg.created_at || prevMsg.createdAt) : null
        const showTimeDivider = shouldShowTimeDivider(prevCreatedAt, actualCreatedAt)

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
              <div className="flex justify-center my-2">
                <span className="text-[12px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {formatMessageTime(actualCreatedAt)}
                </span>
              </div>
            )}

            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-1.5 shadow-sm ${
                isMe
                  ? 'bg-brand-primary text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
              }`}>
                {msg.content && <p className="text-sm break-words">{msg.content}</p>}

                {images.length > 0 && (
                  <img
                    src={images[0].secure_url}
                    alt="img"
                    className="max-w-full mt-1 rounded-lg"
                  />
                )}

                <div className={`text-[9px] mt-0.5 ${isMe ? 'text-white/70 text-right' : 'text-gray-400'}`}>
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