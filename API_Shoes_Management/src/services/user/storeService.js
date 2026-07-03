import { storeModel } from '~/models/user/store/storeModel'

const getStoreDetail = async (storeId) => {
  const store = await storeModel.getStoreDetailById(storeId)

  if (!store) {
    throw new Error('Cửa hàng không tồn tại hoặc đã bị khóa.')
  }

  return store
}

const getStoreProducts = async (storeId, query) => {
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 8
  return await storeModel.getProductsByStoreId(storeId, page, limit)
}

const getStoreReviews = async (storeId, query) => {
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 8
  return await storeModel.getStoreReviews(storeId, page, limit)
}
export const storeService = {
  getStoreDetail,
  getStoreProducts,
  getStoreReviews
}