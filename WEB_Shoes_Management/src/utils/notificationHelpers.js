import {
  FiBell, FiPackage, FiHome, FiFlag, FiDollarSign, FiAlertCircle,
  FiUser, FiMail, FiMapPin, FiClock, FiPhone, FiStar, FiTag, FiHash,
  FiShoppingBag, FiTruck, FiCheckCircle, FiXCircle
} from 'react-icons/fi'
import { NOTIFICATION_TYPES, ROLE_ID, REVIEW_TYPES } from '~/utils/constant'

// Lấy icon theo loại thông báo
export const getIconByType = (type) => {
  switch (type) {
  case NOTIFICATION_TYPES.PRODUCT_PENDING:
  case NOTIFICATION_TYPES.PRODUCT_APPROVED:
  case NOTIFICATION_TYPES.PRODUCT_REJECTED:
  case NOTIFICATION_TYPES.PRODUCT_BANNED:
  case NOTIFICATION_TYPES.PRODUCT_REAPPROVAL:
    return { icon: FiPackage, color: 'text-blue-500', bg: 'bg-blue-50' }
  case NOTIFICATION_TYPES.STORE_PENDING:
  case NOTIFICATION_TYPES.STORE_APPROVED:
  case NOTIFICATION_TYPES.STORE_REJECTED:
  case NOTIFICATION_TYPES.STORE_BANNED:
    return { icon: FiHome, color: 'text-purple-500', bg: 'bg-purple-50' }
  case NOTIFICATION_TYPES.REVIEW_REPORTED:
  case NOTIFICATION_TYPES.REVIEW_REOPEN_REQUESTED:
    return { icon: FiFlag, color: 'text-amber-500', bg: 'bg-amber-50' }
  case NOTIFICATION_TYPES.REVIEW_RESOLVED_APPROVED:
  case NOTIFICATION_TYPES.REVIEW_RESOLVED_BANNED:
    return { icon: FiFlag, color: 'text-green-500', bg: 'bg-green-50' }
  case NOTIFICATION_TYPES.PAYOUT_REQUESTED:
  case NOTIFICATION_TYPES.PAYOUT_APPROVED:
  case NOTIFICATION_TYPES.PAYOUT_REJECTED:
    return { icon: FiDollarSign, color: 'text-green-500', bg: 'bg-green-50' }
  case NOTIFICATION_TYPES.APPEAL_REQUESTED:
  case NOTIFICATION_TYPES.APPEAL_APPROVED:
  case NOTIFICATION_TYPES.APPEAL_REJECTED:
    return { icon: FiAlertCircle, color: 'text-red-500', bg: 'bg-red-50' }
  case NOTIFICATION_TYPES.ORDER_CREATED:
  case NOTIFICATION_TYPES.ORDER_PENDING_PAYMENT:
    return { icon: FiShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' }
  case NOTIFICATION_TYPES.ORDER_PAID:
    return { icon: FiDollarSign, color: 'text-green-500', bg: 'bg-green-50' }
  case NOTIFICATION_TYPES.ORDER_PROCESSING:
    return { icon: FiPackage, color: 'text-purple-500', bg: 'bg-purple-50' }
  case NOTIFICATION_TYPES.ORDER_SHIPPED:
    return { icon: FiTruck, color: 'text-indigo-500', bg: 'bg-indigo-50' }
  case NOTIFICATION_TYPES.ORDER_DELIVERED:
    return { icon: FiCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' }
  case NOTIFICATION_TYPES.ORDER_CANCEL_REQUESTED:
    return { icon: FiAlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' }
  case NOTIFICATION_TYPES.ORDER_CANCELLED:
    return { icon: FiXCircle, color: 'text-red-500', bg: 'bg-red-50' }
  default:
    return { icon: FiBell, color: 'text-gray-500', bg: 'bg-gray-50' }
  }
}

// Parse nội dung JSON
export const parseContent = (content) => {
  try {
    return JSON.parse(content)
  } catch {
    return { message: content }
  }
}

// Lấy text role
export const getRoleText = (roleId) => {
  switch (roleId) {
  case ROLE_ID.VENDOR: return 'Người bán'
  case ROLE_ID.MANAGER: return 'Quản trị sàn'
  case ROLE_ID.ADMIN: return 'Admin'
  default: return 'Người dùng'
  }
}

// Lấy link theo loại thông báo
export const getLinkByType = (notification, userRole) => {
  const { type, reference_id } = notification
  const contentData = parseContent(notification.content)
  const reviewType = contentData.reviewType

  // USER (Khách hàng)
  if (userRole === ROLE_ID.USER || !userRole) {
    switch (type) {
    case NOTIFICATION_TYPES.ORDER_CREATED:
    case NOTIFICATION_TYPES.ORDER_PENDING_PAYMENT:
    case NOTIFICATION_TYPES.ORDER_PAID:
    case NOTIFICATION_TYPES.ORDER_PROCESSING:
    case NOTIFICATION_TYPES.ORDER_SHIPPED:
    case NOTIFICATION_TYPES.ORDER_DELIVERED:
    case NOTIFICATION_TYPES.ORDER_CANCELLED:
    case NOTIFICATION_TYPES.ORDER_CANCEL_REQUESTED:
      return reference_id ? `/orders/${reference_id}` : '/orders'
    default:
      return null
    }
  }

  // VENDOR (Người bán)
  else if (userRole === ROLE_ID.VENDOR) {
    switch (type) {
    case NOTIFICATION_TYPES.PRODUCT_PENDING:
    case NOTIFICATION_TYPES.PRODUCT_APPROVED:
    case NOTIFICATION_TYPES.PRODUCT_REJECTED:
    case NOTIFICATION_TYPES.PRODUCT_BANNED:
    case NOTIFICATION_TYPES.PRODUCT_REAPPROVAL:
      return reference_id ? `/vendor/products/detail/${reference_id}` : null
    case NOTIFICATION_TYPES.STORE_PENDING:
    case NOTIFICATION_TYPES.STORE_APPROVED:
    case NOTIFICATION_TYPES.STORE_REJECTED:
    case NOTIFICATION_TYPES.STORE_BANNED:
      return '/vendor/profile-store'
    case NOTIFICATION_TYPES.PAYOUT_REQUESTED:
    case NOTIFICATION_TYPES.PAYOUT_APPROVED:
    case NOTIFICATION_TYPES.PAYOUT_REJECTED:
      return '/vendor/payouts'
    case NOTIFICATION_TYPES.APPEAL_REQUESTED:
    case NOTIFICATION_TYPES.APPEAL_APPROVED:
    case NOTIFICATION_TYPES.APPEAL_REJECTED:
      return reference_id ? `/vendor/appeals/${reference_id}` : null
    case NOTIFICATION_TYPES.ORDER_CREATED:
    case NOTIFICATION_TYPES.ORDER_PENDING_PAYMENT:
    case NOTIFICATION_TYPES.ORDER_PAID:
    case NOTIFICATION_TYPES.ORDER_PROCESSING:
    case NOTIFICATION_TYPES.ORDER_SHIPPED:
    case NOTIFICATION_TYPES.ORDER_DELIVERED:
    case NOTIFICATION_TYPES.ORDER_CANCELLED:
    case NOTIFICATION_TYPES.ORDER_CANCEL_REQUESTED:
      return reference_id ? `/vendor/orders/detail/${reference_id}` : '/vendor/orders'
    default:
      return null
    }
  }

  // MANAGER hoặc ADMIN
  else if (userRole === ROLE_ID.MANAGER || userRole === ROLE_ID.ADMIN) {
    switch (type) {
    case NOTIFICATION_TYPES.PRODUCT_PENDING:
    case NOTIFICATION_TYPES.PRODUCT_REAPPROVAL:
      return reference_id ? `/manager/products/detail/${reference_id}` : null
    case NOTIFICATION_TYPES.STORE_PENDING:
      return reference_id ? `/manager/stores/${reference_id}` : null
    case NOTIFICATION_TYPES.REVIEW_REPORTED:
    case NOTIFICATION_TYPES.REVIEW_REOPEN_REQUESTED:
      return reference_id ? `/manager/reviews/${reference_id}?type=${reviewType || 'product'}` : null
    case NOTIFICATION_TYPES.PAYOUT_REQUESTED:
      return reference_id ? `/admin/payouts/${reference_id}` : null
    case NOTIFICATION_TYPES.APPEAL_REQUESTED:
    case NOTIFICATION_TYPES.APPEAL_APPROVED:
    case NOTIFICATION_TYPES.APPEAL_REJECTED:
      return reference_id ? `/manager/appeals/${reference_id}` : null
    default:
      return null
    }
  }
  return null
}

// Lấy danh sách chi tiết từ content
export const getDetailItems = (contentData) => {
  const detailItems = []

  // Thông tin người dùng / chủ sở hữu
  if (contentData.ownerName) {
    detailItems.push({ icon: FiUser, label: 'Người đăng ký', value: contentData.ownerName })
  }
  if (contentData.ownerEmail) {
    detailItems.push({ icon: FiMail, label: 'Email', value: contentData.ownerEmail })
  }
  if (contentData.reviewerName) {
    detailItems.push({ icon: FiUser, label: 'Người đánh giá', value: contentData.reviewerName })
  }

  // Thông tin sản phẩm
  if (contentData.productName) {
    detailItems.push({ icon: FiPackage, label: 'Sản phẩm', value: contentData.productName })
  }
  if (contentData.productId) {
    detailItems.push({ icon: FiHash, label: 'ID sản phẩm', value: `#${contentData.productId}` })
  }
  if (contentData.productCount) {
    detailItems.push({ icon: FiPackage, label: 'Số lượng sản phẩm', value: contentData.productCount })
  }
  if (contentData.productNames) {
    detailItems.push({ icon: FiTag, label: 'Danh sách sản phẩm', value: contentData.productNames })
  }

  // Thông tin cửa hàng
  if (contentData.storeName) {
    detailItems.push({ icon: FiHome, label: 'Cửa hàng', value: contentData.storeName })
  }
  if (contentData.storeId) {
    detailItems.push({ icon: FiHash, label: 'ID cửa hàng', value: `#${contentData.storeId}` })
  }

  // Thông tin đánh giá
  if (contentData.reviewId) {
    detailItems.push({ icon: FiFlag, label: 'ID đánh giá', value: `#${contentData.reviewId}` })
  }
  if (contentData.reviewType) {
    detailItems.push({
      icon: FiFlag,
      label: 'Loại đánh giá',
      value: contentData.reviewType === 'product' ? 'Đánh giá sản phẩm' : 'Đánh giá cửa hàng'
    })
  }
  if (contentData.rating !== undefined && contentData.rating !== null) {
    detailItems.push({ icon: FiStar, label: 'Số sao', value: `${contentData.rating}/5` })
  }
  if (contentData.reason) {
    detailItems.push({ icon: FiAlertCircle, label: 'Lý do giải trình', value: contentData.reason })
  }

  // Thông tin tài chính
  if (contentData.amount) {
    detailItems.push({
      icon: FiDollarSign,
      label: 'Số tiền',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contentData.amount)
    })
  }

  if (contentData.orderId) {
    detailItems.push({ icon: FiShoppingBag, label: 'Mã đơn hàng', value: `#${contentData.orderId}` })
  }
  if (contentData.orderStatus) {
    const statusMap = {
      'pending': 'Chờ thanh toán',
      'paid': 'Đã thanh toán',
      'processing': 'Đang xử lý',
      'shipped': 'Đã giao hàng',
      'delivered': 'Đã nhận hàng',
      'cancelled': 'Đã hủy',
      'refunded': 'Đã hoàn tiền'
    }
    detailItems.push({
      icon: FiClock,
      label: 'Trạng thái đơn hàng',
      value: statusMap[contentData.orderStatus] || contentData.orderStatus
    })
  }
  if (contentData.totalAmount) {
    detailItems.push({
      icon: FiDollarSign,
      label: 'Tổng tiền',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contentData.totalAmount)
    })
  }
  if (contentData.shippingAddress) {
    detailItems.push({ icon: FiMapPin, label: 'Địa chỉ giao hàng', value: contentData.shippingAddress })
  }
  if (contentData.shippingMethod) {
    detailItems.push({ icon: FiTruck, label: 'Phương thức vận chuyển', value: contentData.shippingMethod })
  }
  if (contentData.paymentMethod) {
    detailItems.push({ icon: FiDollarSign, label: 'Phương thức thanh toán', value: contentData.paymentMethod })
  }

  // Thông tin bổ sung
  if (contentData.count) {
    detailItems.push({ icon: FiPackage, label: 'Số lượng', value: contentData.count })
  }
  if (contentData.date) {
    detailItems.push({ icon: FiClock, label: 'Thời gian', value: contentData.date })
  }
  if (contentData.address) {
    detailItems.push({ icon: FiMapPin, label: 'Địa chỉ', value: contentData.address })
  }
  if (contentData.phone) {
    detailItems.push({ icon: FiPhone, label: 'SĐT', value: contentData.phone })
  }
  if (contentData.reportReason) {
    detailItems.push({ icon: FiAlertCircle, label: 'Lý do tố cáo', value: contentData.reportReason })
  }

  return detailItems
}