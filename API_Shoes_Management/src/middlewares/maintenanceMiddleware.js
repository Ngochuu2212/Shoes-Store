import pool from '~/config/db'

export const checkMaintenance = async (req, res, next) => {
  try {
    // 1. Truy vấn real-time trạng thái bảo trì từ Database
    const [rows] = await pool.execute('SELECT is_maintenance, maintenance_message FROM system_settings WHERE id = 1')
    const settings = rows[0]

    // 2. SỬA ĐIỀU KIỆN CHẶN:
    // Nếu hệ thống đang bảo trì VÀ URL đang gọi tới KHÔNG BẮT ĐẦU bằng '/api/admin'
    if (settings && settings.is_maintenance === 1) {

      // Kiểm tra chính xác nếu URL chứa cụm '/api/admin' thì bỏ qua (cho Admin đi tiếp)
      if (req.originalUrl.includes('/api/admin') || req.originalUrl.includes('/api/auth')) {
        return next()
      }

      // Ngược lại, tất cả User và Vendor thường đều bị chặn đứng tại đây
      return res.status(503).json({
        message: 'Hệ thống đang bảo trì thiết lập',
        maintenanceMessage: settings.maintenance_message || 'Hệ thống đang được nâng cấp định kỳ, vui lòng quay lại sau ít phút.'
      })
    }

    next()
  } catch (error) {
    // Nếu lỗi kết nối DB hoặc lỗi truy vấn, cho qua để tránh sập toàn bộ App
    next()
  }
}