import bcrypt from 'bcrypt'
import axios from 'axios'
import { userModel } from '~/models/user/userModel'
import { EmailProvider } from '~/providers/EmailProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { ROLE_ID } from '~/utils/constants'
import { env } from '~/config/environment'
import generateOTP from '~/utils/otpGenerator'

const register = async (bodyData) => {
  const { fullname, email, password, phone, address } = bodyData

  // 1. Kiểm tra trùng lặp email
  const existingUser = await userModel.findByEmail(email)
  if (existingUser) {
    throw new Error('Email này đã được sử dụng đăng ký tài khoản khác')
  }

  // 2. Mã hóa mật khẩu
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // 3. Sử dụng hàm generateOTP có sẵn từ utils và set thời gian hết hạn (5 phút)
  const otpCode = generateOTP()
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
  const roleId = ROLE_ID.USER

  // 4. Lưu thông tin vào Database qua Model
  await userModel.createPendingUser({
    fullname,
    email,
    password: hashedPassword,
    phone,
    address,
    otpCode,
    otpExpiry,
    roleId
  })

  const htmlContent = `
    <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eef2f5;">
      <h2 style="color: #e94560; text-align: center;">KÍCH HOẠT TÀI KHOẢN SHOES STORE 👑</h2>
      <p>Chào <b>${fullname}</b>,</p>
      <p>Cảm ơn bạn đã đăng ký thành viên. Mã OTP để xác thực kích hoạt tài khoản của bạn là:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 5px; background: #f6f9fc; padding: 10px 25px; border-radius: 8px;">
          ${otpCode}
        </span>
      </div>
      <p style="color: #808080; font-size: 13px;">* Lưu ý: Mã OTP này có hiệu lực trong vòng 5 phút.</p>
    </div>
  `

  // 6. Gửi Mail chứa OTP
  await EmailProvider.sendEmail(email, 'Mã kích hoạt tài khoản Shoes Store của bạn', htmlContent)

  return { message: 'Mã OTP kích hoạt đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư!' }
}

const verifyOtp = async (data) => {
  const { email, otpCode } = data

  // 1. Lấy thông tin OTP của user từ Database
  const user = await userModel.getOtpInfo(email)
  if (!user) {
    throw new Error('Tài khoản không tồn tại trên hệ thống')
  }

  // 2. Nếu tài khoản đã được kích hoạt trước đó rồi thì không cần làm lại
  if (user.is_active === 1) {
    throw new Error('Tài khoản này đã được kích hoạt thành công từ trước')
  }

  // 3. Kiểm tra xem mã OTP gửi lên có khớp với mã lưu trong DB không
  if (user.otp_code !== otpCode) {
    throw new Error('Mã OTP không chính xác. Vui lòng kiểm tra lại')
  }

  // 4. Kiểm tra mã OTP còn trong thời hạn sử dụng hay không
  const now = new Date()
  if (now > new Date(user.otp_expiry)) {
    throw new Error('Mã OTP của bạn đã hết hạn. Vui lòng yêu cầu gửi lại mã mới')
  }

  // 5. Mọi thứ hợp lệ -> Kích hoạt trạng thái tài khoản thành công
  await userModel.activateUser(email)

  return { message: 'Kích hoạt tài khoản thành công! Bạn hiện đã có thể đăng nhập vào hệ thống.' }
}

const login = async (reqBody) => {
  const { email, password } = reqBody

  // 1. Kiểm tra tài khoản có tồn tại không
  const user = await userModel.getLoginUser(email)
  if (!user) {
    throw new Error('Email hoặc mật khẩu không chính xác')
  }

  // 2. Kiểm tra trạng thái kích hoạt / bị khóa của tài khoản
  if (user.is_active === 0) {
    if (user.is_verified === 0) {
      throw new Error('Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực OTP trước!')
    } else {
      throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết!')
    }
  }

  // 3. So sánh mật khẩu client gửi lên với mật khẩu đã hash trong DB
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('Email hoặc mật khẩu không chính xác')
  }

  // 4. Tạo mã bọc thông tin payload (Nên bỏ password ra để bảo mật)
  const userInfo = {
    id: user.id,
    email: user.email,
    roleId: user.role_id
  }

  // 5. Ký cấp cặp Token thông qua JwtProvider của bạn
  const accessToken = JwtProvider.generateToken(userInfo, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRE)
  const refreshToken = JwtProvider.generateToken(userInfo, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRE)

  // 6. Lưu Refresh Token xuống Database
  await userModel.updateRefreshToken(user.id, refreshToken)

  // 7. Xử lý phân quyền điều hướng URL theo đúng yêu cầu của bạn
  let redirectUrl = '/'
  if (user.role_id === ROLE_ID.ADMIN) {
    redirectUrl = '/admin/dashboard'
  } else if (user.role_id === ROLE_ID.MANAGER) {
    redirectUrl = '/manager/stores'
  } else if (user.role_id === ROLE_ID.VENDOR) {
    redirectUrl = '/vendor/dashboard'
  } else if (user.role_id === ROLE_ID.SHIPPER) {
    redirectUrl = '/shipper/dashboard'
  }

  // Trả về dữ liệu sạch và cặp token để Controller bỏ vào Cookie
  return {
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      address: user.address,
      roleId: user.role_id,
      avatar: user.avatar,
      isActive: user.is_active,
      isVerified: user.is_verified
    },
    accessToken,
    refreshToken,
    redirectUrl
  }
}

const forgotPassword = async (email) => {
  // 1. Kiểm tra tài khoản có tồn tại trên hệ thống hay không
  const user = await userModel.findByEmail(email)
  if (!user) {
    throw new Error('Email này không tồn tại trên hệ thống của cửa hàng')
  }

  // 2. Tạo mã OTP mới và thiết lập thời gian hết hạn là 5 phút
  const otpCode = generateOTP()
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

  // 3. Gọi Model cập nhật mã OTP quên mật khẩu này vào dòng dữ liệu của user
  await userModel.updateForgotPasswordOtp(email, otpCode, otpExpiry)

  const htmlContent = `
    <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eef2f5;">
      <h2 style="color: #e94560; text-align: center;">YÊU CẦU KHÔI PHỤC MẬT KHẨU 👟</h2>
      <p>Chào bạn,</p>
      <p>Hệ thống Shoes Store nhận được yêu cầu lấy lại mật khẩu từ bạn. Mã OTP để xác thực khôi phục mật khẩu của bạn là:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 5px; background: #f6f9fc; padding: 10px 25px; border-radius: 8px;">
          ${otpCode}
        </span>
      </div>
      <p style="color: #808080; font-size: 13px;">* Lưu ý: Mã OTP này có hiệu lực khôi phục trong vòng 5 phút. Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>
    </div>
  `

  await EmailProvider.sendEmail(email, 'Mã OTP khôi phục mật khẩu Shoes Store của bạn', htmlContent)

  return { message: 'Mã OTP khôi phục mật khẩu đã được gửi thành công tới Email của bạn!' }
}

const resetPassword = async (data) => {
  const { email, otpCode, password } = data

  // 1. Kiểm tra tài khoản và lấy thông tin OTP từ Database
  const user = await userModel.getOtpInfo(email)
  if (!user) {
    throw new Error('Tài khoản không tồn tại trên hệ thống')
  }

  // 2. Kiểm tra xem mã OTP gửi lên có khớp với mã lưu trong DB không
  if (user.otp_code !== otpCode) {
    throw new Error('Mã OTP khôi phục mật khẩu không chính xác')
  }

  // 3. Kiểm tra mã OTP còn trong thời hạn sử dụng hay không
  const now = new Date()
  if (now > new Date(user.otp_expiry)) {
    throw new Error('Mã OTP của bạn đã hết hạn. Vui lòng yêu cầu lại mã mới')
  }

  // 4. Mọi thứ hợp lệ -> Tiến hành mã hóa (Hash) mật khẩu mới của người dùng
  const salt = await bcrypt.genSalt(8)
  const hashedPassword = await bcrypt.hash(password, salt)

  // 5. Gọi model lưu mật khẩu mới và hủy OTP đi để tránh dùng lại lần 2
  await userModel.updateNewPassword(email, hashedPassword)

  return { message: 'Đặt lại mật khẩu thành công! Bạn đã có thể dùng mật khẩu mới này để đăng nhập vào Shoes Store.' }
}

const logout = async (refreshToken) => {
  // Thực hiện logic xóa hoặc cập nhật trạng thái token dưới DB
  await userModel.removeRefreshToken(refreshToken)
}

const refreshAccessToken = async (refreshToken) => {
  try {
    // 1. Xác thực refresh token
    const decoded = JwtProvider.verifyToken(refreshToken, env.JWT_REFRESH_SECRET)

    if (!decoded || !decoded.id) {
      throw new Error('Refresh token không hợp lệ.')
    }

    // 2. Lấy thông tin user
    const user = await userModel.getLoginUserById(decoded.id)
    if (!user) {
      throw new Error('Người dùng không tồn tại.')
    }

    // 3. Kiểm tra refresh token có khớp với token trong DB không - Sử dụng Model
    const isValid = await userModel.verifyRefreshToken(decoded.id, refreshToken)
    if (!isValid) {
      throw new Error('Refresh token không hợp lệ hoặc đã bị thu hồi.')
    }

    // 4. Tạo access token mới
    const userInfo = {
      id: user.id,
      email: user.email,
      roleId: user.role_id
    }

    const newAccessToken = JwtProvider.generateToken(
      userInfo,
      env.JWT_ACCESS_SECRET,
      env.JWT_ACCESS_EXPIRE
    )

    return { accessToken: newAccessToken }
  } catch (error) {
    if (error.message.includes('jwt expired')) {
      throw new Error('Refresh token đã hết hạn. Vui lòng đăng nhập lại.')
    }
    if (error.message.includes('invalid token')) {
      throw new Error('Refresh token không hợp lệ. Vui lòng đăng nhập lại.')
    }
    throw error
  }
}

const googleLogin = async (accessToken) => {
  // 1. Xác minh access token bằng Google UserInfo API
  let googleUser
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    googleUser = response.data
  } catch (error) {
    throw new Error('Token Google không hợp lệ hoặc đã hết hạn')
  }

  const { sub: googleId, email, name, picture } = googleUser

  if (!email) {
    throw new Error('Không thể lấy email từ tài khoản Google của bạn')
  }

  // 2. Tìm user theo google_id
  let user = await userModel.findByGoogleId(googleId)

  if (!user) {
    // 3. Tìm user theo email (có thể đã đăng ký bằng form trước đó)
    const existingUser = await userModel.getLoginUser(email)

    if (existingUser) {
      // Liên kết Google ID vào tài khoản hiện có
      await userModel.linkGoogleId(existingUser.id, googleId)
      user = existingUser
    } else {
      // 4. Tạo tài khoản mới từ thông tin Google
      const result = await userModel.createSocialUser({
        fullname: name,
        email: email,
        phone: null,
        address: null,
        googleId: googleId,
        avatarUrl: picture,
        roleId: ROLE_ID.USER
      })
      user = await userModel.getLoginUserById(result.insertId)
    }
  } else {
    // Lấy đầy đủ thông tin user
    user = await userModel.getLoginUserById(user.id)
  }

  // 5. Kiểm tra tài khoản có bị khóa không
  if (user.is_active === 0) {
    if (user.is_verified === 0) {
      throw new Error('Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực OTP trước!')
    } else {
      throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết!')
    }
  }

  // 6. Tạo JWT tokens
  const jwtPayload = { id: user.id, email: user.email, roleId: user.role_id }
  const jwtAccessToken = JwtProvider.generateToken(jwtPayload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRE)
  const refreshToken = JwtProvider.generateToken(jwtPayload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRE)

  // 7. Lưu refresh token
  await userModel.updateRefreshToken(user.id, refreshToken)

  // 8. Xác định đường dẫn chuyển hướng theo vai trò
  let redirectUrl = '/'
  if (user.role_id === ROLE_ID.ADMIN) redirectUrl = '/admin/dashboard'
  else if (user.role_id === ROLE_ID.MANAGER) redirectUrl = '/manager/stores'
  else if (user.role_id === ROLE_ID.VENDOR) redirectUrl = '/vendor/dashboard'
  else if (user.role_id === ROLE_ID.SHIPPER) redirectUrl = '/shipper/dashboard'

  return {
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      address: user.address,
      roleId: user.role_id,
      avatar: user.avatar,
      isActive: user.is_active,
      isVerified: user.is_verified
    },
    accessToken: jwtAccessToken,
    refreshToken,
    redirectUrl
  }
}

export const authService = {
  register,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  logout,
  refreshAccessToken,
  googleLogin
}