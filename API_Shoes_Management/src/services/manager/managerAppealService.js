import { managerAppealModel } from '~/models/manager/appeal/managerAppealModel'
import { managerStoreModel } from '~/models/manager/store/managerStoreModel'
import { EmailProvider } from '~/providers/EmailProvider'
import { APPEAL_STATUS, NOTIFICATION_TYPES } from '~/utils/constants'
import { notificationService } from '~/services/notification/notificationService'

// 1. Lấy danh sách đơn cứu xét (giống pattern của Store)
const getAppealsList = async (filters) => {
  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    status: filters.status || null,
    search: filters.search || null,
    startDate: filters.startDate || null,
    endDate: filters.endDate || null,
    limit,
    offset
  }

  const [appeals, totalItems, overviewStats] = await Promise.all([
    managerAppealModel.getAppealsForManager(filterParams),
    managerAppealModel.countAppealsForManager(filterParams),
    managerAppealModel.getAppealsOverviewStats()
  ])

  return {
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    appeals
  }
}

// 2. Xem chi tiết đơn cứu xét
const getAppealDetail = async (appealId) => {
  if (!appealId) throw new Error('Mã đơn cứu xét không hợp lệ.')

  const appeal = await managerAppealModel.getAppealDetailById(appealId)
  if (!appeal) throw new Error('Đơn cứu xét không tồn tại trên hệ thống.')

  return appeal
}

// 3. Xử lý đơn cứu xét
const processStoreAppeal = async (appealId, { status, managerNote }) => {
  const appeal = await managerAppealModel.getAppealDetailById(appealId)
  if (!appeal) throw new Error('Đơn khiếu nại cứu xét không tồn tại trên hệ thống.')
  if (appeal.status !== APPEAL_STATUS.PENDING) throw new Error('Đơn khiếu nại này đã được xử lý từ trước đó!')

  if (status === APPEAL_STATUS.REJECTED && (!managerNote || managerNote.trim() === '')) {
    throw new Error('Vui lòng nhập lý do từ chối đơn cứu xét.')
  }

  // Cập nhật trạng thái đơn
  await managerAppealModel.updateAppealStatus(appealId, status, managerNote || null)

  let emailSubject = ''
  let emailHtml = ''
  const isApproved = status === APPEAL_STATUS.APPROVED

  if (isApproved) {
    // Cập nhật trạng thái cửa hàng thành active
    await managerStoreModel.updateStoreActiveStatus(appeal.store_id, true)

    emailSubject = '[ShoesStore] Quyết định phê duyệt: Khôi phục hoạt động Cửa hàng'
    emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #0f766e; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">SHOES STORE MANAGEMENT</h1>
        </div>
        <div style="padding: 32px; background-color: #ffffff; line-height: 1.6; color: #333333;">
          <h2 style="color: #0f766e; margin-top: 0; font-size: 18px;">🎉 CHÚC MỪNG ĐỐI TÁC VENDOR!</h2>
          <p style="font-size: 15px;">Ban quản trị <strong>ShoesStore</strong> xin thông báo: Đơn khiếu nại cứu xét của cửa hàng bạn đã được phê duyệt thành công.</p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #166534;"><strong>🏪 Thông tin khôi phục:</strong></p>
            <p style="margin: 0 0 6px 0; font-size: 14px;">• <strong>Tên cửa hàng:</strong> ${appeal.store_name}</p>
            <p style="margin: 0; font-size: 14px;">• <strong>Trạng thái sàn:</strong> <span style="color: #16a34a; font-weight: bold;">Đang Hoạt Động (Active)</span></p>
          </div>

          <p style="font-size: 14px; margin-bottom: 8px;"><strong>💬 Ghi chú hội đồng thẩm định:</strong></p>
          <blockquote style="margin: 0 0 24px 0; padding: 12px 16px; background-color: #f8fafc; border-radius: 6px; font-style: italic; font-size: 14px; color: #475569; border: 1px dashed #cbd5e1;">
            "${managerNote}"
          </blockquote>

          <p style="font-size: 14px; color: #555555;">Hiện tại, toàn bộ quyền kinh doanh và đăng tải sản phẩm của bạn đã được kích hoạt lại bình thường. Vui lòng truy cập hệ thống để kiểm tra và cam kết tuân thủ nghiêm ngặt quy chế an toàn vận hành sàn.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
          Đây là email tự động từ hệ thống ShoesStore, vui lòng không trả lời trực tiếp email này.
        </div>
      </div>
    `
  } else if (status === APPEAL_STATUS.REJECTED) {
    emailSubject = '[ShoesStore] Quyết định bác bỏ: Đơn cứu xét Cửa hàng bị từ chối'
    emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #991b1b; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">SHOES STORE MANAGEMENT</h1>
        </div>
        <div style="padding: 32px; background-color: #ffffff; line-height: 1.6; color: #333333;">
          <h2 style="color: #991b1b; margin-top: 0; font-size: 18px;">🛑 THÔNG BÁO TỪ CHỐI CỨU XÉT</h2>
          <p style="font-size: 15px;">Ban quản trị <strong>ShoesStore</strong> rất tiếc phải thông báo: Đơn khiếu nại gỡ lệnh phong tỏa của cửa hàng [<strong>${appeal.store_name}</strong>] đã bị hội đồng quản trị <strong>BÁC BỎ</strong>.</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #991b1b;"><strong>⚠️ Lý do từ chối cụ thể:</strong></p>
            <p style="margin: 0; font-size: 14px; color: #7f1d1d;">"${managerNote}"</p>
          </div>

          <p style="font-size: 14px; color: #555555;">Qua quá trình rà soát, hồ sơ chứng cứ đính kèm bạn cung cấp chưa đủ minh bạch hoặc vi phạm vào điều khoản cốt lõi không thể khoan nhượng của sàn. Do đó, <strong>quyết định đình chỉ hoạt động kinh doanh vĩnh viễn đối với tài khoản của bạn vẫn giữ nguyên hiệu lực</strong>.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
          Đây là email tự động từ hệ thống ShoesStore, vui lòng không trả lời trực tiếp email này.
        </div>
      </div>
    `
  }

  // Gửi Email (Chạy ngầm)
  EmailProvider.sendEmail(appeal.owner_email, emailSubject, emailHtml).catch(err => console.error(err))

  // Bắn notification cho Vendor
  let logoUrl = ''
  try {
    const parsedLogo = appeal.store_logo ? (typeof appeal.store_logo === 'string' ? JSON.parse(appeal.store_logo) : appeal.store_logo) : null
    if (parsedLogo && parsedLogo.secure_url) logoUrl = parsedLogo.secure_url
  } catch (e) {
    console.error('Lỗi parse logo shop:', e.message)
  }

  const notiType = isApproved ? NOTIFICATION_TYPES.APPEAL_APPROVED : NOTIFICATION_TYPES.APPEAL_REJECTED
  const notiTitle = isApproved ? 'Khôi phục cửa hàng thành công' : 'Đơn cứu xét bị từ chối'
  const notiMessage = isApproved
    ? 'Chúc mừng! Cửa hàng của bạn đã được khôi phục trạng thái hoạt động.'
    : 'Đơn giải trình của bạn đã bị từ chối. Vui lòng kiểm tra email để biết thêm chi tiết.'

  await notificationService.createAndPushNotification({
    userId: appeal.owner_id,
    title: notiTitle,
    content: JSON.stringify({ message: notiMessage, image: logoUrl }),
    type: notiType,
    referenceId: appealId
  }).catch(err => console.error('Lỗi bắn socket báo Vendor:', err.message))

  return {
    message: isApproved
      ? 'Đã duyệt chấp thuận đơn khiếu nại! Shop đã được mở khóa hoạt động và gửi email chúc mừng.'
      : 'Đã từ chối đơn khiếu nại! Hệ thống đã gửi email thông báo bác bỏ cho Vendor.'
  }
}

export const managerAppealService = {
  getAppealsList,
  getAppealDetail,
  processStoreAppeal
}