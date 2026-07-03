export const DEV_API_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL || 'https://shoes-api-backend.onrender.com'
  : window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'http://backend:3000'

export const ROLE_ID = {
  ADMIN: 1,
  MANAGER: 2,
  VENDOR: 3,
  USER: 4
}

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

export const PAYMENT_METHODS = {
  COD: 'COD',
  VNPAY: 'VNPAY',
  MOMO: 'MOMO'
}

export const CANCEL_REASONS = [
  'Thay đổi ý định mua hàng',
  'Sai địa chỉ giao hàng',
  'Thời gian giao hàng quá lâu',
  'Đặt nhầm sản phẩm/kích cỡ',
  'Lý do khác'
]

// Định nghĩa các chế độ lọc thời gian cho Dashboard Thống kê
export const ANALYTICS_TYPES = {
  TODAY: 'today',
  SEVEN_DAYS: '7days',
  ONE_MONTH: '1month',
  CUSTOM: 'custom'
}

export const PRODUCT_MODERATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BANNED: 'banned',
  PENDING_REAPPROVAL: 'pending_reapproval'
}

export const REVIEW_TYPES = {
  PRODUCT: 'product',
  STORE: 'store'
}

export const PAYOUT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

export const APPEAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

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
  ORDER_CANCEL_REQUESTED: 'ORDER_CANCEL_REQUESTED'
}