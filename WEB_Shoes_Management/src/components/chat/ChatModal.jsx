import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ConversationList } from './ConversationList'
import { ChatArea } from './ChatArea'

export const ChatModal = ({
  activeChat,
  conversations,
  messages,
  loadingList,
  loadingChat,
  loadingMore,
  currentUser,
  onSelectConversation,
  onSendMessage,
  onClose,
  onBack,
  onLoadMore,
  hasMore,
  getOnlineStatus
}) => {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (activeChat) {
      scrollToBottom()
    }
  }, [messages, activeChat])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 200)
  }

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9, originY: 1, originX: 1 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 20 } },
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } }
  }

  return (
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white w-[90vw] sm:w-[800px] h-[500px] sm:h-[550px] rounded-3xl shadow-2xl border border-gray-200 mb-4 flex flex-col overflow-hidden"
    >
      <div className="flex-1 flex overflow-hidden w-full h-full relative">
        <ConversationList
          activeChat={activeChat}
          conversations={conversations}
          loadingList={loadingList}
          currentUser={currentUser}
          onSelectConversation={onSelectConversation}
          onClose={onClose}
          getOnlineStatus={getOnlineStatus}
        />

        <ChatArea
          activeChat={activeChat}
          messages={messages}
          loadingChat={loadingChat}
          loadingMore={loadingMore}
          currentUser={currentUser}
          onSendMessage={onSendMessage}
          onBack={onBack}
          onClose={onClose}
          messagesEndRef={messagesEndRef}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
        />
      </div>
    </motion.div>
  )
}