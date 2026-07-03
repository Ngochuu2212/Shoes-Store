import Joi from 'joi'

// 1. Kiểm duyệt khi tạo mới hoặc cập nhật chương trình khuyến mãi (Dùng chung body)
const validatePromotionBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().min(2).max(50).trim().required().messages({
      'string.empty': 'Mã giảm giá (name) không được để trống.',
      'string.min': 'Mã giảm giá phải có độ dài từ 2 ký tự trở lên.',
      'any.required': 'Mã giảm giá là thông tin bắt buộc.'
    }),
    description: Joi.string().max(500).trim().optional().allow('', null),

    // Giá trị giảm theo phần trăm từ 1 - 100%
    discount_value: Joi.number().integer().min(1).max(100).required().messages({
      'number.min': 'Phần trăm giảm giá tối thiểu là 1%.',
      'number.max': 'Phần trăm giảm giá tối đa không vượt quá 100%.',
      'any.required': 'Giá trị giảm giá (%) là bắt buộc.'
    }),

    // Đơn hàng tối thiểu không được âm
    min_order_value: Joi.number().min(0).required().messages({
      'number.min': 'Giá trị đơn hàng tối thiểu không được là số âm.',
      'any.required': 'Giá trị đơn hàng tối thiểu để áp mã là bắt buộc.'
    }),

    max_discount_amount: Joi.number().min(0).optional().allow(null, '').messages({
      'number.min': 'Mức giảm tối đa không được là số âm.'
    }),

    // Kiểm duyệt định dạng ngày tháng ISO
    start_date: Joi.string().isoDate().required().messages({
      'string.isoDate': 'Ngày bắt đầu không đúng định dạng ngày tháng.',
      'any.required': 'Ngày bắt đầu kích hoạt mã là bắt buộc.'
    }),
    end_date: Joi.string().isoDate().required().messages({
      'string.isoDate': 'Ngày kết thúc không đúng định dạng ngày tháng.',
      'any.required': 'Ngày hết hạn mã là bắt buộc.'
    }),

    is_active: Joi.number().valid(0, 1).optional().default(1)
  })

  try {
    // Nếu là route Update, kiểm duyệt thêm ID trên URL param
    if (req.params.id) {
      const paramCondition = Joi.object({ id: Joi.number().integer().positive().required() })
      await paramCondition.validateAsync(req.params)
    }

    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu chương trình khuyến mãi không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Kiểm duyệt ID trên URL (Dùng cho Xóa lẻ, Xem chi tiết)
const validateIdParam = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã định danh chương trình phải là định dạng số.'
    })
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số mã khuyến mãi trên URL không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 3. Kiểm duyệt bộ lọc danh sách khuyến mãi (Query Params)
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
      message: 'Tham số bộ lọc danh sách khuyến mãi không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 4. Kiểm duyệt nút gạt Switch ẩn/hiện đơn lẻ cuối dòng Table
const validateToggleActiveSingleBody = async (req, res, next) => {
  const paramCondition = Joi.object({ id: Joi.number().integer().positive().required() })
  const bodyCondition = Joi.object({
    isActive: Joi.number().valid(0, 1).required().messages({
      'any.required': 'Trạng thái hoạt động isActive (1 hoặc 0) là bắt buộc.'
    })
  })

  try {
    await paramCondition.validateAsync(req.params)
    await bodyCondition.validateAsync(req.body)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu cập nhật trạng thái hoạt động không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 5. Kiểm duyệt mảng ID từ Checkbox (Dùng chung cho Hủy loạt, Xóa loạt)
const validateBulkIdsBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    promotionIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.base': 'Danh sách mã khuyến mãi phải là một mảng dữ liệu.',
      'array.min': 'Vui lòng tích chọn ít nhất 1 chương trình khuyến mãi để thao tác.'
    }),
    isActive: Joi.number().valid(0, 1).optional() // Chỉ dùng khi bật tắt loạt
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

export const vendorPromotionValidation = {
  validatePromotionBody,
  validateIdParam,
  validateGetPromotionsFilters,
  validateToggleActiveSingleBody,
  validateBulkIdsBody
}