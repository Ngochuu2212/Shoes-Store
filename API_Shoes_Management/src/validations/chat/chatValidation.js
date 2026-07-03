import Joi from 'joi'

const validateSendMessage = async (req, res, next) => {
  const correctCondition = Joi.object({
    storeId: Joi.number().integer().positive().required(),
    content: Joi.string().trim().max(2000).optional().allow('', null)
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Nội dung tin nhắn không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const chatValidation = { validateSendMessage }