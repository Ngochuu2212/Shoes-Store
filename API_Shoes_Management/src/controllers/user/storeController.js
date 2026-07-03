import { storeService } from '~/services/user/storeService'

const getStoreDetail = async (req, res) => {
  try {
    const { id } = req.params
    const result = await storeService.getStoreDetail(id)
    return res.status(200).json(result)
  } catch (error) {
    const statusCode = error.message.includes('không tồn tại') ? 404 : 500
    return res.status(statusCode).json({ message: error.message })
  }
}

const getStoreProducts = async (req, res) => {
  try {
    const { id } = req.params
    const result = await storeService.getStoreProducts(id, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

const getStoreReviews = async (req, res) => {
  try {
    const { id } = req.params
    const result = await storeService.getStoreReviews(id, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
export const storeController = {
  getStoreDetail,
  getStoreProducts,
  getStoreReviews
}