import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageSquare, FiX, FiSend, FiZap, FiUser, FiCpu } from 'react-icons/fi'
import { aiApiService } from '~/services/ai/aiApiService'
import { toast } from 'react-toastify'

const QUICK_SUGGESTIONS = [
  'Giày nào bán chạy nhất? 👟',
  'Chính sách đổi trả hàng? 🔄',
  'Thông tin liên hệ ShoesStore? 📞',
  'Hướng dẫn mua hàng? 🛒'
]

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Xin chào! Tôi là Trợ lý ảo AI của ShoesStore. 👟 Tôi có thể giúp gì cho bạn hôm nay? Bạn có thể hỏi tôi về các sản phẩm bán chạy, chính sách đổi trả hoặc thông tin hỗ trợ nhé!'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (textToSend) => {
    const msg = textToSend || input
    if (!msg.trim()) return

    if (!textToSend) setInput('')

    // Thêm tin nhắn của User vào danh sách
    const newMessages = [...messages, { role: 'user', text: msg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      // Chuẩn bị lịch sử hội thoại cho Gemini (loại bỏ tin nhắn chào đầu tiên và chỉ gửi tối đa 10 tin nhắn gần nhất để tối ưu token)
      const chatHistory = newMessages.slice(1, -1) // Không gửi tin nhắn cuối cùng (user đang hỏi) và tin chào đầu tiên
      
      const response = await aiApiService.chat(msg, chatHistory)
      
      if (response && response.reply) {
        setMessages(prev => [...prev, { role: 'model', text: response.reply }])
      } else {
        throw new Error('Không nhận được câu trả lời từ AI')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể kết nối với Trợ lý ảo AI!')
      setMessages(prev => [
        ...prev,
        { role: 'model', text: 'Xin lỗi bạn, kết nối của tôi đang bị gián đoạn. Vui lòng thử lại sau giây lát nhé! 😢' }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      {/* Bong bóng Chat nổi */}
      <motion.button
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-200/50 hover:shadow-xl focus:outline-none cursor-pointer relative"
      >
        {isOpen ? <FiX size={22} /> : <FiMessageSquare size={22} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white text-[8px] font-bold text-white flex items-center justify-center">1</span>
          </span>
        )}
      </motion.button>

      {/* Khung hội thoại Chatbot */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                  <FiCpu size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    Trợ Lý Ảo ShoesStore
                    <FiZap size={12} className="animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-orange-50 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Hoạt động 24/7</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-xl hover:bg-white/20 transition-colors text-white cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Danh sách tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg, index) => {
                const isModel = msg.role === 'model'
                return (
                  <div key={index} className={`flex items-start gap-2.5 ${!isModel ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                      isModel 
                        ? 'bg-orange-50 border-orange-100 text-orange-500' 
                        : 'bg-white border-gray-200 text-gray-500'
                    }`}>
                      {isModel ? <FiCpu size={14} /> : <FiUser size={14} />}
                    </div>

                    {/* Nội dung */}
                    <div className="max-w-[75%]">
                      <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        isModel 
                          ? 'bg-white text-gray-700 shadow-sm border border-gray-100/50' 
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-100'
                      }`}>
                        <p className="whitespace-pre-line break-words">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Hiệu ứng đang gõ chữ */}
              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                    <FiCpu size={14} />
                  </div>
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Gợi ý câu hỏi nhanh */}
            {messages.length === 1 && !loading && (
              <div className="p-3 bg-gray-50/50 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 px-1">Gợi ý câu hỏi nhanh</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sug)}
                      className="text-[11px] font-medium bg-white text-gray-600 border border-gray-250/50 rounded-xl px-3 py-1.5 hover:border-orange-400 hover:text-orange-500 transition-colors shadow-sm cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer nhập dữ liệu */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 bg-gray-50 border border-gray-250/50 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-orange-400 transition-colors"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm shadow-orange-100"
              >
                <FiSend size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
