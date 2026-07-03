import Joi from 'joi'

const handleSize = async (req, res, next) => {
  const correctCondition = Joi.object({
    sizeValue: Joi.string().required().min(1).max(20).trim().messages({
      'string.empty': 'Giá trị kích cỡ (Size) không được để trống!'
    })
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

const handleColor = async (req, res, next) => {
  const correctCondition = Joi.object({
    colorName: Joi.string().required().min(2).max(50).trim().messages({
      'string.empty': 'Tên màu sắc không được để trống!',
      'string.min': 'Tên màu sắc phải có ít nhất 2 ký tự!'
    }),
    colorCode: Joi.string().required().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).messages({
      'string.empty': 'Mã màu HEX không được để trống!',
      'string.pattern.base': 'Mã màu phải đúng định dạng HEX chuẩn! Ví dụ: #FFFFFF hoặc #000'
    })
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

export const adminAttributeValidation = {
  handleSize,
  handleColor
}