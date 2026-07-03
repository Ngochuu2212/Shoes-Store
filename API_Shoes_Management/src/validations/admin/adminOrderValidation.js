import Joi from 'joi'
import { ORDER_STATUS, PAYMENT_STATUS } from '~/utils/constants'

const checkFiltersAndId = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string().valid(...Object.values(ORDER_STATUS)).optional(),
    paymentStatus: Joi.string().valid(...Object.values(PAYMENT_STATUS)).optional(),
    searchOrderId: Joi.number().integer().positive().optional(),
    startDate: Joi.string().isoDate().optional(),
    endDate: Joi.string().isoDate().optional()
  })

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    if (req.params.orderId) {
      const paramCondition = Joi.object({
        orderId: Joi.number().integer().positive().required()
      })
      await paramCondition.validateAsync(req.params)
    }
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số bộ lọc hoặc Mã đơn hàng không đúng định dạng.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

const validateForceCancelBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    adminNote: Joi.string().min(10).max(500).trim().required().messages({
      'string.empty': 'Lý do ép hủy đơn hàng của Admin bắt buộc không được để trống.',
      'string.min': 'Vui lòng nhập lý do ép hủy chi tiết và nghiêm túc (tối thiểu từ 10 ký tự trở lên).'
    })
  })

  try {
    const paramCondition = Joi.object({
      orderId: Joi.number().integer().positive().required()
    })
    await paramCondition.validateAsync(req.params)
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu xác nhận lệnh hủy vĩ mô không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const adminOrderValidation = {
  checkFiltersAndId,
  validateForceCancelBody
}