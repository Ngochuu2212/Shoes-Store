import Joi from 'joi'

const updateSystemSettings = async (req, res, next) => {
  const correctCondition = Joi.object({
    isMaintenance: Joi.boolean().optional().messages({
      'boolean.base': 'Trạng thái bảo trì phải là giá trị đúng hoặc sai (true/false).'
    }),
    maintenanceMessage: Joi.string().allow('', null).max(1000).trim().optional(),
    globalCommissionRate: Joi.number().min(0).max(100).precision(2).optional().messages({
      'number.min': 'Phí sàn mặc định không được nhỏ hơn 0%.',
      'number.max': 'Phí sàn mặc định không được vượt quá 100%.'
    }),
    hotline: Joi.string().min(8).max(20).trim().optional(),
    supportEmail: Joi.string().email().max(100).trim().optional().messages({
      'string.email': 'Email hỗ trợ không đúng định dạng email hợp lệ.'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu cấu hình gửi lên không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const systemSettingValidation = {
  updateSystemSettings
}