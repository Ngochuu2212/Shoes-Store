import Joi from 'joi'

// 1. Validate luồng TẠO MỚI tài khoản nhân sự (POST)
const createUser = async (req, res, next) => {
  const correctCondition = Joi.object({
    fullname: Joi.string().required().min(3).max(50).trim().messages({
      'string.empty': 'Họ và tên không được để trống!',
      'string.min': 'Họ và tên phải có ít nhất 3 ký tự!',
      'string.max': 'Họ và tên không được vượt quá 50 ký tự!'
    }),
    email: Joi.string().required().email().lowercase().trim().messages({
      'string.empty': 'Email không được để trống!',
      'string.email': 'Định dạng Email không hợp lệ!'
    }),
    password: Joi.string().required().min(6).trim().messages({
      'string.empty': 'Mật khẩu không được để trống!',
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự!'
    }),
    phone: Joi.string().required().pattern(/^0[0-9]{9}$/).messages({
      'string.empty': 'Số điện thoại không được để trống!',
      'string.pattern.base': 'Số điện thoại phải bắt đầu từ số 0 và có đúng 10 chữ số!'
    }),
    address: Joi.string().required().min(5).max(200).trim().messages({
      'string.empty': 'Địa chỉ không được để trống!',
      'string.min': 'Địa chỉ phải có ít nhất 5 ký tự!',
      'string.max': 'Địa chỉ không được vượt quá 200 ký tự!'
    }),
    roleId: Joi.number().required().valid(1, 2, 3, 4).messages({
      'number.base': 'Mã quyền hạn (Role ID) phải là một chữ số!',
      'any.only': 'Mã quyền hạn không hợp lệ trên hệ thống!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessages = error.details.map(err => err.message)
    return res.status(400).json({ message: errorMessages[0], errors: errorMessages })
  }
}

// 2. Validate luồng THAY ĐỔI QUYỀN HÀNG LOẠT (PATCH)
const changeUserRoleBulk = async (req, res, next) => {
  const correctCondition = Joi.object({
    userIds: Joi.array().items(Joi.number().integer().positive()).required().min(1).messages({
      'array.min': 'Vui lòng tích chọn ít nhất 1 tài khoản để thực thi quyền!'
    }),
    targetRoleId: Joi.number().required().valid(1, 2, 3, 4).messages({
      'any.only': 'Mã quyền hạn mục tiêu không hợp lệ!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

// 3. Validate luồng ĐÓNG BĂNG & XÓA HÀNG LOẠT (PATCH / DELETE)
const checkUserIdsMendatory = async (req, res, next) => {
  const correctCondition = Joi.object({
    userIds: Joi.array().items(Joi.number().integer().positive()).required().min(1).messages({
      'array.min': 'Vui lòng tích chọn ít nhất 1 tài khoản để thực hiện thao tác!'
    }),
    isActive: Joi.boolean().optional()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

// 4. Validate luồng CẬP NHẬT NGƯỜI DÙNG (PUT) - THÊM MỚI
const updateUser = async (req, res, next) => {
  const correctCondition = Joi.object({
    fullname: Joi.string().min(3).max(50).trim().messages({
      'string.min': 'Họ và tên phải có ít nhất 3 ký tự!',
      'string.max': 'Họ và tên không được vượt quá 50 ký tự!'
    }),
    email: Joi.string().email().lowercase().trim().messages({
      'string.email': 'Định dạng Email không hợp lệ!'
    }),
    password: Joi.string().min(6).trim().allow('', null).messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự!'
    }),
    phone: Joi.string().pattern(/^0[0-9]{9}$/).messages({
      'string.pattern.base': 'Số điện thoại phải bắt đầu từ số 0 và có đúng 10 chữ số!'
    }),
    address: Joi.string().min(5).max(200).trim().allow('', null).messages({
      'string.min': 'Địa chỉ phải có ít nhất 5 ký tự!',
      'string.max': 'Địa chỉ không được vượt quá 200 ký tự!'
    }),
    roleId: Joi.number().valid(1, 2, 3, 4).messages({
      'any.only': 'Mã quyền hạn không hợp lệ trên hệ thống!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessages = error.details.map(err => err.message)
    return res.status(400).json({ message: errorMessages[0], errors: errorMessages })
  }
}

export const adminUserValidation = {
  createUser,
  changeUserRoleBulk,
  checkUserIdsMendatory,
  updateUser
}