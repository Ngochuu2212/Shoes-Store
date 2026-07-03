import Joi from 'joi'
import { REVIEW_TYPES } from '~/utils/constants'

// 1. Kiểm duyệt bộ lọc danh sách đánh giá (Query Params)
const validateGetReviewsFilters = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
    type: Joi.string().valid(...Object.values(REVIEW_TYPES)).optional().default(REVIEW_TYPES.PRODUCT),
    rating: Joi.number().integer().min(1).max(5).optional().allow('', null),
    search: Joi.string().allow('', null).trim().optional(),
    isActive: Joi.number().valid(0, 1).optional(),
    isReported: Joi.number().valid(0, 1).optional()
  })

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số bộ lọc danh sách đánh giá không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Kiểm duyệt khi xem chi tiết 1 bình luận
const validateReviewDetailParams = async (req, res, next) => {
  const paramCondition = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã đánh giá phải là định dạng số.'
    })
  })

  const queryCondition = Joi.object({
    type: Joi.string().valid(...Object.values(REVIEW_TYPES)).required().messages({
      'any.only': 'Loại đánh giá thanh tra phải là product hoặc store.',
      'any.required': 'Tham số loại đánh giá (type) là bắt buộc.'
    })
  })

  try {
    await paramCondition.validateAsync(req.params)
    await queryCondition.validateAsync(req.query)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số truy xuất chi tiết đánh giá không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 3. Kiểm duyệt đơn lẻ hoặc hàng loạt khi gửi báo cáo tố cáo bài viết lên sàn
const validateReportReviewsBody = async (req, res, next) => {
  const queryCondition = Joi.object({
    type: Joi.string().valid(...Object.values(REVIEW_TYPES)).required().messages({
      'any.only': 'Loại hình báo cáo đánh giá không hợp lệ.'
    })
  }).unknown(true) // Cho phép đi kèm các query khác nếu có

  const bodyCondition = Joi.object({
    reviewIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.base': 'Danh sách mã đánh giá phải là một mảng dữ liệu số.',
      'array.min': 'Vui lòng chọn tối thiểu 1 bình luận đánh giá để gửi báo cáo vi phạm.'
    }),
    reason: Joi.string().min(5).max(500).trim().required().messages({
      'string.empty': 'Vui lòng cung cấp lý do cụ thể để gửi đơn tố cáo lên Ban quản trị.',
      'string.min': 'Lý do báo cáo vi phạm phải dài từ 5 ký tự trở lên để đảm bảo tính xác thực.'
    })
  })

  try {
    // Nếu là route tố cáo đơn lẻ, bốc id từ param ép vào mảng reviewIds ở body luôn
    if (req.params.id) {
      const paramCondition = Joi.object({ id: Joi.number().integer().positive().required() })
      await paramCondition.validateAsync(req.params)
      req.body.reviewIds = [Number(req.params.id)]
    }

    await queryCondition.validateAsync(req.query)
    await bodyCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu đệ trình báo cáo vi phạm đánh giá không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 4. Kiểm duyệt khi gửi giải trình xin mở lại bài viết bị ẩn
const validateRequestReopenBody = async (req, res, next) => {
  const queryCondition = Joi.object({
    type: Joi.string().valid(...Object.values(REVIEW_TYPES)).required()
  }).unknown(true)

  const bodyCondition = Joi.object({
    reviewIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.min': 'Vui lòng chọn tối thiểu 1 đánh giá để gửi đơn khiếu nại cứu xét.'
    }),
    reason: Joi.string().min(10).max(500).trim().optional().allow('', null).messages({
      'string.min': 'Nội dung giải trình cứu xét mở lại bài viết phải từ 10 ký tự trở lên.'
    })
  })

  try {
    await queryCondition.validateAsync(req.query)
    await bodyCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu gửi đơn khiếu nại mở lại bài viết không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const vendorReviewValidation = {
  validateGetReviewsFilters,
  validateReviewDetailParams,
  validateReportReviewsBody,
  validateRequestReopenBody
}