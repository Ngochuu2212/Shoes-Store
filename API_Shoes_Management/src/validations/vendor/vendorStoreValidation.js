import Joi from 'joi'

// 1. Gác cổng dữ liệu khi Vendor đăng ký mở gian hàng mới
const validateRegisterStoreBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().min(3).max(50).trim().required().messages({
      'string.empty': 'Tên cửa hàng kinh doanh không được để trống.',
      'string.min': 'Tên cửa hàng phải có độ dài từ 3 ký tự trở lên.',
      'string.max': 'Tên cửa hàng không được vượt quá 50 ký tự để đảm bảo hiển thị.',
      'any.required': 'Tên cửa hàng là thông tin bắt buộc.'
    }),
    bio: Joi.string().max(500).trim().optional().allow('', null).messages({
      'string.max': 'Đoạn giới thiệu (bio) ngắn của shop không được vượt quá 500 ký tự.'
    }),
    address: Joi.string().min(5).max(200).trim().required().messages({
      'string.empty': 'Địa chỉ kho bãi của cửa hàng không được để trống.',
      'string.min': 'Địa chỉ cửa hàng phải dài từ 5 ký tự trở lên để đảm bảo tính chính xác.',
      'string.max': 'Địa chỉ cửa hàng không được vượt quá 200 ký tự.',
      'any.required': 'Địa chỉ lấy hàng của cửa hàng là bắt buộc.'
    })
  })

  try {
    // Thẩm định dữ liệu từ req.body văn bản trước khi Multer đập file ảnh
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Thông tin đăng ký mở cửa hàng không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Gác cổng dữ liệu khi Vendor cập nhật thông tin hồ sơ Shop
const validateUpdateStoreProfileBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().min(3).max(50).trim().optional().messages({
      'string.min': 'Tên cửa hàng nếu cập nhật phải có độ dài từ 3 ký tự trở lên.',
      'string.max': 'Tên cửa hàng nếu cập nhật không được vượt quá 50 ký tự.'
    }),
    bio: Joi.string().max(500).trim().optional().allow('', null),
    address: Joi.string().min(5).max(200).trim().optional().messages({
      'string.min': 'Địa chỉ cửa hàng nếu cập nhật phải dài từ 5 ký tự trở lên.'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Thông tin cập nhật hồ sơ cửa hàng không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const vendorStoreValidation = {
  validateRegisterStoreBody,
  validateUpdateStoreProfileBody
}