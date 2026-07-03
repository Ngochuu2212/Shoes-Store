import { productService } from '~/services/user/productService'

const getHomepageProducts = async (req, res) => {
  try {
    const result = await productService.getHomepageProducts()
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy sản phẩm trang chủ: ${error.message}` })
  }
}

const getProductDetail = async (req, res) => {
  try {
    const { slug } = req.params
    const result = await productService.getProductDetail(slug)
    return res.status(200).json(result)
  } catch (error) {
    const statusCode = error.message.includes('không tồn tại') ? 404 : 500
    return res.status(statusCode).json({ message: error.message })
  }
}

const searchAndFilterProducts = async (req, res) => {
  try {
    const result = await productService.searchAndFilterProducts(req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi bộ lọc và phân trang sản phẩm: ${error.message}` })
  }
}

const getEmptyCartRecommendations = async (req, res) => {
  try {
    const limit = req.query.limit || 8
    const result = await productService.getEmptyCartRecommendations(limit)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải gợi ý giỏ hàng trống: ${error.message}` })
  }
}

const getPostCheckoutRecommendations = async (req, res) => {
  try {
    const result = await productService.getPostCheckoutRecommendations(req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải gợi ý đơn hàng: ${error.message}` })
  }
}

export const productController = {
  getHomepageProducts,
  getProductDetail,
  searchAndFilterProducts,
  getEmptyCartRecommendations,
  getPostCheckoutRecommendations
}