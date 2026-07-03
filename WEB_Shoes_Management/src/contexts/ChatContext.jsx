import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ChatContext = createContext(null)

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [targetStore, setTargetStore] = useState(null)
  const chatWidgetRef = useRef(null)

  const openChatWithStore = useCallback((storeId, storeName, prefillMessage = '') => {
    setTargetStore({ storeId, storeName, prefillMessage })
    setIsOpen(true)
  }, [])

  const closeChat = useCallback(() => {
    setIsOpen(false)
    setTargetStore(null)
  }, [])

  const clearTargetStore = useCallback(() => {
    setTargetStore(null)
  }, [])

  return (
    <ChatContext.Provider value={{
      isOpen,
      targetStore,
      openChatWithStore,
      closeChat,
      clearTargetStore
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}