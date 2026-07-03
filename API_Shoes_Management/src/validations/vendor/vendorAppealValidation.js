// ~/validations/vendor/vendorAppealValidation.js
import Joi from 'joi'

const createAppeal = async (req, res, next) => {
  const correctCondition = Joi.object({
    appealReason: Joi.string().required().min(10).max(1000).trim().messages({
      'string.empty': 'Nội dung giải trình không được để trống!',
      'string.min': 'Nội dung giải trình phải có ít nhất 10 ký tự!'
    })
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

export const vendorAppealValidation = {
  createAppeal
}