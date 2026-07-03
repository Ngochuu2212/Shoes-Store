import Joi from 'joi'
import { PAYOUT_STATUS } from '~/utils/constants'

// 1. Kiểm duyệt bộ lọc danh sách lệnh rút tiền
const getPayoutList = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
    status: Joi.string().valid(...Object.values(PAYOUT_STATUS)).optional().allow('', null),
    search: Joi.string().allow('', null).trim().optional().max(100)
  })

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số bộ lọc danh sách lệnh rút tiền không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Kiểm duyệt tham số ID trên URL khi xem chi tiết lệnh rút
const getPayoutDetail = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã định danh lệnh rút phải là định dạng số.',
      'number.positive': 'Mã lệnh rút phải là số dương.'
    })
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số mã lệnh rút trên URL không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 3. Kiểm duyệt dữ liệu khi xử lý phê duyệt/từ chối lệnh rút
const processPayout = async (req, res, next) => {
  const paramCondition = Joi.object({
    id: Joi.number().integer().positive().required()
  })

  const bodyCondition = Joi.object({
    targetStatus: Joi.string().valid(PAYOUT_STATUS.APPROVED, PAYOUT_STATUS.REJECTED).required().messages({
      'any.only': 'Trạng thái mục tiêu chỉ được chọn APPROVED hoặc REJECTED.',
      'any.required': 'Trạng thái xử lý là bắt buộc.'
    }),
    adminNote: Joi.string().max(500).trim().optional().allow('', null)
  })

  try {
    await paramCondition.validateAsync(req.params)
    await bodyCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu xử lý lệnh rút tiền không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const adminPayoutValidation = {
  getPayoutList,
  getPayoutDetail,
  processPayout
}