import { FiMessageCircle, FiUsers } from 'react-icons/fi'
import { getImageUrl, formatRelativeTime } from '~/utils/formatters'

export const VendorConversationList = ({
  activeChat,
  conversations,
  loadingList,
  currentUser,
  onSelectConversation,
  getOnlineStatus
}) => {
  return (
    <div className={`${activeChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 flex-col border-r border-gray-200 bg-white overflow-hidden`}>
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-rose-500 flex items-center justify-center shadow-md">
            <FiMessageCircle className="text-white" size={18} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-brand-secondary tracking-tight">Tin nhắn</h2>
            <p className="text-xs text-gray-400 mt-0.5">Hỗ trợ khách hàng qua tin nhắn</p>
          </div>
        </div>
      </div>

      {/* List */}
      {loadingList ? (
        <div className="flex justify-center items-center h-full py-20">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <FiUsers size={48} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-center">Chưa có cuộc trò chuyện nào</p>
              <p className="text-xs text-center text-gray-400 mt-1">Khi khách hàng nhắn tin sẽ hiển thị tại đây</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const displayAvatar = conv.client_avatar
              const displayName = conv.client_name
              const status = getOnlineStatus(conv)

              return (
                <div
                  key={conv.conversation_id}
                  onClick={() => onSelectConversation(conv)}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-all mx-2 my-1 rounded-xl ${
                    activeChat?.conversation_id === conv.conversation_id
                      ? 'bg-brand-primary/10 border-l-4 border-brand-primary rounded-l-none'
                      : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={getImageUrl(displayAvatar, 'https://placehold.co/100x100?text=User')}
                      alt={displayName}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    {status.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-green-500"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-bold text-sm truncate ${conv.unread_count > 0 ? 'text-black' : 'text-gray-800'}`}>
                        {displayName}
                      </h4>
                      <span className={`text-[10px] ${conv.unread_count > 0 ? 'text-brand-primary font-bold' : 'text-gray-400'}`}>
                        {formatRelativeTime(conv.updated_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs truncate ${conv.unread_count > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
                        {status.isOnline ? 'Đang hoạt động' : status.text}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none">
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