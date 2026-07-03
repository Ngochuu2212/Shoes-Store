import Joi from 'joi'

const validateApplyPromotion = async (req, res, next) => {
  const correctCondition = Joi.object({
    code: Joi.string().alphanum().min(2).max(50).trim().required().messages({
      'string.empty': 'Mã giảm giá không được để trống.',
      'string.alphanum': 'Mã giảm giá chỉ được phép chứa ký tự chữ và số.',
      'string.min': 'Mã giảm giá phải có độ dài từ 2 ký tự trở lên.',
      'any.required': 'Mã giảm giá là thông tin bắt buộc.'
    }),
    storeId: Joi.number().integer().positive().allow(null, '').optional().messages({
      'number.base': 'Mã cửa hàng phải là định dạng số.',
      'number.positive': 'Mã cửa hàng không hợp lệ.'
    }),
    currentOrderValue: Joi.number().positive().min(1).required().messages({
      'number.base': 'Tổng giá trị đơn hàng hiện tại phải là định dạng số.',
      'number.positive': 'Tổng giá trị đơn hàng hiện tại phải lớn hơn 0.',
      'any.required': 'Tổng giá trị đơn hàng hiện tại là bắt buộc để áp mã.'
    })
  })

  try {
    // Thẩm định sạch req.body gửi lên
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Thông tin áp dụng mã giảm giá không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const promotionValidation = {
  validateApplyPromotion
}