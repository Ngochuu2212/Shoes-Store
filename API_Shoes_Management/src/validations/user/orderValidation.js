import Joi from 'joi'
import { PAYMENT_METHODS } from '~/utils/constants'

const validateCheckout = async (req, res, next) => {
  const correctCondition = Joi.object({
    recipientName: Joi.string().min(3).max(100).trim().required().messages({
      'string.empty': 'Tên người nhận hàng không được để trống.',
      'any.required': 'Tên người nhận hàng là bắt buộc.'
    }),

    recipientPhone: Joi.string()
      .trim()
      .regex(/^0[0-9]{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Số điện thoại người nhận phải có đúng 10 chữ số và bắt đầu bằng số 0.',
        'string.empty': 'Số điện thoại người nhận không được để trống.',
        'any.required': 'Số điện thoại người nhận là bắt buộc.'
      }),

    shippingAddress: Joi.string().min(5).max(500).trim().required().messages({
      'string.empty': 'Địa chỉ giao hàng không được để trống.',
      'any.required': 'Địa chỉ giao hàng là thông tin bắt buộc.'
    }),

    discountAmount: Joi.number().min(0).precision(2).optional().default(0).messages({
      'number.base': 'Số tiền giảm giá voucher phải là định dạng số.',
      'number.min': 'Số tiền giảm giá voucher không được là số âm.'
    }),

    storeDiscounts: Joi.object().optional(),

    paymentMethod: Joi.string()
      .valid(PAYMENT_METHODS.COD, PAYMENT_METHODS.VNPAY, PAYMENT_METHODS.MOMO)
      .required()
      .messages({
        'any.only': 'Phương thức thanh toán không hợp lệ (Chỉ nhận COD, VNPAY, MOMO).',
        'string.empty': 'Phương thức thanh toán không được để trống.',
        'any.required': 'Vui lòng chọn phương thức thanh toán.'
      })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Thông tin đặt hàng không đúng định dạng kiểm duyệt của hệ thống.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const orderValidation = {
  validateCheckout
}