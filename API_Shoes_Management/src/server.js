import dns from 'dns'
dns.setDefaultResultOrder('ipv4first')

import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import { env } from '~/config/environment'
import { connectDB } from '~/config/db'

import { checkMaintenance } from '~/middlewares/maintenanceMiddleware'
import { SocketProvider } from '~/providers/SocketProvider'

// import UserRoutes
import { authRouter } from '~/routes/auth/authRoute'
import { userRouter } from '~/routes/user/userRoute'
import { categoryRouter } from '~/routes/user/categoryRoute'
import { productRouter } from '~/routes/user/productRoute'
import { cartRouter } from '~/routes/user/cartRoute'
import { orderRouter } from '~/routes/user/orderRoute'
import { promotionRouter } from '~/routes/user/promotionRoute'
import { storeRouter } from '~/routes/user/storeRoute'
import { attributeRouter } from '~/routes/user/attributeRoute'
import { walletRouter } from '~/routes/user/walletRoute'

// import VendorRoutes
import { vendorStoreRouter } from '~/routes/vendor/vendorStoreRoute'
import { vendorProductRouter } from '~/routes/vendor/vendorProductRoute'
import { vendorOrderRouter } from '~/routes/vendor/vendorOrderRoute'
import { vendorPromotionRouter } from '~/routes/vendor/vendorPromotionRoute'
import { vendorReviewRouter } from '~/routes/vendor/vendorReviewRoute'
import { vendorFavoriteRouter } from '~/routes/vendor/vendorFavoriteRoute'
import { vendorAnalyticsRouter } from '~/routes/vendor/vendorAnalyticsRoute'
import { vendorPayoutRouter } from '~/routes/vendor/vendorPayoutRoute'
import { vendorAppealRouter } from '~/routes/vendor/vendorAppealRoute'

// import ManagerRoutes
import { managerStoreRouter } from '~/routes/manager/managerStoreRoute'
import { managerProductRouter } from '~/routes/manager/managerProductRoute'
import { managerReviewRouter } from '~/routes/manager/managerReviewRoute'
import { managerAppealRouter } from '~/routes/manager/managerAppealRoute'
import { managerPromotionRouter } from '~/routes/manager/managerPromotionRoute'

// Định tuyến hệ thống API cho ADMIN (Quản trị viên)
import { adminUserRouter } from '~/routes/admin/adminUserRoute'
import { adminStoreRouter } from '~/routes/admin/adminStoreRoute'
import { adminCategoryRouter } from '~/routes/admin/adminCategoryRoute'
import { adminAttributeRouter } from '~/routes/admin/adminAttributeRoute'
import { adminFinancialRouter } from '~/routes/admin/adminFinancialRoute'
import { adminPayoutRouter } from '~/routes/admin/adminPayoutRoute'
import { adminSystemSettingRouter } from '~/routes/admin/systemSettingRoute'
import { adminOrderRouter } from '~/routes/admin/adminOrderRoute'

// Định tuyến hệ thống API cho CHAT và NOTIFICATION (Thời gian thực)
import { chatRouter } from '~/routes/chat/chatRoute'
import { notificationRouter } from '~/routes/notification/notificationRoute'

import { corsOptions } from '~/config/corsOptions'
import cookieParser from 'cookie-parser'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'

dotenv.config()

const START_SERVER = () => {
  const app = express()

  app.set('trust proxy', true)

  // Wrap Express app bằng http.createServer để tích hợp Socket.io
  const server = http.createServer(app)

  // Cấu hình middleware để đọc cookie từ request
  app.use(cookieParser())

  // Cấu hình CORS để cho phép Frontend (Vite) kết nối bảo mật sang Backend
  app.use(cors(corsOptions))

  // Cho phép Express đọc dữ liệu dạng JSON gửi lên từ req.body
  app.use(express.json())

  //Giúp giải mã dữ liệu text từ form-data (Postman/Frontend gửi lên)
  app.use(express.urlencoded({ extended: true }))

  app.use(checkMaintenance)

  // Định tuyến hệ thống API cho USER
  app.use('/api/auth', authRouter)
  app.use('/api/users', userRouter)
  app.use('/api/categories', categoryRouter)
  app.use('/api/products', productRouter)
  app.use('/api/carts', cartRouter)
  app.use('/api/orders', orderRouter)
  app.use('/api/promotions', promotionRouter)
  app.use('/api/stores', storeRouter)
  app.use('/api/attributes', attributeRouter)
  app.use('/api/wallet', walletRouter)

  // Định tuyến hệ thống API cho VENDOR (Cửa hàng)
  app.use('/api/vendor/stores', vendorStoreRouter)
  app.use('/api/vendor/products', vendorProductRouter)
  app.use('/api/vendor/orders', vendorOrderRouter)
  app.use('/api/vendor/promotions', vendorPromotionRouter)
  app.use('/api/vendor/reviews', vendorReviewRouter)
  app.use('/api/vendor/favorites', vendorFavoriteRouter)
  app.use('/api/vendor/analytics', vendorAnalyticsRouter)
  app.use('/api/vendor/payouts', vendorPayoutRouter)
  app.use('/api/vendor/appeals', vendorAppealRouter)

  // Định tuyến hệ thống API cho MANAGER (Quản lý)
  app.use('/api/manager/stores', managerStoreRouter)
  app.use('/api/manager/products', managerProductRouter)
  app.use('/api/manager/reviews', managerReviewRouter)
  app.use('/api/manager/appeals', managerAppealRouter)
  app.use('/api/manager/promotions', managerPromotionRouter)

  // Định tuyến hệ thống API cho ADMIN (Quản trị viên)
  app.use('/api/admin/users', adminUserRouter)
  app.use('/api/admin/stores', adminStoreRouter)
  app.use('/api/admin/categories', adminCategoryRouter)
  app.use('/api/admin/attributes', adminAttributeRouter)
  app.use('/api/admin/financial', adminFinancialRouter)
  app.use('/api/admin/payouts', adminPayoutRouter)
  app.use('/api/admin/system-settings', adminSystemSettingRouter)
  app.use('/api/admin/orders', adminOrderRouter)

  // Định tuyến hệ thống API cho CHAT & NOTIFICATION
  app.use('/api/chats', chatRouter)
  app.use('/api/notifications', notificationRouter)

  // Thêm middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // Khởi tạo Socket.io gắn kèm với HTTP Server
  SocketProvider.initSocket(server)

  // Khởi động Server Node.js lắng nghe trên Port từ file môi trường
  const port = env.APP_PORT || 8000

  // Sử dụng `server.listen` thay vì `app.listen` để Socket.io và API chạy chung 1 Port
  server.listen(port, () => {
    console.log(`Backend Shoes Store đang chạy tại http://localhost:${port}`)
  })
}

// 6. Thực thi luồng: Kết nối Database thành công rồi mới chính thức khởi động Server
(async () => {
  try {
    await connectDB()
    START_SERVER()
  } catch (error) {
    console.error('Khởi động Server thất bại:', error.message)
    process.exit(1)
  }
})()