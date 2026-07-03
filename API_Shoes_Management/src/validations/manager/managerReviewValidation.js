import Joi from 'joi'
import { REVIEW_TYPES } from '~/utils/constants'

// 1. Kiểm duyệt bộ lọc danh sách đánh giá bị tố cáo (Query Params)
const validateGetReportedReviewsFilters = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),

    // Ép cứng loại tố cáo theo constants hệ thống
    type: Joi.string().valid(...Object.values(REVIEW_TYPES)).optional().default(REVIEW_TYPES.PRODUCT).messages({
      'any.only': 'Tham số phân loại (type) chỉ được phép chọn product hoặc store.'
    }),

    rating: Joi.number().integer().min(1).max(5).optional().allow('', null),
    search: Joi.string().allow('', null).trim().optional(),
    storeId: Joi.number().integer().positive().optional().allow('', null),
    startDate: Joi.string().isoDate().optional(),
    endDate: Joi.string().isoDate().optional(),
    sortBy: Joi.string().allow('', null).trim().optional(),
    sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional()
  })

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số bộ lọc danh sách bài viết bị tố cáo không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Kiểm duyệt khi xem chi tiết 1 đơn tố cáo đơn lẻ
const validateReviewDetailParams = async (req, res, next) => {
  const paramCondition = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã định danh đánh giá phải là định dạng số số.'
    })
  })

  const queryCondition = Joi.object({
    type: Joi.string().valid(...Object.values(REVIEW_TYPES)).required().messages({
      'any.only': 'Tham số loại hình đánh giá (type) không hợp lệ.'
    })
  })

  try {
    await paramCondition.validateAsync(req.params)
    await queryCondition.validateAsync(req.query)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số truy xuất chi tiết bài viết bị tố cáo không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 3. Kiểm duyệt khi bấm phân xử khiếu nại (Duyệt ẩn bài / Bác bỏ đơn tố cáo) HÀNG LOẠT
const validateResolveReviewsBulkBody = async (req, res, next) => {
  const queryCondition = Joi.object({
    type: Joi.string().valid(...Object.values(REVIEW_TYPES)).required().messages({
      'any.only': 'Tham số phân loại đánh giá (type) trên URL không hợp lệ.'
    })
  }).unknown(true)

  const bodyCondition = Joi.object({
    reviewIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.base': 'Danh sách mã đánh giá phải là một mảng dữ liệu số.',
      'array.min': 'Vui lòng tích chọn tối thiểu 1 đánh giá để thực thi lệnh phân xử.'
    }),

    // SỬA: Đồng bộ action với service - chỉ chấp nhận 'approved' hoặc 'rejected'
    action: Joi.string().valid('approved', 'rejected').required().messages({
      'any.only': 'Hành động phân xử (action) không hợp lệ. Chỉ chấp nhận approved hoặc rejected.',
      'any.required': 'Hành động phân xử là thông tin bắt buộc.'
    })
  })

  try {
    await queryCondition.validateAsync(req.query)
    await bodyCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu thực thi lệnh phân xử khiếu nại không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const managerReviewValidation = {
  validateGetReportedReviewsFilters,
  validateReviewDetailParams,
  validateResolveReviewsBulkBody
}