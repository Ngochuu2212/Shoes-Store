import { vendorAnalyticsService } from '~/services/vendor/vendorAnalyticsService.js'

const getRevenueAnalytics = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id

    const { type, startDate, endDate } = req.query

    const result = await vendorAnalyticsService.getRevenueAnalytics(userId, {
      type,
      startDate,
      endDate
    })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi lấy báo cáo doanh thu: ${error.message}` })
  }
}

export const vendorAnalyticsController = {
  getRevenueAnalytics
}