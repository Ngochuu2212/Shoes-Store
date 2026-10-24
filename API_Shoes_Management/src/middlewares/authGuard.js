import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import { userModel } from '~/models/user/userModel'

const isAuthorized = (req, res, next) => {
  // Lấy token từ trong Cookie ra
  const accessToken = req.cookies?.accessToken

  if (!accessToken) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' })
  }

  try {
    // Sử dụng hàm verifyToken có sẵn trong JwtProvider để giải mã
    const decodedUserInfo = JwtProvider.verifyToken(accessToken, env.JWT_ACCESS_SECRET)

    // Giải mã thành công -> Găm thông tin user (id, email, roleId) vào req.jwtDecoded
    // Để các tầng tiếp theo như Controller hay Service có thể bốc ra dùng (req.jwtDecoded.id)
    req.jwtDecoded = decodedUserInfo

    next()
  } catch (error) {
    // Nếu token bị sai, bị sửa đổi hoặc đã hết hạn (quá 1 giờ)
    return res.status(401).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!' })
  }
}

// Phân quyền theo vai trò - Bắt buộc đặt SAU isAuthorized
// Role được đọc lại từ DB thay vì tin roleId trong token, vì role có thể đổi sau khi token được cấp
// (VD: User được duyệt mở shop thành Vendor, hoặc Admin hạ quyền / khóa tài khoản)
const authorizeRoles = (...allowedRoles) => async (req, res, next) => {
  try {
    const user = await userModel.getLoginUserById(req.jwtDecoded?.id)

    if (!user || Number(user.is_active) !== 1) {
      return res.status(403).json({ message: 'Tài khoản của bạn không tồn tại hoặc đã bị khóa.' })
    }

    if (!allowedRoles.includes(Number(user.role_id))) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này!' })
    }

    req.jwtDecoded.roleId = Number(user.role_id)
    next()
  } catch (error) {
    return res.status(500).json({ message: `Lỗi kiểm tra quyền truy cập: ${error.message}` })
  }
}

export const authGuard = {
  isAuthorized,
  authorizeRoles
}