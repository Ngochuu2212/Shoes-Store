import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

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

export const authGuard = {
  isAuthorized
}