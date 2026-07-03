import { vendorAppealModel } from '~/models/vendor/appeal/vendorAppealModel'
import { userModel } from '~/models/user/userModel'
import { notificationService } from '~/services/notification/notificationService'
import { NOTIFICATION_TYPES } from '~/utils/constants'

const submitStoreAppeal = async ({ userId, appealReason, evidenceFiles }) => {
  const store = await vendorAppealModel.getStoreByOwnerId(userId)

  if (!store) {
    throw new Error('Bạn chưa đăng ký cửa hàng nào trên hệ thống.')
  }

  if (store.is_active === 1) {
    throw new Error(`Cửa hàng "${store.name}" hiện đang hoạt động bình thường, không cần cứu xét.`)
  }

  // Kiểm tra đã có đơn pending chưa
  const existingAppeal = await vendorAppealModel.getPendingAppealByStoreId(store.id)
  if (existingAppeal) {
    throw new Error('Bạn đã có một đơn cứu xét đang chờ xử lý. Vui lòng chờ kết quả.')
  }

  let evidenceImagesJson = null
  if (evidenceFiles && evidenceFiles.length > 0) {
    const imagesArray = evidenceFiles.map(file => ({
      public_id: file.filename,
      secure_url: file.path
    }))
    evidenceImagesJson = JSON.stringify(imagesArray)
  }

  const appealId = await vendorAppealModel.createAppeal({
    storeId: store.id,
    appealReason,
    evidenceImages: evidenceImagesJson
  })

  // Bắn thông báo cho tất cả MANAGER
  let logoUrl = ''
  try {
    const parsedLogo = store.logo ? (typeof store.logo === 'string' ? JSON.parse(store.logo) : store.logo) : null
    if (parsedLogo && parsedLogo.secure_url) logoUrl = parsedLogo.secure_url
  } catch (e) {
    console.error('Lỗi parse logo shop:', e.message)
  }

  const managerIds = await userModel.getAllManagerIds()

  for (const managerId of managerIds) {
    await notificationService.createAndPushNotification({
      userId: managerId,
      title: 'Yêu cầu cứu xét cửa hàng mới',
      content: JSON.stringify({
        message: `Cửa hàng "${store.name}" vừa nộp đơn khiếu nại xin khôi phục hoạt động.`,
        image: logoUrl,
        storeName: store.name,
        storeId: store.id,
        appealId: appealId
      }),
      type: NOTIFICATION_TYPES.APPEAL_REQUESTED,
      referenceId: appealId
    }).catch(err => console.error('Lỗi bắn thông báo:', err))
  }

  return {
    message: `Gửi đơn khiếu nại thành công! Hồ sơ giải trình của cửa hàng "${store.name}" đã được ghi nhận.`,
    appealId: appealId
  }
}

const getMyAppeals = async (userId, query) => {
  const store = await vendorAppealModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Bạn chưa đăng ký cửa hàng.')

  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const offset = (page - 1) * limit

  const [appeals, totalItems] = await Promise.all([
    vendorAppealModel.getAppealsByStoreId(store.id, { limit, offset }),
    vendorAppealModel.countAppealsByStoreId(store.id)
  ])

  return {
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    appeals
  }
}

const getAppealDetail = async (userId, appealId) => {
  const store = await vendorAppealModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Bạn chưa đăng ký cửa hàng.')

  const appeal = await vendorAppealModel.getAppealDetail(appealId, store.id)
  if (!appeal) throw new Error('Không tìm thấy đơn cứu xét hoặc bạn không có quyền xem.')

  return appeal
}

export const vendorAppealService = {
  submitStoreAppeal,
  getMyAppeals,
  getAppealDetail
}