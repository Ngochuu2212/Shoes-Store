import { vendorReviewService } from '~/services/vendor/vendorReviewService'

const getVendorReviews = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await vendorReviewService.getVendorReviews(userId, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi lấy danh sách đánh giá: ${error.message}` })
  }
}

const getReviewDetail = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { type } = req.query

    const result = await vendorReviewService.getReviewDetail(userId, Number(id), type)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi lấy chi tiết đánh giá: ${error.message}` })
  }
}

const reportReview = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { type } = req.query
    const { reviewIds, reason } = req.body

    const result = await vendorReviewService.reportReviewsBulk(userId, reviewIds, type, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi gửi báo cáo khiếu nại đánh giá: ${error.message}` })
  }
}

const reportReviewsBulk = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { type } = req.query
    const { reviewIds, reason } = req.body

    const result = await vendorReviewService.reportReviewsBulk(userId, reviewIds, type, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi gửi báo cáo khiếu nại hàng loạt đánh giá: ${error.message}` })
  }
}

const requestReviewsReopenBulk = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { type } = req.query
    const { reviewIds, reason } = req.body

    const result = await vendorReviewService.requestReviewsReopenBulk(userId, reviewIds, type, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi gửi yêu cầu mở lại đánh giá: ${error.message}` })
  }
}

export const vendorReviewController = {
  getVendorReviews,
  getReviewDetail,
  reportReview,
  reportReviewsBulk,
  requestReviewsReopenBulk
}