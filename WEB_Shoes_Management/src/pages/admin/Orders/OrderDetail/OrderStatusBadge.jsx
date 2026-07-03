import { ORDER_STATUS, PAYMENT_STATUS } from '~/utils/constant'
import {
  FiClock, FiPackage, FiTruck, FiCheckCircle, FiXCircle
} from 'react-icons/fi'

export const OrderStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const config = {
      [ORDER_STATUS.PENDING]: {
        label: 'Chờ xử lý',
        icon: FiClock,
        color: 'bg-amber-50 text-amber-600 border-amber-200'
      },
      [ORDER_STATUS.PROCESSING]: {
        label: 'Đang xử lý',
        icon: FiPackage,
        color: 'bg-purple-50 text-purple-600 border-purple-200'
      },
      [ORDER_STATUS.SHIPPED]: {
        label: 'Đang giao',
        icon: FiTruck,
        color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
      },
      [ORDER_STATUS.DELIVERED]: {
        label: 'Đã giao',
        icon: FiCheckCircle,
        color: 'bg-green-50 text-green-600 border-green-200'
      },
      [ORDER_STATUS.CANCELLED]: {
        label: 'Đã hủy',
        icon: FiXCircle,
        color: 'bg-red-50 text-red-600 border-red-200'
      }
    }
    return config[status] || config[ORDER_STATUS.PENDING]
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </span>
  )
}

export const PaymentStatusBadge = ({ paymentStatus }) => {
  const getPaymentStatusConfig = (paymentStatus) => {
    const config = {
      [PAYMENT_STATUS.PAID]: {
        label: 'Đã thanh toán',
        color: 'bg-green-50 text-green-600 border-green-200',
        icon: FiCheckCircle
      },
      [PAYMENT_STATUS.REFUNDED]: {
        label: 'Đã hoàn tiền',
        color: 'bg-purple-50 text-purple-600 border-purple-200',
        icon: FiXCircle
      },
      [PAYMENT_STATUS.UNPAID]: {
        label: 'Chưa thanh toán',
        color: 'bg-gray-50 text-gray-500 border-gray-200',
        icon: FiClock
      }
    }
    return config[paymentStatus] || config[PAYMENT_STATUS.UNPAID]
  }

  const config = getPaymentStatusConfig(paymentStatus)
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </span>
  )
}