import { authService } from '~/services/auth/authService'
import { env } from '~/config/environment.js'
import ms from 'ms'

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body)
    return res.status(200).json(result)
  } catch (error) {
    if (error.message.includes('Email này đã được sử dụng')) {
      return res.status(400).json({ message: error.message })
    }
    return res.status(500).json({ message: `Lỗi hệ thống đăng ký: ${error.message}` })
  }
}

const verifyOtp = async (req, res) => {
  try {
    const result = await authService.verifyOtp(req.body)
    return res.status(200).json(result)
  } catch (error) {

    const badRequests = [
      'Tài khoản không tồn tại',
      'đã được kích hoạt',
      'Mã OTP không chính xác',
      'Mã OTP của bạn đã hết hạn'
    ]

    const isBadRequest = badRequests.some(msg => error.message.includes(msg))
    if (isBadRequest) {
      return res.status(400).json({ message: error.message })
    }

    return res.status(500).json({ message: `Lỗi hệ thống xác thực OTP: ${error.message}` })
  }
}

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body)

    // Phân biệt môi trường
    const isProduction = process.env.NODE_ENV === 'production'

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    }

    // Đưa cả 2 token vào cookie
    res.cookie('accessToken', result.accessToken, { ...cookieOptions, maxAge: ms(env.JWT_ACCESS_EXPIRE) }) // 1 giờ
    res.cookie('refreshToken', result.refreshToken, { ...cookieOptions, maxAge: ms(env.JWT_REFRESH_EXPIRE) }) // 14 ngày

    // Trả về thông tin user và URL chuyển hướng cho Frontend lo phần giao diện
    return res.status(200).json({
      message: 'Đăng nhập thành công! Chào mừng bạn đã quay trở lại.',
      user: result.user,
      redirectUrl: result.redirectUrl,
      accessToken: result.accessToken
    })
  } catch (error) {
    if (error.message.includes('không chính xác') || error.message.includes('chưa được kích hoạt')) {
      return res.status(400).json({ message: error.message })
    }
    return res.status(500).json({ message: `Lỗi hệ thống đăng nhập: ${error.message}` })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng cung cấp Email của tài khoản' })
    }

    const result = await authService.forgotPassword(email)
    return res.status(200).json(result)
  } catch (error) {
    if (error.message.includes('không tồn tại')) {
      return res.status(400).json({ message: error.message })
    }
    return res.status(500).json({ message: `Lỗi hệ thống yêu cầu OTP: ${error.message}` })
  }
}

const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body)
    return res.status(200).json(result)
  } catch (error) {
    const badRequests = [
      'Tài khoản không tồn tại',
      'Mã OTP khôi phục mật khẩu không chính xác',
      'Mã OTP của bạn đã hết hạn'
    ]

    const isBadRequest = badRequests.some(msg => error.message.includes(msg))
    if (isBadRequest) {
      return res.status(400).json({ message: error.message })
    }

    return res.status(500).json({ message: `Lỗi hệ thống đặt lại mật khẩu: ${error.message}` })
  }
}

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh Token là bắt buộc để đăng xuất.' })
    }

    await authService.logout(refreshToken)

    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    }

    res.clearCookie('accessToken', cookieOptions)
    res.clearCookie('refreshToken', cookieOptions)

    return res.status(200).json({ message: 'Đăng xuất thành công!' })
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý đăng xuất: ${error.message}` })
  }
}

const refreshAccessToken = async (req, res) => {
  try {
    // Lấy refresh token từ cookie
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ message: 'Không tìm thấy refresh token. Vui lòng đăng nhập lại.' })
    }

    const result = await authService.refreshAccessToken(refreshToken)

    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    }

    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: ms(env.JWT_ACCESS_EXPIRE)
    })

    return res.status(200).json({
      message: 'Refresh token thành công!',
      accessToken: result.accessToken
    })
  } catch (error) {
    // Nếu refresh token không hợp lệ, xóa cookie
    if (error.message.includes('không hợp lệ') ||
        error.message.includes('hết hạn') ||
        error.message.includes('đã bị thu hồi')) {
      const isProduction = process.env.NODE_ENV === 'production'
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
      }
      res.clearCookie('accessToken', cookieOptions)
      res.clearCookie('refreshToken', cookieOptions)

      return res.status(401).json({ message: error.message })
    }
    return res.status(500).json({ message: `Lỗi hệ thống refresh token: ${error.message}` })
  }
}

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body
    if (!credential) {
      return res.status(400).json({ message: 'Vui lòng cung cấp Google credential' })
    }

    const result = await authService.googleLogin(credential)

    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    }

    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: ms(env.JWT_ACCESS_EXPIRE)
    })
    res.cookie('refreshToken', result.refreshToken, {
      ...cookieOptions,
      maxAge: ms(env.JWT_REFRESH_EXPIRE)
    })

    return res.status(200).json({
      message: 'Đăng nhập bằng Google thành công!',
      user: result.user,
      redirectUrl: result.redirectUrl,
      accessToken: result.accessToken
    })
  } catch (error) {
    if (error.message.includes('bị khóa') || error.message.includes('không hợp lệ')) {
      return res.status(400).json({ message: error.message })
    }
    return res.status(500).json({ message: `Lỗi đăng nhập Google: ${error.message}` })
  }
}

export const authController = {
  register,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  logout,
  refreshAccessToken,
  googleLogin
}