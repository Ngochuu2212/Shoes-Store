import { managerReviewModel } from '~/models/manager/review/managerReviewModel'
import { REVIEW_TYPES, NOTIFICATION_TYPES } from '~/utils/constants'
import { notificationService } from '~/services/notification/notificationService'

// 1. Tải danh sách đơn khiếu nại kèm phân trang, tìm kiếm, lọc nâng cao và Widgets
const getReportedReviewsList = async (filters) => {
  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit
  const reviewType = filters.type || REVIEW_TYPES.PRODUCT

  const filterParams = {
    search: filters.search || null,
    rating: filters.rating || null,
    storeId: filters.storeId || null,
    startDate: filters.startDate || null,
    endDate: filters.endDate || null,
    sortBy: filters.sortBy || null,
    sortOrder: filters.sortOrder || null,
    limit,
    offset
  }

  let reviews = []
  let totalItems = 0

  // Lấy thông số Widgets nạp lên đầu trang
  const [overviewStats] = await Promise.all([
    managerReviewModel.getManagerReviewsOverviewStats()
  ])

  // Rẽ nhánh xử lý mượt mà dựa vào hằng số toàn cục
  if (reviewType === REVIEW_TYPES.PRODUCT) {
    [reviews, totalItems] = await Promise.all([
      managerReviewModel.getReportedProductReviews(filterParams),
      managerReviewModel.countReportedProductReviews(filterParams)
    ])
  } else if (reviewType === REVIEW_TYPES.STORE) {
    [reviews, totalItems] = await Promise.all([
      managerReviewModel.getReportedStoreReviews(filterParams),
      managerReviewModel.countReportedStoreReviews(filterParams)
    ])
  } else {
    throw new Error('Loại khiếu nại (type) không hợp lệ. Chỉ chấp nhận \'product\' hoặc \'store\'.')
  }

  return {
    overview: overviewStats,
    pagination: { totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page, limit },
    reviews
  }
}

// 2. Xem chi tiết thông tin một đơn tố cáo
const getReviewDetail = async (reviewId, reviewType) => {
  let review = null

  if (reviewType === REVIEW_TYPES.PRODUCT) {
    review = await managerReviewModel.getProductReviewDetail(reviewId)
  } else if (reviewType === REVIEW_TYPES.STORE) {
    review = await managerReviewModel.getStoreReviewDetail(reviewId)
  } else {
    throw new Error('Phân loại đánh giá không hợp lệ.')
  }

  if (!review) throw new Error('Không tìm thấy dữ liệu chi tiết của mã khiếu nại này.')
  return review
}

// 3. Xử lý giải quyết khiếu nại hàng loạt (Checkbox & Đơn lẻ)
const resolveReviewsBulk = async (reviewIds, reviewType, action) => {
  if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
    throw new Error('Danh sách ID đánh giá cần xử lý không hợp lệ.')
  }

  if (action !== 'approved' && action !== 'rejected') {
    throw new Error('Hành động xử lý (action) không hợp lệ. Chỉ chấp nhận \'approved\' hoặc \'rejected\'.')
  }

  const targetsInfo = await managerReviewModel.getReviewOwnersInfoBulk(reviewIds, reviewType)

  let affectedRows = 0
  if (reviewType === REVIEW_TYPES.PRODUCT) {
    affectedRows = await managerReviewModel.handleProductReviewsBulk(reviewIds, action)
  } else if (reviewType === REVIEW_TYPES.STORE) {
    affectedRows = await managerReviewModel.handleStoreReviewsBulk(reviewIds, action)
  } else {
    throw new Error('Loại đánh giá không hợp lệ để xử lý khớp lệnh.')
  }

  if (affectedRows === 0) {
    throw new Error('Thao tác thất bại! Đánh giá này có thể đã được phân xử hoặc chưa từng bị khiếu nại.')
  }

  // Đưa khai báo biến vào trong vòng lặp map và làm gọn chuỗi
  if (targetsInfo.length > 0) {
    await Promise.all(
      targetsInfo.map(async (info) => {
        // Khai báo biến cục bộ bên trong để tránh lỗi Closure Reassignment của ESLint
        let isBannedStr = ''
        let notiType = ''

        // Ép kiểu an toàn để né lỗi strict equality (===)
        const isActive = Number(info.is_active) === 1

        if (action === 'approved') {
          if (isActive) {
            isBannedStr = `Đơn tố cáo thành công. Hệ thống đã ẩn đánh giá của khách hàng ${info.reviewer_name}.`
            notiType = NOTIFICATION_TYPES.REVIEW_RESOLVED_BANNED
          } else {
            isBannedStr = `Yêu cầu thành công. Đánh giá của khách hàng ${info.reviewer_name} đã được khôi phục.`
            notiType = NOTIFICATION_TYPES.REVIEW_RESOLVED_APPROVED
          }
        } else if (isActive) {
          isBannedStr = `Đơn tố cáo bị bác bỏ. Đánh giá của khách hàng ${info.reviewer_name} vẫn hiển thị.`
          notiType = NOTIFICATION_TYPES.REVIEW_RESOLVED_APPROVED
        } else {
          isBannedStr = `Yêu cầu mở lại bị từ chối. Đánh giá của khách hàng ${info.reviewer_name} vẫn bị ẩn.`
          notiType = NOTIFICATION_TYPES.REVIEW_RESOLVED_BANNED
        }

        return notificationService.createAndPushNotification({
          userId: info.owner_id,
          title: 'Kết quả giải quyết khiếu nại',
          content: JSON.stringify({
            message: isBannedStr,
            image: ''
          }),
          type: notiType,
          referenceId: info.review_id
        }).catch(err => console.error('Lỗi bắn socket review:', err.message))
      })
    )
  }

  return {
    message: `Đã phân xử thành công cho ${affectedRows} đơn khiếu nại đánh giá.`
  }
}

export const managerReviewService = {
  getReportedReviewsList,
  getReviewDetail,
  resolveReviewsBulk
}