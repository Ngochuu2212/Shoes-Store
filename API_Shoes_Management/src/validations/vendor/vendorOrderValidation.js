import Joi from 'joi'
import { ORDER_STATUS } from '~/utils/constants'

// 1. Kiểm duyệt bộ lọc danh sách đơn hàng (Query Params)
const validateGetOrdersFilters = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
    status: Joi.string().valid(...Object.values(ORDER_STATUS)).optional().allow(null, ''),
    searchOrderId: Joi.number().integer().positive().optional(),
    paymentMethod: Joi.string().trim().optional(),
    startDate: Joi.string().isoDate().optional(),
    endDate: Joi.string().isoDate().optional()
  })

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số bộ lọc danh sách đơn hàng không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Kiểm duyệt khi cập nhật trạng thái đơn lẻ
const validateUpdateStatusBody = async (req, res, next) => {
  const paramCondition = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã đơn hàng phải là định dạng số.'
    })
  })

  const bodyCondition = Joi.object({
    status: Joi.string().valid(...Object.values(ORDER_STATUS)).required().messages({
      'any.only': 'Trạng thái cập nhật đơn hàng không hợp lệ.',
      'any.required': 'Trạng thái đơn hàng là bắt buộc.'
    })
  })

  try {
    await paramCondition.validateAsync(req.params)
    await bodyCondition.validateAsync(req.body)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu cập nhật trạng thái đơn hàng không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 3. Kiểm duyệt khi phản hồi yêu cầu hủy đơn từ khách hàng
const validateCancelRequestBody = async (req, res, next) => {
  const paramCondition = Joi.object({
    id: Joi.number().integer().positive().required()
  })

  const bodyCondition = Joi.object({
    decision: Joi.string().valid('accept', 'reject').required().messages({
      'any.only': 'Quyết định xử lý chỉ được phép chọn chấp nhận (accept) hoặc từ chối (reject).',
      'any.required': 'Quyết định xử lý hủy đơn là bắt buộc.'
    }),
    reason: Joi.string().max(500).trim().optional().allow('', null)
  })

  try {
    await paramCondition.validateAsync(req.params)
    await bodyCondition.validateAsync(req.body)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu phản hồi yêu cầu hủy đơn không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 4. Kiểm duyệt khi bấm checkbox cập nhật trạng thái hàng loạt
const validateUpdateStatusBulkBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    orderIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.base': 'Danh sách mã đơn hàng phải là một mảng dữ liệu số.',
      'array.min': 'Vui lòng tích chọn tối thiểu 1 đơn hàng để xử lý hàng loạt.'
    }),
    targetStatus: Joi.string().valid(ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED).required().messages({
      'any.only': 'Trạng thái đích cập nhật hàng loạt không hợp lệ.'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu xử lý hàng loạt đơn hàng không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const vendorOrderValidation = {
  validateGetOrdersFilters,
  validateUpdateStatusBody,
  validateCancelRequestBody,
  validateUpdateStatusBulkBody
}