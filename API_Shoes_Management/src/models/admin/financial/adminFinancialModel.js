import pool from '~/config/db'

// 1. Hàm bốc số liệu tổng quan (Tổng GMV, Tổng hoa hồng sàn thu về, tổng số đơn thành công)
const getFinancialOverviewStats = async ({ startDate, endDate }) => {
  const query = `
    SELECT 
      COUNT(id) AS totalDeliveredOrders,
      SUM(total_amount) AS totalGMV,
      SUM(total_amount * (commission_rate_snapshot / 100)) AS totalCommissionRevenue
    FROM orders
    WHERE status = 'delivered'
      AND payment_status = 'paid'
      AND created_at BETWEEN ? AND ?
  `
  const [rows] = await pool.execute(query, [startDate, endDate])
  return {
    totalDeliveredOrders: Number(rows[0].totalDeliveredOrders) || 0,
    totalGMV: Number(rows[0].totalGMV) || 0,
    totalCommissionRevenue: Number(rows[0].totalCommissionRevenue) || 0
  }
}

// 2. Hàm bốc dữ liệu biểu đồ (Thống kê doanh thu theo từng ngày để vẽ Chart ở Frontend)
const getRevenueChartData = async ({ startDate, endDate }) => {
  const query = `
    SELECT 
      DATE(created_at) AS dateGroup,
      COUNT(id) AS orderCount,
      SUM(total_amount) AS dailyGMV,
      SUM(total_amount * (commission_rate_snapshot / 100)) AS dailyCommission
    FROM orders
    WHERE status = 'delivered'
      AND payment_status = 'paid'
      AND created_at BETWEEN ? AND ?
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
  `
  const [rows] = await pool.execute(query, [startDate, endDate])
  return rows
}

// 3. Bảng xếp hạng doanh thu hoa hồng cắt về của top các Cửa hàng (Stores)
// (Hàm này vẫn cần JOIN sang stores để lấy s.name hiển thị tên Shop lên bảng xếp hạng b nhe)
const getTopStoresByCommission = async ({ startDate, endDate, limit = 5 }) => {
  const query = `
    SELECT 
      s.id AS store_id,
      s.name AS store_name,
      COUNT(o.id) AS completedOrders,
      SUM(o.total_amount) AS storeGMV,
      SUM(o.total_amount * (o.commission_rate_snapshot / 100)) AS commissionContributed 
    FROM orders o
    JOIN stores s ON o.store_id = s.id
    WHERE o.status = 'delivered'
      AND o.payment_status = 'paid'
      AND o.created_at BETWEEN ? AND ?
    GROUP BY s.id
    ORDER BY commissionContributed DESC
    LIMIT ?
  `
  const [rows] = await pool.execute(query, [startDate, endDate, String(limit)])
  return rows
}

export const adminFinancialModel = {
  getFinancialOverviewStats,
  getRevenueChartData,
  getTopStoresByCommission
}