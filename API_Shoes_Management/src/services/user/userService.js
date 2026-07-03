import bcrypt from 'bcrypt'
import { userModel } from '~/models/user/userModel'

const updateProfile = async (userId, bodyData) => {
  const { fullname, phone, address, oldPassword, password, avatarData } = bodyData
  let hashedPassword = null

  // Nếu có yêu cầu đổi mật khẩu
  if (password) {
    // Lấy user hiện tại để kiểm tra mật khẩu cũ
    const currentUser = await userModel.getLoginUserById(userId)
    if (!currentUser) {
      throw new Error('Không tìm thấy người dùng')
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, currentUser.password)
    if (!isMatch) {
      throw new Error('Mật khẩu hiện tại không chính xác')
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(8)
    hashedPassword = await bcrypt.hash(password, salt)
  }

  // Gọi Model cập nhật dữ liệu vào MySQL
  await userModel.updateProfile(userId, { fullname, phone, address, hashedPassword, avatarData })

  // Lấy lại dữ liệu mới nhất
  const updatedUser = await userModel.getUpdatedUserFields(userId)

  let successMessage = 'Cập nhật thông tin tài khoản thành công!'
  if (hashedPassword) {
    successMessage = 'Thay đổi mật khẩu và cập nhật thông tin thành công!'
  } else if (avatarData) {
    successMessage = 'Cập nhật ảnh đại diện thành công!'
  }

  return {
    message: successMessage,
    isPasswordChanged: !!hashedPassword,
    user: updatedUser
  }
}

const getUserProfile = async (userId) => {
  const user = await userModel.getUserProfileById(userId)

  if (!user) {
    throw new Error('Tài khoản người dùng không tồn tại hoặc đã bị khóa.')
  }

  return user
}

export const userService = {
  updateProfile,
  getUserProfile
}