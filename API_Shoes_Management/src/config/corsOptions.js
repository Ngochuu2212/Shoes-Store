export const corsOptions = {
  origin: function (origin, callback) {
    // Danh sách các origin được phép
    const allowedOrigins = [
      'http://localhost:5173',
      'https://shoes-ecommerce-platform.vercel.app'
      // Thêm các domain khác nếu cần
    ]

    // Nếu không có origin (ví dụ: Postman, curl) hoặc origin được phép
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    } else {
      return callback(new Error('Not allowed by CORS'), false)
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}