import { env } from './environment'

// Danh sách các origin được phép - CHỈ domain của chính dự án
// (Không mở cho mọi *.vercel.app vì bất kỳ ai cũng deploy được trang lên Vercel rồi gọi API kèm cookie đăng nhập của nạn nhân)
const allowedOrigins = [
  'http://localhost:5173',
  'https://shoes-ecommerce-platform.vercel.app',
  'https://shoes-store-rouge-chi.vercel.app'
]

if (env.FRONTEND_URL) {
  allowedOrigins.push(env.FRONTEND_URL)
}

export const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép nếu không có origin (như Postman, server-to-server) hoặc nằm trong danh sách
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    } else {
      return callback(new Error('Not allowed by CORS'), false)
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}
