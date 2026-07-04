import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '~/config/environment'
import pool from '~/config/db'

const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body

    if (!message) {
      return res.status(400).json({ message: 'Tin nhắn không được để trống' })
    }

    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({ message: 'Hệ thống chưa được cấu hình GEMINI_API_KEY. Vui lòng liên hệ quản trị viên!' })
    }

    // 1. Lấy danh sách sản phẩm thực tế từ DB để cung cấp ngữ cảnh sản phẩm cho AI tư vấn
    let productsText = ''
    try {
      const [products] = await pool.execute(
        "SELECT id, name, price, rating_avg, sold FROM products WHERE is_active = 1 AND status = 'approved' ORDER BY sold DESC LIMIT 25"
      )
      productsText = products
        .map(p => `- Giày: ${p.name} (Mã đơn vị: #${p.id}) | Giá: ${parseFloat(p.price).toLocaleString('vi-VN')}đ | Đánh giá: ${p.rating_avg || 5}⭐ | Đã bán: ${p.sold || 0}`)
        .join('\n')
    } catch (dbError) {
      console.error('Lỗi lấy danh sách sản phẩm cho AI Context:', dbError)
      productsText = 'Không thể kết nối danh sách sản phẩm tại thời điểm này.'
    }

    // 2. Tạo Prompt chỉ dẫn hệ thống
    const systemInstruction = `
Bạn là Trợ lý ảo AI thông minh, nhiệt huyết và vô cùng thân thiện của hệ thống thương mại điện tử giày dép ShoesStore.
Nhiệm vụ chính của bạn là hỗ trợ khách hàng tư vấn chọn mẫu giày, chọn size, hướng dẫn đặt mua hàng, giải đáp các thắc mắc về chính sách và liên hệ CSKH.

Thông tin hệ thống ShoesStore:
- Địa chỉ: 47 đường số 3, Cát Lái, HCM.
- Số điện thoại hỗ trợ hotline: 0939507217
- Email hỗ trợ chính thức: phamngochuu3101@gmail.com
- Chính sách đổi trả hàng: ShoesStore hỗ trợ đổi trả miễn phí trong vòng 7 ngày kể từ khi khách nhận hàng thành công. Điều kiện đổi trả là sản phẩm phải còn nguyên vẹn tem mác, chưa qua sử dụng và bị lỗi từ phía nhà sản xuất hoặc do shop giao sai mẫu mã/kích thước.
- Các phương thức thanh toán hỗ trợ: COD (Thanh toán tiền mặt khi nhận hàng), VNPAY (Thanh toán qua cổng VNPAY), MoMo (Ví MoMo), và thanh toán tự động trừ số dư từ ví cá nhân của người dùng trên web.
- Các bước đặt hàng trên hệ thống:
  1. Vào danh sách sản phẩm, chọn đôi giày yêu thích và chọn kích cỡ (size) phù hợp rồi thêm vào Giỏ hàng.
  2. Bấm vào icon Giỏ hàng ở góc phải màn hình, kiểm tra lại danh sách rồi bấm "Thanh toán".
  3. Điền đầy đủ thông tin người nhận (Tên, địa chỉ, sđt) và chọn phương thức thanh toán tương ứng.
  4. Bấm "Xác nhận đặt hàng".

Danh sách các sản phẩm giày bán chạy đang có trên ShoesStore để bạn gợi ý khi khách muốn tìm hoặc mua giày:
${productsText}

Chỉ dẫn phong cách trả lời:
- Luôn thân thiện, chuyên nghiệp, súc tích và sử dụng các emoji phù hợp (👟, 🛒, 📍, 📞, ✉️, v.v.).
- Trả lời bằng tiếng Việt tự nhiên và trôi chảy.
- Khi khách hỏi tìm giày, hãy tư vấn dựa trên danh sách trên và đưa ra lời khuyên phù hợp (ví dụ: khuyên chọn đúng size, phối đồ thế nào).
- Nếu khách hỏi những câu không liên quan đến ShoesStore hoặc giày dép (ví dụ: viết code, làm toán, thơ ca, các tin tức xã hội không liên quan), hãy khéo léo từ chối và hướng cuộc trò chuyện quay lại chủ đề mua sắm giày dép hoặc dịch vụ của ShoesStore.
`

    // 3. Gọi Gemini API
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction
    })

    // Định dạng lại lịch sử chat tương thích với cấu trúc của Gemini SDK
    // Cấu trúc mong muốn: [ { role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] } ]
    const geminiHistory = (history || []).map(turn => ({
      role: turn.role === 'user' ? 'user' : 'model',
      parts: [{ text: turn.text || turn.parts?.[0]?.text || '' }]
    }))

    const chat = model.startChat({
      history: geminiHistory
    })

    const result = await chat.sendMessage(message)
    const replyText = result.response.text()

    return res.status(200).json({
      reply: replyText
    })

  } catch (error) {
    console.error('Lỗi gọi Gemini API:', error)
    return res.status(500).json({
      message: `Đã xảy ra lỗi khi trò chuyện với AI: ${error.message}`
    })
  }
}

export const aiController = {
  chatWithAI
}
