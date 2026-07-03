import Joi from 'joi'

// 1. Kiểm duyệt dữ liệu khi thêm sản phẩm vào giỏ
const addToCart = async (req, res, next) => {
  const correctCondition = Joi.object({
    variantId: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã biến thể sản phẩm (variantId) phải là định dạng số.',
      'number.integer': 'Mã biến thể sản phẩm phải là số nguyên.',
      'number.positive': 'Mã biến thể sản phẩm không hợp lệ.',
      'any.required': 'Mã biến thể sản phẩm là thông tin bắt buộc.'
    }),
    quantity: Joi.number().integer().positive().min(1).required().messages({
      'number.base': 'Số lượng sản phẩm (quantity) phải là định dạng số.',
      'number.integer': 'Số lượng sản phẩm phải là số nguyên.',
      'number.positive': 'Số lượng thêm vào giỏ hàng phải lớn hơn 0.',
      'number.min': 'Số lượng thêm vào giỏ hàng tối thiểu là 1 sản phẩm.',
      'any.required': 'Số lượng sản phẩm là bắt buộc.'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu thêm vào giỏ hàng không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Kiểm duyệt dữ liệu khi bấm nút cộng/trừ thay đổi số lượng ở UI
const updateQuantity = async (req, res, next) => {
  const correctCondition = Joi.object({
    variantId: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã biến thể sản phẩm phải là định dạng số.',
      'any.required': 'Mã biến thể sản phẩm là thông tin bắt buộc.'
    }),
    quantity: Joi.number().integer().min(0).required().messages({
      'number.base': 'Số lượng sản phẩm phải là định dạng số.',
      'number.integer': 'Số lượng sản phẩm phải là số nguyên.',
      'number.min': 'Số lượng sản phẩm không được là số âm.',
      'any.required': 'Số lượng sản phẩm là bắt buộc.'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu cập nhật số lượng giỏ hàng không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 3. Kiểm duyệt tham số variantId trên URL khi xóa sản phẩm
const removeFromCart = async (req, res, next) => {
  const correctCondition = Joi.object({
    variantId: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã biến thể sản phẩm trên URL phải là định dạng số.'
    })
  })

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số xóa sản phẩm khỏi giỏ hàng không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const cartValidation = {
  addToCart,
  updateQuantity,
  removeFromCart
}