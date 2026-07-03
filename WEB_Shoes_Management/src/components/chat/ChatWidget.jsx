import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'
import { chatApiService } from '~/services/chat/chatApiService'
import { DEV_API_URL } from '~/utils/constant'
import { formatLastActive, formatRelativeTime } from '~/utils/formatters'
import { ChatButton } from './ChatButton'
import { ChatModal } from './ChatModal'
import { useChat } from '~/contexts/ChatContext'
import { ROLE_ID } from '~/utils/constant'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'

let socket = null

export const ChatWidget = () => {
  const { isOpen: contextIsOpen, targetStore, closeChat, clearTargetStore } = useChat()
  const [localIsOpen, setLocalIsOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const currentUser = useSelector((state) => state.user.userInfo)

  const activeChatRef = useRef(activeChat)
  const conversationsRef = useRef(conversations)
  const socketInitialized = useRef(false)
  const isLoadingMoreRef = useRef(false)

  useEffect(() => {
    activeChatRef.current = activeChat
  }, [activeChat])

  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  const isOpen = contextIsOpen || localIsOpen

  // Lấy tổng số tin nhắn chưa đọc từ API
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !currentUser) return

    try {
      const conversationsData = await chatApiService.getConversationsList()
      const totalUnread = conversationsData.reduce((total, conv) => {
        return total + (conv.unread_count || 0)
      }, 0)
      setUnreadCount(totalUnread)
    } catch (error) {
      console.error('Lỗi lấy số tin nhắn chưa đọc:', error)
    }
  }, [isAuthenticated, currentUser])

  // Lấy số lượng chưa đọc khi component mount
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchUnreadCount()
    }
  }, [isAuthenticated, currentUser, fetchUnreadCount])

  // Lắng nghe sự kiện real-time từ chat
  useEffect(() => {
    const handleNewChatMessage = () => {
      fetchUnreadCount()
    }

    const handleMessagesRead = () => {
      fetchUnreadCount()
    }

    window.addEventListener('newChatMessage', handleNewChatMessage)
    window.addEventListener('messagesRead', handleMessagesRead)

    return () => {
      window.removeEventListener('newChatMessage', handleNewChatMessage)
      window.removeEventListener('messagesRead', handleMessagesRead)
    }
  }, [fetchUnreadCount])

  // Cập nhật badge khi focus lại tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchUnreadCount])

  // Khi đóng modal, reset activeChat
  useEffect(() => {
    if (!isOpen) {
      setActiveChat(null)
      setMessages([])
      closeChat()
    }
  }, [isOpen, closeChat])

  useEffect(() => {
    if (targetStore && isAuthenticated && conversations.length > 0 && currentUser) {
      const existingConv = conversations.find(conv =>
        conv.store_id === targetStore.storeId || conv.store_owner_id === targetStore.storeId
      )
      if (existingConv) {
        setActiveChat(existingConv)
      }
      clearTargetStore()
    }
  }, [targetStore, isAuthenticated, conversations, clearTargetStore, currentUser])

  // Khởi tạo Socket
  useEffect(() => {
    if (!isOpen || !isAuthenticated || !currentUser) return
    if (socketInitialized.current) return

    socketInitialized.current = true

    socket = io(DEV_API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socket.on('connect', () => {
      console.log('Socket đã kết nối')
    })

    socket.on('connect_error', (error) => {
      console.error('Lỗi kết nối Socket:', error.message)
      socketInitialized.current = false
    })

    socket.on('new_chat_message', (newMessage) => {
      console.log('Tin nhắn mới nhận:', newMessage)

      const currentConvId = activeChatRef.current?.conversation_id
      const isCurrentConversation = currentConvId === newMessage.conversation_id

      if (isCurrentConversation) {
        setMessages(prev => [...prev, newMessage])
        chatApiService.markAsRead(newMessage.conversation_id).catch(console.error)
        setConversations(prev => prev.map(conv =>
          conv.conversation_id === newMessage.conversation_id
            ? { ...conv, unread_count: 0 }
            : conv
        ))
      } else {
        setConversations(prev => prev.map(conv => {
          if (conv.conversation_id === newMessage.conversation_id) {
            return { ...conv, unread_count: (conv.unread_count || 0) + 1 }
          }
          return conv
        }))
      }

      // Cập nhật lại số lượng chưa đọc cho badge
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('newChatMessage'))
      }

      setConversations(prev => {
        const updatedConv = prev.find(c => c.conversation_id === newMessage.conversation_id)
        if (updatedConv) {
          const newList = prev.filter(c => c.conversation_id !== newMessage.conversation_id)
          return [{ ...updatedConv, updated_at: new Date().toISOString() }, ...newList]
        }
        return prev
      })
    })

    socket.on('user_online_status', ({ userId, isOnline, lastActive }) => {
      setConversations(prev => prev.map(conv => {
        const isUserClient = currentUser.id === conv.client_id
        if (isUserClient && conv.store_owner_id === userId) {
          return { ...conv, store_online: isOnline, store_last_active: lastActive }
        }
        if (!isUserClient && conv.client_id === userId) {
          return { ...conv, client_online: isOnline, client_last_active: lastActive }
        }
        return conv
      }))

      if (activeChatRef.current) {
        const isUserClient = currentUser.id === activeChatRef.current.client_id
        if (isUserClient && activeChatRef.current.store_owner_id === userId) {
          setActiveChat(prev => ({ ...prev, store_online: isOnline, store_last_active: lastActive }))
        }
        if (!isUserClient && activeChatRef.current.client_id === userId) {
          setActiveChat(prev => ({ ...prev, client_online: isOnline, client_last_active: lastActive }))
        }
      }
    })

    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
        socketInitialized.current = false
      }
    }
  }, [isOpen, isAuthenticated, currentUser])

  const fetchConversations = async () => {
    try {
      const data = await chatApiService.getConversationsList()
      console.log('Danh sách hội thoại đã tải:', data)
      setConversations(data)
    } catch (err) {
      console.error('Lỗi tải danh sách:', err)
    }
  }

  useEffect(() => {
    if (isOpen && isAuthenticated && currentUser) {
      setLoadingList(true)
      fetchConversations().finally(() => setLoadingList(false))
    }
  }, [isOpen, isAuthenticated, currentUser])

  // Tải tin nhắn lần đầu khi chọn hội thoại
  const loadInitialMessages = async (conversationId) => {
    setPage(1)
    setHasMore(true)
    setLoadingChat(true)
    try {
      const data = await chatApiService.getChatHistory(conversationId, 1, 20)
      console.log('Tin nhắn ban đầu đã tải:', data.length)
      setMessages(data)
      if (data.length < 20) {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err)
      toast.error('Không thể tải tin nhắn')
    } finally {
      setLoadingChat(false)
    }
  }

  // Tải thêm tin nhắn cũ hơn
  const loadMoreMessages = async () => {
    if (!activeChat) return
    if (isLoadingMoreRef.current) return
    if (!hasMore) return

    isLoadingMoreRef.current = true
    setLoadingMore(true)

    const nextPage = page + 1
    try {
      const data = await chatApiService.getChatHistory(activeChat.conversation_id, nextPage, 20)
      console.log('Tin nhắn cũ hơn đã tải:', data.length)

      if (data.length > 0) {
        setMessages(prev => [...data, ...prev])
        setPage(nextPage)
      }

      if (data.length < 20) {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Lỗi tải thêm tin nhắn:', err)
    } finally {
      setLoadingMore(false)
      isLoadingMoreRef.current = false
    }
  }

  useEffect(() => {
    if (activeChat) {
      loadInitialMessages(activeChat.conversation_id)
    }
  }, [activeChat])

  // Đánh dấu đã đọc khi chọn phòng chat
  useEffect(() => {
    if (activeChat && activeChat.unread_count > 0) {
      const markAsRead = async () => {
        try {
          await chatApiService.markAsRead(activeChat.conversation_id)
          setConversations(prev => prev.map(c =>
            c.conversation_id === activeChat.conversation_id ? { ...c, unread_count: 0 } : c
          ))

          // Dispatch sự kiện để badge cập nhật
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('messagesRead'))
          }
        } catch (error) {
          console.error('Lỗi đánh dấu đã đọc', error)
        }
      }
      markAsRead()
    }
  }, [activeChat])

  const handleSelectConversation = async (conv) => {
    setActiveChat(conv)
    if (conv.unread_count > 0) {
      try {
        await chatApiService.markAsRead(conv.conversation_id)
        setConversations(prev => prev.map(c =>
          c.conversation_id === conv.conversation_id ? { ...c, unread_count: 0 } : c
        ))
      } catch (error) {
        console.error('Lỗi đánh dấu đã đọc', error)
      }
    }
  }

  const handleSendMessage = async (messageText, selectedImage) => {
    if (!activeChat) return false

    const formData = new FormData()
    formData.append('storeId', activeChat.store_id)
    formData.append('content', messageText.trim())
    if (selectedImage) {
      formData.append('chatImages', selectedImage)
    }

    try {
      const result = await chatApiService.sendMessage(formData)
      setMessages(prev => [...prev, result])

      setConversations(prev => {
        const updatedConv = prev.find(c => c.conversation_id === activeChat.conversation_id)
        if (updatedConv) {
          const newList = prev.filter(c => c.conversation_id !== activeChat.conversation_id)
          return [{ ...updatedConv, updated_at: new Date().toISOString() }, ...newList]
        }
        return prev
      })

      return true
    } catch (error) {
      toast.error('Gửi tin nhắn thất bại')
      return false
    }
  }

  const handleToggleModal = () => {
    if (isOpen) {
      closeChat()
      setLocalIsOpen(false)
    } else {
      setLocalIsOpen(true)
    }
  }

  const handleCloseModal = () => {
    closeChat()
    setLocalIsOpen(false)
  }

  const getOnlineStatus = (conv) => {
    if (!currentUser) return { text: 'Đang tải...', isOnline: false, lastActiveText: null }

    const isUserClient = currentUser.id === conv.client_id
    const isOnline = isUserClient ? conv.store_online : conv.client_online
    const lastActive = isUserClient ? conv.store_last_active : conv.client_last_active

    if (isOnline) {
      return { text: 'Đang hoạt động', isOnline: true, lastActiveText: null }
    }
    return { text: formatLastActive(lastActive), isOnline: false, lastActiveText: formatRelativeTime(lastActive) }
  }

  if (!isAuthenticated || !currentUser || currentUser?.roleId !== ROLE_ID.USER) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <ChatModal
            activeChat={activeChat}
            conversations={conversations}
            messages={messages}
            loadingList={loadingList}
            loadingChat={loadingChat}
            loadingMore={loadingMore}
            currentUser={currentUser}
            onSelectConversation={handleSelectConversation}
            onSendMessage={handleSendMessage}
            onClose={handleCloseModal}
            onBack={() => setActiveChat(null)}
            onLoadMore={loadMoreMessages}
            hasMore={hasMore}
            getOnlineStatus={getOnlineStatus}
          />
        )}
      </AnimatePresence>

      <Tooltip>
        <TooltipTrigger asChild>
          <ChatButton
            isOpen={isOpen}
            onClick={handleToggleModal}
            unreadCount={unreadCount}
          />
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{isOpen ? 'Đóng chat' : 'Mở chat'}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}