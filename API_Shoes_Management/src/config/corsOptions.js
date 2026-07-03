import { env } from './environment'

export const corsOptions = {
  origin: function (origin, callback) {
    // Danh sách các origin được phép
    const allowedOrigins = [
      'http://localhost:5173',
      'https://shoes-ecommerce-platform.vercel.app'
    ]

    if (env.FRONTEND_URL) {
      allowedOrigins.push(env.FRONTEND_URL)
    }

    // Cho phép nếu không có origin (như Postman) hoặc nằm trong danh sách
    // Hoặc là bất kỳ tên miền nào từ Vercel (*.vercel.app)
    const isVercelDomain = origin && origin.endsWith('.vercel.app')

    if (!origin || allowedOrigins.includes(origin) || isVercelDomain) {
      return callback(null, true)
    } else {
      return callback(new Error('Not allowed by CORS'), false)
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}