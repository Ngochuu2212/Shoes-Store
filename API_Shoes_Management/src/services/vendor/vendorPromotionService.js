import { vendorPromotionModel } from '~/models/vendor/promotion/vendorPromotionModel'

const getVerifiedStoreId = async (userId) => {
  const store = await vendorPromotionModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký hoặc sở hữu cửa hàng.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang bị khóa hoặc chưa kích hoạt.')
  return store.id
}

// Thêm khuyến mãi
const createPromotion = async (userId, data) => {
  const storeId = await getVerifiedStoreId(userId)

  if (new Date(data.startDate) >= new Date(data.endDate)) {
    throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc.')
  }

  const percent = Number(data.discountValue)
  if (isNaN(percent) || percent <= 0 || percent > 100) {
    throw new Error('Giá trị giảm giá theo phần trăm phải nằm trong khoảng từ 1 đến 100.')
  }

  // CHUẨN HÓA MÃ: Chuyển hết thành chữ viết hoa, loại bỏ khoảng trắng dư thừa để User dễ nhập
  if (data.name) {
    data.name = data.name.trim().toUpperCase().replace(/\s+/g, '')
  } else {
    throw new Error('Mã giảm giá không được để trống.')
  }

  const promotionId = await vendorPromotionModel.createPromotion(storeId, data)
  return { message: 'Tạo mã khuyến mãi thành công.', promotionId }
}

// Sửa khuyến mãi
const updatePromotion = async (id, userId, data) => {
  const storeId = await getVerifiedStoreId(userId)

  if (new Date(data.startDate) >= new Date(data.endDate)) {
    throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc.')
  }

  const percent = Number(data.discountValue)
  if (isNaN(percent) || percent <= 0 || percent > 100) {
    throw new Error('Giá trị giảm giá theo phần trăm phải nằm trong khoảng từ 1 đến 100.')
  }

  // CHUẨN HÓA MÃ KHI SỬA
  if (data.name) {
    data.name = data.name.trim().toUpperCase().replace(/\s+/g, '')
  } else {
    throw new Error('Mã giảm giá không được để trống.')
  }

  const isUpdated = await vendorPromotionModel.updatePromotion(id, storeId, data)
  if (!isUpdated) throw new Error('Khuyến mãi không tồn tại hoặc không thuộc quyền sở hữu của Shop.')
  return { message: 'Cập nhật khuyến mãi thành công.' }
}

// Xóa khuyến mãi
const deletePromotion = async (id, userId) => {
  const storeId = await getVerifiedStoreId(userId)
  const isDeleted = await vendorPromotionModel.deletePromotion(id, storeId)
  if (!isDeleted) throw new Error('Khuyến mãi không tồn tại hoặc không thuộc quyền sở hữu của Shop.')
  return { message: 'Xóa khuyến mãi thành công.' }
}

// Xem chi tiết khuyến mãi
const getPromotionById = async (id, userId) => {
  const storeId = await getVerifiedStoreId(userId)
  const promotion = await vendorPromotionModel.getPromotionById(id, storeId)
  if (!promotion) throw new Error('Không tìm thấy chương trình khuyến mãi yêu cầu.')
  return promotion
}

// Danh sách khuyến mãi phân trang + lọc tìm kiếm
const getVendorPromotions = async (userId, filters) => {
  const storeId = await getVerifiedStoreId(userId)

  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    search: filters.search || null,
    isActive: filters.isActive !== undefined ? filters.isActive : null,
    startDate: filters.startDate || null,
    endDate: filters.endDate || null,
    sortBy: filters.sortBy || 'created_at',
    sortOrder: filters.sortOrder || 'DESC',
    limit,
    offset
  }

  const [promotions, totalItems, overviewStats] = await Promise.all([
    vendorPromotionModel.getVendorPromotions(storeId, filterParams),
    vendorPromotionModel.countVendorPromotions(storeId, filterParams),
    vendorPromotionModel.getPromotionsOverviewStats(storeId)
  ])

  return {
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    promotions
  }
}

// 6. Checkbox hành động 1: Thay đổi trạng thái hoạt động hàng loạt
const togglePromotionsActiveBulk = async (userId, promotionIds, isActive) => {
  const storeId = await getVerifiedStoreId(userId)

  if (!Array.isArray(promotionIds) || promotionIds.length === 0) throw new Error('Danh sách ID không hợp lệ.')

  const isAllOwner = await vendorPromotionModel.checkMultiplePromotionsOwnership(promotionIds, storeId)
  if (!isAllOwner) throw new Error('Danh sách khuyến mãi chứa mã không thuộc quyền sở hữu của shop bạn.')

  const affectedRows = await vendorPromotionModel.updatePromotionsStatusBulk(promotionIds, Number(isActive), storeId)
  return {
    message: isActive
      ? `Đã kích hoạt hoạt động hàng loạt ${affectedRows} mã khuyến mãi.`
      : `Đã tạm dừng hoạt động hàng loạt ${affectedRows} mã khuyến mãi.`
  }
}

// 7. Checkbox hành động 2: Xóa cứng hàng loạt khuyến mãi được chọn
const deletePromotionsBulk = async (userId, promotionIds) => {
  const storeId = await getVerifiedStoreId(userId)

  if (!Array.isArray(promotionIds) || promotionIds.length === 0) throw new Error('Danh sách ID cần xóa trống.')

  const isAllOwner = await vendorPromotionModel.checkMultiplePromotionsOwnership(promotionIds, storeId)
  if (!isAllOwner) throw new Error('Danh sách khuyến mãi chứa mã không thuộc quyền sở hữu của shop bạn.')

  const affectedRows = await vendorPromotionModel.deletePromotionsBulk(promotionIds, storeId)
  return { message: `Đã xóa hoàn toàn dữ liệu của ${affectedRows} chiến dịch khuyến mãi thành công.` }
}

// 8. Thay đổi trạng thái ẩn/hiện đơn lẻ
const togglePromotionActiveSingle = async (userId, promotionId, isActive) => {
  const storeId = await getVerifiedStoreId(userId)

  const success = await vendorPromotionModel.updatePromotionStatusSingle(promotionId, Number(isActive), storeId)
  if (!success) throw new Error('Cập nhật trạng thái thất bại hoặc mã không tồn tại.')

  return { message: isActive ? 'Đã kích hoạt chương trình khuyến mãi.' : 'Đã tạm dừng chương trình khuyến mãi.' }
}

export const vendorPromotionService = {
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionById,
  getVendorPromotions,
  togglePromotionsActiveBulk,
  deletePromotionsBulk,
  togglePromotionActiveSingle
}