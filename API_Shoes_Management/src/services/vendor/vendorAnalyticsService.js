import { vendorAnalyticsModel } from '~/models/vendor/analytic/vendorAnalyticsModel'
import { ANALYTICS_TYPES } from '~/utils/constants'

const getVerifiedStoreId = async (userId) => {
  const store = await vendorAnalyticsModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký hoặc sở hữu cửa hàng.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang bị khóa hoặc chưa kích hoạt.')
  return store.id
}

const getImageFromVariants = (variants) => {
  if (!variants || !Array.isArray(variants) || variants.length === 0) return null

  for (const variant of variants) {
    if (variant.image) {
      try {
        let imageData = variant.image
        if (typeof variant.image === 'string') {
          imageData = JSON.parse(variant.image)
        }
        if (imageData && imageData.secure_url && imageData.public_id) {
          return imageData
        }
        if (imageData && imageData.secure_url) {
          return imageData
        }
      } catch (e) {
        continue
      }
    }
  }
  return null
}

const getImageFromProductImages = (images) => {
  if (!images) return null

  try {
    let parsedImages = typeof images === 'string' ? JSON.parse(images) : images
    if (Array.isArray(parsedImages) && parsedImages.length > 0) {
      return parsedImages[0] || null
    }
  } catch (e) {
    return null
  }
  return null
}

const getRevenueAnalytics = async (userId, { type, startDate, endDate }) => {
  const storeId = await getVerifiedStoreId(userId)

  // Lấy commission_rate của store
  const store = await vendorAnalyticsModel.getStoreByOwnerId(userId)
  const commissionRate = store?.commission_rate || 10

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  let computedStartDate = startDate
  let computedEndDate = endDate

  switch (type) {
    case ANALYTICS_TYPES.TODAY: {
      computedStartDate = todayStr
      computedEndDate = todayStr
      break
    }

    case ANALYTICS_TYPES.SEVEN_DAYS: {
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(now.getDate() - 7)
      computedStartDate = sevenDaysAgo.toISOString().split('T')[0]
      computedEndDate = todayStr
      break
    }

    case ANALYTICS_TYPES.ONE_MONTH: {
      const thirtyDaysAgo = new Date(now)
      thirtyDaysAgo.setDate(now.getDate() - 30)
      computedStartDate = thirtyDaysAgo.toISOString().split('T')[0]
      computedEndDate = todayStr
      break
    }

    case ANALYTICS_TYPES.CUSTOM: {
      if (!startDate || !endDate) {
        throw new Error('Chế độ \'custom\' bắt buộc phải cung cấp đầy đủ startDate và endDate.')
      }
      computedStartDate = startDate
      computedEndDate = endDate
      break
    }

    default: {
      const defaultPast = new Date(now)
      defaultPast.setDate(now.getDate() - 30)
      computedStartDate = defaultPast.toISOString().split('T')[0]
      computedEndDate = todayStr
      break
    }
  }

  // Chạy song song cả 5 hàm thống kê dữ liệu dưới DB theo ngày đã được tính toán
  const [overview, totalProductsSold, chartData, topProducts, categoryData] = await Promise.all([
    vendorAnalyticsModel.getRevenueOverview(storeId, computedStartDate, computedEndDate),
    vendorAnalyticsModel.getTotalProductsSold(storeId, computedStartDate, computedEndDate),
    vendorAnalyticsModel.getRevenueChartData(storeId, computedStartDate, computedEndDate),
    vendorAnalyticsModel.getTopSellingProducts(storeId, computedStartDate, computedEndDate),
    vendorAnalyticsModel.getRevenueByCategory(storeId, computedStartDate, computedEndDate)
  ])

  return {
    timeRange: {
      type: type || ANALYTICS_TYPES.ONE_MONTH,
      startDate: computedStartDate,
      endDate: computedEndDate
    },
    widgets: {
      totalRevenue: Number(overview.totalRevenue),
      totalOrdersSuccess: Number(overview.totalOrdersSuccess),
      totalProductsSold: totalProductsSold,
      commissionRate: Number(commissionRate)
    },
    chartData: chartData.map(item => ({
      date: item.date.toISOString().split('T')[0],
      revenue: Number(item.dailyRevenue),
      orders: Number(item.dailyOrders)
    })),
    topSellingProducts: topProducts.map(item => {
      let image = getImageFromVariants(item.variants)

      // Nếu không có ảnh từ variants, fallback sang product.images
      if (!image) {
        image = getImageFromProductImages(item.images)
      }

      return {
        id: item.id,
        name: item.name,
        image: image || null, // Trả về object { public_id, secure_url } hoặc null
        totalSold: Number(item.total_sold),
        totalRevenue: Number(item.total_revenue)
      }
    }),
    revenueByCategory: categoryData.map(item => ({
      categoryId: item.category_id,
      categoryName: item.category_name,
      revenue: Number(item.revenue)
    }))
  }
}

export const vendorAnalyticsService = {
  getRevenueAnalytics
}