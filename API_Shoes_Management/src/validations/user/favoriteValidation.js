import Joi from 'joi'

const toggleFavorite = async (req, res, next) => {
  const correctCondition = Joi.object({
    productId: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã sản phẩm (productId) phải là định dạng số.',
      'number.integer': 'Mã sản phẩm phải là số nguyên hợp lệ.',
      'number.positive': 'Mã sản phẩm không được là số âm hoặc bằng 0.',
      'any.required': 'Mã sản phẩm là thông tin bắt buộc để thực hiện thả tim.'
    })
  })

  try {
    // Thẩm định dữ liệu req.body đầu vào
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu xử lý yêu thích không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const favoriteValidation = {
  toggleFavorite
}