import { adminUserModel } from '~/models/admin/user/adminUserModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { ROLE_ID } from '~/utils/constants'
import bcrypt from 'bcrypt'

// 1. Tải danh sách thành viên phân trang + lọc sâu + cụm Widgets đầu trang
const getUsersList = async (filters) => {
  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    search: filters.search || null,
    roleId: filters.roleId ? Number(filters.roleId) : null,
    isActive: filters.isActive !== undefined ? filters.isActive : null,
    sortBy: filters.sortBy || 'created_at',
    sortOrder: filters.sortOrder || 'DESC',
    limit,
    offset
  }

  const [users, totalItems, overviewStats] = await Promise.all([
    adminUserModel.getUsersForAdmin(filterParams),
    adminUserModel.countUsersForAdmin(filterParams),
    adminUserModel.getUsersOverviewStats()
  ])

  return {
    overview: overviewStats,
    pagination: { totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page, limit },
    users
  }
}

// 2. Xem chi tiết thông tin một tài khoản
const getUserDetail = async (userId) => {
  const user = await adminUserModel.getUserDetailById(userId)
  if (!user) throw new Error('Tài khoản người dùng không tồn tại trên hệ thống.')
  return user
}

// 3. Thay đổi chức vụ hàng loạt bằng Checkbox
const changeUserRoleBulk = async (userIds, targetRoleId) => {
  const affectedRows = await adminUserModel.updateUserRoleBulk(userIds, Number(targetRoleId))
  return {
    message: `Cập nhật phân quyền thành công! Đã điều chuyển vai trò chức vụ cho ${affectedRows} tài khoản.`
  }
}

// 4. Đóng băng / Kích hoạt lại tài khoản hàng loạt diện rộng
const toggleUserActiveBulk = async (userIds, isActive) => {
  const affectedRows = await adminUserModel.updateUserActiveStatusBulk(userIds, isActive)
  return {
    message: isActive
      ? `Đã gỡ lệnh phong tỏa, khôi phục trạng thái hoạt động cho ${affectedRows} tài khoản thành công.`
      : `Đã thực thi lệnh ĐÓNG BĂNG TOÀN DIỆN thành công ${affectedRows} tài khoản vi phạm nghiêm trọng.`
  }
}

// 5. Admin tự tay tạo tài khoản nhân sự (ĐÃ LÀM SẠCH BÓNG CODE JOI)
const createUserByAdmin = async (userData) => {
  // Check trùng email qua hàm Model gọn gàng
  const isEmailExist = await adminUserModel.checkEmailExist(userData.email)
  if (isEmailExist) throw new Error('Email này đã được đăng ký trên hệ thống!')

  // Mã hóa mật khẩu tạo sẵn cho nhân sự
  const salt = await bcrypt.genSalt(8)
  const hashedPassword = await bcrypt.hash(userData.password, salt)

  const avatarJson = userData.avatarFile
    ? JSON.stringify({ public_id: userData.avatarFile.filename, secure_url: userData.avatarFile.path })
    : null

  const newUserId = await adminUserModel.createNewUserByAdmin({
    ...userData,
    password: hashedPassword,
    avatar: avatarJson
  })

  return {
    message: 'Tạo mới tài khoản thành viên kèm ảnh đại diện thành công!',
    userId: newUserId
  }
}

const updateUserByAdmin = async (userId, userData) => {
  const existingUser = await adminUserModel.getUserDetailById(userId)
  if (!existingUser) throw new Error('Người dùng không tồn tại trên hệ thống.')

  // Nếu có password mới, hash lại
  let hashedPassword = undefined
  if (userData.password) {
    const salt = await bcrypt.genSalt(8)
    hashedPassword = await bcrypt.hash(userData.password, salt)
  }

  // Nếu có avatar mới, upload lên Cloudinary
  let avatarJson = undefined
  if (userData.avatarFile) {
    // Xóa avatar cũ nếu có
    if (existingUser.avatar) {
      const oldAvatar = typeof existingUser.avatar === 'string'
        ? JSON.parse(existingUser.avatar)
        : existingUser.avatar
      if (oldAvatar && oldAvatar.public_id) {
        await CloudinaryProvider.cloudinary.uploader.destroy(oldAvatar.public_id)
      }
    }
    avatarJson = JSON.stringify({
      public_id: userData.avatarFile.filename,
      secure_url: userData.avatarFile.path
    })
  }

  const updated = await adminUserModel.updateUserById(userId, {
    fullname: userData.fullname,
    phone: userData.phone,
    address: userData.address,
    roleId: userData.roleId,
    password: hashedPassword,
    avatar: avatarJson
  })

  if (updated === 0) throw new Error('Cập nhật người dùng thất bại.')

  return {
    message: 'Cập nhật người dùng thành công!',
    userId: userId
  }
}

// 6. Xử lý xóa đơn lẻ hoặc hàng loạt tài khoản + DỌN SẠCH CLOUDINARY
const deleteUsersBulk = async (userIds) => {
  const safeUserIds = userIds.filter(id => Number(id) !== 1)
  if (safeUserIds.length === 0) throw new Error('Không thể xóa tài khoản Admin tối cao!')

  const usersWithOrders = await adminUserModel.checkUsersHaveOrders(safeUserIds)
  const usersToHardDelete = safeUserIds.filter(id => !usersWithOrders.includes(id))

  let hardDeletedCount = 0

  if (usersToHardDelete.length > 0) {
    const userAvatars = await adminUserModel.getUsersAvatarsBulk(usersToHardDelete)
    const publicIdsToDelete = []

    userAvatars.forEach(user => {
      if (user.avatar) {
        const avatarObj = typeof user.avatar === 'string' ? JSON.parse(user.avatar) : user.avatar
        if (avatarObj && avatarObj.public_id) {
          publicIdsToDelete.push(avatarObj.public_id)
        }
      }
    })

    if (publicIdsToDelete.length > 0) {
      await Promise.all(
        publicIdsToDelete.map(publicId => CloudinaryProvider.cloudinary.uploader.destroy(publicId))
      )
    }

    hardDeletedCount = await adminUserModel.deleteUsersHardBulk(usersToHardDelete)
  }

  let softDeletedCount = 0
  if (usersWithOrders.length > 0) {
    softDeletedCount = await adminUserModel.updateUserActiveStatusBulk(usersWithOrders, false)
  }

  let message = 'Hệ thống xử lý hoàn tất! '
  if (hardDeletedCount > 0) message += `Đã xóa vĩnh viễn ${hardDeletedCount} tài khoản. `
  if (softDeletedCount > 0) message += `Đã tự động đóng băng ${softDeletedCount} tài khoản do có lịch sử giao dịch đơn hàng.`

  return { message }
}

export const adminUserService = {
  getUsersList,
  getUserDetail,
  changeUserRoleBulk,
  toggleUserActiveBulk,
  createUserByAdmin,
  deleteUsersBulk,
  updateUserByAdmin
}