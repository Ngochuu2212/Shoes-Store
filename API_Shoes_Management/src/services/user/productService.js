import { productModel } from '~/models/user/product/productModel'

// 1. Gom cụm dữ liệu trang chủ
const getHomepageProducts = async () => {
  const [flashSaleRaw, topSellingRaw, latestRaw] = await Promise.all([
    productModel.getFlashSaleProducts(8),
    productModel.getTopSellingProducts(8),
    productModel.getLatestProducts(8)
  ])

  const parseVariants = (productsList) => {
    if (!productsList || productsList.length === 0) return []

    return productsList.map(product => {
      if (product.variants) {
        try {
          product.variants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants
          product.variants = product.variants.map(variant => {
            if (variant.image && typeof variant.image === 'string') {
              try {
                variant.image = JSON.parse(variant.image)
              } catch (e) {
                variant.image = null
              }
            }
            return variant
          })
        } catch (e) {
          product.variants = []
        }
      } else {
        product.variants = []
      }
      return product
    })
  }

  const flashSale = parseVariants(flashSaleRaw)
  const topSelling = parseVariants(topSellingRaw)
  const latest = parseVariants(latestRaw)

  return { flashSale, topSelling, latest }
}

// 2. Xử lý logic bốc tách trọn gói trang chi tiết sản phẩm
const getProductDetail = async (slug) => {
  const product = await productModel.getProductBySlug(slug)
  if (!product) {
    throw new Error('Sản phẩm không tồn tại hoặc đã bị ẩn.')
  }

  await productModel.increaseViewCount(product.id)

  const [variants, relatedProductsRaw] = await Promise.all([
    productModel.getProductVariants(product.id),
    productModel.getRelatedProducts(product.category_id, product.id, 4)
  ])

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

  const formattedRelatedProducts = relatedProductsRaw.map(item => {
    if (item.variants) {
      try {
        item.variants = typeof item.variants === 'string' ? JSON.parse(item.variants) : item.variants
        item.variants = item.variants.map(variant => {
          if (variant.image && typeof variant.image === 'string') {
            try {
              variant.image = JSON.parse(variant.image)
            } catch (e) {
              variant.image = null
            }
          }
          return variant
        })
      } catch (e) {
        item.variants = []
      }
    } else {
      item.variants = []
    }
    return item
  })

  return {
    ...product,
    variants: parsedVariants || [],
    relatedProducts: formattedRelatedProducts
  }
}

const searchAndFilterProducts = async (queryParams) => {
  const { search, categories, stores, ratings, page, limit, sortBy, sizes, colors, isDiscounted } = queryParams

  const currentPage = Math.max(1, Number(page) || 1)
  const perPage = Math.max(1, Number(limit) || 8)
  const offset = (currentPage - 1) * perPage

  const filters = {
    search: search || '',
    categorySlugs: categories ? categories.split(',') : [],
    storeIds: stores ? stores.split(',').map(Number) : [],
    ratings: ratings ? ratings.split(',').map(Number) : [],
    limit: perPage,
    offset: offset,
    sizes: sizes ? sizes.split(',') : [],
    colors: colors ? colors.split(',') : [],
    prices: queryParams.prices ? queryParams.prices.split(',') : [],
    isDiscounted: isDiscounted === 'true',
    sortBy: sortBy || 'latest'
  }

  const result = await productModel.searchAndFilterProducts(filters)
  const totalPages = Math.ceil(result.total / perPage)

  return {
    pagination: {
      totalItems: result.total,
      totalPages: totalPages,
      currentPage: currentPage,
      limit: perPage
    },
    products: result.products
  }
}

const getEmptyCartRecommendations = async (limit = 8) => {
  return await productModel.getEmptyCartRecommendations(limit)
}

const getPostCheckoutRecommendations = async (queryParams) => {
  const limit = Number(queryParams.limit) || 8

  const categoryIds = queryParams.categoryIds ? queryParams.categoryIds.split(',').map(Number) : []
  const excludedIds = queryParams.excludedIds ? queryParams.excludedIds.split(',').map(Number) : []

  if (categoryIds.length === 0) {
    return await productModel.getEmptyCartRecommendations(limit)
  }

  return await productModel.getPostCheckoutRecommendations(categoryIds, excludedIds, limit)
}

export const productService = {
  getHomepageProducts,
  getProductDetail,
  searchAndFilterProducts,
  getEmptyCartRecommendations,
  getPostCheckoutRecommendations
}