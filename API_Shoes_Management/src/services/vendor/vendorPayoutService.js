import { vendorPayoutModel } from '~/models/vendor/payout/vendorPayoutModel'
import { userModel } from '~/models/user/userModel'
import { notificationService } from '~/services/notification/notificationService'
import { NOTIFICATION_TYPES } from '~/utils/constants'
import XLSX from 'xlsx'

// Hàm kiểm tra tính chính chủ và trạng thái hoạt động của ví cửa hàng
const getVerifiedStoreWallet = async (userId) => {
  const store = await vendorPayoutModel.getStoreWalletDetail(userId)
  if (!store) throw new Error('Tài khoản của bạn chưa đăng ký mở cửa hàng trên sàn.')
  if (!store.is_active) throw new Error('Cửa hàng của bạn hiện đang bị khóa, không thể thực hiện rút tiền.')
  return store
}

// 1. Xử lý logic Tạo đơn yêu cầu rút tiền về ngân hàng
const createPayoutRequest = async (userId, payoutData) => {
  const store = await getVerifiedStoreWallet(userId)
  const requestAmount = Number(payoutData.amount)

  // CHẶN NGHIỆP VỤ: Nếu số tiền muốn rút vượt quá số dư hiện có trong ví balance
  if (requestAmount > Number(store.balance)) {
    throw new Error(`Số dư ví không đủ để thực hiện lệnh rút này. Số dư hiện tại của bạn là: ${Number(store.balance).toLocaleString('vi-VN')} VNĐ.`)
  }

  // Thực thi trừ tiền tạm tính và tạo đơn qua Transaction bảo mật
  const requestId = await vendorPayoutModel.createPayoutRequestTransaction(store.id, {
    amount: requestAmount,
    bankName: payoutData.bankName,
    accountNumber: payoutData.accountNumber,
    accountName: payoutData.accountName.toUpperCase()
  })

  // BẮN THÔNG BÁO CHO TẤT CẢ ADMIN
  let logoUrl = ''
  try {
    const parsedLogo = store.logo ? (typeof store.logo === 'string' ? JSON.parse(store.logo) : store.logo) : null
    if (parsedLogo && parsedLogo.secure_url) logoUrl = parsedLogo.secure_url
  } catch (e) {
    console.log('Không parse được logo shop')
  }

  const adminIds = await userModel.getAllAdminIds()

  if (adminIds.length > 0) {
    await Promise.all(
      adminIds.map((adminId) => {
        return notificationService.createAndPushNotification({
          userId: adminId,
          title: 'Yêu cầu rút tiền mới',
          content: JSON.stringify({
            message: `Gian hàng "${store.store_name}" vừa đặt lệnh rút ${requestAmount.toLocaleString('vi-VN')} VNĐ.`,
            image: logoUrl
          }),
          type: NOTIFICATION_TYPES.PAYOUT_REQUESTED,
          referenceId: requestId
        }).catch(err => console.error('Lỗi bắn socket payout báo Admin:', err.message))
      })
    )
  }

  return {
    message: 'Gửi yêu cầu rút tiền thành công! Số tiền yêu cầu đã được tạm khóa để chờ ban quản trị sàn phê duyệt chuyển khoản.',
    payoutRequestId: requestId
  }
}

// 2. Xử lý xem lịch sử rút tiền phân trang của shop
const getPayoutHistory = async (userId, queryParams) => {
  const store = await getVerifiedStoreWallet(userId)

  const page = Number(queryParams.page) || 1
  const limit = Number(queryParams.limit) || 10
  const offset = (page - 1) * limit

  const [history, totalItems] = await Promise.all([
    vendorPayoutModel.getVendorPayoutHistory(store.id, { limit, offset }),
    vendorPayoutModel.countVendorPayoutHistory(store.id)
  ])

  return {
    currentBalance: Number(store.balance),
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    history
  }
}

// 3. Xử lý export Excel lịch sử rút tiền
const exportPayoutHistory = async (userId) => {
  // 1. Lấy thông tin store của vendor
  const store = await getVerifiedStoreWallet(userId)

  // 2. Lấy toàn bộ lịch sử rút tiền (không phân trang)
  const history = await vendorPayoutModel.getAllVendorPayoutHistory(store.id)

  if (!history || history.length === 0) {
    throw new Error('Không có dữ liệu lịch sử rút tiền để xuất file Excel.')
  }

  // 3. Map dữ liệu sang định dạng Excel
  const statusMap = {
    'pending': 'Đang xử lý',
    'approved': 'Đã duyệt',
    'rejected': 'Bị từ chối'
  }

  const excelData = history.map(item => ({
    'Mã lệnh': item.id,
    'Số tiền': Number(item.amount),
    'Ngân hàng': item.bank_name,
    'Số tài khoản': item.account_number,
    'Chủ tài khoản': item.account_name,
    'Trạng thái': statusMap[item.status] || item.status,
    'Ngày yêu cầu': new Date(item.created_at).toLocaleString('vi-VN'),
    'Ghi chú': item.admin_note || ''
  }))

  // 4. Tạo file Excel
  const workBook = XLSX.utils.book_new()
  const workSheet = XLSX.utils.json_to_sheet(excelData)

  // Định dạng cột (độ rộng)
  workSheet['!cols'] = [
    { wch: 12 }, // Mã lệnh
    { wch: 18 }, // Số tiền
    { wch: 22 }, // Ngân hàng
    { wch: 18 }, // Số tài khoản
    { wch: 28 }, // Chủ tài khoản
    { wch: 16 }, // Trạng thái
    { wch: 22 }, // Ngày yêu cầu
    { wch: 30 } // Ghi chú
  ]

  XLSX.utils.book_append_sheet(workBook, workSheet, 'Lịch sử rút tiền')

  // 5. Trả về buffer
  return XLSX.write(workBook, { type: 'buffer', bookType: 'xlsx' })
}

export const vendorPayoutService = {
  createPayoutRequest,
  getPayoutHistory,
  exportPayoutHistory
}