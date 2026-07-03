import Joi from 'joi'
import { ROLE_ID } from '~/utils/constants'

// 1. Validate cấu hình % chiết khấu hàng loạt (PATCH)
const updateCommissionBulk = async (req, res, next) => {
  const correctCondition = Joi.object({
    storeIds: Joi.array().items(Joi.number().integer().positive()).required().min(1).messages({
      'array.min': 'Vui lòng tích chọn ít nhất 1 cửa hàng để cấu hình chiết khấu!'
    }),
    commissionRate: Joi.number().required().min(0).max(100).messages({
      'number.base': 'Tỷ lệ chiết khấu phải là một con số!',
      'number.min': 'Tỷ lệ chiết khấu không được nhỏ hơn 0%!',
      'number.max': 'Tỷ lệ chiết khấu chiết tối đa không được vượt quá 100%!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

// 2. Validate đóng băng hàng loạt Store (PATCH)
const checkStoreIdsMandatory = async (req, res, next) => {
  const correctCondition = Joi.object({
    storeIds: Joi.array().items(Joi.number().integer().positive()).required().min(1).messages({
      'array.min': 'Vui lòng tích chọn ít nhất 1 cửa hàng để thực thi tác vụ!'
    }),
    isActive: Joi.boolean().optional(),
    reason: Joi.string().allow('', null).max(500).optional().messages({
      'string.max': 'Lý do khóa không được vượt quá 500 ký tự!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

// 3. Validate cưỡng chế điều chỉnh dòng tiền balance (POST)
const enforceBalance = async (req, res, next) => {
  const correctCondition = Joi.object({
    storeId: Joi.number().required().integer().positive().messages({
      'number.base': 'Mã ID cửa hàng không hợp lệ!'
    }),
    amount: Joi.number().required().positive().min(1000).messages({
      'number.min': 'Số tiền can thiệp tối thiểu phải từ 1,000đ!'
    }),
    type: Joi.string().required().valid('plus', 'minus').messages({
      'any.only': 'Hành động can thiệp ví phải là "plus" (cộng) hoặc "minus" (trừ)!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

// 4. Validate tạo cửa hàng
const createStore = async (req, res, next) => {
  const correctCondition = Joi.object({
    ownerId: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã số ID chủ cửa hàng (Owner ID) phải là một con số!'
    }),
    name: Joi.string().required().min(3).max(100).trim().messages({
      'string.empty': 'Tên cửa hàng không được để trống!',
      'string.min': 'Tên cửa hàng phải có ít nhất 3 ký tự!',
      'string.max': 'Tên cửa hàng không được vượt quá 100 ký tự!'
    }),
    bio: Joi.string().allow('', null).max(500).messages({
      'string.max': 'Mô tả tiểu sử không được vượt quá 500 ký tự!'
    }),
    address: Joi.string().required().min(5).max(500).trim().messages({
      'string.empty': 'Địa chỉ cửa hàng không được để trống!',
      'string.min': 'Địa chỉ cửa hàng phải cụ thể, ít nhất từ 5 ký tự!',
      'string.max': 'Địa chỉ cửa hàng không được vượt quá 500 ký tự!'
    }),
    commissionRate: Joi.number().min(0).max(100).optional().messages({
      'number.base': 'Tỷ lệ phí sàn phải là một con số!',
      'number.min': 'Phí sàn không được nhỏ hơn 0%!',
      'number.max': 'Phí sàn tối đa không vượt quá 100%!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

// 5. Validate xóa cửa hàng hàng loạt
const checkStoreIdsBulk = async (req, res, next) => {
  const correctCondition = Joi.object({
    storeIds: Joi.array().items(Joi.number().integer().positive()).required().min(1).messages({
      'array.min': 'Vui lòng tích chọn ít nhất 1 cửa hàng để thực thi lệnh xóa!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

export const adminStoreValidation = {
  updateCommissionBulk,
  checkStoreIdsMandatory,
  enforceBalance,
  createStore,
  checkStoreIdsBulk
}