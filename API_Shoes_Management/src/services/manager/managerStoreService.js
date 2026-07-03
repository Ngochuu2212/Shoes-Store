import { managerStoreModel } from '~/models/manager/store/managerStoreModel'
import { EmailProvider } from '~/providers/EmailProvider'
import { notificationService } from '~/services/notification/notificationService'
import { NOTIFICATION_TYPES, ROLE_ID } from '~/utils/constants'

// A. Lấy danh sách gian hàng (Hỗ trợ phân trang, lọc khoảng ngày)
const getStoresList = async (filters) => {
  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    search: filters.search || null,
    isActive: filters.is_active !== undefined ? filters.is_active : null,
    startDate: filters.startDate || null,
    endDate: filters.endDate || null,
    limit,
    offset
  }

  const [stores, totalItems, overviewStats] = await Promise.all([
    managerStoreModel.getStoresForManager(filterParams),
    managerStoreModel.countStoresForManager(filterParams),
    managerStoreModel.getStoresOverviewStats()
  ])

  return {
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    stores
  }
}

// B. Phê duyệt hàng loạt cửa hàng
const approveStoresBulk = async (storeIds) => {
  if (!Array.isArray(storeIds) || storeIds.length === 0) {
    throw new Error('Danh sách ID cửa hàng duyệt chọn không hợp lệ.')
  }

  // 1. Kích hoạt trạng thái hoạt động (is_active = true) và xóa reject_reason
  const affectedStores = await managerStoreModel.updateStoresStatusBulk(storeIds, true)
  if (affectedStores === 0) throw new Error('Không có cửa hàng nào được cập nhật.')

  // 2. Lấy thông tin để bắn socket và cập nhật role
  const targets = await managerStoreModel.getStoresAndOwnersInfo(storeIds)

  // 3. Tự động nâng role lên VENDOR cho chủ shop
  const ownerIds = targets.map(t => t.owner_id)
  if (ownerIds.length > 0) {
    await managerStoreModel.updateUserRolesBulk(ownerIds, ROLE_ID.VENDOR)
  }

  // 4. Bắn socket thông báo cho từng chủ shop
  for (const shop of targets) {
    let logoUrl = ''
    try {
      const parsedLogo = shop.logo ? (typeof shop.logo === 'string' ? JSON.parse(shop.logo) : shop.logo) : null
      if (parsedLogo && parsedLogo.secure_url) logoUrl = parsedLogo.secure_url
    } catch (e) {
      console.log('Không thể parse logo:', e.message)
    }

    await notificationService.createAndPushNotification({
      userId: shop.owner_id,
      title: 'Hồ sơ đã được phê duyệt!',
      content: JSON.stringify({
        message: `Chúc mừng! Gian hàng "${shop.store_name}" của bạn đã được phê duyệt và chính thức hoạt động.`,
        image: logoUrl
      }),
      type: NOTIFICATION_TYPES.STORE_APPROVED,
      referenceId: shop.store_id
    }).catch(err => console.error(err))
  }

  return { message: `Phê duyệt thành công ${affectedStores} gian hàng đối tác kinh doanh mới.` }
}

// C. Từ chối hàng loạt cửa hàng - KHÔNG XÓA, chỉ cập nhật is_active = 0 và lưu lý do
const rejectStoresBulk = async (storeIds, reason) => {
  if (!Array.isArray(storeIds) || storeIds.length === 0) {
    throw new Error('Danh sách ID cửa hàng từ chối không hợp lệ.')
  }

  const finalReason = reason?.trim() || 'Hồ sơ thông tin đăng ký gian hàng chưa đầy đủ hoặc không đạt tiêu chuẩn của sàn.'

  // 1. Lấy thông tin chủ shop để gửi mail và notification
  const targets = await managerStoreModel.getStoresAndOwnersInfo(storeIds)

  // 2. Cập nhật is_active = 0 và lưu reject_reason (KHÔNG XÓA CỬA HÀNG)
  const affectedStores = await managerStoreModel.rejectStoresBulk(storeIds, finalReason)
  if (affectedStores === 0) throw new Error('Không có cửa hàng nào được cập nhật.')

  // 3. Đảm bảo role của chủ shop vẫn là USER (role_id = 4)
  const ownerIds = targets.map(t => t.owner_id)
  if (ownerIds.length > 0) {
    await managerStoreModel.updateUserRolesBulk(ownerIds, ROLE_ID.USER)
  }

  // 4. Gửi thông báo và email cho từng chủ shop
  if (targets.length > 0) {
    Promise.all(
      targets.map(async (shop) => {
        let logoUrl = ''
        try {
          const parsedLogo = shop.logo ? (typeof shop.logo === 'string' ? JSON.parse(shop.logo) : shop.logo) : null
          if (parsedLogo && parsedLogo.secure_url) logoUrl = parsedLogo.secure_url
        } catch (e) {
          console.log('Không thể parse logo:', e.message)
        }

        await notificationService.createAndPushNotification({
          userId: shop.owner_id,
          title: 'Hồ sơ gian hàng bị từ chối',
          content: JSON.stringify({
            message: `Gian hàng "${shop.store_name}" chưa đạt yêu cầu. Lý do: ${finalReason}`,
            image: logoUrl
          }),
          type: NOTIFICATION_TYPES.STORE_REJECTED,
          referenceId: shop.store_id
        }).catch(err => console.error(err))

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; border-bottom: 2px solid #ee4d2d; padding-bottom: 10px;">
              <h2 style="color: #ee4d2d; margin: 0;">Shoes Store - Kết Quả Duyệt Hồ Sơ</h2>
            </div>
            <div style="padding: 20px 0; line-height: 1.6; color: #333333;">
              <p>Xin chào <strong>${shop.fullname}</strong>,</p>
              <p>Ban quản trị hệ thống <strong>Shoes Store</strong> rất tiếc phải thông báo hồ sơ đăng ký gian hàng <span style="color: #ee4d2d; font-weight: bold;">${shop.store_name}</span> của bạn <strong>KHÔNG ĐƯỢC PHÊ DUYỆT</strong>.</p>
              
              <div style="background-color: #f9f9f9; border-left: 4px solid #ee4d2d; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 8px 0; color: #ee4d2d;">Lý do cụ thể từ Điều hành viên:</h4>
                <p style="margin: 0; font-style: italic;">"${finalReason}"</p>
              </div>

              <p>Bạn hoàn toàn có thể nhấn nút <strong>"Đăng ký mở shop"</strong> trên giao diện để tiến hành nộp lại một bộ hồ sơ mới sau khi đã chỉnh sửa các thông tin còn thiếu sót.</p>
            </div>
            <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #777777;">
              <p>© 2026 Shoes Store. All Rights Reserved.</p>
            </div>
          </div>
        `
        return EmailProvider.sendEmail(
          shop.email,
          `[Shoes Store] Kết quả phê duyệt gian hàng đối tác: ${shop.store_name}`,
          htmlContent
        )
      })
    ).catch(err => {
      console.error('Lỗi gửi mail thông báo từ chối:', err.message)
    })
  }

  return {
    message: `Đã từ chối ${affectedStores} hồ sơ đăng ký cửa hàng. Chủ shop có thể đăng ký lại sau khi chỉnh sửa thông tin.`
  }
}

// D. Khóa cửa hàng (giữ nguyên logic cũ)
const banStoresBulk = async (storeIds, reason) => {
  if (!Array.isArray(storeIds) || storeIds.length === 0) {
    throw new Error('Danh sách ID cửa hàng cần khóa không hợp lệ.')
  }

  const targets = await managerStoreModel.getStoresAndOwnersInfo(storeIds)

  // Chuyển trạng thái is_active = false
  const affectedStores = await managerStoreModel.updateStoresStatusBulk(storeIds, false)
  if (affectedStores === 0) throw new Error('Không có cửa hàng nào bị tác động.')

  // Ẩn toàn bộ sản phẩm
  const affectedProducts = await managerStoreModel.disableProductsByStoreIds(storeIds)

  // Gửi thông báo
  if (targets.length > 0) {
    Promise.all(
      targets.map(async (shop) => {
        let logoUrl = ''
        try {
          const parsedLogo = shop.logo ? (typeof shop.logo === 'string' ? JSON.parse(shop.logo) : shop.logo) : null
          if (parsedLogo && parsedLogo.secure_url) logoUrl = parsedLogo.secure_url
        } catch (e) {
          console.log('Không thể parse logo:', e.message)
        }

        await notificationService.createAndPushNotification({
          userId: shop.owner_id,
          title: 'CẢNH BÁO KHÓA GIAN HÀNG',
          content: JSON.stringify({
            message: `Cửa hàng "${shop.store_name}" của bạn đã bị đình chỉ do vi phạm. Lý do: ${reason || 'Vi phạm chính sách kinh doanh'}`,
            image: logoUrl
          }),
          type: NOTIFICATION_TYPES.STORE_BANNED,
          referenceId: shop.store_id
        }).catch(err => console.error(err))
      })
    ).catch(err => {
      console.error('Lỗi gửi mail thông báo ban shop:', err.message)
    })
  }

  return {
    message: `Đã tạm dừng hoạt động đối với ${affectedStores} cửa hàng vi phạm, hệ thống đã tự động ẩn ${affectedProducts} sản phẩm liên quan.`
  }
}

const getStoreDetail = async (storeId) => {
  if (!storeId) throw new Error('Mã cửa hàng (ID) không hợp lệ.')

  const store = await managerStoreModel.getStoreDetailForManager(storeId)
  if (!store) throw new Error('Cửa hàng không tồn tại trên hệ thống.')

  return store
}

const approveStoreSingle = async (storeId) => {
  return await approveStoresBulk([Number(storeId)])
}

const rejectStoreSingle = async (storeId, reason) => {
  return await rejectStoresBulk([Number(storeId)], reason)
}

const banStoreSingle = async (storeId, reason) => {
  return await banStoresBulk([Number(storeId)], reason)
}

export const managerStoreService = {
  getStoresList,
  approveStoresBulk,
  banStoresBulk,
  rejectStoresBulk,
  getStoreDetail,
  approveStoreSingle,
  rejectStoreSingle,
  banStoreSingle
}