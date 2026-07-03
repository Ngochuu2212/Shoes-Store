import { adminUserService } from '~/services/admin/adminUserService'

// 1. GET: Lấy danh sách thành viên toàn sàn + Widgets
const getUsersList = async (req, res) => {
  try {
    const { page, limit, search, roleId, isActive, sortBy, sortOrder } = req.query
    const result = await adminUserService.getUsersList({ page, limit, search, roleId, isActive, sortBy, sortOrder })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách thành viên: ${error.message}` })
  }
}

// 2. GET: Xem chi tiết 1 user phục vụ trang soi tư liệu lý lịch
const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params
    const result = await adminUserService.getUserDetail(Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy hồ sơ chi tiết người dùng: ${error.message}` })
  }
}

// 3. PATCH: Phân quyền / Giáng chức hàng loạt thành viên từ Checkbox
const changeUserRoleBulk = async (req, res) => {
  try {
    const { userIds, targetRoleId } = req.body
    const result = await adminUserService.changeUserRoleBulk(userIds, targetRoleId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi thực thi điều chuyển phân quyền: ${error.message}` })
  }
}

// 4. PATCH: Đóng băng (Global Ban) / Mở khóa hàng loạt tài khoản gốc
const toggleUserActiveBulk = async (req, res) => {
  try {
    const { userIds, isActive } = req.body
    const result = await adminUserService.toggleUserActiveBulk(userIds, isActive)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi thực thi khóa/mở tài khoản loạt: ${error.message}` })
  }
}

// 5. POST: Admin tự tay tạo tài khoản nhân sự (Hỗ trợ FormData tải ảnh avatar lẻ)
const createUser = async (req, res) => {
  try {
    const { roleId, fullname, email, password, phone, address } = req.body
    const avatarFile = req.file

    const result = await adminUserService.createUserByAdmin({
      roleId,
      fullname,
      email,
      password,
      phone,
      address,
      avatarFile
    })
    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tạo tài khoản nhân sự: ${error.message}` })
  }
}

// 6. DELETE: Xóa đơn lẻ hoặc hàng loạt tài khoản qua Checkbox body
const deleteUsersBulk = async (req, res) => {
  try {
    const { userIds } = req.body
    const result = await adminUserService.deleteUsersBulk(userIds)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi thực thi lệnh xóa tài khoản: ${error.message}` })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { fullname, phone, address, roleId, password } = req.body
    const avatarFile = req.file

    const result = await adminUserService.updateUserByAdmin(Number(id), {
      fullname,
      phone,
      address,
      roleId,
      password,
      avatarFile
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi cập nhật người dùng: ${error.message}` })
  }
}

export const adminUserController = {
  getUsersList,
  getUserDetail,
  changeUserRoleBulk,
  toggleUserActiveBulk,
  createUser,
  deleteUsersBulk,
  updateUser
}