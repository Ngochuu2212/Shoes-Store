import { chatModel } from '~/models/chat/chatModel'
import { SocketProvider } from '~/providers/SocketProvider'

// USER gửi tin nhắn cho SHOP (dùng storeId)
const sendMessage = async (senderId, storeId, content, imageFiles) => {
  const conversationId = await chatModel.getOrCreateConversation(senderId, storeId)

  let images = []
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach(file => {
      images.push({ public_id: file.filename, secure_url: file.path })
    })
  }

  const messageId = await chatModel.saveMessage(conversationId, senderId, content, images)

  const info = await chatModel.getConversationInfoById(conversationId)
  const storeOwnerId = await chatModel.getStoreOwnerId(info.store_id)

  // Xác định người nhận: nếu sender là user (khách) thì receiver là shop owner
  const receiverId = senderId === info.user_id ? storeOwnerId : info.user_id

  // FIX: Trả về snake_case để đồng bộ với DB
  const messageData = {
    id: messageId,
    conversation_id: conversationId,
    sender_id: senderId,
    content: content,
    images: images,
    created_at: new Date()
  }

  SocketProvider.emitToUser(receiverId, 'new_chat_message', messageData)

  return messageData
}

// VENDOR gửi tin nhắn cho USER (khách hàng)
const sendMessageToUser = async (senderId, userId, content, imageFiles) => {
  // Lấy store_id từ senderId (vì sender là vendor - chủ shop)
  const store = await chatModel.getStoreByOwnerId(senderId)
  if (!store) throw new Error('Không tìm thấy cửa hàng của bạn')

  // Tìm hoặc tạo conversation giữa user (khách) và store (shop)
  const conversationId = await chatModel.getOrCreateConversation(userId, store.id)

  let images = []
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach(file => {
      images.push({ public_id: file.filename, secure_url: file.path })
    })
  }

  const messageId = await chatModel.saveMessage(conversationId, senderId, content, images)

  // FIX: Trả về snake_case để đồng bộ với DB
  const messageData = {
    id: messageId,
    conversation_id: conversationId,
    sender_id: senderId,
    content: content,
    images: images,
    created_at: new Date()
  }

  // Bắn socket cho user (khách hàng)
  SocketProvider.emitToUser(userId, 'new_chat_message', messageData)

  return messageData
}

const getChatHistory = async (conversationId, queryParams) => {
  const page = Number(queryParams.page) || 1
  const limit = Number(queryParams.limit) || 20
  const offset = (page - 1) * limit
  return await chatModel.getMessagesByConversation(conversationId, limit, offset)
}

const getConversationsList = async (userId) => {
  return await chatModel.getConversationsList(userId)
}

const markAsRead = async (conversationId, userId) => {
  await chatModel.markMessagesAsRead(conversationId, userId)
  return { success: true }
}

const initConversation = async (userId, storeId) => {
  const conversationId = await chatModel.getOrCreateConversation(userId, storeId)
  return { conversationId, message: 'Khởi tạo phòng chat thành công' }
}

export const chatService = {
  sendMessage,
  sendMessageToUser,
  getChatHistory,
  getConversationsList,
  markAsRead,
  initConversation
}