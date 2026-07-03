import Joi from 'joi'

// 1. Kiểm duyệt dữ liệu khi User viết đánh giá sản phẩm (Kèm mảng ảnh)
const validateProductReviewBody = async (req, res, next) => {
  const paramCondition = Joi.object({
    orderId: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã đơn hàng trên URL phải là định dạng số.',
      'any.required': 'Mã đơn hàng là tham số bắt buộc.'
    })
  })

  const bodyCondition = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.base': 'Số sao đánh giá phải là định dạng số.',
      'number.min': 'Số sao đánh giá thấp nhất là 1 sao.',
      'number.max': 'Số sao đánh giá cao nhất là 5 sao.',
      'any.required': 'Số sao đánh giá sản phẩm là bắt buộc.'
    }),
    comment: Joi.string().min(5).max(1000).trim().required().messages({
      'string.empty': 'Nội dung nhận xét sản phẩm không được để trống.',
      'string.min': 'Nội dung nhận xét phải có ít nhất 5 ký tự.',
      'string.max': 'Nội dung nhận xét không được vượt quá 1000 ký tự.',
      'any.required': 'Nội dung nhận xét là thông tin bắt buộc.'
    })
  })

  try {
    await paramCondition.validateAsync(req.params)
    await bodyCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu đánh giá sản phẩm gửi lên không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Kiểm duyệt dữ liệu khi User viết đánh giá gian hàng (Store)
const validateStoreReviewBody = async (req, res, next) => {
  const paramCondition = Joi.object({
    orderId: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã đơn hàng trên URL phải là định dạng số.'
    })
  })

  const bodyCondition = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'Số sao đánh giá cửa hàng tối thiểu là 1 sao.',
      'number.max': 'Số sao đánh giá cửa hàng tối đa là 5 sao.',
      'any.required': 'Số sao đánh giá cửa hàng là bắt buộc.'
    }),
    comment: Joi.string().min(5).max(1000).trim().required().messages({
      'string.empty': 'Nội dung nhận xét cửa hàng không được để trống.',
      'string.min': 'Nội dung nhận xét cửa hàng phải dài từ 5 ký tự trở lên.'
    })
  })

  try {
    await paramCondition.validateAsync(req.params)
    await bodyCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu đánh giá cửa hàng không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 3. Kiểm duyệt chuỗi Slug trên URL khi xem danh sách review sản phẩm (Công khai)
const validateGetProductReviews = async (req, res, next) => {
  const correctCondition = Joi.object({
    slug: Joi.string()
      .trim()
      .regex(/^[a-z0-9-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Đường dẫn sản phẩm (slug) không đúng định dạng URL chuẩn.',
        'any.required': 'Đường dẫn sản phẩm là tham số bắt buộc.'
      })
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số đường dẫn xem đánh giá không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const reviewValidation = {
  validateProductReviewBody,
  validateStoreReviewBody,
  validateGetProductReviews
}