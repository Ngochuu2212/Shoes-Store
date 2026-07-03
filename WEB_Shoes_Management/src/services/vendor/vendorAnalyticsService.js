import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL, ANALYTICS_TYPES } from '~/utils/constant'

export const vendorAnalyticsService = {
  getRevenueAnalytics: async (type = ANALYTICS_TYPES.ONE_MONTH, startDate = '', endDate = '') => {
    let url = `${DEV_API_URL}/api/vendor/analytics/revenue?type=${type}`

    if (type === ANALYTICS_TYPES.CUSTOM && startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`
    }

    const response = await authorizedAxiosInstance.get(url)
    return response.data
  }
}