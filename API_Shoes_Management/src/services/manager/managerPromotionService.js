import { managerPromotionModel } from '~/models/manager/promotion/managerPromotionModel'

// Thêm mã khuyến mãi hệ thống
const createPromotion = async (data) => {
  if (new Date(data.startDate) >= new Date(data.endDate)) {
    throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc.')
  }

  const percent = Number(data.discountValue)
  if (isNaN(percent) || percent <= 0 || percent > 100) {
    throw new Error('Giá trị giảm giá theo phần trăm phải nằm trong khoảng từ 1 đến 100.')
  }

  if (data.name) {
    data.name = data.name.trim().toUpperCase().replace(/\s+/g, '')
  } else {
    throw new Error('Mã giảm giá không được để trống.')
  }

  const promotionId = await managerPromotionModel.createPromotion(data)
  return { message: 'Tạo mã khuyến mãi hệ thống thành công.', promotionId }
}

// Sửa mã khuyến mãi hệ thống
const updatePromotion = async (id, data) => {
  if (new Date(data.startDate) >= new Date(data.endDate)) {
    throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc.')
  }

  const percent = Number(data.discountValue)
  if (isNaN(percent) || percent <= 0 || percent > 100) {
    throw new Error('Giá trị giảm giá theo phần trăm phải nằm trong khoảng từ 1 đến 100.')
  }

  if (data.name) {
    data.name = data.name.trim().toUpperCase().replace(/\s+/g, '')
  } else {
    throw new Error('Mã giảm giá không được để trống.')
  }

  const isUpdated = await managerPromotionModel.updatePromotion(id, data)
  if (!isUpdated) throw new Error('Mã khuyến mãi hệ thống không tồn tại.')
  return { message: 'Cập nhật mã khuyến mãi hệ thống thành công.' }
}

// Xóa mã khuyến mãi hệ thống
const deletePromotion = async (id) => {
  const isDeleted = await managerPromotionModel.deletePromotion(id)
  if (!isDeleted) throw new Error('Mã khuyến mãi hệ thống không tồn tại.')
  return { message: 'Xóa mã khuyến mãi hệ thống thành công.' }
}

// Xem chi tiết mã khuyến mãi hệ thống
const getPromotionById = async (id) => {
  const promotion = await managerPromotionModel.getPromotionById(id)
  if (!promotion) throw new Error('Không tìm thấy mã khuyến mãi hệ thống yêu cầu.')
  return promotion
}

// Danh sách khuyến mãi hệ thống phân trang + lọc tìm kiếm
const getSystemPromotions = async (filters) => {
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
    managerPromotionModel.getSystemPromotions(filterParams),
    managerPromotionModel.countSystemPromotions(filterParams),
    managerPromotionModel.getPromotionsOverviewStats()
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

// Thay đổi trạng thái hoạt động hàng loạt
const togglePromotionsActiveBulk = async (promotionIds, isActive) => {
  if (!Array.isArray(promotionIds) || promotionIds.length === 0) throw new Error('Danh sách ID không hợp lệ.')

  const isAllExist = await managerPromotionModel.checkMultiplePromotionsExistence(promotionIds)
  if (!isAllExist) throw new Error('Danh sách chứa mã khuyến mãi không tồn tại trong hệ thống.')

  const affectedRows = await managerPromotionModel.updatePromotionsStatusBulk(promotionIds, Number(isActive))
  return {
    message: isActive
      ? `Đã kích hoạt hoạt động hàng loạt ${affectedRows} mã khuyến mãi hệ thống.`
      : `Đã tạm dừng hoạt động hàng loạt ${affectedRows} mã khuyến mãi hệ thống.`
  }
}

// Xóa cứng hàng loạt
const deletePromotionsBulk = async (promotionIds) => {
  if (!Array.isArray(promotionIds) || promotionIds.length === 0) throw new Error('Danh sách ID cần xóa trống.')

  const isAllExist = await managerPromotionModel.checkMultiplePromotionsExistence(promotionIds)
  if (!isAllExist) throw new Error('Danh sách chứa mã khuyến mãi không tồn tại trong hệ thống.')

  const affectedRows = await managerPromotionModel.deletePromotionsBulk(promotionIds)
  return { message: `Đã xóa hoàn toàn dữ liệu của ${affectedRows} mã khuyến mãi hệ thống thành công.` }
}

// Thay đổi trạng thái ẩn/hiện đơn lẻ
const togglePromotionActiveSingle = async (promotionId, isActive) => {
  const success = await managerPromotionModel.updatePromotionStatusSingle(promotionId, Number(isActive))
  if (!success) throw new Error('Cập nhật trạng thái thất bại hoặc mã không tồn tại.')
  return { message: isActive ? 'Đã kích hoạt mã khuyến mãi hệ thống.' : 'Đã tạm dừng mã khuyến mãi hệ thống.' }
}

export const managerPromotionService = {
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionById,
  getSystemPromotions,
  togglePromotionsActiveBulk,
  deletePromotionsBulk,
  togglePromotionActiveSingle
}
