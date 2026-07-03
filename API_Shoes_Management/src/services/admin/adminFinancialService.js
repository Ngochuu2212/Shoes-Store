import { adminFinancialModel } from '~/models/admin/financial/adminFinancialModel'
import { ANALYTICS_TYPES } from '~/utils/constants'
import moment from 'moment'

const getPlatformFinancialAnalytics = async ({ type, customStartDate, customEndDate }) => {
  let startDate = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
  let endDate = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')

  // Xử lý bẻ lái mốc thời gian linh hoạt
  if (type === ANALYTICS_TYPES.SEVEN_DAYS) {
    startDate = moment().subtract(7, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss')
  } else if (type === ANALYTICS_TYPES.ONE_MONTH) {
    startDate = moment().subtract(1, 'months').startOf('day').format('YYYY-MM-DD HH:mm:ss')
  } else if (type === ANALYTICS_TYPES.CUSTOM) {
    if (!customStartDate || !customEndDate) {
      throw new Error('Chế độ xem tùy chỉnh bắt buộc phải truyền khoảng thời gian startDate và endDate.')
    }
    startDate = moment(customStartDate).startOf('day').format('YYYY-MM-DD HH:mm:ss')
    endDate = moment(customEndDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')
  }

  // Chạy song song gom số liệu tổng quan, mảng vẽ Chart và bảng xếp hạng Store
  const [overview, chartData, topStores] = await Promise.all([
    adminFinancialModel.getFinancialOverviewStats({ startDate, endDate }),
    adminFinancialModel.getRevenueChartData({ startDate, endDate }),
    adminFinancialModel.getTopStoresByCommission({ startDate, endDate, limit: 5 })
  ])

  // Định dạng lại ngày tháng mượt mà cho Frontend dễ nạp vào Chart.js hoặc Recharts
  const formattedChartData = chartData.map(item => ({
    date: moment(item.dateGroup).format('YYYY-MM-DD'),
    orderCount: Number(item.orderCount) || 0,
    gmv: Number(item.dailyGMV) || 0,
    commission: Number(item.dailyCommission) || 0
  }))

  return {
    filterType: type || ANALYTICS_TYPES.TODAY,
    timeRange: { startDate, endDate },
    overview,
    chartData: formattedChartData,
    topStores: topStores.map(store => ({
      ...store,
      completedOrders: Number(store.completedOrders) || 0,
      storeGMV: Number(store.storeGMV) || 0,
      commissionContributed: Number(store.commissionContributed) || 0
    }))
  }
}

export const adminFinancialService = {
  getPlatformFinancialAnalytics
}