import { favoriteService } from '~/services/user/favoriteService'

const toggleFavorite = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { productId } = req.body

    const result = await favoriteService.toggleFavorite(userId, Number(productId))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý yêu thích sản phẩm: ${error.message}` })
  }
}

const getFavoriteProducts = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await favoriteService.getFavoriteProducts(userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách sản phẩm yêu thích: ${error.message}` })
  }
}

export const favoriteController = {
  toggleFavorite,
  getFavoriteProducts
}