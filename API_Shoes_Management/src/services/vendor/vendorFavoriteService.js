import { vendorFavoriteModel } from '~/models/vendor/favorite/vendorFavoriteModel'

const getVerifiedStoreId = async (userId) => {
  const store = await vendorFavoriteModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký hoặc sở hữu cửa hàng.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang bị khóa.')
  return store.id
}

const getFavoriteAnalytics = async (userId, filters) => {
  const storeId = await getVerifiedStoreId(userId)

  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  // Chuẩn hóa toàn bộ tham số bộ lọc nâng cao từ Controller truyền xuống
  const filterParams = {
    search: filters.search || null,
    categoryId: filters.categoryId || null,
    isActive: filters.isActive !== undefined ? filters.isActive : null,
    minFavorites: filters.minFavorites || null,
    maxFavorites: filters.maxFavorites || null
  }

  const [products, totalItems, overviewStats] = await Promise.all([
    vendorFavoriteModel.getMostFavoritedProducts(storeId, { ...filterParams, limit, offset }),
    vendorFavoriteModel.countFavoritedProductsUnique(storeId, filterParams),
    vendorFavoriteModel.getFavoritesOverviewStats(storeId)
  ])

  return {
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    products
  }
}

const getProductFavoriteDetail = async (userId, productId, paginationFilters) => {
  const storeId = await getVerifiedStoreId(userId)

  const isOwner = await vendorFavoriteModel.checkProductBelongsToStore(productId, storeId)
  if (!isOwner) {
    throw new Error('Sản phẩm không tồn tại hoặc không thuộc quyền sở hữu của cửa hàng bạn.')
  }

  const page = Number(paginationFilters.page) || 1
  const limit = Number(paginationFilters.limit) || 10
  const offset = (page - 1) * limit

  // Chạy song song bốc danh sách user và đếm tổng số lượng
  const [users, totalItems] = await Promise.all([
    vendorFavoriteModel.getUsersWhoFavoritedProduct(productId, { limit, offset }),
    vendorFavoriteModel.countUsersWhoFavoritedProduct(productId)
  ])

  return {
    productId,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    users
  }
}

export const vendorFavoriteService = {
  getFavoriteAnalytics,
  getProductFavoriteDetail
}