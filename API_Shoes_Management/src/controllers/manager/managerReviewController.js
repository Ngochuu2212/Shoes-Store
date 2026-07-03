import { managerReviewService } from '~/services/manager/managerReviewService'

const getReportedReviews = async (req, res) => {
  try {
    const result = await managerReviewService.getReportedReviewsList(req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách tố cáo: ${error.message}` })
  }
}

const getReviewDetail = async (req, res) => {
  try {
    const { id } = req.params
    const { type } = req.query

    const result = await managerReviewService.getReviewDetail(Number(id), type)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy chi tiết đơn tố cáo: ${error.message}` })
  }
}

const resolveReviewsBulk = async (req, res) => {
  try {
    const { type } = req.query
    const { reviewIds, action } = req.body

    const result = await managerReviewService.resolveReviewsBulk(reviewIds, type, action)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý phân xử khiếu nại hàng loạt: ${error.message}` })
  }
}

export const managerReviewController = {
  getReportedReviews,
  getReviewDetail,
  resolveReviewsBulk
}