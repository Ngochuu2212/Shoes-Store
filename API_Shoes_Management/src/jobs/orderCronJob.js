import cron from 'node-cron'
import { orderTrackingService } from '~/models/order/orderTrackingModel'

const initOrderCronJobs = () => {
  // Cứ mỗi 5 phút hệ thống tự động quét DB một lần để tìm đơn 'pending' cũ quá 30 phút
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('=== [CRON JOB] Đang quét các đơn hàng quá hạn 30 phút... ===')
      const affectedRows = await orderTrackingService.handleAutoConfirmOrders()

      if (affectedRows > 0) {
        console.log(`=== [CRON SUCCESS] Đã tự động kích hoạt xác nhận ${affectedRows} đơn hàng quá hạn! ===`)
      }
    } catch (error) {
      console.error(`=== [CRON ERROR] Lỗi chạy ngầm tự động xác nhận đơn: ${error.message} ===`)
    }
  })
}

export const orderCronJob = {
  initOrderCronJobs
}