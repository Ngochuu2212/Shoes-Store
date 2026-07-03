import { adminPayoutModel } from '~/models/admin/payout/adminPayoutModel'
import { PAYOUT_STATUS, NOTIFICATION_TYPES } from '~/utils/constants'
import { notificationService } from '~/services/notification/notificationService'
import { EmailProvider } from '~/providers/EmailProvider'
import XLSX from 'xlsx'

// 1. Logic bốc danh sách đơn rút tiền kèm phân trang và tìm kiếm
const getPayoutList = async (filters) => {
  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    status: filters.status || null,
    search: filters.search || null,
    limit: String(limit),
    offset: String(offset)
  }

  const [payouts, totalItems] = await Promise.all([
    adminPayoutModel.getPayoutRequests(filterParams),
    adminPayoutModel.countPayoutRequests(filterParams)
  ])

  return {
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    payouts
  }
}

// 2. LOGIC XEM CHI TIẾT: Kiểm tra tồn tại lệnh rút tiền
const getPayoutDetail = async (payoutId) => {
  const payout = await adminPayoutModel.getPayoutDetail(payoutId)
  if (!payout) {
    throw new Error('Không tìm thấy thông tin chi tiết của yêu cầu rút tiền này.')
  }
  return payout
}

// 3. Logic xử lý Phê duyệt hoặc Từ chối lệnh rút tiền vĩ mô
const processPayout = async (payoutId, { targetStatus, adminNote }) => {
  const payout = await adminPayoutModel.getPayoutDetail(payoutId)
  if (!payout) throw new Error('Không tìm thấy yêu cầu rút tiền này trên hệ thống.')

  if (payout.status !== PAYOUT_STATUS.PENDING) {
    throw new Error(`Yêu cầu này đã được xử lý từ trước với trạng thái [${payout.status.toUpperCase()}].`)
  }

  await adminPayoutModel.processPayoutTransaction(payoutId, payout.store_id, Number(payout.amount), targetStatus, adminNote)

  // BẮN SOCKET CHO VENDOR
  let logoUrl = ''
  try {
    const parsedLogo = payout.logo ? (typeof payout.logo === 'string' ? JSON.parse(payout.logo) : payout.logo) : null
    if (parsedLogo && parsedLogo.secure_url) logoUrl = parsedLogo.secure_url
  } catch (e) {
    console.error(`[Admin Payout] Lỗi parse logo của shop (Store ID: ${payout.store_id}):`, e.message)
  }

  const isApproved = targetStatus === PAYOUT_STATUS.APPROVED
  const notiType = isApproved ? NOTIFICATION_TYPES.PAYOUT_APPROVED : NOTIFICATION_TYPES.PAYOUT_REJECTED
  const notiTitle = isApproved ? 'Lệnh rút tiền thành công' : 'Lệnh rút tiền bị từ chối'
  const notiMessage = isApproved
    ? `Lệnh rút ${Number(payout.amount).toLocaleString('vi-VN')} VNĐ đã được xử lý hoàn tất.`
    : `Lệnh rút ${Number(payout.amount).toLocaleString('vi-VN')} VNĐ bị từ chối. Đã hoàn tiền về ví.`

  await notificationService.createAndPushNotification({
    userId: payout.owner_id,
    title: notiTitle,
    content: JSON.stringify({ message: notiMessage, image: logoUrl }),
    type: notiType,
    referenceId: payoutId
  }).catch(err => console.error(err))

  // GỬI EMAIL BIÊN LAI ĐIỆN TỬ CHO VENDOR
  const headerColor = isApproved ? '#16a34a' : '#be123c'
  const headerText = isApproved ? 'BIÊN LAI DUYỆT CHI' : 'THÔNG BÁO TỪ CHỐI LỆNH RÚT TIỀN'
  const finalNote = adminNote?.trim() ? adminNote : (isApproved ? 'Đã hoàn tất chuyển khoản đến ngân hàng thụ hưởng.' : 'Lệnh rút tiền không hợp lệ, vui lòng kiểm tra lại thông tin.')

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: ${headerColor}; padding: 20px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">SHOES STORE FINANCE - ${headerText}</h2>
      </div>
      <div style="padding: 30px; background-color: #ffffff; color: #334155; line-height: 1.6;">
        <p>Xin chào chủ gian hàng <strong>${payout.store_name}</strong>,</p>
        <p>Yêu cầu rút tiền (Mã giao dịch: <strong>#${payoutId}</strong>) của bạn đã được đối soát và xử lý bởi Bộ phận Kế toán:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid ${headerColor}; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0;">💰 <strong>Số tiền yêu cầu:</strong> ${Number(payout.amount).toLocaleString('vi-VN')} VNĐ</p>
          <p style="margin: 4px 0 0 0;">🏦 <strong>Ngân hàng thụ hưởng:</strong> ${payout.bank_name}</p>
          <p style="margin: 4px 0 0 0;">📋 <strong>Ghi chú từ Kế toán:</strong> <em>"${finalNote}"</em></p>
          <p style="margin: 8px 0 0 0; font-weight: bold; color: ${headerColor};">
            ⚡ Kết quả: ${isApproved ? 'ĐÃ CHUYỂN KHOẢN (Vui lòng kiểm tra biến động số dư)' : 'BỊ TỪ CHỐI (Tiền đã được hoàn lại vào ví Store của bạn)'}
          </p>
        </div>
        <p>Cảm ơn bạn đã đồng hành kinh doanh cùng Shoes Store!</p>
      </div>
    </div>
  `

  EmailProvider.sendEmail(payout.vendor_email, `[ShoesStore] Cập nhật trạng thái lệnh rút tiền #${payoutId}`, htmlContent)
    .catch(err => console.error('Lỗi bắn email payout:', err.message))

  return {
    message: isApproved
      ? 'Đã phê duyệt lệnh rút tiền thành công! Hệ thống ghi nhận tiền mặt đã chuyển khoản tới Vendor.'
      : 'Đã từ chối lệnh rút tiền! Số tiền rút đã được hoàn trả nguyên vẹn về ví balance của Store.'
  }
}

const exportPayoutList = async (filters) => {
  const status = filters.status || null
  const search = filters.search || null

  // Lấy toàn bộ dữ liệu
  const payouts = await adminPayoutModel.getAllPayoutRequestsForExport({ status, search })

  if (!payouts || payouts.length === 0) {
    throw new Error('Không có dữ liệu yêu cầu rút tiền để xuất file Excel.')
  }

  // Map dữ liệu sang định dạng Excel
  const statusMap = {
    'pending': 'Đang chờ duyệt',
    'approved': 'Đã duyệt',
    'rejected': 'Đã từ chối'
  }

  const excelData = payouts.map(item => ({
    'Mã lệnh': item.id,
    'Cửa hàng': item.store_name,
    'Chủ shop': item.vendor_name,
    'Email vendor': item.vendor_email,
    'Số tiền': Number(item.amount),
    'Ngân hàng': item.bank_name,
    'Số tài khoản': item.account_number,
    'Chủ tài khoản': item.account_name,
    'Trạng thái': statusMap[item.status] || item.status,
    'Ghi chú Admin': item.admin_note || '',
    'Ngày tạo': new Date(item.created_at).toLocaleString('vi-VN')
  }))

  // Tạo file Excel
  const workBook = XLSX.utils.book_new()
  const workSheet = XLSX.utils.json_to_sheet(excelData)

  // Định dạng cột
  workSheet['!cols'] = [
    { wch: 12 }, // Mã lệnh
    { wch: 22 }, // Cửa hàng
    { wch: 20 }, // Chủ shop
    { wch: 28 }, // Email vendor
    { wch: 18 }, // Số tiền
    { wch: 22 }, // Ngân hàng
    { wch: 18 }, // Số tài khoản
    { wch: 28 }, // Chủ tài khoản
    { wch: 16 }, // Trạng thái
    { wch: 30 }, // Ghi chú Admin
    { wch: 22 } // Ngày tạo
  ]

  XLSX.utils.book_append_sheet(workBook, workSheet, 'Danh sách rút tiền')

  return XLSX.write(workBook, { type: 'buffer', bookType: 'xlsx' })
}

export const adminPayoutService = {
  getPayoutList,
  getPayoutDetail,
  processPayout,
  exportPayoutList
}