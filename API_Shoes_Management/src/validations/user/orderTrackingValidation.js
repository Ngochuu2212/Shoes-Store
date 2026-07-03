import Joi from 'joi'

const checkOrderIdParam = async (req, res, next) => {
  const correctCondition = Joi.object({
    orderId: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã đơn hàng trên URL phải là định dạng số.'
    })
  })

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số mã đơn hàng không đúng định dạng.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const orderTrackingValidation = {
  checkOrderIdParam
}