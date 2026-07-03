import { promotionService } from '~/services/user/promotionService.js'

const applyPromotion = async (req, res) => {
  try {
    const { code, storeId, currentOrderValue } = req.body

    const result = await promotionService.applyPromotion(
      code,
      storeId ? Number(storeId) : null,
      Number(currentOrderValue)
    )

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi áp dụng mã khuyến mãi: ${error.message}` })
  }
}

const getPromotionsByStore = async (req, res) => {
  try {
    const { storeId } = req.params
    const result = await promotionService.getPromotionsByStore(storeId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách khuyến mãi: ${error.message}` })
  }
}

const getSystemPromotions = async (req, res) => {
  try {
    const result = await promotionService.getSystemPromotions()
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải mã giảm giá hệ thống: ${error.message}` })
  }
}

export const promotionController = {
  applyPromotion,
  getPromotionsByStore,
  getSystemPromotions
}