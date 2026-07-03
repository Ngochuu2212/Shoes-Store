import rateLimit from 'express-rate-limit'

const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    message: 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 10 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

const validateRegister = (req, res, next) => {
  const { email, password, fullname, phone, address } = req.body

  if (!email || !password || !fullname || !phone || !address) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin: fullname, email, password, phone, address' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Định dạng Email không hợp lệ' })
  }

  const phoneRegex = /^0[0-9]{9}$/
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: 'Số điện thoại không hợp lệ. Phải bắt đầu bằng số 0 và có đúng 10 chữ số' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  }

  next()
}

const validateVerifyOtp = (req, res, next) => {
  const { email, otpCode } = req.body

  if (!email || !otpCode) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ email và otpCode' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Định dạng Email không hợp lệ' })
  }

  // OTP gồm 6 chữ số
  if (otpCode.length !== 6) {
    return res.status(400).json({ message: 'Mã OTP phải bao gồm đúng 6 chữ số' })
  }

  next()
}

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 5 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Validate dữ liệu đăng nhập đầu vào
const validateLogin = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ email và mật khẩu' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Định dạng Email không hợp lệ' })
  }

  if (password.trim().length === 0) {
    return res.status(400).json({ message: 'Mật khẩu không được để trống hoặc chỉ chứa khoảng trắng' })
  }

  next()
}

const validateResetPassword = (req, res, next) => {
  const { email, otpCode, password } = req.body

  if (!email || !otpCode || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ: email, otpCode và mật khẩu mới' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Định dạng Email không hợp lệ' })
  }

  if (otpCode.length !== 6) {
    return res.status(400).json({ message: 'Mã OTP phải bao gồm đúng 6 chữ số' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải chứa ít nhất 6 ký tự' })
  }

  if (password.trim().length === 0) {
    return res.status(400).json({ message: 'Mật khẩu mới không được chỉ chứa khoảng trắng' })
  }

  next()
}

export const authMiddleware = {
  registerLimiter,
  validateRegister,
  validateVerifyOtp,
  loginLimiter,
  validateLogin,
  validateResetPassword
}