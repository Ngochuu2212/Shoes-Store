export const ROLE_ID = {
  ADMIN: 1,
  MANAGER: 2,
  VENDOR: 3,
  USER: 4
}

// Định nghĩa các chế độ lọc thời gian cho Dashboard Thống kê
export const ANALYTICS_TYPES = {
  TODAY: 'today',
  SEVEN_DAYS: '7days',
  ONE_MONTH: '1month',
  CUSTOM: 'custom'
}

// Bạn cũng có thể định nghĩa thêm các trạng thái đơn hàng tại đây để dùng chung cho toàn dự án
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  CANCEL_REQUESTED: 'cancel_requested'
}

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded'
}

// Trạng thái phê duyệt sản phẩm của Manager
export const PRODUCT_MODERATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BANNED: 'banned',
  PENDING_REAPPROVAL: 'pending_reapproval'
}

// Phân loại đánh giá hệ thống (Dùng cho cả User viết bài, Vendor xem và Manager phân xử khiếu nại)
export const REVIEW_TYPES = {
  PRODUCT: 'product',
  STORE: 'store'
}

// Bộ trạng thái cho đơn khiếu nại cứu xét cửa hàng (Dùng cho Manager/Admin xử lý và Vendor theo dõi)
export const APPEAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// Trạng thái lệnh rút tiền của Vendor (Dùng cho Admin quản lý và Vendor theo dõi)
export const PAYOUT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// ĐỊNH NGHĨA TYPE CHO HỆ THỐNG NOTIFICATION (Dùng cho cả Socket và lưu DB)
export const NOTIFICATION_TYPES = {
  // --- Phân hệ Cửa hàng ---
  STORE_PENDING: 'STORE_PENDING',
  STORE_APPROVED: 'STORE_APPROVED',
  STORE_REJECTED: 'STORE_REJECTED',
  STORE_BANNED: 'STORE_BANNED',

  // --- Phân hệ Sản phẩm ---
  PRODUCT_PENDING: 'PRODUCT_PENDING',
  PRODUCT_APPROVED: 'PRODUCT_APPROVED',
  PRODUCT_REJECTED: 'PRODUCT_REJECTED',
  PRODUCT_BANNED: 'PRODUCT_BANNED',
  PRODUCT_REAPPROVAL: 'PRODUCT_REAPPROVAL',

  // --- Phân hệ Đánh giá (Review) ---
  REVIEW_REPORTED: 'REVIEW_REPORTED',
  REVIEW_REOPEN_REQUESTED: 'REVIEW_REOPEN_REQUESTED',
  REVIEW_RESOLVED_APPROVED: 'REVIEW_RESOLVED_APPROVED',
  REVIEW_RESOLVED_BANNED: 'REVIEW_RESOLVED_BANNED',

  // --- Phân hệ Rút tiền (Payout) ---
  PAYOUT_REQUESTED: 'PAYOUT_REQUESTED',
  PAYOUT_APPROVED: 'PAYOUT_APPROVED',
  PAYOUT_REJECTED: 'PAYOUT_REJECTED',

  // --- Phân hệ Cứu xét Cửa hàng (Appeal) ---
  APPEAL_REQUESTED: 'APPEAL_REQUESTED',
  APPEAL_APPROVED: 'APPEAL_APPROVED',
  APPEAL_REJECTED: 'APPEAL_REJECTED',

  // --- Phân hệ Đơn hàng ---
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_PENDING_PAYMENT: 'ORDER_PENDING_PAYMENT',
  ORDER_PAID: 'ORDER_PAID',
  ORDER_PROCESSING: 'ORDER_PROCESSING',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_CANCEL_REQUESTED: 'ORDER_CANCEL_REQUESTED',

  // --- Phân hệ Ví điện tử ---
  WALLET_REFUND: 'WALLET_REFUND',
  WALLET_SPENT: 'WALLET_SPENT'
}

export const PAYMENT_METHODS = {
  COD: 'COD',
  VNPAY: 'VNPAY',
  MOMO: 'MOMO',
  WALLET: 'WALLET'
}