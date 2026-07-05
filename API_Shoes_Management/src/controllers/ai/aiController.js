import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '~/config/environment'
import pool from '~/config/db'
import axios from 'axios'

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
      model: 'gemini-2.5-flash',
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

const fileToGenerativePart = (buffer, mimeType) => {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType
    }
  }
}

const searchByImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng cung cấp hình ảnh sản phẩm cần tìm kiếm' })
    }

    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({ message: 'Hệ thống chưa được cấu hình GEMINI_API_KEY. Vui lòng liên hệ quản trị viên!' })
    }

    // 1. Chuyển đổi buffer hình ảnh sang định dạng Gemini SDK yêu cầu
    const imagePart = fileToGenerativePart(req.file.buffer, req.file.mimetype)

    // 2. Định nghĩa prompt phân tích ảnh để rút trích các từ khóa
    const prompt = 'Hãy phân tích hình ảnh đôi giày này và liệt kê các từ khóa mô tả về thương hiệu, kiểu dáng, màu sắc và loại giày. Chỉ trả về các từ khóa phân cách bằng dấu phẩy, không thêm bất kỳ văn bản giải thích nào khác. Ví dụ: sneaker, Nike, màu đỏ, cổ thấp'

    // 3. Gọi Gemini API
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent([prompt, imagePart])
    const keywordsText = result.response.text() || ''

    // 4. Tách các từ khóa thành mảng
    const keywords = keywordsText
      .split(',')
      .map(kw => kw.trim().toLowerCase())
      .filter(Boolean)

    if (keywords.length === 0) {
      return res.status(200).json({ products: [] })
    }

    // 5. Thực hiện câu lệnh truy vấn SQL xếp hạng sản phẩm dựa trên số lượng từ khóa trùng khớp
    let selectScore = ''
    const queryParams = []

    keywords.forEach((kw, index) => {
      selectScore += `(CASE WHEN LOWER(p.name) LIKE ? THEN 3 ELSE 0 END + CASE WHEN LOWER(p.description) LIKE ? THEN 1 ELSE 0 END)`
      if (index < keywords.length - 1) {
        selectScore += ' + '
      }
      queryParams.push(`%${kw}%`, `%${kw}%`)
    })

    const query = `
      SELECT 
        p.id, 
        p.store_id, 
        p.category_id, 
        p.name, 
        p.slug, 
        p.description, 
        p.price, 
        p.sold, 
        p.rating_avg, 
        p.view_count, 
        p.images,
        (${selectScore}) AS score
      FROM products p
      WHERE p.is_active = 1 AND p.status = 'approved'
      HAVING score > 0
      ORDER BY score DESC, p.sold DESC
      LIMIT 20
    `

    const [products] = await pool.execute(query, queryParams)

    return res.status(200).json({
      keywords,
      products
    })

  } catch (error) {
    console.error('Lỗi tìm kiếm sản phẩm bằng hình ảnh AI:', error)
    return res.status(500).json({
      message: `Đã xảy ra lỗi khi tìm kiếm hình ảnh AI: ${error.message}`
    })
  }
}

const analyzeTryOn = async (req, res) => {
  try {
    const { shoeImageUrl, productName } = req.body

    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng cung cấp hình ảnh chụp chân của bạn' })
    }
    if (!shoeImageUrl) {
      return res.status(400).json({ message: 'Vui lòng cung cấp hình ảnh đôi giày' })
    }

    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({ message: 'Hệ thống chưa được cấu hình GEMINI_API_KEY. Vui lòng liên hệ quản trị viên!' })
    }

    // 1. Chuyển đổi ảnh chân của người dùng sang định dạng Gemini SDK yêu cầu
    const footPart = fileToGenerativePart(req.file.buffer, req.file.mimetype)

    // 2. Tải ảnh giày từ URL và chuyển thành buffer
    let shoePart
    try {
      const response = await axios.get(shoeImageUrl, { responseType: 'arraybuffer' })
      const contentType = response.headers['content-type'] || 'image/jpeg'
      shoePart = fileToGenerativePart(Buffer.from(response.data), contentType)
    } catch (fetchError) {
      console.error('Lỗi khi tải ảnh giày từ URL:', fetchError.message)
      return res.status(400).json({ message: 'Không thể tải hình ảnh giày từ hệ thống' })
    }

    // 3. Gọi Gemini API
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
Bạn là một Trợ lý thời trang ảo chuyên nghiệp (AI Stylist Advisor) của cửa hàng giày dép ShoesStore.
Trước mặt bạn là hai hình ảnh:
1. Hình ảnh bàn chân của khách hàng đang tải lên.
2. Hình ảnh đôi giày "${productName || 'Giày thể thao cao cấp'}" mà họ đang ướm thử.

Hãy phân tích kỹ lưỡng hai hình ảnh và đưa ra phản hồi tư vấn phong cách thời trang cá nhân hóa bằng tiếng Việt bao gồm các ý sau:
1. **Nhận xét dáng chân & màu da**: Đánh giá dáng cổ chân, mu bàn chân (thô, thon, rộng...) và tông màu da của khách hàng có phù hợp với đôi giày này không (ví dụ: đôi giày tôn da sáng, hoặc kiểu dáng giày quai mảnh giúp cổ chân trông thon gọn hơn...).
2. **Đánh giá thẩm mỹ chung**: Điểm cộng và tính thẩm mỹ tổng quan khi khách hàng đi đôi giày này.
3. **Gợi ý phối đồ (Mix & Match)**: 
   - Đưa ra các gợi ý cụ thể về trang phục (như quần jeans, quần shorts, chân váy, váy đầm dạ hội...) và màu sắc quần áo phù hợp nhất để đi kèm với đôi giày này.
   - Gợi ý về loại tất/vớ đi kèm (nếu cần thiết).
   - Đưa ra lời khuyên về dịp thích hợp để diện set đồ này (đi học, đi làm, đi tiệc, hay dã ngoại...).

Hãy phản hồi bằng giọng điệu nhiệt tình, tinh tế, chia các phần rõ ràng bằng định dạng markdown (in đậm, danh sách) và sử dụng các emoji biểu cảm thích hợp (👟, ✨, 👗, 👖, 🌟). Tránh trả lời dài dòng không cần thiết.
`

    const result = await model.generateContent([prompt, footPart, shoePart])
    const review = result.response.text()

    return res.status(200).json({
      review
    })
  } catch (error) {
    console.error('Lỗi phân tích thử giày AI:', error)
    return res.status(500).json({
      message: `Đã xảy ra lỗi khi phân tích AI: ${error.message}`
    })
  }
}

const detectFeet = async (req, res) => {
  try {
    const { shoeImageUrl } = req.body
    
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng cung cấp hình ảnh chụp chân' })
    }
    if (!shoeImageUrl) {
      return res.status(400).json({ message: 'Vui lòng cung cấp hình ảnh giày' })
    }

    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({ message: 'Hệ thống chưa được cấu hình GEMINI_API_KEY.' })
    }

    // 1. Đọc ảnh chân của người dùng
    const footPart = fileToGenerativePart(req.file.buffer, req.file.mimetype)

    // 2. Tải ảnh giày và chuyển thành buffer
    let shoePart
    try {
      const response = await axios.get(shoeImageUrl, { responseType: 'arraybuffer' })
      const contentType = response.headers['content-type'] || 'image/jpeg'
      shoePart = fileToGenerativePart(Buffer.from(response.data), contentType)
    } catch (fetchError) {
      console.error('Lỗi tải ảnh giày phục vụ định vị:', fetchError.message)
      return res.status(400).json({ message: 'Không thể tải ảnh giày từ máy chủ' })
    }

    // 3. Gọi Gemini 2.5 Flash
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' } 
    })

    const prompt = `
You are an AI spatial reasoning assistant for an e-commerce virtual shoe try-on simulator.
You are given two images:
1. "foot_photo": A photo of a user's feet (could be shot from top-down or side view).
2. "shoe_photo": A photo of a shoe (usually side-profile).

Your task is to analyze the spatial orientation of the feet in the "foot_photo" and calculate the perfect transformation coordinates and scale to overlay the "shoe_photo" directly on top of ONE of the user's feet, making it look as if they are wearing the shoe.

Please follow these guidelines:
1. Locate the foot that is most clearly visible (prefer the right foot if both are visible, or whichever foot matches the shoe orientation best).
2. Identify the heel/ankle area and the toes area of that foot to understand the leg direction.
3. Compare the orientation of the shoe in "shoe_photo" (is the toe pointing left or right?) and the orientation of the foot in "foot_photo" (is the foot pointing up, left, right, or diagonal?).
4. Calculate the translation coordinates, rotation angle, and scale factor:
   - "x": The center X coordinate on the foot photo where the shoe's midfoot/arch should sit (on a scale of 0 to 1000, where 0 is the left edge and 1000 is the right edge of the foot photo).
   - "y": The center Y coordinate on the foot photo where the shoe's midfoot/arch should sit (on a scale of 0 to 1000, where 0 is the top edge and 1000 is the bottom edge of the foot photo).
   - "scale": The scale factor (usually between 0.5 to 1.8) relative to a default shoe UI width of 192px to make the shoe fit the foot size.
   - "rotation": The rotation angle in degrees (clockwise, e.g., -90, -45, 0, 45, 90) to align the shoe's sole with the foot's angle. (For example, if the foot points straight up but the shoe is horizontal pointing left, you may need to rotate it to point upwards).
   - "isFlipped": A boolean (true or false) indicating if the shoe needs to be flipped horizontally (scaleX = -1) to match the left/right direction of the foot.

Return your response strictly in the following JSON format:
{
  "x": number,
  "y": number,
  "scale": number,
  "rotation": number,
  "isFlipped": boolean
}
`

    const result = await model.generateContent([prompt, footPart, shoePart])
    const responseText = result.response.text()
    
    let parsed
    try {
      parsed = JSON.parse(responseText)
    } catch (parseErr) {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
      parsed = JSON.parse(cleaned)
    }

    return res.status(200).json(parsed)
  } catch (error) {
    console.error('Lỗi tự động định vị bàn chân bằng AI:', error)
    return res.status(500).json({
      message: `Lỗi AI định vị: ${error.message}`
    })
  }
}

export const aiController = {
  chatWithAI,
  searchByImage,
  analyzeTryOn,
  detectFeet
}
