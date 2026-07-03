import { favoriteModel } from '~/models/user/product/favoriteModel'
import { productModel } from '~/models/user/product/productModel'

const toggleFavorite = async (userId, productId) => {
  const isFavorite = await favoriteModel.checkFavoriteExist(userId, productId)

  if (isFavorite) {
    await favoriteModel.removeFavorite(userId, productId)
    return { isFavorite: false, message: 'Đã xóa sản phẩm khỏi danh sách yêu thích.' }
  } else {
    await favoriteModel.addFavorite(userId, productId)
    return { isFavorite: true, message: 'Đã thêm sản phẩm vào danh sách yêu thích thành công.' }
  }
}

const getFavoriteProducts = async (userId) => {
  const favoriteProductsRaw = await favoriteModel.getFavoriteProductsByUserId(userId)

  if (!favoriteProductsRaw || favoriteProductsRaw.length === 0) return []

  const formattedFavoriteProducts = await Promise.all(
    favoriteProductsRaw.map(async (item) => {
      const variants = await productModel.getProductVariants(item.product_id)

      // Parse image trong variants
      const parsedVariants = variants.map(variant => {
        if (variant.image && typeof variant.image === 'string') {
          try {
            variant.image = JSON.parse(variant.image)
          } catch (e) {
            variant.image = null
          }
        }
        return variant
      })

      return {
        ...item,
        id: item.product_id,
        variants: parsedVariants || []
      }
    })
  )

  return formattedFavoriteProducts
}

export const favoriteService = {
  toggleFavorite,
  getFavoriteProducts
}