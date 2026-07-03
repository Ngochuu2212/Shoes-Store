import { managerProductModel } from '~/models/manager/product/managerProductModel'
import { PRODUCT_MODERATION_STATUS, NOTIFICATION_TYPES } from '~/utils/constants'
import { EmailProvider } from '~/providers/EmailProvider'
import { notificationService } from '~/services/notification/notificationService'

// 1. GET: Lấy danh sách sản phẩm kèm dữ liệu phân trang và bộ chỉ số Widgets toàn diện
const getProductsList = async (filters) => {
  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    search: filters.search || null,
    categoryId: filters.categoryId || null,
    storeId: filters.storeId || null,
    status: filters.status || null,
    sortBy: filters.sortBy || 'created_at',
    sortOrder: filters.sortOrder || 'DESC',
    limit,
    offset
  }

  const [products, totalItems, overviewStats] = await Promise.all([
    managerProductModel.getProductsForManager(filterParams),
    managerProductModel.countProductsForManager(filterParams),
    managerProductModel.getProductsOverviewStats()
  ])

  return {
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    products
  }
}

// 2. Tiếp nhận targetStatus chuyển đổi trạng thái chủ động
const toggleProductActive = async (productId, targetStatus, reason) => {
  if (!Object.values(PRODUCT_MODERATION_STATUS).includes(targetStatus)) {
    throw new Error('Trạng thái mục tiêu kiểm duyệt sản phẩm không hợp lệ.')
  }

  const info = await managerProductModel.getProductAndOwnerInfo(productId)
  if (!info) throw new Error('Sản phẩm yêu cầu kiểm duyệt không tồn tại trên hệ thống.')

  const oldStatus = info.status

  // Cập nhật trạng thái mới xuống Database
  const affectedRows = await managerProductModel.updateProductModerationStatus(productId, targetStatus, reason)
  if (affectedRows === 0) throw new Error('Cập nhật trạng thái sản phẩm thất bại.')

  let thumbnail = ''
  try {
    const parsedImages = typeof info.images === 'string' ? JSON.parse(info.images) : info.images
    if (parsedImages && parsedImages.length > 0) thumbnail = parsedImages[0].secure_url
  } catch (error) { console.log('Không parse được ảnh giày') }

  let notiTitle = ''
  let notiType = ''

  // MAP SANG TYPE CỦA NOTIFICATION
  if (targetStatus === PRODUCT_MODERATION_STATUS.APPROVED) {
    notiTitle = 'Sản phẩm đã được duyệt'
    notiType = NOTIFICATION_TYPES.PRODUCT_APPROVED
  } else if (targetStatus === PRODUCT_MODERATION_STATUS.REJECTED) {
    notiTitle = 'Sản phẩm bị từ chối'
    notiType = NOTIFICATION_TYPES.PRODUCT_REJECTED
  } else if (targetStatus === PRODUCT_MODERATION_STATUS.BANNED) {
    notiTitle = 'CẢNH BÁO KHÓA SẢN PHẨM'
    notiType = NOTIFICATION_TYPES.PRODUCT_BANNED
  }

  if (notiTitle) {
    await notificationService.createAndPushNotification({
      userId: info.owner_id,
      title: notiTitle,
      content: JSON.stringify({
        message: targetStatus === PRODUCT_MODERATION_STATUS.APPROVED ? `Sản phẩm ${info.product_name} đã sẵn sàng giao dịch.` : `Sản phẩm ${info.product_name} đã bị đình chỉ/từ chối.`,
        image: thumbnail
      }),
      type: notiType,
      referenceId: productId
    }).catch(err => console.error(err))
  }

  // Xây dựng kịch bản Mail thương mại điện tử chuyên nghiệp
  let emailSubject = ''
  let htmlContent = ''
  const finalReason = reason?.trim() ? reason : 'Hình ảnh sản phẩm cần rõ ràng hơn hoặc mô tả sản phẩm chưa đúng quy chuẩn thương hiệu.'

  // KỊCH BẢN APPROVED: Phê duyệt mở bán công khai
  if (targetStatus === PRODUCT_MODERATION_STATUS.APPROVED) {
    const isFromBan = (oldStatus === PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL || oldStatus === PRODUCT_MODERATION_STATUS.BANNED)

    emailSubject = isFromBan
      ? `[ShoesStore] 🎉 Chúc mừng: Sản phẩm [${info.product_name}] đã được gỡ bỏ án phạt thành công!`
      : `[ShoesStore] ✨ Thông báo: Sản phẩm [${info.product_name}] đã vượt qua vòng kiểm duyệt`

    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0f766e; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">SHOES STORE MARKETPLACE</h2>
        </div>
        <div style="padding: 30px; background-color: #ffffff; color: #334155; line-height: 1.6;">
          <h3 style="color: #0f766e; margin-top: 0;">${isFromBan ? '🚀 PHÊ DUYỆT LẠI THÀNH CÔNG (GỠ PHẠT)' : '🎉 SẢN PHẨM ĐÃ ĐƯỢC PHÊ DUYỆT ĐĂNG BÁN!'}</h3>
          <p>Xin chào <strong>${info.fullname}</strong> (Chủ gian hàng ${info.store_name}),</p>
          <p>${isFromBan ? 'Hội đồng quản trị đã xem xét lại đơn chỉnh sửa sản phẩm vi phạm của bạn và chấp thuận kích hoạt lại mặt hàng này:' : 'Yêu cầu đăng tải mặt hàng mới của bạn đã được rà soát và phê duyệt thành công công khai toàn sàn:'}</p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0;">🏪 <strong>Mặt hàng:</strong> ${info.product_name}</p>
            <p style="margin: 4px 0 0 0;">🆔 <strong>Mã số hàng hóa (ID):</strong> ${productId}</p>
            <p style="margin: 4px 0 0 0;">⚡ <strong>Chế độ:</strong> <span style="color: #16a34a; font-weight: bold;">Đang hoạt động - Khách hàng có thể tìm kiếm & đặt mua</span></p>
          </div>
          <p>Chúc gian hàng của bạn bùng nổ doanh số cùng Shoes Store!</p>
        </div>
      </div>
    `
  }
  // KỊCH BẢN REJECTED: Từ chối duyệt đăng bán lần đầu
  else if (targetStatus === PRODUCT_MODERATION_STATUS.REJECTED) {
    emailSubject = `[ShoesStore] 🛑 Phản hồi: Từ chối cấp phép hiển thị sản phẩm [${info.product_name}]`
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #d97706; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">SHOES STORE OPERATIONS</h2>
        </div>
        <div style="padding: 30px; background-color: #ffffff; color: #334155; line-height: 1.6;">
          <h3 style="color: #d97706; margin-top: 0;">❌ SẢN PHẨM CHƯA ĐẠT TIÊU CHUẨN HIỂN THỊ</h3>
          <p>Xin chào quản trị viên gian hàng <strong>${info.store_name}</strong>,</p>
          <p>Yêu cầu đăng bán sản phẩm <strong>${info.product_name}</strong> (ID: ${productId}) tạm thời bị từ chối công khai do vấp phải lỗi chính sách hiển thị sau:</p>
          <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 15px; margin: 20px 0; border-radius: 4px; color: #b45309;">
            <strong>⚠️ Lý do chi tiết từ Manager:</strong> "${finalReason}"
          </div>
          <p><strong>🛠️ Hướng khắc phục:</strong> Sản phẩm đã được chuyển về trạng thái <code>Từ chối (Rejected)</code> dưới dạng nháp. Bạn vui lòng vào trang quản lý sản phẩm của Vendor, cập nhật lại dữ liệu/hình ảnh và bấm gửi duyệt lại nhé b.</p>
        </div>
      </div>
    `
  }
  // KỊCH BẢN BANNED: Phát hiện vi phạm nặng, khóa hạ bài ngay lập tức
  else if (targetStatus === PRODUCT_MODERATION_STATUS.BANNED) {
    emailSubject = `[🚨 CẢNH BÁO HẠ BÀI] ShoesStore đã đình chỉ sản phẩm: ${info.product_name}`
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #be123c; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">SHOES STORE TRUST & SAFETY</h2>
        </div>
        <div style="padding: 30px; background-color: #ffffff; color: #334155; line-height: 1.6;">
          <h3 style="color: #be123c; margin-top: 0;">🛑 SẢN PHẨM BỊ KHÓA DO VI PHẠM CHÍNH SÁCH</h3>
          <p>Xin chào chủ shop <strong>${info.store_name}</strong>,</p>
          <p>Hệ thống ghi nhận sản phẩm đang kinh doanh của bạn mang tên <strong>${info.product_name}</strong> (ID: ${productId}) đã vi phạm nghiêm trọng quy chế hoạt động của sàn hoặc nhận đơn khiếu nại bản quyền:</p>
          <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 15px; margin: 20px 0; border-radius: 4px; color: #9f1239;">
            <strong>🚨 Biên bản vi phạm hành chính:</strong> "${finalReason}"
          </div>
          <p><strong>🔒 Biện pháp chế tài:</strong> Mặt hàng trên đã bị chuyển trạng thái thành <code>BANNED</code>, lập tức ẩn hoàn toàn khỏi thanh tìm kiếm và trang bán hàng công khai toàn sàn.</p>
          <p><strong>🛠️ Luồng cứu xét giải trình:</strong> Bạn phải tiến hành chỉnh sửa làm sạch nội dung/hình ảnh hợp pháp. Sau đó, nhấn vào nút <strong>"Gửi yêu cầu giải trình cứu xét"</strong> để đưa sản phẩm về trạng thái <code>Chờ duyệt lại (Pending Reapproval)</code> chờ Manager mở khóa.</p>
        </div>
      </div>
    `
  }

  // Bắn email bất đồng bộ chạy ngầm (Chống block luồng API chính)
  if (emailSubject && htmlContent) {
    EmailProvider.sendEmail(info.email, emailSubject, htmlContent)
      .catch(err => console.error(`Lỗi gửi mail đơn lẻ [${targetStatus}]:`, err.message))
  }

  return { message: `Đã xử lý chuyển trạng thái sản phẩm sang phân hệ [${targetStatus}] thành công!` }
}

// 3. GET: Chi tiết cấu trúc một sản phẩm theo đường dẫn Slug (Giữ nguyên)
const getProductDetail = async (productId) => {
  if (!productId) throw new Error('Đường dẫn cấu trúc sản phẩm (Id) không hợp lệ.')

  const product = await managerProductModel.getProductDetailForManager(productId)
  if (!product) throw new Error('Không tồn tại sản phẩm này trên hệ thống dữ liệu.')

  // Lấy thêm biến thể của sản phẩm
  const variants = await managerProductModel.getProductVariants(product.id)

  return {
    ...product,
    variants: variants || []
  }
}

// 4. Xử lý mảng Checkbox hàng loạt (APPROVED, REJECTED, BANNED)
const toggleProductsActiveBulk = async (productIds, targetStatus, reason) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new Error('Mảng danh sách mã sản phẩm (IDs) trống hoặc không hợp lệ.')
  }
  if (!Object.values(PRODUCT_MODERATION_STATUS).includes(targetStatus)) {
    throw new Error('Trạng thái áp dụng hàng loạt không hợp lệ.')
  }

  // Thực thi cập nhật đồng bộ hàng loạt dưới Database qua câu lệnh IN
  const affectedRows = await managerProductModel.updateProductsStatusBulk(productIds, targetStatus, reason)
  if (affectedRows === 0) throw new Error('Không có sản phẩm nào được thay đổi trạng thái.')

  // Gọi Model bốc thông tin lên để gom nhóm chống spam hòm thư Vendor
  const listInfo = await managerProductModel.getProductsAndOwnersInfoBulk(productIds)
  const groupedEmails = {}

  listInfo.forEach(info => {
    if (!groupedEmails[info.email]) {
      groupedEmails[info.email] = { fullname: info.fullname, store_name: info.store_name, products: [] }
    }
    groupedEmails[info.email].products.push({ id: info.product_id, name: info.product_name })
  })

  // TẠO MAPPING ĐỂ LẤY TYPE NHANH TRONG VÒNG LẶP
  const notiTypeMap = {
    [PRODUCT_MODERATION_STATUS.APPROVED]: NOTIFICATION_TYPES.PRODUCT_APPROVED,
    [PRODUCT_MODERATION_STATUS.REJECTED]: NOTIFICATION_TYPES.PRODUCT_REJECTED,
    [PRODUCT_MODERATION_STATUS.BANNED]: NOTIFICATION_TYPES.PRODUCT_BANNED
  }
  const notiType = notiTypeMap[targetStatus]

  for (const item of listInfo) {
    let thumbnail = ''
    try {
      const parsedImages = typeof item.images === 'string' ? JSON.parse(item.images) : item.images
      if (parsedImages && parsedImages.length > 0) thumbnail = parsedImages[0].secure_url
    } catch (e) { console.log('Không parse được ảnh giày') }

    await notificationService.createAndPushNotification({
      userId: item.owner_id,
      title: 'Cập nhật trạng thái sản phẩm',
      content: JSON.stringify({
        message: `Sản phẩm "${item.product_name}" đã chuyển sang trạng thái: ${targetStatus}`,
        image: thumbnail
      }),
      type: notiType,
      referenceId: item.product_id
    }).catch(err => console.error(err))
  }

  // Quét map bắn email tổng kết cho từng Shop nhận đợt kiểm duyệt hàng loạt
  Object.keys(groupedEmails).forEach(email => {
    const shopData = groupedEmails[email]
    const finalReason = reason?.trim() ? reason : 'Nội dung hoặc hình ảnh sản phẩm chưa đồng bộ quy chế xét duyệt danh mục hàng loạt.'

    const productListHtml = shopData.products
      .map(p => `<li><strong>ID:</strong> ${p.id} - <span style="color:#0f172a;">${p.name}</span></li>`)
      .join('')

    let headerColor = '#0f766e'
    let titleText = 'Thông báo phê duyệt hàng loạt sản phẩm thành công'
    if (targetStatus === PRODUCT_MODERATION_STATUS.REJECTED) { headerColor = '#d97706'; titleText = 'Từ chối cấp phép hàng loạt sản phẩm đăng bán' }
    if (targetStatus === PRODUCT_MODERATION_STATUS.BANNED) { headerColor = '#be123c'; titleText = 'Đình chỉ và khóa hàng loạt mã sản phẩm vi phạm' }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: ${headerColor}; padding: 20px; text-align: center; color: #ffffff;">
          <h3 style="margin: 0; font-size: 16px;">SHOES STORE SYSTEM - MANAGEMENT</h3>
        </div>
        <div style="padding: 25px; background-color: #ffffff; color: #334155; line-height: 1.6;">
          <p>Xin chào chủ cửa hàng đối tác <strong>${shopData.store_name}</strong>,</p>
          <p>Ban điều hành sàn vừa thực hiện đợt rà soát và xử lý hàng loạt. Sau đây là kết quả áp dụng đối với <strong>${shopData.products.length} sản phẩm</strong> của gian hàng:</p>
          
          <ul style="background-color: #f8fafc; padding: 15px 15px 15px 30px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 13px;">
            ${productListHtml}
          </ul>

          <p>⚡ <strong>Trạng thái quy chuẩn mới:</strong> <span style="font-weight: bold; color: ${headerColor}; text-transform: uppercase;">${targetStatus}</span></p>
          <p>📝 <strong>Ghi chú phản hồi tổng hợp từ Manager:</strong> <em>"${finalReason}"</em></p>
        </div>
      </div>
    `

    EmailProvider.sendEmail(email, `[ShoesStore] ${titleText}`, htmlContent)
      .catch(err => console.error('Lỗi bắn email hàng loạt:', err.message))
  })

  return { message: `Đã xử lý hàng loạt thành công, di dời ${affectedRows} sản phẩm sang phân hệ [${targetStatus}].` }
}

export const managerProductService = {
  getProductsList,
  toggleProductActive,
  getProductDetail,
  toggleProductsActiveBulk
}