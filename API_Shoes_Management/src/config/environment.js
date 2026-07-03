import 'dotenv/config'

export const env = {
  // Cấu hình Database
  APP_PORT: process.env.APP_PORT || 3000,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT || 3307,

  // Cấu hình Email
  BREVO_SMTP_USER: process.env.BREVO_SMTP_USER,
  BREVO_API_KEY: process.env.BREVO_API_KEY,

  // Cấu hình Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,

  // Cấu hình JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  // Câu hình thời gian hết hạn của Token
  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE,
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE,

  // Cấu hình Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Cấu hình VNPAY
  VNP_TMN_CODE: process.env.VNP_TMN_CODE,
  VNP_HASH_SECRET: process.env.VNP_HASH_SECRET,
  VNP_URL: process.env.VNP_URL,
  VNP_BACKEND_RETURN_URL: process.env.VNP_BACKEND_RETURN_URL,

  // URL gốc của Backend (dùng cho callback VNPAY / MoMo)
  BACKEND_URL: process.env.BACKEND_URL || process.env.VNP_BACKEND_RETURN_URL?.replace('/api/orders/vnpay-return', '') || 'http://localhost:3000',

  // Cấu hình MOMO
  MOMO_PARTNER_CODE: process.env.MOMO_PARTNER_CODE,
  MOMO_ACCESS_KEY: process.env.MOMO_ACCESS_KEY,
  MOMO_SECRET_KEY: process.env.MOMO_SECRET_KEY,
  MOMO_API_URL: process.env.MOMO_API_URL,
  MOMO_BACKEND_RETURN_URL: process.env.MOMO_BACKEND_RETURN_URL,

  FRONTEND_URL:process.env.FRONTEND_URL
}