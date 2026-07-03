import Joi from 'joi'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constants'

// 1. Kiểm duyệt bộ lọc danh sách sản phẩm chờ duyệt toàn sàn (Query Params)
const validateGetProductsFilters = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
    search: Joi.string().allow('', null).trim().optional(),
    categoryId: Joi.number().integer().positive().optional().allow('', null),
    storeId: Joi.number().integer().positive().optional().allow('', null),

    // Ép cứng trạng thái lọc phải nằm trong bộ hằng số kiểm duyệt chuẩn
    status: Joi.string().valid(...Object.values(PRODUCT_MODERATION_STATUS)).optional().allow('', null).messages({
      'any.only': 'Trạng thái kiểm duyệt (status) bộ lọc không hợp lệ.'
    }),
    sortBy: Joi.string().valid('created_at', 'price', 'sold', 'name').optional().default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional().default('DESC')
  })

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số bộ lọc danh sách kiểm duyệt sản phẩm không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Kiểm duyệt khi duyệt/từ chối/khóa đơn lẻ 1 sản phẩm
const validateToggleProductActiveBody = async (req, res, next) => {
  const paramCondition = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã định danh sản phẩm phải là định dạng số.'
    })
  })

  const bodyCondition = Joi.object({
    targetStatus: Joi.string().valid(...Object.values(PRODUCT_MODERATION_STATUS)).required().messages({
      'any.only': 'Trạng thái mục tiêu kiểm duyệt (targetStatus) không hợp lệ.',
      'any.required': 'Trạng thái mục tiêu chuyển đổi là bắt buộc.'
    }),

    // Nếu từ chối (rejected) hoặc phạt khóa (banned), ép buộc phải gõ lý do nghiêm túc
    reason: Joi.string().when('targetStatus', {
      is: Joi.string().valid(PRODUCT_MODERATION_STATUS.REJECTED, PRODUCT_MODERATION_STATUS.BANNED),
      then: Joi.string().min(5).max(500).trim().required().messages({
        'string.empty': 'Khi từ chối hoặc khóa sản phẩm vi phạm, bắt buộc phải nhập lý do phản hồi cho Shop.',
        'string.min': 'Vui lòng ghi nội dung lý do xử phạt chi tiết (tối thiểu 5 ký tự trở lên).'
      }),
      otherwise: Joi.string().max(500).trim().optional().allow('', null)
    })
  })

  try {
    await paramCondition.validateAsync(req.params)
    await bodyCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu xác nhận trạng thái sản phẩm không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 3. Kiểm duyệt khi bốc checkbox cập nhật trạng thái HÀNG LOẠT
const validateToggleProductsActiveBulkBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    productIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.base': 'Danh sách mã sản phẩm phải là một mảng dữ liệu số.',
      'array.min': 'Vui lòng tích chọn tối thiểu 1 sản phẩm để thực hiện kiểm duyệt loạt.'
    }),
    targetStatus: Joi.string().valid(...Object.values(PRODUCT_MODERATION_STATUS)).required().messages({
      'any.only': 'Trạng thái đích kiểm duyệt hàng loạt không hợp lệ.'
    }),
    reason: Joi.string().when('targetStatus', {
      is: Joi.string().valid(PRODUCT_MODERATION_STATUS.REJECTED, PRODUCT_MODERATION_STATUS.BANNED),
      then: Joi.string().min(5).max(500).trim().required().messages({
        'string.empty': 'Bắt buộc phải cung cấp lý do tổng quát khi xử lý phạt/từ chối hàng loạt sản phẩm.'
      }),
      otherwise: Joi.string().max(500).trim().optional().allow('', null)
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu kiểm duyệt hàng loạt sản phẩm không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 4. Kiểm duyệt tham số Slug trên đường dẫn URL khi xem chi tiết preview sản phẩm
const validateSlugParam = async (req, res, next) => {
  const correctCondition = Joi.object({
    slug: Joi.string()
      .trim()
      .regex(/^[a-z0-9-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Chuỗi slug định danh sản phẩm không đúng cấu trúc URL hệ thống.'
      })
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số đường dẫn sản phẩm thanh tra không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

const validateProductIdParam = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã định danh sản phẩm phải là định dạng số.',
      'number.positive': 'Mã sản phẩm phải là số dương.',
      'any.required': 'Mã sản phẩm là bắt buộc.'
    })
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số đường dẫn sản phẩm không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const managerProductValidation = {
  validateGetProductsFilters,
  validateToggleProductActiveBody,
  validateToggleProductsActiveBulkBody,
  validateSlugParam,
  validateProductIdParam
}