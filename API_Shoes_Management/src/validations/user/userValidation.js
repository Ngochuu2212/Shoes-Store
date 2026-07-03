import Joi from 'joi'

const validateUpdateProfile = async (req, res, next) => {
  const correctCondition = Joi.object({
    fullname: Joi.string().min(3).max(50).trim().required().messages({
      'string.empty': 'Họ và tên không được để trống.',
      'string.min': 'Họ và tên phải có độ dài từ 3 ký tự trở lên.',
      'string.max': 'Họ và tên không được vượt quá 50 ký tự.',
      'any.required': 'Họ và tên là thông tin bắt buộc.'
    }),

    phone: Joi.string()
      .trim()
      .regex(/^0[0-9]{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Số điện thoại cá nhân phải có đúng 10 chữ số và bắt đầu bằng số 0.',
        'string.empty': 'Số điện thoại không được để trống.',
        'any.required': 'Số điện thoại là thông tin bắt buộc.'
      }),

    address: Joi.string().min(5).max(200).trim().required().messages({
      'string.empty': 'Địa chỉ không được để trống.',
      'string.min': 'Địa chỉ phải dài từ 5 ký tự trở lên để đảm bảo tính chính xác.'
    }),

    // Mật khẩu cũ - bắt buộc khi đổi mật khẩu
    oldPassword: Joi.string().min(6).max(30).trim().optional().allow('', null).messages({
      'string.min': 'Mật khẩu cũ phải có ít nhất 6 ký tự.'
    }),

    // Mật khẩu mới
    password: Joi.string().min(6).max(30).trim().optional().allow('', null).messages({
      'string.min': 'Mật khẩu mới nếu thay đổi phải có ít nhất 6 ký tự.',
      'string.max': 'Mật khẩu mới không được vượt quá 30 ký tự.'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Thông tin hồ sơ tài khoản gửi lên không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const userValidation = {
  validateUpdateProfile
}