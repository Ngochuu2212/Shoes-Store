import Joi from 'joi'

// 1. Kiểm duyệt khi tạo mới hoặc cập nhật mã khuyến mãi hệ thống
const validatePromotionBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().min(2).max(50).trim().required().messages({
      'string.empty': 'Mã giảm giá (name) không được để trống.',
      'string.min': 'Mã giảm giá phải có độ dài từ 2 ký tự trở lên.',
      'any.required': 'Mã giảm giá là thông tin bắt buộc.'
    }),
    description: Joi.string().max(500).trim().optional().allow('', null),
    discount_value: Joi.number().integer().min(1).max(100).required().messages({
      'number.min': 'Phần trăm giảm giá tối thiểu là 1%.',
      'number.max': 'Phần trăm giảm giá tối đa không vượt quá 100%.',
      'any.required': 'Giá trị giảm giá (%) là bắt buộc.'
    }),
    min_order_value: Joi.number().min(0).required().messages({
      'number.min': 'Giá trị đơn hàng tối thiểu không được là số âm.',
      'any.required': 'Giá trị đơn hàng tối thiểu để áp mã là bắt buộc.'
    }),
    max_discount_amount: Joi.number().min(0).optional().allow(null, '').messages({
      'number.min': 'Mức giảm tối đa không được là số âm.'
    }),
    start_date: Joi.string().isoDate().required().messages({
      'string.isoDate': 'Ngày bắt đầu không đúng định dạng.',
      'any.required': 'Ngày bắt đầu kích hoạt mã là bắt buộc.'
    }),
    end_date: Joi.string().isoDate().required().messages({
      'string.isoDate': 'Ngày kết thúc không đúng định dạng.',
      'any.required': 'Ngày hết hạn mã là bắt buộc.'
    }),
    is_active: Joi.number().valid(0, 1).optional().default(1)
  })

  try {
    if (req.params.id) {
      const paramCondition = Joi.object({ id: Joi.number().integer().positive().required() })
      await paramCondition.validateAsync(req.params)
    }
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu mã khuyến mãi hệ thống không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Kiểm duyệt ID trên URL
const validateIdParam = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã định danh phải là định dạng số.'
    })
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số ID trên URL không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 3. Kiểm duyệt bộ lọc danh sách
const validateGetPromotionsFilters = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    search: Joi.string().allow('', null).trim().optional(),
    is_active: Joi.number().valid(0, 1).optional(),
    start_date: Joi.string().isoDate().optional(),
    end_date: Joi.string().isoDate().optional(),
    sortBy: Joi.string().valid('created_at', 'discount_value', 'end_date').optional(),
    sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional()
  })

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số bộ lọc không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 4. Kiểm duyệt nút gạt Switch
const validateToggleActiveSingleBody = async (req, res, next) => {
  const paramCondition = Joi.object({ id: Joi.number().integer().positive().required() })
  const bodyCondition = Joi.object({
    isActive: Joi.number().valid(0, 1).required().messages({
      'any.required': 'Trạng thái isActive (1 hoặc 0) là bắt buộc.'
    })
  })

  try {
    await paramCondition.validateAsync(req.params)
    await bodyCondition.validateAsync(req.body)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu cập nhật trạng thái không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 5. Kiểm duyệt mảng ID từ Checkbox
const validateBulkIdsBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    promotionIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.base': 'Danh sách mã khuyến mãi phải là một mảng dữ liệu.',
      'array.min': 'Vui lòng tích chọn ít nhất 1 mã khuyến mãi để thao tác.'
    }),
    isActive: Joi.number().valid(0, 1).optional()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Danh sách mã xử lý hàng loạt không đúng định dạng.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const managerPromotionValidation = {
  validatePromotionBody,
  validateIdParam,
  validateGetPromotionsFilters,
  validateToggleActiveSingleBody,
  validateBulkIdsBody
}
