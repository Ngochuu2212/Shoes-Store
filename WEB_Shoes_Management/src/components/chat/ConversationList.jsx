import { FiMessageCircle, FiX } from 'react-icons/fi'
import { getImageUrl, formatRelativeTime } from '~/utils/formatters'

export const ConversationList = ({
  activeChat,
  conversations,
  loadingList,
  currentUser,
  onSelectConversation,
  onClose,
  getOnlineStatus
}) => {
  return (
    <div className={`${activeChat ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 flex-col border-r border-gray-200 bg-white overflow-hidden`}>
      <div className="px-4 py-3.5 border-b border-gray-300 flex items-center justify-between shrink-0 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-brand-primary/20 shadow-sm">
            <FiMessageCircle size={16} className="fill-brand-primary/10" />
          </div>
          <h4 className="font-extrabold text-brand-secondary text-base tracking-tight">Đoạn chat</h4>
        </div>

        {!activeChat && (
          <button
            onClick={onClose}
            className="sm:hidden text-gray-400 hover:bg-red-50 hover:text-red-500 p-1.5 rounded-full transition-all duration-300 cursor-pointer active:scale-95"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      {loadingList ? (
        <div className="flex justify-center items-center h-full">
          <div className="w-6 h-6 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <FiMessageCircle size={40} className="text-gray-300 mb-2" />
              <p className="text-xs font-medium text-center">Chưa có cuộc trò chuyện nào.</p>
              <p className="text-xs text-center px-4 mt-1">Hãy xem sản phẩm và nhấn Chat với Shop để bắt đầu nhé!</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isUserClient = currentUser.id === conv.client_id
              const displayAvatar = isUserClient ? conv.store_logo : conv.client_avatar
              const displayName = isUserClient ? conv.store_name : conv.client_name
              const status = getOnlineStatus(conv)

              return (
                <div
                  key={conv.conversation_id}
                  onClick={() => onSelectConversation(conv)}
                  className={`flex items-center gap-2 p-2 hover:bg-brand-primary/5 rounded-lg cursor-pointer transition-all mx-1 my-0.5 ${
                    activeChat?.conversation_id === conv.conversation_id
                      ? 'bg-brand-primary/10 border-l-2 border-brand-primary'
                      : 'border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={getImageUrl(displayAvatar, 'https://placehold.co/100x100/f6f9fc/a0aabf?text=User')}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-white"
                    />
                    {status.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-green-500"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-bold text-xs truncate ${conv.unread_count > 0 ? 'text-black' : 'text-gray-800'}`}>
                        {displayName}
                      </h4>
                      <span className={`text-[10px] ${conv.unread_count > 0 ? 'text-brand-primary font-bold' : 'text-gray-400'}`}>
                        {formatRelativeTime(conv.updated_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-[10px] truncate ${conv.unread_count > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
                        {status.isOnline ? 'Đang hoạt động' : status.text}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}