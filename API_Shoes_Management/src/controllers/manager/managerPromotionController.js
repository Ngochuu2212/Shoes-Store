import { managerPromotionService } from '~/services/manager/managerPromotionService'

const createPromotion = async (req, res) => {
  try {
    const { name, description, discount_value, min_order_value, max_discount_amount, start_date, end_date, is_active } = req.body

    const result = await managerPromotionService.createPromotion({
      name,
      description,
      discountValue: Number(discount_value),
      minOrderValue: Number(min_order_value),
      maxDiscountAmount: max_discount_amount ? Number(max_discount_amount) : null,
      startDate: start_date,
      endDate: end_date,
      isActive: is_active
    })
    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi tạo mã khuyến mãi hệ thống: ${error.message}` })
  }
}

const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, discount_value, min_order_value, max_discount_amount, start_date, end_date, is_active } = req.body

    const result = await managerPromotionService.updatePromotion(Number(id), {
      name,
      description,
      discountValue: Number(discount_value),
      minOrderValue: Number(min_order_value),
      maxDiscountAmount: max_discount_amount ? Number(max_discount_amount) : null,
      startDate: start_date,
      endDate: end_date,
      isActive: is_active
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi sửa mã khuyến mãi hệ thống: ${error.message}` })
  }
}

const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params
    const result = await managerPromotionService.deletePromotion(Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi xóa mã khuyến mãi hệ thống: ${error.message}` })
  }
}

const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await managerPromotionService.getPromotionById(Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi lấy chi tiết mã khuyến mãi hệ thống: ${error.message}` })
  }
}

const getSystemPromotions = async (req, res) => {
  try {
    const { page, limit, search, is_active, start_date, end_date, sortBy, sortOrder } = req.query

    const result = await managerPromotionService.getSystemPromotions({
      page,
      limit,
      search,
      isActive: is_active,
      startDate: start_date,
      endDate: end_date,
      sortBy,
      sortOrder
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi tải danh sách mã khuyến mãi hệ thống: ${error.message}` })
  }
}

const togglePromotionsActiveBulk = async (req, res) => {
  try {
    const { promotionIds, isActive } = req.body
    const result = await managerPromotionService.togglePromotionsActiveBulk(promotionIds, isActive)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý trạng thái hàng loạt: ${error.message}` })
  }
}

const deletePromotionsBulk = async (req, res) => {
  try {
    const { promotionIds } = req.body
    const result = await managerPromotionService.deletePromotionsBulk(promotionIds)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xóa hàng loạt mã khuyến mãi hệ thống: ${error.message}` })
  }
}

const togglePromotionActiveSingle = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body
    const result = await managerPromotionService.togglePromotionActiveSingle(Number(id), isActive)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi cập nhật trạng thái mã khuyến mãi hệ thống: ${error.message}` })
  }
}

export const managerPromotionController = {
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionById,
  getSystemPromotions,
  togglePromotionsActiveBulk,
  deletePromotionsBulk,
  togglePromotionActiveSingle
}
