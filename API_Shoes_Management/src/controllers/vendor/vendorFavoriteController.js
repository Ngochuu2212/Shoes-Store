import { vendorFavoriteService } from '~/services/vendor/vendorFavoriteService.js'

const getFavoriteAnalytics = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id

    const { page, limit, search, categoryId, isActive, minFavorites, maxFavorites } = req.query

    const result = await vendorFavoriteService.getFavoriteAnalytics(userId, {
      page,
      limit,
      search,
      categoryId,
      isActive,
      minFavorites,
      maxFavorites
    })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi lấy thống kê sản phẩm yêu thích: ${error.message}` })
  }
}

const getProductFavoriteDetail = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { page, limit } = req.query

    const result = await vendorFavoriteService.getProductFavoriteDetail(userId, Number(id), { page, limit })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải chi tiết danh sách người thích sản phẩm: ${error.message}` })
  }
}

export const vendorFavoriteController = {
  getFavoriteAnalytics,
  getProductFavoriteDetail
}