import { chatService } from '~/services/chat/chatService'

const sendMessage = async (req, res) => {
  try {
    const senderId = req.jwtDecoded?.id
    const { storeId, userId, content } = req.body
    let result

    // Nếu có userId -> vendor (chủ shop) gửi cho khách hàng
    if (userId) {
      result = await chatService.sendMessageToUser(senderId, Number(userId), content, req.files)
    }
    // Nếu có storeId -> khách hàng gửi cho shop
    else if (storeId) {
      result = await chatService.sendMessage(senderId, Number(storeId), content, req.files)
    }
    else {
      throw new Error('Thiếu thông tin người nhận (userId hoặc storeId)')
    }

    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý gửi tin nhắn: ${error.message}` })
  }
}

const getChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.params
    const result = await chatService.getChatHistory(Number(conversationId), req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải lịch sử chat: ${error.message}` })
  }
}

const getConversationsList = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await chatService.getConversationsList(userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh mục phòng chat: ${error.message}` })
  }
}

const markAsRead = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { conversationId } = req.params
    await chatService.markAsRead(Number(conversationId), userId)
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ message: `Lỗi đánh dấu đã đọc: ${error.message}` })
  }
}

const initConversation = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { storeId } = req.body
    const result = await chatService.initConversation(userId, Number(storeId))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khởi tạo phòng chat: ${error.message}` })
  }
}

export const chatController = {
  sendMessage,
  getChatHistory,
  getConversationsList,
  markAsRead,
  initConversation
}