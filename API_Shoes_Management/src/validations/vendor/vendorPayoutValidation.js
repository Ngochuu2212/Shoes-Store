import Joi from 'joi'

// 1. Validate dữ liệu body khi Vendor gửi yêu cầu rút tiền
const createPayoutRequest = async (req, res, next) => {
  const correctCondition = Joi.object({
    amount: Joi.number().positive().min(50000).required().messages({
      'number.base': 'Số tiền yêu cầu rút phải là định dạng số.',
      'number.positive': 'Số tiền yêu cầu rút phải lớn hơn 0.',
      'number.min': 'Số tiền tối thiểu cho mỗi lần rút là 50.000 VNĐ.',
      'any.required': 'Số tiền cần rút là thông tin bắt buộc.'
    }),
    bankName: Joi.string().min(2).max(100).trim().required().messages({
      'string.empty': 'Tên ngân hàng nhận tiền không được để trống.',
      'any.required': 'Tên ngân hàng nhận tiền là bắt buộc.'
    }),
    accountNumber: Joi.string().min(5).max(30).trim().regex(/^[0-9]+$/).required().messages({
      'string.pattern.base': 'Số tài khoản ngân hàng chỉ được phép chứa các chữ số.',
      'string.empty': 'Số tài khoản ngân hàng không được để trống.',
      'any.required': 'Số tài khoản ngân hàng là bắt buộc.'
    }),
    accountName: Joi.string().min(3).max(150).trim().required().messages({
      'string.empty': 'Tên chủ tài khoản không được để trống.',
      'any.required': 'Tên chủ tài khoản là bắt buộc.'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Thông tin tài khoản ngân hàng hoặc số tiền rút không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Validate phân trang lịch sử rút tiền
const getPayoutHistory = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số phân trang lịch sử rút tiền không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const vendorPayoutValidation = {
  createPayoutRequest,
  getPayoutHistory
}