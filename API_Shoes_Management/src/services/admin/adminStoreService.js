import { adminStoreModel } from '~/models/admin/store/adminStoreModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { ROLE_ID } from '~/utils/constants'
import moment from 'moment'

// 1. Tải danh sách Store phân trang + đa bộ lọc + Widgets tổng
const getStoresList = async (filters) => {
  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    search: filters.search || null,
    isActive: filters.isActive !== undefined ? filters.isActive : null,
    sortBy: filters.sortBy || 'created_at',
    sortOrder: filters.sortOrder || 'DESC',
    limit: String(limit),
    offset: String(offset)
  }

  const [stores, totalItems, overviewStats] = await Promise.all([
    adminStoreModel.getStoresForAdmin(filterParams),
    adminStoreModel.countStoresForAdmin(filterParams),
    adminStoreModel.getStoresOverviewStats()
  ])

  return {
    overview: overviewStats,
    pagination: { totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page, limit: Number(limit) },
    stores
  }
}

// 2. Lấy hồ sơ chi tiết của 1 Store
const getStoreDetail = async (storeId) => {
  const id = Number(storeId)
  if (isNaN(id) || id <= 0) {
    throw new Error('Mã cửa hàng không hợp lệ.')
  }

  const store = await adminStoreModel.getStoreDetailById(id)
  if (!store) throw new Error('Cửa hàng yêu cầu không tồn tại trên sàn.')

  // Lấy thông tin chủ sở hữu
  const owner = await adminStoreModel.getStoreOwnerInfo(id)

  // Lấy thống kê doanh thu 30 ngày gần nhất
  const endDate = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  const startDate = moment().subtract(30, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss')

  const revenueStats = await adminStoreModel.getStoreRevenueStats(id, { startDate, endDate })

  return {
    ...store,
    owner: owner || null,
    revenueStats: revenueStats.map(stat => ({
      ...stat,
      daily_revenue: Number(stat.daily_revenue) || 0,
      daily_commission: Number(stat.daily_commission) || 0,
      orders_count: Number(stat.orders_count) || 0
    }))
  }
}

// 3. Đóng băng hoặc mở khóa hàng loạt Store
const toggleStoreActiveBulk = async (storeIds, isActive, reason = null) => {
  // Nếu khóa (isActive = false) và có reason, lưu vào reject_reason
  if (!isActive && reason) {
    // Cập nhật reject_reason cho từng store
    for (const storeId of storeIds) {
      await adminStoreModel.updateStoreRejectReason(storeId, reason)
    }
  } else if (isActive) {
    // Nếu mở khóa, xóa reject_reason
    for (const storeId of storeIds) {
      await adminStoreModel.updateStoreRejectReason(storeId, null)
    }
  }

  const affectedRows = await adminStoreModel.updateStoreActiveStatusBulk(storeIds, isActive)
  return {
    message: isActive
      ? `Hệ thống gỡ bỏ phong tỏa, khôi phục quyền kinh doanh cho ${affectedRows} cửa hàng.`
      : `Hệ thống thực thi LỆNH ĐÌNH CHỈ kinh doanh hàng loạt thành công ${affectedRows} cửa hàng vi phạm.`
  }
}

// 4. Cập nhật hoa hồng sàn hàng loạt
const updateStoreCommissionBulk = async (storeIds, commissionRate) => {
  const affectedRows = await adminStoreModel.updateStoreCommissionBulk(storeIds, commissionRate)
  return {
    message: `Áp đặt biểu phí thành công! Đã điều chỉnh tỷ lệ chiết khấu sàn thành ${commissionRate}% cho ${affectedRows} cửa hàng được chọn.`
  }
}

// 5. Cưỡng chế số dư ví
const enforceStoreBalance = async ({ storeId, amount, type }) => {
  const store = await adminStoreModel.getStoreDetailById(storeId)
  if (!store) throw new Error('Không tìm thấy cửa hàng mục tiêu để can thiệp ví dòng tiền.')

  if (type === 'minus' && Number(store.balance) < amount) {
    throw new Error(`Can thiệp thất bại! Số dư hiện tại của shop (${Number(store.balance).toLocaleString()}đ) không đủ để thực hiện lệnh phạt trừ ${amount.toLocaleString()}đ.`)
  }

  await adminStoreModel.enforceStoreBalance(storeId, amount, type)

  return {
    message: type === 'plus'
      ? `Đã cưỡng chế CỘNG THÊM thành công ${amount.toLocaleString()}đ vào ví của cửa hàng [${store.name}].`
      : `Đã cưỡng chế KHẤU TRỪ PHẠT thành công ${amount.toLocaleString()}đ từ ví của cửa hàng [${store.name}].`
  }
}

// 6. Admin tự tay tạo Store
const createStoreByAdmin = async (storeData) => {
  const checkOwner = await adminStoreModel.checkStoreOwnerValidation(storeData.ownerId)

  if (checkOwner.isNotFound) {
    throw new Error('Tài khoản người dùng này không tồn tại trên hệ thống!')
  }

  if (!checkOwner.isValidRole) {
    throw new Error('Hành động bị từ chối! Chỉ tài khoản có phân quyền USER mới được cấp phép mở gian hàng kinh doanh.')
  }

  if (checkOwner.isExist) {
    throw new Error('Người dùng này hiện đã sở hữu một cửa hàng khác trên sàn!')
  }

  const logoObj = storeData.logoFile
    ? JSON.stringify({ public_id: storeData.logoFile[0].filename, secure_url: storeData.logoFile[0].path })
    : null

  const bannerObj = storeData.bannerFile
    ? JSON.stringify({ public_id: storeData.bannerFile[0].filename, secure_url: storeData.bannerFile[0].path })
    : null

  const defaultCommission = storeData.commissionRate !== undefined ? Number(storeData.commissionRate) : 10.00

  const newStoreId = await adminStoreModel.createStoreByAdmin({
    ...storeData,
    logo: logoObj,
    banner: bannerObj,
    commissionRate: defaultCommission
  })

  return {
    message: 'Khởi tạo không gian gian hàng mới cho đối tác Vendor thành công!',
    storeId: newStoreId
  }
}

// 7. Xử lý xóa đơn lẻ hoặc hàng loạt Store
const deleteStoresBulk = async (storeIds) => {
  if (!Array.isArray(storeIds) || storeIds.length === 0) throw new Error('Danh sách ID cửa hàng không hợp lệ.')

  const storesWithOrders = await adminStoreModel.checkStoresHaveOrders(storeIds)
  const storesToHardDelete = storeIds.filter(id => !storesWithOrders.includes(id))

  let hardDeletedCount = 0

  if (storesToHardDelete.length > 0) {
    const storeProfiles = await adminStoreModel.getStoresProfilesBulk(storesToHardDelete)
    const publicIdsToDelete = []

    storeProfiles.forEach(store => {
      if (store.logo) {
        const logo = typeof store.logo === 'string' ? JSON.parse(store.logo) : store.logo
        if (logo?.public_id) publicIdsToDelete.push(logo.public_id)
      }
      if (store.banner) {
        const banner = typeof store.banner === 'string' ? JSON.parse(store.banner) : store.banner
        if (banner?.public_id) publicIdsToDelete.push(banner.public_id)
      }
    })

    if (publicIdsToDelete.length > 0) {
      await Promise.all(
        publicIdsToDelete.map(publicId => CloudinaryProvider.cloudinary.uploader.destroy(publicId))
      )
    }

    hardDeletedCount = await adminStoreModel.deleteStoresHardBulk(storesToHardDelete)
  }

  let softDeletedCount = 0
  if (storesWithOrders.length > 0) {
    softDeletedCount = await adminStoreModel.updateStoreActiveStatusBulk(storesWithOrders, false)
  }

  let message = 'Hệ thống phân rã hoàn tất! '
  if (hardDeletedCount > 0) message += `Đã xóa vĩnh viễn ${hardDeletedCount} cửa hàng rác kèm thu hồi toàn bộ Logo/Banner trên Cloud. `
  if (softDeletedCount > 0) message += `Đã chuyển sang chế độ Đình chỉ đóng băng ${softDeletedCount} cửa hàng do dính líu đến lịch sử vận đơn sàn.`

  return { message }
}

export const adminStoreService = {
  getStoresList,
  getStoreDetail,
  toggleStoreActiveBulk,
  updateStoreCommissionBulk,
  enforceStoreBalance,
  createStoreByAdmin,
  deleteStoresBulk
}