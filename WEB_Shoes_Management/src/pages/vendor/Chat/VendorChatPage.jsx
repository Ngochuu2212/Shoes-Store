import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'

import { chatApiService } from '~/services/chat/chatApiService'
import { DEV_API_URL } from '~/utils/constant'
import { formatLastActive, formatRelativeTime } from '~/utils/formatters'
import { VendorConversationList } from './VendorConversationList'
import { VendorChatArea } from './VendorChatArea'
import { usePageTitle } from '~/hooks/usePageTitle'

let socket = null

export const VendorChatPage = () => {
  usePageTitle(
    'Tin nhắn - Hỗ trợ khách hàng',
    'Quản lý tin nhắn và hỗ trợ khách hàng của cửa hàng'
  )
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const currentUser = useSelector((state) => state.user.userInfo)
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
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

  // Khoi tao Socket
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return
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
      console.log('Vendor Socket connected')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      socketInitialized.current = false
    })

    socket.on('new_chat_message', (newMessage) => {
      console.log('Vendor received:', newMessage)

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
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        setConversations(prev => prev.map(conv => {
          if (conv.conversation_id === newMessage.conversation_id) {
            return { ...conv, unread_count: (conv.unread_count || 0) + 1 }
          }
          return conv
        }))
      }

      // Cập nhật lại số lượng chưa đọc cho sidebar
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
        if (conv.client_id === userId) {
          return { ...conv, client_online: isOnline, client_last_active: lastActive }
        }
        return conv
      }))

      if (activeChatRef.current && activeChatRef.current.client_id === userId) {
        setActiveChat(prev => prev ? { ...prev, client_online: isOnline, client_last_active: lastActive } : prev)
      }
    })

    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
        socketInitialized.current = false
      }
    }
  }, [isAuthenticated, currentUser])

  const fetchConversations = async () => {
    try {
      const data = await chatApiService.getConversationsList()
      console.log('Conversations loaded:', data)
      setConversations(data)
    } catch (err) {
      console.error('Loi tai danh sach:', err)
    }
  }

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setLoadingList(true)
      fetchConversations().finally(() => setLoadingList(false))
    }
  }, [isAuthenticated, currentUser])

  // Load tin nhan lan dau khi chon conversation
  const loadInitialMessages = async (conversationId) => {
    setPage(1)
    setHasMore(true)
    setLoadingChat(true)
    try {
      const data = await chatApiService.getChatHistory(conversationId, 1, 20)
      console.log('Initial messages loaded:', data.length)
      setMessages(data)
      // Neu so tin nhan it hon 20 -> khong con tin nhan cu hon
      if (data.length < 20) {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error loading messages:', err)
      toast.error('Khong the tai tin nhan')
    } finally {
      setLoadingChat(false)
    }
  }

  // Load them tin nhan cu hon (khi cuon len dau trang)
  const loadMoreMessages = async () => {
    if (!activeChat) return
    if (isLoadingMoreRef.current) return
    if (!hasMore) return

    isLoadingMoreRef.current = true
    setLoadingMore(true)

    const nextPage = page + 1
    try {
      const data = await chatApiService.getChatHistory(activeChat.conversation_id, nextPage, 20)
      console.log('More messages loaded:', data.length)

      if (data.length > 0) {
        // Chen tin nhan cu vao dau mang (vi du: tin nhan 1-20)
        setMessages(prev => [...data, ...prev])
        setPage(nextPage)
      }

      if (data.length < 20) {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error loading more messages:', err)
    } finally {
      setLoadingMore(false)
      isLoadingMoreRef.current = false
    }
  }

  // Xu ly scroll de phat hien khi cuo len dau trang
  const handleScroll = useCallback((e) => {
    const container = e.target
    // Khi cuon len gan dau nhat (scrollTop <= 50px)
    if (container.scrollTop <= 50 && !loadingMore && hasMore && !loadingChat) {
      loadMoreMessages()
    }
  }, [loadingMore, hasMore, loadingChat])

  useEffect(() => {
    if (activeChat) {
      loadInitialMessages(activeChat.conversation_id)
    }
  }, [activeChat])

  useEffect(() => {
    if (messages.length > 0 && activeChat) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages, activeChat])

  // Đánh dấu đã đọc khi chọn phòng chat
  useEffect(() => {
    if (activeChat && activeChat.unread_count > 0) {
      const markAsRead = async () => {
        try {
          await chatApiService.markAsRead(activeChat.conversation_id)
          setConversations(prev => prev.map(c =>
            c.conversation_id === activeChat.conversation_id ? { ...c, unread_count: 0 } : c
          ))

          // Dispatch sự kiện để sidebar cập nhật badge
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('messagesRead'))
            console.log('Đã dispatch sự kiện messagesRead, badge sẽ được cập nhật')
          }
        } catch (error) {
          console.error('Loi khi danh dau da doc', error)
        }
      }
      markAsRead()
    }
  }, [activeChat])

  const handleSelectConversation = (conv) => {
    console.log('Selected conversation:', conv)
    setActiveChat(conv)
  }

  const handleSendMessage = async (messageText, selectedImage) => {
    if (!activeChat || !currentUser) return false

    const formData = new FormData()
    formData.append('userId', activeChat.client_id)
    formData.append('content', messageText.trim())
    if (selectedImage) {
      formData.append('chatImages', selectedImage)
    }

    try {
      const result = await chatApiService.sendMessage(formData)
      console.log('Message sent, result:', result)

      setMessages(prev => [...prev, result])

      setConversations(prev => {
        const updatedConv = prev.find(c => c.conversation_id === activeChat.conversation_id)
        if (updatedConv) {
          const newList = prev.filter(c => c.conversation_id !== activeChat.conversation_id)
          return [{ ...updatedConv, updated_at: new Date().toISOString() }, ...newList]
        }
        return prev
      })

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

      return true
    } catch (error) {
      toast.error('Gui tin nhan that bai')
      console.error(error)
      return false
    }
  }

  const getOnlineStatus = (conv) => {
    const isOnline = conv.client_online
    const lastActive = conv.client_last_active

    if (isOnline) {
      return { text: 'Dang hoat dong', isOnline: true, lastActiveText: null }
    }
    return { text: formatLastActive(lastActive), isOnline: false, lastActiveText: formatRelativeTime(lastActive) }
  }

  if (!isAuthenticated || !currentUser) return null

  return (
    <div className="h-[calc(100vh-120px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col"
      >
        <div className="flex-1 flex overflow-hidden w-full h-full">
          <VendorConversationList
            activeChat={activeChat}
            conversations={conversations}
            loadingList={loadingList}
            currentUser={currentUser}
            onSelectConversation={handleSelectConversation}
            getOnlineStatus={getOnlineStatus}
          />

          <VendorChatArea
            activeChat={activeChat}
            messages={messages}
            loadingChat={loadingChat}
            loadingMore={loadingMore}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onBack={() => setActiveChat(null)}
            onClose={() => setActiveChat(null)}
            messagesEndRef={messagesEndRef}
            onLoadMore={loadMoreMessages}
            hasMore={hasMore}
          />
        </div>
      </motion.div>
    </div>
  )
}